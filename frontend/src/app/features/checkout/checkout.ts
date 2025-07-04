import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms'; 
import { CheckoutService } from '../../services/checkout.service';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, TranslateModule], 
  templateUrl: './checkout.html',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  addresses: any[] = [];
  cartItems: CartItem[] = [];
  total = 0;
  
  addressForm!: FormGroup;
  selectedAddressId: number | null = null;
  showNewAddressForm = false;
  editingAddressId: number | null = null; 

  private cartSub!: Subscription;
  private langChangeSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private checkoutService: CheckoutService,
    public cartService: CartService, 
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadAddresses();
    this.cartSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });

    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.cartService.validateCart().subscribe();
    });

    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      postal_code: ['', Validators.required],
      country: ['', Validators.required],
    });
  }

  loadAddresses(): void {
    this.checkoutService.getAddresses().subscribe(data => {
      this.addresses = data;
      const defaultAddress = data.find(addr => addr.is_default);
      if (defaultAddress) {
        this.selectedAddressId = defaultAddress.id;
      } else if (data.length > 0) {
        this.selectedAddressId = data[0].id;
      }
    });
  }

  onAddAddress(): void {
    if (this.addressForm.invalid) return;
    this.checkoutService.addAddress(this.addressForm.value).subscribe(() => {
      this.loadAddresses();
      this.showNewAddressForm = false;
      this.addressForm.reset({ country: 'Italia' });
    });
  }

  calculateTotal(): void {
    this.total = this.cartItems.reduce((sum, item) => {
        const priceToUse = item.currentSalePrice ?? item.originalPrice;
        return sum + (priceToUse * item.quantity);
    }, 0);
  }

  onProceedToPayment(): void {
    if (!this.selectedAddressId) {
      alert('Per favore, seleziona un indirizzo di spedizione.');
      return;
    }
    sessionStorage.setItem('selectedAddressId', this.selectedAddressId.toString());
    this.router.navigate(['/checkout/payment']);
  }

  onDeleteAddress(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Sei sicuro di voler eliminare questo indirizzo?')) {
      this.checkoutService.deleteAddress(id).subscribe(() => this.loadAddresses());
    }
  }

  onSetDefault(id: number, event: Event): void {
    event.stopPropagation();
    this.checkoutService.setDefaultAddress(id).subscribe(() => this.loadAddresses());
  }

  startEditing(address: any, event: Event): void {
    event.stopPropagation();
    this.editingAddressId = address.id;
    this.addressForm.patchValue(address);
    this.showNewAddressForm = true;
  }

  cancelEditing(): void {
    this.editingAddressId = null;
    this.showNewAddressForm = false;
    this.addressForm.reset();
  }

  onUpdateAddress(): void {
    if (this.addressForm.invalid || !this.editingAddressId) return;
    this.checkoutService.updateAddress(this.editingAddressId, this.addressForm.value).subscribe(() => {
      this.loadAddresses();
      this.cancelEditing();
    });
  }

  toggleNewAddressForm(): void {
    if (this.showNewAddressForm && !this.editingAddressId) {
      this.addressForm.reset();
    }

    this.editingAddressId = null;
    this.showNewAddressForm = !this.showNewAddressForm;
  }

  ngOnDestroy(): void {
    if (this.cartSub) this.cartSub.unsubscribe();
    if (this.langChangeSub) this.langChangeSub.unsubscribe();
  }
}
