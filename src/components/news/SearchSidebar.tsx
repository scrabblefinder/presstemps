
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { RSSArticle } from '@/utils/types/rssTypes';

interface SearchSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchSidebar = ({ 
  searchQuery, 
  onSearchChange 
}: SearchSidebarProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4 text-ink-dark">Search Articles</h2>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-ink-light" />
      </div>
    </div>
  );
};
