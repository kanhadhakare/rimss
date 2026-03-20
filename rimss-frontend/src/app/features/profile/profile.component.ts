import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, DatePipe, CurrencyPipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';
import { UserProfile } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { AddressBookComponent } from './address-book/address-book.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { ProfileInfoComponent } from './profile-info/profile-info.component';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [AsyncPipe, MatTabsModule, MatIconModule, MatDividerModule,
        AddressBookComponent, OrderHistoryComponent, ProfileInfoComponent],
    template: `
    <div class="container section profile-page">
      <h1 class="section-title">My Account</h1>
      <mat-divider></mat-divider>
      
      <mat-tab-group animationDuration="0ms" class="profile-tabs">
        <mat-tab label="Overview">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">person</mat-icon> Profile Details
          </ng-template>
          <div class="tab-content">
            <app-profile-info [profile]="(profile$ | async)!" (profileUpdated)="loadProfile()"></app-profile-info>
          </div>
        </mat-tab>
        
        <mat-tab label="Addresses">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">home</mat-icon> Address Book
          </ng-template>
          <div class="tab-content">
            <app-address-book [addresses]="(profile$ | async)?.addresses || []" (addressesUpdated)="loadProfile()"></app-address-book>
          </div>
        </mat-tab>

        <mat-tab label="Order History">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">receipt_long</mat-icon> Order History
          </ng-template>
          <div class="tab-content">
            <app-order-history [orders]="(orders$ | async) || []"></app-order-history>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
    styles: [`
    .profile-page { min-height: 60vh; padding-bottom: 60px; }
    .section-title { font-family: var(--font-display); font-size: 2rem; color: var(--color-primary); margin-bottom: 24px; }
    .profile-tabs { margin-top: 24px; }
    .tab-icon { margin-right: 8px; font-size: 1.1rem; line-height: 1.1rem; vertical-align: middle; }
    .tab-content { padding: 32px 0; }
  `]
})
export class ProfileComponent implements OnInit {
    private title = inject(Title);
    private userService = inject(UserService);
    private orderService = inject(OrderService);

    profile$!: Observable<UserProfile>;
    orders$!: Observable<any[]>;

    ngOnInit() {
        this.title.setTitle('My Account — YCompany');
        this.loadProfile();
        this.orders$ = this.orderService.getMyOrders();
    }

    loadProfile() {
        this.profile$ = this.userService.getProfile();
    }
}
