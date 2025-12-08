import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Eye, LayoutGrid, List } from "lucide-react";
import NavBar from "../components/NavBar";

const allProducts = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  name: `Handcrafted Vase ${i + 1}`,
  image: `https://source.unsplash.com/400x400/?decor,home,vase&sig=${i}`,
  price: 40 + i * 5,
  category: i % 2 === 0 ? "Vases" : "Frames",
}));

const categories = ["All", "Vases", "Frames"];

export default function ProductListPage() {
  const [view, setView] = useState("grid");
  const [category, setCategory] = useState("All");
  const [priceRange] = useState([0, 100]);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("default");
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const pageSize = 6;

  let filteredProducts = allProducts.filter((p) => {
    return (
      (category === "All" || p.category === category) &&
      p.price >= priceRange[0] &&
      p.price <= priceRange[1]
    );
  });

  // Sorting logic
  if (sortBy === "lowToHigh") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "highToLow") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "newest") {
    filteredProducts.sort((a, b) => b.id - a.id);
  }

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const currentProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
    <NavBar/>
    <div className="min-h-screen bg-[#f8f5f2] px-4 md:px-10 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex items-center space-x-2 relative z-10">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-md transition ${
              view === "grid" ? "bg-neutral-800 text-white" : "text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-md transition ${
              view === "list" ? "bg-neutral-800 text-white" : "text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-10 relative z-0 isolation-auto">
        {/* Sidebar Filters */}
        <aside className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">Category</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className={`block w-full text-left px-4 py-2 rounded-md text-sm ${
                    category === cat
                      ? "bg-neutral-800 text-white"
                      : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">Sort By</h3>
            <select
              className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm text-neutral-700 shadow-sm focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">Price</h3>
            <p className="text-neutral-600 text-sm">
              ${priceRange[0]} – ${priceRange[1]} (mocked)
            </p>
          </div>
        </aside>

        {/* Products */}
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}
        >
          {currentProducts.map((product) =>
            view === "grid" ? (
              <ProductCard key={product.id} product={product} hoveredBtn={hoveredBtn} setHoveredBtn={setHoveredBtn} />
            ) : (
              <ListProductCard key={product.id} product={product} hoveredBtn={hoveredBtn} setHoveredBtn={setHoveredBtn} />
            )
          )}
        </motion.div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-12 space-x-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-4 py-2 rounded-md text-sm ${
              page === i + 1
                ? "bg-neutral-800 text-white"
                : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
    </>
  );
}

function ProductCard({ product, hoveredBtn, setHoveredBtn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white rounded-2xl shadow-md overflow-hidden relative group"
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-64 object-cover transition-transform group-hover:scale-105 duration-500"
      />
      <div className="p-4 space-y-2">
        <h2 className="text-lg font-medium text-neutral-800">{product.name}</h2>
        <p className="text-neutral-500">${product.price}</p>
      </div>
      <div className="absolute bottom-4 right-4 flex space-x-3">
        <AnimatedActionButton
          icon={<Eye size={18} />}
          label="View"
          id={`view${product.id}`}
          hoveredBtn={hoveredBtn}
          setHoveredBtn={setHoveredBtn}
        />
        <AnimatedActionButton
          icon={<ShoppingCart size={18} />}
          label="Add to cart"
          id={`cart${product.id}`}
          hoveredBtn={hoveredBtn}
          setHoveredBtn={setHoveredBtn}
        />
      </div>
    </motion.div>
  );
}

function ListProductCard({ product, hoveredBtn, setHoveredBtn }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex bg-white rounded-xl shadow-sm overflow-hidden group"
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-48 h-48 object-cover flex-shrink-0"
      />
      <div className="flex flex-col justify-between p-4 flex-grow">
        <div>
          <h2 className="text-lg font-medium text-neutral-800">{product.name}</h2>
          <p className="text-neutral-500 mt-1">${product.price}</p>
        </div>
        <div className="flex space-x-3 mt-4">
          <AnimatedActionButton
            icon={<Eye size={18} />}
            label="View"
            id={`view${product.id}`}
            hoveredBtn={hoveredBtn}
            setHoveredBtn={setHoveredBtn}
          />
          <AnimatedActionButton
            icon={<ShoppingCart size={18} />}
            label="Add to cart"
            id={`cart${product.id}`}
            hoveredBtn={hoveredBtn}
            setHoveredBtn={setHoveredBtn}
          />
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedActionButton({ icon, label, id, hoveredBtn, setHoveredBtn }) {
  return (
    <motion.button
      onMouseEnter={() => setHoveredBtn(id)}
      onMouseLeave={() => setHoveredBtn(null)}
      initial={{ width: 44 }}
      animate={{ width: hoveredBtn === id ? 130 : 44 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => alert(`${label} clicked`)}
      className="h-11 overflow-hidden rounded bg-black text-white hover:bg-gray-800 flex items-center justify-start px-3"
    >
      {icon}
      <AnimatePresence>
        {hoveredBtn === id && (
          <motion.span
            key={id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="ml-2 text-sm whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
