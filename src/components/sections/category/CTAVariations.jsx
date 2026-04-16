// components/category/CTAVariations.jsx
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Heart, Star } from "lucide-react";

// Minimal CTA
// export const MinimalCTA = ({ selectedCategory }) => (
//   <div className="text-center">
//     <Link
//       to={`/category/${selectedCategory.slug}`}
//       className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors duration-300 font-medium"
//     >
//       <span>View All {selectedCategory.name}</span>
//       <ArrowRight className="w-4 h-4" />
//     </Link>
//   </div>
// );

// Premium CTA with stats
export const PremiumCTA = ({ selectedCategory, stats }) => (
  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-8 text-center">
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          {stats?.rating || '4.8'} Rating
        </span>
        <span>{stats?.products || '200'}+ Products</span>
        <span>{stats?.reviews || '1,500'}+ Reviews</span>
      </div>
      
      <Link
        to={`/category/${selectedCategory.slug}`}
        className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform-gpu hover:scale-105"
      >
        <ShoppingBag className="w-5 h-5" />
        <span>Explore {selectedCategory.name}</span>
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  </div>
);

// // Split CTA with multiple actions
// export const SplitCTA = ({ selectedCategory }) => (
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//     <Link
//       to={`/category/${selectedCategory.slug}`}
//       className="flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-300 font-medium"
//     >
//       <ShoppingBag className="w-5 h-5" />
//       Shop {selectedCategory.name}
//     </Link>
    
//     <button className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-amber-600 text-amber-600 rounded-xl hover:bg-amber-50 transition-all duration-300 font-medium">
//       <Heart className="w-5 h-5" />
//       Add to Wishlist
//     </button>
//   </div>
// );
