
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  signInWithGoogle, 
  signInWithFacebook, 
  signUpWithEmail, 
  signInWithEmail,
  uploadProfilePicture,
  updateUserProfile,
  auth
} from "@/lib/firebase";
import { compressImage } from "@/lib/imageUtils";

function AuthForm({ onClose }) {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedFile = await compressImage(file);
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const newPreviewUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(newPreviewUrl);
      setProfilePicture(compressedFile);
    } catch (error) {
      console.error("Errore durante la compressione dell'immagine:", error);
      toast({
        title: "Errore",
        description: "Errore durante il caricamento dell'immagine",
        variant: "destructive"
      });
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setIsLoading(true);
      const user = await (provider === "Google" ? signInWithGoogle() : signInWithFacebook());
      
      if (!user.photoURL || !user.displayName) {
        setShowProfileSetup(true);
        return;
      }

      toast({
        title: "Accesso effettuato",
        description: `Benvenuto ${user.displayName}!`
      });
      onClose();
    } catch (error) {
      console.error("Errore social login:", error);
      toast({
        title: "Errore",
        description: "Errore durante l'accesso. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Errore",
        description: "Inserisci email e password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      await signUpWithEmail(email, password);
      setShowProfileSetup(true);
    } catch (error) {
      console.error("Errore signup:", error);
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSetup = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci il tuo nome",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      let photoURL = null;
      if (profilePicture) {
        photoURL = await uploadProfilePicture(profilePicture, auth.currentUser.uid);
      }
      
      await updateUserProfile(name, photoURL);

      toast({
        title: "Registrazione completata",
        description: `Benvenuto ${name}!`
      });
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      onClose();
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del profilo:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento del profilo. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Errore",
        description: "Inserisci email e password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = await signInWithEmail(email, password);
      
      if (!user.photoURL || !user.displayName) {
        setShowProfileSetup(true);
        return;
      }

      toast({
        title: "Accesso effettuato",
        description: `Bentornato ${user.displayName}!`
      });
      onClose();
    } catch (error) {
      console.error("Errore login:", error);
      toast({
        title: "Errore",
        description: "Email o password non validi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (showProfileSetup) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
      >
        <h3 className="text-xl font-semibold text-center mb-6">
          Completa il tuo profilo
        </h3>
        <form onSubmit={handleProfileSetup} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Nome e Cognome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Upload className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {previewUrl && (
              <div className="relative w-32 h-32 mx-auto">
                <img
                  src={previewUrl}
                  alt="Anteprima foto profilo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !name}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <div className="flex items-center">
                <span className="animate-spin mr-2">⏳</span>
                Caricamento...
              </div>
            ) : (
              "Completa registrazione"
            )}
          </Button>
        </form>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button
          onClick={() => handleSocialLogin("Google")}
          disabled={isLoading}
          className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
          Continua con Google
        </Button>

        <Button
          onClick={() => handleSocialLogin("Facebook")}
          disabled={isLoading}
          className="w-full bg-[#1877f2] hover:bg-[#166fe5]"
        >
          <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5 mr-2" />
          Continua con Facebook
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Oppure</span>
        </div>
      </div>

      <form onSubmit={isLogin ? handleLogin : handleInitialSignup} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
            disabled={isLoading}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? (
            <div className="flex items-center">
              <span className="animate-spin mr-2">⏳</span>
              Caricamento...
            </div>
          ) : (
            isLogin ? "Accedi" : "Registrati"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        {isLogin ? "Non hai un account?" : "Hai già un account?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-purple-600 hover:text-purple-500 font-medium"
          disabled={isLoading}
        >
          {isLogin ? "Registrati" : "Accedi"}
        </button>
      </p>
    </div>
  );
}

export default AuthForm;
