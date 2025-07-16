import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DashboardComponent } from '../admin/dashboard/dashboard'; // Importa la Dashboard
import { HomeComponent } from '../home/home'; // Importa la Home

@Component({
  selector: 'app-root-dispatcher',
  standalone: true,
  imports: [CommonModule, DashboardComponent, HomeComponent],
  templateUrl: './root.html',
})
export class RootComponent {
  public isAdmin$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.isAdmin$ = this.authService.isAdmin$;
  }
}