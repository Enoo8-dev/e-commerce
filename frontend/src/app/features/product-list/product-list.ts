import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for pipes like 'currency'
import { RouterLink } from '@angular/router'; // Import RouterLink for navigation

import { ProductService } from '../../services/product.service'; // CORRECTED PATH: ../ goes up one level to 'app'
import { Product } from '../../models/product.model';       // CORRECTED PATH: ../ goes up one level to 'app'

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink], // Added RouterLink to imports
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductListComponent implements OnInit {
  // An array to hold the products fetched from the API
  products: Product[] = [];
  // A state to handle the loading screen
  isLoading: boolean = true;
  // A state to handle potential errors
  error: string | null = null;

  // Inject the ProductService through the constructor
  constructor(private productService: ProductService) {}

  // This method is part of the component lifecycle and runs on initialization
  ngOnInit(): void {
    // We'll use 'it-IT' for now. This could be made dynamic later.
    const currentLanguage = 'it-IT'; 

    this.productService.getProducts(currentLanguage).subscribe({
      // CORRECTED: Added explicit type for 'data'
      next: (data: Product[]) => { 
        // If the API call is successful, update the products array
        this.products = data;
        this.isLoading = false; // Turn off loading
      },
      // CORRECTED: Added explicit type for 'err'
      error: (err: any) => { 
        // If an error occurs, store the error message
        this.error = 'Failed to load products. Please try again later.';
        this.isLoading = false; // Turn off loading
        console.error('API Error:', err);
      }
    });
  }
}
