import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Viajes } from './pages/viajes/viajes';
import { ViajeDetalle } from './pages/viaje-detalle/viaje-detalle';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { TarjetaViaje } from './components/tarjeta-viaje/tarjeta-viaje';
import { Perfil } from './pages/perfil/perfil';

@NgModule({
declarations: [App, Login, Registro, Viajes, ViajeDetalle, Perfil, Header, Footer, TarjetaViaje],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient()
  ],
  bootstrap: [App]
})
export class AppModule {}