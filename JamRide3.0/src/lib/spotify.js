
import { loadStripe } from '@stripe/stripe-js';

const SPOTIFY_CLIENT_ID = "YOUR_CLIENT_ID"; // Da sostituire con l'ID reale
const REDIRECT_URI = `${window.location.origin}/profile`;
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-follow-read'
].join(' ');

export const initiateSpotifyLogin = () => {
  if (!SPOTIFY_CLIENT_ID || SPOTIFY_CLIENT_ID === "YOUR_CLIENT_ID") {
    throw new Error("Spotify Client ID non configurato");
  }

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'token',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    show_dialog: true
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
};

// ... [rest of the file remains the same]
