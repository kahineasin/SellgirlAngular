/* @flow weak */

import Base from "./Base";
import DatabaseClass from "./DatabaseClass";
import TableClass from "./TableClass";

//import { titleize, humanize } from "../../../lib/formatting";

/**
 * Wrapper class for a {@link Database} schema. Contains {@link Table}s.
 */
export default class Schema extends Base {
  database: DatabaseClass;
  tables: TableClass[];

  public name: any = null;
  constructor(object = {}) {
    super((object = {}));
    super.initPropertyByObject(object);
  }

  displayName() {
    // return titleize(humanize(this.name));
    return this.name;
  }
}
