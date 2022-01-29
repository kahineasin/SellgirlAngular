import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";

import {
  getCaretPosition,
  saveSelection,
  getSelectionPosition,
} from "../../lib/dom";

@Component({
  selector: "tokenized-input",
  templateUrl: "./tokenized-input.component.html",
  styleUrls: ["./tokenized-input.component.scss"],
})
export class TokenizedInputComponent implements OnInit {
  @Input() public forwardedRef: any = null;
  @Input() public tokenizedEditing: any = null;
  @Input() public value: any = null;
  @Input() public startRule: any = null;
  // @Input() public syntaxTree: any = null;//metabase开源版才有这个属性
  @Input() public parserOptions: any = null;
  @Input() public placeholder: any = null;

  @Output() onChange = new EventEmitter<any>();
  @Output() onKeyDown = new EventEmitter<any>();
  @Output() onClick = new EventEmitter<any>();
  @Output() onFocus = new EventEmitter<any>();
  @Output() onBlur = new EventEmitter<any>();

  public _isTyping: boolean = false;
  public _value: any = null;

  constructor(public el: ElementRef) {}

  ngOnInit(): void {}

  getValue() {
    const me = this;
    if (this.value != null) {
      return this.value;
    } else {
      //return this.state.value;
      return me._value;
    }
  }
  setValue(value) {
    const me = this;
    //ReactDOM.findDOMNode(this).value = value;
    me.el.nativeElement.value = value;

    if (typeof me.onChange === "function") {
      me.onChange.emit({ target: { value } });
    } else {
      // this.setState({ value });
      me.value = value;
    }
  }
  onKeyDownTokenized = (e) => {
    const me = this;
    // isTyping signals whether the user is typing characters (keyCode >= 65) vs. deleting / navigating with arrows / clicking to select
    const isTyping = this._isTyping;
    // also keep isTyping same when deleting
    this._isTyping = e.keyCode >= 65 || (e.key === "Backspace" && isTyping);

    //const input = ReactDOM.findDOMNode(this);
    const input = me.el.nativeElement;

    const [start, end] = getSelectionPosition(input);
    if (start !== end) {
      return;
    }

    let element: any = window.getSelection().focusNode;
    while (element && element !== input) {
      // check ancestors of the focused node for "Expression-tokenized"
      // if the element is marked as "tokenized" we might want to intercept keypresses
      if (
        element.classList &&
        element.classList.contains("Expression-tokenized")
      ) {
        const positionInElement = getCaretPosition(element);
        const atStart = positionInElement === 0;
        const atEnd = positionInElement === element.textContent.length;
        const isSelected = element.classList.contains("Expression-selected");
        if (
          !isSelected &&
          !isTyping &&
          ((atEnd && e.key === "Backspace") || (atStart && e.key === "Delete"))
        ) {
          // not selected, not "typging", and hit backspace, so mark as "selected"
          element.classList.add("Expression-selected");
          e.stopPropagation();
          e.preventDefault();
          return;
        } else if (
          isSelected &&
          ((atEnd && e.key === "Backspace") || (atStart && e.key === "Delete"))
        ) {
          // selected and hit backspace, so delete it
          element.parentNode.removeChild(element);
          this.setValue(input.textContent);
          e.stopPropagation();
          e.preventDefault();
          return;
        } else if (
          isSelected &&
          ((atEnd && e.key === "ArrowLeft") ||
            (atStart && e.key === "ArrowRight"))
        ) {
          // selected and hit left arrow, so enter "typing" mode and unselect it
          element.classList.remove("Expression-selected");
          this._isTyping = true;
          e.stopPropagation();
          e.preventDefault();
          return;
        }
      }
      // nada, try the next ancestor
      element = element.parentNode;
    }

    // if we haven't handled the event yet, pass it on to our parent
    //this.props.onKeyDown(e);
    me.onKeyDown.emit(e);
  };
  onKeyDownNormal = (e) => {
    const me = this;
    //this.props.onKeyDown(e);
    me.onKeyDown.emit(e);
  };
  onFieldClick = (e) => {
    this._isTyping = false;
    return this.onClick.emit(e);
  };

  onInput = (e) => {
    this.setValue(e.target.textContent);
  };
}
