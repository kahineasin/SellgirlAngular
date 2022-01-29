export interface IStructuredQuery {
  //----------------------src\app\sql-query-area\metabase-lib\lib\queries\Query.ts 里面实现的方法
  question(): any;

  //init(): IStructuredQuery;
  init(
    question: any, //
    datasetQuery: any
  ): IStructuredQuery;
  metadata(): any;

  table(): any;
  parseFieldReference(fieldRef): any;
  dimensions(): any;
  joins(): any;
  database(): any;
  updateJoin(index, join): any;
  dependentMetadata(obj: any): any;
  formatExpression(obj: any): any;
  removeAggregation(index: number): IStructuredQuery;
  updateAggregation(index: number, aggregation: any): IStructuredQuery;
  clean(): IStructuredQuery;
  removeJoin(index): IStructuredQuery;
  aggregate(aggregation: any): IStructuredQuery;
  isValid(): boolean;
  aggregationOperators(): any[];
}
