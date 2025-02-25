
import { Link } from "react-router-dom";

const categories = [
  { name: "All", slug: "all" },
  { name: "Politics", slug: "politics" },
  { name: "US", slug: "us" },
  { name: "World News", slug: "world" },
  { name: "Sports", slug: "sports" },
  { name: "Business", slug: "business" },
  { name: "Technology", slug: "technology" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Science", slug: "science" },
  { name: "Lifestyle", slug: "lifestyle" }
];

interface HeaderProps {
  onCategoryChange: (category: string) => void;
  activeCategory: string;
}

export function Header({ onCategoryChange, activeCategory }: HeaderProps) {
  return (
    <header className="w-full bg-paper-light border-b border-paper-dark" role="banner">
      <div className="container mx-auto px-4">
        <div className="relative py-8">
          <Link 
            to="/auth"
            className="absolute right-0 top-4 text-sm text-ink-light hover:text-ink-dark transition-colors"
            aria-label="Login to account"
          >
            Login
          </Link>
          <button 
            onClick={() => onCategoryChange('all')}
            className="block text-center w-full"
            aria-label="Go to homepage"
          >
            <h1 
              className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold text-ink-dark hover:text-ink transition-colors"
              itemProp="headline"
            >
              PressTemps
            </h1>
            <p 
              className="mt-2 text-ink-light font-inter text-sm tracking-wider"
              itemProp="description"
            >
              YOUR SOURCE FOR LATEST NEWS
            </p>
          </button>
        </div>
        <nav 
          className="py-4 border-y border-paper-dark"
          role="navigation"
          aria-label="Main navigation"
        >
          <ul className="flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12">
            {categories.map((category) => (
              <li key={category.slug}>
                <button
                  onClick={() => onCategoryChange(category.slug)}
                  className={`font-inter text-sm md:text-base uppercase tracking-wide transition-all
                    ${activeCategory === category.slug 
                      ? 'text-blue-600 font-medium' 
                      : 'text-ink-light hover:text-ink-dark hover:font-bold'}
                    relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 
                    after:bg-blue-600 after:transform after:scale-x-0 hover:after:scale-x-100 
                    after:transition-transform after:duration-300 after:origin-left pb-1`}
                  aria-current={activeCategory === category.slug ? 'page' : undefined}
                  aria-label={`View ${category.name} news`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
