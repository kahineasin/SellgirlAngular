import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PfExpressionFieldJqComponent } from "./pf-expression-field-jq.component";

describe("PfExpressionFieldJqComponent", () => {
  let component: PfExpressionFieldJqComponent;
  let fixture: ComponentFixture<PfExpressionFieldJqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PfExpressionFieldJqComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PfExpressionFieldJqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
