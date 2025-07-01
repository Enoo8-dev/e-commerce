import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AttributeService } from '../../../services/attribute.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-attribute-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './attribute-management.html',
})
export class AttributeManagementComponent implements OnInit, OnDestroy {
  attributes: any[] = [];
  isLoading = true;
  
  // Gestione Modali
  isEditAttrModalOpen = false;
  editingAttribute: any = null;
  isEditValueModalOpen = false;
  editingValue: any = null;
  
  addAttributeForm!: FormGroup;
  addValueForms: { [attributeId: number]: FormGroup } = {};
  editAttributeForm!: FormGroup;
  editValueForm!: FormGroup;
  searchControl = new FormControl('');

  sort = { by: 'name', order: 'ASC' };
  private destroy$ = new Subject<void>();
  private langChangeSub!: Subscription;

  constructor(
    private attributeService: AttributeService,
    private fb: FormBuilder,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.addAttributeForm = this.fb.group({ name: ['', Validators.required] });
    this.editAttributeForm = this.fb.group({ name_it: ['', Validators.required], name_en: ['', Validators.required] });
    this.editValueForm = this.fb.group({
      value_it: ['', Validators.required],
      value_en: ['', Validators.required],
      hex_code: ['']
    });
    this.loadAttributes();
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(() => this.loadAttributes());
    this.langChangeSub = this.translate.onLangChange.subscribe(() => this.loadAttributes());
  }

  loadAttributes(): void {
    this.isLoading = true;
    const options = {
      lang: this.translate.currentLang || this.translate.defaultLang,
      search: this.searchControl.value || '',
      sortBy: this.sort.by,
      sortOrder: this.sort.order
    };
    this.attributeService.getAttributes(options).subscribe(data => {
      this.attributes = data;
      this.attributes.forEach(attr => {
        this.addValueForms[attr.id] = this.fb.group({
          value_it: ['', Validators.required],
          value_en: ['', Validators.required],
          hex_code: ['']
        });
      });
      this.isLoading = false;
    });
  }

  sortBy(column: 'name'): void {
    if (this.sort.by === column) {
      this.sort.order = this.sort.order === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sort.by = column;
      this.sort.order = 'ASC';
    }
    this.loadAttributes();
  }

  onAddAttribute(): void {
    if (this.addAttributeForm.invalid) return;
    this.attributeService.addAttribute(this.addAttributeForm.value.name!).subscribe(() => {
      this.loadAttributes();
      this.addAttributeForm.reset();
    });
  }

  onAddValue(attributeId: number): void {
    const form = this.addValueForms[attributeId];
    if (form.invalid) return;
    this.attributeService.addAttributeValue(attributeId, form.value).subscribe(() => {
      this.loadAttributes();
      form.reset();
    });
  }

  onDeleteAttribute(id: number): void {
    if (confirm('Sei sicuro? Verranno eliminati anche tutti i suoi valori.')) {
      this.attributeService.deleteAttribute(id).subscribe(() => this.loadAttributes());
    }
  }

  onDeleteValue(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo valore?')) {
      this.attributeService.deleteAttributeValue(id).subscribe(() => this.loadAttributes());
    }
  }

  openEditAttributeModal(attribute: any): void {
    this.attributeService.getAttributeById(attribute.id).subscribe(details => {
      this.editingAttribute = details;
      this.editAttributeForm.patchValue({ name_it: details.name_it, name_en: details.name_en });
      this.isEditAttrModalOpen = true;
    });
  }

  onUpdateAttribute(): void {
    if (this.editAttributeForm.invalid || !this.editingAttribute) return;
    this.attributeService.updateAttribute(this.editingAttribute.id, this.editAttributeForm.value).subscribe(() => {
      this.loadAttributes();
      this.closeEditAttributeModal();
    });
  }

  openEditValueModal(value: any): void {
    this.attributeService.getAttributeValueById(value.id).subscribe(details => {
      this.editingValue = details;
      this.editValueForm.patchValue({
        value_it: details.value_it,
        value_en: details.value_en,
        hex_code: details.hex_code
      });
      this.isEditValueModalOpen = true;
    });
  }

  onUpdateValue(): void {
    if (this.editValueForm.invalid || !this.editingValue) return;
    this.attributeService.updateAttributeValue(this.editingValue.id, this.editValueForm.value).subscribe(() => {
      this.loadAttributes();
      this.closeEditValueModal();
    });
  }

  closeEditAttributeModal(): void { this.isEditAttrModalOpen = false; this.editingAttribute = null; }
  closeEditValueModal(): void { this.isEditValueModalOpen = false; this.editingValue = null; }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.langChangeSub) this.langChangeSub.unsubscribe();
  }
}