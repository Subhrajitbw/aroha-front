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
        // 1. Fetch categories and products for counts
        const [categoriesRes, productsRes] = await Promise.all([
          sdk.store.category.list({ limit: 1000 }),
          sdk.store.product.list({ limit: 1000, fields: "id,categories.id" })
        ]);

        const product_categories = categoriesRes.product_categories || [];
        const products = productsRes.products || [];
        const categoriesByHandle = new Map(product_categories.map((cat) => [cat.handle, cat]));
        
        // Find the 'furniture' root to include its main children
        const furnitureRoot = product_categories.find(c => c.handle === 'furniture');
        const furnitureRootId = furnitureRoot?.id;

        // Calculate counts
        const categoryCounts = {};
        products.forEach(p => {
          (p.categories || []).forEach(c => {
            categoryCounts[c.id] = (categoryCounts[c.id] || 0) + 1;
          });
        });

        // 2. Fetch Sanity config
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

        const sanityItems = navConfig?.items || [];

        // 3. Identify automatic categories (count >= 5)
        // Rule: Top-level OR direct child of 'furniture' root
        const autoCategories = product_categories.filter(cat => {
          const count = categoryCounts[cat.id] || 0;
          const isTopLevel = !cat.parent_category_id;
          const isFurnitureChild = furnitureRootId && cat.parent_category_id === furnitureRootId;
          
          return (isTopLevel || isFurnitureChild) && 
                 count >= 5 && 
                 cat.handle !== 'furniture'; // Exclude the root container itself
        });

        // 4. Merge Sanity and Auto items
        const seenHandles = new Set();
        const mergedItems = [];

        // Add sanity items first
        sanityItems.forEach(item => {
          const cat = categoriesByHandle.get(item.categoryHandle);
          if (cat) {
            mergedItems.push({
              id: cat.id,
              name: item.label || cat.name,
              href: `/shop/category/${cat.handle}`,
              handle: cat.handle,
              priority: item.priority ?? 100,
              hasMega: (cat.category_children || []).length > 0,
              sanityFeatured: item.featured
            });
            seenHandles.add(cat.handle);
          }
        });

        // Add auto items if not already seen
        autoCategories.forEach((cat, idx) => {
          if (!seenHandles.has(cat.handle)) {
            mergedItems.push({
              id: cat.id,
              name: cat.name,
              href: `/shop/category/${cat.handle}`,
              handle: cat.handle,
              priority: 200 + idx,
              hasMega: (cat.category_children || []).length > 0,
            });
          }
        });

        const sortedNavItems = mergedItems.sort((a, b) => a.priority - b.priority);

        // 5. Build Mega Menu content
        const mappedMegaMenuContent = {};
        sortedNavItems.forEach((item) => {
          const cat = categoriesByHandle.get(item.handle);
          if (!cat) return;
          const href = `/shop/category/${cat.handle}`;
          const children = cat.category_children || [];
          
          if (children.length > 0) {
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
                  title: item.sanityFeatured?.title || `${cat.name} Collection`,
                  subtitle: item.sanityFeatured?.subtitle || "",
                  href: item.sanityFeatured?.href || href,
                  image: cat.metadata?.image || item.sanityFeatured?.imageUrl || "https://placehold.co/800x600/f5f5f5/111?text=Collection",
                },
              ],
            };
          }
        });

        setNavItems(sortedNavItems);
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
