import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ALSParser } from '../utils/alsParser';
import { dbHelpers } from '../database/init';

const router = Router();

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

const upload = multer({ storage });

router.post('/:projectId/commit', upload.single('alsFile'), async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { branch, message, author } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const project = await dbHelpers.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const branchData = await dbHelpers.getBranch(projectId, branch || 'main');
    if (!branchData) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const alsData = await ALSParser.parseFile(req.file.path);
    const dataDir = path.join(__dirname, '..', '..', 'projects', projectId);
    const versionId = uuidv4();
    
    // Save both JSON and original ALS file
    const dataPath = path.join(dataDir, `${versionId}.json`);
    const alsPath = path.join(dataDir, `${versionId}.als`);
    
    fs.writeFileSync(dataPath, ALSParser.toJSON(alsData));
    fs.copyFileSync(req.file.path, alsPath); // Copy instead of move so we can still delete the temp file

    const now = Date.now();
    await dbHelpers.insertVersion({
      id: versionId,
      project_id: projectId,
      branch: branch || 'main',
      parent_id: branchData.head_version_id,
      message: message || 'Update project',
      author: author || 'Anonymous',
      timestamp: now,
      data_path: dataPath,
    });

    await dbHelpers.updateBranch(branchData.id, { head_version_id: versionId });
    await dbHelpers.updateProject(projectId, { updated_at: now });
    fs.unlinkSync(req.file.path);

    res.json({ versionId, message: 'Version committed successfully', data: alsData });
  } catch (error: any) {
    console.error('Error committing version:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:projectId/branch', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { name, fromBranch, fromVersionId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Branch name is required' });
    }

    const project = await dbHelpers.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const existingBranch = await dbHelpers.getBranch(projectId, name);
    if (existingBranch) {
      return res.status(409).json({ error: 'Branch name already exists' });
    }

    let headVersionId = null;

    // If fromVersionId is specified, use that version
    if (fromVersionId) {
      const version = await dbHelpers.getVersion(fromVersionId);
      if (!version || version.project_id !== projectId) {
        return res.status(404).json({ error: 'Source version not found' });
      }
      headVersionId = fromVersionId;
    } else {
      // Otherwise, use the head of the source branch
      const sourceBranch = await dbHelpers.getBranch(projectId, fromBranch || 'main');
      if (!sourceBranch) {
        return res.status(404).json({ error: 'Source branch not found' });
      }
      headVersionId = sourceBranch.head_version_id;
    }

    const branchId = uuidv4();
    const now = Date.now();
    await dbHelpers.insertBranch({
      id: branchId,
      project_id: projectId,
      name,
      head_version_id: headVersionId,
      created_at: now,
    });

    res.json({ branchId, message: `Branch '${name}' created successfully` });
  } catch (error: any) {
    console.error('Error creating branch:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:projectId/merge', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { sourceBranch, targetBranch, author } = req.body;

    if (!sourceBranch || !targetBranch) {
      return res.status(400).json({ error: 'Source and target branches are required' });
    }

    const source = await dbHelpers.getBranch(projectId, sourceBranch);
    const target = await dbHelpers.getBranch(projectId, targetBranch);

    if (!source || !target) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    if (!source.head_version_id) {
      return res.status(404).json({ error: 'Source branch has no commits' });
    }

    const sourceVersion = await dbHelpers.getVersion(source.head_version_id);
    if (!sourceVersion) {
      return res.status(404).json({ error: 'Source version not found' });
    }

    const sourceData = JSON.parse(fs.readFileSync(sourceVersion.data_path, 'utf-8'));
    const versionId = uuidv4();
    const now = Date.now();
    const dataDir = path.join(__dirname, '..', '..', 'projects', projectId);
    const dataPath = path.join(dataDir, `${versionId}.json`);
    fs.writeFileSync(dataPath, JSON.stringify(sourceData, null, 2));

    await dbHelpers.insertVersion({
      id: versionId,
      project_id: projectId,
      branch: targetBranch,
      parent_id: target.head_version_id,
      message: `Merge '${sourceBranch}' into '${targetBranch}'`,
      author: author || 'Anonymous',
      timestamp: now,
      data_path: dataPath,
    });

    await dbHelpers.updateBranch(target.id, { head_version_id: versionId });

    res.json({ versionId, message: `Merged '${sourceBranch}' into '${targetBranch}' successfully` });
  } catch (error: any) {
    console.error('Error merging branches:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:projectId/history', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { branch } = req.query;
    const versions = await dbHelpers.getVersionsByProject(projectId, branch);
    res.json(versions);
  } catch (error: any) {
    console.error('Error fetching version history:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:projectId/branches', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const branches = await dbHelpers.getBranchesByProject(projectId);
    res.json(branches);
  } catch (error: any) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download version as ALS file
router.get('/:projectId/download/:versionId', async (req: any, res: any) => {
  try {
    const { projectId, versionId } = req.params;

    const version = await dbHelpers.getVersion(versionId);
    if (!version || version.project_id !== projectId) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Construct the path to the ALS file (stored alongside JSON)
    const alsPath = version.data_path.replace('.json', '.als');
    
    // Check if ALS file exists
    if (!fs.existsSync(alsPath)) {
      return res.status(404).json({ error: 'ALS file not found for this version' });
    }
    
    // Set headers for file download
    const project = await dbHelpers.getProject(projectId);
    const filename = `${project?.name || 'project'}-${version.branch}-${versionId.substring(0, 8)}.als`;
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the ALS file
    const fileStream = fs.createReadStream(alsPath);
    fileStream.pipe(res);
  } catch (error: any) {
    console.error('Error downloading version:', error);
    res.status(500).json({ error: error.message });
  }
});

// Revert to a specific version (creates a new commit with the old version's data)
router.post('/:projectId/revert/:versionId', async (req: any, res: any) => {
  try {
    const { projectId, versionId } = req.params;
    const { branch, message, author } = req.body;

    const project = await dbHelpers.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const targetVersion = await dbHelpers.getVersion(versionId);
    if (!targetVersion || targetVersion.project_id !== projectId) {
      return res.status(404).json({ error: 'Target version not found' });
    }

    const branchData = await dbHelpers.getBranch(projectId, branch || 'main');
    if (!branchData) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Read the target version data
    const targetData = JSON.parse(fs.readFileSync(targetVersion.data_path, 'utf-8'));

    // Create new version with the reverted data
    const newVersionId = uuidv4();
    const now = Date.now();
    const dataDir = path.join(__dirname, '..', '..', 'projects', projectId);
    const dataPath = path.join(dataDir, `${newVersionId}.json`);
    fs.writeFileSync(dataPath, JSON.stringify(targetData, null, 2));

    const revertMessage = message || `Revert to version ${versionId.substring(0, 8)}`;

    await dbHelpers.insertVersion({
      id: newVersionId,
      project_id: projectId,
      branch: branch || 'main',
      parent_id: branchData.head_version_id,
      message: revertMessage,
      author: author || 'Anonymous',
      timestamp: now,
      data_path: dataPath,
    });

    await dbHelpers.updateBranch(branchData.id, { head_version_id: newVersionId });
    await dbHelpers.updateProject(projectId, { updated_at: now });

    res.json({ 
      versionId: newVersionId, 
      message: 'Reverted successfully',
      data: targetData 
    });
  } catch (error: any) {
    console.error('Error reverting version:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
