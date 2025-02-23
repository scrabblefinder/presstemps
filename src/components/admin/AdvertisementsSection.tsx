
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Advertisement {
  id: number;
  title: string;
  excerpt: string | null;
  image_url: string;
  source_text: string;
  is_active: boolean;
}

export const AdvertisementsSection = () => {
  const { toast } = useToast();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [newAd, setNewAd] = useState({
    title: '',
    excerpt: '',
    image_url: '',
    source_text: '',
  });

  const loadAds = async () => {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading advertisements",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setAds(data || []);
  };

  const createAd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('advertisements')
      .insert([newAd]);

    if (error) {
      toast({
        title: "Error creating advertisement",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Advertisement created",
      description: "The advertisement has been created successfully."
    });

    setNewAd({
      title: '',
      excerpt: '',
      image_url: '',
      source_text: '',
    });
    loadAds();
  };

  const toggleAdStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('advertisements')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error updating advertisement",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    loadAds();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Advertisements</h2>
      
      <form onSubmit={createAd} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold">Create New Advertisement</h3>
        <div className="space-y-2">
          <Input
            placeholder="Title"
            value={newAd.title}
            onChange={e => setNewAd(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Textarea
            placeholder="Excerpt"
            value={newAd.excerpt}
            onChange={e => setNewAd(prev => ({ ...prev, excerpt: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Image URL"
            value={newAd.image_url}
            onChange={e => setNewAd(prev => ({ ...prev, image_url: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Source Text (e.g., 'Sponsored by TechCorp')"
            value={newAd.source_text}
            onChange={e => setNewAd(prev => ({ ...prev, source_text: e.target.value }))}
            required
          />
        </div>
        <Button type="submit">Create Advertisement</Button>
      </form>

      <div className="space-y-4">
        {ads.map(ad => (
          <div key={ad.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{ad.title}</h3>
                <p className="text-sm text-gray-600">{ad.excerpt}</p>
                <p className="text-sm text-gray-500 mt-2">Source: {ad.source_text}</p>
              </div>
              <Button
                variant={ad.is_active ? "destructive" : "default"}
                onClick={() => toggleAdStatus(ad.id, ad.is_active)}
              >
                {ad.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
