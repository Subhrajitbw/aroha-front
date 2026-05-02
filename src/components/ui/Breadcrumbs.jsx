import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumbs = ({ className = "", items = null }) => {
  const pathname = usePathname();
  const pathnames = pathname.split("/").filter((x) => x);

  // Map route segments to readable labels
  const labelMap = {
    account: "Account",
    orders: "Orders",
    addresses: "Addresses",
    settings: "Settings",
    wishlist: "Wishlist",
    shop: "Shop",
    product: "Product",
    products: "Products",
    rooms: "Rooms",
    lookbook: "Lookbook",
    contact: "Contact",
    journal: "Journal",
    blogs: "Journal"
  };

  // Helper to format labels
  const formatLabel = (name) => {
    return labelMap[name.toLowerCase()] || name.replace(/-/g, " ");
  };

  // Generate breadcrumb items if not provided
  const breadcrumbItems = items || (() => {
    let currentPath = "";
    return pathnames.reduce((acc, name, index) => {
      const lowerName = name.toLowerCase();
      
      // Structural segments to skip for a cleaner path
      const structuralSegments = ["category", "product", "products", "blogs"];
      
      currentPath += `/${name}`;
      
      if (structuralSegments.includes(lowerName)) {
        // If it's a structural segment, we don't add it as a linkable level,
        // but we keep the path building intact for subsequent segments.
        return acc;
      }

      acc.push({
        label: formatLabel(name),
        path: currentPath,
        isLast: index === pathnames.length - 1
      });
      return acc;
    }, []);
  })();

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center select-none ${className}`}>
      <ol className="flex items-center space-x-2">
        <li className="flex items-center">
          <Link
            href="/"
            className="text-stone-400 hover:text-stone-900 transition-colors flex items-center"
          >
            <Home size={12} className="mt-[-1px]" />
          </Link>
        </li>
        {breadcrumbItems.map((item, index) => {
          const isLast = item.isLast || index === breadcrumbItems.length - 1;

          return (
            <li key={item.label + index} className="flex items-center space-x-2">
              <ChevronRight size={10} className="text-stone-300 shrink-0" />
              {isLast ? (
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-900 truncate max-w-[200px] inline-block">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-stone-900 transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
