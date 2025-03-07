import React from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { AuthForm } from './components/AuthForm';
import { Navigation } from './components/Navigation';
import { Profile } from './components/Profile';
import { ImageProcessor } from './components/ImageProcessor';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = React.useState<'process' | 'profile'>('process');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 p-8">
        {currentPage === 'process' ? <ImageProcessor /> : <Profile />}
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;