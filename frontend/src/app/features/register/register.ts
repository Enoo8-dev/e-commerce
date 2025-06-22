import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

export function passwordMatcher(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null); // Clear the error if passwords match
    }
    return null; // No error
  }
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      passwordGroup: this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
      }, { validators: passwordMatcher })
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // Mark all controls as touched to show validation errors
      return;
    }

    this.isLoading = true;
    this.errorMessage = null; // Reset error message
    this.successMessage = null; // Reset success message

    const formValue = this.registerForm.value;
    const userData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      password: formValue.passwordGroup.password
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.isLoading = false;
        this.successMessage = 'Registration successful! You can now log in.';
        setTimeout(() => {
          this.router.navigate(['/login']); // Redirect to login after successful registration
        }, 3000); // Redirect after 2 seconds
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        console.error('Registration error:', err);
      }
    }); 
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get passwordGroup() {
    return this.registerForm.get('passwordGroup') as FormGroup;
  }
  
  get password() {
    return this.passwordGroup.get('password');
  }

  get confirmPassword() {
    return this.passwordGroup.get('confirmPassword');
  }
}
