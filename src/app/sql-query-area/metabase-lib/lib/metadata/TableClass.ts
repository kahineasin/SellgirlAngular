// NOTE: this needs to be imported first due to some cyclical dependency nonsense
//import Question from "../Question";

import Base from './Base';

import { singularize } from '../../../lib/formatting';
import { getAggregationOperatorsWithFields } from '../../../lib/schema_metadata';
import { memoize, createLookupByProperty } from '../utils';
import DatabaseClass from './DatabaseClass';
import FieldClass from './FieldClass';

/**
 * @typedef { import("./metadata").SchemaName } SchemaName
 * @typedef { import("./metadata").EntityType } EntityType
 * @typedef { import("./metadata").StructuredQuery } StructuredQuery
 */

/** This is the primary way people interact with tables */
export default class TableClass extends Base {
  public db: DatabaseClass = null;
  public id: any = null;
  public metadata: any = null;
  public schema_name: any = null;
  public fields: FieldClass[] = [];
  public display_name: any = null;
  public schema: any = null;
  public description: any = null;
  public entity_type: any = null;
  //public displayName: any = null;
  public name: any = null;

  constructor(object = {}) {
    super(object);
    super.initPropertyByObject(object);
  }
  hasSchema() {
    return (this.schema_name && this.db && this.db.schemas.length > 1) || false;
  }

  // Could be replaced with hydrated database property in selectors/metadata.js (instead / in addition to `table.db`)
  get database() {
    return this.db;
  }

  // newQuestion() {
  //   return this.question().setDefaultQuery().setDefaultDisplay();
  // }

  // question() {
  //   return Question.create({
  //     databaseId: this.db && this.db.id,
  //     tableId: this.id,
  //     metadata: this.metadata,
  //   });
  // }

  isSavedQuestion() {
    return this.savedQuestionId() !== null;
  }

  savedQuestionId() {
    const match = String(this.id).match(/card__(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  // /**
  //  * @returns {StructuredQuery}
  //  */
  // query(query = {}) {
  //   return this.question()
  //     .query()
  //     .updateQuery((q) => ({ ...q, ...query }));
  // }

  dimensions() {
    return this.fields.map((field) => field.dimension());
  }

  displayName(a: { includeSchema }) {
    if (null === a) {
      a = { includeSchema: false };
    }
    return (
      (a.includeSchema && this.schema ? this.schema.displayName() + '.' : '') +
      this.display_name
    );
  }

  /**
   * The singular form of the object type this table represents
   * Currently we try to guess this by singularizing `display_name`, but ideally it would be configurable in metadata
   * See also `field.targetObjectName()`
   */
  objectName() {
    return singularize(this.displayName(null));
  }

  dateFields() {
    return this.fields.filter((field) => field.isDate());
  }

  // AGGREGATIONS

  @memoize
  aggregationOperators() {
    return getAggregationOperatorsWithFields(this);
  }

  @memoize
  aggregationOperatorsLookup() {
    return createLookupByProperty(this.aggregationOperators(), 'short');
  }

  aggregationOperator(short) {
    return this.aggregation_operators_lookup[short];
  }

  // @deprecated: use aggregationOperators
  get aggregation_operators() {
    return this.aggregationOperators();
  }

  // @deprecated: use aggregationOperatorsLookup
  get aggregation_operators_lookup() {
    return this.aggregationOperatorsLookup();
  }

  // FIELDS

  @memoize
  fieldsLookup() {
    return createLookupByProperty(this.fields, 'id');
  }

  // @deprecated: use fieldsLookup
  get fields_lookup() {
    return this.fieldsLookup();
  }

  /**
   * @private
   * @param {string} description
   * @param {DatabaseClass} db
   * @param {Schema?} schema
   * @param {SchemaName} [schema_name]
   * @param {Field[]} fields
   * @param {EntityType} entity_type
   */
  /* istanbul ignore next */
  _constructor(description, db, schema, schema_name, fields, entity_type) {
    this.description = description;
    this.db = db;
    this.schema = schema;
    this.schema_name = schema_name;
    this.fields = fields;
    this.entity_type = entity_type;
  }
}
