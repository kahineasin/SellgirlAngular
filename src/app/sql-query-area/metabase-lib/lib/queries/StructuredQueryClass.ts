/**
 * Represents a structured MBQL query.
 * 注意此文件当初是参考开源版本的旧版本,如果有问题,可以参照开源版本来修正,因为现在console项目里主要参照metabase的开源版本
 */

import * as Q from '../../../lib/query/query';
import { getUniqueExpressionName } from '../../../lib/query/expression';
import {
  format as formatExpression,
  DISPLAY_QUOTES,
} from '../../../lib/expressions/format';
import { isCompatibleAggregationOperatorForField } from '../../../lib/schema_metadata';

//import _ from "underscore";
//import { chain, updateIn } from "icepick";
//import { t } from "ttag";
import { t } from '../../../lib/pf_ttag';
import { PfUnderscore as _ } from '../../../lib/pf_underscore';
import { memoize } from '../utils';

import type {
  StructuredQuery as StructuredQueryObject,
  Aggregation,
  Breakout,
  Filter,
  LimitClause,
  OrderBy,
  StructuredQuery,
} from '../../../model/Query';
import type { DatasetQuery, StructuredDatasetQuery } from '../../../model/Card';
import type { AggregationOperator } from '../../../model/Metadata';

import Dimension, {
  FieldDimension,
  ExpressionDimension,
  AggregationDimension,
} from '../Dimension';
import DimensionOptions from '../DimensionOptions';

import type Segment from '../metadata/Segment';
import type { DatabaseEngine, DatabaseId } from '../../../model/Database';
import type DatabaseClass from '../metadata/DatabaseClass';
//import type Question from "../Question";
import type { TableId } from '../../../model/Table';
import type { Column } from '../../../model/Dataset';

import AtomicQuery from './AtomicQuery';

import AggregationWrapper from './structured/Aggregation';
import BreakoutWrapper from './structured/Breakout';
import FilterWrapper from './structured/Filter';
import JoinWrapper from './structured/Join';
import OrderByWrapper from './structured/OrderBy';

import TableClass from '../metadata/TableClass';
import FieldClass from '../metadata/FieldClass';

import { TYPE } from '../../../lib/types';

import { fieldRefForColumn } from '../../../lib/dataset';

type DimensionFilter = (dimension: Dimension) => boolean;
type FieldFilter = (filter: FieldClass) => boolean;

export const STRUCTURED_QUERY_TEMPLATE = {
  database: null,
  type: 'query',
  query: {
    'source-table': null,
  },
  version: 'perfect',
};

/**
 * A wrapper around an MBQL (`query` type @type {DatasetQuery}) object
 */
export default class StructuredQueryClass extends AtomicQuery {
  static isDatasetQueryType(datasetQuery: DatasetQuery) {
    return datasetQuery && datasetQuery.type === STRUCTURED_QUERY_TEMPLATE.type;
  }

  // For Flow type completion
  _structuredDatasetQuery: StructuredDatasetQuery;

  /**
   * Creates a new StructuredQuery based on the provided DatasetQuery object
   */
  constructor(
    // question: Question,//benjamin todo
    question: any, //
    datasetQuery: DatasetQuery = STRUCTURED_QUERY_TEMPLATE as any
  ) {
    super(question, datasetQuery);

    this._structuredDatasetQuery = datasetQuery as StructuredDatasetQuery;
  }

  /* Query superclass methods */

  /**
   * @returns true if this is new query that hasn't been modified yet.
   */
  isEmpty() {
    return !this.databaseId();
  }

  /**
   * @returns true if this query is in a state where it can be run.
   */
  canRun() {
    return !!(this.sourceTableId() || this.sourceQuery());
  }

  /**
   * @returns true if we have metadata for the root source table loaded
   */
  hasMetadata() {
    return this.metadata() && !!this.rootTable();
  }

  /**
   * @returns true if this query is in a state where it can be edited. Must have database and table set, and metadata for the table loaded.
   */
  isEditable() {
    return this.hasMetadata();
  }

  /* AtomicQuery superclass methods */

  /**
   * @returns all tables in the currently selected database that can be used.
   */
  tables(): TableClass[] {
    const database = this.database();
    return (database && (database as any).tables) || null;
  }

  /**
   * @returns the currently selected database ID, if any is selected.
   */
  databaseId(): DatabaseId {
    // same for both structured and native
    return this._structuredDatasetQuery.database;
  }

  /**
   * @returns the currently selected database metadata, if a database is selected and loaded.
   */
  database(): DatabaseClass {
    const databaseId = this.databaseId();
    return databaseId != null ? this._metadata.database(databaseId) : null;
  }

  /**
   * @returns the database engine object, if a database is selected and loaded.
   */
  engine(): DatabaseEngine {
    const database = this.database();
    return database && (database as any).engine;
  }

  /**
   * Returns true if the database metadata (or lack thererof indicates the user can modify and run this query
   */
  readOnly() {
    return !this.database();
  }

  /* Methods unique to this query type */

  /**
   * @returns a new reset @type {StructuredQueryClass} with the same parent @type {Question}
   */
  reset(): StructuredQueryClass {
    return new StructuredQueryClass(this._originalQuestion);
  }

  /**
   * @returns the underlying MBQL query object
   */
  query(): StructuredQueryObject {
    return this._structuredDatasetQuery.query;
  }

  setQuery(query: StructuredQueryObject): StructuredQueryClass {
    return this._updateQuery(() => query, []);
  }

  clearQuery() {
    return this._updateQuery(() => ({}));
  }

  updateQuery(
    fn: (q: StructuredQueryObject) => StructuredQueryObject
  ): StructuredQueryClass {
    return this._updateQuery(fn, []);
  }

  /**
   * @returns a new query with the provided Database set.
   */
  setDatabase(database: DatabaseClass): StructuredQueryClass {
    return this.setDatabaseId(database.id);
  }

