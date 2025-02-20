
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";

// Temporary mock data - will be replaced with RSS feed data
const mockArticlesByCategory = {
  science: [
    {
      title: "New Discoveries in Space Exploration",
      excerpt: "NASA's latest mission reveals unprecedented findings about distant galaxies...",
      image_url: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=800",
      category: "Science",
      source: "Space.com",
      published_at: "2024-03-10T00:00:00.000Z",
      url: "/science/new-discoveries-in-space-exploration",
    },
    {
      title: "Breakthrough in Quantum Computing",
      excerpt: "Scientists achieve major milestone in quantum computing research...",
      image_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800",
      category: "Science",
      source: "Nature",
      published_at: "2024-03-10T00:00:00.000Z",
      url: "/science/breakthrough-in-quantum-computing",
    },
  ],
  tech: [
    {
      title: "The Future of AI in Healthcare",
      excerpt: "Artificial Intelligence is revolutionizing healthcare with breakthrough innovations in diagnosis and treatment...",
      image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800",
      category: "Tech",
      source: "TechCrunch",
      published_at: "2024-03-10T00:00:00.000Z",
      url: "/tech/the-future-of-ai-in-healthcare",
    },
  ],
  business: [
    {
      title: "Global Markets React to Economic Changes",
      excerpt: "Markets worldwide show resilience as central banks adjust policies...",
      image_url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800",
      category: "Business",
      source: "Reuters",
      published_at: "2024-03-10T00:00:00.000Z",
      url: "/business/global-markets-react-to-economic-changes",
    },
  ],
};

const categoryTitles: { [key: string]: string } = {
  latest: "Latest News",
  tech: "Technology",
  sports: "Sports",
  entertainment: "Entertainment",
  lifestyle: "Lifestyle",
  business: "Business",
  science: "Science",
};

export default function CategoryPage() {
  const { category = "latest" } = useParams<{ category: string }>();
  const articles = mockArticlesByCategory[category as keyof typeof mockArticlesByCategory] || [];
  const title = categoryTitles[category] || "Latest News";

  return (
    <div className="min-h-screen bg-paper-light flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-playfair text-2xl font-semibold text-ink-dark">
              {title}
            </h2>
          </div>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <ArticleCard
                  key={index}
                  title={article.title}
                  excerpt={article.excerpt}
                  image_url={article.image_url}
                  category={article.category}
                  source={article.source}
                  published_at={article.published_at}
                  url={article.url}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-ink-light">No articles found in this category.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
