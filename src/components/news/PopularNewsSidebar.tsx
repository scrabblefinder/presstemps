
import React, { useState, useEffect } from 'react';
import { Flame, Link as LinkIcon } from 'lucide-react';
import { RSSArticle, Advertisement } from '@/utils/types/rssTypes';
import { useAdvertisements } from '@/hooks/useAdvertisements';
import { useLocation } from 'react-router-dom';

interface PopularNewsSidebarProps {
  articles: RSSArticle[];
}

interface ExternalLink {
  title: string;
  url: string;
  isActive: boolean;
}

export const PopularNewsSidebar = ({ articles }: PopularNewsSidebarProps) => {
  const { data: advertisements = [] } = useAdvertisements('text');
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const location = useLocation();
  
  const activeAds = advertisements.filter((ad): ad is Advertisement => 
    ad.is_active === true
  ).slice(0, 8);

  // Function to determine if we're on the homepage
  const isHomePage = () => {
    return location.pathname === '/' || location.pathname === '/index.html';
  };

  // Function to check if current URL contains a specific slug
  const matchesSlug = (slug: string) => {
    return location.pathname.includes(slug);
  };

  useEffect(() => {
    const fetchExternalLinks = async () => {
      try {
        setIsLoadingLinks(true);
        
        // Construct the site URL similar to the PHP version
        const siteUrl = window.location.origin;
        const cacheKey = `backlink_cache_${btoa(siteUrl)}`;
        
        // Check if we have cached data that's not expired
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const { timestamp, content } = JSON.parse(cachedData);
          // Check if cache is still valid (15 minutes)
          if (timestamp && Date.now() - timestamp < 900000) {
            console.log('Using cached external links data');
            setExternalLinks(content);
            setIsLoadingLinks(false);
            return;
          }
        }
        
        // Fetch fresh data
        const apiUrl = `https://watchtower.beteks.com/api/v1/watch-tower/link-mng-payload?site=${encodeURIComponent(siteUrl)}`;
        console.log('Fetching external links from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Cache the result
          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            content: data
          }));
          
          setExternalLinks(data);
          console.log('Successfully fetched external links');
        } else {
          console.error('Failed to fetch external links:', response.status);
        }
      } catch (error) {
        console.error('Error fetching external links:', error);
      } finally {
        setIsLoadingLinks(false);
      }
    };

    fetchExternalLinks();
  }, [location.pathname]); // Refetch when route changes

  // Filter external links based on position and display rules
  const filterExternalLinks = () => {
    if (!externalLinks || externalLinks.length === 0) return [];
    
    return externalLinks.filter(link => {
      // Check if we should display on this page
      if (link.display_on === 'homepage' && !isHomePage()) {
        return false;
      }

      // Check if we have a custom slug requirement
      if (link.custom_slug && !matchesSlug(link.custom_slug)) {
        return false;
      }

      // Check position match (assuming 'sidebar' is our position)
      if (link.position !== 'sidebar') {
        return false;
      }

      return true;
    });
  };

  const filteredExternalLinks = filterExternalLinks();

  // Function to safely render HTML content
  const renderHTML = (htmlContent: string) => {
    return { __html: htmlContent };
  };

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

      {filteredExternalLinks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-ink-dark flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-gray-400" />
            Sponsored Links
          </h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-100">
              {filteredExternalLinks.map((link, index) => (
                <div 
                  key={index}
                  className="text-sm text-ink-light hover:bg-gray-50 px-4 py-3 transition-colors"
                  dangerouslySetInnerHTML={renderHTML(link.links)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeAds.length > 0 && filteredExternalLinks.length === 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-ink-dark flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-gray-400" />
            Sponsored Links
          </h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-100">
              {activeAds.map((ad) => (
                <a
                  key={ad.id}
                  href={ad.url || '#'}
                  className="group block text-sm text-ink-light hover:bg-gray-50 px-4 py-3 transition-colors"
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  title={ad.title}
                >
                  <span className="group-hover:text-ink-dark group-hover:font-bold group-hover:underline transition-all">
                    {ad.title}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
