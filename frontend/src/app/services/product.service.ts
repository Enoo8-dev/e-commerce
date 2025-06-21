import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model'; // We use the model we just created

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // The base URL of our backend API
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Fetches all products from the backend.
   * @param languageCode The desired language for product data (e.g., 'it-IT').
   * @returns An Observable containing an array of products.
   */
  getProducts(languageCode: string = 'it-IT'): Observable<Product[]> {
    // We use HttpParams to safely add query parameters to the URL
    const params = new HttpParams().set('lang', languageCode);
    
    // The final URL will be http://localhost:3000/api/products?lang=it-IT
    return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
  }

  // In the future, we will add more methods here, like getProductById(id), etc.
}
