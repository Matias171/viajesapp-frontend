import { Component, signal } from '@angular/core';

// decorador
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})

//clase para la lógica
export class App {
  protected readonly title = signal('fullstackAngular');
}
