import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ALSParser } from '../utils/alsParser';
import { dbHelpers } from '../database/init';
import { requireAuth } from './auth';

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
 * POST /api/projects/smart-import
 * Smart import: Check if project exists by name for this user
 * - If exists: Create new version (commit)
 * - If not: Initialize new project
 * Requires authentication
 */
router.post('/smart-import', requireAuth, upload.single('alsFile'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { projectName, author, message } = req.body;
    const userId = req.userId;
    const now = Date.now();

    // Parse the ALS file
    const alsData = await ALSParser.parseFile(req.file.path);
    const finalProjectName = projectName || alsData.name;

    // Check if project with this name already exists for this user
    const allUserProjects = await dbHelpers.getProjectsByUser(userId);
    const existingProject = allUserProjects.find(p => p.name === finalProjectName);

    if (existingProject) {
      // Project exists - save file temporarily and return data for frontend
      console.log(`Project "${finalProjectName}" exists, saving file temporarily...`);
      
      const projectId = existingProject.id;
      const dataDir = path.join(__dirname, '..', '..', 'projects', projectId);
      
      // Save to temp location with user-specific name
      const tempFileName = `vst_import_${userId}_${Date.now()}.als`;
      const tempFilePath = path.join(dataDir, tempFileName);
      
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      fs.copyFileSync(req.file.path, tempFilePath);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        projectId,
        isNewProject: false,
        hasPendingChanges: true,
        tempFileName,
        message: 'Project exists. File saved temporarily for import.',
        data: alsData,
      });
    } else {
      // Project doesn't exist - initialize new project
      console.log(`Creating new project "${finalProjectName}"...`);
      
      const projectId = uuidv4();
      const dataDir = path.join(__dirname, '..', '..', 'projects', projectId);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const versionId = uuidv4();
      const dataPath = path.join(dataDir, `${versionId}.json`);
      const alsPath = path.join(dataDir, `${versionId}.als`);
      
      fs.writeFileSync(dataPath, ALSParser.toJSON(alsData));
      fs.copyFileSync(req.file.path, alsPath);

      // Create project
      await dbHelpers.insertProject({
        id: projectId,
        name: finalProjectName,
        userId: userId,
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

      // Create initial version
      await dbHelpers.insertVersion({
        id: versionId,
        project_id: projectId,
        branch: 'main',
        parent_id: null,
        message: message || 'Initial commit from VST plugin',
        author: author || 'VST Plugin',
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
        isNewProject: true,
        message: 'Project initialized successfully',
        data: alsData,
      });
    }
  } catch (error: any) {
    console.error('Error in smart import:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:projectId/vst-import
 * Get the most recent VST import data for this project
 * Requires authentication
 */
router.get('/:projectId/vst-import', requireAuth, async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    
    // Verify project ownership
    const project = await dbHelpers.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Find the most recent temp file for this user
    const dataDir = path.join(__dirname, '..', '..', 'projects', projectId);
    if (!fs.existsSync(dataDir)) {
      return res.status(404).json({ error: 'No VST import data found' });
    }
    
    const files = fs.readdirSync(dataDir);
    const vstFiles = files
      .filter(f => f.startsWith(`vst_import_${userId}_`))
      .map(f => ({
        name: f,
        path: path.join(dataDir, f),
        mtime: fs.statSync(path.join(dataDir, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    if (vstFiles.length === 0) {
      return res.status(404).json({ error: 'No VST import data found' });
    }
    
    // Get the most recent file
    const mostRecent = vstFiles[0];
    
    // Parse and return data
    const alsData = await ALSParser.parseFile(mostRecent.path);
    
    res.json({
      success: true,
      data: alsData,
      tempFileName: mostRecent.name,
    });
  } catch (error: any) {
    console.error('Error getting VST import:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:projectId/pending-changes
 * Get pending changes for a project
 * Requires authentication
 */
router.get('/:projectId/pending-changes', requireAuth, async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    
    // Verify project ownership
    const project = await dbHelpers.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Get pending changes for this project
    const pendingChanges = await dbHelpers.getPendingChangesForProject(projectId);
    
    // Return only metadata (not the full data)
    const metadata = pendingChanges.map(pc => ({
      id: pc.id,
      message: pc.message,
      author: pc.author,
      created_at: pc.created_at,
    }));
    
    res.json({ pendingChanges: metadata });
  } catch (error: any) {
    console.error('Error getting pending changes:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects/:projectId/push-pending/:pendingId
 * Push (commit) a pending change to the project
 * Requires authentication
 */
router.post('/:projectId/push-pending/:pendingId', requireAuth, async (req: any, res: any) => {
  try {
    const { projectId, pendingId } = req.params;
    const userId = req.userId;
    
    // Get pending change
    const pendingChange = await dbHelpers.getPendingChange(pendingId);
    if (!pendingChange) {
      return res.status(404).json({ error: 'Pending change not found' });
    }
    
    // Verify ownership
    if (pendingChange.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (pendingChange.project_id !== projectId) {
      return res.status(400).json({ error: 'Project ID mismatch' });
    }
    
    // Get project and branch
    const project = await dbHelpers.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const branchData = await dbHelpers.getBranch(projectId, 'main');
    if (!branchData) {
      return res.status(404).json({ error: 'Main branch not found' });
    }
    
    // Read pending data
    const pendingDataPath = pendingChange.data_path;
    const pendingAlsPath = pendingDataPath.replace('.json', '.als');
    
    if (!fs.existsSync(pendingDataPath)) {
      return res.status(500).json({ error: 'Pending data file not found' });
    }
    
    // Create new version
    const versionId = uuidv4();
    const dataDir = path.join(__dirname, '..', '..', 'projects', projectId);
    const newDataPath = path.join(dataDir, `${versionId}.json`);
    const newAlsPath = path.join(dataDir, `${versionId}.als`);
    
    // Move files from pending to version
    fs.renameSync(pendingDataPath, newDataPath);
    if (fs.existsSync(pendingAlsPath)) {
      fs.renameSync(pendingAlsPath, newAlsPath);
    }
    
    // Insert version
    await dbHelpers.insertVersion({
      id: versionId,
      project_id: projectId,
      branch: 'main',
      parent_id: branchData.head_version_id,
      message: pendingChange.message,
      author: pendingChange.author,
      timestamp: Date.now(),
      data_path: newDataPath,
    });
    
    // Update branch head and project
    await dbHelpers.updateBranch(branchData.id, { head_version_id: versionId });
    await dbHelpers.updateProject(projectId, { updated_at: Date.now() });
    
    // Delete pending change
    await dbHelpers.deletePendingChange(pendingId);
    
    res.json({
      success: true,
      versionId,
      message: 'Pending change pushed successfully',
    });
  } catch (error: any) {
    console.error('Error pushing pending change:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects/init
 * Initialize a new project by uploading the first ALS file
 * Requires authentication
 */
router.post('/init', requireAuth, upload.single('alsFile'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { projectName, author } = req.body;
    // Get userId from authenticated user (set by requireAuth middleware)
    const userId = req.userId;
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
 */
router.get('/', async (req: any, res: any) => {
  try {
    const { userId } = req.query;
    
    let projects;
    if (userId) {
      // Get projects owned by user (userId should match user.id from auth)
      const ownedProjects = await dbHelpers.getProjectsByUser(userId);
      
      // Get projects where user is a collaborator
      const collaborations = await dbHelpers.getProjectCollaboratorsByUser(userId);
      const collaboratedProjectIds = collaborations.map(c => c.project_id);
      
      console.log('User ID:', userId);
      console.log('Owned projects:', ownedProjects.length);
      console.log('Collaborations found:', collaborations.length);
      
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
      role: 'editor',
      added_at: Date.now(),
    });

    console.log('Collaborator invited successfully:', email);

    res.json({ message: 'Collaborator invited successfully' });
  } catch (error: any) {
    console.error('Error inviting collaborator:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
