// combine compile/suggest/syntax so we only need to parse once
import { parse } from "./parser";
import { compile } from "./compile"; //benjamin todo
import { suggest } from "./suggest"; //此引用暂时不能使用,牵连太多--benjamin todo
import { syntax } from "./syntax";
export function processSource(options) {
  // Lazily load all these parser-related stuff, because parser construction is expensive
  // https://github.com/metabase/metabase/issues/13472
  //const parse = require("./parser").parse;
  // const compile = require("./compile").compile;
  // const suggest = require("./suggest").suggest;
  // const syntax = require("./syntax").syntax;

  const { source, targetOffset } = options;

  let expression;
  let suggestions = [];
  let helpText;
  let syntaxTree;
  let compileError;

  // PARSE
  const {
    cst,
    tokenVector,
    parserErrors, //, typeErrors
  } = parse({
    ...options,
    recover: true,
  });

  // // COMPILE
  // if (typeErrors.length > 0 || parserErrors.length > 0) {
  //   compileError = typeErrors.concat(parserErrors);
  // } else {
  //   try {
  //     expression = compile({ cst, tokenVector, ...options });
  //   } catch (e) {
  //     console.warn("compile error", e);
  //     compileError = e;
  //   }
  // }
  // COMPILE
  if (parserErrors.length > 0) {
    console.log("parse errors", parserErrors);
    compileError = parserErrors;
  } else {
    try {
      expression = compile({ cst, tokenVector, ...options });
    } catch (e) {
      console.log("compile error", e);
      compileError = e;
    }
  }

  //debugger;
  // // SUGGEST
  if (targetOffset != null) {
    try {
      ({ suggestions = [], helpText } = suggest({
        cst,
        tokenVector,
        ...options,
      }));
      console.info(
        "-------------------------processSource---------------------------"
      );
      console.info("suggestions", suggestions);
      console.info(
        "-------------------------processSource end---------------------------"
      );
    } catch (e) {
      console.warn("suggest error", e);
    }
  }

  // SYNTAX
  try {
    syntaxTree = syntax({ cst, tokenVector, ...options });
  } catch (e) {
    console.warn("syntax error", e);
  }

  return {
    source,
    expression,
    helpText,
    suggestions,
    syntaxTree,
    compileError,
  };
}
