import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
//import { any } from "list";
import { NzMessageService } from 'ng-zorro-antd/message';
//import { forkJoin, Observable } from "rxjs";
import { KeyValuePair } from '../../common/pfModel';
import { PfUtil } from '../../common/pfUtil';
//import { PageResult } from "../../../../../../core/services/app-reference.service";
import {
  DataColumnModel,
  DataTableModel,
  DataTableUIModel,
} from '../../model/data-integration';
//import { ComputesReferenceService } from "../../../../core/services/computes-reference.service";
import {
  //CompoundFilter,
  ConcreteField,
  FieldLiteral,
  FilterClause,
  StructuredQuery,
} from '../model/Query';
import { KeyValuePairT, SqlQueryUtil } from '../sql-query-util';
import { NzIconService } from 'ng-zorro-antd/icon';
import { PfSvgIconPathDirective } from '../../share/pf-svg-icon/pf-svg-icon-path.directive';

/**
 * 此组件是要取代未能完全移值的metabase的PfExpressionFieldComponent 自定义表达式组件
 * 从filter-step改过来
 *
 * 后来发现此组件的方式似乎行不通:
 * contenteditable="true" 的元素内部不要递归生成子级组件(那样的话,当按delete和backspace删除掉所有子组件时,就变得不可编辑了,原因未明)
 */
@Component({
  selector: 'pf-expression-field',
  templateUrl: './pf-expression-field.component.html',
  styleUrls: ['./pf-expression-field.component.scss'],
})
export class PfExpressionFieldComponent implements OnInit {
  @Input() public isFirstFloor: boolean = false;
  /**
   * 格式如:
  ["and", ["=", ["field-id", 276], "967122"],
	    		["=", ["field-id", 274], true],
			    ["=", ["joined-field", "chinese_city", ["field-id", 249]], "临沂市"],
			    ["=", ["field-id", 149], "上海分公司"]
   */
  @Input() public query: StructuredQuery = null;
  //@Input() public filter: any[] = [];
  /**
   * 这个属性是一定要的,因为递归用自身时会传子级进来
   * 这里相当于aggregation-options内部某个子级的配置
   */
  //@Input() public filter: FilterClause = [];
  @Input() public expressionOption: any = null;

  /**
   * 当query是嵌套时，需要通过此事件来通知父组件更新query中的filter, 否则query的filter不会更新。（未知有无更好办法)
   */
  @Output() public expressionOptionChange = new EventEmitter(); //命名一定要是上面的字段名后加Change

  /**
   * 因为递归都要用到字段list来显示field的name,所以还是Input传递好了
   * 而且fieldList在此组件内是不会被修改的,所以最好从sql-query-area传进来(算了,第一次递归的时候查出来吧)
   *
   * filter的值有3种情况：
   * 1. [xxx,and,xxx,or...]
   * 2.[bracket,[]]
   */
  @Input() fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = []; //结构如 [{tb,cols}]
  /**
   * 内层source-query中的聚合输出字段(外层传入比较好)
   */
  @Input() sourceOutFieldList: FieldLiteral[] = []; //ConcreteField
  //@Output() public filterChange = new EventEmitter(); //命名一定要是上面的字段名后加Change
  // /**
  //  * 为了删除本节点,
  //  */
  // @Input() public filterParent: any[] = [];
  // @Input() public filterIdx: any[] = [];
  @Input() public testCnt: number = 0;
  @Output() deleteStep = new EventEmitter<any>();
  isAdd = true;
  // addAndOr = "and";
  mark = '';
  addStep: string = 'andOr';

  addingColumn?: DataColumnModel = null;
  addingTable?: DataTableUIModel = null;
  isAddingBracket?: boolean = false;
  addingSourceOutField?: FieldLiteral = null;
  //tableList: DataTableModel[] = [];
  //fieldList:KeyValuePair[]=[];

  compare: string = '=';
  /**
   * 为了编辑时绑定值
   */
  compareValue: string = '';
  compareList: KeyValuePair[] = [
    { key: '=', value: '是' },
    { key: '!=', value: '不是' },
    { key: 'contains', value: '包含' },
    { key: 'does-not-contain', value: '不包含' },
    { key: 'is-null', value: '为空' },
    { key: 'not-null', value: '不为空' },
    { key: 'starts-with', value: '以...开始' },
    { key: 'ends-with', value: '以...结束' },

    // { key: "=", value: "是" },
    // { key: "!=", value: "不是" },
    // { key: "contains", value: "包含" },
    // { key: "does-not-contain", value: "不包含" },
    // { key: "is-null", value: "为空" },
    // { key: "not-null", value: "不为空" },
    // { key: "starts-with", value: "以...开始" },
    // { key: "ends-with", value: "以...结束" },
  ];

