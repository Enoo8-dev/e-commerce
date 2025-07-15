import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

declare var Toastify: any;

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './category-page.html',
  styleUrls: ['./category-page.css']
})
export class CategoryPageComponent implements OnInit, OnDestroy {
  layoutData: any[] = [];
  isLoading = true;
  isLoggedIn = false;

  private authSub!: Subscription;
  private langChangeSub!: Subscription;

  constructor(
    private productService: ProductService,
    private translate: TranslateService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.isLoggedIn$.subscribe(status => this.isLoggedIn = status);
    
    this.loadCategories();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => this.loadCategories());
  }

  loadCategories(): void {
    this.isLoading = true;
    const lang = this.translate.currentLang || this.translate.defaultLang;
    this.productService.getCategoryPageLayout(lang).subscribe(data => {
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

  

  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.langChangeSub) this.langChangeSub.unsubscribe();
  }
}
