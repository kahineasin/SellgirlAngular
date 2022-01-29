import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpressionEditorTextfieldComponent } from './expression-editor-textfield.component';

describe('ExpressionEditorTextfieldComponent', () => {
  let component: ExpressionEditorTextfieldComponent;
  let fixture: ComponentFixture<ExpressionEditorTextfieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpressionEditorTextfieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpressionEditorTextfieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
