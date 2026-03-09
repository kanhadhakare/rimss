import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-order-success',
    standalone: true,
    imports: [RouterLink, MatButtonModule, MatIconModule],
    template: `
    <div class="success-page">
      <div class="success-card">
        <div class="success-icon-wrap">
          <mat-icon class="success-icon">check_circle</mat-icon>
        </div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. Your order has been placed and will be dispatched shortly. A confirmation email will be sent to your inbox.</p>
        <div class="success-actions">
          <a routerLink="/" class="btn-primary">Back to Home</a>
          <a routerLink="/products" class="btn-outline">Continue Shopping</a>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .success-page { min-height: calc(100vh - 64px); display:flex; align-items:center; justify-content:center; background:var(--color-bg); padding:32px; }
    .success-card { text-align:center; max-width:480px; background:#fff; border-radius:var(--radius-lg); padding:56px 40px; box-shadow:var(--shadow-lg); }
    .success-icon-wrap { width:80px; height:80px; background:rgba(39,174,96,.1); border-radius:50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 24px; }
    .success-icon { font-size:2.8rem; color:var(--color-success); }
    h1 { font-family:var(--font-display); font-size:2rem; color:var(--color-primary); margin-bottom:16px; }
    p { color:var(--color-text-muted); line-height:1.8; margin-bottom:32px; font-size:0.95rem; }
    .success-actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
  `]
})
export class OrderSuccessComponent implements OnInit {
    constructor(private title: Title) { }
    ngOnInit() { this.title.setTitle('Order Confirmed — YCompany'); }
}
