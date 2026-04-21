import { useState, useEffect, useMemo } from "react";
import { sdk } from "../lib/medusaClient";
import { sanityClient } from "../lib/sanityClient";

export const useNavData = () => {
  const [navItems, setNavItems] = useState([]);
  const [roomCategories, setRoomCategories] = useState([]);
  const [megaMenuContent, setMegaMenuContent] = useState({});

  useEffect(() => {
    const fetchNavigationData = async () => {
      try {
        const { product_categories } = await sdk.store.category.list({ limit: 1000 });
        const categoriesByHandle = new Map((product_categories || []).map((cat) => [cat.handle, cat]));

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

        if (!items.length) {
          const topLevel = (product_categories || []).filter((cat) => !cat.parent_category_id);
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
                  image: cat.metadata?.image || "https://placehold.co/800x600/f5f5f5/111?text=Collection",
                },
              ],
            };
          });

          setNavItems(fallbackNavItems);
          setMegaMenuContent(fallbackMega);
          return;
        }

        const mappedNavItems = items
          .map((item) => {
            const cat = categoriesByHandle.get(item.categoryHandle);
            if (!cat) return null;
            return {
              id: cat.id,
              name: item.label || cat.name,
              href: `/shop/category/${cat.handle}`,
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
                image: cat.metadata?.image || item.featured?.imageUrl || "https://placehold.co/800x600/f5f5f5/111?text=Collection",
              },
            ],
          };
        });

        setNavItems(mappedNavItems);
        setMegaMenuContent(mappedMegaMenuContent);
      } catch (err) {
        console.error("Failed to fetch navigation data:", err);
      }
    };

    fetchNavigationData();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await sanityClient.fetch(`*[_type == "product" && defined(perfectFor)]{ perfectFor }`);
        const keywords = ["bedroom", "living", "studio", "lounge", "dining", "office", "suite"];
        const found = new Set();
        data.forEach(p => {
          const tags = Array.isArray(p.perfectFor) ? p.perfectFor : [p.perfectFor];
          tags.forEach(tag => {
            const lower = tag.toLowerCase();
            if (keywords.find(kw => lower.includes(kw))) {
              const display = tag.split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
              found.add(display);
            }
          });
        });
        setRoomCategories(Array.from(found).slice(0, 6));
      } catch (err) {
        console.error("Failed to fetch rooms for nav:", err);
      }
    };
    fetchRooms();
  }, []);

  const roomsMegaContent = useMemo(() => {
    const categories = roomCategories.length > 0 ? roomCategories : ["Living Room", "Bedroom", "Studio"];
    return {
      columns: [
        {
          title: "Virtual Tours",
          href: "/rooms",
          items: categories.map(cat => ({ 
            name: cat.toUpperCase(), 
            href: `/rooms/${cat.toLowerCase().replace(/\s+/g, '-')}` 
          }))
        }
      ],
      featured: [
        {
          title: "The Visionary Estate",
          subtitle: "UHNI homes",
          href: "/rooms",
          image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800"
        },
        {
          title: "Structural Form",
          subtitle: "Architects",
          href: "/rooms",
          image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"
        }
      ]
    };
  }, [roomCategories]);

  const aggregatedMegaContent = useMemo(() => {
    const columns = [];
    const allFeatured = [];

    navItems.forEach((parentItem) => {
      const parentContent = megaMenuContent[parentItem.href];
      if (!parentContent) return;
      const subcategories = [];
      if (parentContent.columns) {
        parentContent.columns.forEach((childColumn) => {
          subcategories.push({ name: childColumn.title, href: childColumn.href });
          if (childColumn.items && subcategories.length < 5) {
            const remaining = 5 - subcategories.length;
            subcategories.push(...childColumn.items.slice(0, remaining));
          }
        });
      }
      columns.push({ title: parentItem.name, href: parentItem.href, items: subcategories.slice(0, 5) });
      if (parentContent.featured) {
        allFeatured.push(...parentContent.featured);
      }
    });

    return { columns, featured: allFeatured.slice(0, 3) };
  }, [navItems, megaMenuContent]);

  return {
    navItems,
    roomCategories,
    megaMenuContent,
    roomsMegaContent,
    aggregatedMegaContent
  };
};
