import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { TranslateService } from '@ngx-translate/core'; // Importa TranslateService

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-edit.html',
  styleUrls: ['./product-edit.css']
})
export class ProductEditComponent implements OnInit {
  editForm!: FormGroup;
  productId: string | null = null;
  currentLang: string;
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private productService: ProductService,
    private translate: TranslateService // Inietta il servizio di traduzione
  ) {
    // Imposta la lingua corrente all'avvio
    this.currentLang = this.translate.currentLang || this.translate.defaultLang;
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('productId');
    
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      is_featured: [false],
      features: [''],
      variants: this.fb.array([])
    });

    if (this.productId) {
      // Usa la lingua corrente per recuperare i dati
      this.productService.getAdminProductDetails(this.productId, this.currentLang).subscribe({
        next: (data) => {
          this.editForm.patchValue({
            name: data.name,
            description: data.description,
            is_featured: data.is_featured,
            features: data.features ? JSON.stringify(data.features, null, 2) : '{}'
          });
          data.variants.forEach((variant: any) => {
            this.variants.push(this.fb.group({
              id: [variant.id],
              sku: [variant.sku, Validators.required],
              price: [variant.originalPrice, [Validators.required, Validators.min(0.01)]],
              sale_price: [variant.sale_price],
              stock: [variant.stock, [Validators.required, Validators.min(0)]], // Ora funziona
              is_active: [variant.is_active]
            }));
          });
          this.isLoading = false;
        },
        error: (err) => { this.error = 'Impossibile caricare i dati del prodotto.'; this.isLoading = false; }
      });
    }
  }

  get variants(): FormArray {
    return this.editForm.get('variants') as FormArray;
  }

  onSubmit(): void {
    if (this.editForm.invalid || !this.productId) return;

    this.isLoading = true;
    const formData = this.editForm.getRawValue();
    
    try {
      formData.features = formData.features ? JSON.parse(formData.features) : {};
    } catch (e) {
      this.error = "Il formato JSON delle 'Specifiche Tecniche' non è valido.";
      this.isLoading = false;
      return;
    }

    // Aggiunge la lingua corrente ai dati da inviare
    const payload = { ...formData, language_code: this.currentLang };
    
    this.productService.updateProduct(this.productId, payload).subscribe({
      next: () => {
        this.successMessage = 'Prodotto aggiornato con successo!';
        this.isLoading = false;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => { this.error = 'Errore durante l\'aggiornamento.'; this.isLoading = false; }
    });
  }
}