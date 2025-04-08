
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, User, MessageSquare, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";

function Navbar({ user, onAuthClick }) {
  const location = useLocation();

  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/find-rides", icon: Search, label: "Cerca Viaggi" },
    { to: "/messages", icon: MessageSquare, label: "Messaggi", requiresAuth: true },
    { to: "/profile", icon: User, label: "Profilo", requiresAuth: true },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-purple-800">JamRide</span>
          </Link>

          <div className="flex items-center space-x-4">
            {links.map((link) => (
              (!link.requiresAuth || user) && (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === link.to
                      ? "text-purple-600"
                      : "text-gray-600 hover:text-purple-600"
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </div>
                  {location.pathname === link.to && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              )
            ))}
            
            {!user && (
              <Button
                onClick={onAuthClick}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Accedi
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
