import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4">
    <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.45H18.02C17.73 15.99 16.91 17.27 15.59 18.15V20.89H19.48C21.56 19.02 22.56 15.93 22.56 12.25Z" fill="#4285F4"/>
    <path d="M12 23C14.97 23 17.45 22.04 19.48 20.89L15.59 18.15C14.58 18.83 13.39 19.25 12 19.25C9.12 19.25 6.65 17.3 5.64 14.7H1.69V17.54C3.63 20.83 7.48 23 12 23Z" fill="#34A853"/>
    <path d="M5.64 14.7C5.45 14.15 5.35 13.58 5.35 13C5.35 12.42 5.45 11.85 5.64 11.3L1.69 8.46C0.79 10.23 0.25 12.07 0.25 14C0.25 15.93 0.79 17.77 1.69 19.54L5.64 14.7Z" fill="#FBBC05"/>
    <path d="M12 6.75C13.54 6.75 14.88 7.29 15.94 8.28L19.54 4.68C17.45 2.8 14.97 1.75 12 1.75C7.48 1.75 3.63 4.17 1.69 7.46L5.64 10.3C6.65 7.7 9.12 5.75 12 5.75V6.75Z" fill="#EA4335"/>
  </svg>
);

const GoogleSignInButton = ({ setLoading }) => {
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/select-local`,
      },
    });
    setLoading(false);
    if (error) {
      toast({
        title: 'Error con Google',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
      <GoogleIcon />
      Continuar con Google
    </Button>
  );
};

export default GoogleSignInButton;