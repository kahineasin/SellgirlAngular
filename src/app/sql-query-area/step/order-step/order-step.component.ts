import { Component, Input, OnInit } from "@angular/core";
import { NzIconService } from "ng-zorro-antd/icon";
import { NzMessageService } from "ng-zorro-antd/message";
import { PfUtil } from "../../../common/pfUtil";
import {
  DatabaseModel,
  DataColumnModel,
  DataTableModel,
  DataTableUIModel,
} from "../../../model/data-integration";
import { ComputesReferenceService } from "../../../service/computes-reference.service";
import { PfSvgIconPathDirective } from "../../../share/pf-svg-icon/pf-svg-icon-path.directive";
import {
  Aggregation,
  ConcreteField,
  FieldLiteral,
  StructuredQuery,
} from "../../model/Query";
import {
  SelectColumnModel,
  SelectTableModel,
} from "../../model/SelectColumnModel";
import { KeyValuePairT, SqlQueryUtil } from "../../sql-query-util";
//import { KeyValuePairT } from "../filter-step/filter-step.component";

export type aggregationStep = "type" | "field";

@Component({
  selector: "order-step",
  templateUrl: "./order-step.component.html",
  styleUrls: ["./order-step.component.scss", "../sql-query-area-step.scss"],
})
export class OrderStepComponent implements OnInit {
  //@Input() public query: DatamodelQuery = null;
  @Input() public query: StructuredQuery = null;

  //@Input() fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = []; //结构如 [{tb,cols}]
  /**
   * 内层source-query中的聚合输出字段(外层传入比较好)
   */
  @Input() sourceOutFieldList: FieldLiteral[] = []; //ConcreteField
  @Input() public selectColumnList: KeyValuePairT<
    SelectTableModel,
    SelectColumnModel[]
  >[] = []; //结构如 [{tb,cols}]
  @Input() color: number[] = [0, 0, 0];
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

  isAdd = true;

  aggregationStep: aggregationStep = "type";
  aggregationTypeList: any = [
    { key: "count", value: "总行数", des: "" },
    { key: "sum", value: "总和", des: "" },
    { key: "avg", value: "平均值", des: "" },
    { key: "distinct", value: "不重复值的总数", des: "" },
    { key: "cum-sum", value: "累积求和", des: "" },
    { key: "cum-count", value: "累积行数", des: "" },
    { key: "stddev", value: "标准差", des: "" },
    { key: "min", value: "最小值", des: "" },
    { key: "max", value: "最大值", des: "" },
  ];
  aggregationType: string = "";
  /**
   * 如果不双向绑定1个变量,那后面if的过滤就只会在input失去焦点时才触发
   */
  searchText = "";
  // public _fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = [];
  // public _sourceOutFieldList: FieldLiteral[] = []; //ConcreteField
  public fieldFilter: (
    field: DataColumnModel,
    table: DataTableUIModel
  ) => boolean = null;

  public sourceOutFieldFilter: (field: FieldLiteral) => boolean = null;
  public selectColumnFilter: (
    field: SelectColumnModel,
    table: SelectTableModel
  ) => boolean = null;

  constructor(
    private reference: ComputesReferenceService,
    private sqlQueryUtil: SqlQueryUtil,
    public pfUtil: PfUtil,
    private msg: NzMessageService,
    private iconService: NzIconService
  ) {
    // document.documentElement.style.setProperty(
    //   "--contentvalue",
    //   this.colorTest
    // );
    const me = this;
    this.iconService.addIconLiteral(
      "pfIcon:LEFT_JOIN",
      PfSvgIconPathDirective.getSvg("SQL_LEFT_JOIN")
    );
  }