  /**
   * @returns a new query with the provided Database ID set.
   */
  setDatabaseId(databaseId: DatabaseId): StructuredQueryClass {
    if (databaseId !== this.databaseId()) {
      // TODO: this should reset the rest of the query?
      // return new StructuredQueryClass(
      //   this._originalQuestion,
      //   chain(this.datasetQuery())
      //     .assoc("database", databaseId)
      //     .assoc("query", {})
      //     .value()
      // );
      let tmp = this.datasetQuery() as StructuredDatasetQuery;
      tmp.database = databaseId;
      tmp.query = {};
      return new StructuredQueryClass(this._originalQuestion, tmp);
    } else {
      return this;
    }
  }

  /**
   * @returns the table ID, if a table is selected.
   */
  sourceTableId(): TableId {
    return this.query()['source-table'];
  }
  /**
   * @returns a new query with the provided Table ID set.
   */
  setSourceTableId(tableId: TableId): StructuredQueryClass {
    if (tableId !== this.sourceTableId()) {
      // return new StructuredQueryClass(
      //   this._originalQuestion,
      //   chain(this.datasetQuery())
      //     .assoc("database", this.metadata().table(tableId).database.id)
      //     .assoc("query", { "source-table": tableId })
      //     .value()
      // );
      let tmp = this.datasetQuery() as StructuredDatasetQuery;
      tmp.database = (this.metadata().table(tableId) as any).database.id;
      tmp.query = { 'source-table': tableId };
      return new StructuredQueryClass(this._originalQuestion, tmp);
    } else {
      return this;
    }
  }

  /**
   * @deprecated: use sourceTableId
   */
  tableId(): TableId {
    return this.sourceTableId();
  }
  /**
   * @deprecated: use setSourceTableId
   */
  setTableId(tableId: TableId): StructuredQueryClass {
    return this.setSourceTableId(tableId);
  }
  /**
   * @deprecated: use setSourceTableId
   */
  setTable(table: TableClass): StructuredQueryClass {
    return this.setSourceTableId(table.id);
  }

  /**
   *
   */
  setDefaultQuery(): StructuredQueryClass {
    const table = this.table();
    // NOTE: special case for Google Analytics which doesn't allow raw queries:
    if (
      table &&
      table.entity_type === 'entity/GoogleAnalyticsTable' &&
      !this.isEmpty() &&
      !this.hasAnyClauses()
    ) {
      // NOTE: shold we check that a
      //const dateField = _.findWhere(table.fields, { name: "ga:date" });
      const dateField = table.fields.find((a) => a.name === 'ga:date');
      if (dateField) {
        return (
          this.filter([
            'time-interval',
            // ["field", dateField.id, null],
            ['field-id', dateField.id],
            -365,
            'day',
          ] as any)
            .aggregate(['metric', 'ga:users'] as any)
            .aggregate(['metric', 'ga:pageviews'] as any)
            // .breakout([
            //   "field",
            //   dateField.id,
            //   { "temporal-unit": "week" },
            // ] as any)
            .breakout(['datetime-field', ['field-id', dateField.id], 'week'])
        );
      }
    }
    return this;
  }

  /**
   * @returns the table object, if a table is selected and loaded.
   */
  @memoize
  table(): TableClass {
    const sourceQuery = this.sourceQuery();
    if (sourceQuery) {
      //测试通过,应该没问题,fields有值--benjamin
      let table = new TableClass({
        name: '',
        display_name: '',
        db: sourceQuery.database(),
        fields: sourceQuery.columns().map(
          (column) =>
            // new FieldClass({//这个好像是新收费版本的写法
            //   ...column,
            //   // TODO FIXME -- Do NOT use field-literal unless you're referring to a native query
            //   id: ["field", column.name, { "base-type": column.base_type }],
            //   source: "fields",
            //   // HACK: need to thread the query through to this fake Field
            //   query: this,
            // })
            new FieldClass({
              ...column,
              id: ['field-literal', column.name, column.base_type],
              source: 'fields',
              // HACK: need to thread the query through to this fake Field
              query: this,
            })
        ),
        segments: [],
        metrics: [],
      });
      //debugger;
      // HACK: ugh various parts of the UI still expect this stuff
      // addValidOperatorsToFields(table);//开源版本的这两句,在新的收费版本里面好像删除掉了
      // augmentDatabase({ tables: [table] });
      return table;
    } else {
      return this.metadata().table(this.sourceTableId());
    }
  }

  /**
   * Removes invalid clauses from the query (and source-query, recursively)
   */
  clean(): StructuredQueryClass {
    if (!this.hasMetadata()) {
      console.warn("Warning: can't clean query without metadata!");
      return this;
    }

    let query = this;

    // first clean the sourceQuery, if any, recursively
    const sourceQuery = query.sourceQuery();
    if (sourceQuery) {
      query = query.setSourceQuery(sourceQuery.clean()) as any;
    }

    return query
      .cleanJoins()
      .cleanExpressions()
      .cleanFilters()
      .cleanAggregations()
      .cleanBreakouts()
      .cleanSorts()
      .cleanLimit()
      .cleanFields()
      .cleanEmpty();
  }

  /**
   * Removes empty/useless layers of nesting (recursively)
   */
  cleanNesting(): StructuredQueryClass {
    // first clean the sourceQuery, if any, recursively
    const sourceQuery = this.sourceQuery();
    if (sourceQuery) {
      return this.setSourceQuery(sourceQuery.cleanNesting()).cleanEmpty();
    } else {
      return this;
    }
  }

  cleanJoins(): StructuredQueryClass {
    let query = this;
    this.joins().forEach((join, index) => {
      query = query.updateJoin(index, (join as any).clean()) as any;
    });
    return query._cleanClauseList('joins');
  }

  cleanExpressions(): StructuredQueryClass {
    return this; // TODO
  }

  cleanFilters(): StructuredQueryClass {
    return this._cleanClauseList('filters');
  }

  cleanAggregations(): StructuredQueryClass {
    return this._cleanClauseList('aggregations');
  }

  cleanBreakouts(): StructuredQueryClass {
    return this._cleanClauseList('breakouts');
  }

