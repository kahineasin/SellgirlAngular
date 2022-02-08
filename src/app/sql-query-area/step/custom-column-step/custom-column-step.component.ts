import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzIconService } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { PfUtil } from '../../../common/pfUtil';
import {
  DatabaseModel,
  DataColumnModel,
  DataTableModel,
  DataTableUIModel,
} from '../../../model/data-integration';
import { ComputesReferenceService } from '../../../service/computes-reference.service';
import { PfSvgIconPathDirective } from '../../../share/pf-svg-icon/pf-svg-icon-path.directive';
import PfStructuredQueryClass from '../../metabase-lib/lib/queries/PfStructuredQueryClass';
import {
  Aggregation,
  ConcreteField,
  Expression,
  FieldLiteral,
  StructuredQuery,
} from '../../model/Query';
import { KeyValuePairT, SqlQueryUtil } from '../../sql-query-util';
//import { KeyValuePairT } from "../filter-step/filter-step.component";

export type aggregationStep = 'type' | 'field';

@Component({
  selector: 'custom-column-step',
  templateUrl: './custom-column-step.component.html',
  styleUrls: [
    './custom-column-step.component.scss',
    '../sql-query-area-step.scss',
  ],
})
export class CustomColumnStepComponent implements OnInit {
  @Input() public databaseId: number = null;
  //@Input() public query: DatamodelQuery = null;
  @Input() public query: StructuredQuery = null;
  @Input() public queryClass: PfStructuredQueryClass = null;

  @Input() fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = []; //结构如 [{tb,cols}]
  /**
   * 内层source-query中的聚合输出字段(外层传入比较好)
   */
  @Input() sourceOutFieldList: FieldLiteral[] = []; //ConcreteField
  @Input() color: number[] = [0, 0, 0];
  @Output() public customColumnChange = new EventEmitter<void>();
  startRenderCustomByExpression$: Subject<any[]> = new Subject();

  /**
   * 编辑中的filter在breakout或aggregation中的索引(为了编辑时替换)
   */
  addingIdx?: any = null;

  isAdd = true;

  aggregationStep: aggregationStep = 'type';
  aggregationTypeList: any = [
    { key: 'count', value: '总行数', des: '' },
    { key: 'sum', value: '总和', des: '' },
    { key: 'avg', value: '平均值', des: '' },
    { key: 'distinct', value: '不重复值的总数', des: '' },
    { key: 'cum-sum', value: '累积求和', des: '' },
    { key: 'cum-count', value: '累积行数', des: '' },
    { key: 'stddev', value: '标准差', des: '' },
    { key: 'min', value: '最小值', des: '' },
    { key: 'max', value: '最大值', des: '' },
  ];
  aggregationType: string = '';
  /**
   * 如果不双向绑定1个变量,那后面if的过滤就只会在input失去焦点时才触发
   */
  searchText = '';
  addingCustomOption?: any[] = [];
  /**
   * 编辑状态时的原名
   */
  addingCustomOldName?: string = '';
  public addingCustomForm: FormGroup = null;

  constructor(
    private reference: ComputesReferenceService,
    private sqlQueryUtil: SqlQueryUtil,
    public pfUtil: PfUtil,
    private msg: NzMessageService,
    private iconService: NzIconService,
    private fb: FormBuilder
  ) {
    // document.documentElement.style.setProperty(
    //   "--contentvalue",
    //   this.colorTest
    // );
    this.addingCustomForm = this.fb.group({
      //customOption: ["", Validators.required],
      addingCustomName: ['', Validators.required],
    });
    this.iconService.addIconLiteral(
      'pfIcon:LEFT_JOIN',
      PfSvgIconPathDirective.getSvg('SQL_LEFT_JOIN')
    );
  }

  ngOnInit(): void {
    // document.documentElement.style.setProperty(
    //   "--contentvalue",
    //   this.colorTest
    // );
    //debugger;
    // let obj={aa:"aa",bb:"bb"};
  }

