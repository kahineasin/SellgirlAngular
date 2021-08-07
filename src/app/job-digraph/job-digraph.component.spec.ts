import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDigraphComponent } from './job-digraph.component';

describe('JobDigraphComponent', () => {
  let component: JobDigraphComponent;
  let fixture: ComponentFixture<JobDigraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobDigraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDigraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