  /**
   * 如果不双向绑定1个变量,那后面if的过滤就只会在input失去焦点时才触发
   */
  searchText = '';

  constructor(
    //private reference: ComputesReferenceService,
    public el: ElementRef,
    private msg: NzMessageService,
    private sqlQueryUtil: SqlQueryUtil,
    public pfUtil: PfUtil,
    private iconService: NzIconService
  ) {
    //this.iconService.addIconLiteral("ng-zorro:antd", ngZorroIconLiteral);
    this.iconService.addIconLiteral(
      'pfIcon:LEFT_JOIN',
      // '<svg viewBox="0 0 32 32" >' +
      //   PfSvgIconPathDirective.systemIconType.SQL_LEFT_JOIN +
      //   "</svg>"
      PfSvgIconPathDirective.getSvg('SQL_LEFT_JOIN')
    );
  }

  /**
   * 是否2元运算
   * @returns
   */
  isBinaryOperation() {
    const me = this;
    // return (
    //   ["=", "!=", ">", ">=", "<", "<="].indexOf(
    //     (me.expressionOption as any)[0]
    //   ) > -1
    // );
    return (
      ['=', '!=', '>', '>=', '<', '<=', '+', '-'].indexOf(
        (me.expressionOption as any)[0]
      ) > -1
    );
  }
  ngOnInit(): void {
    var me = this;
    //console.info(me.filter);
  }
  isArray(field): boolean {
    return field instanceof Array;
  }
  // deleteCompare(filter: any[]): void {
  //   const me = this;
  //   // filter.splice(0, filter.length);
  //   //debugger;
  //   me.deleteStep.emit(filter);

  //   //用删除的方法比较难,首先要知道parent,还要知道是parent的第几项
  //   // if(me.filterParent!=null&&me.filterParent.length>0){
  //   //   me.filterParent.
  //   // }
  //   // delete filter;
  // }
  deleteCompare(): void {
    const me = this;
    me.deleteStep.emit(); //由父级删除,因为数组结构的删除需要idx
  }
  onDelete(parentFilter: any[], idx: number, first: boolean): void {
    const me = this;
    // //debugger;

    // //parentFilter.splice(idx, 1);
    // //删除关系符
    // if (first) {
    //   if (idx + 1 < parentFilter.length) {
    //     parentFilter.splice(idx + 1, 1);
    //   } else {
    //     //删除完之后为空数组
    //     //benjamin todo
    //     me.deleteStep.emit();
    //   }
    //   parentFilter.splice(idx, 1);
    // } else {
    //   parentFilter.splice(idx, 1);
    //   parentFilter.splice(idx - 1, 1);
    // }
    me.sqlQueryUtil.deleteCompare(parentFilter, idx, first);
    if (0 === parentFilter.length) {
      me.deleteStep.emit();
    }
  }
  // onAdd(event: boolean) {
  //   var me = this;
  //   if (event) {
  //     me.addAndOr = "and";
  //     me.addStep = "andOr";
  //     // // me.addStep = "field"; //测试直接打开第二步,看看一拉会不会滚动
  //     // me.addCompare();
  //   }
  // }

  initAddingParam() {
    const me = this;
    me.isAddingBracket = false;
    me.compareValue = '';
    me.addingColumn = null;
    me.addingSourceOutField = null;
    //me.addAndOr = "and";
    // me.pfUtil.resetForm(
    //   me.fieldForm,
    //   { leftFieldId: "", rightFieldId: "" },
    //   { emitEvent: false }
    // );
  }
  //showEditFieldPopups
  initEditingParam(filter) {
    const me = this;
    me.isAdd = false;
    // // this.msg.info("This is a normal message");
    // // console.info("This is a normal message");
    // //addFilterPopups.open(btn);
    // me.addAndOr = filter[0];
    // me.compareValue = filter[2];
    // me.addStep = "compare";
    // //debugger;
    // //if (me.sqlQueryUtil.isLiteralField(filter[1][0])) {
    // if (me.sqlQueryUtil.isLiteralField(filter[1])) {
    //   me.addingSourceOutField = filter[1];
    // } else {
    //   //const f = me.getFieldByFilter(filter[1]);
    //   const f = me.sqlQueryUtil.getFieldByFilter(filter[1], me.fieldList);
    //   if (f !== null) {
    //     me.addingTable = f.key;
    //     me.addingColumn = f.value;
    //   }
    // }
  }
  // onAddOld(event, addFilterPopups) {
  //   var me = this;

