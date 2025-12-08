import { Sofa, Sparkles, Lightbulb, Zap } from 'lucide-react';

// Default icon mapping for top-level categories
const iconMap = {
  Furniture: Sofa,
  Decor: Sparkles,
  Lighting: Lightbulb,
  Default: Zap, // Fallback icon
};

/**
 * Builds a nested tree from a flat list of categories.
 * @param {Array} categories - The raw array of category objects from the API.
 * @returns {Array} - A nested array of top-level category objects.
 */
const buildTree = (categories) => {
  const categoryMap = new Map();
  // Clone categories and initialize a 'children' array
  categories.forEach(cat => {
    categoryMap.set(cat._id, { ...cat, children: [] });
  });

  const tree = [];
  categoryMap.forEach(catNode => {
    // Note: The parent object from your API might just be an ID string or an object with an _id.
    // We need to handle both cases to find the parent ID reliably.
    const parentId = catNode.parent?._id || catNode.parent;
    if (parentId && categoryMap.has(parentId)) {
      const parentNode = categoryMap.get(parentId);
      parentNode.children.push(catNode);
    } else if (catNode.level === 1 && catNode.includeInMenu) {
      // Level 1 categories are the main triggers in the nav bar
      tree.push(catNode);
    }
  });

  return tree;
};

/**
 * Transforms the category tree into a structured format for the MegaMenu component.
 * @param {Array} categories - The raw category array from the API.
 * @returns {Object} - A structured object where keys are top-level category names.
 */
export const buildMegaMenuData = (categories) => {
  const categoryTree = buildTree(categories);
  const megaMenuContent = {};

  for (const topCat of categoryTree) {
    let featuredItem = null;

    // Level 2 children become columns.
    // Apply the .slice(0, 5) here to limit to 5 columns.
    const columns = topCat.children
      .filter(colCat => colCat.includeInMenu)
      .sort((a, b) => a.position - b.position)
      .slice(0, 5) // <-- KEY CHANGE: Limit to a maximum of 5 columns
      .map(colCat => {
        // Find a featured item from this column's children
        if (!featuredItem) {
          const firstChildWithImage = colCat.children.find(linkCat => linkCat.image);
          if (firstChildWithImage) {
            featuredItem = {
              title: firstChildWithImage.name,
              description: firstChildWithImage.metaDescription?.split('—')[1]?.trim() || 'Discover our collection.',
              href: `/${firstChildWithImage.slug}`,
              image: firstChildWithImage.image,
            };
          }
        }
        
        // Level 3+ children become the links for this column
        return {
          heading: colCat.name,
          href: `/${colCat.slug}`,
          links: colCat.children
            .filter(linkCat => linkCat.includeInMenu)
            .sort((a, b) => a.position - b.position) // Correct sort function
            .map(linkCat => ({
              title: linkCat.name,
              description: linkCat.metaDescription?.split('—')[1]?.trim() || `Explore ${linkCat.name}`,
              href: `/${linkCat.slug}`,
            })),
        };
      });

    // Fallback featured item using the top-level category's data
    if (!featuredItem && topCat.image) {
        featuredItem = {
            title: `Explore All ${topCat.name}`,
            description: topCat.metaDescription?.split('|')[0]?.trim() || 'A wide range of quality products.',
            href: `/${topCat.slug}`,
            image: topCat.image,
        };
    }

    megaMenuContent[topCat.name] = {
      icon: iconMap[topCat.name] || iconMap.Default,
      columns: columns,
      featured: featuredItem,
    };
  }

  return megaMenuContent;
};

/**
 * Extracts the primary navigation links for the top bar and mobile menu.
 * @param {Array} categories - The raw category array from the API.
 * @returns {Array} - A simple array of top-level navigation links.
 */
export const getTopLevelNav = (categories) => {
    return categories
        .filter(cat => cat.level === 1 && cat.includeInMenu)
        .sort((a, b) => a.position - b.position)
        .map(cat => ({
            name: cat.name,
            href: `/${cat.slug}`,
            icon: iconMap[cat.name] || iconMap.Default,
        }));
};
