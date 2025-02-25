
import { Advertisement } from "@/utils/types/rssTypes";

export type NewAdvertisement = Omit<Advertisement, 'id' | 'is_active' | 'created_at'>;

export interface AdFormProps {
  newAd: NewAdvertisement;
  setNewAd: (ad: NewAdvertisement) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface AdListProps {
  ads: Advertisement[];
  onDelete: (id: number) => Promise<void>;
  onToggleStatus: (id: number, currentStatus: boolean) => Promise<void>;
  onUpdate: (id: number, updatedData: Partial<Advertisement>) => Promise<void>;
}
