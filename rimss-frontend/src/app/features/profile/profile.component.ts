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
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
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
