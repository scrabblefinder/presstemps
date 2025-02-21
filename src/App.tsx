
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminDashboard } from "@/pages/AdminDashboard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Index from "@/pages/Index";
import CategoryPage from "@/pages/CategoryPage";
import { ArticlePage } from "@/pages/ArticlePage";
import NotFound from "@/pages/NotFound";
import { AuthPage } from "@/pages/AuthPage";

function App() {
  const handleCategoryChange = (category: string) => {
    console.log('Category changed:', category);
    // We'll implement this later if needed at the app level
  };

  return (
    <Router>
      <div className="min-h-screen bg-paper-light">
        <Header onCategoryChange={handleCategoryChange} activeCategory="all" />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
