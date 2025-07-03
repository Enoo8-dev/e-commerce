import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { ProductService } from './product.service';

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

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>(this.getCartFromStorage());
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(
    private productService: ProductService
  ) { }

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

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, existingItem.stock);
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
        stock: variant.stock,
        isActive: variant.isActive,
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

  validateCart(): Observable<CartItem[]> {
    const currentItems = this.getCartFromStorage();
    if (currentItems.length === 0) {
      return of([]);
    }

    const variantIds = currentItems.map(item => item.variantId);

    return this.productService.validateCart(variantIds).pipe(
      tap(validatedItems => {
        const updatedCart: CartItem[] = [];

        currentItems.forEach(localItem => {
          const serverItem = validatedItems.find(v => v.variantId === localItem.variantId);

          if (serverItem && serverItem.isActive) {
            // Aggiorna prezzo e stock con i dati freschi dal server
            localItem.originalPrice = serverItem.originalPrice;
            localItem.currentSalePrice = serverItem.currentSalePrice;
            localItem.stock = serverItem.stock;
            localItem.quantity = Math.min(localItem.quantity, serverItem.stock);

            if (localItem.quantity > 0) {
              updatedCart.push(localItem);
            }
          }
        });

        this.saveCartToStorage(updatedCart);
      })
    );
  }

  clearCart(): void {
    this.saveCartToStorage([]);
  }
}