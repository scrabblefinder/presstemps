
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";

// Temporary mock data - will be replaced with RSS feed data
const mockArticles = [
  {
    title: "The Future of AI in Healthcare",
    excerpt: "Artificial Intelligence is revolutionizing healthcare with breakthrough innovations in diagnosis and treatment...",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800",
    category: "Tech",
    source: "TechCrunch",
    date: "2024-03-10",
    url: "/article/1",
  },
  {
    title: "Global Markets React to Economic Changes",
    excerpt: "Markets worldwide show resilience as central banks adjust policies...",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800",
    category: "Business",
    source: "Reuters",
    date: "2024-03-10",
    url: "/article/2",
  },
  {
    title: "New Discoveries in Space Exploration",
    excerpt: "NASA's latest mission reveals unprecedented findings about distant galaxies...",
    image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=800",
    category: "Science",
    source: "Space.com",
    date: "2024-03-10",
    url: "/article/3",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-paper-light flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-playfair text-2xl font-semibold text-ink-dark">
              Featured Stories
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockArticles.map((article, index) => (
              <ArticleCard key={index} {...article} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
