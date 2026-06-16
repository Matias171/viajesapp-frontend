import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import * as L from 'leaflet';

@Component({
  selector: 'app-viaje-detalle',
  standalone: false,
  templateUrl: './viaje-detalle.html',
  styleUrl: './viaje-detalle.css'
})
export class ViajeDetalle implements OnInit {

  viajeId!: number;
  viaje: any = null;
  usuario: any = null;
  participantes: any[] = [];
  gastos: any[] = [];
  deudas: any[] = [];
  balance: any[] = [];
  tabActivo = 'participantes';
  totalGastado = 0;
  cargando = true;
  mostrarModalParticipante = false;
  emailBusqueda = '';
  usuarioEncontrado: any = null;
  errorParticipante = '';
  mostrarModalGasto = false;
  nuevoGasto: any = { descripcion: '', cantidad: '', pagadorId: '' };
  errorGasto = '';

  // ===== ITINERARIO =====
  itinerario: any[] = [];
  diasViaje: string[] = [];
  mostrarModalActividad = false;
  nuevaActividad: any = { id: null, dia: '', hora: '', titulo: '', lugar: '', descripcion: '' };
  errorActividad = '';

  // ===== MAPA Y CLIMA =====
  clima: any = null;
  cargandoClima = false;
  private mapa: L.Map | null = null;
  private marcadorDestino: L.Marker | null = null;
  private marcadoresActividades: L.Marker[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private cd: ChangeDetectorRef // ← añadido
  ) {}

  ngOnInit() {
    const datos = sessionStorage.getItem('usuario');
    if (!datos) { this.router.navigate(['/login']); return; }
    this.usuario = JSON.parse(datos);
    this.viajeId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarViaje();
    this.cargarParticipantes();
    this.cargarGastos();
    this.cargarDeudas();
  }