  cleanSorts(): StructuredQueryClass {
    return this._cleanClauseList('sorts');
  }

  cleanLimit(): StructuredQueryClass {
    return this; // TODO
  }

  cleanFields(): StructuredQueryClass {
    return this; // TODO
  }

  /**
   * If this query is empty and there's a source-query, strip off this query, returning the source-query
   */
  cleanEmpty(): StructuredQueryClass {
    const sourceQuery = this.sourceQuery();
    if (sourceQuery && !this.hasAnyClauses()) {
      return sourceQuery;
    } else {
      return this;
    }
  }

  isValid() {
    if (!this.hasData()) {
      return false;
    }
    const sourceQuery = this.sourceQuery();
    if (sourceQuery && !sourceQuery.isValid()) {
      return false;
    }
    if (
      !this._isValidClauseList('joins') ||
      !this._isValidClauseList('filters') ||
      !this._isValidClauseList('aggregations') ||
      !this._isValidClauseList('breakouts')
    ) {
      return false;
    }
    const table = this.table();
    // NOTE: special case for Google Analytics which requires an aggregation
    if (table.entity_type === 'entity/GoogleAnalyticsTable') {
      if (!this.hasAggregations()) {
        return false;
      }
    }
    return true;
  }

  _cleanClauseList(listName) {
    let query = this;
    for (let index = 0; index < query[listName]().length; index++) {
      const clause = query[listName]()[index];
      if (!this._validateClause(clause)) {
        console.warn('Removing invalid MBQL clause', clause);
        query = clause.remove();
        // since we're removing them in order we need to decrement index when we remove one
        index -= 1;
      }
    }
    return query;
  }

  _isValidClauseList(listName) {
    for (const clause of this[listName]()) {
      if (!this._validateClause(clause)) {
        return false;
      }
    }
    return true;
  }

  _validateClause(clause) {
    try {
      return clause.isValid();
    } catch (e) {
      console.warn('Error thrown while validating clause', clause, e);
      return false;
    }
  }

  hasData() {
    return !!this.table();
  }

  hasAnyClauses() {
    return (
      this.hasJoins() ||
      this.hasExpressions() ||
      this.hasFilters() ||
      this.hasAggregations() ||
      this.hasBreakouts() ||
      this.hasSorts() ||
      this.hasLimit() ||
      this.hasFields()
    );
  }

  hasJoins() {
    return this.joins().length > 0;
  }

  hasExpressions() {
    return Object.keys(this.expressions()).length > 0;
  }

  hasFilters() {
    return this.filters().length > 0;
  }

  hasAggregations() {
    return this.aggregations().length > 0;
  }

  hasBreakouts() {
    return this.breakouts().length > 0;
  }

  hasSorts() {
    return this.sorts().length > 0;
  }

  hasLimit() {
    const limit = this.limit();
    return limit != null && limit > 0;
  }

  hasFields() {
    return this.fields().length > 0;
  }

  // ALIASES: allows

  /**
   * @returns alias for addAggregation
   */
  aggregate(aggregation: Aggregation): StructuredQueryClass {
    return this.addAggregation(aggregation);
  }

  /**
   * @returns alias for addBreakout
   */
  breakout(breakout: Breakout | Dimension | FieldClass): StructuredQueryClass {
    if (breakout instanceof FieldClass) {
      breakout = (breakout as any).dimension();
    }
    if (breakout instanceof Dimension) {
      breakout = breakout.mbql() as any;
    }
    return this.addBreakout(breakout as any);
  }

  /**
   * @returns alias for addFilter
   */
  filter(filter: Filter | FilterWrapper) {
    return this.addFilter(filter);
  }

  /**
   * @returns alias for addSort
   */
  sort(sort: OrderBy) {
    return this.addSort(sort);
  }

  /**
   * @returns alias for addJoin
   */
  join(join) {
    return this.addJoin(join);
  }

  // JOINS

  /**
   * @returns an array of MBQL @type {Join}s.
   */
  joins(): JoinWrapper[] {
    return Q.getJoins(this.query()).map(
      (join, index) => new JoinWrapper(join, index, this)
    );
  }

  addJoin(join) {
    return this._updateQuery(Q.addJoin, arguments as any);
  }

  updateJoin(index, join) {
    return this._updateQuery(Q.updateJoin, arguments as any);
  }

  removeJoin(index) {
    return this._updateQuery(Q.removeJoin, arguments as any);
  }

  clearJoins() {
    return this._updateQuery(Q.clearJoins, arguments as any);
  }

  // AGGREGATIONS

  /**
   * @returns an array of MBQL @type {Aggregation}s.
   */
  aggregations(): AggregationWrapper[] {
    return Q.getAggregations(this.query()).map(
      (aggregation, index) => new AggregationWrapper(aggregation, index, this)
    );
  }

  /**
   * @returns an array of aggregation options for the currently selected table
   */
  aggregationOperators(): AggregationOperator[] {
    return (this.table() && this.table().aggregationOperators()) || [];
  }

  /**
   * @returns an array of aggregation options for the currently selected table
   */
  aggregationOperatorsWithoutRows(): AggregationOperator[] {
    return this.aggregationOperators().filter(
      (option) => option.short !== 'rows'
    );
  }

  /**
   * @returns the field options for the provided aggregation
   */
  aggregationFieldOptions(agg: string | AggregationOperator): DimensionOptions {
    const aggregation: AggregationOperator =
      typeof agg === 'string' ? this.table().aggregationOperator(agg) : agg;
    if (aggregation) {
      const fieldOptions = this.fieldOptions((field) => {
        return (
          aggregation.validFieldsFilters.length > 0 &&
          aggregation.validFieldsFilters[0]([field as any]).length === 1
        );
      });

      // HACK Atte Keinänen 6/18/17: Using `fieldOptions` with a field filter function
      // ends up often omitting all expressions because the field object of ExpressionDimension is empty.
      // Expressions can be applied to all aggregations so we can simply add all expressions to the
      // dimensions list in this hack.
      //
      // A real solution would have a `dimensionOptions` method instead of `fieldOptions` which would
      // enable filtering based on dimension properties.
      const compatibleDimensions = this.expressionDimensions().filter((d) =>
        isCompatibleAggregationOperatorForField(aggregation, d.field())
      );
      return new DimensionOptions({
        ...fieldOptions,
        dimensions: _.uniq([
          ...compatibleDimensions,
          ...fieldOptions.dimensions.filter(
            (d) => !(d instanceof ExpressionDimension)
          ),
        ]),
      });
    } else {
      return new DimensionOptions({ count: 0, fks: [], dimensions: [] });
    }
  }

