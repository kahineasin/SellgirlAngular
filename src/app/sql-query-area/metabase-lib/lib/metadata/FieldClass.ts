//E:\svn\metabase-master\frontend\src\metabase-lib\lib\metadata\Field.js

/* @flow weak */

import Base from './Base';
import TableClass from './TableClass';

//import moment from "moment";

import Dimension from '../Dimension';

// import { formatField, stripId } from "metabase/lib/formatting";
// import { getFieldValues } from "metabase/lib/query/field";
import { formatField, stripId } from '../../../lib/formatting';
import { getFieldValues } from '../../../lib/query/field_helper';
import {
  isDate,
  isTime,
  isNumber,
  isNumeric,
  isBoolean,
  isString,
  isSummable,
  isCategory,
  isAddress,
  isCity,
  isState,
  isZipCode,
  isCountry,
  isCoordinate,
  isLocation,
  isDimension,
  isMetric,
  isPK,
  isFK,
  isEntityName,
  getIconForField,
  getFilterOperators,
} from '../../../lib/schema_metadata';

//import type { FieldValues } from "metabase/meta/types/Field";
import type { FieldValues } from '../../../model/Field';
import dayjs from 'dayjs';
import { IField } from '../../../model/IField';
/**
 * Wrapper class for field metadata objects. Belongs to a Table.
 */
export default class FieldClass extends Base implements IField {
  name: string;
  display_name: string;
  description: string;
  //xxx: string;

  table: TableClass;
  name_field: FieldClass;

  public metadata: any = null;
  public parent_id: any = null;
  //public table: any = null;
  public id: any = null;
  public query: any = null;
  public fingerprint: any = null;
  //public name: any = null;
  //public display_name: any = null;
  //public description: any = null;
  //public name_field: any = null;
  public dimensions: any = null;
  public remapping: any = null;
  public _object: any = null;
  public filter_operators_lookup: any = null;
  public filter_operators: any = null;

  constructor(object = {}) {
    super(object);
    //debugger;

    super.initPropertyByObject(object);
    //debugger;
  }
  init(): IField {
    return new FieldClass();
  }

  parent() {
    return this.metadata ? this.metadata.fields[this.parent_id] : null;
  }

  path() {
    const path = [];
    let field = this;
    do {
      path.unshift(field);
    } while ((field = field.parent()));
    return path;
  }

  displayName({
    includeSchema = null,
    includeTable = null,
    includePath = true,
  } = {}) {
    let displayName = '';
    if (includeTable && this.table) {
      displayName += this.table.displayName({ includeSchema }) + ' ??? ';
    }
    if (includePath) {
      displayName += this.path().map(formatField).join(': ');
    } else {
      displayName += formatField(this);
    }
    return displayName;
  }

  /**
   * The name of the object type this field points to.
   * Currently we try to guess this by stripping trailing `ID` from `display_name`, but ideally it would be configurable in metadata
   * See also `table.objectName()`
   */
  targetObjectName() {
    return stripId(this.displayName());
  }

  isDate() {
    return isDate(this);
  }
  isTime() {
    return isTime(this);
  }
  isNumber() {
    return isNumber(this);
  }
  isNumeric() {
    return isNumeric(this);
  }
  isBoolean() {
    return isBoolean(this);
  }
  isString() {
    return isString(this);
  }
  isAddress() {
    return isAddress(this);
  }
  isCity() {
    return isCity(this);
  }
  isZipCode() {
    return isZipCode(this);
  }
  isState() {
    return isState(this);
  }
  isCountry() {
    return isCountry(this);
  }
  isCoordinate() {
    return isCoordinate(this);
  }
  isLocation() {
    return isLocation(this);
  }
  isSummable() {
    return isSummable(this);
  }
  isCategory() {
    return isCategory(this);
  }
  isMetric() {
    return isMetric(this);
  }

  /**
   * Tells if this column can be used in a breakout
   * Currently returns `true` for everything expect for aggregation columns
   */
  isDimension() {
    return isDimension(this);
  }
  isID() {
    return isPK(this) || isFK(this);
  }
  isPK() {
    return isPK(this);
  }
  isFK() {
    return isFK(this);
  }
  isEntityName() {
    return isEntityName(this);
  }

