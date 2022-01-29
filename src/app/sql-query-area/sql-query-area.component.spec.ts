import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlQueryAreaComponent } from './sql-query-area.component';

describe('SqlQueryAreaComponent', () => {
  let component: SqlQueryAreaComponent;
  let fixture: ComponentFixture<SqlQueryAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SqlQueryAreaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SqlQueryAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
