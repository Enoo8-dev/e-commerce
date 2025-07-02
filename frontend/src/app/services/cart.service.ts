import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  attributes: { attribute_name: string, attribute_value: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>(this.getCartFromStorage());
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor() { }

  private getCartFromStorage(): CartItem[] {
    if (typeof window !== 'undefined') {
      const cartJson = localStorage.getItem('shopping_cart');
      return cartJson ? JSON.parse(cartJson) : [];
    }
    return [];
  }

  private saveCartToStorage(items: CartItem[]): void {
    localStorage.setItem('shopping_cart', JSON.stringify(items));
    this.cartItemsSubject.next(items);
  }

  addToCart(product: any, variant: any, quantity: number = 1): void {

    const currentItems = [...this.cartItemsSubject.getValue()];
    const existingItem = currentItems.find(i => i.variantId === variant.id);

    console.log('Aggiunta al carrello:', product.name, 'Variante:', variant.id, 'Quantità:', quantity);
    console.log('QexItem:', existingItem );
    console.log("curItem" + currentItems);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const primaryImage = variant.images && variant.images.length > 0 ? variant.images[0].image_url : undefined;
      const newItem: CartItem = {
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        brandName: product.brandName,
        sku: variant.sku,
        originalPrice: variant.originalPrice,
        currentSalePrice: variant.currentSalePrice,
        quantity: quantity,
        imageUrl: primaryImage,
        stock: variant.stock_quantity,
        attributes: variant.attributes || []
      };
      currentItems.push(newItem);
    }
    this.saveCartToStorage(currentItems);
  }

  removeFromCart(variantId: number): void {
    const currentItems = this.cartItemsSubject.getValue().filter(i => i.variantId !== variantId);
    this.saveCartToStorage(currentItems);
  }

  updateQuantity(variantId: number, quantity: number): void {
    console.log('Aggiornamento quantità per variante:', variantId, '\nNuova quantità:', quantity);
    const currentItems = [...this.cartItemsSubject.getValue()];
    const itemIndex = currentItems.findIndex(i => i.variantId === variantId);
    console.log(currentItems[itemIndex].stock, 'Stock disponibile per la variante:', variantId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Rimuove l'elemento se la quantità è 0 o meno
        currentItems.splice(itemIndex, 1);
      } else {
        // Altrimenti, imposta la quantità, assicurandosi che non superi lo stock
        currentItems[itemIndex].quantity = Math.min(quantity, currentItems[itemIndex].stock);
      }
        console.log('Stato del carrello dopo l\'aggiornamento:', currentItems);
      // Salva lo stato aggiornato
      this.saveCartToStorage(currentItems);
    }
  }

  clearCart(): void {
    this.saveCartToStorage([]);
  }
}