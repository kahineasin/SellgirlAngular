import { NgModule } from "@angular/core";

//-------------------interface
import type {
  FieldValues,
  Field,
  FieldId,
} from "../sql-query-area/model/Field";
import type {
  Value,
  Column,
  ColumnName,
  DatasetData,
} from "../sql-query-area/model/Dataset";
import type { IconName } from "../sql-query-area/metabase-types/types"; //benjamin
import type {
  ConcreteField,
  LocalFieldReference,
  ForeignFieldReference,
  DatetimeField,
  ExpressionReference,
  DatetimeUnit,
  JoinedFieldReference,
  QField as FieldReference,
} from "../sql-query-area/model/Query";

import type { Database, DatabaseId } from "../sql-query-area/model/Database";
import type { Table, TableId } from "../sql-query-area/model/Table";
import type { Segment, SegmentId } from "../sql-query-area/model/Segment";
import type { Metric, MetricId } from "../sql-query-area/model/Metric";
import type {
  AggregationOperator,
  FilterOperator,
} from "../sql-query-area/model/Metadata"; //好像这个有问题 error 去掉里面的Dimension引用之后就正常了

//-------------------function()
import { ngettext, msgid } from "../sql-query-area/lib/pf_ttag";
import { parseTimestamp, parseTime } from "../sql-query-area/lib/time";
import { PfUnderscore as _ } from "../sql-query-area/lib/pf_underscore";
import {
  DATETIME_UNITS,
  formatBucketing,
} from "../sql-query-area/lib/query_time";

import {
  noNullValues,
  add,
  update,
  remove,
  clear,
} from "../sql-query-area/lib/query/util";

import { getFilterOperators } from "../sql-query-area/lib/schema_metadata";
import { TYPE } from "../sql-query-area/lib/types";
//import { createLookupByProperty } from "metabase/lib/table";
import { createLookupByProperty } from "../sql-query-area/lib/table";
//import * as Table2 from '../sql-query-area/lib/query/table';//这个可能有重名风险
import { isJoinedField } from "../sql-query-area/lib/query/field_ref"; //error
//import { isValidField } from '../sql-query-area/lib/query/field_ref'; //error
//import { STANDARD_AGGREGATIONS } from "../sql-query-area/lib/expressions/config";

//import * as A from '../sql-query-area/lib/query/aggregation'; //error
// import * as B from '../sql-query-area/lib/query/breakout';
// import * as F from '../sql-query-area/lib/query/filter';
// import * as J from '../sql-query-area/lib/query/join';
// import * as L from '../sql-query-area/lib/query/limit';
// import * as O from '../sql-query-area/lib/query/order_by';
// import * as E from '../sql-query-area/lib/query/expression';
// import * as FIELD from '../sql-query-area/lib/query/field_helper';
// import * as FIELD_REF from '../sql-query-area/lib/query/field_ref';

//import * as Q from '../sql-query-area/lib/query/query'; //error

//-------------------class-------------------
import Base from "../sql-query-area/metabase-lib/lib/metadata/Base";
import MBQLClause from "../sql-query-area/metabase-lib/lib/queries/structured/MBQLClause"; //error,去掉StructuredQueryClass就ok
//import type StructuredQueryClass from '../sql-query-area/metabase-lib/lib/queries/StructuredQueryClass';//error

//import type Aggregation from '../sql-query-area/metabase-lib/lib/queries/structured/Aggregation'; //这个有问题

//-------------------third people
import * as moment from "dayjs";
//import Humanize from "humanize-plus";
//import React from "react";

import {
  DEFAULT_DATE_STYLE,
  getDateFormatFromStyle,
  DEFAULT_TIME_STYLE,
  getTimeFormatFromStyle,
  hasHour,
} from "../sql-query-area/lib/formatting/date";

import type {
  DateStyle,
  TimeStyle,
  TimeEnabled,
} from "../sql-query-area/lib/formatting/date";

import AaaClass from "./aaa-class";
import BbbClass from "./bbb-class";
import { isRegularField, getFieldTarget } from "./ccc-class"; //
//------------------above is ok----------------
import Dimension from "../sql-query-area/metabase-lib/lib/Dimension"; //发现问题在这里err 去掉./queries/structured/Aggregation的引用就ok
import FieldClass from "../sql-query-area/metabase-lib/lib/metadata/FieldClass"; //err 删掉某些引用后就ok
// import TableClass from '../sql-query-area/metabase-lib/lib/metadata/TableClass'; //err

//import Dimension from '../sql-query-area/metabase-lib/lib/Dimension';

