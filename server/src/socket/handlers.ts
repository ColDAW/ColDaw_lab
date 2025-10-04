import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { dbHelpers } from '../database/init';

interface CollaboratorData {
  id: string;
  projectId: string;
  userName: string;
  socketId: string;
  cursorX?: number;
  cursorY?: number;
  color: string;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join a project room
    socket.on('join-project', async (data: { projectId: string; userName: string }) => {
      const { projectId, userName } = data;
      
      socket.join(projectId);
      
      // Clean up any existing connections for this user in this project
      // This prevents duplicate avatars when the user refreshes the page
      await dbHelpers.deleteCollaboratorsByUserAndProject(userName, projectId);
      
      // Assign random color
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      // Save collaborator to database
      const collaboratorId = uuidv4();
      const now = Date.now();
      
      try {
        await dbHelpers.insertCollaborator({
          id: collaboratorId,
          project_id: projectId,
          user_name: userName,
          socket_id: socket.id,
          color,
          last_seen: now,
        });

        // Get all collaborators in this project
        const collaborators = await dbHelpers.getCollaboratorsByProject(projectId);

        // Notify others
        socket.to(projectId).emit('user-joined', {
          id: collaboratorId,
          userName,
          color,
        });

        // Send current collaborators to the new user
        socket.emit('collaborators-list', collaborators);

        console.log(`${userName} joined project ${projectId}`);
      } catch (error) {
        console.error('Error adding collaborator:', error);
      }
    });

    // Leave project room
    socket.on('leave-project', async (data: { projectId: string }) => {
      const { projectId } = data;
      
      try {
        // Get collaborator info before deleting
        const collaborator = await dbHelpers.getCollaboratorBySocket(socket.id);
        
        if (collaborator) {
          // Remove from database
          await dbHelpers.deleteCollaborator(socket.id);
          
          // Notify others
          socket.to(projectId).emit('user-left', {
            id: collaborator.id,
            userName: collaborator.user_name,
          });
          
          socket.leave(projectId);
          console.log(`User ${collaborator.user_name} left project ${projectId}`);
        }
      } catch (error) {
        console.error('Error removing collaborator:', error);
      }
    });

    // Cursor position update
    socket.on('cursor-move', async (data: { projectId: string; x: number; y: number }) => {
      const { projectId, x, y } = data;
      
      try {
        // Update cursor position in database
        await dbHelpers.updateCollaborator(socket.id, {
          cursor_x: x,
          cursor_y: y,
          last_seen: Date.now(),
        });

        // Broadcast to others in the room
        socket.to(projectId).emit('cursor-update', {
          socketId: socket.id,
          x,
          y,
        });
      } catch (error) {
        console.error('Error updating cursor:', error);
      }
    });

    // Selection update
    socket.on('selection-change', (data: { projectId: string; selection: any }) => {
      const { projectId, selection } = data;
      
      // Broadcast to others
      socket.to(projectId).emit('selection-update', {
        socketId: socket.id,
        selection,
      });
    });

    // Real-time edits (for future features)
    socket.on('edit-action', (data: { projectId: string; action: any }) => {
      const { projectId, action } = data;
      
      // Broadcast to others
      socket.to(projectId).emit('remote-edit', {
        socketId: socket.id,
        action,
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        // Get collaborator info
        const collaborator = await dbHelpers.getCollaboratorBySocket(socket.id);
        
        if (collaborator) {
          const projectId = collaborator.project_id;
          
          // Remove from database
          await dbHelpers.deleteCollaborator(socket.id);
          
          // Notify others
          io.to(projectId).emit('user-left', {
            id: collaborator.id,
            userName: collaborator.user_name,
          });
          
          console.log(`Client disconnected: ${socket.id}`);
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
}
