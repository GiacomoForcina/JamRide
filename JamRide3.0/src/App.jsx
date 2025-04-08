
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import FindRides from "@/pages/FindRides";
import Messages from "@/pages/Messages";
import AuthModal from "@/components/auth/AuthModal";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Caricamento...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100">
        <Toaster />
        <Navbar user={user} onAuthClick={() => setShowAuthModal(true)} />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        <Routes>
          <Route path="/" element={<Home user={user} onAuthRequired={() => setShowAuthModal(true)} />} />
          <Route 
            path="/profile" 
            element={
              user ? <Profile user={user} /> : <Navigate to="/" replace />
            } 
          />
          <Route path="/find-rides" element={<FindRides user={user} onAuthRequired={() => setShowAuthModal(true)} />} />
          <Route 
            path="/messages" 
            element={
              user ? <Messages user={user} /> : <Navigate to="/" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
