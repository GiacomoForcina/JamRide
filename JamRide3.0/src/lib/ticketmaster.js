
const TICKETMASTER_API_KEY = "9JrULrOPYTAN18GTzLVUmmEt2RKHpvkt";
const BASE_URL = "https://app.ticketmaster.com/discovery/v2";

export const searchEvents = async (keyword, countryCode = "IT") => {
  try {
    if (!keyword || keyword.length < 3) return [];

    const encodedKeyword = encodeURIComponent(keyword);
    const response = await fetch(
      `${BASE_URL}/events.json?apikey=${TICKETMASTER_API_KEY}&keyword=${encodedKeyword}&countryCode=${countryCode}&classificationName=music&size=20&locale=*`
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    if (!data._embedded || !data._embedded.events) {
      return [];
    }

    return data._embedded.events.map(event => ({
      id: event.id,
      artist: event.name,
      venue: event._embedded?.venues[0]?.name || 'Venue TBA',
      city: event._embedded?.venues[0]?.city?.name || 'City TBA',
      date: new Date(event.dates.start.localDate).toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: event.dates.start.localTime ? 
        new Date(`2000-01-01T${event.dates.start.localTime}`).toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Orario TBA',
      image: event.images.find(img => img.ratio === "16_9")?.url || 
             event.images[0]?.url,
      price: event.priceRanges ? 
        `${Math.floor(event.priceRanges[0].min)}€ - ${Math.ceil(event.priceRanges[0].max)}€` : 
        'Prezzo TBA',
      url: event.url
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

export const getEventDetails = async (eventId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/events/${eventId}?apikey=${TICKETMASTER_API_KEY}&locale=*`
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    return {
      id: data.id,
      artist: data.name,
      venue: data._embedded?.venues[0]?.name || 'Venue TBA',
      city: data._embedded?.venues[0]?.city?.name || 'City TBA',
      date: new Date(data.dates.start.localDate).toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: data.dates.start.localTime ? 
        new Date(`2000-01-01T${data.dates.start.localTime}`).toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Orario TBA',
      image: data.images.find(img => img.ratio === "16_9")?.url || 
             data.images[0]?.url,
      price: data.priceRanges ? 
        `${Math.floor(data.priceRanges[0].min)}€ - ${Math.ceil(data.priceRanges[0].max)}€` : 
        'Prezzo TBA',
      url: data.url,
      info: data.info || "",
      seatmap: data.seatmap?.staticUrl,
      venueAddress: data._embedded?.venues[0]?.address?.line1,
      venueCity: data._embedded?.venues[0]?.city?.name,
      venueCountry: data._embedded?.venues[0]?.country?.name
    };
  } catch (error) {
    console.error("Error fetching event details:", error);
    return null;
  }
};
