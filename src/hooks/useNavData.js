// src/hooks/useNavData.js
"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { useNavStore } from "../stores/useNavStore";
import { sdk } from "../lib/medusaClient";
import { sanityClient } from "../lib/sanityClient";

export const useNavData = () => {
  const {
    navItems,
    megaMenuContent,
    categoryThumbnails,
    isLoaded,
    isLoading,
    setNavData,
    setLoading,
  } = useNavStore();
  const [roomCategories, setRoomCategories] = useState([]);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Clean up legacy localStorage cache keys if present
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("aroha-nav-cache");
        localStorage.removeItem("aroha-nav-cache-v2");
        localStorage.removeItem("aroha-nav-cache-v3");
      } catch (e) {}
    }

    const fetchNavigationData = async () => {
      // If already loading or already fetched in this session, skip
      if (hasFetchedRef.current || isLoading) return;
      // If already loaded and has all departments (>= 10) and shop menu, skip
      if (isLoaded && navItems.length >= 10 && megaMenuContent?.shop?.columns?.length >= 10) return;

      hasFetchedRef.current = true;
      try {
        setLoading(true);

        const safeFetch = async (promise, fallback) => {
          try { return await promise; }
          catch (e) { console.error("Nav fetch error:", e); return fallback; }
        };

        // ── 1. Fetch ALL Medusa categories (paginated) ──────────────────────
        let medusaCategories = [];
        let catOffset = 0;
        let catTotal = 1;
        while (medusaCategories.length < catTotal) {
          const res = await safeFetch(
            sdk.store.category.list({ limit: 100, offset: catOffset, fields: "id,name,handle,parent_category_id,rank,metadata" }),
            { product_categories: [], count: 0 }
          );
          const batch = res.product_categories || [];
          medusaCategories = [...medusaCategories, ...batch];
          catTotal = res.count || 0;
          catOffset += 100;
          if (batch.length === 0) break;
        }

        // ── 2. Fetch ALL products to build inventory counts & thumbnails ────
        let medusaProducts = [];
        let prodOffset = 0;
        let prodTotal = 1;
        while (medusaProducts.length < prodTotal) {
          const prodRes = await safeFetch(
            sdk.store.product.list({ limit: 100, offset: prodOffset, fields: "id,title,thumbnail,categories.id,categories.handle,categories.name" }),
            { products: [], count: 0 }
          );
          const batch = prodRes.products || [];
          medusaProducts = [...medusaProducts, ...batch];
          prodTotal = prodRes.count || 0;
          prodOffset += 100;
          if (batch.length === 0) break;
        }

        // ── 3. Fetch curated categories from Sanity (if any) ─────────────────
        let curatedCategories = [];
        try {
          const sanityRes = await sanityClient.fetch(
            `*[_type == "curatedNavigation"][0]{ curated_categories }`
          );
          curatedCategories = sanityRes?.curated_categories || [];
        } catch (err) {
          console.warn("Sanity curated fetch fallback:", err);
        }

        // ── 4. Build unified category map ───────────────────────────────────
        const catMap = new Map(medusaCategories.map(c => [c.id, { ...c }]));

        curatedCategories.forEach(cur => {
          if (catMap.has(cur.id)) {
            const existing = catMap.get(cur.id);
            existing.curatedImage = cur.image;
            existing.featuredProducts = cur.featuredProducts || [];
          } else {
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
        const childrenOf = new Map();
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

        // Build category thumbnail mapping with child bubbling
        const categoryThumbnails = {};
        medusaProducts.forEach(p => {
          if (p.thumbnail) {
            (p.categories || []).forEach(cat => {
              if (!categoryThumbnails[cat.id]) {
                categoryThumbnails[cat.id] = p.thumbnail;
              }
            });
          }
        });

        const getCategoryThumbnail = (catId) => {
          if (categoryThumbnails[catId]) return categoryThumbnails[catId];
          const children = childrenOf.get(catId) || [];
          for (const ch of children) {
            const thumb = getCategoryThumbnail(ch.id);
            if (thumb) {
              categoryThumbnails[catId] = thumb;
              return thumb;
            }
          }
          return null;
        };
        allCategories.forEach(c => getCategoryThumbnail(c.id));

        const hasContent = (id) => (productCount.get(id) || 0) > 0;
        const trueRoots = new Set(allCategories.filter(c => !c.parent_category_id).map(c => c.id));

        // ── 7. Determine active departments with live inventory ──────────────
        const departments = allCategories
          .filter(c => (c.parent_category_id && trueRoots.has(c.parent_category_id) && hasContent(c.id)) ||
                       (!c.parent_category_id && hasContent(c.id) && (childrenOf.get(c.id) || []).length === 0))
          .sort((a, b) => {
            const prioA = Number(a.metadata?.priority) || (a.rank ?? 100);
            const prioB = Number(b.metadata?.priority) || (b.rank ?? 100);
            return prioA - prioB;
          });

        // ── 8. Build mega-menu content for each department ───────────────────
        const megaMenus = {};

        departments.forEach(dept => {
          const deptCat = catMap.get(dept.id) || dept;
          const directChildren = (childrenOf.get(dept.id) || [])
            .filter(c => hasContent(c.id))
            .sort((a, b) => (Number(a.metadata?.priority) || (a.rank ?? 100)) - (Number(b.metadata?.priority) || (b.rank ?? 100)));

          // Check if direct children have nested grandchildren
          const columns = directChildren.map(col => {
            const colCat = catMap.get(col.id) || col;
            const grandChildren = (childrenOf.get(col.id) || [])
              .filter(g => hasContent(g.id))
              .sort((a, b) => (Number(a.metadata?.priority) || (a.rank ?? 100)) - (Number(b.metadata?.priority) || (b.rank ?? 100)));

            return {
              id: colCat.id,
              title: colCat.name,
              handle: colCat.handle,
              href: `/product-categories/${colCat.handle}`,
              image: categoryThumbnails[colCat.id] || colCat.curatedImage || null,
              items: grandChildren.map(item => {
                const itemCat = catMap.get(item.id) || item;
                return {
                  id: itemCat.id,
                  name: itemCat.name,
                  handle: itemCat.handle,
                  href: `/product-categories/${itemCat.handle}`,
                  image: categoryThumbnails[itemCat.id] || itemCat.curatedImage || null,
                };
              }),
            };
          });

          megaMenus[`/product-categories/${dept.handle}`] = {
            id: dept.id,
            columns,
            featured: null,
            sectionLabel: dept.name,
            viewAllHref: `/product-categories/${dept.handle}`,
          };
        });

        // ── 9. Build "Shop All" overview menu ───────────────────────────────
        const shopColumns = departments.map(dept => {
          const deptCat = catMap.get(dept.id) || dept;
          const directChildren = (childrenOf.get(dept.id) || [])
            .filter(c => hasContent(c.id))
            .sort((a, b) => (Number(a.metadata?.priority) || (a.rank ?? 100)) - (Number(b.metadata?.priority) || (b.rank ?? 100)));

          return {
            id: deptCat.id,
            title: deptCat.name,
            handle: deptCat.handle,
            href: `/product-categories/${deptCat.handle}`,
            image: categoryThumbnails[deptCat.id] || deptCat.curatedImage || null,
            items: directChildren.map(col => {
              const colCat = catMap.get(col.id) || col;
              return {
                id: colCat.id,
                name: colCat.name,
                handle: colCat.handle,
                href: `/product-categories/${colCat.handle}`,
                image: categoryThumbnails[colCat.id] || colCat.curatedImage || null,
              };
            }),
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
            image: categoryThumbnails[dept.id] || deptCat.curatedImage || null,
            hasMega: true,
          };
        });

        setNavData(finalNavItems, megaMenus, categoryThumbnails);

      } catch (err) {
        console.error("Nav fetch failure:", err);
        const currentState = useNavStore.getState();
        setNavData(currentState.navItems, currentState.megaMenuContent, currentState.categoryThumbnails);
      } finally {
        setLoading(false);
      }
    };

    fetchNavigationData();
  }, [isLoaded, isLoading, navItems.length, megaMenuContent, setNavData, setLoading]);

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
    categoryThumbnails: categoryThumbnails || {},
    roomsMegaContent,
    shopMegaContent: megaMenuContent["shop"] || { columns: [] },
  };
};
