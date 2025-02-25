
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdFormProps } from "../types/advertisementTypes";

export const TextLinkForm = ({ newAd, setNewAd, onSubmit }: AdFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold">Create New Text Link</h3>
      <Input
        placeholder="Link Text"
        value={newAd.title}
        onChange={e => setNewAd({ ...newAd, title: e.target.value, type: 'text' })}
        required
      />
      <Input
        placeholder="Link URL"
        value={newAd.url || ''}
        onChange={e => setNewAd({ ...newAd, url: e.target.value })}
        required
      />
      <Button type="submit">Create Text Link</Button>
    </form>
  );
};
