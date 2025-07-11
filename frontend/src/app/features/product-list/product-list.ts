import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

declare var Toastify: any;

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoading = true;
  error: string | null = null;
  isLoggedIn = false;
  
  private authSub!: Subscription;
  private langChangeSub!: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.isLoggedIn$.subscribe(status => this.isLoggedIn = status);
    
    this.loadProducts();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    const currentLanguage = this.translate.currentLang || this.translate.defaultLang;
    this.productService.getProducts(currentLanguage).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  addToCart(product: Product, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isLoggedIn) {
      this.translate.get('PRODUCTS.DETAILS.LOGIN_REQUIRED_TOAST').subscribe((translations: string) => {
        Toastify({
          text: translations,
          duration: 3000,
          destination: '/login',
          close: true,
          gravity: "bottom",
          position: "right",
          style: { background: "linear-gradient(to right, #E53935, #EF5350)", cursor: "pointer", borderRadius: "0.5rem" }
        }).showToast();
      });
      // Naviga alla pagina di login
      this.router.navigate(['/login']);
      return;
    }

    // Ricostruiamo gli oggetti 'product' e 'variant' come si aspetta il CartService
    const productInfo = {
      id: product.productId,
      name: product.productName,
      brandName: product.brandName
    };
    const variantInfo = {
      id: product.variantId,
      sku: product.variantSku,
      originalPrice: product.originalPrice,
      currentSalePrice: product.currentSalePrice,
      stock_quantity: product.stock_quantity,
      images: [{ image_url: product.imageUrl }],
      attributes: []
    };

    this.cartService.addToCart(productInfo, variantInfo, 1);

    this.translate.get('PRODUCTS.DETAILS.ADDED_TO_CART_TOAST').subscribe((translations: string) => {
      Toastify({
        text: translations,
        duration: 3000,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(to right, #313b47, #1e2939)", // Gradiente scuro
          borderRadius: "0.5rem"
        }
      }).showToast();
    });
  }

  encodeURIComponent(str: string): string {
    return encodeURIComponent(str);
  }

  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.langChangeSub) this.langChangeSub.unsubscribe();
  }
}