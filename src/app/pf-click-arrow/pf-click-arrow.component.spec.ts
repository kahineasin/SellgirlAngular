import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfClickArrowComponent } from './pf-click-arrow.component';

describe('PfClickArrowComponent', () => {
  let component: PfClickArrowComponent;
  let fixture: ComponentFixture<PfClickArrowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PfClickArrowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PfClickArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