  /**
   * @returns true if the aggregation can be removed
   */
  canRemoveAggregation() {
    return this.aggregations().length > 1;
  }

  /**
   * @returns true if the query has no aggregation
   */
  isBareRows() {
    return !this.hasAggregations();
  }

  /**
   * @returns true if the query has no aggregation or breakouts
   */
  isRaw() {
    return !this.hasAggregations() && !this.hasBreakouts();
  }

  formatExpression(expression, { quotes = DISPLAY_QUOTES, ...options } = {}) {
    return formatExpression(expression, {
      quotes,
      ...options,
      query: this,
    } as any);
  }

  /**
   * @returns {StructuredQueryClass} new query with the provided MBQL @type {Aggregation} added.
   */
  addAggregation(aggregation: Aggregation): StructuredQueryClass {
    return this._updateQuery(Q.addAggregation, arguments as any);
  }

  /**
   * @returns {StructuredQueryClass} new query with the MBQL @type {Aggregation} updated at the provided index.
   */
  updateAggregation(
    index: number,
    aggregation: Aggregation
  ): StructuredQueryClass {
    return this._updateQuery(Q.updateAggregation, arguments as any);
  }

  /**
   * @returns {StructuredQueryClass} new query with the aggregation at the provided index removed.
   */
  removeAggregation(index: number): StructuredQueryClass {
    return this._updateQuery(Q.removeAggregation, arguments as any);
  }

  /**
   * @returns {StructuredQueryClass} new query with all aggregations removed.
   */
  clearAggregations(): StructuredQueryClass {
    return this._updateQuery(Q.clearAggregations, arguments as any);
  }

  // BREAKOUTS

  /**
   * @returns An array of MBQL @type {Breakout}s.
   */
  breakouts(): BreakoutWrapper[] {
    if (this.query() == null) {
      return [];
    }
    return Q.getBreakouts(this.query()).map(
      (breakout, index) => new BreakoutWrapper(breakout as any, index, this)
    );
  }

  /**
   * @param includedBreakout The breakout to include even if it's already used
   * @param fieldFilter An option @type {FieldClass} predicate to filter out options
   * @returns @type {DimensionOptions} that can be used as breakouts, excluding used breakouts, unless @param {breakout} is provided.
   */
  breakoutOptions(includedBreakout?: any, fieldFilter = (any) => true) {
    // the set of field ids being used by other breakouts
    const usedFields = new Set(
      includedBreakout === true
        ? []
        : this.breakouts()
            .filter((breakout) => !_.isEqual(breakout, includedBreakout))
            .map((breakout) => breakout.field().id)
    );

    return this.fieldOptions(
      (field) => fieldFilter(field) && !usedFields.has(field.id)
    );
  }

  /**
   * @returns whether a new breakout can be added or not
   */
  canAddBreakout() {
    return this.breakoutOptions().count > 0;
  }

  /**
   * @returns whether the current query has a valid breakout
   */
  hasValidBreakout() {
    const breakouts = this.breakouts();
    return breakouts.length > 0 && breakouts[0].isValid();
  }

  /**
   * @returns {StructuredQueryClass} new query with the provided MBQL @type {Breakout} added.
   */
  addBreakout(breakout: Breakout) {
    return this._updateQuery(Q.addBreakout, arguments as any);
  }

  /**
   * @returns {StructuredQueryClass} new query with the MBQL @type {Breakout} updated at the provided index.
   */
  updateBreakout(index: number, breakout: Breakout) {
    return this._updateQuery(Q.updateBreakout, arguments as any);
  }

  /**
   * @returns {StructuredQueryClass} new query with the breakout at the provided index removed.
   */
  removeBreakout(index: number) {
    return this._updateQuery(Q.removeBreakout, arguments as any);
  }
  /**
   * @returns {StructuredQueryClass} new query with all breakouts removed.
   */
  clearBreakouts() {
    return this._updateQuery(Q.clearBreakouts, arguments as any);
  }

  // FILTERS

  /**
   * @returns An array of MBQL @type {Filter}s.
   */
  @memoize
  filters(): FilterWrapper[] {
    return Q.getFilters(this.query()).map(
      (filter, index) => new FilterWrapper(filter, index, this)
    );
  }

  /**
   * @returns An array of MBQL @type {Filter}s from the last two query stages
   */
  topLevelFilters(stages = 2): Filter[] {
    const queries = this.queries().slice(-stages);
    return [].concat(...queries.map((q) => q.filters()));
  }

  filterFieldOptionSections(
    filter?: Filter | FilterWrapper,
    { includeSegments = true } = {}
  ) {
    const filterDimensionOptions = this.filterDimensionOptions();
    const filterSegmentOptions = includeSegments
      ? this.filterSegmentOptions(filter)
      : [];
    return filterDimensionOptions.sections({
      extraItems: filterSegmentOptions.map((segment) => ({
        name: (segment as any).name,
        icon: 'star_outline',
        filter: ['segment', (segment as any).id],
        query: this,
      })),
    });
  }

