import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-order-success',
    standalone: true,
    imports: [RouterLink, MatButtonModule, MatIconModule],
    templateUrl: './order-success.component.html',
    styleUrls: ['./order-success.component.scss']
})
export class OrderSuccessComponent implements OnInit {
    constructor(private title: Title) { }
    ngOnInit() { this.title.setTitle('Order Confirmed — YCompany'); }
}
