import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Viajes } from './pages/viajes/viajes';
import { ViajeDetalle } from './pages/viaje-detalle/viaje-detalle';
import { Perfil } from './pages/perfil/perfil';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'viajes', component: Viajes },
  { path: 'viaje/:id', component: ViajeDetalle },
  { path: 'perfil', component: Perfil },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }