
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Advertisement } from '@/utils/types/rssTypes';
import { NewAdvertisement } from './types/advertisementTypes';
import { ImageAdForm } from './advertisements/ImageAdForm';
import { TextLinkForm } from './advertisements/TextLinkForm';
import { AdListItem } from './advertisements/AdListItem';

export const AdvertisementsSection = () => {
  const { toast } = useToast();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [newAd, setNewAd] = useState<NewAdvertisement>({
    title: '',
    excerpt: '',
    image_url: '',
    source_text: '',
    url: '',
    type: 'image',
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

    setAds(data as Advertisement[] || []);
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
      url: '',
      type: newAd.type,
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

  const imageAds = ads.filter(ad => ad.type === 'image');
  const textAds = ads.filter(ad => ad.type === 'text');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Advertisements</h2>
      
      <Tabs defaultValue="image" className="space-y-4">
        <TabsList>
          <TabsTrigger value="image">Image Ads</TabsTrigger>
          <TabsTrigger value="text">Text Links</TabsTrigger>
        </TabsList>

        <TabsContent value="image">
          <ImageAdForm newAd={newAd} setNewAd={setNewAd} onSubmit={createAd} />
          <div className="space-y-4 mt-6">
            {imageAds.map(ad => (
              <AdListItem
                key={ad.id}
                ad={ad}
                onDelete={deleteAd}
                onToggleStatus={toggleAdStatus}
                onUpdate={updateAd}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="text">
          <TextLinkForm newAd={newAd} setNewAd={setNewAd} onSubmit={createAd} />
          <div className="space-y-4 mt-6">
            {textAds.map(ad => (
              <AdListItem
                key={ad.id}
                ad={ad}
                onDelete={deleteAd}
                onToggleStatus={toggleAdStatus}
                onUpdate={updateAd}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
