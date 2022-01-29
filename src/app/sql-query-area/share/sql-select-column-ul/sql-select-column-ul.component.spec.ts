import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SqlSelectColumnUlComponent } from "./sql-select-column-ul.component";

describe("SelectColumnUlComponent", () => {
  let component: SqlSelectColumnUlComponent;
  let fixture: ComponentFixture<SqlSelectColumnUlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SqlSelectColumnUlComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SqlSelectColumnUlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
