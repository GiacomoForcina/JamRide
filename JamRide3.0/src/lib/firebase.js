
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCiWV8kFzNUcUHV1UGGmmIPTOx7fLWwinM",
  authDomain: "jamride-8065c.firebaseapp.com",
  projectId: "jamride-8065c",
  storageBucket: "jamride-8065c.appspot.com",
  messagingSenderId: "1040822554899",
  appId: "1:1040822554899:web:edbec5625584f09789cae6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const uploadProfilePicture = async (file, userId) => {
  try {
    // Crea un riferimento con timestamp per evitare la cache del browser
    const timestamp = Date.now();
    const storageRef = ref(storage, `profilePictures/${userId}_${timestamp}.jpg`);
    
    // Upload del file
    await uploadBytes(storageRef, file);
    
    // Ottieni l'URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Aggiorna il profilo utente
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, { photoURL: downloadURL });
      // Forza il refresh dell'utente
      await user.reload();
    }
    
    return downloadURL;
  } catch (error) {
    console.error("Errore durante l'upload:", error);
    throw error;
  }
};

export const updateUserProfile = async (displayName, photoURL) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Nessun utente autenticato");

    await updateProfile(user, { 
      displayName, 
      photoURL 
    });

    // Forza il refresh dell'utente
    await user.reload();
    return user;
  } catch (error) {
    console.error("Errore durante l'aggiornamento del profilo:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export { auth };
