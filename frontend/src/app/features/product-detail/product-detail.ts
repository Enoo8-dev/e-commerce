import { Component, OnInit, OnDestroy } from '@angular/core'; // Aggiungi OnDestroy
import { CommonModule, KeyValuePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { switchMap, Subscription } from 'rxjs'; // Aggiungi Subscription

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule, KeyValuePipe],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: any = null;
  selectedVariant: any = null;
  mainImage: string = '';
  isLoading = true;
  error: string | null = null;
  private langChangeSub!: Subscription; // Variabile per la sottoscrizione

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Carica i dati la prima volta
    this.fetchProductDetails();

    // Si mette in ascolto per futuri cambi di lingua e ricarica i dati
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.fetchProductDetails();
    });
  }

  // Abbiamo incapsulato la logica di fetch in una funzione riutilizzabile
  fetchProductDetails(): void {
    this.isLoading = true;
    this.error = null;
    const currentLang = this.translate.currentLang || this.translate.defaultLang;
    
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          this.error = 'Product ID not found.';
          this.isLoading = false;
          throw new Error('Product ID is null');
        }
        return this.productService.getProductById(id, currentLang);
      })
    ).subscribe({
      next: (data) => {
        this.product = data;

        // Parsifica il campo 'features' se è una stringa
        if (this.product && typeof this.product.features === 'string') {
          try {
            this.product.features = JSON.parse(this.product.features);
          } catch (e) {
            console.error('Failed to parse features JSON string:', e);
            this.product.features = null;
          }
        }

        if (this.product && this.product.variants.length > 0) {
          this.selectVariant(this.product.variants[0]);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load product details.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  ngOnDestroy(): void {
    // Pulisce l'iscrizione per evitare memory leaks
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }

  selectVariant(variant: any): void {
    this.selectedVariant = variant;
    this.setMainImageForVariant(variant);
  }

  setMainImageForVariant(variant: any): void {
    if (!variant || !variant.images || variant.images.length === 0) {
      this.mainImage = 'https://placehold.co/600x600/F4F0F0/181111?text=No+Image';
      return;
    }
    const primaryImage = variant.images.find((img: any) => img.is_primary);
    this.mainImage = primaryImage ? primaryImage.image_url : variant.images[0].image_url;
  }

  changeMainImage(imageUrl: string): void {
    this.mainImage = imageUrl;
  }
}
