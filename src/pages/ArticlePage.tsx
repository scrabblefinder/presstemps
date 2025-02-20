
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";

// Temporary mock article data - will be replaced with RSS feed data
const mockArticles = {
  "tech/the-future-of-ai-in-healthcare": {
    title: "The Future of AI in Healthcare",
    content: `Artificial Intelligence is revolutionizing healthcare with breakthrough innovations in diagnosis and treatment. The integration of AI technologies in healthcare systems worldwide is showing promising results in improving patient care and medical research.

    Recent studies have demonstrated that AI algorithms can detect diseases at early stages with remarkable accuracy, sometimes outperforming human experts. From analyzing medical imaging to predicting patient outcomes, AI is becoming an invaluable tool in modern medicine.

    However, experts emphasize that AI should complement, not replace, healthcare professionals. The human element in healthcare remains crucial, with AI serving as a powerful tool to enhance decision-making and improve efficiency.`,
    excerpt: "Artificial Intelligence is revolutionizing healthcare with breakthrough innovations in diagnosis and treatment...",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800",
    category: "Tech",
    source: "TechCrunch",
    date: "2024-03-10",
    author: "Sarah Johnson",
  },
  "business/global-markets-react-to-economic-changes": {
    title: "Global Markets React to Economic Changes",
    content: `Markets worldwide show resilience as central banks adjust policies. The global financial landscape continues to evolve as major economies implement strategic changes to combat inflation and promote sustainable growth.

    Investors are closely monitoring these developments, with particular attention to emerging markets and technological sectors. The interconnected nature of modern markets means that policy changes in one region can have far-reaching effects globally.

    Analysts suggest maintaining a diversified portfolio while keeping an eye on key economic indicators that could signal major market shifts.`,
    excerpt: "Markets worldwide show resilience as central banks adjust policies...",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800",
    category: "Business",
    source: "Reuters",
    date: "2024-03-10",
    author: "Michael Chang",
  },
  "science/new-discoveries-in-space-exploration": {
    title: "New Discoveries in Space Exploration",
    content: `NASA's latest mission reveals unprecedented findings about distant galaxies. The groundbreaking discoveries are reshaping our understanding of the universe and its formation.

    Using advanced telescopes and sophisticated analysis techniques, scientists have identified several previously unknown celestial bodies that could potentially harbor conditions suitable for life.

    These findings open new avenues for research and raise intriguing questions about our place in the cosmos. The international space community is already planning follow-up missions to investigate these discoveries further.`,
    excerpt: "NASA's latest mission reveals unprecedented findings about distant galaxies...",
    image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=800",
    category: "Science",
    source: "Space.com",
    date: "2024-03-10",
    author: "Dr. Elena Rodriguez",
  },
};

// Helper function to get related articles based on category
const getRelatedArticles = (currentSlug: string, category: string) => {
  return Object.entries(mockArticles)
    .filter(([slug, article]) => 
      article.category.toLowerCase() === category.toLowerCase() && 
      slug !== currentSlug
    )
    .map(([slug, article]) => ({
      title: article.title,
      excerpt: article.excerpt,
      image: article.image,
      category: article.category,
      source: article.source,
      date: article.date,
      url: `/${category.toLowerCase()}/${slug.split('/')[1]}`,
    }))
    .slice(0, 3);
};

export default function ArticlePage() {
  const { category = "", slug = "" } = useParams<{ category: string; slug: string }>();
  const fullSlug = `${category}/${slug}`;
  const article = mockArticles[fullSlug as keyof typeof mockArticles];
  const relatedArticles = getRelatedArticles(fullSlug, category);

  if (!article) {
    return (
      <div className="min-h-screen bg-paper-light flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center py-12">
            <h1 className="text-2xl font-playfair text-ink-dark">Article not found</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-light flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="mb-4">
              <span className="text-sm font-medium text-ink-light">
                {article.category}
              </span>
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-ink-dark mb-4">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-ink-light">
              <span>{article.author}</span>
              <span>•</span>
              <span>{article.date}</span>
              <span>•</span>
              <span>{article.source}</span>
            </div>
          </header>

          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-[400px] object-cover"
            />
          </div>

          <div className="prose prose-lg max-w-none">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-ink-light leading-relaxed">
                {paragraph.trim()}
              </p>
            ))}
          </div>
        </article>

        {relatedArticles.length > 0 && (
          <section className="mt-16">
            <h2 className="font-playfair text-2xl font-semibold text-ink-dark mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((article, index) => (
                <ArticleCard key={index} {...article} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
