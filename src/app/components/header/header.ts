import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  usuario: any;

  constructor(private api: ApiService, private router: Router) {
    this.usuario = this.api.getUsuarioActual();
  }

  cerrarSesion() {
    this.api.logout();
    this.router.navigate(['/login']);
  }
}