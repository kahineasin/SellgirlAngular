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
  FieldLiteral,
  StructuredQuery,
} from '../../model/Query';
import { KeyValuePairT, SqlQueryUtil } from '../../sql-query-util';
//import { KeyValuePairT } from "../filter-step/filter-step.component";

//import { parseOperators } from "../../lib/expressions/compile";

export type aggregationStep = 'type' | 'field' | 'custom';

@Component({
  selector: 'aggregation-step',
  templateUrl: './aggregation-step.component.html',
  styleUrls: [
    './aggregation-step.component.scss',
    '../sql-query-area-step.scss',
  ],
})
export class AggregationStepComponent implements OnInit {
  @Input() public databaseId: number = null;
  //@Input() public query: DatamodelQuery = null;
  @Input() public query: StructuredQuery = null;
  @Input() public queryClass: PfStructuredQueryClass = null;
  // @Input() public databaseList: DatabaseModel[] = [];
  //@Input() public tableId?: number = null; //"jack";
  //@Input() public tableList: DataTableModel[] = [];
  @Input() fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = []; //结构如 [{tb,cols}]
  /**
   * 内层source-query中的聚合输出字段(外层传入比较好)
   */
  @Input() sourceOutFieldList: FieldLiteral[] = []; //ConcreteField
  @Input() color: number[] = [0, 0, 0];
  /**
   * 暂时是为了在sql-query-field里判断聚合按钮是否需要更新显示状态
   */
  @Output() public breakoutChange = new EventEmitter<void>();
  startRenderCustomByExpression$: Subject<any[]> = new Subject();
  // public colorTest: string = "green";
  // public colorTest2: number = 4;
  //@Output() public tableIdChange = new EventEmitter(); //命名一定要是上面的字段名后加Change

  // step: filterAddStep = "aggregationType";
  // public databaseList: DatabaseModel[] = [];
  // public columnId: number[] = [];
  // public columnList: DataColumnModel[] = [];
  // //public columnGridData: KeyValuePair[] = []; //[{key:DataColumnModel,value:true}]

  // addingDatabase?: DatabaseModel = null;
  // addingTable?: DataTableModel = null;
  //addingFilter?: any = null;
  /**
   * 编辑中的filter在breakout或aggregation中的索引(为了编辑时替换)
   */
  addingIdx?: any = null;

  //addingCustomName?: string = "";
  addingCustomOption?: any[] = [];
  addingCustomInvalid?: boolean = false;
  public addingCustomForm: FormGroup = null;

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

  isSourceQuery: boolean = false;
  // /**
  //  * 内层source-query中的聚合输出字段
  //  */
  // sourceOutFieldList: FieldLiteral[] = []; //ConcreteField
  //自己维护两个列表的成本太高了,还是用filter方式吧
  // public _fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = [];
  // public _sourceOutFieldList: FieldLiteral[] = []; //ConcreteField

  // public _breakoutFieldList: KeyValuePairT<
  //   DataTableUIModel,
  //   DataColumnModel[]
  // >[] = [];
  // public _breakoutSourceOutFieldList: FieldLiteral[] = []; //ConcreteField

  public breakoutFieldFilter: (
    field: DataColumnModel,
    table: DataTableUIModel
  ) => boolean = null;

  public breakoutSourceOutFieldFilter: (field: FieldLiteral) => boolean = null;
  public aggregationFieldFilter: (
    field: DataColumnModel,
    table: DataTableUIModel
  ) => boolean = null;