  ngOnInit(): void {
    // document.documentElement.style.setProperty(
    //   "--contentvalue",
    //   this.colorTest
    // );
    //debugger;
    const me = this;
    me.fieldFilter = (field, table) => {
      //debugger;
      let r = !me.isExistInBreakout(field, table);
      // console.info("----------------------fieldFilter----------------------");
      // console.info(r);
      // console.info(field);
      // console.info(table);
      return r;
    };
    me.sourceOutFieldFilter = (field) => {
      //debugger;
      let r = !me.isSourceOutFieldExistInBreakout(field);
      // console.info("----------------------fieldFilter----------------------");
      // console.info(r);
      // console.info(field);
      // console.info(table);
      return r;
    };
    me.selectColumnFilter = (field, table) => {
      //debugger;
      let r = !me.isExistInOrder(field, table);
      // console.info("----------------------fieldFilter----------------------");
      // console.info(r);
      // console.info(field);
      // console.info(table);
      return r;
    };
  }
  ngOnChanges() {
    const me = this;
    // //_fieldList是可被修改的,所有最好复制出来
    // me._fieldList = this.fieldList.map(
    //   (a) =>
    //     new KeyValuePairT<DataTableUIModel, DataColumnModel[]>(
    //       a.key,
    //       a.value.map((b) => b)
    //     )
    // );
    // me._sourceOutFieldList = this.sourceOutFieldList.map((a) => a);
    // // console.info(
    // //   "------------------SqlSelectColumnUlComponent ngOnChanges--------------------"
    // // );
    // // if (me.fieldFilter !== null) {
    // //   for (let i = me._fieldList.length - 1; i >= 0; i--) {
    // //     me._fieldList[i].value = me._fieldList[i].value.filter((a) =>
    // //       me.fieldFilter(a, me._fieldList[i].key)
    // //     );
    // //     // for (let j = me._fieldList[i].value.length - 1; j >= 0; j--) {
    // //     //   if(me.fieldFilter(me._fieldList[i].value[j],me._fieldList[i].key)){

    // //     //   }else{
    // //     //     me._fieldList[i].value.
    // //     //   }
    // //     // }
    // //   }
    // // } else {
    // // }

    // for (let i = me._fieldList.length - 1; i >= 0; i--) {
    //   me._fieldList[i].value = me._fieldList[i].value.filter(
    //     (a) => !me.isExistInBreakout(a, me._fieldList[i].key)
    //   );
    //   // for (let j = me._fieldList[i].value.length - 1; j >= 0; j--) {
    //   //   if(me.fieldFilter(me._fieldList[i].value[j],me._fieldList[i].key)){

    //   //   }else{
    //   //     me._fieldList[i].value.
    //   //   }
    //   // }
    // }
    // me._sourceOutFieldList = me._sourceOutFieldList.filter((a) =>
    //   me.isSourceOutFieldExistInBreakout(a)
    // );
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
    me.aggregationStep = "type";
  }
  public initAggregationEditingParam(filter, idx) {
    const me = this;
    me.initEditingParam(idx);
    me.aggregationType = filter[0];
    if (me.isAggregationNoField(filter[0])) {
      me.aggregationStep = "type";
    } else if ("aggregation-options" === filter[0]) {
      me.msg.warning("自定义汇总未实现");
      return;
    } else {
      me.aggregationStep = "field";
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
  public saveOrder(column: DataColumnModel, table: DataTableUIModel) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.query["order-by"])) {
      me.query["order-by"] = [];
    }
    let tmp: any = me.query["order-by"];
    //debugger;
    let tmpFilter = me.sqlQueryUtil.getFilterByColumn(
      column,
      table
      //me.fieldList
    );
    //debugger;
    if (me.isAdd) {
      tmp.push(["asc", tmpFilter]);
    } else {
      //order只有新增没修改
      // let tmpOrder: any = me.query["order-by"];
      // tmpOrder[me.addingIdx] = tmpFilter;
    }
  }
  public saveOrderBySourceOut(field: FieldLiteral) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.query["order-by"])) {
      me.query["order-by"] = [];
    }
    let tmp: any = me.query["order-by"];
    // //debugger;
    // let tmpFilter = me.sqlQueryUtil.getFilterByField(
    //   column,
    //   table,
    //   me.fieldList
    // );
    //debugger;
    if (me.isAdd) {
      tmp.push(["asc", field]);
    } else {
      //order只有新增没修改
      // let tmpOrder: any = me.query["order-by"];
      // tmpOrder[me.addingIdx] = tmpFilter;
    }
    // me._sourceOutFieldList = me._sourceOutFieldList.filter(
    //   (a) => !me.sqlQueryUtil.isLiteralFieldEqual(field, a)
    // );
  }
  public saveOrderBySelectColumnModel(
    field: SelectColumnModel,
    table: SelectTableModel
  ) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.query["order-by"])) {
      me.query["order-by"] = [];
    }
    let tmp: any = me.query["order-by"];
    // //debugger;
    // let tmpFilter = me.sqlQueryUtil.getFilterByField(
    //   column,
    //   table,
    //   me.fieldList
    // );
    //debugger;
    let tmpField = me.sqlQueryUtil.getConcreteFieldBySelectColumn(field, table);
    if (me.isAdd) {
      tmp.push(["asc", tmpField]);
    } else {
      //order只有新增没修改
      // let tmpOrder: any = me.query["order-by"];
      // tmpOrder[me.addingIdx] = tmpFilter;
    }
    // me._sourceOutFieldList = me._sourceOutFieldList.filter(
    //   (a) => !me.sqlQueryUtil.isLiteralFieldEqual(field, a)
    // );
  }
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
      "rgba(" + me.color[0] + "," + me.color[1] + "," + me.color[2] + ",0.1)"
    );
  }
  getFrontColor(): string {
    const me = this;
    return "rgb(" + me.color[0] + "," + me.color[1] + "," + me.color[2] + ")";
  }
  getFrontHoverColor(): string {
    const me = this;
    return (
      "rgba(" + me.color[0] + "," + me.color[1] + "," + me.color[2] + ",0.8)"
    );
  }
  isArray(field): boolean {
    return field instanceof Array;
  }
  getFieldFullName(field: ConcreteField) {
    const me = this;
    //return me.sqlQueryUtil.getFieldFullName(field, me.fieldList);
    return me.sqlQueryUtil.getConcreteFieldFullNameBySelectColumn(
      field,
      me.selectColumnList
    );
  }
  public likeText(columnName: string, text: string) {
    //return columnName.indexOf(text) > -1;
    return PfUtil.likeText(columnName, text);
  }
  // isExistInAggregation(
  //   column: DataColumnModel,
  //   table: DataTableModel
  // ): boolean {
  //   const me = this;
  //   if (me.query.aggregation === null || me.query.aggregation === undefined) {
  //     return false;
  //   }
  //   return (
  //     me.query.aggregation.findIndex((a) => {
  //       //debugger;
  //       return me.sqlQueryUtil.isFilterMatchField(a, column, table);
  //       // const f = me.sqlQueryUti.getFieldByFilter(a, me.fieldList);
  //       // return f !== null;
  //     }) > -1
  //   );
  //   // if (me.pfUtil.isListEmpty(me.fieldList)) {
  //   //   return false;
  //   // }
  //   // debugger;
  //   // const tIdx = me.fieldList.findIndex((a) => a.key.ShortId === table.ShortId);
  //   // if (tIdx < 0) {
  //   //   return false;
  //   // }
  //   // return (
  //   //   me.fieldList[tIdx].value.findIndex((a) => a.ShortId === column.ShortId) >
  //   //   -1
  //   // );
  // }
  isExistInBreakout(column: DataColumnModel, table: DataTableModel): boolean {
    const me = this;
    //console.info("---------------------testIf-------------------" + new Date());
    if (me.query["order-by"] === null || me.query["order-by"] === undefined) {
      return false;
    }
    return (
      me.query["order-by"].findIndex((a) => {
        //debugger;
        return me.sqlQueryUtil.isFilterMatchField(a[1] as any, column, table);
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
  isSourceOutFieldExistInBreakout(field: FieldLiteral): boolean {
    const me = this;
    if (me.pfUtil.isAnyNull(me.query["order-by"])) {
      return false;
    }
    //debugger;
    return (
      me.query["order-by"].findIndex(
        (a) =>
          me.sqlQueryUtil.isLiteralField(a[1] as any) &&
          me.sqlQueryUtil.isLiteralFieldEqual(a[1] as any, field) //&& //每种聚合类型的字段要唯一，否则拼接到select的*列表时重名不好处理，而且重复也是没用处的
        //a[1][1] === field[1] &&
        //a[0] === me.aggregationType
      ) > -1
    );
  }
  isExistInOrder(column: SelectColumnModel, table: SelectTableModel): boolean {
    const me = this;
    if (me.pfUtil.isAnyNull(me.query["order-by"])) {
      return false;
    }
    if (column.isLiteralField) {
      //debugger;
      return (
        me.query["order-by"].findIndex(
          (a) =>
            me.sqlQueryUtil.isLiteralField(a[1] as any) &&
            me.sqlQueryUtil.isLiteralFieldEqual(
              a[1] as any,
              column.literalField
            ) //&& //每种聚合类型的字段要唯一，否则拼接到select的*列表时重名不好处理，而且重复也是没用处的
          //a[1][1] === field[1] &&
          //a[0] === me.aggregationType
        ) > -1
      );
    } else {
      return (
        me.query["order-by"].findIndex((a) => {
          //debugger;
          return me.sqlQueryUtil.isFilterMatchField(
            a[1] as any,
            me.sqlQueryUtil.FieldTypeToUIModel(column.column),
            me.sqlQueryUtil.TableTypeToUIModel(table.table)
          );
          // const f = me.sqlQueryUti.getFieldByFilter(a, me.fieldList);
          // return f !== null;
        }) > -1
      );
    }
  }
  getAggregationDisplayName(filter: Aggregation) {
    const me = this;

    if ("count" === filter[0]) {
      return "总行数";
    }
    if ("cum-count" === filter[0]) {
      return "累积行数";
    }
    if ("aggregation-options" === filter[0]) {
      return filter[2]["display-name"];
    }
    // const f = me.sqlQueryUtil.getFieldByFilter(filter[1], me.fieldList);

    // if (f !== null && f !== undefined) {
    //   const t = me.aggregationTypeList.find((a) => a.key == filter[0]);
    //   if (t !== null) {
    //     return (
    //       me.sqlQueryUtil.getFieldFullName(filter[1], me.fieldList) +
    //       " " +
    //       t.value
    //     );
    //     // if ("field-id" === filter[1][0]) {
    //     //   return f.value.ColumnName + " " + t.value;
    //     // } else if ("joined-field" === filter[1][0]) {
    //     //   return f.key.TableName + "→" + f.value.ColumnName + " " + t.value;
    //     // }
    //   }
    // }
    const t = me.aggregationTypeList.find((a) => a.key == filter[0]);
    if (t !== null) {
      return (
        me.sqlQueryUtil.getConcreteFieldFullNameBySelectColumn(
          filter[1],
          me.selectColumnList
        ) +
        " " +
        t.value
      );
      // if ("field-id" === filter[1][0]) {
      //   return f.value.ColumnName + " " + t.value;
      // } else if ("joined-field" === filter[1][0]) {
      //   return f.key.TableName + "→" + f.value.ColumnName + " " + t.value;
      // }
    }
    return "";
  }
  getAggregationTypeName() {
    const me = this;
    const t = me.aggregationTypeList.find((a) => a.key == me.aggregationType);
    if (t !== null) {
      return t.value;
    }
    return "";
  }
  private isAggregationNoField(t: string) {
    const me = this;
    return ["count", "cum-count"].indexOf(t) > -1;
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
      me.aggregationStep = "field";
    }
  }
  //-----------------选择列弹窗----------------------
  // deleteAggregation() {}
  // deleteBreakout() {}
  public getIconTypeByDataType(column: DataColumnModel) {
    const me = this;
    // return "FIELD_STRING";
    //debugger;
    return me.sqlQueryUtil.getIconTypeByDataType(
      me.sqlQueryUtil.getMetabaseBaseType(column.DataType)
    );
  }
  // openTableMenuHandler(table: DataTableUIModel): void {
  //   for (let i = 0; i < this.fieldList.length; i++) {
  //     if (this.fieldList[i].key.ShortId !== table.ShortId) {
  //       this.fieldList[i].key.isMenuOpened = false;
  //     }
  //   }
  // }
}
