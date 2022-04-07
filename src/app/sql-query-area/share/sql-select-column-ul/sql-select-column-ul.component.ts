import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { KeyValuePair } from "../../../common/pfModel";
import { PfUtil } from "../../../common/pfUtil";
import {
  DataColumnModel,
  DataTableUIModel,
} from "../../../model/data-integration";
import {
  DatetimeField,
  FieldLiteral,
  LocalFieldReference,
} from "../../model/Query";
import {
  SelectColumnModel,
  SelectColumnModelClass,
  SelectTableModel,
} from "../../model/SelectColumnModel";
import { KeyValuePairT, SqlQueryUtil } from "../../sql-query-util";

@Component({
  selector: "sql-select-column-ul",
  templateUrl: "./sql-select-column-ul.component.html",
  styleUrls: ["./sql-select-column-ul.component.scss"],
})
export class SqlSelectColumnUlComponent implements OnInit {
  /**
   * @deprecated 使用 selectColumnList代替
   */
  @Input() fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = []; //结构如 [{tb,cols}]
  /**
   * 内层source-query中的聚合输出字段(外层传入比较好)
   * @deprecated 如果能用 selectColumnList 代替,可能更好
   */
  @Input() sourceOutFieldList: FieldLiteral[] = []; //ConcreteField

  // /**
  //  * @deprecated
  //  */
  // @Input() public otherDataModelFieldList: KeyValuePairT<
  //   DatamodelQueryUIModel,
  //   FieldLiteral[]
  // >[] = []; //结构如 [{tb,cols}]
  @Input() public selectColumnList: KeyValuePairT<
    SelectTableModel,
    SelectColumnModel[]
  >[] = []; //结构如 [{tb,cols}]
  /**
   * 感觉这样处理不好,因为order-step选择完saveOrder的时候并不会触发ngOnChanges,如果直接用在ng-if里,性能又会很差
   * 便后来又觉得,如果要手动力维护fieldList的话,当order-step为了排重而删除1个时可能并不麻烦，但要重新加回来时就很麻烦了(因为需要保存删除掉的项目,深想也是不可能这样做的)
   * @deprecated 改为selectColumnFilter
   */
  @Input() fieldFilter: (
    field: DataColumnModel,
    table: DataTableUIModel
  ) => boolean = null;
  /**
   *  @deprecated 改为selectColumnFilter
   */
  @Input() sourceOutFieldFilter: (field: FieldLiteral) => boolean = null;
  @Input() selectColumnFilter: (
    field: SelectColumnModel,
    table: SelectTableModel
  ) => boolean = null;
  /**
   * 显示列的格式器(后来好像只有groupby里用到)
   */
  @Input() showFormatter: boolean = false;
  @Input() color: number[] = [0, 0, 0];

  /**
   * @deprecated 改用selectFieldModel
   */
  @Output() selectSourceOutField = new EventEmitter<FieldLiteral>();
  /**
   * @deprecated 改用selectFieldModel
   */
  @Output() selectField = new EventEmitter<{
    field: DataColumnModel;
    table: DataTableUIModel;
  }>();
  /**
   *  输出没必要显示那么详细,直接用selectFieldModel吧
   * 还是详细点好
   */
  @Output() selectColumnModel = new EventEmitter<{
    field: SelectColumnModel;
    table: SelectTableModel;
  }>();
  // /**
  //  * 打算用此属性统一取代 selectSourceOutField 和 selectField
  //  * 如果以后发现ConcreteField不能满足选择后的判断,就改用selectColumnModel
  //  * @deprecated 后来觉得SqlSelectColumnModel的属性还是不够,因为如filter选择完字段之后的编辑页面里,还需要显示 表名 或 问题名
  //  *
  //  */
  // @Output() selectFieldModel = new EventEmitter<SqlSelectColumnModel>();
  /**
   * 如果不双向绑定1个变量,那后面if的过滤就只会在input失去焦点时才触发
   */
  searchText = "";

