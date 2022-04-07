//import type { ISO8601Time } from ".";

import { Card } from "./Card";
import type { Field } from "./Field";
import { FieldLiteral } from "./Query";
import { Table } from "./Table";

export type TableId = number;
export type SchemaName = string;

//export type SelectColumnType = "literal" | "dataModel" | "table";
/**
 * 专门用于filter-step aggregation-step 等的可选字段模型(为了统一 inner out 字段和 Column)
 */
export interface SelectColumnModel {
  id: number;
  /**
   * 为了便于比较,相当于 id??name
   */
  key: string;
  name: string;
  display_name: string;
  displayIdxName: string;
  dataType: string;
  //columnType: SelectColumnType;

  isLiteralField: boolean;
  selected: boolean;
  column: Field;
  literalField: FieldLiteral;
  tableId: number;
  equals(other: SelectColumnModel): boolean;
  //getDisplayName(): string;
  setDisplayIdx(idx: number): void;
}
export class SelectColumnModelClass implements SelectColumnModel {
  id: number;
  key: string; //为了便于比较,相当于 id??name
  name: string;
  display_name: string;
  displayIdxName: string;
  dataType: string;
  //columnType: SelectColumnType;

  isLiteralField: boolean;
  selected: boolean;
  column: Field;
  literalField: FieldLiteral;
  tableId: number;

  constructor() {}
  // constructor(literalField: FieldLiteral | Field, isLiteralField: boolean) {
  //   const me = this;
  //   if (isLiteralField) {
  //     me.literalField = literalField as FieldLiteral;
  //     //me.id = me.literalField[1];
  //     me.name = me.literalField[1];
  //     me.display_name = me.literalField[1];
  //     me.dataType = me.literalField[2];
  //   } else {
  //     me.column = literalField as Field;
  //     me.id = me.column.id;
  //     me.name = me.column.name;
  //     me.display_name = me.column.display_name;
  //     me.dataType = me.column.base_type;
  //   }
  //   me.isLiteralField = isLiteralField;
  //   me.setDisplayIdx(1);
  // }
  /**
   *
   * @param literalField
   * @param tableId tableId 或 dataModelId
   * @returns
   */
  initByLiteralField(
    literalField: FieldLiteral,
    tableId: number
  ): SelectColumnModel {
    const me = this;
    me.literalField = literalField as FieldLiteral;
    //me.id = me.literalField[1];
    me.key = me.literalField[1];
    me.name = me.literalField[1];
    me.display_name = me.literalField[1];
    me.dataType = me.literalField[2];
    me.isLiteralField = true;
    me.tableId = tableId;
    me.setDisplayIdx(1);
    return this;
  }
  initByField(literalField: Field): SelectColumnModel {
    const me = this;
    me.column = literalField as Field;
    me.id = me.column.id;
    me.key = me.id.toString();
    me.name = me.column.name;
    me.display_name =
      me.column.display_name === "" ? me.column.name : me.column.display_name;
    me.dataType = me.column.base_type;
    me.isLiteralField = false;
    me.tableId = literalField.table_id;
    me.setDisplayIdx(1);
    return this;
  }
  // constructor(
  //   literalField: FieldLiteral | Field,
  //   columnType: SelectColumnType
  // ) {
  //   const me = this;
  //   if ("literal" === columnType || "dataModel" === columnType) {
  //     me.literalField = literalField as FieldLiteral;
  //     //me.id = me.literalField[1];
  //     me.name = me.literalField[1];
  //     me.display_name = me.literalField[1];
  //     me.dataType = me.literalField[2];
  //     me.isLiteralField = true;
  //     me.columnType = columnType;
  //   } else {
  //     me.column = literalField as Field;
  //     me.id = me.column.id;
  //     me.name = me.column.name;
  //     me.display_name = me.column.display_name;
  //     me.dataType = me.column.base_type;
  //     me.isLiteralField = false;
  //     me.columnType = columnType;
  //   }
  // }
  public equals(other: SelectColumnModel): boolean {
    const me = this;
    if (me.isLiteralField) {
      return (
        other.isLiteralField && me.literalField[1] === other.literalField[1]
      );
    } else {
      return false === other.isLiteralField && me.column.id === other.column.id;
    }
  }
  // getDisplayName(): string {
  //   const me = this;
  //   return me.name + "(" + me.display_name + ")";
  // }
  setDisplayIdx(idx: number): void {
    const me = this;
    //me.displayIdx = idx;
    me.displayIdxName =
      me.name +
      (me.display_name === me.name ? "" : "(" + me.display_name + ")");
  }
}

