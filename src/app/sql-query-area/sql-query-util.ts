import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { PfUtil } from '../common/pfUtil';
import { PageResult } from '../service/app-reference.service';
import {
  DatabaseModel,
  DataColumnModel,
  DataColumnUIModel,
  DatamodelQuery,
  DataTableModel,
  DataTableUIModel,
} from '../model/data-integration';
import { ComputesReferenceService } from '../service/computes-reference.service';
// import DatabaseClass from "./metabase-lib/lib/metadata/DatabaseClass";
// import FieldClass from "./metabase-lib/lib/metadata/FieldClass";
// import MetadataClass from "./metabase-lib/lib/metadata/Metadata";
import PfDatabaseClass from './metabase-lib/lib/metadata/PfDatabaseClass';
import PfMetadataClass from './metabase-lib/lib/metadata/PfMetadataClass';
import TableClass from './metabase-lib/lib/metadata/TableClass';
import PfQuestion from './metabase-lib/lib/PfQuestion';
import PfStructuredQueryClass from './metabase-lib/lib/queries/PfStructuredQueryClass';
import { Card, DatasetQuery } from './model/Card';
import { Database } from './model/Database';
import { Field } from './model/Field';

import { ConcreteField, FieldLiteral, StructuredQuery } from './model/Query';
import { Table } from './model/Table';
//import { KeyValuePairT } from "./step/filter-step/filter-step.component";

export class KeyValuePairT<TK, TV> {
  constructor(public key: TK, public value: TV) {}
}

/**
 * 这里引用computer的model和server,所以不要反过来又引用了
 */
@Injectable({
  providedIn: 'root',
})
export class SqlQueryUtil {
  constructor(
    private pfUtil: PfUtil,
    private reference: ComputesReferenceService
  ) {}

  public isFilterMatchField(
    field: ConcreteField,
    column: DataColumnModel,
    table: DataTableModel
  ): boolean {
    const me = this;
    if (me.pfUtil.isAnyNull(field)) {
      return false;
    }
    if ('field-id' === field[0]) {
      return column.ShortId === field[1];
    }
    if ('joined-field' === field[0]) {
      return column.ShortId === field[2][1];
    }
    return false;
  }
  // public getShortFilterByField(
  //   column: DataColumnModel,
  //   table: DataTableModel,
  //   fieldList: KeyValuePairT<DataTableModel, DataColumnModel[]>[]
  // ): ConcreteField {
  //   const me = this;
  //   if (column === null || me.pfUtil.isListEmpty(fieldList)) {
  //     return null;
  //   }
  //   // if (table.ShortId === fieldList[0].key.ShortId) {
  //   //   return ["field-id", column.ShortId];
  //   // }
  //   const item = fieldList.find((a) => a.key.ShortId === table.ShortId);
  //   //.value.find(a=>a.ShortId===column.ShortId)
  //   if (!me.pfUtil.isAnyNull( item)) {
  //     return ["joined-field", table.TableName, ["field-id", column.ShortId]];
  //   }
  //   return null;
  // }

  /**
   * @deprecated 其实不需要fieldList参数,改用 getFilterByColumn()方法
   * @param column
   * @param table
   * @param fieldList
   * @returns
   */
  public getFilterByField(
    column: DataColumnModel,
    table: DataTableUIModel,
    fieldList: KeyValuePairT<DataTableModel, DataColumnModel[]>[]
  ): ConcreteField {
    const me = this;
    if (column === null || me.pfUtil.isListEmpty(fieldList)) {
      return null;
    }
    // if (table.ShortId === fieldList[0].key.ShortId) {
    //   return ["field-id", column.ShortId];
    // }
    // // if (table.ShortId === fieldList[0].key.ShortId) {
    // //   return ["joined-field", table.TableName, ["field-id", column.ShortId]];
    // // }
    if (table.TableName === table.TableIdxName) {
      return ['field-id', column.ShortId];
    }
    const item = fieldList.find((a) => a.key.ShortId === table.ShortId);
    // const item = fieldList.find(
    //   (a) => a.key.TableShortId === table.TableShortId
    // );
    //.value.find(a=>a.ShortId===column.ShortId)
    if (item !== null && item !== undefined) {
      // return ["joined-field", table.TableName, ["field-id", column.ShortId]];
      return ['joined-field', table.TableIdxName, ['field-id', column.ShortId]];
    }
    return null;
  }

