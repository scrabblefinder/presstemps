import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ArticlePage() {
  // Placeholder for article page - using 'all' as default category
  const handleCategoryChange = (category: string) => {
    // We'll implement this later if needed for article page
    console.log('Category changed:', category);
  };

  return (
    <div className="min-h-screen bg-paper-light">
      <Header onCategoryChange={handleCategoryChange} activeCategory="all" />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1>Article Page</h1>
          <p>Coming soon...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
