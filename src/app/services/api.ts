import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  // En desarrollo usa '' (vacío) para que el proxy redirija al 8080
  // En producción usa la URL de Railway directamente
  private url = environment.apiUrl + '/api';
  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.url}/usuarios/login`, { email, password });
  }
  registro(nombre: string, email: string, password: string) {
    return this.http.post<any>(`${this.url}/usuarios/registro`, { nombre, email, password });
  }
  getUsuarioActual() {
    const datos = sessionStorage.getItem('usuario');
    return datos ? JSON.parse(datos) : null;
  }
  logout() {
    sessionStorage.removeItem('usuario');
  }
  buscarPorEmail(email: string) {
    return this.http.get<any>(`${this.url}/usuarios/buscar?email=${encodeURIComponent(email)}`);
  }
  getViajes(usuarioId: number) {
    return this.http.get<any[]>(`${this.url}/viajes/usuario/${usuarioId}`);
  }
  crearViaje(viaje: any, creadorId: number) {
    return this.http.post<any>(`${this.url}/viajes/${creadorId}`, viaje);
  }
  getViaje(id: number) {
    return this.http.get<any>(`${this.url}/viajes/${id}`);
  }
  getParticipantes(viajeId: number) {
    return this.http.get<any[]>(`${this.url}/viajes/${viajeId}/participantes`);
  }
  añadirParticipante(viajeId: number, usuarioId: number) {
    return this.http.post<any>(`${this.url}/viajes/${viajeId}/participantes`, { id: usuarioId });
  }
  getGastos(viajeId: number) {
    return this.http.get<any[]>(`${this.url}/gastos/viaje/${viajeId}`);
  }
  registrarGasto(gasto: any) {
    return this.http.post<any>(`${this.url}/gastos`, gasto);
  }
  eliminarGasto(id: number) {
    return this.http.delete(`${this.url}/gastos/${id}`);
  }
  getDeudas(viajeId: number) {
    return this.http.get<any[]>(`${this.url}/deudas/viaje/${viajeId}`);
  }
  calcularDeudas(viajeId: number) {
    return this.http.post<any[]>(`${this.url}/deudas/calcular/${viajeId}`, {});
  }
  marcarPagada(id: number) {
    return this.http.put<any>(`${this.url}/deudas/${id}/pagar`, {});
  }

  completarViaje(id: number) {
    return this.http.put<any>(`${this.url}/viajes/${id}/completar`, {});
  }

  eliminarParticipante(participanteId: number) {
  return this.http.delete(`${this.url}/viajes/participantes/${participanteId}`);
  }

  getPerfil(usuarioId: number) {
    return this.http.get<any>(`${this.url}/usuarios/perfil/${usuarioId}`);
  }

  actualizarPerfil(usuarioId: number, datos: any) {
    return this.http.put<any>(`${this.url}/usuarios/perfil/${usuarioId}`, datos);
  }

  getHistorial(usuarioId: number) {
    return this.http.get<any[]>(`${this.url}/usuarios/historial/${usuarioId}`);
  }

  // ===== CLIMA Y MAPA =====
  getClima(viajeId: number) {
    return this.http.get<any>(`${this.url}/viajes/${viajeId}/clima`);
  }

  // ===== ITINERARIO =====
  getItinerario(viajeId: number) {
    return this.http.get<any[]>(`${this.url}/itinerario/viaje/${viajeId}`);
  }
  crearActividad(viajeId: number, actividad: any) {
    return this.http.post<any>(`${this.url}/itinerario/${viajeId}`, actividad);
  }
  actualizarActividad(id: number, actividad: any) {
    return this.http.put<any>(`${this.url}/itinerario/${id}`, actividad);
  }
  eliminarActividad(id: number) {
    return this.http.delete(`${this.url}/itinerario/${id}`);
  }
}