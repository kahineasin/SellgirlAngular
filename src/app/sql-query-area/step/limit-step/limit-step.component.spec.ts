import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitStepComponent } from './limit-step.component';

describe('LimitStepComponent', () => {
  let component: LimitStepComponent;
  let fixture: ComponentFixture<LimitStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LimitStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LimitStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
