
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
    <header className="bg-white">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="text-2xl font-bold text-ink-light">
          News App
        </Link>
        
        {session ? (
          <div className="flex items-center gap-4">
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
          </div>
        ) : (
          <Link to="/auth">
            <Button className="bg-black text-white hover:bg-black/90">Sign In</Button>
          </Link>
        )}
      </div>
      
      <div className="border-t">
        <nav className="container mx-auto px-4">
          <ul className="flex gap-8 py-4">
            <li>
              <Button
                variant={activeCategory === 'all' ? 'default' : 'ghost'}
                className={activeCategory === 'all' ? 'bg-black text-white hover:bg-black/90' : 'text-gray-600 hover:text-black'}
                onClick={() => onCategoryChange('all')}
              >
                All
              </Button>
            </li>
            {['tech', 'world', 'business', 'science', 'entertainment', 'sports', 'us'].map((category) => (
              <li key={category}>
                <button
                  className={`text-gray-600 hover:text-black ${activeCategory === category ? 'text-black' : ''}`}
                  onClick={() => onCategoryChange(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
