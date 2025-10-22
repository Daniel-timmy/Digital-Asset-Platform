import React from "react";

/**
 * MasonryGrid Component
 * A responsive masonry layout container for displaying cards
 * 
 * Usage:
 * <MasonryGrid>
 *   {products.map(product => (
 *     <Card key={product.id} product={product} ... />
 *   ))}
 * </MasonryGrid>
 */
export default function MasonryGrid({ children, columns = { sm: 1, md: 2, lg: 3, xl: 4 } }) {
  return (
    <div 
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-0"
      style={{
        columnGap: '1.5rem',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Alternative Grid-based Masonry (if CSS columns don't work well)
 * This uses a more manual approach with better control
 */
export function MasonryGridAlt({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-auto">
      {children}
    </div>
  );
}