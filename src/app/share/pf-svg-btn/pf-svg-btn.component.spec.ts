import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfSvgBtnComponent } from './pf-svg-btn.component';

describe('PfSvgBtnComponent', () => {
  let component: PfSvgBtnComponent;
  let fixture: ComponentFixture<PfSvgBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PfSvgBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PfSvgBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