  isCompatibleWith(field: FieldClass) {
    return (
      this.isDate() === field.isDate() ||
      this.isNumeric() === field.isNumeric() ||
      this.id === field.id
    );
  }

  fieldValues(): FieldValues {
    return getFieldValues(this._object);
  }

  icon() {
    return getIconForField(this);
  }

  dimension() {
    if (Array.isArray(this.id)) {
      // if ID is an array, it's a MBQL field reference, typically "field-literal"
      return Dimension.parseMBQL(this.id as any, this.metadata, this.query);
    } else {
      return Dimension.parseMBQL(
        ['field-id', this.id],
        this.metadata,
        this.query
      );
    }
  }

  sourceField() {
    const d = this.dimension().sourceDimension();
    return d && d.field();
  }

  filterOperator(operatorName) {
    if (this.filter_operators_lookup) {
      return this.filter_operators_lookup[operatorName];
    } else {
      return this.filterOperators().find((o) => o.name === operatorName);
    }
  }

  filterOperators() {
    return (
      this.filter_operators ||
      //|| getFilterOperators(this, this.table, undefined)//metabase??????????????????3?????????
      getFilterOperators(this, this.table)
    );
  }

  aggregationOperators() {
    return this.table
      ? this.table.aggregation_operators.filter(
          (aggregation) =>
            aggregation.validFieldsFilters[0] &&
            aggregation.validFieldsFilters[0]([this]).length === 1
        )
      : null;
  }

  /**
   * Returns a default breakout MBQL clause for this field
   */
  getDefaultBreakout() {
    return this.dimension().defaultBreakout();
  }

  /**
   * Returns a default date/time unit for this field
   */
  getDefaultDateTimeUnit() {
    try {
      const fingerprint = this.fingerprint.type['type/DateTime'];
      // const days = moment(fingerprint.latest).diff(
      //   moment(fingerprint.earliest),
      //   "day"
      // );
      const days = dayjs(fingerprint.latest).diff(
        dayjs(fingerprint.earliest),
        'day'
      );
      if (days < 1) {
        return 'minute';
      } else if (days < 31) {
        return 'day';
      } else if (days < 365) {
        return 'week';
      } else {
        return 'month';
      }
    } catch (e) {
      return 'day';
    }
  }

  /**
   * Returns the remapped field, if any
   */
  remappedField(): FieldClass {
    const displayFieldId =
      this.dimensions && this.dimensions.human_readable_field_id;
    if (displayFieldId != null) {
      return this.metadata.fields[displayFieldId];
    }
    // this enables "implicit" remappings from type/PK to type/Name on the same table,
    // used in FieldValuesWidget, but not table/object detail listings
    if (this.name_field) {
      return this.name_field;
    }
    return null;
  }

  /**
   * Returns the human readable remapped value, if any
   */
  remappedValue(value): string {
    // TODO: Ugh. Should this be handled further up by the parameter widget?
    if (this.isNumeric() && typeof value !== 'number') {
      value = parseFloat(value);
    }
    return this.remapping && this.remapping.get(value);
  }

  /**
   * Returns whether the field has a human readable remapped value for this value
   */
  hasRemappedValue(value): string {
    // TODO: Ugh. Should this be handled further up by the parameter widget?
    if (this.isNumeric() && typeof value !== 'number') {
      value = parseFloat(value);
    }
    return this.remapping && this.remapping.has(value);
  }

  /**
   * Returns true if this field can be searched, e.x. in filter or parameter widgets
   */
  isSearchable(): boolean {
    // TODO: ...?
    return this.isString();
  }

  column(extra = {}) {
    return this.dimension().column({ source: 'fields', ...extra });
  }

  /**
   * Returns a FKDimension for this field and the provided field
   */
  foreign(foreignField: FieldClass): Dimension {
    return this.dimension().foreign(foreignField.dimension());
  }
}
