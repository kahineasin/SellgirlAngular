import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepRowComponent } from './step-row.component';

describe('StepRowComponent', () => {
  let component: StepRowComponent;
  let fixture: ComponentFixture<StepRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
