import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

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
  private langChangeSub!: Subscription;

  constructor(
    private productService: ProductService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.fetchAllProducts();

    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.fetchAllProducts();
    });
  }

  fetchAllProducts(): void {
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
        console.error('API Error:', err);
      }
    });
  }

  encodeURIComponent(str: string): string {
    return encodeURIComponent(str);
  }


  ngOnDestroy(): void {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }
}