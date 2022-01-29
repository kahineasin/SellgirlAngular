import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinStepComponent } from './join-step.component';

describe('JoinStepComponent', () => {
  let component: JoinStepComponent;
  let fixture: ComponentFixture<JoinStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
