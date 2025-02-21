
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
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }

        if (!user) {
          console.log('No user found');
          setIsAdmin(false);
          return;
        }

        console.log('Checking admin status for user:', user.id);

        // Check admin role - explicitly check for 'admin' role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (roleError && roleError.code !== 'PGRST116') { // Ignore "no rows returned" error
          throw roleError;
        }

        console.log('Role data:', roleData);
        setIsAdmin(!!roleData); // Will be true only if an admin role was found

      } catch (error) {
        console.error('Error checking admin status:', error);
        toast({
          title: "Error checking admin status",
          description: "Please try again later",
          variant: "destructive"
        });
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Check immediately
    checkAdminStatus();

    // Also check when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, 'User:', session?.user?.id);
      checkAdminStatus();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, isLoading };
};
