import { Component, ElementRef, Input, OnInit } from "@angular/core";
import memoize from "lodash.memoize";
import {
  tokenize,
  countMatchingParentheses,
  TOKEN,
  OPERATOR as OP,
} from "../../lib/expressions/tokenizer";
import { PfUtil, t } from "../../../../../../core/common/pfUtil";
import { processSource } from "../../lib/expressions/process";
import { getMBQLName, isExpression } from "../../lib/expressions";
import { setCaretPosition, getSelectionPosition } from "../../lib/dom";
import {
  KEYCODE_ENTER,
  KEYCODE_ESCAPE,
  KEYCODE_LEFT,
  KEYCODE_UP,
  KEYCODE_RIGHT,
  KEYCODE_DOWN,
} from "../../lib/keyboard";
import { StructuredQuery } from "../../model/Query";

/**
 * 参考E:\svn\metabase-master\frontend\src\metabase\query_builder\components\expressions\ExpressionEditorTextfield.jsx
 */
@Component({
  selector: "expression-editor-textfield",
  templateUrl: "./expression-editor-textfield.component.html",
  styleUrls: ["./expression-editor-textfield.component.scss"],
})
export class ExpressionEditorTextfieldComponent implements OnInit {
  @Input() public startRule: any = null;
  @Input() public query: StructuredQuery = null;

  public compileError: boolean = false;
  public priorityError: boolean = false;
  public props: any = null;
  public placeholder: any = null;
  public source: any = null;
  // public syntaxTree: any = null;
  public _processSource: any = null;
  public highlightedSuggestionIndex: number = 0;
  public expression: any = null;
  public suggestions: any = null;
  public helpText: String = null;
  public displayError: any = null;
  public tokenizerError: any = null;
  // //private t: (any) => string = null;
  constructor(public el: ElementRef, private pfUtil: PfUtil) {
    this._processSource = memoize(processSource, ({ source, targetOffset }) =>
      // resovle should include anything that affect the results of processSource
      // except currently we exclude `startRule` and `query` since they shouldn't change
      [source, targetOffset].join(",")
    );
    const me = this;
    //me.t = pfUtil.getLocalizedText;
  }

  ngOnInit(): void {}
  ngOnChanges(): void {
    const me = this;
    me.priorityError = me.displayError.length > 0 ? me.displayError[0] : false;
  }

  // public _getParserOptions(props = this.props) {
  //   return {
  //     query: props.query,
  //     startRule: props.startRule,
  //   };
  // }
  // public onExpressionChange(source) {
  //   const me = this;

  //   //const inputElement = this.input.current;
  //   const inputElement = me.el.nativeElement;

  //   if (!inputElement) {
  //     return;
  //   }

  //   const [selectionStart, selectionEnd] = getSelectionPosition(inputElement);
  //   const hasSelection = selectionStart !== selectionEnd;
  //   const isAtEnd = selectionEnd === source.length;
  //   const endsWithWhitespace = /\s$/.test(source);
  //   const targetOffset = !hasSelection ? selectionEnd : null;

  //   const { expression, compileError, suggestions, helpText } = source
  //     ? this._processSource({
  //         source,
  //         targetOffset,
  //         ...this._getParserOptions(),
  //       })
  //     : {
  //         expression: null,
  //         compileError: null,
  //         suggestions: [],
  //         helpText: null,
  //       };

  //   const isValid = expression !== undefined;
  //   if (this.props.onBlankChange) {
  //     this.props.onBlankChange(source.length === 0);
  //   }
  //   // don't show suggestions if
  //   // * there's a selection
  //   // * we're at the end of a valid expression, unless the user has typed another space
  //   const showSuggestions =
  //     !hasSelection && !(isValid && isAtEnd && !endsWithWhitespace);

  //   const { tokens, errors: tokenizerError } = tokenize(source);
  //   const mismatchedParentheses = countMatchingParentheses(tokens);
  //   const mismatchedError =
  //     mismatchedParentheses === 1
  //       ? t`Expecting a closing parenthesis`
  //       : mismatchedParentheses > 1
  //       ? t`Expecting ${mismatchedParentheses} closing parentheses`
  //       : mismatchedParentheses === -1
  //       ? t`Expecting an opening parenthesis`
  //       : mismatchedParentheses < -1
  //       ? t`Expecting ${-mismatchedParentheses} opening parentheses`
  //       : null;
  //   if (mismatchedError) {
  //     tokenizerError.push({
  //       message: mismatchedError,
  //     });
  //   }

  //   for (let i = 0; i < tokens.length - 1; ++i) {
  //     const token = tokens[i];
  //     if (token.type === TOKEN.Identifier && source[token.start] !== "[") {
  //       const functionName = source.slice(token.start, token.end);
  //       if (getMBQLName(functionName)) {
  //         const next = tokens[i + 1];
  //         if (next.op !== OP.OpenParenthesis) {
  //           tokenizerError.unshift({
  //             message: t`Expecting an opening parenthesis after function ${functionName}`,
  //           });
  //         }
  //       }
  //     }
  //   }

  //   // this.setState({
  //   //   source,
  //   //   expression,
  //   //   tokenizerError,
  //   //   compileError,
  //   //   displayError: null,
  //   //   suggestions: showSuggestions ? suggestions : [],
  //   //   helpText,
  //   //   highlightedSuggestionIndex: 0,
  //   // });

