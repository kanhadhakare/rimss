import { Component, Input } from '@angular/core';
import { DatePipe, CurrencyPipe, UpperCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, UpperCasePipe, MatCardModule, MatDividerModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
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