  topLevelFilterFieldOptionSections(filter = null, stages = 2) {
    const queries = this.queries().slice(-stages);
    // allow post-aggregation filtering
    if (queries.length < stages && this.canNest() && this.hasBreakouts()) {
      queries.push(queries[queries.length - 1].nest());
    }
    queries.reverse();

    const sections = [].concat(
      ...queries.map((q) => q.filterFieldOptionSections(filter))
    );

    // special logic to only show aggregation dimensions for post-aggregation dimensions
    if (queries.length > 1) {
      // set the section title to `Metrics`
      sections[0].name = t`Metrics`;
      // only include aggregation dimensions
      sections[0].items = sections[0].items.filter((item) => {
        if (item.dimension) {
          const sourceDimension = queries[0].dimensionForSourceQuery(
            item.dimension
          );
          if (sourceDimension) {
            return sourceDimension instanceof AggregationDimension;
          }
        }
        return true;
      });
    }

    return sections;
  }

  /**
   * @returns @type {DimensionOptions} that can be used in filters.
   */
  filterDimensionOptions(): DimensionOptions {
    return this.dimensionOptions();
  }

  /**
   * @returns @type {Segment}s that can be used as filters.
   */
  filterSegmentOptions(filter?: Filter | FilterWrapper): Segment[] {
    if (filter && !(filter instanceof FilterWrapper)) {
      filter = new FilterWrapper(filter, null, this);
    }
    const currentSegmentId =
      filter && (filter as any).isSegment() && (filter as any).segmentId();
    return (this.table() as any).segments.filter(
      (segment) =>
        (currentSegmentId != null && currentSegmentId === segment.id) ||
        (!segment.archived && !this.segments().includes(segment))
    );
  }

  /**
   *  @returns @type {Segment}s that are currently applied to the question
   */
  segments() {
    return this.filters()
      .filter((filter) => filter.isSegment())
      .map((filter) => filter.segment());
  }

  /**
   * @returns whether a new filter can be added or not
   */
  canAddFilter() {
    return (
      Q.canAddFilter(this.query()) &&
      (this.filterDimensionOptions().count > 0 ||
        this.filterSegmentOptions().length > 0)
    );
  }

  /**
   * @returns {StructuredQueryClass} new query with the provided MBQL @type {Filter} added.
   */
  addFilter(filter: Filter | FilterWrapper) {
    return this._updateQuery(Q.addFilter, arguments as any);
  }

  /**
   * @returns {StructuredQueryClass} new query with the MBQL @type {Filter} updated at the provided index.
   */
  updateFilter(index: number, filter: Filter | FilterWrapper) {
    return this._updateQuery(Q.updateFilter, arguments as any);
  }

  /**
   * @returns {StructuredQueryClass} new query with the filter at the provided index removed.
   */
  removeFilter(index: number) {
    return this._updateQuery(Q.removeFilter, arguments as any);
  }

  /**
   * @returns {StructuredQueryClass} new query with all filters removed.
   */
  clearFilters() {
    return this._updateQuery(Q.clearFilters, arguments as any);
  }

  // SORTS

  // TODO: standardize SORT vs ORDER_BY terminology

  @memoize
  sorts(): OrderByWrapper[] {
    return Q.getOrderBys(this.query()).map(
      (sort, index) => new OrderByWrapper(sort, index, this)
    );
  }

  sortOptions(includedSort): DimensionOptions {
    // in bare rows all fields are sortable, otherwise we only sort by our breakout columns
    if (this.isBareRows()) {
      const usedFields = new Set(
        this.sorts()
          .filter((sort) => !_.isEqual(sort, includedSort))
          .map((sort) => sort.field().id)
      );
      return this.fieldOptions((field) => !usedFields.has(field.id));
    } else if (this.hasValidBreakout()) {
      const sortOptions = { count: 0, dimensions: [], fks: [] };
      for (const breakout of this.breakouts()) {
        sortOptions.dimensions.push(breakout.dimension());
        sortOptions.count++;
      }
      if (this.hasBreakouts()) {
        for (const aggregation of this.aggregations()) {
          sortOptions.dimensions.push(aggregation.aggregationDimension());
          sortOptions.count++;
        }
      }

      return new DimensionOptions(sortOptions);
    }
  }
  canAddSort() {
    const sorts = this.sorts();
    return (
      this.sortOptions(undefined).count > 0 &&
      (sorts.length === 0 || sorts[sorts.length - 1][0] != null)
    );
  }

  addSort(orderBy: OrderBy | OrderByWrapper) {
    return this._updateQuery(Q.addOrderBy, arguments as any);
  }
  updateSort(index: number, orderBy: OrderBy | OrderByWrapper) {
    return this._updateQuery(Q.updateOrderBy, arguments as any);
  }
  removeSort(index: number) {
    return this._updateQuery(Q.removeOrderBy, arguments as any);
  }
  clearSort() {
    return this._updateQuery(Q.clearOrderBy, arguments as any);
  }
  replaceSort(orderBy: OrderBy) {
    return this.clearSort().addSort(orderBy);
  }

  // LIMIT

  limit(): number {
    return Q.getLimit(this.query());
  }
  updateLimit(limit: LimitClause) {
    return this._updateQuery(Q.updateLimit, arguments as any);
  }
  clearLimit() {
    return this._updateQuery(Q.clearLimit, arguments as any);
  }

  // EXPRESSIONS

  expressions(): { [key: string]: any } {
    return Q.getExpressions(this.query());
  }

  addExpression(name, expression) {
    const uniqueName = getUniqueExpressionName(this.expressions(), name);
    let query = this._updateQuery(Q.addExpression, [uniqueName, expression]);
    // extra logic for adding expressions in fields clause
    // TODO: push into query/expression?
    if (query.hasFields() && query.isRaw()) {
      query = query.addField(['expression', uniqueName], undefined);
    }
    return query;
  }

  updateExpression(name, expression, oldName) {
    const isRename = oldName && oldName !== name;
    const uniqueName = isRename
      ? getUniqueExpressionName(this.expressions(), name)
      : name;
    let query = this._updateQuery(Q.updateExpression, [
      uniqueName,
      expression,
      oldName,
    ]);
    // extra logic for renaming expressions in fields clause
    // TODO: push into query/expression?
    if (isRename) {
      const index = query._indexOfField(['expression', oldName]);
      if (index >= 0) {
        query = query.updateField(index, ['expression', uniqueName]);
      }
    }
    return query;
  }

