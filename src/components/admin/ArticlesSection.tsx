
import { Article } from '@/utils/dbUtils';
import { ArticleCard } from './ArticleCard';

interface ArticlesSectionProps {
  articles: Article[];
  onDeleteArticle: (id: number) => void;
}

export const ArticlesSection = ({ articles, onDeleteArticle }: ArticlesSectionProps) => {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Articles</h2>
      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onDelete={onDeleteArticle}
          />
        ))}
      </div>
    </section>
  );
};
