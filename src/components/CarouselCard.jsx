import { Link } from "react-router-dom"; // or "next/link" for Next.js

export default function CarouselCard({ product, color }) {
  console.log(product)
  const productUrl = `/products/${product.id || product._id}`;

  return (
    <Link to={productUrl} className="no-underline hover:no-underline">
      <div
        className={`flex flex-col items-center justify-between md:p-4 p-2 bg-white shadow-sm rounded-md transition-all duration-300 ${color} 
        w-[200px] sm:w-[280px] md:w-[300px] lg:w-[320px] overflow-hidden cursor-pointer hover:shadow-md`}
      >
        {/* Product Image */}
        <div className="flex-1 flex items-center justify-center w-full py-4 relative">
          <img
            src={product.image || "https://craftsmill.in/cdn/shop/files/sofas-accent-chairs-cider-orange-soft-velvet-touch-fabric-emily-flared-arm-2-seater-sofa-60-46567514931491.jpg?v=1725047510"}
            alt={product.name}
            className="object-contain w-72 h-72"
            style={{
              WebkitTransform: "translate3d(0,0,0)",
              willChange: "transform",
            }}
          />
        </div>

        {/* Title */}
        <h3 className="mt-2 text-center text-base text-gray-800 text-lg md:text-md leading-tight">
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-sm text-gray-600 mt-1">₹{product.price.amount}/-</p>
      </div>
    </Link>
  );
}
