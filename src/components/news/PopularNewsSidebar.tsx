
import React from 'react';
import { Flame, Link as LinkIcon } from 'lucide-react';
import { RSSArticle, Advertisement } from '@/utils/types/rssTypes';
import { useAdvertisements } from '@/hooks/useAdvertisements';

interface PopularNewsSidebarProps {
  articles: RSSArticle[];
}

export const PopularNewsSidebar = ({ articles }: PopularNewsSidebarProps) => {
  const { data: advertisements = [] } = useAdvertisements('text');
  const activeAds = advertisements.filter((ad): ad is Advertisement => 
    ad.is_active === true
  ).slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4 text-ink-dark flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Most Popular
        </h2>
        <div className="space-y-4">
          {articles.map((article, index) => (
            <a
              key={article.url}
              href={article.url}
              className="group flex gap-3 items-start hover:bg-gray-50 p-2 rounded-lg transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="text-2xl font-bold text-gray-300 group-hover:text-blue-500 transition-colors">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <h3 className="text-sm text-ink-light group-hover:text-ink-dark group-hover:font-bold transition-all line-clamp-2">
                {article.title}
              </h3>
            </a>
          ))}
        </div>
      </div>

      {activeAds.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-ink-dark flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-[#9b87f5]" />
            Sponsored Links
          </h2>
          <div className="bg-[#F1F0FB] rounded-lg p-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {activeAds.map((ad) => (
                <a
                  key={ad.id}
                  href={ad.url || '#'}
                  className="block text-sm bg-[#E5DEFF] px-3 py-2 rounded hover:bg-[#D6BCFA] text-[#8E9196] hover:text-ink-dark transition-colors line-clamp-2"
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  title={ad.title}
                >
                  {ad.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
