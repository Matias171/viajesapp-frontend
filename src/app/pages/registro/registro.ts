import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({ selector: 'app-registro', standalone: false, templateUrl: './registro.html', styleUrl: './registro.css' })
export class Registro {
  nombre = ''; email = ''; password = ''; error = ''; exito = ''; cargando = false;

  constructor(private api: ApiService, private router: Router) {}

  registrar() {
    this.error = ''; this.exito = '';
    if (!this.nombre || !this.email || !this.password) { this.error = 'Rellena todos los campos.'; return; }
    this.cargando = true;
    this.api.registro(this.nombre, this.email, this.password).subscribe({
      next: () => { this.exito = '¡Cuenta creada! Redirigiendo...'; setTimeout(() => this.router.navigate(['/login']), 1000); },
      error: () => { this.cargando = false; this.error = 'Ya existe una cuenta con ese email.'; }
    });
  }
}