import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenizedInputComponent } from './tokenized-input.component';

describe('TokenizedInputComponent', () => {
  let component: TokenizedInputComponent;
  let fixture: ComponentFixture<TokenizedInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenizedInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenizedInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
