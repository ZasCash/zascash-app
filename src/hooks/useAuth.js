import { useState, useEffect, useCallback } from 'react';
import { useAuth as useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useAuth = () => {
    const { user, session, loading: authLoading, signIn, signOut } = useSupabaseAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (user && !authLoading) {
            setLoading(true);
            supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
                .then(({ data, error }) => {
                    if (error && error.code !== 'PGRST116') { // Ignore error for no rows found
                        console.error('Error fetching profile:', error);
                        toast({
                            title: 'Error al cargar perfil',
                            description: error.message,
                            variant: 'destructive',
                        });
                    }
                    setProfile(data);
                    setLoading(false);
                });
        } else if (!user && !authLoading) {
            setProfile(null);
            setLoading(false);
        }
    }, [user, authLoading, toast]);
    
    const signUp = useCallback(async (email, password, metadata) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: metadata,
        });

        if (error) {
            toast({
                variant: "destructive",
                title: "Fallo en el registro",
                description: error.message || "Algo salió mal",
            });
        }
        return { data, error };
    }, [toast]);
    
    const logout = useCallback(async () => {
        const { error } = await signOut();
        if (!error) {
            setProfile(null);
        }
        return { error };
    }, [signOut]);

    return { 
        user, 
        profile, 
        session, 
        loading: authLoading || loading, 
        signIn, 
        signOut: logout,
        signUp,
    };
};