  /**
   * 这里不和filter共用一个列表,因为metabase里面groupby的条件是不一样的(如 "一小时内的分钟数",虽然现时还未在此实现)
   */
  public dateTimeFormatList: KeyValuePair[] = [
    { key: "day", value: "天" },
    { key: "month", value: "月" },
    { key: "quarter", value: "季度" },
    { key: "year", value: "年" },
  ];
  //_fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = [];
  constructor(public sqlQueryUtil: SqlQueryUtil) {}

  ngOnInit(): void {}
  ngOnChanges() {
    const me = this;
    // me._fieldList = this.fieldList;
    // console.info(
    //   "------------------SqlSelectColumnUlComponent ngOnChanges--------------------"
    // );
    // if (me.fieldFilter !== null) {
    //   for (let i = me._fieldList.length - 1; i >= 0; i--) {
    //     me._fieldList[i].value = me._fieldList[i].value.filter((a) =>
    //       me.fieldFilter(a, me._fieldList[i].key)
    //     );
    //     // for (let j = me._fieldList[i].value.length - 1; j >= 0; j--) {
    //     //   if(me.fieldFilter(me._fieldList[i].value[j],me._fieldList[i].key)){

    //     //   }else{
    //     //     me._fieldList[i].value.
    //     //   }
    //     // }
    //   }
    // } else {
    // }
  }
  public likeText(columnName: string, text: string) {
    //return columnName.indexOf(text) > -1;
    return PfUtil.likeText(columnName, text);
  }
  // deleteAggregation() {}
  // deleteBreakout() {}
  /**
   * @deprecated
   * @param column
   * @returns
   */
  public getIconTypeByDataType(column: DataColumnModel) {
    const me = this;
    // return "FIELD_STRING";
    //debugger;
    let baseType = me.sqlQueryUtil.getMetabaseBaseType(column.DataType);
    let r = me.sqlQueryUtil.getIconTypeByDataType(baseType);
    // console.info(
    //   "--------------------getIconTypeByDataType------------------------"
    // );
    // console.info(column.DataType);
    // console.info(baseType);
    // console.info(r);
    return r;
  }
  public getIconTypeByDataType2(column: SelectColumnModel) {
    const me = this;
    // return "FIELD_STRING";
    //debugger;
    let baseType = me.sqlQueryUtil.getMetabaseBaseType(column.dataType);
    let r = me.sqlQueryUtil.getIconTypeByDataType(baseType);
    // console.info(
    //   "--------------------getIconTypeByDataType------------------------"
    // );
    // console.info(column.DataType);
    // console.info(baseType);
    // console.info(r);
    return r;
  }
  // openTableMenuHandler(table: DataTableUIModel): void {
  //   const me = this;
  //   for (let i = 0; i < this.fieldList.length; i++) {
  //     //if (this.fieldList[i].key.ShortId !== table.ShortId) {
  //     if (
  //       me.fieldList[i].key.ShortId !== table.ShortId ||
  //       //this.fieldList[i].key.TableShortId !== table.TableShortId ||
  //       me.fieldList[i].key.TableIdxName !== table.TableIdxName
  //     ) {
  //       me.fieldList[i].key.isMenuOpened = false;
  //     }
  //   }
  // }
  openTableMenuHandler(table: SelectTableModel): void {
    const me = this;
    for (let i = 0; i < this.selectColumnList.length; i++) {
      //if (this.fieldList[i].key.ShortId !== table.ShortId) {
      if (
        null !== me.selectColumnList[i].key &&
        !me.selectColumnList[i].key.equalsIdx(table)
      ) {
        me.selectColumnList[i].key.isMenuOpened = false;
      }
    }
  }
  // /**
  //  * @deprecated
  //  * @param column
  //  * @param table
  //  */
  // public onColumnSelect(column: DataColumnModel, table: DataTableUIModel) {
  //   const me = this;
  //   //me.selectField.emit({field:item2,table: table});
  //   let tmpFilter = me.sqlQueryUtil.getFilterByColumn(column, table);
  //   me.selectFieldModel.emit({ field: tmpFilter });
  // }
  // /**
  //  * @deprecated
  //  * @param column
  //  * @param table
  //  * @param key
  //  */
  // public selectDateTimeFormat(
  //   column: DataColumnModel,
  //   table: DataTableUIModel,
  //   key
  // ) {
  //   const me = this;
  //   let tmpFilter = me.sqlQueryUtil.getFilterByColumn(column, table);
  //   let dateTimeFilter: DatetimeField = [
  //     "datetime-field",
  //     tmpFilter as LocalFieldReference,
  //     key,
  //   ];
  //   //debugger;
  //   me.selectFieldModel.emit({ field: dateTimeFilter });
  // }
  // public selectDateTimeFormat2(
  //   column: SelectColumnModel,
  //   table: SelectTableModel,
  //   key
  // ) {
  //   const me = this;
  //   //let tmpFilter = me.sqlQueryUtil.getFilterByColumn(column, table);
  //   // let dateTimeFilter: DatetimeField = [
  //   //   "datetime-field",
  //   //   tmpFilter as LocalFieldReference,
  //   //   key,
  //   // ];
  //   //debugger;
  //   //me.selectFieldModel.emit({ field: dateTimeFilter });
  //   me.selectColumnModel.emit({ field: column, table: table });
  // }
  public selectDateTimeFormat3(
    column: SelectColumnModel,
    table: SelectTableModel,
    key
  ) {
    const me = this;
    if (column.isLiteralField) {
      //如果进入这里,是视图没控制好
    } else {
      let tmpFilter = me.sqlQueryUtil.getFilterByColumn(
        me.sqlQueryUtil.FieldTypeToUIModel(column.column),
        me.sqlQueryUtil.TableTypeToUIModel(table.table)
      );
      let dateTimeFilter: DatetimeField = [
        "datetime-field",
        tmpFilter as LocalFieldReference,
        key,
      ];
      //debugger;
      //me.selectFieldModel.emit({ field: dateTimeFilter });
    }
    me.selectColumnModel.emit({ field: column, table: table });
  }

