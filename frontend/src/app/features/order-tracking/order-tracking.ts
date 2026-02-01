import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslateModule],
  templateUrl: './order-tracking.html',
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order: any = null;
  isLoading = true;
  error: string | null = null;
  currentLang: string;
  private langChangeSub!: Subscription;

  public imageBaseUrl = environment.imageBaseUrl;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private translate: TranslateService
  ) {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang;
  }

  ngOnInit(): void {
    this.loadOrderDetails();
    this.langChangeSub = this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.loadOrderDetails();
    });
  }

  loadOrderDetails(): void {
    this.isLoading = true;
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.orderService.getOrder(orderId, this.currentLang).subscribe({
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

  parseNote(note: string): { key: string, params?: object } {
    try {
      const parsed = JSON.parse(note);
      return typeof parsed === 'object' ? parsed : { key: note };
    } catch (e) {
      return { key: note };
    }
  }

  ngOnDestroy(): void {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }
}