  //   me.addAndOr = "and";
  //   me.addStep = "andOr";
  // }
  onAdd(event, addFilterPopups) {
    var me = this;
    me.isAdd = true;
    // // // me.addStep = "field"; //测试直接打开第二步,看看一拉会不会滚动
    // // me.addCompare();

    // //不异步的话,open时计算高度有可能用的是addField时的高度,但这样也有问题,新增时
    // const btn = event.currentTarget;
    // if (me.pfUtil.isListEmpty(me.filter)) {
    //   me.addAndOr = "";
    //   me.addStep = "field";
    //   addFilterPopups.open(btn);
    //   return;
    // }
    // if (addFilterPopups.isOpened()) {
    //   addFilterPopups.open(btn);
    //   me.addAndOr = "and";
    //   me.addStep = "andOr";
    // } else {
    //   me.addAndOr = "and";
    //   me.addStep = "andOr";
    //   setTimeout(function () {
    //     addFilterPopups.open(btn);
    //   }, 100);
    // }
  }
  // /**
  //  * @deprecated 异步的没有使用Observable,不好用
  //  * @param tableId
  //  */
  // private updateTable(tableId: number) {
  //   const me = this;
  //   me.reference
  //     .getDataTable(me.query.database, tableId)
  //     .subscribe((response) => {
  //       //me.tableList.push(response);
  //       me.reference.getDataColumnPageList(tableId).subscribe((response2) => {
  //         me.fieldList.push(
  //           new KeyValuePairT<DataTableModel, DataColumnModel[]>(
  //             response,
  //             response2.DataSource
  //           )
  //         );
  //       });
  //     });
  // }
  // /**
  //  * 此方法的作用类似updateTable,但此方法方便可以异步等待
  //  * @param tableId
  //  * @returns
  //  */
  // private queryFields(tableId: number[]) {
  //   const me = this;
  //   let r: KeyValuePairT<DataTableModel, DataColumnModel[]>[] = [];
  //   const observable = new Observable<
  //     KeyValuePairT<DataTableModel, DataColumnModel[]>[]
  //   >((subscriber) => {
  //     const ro = new Observable<
  //       KeyValuePairT<DataTableModel, DataColumnModel[]>
  //     >((rSubscriber) => {
  //       me.reference
  //         .getDataTableList(me.query.database)
  //         .subscribe((response) => {
  //           let tableList = response.DataSource.filter(
  //             (t) => tableId.indexOf(t.ShortId) > -1
  //           );
  //           //debugger;
  //           let oList: Observable<boolean>[] = [];
  //           tableList.map((a) => {
  //             const tmpO = new Observable<boolean>((subscriber2) => {
  //               me.reference
  //                 .getDataColumnPageList(a.ShortId)
  //                 .subscribe((response2) => {
  //                   r.push(
  //                     new KeyValuePairT<DataTableModel, DataColumnModel[]>(
  //                       a,
  //                       response2.DataSource
  //                     )
  //                   );
  //                   subscriber2.next(true);
  //                   subscriber2.complete();
  //                 });
  //             });
  //             oList.push(tmpO);
  //           });
  //           forkJoin(oList).subscribe(
  //             (a) => {
  //               //这里有些奇怪，只有当aa和bb的observer.complete()执行完才会进入这里（一般会误以为是next执行完就进来吧）
  //               rSubscriber.next(null);
  //             },
  //             (e) => {
  //               debugger;
  //             }
  //           );
  //         });
  //     });
  //     ro.subscribe(
  //       (a) => {
  //         //这里实际是等待完成的,但返回用next,所以这里的参数a没有使用到
  //         subscriber.next(r); //rSubscriber.next(null)运行之后进入本句.本句执行完之后会触发queryFields()返回值里的next事件
  //       },
  //       (e) => {
  //         debugger;
  //       }
  //     );
  //   });
  //   return observable;
  // }
  // goSelectFieldOld(addAndOr) {
  //   const me = this;
  //   // me.addStep = "field";
  //   // me.addAndOr = addAndOr;