  //   // if (!source || source.length <= 0) {
  //   //   const { suggestions } = this._processSource({
  //   //     source,
  //   //     targetOffset,
  //   //     ...this._getParserOptions(),
  //   //   });
  //   //   this.setState({ suggestions });
  //   // }
  // }

  // public _triggerAutosuggest = () => {
  //   this.onExpressionChange(this.source);
  // };
  // public onInputKeyDown = (e) => {
  //   const { suggestions, highlightedSuggestionIndex } = this;
  //   if (e.keyCode === KEYCODE_LEFT || e.keyCode === KEYCODE_RIGHT) {
  //     setTimeout(() => this._triggerAutosuggest());
  //     return;
  //   }
  //   if (e.keyCode === KEYCODE_ESCAPE) {
  //     e.stopPropagation();
  //     e.preventDefault();
  //     this.clearSuggestions();
  //     return;
  //   }
  //   if (!suggestions.length) {
  //     if (
  //       e.keyCode === KEYCODE_ENTER &&
  //       this.props.onCommit &&
  //       this.expression != null
  //     ) {
  //       this.props.onCommit(this.expression);
  //     }
  //     return;
  //   }
  //   if (e.keyCode === KEYCODE_ENTER) {
  //     this.onSuggestionSelected(highlightedSuggestionIndex);
  //     e.preventDefault();
  //   } else if (e.keyCode === KEYCODE_UP) {
  //     // this.setState({
  //     //   highlightedSuggestionIndex:
  //     //     (highlightedSuggestionIndex + suggestions.length - 1) %
  //     //     suggestions.length,
  //     // });
  //     e.preventDefault();
  //   } else if (e.keyCode === KEYCODE_DOWN) {
  //     // this.setState({
  //     //   highlightedSuggestionIndex:
  //     //     (highlightedSuggestionIndex + suggestions.length + 1) %
  //     //     suggestions.length,
  //     // });
  //     e.preventDefault();
  //   }
  // };
  // public clearSuggestions() {
  //   const me = this;
  //   me.suggestions = [];
  //   me.highlightedSuggestionIndex = 0;
  //   me.helpText = null;
  // }
  // public onInputBlur = (e) => {
  //   const me = this;
  //   // Switching to another window also triggers the blur event.
  //   // When our window gets focus again, the input will automatically
  //   // get focus, so ignore the blue event to avoid showing an
  //   // error message when the user is not actually done.
  //   if (e.target === document.activeElement) {
  //     return;
  //   }

  //   this.clearSuggestions();

  //   //const { tokenizerError, compileError } = this.state;
  //   let displayError = [...me.tokenizerError];
  //   if (me.compileError) {
  //     if (Array.isArray(me.compileError)) {
  //       displayError = [...displayError, ...me.compileError];
  //     } else {
  //       displayError.push(me.compileError);
  //     }
  //   }
  //   me.displayError = displayError;
  //   //this.setState({ displayError });

  //   // whenever our input blurs we push the updated expression to our parent if valid
  //   if (this.expression) {
  //     if (!isExpression(this.expression)) {
  //       console.warn("isExpression=false", this.expression);
  //     }
  //     this.props.onChange(this.expression);
  //   } else if (displayError && displayError.length > 0) {
  //     this.props.onError(displayError);
  //   } else {
  //     this.props.onError({ message: t`Invalid expression` });
  //   }
  // };

  // public _setCaretPosition = (position, autosuggest) => {
  //   const me = this;
  //   //setCaretPosition(this.input.current, position);
  //   setCaretPosition(me.el.nativeElement, position);
  //   if (autosuggest) {
  //     setTimeout(() => this._triggerAutosuggest());
  //   }
  // };
  // public onSuggestionSelected = (index) => {
  //   const me = this;
  //   const { source, suggestions } = this;
  //   const suggestion = suggestions && suggestions[index];

  //   if (suggestion) {
  //     const { tokens } = tokenize(source);
  //     const token = tokens.find((t) => t.end >= suggestion.index);
  //     if (token) {
  //       const prefix = source.slice(0, token.start);
  //       const postfix = source.slice(token.end);
  //       const suggested = suggestion.text;

  //       // e.g. source is "isnull(A" and suggested is "isempty("
  //       // the result should be "isempty(A" and NOT "isempty((A"
  //       //const openParen = _.last(suggested) === "(";
  //       const openParen = me.pfUtil.arrayLast(suggested) === "(";
  //       //const alreadyOpenParen = _.first(postfix.trimLeft()) === "(";
  //       const alreadyOpenParen = postfix.trimLeft()[0] === "(";
  //       const extraTrim = openParen && alreadyOpenParen ? 1 : 0;
  //       const replacement = suggested.slice(0, suggested.length - extraTrim);

  //       const updatedExpression = prefix + replacement.trim() + postfix;
  //       this.onExpressionChange(updatedExpression);
  //       const caretPos = updatedExpression.length - postfix.length;
  //       setTimeout(() => {
  //         this._setCaretPosition(caretPos, true);
  //       });
  //     } else {
  //       const newExpression = source + suggestion.text;
  //       this.onExpressionChange(newExpression);
  //       setTimeout(() => this._setCaretPosition(newExpression.length, true));
  //     }
  //   }
  // };

  // onInputClick = () => {
  //   this._triggerAutosuggest();
  // };
}