  public aggregationSourceOutFieldFilter: (field: FieldLiteral) => boolean =
    null;
  constructor(
    private reference: ComputesReferenceService,
    private sqlQueryUtil: SqlQueryUtil,
    public pfUtil: PfUtil,
    private msg: NzMessageService,
    private fb: FormBuilder,
    private iconService: NzIconService
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
    const me = this;
    // document.documentElement.style.setProperty(
    //   "--contentvalue",
    //   this.colorTest
    // );
    //debugger;

    //根据 source-query的breakout和aggregation获得可选项
    // if (!me.pfUtil.isAnyNull(me.query["source-query"])) {
    //   for (let i = 0; i < me.query["source-query"].breakout.length; i++) {
    //     me.sourceOutFieldList.push(me.query["source-query"].breakout[i]);
    //   }
    // }
    // me.sqlQueryUtil
    //   .getSourceQueryOutFields(me.databaseId, me.query)
    //   .subscribe((response) => {
    //     me.sourceOutFieldList = response;
    //   });
    me.breakoutFieldFilter = (field, table) => {
      let r = !me.isExistInBreakout(field, table);
      return r;
    };
    me.breakoutSourceOutFieldFilter = (field) => {
      let r = !me.hasBreakout(field);
      return r;
    };
    me.aggregationFieldFilter = (field, table) => {
      let r = !me.isExistInAggregation(field, table);
      return r;
    };
    me.aggregationSourceOutFieldFilter = (field) => {
      let r = !me.hasAggregation(field);
      return r;
    };
  }
  ngOnChanges() {
    const me = this;
    me.isSourceQuery = !me.pfUtil.isAnyNull(me.query['source-query']);
    // me.sqlQueryUtil
    //   .getSourceQueryOutFields(me.databaseId, me.query)
    //   .subscribe((response) => {
    //     me.sourceOutFieldList = response;
    //   });

    // //当内层的输出字段有删除时，sourceOutFieldList会减少，在这里进行过滤无效的字段(写在这里报错:Expression has changed after it was checked)
    // if (!me.pfUtil.isAnyNull(me.query.aggregation)) {
    //   me.query.aggregation = me.query.aggregation.filter((a) =>
    //     me.isFilterInSourceOut(a[1])
    //   );
    // }
    // if (!me.pfUtil.isAnyNull(me.query.breakout)) {
    //   me.query.breakout = me.query.breakout.filter((a) =>
    //     me.isFilterInSourceOut(a)
    //   );
    // }

    // me._breakoutFieldList = this.fieldList.map(
    //   (a) =>
    //     new KeyValuePairT<DataTableUIModel, DataColumnModel[]>(
    //       a.key,
    //       a.value.map((b) => b)
    //     )
    // );
    // me._breakoutSourceOutFieldList = this.sourceOutFieldList.map((a) => a);

    // me._fieldList = this.fieldList.map(
    //   (a) =>
    //     new KeyValuePairT<DataTableUIModel, DataColumnModel[]>(
    //       a.key,
    //       a.value.map((b) => b)
    //     )
    // );
    // me._sourceOutFieldList = this.sourceOutFieldList.map((a) => a);

    // for (let i = me._breakoutFieldList.length - 1; i >= 0; i--) {
    //   me._breakoutFieldList[i].value = me._breakoutFieldList[i].value.filter(
    //     (a) => !me.isExistInBreakout(a, me._breakoutFieldList[i].key)
    //   );
    // }

    // me._breakoutSourceOutFieldList = me._breakoutSourceOutFieldList.filter(
    //   (a) => !me.hasAggregation(a)
    // );

    // for (let i = me._fieldList.length - 1; i >= 0; i--) {
    //   me._fieldList[i].value = me._fieldList[i].value.filter(
    //     (a) => !me.isExistInAggregation(a, me._fieldList[i].key)
    //   );
    // }

    // me._sourceOutFieldList = me._sourceOutFieldList.filter(
    //   (a) => !me.hasAggregation(a)
    // );
  }
  // /**
  //  * 验证已选字段在不是source的输出列表里
  //  * @param ConcreteField
  //  */
  // private isFilterInSourceOut(field: ConcreteField): boolean {
  //   const me = this;
  //   if (me.sqlQueryUtil.isLiteralField(field)) {
  //     return (
  //       me.sourceOutFieldList.findIndex((a) =>
  //         me.sqlQueryUtil.isLiteralFieldEqual(a, field)
  //       ) > -1
  //     );
  //   } else {
  //     return (
  //       me.fieldList.findIndex(
  //         (a) =>
  //           a.value.findIndex((b) =>
  //             me.sqlQueryUtil.isFilterMatchField(field, b, a.key)
  //           ) > -1
  //       ) > -1
  //     );
  //   }
  // }

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

