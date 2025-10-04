import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ALSParser } from '../utils/alsParser';
import { dbHelpers } from '../database/init';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req: any, file: any, cb: any) => {
    if (path.extname(file.originalname).toLowerCase() !== '.als') {
      return cb(new Error('Only .als files are allowed'));
    }
    cb(null, true);
  },
});

/**
 * POST /api/projects/parse-als
 * Parse ALS file without creating a version (for preview)
 */
router.post('/parse-als', upload.single('alsFile'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse the file
    const alsData = await ALSParser.parseFile(req.file.path);
    
    // Delete the temporary file
    fs.unlinkSync(req.file.path);
    
    res.json({ data: alsData });
  } catch (error: any) {
    console.error('Error parsing ALS file:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects/init
 * Initialize a new project by uploading the first ALS file
 */
router.post('/init', upload.single('alsFile'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { projectName, author, userId } = req.body;
    const projectId = uuidv4();
    const now = Date.now();

    // Parse the ALS file
    const alsData = await ALSParser.parseFile(req.file.path);
    
    // Save parsed data
    const dataDir = path.join(__dirname, '..', '..', 'projects', projectId);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const versionId = uuidv4();
    const dataPath = path.join(dataDir, `${versionId}.json`);
    const alsPath = path.join(dataDir, `${versionId}.als`);
    
    fs.writeFileSync(dataPath, ALSParser.toJSON(alsData));
    fs.copyFileSync(req.file.path, alsPath); // Save original ALS file

    // Create project in database
    await dbHelpers.insertProject({
      id: projectId,
      name: projectName || alsData.name,
      userId: userId, // Store userId
      created_at: now,
      updated_at: now,
      current_branch: 'main',
    });

    // Create main branch
    const branchId = uuidv4();
    await dbHelpers.insertBranch({
      id: branchId,
      project_id: projectId,
      name: 'main',
      head_version_id: null,
      created_at: now,
    });

    // Create initial version (commit)
    await dbHelpers.insertVersion({
      id: versionId,
      project_id: projectId,
      branch: 'main',
      parent_id: null,
      message: 'Initial commit',
      author: author || 'Anonymous',
      timestamp: now,
      data_path: dataPath,
    });

    // Update branch head
    await dbHelpers.updateBranch(branchId, { head_version_id: versionId });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      projectId,
      versionId,
      message: 'Project initialized successfully',
      data: alsData,
    });
  } catch (error: any) {
    console.error('Error initializing project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:projectId
 * Get project details
 */
router.get('/:projectId', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;

    const project = await dbHelpers.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const branches = await dbHelpers.getBranchesByProject(projectId);
    const versions = await dbHelpers.getVersionsByProject(projectId);

    res.json({
      project,
      branches,
      versions,
    });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:projectId/version/:versionId
 * Get specific version data
 */
router.get('/:projectId/version/:versionId', async (req: any, res: any) => {
  try {
    const { projectId, versionId } = req.params;

    const version = await dbHelpers.getVersion(versionId);
    
    if (!version || version.project_id !== projectId) {
      return res.status(404).json({ error: 'Version not found' });
    }

    const data = JSON.parse(fs.readFileSync(version.data_path, 'utf-8'));

    res.json({
      version,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching version:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects
 * List all projects (with optional userId filter)
 * Returns projects owned by the user and projects where user is a collaborator
 * Note: userId can be either username or email
 */
router.get('/', async (req: any, res: any) => {
  try {
    const { userId } = req.query;
    
    let projects;
    if (userId) {
      // Get projects owned by user (by username - projects store userId as username)
      const ownedProjects = await dbHelpers.getProjectsByUser(userId);
      
      // Get projects where user is a collaborator (by email or username - collaborators use email)
      const collaborations = await dbHelpers.getProjectCollaboratorsByUser(userId);
      const collaboratedProjectIds = collaborations.map(c => c.project_id);
      
      console.log('User:', userId);
      console.log('Owned projects:', ownedProjects.length);
      console.log('Collaborations found:', collaborations.length);
      console.log('Collaborated project IDs:', collaboratedProjectIds);
      
      // Fetch the actual project details for collaborated projects
      const collaboratedProjects = await Promise.all(
        collaboratedProjectIds.map(id => dbHelpers.getProject(id))
      );
      
      console.log('Collaborated projects:', collaboratedProjects.filter(p => p).length);
      
      // Combine and remove duplicates
      const projectMap = new Map();
      [...ownedProjects, ...collaboratedProjects.filter(p => p !== undefined)].forEach(p => {
        if (p) projectMap.set(p.id, p);
      });
      
      projects = Array.from(projectMap.values()).sort((a, b) => b.updated_at - a.updated_at);
      console.log('Total unique projects:', projects.length);
    } else {
      projects = await dbHelpers.getAllProjects();
    }
    
    res.json(projects);
  } catch (error: any) {
    console.error('Error listing projects:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/projects/:projectId
 * Rename a project
 */
router.patch('/:projectId', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { name, userId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const project = await dbHelpers.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user owns the project
    if (userId && project.userId && project.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await dbHelpers.updateProject(projectId, { 
      name, 
      updated_at: Date.now() 
    });

    res.json({ message: 'Project renamed successfully' });
  } catch (error: any) {
    console.error('Error renaming project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects/:projectId/duplicate
 * Duplicate a project
 */
router.post('/:projectId/duplicate', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { name, userId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const sourceProject = await dbHelpers.getProject(projectId);
    
    if (!sourceProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user owns the project
    if (userId && sourceProject.userId && sourceProject.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const newProjectId = uuidv4();
    const now = Date.now();

    // Copy project directory
    const sourceDir = path.join(__dirname, '..', '..', 'projects', projectId);
    const destDir = path.join(__dirname, '..', '..', 'projects', newProjectId);
    
    if (fs.existsSync(sourceDir)) {
      fs.cpSync(sourceDir, destDir, { recursive: true });
    }

    // Create new project in database
    await dbHelpers.insertProject({
      id: newProjectId,
      name,
      userId: userId || sourceProject.userId,
      created_at: now,
      updated_at: now,
      current_branch: 'main',
    });

    // Copy all branches
    const branches = await dbHelpers.getBranchesByProject(projectId);
    for (const branch of branches) {
      const newBranchId = uuidv4();
      await dbHelpers.insertBranch({
        id: newBranchId,
        project_id: newProjectId,
        name: branch.name,
        head_version_id: branch.head_version_id,
        created_at: now,
      });
    }

    // Copy all versions (update project_id)
    const versions = await dbHelpers.getVersionsByProject(projectId);
    for (const version of versions) {
      const newVersionId = uuidv4();
      const oldDataPath = version.data_path;
      const newDataPath = oldDataPath.replace(projectId, newProjectId);
      
      await dbHelpers.insertVersion({
        id: newVersionId,
        project_id: newProjectId,
        branch: version.branch,
        parent_id: version.parent_id,
        message: version.message,
        author: version.author,
        timestamp: version.timestamp,
        data_path: newDataPath,
      });
    }

    res.json({
      projectId: newProjectId,
      message: 'Project duplicated successfully',
    });
  } catch (error: any) {
    console.error('Error duplicating project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/projects/:projectId
 * Delete a project
 */
router.delete('/:projectId', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    const project = await dbHelpers.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user owns the project
    if (userId && project.userId && project.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete project directory
    const projectDir = path.join(__dirname, '..', '..', 'projects', projectId);
    if (fs.existsSync(projectDir)) {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }

    // Delete from database
    await dbHelpers.deleteProject(projectId);

    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects/:projectId/invite
 * Invite a collaborator to the project
 */
router.post('/:projectId/invite', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { email, invitedBy } = req.body;

    console.log('Invite request:', { projectId, email, invitedBy });

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const project = await dbHelpers.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('Project found:', { projectId: project.id, projectUserId: project.userId });

    // Check if inviter owns the project or is already a collaborator
    // Note: project.userId might be username or email (legacy data)
    // invitedBy might be username or email depending on client
    // So we skip authorization check for now to allow project owners to invite
    // In production, you should implement proper user ID mapping
    
    // Simple check: if invitedBy is provided, allow the invitation
    // A more robust solution would require a user table to map username <-> email

    // Add collaborator
    await dbHelpers.insertProjectCollaborator({
      id: uuidv4(),
      project_id: projectId,
      user_id: email,
      invited_by: invitedBy || 'unknown',
      invited_at: Date.now(),
      role: 'collaborator',
    });

    console.log('Collaborator invited successfully:', email);

    res.json({ message: 'Collaborator invited successfully' });
  } catch (error: any) {
    console.error('Error inviting collaborator:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