  public getFilterByColumn(
    column: DataColumnModel,
    table: DataTableUIModel
  ): ConcreteField {
    const me = this;
    if (me.pfUtil.isAnyNull(table)) {
      return null;
    }

    if (table.isJoinedTable) {
      return ['joined-field', table.TableIdxName, ['field-id', column.ShortId]];
    } else {
      return ['field-id', column.ShortId];
    }
  }
  public getJoinFilterByColumn(
    column: DataColumnModel,
    table: DataTableUIModel
  ): ConcreteField {
    const me = this;
    if (me.pfUtil.isAnyNull(column, table)) {
      return null;
    }
    //return ["joined-field", table.TableName, ["field-id", column.ShortId]];
    return ['joined-field', table.TableIdxName, ['field-id', column.ShortId]];
  }
  public getFieldByFilter(
    field: ConcreteField,
    fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[]
  ): KeyValuePairT<DataTableUIModel, DataColumnModel> {
    const me = this;
    if (
      field === undefined ||
      undefined === fieldList ||
      null === fieldList ||
      fieldList.length < 1
    ) {
      //console.info("fieldList is null");
      return null;
    }
    //console.info("fieldList is not null");
    //debugger;
    if ('field-id' === field[0]) {
      if (fieldList.length > 0) {
        let f = fieldList[0].value.find((a) => a.ShortId === field[1]);
        if (f !== null && f !== undefined) {
          return new KeyValuePairT<DataTableUIModel, DataColumnModel>(
            fieldList[0].key,
            f
          );
        }
      }
    } else if ('joined-field' === field[0]) {
      // field[1] }}.{{ field[2][1]
      //if (fieldList.length > 1) {
      if (fieldList.length > 0) {
        //let t = fieldList.find((a) => a.key.ShortId === field[1]);
        //let t = fieldList.find((a) => a.key.TableName === field[1]);
        let t = fieldList.find(
          (a) => a.key.TableIdxName === field[1]
          // || a.key.TableName === field[1] //
        );
        if (t !== null && t !== undefined) {
          let f = t.value.find((a) => a.ShortId === field[2][1]);
          if (f !== null && f !== undefined) {
            return new KeyValuePairT<DataTableUIModel, DataColumnModel>(
              t.key,
              f
            );
          }
        }
      }
    }
  }
  public isLiteralField(field: ConcreteField) {
    return 'field-literal' === field[0];
  }
  public getLiteralFieldName(field: ConcreteField) {
    return field[1];
  }
  public isLiteralFieldEqual(l: ConcreteField, r: ConcreteField) {
    const me = this;
    return me.isLiteralField(l) && me.isLiteralField(r) && l[1] === r[1];
  }
  public getFieldFullName(
    field: ConcreteField,
    fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[]
  ) {
    const me = this;
    if ('field-literal' === field[0]) {
      return field[1];
    }
    if (me.pfUtil.isListEmpty(fieldList)) {
      return '';
    }
    const f = me.getFieldByFilter(field, fieldList);
    if (f !== null && f !== undefined) {
      if ('field-id' === field[0]) {
        return f.value.ColumnName;
      } else if ('joined-field' === field[0]) {
        //return f.key.TableName + "." + f.value.ColumnName;
        return f.key.TableIdxName + '.' + f.value.ColumnName;
      }
    }
    return '';
  }
  /**
   * [field-id]、[joined-field]获得显示的列名
   * @param field
   * @param fieldList
   * @returns
   */
  public getFieldName(
    field: ConcreteField,
    fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[]
  ) {
    const me = this;
    if ('field-literal' === field[0]) {
      return field[1];
    }
    if (undefined === fieldList || null === fieldList || fieldList.length < 1) {
      //console.info("fieldList is null");
      return '';
    }
    const f = me.getFieldByFilter(field, fieldList);
    if (f !== null && f !== undefined) {
      if ('field-id' === field[0]) {
        return f.value.ColumnName;
      } else if ('joined-field' === field[0]) {
        return f.value.ColumnName;
      }
    }
    return '';
  }

  /**
   * 没有对应字段的汇总方式
   * @param t
   * @returns
   */
  public isAggregationNoField(t: string) {
    const me = this;
    return ['count', 'cum-count'].indexOf(t) > -1;
  }
  public isMainTableField(arr) {
    const me = this;
    if (me.pfUtil.isAnyNull(arr)) {
      return false;
    }
    return 'field-id' === arr[0];
  }
  /**
   * 是否聚合运算
   * @param arr
   * @returns
   */
  public isAggregationOptions(arr) {
    const me = this;
    return 'aggregation-options' === arr[0];
  }
  /**
   * 只有当层有source-query属性时使用此方法
   * 保证字段不重名的原则:
   * 1.不能有一条从 内层->外层 一直保持用同1个名的线路
   * 2.每1层之中不能有重名
   * @param databaseId
   * @param query
   */
  public getSourceQueryOutFields(
    databaseId: number,
    query: StructuredQuery
  ): Observable<FieldLiteral[]> {
    const me = this;
    // let innerQuery = query; //最内一层
    // while (me.pfUtil.isAnyNull(innerQuery["source-table"])) {
    //   innerQuery = innerQuery["source-query"];
    // }
    const observable = new Observable<FieldLiteral[]>((subscriber) => {
      let childQuery = query['source-query'];
      let r: FieldLiteral[] = [];
      if (me.pfUtil.isAnyNull(childQuery)) {
        subscriber.next(r);
        return;
      }

      me.queryFields(databaseId, childQuery).subscribe((response) => {
        if (!me.pfUtil.isAnyNull(childQuery.breakout)) {
          for (let i = 0; i < childQuery.breakout.length; i++) {
            if (me.isLiteralField(childQuery.breakout[i])) {
              r.push([
                'field-literal',
                //"o_" + childQuery.breakout[i][1],
                'FIELD_' + childQuery.breakout[i][1],
                childQuery.breakout[i][2],
              ]); // type/DateTime "type/Text"
            } else {
              let tmpField = me.getFieldByFilter(
                childQuery.breakout[i],
                response
              );
              if (me.pfUtil.isAnyNull(tmpField)) {
                //暂不知道什么情况下会是空值
                // debugger;
              } else {
                r.push([
                  'field-literal',
                  //"o_" + tmpField.value.ColumnName,
                  'FIELD_' + tmpField.value.ColumnName,
                  me.getMetabaseBaseType(tmpField.value.DataType), //这里的dataType应该需要转换为metabase的--benjamin todo
                ]); // type/DateTime "type/Text"
              }
            }
          }
        }
        if (!me.pfUtil.isAnyNull(childQuery.aggregation)) {
          for (let i = 0; i < childQuery.aggregation.length; i++) {
            if (me.isAggregationOptions(childQuery.aggregation[i])) {
              r.push([
                'field-literal',
                childQuery.aggregation[i][2]['display-name'],
                'type/Integer', //看一看metabase是怎么计算自定义汇总的字段类型的,猜想应该是通过第1个运算--benjamin todo
              ]);
            } else if (me.isAggregationNoField(childQuery.aggregation[i][0])) {
              r.push([
                'field-literal',
                childQuery.aggregation[i][0].toUpperCase(),
                'type/Integer',
              ]);
            } else {
              //if (me.isLiteralField(childQuery.aggregation[i])) {
              if (me.isLiteralField(childQuery.aggregation[i][1])) {
                r.push([
                  'field-literal',
                  childQuery.aggregation[i][0].toUpperCase() +
                    '_' +
                    childQuery.aggregation[i][1][1],
                  childQuery.aggregation[i][1][2],
                ]); // type/DateTime "type/Text"
              } else {
                let tmpField = me.getFieldByFilter(
                  childQuery.aggregation[i][1],
                  response
                );
                // if (me.isAggregationNoField(childQuery.aggregation[i][0])) {
                //   r.push([
                //     "field-literal",
                //     childQuery.aggregation[i][0].toUpperCase(),
                //     "type/Integer",
                //   ]);
                // } else {
                r.push([
                  'field-literal',
                  childQuery.aggregation[i][0].toUpperCase() +
                    '_' +
                    tmpField.value.ColumnName,
                  me.getMetabaseBaseType(tmpField.value.DataType), //这里的dataType应该需要转换为metabase的--benjamin todo
                ]); // type/DateTime "type/Text"
                // }
              }
            }
          }
        }
        if (!me.pfUtil.isAnyNull(childQuery.expressions)) {
          for (let key in childQuery.expressions) {
            //console.log(key + ‘—’ + obj[key])
            r.push([
              'field-literal',
              //"o_" + childQuery.breakout[i][1],
              //"FIELD_" + key, //这里一定要加前缀,否则会重名
              key, //这里一定要加前缀,否则会重名
              'type/*',
            ]); // type/DateTime "type/Text"
          }
        }
        subscriber.next(r);
      });
    });
    return observable;
  }

