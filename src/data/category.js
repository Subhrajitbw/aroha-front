import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import clsx from "clsx";
import { MoveLeft, MoveRight } from "lucide-react";
import { ProductInfoCard } from "../pages/Shop";

// Dummy data for testing
const dummyCategories = [
  {
    _id: "cat1",
    name: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop"
  },
  {
    _id: "cat2", 
    name: "Clothing",
    slug: "clothing",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop"
  },
  {
    _id: "cat3",
    name: "Home & Garden",
    slug: "home-garden", 
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop"
  },
  {
    _id: "cat4",
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop"
  },
  {
    _id: "cat5",
    name: "Books",
    slug: "books",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100&h=100&fit=crop"
  },
  {
    _id: "cat6",
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop"
  },
  {
    _id: "cat7",
    name: "Automotive",
    slug: "automotive",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop"
  }
];

const dummyProducts = {
  cat1: [ // Electronics
    {
      _id: "prod1",
      name: "Wireless Headphones",
      price: 99.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      rating: 4.5,
      inStock: true
    },
    {
      _id: "prod2", 
      name: "Smartphone",
      price: 699.99,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
      rating: 4.8,
      inStock: true
    },
    {
      _id: "prod3",
      name: "Laptop",
      price: 1299.99,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
      rating: 4.6,
      inStock: true
    },
    {
      _id: "prod4",
      name: "Smart Watch",
      price: 299.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      rating: 4.3,
      inStock: false
    },
    {
      _id: "prod5",
      name: "Tablet",
      price: 499.99,
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop",
      rating: 4.4,
      inStock: true
    }
  ],
  cat2: [ // Clothing
    {
      _id: "prod6",
      name: "Cotton T-Shirt",
      price: 25.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
      rating: 4.2,
      inStock: true
    },
    {
      _id: "prod7",
      name: "Denim Jeans",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop",
      rating: 4.5,
      inStock: true
    },
    {
      _id: "prod8",
      name: "Winter Jacket",
      price: 149.99,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop",
      rating: 4.7,
      inStock: true
    },
    {
      _id: "prod9",
      name: "Running Shoes",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
      rating: 4.6,
      inStock: false
    },
    {
      _id: "prod10",
      name: "Summer Dress",
      price: 65.99,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop",
      rating: 4.3,
      inStock: true
    }
  ],
  cat3: [ // Home & Garden
    {
      _id: "prod11",
      name: "Coffee Maker",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
      rating: 4.4,
      inStock: true
    },
    {
      _id: "prod12",
      name: "Plant Pot Set",
      price: 34.99,
      image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&h=300&fit=crop",
      rating: 4.1,
      inStock: true
    },
    {
      _id: "prod13",
      name: "Table Lamp",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
      rating: 4.5,
      inStock: true
    },
    {
      _id: "prod14",
      name: "Throw Pillow",
      price: 19.99,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
      rating: 4.0,
      inStock: true
    },
    {
      _id: "prod15",
      name: "Garden Tools Set",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop",
      rating: 4.6,
      inStock: false
    }
  ],
  cat4: [ // Sports & Outdoors
    {
      _id: "prod16",
      name: "Yoga Mat",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
      rating: 4.3,
      inStock: true
    },
    {
      _id: "prod17",
      name: "Camping Tent",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&h=300&fit=crop",
      rating: 4.7,
      inStock: true
    },
    {
      _id: "prod18",
      name: "Water Bottle",
      price: 15.99,
      image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300&h=300&fit=crop",
      rating: 4.2,
      inStock: true
    },
    {
      _id: "prod19",
      name: "Hiking Backpack",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
      rating: 4.5,
      inStock: true
    },
    {
      _id: "prod20",
      name: "Basketball",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=300&fit=crop",
      rating: 4.1,
      inStock: false
    }
  ],
  cat5: [ // Books
    {
      _id: "prod21",
      name: "Programming Guide",
      price: 39.99,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop",
      rating: 4.8,
      inStock: true
    },
    {
      _id: "prod22",
      name: "Fiction Novel",
      price: 14.99,
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop",
      rating: 4.4,
      inStock: true
    },
    {
      _id: "prod23",
      name: "Cookbook",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop",
      rating: 4.6,
      inStock: true
    },
    {
      _id: "prod24",
      name: "Art History Book",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
      rating: 4.3,
      inStock: true
    },
    {
      _id: "prod25",
      name: "Self-Help Guide",
      price: 19.99,
      image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=300&fit=crop",
      rating: 4.2,
      inStock: false
    }
  ],
  cat6: [ // Beauty & Personal Care
    {
      _id: "prod26",
      name: "Face Moisturizer",
      price: 35.99,
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop",
      rating: 4.4,
      inStock: true
    },
    {
      _id: "prod27",
      name: "Lip Balm Set",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&h=300&fit=crop",
      rating: 4.1,
      inStock: true
    },
    {
      _id: "prod28",
      name: "Hair Shampoo",
      price: 18.99,
      image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop",
      rating: 4.3,
      inStock: true
    },
    {
      _id: "prod29",
      name: "Perfume",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop",
      rating: 4.6,
      inStock: false
    },
    {
      _id: "prod30",
      name: "Makeup Kit",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&h=300&fit=crop",
      rating: 4.5,
      inStock: true
    }
  ],
  cat7: [ // Automotive
    {
      _id: "prod31",
      name: "Car Phone Mount",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop",
      rating: 4.2,
      inStock: true
    },
    {
      _id: "prod32",
      name: "Car Air Freshener",
      price: 8.99,
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&h=300&fit=crop",
      rating: 3.9,
      inStock: true
    },
    {
      _id: "prod33",
      name: "Dash Cam",
      price: 159.99,
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&h=300&fit=crop",
      rating: 4.5,
      inStock: true
    },
    {
      _id: "prod34",
      name: "Car Vacuum",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=300&fit=crop",
      rating: 4.3,
      inStock: false
    },
    {
      _id: "prod35",
      name: "Emergency Kit",
      price: 45.99,
      image: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=300&h=300&fit=crop",
      rating: 4.4,
      inStock: true
    }
  ]
};

