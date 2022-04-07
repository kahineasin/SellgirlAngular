//E:\svn\metabase-master\frontend\src\metabase\lib\dataset.js
/* @flow */

//import _ from "underscore";
import { PfUnderscore as _ } from "./pf_underscore";

import type { Value, Column, ColumnName, DatasetData } from "../model/Dataset";
import type { QField as FieldReference } from "../model/Query";

//import StructuredQueryClass from "../metabase-lib/lib/queries/StructuredQueryClass";
import Dimension, { JoinedDimension } from "../metabase-lib/lib/Dimension";
import { IField } from "../model/IField";
import { IObjInitHelper } from "../model/IObjInitHelper";
//import type Question from "../metabase-lib/lib/Question"; //benjamin todo

type ColumnSetting = {
  name: ColumnName;
  fieldRef?: FieldReference;
  enabled: boolean;
};

// Many aggregations result in [[null]] if there are no rows to aggregate after filters
export const datasetContainsNoResults = (data: DatasetData): boolean =>
  data.rows.length === 0 || _.isEqual(data.rows, [[null]]);

/**
 * @returns min and max for a value in a column
 */
export const rangeForValue = (
  value: Value,
  column: Column
): [number, number] => {
  if (
    typeof value === "number" &&
    column &&
    column.binning_info &&
    column.binning_info.bin_width
  ) {
    return [value, value + column.binning_info.bin_width];
  }
};

/**
 * Returns a MBQL field reference (FieldReference) for a given result dataset column
 *
 * @param  {Column} column Dataset result column
 * @return {?FieldReference} MBQL field reference
 */
export function fieldRefForColumn(
  column: Column,
  fieldClass: IObjInitHelper
): FieldReference {
  // NOTE: matching existing behavior of returning the unwrapped base dimension until we understand the implications of changing this
  return (
    column.field_ref &&
    (Dimension.parseMBQL(column.field_ref as any, fieldClass)
      .baseDimension()
      .mbql() as any)
  );
}

export const keyForColumn = (
  column: Column,
  fieldClass: IObjInitHelper
): string => {
  const ref = fieldRefForColumn(column, fieldClass);
  // match bug where joined-field returned field-id instead
  if (Array.isArray(ref) && ref[0] === "joined-field") {
    return JSON.stringify(["ref", ref[2]]);
  }
  // match legacy behavior which didn't have "field-literal" or "aggregation" field refs
  if (
    Array.isArray(ref) &&
    ref[0] !== "field-literal" &&
    ref[0] !== "aggregation"
  ) {
    return JSON.stringify(["ref", ref]);
  }
  return JSON.stringify(["name", column.name]);
};

/**
 * Finds the column object from the dataset results for the given `table.columns` column setting
 * @param  {Column[]} columns             Dataset results columns
 * @param  {ColumnSetting} columnSetting  A "column setting" from the `table.columns` settings
 * @return {?Column}                      A result column
 */
export function findColumnForColumnSetting(
  columns: Column[],
  columnSetting: ColumnSetting,
  fieldClass: IObjInitHelper
): Column {
  const index = findColumnIndexForColumnSetting(
    columns,
    columnSetting,
    fieldClass
  );
  if (index >= 0) {
    return columns[index];
  } else {
    return null;
  }
}

export function normalizeFieldRef(
  fieldRef: FieldReference,
  fieldClass: IObjInitHelper
): FieldReference {
  const dimension = Dimension.parseMBQL(fieldRef as any, fieldClass);
  return dimension && (dimension.mbql() as any);
}

export function findColumnIndexForColumnSetting(
  columns: Column[],
  columnSetting: ColumnSetting,
  fieldClass: IObjInitHelper
): number {
  // NOTE: need to normalize field refs because they may be old style [fk->, 1, 2]
  const fieldRef = normalizeFieldRef(columnSetting.fieldRef, fieldClass);
  // first try to find by fieldRef
  if (fieldRef != null) {
    const index = _.findIndex(columns, (col) =>
      _.isEqual(
        fieldRef,
        normalizeFieldRef(fieldRefForColumn(col, fieldClass), fieldClass)
      )
    );
    if (index >= 0) {
      return index;
    }
  }
  // if that fails, find by column name
  return _.findIndex(columns, (col) => col.name === columnSetting.name);
}

// export function syncTableColumnsToQuery(question: Question): Question {
//   let query = question.query();
//   const columnSettings = question.settings()["table.columns"];
//   if (columnSettings && query instanceof StructuredQueryClass) {
//     // clear `fields` first
//     query = query.clearFields();

//     // do this before clearing join columns since the default is "none" thus joined columns will be removed
//     const columnDimensions = query.columnDimensions();
//     const columnNames = query.columnNames();

//     // clear join's `fields`
//     for (let i = query.joins().length - 1; i >= 0; i--) {
//       const join = query.joins()[i];
//       query = join.clearFields().parent();
//     }

//     for (const columnSetting of columnSettings) {
//       if (columnSetting.enabled) {
//         let fieldRef;
//         if (columnSetting.fieldRef) {
//           fieldRef = columnSetting.fieldRef;
//         } else if (columnSetting.name) {
//           const index = _.findIndex(
//             columnNames,
//             (n) => n === columnSetting.name
//           );
//           if (index >= 0) {
//             fieldRef = columnDimensions[index].mbql();
//           }
//         }
//         if (fieldRef) {
//           const dimension = query.parseFieldReference(fieldRef);
//           // NOTE: this logic should probably be in StructuredQuery
//           if (dimension instanceof JoinedDimension) {
//             const join = dimension.join();
//             if (join) {
//               query = join.addField(dimension.mbql()).parent();
//             } else {
//               console.warn("missing join?", query, dimension);
//             }
//           } else {
//             query = query.addField(dimension.mbql());
//           }
//         } else {
//           console.warn("Unknown column", columnSetting);
//         }
//       }
//     }
//     // if removing `fields` wouldn't change the resulting columns, just remove it
//     const newColumnDimensions = query.columnDimensions();
//     if (
//       columnDimensions.length === newColumnDimensions.length &&
//       _.all(columnDimensions, (d, i) =>
//         (d as any).isSameBaseDimension(newColumnDimensions[i])
//       )
//     ) {
//       return query.clearFields().question();
//     } else {
//       return query.question();
//     }
//   }
//   return question;
// }
