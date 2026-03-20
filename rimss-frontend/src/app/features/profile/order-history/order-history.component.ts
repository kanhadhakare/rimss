import { Component, Input } from '@angular/core';
import { DatePipe, CurrencyPipe, UpperCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, UpperCasePipe, MatCardModule, MatDividerModule],
  template: `
    <div class="orders-container">
      <h2 class="sub-title">Past Orders</h2>
      
      @if (!orders || orders.length === 0) {
        <div class="empty-state">
          <p>You haven't placed any orders yet.</p>
        </div>
      } @else {
        <div class="order-list">
          @for (order of orders; track order._id) {
            <mat-card class="order-card">
              <mat-card-header>
                <div class="order-header-info">
                  <div class="info-block">
                    <span class="label">Order Placed</span>
                    <span class="val">{{ order.createdAt | date:'mediumDate' }}</span>
                  </div>
                  <div class="info-block">
                    <span class="label">Total</span>
                    <span class="val">{{ order.totalAmount | currency:'INR' }}</span>
                  </div>
                  <div class="info-block">
                    <span class="label">Order #</span>
                    <span class="val order-id">{{ order._id }}</span>
                  </div>
                  <div class="info-block status-block">
                    <span class="label">Status</span>
                    <span class="status-badge" [class]="'status-' + order.status">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </div>
                </div>
              </mat-card-header>
              <mat-divider></mat-divider>
              <mat-card-content class="order-items">
                @for (item of order.items; track item.product) {
                  <div class="item-row">
                    <div class="item-details">
                      <strong>{{ item.name }}</strong>
                      <span class="item-meta">
                        Qty: {{ item.quantity }}
                        @if (item.color) { | Color: {{ item.color }} }
                        @if (item.size) { | Size: {{ item.size }} }
                      </span>
                    </div>
                    <span class="item-price">{{ item.price | currency:'INR' }}</span>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .sub-title { font-family: var(--font-display); font-size: 1.5rem; color: var(--color-primary); margin-bottom: 24px; }
    .orders-container { max-width: 800px; }
    .empty-state { padding: 40px; text-align: center; color: var(--color-text-muted); background: #fafaf8; border-radius: var(--radius-md); }
    .order-list { display: flex; flex-direction: column; gap: 24px; }
    .order-card { border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border: 1px solid var(--color-border); }
    .order-header-info { display: flex; flex-wrap: wrap; gap: 24px; padding: 16px; width: 100%; align-items: center; background: #fafaf8; border-radius: var(--radius-md) var(--radius-md) 0 0; }
    .info-block { display: flex; flex-direction: column; gap: 4px; }
    .info-block .label { font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.05em; }
    .info-block .val { font-size: 0.95rem; font-weight: 500; color: var(--color-primary); }
    .order-id { font-size: 0.8rem; word-break: break-all; max-width: 180px; }
    .status-block { margin-left: auto; align-items: flex-end; }
    .status-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
    .status-delivered { background: #e8f5e9; color: #2e7d32; }
    .status-shipped { background: #e3f2fd; color: #1565c0; }
    .status-processing { background: #fff3e0; color: #e65100; }
    .status-paid { background: #f3e5f5; color: #7b1fa2; }
    .status-pending { background: #f5f5f5; color: #757575; }
    .status-cancelled { background: #ffebee; color: #c62828; }
    .order-items { padding: 20px 16px !important; }
    .item-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--color-border); }
    .item-row:last-child { border-bottom: none; padding-bottom: 0; }
    .item-details { display: flex; flex-direction: column; gap: 4px; }
    .item-details strong { font-size: 0.95rem; color: var(--color-primary); font-weight: 500; }
    .item-meta { font-size: 0.8rem; color: var(--color-text-muted); }
    .item-price { font-weight: 600; font-size: 0.95rem; }
  `]
})
export class OrderHistoryComponent {
  @Input() orders!: any[];

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pending',
      paid: 'Paid',
      processing: 'Processing',
      shipped: 'In Transit',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  }
}
