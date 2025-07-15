import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-management.html',
  styleUrls: ['./product-management.css']
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  products: any[] = [];
  isLoading = true;
  error: string | null = null;
  isAddProductModalOpen = false;
  isImporting = false;


  // Controlli per i filtri e la ricerca
  searchControl = new FormControl('');
  statusFilterControl = new FormControl('all');

  // Gestione dell'ordinamento
  sort = {
    by: 'productId',
    order: 'DESC'
  };

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchProducts();

    // Ascolta i cambiamenti della barra di ricerca
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.fetchProducts());

    // Ascolta i cambiamenti del filtro di stato
    this.statusFilterControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.fetchProducts());
  }

  fetchProducts(): void {
    this.isLoading = true;
    const options = {
      search: this.searchControl.value || '',
      status: this.statusFilterControl.value === 'all' ? '' : this.statusFilterControl.value,
      sortBy: this.sort.by,
      sortOrder: this.sort.order,
      lang: 'en-US' // o dinamico
    };

    this.productService.getAdminProductList(options).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Impossibile caricare i prodotti.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // Gestisce il click sulle intestazioni per ordinare
  sortBy(column: string): void {
    if (this.sort.by === column) {
      this.sort.order = this.sort.order === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sort.by = column;
      this.sort.order = 'ASC';
    }
    this.fetchProducts();
  }

  toggleVariantStatus(variant: any, event: Event): void {
    event.stopPropagation();
    
    const newStatus = !variant.isActive;
    const actionText = newStatus ? 'attivare' : 'disattivare';

    if (confirm(`Sei sicuro di voler ${actionText} la variante "${variant.productName} - ${variant.variantSku}"?`)) {
      
      this.productService.updateVariantStatus(variant.variantId, newStatus).subscribe({
        next: () => {
          variant.isActive = newStatus;
        },
        error: (err) => {
          console.error('Failed to update variant status:', err);
          alert('Errore: impossibile aggiornare lo stato della variante.');
        }
      });
    }
  }

  openAddProductModal(): void {
    this.isAddProductModalOpen = true;
  }

  closeAddProductModal(): void {
    this.isAddProductModalOpen = false;
  }

  navigateToAddManually(): void {
    this.closeAddProductModal();
    this.router.navigate(['/admin/products/new']);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.isImporting = true;
      this.closeAddProductModal();
      
      this.productService.importCsv(file).subscribe({
        next: (response) => {
          alert(`Successo: ${response.message}`);
          this.isImporting = false;
          this.fetchProducts(); // Ricarica la lista
        },
        error: (err) => {
          alert(`Errore: ${err.error.message}`);
          this.isImporting = false;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