// import { formatField, stripId } from '../../../lib/formatting';
// import { getFieldValues } from '../../../lib/query/field_helper';
// import {
//   isDate,
//   isTime,
//   isNumber,
//   isNumeric,
//   isBoolean,
//   isString,
//   isSummable,
//   isCategory,
//   isAddress,
//   isCity,
//   isState,
//   isZipCode,
//   isCountry,
//   isCoordinate,
//   isLocation,
//   isDimension,
//   isMetric,
//   isPK,
//   isFK,
//   isEntityName,
//   getIconForField,
//   getFilterOperators,
// } from '../../../lib/schema_metadata';

// //import type { FieldValues } from "metabase/meta/types/Field";
// import type { FieldValues } from '../../../model/Field';

//------------------------
//import { stripId, FK_SYMBOL } from '../sql-query-area/lib/formatting';
// import { TYPE } from "../../lib/types";

// import FieldClass from "./metadata/FieldClass";
// import type {
//   AggregationOperator,
//   FilterOperator,
//   //Metadata,
//   //Query,
// } from "../../model/Metadata";
// //import { stripId, FK_SYMBOL } from "../../lib/formatting";
// //import type Metadata from "./metadata/Metadata";
// import type MetadataClass from "./metadata/Metadata";
// import Query from "../../metabase-lib/lib/queries/Query";

// import type {
//   ConcreteField,
//   LocalFieldReference,
//   ForeignFieldReference,
//   DatetimeField,
//   ExpressionReference,
//   DatetimeUnit,
// } from "metabase/meta/types/Query";
// import type {
//   ConcreteField,
//   LocalFieldReference,
//   ForeignFieldReference,
//   DatetimeField,
//   ExpressionReference,
//   DatetimeUnit,
//   JoinedFieldReference,
// } from '../../model/Query';

// //import type { IconName } from "metabase/meta/types";
// import type { IconName } from '../../metabase-types/types';
// import StructuredQueryClass from './queries/StructuredQueryClass';

//import TableClass from "./TableClass";

//import Dimension from '../sql-query-area/metabase-lib/lib/Dimension';

// // import { formatField, stripId } from "metabase/lib/formatting";
// // import { getFieldValues } from "metabase/lib/query/field";
// import { formatField, stripId } from '../../../lib/formatting';
// import { getFieldValues } from '../../../lib/query/field_helper';
// import {
//   isDate,
//   isTime,
//   isNumber,
//   isNumeric,
//   isBoolean,
//   isString,
//   isSummable,
//   isCategory,
//   isAddress,
//   isCity,
//   isState,
//   isZipCode,
//   isCountry,
//   isCoordinate,
//   isLocation,
//   isDimension,
//   isMetric,
//   isPK,
//   isFK,
//   isEntityName,
//   getIconForField,
//   getFilterOperators,
// } from '../../../lib/schema_metadata';

// //import type { FieldValues } from "metabase/meta/types/Field";
// import type { FieldValues } from '../../../model/Field';

//import type FieldClass from '../sql-query-area/metabase-lib/lib/metadata/FieldClass';
// //import type { Column, Value } from "metabase/meta/types/Dataset";
// import type { Column, Value } from '../model/Dataset';
// import type { DatetimeUnit } from '../model/Query';
// //import type { Moment } from "metabase/meta/types";

// import type { DateStyle, TimeStyle, TimeEnabled } from './formatting/date';

//import { stripId, FK_SYMBOL } from '../sql-query-area/lib/formatting';
// // import { stripId, FK_SYMBOL } from "metabase/lib/formatting";
// // import { TYPE } from "metabase/lib/types";
// import { TYPE } from "../../lib/types";

// import FieldClass from "./metadata/FieldClass";
// import type {
//   AggregationOperator,
//   FilterOperator,
//   //Metadata,
//   //Query,
// } from "../../model/Metadata";
// //import { stripId, FK_SYMBOL } from "../../lib/formatting";
// //import type Metadata from "./metadata/Metadata";
// import type MetadataClass from "./metadata/Metadata";
// import Query from "../../metabase-lib/lib/queries/Query";

// import type {
//   ConcreteField,
//   LocalFieldReference,
//   ForeignFieldReference,
//   DatetimeField,
//   ExpressionReference,
//   DatetimeUnit,
// } from "metabase/meta/types/Query";
// import type {
//   ConcreteField,
//   LocalFieldReference,
//   ForeignFieldReference,
//   DatetimeField,
//   ExpressionReference,
//   DatetimeUnit,
//   JoinedFieldReference,
// } from '../../model/Query';

// //import type { IconName } from "metabase/meta/types";
// import type { IconName } from '../../metabase-types/types';
// import StructuredQueryClass from './queries/StructuredQueryClass';

