import Query from "./Query";
import type TableClass from "../metadata/TableClass";
import type { DatabaseEngine, DatabaseId } from "../../../model/Database";
import type DatabaseClass from "../metadata/DatabaseClass";

/**
 * A query type for queries that are attached to a specific database table
 * and form a single MBQL / native query clause
 */
export default class AtomicQuery extends Query {
  /**
   * Tables this query could use, if the database is set
   */
  tables(): TableClass[] {
    return null;
  }

  databaseId(): DatabaseId {
    return null;
  }

  database(): DatabaseClass {
    return null;
  }

  engine(): DatabaseEngine {
    return null;
  }
}
