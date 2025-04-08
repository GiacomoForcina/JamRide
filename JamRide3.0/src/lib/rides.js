
import { auth } from "@/lib/firebase";

// Funzione per salvare un nuovo viaggio
export const saveRide = async (ride) => {
  try {
    // Salva il viaggio nel localStorage
    const availableRides = JSON.parse(localStorage.getItem('availableRides') || '[]');
    
    // Aggiungi la data di scadenza (data del concerto)
    const rideWithExpiry = {
      ...ride,
      expiryDate: new Date(ride.concert.date).getTime()
    };
    
    // Salva nella lista globale dei viaggi
    const updatedRides = [...availableRides, rideWithExpiry];
    localStorage.setItem('availableRides', JSON.stringify(updatedRides));
    
    // Salva anche nella lista personale dell'utente
    const userRides = JSON.parse(localStorage.getItem(`userRides_${auth.currentUser.uid}`) || '[]');
    const updatedUserRides = [...userRides, rideWithExpiry];
    localStorage.setItem(`userRides_${auth.currentUser.uid}`, JSON.stringify(updatedUserRides));
    
    return rideWithExpiry;
  } catch (error) {
    console.error("Errore nel salvataggio del viaggio:", error);
    throw error;
  }
};

// Funzione per ottenere tutti i viaggi disponibili
export const getAvailableRides = () => {
  try {
    const now = new Date().getTime();
    const rides = JSON.parse(localStorage.getItem('availableRides') || '[]');
    
    // Filtra i viaggi scaduti
    const activeRides = rides.filter(ride => {
      const expiryDate = new Date(ride.concert.date).getTime();
      return expiryDate > now;
    });
    
    // Aggiorna il localStorage rimuovendo i viaggi scaduti
    if (activeRides.length !== rides.length) {
      localStorage.setItem('availableRides', JSON.stringify(activeRides));
    }
    
    return activeRides;
  } catch (error) {
    console.error("Errore nel recupero dei viaggi:", error);
    return [];
  }
};

// Funzione per ottenere i viaggi di un utente specifico
export const getUserRides = (userId) => {
  try {
    const now = new Date().getTime();
    const rides = JSON.parse(localStorage.getItem(`userRides_${userId}`) || '[]');
    
    // Filtra i viaggi scaduti
    const activeRides = rides.filter(ride => {
      const expiryDate = new Date(ride.concert.date).getTime();
      return expiryDate > now;
    });
    
    // Aggiorna il localStorage rimuovendo i viaggi scaduti
    if (activeRides.length !== rides.length) {
      localStorage.setItem(`userRides_${userId}`, JSON.stringify(activeRides));
    }
    
    return activeRides;
  } catch (error) {
    console.error("Errore nel recupero dei viaggi dell'utente:", error);
    return [];
  }
};

// Funzione per eliminare un viaggio
export const deleteRide = async (rideId, userId) => {
  try {
    // Rimuovi il viaggio dalla lista globale
    const availableRides = JSON.parse(localStorage.getItem('availableRides') || '[]');
    const updatedAvailableRides = availableRides.filter(ride => ride.id !== rideId);
    localStorage.setItem('availableRides', JSON.stringify(updatedAvailableRides));
    
    // Rimuovi il viaggio dalla lista dell'utente
    const userRides = JSON.parse(localStorage.getItem(`userRides_${userId}`) || '[]');
    const updatedUserRides = userRides.filter(ride => ride.id !== rideId);
    localStorage.setItem(`userRides_${userId}`, JSON.stringify(updatedUserRides));
    
    return true;
  } catch (error) {
    console.error("Errore nell'eliminazione del viaggio:", error);
    throw error;
  }
};

// Funzione per pulire i viaggi scaduti
export const cleanExpiredRides = () => {
  try {
    const now = new Date().getTime();
    
    // Pulisci la lista globale
    const availableRides = JSON.parse(localStorage.getItem('availableRides') || '[]');
    const activeRides = availableRides.filter(ride => {
      const expiryDate = new Date(ride.concert.date).getTime();
      return expiryDate > now;
    });
    
    if (activeRides.length !== availableRides.length) {
      localStorage.setItem('availableRides', JSON.stringify(activeRides));
    }
    
    // Pulisci le liste degli utenti
    const userKeys = Object.keys(localStorage).filter(key => key.startsWith('userRides_'));
    userKeys.forEach(key => {
      const userRides = JSON.parse(localStorage.getItem(key) || '[]');
      const activeUserRides = userRides.filter(ride => {
        const expiryDate = new Date(ride.concert.date).getTime();
        return expiryDate > now;
      });
      
      if (activeUserRides.length !== userRides.length) {
        localStorage.setItem(key, JSON.stringify(activeUserRides));
      }
    });
  } catch (error) {
    console.error("Errore nella pulizia dei viaggi scaduti:", error);
  }
};

// Pulisci i viaggi scaduti ogni ora
setInterval(cleanExpiredRides, 3600000);
