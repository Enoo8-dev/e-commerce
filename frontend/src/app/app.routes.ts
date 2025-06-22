import { Routes } from '@angular/router';

import { ProductListComponent } from './features/product-list/product-list';
import { LoginComponent } from './features/login/login';
import { RegisterComponent } from './features/register/register';

export const routes: Routes = [
  { path: 'products', component: ProductListComponent },

  // Add a default route that redirects the user to the product list
  // when they visit the base URL (e.g., http://localhost:4200)
  // { path: '', redirectTo: '/products', pathMatch: 'full' },
  
  // You can add a wildcard route for handling 404 Not Found pages later
  // { path: '**', component: PageNotFoundComponent }

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent}
];
