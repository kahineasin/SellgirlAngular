import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlSelectTableUlComponent } from './sql-select-table-ul.component';

describe('SqlSelectTableUlComponent', () => {
  let component: SqlSelectTableUlComponent;
  let fixture: ComponentFixture<SqlSelectTableUlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SqlSelectTableUlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SqlSelectTableUlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