// import Dimension, {
//   JoinedDimension,
// } from '../sql-query-area/metabase-lib/lib/Dimension';

//import { rangeForValue } from '../sql-query-area/lib/dataset';
// import { getFriendlyName } from "metabase/visualizations/lib/utils";
// import { decimalCount } from "metabase/visualizations/lib/numeric";

// import {
//   DEFAULT_DATE_STYLE,
//   getDateFormatFromStyle,
//   DEFAULT_TIME_STYLE,
//   getTimeFormatFromStyle,
//   hasHour,
// } from './formatting/date';
// //import { PLUGIN_FORMATTING_HELPERS } from "metabase/plugins";

// import type FieldClass from '../metabase-lib/lib/metadata/FieldClass';
// //import type { Column, Value } from "metabase/meta/types/Dataset";
// import type { Column, Value } from '../model/Dataset';
// import type { DatetimeUnit } from '../model/Query';
// //import type { Moment } from "metabase/meta/types";

// import type { DateStyle, TimeStyle, TimeEnabled } from './formatting/date';

// import { singularize } from '../sql-query-area/lib/formatting';
// import { getAggregationOperatorsWithFields } from "../../../lib/schema_metadata";
// import { memoize, createLookupByProperty } from "../utils";
// import DatabaseClass from "./DatabaseClass";
// import FieldClass from "./FieldClass";

//import TableClass from '../sql-query-area/metabase-lib/lib/metadata/TableClass';

// //import moment from "moment";

// import Dimension from "../Dimension";

// // import { formatField, stripId } from "metabase/lib/formatting";
// // import { getFieldValues } from "metabase/lib/query/field";
// import { formatField, stripId } from "../../../lib/formatting";
// import { getFieldValues } from "../../../lib/query/field_helper";

// //import Mustache from "mustache";
// //import ReactMarkdown from "react-markdown";

// //import ExternalLink from "metabase/components/ExternalLink";

// // import {
// //   isDate,
// //   isNumber,
// //   isCoordinate,
// //   isLatitude,
// //   isLongitude,
// //   isTime,
// //   isURL,
// //   isEmail,
// // } from "./schema_metadata";
// import { parseTimestamp, parseTime } from './time';
// // import { rangeForValue } from "./dataset";
// // import { getFriendlyName } from "metabase/visualizations/lib/utils";
// // import { decimalCount } from "metabase/visualizations/lib/numeric";

// import {
//   DEFAULT_DATE_STYLE,
//   getDateFormatFromStyle,
//   DEFAULT_TIME_STYLE,
//   getTimeFormatFromStyle,
//   hasHour,
// } from './formatting/date';
// //import { PLUGIN_FORMATTING_HELPERS } from "metabase/plugins";

// //import type { Column, Value } from "metabase/meta/types/Dataset";
// import type { Column, Value } from '../model/Dataset';
// import type { DatetimeUnit } from '../model/Query';
// //import type { Moment } from "metabase/meta/types";

// import type { DateStyle, TimeStyle, TimeEnabled } from './formatting/date';

//import { singularize } from '../sql-query-area/lib/formatting';
// import { getAggregationOperatorsWithFields } from "../sql-query-area/lib/schema_metadata";
// import { memoize, createLookupByProperty } from "../sql-query-area/metabase-lib/lib/utils";
// import DatabaseClass from "../sql-query-area/metabase-lib/lib/metadata/DatabaseClass";

//import moment from "moment";

//import FieldClass from '../sql-query-area/metabase-lib/lib/metadata/FieldClass';
//import DatabaseClass from '../sql-query-area/metabase-lib/lib/metadata/DatabaseClass';
// import MetadataClass from '../sql-query-area/metabase-lib/lib/metadata/Metadata';
// import PfDatabaseClass from '../sql-query-area/metabase-lib/lib/metadata/PfDatabaseClass';
// import PfMetadataClass from './metabase-lib/lib/metadata/PfMetadataClass';
// import TableClass from './metabase-lib/lib/metadata/TableClass';
// import PfQuestion from './metabase-lib/lib/PfQuestion';
// import PfStructuredQueryClass from './metabase-lib/lib/queries/PfStructuredQueryClass';
// import { Card, DatasetQuery } from './model/Card';
// import { Database } from './model/Database';
// import { Field } from './model/Field';

// import { ConcreteField, FieldLiteral, StructuredQuery } from './model/Query';
// import { Table } from './model/Table';
/**
 * 为了便于测试哪些import的包有问题(当打包抛不出提示的时候)
 */
@NgModule({
  imports: [],
  declarations: [],
  exports: [],
})
export class SqlQueryAreaImportTestModule {}
