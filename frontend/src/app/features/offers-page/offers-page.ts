import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';

declare var Toastify: any;

@Component({
  selector: 'app-offers-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './offers-page.html',
  styleUrls: ['./offers-page.css']
})
export class OffersPageComponent implements OnInit, OnDestroy {
  layoutData: any = null;
  isLoading = true;
  isLoggedIn = false;
  wishlist: number[] = [];

  private authSub!: Subscription;
  private wishlistSub!: Subscription;
  private langChangeSub!: Subscription;

  constructor(
    private productService: ProductService,
    private translate: TranslateService,
    private cartService: CartService,
    private authService: AuthService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.isLoggedIn$.subscribe(status => this.isLoggedIn = status);
    this.wishlistSub = this.wishlistService.wishlist$.subscribe(wishlistItems => {
      this.wishlist = wishlistItems.map(item => item.variantId);
    });
    
    this.loadOffers();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => this.loadOffers());
  }

  loadOffers(): void {
    this.isLoading = true;
    const lang = this.translate.currentLang || this.translate.defaultLang;
    this.productService.getOffersPageLayout(lang).subscribe(data => {
      this.layoutData = data;
      this.isLoading = false;
    });
  }

  addToCart(product: any, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    const productInfo = { id: product.productId, name: product.productName, brandName: product.brandName };
    const variantInfo = { id: product.variantId, sku: product.variantSku, originalPrice: product.originalPrice, currentSalePrice: product.currentSalePrice, stock_quantity: product.stock_quantity, images: [{ image_url: product.imageUrl }], attributes: [] };
    this.cartService.addToCart(productInfo, variantInfo, 1);
    Toastify({ text: "Prodotto aggiunto al carrello!", duration: 3000, style: { background: "#181111" } }).showToast();
  }

  toggleWishlist(product: any, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    const variantId = product.variantId;
    if (this.wishlist.includes(variantId)) {
      this.wishlistService.removeFromWishlist(variantId).subscribe();
    } else {
      this.wishlistService.addToWishlist(variantId).subscribe();
    }
  }

  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.wishlistSub) this.wishlistSub.unsubscribe();
    if (this.langChangeSub) this.langChangeSub.unsubscribe();
  }
}
