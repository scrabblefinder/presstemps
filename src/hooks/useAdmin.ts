
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        console.log('Checking admin status...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No session found');
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        console.log('Session found, checking admin role for user:', session.user.id);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();

        if (error) {
          console.error('Error checking admin role:', error);
          throw error;
        }

        console.log('Admin check result:', data);
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast({
          title: "Error checking admin status",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  return { isAdmin, isLoading };
};
