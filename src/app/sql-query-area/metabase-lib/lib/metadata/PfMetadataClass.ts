//import _ from "underscore";

//import Base from './Base';
import FieldClass from './FieldClass';
import TableClass from './TableClass';
import MetadataClass from './Metadata';
import { Field } from '../../../model/Field';
//import { PfUtil } from "../../../../../../../core/common/pfUtil";
import { Table } from '../../../model/Table';
import { Database } from '../../../model/Database';
import DatabaseClass from './DatabaseClass';
import PfDatabaseClass from './PfDatabaseClass';
import { PfUtil } from '../../../../common/pfUtil';

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
export default class PfMetadataClass extends MetadataClass {
  private pfUtil: PfUtil = new PfUtil();
  constructor(object = {}) {
    super((object = {}));
    super.initPropertyByObject(object);
  }
  //下面的方法都是因为未成功移植metabase的metadata的保存优化方法,见frontend\src\metabase\selectors\metadata.js
  addFields(fields: Field[]) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.fields)) {
      me.fields = {};
    }
    for (let i = 0; i < fields.length; i++) {
      const column = fields[i];
      me.fields[column.id] = Object.assign(new FieldClass(), column);
    }
  }
  public addTables(tables: Table[]) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.tables)) {
      me.tables = {};
    }
    for (let i = 0; i < tables.length; i++) {
      let table = tables[i];
      let fields = table.fields.map((a) => Object.assign(new FieldClass(), a));
      me.tables[table.id] = Object.assign(new TableClass(), table, {
        db: Object.assign(new PfDatabaseClass(), {
          id: table.db_id,
        }),
        fields: fields,
      });
    }
  }
  public addDatabases(databases: Database[]) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.databases)) {
      me.databases = {};
    }
    for (let i = 0; i < databases.length; i++) {
      let database = databases[i];
      //let fields = table.fields.map((a) => Object.assign(new FieldClass(), a));
      me.databases[database.id] = Object.assign(new DatabaseClass(), database, {
        // db: Object.assign(new PfDatabaseClass(), {
        //   id: table.db_id,
        // }),
        // fields: fields,
      });
    }
  }
}