  /**
   * 此方法的作用类似updateTable,但此方法方便可以异步等待
   * @param tableId
   * @returns
   */
  // public queryFields(databaseId: number, tableId: number[]) {
  public queryFields(
    databaseId: number,
    query: StructuredQuery
  ): Observable<KeyValuePairT<DataTableUIModel, DataColumnModel[]>[]> {
    const me = this;
    //let tableIds: number[] = [];
    //key:tableId,value:isJoined
    let tableIds: KeyValuePairT<number, boolean>[] = [];
    //let tableIds: KeyValuePairT<number, any>[] = [];
    //字段由3部分组成
    //1.source-table
    let mainTableId: number = null;
    if (query['source-table'] != null) {
      //tableIds.push(query["source-table"]);
      tableIds.push({ key: query['source-table'], value: false });
      //tableIds.push({ key: query["source-table"], value: {isJoinedTable:false} });
      mainTableId = query['source-table'];
    }
    //2.join
    if (query.joins != null) {
      for (let i = 0; i < query.joins.length; i++) {
        //tableIds.push(query.joins[i]["source-table"]);
        tableIds.push({ key: query.joins[i]['source-table'], value: true });
        //tableIds.push({ key: query.joins[i]["source-table"], value: true });
      }
    }
    // //3.source-query(内部嵌套的聚合字段)
    // if(!me.pfUtil.isAnyNull(query["source-query"])){

    // }

    let r: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = [];
    const observable = new Observable<
      KeyValuePairT<DataTableUIModel, DataColumnModel[]>[]
    >((subscriber) => {
      if (me.pfUtil.isListEmpty(tableIds)) {
        subscriber.next(r);
      } else {
        const ro = new Observable<
          KeyValuePairT<DataTableModel, DataColumnModel[]>
        >((rSubscriber) => {
          //me.reference.getDataTableList(query.database).subscribe((response) => {
          me.reference.getDataTableList(databaseId).subscribe((response) => {
            //这样无法区分主表和joined表
            // let tableList = response.DataSource.filter(
            //   (t) => tableIds.indexOf(t.ShortId) > -1
            // );
            let tableList = response.DataSource.filter(
              (t) => tableIds.findIndex((a) => a.key == t.ShortId) > -1
            );
            // let tableList: DataTableModel[] = [];
            // tableIds.forEach((element) => {
            //   let item = response.DataSource.find(
            //     (a) => a.ShortId === element.key
            //   );
            //   if (!me.pfUtil.isAnyNull(item)) {
            //     item.isJoinedTable = element.value;
            //     tableList.push(item);
            //   }
            // });
            //debugger;
            let oList: Observable<boolean>[] = [];
            tableList.map((a) => {
              const tmpO = new Observable<boolean>((subscriber2) => {
                me.reference
                  .getDataColumnPageList(a.ShortId)
                  .subscribe((response2) => {
                    r.push(
                      new KeyValuePairT<DataTableUIModel, DataColumnModel[]>(
                        a,
                        response2.DataSource
                      )
                    );
                    subscriber2.next(true);
                    subscriber2.complete();
                  });
              });
              oList.push(tmpO);
            });
            forkJoin(oList).subscribe(
              (a) => {
                //这里有些奇怪，只有当aa和bb的observer.complete()执行完才会进入这里（一般会误以为是next执行完就进来吧）
                rSubscriber.next(null);
              },
              (e) => {
                debugger;
              }
            );
          });
        });
        ro.subscribe(
          (a) => {
            //这里实际是等待完成的,但返回用next,所以这里的参数a没有使用到
            //debugger;
            if (r !== null && r !== undefined) {
              //结果要按tableId来排列(便于后面把第0项识别为主表)(这样排序其实有问题,当tableId有重复的(如本表join本表),这样就不行了,也许没问题,返回结果反正是要不重复的结果吧(因为是下拉用的))
              // r = r.sort(function (a, b) {
              //   return (
              //     tableIds.indexOf(a.key.ShortId) -
              //     tableIds.indexOf(b.key.ShortId)
              //   );
              // });

              ////改为push时按顺序
              let tableList: KeyValuePairT<
                DataTableUIModel,
                DataColumnModel[]
              >[] = [];
              // let existTableName: KeyValuePairT<number, number>[] =
              //   tableIds.map((b) => {
              //     return { key: b.key, value: 0 };
              //   });
              let existTableName: KeyValuePairT<number, number>[] = [];
              tableIds.forEach((element) => {
                let item = r.find((a) => a.key.ShortId === element.key);
                if (!me.pfUtil.isAnyNull(item)) {
                  item.key.isJoinedTable = element.value;
                  //debugger;
                  let tmpTable: DataTableUIModel = { ...item.key };
                  let existTable = existTableName.find(
                    (b) => b.key === tmpTable.ShortId
                  );
                  if (!me.pfUtil.isAnyNull(existTable)) {
                    tmpTable.TableIdxName =
                      tmpTable.TableName + '_' + (existTable.value + 1);
                    //debugger;
                    existTable.value++;
                  } else {
                    tmpTable.TableIdxName = tmpTable.TableName;
                    existTableName.push({ key: tmpTable.ShortId, value: 1 });
                  }
                  tableList.push(
                    new KeyValuePairT<DataTableUIModel, DataColumnModel[]>(
                      tmpTable, //主表有可能出现多次,要复制避免引用
                      item.value
                    )
                  );
                }
              });
              if (tableList.length > 0) {
                tableList[0].key.isMenuOpened = true;
              }
              //debugger;
              r = tableList;
            }
            // if (!me.pfUtil.isListEmpty(r)) {
            //   for (let i = 0; i < r.length; i++) {
            //     r[i].key.isJoinedTable = true;
            //   }
            //   if (
            //     mainTableId !== null &&
            //     tableIds.filter((a) => a === mainTableId).length > 1
            //   ) {
            //     let tmp = r[0];
            //     r.splice(0, 0, tmp);
            //     r[0].key.isJoinedTable = false;
            //     //当join中也存在主表时
            //   } else {
            //     r[0].key.isJoinedTable = false;
            //   }
            // }
            subscriber.next(r); //rSubscriber.next(null)运行之后进入本句.本句执行完之后会触发queryFields()返回值里的next事件
          },
          (e) => {
            debugger;
          }
        );
      }
    });
    return observable;
  }
  public doQueryFields(
    databaseId: number,
    mainTableId: number,
    tableIds: KeyValuePairT<number, boolean>[]
    //query: StructuredQuery
  ): Observable<KeyValuePairT<DataTableUIModel, DataColumnModel[]>[]> {
    const me = this;
    // //let tableIds: number[] = [];
    // //key:tableId,value:isJoined
    // let tableIds: KeyValuePairT<number, boolean>[] = [];
    // //let tableIds: KeyValuePairT<number, any>[] = [];
    // //字段由3部分组成
    // //1.source-table
    // let mainTableId: number = null;
    // if (query["source-table"] != null) {
    //   //tableIds.push(query["source-table"]);
    //   tableIds.push({ key: query["source-table"], value: false });
    //   //tableIds.push({ key: query["source-table"], value: {isJoinedTable:false} });
    //   mainTableId = query["source-table"];
    // }
    // //2.join
    // if (query.joins != null) {
    //   for (let i = 0; i < query.joins.length; i++) {
    //     //tableIds.push(query.joins[i]["source-table"]);
    //     tableIds.push({ key: query.joins[i]["source-table"], value: true });
    //     //tableIds.push({ key: query.joins[i]["source-table"], value: true });
    //   }
    // }
    // // //3.source-query(内部嵌套的聚合字段)
    // // if(!me.pfUtil.isAnyNull(query["source-query"])){

    // // }

    let r: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = [];
    const observable = new Observable<
      KeyValuePairT<DataTableUIModel, DataColumnModel[]>[]
    >((subscriber) => {
      if (me.pfUtil.isListEmpty(tableIds)) {
        subscriber.next(r);
      } else {
        const ro = new Observable<
          KeyValuePairT<DataTableModel, DataColumnModel[]>
        >((rSubscriber) => {
          //me.reference.getDataTableList(query.database).subscribe((response) => {
          me.reference.getDataTableList(databaseId).subscribe((response) => {
            //这样无法区分主表和joined表
            // let tableList = response.DataSource.filter(
            //   (t) => tableIds.indexOf(t.ShortId) > -1
            // );
            let tableList = response.DataSource.filter(
              (t) => tableIds.findIndex((a) => a.key == t.ShortId) > -1
            );
            // let tableList: DataTableModel[] = [];
            // tableIds.forEach((element) => {
            //   let item = response.DataSource.find(
            //     (a) => a.ShortId === element.key
            //   );
            //   if (!me.pfUtil.isAnyNull(item)) {
            //     item.isJoinedTable = element.value;
            //     tableList.push(item);
            //   }
            // });
            //debugger;
            let oList: Observable<boolean>[] = [];
            tableList.map((a) => {
              const tmpO = new Observable<boolean>((subscriber2) => {
                me.reference
                  .getDataColumnPageList(a.ShortId)
                  .subscribe((response2) => {
                    r.push(
                      new KeyValuePairT<DataTableUIModel, DataColumnModel[]>(
                        a,
                        response2.DataSource
                      )
                    );
                    subscriber2.next(true);
                    subscriber2.complete();
                  });
              });
              oList.push(tmpO);
            });
            forkJoin(oList).subscribe(
              (a) => {
                //这里有些奇怪，只有当aa和bb的observer.complete()执行完才会进入这里（一般会误以为是next执行完就进来吧）
                rSubscriber.next(null);
              },
              (e) => {
                debugger;
              }
            );
          });
        });
        ro.subscribe(
          (a) => {
            //这里实际是等待完成的,但返回用next,所以这里的参数a没有使用到
            //debugger;
            if (r !== null && r !== undefined) {
              //结果要按tableId来排列(便于后面把第0项识别为主表)(这样排序其实有问题,当tableId有重复的(如本表join本表),这样就不行了,也许没问题,返回结果反正是要不重复的结果吧(因为是下拉用的))
              // r = r.sort(function (a, b) {
              //   return (
              //     tableIds.indexOf(a.key.ShortId) -
              //     tableIds.indexOf(b.key.ShortId)
              //   );
              // });

              ////改为push时按顺序
              let tableList: KeyValuePairT<
                DataTableUIModel,
                DataColumnModel[]
              >[] = [];
              // let existTableName: KeyValuePairT<number, number>[] =
              //   tableIds.map((b) => {
              //     return { key: b.key, value: 0 };
              //   });
              let existTableName: KeyValuePairT<number, number>[] = [];
              tableIds.forEach((element) => {
                let item = r.find((a) => a.key.ShortId === element.key);
                if (!me.pfUtil.isAnyNull(item)) {
                  item.key.isJoinedTable = element.value;
                  //debugger;
                  let tmpTable: DataTableUIModel = { ...item.key };
                  let existTable = existTableName.find(
                    (b) => b.key === tmpTable.ShortId
                  );
                  if (!me.pfUtil.isAnyNull(existTable)) {
                    tmpTable.TableIdxName =
                      tmpTable.TableName + '_' + (existTable.value + 1);
                    //debugger;
                    existTable.value++;
                  } else {
                    tmpTable.TableIdxName = tmpTable.TableName;
                    existTableName.push({ key: tmpTable.ShortId, value: 1 });
                  }
                  tableList.push(
                    new KeyValuePairT<DataTableUIModel, DataColumnModel[]>(
                      tmpTable, //主表有可能出现多次,要复制避免引用
                      item.value
                    )
                  );
                }
              });
              //debugger;
              r = tableList;
            }
            // if (!me.pfUtil.isListEmpty(r)) {
            //   for (let i = 0; i < r.length; i++) {
            //     r[i].key.isJoinedTable = true;
            //   }
            //   if (
            //     mainTableId !== null &&
            //     tableIds.filter((a) => a === mainTableId).length > 1
            //   ) {
            //     let tmp = r[0];
            //     r.splice(0, 0, tmp);
            //     r[0].key.isJoinedTable = false;
            //     //当join中也存在主表时
            //   } else {
            //     r[0].key.isJoinedTable = false;
            //   }
            // }
            subscriber.next(r); //rSubscriber.next(null)运行之后进入本句.本句执行完之后会触发queryFields()返回值里的next事件
          },
          (e) => {
            debugger;
          }
        );
      }
    });
    return observable;
  }

