//import _ from "underscore";

import Base from "./Base";
import FieldClass from "./FieldClass";
import TableClass from "./TableClass";
import DatabaseClass from "./DatabaseClass";

//import Question from "../Question";

/**
 * @typedef { import("./metadata").DatabaseId } DatabaseId
 * @typedef { import("./metadata").SchemaId } SchemaId
 * @typedef { import("./metadata").TableId } TableId
 * @typedef { import("./metadata").FieldId } FieldId
 * @typedef { import("./metadata").MetricId } MetricId
 * @typedef { import("./metadata").SegmentId } SegmentId
 */

/**
 * Wrapper class for the entire metadata store
 */
export default class MetadataClass extends Base {
  //public databases: any[] = [];
  public databases: { [key: number]: DatabaseClass } = {};
  //public tables: any = null;
  public tables: { [key: number]: TableClass } = {};
  public metrics: any = null;
  public segments: any = null;
  public schemas: any = null;
  //public fields: any = null;
  public fields: { [key: number]: FieldClass } = {};
  constructor(object = {}) {
    super((object = {}));
    super.initPropertyByObject(object);
  }
  /**
   * @deprecated this won't be sorted or filtered in a meaningful way
   * @returns {DatabaseClass[]}
   */
  databasesList({ savedQuestions = true } = {}) {
    // return _.chain(this.databases)
    //   .values()
    //   .filter((db) => savedQuestions || !db.is_saved_questions)
    //   .sortBy((db) => db.name)
    //   .value();
    const me = this;
    // let values = [];
    // for (let i in me.databases) {
    //   if (me.database.hasOwnProperty(i)) {
    //     values.push(me.database[i]);
    //   }
    // }
    return Object.values(this.databases)
      .filter((db) => savedQuestions || !db.is_saved_questions)
      .sort((db1, db2) => Number(db1.name) - Number(db2.name));
  }

  /**
   * @deprecated this won't be sorted or filtered in a meaningful way
   * @returns {Table[]}
   */
  tablesList() {
    return Object.values(this.tables);
  }

  /**
   * @deprecated this won't be sorted or filtered in a meaningful way
   * @returns {Metric[]}
   */
  metricsList() {
    return Object.values(this.metrics);
  }

  /**
   * @deprecated this won't be sorted or filtered in a meaningful way
   * @returns {Segment[]}
   */
  segmentsList() {
    return Object.values(this.segments);
  }

  /**
   * @param {SegmentId} segmentId
   * @returns {?Segment}
   */

  segment(segmentId) {
    return (segmentId != null && this.segments[segmentId]) || null;
  }

  /**
   * @param {MetricId} metricId
   * @returns {?Metric}
   */
  metric(metricId) {
    return (metricId != null && this.metrics[metricId]) || null;
  }

  /**
   * @param {DatabaseId} databaseId
   * @returns {?DatabaseClass}
   */
  database(databaseId) {
    return (databaseId != null && this.databases[databaseId]) || null;
  }

  /**
   * @param {SchemaId} schemaId
   * @returns {Schema}
   */
  schema(schemaId) {
    return (schemaId != null && this.schemas[schemaId]) || null;
  }

  /**
   *
   * @param {TableId} tableId
   * @returns {?Table}
   */
  table(tableId) {
    return (tableId != null && this.tables[tableId]) || null;
  }

  /**
   * @param {FieldId} fieldId
   * @returns {?Field}
   */
  field(fieldId) {
    return (fieldId != null && this.fields[fieldId]) || null;
  }

  // question(card) {
  //   return new Question(card, this);
  // }

  /**
   * @private
   * @param {Object.<number, DatabaseClass>} databases
   * @param {Object.<number, Table>} tables
   * @param {Object.<number, Field>} fields
   * @param {Object.<number, Metric>} metrics
   * @param {Object.<number, Segment>} segments
   */
  /* istanbul ignore next */
  _constructor(databases, tables, fields, metrics, segments) {
    this.databases = databases;
    this.tables = tables;
    this.fields = fields;
    this.metrics = metrics;
    this.segments = segments;
  }
}
