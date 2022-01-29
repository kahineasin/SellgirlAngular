import { Component, Input, OnInit } from "@angular/core";
import { tokenize, TOKEN, OPERATOR } from "../../lib/expressions/tokenizer";
import { getMBQLName, FUNCTIONS } from "../../lib/expressions/config";

@Component({
  selector: "tokenized-expression",
  templateUrl: "./tokenized-expression.component.html",
  styleUrls: ["./tokenized-expression.component.scss"],
})
export class TokenizedExpressionComponent implements OnInit {
  @Input() public tokenizedEditing: any = null;
  @Input() public startRule: any = null;
  @Input() public source: any = null;
  constructor() {}

  ngOnInit(): void {
    const me = this;
    // let testJbj = {
    //   "Expression-node": true,
    //   ["Expression-" + me.startRule]: true,
    // };
  }
  public mapTokenType = function (token) {
    const { type, op } = token;
    switch (type) {
      case TOKEN.Operator:
        return op === OPERATOR.OpenParenthesis
          ? "open-paren"
          : op === OPERATOR.CloseParenthesis
          ? "close-paren"
          : "operator";
      case TOKEN.Number:
        return "number-literal";
      case TOKEN.String:
        return "string-literal";
      case TOKEN.Identifier:
        // FIXME metric vs dimension vs segment
        return "dimension";
      default:
        return "token";
    }
  };
  public createSpans = function (source) {
    const me = this;
    const isFunction = (name) =>
      name.toLowerCase() === "case" || FUNCTIONS.has(getMBQLName(name));
    const { tokens } = tokenize(source);
    let lastPos = 0;
    const spans = [];
    tokens.forEach((token) => {
      const str = source.substring(lastPos, token.start);
      if (str.length > 0) {
        spans.push({
          kind: "whitespace",
          text: str,
        });
      }
      const text = source.substring(token.start, token.end);
      const kind = isFunction(text) ? "function-name" : me.mapTokenType(token);
      spans.push({ kind, text });
      lastPos = token.end;
    });
    const tail = source.substring(lastPos);
    if (tail.length > 0) {
      spans.push({
        kind: "whitespace",
        text: tail,
      });
    }
    return spans;
  };

  public getParentClass() {
    const me = this;
    return { "Expression-node": true, ["Expression-" + me.startRule]: true };
  }
  public getChildClass(kind) {
    const me = this;
    return { "Expression-node": true, ["Expression-" + kind]: true };
  }
}
