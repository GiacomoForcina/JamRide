
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Music, Calendar, Search, Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getAvailableRides } from "@/lib/rides";
import UserProfileModal from "@/components/UserProfileModal";

function FindRides({ user, onAuthRequired }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [availableRides, setAvailableRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Load available rides and set up auto-refresh
  useEffect(() => {
    loadRides();
    const interval = setInterval(loadRides, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadRides = () => {
    const rides = getAvailableRides();
    setAvailableRides(rides);
    setFilteredRides(rides);
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = availableRides.filter(ride => 
        ride.concert.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.concert.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRides(filtered);
    } else {
      setFilteredRides(availableRides);
    }
  }, [searchTerm, availableRides]);

  const handleJoinRide = (ride) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    // Create a new chat with the driver
    const existingChats = JSON.parse(localStorage.getItem(`chats_${user.uid}`) || '[]');
    const chatExists = existingChats.some(chat => chat.ride.id === ride.id);

    if (chatExists) {
      toast({
        title: "Chat esistente",
        description: "Hai già una richiesta attiva per questo viaggio"
      });
      navigate("/messages");
      return;
    }

    const newChat = {
      id: Date.now(),
      user: {
        id: ride.driver.id,
        name: ride.driver.name,
        avatar: ride.driver.avatar
      },
      ride: {
        id: ride.id,
        concert: ride.concert.artist,
        date: ride.concert.date,
        status: "pending"
      },
      messages: [
        {
          id: Date.now(),
          sender: "me",
          text: `Ciao! Mi piacerebbe unirmi al tuo viaggio per il concerto di ${ride.concert.artist}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "request"
        }
      ],
      unread: 0
    };

    // Save chat for current user
    localStorage.setItem(`chats_${user.uid}`, JSON.stringify([...existingChats, newChat]));

    // Save chat for driver
    const driverChats = JSON.parse(localStorage.getItem(`chats_${ride.driver.id}`) || '[]');
    const driverChat = {
      ...newChat,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL
      },
      messages: [
        {
          ...newChat.messages[0],
          sender: "other"
        }
      ],
      unread: 1
    };
    localStorage.setItem(`chats_${ride.driver.id}`, JSON.stringify([...driverChats, driverChat]));

    toast({
      title: "Richiesta inviata",
      description: "Il conducente riceverà la tua richiesta"
    });
    navigate("/messages");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Barra di ricerca */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per artista, città o location..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista viaggi */}
        <div className="space-y-4">
          {filteredRides.map((ride) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar
                    className="h-12 w-12 cursor-pointer"
                    onClick={() => {
                      setSelectedDriver(ride.driver);
                      setShowProfileModal(true);
                    }}
                  >
                    <img src={ride.driver.avatar} alt={ride.driver.name} />
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-800">{ride.driver.name}</h3>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">
                        {ride.driver.rating} ({ride.driver.totalRides} viaggi)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{ride.price}€</p>
                  <p className="text-sm text-gray-500">a persona</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>Da: {ride.departure}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Music className="h-5 w-5 mr-2" />
                  <span>{ride.concert.artist} @ {ride.concert.venue}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{ride.concert.date}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => handleJoinRide(ride)}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={ride.driver.id === user?.uid}
                >
                  {ride.driver.id === user?.uid ? "Il tuo viaggio" : "Unisciti"}
                </Button>
              </div>
            </motion.div>
          ))}

          {filteredRides.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm
                  ? "Nessun viaggio trovato per la tua ricerca"
                  : "Non ci sono viaggi disponibili al momento"}
              </p>
            </div>
          )}
        </div>
      </div>

      <UserProfileModal
        user={selectedDriver}
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedDriver(null);
        }}
        rides={availableRides.filter(ride => ride.driver.id === selectedDriver?.id)}
      />
    </div>
  );
}

export default FindRides;
