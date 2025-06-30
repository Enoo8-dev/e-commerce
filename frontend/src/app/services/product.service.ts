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

  /** * Fetches a product by its ID and transforms image paths to full URLs.
   * @param id The ID of the product.
   * @param languageCode The desired language.
   * @returns An observable of the product.
   */
  getProductById(id: string, languageCode: string): Observable<any> {
    const params = new HttpParams().set('lang', languageCode);
    return this.http.get<any>(`${this.apiUrl}/products/${id}`, { params }).pipe(
      // Trasforma tutti gli URL delle immagini
      map(product => {
        if (product && product.variants) {
          product.variants.forEach((variant: any) => {
            if (variant.images) {
              variant.images = variant.images.map((image: any) => ({
                ...image,
                image_url: `${this.backendUrl}${image.image_url}`
              }));
            }
          });
        }
        return product;
      })
    );
  }

  /**
   * Fetches a filterable/sortable list for the admin panel.
   * @param options The filter and sort options.
   * @returns An observable of the products array.
   */
  getAdminProductList(options: { [key: string]: any }): Observable<any[]> {
    let params = new HttpParams();
    for (const key in options) {
      if (options[key]) {
        params = params.set(key, options[key]);
      }
    }
    return this.http.get<any[]>(`${this.apiUrl}/admin/products`, { params }).pipe(
      map(products => products.map(product => ({
        ...product,
        imageUrl: product.imageUrl ? `${this.backendUrl}${product.imageUrl}` : null
      })))
    );
  }

  /**
   * Updates the active status of a single product variant.
   * @param variantId The ID of the variant.
   * @param isActive The new status.
   */
  updateVariantStatus(variantId: number, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/variants/${variantId}/status`, { isActive });
  }

  /**
   * Fetches the details of a product for the admin panel.
   * @param productId The ID of the product.
   * @param languageCode The desired language.
   * @returns An observable of the product details.
   */
  getAdminProductDetails(productId: string, languageCode: string): Observable<any> {
    const params = new HttpParams().set('lang', languageCode);
    return this.http.get<any>(`${this.apiUrl}/admin/products/${productId}`, { params });
  }

  /**
   * Sends the updated product data to the backend.
   * @param productId The ID of the product to update.
   * @param productData The updated product data.
   * @returns An observable of the updated product.
   */
  updateProduct(productId: string, productData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/products/${productId}`, productData);
  }

 
  uploadImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/images/upload`, formData);
  }


  /**
   * Deletes an image by its ID.
   * @param imageId The ID of the image to delete.
   * @returns An observable of the deletion response.
   */
  deleteImage(imageId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/images/${imageId}`);
  }

  /**
   * Reorders images for a specific variant.
   * @param imageIds The ordered list of image IDs.
   * @returns An observable of the reorder response.
   */
  reorderImages(imageIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/images/reorder`, { imageIds });
  }

  /**
   * Fetches the list of brands and categories for the admin panel.
   * @param languageCode The desired language.
   * @returns An observable of the brands and categories.
   */
  getBrands(languageCode: string): Observable<any[]> {
    const params = new HttpParams().set('lang', languageCode);
    return this.http.get<any[]>(`${this.apiUrl}/admin/brands`, { params });
  }

  /**
   * Fetches the list of categories for the admin panel.
   * @param languageCode The desired language.
   * @returns An observable of the categories.
   */
  getCategories(languageCode: string): Observable<any[]> {
    const params = new HttpParams().set('lang', languageCode);
    return this.http.get<any[]>(`${this.apiUrl}/admin/categories`, { params });
  }

  /**
   * Creates a new product in the admin panel.
   * @param productData The data of the product to create.
   * @returns An observable of the created product.
   */
  createProduct(productData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/products`, productData);
  }

  /**
   * Fetches the attributes for the product form in the admin panel.
   * @param languageCode The desired language.
   * @returns An observable of the attributes.
   */
  getAttributesForForm(languageCode: string): Observable<any[]> {
    const params = new HttpParams().set('lang', languageCode);
    return this.http.get<any[]>(`${this.apiUrl}/admin/attributes`, { params });
  }

}
