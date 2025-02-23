
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

interface Advertisement {
  id: number;
  title: string;
  excerpt: string | null;
  image_url: string;
  source_text: string;
  is_active: boolean;
  url: string | null;
}

export const AdvertisementsSection = () => {
  const { toast } = useToast();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [newAd, setNewAd] = useState({
    title: '',
    excerpt: '',
    image_url: '',
    source_text: '',
    url: '',
  });

  useEffect(() => {
    loadAds();
  }, []);

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
      url: '', // Add this line to include url when resetting the form
    });
    loadAds();
  };

  const deleteAd = async (id: number) => {
    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting advertisement",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Advertisement deleted",
      description: "The advertisement has been deleted successfully."
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

  const updateAd = async (id: number, updatedData: Partial<Advertisement>) => {
    const { error } = await supabase
      .from('advertisements')
      .update(updatedData)
      .eq('id', id);

    if (error) {
      toast({
        title: "Error updating advertisement",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Advertisement updated",
      description: "The advertisement has been updated successfully."
    });

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
            placeholder="Advertisement URL"
            value={newAd.url}
            onChange={e => setNewAd(prev => ({ ...prev, url: e.target.value }))}
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
        <h3 className="text-lg font-semibold">All Advertisements</h3>
        {ads.map(ad => (
          <div key={ad.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1 mr-4">
                  <Input
                    value={ad.title}
                    onChange={e => updateAd(ad.id, { title: e.target.value })}
                    className="font-semibold"
                  />
                  <Textarea
                    value={ad.excerpt || ''}
                    onChange={e => updateAd(ad.id, { excerpt: e.target.value })}
                    className="text-sm text-gray-600"
                  />
                  <div className="flex gap-4">
                    <Input
                      value={ad.image_url}
                      onChange={e => updateAd(ad.id, { image_url: e.target.value })}
                      className="text-sm"
                      placeholder="Image URL"
                    />
                    <Input
                      value={ad.source_text}
                      onChange={e => updateAd(ad.id, { source_text: e.target.value })}
                      className="text-sm"
                      placeholder="Source Text"
                    />
                  </div>
                  <Input
                    value={ad.url || ''}
                    onChange={e => updateAd(ad.id, { url: e.target.value })}
                    className="text-sm"
                    placeholder="Advertisement URL"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={ad.is_active ? "destructive" : "default"}
                    onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                  >
                    {ad.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteAd(ad.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {ad.is_active && (
                <div className="text-sm text-green-600 font-medium">
                  Currently Active
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
