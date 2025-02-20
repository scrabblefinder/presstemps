
import { Link } from "react-router-dom";

const categories = [
  { name: "Home", path: "/" },
  { name: "Latest News", path: "/latest" },
  { name: "Tech", path: "/tech" },
  { name: "Sports", path: "/sports" },
  { name: "Entertainment", path: "/entertainment" },
  { name: "Lifestyle", path: "/lifestyle" },
  { name: "Business", path: "/business" },
];

export function Header() {
  return (
    <header className="w-full bg-paper-light border-b border-paper-dark">
      <div className="container mx-auto px-4">
        <div className="py-8">
          <Link to="/" className="block text-center">
            <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold text-ink-dark hover:text-ink transition-colors">
              PressTemps
            </h1>
            <p className="mt-2 text-ink-light font-inter text-sm tracking-wider">
              YOUR SOURCE FOR LATEST NEWS
            </p>
          </Link>
        </div>
        <nav className="py-4 border-y border-paper-dark">
          <ul className="flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12">
            {categories.map((category) => (
              <li key={category.path}>
                <Link
                  to={category.path}
                  className="font-inter text-ink-light hover:text-ink-dark transition-colors text-sm md:text-base uppercase tracking-wide"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