  public queryAllLevelFields(
    databaseId: number,
    query: StructuredQuery
  ): Observable<KeyValuePairT<DataTableUIModel, DataColumnModel[]>[]> {
    const me = this;
    //let tableIds: number[] = [];
    //key:tableId,value:isJoined
    let tableIds: KeyValuePairT<number, boolean>[] = [];
    //let tableIds: KeyValuePairT<number, any>[] = [];
    //字段由3部分组成
    //1.source-table
    let mainTableId: number = null;
    let tmpQuery = query;
    while (
      me.pfUtil.isAnyNull(tmpQuery['source-table']) &&
      !me.pfUtil.isAnyNull(tmpQuery['source-query'])
    ) {
      tmpQuery = tmpQuery['source-query'];
    }
    if (tmpQuery['source-table'] != null) {
      tableIds.push({ key: tmpQuery['source-table'], value: false });
      mainTableId = tmpQuery['source-table'];
    }

    //2.join
    if (query.joins != null) {
      for (let i = 0; i < query.joins.length; i++) {
        //tableIds.push(query.joins[i]["source-table"]);
        tableIds.push({ key: query.joins[i]['source-table'], value: true });
        //tableIds.push({ key: query.joins[i]["source-table"], value: true });
      }
    }
    tmpQuery = query;
    while (!me.pfUtil.isAnyNull(tmpQuery['source-query'])) {
      tmpQuery = tmpQuery['source-query'];
      if (tmpQuery.joins != null) {
        for (let i = 0; i < tmpQuery.joins.length; i++) {
          tableIds.push({
            key: tmpQuery.joins[i]['source-table'],
            value: true,
          });
        }
      }
    }
    return me.doQueryFields(databaseId, mainTableId, tableIds);
  }
  // public queryFieldsByTableId(databaseId, tableIds: number[]) {
  //   const me = this;
  //   // let tableIds: number[] = [];
  //   // if (query["source-table"] != null) {
  //   //   tableIds.push(query["source-table"]);
  //   // }
  //   // if (query.joins != null) {
  //   //   for (let i = 0; i < query.joins.length; i++) {
  //   //     tableIds.push(query.joins[i]["source-table"]);
  //   //   }
  //   // }

