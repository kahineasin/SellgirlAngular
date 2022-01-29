import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfSvgIconComponent } from './pf-svg-icon.component';

describe('PfSvgIconComponent', () => {
  let component: PfSvgIconComponent;
  let fixture: ComponentFixture<PfSvgIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PfSvgIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PfSvgIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
