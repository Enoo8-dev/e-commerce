import { Routes } from '@angular/router';

import { ProductListComponent } from './features/product-list/product-list';
import { LoginComponent } from './features/login/login';
import { RegisterComponent } from './features/register/register';
import { HomeComponent } from './features/home/home';
import { ProductDetailComponent } from './features/product-detail/product-detail';

import { DashboardComponent } from './features/admin/dashboard/dashboard';
import { ProductManagementComponent } from './features/admin/product-management/product-management';
import { UserManagementComponent } from './features/admin/user-management/user-management';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  
  { path: '', component: HomeComponent }, // Default route to HomeComponent
  { path: 'products', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent }, // Dynamic route for product details
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent},

  { path: 'admin/dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/products', component: ProductManagementComponent, canActivate: [adminGuard] },
  { path: 'admin/users', component: UserManagementComponent, canActivate: [adminGuard] },
  
  // You can add a wildcard route for handling 404 Not Found pages later
  // { path: '**', component: PageNotFoundComponent }
];
