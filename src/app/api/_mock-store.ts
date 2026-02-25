// Shared mutable in-memory store.
// Both the GET /api/vendor/products route and the
// PATCH /api/vendor/products/[productId]/variants/[variantId] route
// reference this same object, so PATCH mutations are immediately
// visible to the next GET refetch — no database needed for the mock.

interface VariantAttribute {
  name: string;
  value: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  units: number;
  price: number;
  reOrderLevel: number;
  attributes: VariantAttribute[];
}

interface MockProduct {
  id: string;
  name: string;
  images: string[];
  minPrice: number;
  maxPrice: number;
  brand: string;
  category: { id: string; name: string };
  variants: ProductVariant[];
}

const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "P001",
    name: "Wireless Noise-Cancelling Headphones",
    images: ["https://images.philips.com/is/image/philipsconsumer/491e2dd5e0d1466f8ee5b0cd010451ae?wid=700&hei=700&$pnglarge$"],
    minPrice: 12500,
    maxPrice: 14000,
    brand: "Sony",
    category: { id: "C1", name: "Electronics" },
    variants: [
      {
        id: "V001", sku: "I0001", units: 14, price: 12500, reOrderLevel: 5,
        attributes: [{ name: "Color", value: "Black" }],
      },
      {
        id: "V002", sku: "I0002", units: 3, price: 14000, reOrderLevel: 5,
        attributes: [{ name: "Color", value: "White" }],
      },
    ],
  },
  {
    id: "P002",
    name: "Leather Crossbody Bag",
    images: [],
    minPrice: 4800,
    maxPrice: 5200,
    brand: "LeatherCo",
    category: { id: "C2", name: "Fashion" },
    variants: [
      {
        id: "V003", sku: "I0003", units: 120, price: 4800, reOrderLevel: 10,
        attributes: [{ name: "Size", value: "Medium" }],
      },
    ],
  },
  {
    id: "P003",
    name: "Mechanical Keyboard TKL",
    images: [],
    minPrice: 18900,
    maxPrice: 21000,
    brand: "Keychron",
    category: { id: "C1", name: "Electronics" },
    variants: [
      {
        id: "V004", sku: "I0004", units: 0, price: 18900, reOrderLevel: 3,
        attributes: [{ name: "Switch", value: "Red" }],
      },
      {
        id: "V005", sku: "I0005", units: 5, price: 21000, reOrderLevel: 3,
        attributes: [{ name: "Switch", value: "Blue" }],
      },
    ],
  },
  {
    id: "P004",
    name: "Ceramic Pour-Over Coffee Set",
    images: [],
    minPrice: 3200,
    maxPrice: 3200,
    brand: "BrewCo",
    category: { id: "C3", name: "Kitchen" },
    variants: [
      {
        id: "V006", sku: "I0006", units: 47, price: 3200, reOrderLevel: 8,
        attributes: [{ name: "Color", value: "White" }],
      },
    ],
  },
  {
    id: "P005",
    name: "Running Shoes Ultra Boost",
    images: [],
    minPrice: 22000,
    maxPrice: 24000,
    brand: "Adidas",
    category: { id: "C4", name: "Sports" },
    variants: [
      {
        id: "V007", sku: "I0007", units: 8, price: 22000, reOrderLevel: 5,
        attributes: [{ name: "Size", value: "42" }],
      },
      {
        id: "V008", sku: "I0008", units: 0, price: 22000, reOrderLevel: 5,
        attributes: [{ name: "Size", value: "43" }],
      },
      {
        id: "V009", sku: "I0009", units: 4, price: 24000, reOrderLevel: 5,
        attributes: [{ name: "Size", value: "44" }],
      },
    ],
  },
  {
    id: "P006",
    name: "Bamboo Desk Organizer",
    images: [],
    minPrice: 1450,
    maxPrice: 1450,
    brand: "EcoDesk",
    category: { id: "C5", name: "Office" },
    variants: [
      {
        id: "V010", sku: "I0010", units: 88, price: 1450, reOrderLevel: 15,
        attributes: [{ name: "Style", value: "Classic" }],
      },
    ],
  },
];

// Return the mutable array directly — mutations in PATCH are reflected here.
export function getMockProducts(): MockProduct[] {
  return MOCK_PRODUCTS;
}
