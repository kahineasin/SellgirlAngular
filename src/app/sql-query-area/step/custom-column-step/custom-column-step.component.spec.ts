import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomColumnStepComponent } from './custom-column-step.component';

describe('CustomColumnStepComponent', () => {
  let component: CustomColumnStepComponent;
  let fixture: ComponentFixture<CustomColumnStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomColumnStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomColumnStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
