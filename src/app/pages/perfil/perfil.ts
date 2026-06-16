import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {

  usuario: any = null;
  perfil: any = {};
  historial: any[] = [];
  editando = false;
  cargando = true;
  mensajeExito = '';
  mensajeError = '';

  // Copia temporal mientras edita, para no machacar los datos si cancela
  perfilEditando: any = {};

  constructor(private api: ApiService, private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    const datos = sessionStorage.getItem('usuario');
    if (!datos) { this.router.navigate(['/login']); return; }
    this.usuario = JSON.parse(datos);
    this.cargarPerfil();
    this.cargarHistorial();
  }

  cargarPerfil() {
    this.api.getPerfil(this.usuario.id).subscribe({
      next: (p) => {
        this.perfil = p;
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: () => { this.cargando = false; this.cd.detectChanges(); }
    });
  }

  cargarHistorial() {
    this.api.getHistorial(this.usuario.id).subscribe({
      next: (h) => { this.historial = h; this.cd.detectChanges(); },
      error: () => this.historial = []
    });
  }

  // Al pulsar editar, copiamos los datos actuales al objeto de edición
  empezarEdicion() {
    this.perfilEditando = { ...this.perfil };
    this.editando = true;
  }

  cancelarEdicion() {
    this.editando = false;
    this.perfilEditando = {};
    this.mensajeError = '';
  }

  guardarPerfil() {
    this.mensajeError = '';
    this.api.actualizarPerfil(this.usuario.id, this.perfilEditando).subscribe({
      next: (actualizado) => {
        this.perfil = actualizado;
        // Actualizamos también el sessionStorage para que el nombre aparezca correcto en el nav
        sessionStorage.setItem('usuario', JSON.stringify(actualizado));
        this.editando = false;
        this.mensajeExito = 'Perfil actualizado correctamente.';
        setTimeout(() => this.mensajeExito = '', 3000);
        this.cd.detectChanges();
      },
      error: () => { this.mensajeError = 'Error al guardar el perfil.'; }
    });
  }

  // Convierte la foto seleccionada a Base64 y la guarda en perfilEditando
  onFotoSeleccionada(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    // Limitamos el tamaño a 2MB para no saturar la BD
    if (archivo.size > 2 * 1024 * 1024) {
      this.mensajeError = 'La foto no puede superar 2MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.perfilEditando.fotoPerfil = e.target.result; // string Base64
      this.cd.detectChanges();
    };
    reader.readAsDataURL(archivo);
  }

  // Calcula la edad a partir de la fecha de nacimiento
  get edad(): number | null {
    if (!this.perfil.fechaNacimiento) return null;
    const partes = this.perfil.fechaNacimiento.split('/');
    if (partes.length !== 3) return null;
    const nacimiento = new Date(+partes[2], +partes[1] - 1, +partes[0]);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  }

  volver() { this.router.navigate(['/viajes']); }
}