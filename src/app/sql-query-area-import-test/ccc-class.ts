import * as Table from "../sql-query-area/lib/query/table"; //这个可能有重名风险
import { QField as FieldReference } from "../sql-query-area/model/Query"; //应该ok

export function isRegularField(field: FieldReference): boolean {
  return typeof field === "number";
}
export function getFieldTarget(field, tableDef, path = []) {
  return Table.getField(tableDef, field);
}
