import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfExpressionFieldComponent } from './pf-expression-field.component';

describe('PfExpressionFieldComponent', () => {
  let component: PfExpressionFieldComponent;
  let fixture: ComponentFixture<PfExpressionFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PfExpressionFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PfExpressionFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
