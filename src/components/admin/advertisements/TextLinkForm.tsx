
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdFormProps } from "../types/advertisementTypes";

export const TextLinkForm = ({ newAd, setNewAd, onSubmit }: AdFormProps) => {
  // Set the type to 'text' when the component mounts
  React.useEffect(() => {
    if (newAd.type !== 'text') {
      setNewAd({ ...newAd, type: 'text' });
    }
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAd({ ...newAd, title: e.target.value, type: 'text' });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAd({ ...newAd, url: e.target.value, type: 'text' });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold">Create New Text Link</h3>
      <Input
        placeholder="Link Text"
        value={newAd.title}
        onChange={handleTitleChange}
        required
      />
      <Input
        placeholder="Link URL"
        value={newAd.url || ''}
        onChange={handleUrlChange}
        required
      />
      <Button type="submit">Create Text Link</Button>
    </form>
  );
};
