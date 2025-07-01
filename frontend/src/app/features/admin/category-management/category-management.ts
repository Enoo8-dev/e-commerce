import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-management.html',
})
export class CategoryManagementComponent implements OnInit, OnDestroy {
  categories: any[] = [];
  isLoading = true;
  editingCategory: any = null;
  isEditModalOpen = false;
  
  addCategoryForm!: FormGroup;
  editCategoryForm!: FormGroup;
  searchControl = new FormControl('');

  sort = { by: 'name', order: 'ASC' };
  private destroy$ = new Subject<void>();
  private langChangeSub!: Subscription;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.addCategoryForm = this.fb.group({
      name_it: ['', Validators.required],
      name_en: ['', Validators.required],
      parent_category_id: [null]
    });
    this.editCategoryForm = this.fb.group({
      name_it: ['', Validators.required],
      name_en: ['', Validators.required],
      parent_category_id: [null]
    });
    
    this.loadCategories();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadCategories());

    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.loadCategories();
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    const options = {
      lang: this.translate.currentLang || this.translate.defaultLang,
      search: this.searchControl.value || '',
      sortBy: this.sort.by,
      sortOrder: this.sort.order
    };
    this.categoryService.getCategories(options).subscribe(data => {
      this.categories = data;
      this.isLoading = false;
    });
  }

  sortBy(column: 'name' | 'parent_name'): void {
    if (this.sort.by === column) {
      this.sort.order = this.sort.order === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sort.by = column;
      this.sort.order = 'ASC';
    }
    this.loadCategories();
  }

  onAddCategory(): void {
    if (this.addCategoryForm.invalid) return;
    this.categoryService.addCategory(this.addCategoryForm.value).subscribe(() => {
      this.loadCategories();
      this.addCategoryForm.reset({ parent_category_id: null });
    });
  }

  onDeleteCategory(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questa categoria? Anche le sotto-categorie verranno modificate.')) {
      this.categoryService.deleteCategory(id).subscribe(() => this.loadCategories());
    }
  }

  openEditModal(category: any): void {
    this.editingCategory = category;
    this.categoryService.getCategoryById(category.id, this.translate.currentLang).subscribe(details => {
      this.editCategoryForm.setValue({
        name_it: details.name_it,
        name_en: details.name_en,
        parent_category_id: details.parent_category_id
      });
      this.isEditModalOpen = true;
    });
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingCategory = null;
  }

  onUpdateCategory(): void {
    if (this.editCategoryForm.invalid || !this.editingCategory) return;
    this.categoryService.updateCategory(this.editingCategory.id, this.editCategoryForm.value).subscribe(() => {
      this.loadCategories();
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