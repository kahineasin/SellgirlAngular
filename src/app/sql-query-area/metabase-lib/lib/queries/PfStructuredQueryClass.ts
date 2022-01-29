/**
 * Represents a structured MBQL query.
 */

//import { PfUtil } from "../../../../../../../core/common/pfUtil";
import { PfUtil } from '../../../../common/pfUtil';
import { DatasetQuery } from '../../../model/Card';
import { Field } from '../../../model/Field';
import { Table } from '../../../model/Table';
import FieldClass from '../metadata/FieldClass';
import MetadataClass from '../metadata/Metadata';
import PfMetadataClass from '../metadata/PfMetadataClass';
import TableClass from '../metadata/TableClass';
import StructuredQueryClass from './StructuredQueryClass';

/**
 * 我扩展metabase方法的类--benjamin
 * A wrapper around an MBQL (`query` type @type {DatasetQuery}) object
 */
export default class PfStructuredQueryClass extends StructuredQueryClass {
  private pfUtil: PfUtil = null;
  constructor(
    // question: Question,//benjamin todo
    question: any, //
    datasetQuery: DatasetQuery
    //private pfUtil: PfUtil
  ) {
    super(question, datasetQuery);
    this.pfUtil = new PfUtil();
  }
  //下面的方法都是因为未成功移植metabase的metadata的保存优化方法,见frontend\src\metabase\selectors\metadata.js
  addFields(fields: Field[]) {
    const me = this;
    if (me.pfUtil.isAnyNull(me._metadata)) {
      me._metadata = new PfMetadataClass();
    }
    me._metadata.addFields(fields);
    // if (me.pfUtil.isAnyNull(me._metadata.fields)) {
    //   me._metadata.fields = [];
    // }
    // for (let i = 0; i < fields.length; i++) {
    //   //if (me._metadata.fields.hasOwnProperty(i)) {
    //   const column = fields[i];
    //   // me._metadata.fields[column.id] = new FieldClass({
    //   //   ...column,
    //   //   // id: ["field-literal", column.name, column.base_type],
    //   //   // source: "fields",
    //   //   // // HACK: need to thread the query through to this fake Field
    //   //   // query: this,
    //   // });
    //   me._metadata.fields[column.id] = Object.assign(new FieldClass(), column);
    //   //}
    // }
  }
  public addTables(tables: Table[]) {
    const me = this;
    if (me.pfUtil.isAnyNull(me._metadata)) {
      me._metadata = new PfMetadataClass();
    }
    me._metadata.addTables(tables);
    // if (me.pfUtil.isAnyNull(me._metadata.tables)) {
    //   me._metadata.tables = [];
    // }
    // for (let i = 0; i < tables.length; i++) {
    //   //if (me._metadata.tables.hasOwnProperty(i)) {
    //   let table = tables[i];
    //   // debugger;
    //   // // let tableClass = new TableClass({
    //   // //   ...table,
    //   // //   //fields: table.fields,
    //   // // });
    //   // let tableClass = Object.assign(new TableClass(), table);
    //   // debugger;
    //   // me._metadata.tables[table.id] = tableClass;
    //   let fields = table.fields.map((a) => Object.assign(new FieldClass(), a));
    //   //debugger;
    //   me._metadata.tables[table.id] = Object.assign(new TableClass(), table, {
    //     db: {
    //       id: table.db_id,
    //     },
    //     fields: fields,
    //   });
    //   //}
    // }
  }
  public getTables(iteratee?: (value: TableClass) => boolean): TableClass[] {
    const me = this;
    if (me.pfUtil.isAnyNull(me._metadata)) {
      return null;
    }
    if (me.pfUtil.isAnyNull(me._metadata.tables)) {
      return null;
    }
    let r = [];
    for (var i in me._metadata.tables) {
      if (
        me._metadata.tables.hasOwnProperty(i) &&
        iteratee(me._metadata.tables[i])
      ) {
        r.push(me._metadata.tables[i]);
      }
    }
    return r;
  }
}
