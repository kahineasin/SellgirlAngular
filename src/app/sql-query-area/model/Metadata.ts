// Legacy "tableMetadata" etc

import type { Database, DatabaseId } from './Database';
import type { Table, TableId } from './Table';
import type { Field, FieldId } from './Field';
import type { Segment, SegmentId } from './Segment';
import type { Metric, MetricId } from './Metric';
//import Dimension from "../metabase-lib/lib/Dimension";//发现还是这个有问题

export type Metadata = {
  databases: { [id: number]: DatabaseMetadata }; //DatabaseId
  tables: { [id: number]: TableMetadata }; //TableId
  fields: { [id: number]: FieldMetadata }; //FieldId
  // metrics: { [id: MetricId]: MetricMetadata };
  metrics: { [id: number]: MetricMetadata };
  // segments: { [id: SegmentId]: SegmentMetadata };
  segments: { [id: number]: SegmentMetadata };
};

export type DatabaseMetadata = Database & {
  tables: TableMetadata[];
  tables_lookup: { [id: number]: TableMetadata }; //TableId
};

export type TableMetadata = Table & {
  db: DatabaseMetadata;

  fields: FieldMetadata[];
  fields_lookup: { [id: number]: FieldMetadata }; //FieldId

  segments: SegmentMetadata[];
  metrics: MetricMetadata[];

  aggregation_operators: AggregationOperator[];
};

export type FieldMetadata = Field & {
  table: TableMetadata;
  target: FieldMetadata;

  filter_operators: FilterOperator[];
  filter_operators_lookup: { [key: string]: FilterOperator }; //FilterOperatorName
};

export type SegmentMetadata = Segment & {
  table: TableMetadata;
};

export type MetricMetadata = Metric & {
  table: TableMetadata;
};

export type FieldValue = {
  name: string;
  key: string;
};

export type FilterOperatorName = string;

export type FilterOperator = {
  name: FilterOperatorName;
  verboseName: string;
  moreVerboseName: string;
  fields: FilterOperatorField[];
  multi: boolean;
  placeholders?: string[];
  validArgumentsFilters: ValidArgumentsFilter[];
};

export type FilterOperatorField = {
  type: string;
  values: FieldValue[];
};

export type ValidArgumentsFilter = (field: Field, table: Table) => boolean;

type FieldsFilter = (fields: Field[]) => Field[];

export type AggregationOperator = {
  columnName: any; //metabase-lib\lib\queries\structured\Aggregation.ts中用到此属性，但metabase源码中却没有
  name: string;
  short: string;
  fields: Field[];
  validFieldsFilters: FieldsFilter[];
};

export type FieldOptions = {
  count: number;
  fields: Field[];
  fks: {
    field: Field;
    fields: Field[];
  };
};

export type DimensionOptions = {
  count: number;
  dimensions: any[]; //Dimension[];
  fks: Array<{
    field: FieldMetadata;
    dimensions: any[]; // Dimension[];
  }>;
};
