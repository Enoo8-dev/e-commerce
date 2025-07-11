export interface Product {
  productId: number;
  productName: string;
  productDescription: string;
  brandName: string;
  originalPrice: number;
  currentSalePrice: number | null; // it can be a number or null if not on sale
  variantSku: string;
  imageUrl?: string; // ? because it might not always be present
  variantId: number;
  stock_quantity: number;
}
