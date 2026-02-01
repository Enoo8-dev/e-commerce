import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CartItem } from '../../models/cart-item.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.css']
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlistItems: CartItem[] = [];
  isLoading = true;
  
  private wishlistSub!: Subscription;
  private langChangeSub!: Subscription;

  public imageBaseUrl = environment.imageBaseUrl

  constructor(
    private wishlistService: WishlistService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Si iscrive allo stato della wishlist nel servizio per aggiornare l'UI
    this.wishlistSub = this.wishlistService.wishlist$.subscribe(items => {
      this.wishlistItems = items;
      this.isLoading = false; // Nasconde il caricamento una volta ricevuti i dati
    });

    // Si mette in ascolto dei cambi di lingua
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.loadWishlist();
    });
  }

  // Funzione dedicata per caricare/ricaricare la wishlist
  loadWishlist(): void {
    this.isLoading = true;
    this.wishlistService.fetchWishlist().subscribe({
      // La logica di aggiornamento è gestita dalla sottoscrizione in ngOnInit
      // Qui gestiamo solo lo stato di caricamento in caso di errore
      error: () => this.isLoading = false
    });
  }

  removeFromWishlist(variantId: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // La chiamata al servizio aggiorna il BehaviorSubject, 
    // e la nostra sottoscrizione in ngOnInit aggiorna automaticamente la vista.
    this.wishlistService.removeFromWishlist(variantId).subscribe();
  }

  ngOnDestroy(): void {
    if (this.wishlistSub) {
      this.wishlistSub.unsubscribe();
    }
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }
}
