import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, TranslateModule],
  templateUrl: './order-tracking.html',
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order: any = null;
  isLoading = true;
  error: string | null = null;
  private langChangeSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadOrderDetails();
    
    // Si mette in ascolto dei cambi di lingua per ricaricare i dati
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.loadOrderDetails();
    });
  }

  loadOrderDetails(): void {
    this.isLoading = true;
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      const lang = this.translate.currentLang || this.translate.defaultLang;
      this.orderService.getOrder(orderId, lang).subscribe({
        next: (data) => { 
          this.order = data; 
          this.isLoading = false; 
        },
        error: () => { 
          this.error = 'Ordine non trovato.'; 
          this.isLoading = false; 
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }
}