  //   // /**
  //   //  * 查出可选择的table
  //   //  */
  //   // me.fieldList = [];
  //   // if (me.query != null) {
  //   //   if (me.query["source-table"] != null) {
  //   //     me.updateTable(me.query["source-table"]);
  //   //   }
  //   //   if (me.query.joins != null) {
  //   //     for (let i = 0; i < me.query.joins.length; i++) {
  //   //       me.updateTable(me.query.joins[i]["source-table"]);
  //   //     }
  //   //   }
  //   // }
  // }
  goSelectField(addAndOr, addFilterPopups) {
    const me = this;
    // me.addStep = "field";
    // me.addAndOr = addAndOr;

    //console.info(me.fieldList);

    //fieldList在sql-query-field里面更新,不在这里更新了
    // /**
    //  * 查出可选择的table
    //  */
    // me.fieldList = [];
    // if (me.query != null) {
    //   //同步
    //   let tableIds: number[] = [];
    //   if (me.query["source-table"] != null) {
    //     tableIds.push(me.query["source-table"]);
    //   }
    //   if (me.query.joins != null) {
    //     for (let i = 0; i < me.query.joins.length; i++) {
    //       tableIds.push(me.query.joins[i]["source-table"]);
    //     }
    //   }
    //   me.queryFields(tableIds).subscribe(
    //     (response) => {
    //       me.fieldList = [...me.fieldList, ...response];
    //       addFilterPopups.resize();
    //     },
    //     (e) => {
    //       debugger;
    //     }
    //   );
    // }
  }
  public onAndOrChange(newAndOr: string, idx: number) {
    //debugger;
    const me = this;
    // //me.filter.splice(idx, 1, newAndOr.target.value);
    // me.filter[idx] = newAndOr;
    // //me.filter[idx] = newAndOr.target.value; //newAndOr;
    // //me.filterChange.emit(me.filter);
  }

  public likeText(columnName: string, text: string) {
    //return columnName.indexOf(text) > -1;
    return PfUtil.likeText(columnName, text);
  }
  public selectColumn(column: DataColumnModel, table: DataTableUIModel) {
    const me = this;
    //me.addStep = "compare";
    me.addingColumn = column;
    me.addingTable = table;
    //me.filter.push();
  }
  public selectColumnBySourceOut(field: FieldLiteral) {
    const me = this;
    //me.addStep = "compare";
    //debugger;
    me.addingSourceOutField = field;
  }

