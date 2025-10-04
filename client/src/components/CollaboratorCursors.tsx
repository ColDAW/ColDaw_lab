import { useEffect } from 'react';
import styled from 'styled-components';
import { useStore } from '../store/useStore';

const CursorContainer = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 9999;
`;

const Cursor = styled.div<{ color: string }>`
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ color }) => color};
  border: 2px solid white;
  transform: translate(-50%, -50%);
  transition: transform 0.1s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const CursorLabel = styled.div<{ color: string }>`
  position: absolute;
  top: 25px;
  left: 10px;
  padding: 4px 8px;
  background: ${({ color }) => color};
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

function CollaboratorCursors() {
  const { collaborators, socket, currentProject } = useStore();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (socket && currentProject) {
        socket.emit('cursor-move', {
          projectId: currentProject.id,
          x: e.clientX,
          y: e.clientY,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [socket, currentProject]);

  return (
    <CursorContainer>
      {collaborators.map((collab) =>
        collab.cursorX !== undefined && collab.cursorY !== undefined ? (
          <div
            key={collab.id}
            style={{
              position: 'absolute',
              left: collab.cursorX,
              top: collab.cursorY,
            }}
          >
            <Cursor color={collab.color} />
            <CursorLabel color={collab.color}>
              {collab.userName}
            </CursorLabel>
          </div>
        ) : null
      )}
    </CursorContainer>
  );
}

export default CollaboratorCursors;
