import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { BrandService } from '../../../services/brand.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-brand-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, TranslateModule],
  templateUrl: './brand-management.html',
})
export class BrandManagementComponent implements OnInit, OnDestroy {
  brands: any[] = [];
  isLoading = true;
  isEditModalOpen = false;
  editingBrand: any = null;
  
  addBrandForm!: FormGroup;
  editBrandForm!: FormGroup;
  searchControl = new FormControl('');
  editModalActiveTab: 'it' | 'en' = 'it';

  sort = { by: 'name', order: 'ASC' };
  
  private destroy$ = new Subject<void>();
  private langChangeSub!: Subscription; 

  constructor(
    private brandService: BrandService,
    private fb: FormBuilder,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.addBrandForm = this.fb.group({
      name_it: ['', Validators.required],
      description_it: [''],
      name_en: ['', Validators.required],
      description_en: [''],
      logo: [null]
    });
    this.editBrandForm = this.fb.group({
      name_it: ['', Validators.required],
      description_it: [''],
      name_en: ['', Validators.required],
      description_en: [''],
      logo: [null]
    });
    
    this.loadBrands();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadBrands());

    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.loadBrands();
    });
  }

  loadBrands(): void {
    this.isLoading = true;
    const options = {
      languageCode: this.translate.currentLang || this.translate.defaultLang,
      search: this.searchControl.value || '',
      sortBy: this.sort.by,
      sortOrder: this.sort.order
    };
    this.brandService.getBrands(options).subscribe(data => {
      this.brands = data;
      this.isLoading = false;
    });
  }
  
  sortBy(column: 'name' | 'created_at'): void {
    if (this.sort.by === column) {
      this.sort.order = this.sort.order === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sort.by = column;
      this.sort.order = 'ASC';
    }
    this.loadBrands();
  }

  onAddBrand(): void {
    if (this.addBrandForm.invalid) return;
    const formData = new FormData();
    Object.keys(this.addBrandForm.value).forEach(key => {
      formData.append(key, this.addBrandForm.value[key]);
    });
    this.brandService.addBrand(formData).subscribe(() => {
      this.loadBrands();
      this.addBrandForm.reset();
    });
  }

  onDeleteBrand(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo brand?')) {
      this.brandService.deleteBrand(id).subscribe(() => this.loadBrands());
    }
  }

  openEditModal(brand: any): void {
    this.brandService.getBrandById(brand.id).subscribe(details => {
      this.editingBrand = details;
      this.editBrandForm.patchValue({
        name_it: details.name_it,
        description_it: details.description_it,
        name_en: details.name_en,
        description_en: details.description_en,
      });
      this.isEditModalOpen = true;
    });
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingBrand = null;
    this.editBrandForm.reset();
  }
  
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.editBrandForm.patchValue({ logo: input.files[0] });
    }
  }

  onUpdateBrand(): void {
    if (this.editBrandForm.invalid || !this.editingBrand) return;
    
    const formData = new FormData();
    const formValue = this.editBrandForm.value;
    
    Object.keys(formValue).forEach(key => {
      if (key !== 'logo' && formValue[key] !== null) {
        formData.append(key, formValue[key]);
      }
    });
    if (formValue.logo) {
      formData.append('logo', formValue.logo);
    }

    this.brandService.updateBrand(this.editingBrand.id, formData).subscribe(() => {
      this.loadBrands();
      this.closeEditModal();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }
}
