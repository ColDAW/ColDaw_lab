import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ALSParser } from '../utils/alsParser';
import { db } from '../database/init';

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
    const { branch, message, author, fromVST, tempFileName } = req.body;

    // Check if this is a VST import commit
    if (fromVST === 'true' && tempFileName) {
      // Use temp file from VST import
      const dataDir = path.join(__dirname, '..', '..', 'projects', projectId);
      const tempFilePath = path.join(dataDir, tempFileName);
      
      if (!fs.existsSync(tempFilePath)) {
        return res.status(404).json({ error: 'Temp file not found. Please re-import from VST.' });
      }
      
      const project = await db.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const branchData = await db.getBranch(projectId, branch || 'main');
      if (!branchData) {
        return res.status(404).json({ error: 'Branch not found' });
      }

      const alsData = await ALSParser.parseFile(tempFilePath);
      const versionId = uuidv4();
      
      // Save both JSON and original ALS file
      const dataPath = path.join(dataDir, `${versionId}.json`);
      const alsPath = path.join(dataDir, `${versionId}.als`);
      
      fs.writeFileSync(dataPath, ALSParser.toJSON(alsData));
      fs.copyFileSync(tempFilePath, alsPath);

      const now = Date.now();
      await db.insertVersion({
        id: versionId,
        project_id: projectId,
        branch: branch || 'main',
        message: message || 'Update from VST plugin',
        user_id: author || 'VST Plugin',
        timestamp: now,
        files: dataPath,
      });

      await db.updateProject(projectId, { updated_at: now });
      
      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      return res.json({ versionId, message: 'Version committed successfully from VST', data: alsData });
    }

    // Normal file upload commit
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const project = await db.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const branchData = await db.getBranch(projectId, branch || 'main');
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
    await db.insertVersion({
      id: versionId,
      project_id: projectId,
      branch: branch || 'main',
      message: message || 'Update project',
      user_id: author || 'Anonymous',
      timestamp: now,
      files: dataPath,
    });

    await db.updateProject(projectId, { updated_at: now });
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

    const project = await db.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const existingBranch = await db.getBranch(projectId, name);
    if (existingBranch) {
      return res.status(409).json({ error: 'Branch name already exists' });
    }

    let headVersionId = null;

    // If fromVersionId is specified, use that version
    if (fromVersionId) {
      const version = await db.getVersion(fromVersionId);
      if (!version || version.project_id !== projectId) {
        return res.status(404).json({ error: 'Source version not found' });
      }
      headVersionId = fromVersionId;
    } else {
      // Otherwise, use the head of the source branch
      const sourceBranch = await db.getBranch(projectId, fromBranch || 'main');
      if (!sourceBranch) {
        return res.status(404).json({ error: 'Source branch not found' });
      }
    }

    const branchId = uuidv4();
    const now = Date.now();
    await db.insertBranch({
      id: branchId,
      project_id: projectId,
      name,
      created_at: now,
      created_by: req.user_id, // Must be a valid user ID from authenticated request
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

    const source = await db.getBranch(projectId, sourceBranch);
    const target = await db.getBranch(projectId, targetBranch);

    if (!source || !target) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const sourceVersion = await db.getVersionsByProject(projectId, sourceBranch);
    if (!sourceVersion || sourceVersion.length === 0) {
      return res.status(404).json({ error: 'Source branch has no commits' });
    }

    const latestVersion = sourceVersion[0];
    const sourceData = latestVersion.files;
    const versionId = uuidv4();
    const now = Date.now();

    await db.insertVersion({
      id: versionId,
      project_id: projectId,
      branch: targetBranch,
      message: `Merge '${sourceBranch}' into '${targetBranch}'`,
      user_id: author || 'Anonymous',
      timestamp: now,
      files: sourceData,
    });

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
    const versions = await db.getVersionsByProject(projectId, branch);
    res.json(versions);
  } catch (error: any) {
    console.error('Error fetching version history:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:projectId/branches', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const branches = await db.getBranchesByProject(projectId);
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

    const version = await db.getVersion(versionId);
    if (!version || version.project_id !== projectId) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Construct the path to the ALS file (stored alongside JSON)
    const alsPath = version.files.replace('.json', '.als');
    
    // Check if ALS file exists
    if (!fs.existsSync(alsPath)) {
      return res.status(404).json({ error: 'ALS file not found for this version' });
    }
    
    // Set headers for file download
    const project = await db.getProject(projectId);
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

    const project = await db.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const targetVersion = await db.getVersion(versionId);
    if (!targetVersion || targetVersion.project_id !== projectId) {
      return res.status(404).json({ error: 'Target version not found' });
    }

    const branchData = await db.getBranch(projectId, branch || 'main');
    if (!branchData) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Read the target version data
    const targetData = JSON.parse(fs.readFileSync(targetVersion.files, 'utf-8'));

    // Create new version with the reverted data
    const newVersionId = uuidv4();
    const now = Date.now();
    const dataDir = path.join(__dirname, '..', '..', 'projects', projectId);
    const dataPath = path.join(dataDir, `${newVersionId}.json`);
    fs.writeFileSync(dataPath, JSON.stringify(targetData, null, 2));

    const revertMessage = message || `Revert to version ${versionId.substring(0, 8)}`;

    await db.insertVersion({
      id: newVersionId,
      project_id: projectId,
      branch: branch || 'main',
      message: revertMessage,
      user_id: author || 'Anonymous',
      timestamp: now,
      files: dataPath,
    });

    await db.updateProject(projectId, { updated_at: now });

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
