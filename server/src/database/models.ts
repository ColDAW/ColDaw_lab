import mongoose from 'mongoose';

// User Schema for MongoDB
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String },
  created_at: { type: Number, required: true },
  last_login: { type: Number }
});

// Project Schema for MongoDB
const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  userId: { type: String },
  created_at: { type: Number, required: true },
  updated_at: { type: Number, required: true },
  current_branch: { type: String, required: true }
});

// Version Schema for MongoDB
const VersionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  projectId: { type: String, required: true },
  branch: { type: String, required: true },
  message: { type: String, required: true },
  userId: { type: String, required: true },
  parentId: { type: String },
  timestamp: { type: Number, required: true },
  files: { type: mongoose.Schema.Types.Mixed }
});

// Collaborator Schema for MongoDB
const CollaboratorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  projectId: { type: String, required: true },
  userId: { type: String, required: true },
  socketId: { type: String, required: true },
  joinedAt: { type: Number, required: true },
  lastActivity: { type: Number, required: true }
});

export const MongoUser = mongoose.model('User', UserSchema);
export const MongoProject = mongoose.model('Project', ProjectSchema);
export const MongoVersion = mongoose.model('Version', VersionSchema);
export const MongoCollaborator = mongoose.model('Collaborator', CollaboratorSchema);