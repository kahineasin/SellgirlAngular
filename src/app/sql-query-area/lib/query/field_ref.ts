// import _ from "underscore";
import { PfUnderscore as _ } from '../pf_underscore';

import { FieldId } from '../../model/Field';
import { Field as FieldReference } from '../../model/Query';

import FieldClass from '../../metabase-lib/lib/metadata/FieldClass';
import * as Table from './table';

import { getFilterOperators } from '../schema_metadata';
import { TYPE } from '../types';
//import { createLookupByProperty } from "metabase/lib/table";
import { createLookupByProperty } from '../table';

// DEPRECATED
export function isRegularField(field: FieldReference): boolean {
  return typeof field === 'number';
}

export function isLocalField(field: FieldReference): boolean {
  return Array.isArray(field) && field[0] === 'field-id';
}

export function isForeignKeyField(field: FieldReference): boolean {
  return Array.isArray(field) && field[0] === 'fk->';
}

export function isDatetimeField(field: FieldReference): boolean {
  return Array.isArray(field) && field[0] === 'datetime-field';
}

export function isBinningStrategy(field: FieldReference): boolean {
  return Array.isArray(field) && field[0] === 'binning-strategy';
}

export function isFieldLiteral(field: FieldReference): boolean {
  return Array.isArray(field) && field[0] === 'field-literal';
}

export function isExpressionField(field: FieldReference): boolean {
  return Array.isArray(field) && field[0] === 'expression';
}

export function isAggregateField(field: FieldReference): boolean {
  return Array.isArray(field) && field[0] === 'aggregation';
}

export function isJoinedField(field: FieldReference): boolean {
  return Array.isArray(field) && field[0] === 'joined-field';
}

export function isValidField(field): boolean {
  return (
    isRegularField(field) ||
    isLocalField(field) ||
    (isForeignKeyField(field) &&
      (isLocalField(field[1]) || isRegularField(field[1])) &&
      (isLocalField(field[2]) || isRegularField(field[2]))) ||
    // datetime field can  be either 4-item (deprecated): ["datetime-field", <field>, "as", <unit>]
    // or 3 item (preferred style): ["datetime-field", <field>, <unit>]
    (isDatetimeField(field) &&
      isValidField(field[1]) &&
      (field.length === 4
        ? field[2] === 'as' && typeof field[3] === 'string' // deprecated
        : typeof field[2] === 'string')) ||
    (isExpressionField(field) && typeof field[1] === 'string') ||
    (isAggregateField(field) && typeof field[1] === 'number') ||
    (isJoinedField(field) &&
      typeof field[1] === 'string' &&
      isValidField(field[2])) ||
    isFieldLiteral(field)
  );
}

export function isSameField(fieldA, fieldB, exact = false) {
  if (exact) {
    return _.isEqual(fieldA, fieldB);
  } else {
    return getFieldTargetId(fieldA) === getFieldTargetId(fieldB);
  }
}

// gets the target field ID (recursively) from any type of field, including raw field ID, fk->, and datetime-field cast.
export function getFieldTargetId(field: FieldReference): FieldId {
  if (isRegularField(field)) {
    // $FlowFixMe
    return field as any;
  } else if (isLocalField(field)) {
    // $FlowFixMe
    return field[1];
  } else if (isForeignKeyField(field)) {
    // $FlowFixMe
    return getFieldTargetId(field[2]);
  } else if (isDatetimeField(field)) {
    // $FlowFixMe
    return getFieldTargetId(field[1]);
  } else if (isBinningStrategy(field)) {
    // $FlowFixMe
    return getFieldTargetId(field[1]);
  } else if (isFieldLiteral(field)) {
    return field as any;
  }
  console.warn('Unknown field type: ', field);
}

// // gets the table and field definitions from from a raw, fk->, or datetime-field field
export function getFieldTarget(field, tableDef, path = []) {
  if (isRegularField(field)) {
    return { table: tableDef, field: Table.getField(tableDef, field), path };
  } else if (isLocalField(field)) {
    return getFieldTarget(field[1], tableDef, path);
  } else if (isForeignKeyField(field)) {
    const fkFieldId = getFieldTargetId(field[1]);
    const fkFieldDef = Table.getField(tableDef, fkFieldId);
    const targetTableDef = fkFieldDef && fkFieldDef.target.table;
    return getFieldTarget(field[2], targetTableDef, path.concat(fkFieldDef));
  } else if (isDatetimeField(field)) {
    return {
      ...getFieldTarget(field[1], tableDef, path),
      unit: getDatetimeUnit(field),
    };
  } else if (isBinningStrategy(field)) {
    return getFieldTarget(field[1], tableDef, path);
  } else if (isExpressionField(field)) {
    // hmmm, since this is a dynamic field we'll need to build this here
    // but base it on Field object, since some functions are used, when adding as filter
    const fieldDef = new FieldClass({
      display_name: field[1],
      name: field[1],
      expression_name: field[1],
      metadata: tableDef.metadata,
      // TODO: we need to do something better here because filtering depends on knowing a sensible type for the field
      base_type: TYPE.Float,
      filter_operators_lookup: {},
      filter_operators: [],
      active: true,
      fk_target_field_id: null,
      parent_id: null,
      preview_display: true,
      special_type: null,
      target: null,
      visibility_type: 'normal',
    });
    fieldDef.filter_operators = getFilterOperators(
      fieldDef,
      tableDef
      //undefined
    );
    fieldDef.filter_operators_lookup = createLookupByProperty(
      //?????????????????????api--benjamin todo
      fieldDef.filter_operators,
      'name'
    );

    return {
      table: tableDef,
      field: fieldDef,
      path: path,
    };
  } else if (isFieldLiteral(field)) {
    return { table: tableDef, field: Table.getField(tableDef, field), path }; // just pretend it's a normal field
  }

  console.warn('Unknown field type: ', field);
}

export function getDatetimeUnit(field) {
  if (field.length === 4) {
    return field[3]; // deprecated
  } else {
    return field[2];
  }
}
