import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, TranslateModule],
  templateUrl: './user-management.html',
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: any[] = [];
  isLoading = true;
  activeTab: 'customers' | 'admins' = 'customers';

  addAdminForm!: FormGroup;
  searchControl = new FormControl('');
  statusFilterControl = new FormControl('all');

  sort = { by: 'created_at', order: 'DESC' };
  private destroy$ = new Subject<void>();

  constructor(private userService: UserService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.addAdminForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
    this.loadUsers();

    // Ascolta i cambiamenti sia della ricerca che del filtro di stato
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadUsers());

    this.statusFilterControl.valueChanges.pipe(
        takeUntil(this.destroy$)
    ).subscribe(() => this.loadUsers());
  }


  loadUsers(): void {
    this.isLoading = true;
    const options = {
      role: this.activeTab === 'customers' ? 'customer' : 'admin',
      search: this.searchControl.value || '',
      status: this.statusFilterControl.value === 'all' ? '' : this.statusFilterControl.value,
      sortBy: this.sort.by,
      sortOrder: this.sort.order
    };
    this.userService.getUsers(options).subscribe(data => {
      this.users = data;
      this.isLoading = false;
    });
  }

  selectTab(tab: 'customers' | 'admins'): void {
    this.activeTab = tab;
    this.searchControl.reset('');
    this.statusFilterControl.setValue('all'); // Resetta anche il filtro di stato
    this.sort = { by: 'created_at', order: 'DESC' };
    this.loadUsers();
  }

  sortBy(column: 'name' | 'email' | 'created_at'): void {
    if (this.sort.by === column) {
      this.sort.order = this.sort.order === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sort.by = column;
      this.sort.order = 'ASC';
    }
    this.loadUsers();
  }

  onAddAdmin(): void {
    if (this.addAdminForm.invalid) return;
    this.userService.createAdmin(this.addAdminForm.value).subscribe({
      next: () => {
        this.loadUsers();
        this.addAdminForm.reset();
      },
      error: (err) => alert(err.error?.message || 'Errore durante la creazione dell\'admin.')
    });
  }

  onToggleStatus(user: any): void {
    const newStatus = !user.is_active;
    const action = newStatus ? 'sbloccare' : 'bloccare';
    if (confirm(`Sei sicuro di voler ${action} l'utente ${user.first_name}?`)) {
      this.userService.updateUserStatus(user.id, newStatus).subscribe(() => {
        user.is_active = newStatus;
      });
    }
  }

  onDeleteUser(user: any): void {
    if (confirm(`Sei sicuro di voler eliminare definitivamente l'utente ${user.email}?`)) {
      this.userService.deleteUser(user.id).subscribe(() => this.loadUsers());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}