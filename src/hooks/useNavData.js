// src/hooks/useNavData.js
"use client";
import { useEffect, useState, useMemo } from "react";
import { useNavStore } from "../stores/useNavStore";
import { sdk } from "../lib/medusaClient";
import { sanityClient } from "../lib/sanityClient";

export const useNavData = () => {
  const {
    navItems,
    megaMenuContent,
    isLoaded,
    isLoading,
    setNavData,
    setLoading,
  } = useNavStore();
  const [roomCategories, setRoomCategories] = useState([]);

  useEffect(() => {
    const fetchNavigationData = async () => {
      const isMissingShop = isLoaded && navItems.length > 0 && !megaMenuContent.shop;
      if ((isLoaded && navItems.length > 0 && !isMissingShop) || isLoading) return;

      try {
        setLoading(true);

        const safeFetch = async (promise, fallback) => {
          try { return await promise; }
          catch (e) { console.error("Nav fetch error:", e); return fallback; }
        };

        // ── 1. Fetch all Medusa categories (paginated) ──────────────────────
        let medusaCategories = [];
        let offset = 0;
        let totalCount = 1;
        while (medusaCategories.length < totalCount) {
          const res = await safeFetch(
            sdk.store.category.list({ limit: 100, offset, fields: "id,name,handle,parent_category_id,metadata" }),
            { product_categories: [], count: 0 }
          );
          medusaCategories = [...medusaCategories, ...(res.product_categories || [])];
          totalCount = res.count || 0;
          offset += 100;
          if ((res.product_categories || []).length === 0) break;
        }

        // ── 2. Fetch products to build inventory counts ─────────────────────
        const prodRes = await safeFetch(
          sdk.store.product.list({ limit: 1000, fields: "id,categories.id" }),
          { products: [] }
        );
        const medusaProducts = prodRes.products || [];

        // ── 3. Fetch curated categories from Sanity ─────────────────────────
        let curatedCategories = [];
        try {
          const sanityRes = await sanityClient.fetch(
            `*[_type == "curatedNavigation"][0]{ curated_categories }`
          );
          curatedCategories = sanityRes?.curated_categories || [];
        } catch (err) {
          console.warn("Sanity curated fetch failed, falling back to Medusa only:", err);
        }

        // ── 4. Build unified category map ───────────────────────────────────
        // Start with Medusa as base; merge curated enrichment (images, featured products)
        const catMap = new Map(medusaCategories.map(c => [c.id, { ...c }]));

        curatedCategories.forEach(cur => {
          if (catMap.has(cur.id)) {
            const existing = catMap.get(cur.id);
            existing.curatedImage = cur.image;
            existing.featuredProducts = cur.featuredProducts || [];
          } else {
            // Curated item not in Medusa yet — add it
            catMap.set(cur.id, {
              id: cur.id,
              name: cur.name,
              handle: cur.handle,
              parent_category_id: cur.parent_category_id,
              metadata: {},
              curatedImage: cur.image,
              featuredProducts: cur.featuredProducts || [],
            });
          }
        });

        const allCategories = Array.from(catMap.values());

        // ── 5. Build parent → children index ───────────────────────────────
        const childrenOf = new Map(); // parentId → [child, ...]
        allCategories.forEach(c => {
          if (!c.parent_category_id) return;
          if (!childrenOf.has(c.parent_category_id)) childrenOf.set(c.parent_category_id, []);
          childrenOf.get(c.parent_category_id).push(c);
        });

        // ── 6. Build recursive product count (bubbles up the tree) ──────────
        const productCount = new Map();
        medusaProducts.forEach(p => {
          (p.categories || []).forEach(cat => {
            let id = cat.id;
            while (id) {
              productCount.set(id, (productCount.get(id) || 0) + 1);
              const parent = catMap.get(id);
              id = parent?.parent_category_id ?? null;
            }
          });
        });

        // Strictly require at least 1 real product (no curated-only ghost categories)
        const hasContent = (id) => (productCount.get(id) || 0) > 0;

        // Department must ALSO have at least 1 child with real products
        // (prevents empty top-level items like "Kids" or "Storage" with no live inventory)
        const hasProductChildren = (id) =>
          (childrenOf.get(id) || []).some(child => hasContent(child.id));

        // A department is valid if IT has products AND at least one child has products
        const isValidDepartment = (c) => hasContent(c.id) && hasProductChildren(c.id);

        // ── 7. Determine departments using the CURATED list as authority ──────
        const curatedIds = new Set(curatedCategories.map(c => c.id));

        let departments;
        if (curatedCategories.length > 0) {
          departments = curatedCategories
            .filter(c => !curatedIds.has(c.parent_category_id))
            .filter(c => isValidDepartment(c))
            .sort((a, b) => (Number(a.metadata?.priority) || 100) - (Number(b.metadata?.priority) || 100));
        } else {
          // Fallback: use Medusa true-root children
          const trueRoots = new Set(allCategories.filter(c => !c.parent_category_id).map(c => c.id));
          departments = allCategories
            .filter(c => c.parent_category_id && trueRoots.has(c.parent_category_id))
            .filter(c => isValidDepartment(c))
            .sort((a, b) => (Number(a.metadata?.priority) || 100) - (Number(b.metadata?.priority) || 100));
        }

        // ── 8. Build mega-menu content for each department ───────────────────
        // Filter by real products, sort by priority, cap at 5
        const sortTop5 = (arr) =>
          arr
            .filter(c => hasContent(c.id))
            .sort((a, b) => (Number(a.metadata?.priority) || 100) - (Number(b.metadata?.priority) || 100))
            .slice(0, 5);

        const megaMenus = {};

        departments.forEach(dept => {
          const deptCat = catMap.get(dept.id) || dept;

          // Columns = top 5 children with real products
          const columns = sortTop5(childrenOf.get(dept.id) || []).map(col => {
            const colCat = catMap.get(col.id) || col;
            return {
              title: colCat.name,
              href: `/product-categories/${colCat.handle}`,
              // Items = top 5 grandchildren with real products
              items: sortTop5(childrenOf.get(col.id) || []).map(item => ({
                name: item.name,
                href: `/product-categories/${item.handle}`,
              })),
            };
          });

          megaMenus[`/product-categories/${dept.handle}`] = {
            columns,
            featured: null,
            sectionLabel: dept.name,
            viewAllHref: `/product-categories/${dept.handle}`,
          };
        });

        // ── 9. Build "Shop All" overview menu ───────────────────────────────
        const shopColumns = departments.map(dept => {
          const deptCat = catMap.get(dept.id) || dept;
          return {
            title: deptCat.name,
            href: `/product-categories/${deptCat.handle}`,
            items: sortTop5(childrenOf.get(dept.id) || []).map(col => ({
              name: col.name,
              href: `/product-categories/${col.handle}`,
            })),
          };
        });

        megaMenus["shop"] = {
          columns: shopColumns,
          featured: {
            title: "The Aroha House Collection",
            subtitle: "Curating Intentional Spaces",
            href: "/shop",
            image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800",
          },
          sectionLabel: "All Departments",
          viewAllHref: "/shop",
        };

        // ── 10. Final nav items (ALL departments) ────────────────────────────
        const finalNavItems = departments.map(dept => {
          const deptCat = catMap.get(dept.id) || dept;
          return {
            id: dept.id,
            name: deptCat.name,
            href: `/product-categories/${deptCat.handle}`,
            handle: deptCat.handle,
            hasMega: true,
          };
        });

        console.log(
          "NavData: departments →",
          finalNavItems.map(n => n.name),
          "| total curated:", curatedCategories.length
        );
        setNavData(finalNavItems, megaMenus);

      } catch (err) {
        console.error("Nav fetch failure:", err);
        setNavData([], {});
      } finally {
        setLoading(false);
      }
    };

    fetchNavigationData();
  }, [isLoaded, isLoading, navItems.length, megaMenuContent.shop, setNavData, setLoading]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await sanityClient.fetch(`*[_type == "product" && defined(perfectFor)]{ perfectFor }`);
        const keywords = ["bedroom", "living", "studio", "lounge", "dining", "office", "suite"];
        const found = new Set();
        data.forEach(p => {
          const tags = Array.isArray(p.perfectFor) ? p.perfectFor : [p.perfectFor];
          tags.forEach(tag => {
            if (!tag) return;
            const lower = tag.toLowerCase();
            if (keywords.find(kw => lower.includes(kw))) {
              found.add(tag.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '));
            }
          });
        });
        setRoomCategories(Array.from(found).slice(0, 6));
      } catch (err) {
        console.error("Rooms fetch error:", err);
      }
    };
    fetchRooms();
  }, []);

  const roomsMegaContent = useMemo(() => ({
    columns: [{
      title: "Virtual Tours",
      href: "/rooms",
      items: roomCategories.map(cat => ({
        name: cat.toUpperCase(),
        href: `/rooms/${cat.toLowerCase().replace(/\s+/g, '-')}`,
      })),
    }],
    featured: {
      title: "The Visionary Estate",
      subtitle: "Luxury Interiors",
      href: "/rooms",
      image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800",
    },
  }), [roomCategories]);

  return {
    navItems,
    megaMenuContent,
    roomsMegaContent,
    shopMegaContent: megaMenuContent["shop"] || { columns: [] },
  };
};
