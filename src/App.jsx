import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ExerciseProvider } from './contexts/ExerciseContext';
import { WorkoutProvider } from './contexts/WorkoutContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Home from './pages/Home';
import Routine from './pages/Routine';
import Exercises from './pages/Exercises';
import Stats from './pages/Stats';
import Auth from './pages/Auth';
import Session from './pages/Session';

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">Cargando GymBro Pro...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <ExerciseProvider>
      <WorkoutProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/routine" element={<Routine />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/session" element={<Session />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </WorkoutProvider>
    </ExerciseProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
