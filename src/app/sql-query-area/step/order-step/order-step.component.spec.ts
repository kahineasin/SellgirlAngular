import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderStepComponent } from './order-step.component';

describe('OrderStepComponent', () => {
  let component: OrderStepComponent;
  let fixture: ComponentFixture<OrderStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