  //   let r: KeyValuePairT<DataTableModel, DataColumnModel[]>[] = [];
  //   const observable = new Observable<
  //     KeyValuePairT<DataTableModel, DataColumnModel[]>[]
  //   >((subscriber) => {
  //     const ro = new Observable<
  //       KeyValuePairT<DataTableModel, DataColumnModel[]>
  //     >((rSubscriber) => {
  //       me.reference.getDataTableList(databaseId).subscribe((response) => {
  //         let tableList = response.DataSource.filter(
  //           (t) => tableIds.indexOf(t.ShortId) > -1
  //         );
  //         //debugger;
  //         let oList: Observable<boolean>[] = [];
  //         tableList.map((a) => {
  //           const tmpO = new Observable<boolean>((subscriber2) => {
  //             me.reference
  //               .getDataColumnPageList(a.ShortId)
  //               .subscribe((response2) => {
  //                 r.push(
  //                   new KeyValuePairT<DataTableModel, DataColumnModel[]>(
  //                     a,
  //                     response2.DataSource
  //                   )
  //                 );
  //                 subscriber2.next(true);
  //                 subscriber2.complete();
  //               });
  //           });
  //           oList.push(tmpO);
  //         });
  //         forkJoin(oList).subscribe(
  //           (a) => {
  //             //这里有些奇怪，只有当aa和bb的observer.complete()执行完才会进入这里（一般会误以为是next执行完就进来吧）
  //             rSubscriber.next(null);
  //           },
  //           (e) => {
  //             debugger;
  //           }
  //         );
  //       });
  //     });
  //     ro.subscribe(
  //       (a) => {
  //         //这里实际是等待完成的,但返回用next,所以这里的参数a没有使用到
  //         //debugger;
  //         if (r !== null && r !== undefined) {
  //           //结果要按tableId来排列(便于后面把第0项识别为主表)(这样排序其实有问题,当tableId有重复的(如本表join本表),这样就不行了,也许没问题,返回结果反正是要不重复的结果吧(因为是下拉用的))
  //           r = r.sort(function (a, b) {
  //             return (
  //               tableIds.indexOf(a.key.ShortId) -
  //               tableIds.indexOf(b.key.ShortId)
  //             );
  //           });
  //         }
  //         subscriber.next(r); //rSubscriber.next(null)运行之后进入本句.本句执行完之后会触发queryFields()返回值里的next事件
  //       },
  //       (e) => {
  //         debugger;
  //       }
  //     );
  //   });
  //   return observable;
  // }
  /**
   * 删除 [[xx],"and",[xx],"or",[xx]...] 之类的第n项(需要连同旁边的运算符号)
   * @param list
   * @param idx
   * @param first
   */
  deleteCompare(list: any[], idx, first: boolean) {
    const me = this;
    //debugger;
    // if (idx > 1) {
    //   me.join.condition.splice(idx - 1, 2);
    // } else {
    //   me.join.condition.splice(idx, 1);
    // }
    if (first) {
      if (idx + 1 < list.length) {
        list.splice(idx + 1, 1);
      } else {
        // //删除完之后为空数组
        // //benjamin todo
        // me.deleteStep.emit();
      }
      list.splice(idx, 1);
    } else {
      list.splice(idx, 1);
      list.splice(idx - 1, 1);
    }
  }

