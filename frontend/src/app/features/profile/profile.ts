import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

// Custom Validator
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');
  return newPassword && confirmPassword && newPassword.value !== confirmPassword.value ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, DatePipe, TranslateModule],
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  isLoading = true;
  passwordForm!: FormGroup;
  passwordSuccess: string | null = null;
  passwordError: string | null = null;
  private langChangeSub!: Subscription;

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private fb: FormBuilder,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatchValidator });

    this.loadOrders();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => this.loadOrders());
  }

  loadOrders(): void {
    this.isLoading = true;
    const lang = this.translate.currentLang || this.translate.defaultLang;
    this.orderService.getMyOrders(lang).subscribe(data => {
      this.orders = data;
      this.isLoading = false;
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.passwordSuccess = null;
    this.passwordError = null;
    
    const { oldPassword, newPassword } = this.passwordForm.value;
    
    this.userService.changePassword({ oldPassword, newPassword }).subscribe({
      next: () => {
        this.passwordSuccess = 'Password aggiornata con successo!';
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordError = err.error?.message || 'Errore durante l\'aggiornamento.';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSub) this.langChangeSub.unsubscribe();
  }
}