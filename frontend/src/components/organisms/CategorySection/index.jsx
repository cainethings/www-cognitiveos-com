import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import CategoryCard from '@/components/molecules/CategoryCard/index.jsx';
import './categorySection.scss';

export default function CategorySection({
  title = 'Categories',
  subtitle,
  categories = [],
  className = '',
}) {
  if (!categories.length) return null;

  return (
    <section className={['category-section', className].filter(Boolean).join(' ')}>
      <header className="category-section__header">
        <Heading level={2}>{title}</Heading>
        {subtitle ? (
          <Text size="lg" className="category-section__subtitle">
            {subtitle}
          </Text>
        ) : null}
      </header>

      <ul className="category-section__grid" aria-label={title}>
        {categories.map((category) => (
          <li key={category.id || category.title}>
            <CategoryCard {...category} />
          </li>
        ))}
      </ul>
    </section>
  );
}

