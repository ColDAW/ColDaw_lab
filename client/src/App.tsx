import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EditorPage from './pages/EditorPage';
import ProjectPage from './pages/ProjectPage';
import AccountPage from './pages/AccountPage';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <ModalProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route 
                path="/project/:projectId" 
                element={
                  <ProtectedRoute>
                    <ProjectPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/account" 
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </BrowserRouter>
        </ModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
