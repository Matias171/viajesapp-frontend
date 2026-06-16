import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-viajes',
  standalone: false,
  templateUrl: './viajes.html',
  styleUrl: './viajes.css'
})
export class Viajes implements OnInit {

  usuario: any = null;
  viajes: any[] = [];
  cargando = true;
  mostrarModal = false;
  nuevoViaje: any = { nombre: '', destino: '', descripcion: '', fechaInicio: '', fechaFin: '' };
  errorViaje = '';

  // ChangeDetectorRef le dice a Angular manualmente que actualice la pantalla
  constructor(private api: ApiService, private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    const datos = sessionStorage.getItem('usuario');
    if (!datos) { this.router.navigate(['/login']); return; }
    this.usuario = JSON.parse(datos);
    this.cargarViajes();
  }

  cargarViajes() {
    this.cargando = true;
    this.api.getViajes(this.usuario.id).subscribe({
      next: (v) => {
        this.viajes = v || [];
        this.cargando = false;
        this.cd.detectChanges(); // ← fuerza a Angular a redibujar la pantalla
      },
      error: () => {
        this.viajes = [];
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }

  crearViaje() {
    this.errorViaje = '';
    if (!this.nuevoViaje.nombre) { this.errorViaje = 'El nombre es obligatorio.'; return; }
    this.api.crearViaje(this.nuevoViaje, this.usuario.id).subscribe({
      next: () => {
        this.mostrarModal = false;
        this.nuevoViaje = { nombre: '', destino: '', descripcion: '', fechaInicio: '', fechaFin: '' };
        this.cargarViajes();
      },
      error: () => this.errorViaje = 'Error al crear el viaje.'
    });
  }

  verDetalle(id: number) { this.router.navigate(['/viaje', id]); }

  cerrarSesion() {
    sessionStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }


  completarViaje(id: number, event: Event) {
    // stopPropagation evita que al pulsar el botón también se abra el detalle del viaje
    event.stopPropagation();
    if (!confirm('¿Marcar este viaje como completado? No se puede deshacer.')) return;
    this.api.completarViaje(id).subscribe({
      next: () => this.cargarViajes(),
      error: () => alert('Error al completar el viaje.')
    });
  }

  get viajesActivos() {
    return this.viajes.filter(v => !v.completado);
  }

  get viajesCompletados() {
    return this.viajes.filter(v => v.completado);
  }
}