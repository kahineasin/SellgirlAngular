//import _ from "underscore";
import { PfUnderscore as _ } from '../pf_underscore';

import { MBQL_CLAUSES, OPERATOR_PRECEDENCE, getExpressionName } from './config';
import {
  // MBQL_CLAUSES,
  // OPERATOR_PRECEDENCE,
  isNumberLiteral,
  isStringLiteral,
  isOperator,
  isFunction,
  isDimension,
  isMetric,
  isSegment,
  isCase,
  formatMetricName,
  formatSegmentName,
  formatDimensionName,
  //getExpressionName,
  formatStringLiteral,
  hasOptions,
} from '.';
import type StructuredQueryClass from '../../metabase-lib/lib/queries/StructuredQueryClass';
import { IField } from '../../model/IField';
import { IObjInitHelper } from '../../model/IObjInitHelper';

export { DISPLAY_QUOTES, EDITOR_QUOTES, getExpressionName } from './config';

type QuotesConfig = {};

type FormatterOptions = {
  query: StructuredQueryClass;
  quotes: QuotesConfig;
  parens: Boolean;
};

// convert a MBQL expression back into an expression string
export function format(
  mbql: any,
  fieldClass: IObjInitHelper,
  options: FormatterOptions = {} as any
) {
  //debugger;
  if (mbql == null || _.isEqual(mbql, [])) {
    return '';
  } else if (isNumberLiteral(mbql)) {
    return formatNumberLiteral(
      mbql //, options
    );
  } else if (isStringLiteral(mbql)) {
    return formatStringLiteral(
      mbql //, options
    );
  } else if (isOperator(mbql)) {
    return formatOperator(mbql, options);
  } else if (isFunction(mbql)) {
    return formatFunction(mbql, options);
  } else if (isDimension(mbql, fieldClass)) {
    return formatDimension(mbql, options);
  } else if (isMetric(mbql)) {
    return formatMetric(mbql, options);
  } else if (isSegment(mbql)) {
    return formatSegment(mbql, options);
  } else if (isCase(mbql)) {
    return formatCase(mbql, options);
  } else if (isNegativeFilter(mbql)) {
    return formatNegativeFilter(mbql, options);
  }
  throw new Error('Unknown MBQL clause ' + JSON.stringify(mbql));
}

function formatNumberLiteral(mbql) {
  return JSON.stringify(mbql);
}

function formatDimension(fieldRef, options) {
  const { query } = options;
  if (query) {
    const dimension = query.parseFieldReference(fieldRef);
    return formatDimensionName(dimension, options);
  } else {
    throw new Error('`query` is a required parameter to format expressions');
  }
}

function formatMetric([, metricId], options) {
  const { query } = options;
  const metric = _.findWhere(query.table().metrics, { id: metricId });
  if (!metric) {
    throw 'metric with ID does not exist: ' + metricId;
  }
  return formatMetricName(metric, options);
}

function formatSegment([, segmentId], options) {
  const { query } = options;
  const segment = _.findWhere(query.table().segments, { id: segmentId });
  if (!segment) {
    throw 'segment with ID does not exist: ' + segment;
  }
  return formatSegmentName(segment, options);
}

// HACK: very specific to some string functions for now
function formatFunctionOptions(fnOptions) {
  if (Object.prototype.hasOwnProperty.call(fnOptions, 'case-sensitive')) {
    const caseSensitive = fnOptions['case-sensitive'];
    if (!caseSensitive) {
      return 'case-insensitive';
    }
  }
}

function formatFunction([fn, ...args], options) {
  if (hasOptions(args)) {
    const fnOptions = formatFunctionOptions(args.pop());
    if (fnOptions) {
      args = [...args, fnOptions];
    }
  }
  const formattedName = getExpressionName(fn);
  const formattedArgs = args.map((arg) => format(arg, options));
  return args.length === 0
    ? formattedName
    : `${formattedName}(${formattedArgs.join(', ')})`;
}

function formatOperator([op, ...args], options) {
  if (hasOptions(args)) {
    // FIXME: how should we format args?
    args = args.slice(0, -1);
  }
  const formattedOperator = getExpressionName(op) || op;
  const formattedArgs = args.map((arg) => {
    const isLowerPrecedence =
      isOperator(arg) && OPERATOR_PRECEDENCE[op] > OPERATOR_PRECEDENCE[arg[0]];
    return format(arg, { ...options, parens: isLowerPrecedence });
  });
  const clause = MBQL_CLAUSES[op];
  const formatted =
    clause && clause.args.length === 1
      ? // unary operator
        `${formattedOperator} ${formattedArgs[0]}`
      : formattedArgs.join(` ${formattedOperator} `);
  return options.parens ? `(${formatted})` : formatted;
}

function formatCase([_, clauses, caseOptions = {}], options) {
  const formattedName = getExpressionName('case');
  const formattedClauses = clauses
    .map(
      ([filter, mbql]) => format(filter, options) + ', ' + format(mbql, options)
    )
    .join(', ');
  const defaultExpression =
    (caseOptions as any).default !== undefined
      ? ', ' + format((caseOptions as any).default, options)
      : '';
  return `${formattedName}(${formattedClauses}${defaultExpression})`;
}

const NEGATIVE_FILTERS = {
  'does-not-contain': 'contains',
  'not-empty': 'is-empty',
  'not-null': 'is-null',
};

function isNegativeFilter(expr) {
  const [fn, ...args] = expr;
  return typeof NEGATIVE_FILTERS[fn] === 'string' && args.length >= 1;
}

function formatNegativeFilter(mbql, options) {
  const [fn, ...args] = mbql;
  const baseFn = NEGATIVE_FILTERS[fn];
  return 'NOT ' + format([baseFn, ...args], options);
}
