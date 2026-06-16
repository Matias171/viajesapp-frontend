import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({ selector: 'app-login', standalone: false, templateUrl: './login.html', styleUrl: './login.css' })
export class Login {
  email = ''; password = ''; error = ''; cargando = false;

  constructor(private api: ApiService, private router: Router) {}

  entrar() {
    this.error = '';
    if (!this.email || !this.password) { this.error = 'Rellena todos los campos.'; return; }
    this.cargando = true;
    this.api.login(this.email, this.password).subscribe({
      next: (u) => { sessionStorage.setItem('usuario', JSON.stringify(u)); this.router.navigate(['/viajes']); },
      error: () => { this.cargando = false; this.error = 'Email o contraseña incorrectos.'; }
    });
  }
}