  // /**
  //  *
  //  * @returns @deprecated Placement事件要展开前设置才有效,所以没用
  //  */
  // public getAddDropDownPlacement() {
  //   const me = this;
  //   if (me.addStep === "andOr") {
  //     return "bottomLeft";
  //   } else if (me.addStep === "field") {
  //     return "topLeft";
  //   }
  //   return "bottomLeft";
  // }
  public saveFilter(filterValue) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.expressionOption)) {
      me.expressionOption = [];
    }
    //自定义表达式应该只有add的情况,或删除
    if (me.isAdd) {
      //me.filter.push(["=", ["field-id", 276], "967122"]);
      //me.filter=["and", ["=", ["field-id", 276], "967122"]];
      let tmpFilter: any = me.expressionOption;
      //me.filter.push(["=", ["field-id", 276], "967122"]);
      if (me.isAddingBracket) {
        if (tmpFilter.length > 0) {
          tmpFilter.push(me.mark);
        }
        let bracket = ['bracket', []];
        tmpFilter.push(bracket);
        tmpFilter = bracket[1];
      }
      if (tmpFilter.length > 0) {
        tmpFilter.push(me.mark);
      }
      switch (me.compare) {
        case 'aa':
          break;
        default:
          tmpFilter.push([
            me.compare,
            //["field-id", me.addingColumn.ShortId], //这里要判断是不是joinField--benjamin
            me.getFilterByAdding(), //这里要判断是不是joinField--benjamin
            filterValue,
          ]);
          break;
      }
    } else {
      // let tmpFilter: any = me.filter;
      // tmpFilter[0] = me.compare;
      // tmpFilter[1] = me.getFilterByAdding();
      // tmpFilter[2] = filterValue;
    }
    me.expressionOptionChange.emit(me.expressionOption);
  }

  // public doGetFieldFullName(field: ConcreteField){

  // }
  /**
   *
   * @deprecated
   * @param field
   * @returns
   */
  public getFieldByFilter(
    field: ConcreteField
  ): KeyValuePairT<DataTableModel, DataColumnModel> {
    const me = this;
    if (
      undefined === me.fieldList ||
      null === me.fieldList ||
      me.fieldList.length < 1
    ) {
      //console.info("fieldList is null");
      return null;
    }
    //console.info("fieldList is not null");
    //debugger;
    if ('field-id' === field[0]) {
      if (me.fieldList.length > 0) {
        let f = me.fieldList[0].value.find((a) => a.ShortId === field[1]);
        if (f !== null && f !== undefined) {
          return new KeyValuePairT<DataTableModel, DataColumnModel>(
            me.fieldList[0].key,
            f
          );
        }
      }
    } else if ('joined-field' === field[0]) {
      // field[1] }}.{{ field[2][1]
      if (me.fieldList.length > 1) {
        let t = me.fieldList.find((a) => a.key.ShortId === field[1]);
        //let t = me.fieldList.find((a) => a.key.TableShortId === field[1]);
        if (t !== null && t !== undefined) {
          let f = t.value.find((a) => a.ShortId === field[1]);
          if (f !== null && f !== undefined) {
            return new KeyValuePairT<DataTableModel, DataColumnModel>(t.key, f);
          }
        }
      }
    }
  }
  private isFieldListEmpty(): boolean {
    const me = this;
    return me.fieldList === null || me.fieldList.length < 1;
  }
  public getFilterByAdding(): ConcreteField {
    const me = this;
    if (!me.pfUtil.isAnyNull(me.addingSourceOutField)) {
      return me.addingSourceOutField;
    }
    if (me.addingColumn === null || me.isFieldListEmpty()) {
      return null;
    }

    // if (me.addingTable.ShortId === me.fieldList[0].key.ShortId) {
    //   return ["field-id", me.addingColumn.ShortId];
    // }
    // // if (me.addingTable.ShortId === me.fieldList[0].key.ShortId) {
    // //   return [
    // //     "joined-field",
    // //     me.addingTable.TableName,
    // //     ["field-id", me.addingColumn.ShortId],
    // //   ];
    // // }
    // return [
    //   "joined-field",
    //   //me.addingTable.TableName,
    //   me.addingTable.TableIdxName,
    //   ["field-id", me.addingColumn.ShortId],
    // ];
    return me.sqlQueryUtil.getFilterByField(
      me.addingColumn,
      me.addingTable,
      me.fieldList
    );
  }
  public getFieldFullName(field: ConcreteField) {
    const me = this;
    // if (me.pfUtil.isListEmpty(me.fieldList)) {
    //   return "";
    // }
    // const f = me.getFieldByFilter(field);

    // if (f !== null && f !== undefined) {
    //   if ("field-id" === field[0]) {
    //     return f.value.ColumnName;
    //   } else if ("joined-field" === field[0]) {
    //     return f.key.TableName + "." + f.value.ColumnName;
    //   }
    // }
    // return "";
    return me.sqlQueryUtil.getFieldFullName(field, me.fieldList);
  }
  // public getFieldFullName(field: ConcreteField) {
  //   const me = this;
  //   const observable = new Observable<string>((subscriber) => {
  //     subscriber.next("测试字段名");
  //   });
  //   return observable;
  // }
  // getFieldFullName = (field: ConcreteField) => {
  //   const me = this;
  //   const observable = new Observable<string>((subscriber) => {
  //     debugger;
  //     subscriber.next("测试字段名");
  //   });
  //   return observable.toPromise();
  // };
  isAnyNull2(item) {
    const me = this;
    //debugger;
    return me.pfUtil.isAnyNull(item);
  }
  public getTableName() {
    const me = this;
    if (me.pfUtil.isAnyNull(me.addingTable, me.addingColumn)) {
      return '请选择表';
    } else {
      return me.addingTable.TableIdxName + '.' + me.addingColumn.ColumnName;
    }
  }
}
