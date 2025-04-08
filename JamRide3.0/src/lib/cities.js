
import React from "react";

// Funzione per ottenere i comuni italiani dall'API
export const fetchItalianCities = async () => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json');
    const data = await response.json();
    
    // Organizziamo le città: prima i capoluoghi, poi gli altri comuni
    const cities = data.map(city => ({
      nome: city.nome,
      provincia: city.provincia.nome,
      sigla: city.provincia.sigla,
      regione: city.regione.nome,
      isCapoluogo: city.nome === city.provincia.nome // Verifica se è capoluogo
    }));

    // Ordiniamo le città: prima i capoluoghi, poi gli altri comuni
    return cities.sort((a, b) => {
      if (a.isCapoluogo && !b.isCapoluogo) return -1;
      if (!a.isCapoluogo && b.isCapoluogo) return 1;
      return a.nome.localeCompare(b.nome);
    });
  } catch (error) {
    console.error("Errore nel caricamento dei comuni:", error);
    return [];
  }
};

// Funzione per calcolare la distanza stradale tra due città usando OSRM
export const calculateDistance = async (origin, destination) => {
  try {
    // Prima otteniamo le coordinate delle città
    const originCoords = await getCoordinates(origin);
    const destCoords = await getCoordinates(destination);

    if (!originCoords || !destCoords) {
      throw new Error("Impossibile trovare le coordinate delle città");
    }

    // Utilizziamo OSRM per calcolare la distanza stradale
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${originCoords.lon},${originCoords.lat};${destCoords.lon},${destCoords.lat}?overview=false`
    );
    const data = await response.json();

    if (data.routes && data.routes[0]) {
      // La distanza viene fornita in metri, convertiamo in km
      return Math.round(data.routes[0].distance / 1000);
    }

    throw new Error("Impossibile calcolare la distanza stradale");
  } catch (error) {
    console.error("Errore nel calcolo della distanza:", error);
    return null;
  }
};

// Funzione per ottenere le coordinate di una città
const getCoordinates = async (city) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)},Italy&format=json&limit=1`
    );
    const data = await response.json();

    if (data.length === 0) {
      throw new Error("Città non trovata");
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  } catch (error) {
    console.error("Errore nel recupero delle coordinate:", error);
    return null;
  }
};

// Calcola il prezzo del viaggio in base alla distanza
export const calculatePrice = (distance) => {
  if (!distance) return null;
  
  // Prezzo base: 2.5€
  const basePrice = 2.5;
  
  // Prezzo per km variabile in base alla distanza
  let pricePerKm;
  if (distance <= 100) {
    pricePerKm = 0.125; // 0.125€/km per distanze fino a 100km
  } else if (distance <= 300) {
    pricePerKm = 0.10; // 0.10€/km per distanze tra 100 e 300km
  } else {
    pricePerKm = 0.075; // 0.075€/km per distanze oltre 300km
  }

  // Calcolo del prezzo totale
  const distancePrice = distance * pricePerKm;
  const totalPrice = basePrice + distancePrice;
  
  // Arrotonda al numero intero più vicino
  return Math.round(totalPrice);
};

// Formatta il nome della città con la provincia
export const formatCityWithProvince = (city) => {
  return `${city.nome} (${city.sigla})${city.isCapoluogo ? ' - Capoluogo' : ''}`;
};