  removeExpression(name) {
    let query = this._updateQuery(Q.removeExpression, arguments as any);
    // extra logic for removing expressions in fields clause
    // TODO: push into query/expression?
    const index = query._indexOfField(['expression', name]);
    if (index >= 0) {
      query = query.removeField(index);
    }
    return query;
  }

  clearExpressions() {
    let query = this._updateQuery(Q.clearExpressions, arguments as any);
    // extra logic for removing expressions in fields clause
    // TODO: push into query/expression?
    for (const name of Object.keys(this.expressions())) {
      const index = query._indexOfField(['expression', name]);
      if (index >= 0) {
        query = query.removeField(index);
      }
    }
    return query;
  }

  _indexOfField(fieldRef) {
    return this.fields().findIndex((f) => _.isEqual(f, fieldRef));
  }

  // FIELDS

  fields() {
    // FIMXE: implement field functions in query lib
    return this.query().fields || [];
  }

  addField(name, expression) {
    return this._updateQuery(Q.addField, arguments as any);
  }

  updateField(index, field) {
    return this._updateQuery(Q.updateField, arguments as any);
  }

  removeField(name) {
    return this._updateQuery(Q.removeField, arguments as any);
  }

  clearFields() {
    return this._updateQuery(Q.clearFields, arguments as any);
  }

  setFields(fields) {
    return this._updateQuery((q) => ({ ...q, fields }));
  }

  /**
   * Returns dimension options that can appear in the `fields` clause
   */
  fieldsOptions(
    dimensionFilter: DimensionFilter = (dimension) => true
  ): DimensionOptions {
    if (this.isBareRows() && !this.hasBreakouts()) {
      return this.dimensionOptions(dimensionFilter);
    }
    // TODO: allow adding fields connected by broken out PKs?
    return new DimensionOptions({ count: 0, dimensions: [], fks: [] });
  }

  // DIMENSION OPTIONS

  _keyForFK(source, destination) {
    if (source && destination) {
      return `${source.id},${destination.id}`;
    }
    return null;
  }

  //这个是收费版本的方法
  // _getExplicitJoinsSet(joins) {
  //   const joinDimensionPairs = joins.map((join) => {
  //     debugger;
  //     const dimensionPairs = join.getDimensions(); //这里会报方法不存在，估计收费版本才有此方法
  //     return dimensionPairs.map((pair) => {
  //       const [parentDimension, joinDimension] = pair;
  //       return this._keyForFK(
  //         parentDimension && parentDimension.field(),
  //         joinDimension && joinDimension.field()
  //       );
  //     });
  //   });

  //   const flatJoinDimensions = _.flatten(joinDimensionPairs, null);
  //   const explicitJoins = new Set(flatJoinDimensions);
  //   explicitJoins.delete(null);

  //   return explicitJoins;
  // }

  // TODO Atte Keinänen 6/18/17: Refactor to dimensionOptions which takes a dimensionFilter
  // See aggregationFieldOptions for an explanation why that covers more use cases
  dimensionOptions(
    dimensionFilter: DimensionFilter = (dimension) => true
  ): DimensionOptions {
    const dimensionOptions = {
      count: 0,
      fks: [],
      dimensions: [],
    };

    const joins = this.joins();
    for (const join of joins) {
      const joinedDimensionOptions =
        join.joinedDimensionOptions(dimensionFilter);
      dimensionOptions.count += joinedDimensionOptions.count;
      dimensionOptions.fks.push(joinedDimensionOptions);
    }

    //debugger;
    const table = this.table();
    if (table) {
      const dimensionIsFKReference = (dimension) =>
        dimension.field && dimension.field() && dimension.field().isFK();

      const filteredNonFKDimensions = this.dimensions().filter(dimensionFilter);
      // .filter(d => !dimensionIsFKReference(d));

      for (const dimension of filteredNonFKDimensions) {
        dimensionOptions.count++;
        dimensionOptions.dimensions.push(dimension);
      }

      // de-duplicate explicit and implicit joined tables
      //const explicitJoins = this._getExplicitJoinsSet(joins);	    //这个方法是metabase收费版本的
      const keyForFk = (src, dst) =>
        src && dst ? `${src.id},${dst.id}` : null;
      const explicitJoins = new Set(
        joins.map((join) => {
          const p = join.parentDimension();
          const j = join.joinDimension();
          return keyForFk(p && p.field(), j && j.field());
        })
      );
      explicitJoins.delete(null);

      const fkDimensions = this.dimensions().filter(dimensionIsFKReference);
      for (const dimension of fkDimensions) {
        const field = dimension.field();
        if (
          field &&
          explicitJoins.has(this._keyForFK(field, (field as any).target))
        ) {
          continue;
        }

        const fkDimensions = dimension
          .dimensions([FieldDimension])
          .filter(dimensionFilter);

        if (fkDimensions.length > 0) {
          dimensionOptions.count += fkDimensions.length;
          dimensionOptions.fks.push({
            field: field,
            dimension: dimension,
            dimensions: fkDimensions,
          });
        }
      }
    }

    return new DimensionOptions(dimensionOptions);
  }

  // FIELD OPTIONS

  fieldOptions(fieldFilter: FieldFilter = (field) => true): DimensionOptions {
    const dimensionFilter = (dimension) => {
      const field = dimension.field && dimension.field();
      return !field || (field.isDimension() && fieldFilter(field));
    };
    return this.dimensionOptions(dimensionFilter);
  }

  // DIMENSIONS

  dimensions(): Dimension[] {
    try {
      //debugger;
      let expre = this.expressionDimensions();
      let tableDimen = this.tableDimensions();
      let r = [...expre, ...tableDimen];
      //debugger;
      return r;
    } catch (e) {
      console.error(e);
      //debugger;
    }
  }

