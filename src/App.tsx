
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminDashboard } from "@/pages/AdminDashboard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Index from "@/pages/Index";
import CategoryPage from "@/pages/CategoryPage";
import { ArticlePage } from "@/pages/ArticlePage";
import NotFound from "@/pages/NotFound";
import { AuthPage } from "@/pages/AuthPage";
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    // Set viewport meta tag for responsive design
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewportMeta);
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (event === 'SIGNED_OUT') {
        // Handle sign out if needed
      }
    });

    setIsInitialized(true);

    return () => {
      subscription.unsubscribe();
      document.head.removeChild(viewportMeta);
    };
  }, []);

  const handleCategoryChange = (category: string) => {
    console.log('Category changed:', category);
    setActiveCategory(category);
    
    // Scroll to top when changing categories on mobile
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <Router>
      <div className="min-h-screen bg-paper-light flex flex-col">
        <Header onCategoryChange={handleCategoryChange} activeCategory={activeCategory} />
        <Routes>
          <Route path="/" element={<Index selectedCategory={activeCategory} />} />
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
