import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PfQuartzCronComponent } from "./pf-quartz-cron.component";

describe("PfQuartzCronComponent", () => {
  let component: PfQuartzCronComponent;
  let fixture: ComponentFixture<PfQuartzCronComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PfQuartzCronComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PfQuartzCronComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
