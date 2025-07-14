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
import { authGuard } from './core/guards/auth-guard';
import { ProductEditComponent } from './features/admin/product-edit/product-edit';
import { ProductAddComponent } from './features/admin/product-add/product-add';
import { BrandManagementComponent } from './features/admin/brand-management/brand-management';
import { CategoryManagementComponent } from './features/admin/category-management/category-management';
import { AttributeManagementComponent } from './features/admin/attribute-management/attribute-management';
import { CartComponent } from './features/cart/cart';
import { CheckoutComponent } from './features/checkout/checkout';
import { OrderConfirmationComponent } from './features/order-confirmation/order-confirmation';
import { PaymentComponent } from './features/payment/payment';
import { OrderTrackingComponent } from './features/order-tracking/order-tracking';
import { ProfileComponent } from './features/profile/profile';
import { WishlistComponent } from './features/wishlist/wishlist';
import { OffersPageComponent } from './features/offers-page/offers-page';
import { NewPageComponent } from './features/new-page/new-page';

export const routes: Routes = [
  
  { path: '', component: HomeComponent }, // Default route to HomeComponent
  { path: 'products', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent }, // Dynamic route for product details
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent},
  { path: 'offers', component: OffersPageComponent },
  { path: 'new', component: NewPageComponent },
  { path: 'orders/:id', component: OrderTrackingComponent },
  { path: 'wishlist', component: WishlistComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] }, // Cart route protected by authGuard
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'order-confirmation/:id', component: OrderConfirmationComponent, canActivate: [authGuard] },
  { path: 'checkout/payment', component: PaymentComponent, canActivate: [authGuard] },

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
