
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface HeaderProps {
  onCategoryChange: (category: string) => void;
  activeCategory: string;
  session?: Session | null;
}

export function Header({ onCategoryChange, activeCategory, session }: HeaderProps) {
  const { toast } = useToast();
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          News App
        </Link>
        
        <nav className="flex items-center space-x-4">
          {session ? (
            <>
              <span className="text-sm text-gray-600">
                {session.user.email}
              </span>
              {session.user && (
                <Link to="/admin">
                  <Button variant="outline">Admin</Button>
                </Link>
              )}
              <Button onClick={handleLogout} variant="outline">
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
      
      <nav className="container mx-auto px-4 py-2">
        <ul className="flex space-x-4">
          <li>
            <Button
              variant={activeCategory === 'all' ? 'default' : 'ghost'}
              onClick={() => onCategoryChange('all')}
            >
              All
            </Button>
          </li>
          {['tech', 'world', 'business', 'science', 'entertainment', 'sports', 'us'].map((category) => (
            <li key={category}>
              <Button
                variant={activeCategory === category ? 'default' : 'ghost'}
                onClick={() => onCategoryChange(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
