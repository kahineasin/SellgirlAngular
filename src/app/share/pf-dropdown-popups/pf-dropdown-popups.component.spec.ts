import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfDropdownPopupsComponent } from './pf-dropdown-popups.component';

describe('PfDropdownPopupsComponent', () => {
  let component: PfDropdownPopupsComponent;
  let fixture: ComponentFixture<PfDropdownPopupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PfDropdownPopupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PfDropdownPopupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