  // public showAggregationPopups(idx,btn, selectFieldPopups,isAdd) {
  //   initEditingParam(index);
  //   const me = this;
  //   //const btn = event.currentTarget;
  //   // if (me.query.database === null) {
  //   //   me.step = "database";
  //   //   me.reference.getDatabasePageList().subscribe((response) => {
  //   //     me.databaseList = response.DataSource;
  //   //     selectTablePopups.open(btn);
  //   //   });
  //   // } else {
  //   //   me.step = "table";
  //   //   me.reference.getDataTableList(me.query.database).subscribe((response) => {
  //   //     me.tableList = response.DataSource;
  //   //     selectTablePopups.open(btn);
  //   //   });
  //   // }
  //   // // if("database"==me.step){
  //   // //   me.goSelectDatabase()
  //   // // }
  //   selectFieldPopups.open(btn);
  // }
  public initAggregationAddingParam() {
    const me = this;
    me.initAddingParam();
    me.aggregationStep = 'type';
  }
  // public initAggregationEditingParam(filter, idx) {
  //   const me = this;
  //   me.initEditingParam(idx);
  //   me.aggregationType = filter[0];
  //   if (me.isAggregationNoField(filter[0])) {
  //     me.aggregationStep = "type";
  //   } else if ("aggregation-options" === filter[0]) {
  //     me.msg.warning("自定义汇总未实现");
  //     return;
  //   } else {
  //     me.aggregationStep = "field";
  //   }
  // }

  // public showBreakoutPopups(event, selectFieldPopups) {
  //   const me = this;
  //   me.isAdd = true;
  //   const btn = event.currentTarget;
  //   // if (me.query.database === null) {
  //   //   me.step = "database";
  //   //   me.reference.getDatabasePageList().subscribe((response) => {
  //   //     me.databaseList = response.DataSource;
  //   //     selectTablePopups.open(btn);
  //   //   });
  //   // } else {
  //   //   me.step = "table";
  //   //   me.reference.getDataTableList(me.query.database).subscribe((response) => {
  //   //     me.tableList = response.DataSource;
  //   //     selectTablePopups.open(btn);
  //   //   });
  //   // }
  //   // // if("database"==me.step){
  //   // //   me.goSelectDatabase()
  //   // // }
  //   selectFieldPopups.open(btn);
  // }
  // showEditBreakoutPopups(event, selectFieldPopups) {
  //   const me = this;
  //   // this.msg.info("This is a normal message");
  //   // console.info("This is a normal message");
  //   me.isAdd = false;
  //   const btn = event.currentTarget;
  //   selectFieldPopups.open(btn);
  //   //addFilterPopups.open(btn);
  //   // me.addAndOr = filter[0];
  //   // me.addStep = "compare";
  //   // const f = me.sqlQueryUtil.getFieldByFilter(filter,me.fieldList);
  //   // if (f !== null) {
  //   //   me.addingTable = f.key;
  //   //   me.addingColumn = f.value;
  //   //   me.compareValue = filter[2];
  //   // }
  // }

  initAddingParam() {
    const me = this;
    //me.isAddingBracket = false;
    me.isAdd = true;
    //me.addAndOr = "and";
    me.pfUtil.resetForm(me.addingCustomForm);
    me.addingCustomOption = null;
    me.startRenderCustomByExpression$.next(me.addingCustomOption);
  }
  initEditingParam(
    /*filter,*/
    //idx,
    key,
    value
  ) {
    const me = this;
    // this.msg.info("This is a normal message");
    // console.info("This is a normal message");
    me.isAdd = false;
    //debugger;
    //addFilterPopups.open(btn);
    // me.addAndOr = filter[0];
    // me.addStep = "compare";
    // const f = me.getFieldByFilter(filter[1]);
    // if (f !== null) {
    //   me.addingTable = f.key;
    //   me.addingColumn = f.value;
    //   me.compareValue = filter[2];
    // }
    //me.addingFilter = filter;
    // me.addingIdx = idx;
    //me.addingIdx=idx;
    me.addingCustomForm.patchValue({ addingCustomName: key });
    me.addingCustomOption = value;
    me.addingCustomOldName = key;
    me.startRenderCustomByExpression$.next(me.addingCustomOption);
  }
  // public saveOrder(column: DataColumnModel, table: DataTableUIModel) {
  //   const me = this;
  //   if (me.pfUtil.isAnyNull(me.query["order-by"])) {
  //     me.query["order-by"] = [];
  //   }
  //   let tmp: any = me.query["order-by"];
  //   //debugger;
  //   let tmpFilter = me.sqlQueryUtil.getFilterByColumn(
  //     column,
  //     table
  //     //me.fieldList
  //   );
  //   //debugger;
  //   if (me.isAdd) {
  //     tmp.push(["asc", tmpFilter]);
  //   } else {
  //     //order只有新增没修改
  //     // let tmpOrder: any = me.query["order-by"];
  //     // tmpOrder[me.addingIdx] = tmpFilter;
  //   }
  // }
  // public saveOrderBySourceOut(field: FieldLiteral) {
  //   const me = this;
  //   if (me.pfUtil.isAnyNull(me.query["order-by"])) {
  //     me.query["order-by"] = [];
  //   }
  //   let tmp: any = me.query["order-by"];
  //   // //debugger;
  //   // let tmpFilter = me.sqlQueryUtil.getFilterByField(
  //   //   column,
  //   //   table,
  //   //   me.fieldList
  //   // );
  //   //debugger;
  //   if (me.isAdd) {
  //     tmp.push(["asc", field]);
  //   } else {
  //     //order只有新增没修改
  //     // let tmpOrder: any = me.query["order-by"];
  //     // tmpOrder[me.addingIdx] = tmpFilter;
  //   }
  // }
  // public saveAggregation(column: DataColumnModel, table: DataTableModel) {
  //   const me = this;
  //   let tmp: any = me.query.aggregation;
  //   let tmpFilter = [
  //     me.aggregationType,
  //     me.sqlQueryUtil.getFilterByField(column, table, me.fieldList),
  //   ];
  //   //debugger;
  //   if (me.isAdd) {
  //     tmp.push(tmpFilter);
  //   } else {
  //     me.query.aggregation[me.addingIdx] = tmpFilter;
  //   }
  //   // me.addStep = "compare";
  //   // me.addingColumn = column;
  //   // me.addingTable = table;
  //   //me.filter.push();
  // }

