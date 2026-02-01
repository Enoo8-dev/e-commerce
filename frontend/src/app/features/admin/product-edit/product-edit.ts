import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DragDropModule, TranslateModule],
  templateUrl: './product-edit.html',
  styleUrls: ['./product-edit.css']
})
export class ProductEditComponent implements OnInit {
  public imageBaseUrl = environment.imageBaseUrl;
  editForm!: FormGroup;
  productId: string | null = null;
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;
  currentLang?: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private productService: ProductService,
    private translate: TranslateService
  ) {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang;
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('productId');
    
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      is_featured: [false],
      features: this.fb.array([]),
      variants: this.fb.array([])
    });

    if (this.productId) {
      const currentLang = this.translate.currentLang || this.translate.defaultLang;
      this.productService.getAdminProductDetails(this.productId, currentLang).subscribe({
        next: (data) => {
          this.editForm.patchValue({
            name: data.name,
            description: data.description,
            is_featured: data.is_featured,
          });

          const featuresObject = data.features ? (typeof data.features === 'string' ? JSON.parse(data.features) : data.features) : {};
          Object.keys(featuresObject).forEach(key => {
            this.addFeature(key, featuresObject[key]);
          });

          data.variants.forEach((variant: any) => {
            const imageControls = variant.images.map((img: any) => 
              this.fb.group({
                id: [img.id],
                image_url: [img.image_url],
                alt_text: [img.alt_text],
              })
            );
            
            console.log('Order of images for variant', variant.id, ':', variant.images.map((img: any) => img.id));

            this.variants.push(this.fb.group({
              id: [variant.id],
              sku: [variant.sku, Validators.required],
              price: [variant.originalPrice, [Validators.required, Validators.min(0.01)]], 
              sale_price: [variant.sale_price],
              sale_start_date: [this.formatDateForInput(variant.sale_start_date)],
              sale_end_date: [this.formatDateForInput(variant.sale_end_date)],
              stock: [variant.stock_quantity, [Validators.required, Validators.min(0)]], 
              is_active: [variant.is_active],
              images: this.fb.array(imageControls)
            }));
          });
          this.isLoading = false;
        },
        error: (err) => { 
          this.translate.get('ADMIN.EDIT.FAILED_TO_LOAD').subscribe((res: string) => {
            this.error = res;
          });
          this.isLoading = false; 
        }
      });
    }
  }

  get features(): FormArray {
    return this.editForm.get('features') as FormArray;
  }
  get variants(): FormArray {
    return this.editForm.get('variants') as FormArray;
  }
  getImages(variantIndex: number): FormArray {
    return this.variants.at(variantIndex).get('images') as FormArray;
  }

  addFeature(key = '', value = ''): void {
    const featureGroup = this.fb.group({
      key: [key, Validators.required],
      value: [value, Validators.required]
    });
    this.features.push(featureGroup);
  }

  removeFeature(index: number): void {
    this.translate.get('ADMIN.EDIT.CONFIRM_DELETE_FEATURE').subscribe((res: string) => {
      if (confirm(res)) {
        this.features.removeAt(index);
      }
    });
  }

  private formatDateForInput(date: string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + 'T' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  onImageDrop(event: CdkDragDrop<any[]>, variantIndex: number): void {
    const imagesArray = this.getImages(variantIndex);
    moveItemInArray(imagesArray.controls, event.previousIndex, event.currentIndex);
    const imageIds = imagesArray.controls.map(control => control.get('id')?.value);
    this.productService.reorderImages(imageIds).subscribe({
      next: () => console.log('Image order updated successfully! New order:', imageIds),
      error: (err) => console.error('Failed to update image order', err)
    });
  }

  deleteImage(variantIndex: number, imageId: number, imageIndex: number): void {
    this.translate.get('ADMIN.EDIT.CONFIRM_DELETE_IMAGE').subscribe((confirmMsg: string) => {
      if (confirm(confirmMsg)) {
        this.productService.deleteImage(imageId).subscribe({
          next: () => this.getImages(variantIndex).removeAt(imageIndex),
          error: () => {
            this.translate.get('ADMIN.EDIT.ERROR_DELETE_IMAGE').subscribe((errorMsg: string) => {
              alert(errorMsg);
            });
          }
        });
      }
    });
  }
  
  onFileSelected(event: Event, variantIndex: number): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const variantGroup = this.variants.at(variantIndex);
      const variantId = variantGroup.get('id')?.value;
      const sku = variantGroup.get('sku')?.value;
      
      const formData = new FormData();
      
      formData.append('variantId', variantId.toString());
      formData.append('sku', sku);
      formData.append('image', file, file.name);

      this.productService.uploadImage(formData).subscribe({
        next: (newImage) => {
          const newImageGroup = this.fb.group({
            id: [newImage.id],
            image_url: [newImage.image_url],
            alt_text: [newImage.alt_text]
          });
          this.getImages(variantIndex).push(newImageGroup);
          fileInput.value = ''; // Resetta l'input file
        },
        error: () => {
          this.translate.get('ADMIN.EDIT.ERROR_UPLOAD').subscribe((errorMsg: string) => {
            alert(errorMsg);
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.editForm.invalid || !this.productId) return;

    this.isLoading = true;
    this.successMessage = null;
    this.error = null;
    const formData = this.editForm.getRawValue();
    
    const featuresObject = formData.features.reduce((obj: any, item: any) => {
      if (item.key) {
        obj[item.key] = item.value;
      }
      return obj;
    }, {});
    formData.features = featuresObject;

    const payload = { ...formData, language_code: this.translate.currentLang || this.translate.defaultLang };
    
    this.productService.updateProduct(this.productId, payload).subscribe({
      next: () => {
        this.translate.get('ADMIN.EDIT.SUCCESS_UPDATE').subscribe((res: string) => {
          this.successMessage = res;
        });
        this.isLoading = false;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.translate.get('ADMIN.EDIT.ERROR_UPDATE').subscribe((res: string) => {
          this.error = res;
        });
        this.isLoading = false;
      }
    });
  }
}