  cargarViaje() {
    this.api.getViaje(this.viajeId).subscribe({
      next: (v) => {
        this.viaje = v;
        this.cargando = false;
        this.actualizarDiasViaje();
        this.cd.detectChanges(); // ← fuerza actualización
      },
      error: () => {
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }

  cargarParticipantes() {
    this.api.getParticipantes(this.viajeId).subscribe({
      next: (p) => {
        this.participantes = p;
        this.calcularBalance();
        this.cd.detectChanges();
      },
      error: () => this.participantes = []
    });
  }

  cargarGastos() {
    this.api.getGastos(this.viajeId).subscribe({
      next: (g) => {
        this.gastos = g;
        this.totalGastado = g.reduce((s: number, x: any) => s + Number(x.cantidad), 0);
        this.calcularBalance();
        this.cd.detectChanges();
      },
      error: () => this.gastos = []
    });
  }

  cargarDeudas() {
    this.api.getDeudas(this.viajeId).subscribe({
      next: (d) => {
        this.deudas = d;
        this.cd.detectChanges();
      },
      error: () => this.deudas = []
    });
  }

  calcularBalance() {
    if (!this.participantes.length || !this.gastos.length) { this.balance = []; return; }
    const parte = this.totalGastado / this.participantes.length;
    const pagado: any = {};
    this.participantes.forEach((p: any) => {
      if (p.usuario) pagado[p.usuario.id] = { nombre: p.usuario.nombre, total: 0 };
    });
    this.gastos.forEach((g: any) => {
      if (g.pagador && pagado[g.pagador.id] !== undefined) {
        pagado[g.pagador.id].total += Number(g.cantidad);
      }
    });
    this.balance = Object.values(pagado).map((p: any) => ({
      nombre: p.nombre,
      balance: p.total - parte
    }));
    this.cd.detectChanges();
  }

  cambiarTab(tab: string) {
    this.tabActivo = tab;
    if (tab === 'participantes') this.cargarParticipantes();
    if (tab === 'gastos') this.cargarGastos();
    if (tab === 'deudas') this.cargarDeudas();
    if (tab === 'balance') this.calcularBalance();
    if (tab === 'itinerario') this.cargarItinerario();
    if (tab === 'mapa') this.cargarMapaClima();
  }

  buscarUsuario() {
    this.errorParticipante = '';
    this.usuarioEncontrado = null;
    if (!this.emailBusqueda) return;
    this.api.buscarPorEmail(this.emailBusqueda).subscribe({
      next: (u) => { this.usuarioEncontrado = u; this.cd.detectChanges(); },
      error: () => { this.errorParticipante = 'No se encontró ningún usuario con ese email.'; this.cd.detectChanges(); }
    });
  }

  confirmarParticipante() {
    if (!this.usuarioEncontrado) return;
    const yaEstaEnLista = this.participantes.some(p => p.usuario?.id === this.usuarioEncontrado.id);
    if (yaEstaEnLista) { this.errorParticipante = 'Este usuario ya es participante del viaje.'; return; }
    this.api.añadirParticipante(this.viajeId, this.usuarioEncontrado.id).subscribe({
      next: () => {
        this.mostrarModalParticipante = false;
        this.emailBusqueda = '';
        this.usuarioEncontrado = null;
        this.errorParticipante = '';
        this.cargarParticipantes();
      },
      error: () => { this.errorParticipante = 'Este usuario ya es participante del viaje.'; }
    });
  }

  registrarGasto() {
    this.errorGasto = '';
    if (!this.nuevoGasto.descripcion || !this.nuevoGasto.cantidad || !this.nuevoGasto.pagadorId) {
      this.errorGasto = 'Rellena todos los campos.'; return;
    }
    this.api.registrarGasto({
      descripcion: this.nuevoGasto.descripcion,
      cantidad: parseFloat(this.nuevoGasto.cantidad),
      pagadorId: parseInt(this.nuevoGasto.pagadorId),
      viajeId: this.viajeId
    }).subscribe({
      next: () => {
        this.mostrarModalGasto = false;
        this.nuevoGasto = { descripcion: '', cantidad: '', pagadorId: '' };
        this.cargarGastos();
      },
      error: () => this.errorGasto = 'Error al registrar el gasto.'
    });
  }

  eliminarGasto(id: number) {
    if (!confirm('¿Eliminar este gasto?')) return;
    this.api.eliminarGasto(id).subscribe({ next: () => this.cargarGastos() });
  }

  calcularDeudas() {
    this.api.calcularDeudas(this.viajeId).subscribe({ next: () => this.cargarDeudas() });
  }

  marcarPagada(id: number) {
    this.api.marcarPagada(id).subscribe({ next: () => this.cargarDeudas() });
  }

  eliminarParticipante(participanteId: number, nombreUsuario: string, event: Event) {
    event.stopPropagation();

    // No dejamos eliminar si solo queda un participante
    if (this.participantes.length <= 1) {
      alert('El viaje debe tener al menos un participante.');
      return;
    }

    if (!confirm(`¿Eliminar a ${nombreUsuario} del viaje? Sus gastos seguirán registrados pero no se le tendrá en cuenta en los cálculos.`)) return;

    this.api.eliminarParticipante(participanteId).subscribe({
      next: () => {
        this.cargarParticipantes();
        this.api.calcularDeudas(this.viajeId).subscribe({
          next: () => this.cargarDeudas()
        });
      },
      error: (err) => {
        // Solo mostramos error si realmente no se borró
        this.cargarParticipantes();
        if (err.status !== 200) {
          // Recargamos igualmente por si se borró
          this.api.calcularDeudas(this.viajeId).subscribe({
            next: () => this.cargarDeudas()
          });
        }
      }
    });
  }

  // ===================== ITINERARIO =====================

  // Carga las actividades del itinerario y las agrupa por día
  cargarItinerario() {
    this.api.getItinerario(this.viajeId).subscribe({
      next: (data) => {
        this.itinerario = data || [];
        this.actualizarDiasViaje();
        this.cd.detectChanges();
        // si el mapa ya está abierto, refrescamos sus marcadores
        if (this.mapa) this.actualizarMarcadores();
      },
      error: () => this.itinerario = []
    });
  }

  // Genera la lista de días del viaje (rango fechaInicio-fechaFin) y añade
  // cualquier día con actividades que quede fuera de ese rango
  actualizarDiasViaje() {
    const dias: string[] = [];

    if (this.viaje?.fechaInicio && this.viaje?.fechaFin) {
      let actual = new Date(this.viaje.fechaInicio + 'T00:00:00');
      const fin = new Date(this.viaje.fechaFin + 'T00:00:00');
      while (actual <= fin) {
        const year = actual.getFullYear();
        const month = String(actual.getMonth() + 1).padStart(2, '0');
        const day = String(actual.getDate()).padStart(2, '0');

        dias.push(`${year}-${month}-${day}`);
        actual.setDate(actual.getDate() + 1);
      }
    }

    this.itinerario.forEach(a => {
      if (a.dia && !dias.includes(a.dia)) dias.push(a.dia);
    });

    dias.sort();
    this.diasViaje = dias;
  }

  // Actividades de un día concreto, ordenadas por hora
  actividadesDelDia(fecha: string) {
    return this.itinerario
      .filter(a => a.dia === fecha)
      .sort((a, b) => (a.hora || '99:99').localeCompare(b.hora || '99:99'));
  }

  // Abre el modal de actividad. Si se pasa una actividad existente, la precarga para editar
  abrirModalActividad(actividad?: any) {
    this.errorActividad = '';
    if (actividad) {
      this.nuevaActividad = {
        id: actividad.id,
        dia: actividad.dia,
        hora: actividad.hora ? actividad.hora.slice(0, 5) : '',
        titulo: actividad.titulo,
        lugar: actividad.lugar || '',
        descripcion: actividad.descripcion || ''
      };
    } else {
      this.nuevaActividad = {
        id: null,
        dia: this.viaje?.fechaInicio || '',
        hora: '',
        titulo: '',
        lugar: '',
        descripcion: ''
      };
    }
    this.mostrarModalActividad = true;
  }

  // Crea o actualiza una actividad del itinerario
  guardarActividad() {
    this.errorActividad = '';

    if (!this.nuevaActividad.dia || !this.nuevaActividad.titulo) {
      this.errorActividad = 'Indica al menos el día y el título de la actividad.';
      return;
    }

    const body = {
      dia: this.nuevaActividad.dia,
      hora: this.nuevaActividad.hora || null,
      titulo: this.nuevaActividad.titulo,
      lugar: this.nuevaActividad.lugar || null,
      descripcion: this.nuevaActividad.descripcion || null
    };

    const peticion = this.nuevaActividad.id
      ? this.api.actualizarActividad(this.nuevaActividad.id, body)
      : this.api.crearActividad(this.viajeId, body);

    peticion.subscribe({
      next: () => {
        this.mostrarModalActividad = false;
        this.cargarItinerario();
      },
      error: () => this.errorActividad = 'Error al guardar la actividad.'
    });
  }

  // Elimina una actividad del itinerario
  eliminarActividad(id: number) {
    if (!confirm('¿Eliminar esta actividad del itinerario?')) return;
    this.api.eliminarActividad(id).subscribe({ next: () => this.cargarItinerario() });
  }

  // ===================== MAPA Y CLIMA =====================

  // Pide el clima/coordenadas del destino e inicializa el mapa con sus marcadores
  cargarMapaClima() {
    this.cargandoClima = true;
    this.api.getClima(this.viajeId).subscribe({
      next: (data) => {
        this.clima = data;
        this.cargandoClima = false;
        this.cd.detectChanges();
        // esperamos a que Angular pinte el div del mapa antes de inicializarlo
        setTimeout(() => this.inicializarMapa(), 0);
      },
      error: () => {
        this.clima = { disponible: false, mensaje: 'No se ha podido obtener el clima del destino.' };
        this.cargandoClima = false;
        this.cd.detectChanges();
      }
    });

    // Necesitamos el itinerario para poder pintar sus marcadores en el mapa
    if (this.itinerario.length === 0) this.cargarItinerario();
  }

  // Crea el mapa de Leaflet la primera vez que se necesita
  private inicializarMapa() {
  if (!this.clima?.disponible) return;

  const contenedor = document.getElementById('mapa');
  if (!contenedor) return;

  if (!this.mapa) {
    this.mapa = L.map('mapa');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.mapa);

    // Fuerza a Leaflet a recalcular el tamaño del contenedor
    setTimeout(() => {
      if (this.mapa) {
        this.mapa.invalidateSize();
      }
    }, 100);
  }

  this.actualizarMarcadores();
}

  // Coloca el marcador del destino y los de las actividades con coordenadas
  private actualizarMarcadores() {
  if (!this.mapa || !this.clima?.disponible) return;

  const puntos: [number, number][] = [];

  // 👉 SOLO usamos coordenadas para centrar el mapa (sin marcador)
  if (this.clima.lat != null && this.clima.lon != null) {
    puntos.push([this.clima.lat, this.clima.lon]);
  }

  if (puntos.length === 1) {
    this.mapa.setView(puntos[0], 12);
  }

  // Si quisieras encuadrar varios puntos en el futuro:
  if (puntos.length > 1) {
    this.mapa.fitBounds(puntos, { padding: [30, 30] });
  }

  setTimeout(() => this.mapa?.invalidateSize(), 100);
}
}