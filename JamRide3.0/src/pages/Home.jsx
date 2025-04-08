
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Music, Calendar, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { searchEvents } from "@/lib/ticketmaster";
import { fetchItalianCities, calculateDistance, calculatePrice, formatCityWithProvince } from "@/lib/cities";
import { saveRide, getAvailableRides } from "@/lib/rides";
import CarAnimation from "@/components/animations/CarAnimation";

function Home({ user, onAuthRequired }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [departure, setDeparture] = useState("");
  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [concertSearch, setConcertSearch] = useState("");
  const [concertSuggestions, setConcertSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConcerts, setShowConcerts] = useState(false);
  const [isDepartureSelected, setIsDepartureSelected] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [italianCities, setItalianCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  useEffect(() => {
    const loadCities = async () => {
      const cities = await fetchItalianCities();
      setItalianCities(cities);
      setIsLoadingCities(false);
    };
    loadCities();
  }, []);

  useEffect(() => {
    const searchConcerts = async () => {
      if (concertSearch.length >= 2) {
        setIsLoading(true);
        try {
          const results = await searchEvents(concertSearch);
          setConcertSuggestions(results);
          setShowConcerts(true);
        } catch (error) {
          console.error("Errore nella ricerca concerti:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setConcertSuggestions([]);
        setShowConcerts(false);
      }
    };

    const debounceTimer = setTimeout(searchConcerts, 300);
    return () => clearTimeout(debounceTimer);
  }, [concertSearch]);

  const handleDepartureChange = (e) => {
    const value = e.target.value;
    setDeparture(value);
    setIsDepartureSelected(false);

    if (value.length >= 2) {
      const suggestions = italianCities
        .filter(city => 
          city.nome.toLowerCase().startsWith(value.toLowerCase()) ||
          city.provincia.toLowerCase().startsWith(value.toLowerCase())
        )
        .sort((a, b) => {
          if (a.isCapoluogo && !b.isCapoluogo) return -1;
          if (!a.isCapoluogo && b.isCapoluogo) return 1;
          return a.nome.localeCompare(b.nome);
        })
        .slice(0, 5);
      setDepartureSuggestions(suggestions);
    } else {
      setDepartureSuggestions([]);
    }
  };

  const handleDepartureSelect = (city) => {
    setDeparture(formatCityWithProvince(city));
    setDepartureSuggestions([]);
    setIsDepartureSelected(true);
  };

  const handleConcertSelect = async (concert) => {
    if (!isDepartureSelected) {
      toast({
        title: "Città di partenza mancante",
        description: "Seleziona prima una città di partenza valida",
        variant: "destructive"
      });
      return;
    }

    setSelectedConcert(concert);
    setConcertSearch(concert.artist);
    setConcertSuggestions([]);
    setShowConcerts(false);
    setIsCalculatingPrice(true);

    try {
      const distance = await calculateDistance(departure.split(" (")[0], concert.city);
      if (distance) {
        const price = calculatePrice(distance);
        setEstimatedPrice({ price, distance });
      } else {
        throw new Error("Impossibile calcolare la distanza");
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile calcolare il prezzo. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const handleCreateRide = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    if (!estimatedPrice) {
      toast({
        title: "Prezzo non calcolato",
        description: "Attendi il calcolo del prezzo prima di creare il viaggio",
        variant: "destructive"
      });
      return;
    }

    try {
      const newRide = {
        id: Date.now(),
        departure: departure.split(" (")[0],
        concert: {
          artist: selectedConcert.artist,
          venue: selectedConcert.venue,
          city: selectedConcert.city,
          date: selectedConcert.date,
          image: selectedConcert.image
        },
        price: estimatedPrice.price,
        distance: estimatedPrice.distance,
        driver: {
          id: user.uid,
          name: user.displayName,
          avatar: user.photoURL || "https://via.placeholder.com/80",
          rating: 5,
          totalRides: 0
        }
      };

      await saveRide(newRide);

      toast({
        title: "Viaggio creato!",
        description: "Il tuo viaggio è stato pubblicato con successo"
      });

      // Reset form
      setDeparture("");
      setSelectedConcert(null);
      setEstimatedPrice(null);
      setConcertSearch("");
      setIsDepartureSelected(false);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare il viaggio. Riprova più tardi.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Trova compagni di viaggio per i tuoi concerti preferiti
        </h1>

        {/* Città di partenza */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Da dove parti?
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              value={departure}
              onChange={handleDepartureChange}
              placeholder="Inserisci la città di partenza"
              className="pl-10"
            />
            <AnimatePresence>
              {departureSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg"
                >
                  {departureSuggestions.map((city) => (
                    <div
                      key={`${city.nome}-${city.provincia}`}
                      className="px-4 py-2 hover:bg-purple-50 cursor-pointer"
                      onClick={() => handleDepartureSelect(city)}
                    >
                      {formatCityWithProvince(city)}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Ricerca concerto */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quale concerto vuoi raggiungere?
          </label>
          <div className="relative">
            <Music className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              value={concertSearch}
              onChange={(e) => setConcertSearch(e.target.value)}
              placeholder="Cerca per artista o location"
              className="pl-10"
            />
            <AnimatePresence>
              {showConcerts && concertSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg overflow-hidden"
                >
                  {concertSuggestions.map((concert) => (
                    <div
                      key={concert.id}
                      className="p-4 border-b last:border-0 hover:bg-purple-50 cursor-pointer"
                      onClick={() => handleConcertSelect(concert)}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={concert.image}
                          alt={concert.artist}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-medium text-gray-800">{concert.artist}</h3>
                          <p className="text-sm text-gray-600">{concert.venue}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{concert.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Calcolo prezzo */}
        {isCalculatingPrice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-center"
          >
            <p className="text-gray-600 mb-2">Calcolo del prezzo in corso...</p>
            <CarAnimation />
          </motion.div>
        )}

        {/* Riepilogo e prezzo */}
        {selectedConcert && estimatedPrice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Riepilogo del viaggio</h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Da: {departure}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Music className="h-4 w-4 mr-2" />
                <span>{selectedConcert.artist} @ {selectedConcert.venue}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{selectedConcert.date}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-gray-500">Distanza: {estimatedPrice.distance} km</p>
                <p className="text-2xl font-bold text-purple-600">{estimatedPrice.price}€</p>
              </div>
              <Button
                onClick={handleCreateRide}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Crea viaggio
              </Button>
            </div>
          </motion.div>
        )}

        {/* Info box */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
            <div>
              <h4 className="font-medium text-blue-800">Come funziona?</h4>
              <p className="text-sm text-blue-600 mt-1">
                Inserisci la tua città di partenza e cerca il concerto che vuoi raggiungere.
                Ti mostreremo una stima del prezzo basata sulla distanza. Una volta creato
                il viaggio, altri utenti potranno richiedere di unirsi!
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Home;