// Root category structure for the API response
const dummyRootResponse = {
  data: [
    {
      _id: "root",
      name: "Root",
      children: dummyCategories.map(cat => ({ _id: cat._id }))
    },
    ...dummyCategories
  ]
};

const CategorySlider = () => {
  const [categories, setCategories] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productLimit, setProductLimit] = useState(5);
  const [showArrows, setShowArrows] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const tabsRef = useRef(null);
  const containerRef = useRef(null);

  // Set product limit based on screen width
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setProductLimit(width < 1024 ? 4 : 5);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Observe scroll position and overflow
  useEffect(() => {
    const el = containerRef.current;
    const updateArrowState = () => {
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowArrows(scrollWidth > clientWidth);
      setAtStart(scrollLeft <= 1);
      setAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
    };

    updateArrowState();
    el?.addEventListener("scroll", updateArrowState);
    window.addEventListener("resize", updateArrowState);

    return () => {
      el?.removeEventListener("scroll", updateArrowState);
      window.removeEventListener("resize", updateArrowState);
    };
  }, [categories]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Uncomment below for testing with dummy data only
        /*
        const all = dummyRootResponse.data;
        const root = all.find((cat) => cat.name === "Root");
        if (!root || !root.children) return;

        const filtered = root.children
          .map((childRef) => all.find((c) => c._id === childRef._id))
          .filter(Boolean)
          .map((cat) => ({
            _id: cat._id,
            name: cat.name,
            slug: cat.slug || "#",
            image: cat.image,
          }));

        setCategories(filtered);
        setSelectedSlug(filtered[0]?._id);
        return;
        */

        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/categories?isActive=true`, {headers: {
    "ngrok-skip-browser-warning": "true",
  },});
        const all = res.data;

        const root = all.find((cat) => cat.name === "Root");
        if (!root || !root.children) return;

        const filtered = root.children
          .map((childRef) => all.find((c) => c._id === childRef._id))
          .filter(Boolean)
          .map((cat) => ({
            _id: cat._id,
            name: cat.name,
            slug: cat.slug || "#",
            image: cat.image,
          }));

        setCategories(filtered);
        setSelectedSlug(filtered[0]?._id);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        
        // Fallback to dummy data on error
        const filtered = dummyCategories.map((cat) => ({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug || "#",
          image: cat.image,
        }));
        
        setCategories(filtered);
        setSelectedSlug(filtered[0]?._id);
      }
    };

    fetchCategories();
  }, []);

  // Scroll selected category into view
  useEffect(() => {
    if (!selectedSlug || !tabsRef.current) return;
    const selectedTab = tabsRef.current.querySelector(
      `[data-slug="${selectedSlug}"]`
    );
    if (selectedTab) {
      selectedTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedSlug]);

  // Fetch products for selected category
  useEffect(() => {
    if (!selectedSlug) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Uncomment below for testing with dummy data only
        /*
        const categoryProducts = dummyProducts[selectedSlug] || [];
        const limitedProducts = categoryProducts.slice(0, productLimit);
        setProducts(limitedProducts);
        setLoading(false);
        return;
        */

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/products?categoryId=${selectedSlug}&limit=${productLimit}`, {headers: {
    "ngrok-skip-browser-warning": "true",
  },}
        );
        setProducts(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
        
        // Fallback to dummy data on error
        const categoryProducts = dummyProducts[selectedSlug] || [];
        const limitedProducts = categoryProducts.slice(0, productLimit);
        setProducts(limitedProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedSlug, productLimit]);

  const handleTabClick = (id) => {
    setSelectedSlug(id);
  };

  const scroll = (direction) => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = 200;

    if (direction === "left") {
      el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full px-4 py-8 space-y-6 rounded-lg">
      {/* Category Tabs */}
      <div className="flex items-center gap-4 max-w-full mx-auto">
        {showArrows && (
          <button 
            onClick={() => scroll("left")} 
            disabled={atStart} 
            className={clsx(
              "transition-opacity", 
              atStart ? "opacity-30 cursor-not-allowed" : "opacity-100"
            )}
          >
            <MoveLeft className="w-6 h-6" />
          </button>
        )}

        <div ref={containerRef} className="flex-1 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 max-w-full" ref={tabsRef}>
            {categories.map((cat) => (
              <button
                key={cat._id}
                data-slug={cat._id}
                onClick={() => handleTabClick(cat._id)}
                className={clsx(
                  "flex justify-between items-center gap-2 flex-shrink-0 rounded-lg border px-2 py-2 text-sm font-medium transition-colors duration-300",
                  selectedSlug === cat._id
                    ? "bg-black text-white border-transparent"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-200"
                )}
              >
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-6 h-6 rounded object-cover"
                  />
                )}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {showArrows && (
          <button 
            onClick={() => scroll("right")} 
            disabled={atEnd} 
            className={clsx(
              "transition-opacity", 
              atEnd ? "opacity-30 cursor-not-allowed" : "opacity-100"
            )}
          >
            <MoveRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Products */}
      <div className="grid gap-4 px-4 grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5">
        {loading ? (
          <p className="col-span-full text-center text-gray-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">No products found in this category.</p>
        ) : (
          products.map((product) => (
            <ProductInfoCard key={product._id} product={product} isSmall={true} />
          ))
        )}
      </div>
    </div>
  );
};

export default CategorySlider;