  getBackColor(): string {
    const me = this;
    return (
      'rgba(' + me.color[0] + ',' + me.color[1] + ',' + me.color[2] + ',0.1)'
    );
  }
  getFrontColor(): string {
    const me = this;
    return 'rgb(' + me.color[0] + ',' + me.color[1] + ',' + me.color[2] + ')';
  }
  getFrontHoverColor(): string {
    const me = this;
    return (
      'rgba(' + me.color[0] + ',' + me.color[1] + ',' + me.color[2] + ',0.8)'
    );
  }
  isArray(field): boolean {
    return field instanceof Array;
  }
  getFieldFullName(field: ConcreteField) {
    const me = this;
    return me.sqlQueryUtil.getFieldFullName(field, me.fieldList);
  }
  public likeText(columnName: string, text: string) {
    //return columnName.indexOf(text) > -1;
    return PfUtil.likeText(columnName, text);
  }
  isExistInAggregation(
    column: DataColumnModel,
    table: DataTableModel
  ): boolean {
    const me = this;
    if (me.query.aggregation === null || me.query.aggregation === undefined) {
      return false;
    }
    return (
      me.query.aggregation.findIndex((a) => {
        //debugger;
        return me.sqlQueryUtil.isFilterMatchField(a, column, table);
        // const f = me.sqlQueryUti.getFieldByFilter(a, me.fieldList);
        // return f !== null;
      }) > -1
    );
    // if (me.pfUtil.isListEmpty(me.fieldList)) {
    //   return false;
    // }
    // debugger;
    // const tIdx = me.fieldList.findIndex((a) => a.key.ShortId === table.ShortId);
    // if (tIdx < 0) {
    //   return false;
    // }
    // return (
    //   me.fieldList[tIdx].value.findIndex((a) => a.ShortId === column.ShortId) >
    //   -1
    // );
  }
  isExistInBreakout(column: DataColumnModel, table: DataTableModel): boolean {
    const me = this;
    if (me.query.breakout === null || me.query.breakout === undefined) {
      return false;
    }
    return (
      me.query.breakout.findIndex((a) => {
        //debugger;
        return me.sqlQueryUtil.isFilterMatchField(a, column, table);
        // const f = me.sqlQueryUti.getFieldByFilter(a, me.fieldList);
        // return f !== null;
      }) > -1
    );
    // if (me.pfUtil.isListEmpty(me.fieldList)) {
    //   return false;
    // }
    // debugger;
    // const tIdx = me.fieldList.findIndex((a) => a.key.ShortId === table.ShortId);
    // if (tIdx < 0) {
    //   return false;
    // }
    // return (
    //   me.fieldList[tIdx].value.findIndex((a) => a.ShortId === column.ShortId) >
    //   -1
    // );
  }
  // getAggregationDisplayName(filter: Aggregation) {
  //   const me = this;

  //   if ("count" === filter[0]) {
  //     return "总行数";
  //   }
  //   if ("cum-count" === filter[0]) {
  //     return "累积行数";
  //   }
  //   if ("aggregation-options" === filter[0]) {
  //     return filter[2]["display-name"];
  //   }
  //   const f = me.sqlQueryUtil.getFieldByFilter(filter[1], me.fieldList);

