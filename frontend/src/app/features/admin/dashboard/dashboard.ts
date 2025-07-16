import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { DashboardService } from '../../../services/dashboard.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslateModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Usiamo un setter per il ViewChild per reagire quando l'elemento è disponibile
  private _salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('salesChart') set salesChartRef(ref: ElementRef<HTMLCanvasElement>) {
    if (ref) {
      // Quando il canvas è pronto, lo salviamo e proviamo a creare il grafico
      this._salesChartRef = ref;
      this.createChart();
    }
  }
  
  stats: any = null;
  isLoading = true;
  private salesChart: Chart | null = null;
  private langChangeSub!: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.loadDashboardData();
    });
  }

  loadDashboardData(): void {
    this.isLoading = true;
    const lang = this.translate.currentLang || this.translate.defaultLang;
    this.dashboardService.getStats(lang).subscribe(data => {
      this.stats = data;
      this.isLoading = false;
      // Ora che i dati sono arrivati, proviamo a creare il grafico.
      // Funzionerà solo se anche il canvas è già pronto.
      this.createChart();
    });
  }

  createChart(): void {
    // La funzione ora procede solo se SIA il canvas SIA i dati sono disponibili.
    if (!this._salesChartRef?.nativeElement || !this.stats?.salesChartData) {
      return;
    }
    
    if (this.salesChart) {
      this.salesChart.destroy();
    }

    const ctx = this._salesChartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.stats.salesChartData.labels,
          datasets: [{
            label: 'Incasso Giornaliero',
            data: this.stats.salesChartData.data,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false 
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
    if (this.salesChart) {
      this.salesChart.destroy();
    }
  }
}
