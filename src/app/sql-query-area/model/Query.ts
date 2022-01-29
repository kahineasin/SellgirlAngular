/* 此文件是从metabase上改造的,此文件的目的应该是要把filter等的数组结构定义成type */
/* @flow */

import type { TableId } from './Table';
import type { FieldId, BaseType } from './Field';
import type { SegmentId } from './Segment';
import type { MetricId } from './Metric';
import type { ParameterType } from './Parameter';
//import { DatabaseId } from "./Database";

export type ExpressionName = string;

export type StringLiteral = string;
export type NumericLiteral = number;
export type DatetimeLiteral = string;

export type Value =
  | null
  | boolean
  | StringLiteral
  | NumericLiteral
  | DatetimeLiteral;
export type OrderableValue = NumericLiteral | DatetimeLiteral;

export type RelativeDatetimePeriod = 'current' | 'last' | 'next' | number;
export type RelativeDatetimeUnit =
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';
export type DatetimeUnit =
  | 'default'
  | 'minute'
  | 'minute-of-hour'
  | 'hour'
  | 'hour-of-day'
  | 'day'
  | 'day-of-week'
  | 'day-of-month'
  | 'day-of-year'
  | 'week'
  | 'week-of-year'
  | 'month'
  | 'month-of-year'
  | 'quarter'
  | 'quarter-of-year'
  | 'year';

export type TemplateTagId = string;
export type TemplateTagName = string;
export type TemplateTagType = 'text' | 'number' | 'date' | 'dimension';

export type TemplateTag = {
  id: TemplateTagId;
  name: TemplateTagName;
  'display-name': string;
  type: TemplateTagType;
  dimension?: LocalFieldReference;
  'widget-type'?: ParameterType;
  required?: boolean;
  default?: string;
};

//export type TemplateTags = { [key: TemplateTagName]: TemplateTag };//这种写法编译不通过
export type TemplateTags = { [key: string]: TemplateTag }; //这种写法编译不通过
//应该是原生sql?
export type NativeQuery = {
  query: string;
  'template-tags': TemplateTags;
};

export type StructuredQuery = {
  // /**
  //  * 还是有数据库id比较方便.但后来觉得,StructuredQuery是嵌套的,多层都是同一个数据库,不应该把此属性加到StructuredQuery
  //  */
  // database?: DatabaseId;
  'source-table'?: TableId;
  'source-query'?: StructuredQuery;
  aggregation?: AggregationClause;
  breakout?: BreakoutClause;
  filter?: FilterClause;
  joins?: JoinClause;
  'order-by'?: OrderByClause;
  limit?: LimitClause;
  expressions?: ExpressionClause;
  /**
   * 这里都是主表的字段--benjamin
   */
  fields?: FieldsClause;
};

export type AggregationClause =
  | Aggregation // @deprecated: aggregation clause is now an array
  | Array<Aggregation>;

/**
 * An aggregation MBQL clause
 */
export type Aggregation =
  | CountAgg
  | CountFieldAgg
  | AvgAgg
  | CumSumAgg
  | CumCountAgg
  | DistinctAgg
  | StdDevAgg
  | SumAgg
  | MinAgg
  | MaxAgg
  | MetricAgg
  | OptionAgg;

type CountAgg = ['count'];

type CountFieldAgg = ['count', ConcreteField];
type AvgAgg = ['avg', ConcreteField];
type CumSumAgg = ['cum-sum', ConcreteField];
type CumCountAgg = ['cum-count']; //企业版有此汇总类型,我补上--benjamin20210924
type DistinctAgg = ['distinct', ConcreteField];
type StdDevAgg = ['stddev', ConcreteField];
type SumAgg = ['sum', ConcreteField];
type MinAgg = ['min', ConcreteField];
type MaxAgg = ['max', ConcreteField];

type MetricAgg = ['metric', MetricId];
type OptionAgg = ['aggregation-options', any, any]; //我加的自定义汇总配置--benjamin20210924

export type BreakoutClause = Array<Breakout>;
export type Breakout = ConcreteField;

export type FilterClause = Filter;
export type Filter = FieldFilter | CompoundFilter | NotFilter | SegmentFilter;

export type CompoundFilter = AndFilter | OrFilter | BracketClause;

export type FieldFilter =
  | EqualityFilter
  | ComparisonFilter
  | BetweenFilter
  | StringFilter
  | NullFilter
  | NotNullFilter
  | InsideFilter
  | TimeIntervalFilter;

//export type AndFilter = ["and", Filter, Filter];
//export type AndFilter = ["and", string, string]; //测试

/**括号子句--benjamin */
export type BracketClause = ['bracket', AndFilter];
/**
 * 把metabase的[and,a,b,c]格式改为[a,and,b,or,c]格式 --benjamin20210910
 */
export type AndFilterItem = 'and' | 'or' | Filter | BracketClause;
export type AndFilter = AndFilterItem[]; //测试

export type OrFilter = ['or', Filter, Filter];

export type NotFilter = ['not', Filter];

