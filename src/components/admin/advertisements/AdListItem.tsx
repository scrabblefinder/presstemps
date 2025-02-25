
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { Advertisement } from "@/utils/types/rssTypes";

interface AdListItemProps {
  ad: Advertisement;
  onDelete: (id: number) => Promise<void>;
  onToggleStatus: (id: number, currentStatus: boolean) => Promise<void>;
  onUpdate: (id: number, updatedData: Partial<Advertisement>) => Promise<void>;
}

export const AdListItem = ({ ad, onDelete, onToggleStatus, onUpdate }: AdListItemProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1 mr-4">
            <Input
              value={ad.title}
              onChange={e => onUpdate(ad.id, { title: e.target.value })}
              className="font-semibold"
              placeholder={ad.type === 'text' ? "Link Text" : "Title"}
            />
            {ad.type === 'image' && (
              <>
                <Textarea
                  value={ad.excerpt || ''}
                  onChange={e => onUpdate(ad.id, { excerpt: e.target.value })}
                  className="text-sm text-gray-600"
                />
                <div className="flex gap-4">
                  <Input
                    value={ad.image_url}
                    onChange={e => onUpdate(ad.id, { image_url: e.target.value })}
                    className="text-sm"
                    placeholder="Image URL"
                  />
                  <Input
                    value={ad.source_text}
                    onChange={e => onUpdate(ad.id, { source_text: e.target.value })}
                    className="text-sm"
                    placeholder="Source Text"
                  />
                </div>
              </>
            )}
            <Input
              value={ad.url || ''}
              onChange={e => onUpdate(ad.id, { url: e.target.value })}
              className="text-sm"
              placeholder="Advertisement URL"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant={ad.is_active ? "destructive" : "default"}
              onClick={() => onToggleStatus(ad.id, !!ad.is_active)}
            >
              {ad.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(ad.id)}
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
  );
};