    me.pfUtil.resetForm(me.addingCustomForm);
    me.addingCustomOption = null;
    //setTimeout(function () {
    me.startRenderCustomByExpression$.next(null);
    //}, 1);
  }
  public initAggregationEditingParam(filter, idx) {
    const me = this;
    me.initEditingParam(idx);
    me.aggregationType = filter[0];
    if (me.isAggregationNoField(filter[0])) {
      me.aggregationStep = 'type';
    } else if ('aggregation-options' === filter[0]) {
      //me.msg.warning("自定义汇总未实现");
      me.aggregationStep = 'custom';
      //debugger;
      // me.addingCustomName = filter[2]["display-name"];
      me.addingCustomForm.patchValue({
        addingCustomName: filter[2]['display-name'],
      });
      me.addingCustomOption = filter[1];
      //setTimeout(function () {
      me.startRenderCustomByExpression$.next(me.addingCustomOption);
      //}, 1);
      return;
    } else {
      me.aggregationStep = 'field';
    }
  }

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

    // me.addingCustomName = "";
  }
  initEditingParam(/*filter,*/ idx) {
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
    me.addingIdx = idx;
  }
  public saveBreakout(column: DataColumnModel, table: DataTableUIModel) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.query.breakout)) {
      me.query.breakout = [];
    }
    let tmp: any = me.query.breakout;
    // let tmpFilter = me.sqlQueryUtil.getFilterByField(
    //   column,
    //   table,
    //   me.fieldList
    // );
    //let tmpFilter = me.sqlQueryUtil.getJoinFilterByColumn(column, table);
    let tmpFilter = me.sqlQueryUtil.getFilterByColumn(column, table);
    //debugger;
    if (me.isAdd) {
      tmp.push(tmpFilter);
    } else {
      // // let tmpFilter: any = me.filter;
      // // tmpFilter[0] = me.compare;
      // // tmpFilter[1] = me.getFilterByAdding();
      // // tmpFilter[2] = filterValue;
      // me.addingFilter = tmpFilter;
      me.query.breakout[me.addingIdx] = tmpFilter;
    }
    // me.addStep = "compare";
    // me.addingColumn = column;
    // me.addingTable = table;
    //me.filter.push();
    me.breakoutChange.emit();
  }
  public saveBreakoutBySourceOut(field: FieldLiteral) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.query.breakout)) {
      me.query.breakout = [];
    }
    let tmp: any = me.query.breakout;
    //debugger;
    if (me.isAdd) {
      tmp.push(field);
    } else {
      tmp[me.addingIdx] = field;
    }
    me.breakoutChange.emit();
  }
  public hasAggregation(field: FieldLiteral) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.query.aggregation)) {
      return false;
    }
    return (
      me.query.aggregation.findIndex(
        (a) =>
          me.sqlQueryUtil.isLiteralFieldEqual(a[1], field) && //每种聚合类型的字段要唯一，否则拼接到select的*列表时重名不好处理，而且重复也是没用处的
          //a[1][1] === field[1] &&
          a[0] === me.aggregationType
      ) > -1
    );
  }
  public hasAggregationNoFieldType(t: string) {
    const me = this;
    //benjamin todo
    if (me.pfUtil.isAnyNull(me.query.aggregation)) {
      return false;
    }
    return (
      me.query.aggregation.findIndex(
        (a) =>
          me.sqlQueryUtil.isAggregationNoField(t) && //每种聚合类型的字段要唯一，否则拼接到select的*列表时重名不好处理，而且重复也是没用处的
          //a[1][1] === field[1] &&
          a[0] === t
      ) > -1
    );
  }
  public hasBreakout(field: FieldLiteral) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.query.breakout)) {
      return false;
    }
    return me.query.breakout.findIndex((a) => a[1] === field[1]) > -1;
  }
  public saveAggregation(column: DataColumnModel, table: DataTableUIModel) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.query.aggregation)) {
      me.query.aggregation = [];
    }
    let tmp: any = me.query.aggregation;
    let tmpFilter = [
      me.aggregationType,
      //me.sqlQueryUtil.getFilterByField(column, table, me.fieldList),
      me.sqlQueryUtil.getFilterByColumn(column, table),
    ];
    //debugger;
    if (me.isAdd) {
      tmp.push(tmpFilter);
    } else {
      me.query.aggregation[me.addingIdx] = tmpFilter;
    }
    me.breakoutChange.emit();
  }
  public saveAggregationBySourceOut(field: FieldLiteral) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.query.aggregation)) {
      me.query.aggregation = [];
    }
    // let tmp: any = me.query.aggregation;
    // //debugger;
    // if (me.isAdd) {
    //   tmp.push(field);
    // } else {
    //   tmp[me.addingIdx] = field;
    // }
    let tmp: any = me.query.aggregation;
    let tmpFilter = [me.aggregationType, field];
    //debugger;
    if (me.isAdd) {
      tmp.push(tmpFilter);
    } else {
      me.query.aggregation[me.addingIdx] = tmpFilter;
    }
    me.breakoutChange.emit();
  }
  public saveAggregationByCustom() {
    const me = this;
    if (me.pfUtil.isAnyNull(me.query.aggregation)) {
      me.query.aggregation = [];
    }
    let tmp: any = me.query.aggregation;
    let addCustom = me.addingCustomForm.value;
    let tmpFilter = [
      'aggregation-options',
      me.addingCustomOption,
      //{ "display-name": me.addingCustomName },
      { 'display-name': addCustom.addingCustomName },
    ];
    //debugger;
    if (me.isAdd) {
      tmp.push(tmpFilter);
    } else {
      me.query.aggregation[me.addingIdx] = tmpFilter;
    }
    me.breakoutChange.emit();
  }

  getBackColor(): string {
    const me = this;
    return me.sqlQueryUtil.getBackColor(me.color);
  }
  getFrontColor(): string {
    const me = this;
    return me.sqlQueryUtil.getFrontColor(me.color);
  }
  getFrontHoverColor(): string {
    const me = this;
    return me.sqlQueryUtil.getFrontHoverColor(me.color);
  }
  isArray(field): boolean {
    return field instanceof Array;
  }
  getFieldFullName(field: ConcreteField) {
    const me = this;
    // if (me.fieldList.length > 0) {
    //   debugger;
    // }
    // if (
    //   !me.pfUtil.isListEmpty(field) &&
    //   field[1] === 15 &&
    //   !me.pfUtil.isListEmpty(me.fieldList)
    // ) {
    //   debugger;
    // }
    return me.sqlQueryUtil.getFieldFullName(field, me.fieldList);
  }
  getFieldFullName2(field: ConcreteField) {
    const me = this;
    if (!me.pfUtil.isListEmpty(me.fieldList)) {
      debugger;
    }
    return me.getFieldFullName(field);
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
        return (
          me.sqlQueryUtil.isFilterMatchField(a[1], column, table) &&
          me.aggregationType === a[0]
        );
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
  getAggregationDisplayName(filter: Aggregation) {
    const me = this;

    if ('count' === filter[0]) {
      return '总行数';
    }
    if ('cum-count' === filter[0]) {
      return '累积行数';
    }
    if ('aggregation-options' === filter[0]) {
      //自定义字段
      return filter[2]['display-name'];
    }
    const t = me.aggregationTypeList.find((a) => a.key == filter[0]);

    if (me.sqlQueryUtil.isLiteralField(filter[1])) {
      return me.sqlQueryUtil.getLiteralFieldName(filter[1]) + ' ' + t.value;
    } else {
      const f = me.sqlQueryUtil.getFieldByFilter(filter[1], me.fieldList);

      if (f !== null && f !== undefined) {
        if (t !== null) {
          return (
            me.sqlQueryUtil.getFieldFullName(filter[1], me.fieldList) +
            ' ' +
            t.value
          );
          // if ("field-id" === filter[1][0]) {
          //   return f.value.ColumnName + " " + t.value;
          // } else if ("joined-field" === filter[1][0]) {
          //   return f.key.TableName + "→" + f.value.ColumnName + " " + t.value;
          // }
        }
      }
    }
    return '';
  }
  getAggregationTypeName() {
    const me = this;
    const t = me.aggregationTypeList.find((a) => a.key == me.aggregationType);
    if (!me.pfUtil.isAnyNull(t)) {
      return t.value;
    }
    return '';
  }
  private isAggregationNoField(t: string) {
    const me = this;
    return ['count', 'cum-count'].indexOf(t) > -1;
  }
  goSelectAggregationField(aggregationType: string, selectAggregationPopups) {
    const me = this;
    //debugger;
    if (me.isAggregationNoField(aggregationType)) {
      if (me.pfUtil.isAnyNull(me.query.aggregation)) {
        me.query.aggregation = [];
      }
      let tmp: any = me.query.aggregation;
      if (me.isAdd) {
        tmp.push([aggregationType]);
      } else {
        tmp[me.addingIdx] = [aggregationType];
      }
      selectAggregationPopups.close();
      me.breakoutChange.emit();
    } else {
      me.aggregationType = aggregationType;
      me.aggregationStep = 'field';
    }
  }
  // // deleteAggregation() {}
  // // deleteBreakout() {}
  // public onExpressionOptionChange(event) {
  //   const me = this;
  //   me.addingCustomOption = event;
  //   //me.query.filter = event;//benjamin todo
  // }
  public getCurrentExpressionOption() {
    const me = this;
    //return JSON.stringify(me.testList); //me.query);
    //return JSON.stringify(me.query.aggregation[me.addingIdx]); //me.query);
    return JSON.stringify(me.addingCustomOption); //me.query);
  }

  public getIconTypeByDataType(column: DataColumnModel) {
    const me = this;
    // return "FIELD_STRING";
    //debugger;
    return me.sqlQueryUtil.getIconTypeByDataType(
      me.sqlQueryUtil.getMetabaseBaseType(column.DataType)
    );
  }
  openTableMenuHandler(table: DataTableUIModel): void {
    for (let i = 0; i < this.fieldList.length; i++) {
      if (this.fieldList[i].key.ShortId !== table.ShortId) {
        this.fieldList[i].key.isMenuOpened = false;
      }
    }
  }
}