  //   if (f !== null && f !== undefined) {
  //     const t = me.aggregationTypeList.find((a) => a.key == filter[0]);
  //     if (t !== null) {
  //       return (
  //         me.sqlQueryUtil.getFieldFullName(filter[1], me.fieldList) +
  //         " " +
  //         t.value
  //       );
  //       // if ("field-id" === filter[1][0]) {
  //       //   return f.value.ColumnName + " " + t.value;
  //       // } else if ("joined-field" === filter[1][0]) {
  //       //   return f.key.TableName + "→" + f.value.ColumnName + " " + t.value;
  //       // }
  //     }
  //   }
  //   return "";
  // }
  //对象的key就是列名
  // getCustomColumnDisplayName(filter: Expression) {
  //   const me = this;

  //   if ("count" === filter[0]) {
  //     return "总行数";
  //   }
  //   if ("cum-count" === filter[0]) {
  //     return "累积行数";
  //   }
  //   if ("aggregation-options" === filter[0]) {
  //     return filter[2]["display-name"];
  //   }
  //   const f = me.sqlQueryUtil.getFieldByFilter(filter[1], me.fieldList);

  //   if (f !== null && f !== undefined) {
  //     const t = me.aggregationTypeList.find((a) => a.key == filter[0]);
  //     if (t !== null) {
  //       return (
  //         me.sqlQueryUtil.getFieldFullName(filter[1], me.fieldList) +
  //         " " +
  //         t.value
  //       );
  //       // if ("field-id" === filter[1][0]) {
  //       //   return f.value.ColumnName + " " + t.value;
  //       // } else if ("joined-field" === filter[1][0]) {
  //       //   return f.key.TableName + "→" + f.value.ColumnName + " " + t.value;
  //       // }
  //     }
  //   }
  //   return "";
  // }
  // getAggregationTypeName() {
  //   const me = this;
  //   const t = me.aggregationTypeList.find((a) => a.key == me.aggregationType);
  //   if (t !== null) {
  //     return t.value;
  //   }
  //   return "";
  // }
  private isAggregationNoField(t: string) {
    const me = this;
    return ['count', 'cum-count'].indexOf(t) > -1;
  }
  goSelectAggregationField(aggregationType: string, selectAggregationPopups) {
    const me = this;
    //debugger;
    if (me.isAggregationNoField(aggregationType)) {
      let tmp: any = me.query.aggregation;
      if (me.isAdd) {
        tmp.push([aggregationType]);
      } else {
        tmp[me.addingIdx] = [aggregationType];
      }
      selectAggregationPopups.close();
    } else {
      me.aggregationType = aggregationType;
      me.aggregationStep = 'field';
    }
  }
  // deleteAggregation() {}
  // deleteBreakout() {}
  /*-------------------自定义表达式-------------------*/
  deleteExpression(key) {
    const me = this;
    delete me.query['expressions'][key];
  }
  public saveCustomColumn() {
    const me = this;
    debugger;
    // if (me.pfUtil.isAnyNull(me.query.expressions)) {
    //   me.query.expressions = {};//报错object is not extensible at CustomColumnStepComponent.saveCustomColumn估计是由于子组件不能直接改Input query(不是这个原因，需要用Object.assign解决)
    // }
    let tmp: any = me.query.expressions;
    let addCustom = me.addingCustomForm.value;
    // let tmpFilter = [
    //   "aggregation-options",
    //   me.addingCustomOption,
    //   //{ "display-name": me.addingCustomName },
    //   { "display-name": addCustom.addingCustomName },
    // ];

    //debugger;
    if (me.isAdd) {
      ////tmp.push(tmpFilter);
      ////me.query.expressions[addCustom.addingCustomName]=me.addingCustomOption;
      //tmp[addCustom.addingCustomName] = me.addingCustomOption;
      // tmp = Object.assign({}, tmp, {
      //   [addCustom.addingCustomName]: me.addingCustomOption,
      // });
      me.query.expressions = Object.assign({}, me.query.expressions, {
        [addCustom.addingCustomName]: me.addingCustomOption,
      });
    } else {
      //me.query.aggregation[me.addingIdx] = tmpFilter;
      delete tmp[me.addingCustomOldName];
      //tmp[addCustom.addingCustomName] = me.addingCustomOption;
      tmp = Object.assign(
        {},
        { [addCustom.addingCustomName]: me.addingCustomOption }
      );
    }
    me.customColumnChange.emit();
  }
  // public onExpressionOptionChange(event) {
  //   const me = this;
  //   me.addingCustomOption = event;
  //   //me.query.filter = event;//benjamin todo
  // }
}
