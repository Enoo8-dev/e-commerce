import { Routes } from '@angular/router';

import { ProductListComponent } from './features/product-list/product-list';
import { LoginComponent } from './features/login/login';
import { RegisterComponent } from './features/register/register';
import { HomeComponent } from './features/home/home';
import { ProductDetailComponent } from './features/product-detail/product-detail';

export const routes: Routes = [
  
  { path: '', component: HomeComponent }, // Default route to HomeComponent
  { path: 'products', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent }, // Dynamic route for product details
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent}
  
  // You can add a wildcard route for handling 404 Not Found pages later
  // { path: '**', component: PageNotFoundComponent }
];
