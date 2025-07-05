import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: 'order-confirmation.html',
})

export class OrderConfirmationComponent implements OnInit {
  orderId: string | null = null;
  constructor(
    private route: ActivatedRoute,
    private translate: TranslateModule 
  ) {}
  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');
  }
}