  getBackColor(color): string {
    const me = this;
    return 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',0.1)';
  }
  getFrontColor(color): string {
    const me = this;
    return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
  }
  getFrontHoverColor(color): string {
    const me = this;
    return 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',0.8)';
  }

  // public addQueryClassMetadata(
  //   queryClass: PfStructuredQueryClass,
  //   databaseId:number
  //   ){
  //     const me = this;
  //     me.queryFields(databaseId, queryClass.query as any).subscribe(
  //       (response) => {
  //         let fieldList = response;
  //         const numbers = [1, 2, 3, 4, 5];
  //         const doubled = numbers.map((number) => number * 2);

  //         //me.fieldList = response;
  //         for (let i = 0; i < me.fieldList.length; i++) {
  //           let fields = me.fieldList[i].value.map((a) => {
  //             return {
  //               id: a.ShortId,

  //               name: a.ColumnName,
  //               display_name: a.ColumnName,
  //               description: a.Description,
  //               base_type: a.DataType,

  //               special_type: null,
  //               active: null,
  //               visibility_type: null,
  //               preview_display: null,
  //               position: null,
  //               parent_id: null,

  //               table_id: a.MetabaseShortId,

  //               fk_target_field_id: null,

  //               max_value: null,
  //               min_value: null,

  //               caveats: null,
  //               points_of_interest: null,

  //               last_analyzed: null,
  //               created_at: null,
  //               updated_at: null,

  //               values: null,
  //               dimensions: null,
  //             };
  //           });
  //           me.queryClass.addFields(fields);
  //           let table = me.fieldList[i].key;
  //           me.queryClass.addTables([
  //             {
  //               id: table.ShortId,
  //               db_id: table.SourceShortId,

  //               schema: null,
  //               name: table.TableName,
  //               display_name: table.TableName,

  //               description: table.TableName,
  //               active: null,
  //               visibility_type: null,

