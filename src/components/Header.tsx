
const categories = [
  { name: "All", slug: "all" },
  { name: "Tech", slug: "tech" },
  { name: "World", slug: "world" },
  { name: "Business", slug: "business" },
  { name: "Science", slug: "science" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Sports", slug: "sports" }
];

interface HeaderProps {
  onCategoryChange: (category: string) => void;
  activeCategory: string;
}

export function Header({ onCategoryChange, activeCategory }: HeaderProps) {
  return (
    <header className="w-full bg-paper-light border-b border-paper-dark">
      <div className="container mx-auto px-4">
        <div className="py-8">
          <button 
            onClick={() => onCategoryChange('all')}
            className="block text-center w-full"
          >
            <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold text-ink-dark hover:text-ink transition-colors">
              PressTemps
            </h1>
            <p className="mt-2 text-ink-light font-inter text-sm tracking-wider">
              YOUR SOURCE FOR LATEST NEWS
            </p>
          </button>
        </div>
        <nav className="py-4 border-y border-paper-dark">
          <ul className="flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12">
            {categories.map((category) => (
              <li key={category.slug}>
                <button
                  onClick={() => onCategoryChange(category.slug)}
                  className={`font-inter text-sm md:text-base uppercase tracking-wide transition-colors ${
                    activeCategory === category.slug 
                    ? 'text-blue-600 font-medium' 
                    : 'text-ink-light hover:text-ink-dark'
                  }`}
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
