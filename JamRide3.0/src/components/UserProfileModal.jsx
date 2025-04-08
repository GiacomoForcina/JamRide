
import React from "react";
import { motion } from "framer-motion";
import { X, Star, MapPin, Music } from 'lucide-react';
import { Avatar } from "@/components/ui/avatar";

function UserProfileModal({ user, isOpen, onClose, rides = [] }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-20 w-20">
            <img src={user.avatar} alt={user.name} />
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <div className="flex items-center mt-1">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1 text-gray-600">{user.rating} / 5</span>
            </div>
            <p className="text-gray-600 mt-1">Viaggi completati: {user.totalRides}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Viaggi offerti</h3>
            <div className="space-y-4">
              {rides.map((ride) => (
                <div key={ride.id} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800">{ride.concert.artist}</h4>
                  <div className="flex items-center mt-2 text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Da: {ride.departure}</span>
                  </div>
                  <div className="flex items-center mt-1 text-gray-600">
                    <Music className="h-4 w-4 mr-2" />
                    <span>{ride.concert.venue}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">{ride.concert.date}</span>
                    <span className="font-medium text-purple-600">{ride.price}€</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default UserProfileModal;
