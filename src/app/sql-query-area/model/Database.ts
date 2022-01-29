//import type { ISO8601Time } from ".";
import type { Table } from "./Table";

export type DatabaseId = number;

/**
 * mysql
mysql
sqlserver
h2
sqlserver
mysql
sqlserver
mysql
 */
export type DatabaseType = string; // "h2" | "postgres" | etc

export type DatabaseFeature =
  | "basic-aggregations"
  | "standard-deviation-aggregations"
  | "expression-aggregations"
  | "foreign-keys"
  | "native-parameters"
  | "nested-queries"
  | "expressions"
  | "case-sensitivity-string-filter-options"
  | "binning"
  //下面是在实际中看见有此类型,我加的--benjamin 20220107
  | "right-join"
  | "left-join"
  | "inner-join"
  | "advanced-math-expressions";

export type DatabaseDetails = {
  [key: string]: any;
};

export type DatabaseEngine = string;

export type DatabaseNativePermission = "write" | "read";

export type Database = {
  id: DatabaseId;
  name: string;
  description: string;

  tables: Table[];

  /**
   * 格式如{"host":"tidb-cluster2-tidb.marathon.l4lb.thisdcos.directory","port":4000,"dbname":"finance","user":"root","password":"perfectTIDB","ssl":false,"additional-options":null,"tunnel-enabled":false}
   */
  details: DatabaseDetails;
  engine: DatabaseType;
  features: DatabaseFeature[];
  is_full_sync: boolean;
  is_sample: boolean;
  native_permissions: DatabaseNativePermission;

  caveats: string;
  points_of_interest: string;

  // created_at: ISO8601Time;
  // updated_at: ISO8601Time;
};
