import { useState, useMemo } from "react";
import { Heart, ShoppingCart, Eye, Star, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";

export default function ProductCard({ product }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Price calculation
  const { originalPrice, finalPrice, hasDiscount, discountBadge } = useMemo(() => {
    const original = Number(product?.price?.amount || 0);
    let final = original;
    let badge = null;

    if (product?.price?.isDiscounted) {
      if (product.price.discountType === "Percentage") {
        final = original - (original * (product.price.discountPercentage || 0)) / 100;
        badge = `-${product.price.discountPercentage || 0}%`;
      } else if (product.price.discountType === "Fixed") {
        final = original - (product.price.discountAmount || 0);
        const pct = Math.round(((product.price.discountAmount || 0) / original) * 100);
        badge = `-${pct}%`;
      }
    }
    return {
      originalPrice: original,
      finalPrice: final < 0 ? 0 : final,
      hasDiscount: product?.price?.isDiscounted,
      discountBadge: badge,
    };
  }, [product]);

  const handleFavorite = () => {
    setIsFavorited((p) => !p);
    if ("vibrate" in navigator) navigator.vibrate(30);
    gsap.fromTo(
      ".fav-pop",
      { scale: 0.85, opacity: 0.4 },
      { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(2)" }
    );
  };

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    gsap.to(".cart-btn", { y: -2, duration: 0.15, ease: "power2.out", yoyo: true, repeat: 1 });
    // TODO: Integrate cart action here
    setTimeout(() => setIsAdding(false), 700);
  };

  const image = product?.images?.[0] || product?.image || "/placeholder.png";
  const rating = Number(product?.rating || 4.6);
  const ratingCount = Number(product?.ratingCount || 128);

  return (
    <div
      className="
        group relative flex flex-col overflow-hidden rounded-3xl
        bg-white/80 backdrop-blur-xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]
        transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]
        hover:-translate-y-1
        max-w-[320px] w-full
      "
      style={{ willChange: "transform, box-shadow" }}
    >
      {/* Subtle gradient glow background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(1200px 300px at 50% -10%, rgba(250,204,21,0.15), rgba(236,72,153,0.04) 40%, transparent 70%)",
        }}
      />

      {/* Top actions */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
        {/* Discount badge */}
        {hasDiscount && discountBadge && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/90 text-white shadow-sm">
            <Sparkles size={14} />
            <span>{discountBadge}</span>
          </div>
        )}

        {/* Favorite */}
        <button
          onClick={handleFavorite}
          aria-label="Add to favorites"
          className={`
            fav-pop inline-flex items-center justify-center w-9 h-9 rounded-full
            border transition-all duration-300
            ${isFavorited
              ? "bg-rose-100 border-rose-200 text-rose-600"
              : "bg-white/90 border-black/10 text-gray-600 hover:text-rose-600 hover:border-rose-200"
            }
            backdrop-blur-sm
          `}
        >
          <Heart size={18} className={isFavorited ? "fill-rose-600" : ""} />
        </button>
      </div>

      {/* Image */}
      <Link
        to={`/products/${product?._id || product?.id || ""}`}
        className="relative block"
      >
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={product?.name || "Product"}
            className="absolute inset-0 w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]"
            draggable={false}
          />
          {/* Elegant bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white/90 via-white/30 to-transparent pointer-events-none" />
        </div>
      </Link>

      {/* Content */}
      <div className="relative z-10 px-5 pt-2 pb-5">
        {/* Title */}
        <Link
          to={`/products/${product?._id || product?.id || ""}`}
          className="block text-[15px] sm:text-base text-neutral-900/90 font-medium tracking-tight line-clamp-2 hover:text-neutral-900 transition-colors"
        >
          {product?.name || "Untitled product"}
        </Link>

        {/* Meta: rating and views */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-600">
            <Star size={16} className="fill-amber-500 text-amber-500" />
            <span className="text-sm font-medium text-neutral-800">{rating.toFixed(1)}</span>
            <span className="text-xs text-neutral-500">({ratingCount})</span>
          </div>

          <div className="flex items-center gap-2 text-neutral-500">
            <Eye size={16} />
            <span className="hidden sm:inline text-xs">{product?.views || "2.1k"}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-semibold text-neutral-900">
              ₹{finalPrice.toFixed(0)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-neutral-400 line-through">
                ₹{originalPrice.toFixed(0)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          {/* View */}
          <Link
            to={`/products/${product?._id || product?.id || ""}`}
            className="
              inline-flex items-center justify-center gap-2
              h-11 px-4 rounded-xl
              border border-black/10 bg-white/70 hover:bg-white text-neutral-800
              backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5
              w-11 sm:w-auto
            "
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { y: -2, duration: 0.2, ease: "power2.out" });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { y: 0, duration: 0.2, ease: "power2.out" });
            }}
          >
            <Eye size={18} />
            <span className="hidden sm:inline text-sm font-medium">View</span>
          </Link>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className={`
              cart-btn inline-flex items-center justify-center gap-2
              h-11 px-4 rounded-xl
              bg-neutral-900 text-white hover:bg-neutral-800
              transition-all duration-300 hover:-translate-y-0.5
              w-11 sm:w-auto
              ${isAdding ? "opacity-90" : ""}
            `}
            aria-busy={isAdding}
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline text-sm font-medium">
              {isAdding ? "Adding..." : "Add to cart"}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom border accent */}
      <div className="absolute bottom-0 inset-x-0 h-[3px]">
        <div className="h-full w-0 group-hover:w-full transition-all duration-700 bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400" />
      </div>
    </div>
  );
}
