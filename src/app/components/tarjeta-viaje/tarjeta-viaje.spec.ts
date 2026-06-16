import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjetaViaje } from './tarjeta-viaje';

describe('TarjetaViaje', () => {
  let component: TarjetaViaje;
  let fixture: ComponentFixture<TarjetaViaje>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TarjetaViaje],
    }).compileComponents();

    fixture = TestBed.createComponent(TarjetaViaje);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
