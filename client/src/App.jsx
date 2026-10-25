import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AudioPlayer from './components/AudioPlayer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import Artists from './pages/Artists';
import ArtistStudio from './pages/ArtistStudio';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <div className="app-container">
            {/* Left fixed Spotify-style navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="main-content-area" style={{ paddingBottom: '90px' }}>
              <Navbar />
              <main className="content-viewport">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalogue" element={<Catalogue />} />
                  <Route path="/artists" element={<Artists />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/studio"
                    element={
                      <ProtectedRoute allowedRoles={['artist', 'admin']}>
                        <ArtistStudio />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>

            {/* Single shared persistent Audio Player */}
            <AudioPlayer />
          </div>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
