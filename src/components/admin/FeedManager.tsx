
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Feed {
  id: number;
  name: string;
  url: string;
}

interface FeedManagerProps {
  categoryId: number;
  categoryName: string;
  feeds: Feed[];
  onFeedsUpdate: () => void;
}

export const FeedManager = ({ categoryId, categoryName, feeds, onFeedsUpdate }: FeedManagerProps) => {
  const { toast } = useToast();
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feeds')
        .insert({
          category_id: categoryId,
          name: newFeedName,
          url: newFeedUrl
        });

      if (error) throw error;

      setNewFeedName('');
      setNewFeedUrl('');
      onFeedsUpdate();
      
      toast({
        title: "Feed added successfully",
        description: `Added ${newFeedName} to ${categoryName}`,
      });
    } catch (error) {
      console.error('Error adding feed:', error);
      toast({
        title: "Error adding feed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeed = async (feedId: number, feedName: string) => {
    try {
      const { error } = await supabase
        .from('feeds')
        .delete()
        .eq('id', feedId);

      if (error) throw error;

      onFeedsUpdate();
      
      toast({
        title: "Feed removed successfully",
        description: `Removed ${feedName} from ${categoryName}`,
      });
    } catch (error) {
      console.error('Error removing feed:', error);
      toast({
        title: "Error removing feed",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Current Feeds</h4>
        {feeds.length === 0 ? (
          <p className="text-sm text-muted-foreground">No feeds configured</p>
        ) : (
          <ul className="space-y-2">
            {feeds.map((feed) => (
              <li key={feed.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                <div>
                  <p className="font-medium">{feed.name}</p>
                  <p className="text-sm text-muted-foreground">{feed.url}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteFeed(feed.id, feed.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleAddFeed} className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Add New Feed</h4>
          <div className="grid gap-2">
            <Input
              placeholder="Feed Name"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
              required
            />
            <Input
              placeholder="Feed URL"
              type="url"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          Add Feed
        </Button>
      </form>
    </div>
  );
};
