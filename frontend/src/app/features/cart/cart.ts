import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './cart.html',
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  total = 0;
  private cartSub!: Subscription;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.validateCart().subscribe(() => {
      // Solo dopo la validazione, ci iscriviamo per mostrare i dati aggiornati
      this.cartSub = this.cartService.cartItems$.subscribe(items => {
        this.cartItems = items;
        this.calculateTotal();
      });
    });
  }

  calculateTotal(): void {
    this.total = this.cartItems.reduce((sum, item) => {
      const priceToUse = item.currentSalePrice ?? item.originalPrice;
      return sum + (priceToUse * item.quantity);
    }, 0);
  }

  updateQuantity(variantId: number, event: any): void {
    const quantity = parseInt(event.target.value, 10);
    if (!isNaN(quantity)) {
      this.cartService.updateQuantity(variantId, quantity);
    }
  }

  removeItem(variantId: number): void {
    this.cartService.removeFromCart(variantId);
  }

  ngOnDestroy(): void {
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
  }
}