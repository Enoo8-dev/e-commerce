export interface CartItem {
  variantId: number;
  productId: number;
  productName: string;
  brandName: string;
  sku: string;
  originalPrice: number;
  currentSalePrice: number | null;
  quantity: number;
  imageUrl?: string;
  stock: number;
  isActive?: boolean; 
  attributes: { attribute_name: string, attribute_value: string }[];
}