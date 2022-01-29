import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfSelectComponent } from './pf-select.component';

describe('PfSelectComponent', () => {
  let component: PfSelectComponent;
  let fixture: ComponentFixture<PfSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PfSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PfSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
