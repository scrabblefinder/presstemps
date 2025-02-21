
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onCategoryChange: (category: string) => void;
  activeCategory: string;
}

export function Header({ onCategoryChange, activeCategory }: HeaderProps) {
  return (
    <header className="bg-white">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="text-2xl font-bold text-ink-light">
          PressTemps
        </Link>
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
