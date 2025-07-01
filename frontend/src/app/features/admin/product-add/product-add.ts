import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DragDropModule, TranslateModule],
  templateUrl: './product-add.html'
})
export class ProductAddComponent implements OnInit {
  addForm!: FormGroup;
  allBrands$: Observable<any[]>;
  allCategories$: Observable<any[]>;
  allAttributes$: Observable<any[]>;
  isLoading = false;
  error: string | null = null;
  activeTab: 'it' | 'en' = 'it';

  private langChangeSub!: Subscription;
  
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.allBrands$ = this.productService.getBrands('it-IT');
    this.allCategories$ = this.productService.getCategories('it-IT');
    this.allAttributes$ = this.productService.getAttributesForForm('it-IT');
  }

  ngOnInit(): void {
    this.loadDropdownData();

    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.loadDropdownData();
    });

    this.addForm = this.fb.group({
      brand_id: ['', Validators.required],
      is_featured: [false],
      category_ids: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      translations: this.fb.group({
        it: this.createTranslationGroup(),
        en: this.createTranslationGroup()
      }),
      variants: this.fb.array([], Validators.minLength(1))
    });
    this.addVariant();
  }

  loadDropdownData(): void {
    const currentLang = this.translate.currentLang || this.translate.defaultLang;
    this.allBrands$ = this.productService.getBrands(currentLang);
    this.allCategories$ = this.productService.getCategories(currentLang);
    this.allAttributes$ = this.productService.getAttributesForForm(currentLang);
  }

  features(lang: 'it' | 'en'): FormArray { return this.addForm.get(`translations.${lang}.features`) as FormArray; }
  variants(): FormArray { return this.addForm.get('variants') as FormArray; }
  variantAttributes(variantIndex: number): FormArray { return this.variants().at(variantIndex).get('attributes') as FormArray; }
  variantImages(variantIndex: number): FormArray { return this.variants().at(variantIndex).get('images') as FormArray; }

  createTranslationGroup(): FormGroup { 
    return this.fb.group({ 
      name: ['', Validators.required], 
      description: [''], 
      features: this.fb.array([]) 
    }); 
  }
  createVariantGroup(): FormGroup {
    return this.fb.group({
      sku: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      attributes: this.fb.array([]),
      images: this.fb.array([])
    });
  }

  addVariant(): void { this.variants().push(this.createVariantGroup()); }
  removeVariant(index: number): void {
    if (this.variants().length > 1) {
      if (confirm('Sei sicuro di voler rimuovere questa variante?')) this.variants().removeAt(index);
    } else {
      alert('È necessario avere almeno una variante per il prodotto.');
    }
  }

  addFeature(lang: 'it' | 'en'): void { this.features(lang).push(this.fb.group({ key: ['', Validators.required], value: ['', Validators.required] })); }
  removeFeature(lang: 'it' | 'en', index: number): void { this.features(lang).removeAt(index); }
  addVariantAttribute(variantIndex: number): void { this.variantAttributes(variantIndex).push(this.fb.control('', Validators.required)); }
  removeVariantAttribute(variantIndex: number, attrIndex: number): void { this.variantAttributes(variantIndex).removeAt(attrIndex); }
  
onCategoryChange(event: Event): void {
  const categoriesArray = this.addForm.get('category_ids') as FormArray;
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    categoriesArray.push(this.fb.control(target.value));
  } else {
    const index = categoriesArray.controls.findIndex(x => x.value === target.value);
    if (index !== -1) categoriesArray.removeAt(index);
  }
}

  onFileSelected(event: Event, variantIndex: number): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.variantImages(variantIndex).push(this.fb.group({
            file: [file],
            previewUrl: [e.target.result]
          }));
        };
        reader.readAsDataURL(file);
      }
      fileInput.value = '';
    }
  }

  removeImage(variantIndex: number, imageIndex: number): void { this.variantImages(variantIndex).removeAt(imageIndex); }
  onImageDrop(event: CdkDragDrop<any[]>, variantIndex: number) { moveItemInArray(this.getImages(variantIndex).controls, event.previousIndex, event.currentIndex); }
  getImages(variantIndex: number): FormArray { return this.variants().at(variantIndex).get('images') as FormArray; }

  onSubmit(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      alert('Per favore, compila tutti i campi obbligatori.');
      return;
    }
    
    this.isLoading = true;
    const rawFormData = this.addForm.getRawValue();
    const featuresObject = (features: any[]) => features.reduce((obj, item) => ({...obj, [item.key]: item.value}), {});

    const productData = {
      ...rawFormData,
      translations: {
        it: { ...rawFormData.translations.it, features: featuresObject(rawFormData.translations.it.features) },
        en: { ...rawFormData.translations.en, features: featuresObject(rawFormData.translations.en.features) }
      },
      variants: rawFormData.variants.map((v: any) => ({ ...v, images: undefined }))
    };
    
    this.productService.createProduct(productData).subscribe({
      next: (newProduct) => {
        const uploadObservables = rawFormData.variants.flatMap((variant: any, index: number) => {
          const variantId = newProduct.variantIds[index];
          return variant.images.map((image: any) => {
            const formData = new FormData();
            formData.append('variantId', variantId.toString());
            formData.append('sku', variant.sku);
            formData.append('image', image.file, image.file.name);
            return this.productService.uploadImage(formData);
          });
        });

        const uploadPipeline = uploadObservables.length > 0 ? forkJoin(uploadObservables) : of(null);

        uploadPipeline.subscribe({
          complete: () => {
            this.router.navigate(['/admin/products']);
          },
          error: (uploadError) => {
            this.error = 'Prodotto creato, ma errore durante il caricamento delle immagini.';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Errore durante la creazione del prodotto.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }
}
