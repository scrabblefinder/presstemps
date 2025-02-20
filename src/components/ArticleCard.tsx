
import { Link } from "react-router-dom";

interface ArticleCardProps {
  title: string;
  excerpt: string;
  image_url: string;
  category: string;
  source: string | null;
  published_at: string | null;
  url: string;
}

export function ArticleCard({
  title,
  excerpt,
  image_url,
  category,
  source,
  published_at,
  url,
}: ArticleCardProps) {
  return (
    <article className="group bg-white border border-paper-dark/10 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-fade-up">
      <Link to={url} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-paper-dark/80 backdrop-blur-sm text-ink-dark text-xs font-medium rounded-full">
              {category}
            </span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-playfair text-xl font-semibold text-ink-dark group-hover:text-ink transition-colors mb-2">
            {title}
          </h3>
          <p className="text-ink-light text-sm line-clamp-2 mb-4">{excerpt}</p>
          <div className="flex items-center justify-between text-xs text-ink-light">
            <span>{source}</span>
            <span>{published_at ? new Date(published_at).toLocaleDateString() : ''}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
