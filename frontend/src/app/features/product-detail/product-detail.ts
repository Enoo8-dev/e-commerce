import { Component, OnInit, OnDestroy } from '@angular/core'; // Aggiungi OnDestroy
import { CommonModule, KeyValuePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { switchMap, Subscription } from 'rxjs'; // Aggiungi Subscription
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms'; // Importa FormsModule per ngModel
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service'; // Aggiunto per il servizio della wishlist

declare var Toastify: any; // Dichiara Toastify per evitare errori di compilazione

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule, KeyValuePipe, FormsModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: any = null;
  selectedVariant: any = null;
  mainImage: string = '';
  isLoading = true;
  error: string | null = null;
  quantity: number = 1; // Aggiunto per gestire la quantità
  private langChangeSub!: Subscription; // Variabile per la sottoscrizione
  isLoggedIn: boolean = false; // Aggiunto per verificare se l'utente è loggato
  isWishlisted = false;
  private wishlistSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private translate: TranslateService,
    private cartService: CartService, // Aggiunto per il servizio del carrello
    private authService: AuthService, // Aggiunto per il servizio di autenticazione
    private router: Router, // Aggiunto per la navigazione
    private wishlistService: WishlistService // Aggiunto per il servizio della wishlist
  ) {}

  ngOnInit(): void {

    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });

    this.wishlistSub = this.wishlistService.wishlist$.subscribe((wishlistItems: any[]) => {
      if (this.selectedVariant) {
        this.isWishlisted = wishlistItems.some(item => item.variantId === this.selectedVariant.id);
      }
    });

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
        console.log('Product details loaded:', this.product);
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
    if (this.wishlistSub) this.wishlistSub.unsubscribe();
  }

  selectVariant(variant: any): void {
    this.selectedVariant = variant;
    this.setMainImageForVariant(variant);
    this.quantity = 1; 
    this.isWishlisted = this.wishlistService.isInWishlist(this.selectedVariant.id);
  }

  setMainImageForVariant(variant: any): void {
    if (!variant || !variant.images || variant.images.length === 0) {
      this.mainImage = `https://placehold.co/600x600/F4F0F0/181111?text=No+Image`;
      return;
    }
    const primaryImage = variant.images.find((img: any) => img.is_primary);
    this.mainImage = primaryImage ? primaryImage.image_url : variant.images[0].image_url;
  }

  changeMainImage(imageUrl: string): void {
    this.mainImage = imageUrl;
  }

toggleWishlist(): void {
    if (!this.selectedVariant || !this.isLoggedIn) {
        this.showToast('Devi effettuare il login per usare la wishlist.', false);
        this.router.navigate(['/login']);
        return;
    }

    const variantId = this.selectedVariant.id;
    const wasWishlisted = this.isWishlisted;

    const action$ = wasWishlisted 
      ? this.wishlistService.removeFromWishlist(variantId) 
      : this.wishlistService.addToWishlist(variantId);

    action$.subscribe({
      next: () => {
        const messageKey = wasWishlisted ? 'WISHLIST.REMOVED' : 'WISHLIST.ADDED';
        this.showToast(messageKey, !wasWishlisted);
      },
      error: () => {
        alert('Si è verificato un errore. Riprova.');
      }
    });
  }

  addToCart(): void {
    if (this.quantity <= 0 || !this.quantity || this.quantity === null || this.quantity === undefined) {
      this.showToast('PRODUCTS.DETAILS.INVALID_QUANTITY_TOAST', false);
      return;
    }

    if (!this.isLoggedIn) {
      this.translate.get('PRODUCTS.DETAILS.LOGIN_REQUIRED_TOAST').subscribe((translations: string) => {
        Toastify({
          text: translations,
          duration: 3000,
          close: true,
          gravity: "bottom",
          position: "right",
          escapeMarkup: false, // Permette l'uso di HTML
          style: {
            background: "linear-gradient(to right, #E53935, #EF5350)",
            borderRadius: "0.5rem",
            cursor: "pointer" // Rende chiaro che è cliccabile
          },
          // Al click, naviga alla pagina di login
          onClick: () => this.router.navigate(['/login'])
        }).showToast();
      });
      return;
    }

    if (!this.product || !this.selectedVariant) return;

    if (this.quantity > this.selectedVariant.stock_quantity) {
      this.showToast('PRODUCTS.DETAILS.QUANTITY_EXCEEDS_STOCK_TOAST', false); 
      return;
    }

    if (this.selectedVariant.stock_quantity === 0) {
      this.showToast('PRODUCTS.DETAILS.STOCK_UNAVAILABLE_TOAST', false); 
      return;
    }

    this.cartService.addToCart(this.product, this.selectedVariant, this.quantity);

    this.showToast('PRODUCTS.DETAILS.ADDED_TO_CART_TOAST', true); 
  }

  showToast(messageKey: string, isSuccess: boolean = false): void {
    this.translate.get(messageKey).subscribe((message: string) => {
      Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "bottom",
        position: "right",
        style: {
          background: isSuccess ? "linear-gradient(to right, #313b47, #1e2939)" : "linear-gradient(to right, #E53935, #EF5350)",
          borderRadius: "0.5rem"
        }
      }).showToast();
    });
  }

}