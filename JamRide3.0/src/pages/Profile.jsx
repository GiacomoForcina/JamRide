
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Music, Calendar, Upload, Edit, Wallet, Trash2, LogOut } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { uploadProfilePicture, updateUserProfile, logoutUser } from "@/lib/firebase";
import { getUserRides, deleteRide } from "@/lib/rides";

function Profile({ user }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      const rides = getUserRides(user.uid);
      setUpcomingRides(rides);
      
      const savedPaypalEmail = localStorage.getItem(`paypal_${user.uid}`);
      if (savedPaypalEmail) {
        setPaypalEmail(savedPaypalEmail);
      }
    }
  }, [user]);

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Errore",
        description: "Per favore seleziona un'immagine valida",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdatingPhoto(true);
      const downloadURL = await uploadProfilePicture(file, user.uid);
      await updateUserProfile(user.displayName, downloadURL);
      
      toast({
        title: "Foto profilo aggiornata",
        description: "La tua foto profilo è stata aggiornata con successo"
      });

      // Force a page reload to update the avatar everywhere
      window.location.reload();
    } catch (error) {
      console.error("Errore durante l'upload:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la foto profilo",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const handlePaypalEmailSave = () => {
    if (!paypalEmail) {
      toast({
        title: "Errore",
        description: "Inserisci un indirizzo PayPal valido",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem(`paypal_${user.uid}`, paypalEmail);
    setIsEditing(false);
    toast({
      title: "Email PayPal salvata",
      description: "Il tuo indirizzo PayPal è stato aggiornato"
    });
  };

  const handleDeleteRide = async (rideId) => {
    try {
      await deleteRide(rideId, user.uid);
      setUpcomingRides(upcomingRides.filter(ride => ride.id !== rideId));
      toast({
        title: "Viaggio eliminato",
        description: "Il viaggio è stato eliminato con successo"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il viaggio",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
      toast({
        title: "Logout effettuato",
        description: "Hai effettuato il logout con successo"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile effettuare il logout",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header profilo */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <img src={user.photoURL} alt={user.displayName} />
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    disabled={isUpdatingPhoto}
                  />
                  <Upload className="h-4 w-4 text-white" />
                </label>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{user.displayName}</h1>
                <div className="flex items-center mt-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-600">5.0 / 5</span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Esci
            </Button>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">PayPal</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Annulla" : "Modifica"}
              </Button>
            </div>
            {isEditing ? (
              <div className="flex space-x-2">
                <Input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="Il tuo indirizzo PayPal"
                />
                <Button onClick={handlePaypalEmailSave}>Salva</Button>
              </div>
            ) : (
              <p className="text-gray-600">
                {paypalEmail || "Nessun indirizzo PayPal impostato"}
              </p>
            )}
          </div>
        </div>

        {/* Lista viaggi */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">I tuoi viaggi</h2>
          <div className="space-y-4">
            <AnimatePresence>
              {upcomingRides.map((ride) => (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border rounded-lg p-4 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{ride.concert.artist}</h3>
                      <div className="flex items-center mt-2 text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>Da: {ride.departure}</span>
                      </div>
                      <div className="flex items-center mt-1 text-gray-600">
                        <Music className="h-4 w-4 mr-2" />
                        <span>{ride.concert.venue}</span>
                      </div>
                      <div className="flex items-center mt-1 text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{ride.concert.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{ride.price}€</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteRide(ride.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Elimina
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {upcomingRides.length === 0 && (
              <p className="text-center text-gray-500">
                Non hai ancora creato nessun viaggio
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
