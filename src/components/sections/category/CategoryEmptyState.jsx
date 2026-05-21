// components/category/CategoryEmptyState.jsx
import { AlertTriangle } from "lucide-react";
import EmptyState from "../carousel/EmptyState";

export default function CategoryEmptyState() {
  return (
    <div className="w-full py-12">
      <div className="w-full mx-auto">
        <EmptyState
          icon={<AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />}
          title="No Categories Available"
          description="We're currently updating our catalog. Categories will be available soon."
        />
      </div>
    </div>
  );
}
