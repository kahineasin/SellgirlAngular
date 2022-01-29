import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PfUtil } from '../../../common/pfUtil';
import {
  DataColumnModel,
  DataTableUIModel,
} from '../../../model/data-integration';
import { FieldLiteral } from '../../model/Query';
import { KeyValuePairT, SqlQueryUtil } from '../../sql-query-util';

@Component({
  selector: 'sql-select-column-ul',
  templateUrl: './sql-select-column-ul.component.html',
  styleUrls: ['./sql-select-column-ul.component.scss'],
})
export class SqlSelectColumnUlComponent implements OnInit {
  @Input() fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = []; //结构如 [{tb,cols}]
  /**
   * 内层source-query中的聚合输出字段(外层传入比较好)
   */
  @Input() sourceOutFieldList: FieldLiteral[] = []; //ConcreteField

  /**
   * 感觉这样处理不好,因为order-step选择完saveOrder的时候并不会触发ngOnChanges,如果直接用在ng-if里,性能又会很差
   * 便后来又觉得,如果要手动力维护fieldList的话,当order-step删除1个时,
   */
  @Input() fieldFilter: (
    field: DataColumnModel,
    table: DataTableUIModel
  ) => boolean = null;

  @Input() sourceOutFieldFilter: (field: FieldLiteral) => boolean = null;

  @Output() selectSourceOutField = new EventEmitter<FieldLiteral>();
  @Output() selectField = new EventEmitter<{
    field: DataColumnModel;
    table: DataTableUIModel;
  }>();
  /**
   * 如果不双向绑定1个变量,那后面if的过滤就只会在input失去焦点时才触发
   */
  searchText = '';
  //_fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = [];
  constructor(private sqlQueryUtil: SqlQueryUtil) {}

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
  public getIconTypeByDataType(column: DataColumnModel) {
    const me = this;
    // return "FIELD_STRING";
    //debugger;
    return me.sqlQueryUtil.getIconTypeByDataType(
      me.sqlQueryUtil.getMetabaseBaseType(column.DataType)
    );
  }
  openTableMenuHandler(table: DataTableUIModel): void {
    const me = this;
    for (let i = 0; i < this.fieldList.length; i++) {
      //if (this.fieldList[i].key.ShortId !== table.ShortId) {
      if (
        me.fieldList[i].key.ShortId !== table.ShortId ||
        //this.fieldList[i].key.TableShortId !== table.TableShortId ||
        me.fieldList[i].key.TableIdxName !== table.TableIdxName
      ) {
        me.fieldList[i].key.isMenuOpened = false;
      }
    }
  }
}
