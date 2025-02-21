
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from "@/pages/AdminDashboard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Index from "@/pages/Index";
import CategoryPage from "@/pages/CategoryPage";
import { ArticlePage } from "@/pages/ArticlePage";
import NotFound from "@/pages/NotFound";
import { Auth } from "@/pages/Auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCategoryChange = (category: string) => {
    console.log('Category changed:', category);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-paper-light">
        <Header onCategoryChange={handleCategoryChange} activeCategory="all" />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route 
            path="/admin" 
            element={
              session ? <AdminDashboard /> : <Navigate to="/auth" />
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
