// src/utils/megaMenuLayout.js
export const getGridColumns = (columnCount) => {
  if (columnCount <= 3) return "grid-cols-3";
  if (columnCount <= 4) return "grid-cols-4";
  if (columnCount <= 6) return "grid-cols-5";
  return "grid-cols-6";
};

export const MEGA_MENU_CONFIG = {
  MAX_ITEMS_PER_COLUMN: 5,
  MAX_FEATURED_ITEMS: 3,
  CARET_SIZE: 3,
};
