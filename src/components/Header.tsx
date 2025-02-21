
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface HeaderProps {
  onCategoryChange: (category: string) => void;
  activeCategory: string;
}

export function Header({ onCategoryChange, activeCategory }: HeaderProps) {
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
        <div className="flex-1">
          {/* Left side empty for centering */}
        </div>
        <Link to="/" className="text-2xl font-bold text-ink-light flex-1 text-center">
          PressTemps
        </Link>
        <div className="flex-1 flex justify-end">
          <Link to="/auth">
            <Button variant="ghost" className="text-gray-600 hover:text-black">
              Sign In
            </Button>
          </Link>
        </div>
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