  @memoize
  tableDimensions(): Dimension[] {
    const table: TableClass = this.table();
    let dimen = (table as any).dimensions(); //测试时暂加any
    let r = table
      ? // HACK: ensure the dimensions are associated with this query
        dimen.map((d) => (d._query ? d : this.parseFieldReference(d.mbql())))
      : [];
    //debugger;
    //这里的值和metabase运行中的数值有较大差异,可能是mbql的影响?--benjamin todo
    return r;
  }

  @memoize
  expressionDimensions(): Dimension[] {
    let expre = this.expressions();
    let r = Object.entries(expre).map(([expressionName, expression]) => {
      return new ExpressionDimension(
        null,
        [expressionName],
        new FieldClass(),
        this._metadata,
        this
      );
    });
    //debugger;
    return r;
  }

  @memoize
  joinedDimensions(): Dimension[] {
    return [].concat(...this.joins().map((join) => join.fieldsDimensions()));
  }

  @memoize
  breakoutDimensions() {
    return this.breakouts().map((breakout) =>
      this.parseFieldReference(breakout)
    );
  }

  @memoize
  aggregationDimensions() {
    return this.aggregations().map((aggregation) =>
      aggregation.aggregationDimension()
    );
  }

  @memoize
  fieldDimensions() {
    return this.fields().map((fieldClause, index) =>
      this.parseFieldReference(fieldClause)
    );
  }

  // TODO: this replicates logic in the backend, we should have integration tests to ensure they match
  // NOTE: these will not have the correct columnName() if there are duplicates
  @memoize
  columnDimensions() {
    //debugger;
    if (this.hasAggregations() || this.hasBreakouts()) {
      const aggregations = this.aggregationDimensions();
      const breakouts = this.breakoutDimensions();
      return [...breakouts, ...aggregations];
    } else if (this.hasFields()) {
      const fields = this.fieldDimensions();
      const joined = this.joinedDimensions();
      return [...fields, ...joined];
    } else {
      const expressions = this.expressionDimensions();
      const joined = this.joinedDimensions();
      const table = this.tableDimensions();
      // const sorted = _.chain(table)
      //   .filter((d) => {
      //     const f = d.field();
      //     return (
      //       f.active !== false &&
      //       f.visibility_type !== "sensitive" &&
      //       f.visibility_type !== "retired" &&
      //       f.parent_id == null
      //     );
      //   })
      //   .sortBy((d) => d.displayName().toLowerCase())
      //   .sortBy((d) => {
      //     const type = d.field().semantic_type;
      //     return type === TYPE.PK ? 0 : type === TYPE.Name ? 1 : 2;
      //   })
      //   .sortBy((d) => d.field().position)
      //   .value();
      const sorted = table
        .filter((d) => {
          const f = d.field() as any;
          return (
            f.active !== false &&
            f.visibility_type !== 'sensitive' &&
            f.visibility_type !== 'retired' &&
            f.parent_id == null
          );
        })
        //.sortBy((d) => d.displayName().toLowerCase())
        .sort(function (a, b) {
          return (
            parseInt('0x' + a.displayName().toLowerCase()) -
            parseInt('0x' + b.displayName().toLowerCase())
          );
        })
        // .sortBy((d) => {
        //   const type = d.field().semantic_type;
        //   return type === TYPE.PK ? 0 : type === TYPE.Name ? 1 : 2;
        // })
        .sort(function (a, b) {
          const type = (a.field() as any).semantic_type;
          const type2 = (b.field() as any).semantic_type;
          const typeValue = type === TYPE.PK ? 0 : type === TYPE.Name ? 1 : 2;
          const typeValue2 =
            type2 === TYPE.PK ? 0 : type2 === TYPE.Name ? 1 : 2;
          return typeValue - typeValue2;
        })
        // .sortBy((d) => d.field().position)
        .sort(function (a, b) {
          return (a.field() as any).position - (b.field() as any).position;
        });
      return [...sorted, ...expressions, ...joined];
    }
  }

  // TODO: this replicates logic in the backend, we should have integration tests to ensure they match
  @memoize
  columnNames() {
    // NOTE: dimension.columnName() doesn't include suffixes for duplicated column names so we need to do that here
    const nameCounts = new Map();
    return this.columnDimensions().map((dimension) => {
      const name = dimension.columnName();
      if (nameCounts.has(name)) {
        const count = nameCounts.get(name) + 1;
        nameCounts.set(name, count);
        return `${name}_${count}`;
      } else {
        nameCounts.set(name, 1);
        return name;
      }
    });
  }

  columns() {
    //测试通过--benjamin
    const names = this.columnNames();
    let dimens = this.columnDimensions();
    let r = dimens.map((dimension, index) => ({
      ...dimension.column(),
      name: names[index],
    }));
    //debugger;
    return r;
  }

  columnDimensionWithName(columnName) {
    const index = this.columnNames().findIndex((n) => n === columnName);
    if (index >= 0) {
      return this.columnDimensions()[index];
    }
  }

  fieldReferenceForColumn(column) {
    return fieldRefForColumn(column, new FieldClass());
  }

  // TODO: better name may be parseDimension?
  parseFieldReference(fieldRef): Dimension {
    return Dimension.parseMBQL(
      fieldRef,
      new FieldClass(),
      this._metadata,
      this
    );
  }

  dimensionForColumn(column) {
    if (column) {
      const fieldRef = this.fieldReferenceForColumn(column);
      if (fieldRef) {
        return this.parseFieldReference(fieldRef);
      }
    }
    return null;
  }

  setDatasetQuery(datasetQuery: DatasetQuery): StructuredQueryClass {
    return new StructuredQueryClass(this._originalQuestion, datasetQuery);
  }

  // NESTING

  nest(): StructuredQueryClass {
    return this._updateQuery((query) => ({ 'source-query': query }));
  }

  canNest() {
    const db = this.database();
    return db && db.hasFeature('nested-queries');
  }

  /**
   * The (wrapped) source query, if any
   */
  @memoize
  sourceQuery(): StructuredQueryClass {
    const sourceQuery = this.query()['source-query'];
    if (sourceQuery) {
      return new NestedStructuredQuery(
        this._originalQuestion,
        { ...this.datasetQuery(), query: sourceQuery },
        this
      );
    } else {
      return null;
    }
  }