export type EqualityFilter = ['=' | '!=', ConcreteField, Value];
export type ComparisonFilter = [
  '<' | '<=' | '>=' | '>',
  ConcreteField,
  OrderableValue
];
export type BetweenFilter = [
  'between',
  ConcreteField,
  OrderableValue,
  OrderableValue
];
export type StringFilter =
  | [
      'starts-with' | 'contains' | 'does-not-contain' | 'ends-with',
      ConcreteField,
      StringLiteral
    ]
  | [
      'starts-with' | 'contains' | 'does-not-contain' | 'ends-with',
      ConcreteField,
      StringLiteral,
      StringFilterOptions
    ];

export type StringFilterOptions = {
  'case-sensitive'?: false;
};

export type NullFilter = ['is-null', ConcreteField];
export type NotNullFilter = ['not-null', ConcreteField];
export type InsideFilter = [
  'inside',
  ConcreteField,
  ConcreteField,
  NumericLiteral,
  NumericLiteral,
  NumericLiteral,
  NumericLiteral
];
export type TimeIntervalFilter =
  | [
      'time-interval',
      ConcreteField,
      RelativeDatetimePeriod,
      RelativeDatetimeUnit
    ]
  | [
      'time-interval',
      ConcreteField,
      RelativeDatetimePeriod,
      RelativeDatetimeUnit,
      TimeIntervalFilterOptions
    ];

export type TimeIntervalFilterOptions = {
  'include-current'?: boolean;
};

export type FilterOptions = StringFilterOptions | TimeIntervalFilterOptions;

// NOTE: currently the backend expects SEGMENT to be uppercase
export type SegmentFilter = ['segment', SegmentId];

export type OrderByClause = Array<OrderBy>;
export type OrderBy = ['asc' | 'desc', Field];

export type JoinStrategy =
  | 'left-join'
  | 'right-join'
  | 'inner-join'
  | 'full-join';
export type JoinAlias = string;
//export type JoinCondition = Filter;//metabase原版这个类型是有问题的,根本不能给这种值 [=,field-id,joined-field]  --benjamin20210910
export type JoinOn = ['=', Field, JoinedFieldReference]; //我加的--benjamin20210910

//为了join可以多条件,前端暂可不考虑括号--benjamin
export type CompoundJoinOnItem =
  | 'and'
  | 'or'
  | Filter
  | JoinOn
  | BracketJoinOnClause;
export type CompoundJoinOn = CompoundJoinOnItem[]; //测试
export type BracketJoinOnClause = ['bracket', CompoundJoinOn];

export type JoinCondition = Filter | JoinOn | CompoundJoinOn;
export type JoinFields = 'all' | 'none' | JoinedFieldReference[];

export type JoinClause = Array<Join>;
export type Join = {
  'source-table'?: TableId;
  'source-query'?: StructuredQuery;
  condition: JoinCondition;
  alias?: JoinAlias;
  strategy?: JoinStrategy;
  fields?: JoinFields;
};

export type LimitClause = number;

export type Field = ConcreteField | AggregateField;

export type ConcreteField =
  | LocalFieldReference
  | ForeignFieldReference
  | JoinedFieldReference
  | ExpressionReference
  | DatetimeField
  | BinnedField
  | FieldLiteral; //看metabase实际保存的query,breakout应该有field-literal这种格式,是不是这里漏了,先补上--benjamin 20211014

export type LocalFieldReference = ['field-id', FieldId] | FieldId; // @deprecated: use ["field-id", FieldId]

export type ForeignFieldReference = [
  'fk->',
  ['field-id', FieldId],
  ['field-id', FieldId]
];

export type ExpressionReference = ['expression', ExpressionName];

//分析这个应是select嵌套时重命名字段给外层使用的方式--benjamin
export type FieldLiteral = ['field-literal', string, BaseType]; // ["field-literal", name, base-type]

export type JoinedFieldReference = ['joined-field', JoinAlias, ConcreteField];

export type DatetimeField =
  | [
      'datetime-field',
      LocalFieldReference | ForeignFieldReference,
      DatetimeUnit
    ]
  | [
      'datetime-field',
      LocalFieldReference | ForeignFieldReference,
      'as',
      DatetimeUnit
    ]; // @deprecated: don't include the "as" element

export type BinnedField =
  | ['binning-strategy', LocalFieldReference | ForeignFieldReference, 'default'] // default binning (as defined by backend)
  | [
      'binning-strategy',
      LocalFieldReference | ForeignFieldReference,
      'num-bins',
      number
    ] // number of bins
  | [
      'binning-strategy',
      LocalFieldReference | ForeignFieldReference,
      'bin-width',
      number
    ]; // width of each bin

export type AggregateField = ['aggregation', number];

export type ExpressionClause = {
  [key: string]: Expression; //ExpressionName
};

export type Expression = [
  ExpressionOperator,
  ExpressionOperand,
  ExpressionOperand
];

export type ExpressionOperator = '+' | '-' | '*' | '/';
export type ExpressionOperand = ConcreteField | NumericLiteral | Expression;

export type FieldsClause = ConcreteField[];
