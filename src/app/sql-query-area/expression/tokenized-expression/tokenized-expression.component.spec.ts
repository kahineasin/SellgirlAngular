import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenizedExpressionComponent } from './tokenized-expression.component';

describe('TokenizedExpressionComponent', () => {
  let component: TokenizedExpressionComponent;
  let fixture: ComponentFixture<TokenizedExpressionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenizedExpressionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenizedExpressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
