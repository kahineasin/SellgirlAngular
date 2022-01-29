import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfInputTest1Component } from './pf-input-test1.component';

describe('PfInputTest1Component', () => {
  let component: PfInputTest1Component;
  let fixture: ComponentFixture<PfInputTest1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PfInputTest1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PfInputTest1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
