
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdFormProps } from "../types/advertisementTypes";

export const ImageAdForm = ({ newAd, setNewAd, onSubmit }: AdFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold">Create New Image Advertisement</h3>
      <Input
        placeholder="Title"
        value={newAd.title}
        onChange={e => setNewAd({ ...newAd, title: e.target.value, type: 'image' })}
        required
      />
      <Textarea
        placeholder="Excerpt"
        value={newAd.excerpt || ''}
        onChange={e => setNewAd({ ...newAd, excerpt: e.target.value })}
        required
      />
      <Input
        placeholder="Image URL"
        value={newAd.image_url}
        onChange={e => setNewAd({ ...newAd, image_url: e.target.value })}
        required
      />
      <Input
        placeholder="Advertisement URL"
        value={newAd.url || ''}
        onChange={e => setNewAd({ ...newAd, url: e.target.value })}
        required
      />
      <Input
        placeholder="Source Text (e.g., 'Sponsored by TechCorp')"
        value={newAd.source_text}
        onChange={e => setNewAd({ ...newAd, source_text: e.target.value })}
        required
      />
      <Button type="submit">Create Image Advertisement</Button>
    </form>
  );
};
