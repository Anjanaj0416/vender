export interface VariantAttribute {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  units: number;
  price: number;
  image?: string;
  reOrderLevel: number;
  attributes: VariantAttribute[];
}

export interface Product1 {
  id: string;
  name: string;
  images?: string[];
  variants?: ProductVariant[];
  minPrice: number;
  maxPrice: number;
  brand?: string;
  category: { id: string; name: string };
}
