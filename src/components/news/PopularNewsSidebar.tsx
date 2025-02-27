
import React, { useState, useEffect } from 'react';
import { Flame, Link as LinkIcon } from 'lucide-react';
import { RSSArticle, Advertisement } from '@/utils/types/rssTypes';
import { useAdvertisements } from '@/hooks/useAdvertisements';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PopularNewsSidebarProps {
  articles: RSSArticle[];
}

// Define the correct interface for external links based on the API response structure
interface ExternalLinkItem {
  position: string;
  display_on: string;
  custom_slug?: string;
  links: string;
  is_active: boolean;
}

export const PopularNewsSidebar = ({ articles }: PopularNewsSidebarProps) => {
  const { data: advertisements = [] } = useAdvertisements('text');
  const [externalLinks, setExternalLinks] = useState<ExternalLinkItem[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [externalLinksError, setExternalLinksError] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  
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
        setExternalLinksError(false);
        
        // For testing, use presstemps.com instead of the current origin
        const siteUrl = "https://presstemps.com";
        const cacheKey = `backlink_cache_${btoa(siteUrl)}`;
        
        // Clear cache for testing purposes
        localStorage.removeItem(cacheKey);
        console.log('Cleared cache for external links to force fresh fetch');
        
        // Fetch fresh data
        const apiUrl = `https://watchtower.beteks.com/api/v1/watch-tower/link-mng-payload?site=${encodeURIComponent(siteUrl)}`;
        console.log('Fetching external links from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API response data:', data);
          
          // Cache the result
          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            content: data
          }));
          
          setExternalLinks(data);
          console.log('Successfully fetched external links, count:', data.length);
        } else {
          console.error('Failed to fetch external links:', response.status);
          // Try to get response text for more details
          try {
            const errorText = await response.text();
            console.error('Error response text:', errorText);
          } catch (textError) {
            console.error('Could not get error response text');
          }
          
          setExternalLinksError(true);
          throw new Error(`API responded with status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching external links:', error);
        setExternalLinksError(true);
        
        // Show toast notification about the error
        toast({
          title: "Error fetching external links",
          description: "Using internal links instead",
          variant: "destructive",
        });
      } finally {
        setIsLoadingLinks(false);
      }
    };

    fetchExternalLinks();
  }, [location.pathname, toast]); // Added toast to dependencies

  // Filter external links based on position and display rules
  const filterExternalLinks = (position: string = 'sidebar') => {
    if (!externalLinks || externalLinks.length === 0 || externalLinksError) {
      console.log('No external links available or there was an error');
      return [];
    }
    
    console.log('Filtering external links for position:', position);
    console.log('Total external links before filtering:', externalLinks.length);
    
    const filtered = externalLinks.filter(link => {
      // Check if the link is active
      if (!link.is_active) {
        return false;
      }
      
      // Check if we should display on this page
      if (link.display_on === 'homepage' && !isHomePage()) {
        return false;
      }

      // Check if we have a custom slug requirement
      if (link.custom_slug && !matchesSlug(link.custom_slug)) {
        return false;
      }

      // Check position match
      if (link.position !== position) {
        return false;
      }

      return true;
    });
    
    console.log('Filtered external links for position:', position, 'count:', filtered.length);
    return filtered;
  };

  const filteredSidebarLinks = filterExternalLinks('sidebar');
  console.log('Filtered sidebar links count:', filteredSidebarLinks.length);
  
  // For debugging
  useEffect(() => {
    console.log('Current location pathname:', location.pathname);
    console.log('Is homepage?', isHomePage());
  }, [location.pathname]);

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

      {filteredSidebarLinks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-ink-dark flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-gray-400" />
            Sponsored Links (External)
          </h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-100">
              {filteredSidebarLinks.map((link, index) => (
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

      {activeAds.length > 0 && (filteredSidebarLinks.length === 0 || externalLinksError) && (
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