export interface SelectTableModel {
  id: number;
  name: string;
  display_name: string;
  displayIdxName: string;

  isDataModel: boolean;
  //selected: boolean;
  table: Table;
  dataModel: Card;
  //equals(other: SelectColumnModel): boolean;

  // //下面是非数据库字段,用于页面显示
  isJoinedTable?: boolean;
  isMenuOpened?: boolean;
  /**
   * Table唯一名,当join相当table时,后面要加_1 _2来区分
   */
  displayIdx: number;

  databaseId: number;

  // /**
  //  * 如 表01_2:字段01  表01_2:字段02
  //  */
  // getDisplayIdxName(): string;
  equals(other: SelectTableModel): boolean;
  equalsIdx(other: SelectTableModel): boolean;
  setDisplayIdx(idx: number): void;
}
export class SelectTableModelClass implements SelectTableModel {
  id: number;
  name: string;
  display_name: string;
  displayIdxName: string;

  isDataModel: boolean;
  table: Table;
  dataModel: Card;

  // //下面是非数据库字段,用于页面显示
  isJoinedTable?: boolean = true;
  isMenuOpened?: boolean = false;
  /**
   * Table唯一名,当join相当table时,后面要加_1 _2 _3来区分(为1时不显示)
   */
  displayIdx: number = 1;

  databaseId: number;
  constructor() {}
  // constructor(card: Card | Table, isDataModel: boolean) {
  //   const me = this;
  //   if (isDataModel) {
  //     me.dataModel = card as Card;
  //     me.id = me.dataModel.id;
  //     me.name = me.dataModel.name;
  //     me.display_name = me.dataModel.display;
  //     //me.displayIdx = 1;
  //   } else {
  //     me.table = card as Table;
  //     me.id = me.table.id;
  //     me.name = me.table.name;
  //     me.display_name = me.table.display_name;
  //     //me.displayIdx = 1;
  //   }
  //   me.isDataModel = isDataModel;
  //   //me.displayIdxName = this.getDisplayIdxName();
  //   me.setDisplayIdx(1);
  // }

  initByCard(card: Card): SelectTableModel {
    const me = this;
    me.dataModel = card as Card;
    me.id = me.dataModel.id;
    me.name = me.dataModel.name;
    me.display_name = me.dataModel.display;
    //me.displayIdx = 1;
    me.isDataModel = true;
    me.databaseId =
      null !== card.dataset_query && undefined !== card.dataset_query
        ? card.dataset_query.database
        : -1;
    me.setDisplayIdx(1);
    return this;
  }
  initByTable(card: Table): SelectTableModel {
    const me = this;
    me.table = card as Table;
    me.id = me.table.id;
    me.name = me.table.name;
    me.display_name = me.table.display_name;
    me.isDataModel = false;
    //me.displayIdxName = this.getDisplayIdxName();
    me.databaseId = card.db_id;
    me.setDisplayIdx(1);
    return this;
  }
  public equals(other: SelectTableModel): boolean {
    const me = this;
    return me.isDataModel === other.isDataModel && me.id === other.id;
  }
  public equalsIdx(other: SelectTableModel): boolean {
    const me = this;
    return (
      me.isDataModel === other.isDataModel &&
      me.id === other.id &&
      me.displayIdxName === other.displayIdxName
    );
  }
  // getDisplayIdxName(): string {
  //   const me = this;
  //   return (
  //     me.name +
  //     "(" +
  //     me.display_name +
  //     ")" +
  //     (this.displayIdx < 2 ? "" : "_" + me.displayIdx)
  //   );
  // }
  setDisplayIdx(idx: number): void {
    const me = this;
    me.displayIdx = idx;
    me.displayIdxName =
      me.name +
      (me.display_name === me.name ? "" : "(" + me.display_name + ")") +
      (this.displayIdx < 2 ? "" : "_" + me.displayIdx);
  }
}
