// A central place for all megamenu content.
// Keys correspond to the `href` in the main categories array.
export const megaMenuData = {
  "/furniture": {
    columns: [
      {
        title: "Living Room",
        links: [
          { name: "Sofas & Sectionals", href: "/furniture/living-room/sofas" },
          { name: "Coffee & Side Tables", href: "/furniture/living-room/tables" },
          { name: "TV Stands & Media", href: "/furniture/living-room/media" },
          { name: "Bookshelves & Storage", href: "/furniture/living-room/storage" },
        ],
      },
      {
        title: "Bedroom",
        links: [
          { name: "Beds & Headboards", href: "/furniture/bedroom/beds" },
          { name: "Dressers & Chests", href: "/furniture/bedroom/dressers" },
          { name: "Nightstands", href: "/furniture/bedroom/nightstands" },
          { name: "Mattresses", href: "/furniture/bedroom/mattresses" },
        ],
      },
      {
        title: "Office",
        links: [
          { name: "Desks", href: "/furniture/office/desks" },
          { name: "Office Chairs", href: "/furniture/office/chairs" },
          { name: "Filing Cabinets", href: "/furniture/office/cabinets" },
        ],
      },
    ],
    featured: {
      title: "New Collection: The Minimalist Desk",
      description: "Crafted for focus and style.",
      href: "/products/minimalist-desk",
      imageUrl: "https://images.unsplash.com/photo-1555212697-194d092e3b8f?auto=format&fit=crop&w=800&q=80",
    },
  },
  "/decor": {
    columns: [
      {
        title: "Art & Wall Décor",
        links: [
          { name: "Prints & Posters", href: "/decor/wall/prints" },
          { name: "Mirrors", href: "/decor/wall/mirrors" },
          { name: "Wall Shelves", href: "/decor/wall/shelves" },
        ],
      },
      {
        title: "Home Accents",
        links: [
          { name: "Vases & Bowls", href: "/decor/accents/vases" },
          { name: "Candles & Holders", href: "/decor/accents/candles" },
          { name: "Pillows & Throws", href: "/decor/accents/textiles" },
        ],
      },
    ],
    featured: {
      title: "Handwoven Throws",
      description: "Add warmth and texture to any room.",
      href: "/collections/handwoven-throws",
      imageUrl: "https://images.unsplash.com/photo-1618221381711-42ca7ab54806?auto=format&fit=crop&w=800&q=80",
    },
  },
  // You can add an entry for "/lighting" here as well
};