  //               fields: fields, //.map((a) => a)
  //               segments: [],
  //               metrics: [],
  //               rows: null,

  //               caveats: null,
  //               points_of_interest: null,
  //               show_in_getting_started: null,
  //             },
  //           ]);
  //         }
  //       },
  //       (e) => {
  //         debugger;
  //       }
  //     );
  // }

  /**
   * 先不这样(因为queryClass中的数据不一定完整)
   * @param queryClass
   * @param databaseShortId
   * @param pageSize
   * @param pageIndex
   * @returns
   */
  public getLocalDataTableList(
    queryClass: PfStructuredQueryClass,
    databaseShortId: number,
    pageSize: number = 0,
    pageIndex: number = 0
  ): Observable<TableClass[]> {
    const me = this;
    const observable = new Observable<TableClass[]>((subscriber) => {
      let localTable = queryClass.getTables((a) => a.db.id === databaseShortId);
      if (me.pfUtil.isAnyNull(localTable)) {
        me.reference
          .getDataTableList(databaseShortId, pageSize, pageIndex)
          .subscribe(
            (response) => {
              // response.DataSource = response.DataSource.map(
              //   (a) => new DataTableUIModel(a)
              // );
              queryClass.addTables(
                response.DataSource.map((table) => {
                  let item = {
                    id: table.ShortId,
                    db_id: table.SourceShortId,

                    schema: null,
                    name: table.TableName,
                    display_name: table.TableName,

                    description: table.TableName,
                    active: null,
                    visibility_type: null,

                    fields: null, //.map((a) => a)
                    segments: [],
                    metrics: [],
                    rows: null,

                    caveats: null,
                    points_of_interest: null,
                    show_in_getting_started: null,
                  };
                  return item;
                })
              );
              subscriber.next(
                queryClass.getTables((a) => a.db.id === databaseShortId)
              );
            },
            (error) => subscriber.error(error)
          );
      } else {
        // let r: PageResult<DataTableUIModel[]> = {
        //   DataSource: localTable.map((a) => {
        //     let item = {
        //       SourceName: null,
        //       SourceType: null,
        //       DatabaseName: null,
        //       Ip: null,
        //       Port: null,
        //       UserName: null,
        //       Password: null,
        //       CreatorName: null,
        //       ShortId: a.id,
        //       MetaId: null,
        //       TableName: a.name,
        //       Enable: null,
        //       Creator: null,
        //       CreateTime: null,
        //       SourceId: null,
        //       UpdateTime: null,
        //       SourceShortId: a.db.id,
        //       isJoinedTable: null,
        //       TableIdxName: null,
        //     };
        //     return item;
        //   }),
        //   RecordCount: localTable.length,
        // };
        subscriber.next(localTable);
      }
    });
    return observable;
  }
  private static databaseTypeToBaseTypeDict = {
    json: 'type/*',
    unspecified: 'type/*',
    'bigint identity': 'type/*',
    bigint: 'type/BigInteger',
    'bit unsigned': 'type/Boolean',
    //BIT: "type/Boolean",
    bit: 'type/Boolean',
    date: 'type/Date',
    smalldatetime: 'type/DateTime',
    datetime: 'type/DateTime',
    //DATETIME: "type/DateTime",
    timestamp: 'type/DateTime',
    decimal: 'type/Decimal',
    numeric: 'type/Decimal',
    //DECIMAL: "type/Decimal",
    float: 'type/Float',
    double: 'type/Float',
    FLOAT: 'type/Float',
    real: 'type/Float',
    'INT UNSIGNED': 'type/Integer',
    smallint: 'type/Integer',
    tinyint: 'type/Integer',
    int: 'type/Integer',
    'int identity': 'type/Integer',
    //INT: "type/Integer",
    integer: 'type/Integer',
    text: 'type/Text',
    clob: 'type/Text',
    varchar: 'type/Text',
    //VARCHAR: "type/Text",
    char: 'type/Text',
    //CHAR: "type/Text",
    nvarchar: 'type/Text',
    uniqueidentifier: 'type/UUID',
  };
  private static metabaseType = {
    All: 'type/*',
    BigInteger: 'type/BigInteger',
    Boolean: 'type/Boolean',
    Date: 'type/Date',
    DateTime: 'type/DateTime',
    Decimal: 'type/Decimal',
    Integer: 'type/Integer',
    Float: 'type/Float',
    Text: 'type/Text',
    UUID: 'type/UUID',
  };
  public getMetabaseBaseType(databaseType: string) {
    let lowerStr = databaseType.toLowerCase();
    if (SqlQueryUtil.databaseTypeToBaseTypeDict.hasOwnProperty(lowerStr)) {
      return SqlQueryUtil.databaseTypeToBaseTypeDict[databaseType];
    } else if (
      lowerStr.startsWith('varchar') ||
      lowerStr.startsWith('nvarchar')
    ) {
      return 'type/Text';
    } else if (lowerStr.startsWith('decimal')) {
      return 'type/Decimal';
    } else if (lowerStr.startsWith('int')) {
      return 'type/Integer';
    }
    return 'type/*';
  }
  public FieldUIModelToType(a: DataColumnUIModel): Field {
    const me = this;
    return {
      id: a.ShortId,

      name: a.ColumnName,
      display_name: a.ColumnName,
      description: a.Description,
      base_type: me.getMetabaseBaseType(a.DataType),

      special_type: null,
      active: null,
      visibility_type: null,
      preview_display: null,
      position: null,
      parent_id: null,

      table_id: a.MetabaseShortId,

      fk_target_field_id: null,

      max_value: null,
      min_value: null,

      caveats: null,
      points_of_interest: null,

      last_analyzed: null,
      created_at: null,
      updated_at: null,

      values: null,
      dimensions: null,
    };
  }
  public TableUIModelToType(table: DataTableUIModel, fields: Field[]): Table {
    return {
      id: table.ShortId,
      db_id: table.SourceShortId,

      schema: null,
      name: table.TableName,
      display_name: table.TableName,

      description: table.TableName,
      active: null,
      visibility_type: null,

      fields: fields, //.map((a) => a)
      segments: [],
      metrics: [],
      rows: null,

      caveats: null,
      points_of_interest: null,
      show_in_getting_started: null,
    };
  }
  public TableTypeToUIModel(table: Table): DataTableUIModel {
    return {
      SourceName: null,
      SourceType: null,
      DatabaseName: null,
      MetabaseName: null,
      Ip: null,
      Port: null,
      UserName: null,
      Password: null,
      CreatorName: null,
      ShortId: table.id,
      MetaId: null,
      TableName: table.name,
      Enable: null,
      Creator: null,
      CreateTime: null,
      SourceId: null,
      UpdateTime: null,
      SourceShortId: null,
      isJoinedTable: null,
      //TableShortId: table.id,
      /**
       * Table唯一名,当join相当table时,后面要加_1 _2来区分
       */
      TableIdxName: null,
    };
  }
  public DatabaseUIModelToType(
    database: DatabaseModel,
    tables: Table[]
  ): Database {
    return {
      id: database.ShortId,
      name: database.SourceName,
      description: database.DatabaseName,

      tables: tables,

      details: {},
      engine: database.SourceType.toLowerCase(),
      features: PfDatabaseClass.sqlServerFeature,
      is_full_sync: null,
      is_sample: null,
      native_permissions: null,

      caveats: null,
      points_of_interest: null,
    };
  }
  public QuestionUIModelToType(model: DatamodelQuery): Card {
    return {
      id: model.DatamodelQueryId,
      name: model.DatamodelQueryName,
      description: model.Description,
      dataset_query: model.query,
      display: model.DatamodelQueryName,
      visualization_settings: null,
      parameters: [],
      can_write: true,
      public_uuid: '',

      // // Not part of the card API contract, a field used by query builder for showing lineage
      // original_card_id?: CardId;
    };
  }
  /**
   * @deprecated 感觉此方法没必要,直接用getMetadata来构造
   * @param databaseId
   * @param card
   * @param query
   * @returns
   */
  public getQuestion(
    //questionUUID: String,
    databaseId: number,
    card: Card,
    query: StructuredQuery
  ): Observable<PfQuestion> {
    const me = this;
    const observable = new Observable<PfQuestion>((subscriber) => {
      me.getMetadata(databaseId, query).subscribe((response) => {
        let question = new PfQuestion(card, response);
        subscriber.next(question);
      });
    });
    return observable;
  }

