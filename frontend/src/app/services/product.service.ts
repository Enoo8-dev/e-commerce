import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product.model'; // We use the model we just created

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private backendUrl = 'http://localhost:3000'; 
  // The base URL of our backend API
  private apiUrl = `${this.backendUrl}/api`;

  constructor(private http: HttpClient) { }

  private transformProductData(products: Product[]): Product[] {
    return products.map(product => ({
      ...product,
      imageUrl: product.imageUrl ? `${this.backendUrl}${product.imageUrl}` : undefined
    }));
  }

  /**
   * Fetches all products and transforms image paths to full URLs.
   * @param languageCode The desired language.
   * @returns An observable of the products array.
   */
  getProducts(languageCode: string): Observable<Product[]> {
    const params = new HttpParams().set('lang', languageCode);
    return this.http.get<Product[]>(`${this.apiUrl}/products`, { params }).pipe(
      map(this.transformProductData.bind(this))
    );
  }

  /**
   * Fetches a single product by its ID and transforms image paths to full URLs.
   * @param languageCode The desired language.
   * @param limit The maximum number of products to fetch.
   * @returns An observable of the product.
   */
  getFeaturedProducts(languageCode: string, limit: number = 8): Observable<Product[]> {
    const params = new HttpParams()
      .set('lang', languageCode)
      .set('limit', limit.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/products/featured`, { params }).pipe(
      map(this.transformProductData.bind(this))
    );
  }

  /**
   * Fetches the latest products on sale.
   * @param languageCode The desired language.
   * @param limit The maximum number of products to fetch.
   * @returns An observable of the products on sale.
   */
  getLatestOffers(languageCode: string, limit: number = 4): Observable<Product[]> {
    const params = new HttpParams()
      .set('lang', languageCode)
      .set('limit', limit.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/products/offers`, { params }).pipe(
      map(this.transformProductData.bind(this))
    );
  }

  /**
   * Fetches the newest products from the backend.
   * @param languageCode The desired language.
   * @param limit The maximum number of products to fetch.
   */
  getNewestProducts(languageCode: string, limit: number = 8): Observable<Product[]> {
    const params = new HttpParams()
      .set('lang', languageCode)
      .set('limit', limit.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/products/newest`, { params }).pipe(
      map(this.transformProductData.bind(this))
    );
  }

}
