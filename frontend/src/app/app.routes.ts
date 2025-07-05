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
import { ProductEditComponent } from './features/admin/product-edit/product-edit';
import { ProductAddComponent } from './features/admin/product-add/product-add';
import { BrandManagementComponent } from './features/admin/brand-management/brand-management';
import { CategoryManagementComponent } from './features/admin/category-management/category-management';
import { AttributeManagementComponent } from './features/admin/attribute-management/attribute-management';
import { CartComponent } from './features/cart/cart';
import { CheckoutComponent } from './features/checkout/checkout';
import { OrderConfirmationComponent } from './features/order-confirmation/order-confirmation';
import { PaymentComponent } from './features/payment/payment';

export const routes: Routes = [
  
  { path: '', component: HomeComponent }, // Default route to HomeComponent
  { path: 'products', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent }, // Dynamic route for product details
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent},
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'checkout/payment', component: PaymentComponent },
  { path: 'order-confirmation/:id', component: OrderConfirmationComponent },

  { path: 'admin/dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/products', component: ProductManagementComponent, canActivate: [adminGuard] },
  { path: 'admin/users', component: UserManagementComponent, canActivate: [adminGuard] },
  { path: 'admin/products/new', component: ProductAddComponent, canActivate: [adminGuard] },
  { path: 'admin/products/edit/:productId', component: ProductEditComponent, canActivate: [adminGuard] },
  { path: 'admin/brands', component: BrandManagementComponent, canActivate: [adminGuard] },
  { path: 'admin/categories', component: CategoryManagementComponent, canActivate: [adminGuard] },
  { path: 'admin/attributes', component: AttributeManagementComponent, canActivate: [adminGuard] }
  
  // You can add a wildcard route for handling 404 Not Found pages later
  // { path: '**', component: PageNotFoundComponent }
];
