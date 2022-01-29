import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatamodelQueryEditComponent } from './datamodel-query-edit.component';

describe('DatamodelQueryEditComponent', () => {
  let component: DatamodelQueryEditComponent;
  let fixture: ComponentFixture<DatamodelQueryEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatamodelQueryEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatamodelQueryEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
