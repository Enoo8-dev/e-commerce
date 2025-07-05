import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { OrderService } from '../../services/order.service';
import { CheckoutService } from '../../services/checkout.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './payment.html',
})
export class PaymentComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  total = 0;
  selectedAddressId: number | null = null;
  isLoading = false;
  
  paymentMethods: any[] = [];
  selectedPaymentMethodId: number | null = null;
  showNewCardForm = false;
  paymentForm!: FormGroup;
  editingMethod: any = null;

  private cartSub!: Subscription;
  private langChangeSub!: Subscription;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private checkoutService: CheckoutService,
    private router: Router,
    private fb: FormBuilder,
    private translate: TranslateService // Inietta il servizio di traduzione
  ) {}

  ngOnInit(): void {
    // Iscrizione iniziale per mostrare i dati del carrello
    this.cartSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });

    // *** CORREZIONE: Si mette in ascolto dei cambi di lingua ***
    // e ri-valida il carrello per ottenere le traduzioni aggiornate.
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.cartService.validateCart().subscribe();
    });
    
    const addressId = sessionStorage.getItem('selectedAddressId');
    if (addressId) this.selectedAddressId = +addressId;

    this.loadPaymentMethods();

    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardName: ['', Validators.required],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });
  }

  loadPaymentMethods(): void {
    this.checkoutService.getPaymentMethods().subscribe(methods => {
      this.paymentMethods = methods;
      const defaultMethod = methods.find(m => m.is_default);
      if (defaultMethod) {
        this.selectedPaymentMethodId = defaultMethod.id;
      }
    });
  }

  calculateTotal(): void {
    this.total = this.cartItems.reduce((sum, item) => {
        const priceToUse = item.currentSalePrice ?? item.originalPrice;
        return sum + (priceToUse * item.quantity);
    }, 0);
  }

  onSaveAndUseCard(): void {
    if (this.paymentForm.invalid) return;
    this.checkoutService.addPaymentMethod(this.paymentForm.value).subscribe(() => {
      this.loadPaymentMethods();
      this.showNewCardForm = false;
      this.paymentForm.reset();
    });
  }

  startEditing(method: any, event: Event): void {
    event.stopPropagation();
    this.editingMethod = method;
    this.paymentForm.patchValue({
      cardName: method.cardholder_name,
      expiryDate: method.expiry_date
    });
    this.paymentForm.get('cardNumber')?.clearValidators();
    this.paymentForm.get('cvc')?.clearValidators();
    this.paymentForm.get('cardNumber')?.updateValueAndValidity();
    this.paymentForm.get('cvc')?.updateValueAndValidity();
    this.showNewCardForm = true;
  }

  cancelEditing(): void {
    this.editingMethod = null;
    this.showNewCardForm = false;
    this.paymentForm.reset();
    this.paymentForm.get('cardNumber')?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
    this.paymentForm.get('cvc')?.setValidators([Validators.required, Validators.pattern(/^\d{3}$/)]);
  }

  onUpdateCard(): void {
    if (!this.editingMethod) return;
    const dataToUpdate = {
      cardName: this.paymentForm.value.cardName,
      expiryDate: this.paymentForm.value.expiryDate
    };
    this.checkoutService.updatePaymentMethod(this.editingMethod.id, dataToUpdate).subscribe(() => {
      this.loadPaymentMethods();
      this.cancelEditing();
    });
  }

  onDeletePaymentMethod(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Sei sicuro di voler eliminare questo metodo di pagamento?')) {
      this.checkoutService.deletePaymentMethod(id).subscribe(() => this.loadPaymentMethods());
    }
  }

  onSetDefaultPaymentMethod(id: number, event: Event): void {
    event.stopPropagation();
    this.checkoutService.setDefaultPaymentMethod(id).subscribe(() => this.loadPaymentMethods());
  }

  placeOrder(): void {
    if (!this.selectedAddressId || (!this.selectedPaymentMethodId && !this.showNewCardForm)) {
      alert('Seleziona un indirizzo e un metodo di pagamento.');
      return;
    }
    if (this.showNewCardForm && this.paymentForm.invalid) {
        alert('Per favore, compila correttamente i dati della nuova carta.');
        return;
    }
    this.isLoading = true;
    const orderData = {
      addressId: this.selectedAddressId,
      items: this.cartItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.currentSalePrice ?? item.originalPrice,
        productName: item.productName
      })),
      totalAmount: this.total,
      paymentMethod: 'credit_card'
    };
    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        this.cartService.clearCart();
        sessionStorage.removeItem('selectedAddressId');
        this.router.navigate(['/order-confirmation', response.orderId]);
      },
      error: (err) => {
        alert('Si è verificato un errore durante la creazione dell\'ordine.');
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cartSub) this.cartSub.unsubscribe();
    if (this.langChangeSub) this.langChangeSub.unsubscribe();
  }
}
