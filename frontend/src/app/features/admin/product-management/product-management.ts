import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './product-management.html',
  styleUrls: ['./product-management.css']
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  products: any[] = [];
  isLoading = true;
  error: string | null = null;

  // Controlli per i filtri e la ricerca
  searchControl = new FormControl('');
  statusFilterControl = new FormControl('all');

  // Gestione dell'ordinamento
  sort = {
    by: 'productId',
    order: 'DESC'
  };

  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService) {}

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
      lang: 'it-IT' // o dinamico
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

  // Logica per il toggle (per ora solo visuale)
  toggleProductStatus(product: any, event: Event): void {
    event.stopPropagation(); // Impedisce al link della riga di attivarsi
    console.log(`Toggle status for product: ${product.productId}`);
    // Qui andrà la logica per il modale di conferma e la chiamata API
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
