import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-error-page',
  imports: [RouterLink, TranslateModule],
  templateUrl: './error-page.html',
  styleUrl: './error-page.css'
})
export class ErrorPageComponent {

}
