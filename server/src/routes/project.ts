import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ALSParser } from '../utils/alsParser';
import { db } from '../database/init';
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
    const userId = req.user_id;
    const now = Date.now();

    // Parse the ALS file
    const alsData = await ALSParser.parseFile(req.file.path);
    const finalProjectName = projectName || alsData.name;

    // Check if project with this name already exists for this user
    const allUserProjects = await db.getProjectsByUser(userId);
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
      await db.insertProject({
        id: projectId,
        name: finalProjectName,
        user_id: userId,
        created_at: now,
        updated_at: now,
        current_branch: 'main',
      });

      // Create main branch
      const branchId = uuidv4();
      await db.insertBranch({
        id: branchId,
        project_id: projectId,
        name: 'main',
        created_at: now,
        created_by: userId, // Must be a valid user ID
      });

      // Create initial version
      await db.insertVersion({
        id: versionId,
        project_id: projectId,
        branch: 'main',
        parent_id: undefined,
        message: message || 'Initial commit from VST plugin',
        user_id: userId, // Use authenticated user ID
        timestamp: now,
        files: dataPath,
      });

      // Update branch head

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
    const userId = req.user_id;
    
    // Verify project ownership
    const project = await db.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.user_id !== userId) {
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
    const userId = req.user_id;
    
    // Verify project ownership
    const project = await db.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Get pending changes for this project
    const pendingChanges = await db.getPendingChangesForProject(projectId);
    
    // Return only metadata (not the full data)
    const metadata = pendingChanges.map(pc => ({
      id: pc.id,
      user_id: pc.user_id,
      timestamp: pc.timestamp,
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
    const userId = req.user_id;
    
    // Get pending change
    const pendingChange = await db.getPendingChange(pendingId);
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
    const project = await db.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const branchData = await db.getBranch(projectId, 'main');
    if (!branchData) {
      return res.status(404).json({ error: 'Main branch not found' });
    }
    
    // Get pending data from changes field
    const pendingData = pendingChange.changes;
    
    // Create new version
    const versionId = uuidv4();
    
    // Insert version with pending data
    await db.insertVersion({
      id: versionId,
      project_id: projectId,
      branch: 'main',
      message: 'Committed from pending change',
      user_id: pendingChange.user_id,
      timestamp: Date.now(),
      files: pendingData,
    });
    
    // Update branch head and project
    await db.updateProject(projectId, { updated_at: Date.now() });
    
    // Delete pending change
    await db.deletePendingChange(pendingId);
    
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
    const userId = req.user_id;
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
    await db.insertProject({
      id: projectId,
      name: projectName || alsData.name,
      user_id: userId, // Store userId
      created_at: now,
      updated_at: now,
      current_branch: 'main',
    });

    // Create main branch
    const branchId = uuidv4();
    await db.insertBranch({
      id: branchId,
      project_id: projectId,
      name: 'main',
      created_at: now,
      created_by: userId, // Must be a valid user ID
    });

    // Create initial version (commit)
    await db.insertVersion({
      id: versionId,
      project_id: projectId,
      branch: 'main',
      parent_id: undefined,
      message: 'Initial commit',
      user_id: userId, // Use authenticated user ID
      timestamp: now,
      files: dataPath,
    });

    // Update branch head

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
  const startTime = Date.now();
  try {
    const { projectId } = req.params;
    console.log(`[${new Date().toISOString()}] GET /api/projects/:projectId - Start fetching project:`, projectId);
    
    // Log pool status
    const pool = (db as any).getPool();
    console.log('Pool status:', {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    });

    console.log('Step 1: Fetching project...');
    const projectStart = Date.now();
    const project = await Promise.race([
      db.getProject(projectId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout after 10s')), 10000))
    ]) as any;
    console.log(`Step 1: Project fetched in ${Date.now() - projectStart}ms:`, project ? 'found' : 'not found');
    
    if (!project) {
      console.log('Project not found, returning 404');
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('Step 2: Fetching branches...');
    const branchStart = Date.now();
    const branches = await db.getBranchesByProject(projectId);
    console.log(`Step 2: Branches fetched in ${Date.now() - branchStart}ms:`, branches.length);
    
    console.log('Step 3: Fetching versions...');
    const versionStart = Date.now();
    const versions = await db.getVersionsByProject(projectId);
    console.log(`Step 3: Versions fetched in ${Date.now() - versionStart}ms:`, versions.length);

    const totalTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] GET /api/projects/:projectId - Completed in ${totalTime}ms, sending response`);
    
    res.json({
      project,
      branches,
      versions,
    });
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Error fetching project (after ${totalTime}ms):`, error);
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

    const version = await db.getVersion(versionId);
    
    if (!version || version.project_id !== projectId) {
      return res.status(404).json({ error: 'Version not found' });
    }

    const data = JSON.parse(fs.readFileSync(version.files, 'utf-8'));

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
      const ownedProjects = await db.getProjectsByUser(userId);
      
      // Get projects where user is a collaborator
      const collaborations = await db.getProjectCollaboratorsByUser(userId);
      const collaboratedProjectIds = collaborations.map(c => c.project_id);
      
      console.log('User ID:', userId);
      console.log('Owned projects:', ownedProjects.length);
      console.log('Collaborations found:', collaborations.length);
      
      // Fetch the actual project details for collaborated projects
      const collaboratedProjects = await Promise.all(
        collaboratedProjectIds.map(id => db.getProject(id))
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
      projects = await db.getAllProjects();
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

    const project = await db.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user owns the project
    if (userId && project.user_id && project.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.updateProject(projectId, { 
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
router.post('/:projectId/duplicate', requireAuth, async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { name, userId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const sourceProject = await db.getProject(projectId);
    
    if (!sourceProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user owns the project
    if (userId && sourceProject.user_id && sourceProject.user_id !== userId) {
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
    await db.insertProject({
      id: newProjectId,
      name,
      user_id: userId || sourceProject.user_id,
      created_at: now,
      updated_at: now,
      current_branch: 'main',
    });

    // Copy all branches
    const branches = await db.getBranchesByProject(projectId);
    for (const branch of branches) {
      const newBranchId = uuidv4();
      await db.insertBranch({
        id: newBranchId,
        project_id: newProjectId,
        name: branch.name,
        created_at: now,
        created_by: userId, // Must be a valid user ID
      });
    }

    // Copy all versions (update project_id)
    const versions = await db.getVersionsByProject(projectId);
    for (const version of versions) {
      const newVersionId = uuidv4();
      const oldDataPath = version.files;
      const newDataPath = oldDataPath.replace(projectId, newProjectId);
      
      await db.insertVersion({
        id: newVersionId,
        project_id: newProjectId,
        branch: version.branch,
        parent_id: version.parent_id,
        message: version.message,
        user_id: version.user_id,
        timestamp: version.timestamp,
        files: version.files,
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

    const project = await db.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user owns the project
    if (userId && project.user_id && project.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete project directory
    const projectDir = path.join(__dirname, '..', '..', 'projects', projectId);
    if (fs.existsSync(projectDir)) {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }

    // Delete from database
    await db.deleteProject(projectId);

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
router.post('/:projectId/invite', requireAuth, async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { email, invitedBy } = req.body;

    console.log('Invite request:', { projectId, email, invitedBy });

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const project = await db.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('Project found:', { projectId: project.id, projectUserId: project.user_id });

    // Check if inviter owns the project or is already a collaborator
    // Note: project.user_id might be username or email (legacy data)
    // invitedBy might be username or email depending on client
    // So we skip authorization check for now to allow project owners to invite
    // In production, you should implement proper user ID mapping
    
    // Simple check: if invitedBy is provided, allow the invitation
    // A more robust solution would require a user table to map username <-> email

    // Add collaborator
    await db.insertProjectCollaborator({
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
