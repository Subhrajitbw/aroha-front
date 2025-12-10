// src/hooks/useNavigationData.js
import { useState, useEffect } from "react";
import { sdk } from "../lib/medusaClient";
import { sanityClient } from "../lib/sanityClient";

export const useNavigationData = () => {
  const [navItems, setNavItems] = useState([]);
  const [megaMenuContent, setMegaMenuContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNavigationData = async () => {
      try {
        const { product_categories } = await sdk.store.category.list({
          limit: 1000,
        });

        const categoriesByHandle = new Map(
          (product_categories || []).map((cat) => [cat.handle, cat])
        );

        let navConfig = null;
        try {
          navConfig = await sanityClient.fetch(`
            *[_type == "navigation"][0]{
              items[]{
                label,
                categoryHandle,
                priority,
                featured{
                  title,
                  subtitle,
                  "imageUrl": image.asset->url,
                  href
                }
              }
            }
          `);
        } catch (err) {
          console.error("Sanity fetch failed:", err);
        }

        const items = navConfig?.items || [];

        // Fallback if Sanity empty
        if (!items.length) {
          const { navItems: fallbackNavItems, megaMenuContent: fallbackMega } =
            buildFallbackNavigation(product_categories);
          setNavItems(fallbackNavItems);
          setMegaMenuContent(fallbackMega);
          setLoading(false);
          return;
        }

        // Build from Sanity
        const { navItems: mappedNavItems, megaMenuContent: mappedMega } =
          buildNavigationFromSanity(items, categoriesByHandle);

        setNavItems(mappedNavItems);
        setMegaMenuContent(mappedMega);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch navigation data:", err);
        setLoading(false);
      }
    };

    fetchNavigationData();
  }, []);

  return { navItems, megaMenuContent, loading };
};

const buildFallbackNavigation = (product_categories) => {
  const topLevel = (product_categories || []).filter(
    (cat) => !cat.parent_category_id
  );

  const fallbackNavItems = topLevel.map((cat, idx) => ({
    id: cat.id,
    name: cat.name,
    href: `/shop/category/${cat.handle}`,
    handle: cat.handle,
    priority: idx,
    hasMega: (cat.category_children || []).length > 0,
  }));

  const fallbackMega = {};
  topLevel.forEach((cat) => {
    const href = `/shop/category/${cat.handle}`;
    const children = cat.category_children || [];
    if (!children.length) return;

    const columns = children.map((child) => ({
      title: child.name,
      href: `/shop/category/${child.handle}`,
      items: (child.category_children || []).map((grandChild) => ({
        name: grandChild.name,
        href: `/shop/category/${grandChild.handle}`,
      })),
    }));

    fallbackMega[href] = {
      columns,
      featured: [
        {
          title: `${cat.name} Collection`,
          subtitle: "",
          href,
          image:
            cat.metadata?.image ||
            "https://placehold.co/800x600/f5f5f5/111?text=Collection",
        },
      ],
    };
  });

  return { navItems: fallbackNavItems, megaMenuContent: fallbackMega };
};

const buildNavigationFromSanity = (items, categoriesByHandle) => {
  const mappedNavItems = items
    .map((item) => {
      const cat = categoriesByHandle.get(item.categoryHandle);
      if (!cat) return null;

      const href = `/shop/category/${cat.handle}`;

      return {
        id: cat.id,
        name: item.label || cat.name,
        href,
        handle: cat.handle,
        priority: item.priority ?? 0,
        hasMega: (cat.category_children || []).length > 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.priority - b.priority);

  const mappedMegaMenuContent = {};

  items.forEach((item) => {
    const cat = categoriesByHandle.get(item.categoryHandle);
    if (!cat) return;

    const href = `/shop/category/${cat.handle}`;
    const children = cat.category_children || [];
    if (!children.length) return;

    const columns = children.map((child) => ({
      title: child.name,
      href: `/shop/category/${child.handle}`,
      items: (child.category_children || []).map((grandChild) => ({
        name: grandChild.name,
        href: `/shop/category/${grandChild.handle}`,
      })),
    }));

    mappedMegaMenuContent[href] = {
      columns,
      featured: [
        {
          title: item.featured?.title || `${cat.name} Collection`,
          subtitle: item.featured?.subtitle || "",
          href: item.featured?.href || href,
          image:
            cat.metadata?.image ||
            item.featured?.imageUrl ||
            "https://placehold.co/800x600/f5f5f5/111?text=Collection",
        },
      ],
    };
  });

  return { navItems: mappedNavItems, megaMenuContent: mappedMegaMenuContent };
};