  public getMetadata(
    databaseId: number,
    //card: Card,
    query: StructuredQuery
  ): Observable<PfMetadataClass> {
    const me = this;
    const observable = new Observable<PfMetadataClass>((subscriber) => {
      me.queryAllLevelFields(databaseId, query).subscribe(
        (response) => {
          let metadata = new PfMetadataClass();
          let fieldList = response;

          let tables = [];
          for (let i = 0; i < fieldList.length; i++) {
            let fields = fieldList[i].value.map((a) => {
              return me.FieldUIModelToType(a);
            });
            metadata.addFields(fields);
            let table = fieldList[i].key;
            let tableType = me.TableUIModelToType(table, fields);
            tables.push(tableType);
          }
          metadata.addTables(tables);
          me.reference.getDatabase(databaseId).subscribe((response) => {
            metadata.addDatabases([me.DatabaseUIModelToType(response, tables)]);
            //let r = new PfQuestion(card, metadata);
            subscriber.next(metadata);
          });
        },
        (e) => {
          debugger;
          subscriber.error(e);
        }
      );
    });
    return observable;
  }

  public getIconTypeByDataType(baseType: String): String {
    const me = this;
    if (
      SqlQueryUtil.metabaseType.Integer === baseType ||
      SqlQueryUtil.metabaseType.BigInteger === baseType
    ) {
      return 'FIELD_INT';
    } else if (SqlQueryUtil.metabaseType.Decimal === baseType) {
      return 'FIELD_INT';
    }
    return 'FIELD_STRING';
  }
  // public getAntIconTypeByDataType(baseType: String) {
  //   const me = this;
  //   if (
  //     SqlQueryUtil.metabaseType.Integer === baseType ||
  //     SqlQueryUtil.metabaseType.BigInteger === baseType
  //   ) {
  //     return ["number", "outline"];
  //   }
  //   return ["field-string", "outline"];
  // }
  private static queryCacheKey = 'queryCacheKey';
  public saveLocalQuery(query: DatasetQuery) {
    const me = this;
    if (query === null || query === undefined) {
      localStorage.removeItem(SqlQueryUtil.queryCacheKey);
    } else {
      //localStorage.setItem(key, arr.toString());
      localStorage.setItem(SqlQueryUtil.queryCacheKey, JSON.stringify(query));
    }
  }
  public getLocalQuery = function (): DatasetQuery {
    var s = localStorage.getItem(SqlQueryUtil.queryCacheKey);
    if (s !== null && s !== '') {
      //空字符串split后会有length:1
      //return s.split(',');
      return JSON.parse(s);
    } else {
      //没cache就全选
      return null;
    }
  };
}
