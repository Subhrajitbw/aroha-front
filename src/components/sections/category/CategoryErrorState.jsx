// components/category/CategoryErrorState.jsx
import { AlertTriangle, RefreshCw } from "lucide-react";
import EmptyState from "../carousel/EmptyState";

export default function CategoryErrorState({ onRetry }) {
  return (
    <div className="w-full py-12">
      <div className="w-full mx-auto">
        <EmptyState
          icon={<AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400" />}
          title="Failed to Load Categories"
          description="We couldn't load the categories. Please try again."
        />
        <div className="flex justify-center mt-6">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
