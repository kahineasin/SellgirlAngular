export interface IField {
  // key: string;
  id: any;
  name: string;
  display_name: string;
  description: string;
  // age: number;
  // address: string;
  //xxx: string;
  init(): IField;
  init(obj): IField;
  filterOperator(operatorName);
  isDate(): boolean;
  aggregationOperators(): any[];
  displayName();
  icon(): any;
  isCoordinate(): boolean;
}
