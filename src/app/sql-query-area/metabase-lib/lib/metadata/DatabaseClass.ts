/* @flow weak */

//import Question from "../Question";

import Base from "./Base";
import TableClass from "./TableClass";
import Schema from "./Schema";

//import { generateSchemaId } from "../../../metabase/schema";

// import type { SchemaName } from "metabase/meta/types/Table";
// import type { DatabaseFeature } from "metabase/meta/types/Database";
import type { SchemaName } from "../../../model/Table";
import type { DatabaseFeature } from "../../../model/Database";

type VirtualDatabaseFeature = "join";

/**
 * Wrapper class for database metadata objects. Contains {@link Schema}s, {@link Table}s, {@link Metric}s, {@link Segment}s.
 *
 * Backed by types/Database data structure which matches the backend API contract
 */
export default class DatabaseClass extends Base {
  // TODO Atte Keinänen 6/11/17: List all fields here (currently only in types/Database)

  name: string;
  description: string;

  tables: TableClass[];
  schemas: Schema[];

  auto_run_queries: boolean;

  //为了解决报错，加的属性--benjamin
  public metadata: any = null;
  public features: DatabaseFeature[] = [];
  public id: any = null;
  public is_saved_questions: any = null;

  displayName(): string {
    return this.name;
  }

  // schema(schemaName: SchemaName) {
  //   return this.metadata.schema(generateSchemaId(this.id, schemaName));
  // }

  schemaNames(): SchemaName[] {
    return this.schemas.map((s) => s.name).sort((a, b) => a.localeCompare(b));
  }

  hasFeature(
    feature: null | DatabaseFeature | VirtualDatabaseFeature
  ): boolean {
    if (!feature) {
      return true;
    }
    const set = new Set(this.features as string[]);
    if (feature === "join") {
      return (
        set.has("left-join") ||
        set.has("right-join") ||
        set.has("inner-join") ||
        set.has("full-join")
      );
    } else {
      return set.has(feature);
    }
  }

  // newQuestion(): Question {
  //   return this.question().setDefaultQuery().setDefaultDisplay();
  // }

  // question(query = { "source-table": null }): Question {
  //   return Question.create({
  //     metadata: this.metadata,
  //     dataset_query: {
  //       database: this.id,
  //       type: "query",
  //       query: query,
  //     },
  //   });
  // }

  // nativeQuestion(native = {}): Question {
  //   return Question.create({
  //     metadata: this.metadata,
  //     dataset_query: {
  //       database: this.id,
  //       type: "native",
  //       native: {
  //         query: "",
  //         "template-tags": {},
  //         ...native,
  //       },
  //     },
  //   });
  // }

  // nativeQuery(native) {
  //   return this.nativeQuestion(native).query();
  // }

  /** Returns a database containing only the saved questions from the same database, if any */
  savedQuestionsDatabase(): DatabaseClass {
    return this.metadata.databasesList().find((db) => db.is_saved_questions);
  }
}