  // getBackColor(): string {
  //   const me = this;
  //   return me.sqlQueryUtil.getBackColor(me.color);
  // }
  getFrontColor(): string {
    const me = this;
    return me.sqlQueryUtil.getFrontColor(me.color);
  }
  // getFrontHoverColor(): string {
  //   const me = this;
  //   return me.sqlQueryUtil.getFrontHoverColor(me.color);
  // }
  onSourceOutFieldSelect(f: FieldLiteral) {
    const me = this;
    me.selectColumnModel.emit({
      field: new SelectColumnModelClass().initByLiteralField(f, -1),
      table: null,
    });
    //me.selectFieldModel.emit({ field: f });
  }
  onColumnModelSelect(column: SelectColumnModel, table: SelectTableModel) {
    const me = this;
    me.selectColumnModel.emit({ field: column, table: table });
    // if (column.isLiteralField) {
    //   me.selectFieldModel.emit({ field: column.literalField });
    //   console.info(column.literalField);
    // } else {
    //   let tmpFilter = me.sqlQueryUtil.getFilterByColumn(
    //     me.sqlQueryUtil.FieldTypeToUIModel(column.column),
    //     me.sqlQueryUtil.TableTypeToUIModel(table.table)
    //   );
    //   console.info(tmpFilter);
    //   me.selectFieldModel.emit({ field: tmpFilter });
    // }
  }
  isLiteralFieldMatchSelectColumnFilter(f: FieldLiteral) {
    const me = this;
    return (
      null === me.selectColumnFilter ||
      me.selectColumnFilter(
        new SelectColumnModelClass().initByLiteralField(f, -1),
        null
      )
    );
  }
}