  /**
   * Returns the "first" of the nested queries, or this query it not nested
   */
  @memoize
  rootQuery(): StructuredQueryClass {
    const sourceQuery = this.sourceQuery();
    return sourceQuery ? sourceQuery.rootQuery() : this;
  }

  /**
   * Returns the "last" nested query that is already summarized, or `null` if none are
   * */
  @memoize
  lastSummarizedQuery(): StructuredQueryClass {
    if (this.hasAggregations() || !this.canNest()) {
      return this;
    } else {
      const sourceQuery = this.sourceQuery();
      return sourceQuery ? sourceQuery.lastSummarizedQuery() : null;
    }
  }

  /**
   * Returns the "last" nested query that is already summarized, or the query itself.
   * Used in "view mode" to effectively ignore post-aggregation filter stages
   */
  @memoize
  topLevelQuery(): StructuredQueryClass {
    if (!this.canNest()) {
      return this;
    } else {
      return this.lastSummarizedQuery() || this;
    }
  }

  /**
   * Returns the corresponding {Dimension} in the "top-level" {StructuredQuery}
   */
  topLevelDimension(dimension: Dimension): Dimension {
    const topQuery = this.topLevelQuery();
    let query = this;
    while (query) {
      if (query === topQuery) {
        return dimension;
      } else {
        dimension = query.dimensionForSourceQuery(dimension);
        query = query.sourceQuery() as any;
      }
    }
    return null;
  }

  /**
   * Returns the corresponding {Column} in the "top-level" {StructuredQuery}
   */
  topLevelColumn(column: Column): Column {
    const dimension = this.dimensionForColumn(column);
    if (dimension) {
      const topDimension = this.topLevelDimension(dimension);
      if (topDimension) {
        return topDimension.column() as any;
      }
    }
    return null;
  }

  /**
   * returns the corresponding {Dimension} in the sourceQuery, if any
   */
  dimensionForSourceQuery(dimension: Dimension): Dimension {
    if (
      dimension instanceof FieldDimension &&
      (dimension as any).isStringFieldName()
    ) {
      const sourceQuery = this.sourceQuery();
      if (sourceQuery) {
        const index = sourceQuery
          .columnNames()
          .indexOf((dimension as any).fieldIdOrName());
        if (index >= 0) {
          return sourceQuery.columnDimensions()[index];
        }
      }
    }
    return null;
  }

  /**
   * returns the original Table object at the beginning of the nested queries
   */
  rootTable(): TableClass {
    return this.rootQuery().table();
  }

  /**
   * returns the original Table ID at the beginning of the nested queries
   */
  rootTableId(): TableId {
    return this.rootQuery().sourceTableId();
  }

  setSourceQuery(
    sourceQuery: StructuredQueryClass | StructuredQueryObject
  ): StructuredQueryClass {
    if (sourceQuery instanceof StructuredQueryClass) {
      if (this.sourceQuery() === sourceQuery) {
        return this;
      }
      sourceQuery = sourceQuery.query();
    }
    // TODO: if the source query is modified in ways that make the parent query invalid we should "clean" those clauses
    // return this._updateQuery((query) =>
    //   chain(query)
    //     .dissoc("source-table")
    //     .assoc("source-query", sourceQuery)
    //     .value()
    // );
    return this._updateQuery((query) => {
      if (
        query['source-table'] !== undefined &&
        query['source-table'] !== null
      ) {
        delete query['source-table'];
      }
      query['source-query'] = sourceQuery as StructuredQuery;
      return query;
    });
  }

  queries() {
    const queries = [];
    for (let query = this; query; query = query.sourceQuery() as any) {
      queries.unshift(query);
    }
    return queries;
  }

  /**
   * Metadata this query needs to display correctly
   */
  dependentMetadata({ foreignTables = true } = {}) {
    const dependencies = [];
    function addDependency(dep) {
      //const existing = _.findWhere(dependencies, _.pick(dep, "type", "id"));
      const existing = dependencies.find(
        (a) => a.type === dep.type && a.id == dep.id
      );
      if (existing) {
        Object.assign(existing, dep);
      } else {
        dependencies.push(dep);
      }
    }

    // source-table, if set
    const tableId = this.sourceTableId();
    if (tableId) {
      addDependency({ type: 'table', id: tableId, foreignTables });
    }

    // any explicitly joined tables
    for (const join of this.joins()) {
      join.dependentMetadata().forEach(addDependency);
    }

    // parent query's table IDs
    const sourceQuery = this.sourceQuery();
    if (sourceQuery) {
      sourceQuery.dependentMetadata({ foreignTables }).forEach(addDependency);
    }

    return dependencies;
  }

  // INTERNAL

  _updateQuery(
    updateFunction: (
      query: StructuredQueryObject,
      ...args: any[]
    ) => StructuredQueryObject,
    args: any[] = []
  ): StructuredQueryClass {
    // return this.setDatasetQuery(
    //   updateIn(this._datasetQuery, ["query"], (query) =>
    //     updateFunction(query, ...args)
    //   )
    // );
    let tmp = this._datasetQuery as StructuredDatasetQuery;
    tmp.query = updateFunction(tmp.query, ...args);
    return this.setDatasetQuery(tmp);
  }
}

// subclass of StructuredQuery that's returned by query.sourceQuery() to allow manipulation of source-query
class NestedStructuredQuery extends StructuredQueryClass {
  _parent: StructuredQueryClass;

  constructor(question, datasetQuery, parent) {
    super(question, datasetQuery);
    this._parent = parent;
  }

  setDatasetQuery(datasetQuery: DatasetQuery): StructuredQueryClass {
    return new NestedStructuredQuery(
      this._originalQuestion,
      datasetQuery,
      this._parent
    );
  }

  parentQuery() {
    return this._parent.setSourceQuery(this.query());
  }
}
