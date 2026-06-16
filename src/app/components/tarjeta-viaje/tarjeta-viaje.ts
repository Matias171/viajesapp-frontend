import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Viaje } from '../../models/viaje';

@Component({
  selector: 'app-tarjeta-viaje',
  standalone: false,
  templateUrl: './tarjeta-viaje.html',
  styleUrl: './tarjeta-viaje.css',
})
export class TarjetaViaje {
  @Input() viaje!: Viaje;
  @Output() verDetalle = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();
}