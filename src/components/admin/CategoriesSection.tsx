
import { CategoryCard } from './CategoryCard';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoriesSectionProps {
  categories: Category[];
  onRefreshSource: (slug: string) => void;
  refreshingSource: string | null;
}

export const CategoriesSection = ({ categories, onRefreshSource, refreshingSource }: CategoriesSectionProps) => {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Categories and Sources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            {...category}
            onRefresh={onRefreshSource}
            isRefreshing={refreshingSource === category.slug}
          />
        ))}
      </div>
    </section>
  );
};
