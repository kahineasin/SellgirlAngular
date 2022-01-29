import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KeyValuePair } from '../../../common/pfModel';
import { PfUtil } from '../../../common/pfUtil';
import {
  DatabaseModel,
  DataColumnModel,
  DataTableModel,
  DataTableUIModel,
} from '../../../model/data-integration';
import { ComputesReferenceService } from '../../../service/computes-reference.service';
import { remove, update } from '../../lib/query/util';
import {
  ConcreteField,
  FieldLiteral,
  Join,
  StructuredQuery,
} from '../../model/Query';
import { KeyValuePairT, SqlQueryUtil } from '../../sql-query-util';
//import { KeyValuePairT } from "../filter-step/filter-step.component";

export type selectTableStep = 'database' | 'table';

@Component({
  selector: 'join-step',
  templateUrl: './join-step.component.html',
  styleUrls: ['./join-step.component.scss', '../sql-query-area-step.scss'],
})
export class JoinStepComponent implements OnInit {
  @Input() public databaseId: number = null;
  @Input() color: number[] = [0, 0, 0];
  @Input() public query: StructuredQuery = null;
  @Input() public join: Join = null;
  // @Input() public databaseList: DatabaseModel[] = [];
  //@Input() public tableId?: number = null; //"jack";
  //@Input() public tableList: DataTableUIModel[] = [];

  // @Input() public sourceTableId: string = "";
  @Input() fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = []; //结构如 [{tb,cols}]
  /**
   * 内层source-query中的聚合输出字段(外层传入比较好)
   */
  @Input() sourceOutFieldList: FieldLiteral[] = []; //ConcreteField
  // @Input() public tableList: KeyValuePair[] = [];
  public tableList: DataTableUIModel[] = [];
  //@Output() public sourceTableIdChange = new EventEmitter(); //命名一定要是上面的字段名后加Change
  @Output() public tableIdChange = new EventEmitter<void>(); //命名一定要是上面的字段名后加Change
  /**
   * 暂时是为了在sql-query-field里判断聚合按钮是否需要更新显示状态
   */
  @Output() public joinFieldChange = new EventEmitter<void>();

  //public fieldId: string[] = [];
  //public fieldList: string[] = [];
  joinType: string = 'left-join';
  searchText: string = '';
  joinTypeList: KeyValuePair[] = [
    { key: 'left-join', value: 'left join' },
    { key: 'right-join', value: 'right join' },
    { key: 'inner-join', value: 'inner join' },

    // { key: "=", value: "是" },
    // { key: "!=", value: "不是" },
    // { key: "contains", value: "包含" },
    // { key: "does-not-contain", value: "不包含" },
    // { key: "is-null", value: "为空" },
    // { key: "not-null", value: "不为空" },
    // { key: "starts-with", value: "以...开始" },
    // { key: "ends-with", value: "以...结束" },
  ];
  leftFieldList: KeyValuePair[] = [];
  rightFieldList: KeyValuePair[] = [];
  step: selectTableStep = 'table';
  public databaseList: DatabaseModel[] = [];
  addingDatabase?: DatabaseModel = null;
  leftTable?: DataTableUIModel = null;
  rightTable?: DataTableUIModel = null;
  addingIdx?: any = null;
  isAdd = true;

  //joinOn弹窗
  // leftFieldId = -1;
  // rightFieldId = -1;
  leftFieldId = '';
  rightFieldId = '';
  leftFieldName = '';
  rightFieldName = '';
  leftField: DataColumnModel = null;
  rightField: DataColumnModel = null;

  fieldForm: FormGroup = null;

  isSourceQuery: boolean = false;

  /**
   * 输出列的id
   */
  public outFieldId: number[] = [];
  constructor(
    private reference: ComputesReferenceService,
    private sqlQueryUtil: SqlQueryUtil,
    public pfUtil: PfUtil,
    private fb: FormBuilder,
    public el: ElementRef
  ) {
    const me = this;
    me.fieldForm = this.fb.group({
      //leftFieldId: ["51", Validators.required],
      leftFieldId: ['', Validators.required],
      //leftFieldId3: ["", Validators.required],
      rightFieldId: ['', Validators.required],
    });
  }

  ngOnInit(): void {}
  ngOnChanges() {
    const me = this;
    // //console.info("ngOnChanges:" + this.tableList.length);
    // //tableList是在父组件的OnInit中异步取得的,所以只能在本组件的ngOnChanges里处理
    //新版tableList改为父组件传入,应该不用在这里更新了,试试吧
    // me.addingTable = this.tableList.find(
    //   (a) => a.ShortId == me.query["source-table"]
    // );
    // me.addingTable = this.tableList.find(
    //   (a) => a.ShortId == me.join["source-table"]
    // );
    // me.addingDatabase = this.databaseList.find(
    //   (a) => a.ShortId == me.query.database
    // );

    me.isSourceQuery = !me.pfUtil.isAnyNull(me.query['source-query']);

    me.reference.getDatabasePageList().subscribe((response) => {
      me.databaseList = response.DataSource;
      me.addingDatabase = me.databaseList.find(
        //(a) => a.ShortId == me.query.database
        (a) => a.ShortId == me.databaseId
      );
    });
    if (!me.pfUtil.isListEmpty(this.fieldList)) {
      if (!me.isSourceQuery) {
        let leftTableTmp = this.fieldList.find(
          (a) => a.key.ShortId == me.query['source-table']
        );
        //注意这里一般是不会null的,但当删除外层嵌套时,leftTable先更新,但fieldList异步更新会找不到
        if (!me.pfUtil.isAnyNull(leftTableTmp)) {
          // me.leftTable = this.fieldList.find(
          //   (a) => a.key.ShortId == me.query["source-table"]
          // ).key;
          me.leftTable = leftTableTmp.key;
          me.leftFieldList = me.getFieldDropdownDataByTableId(
            me.query['source-table']
          );
        }
      } else {
        me.leftFieldList = me.sourceOutFieldList.map(
          (a) => new KeyValuePair(a[1], a[1])
        );
      }
      if (!me.pfUtil.isAnyNull(me.join['source-table'])) {
        let rightTableTmp = this.fieldList.find(
          (a) =>
            a.key.ShortId == me.join['source-table'] &&
            a.key.TableIdxName === me.join.alias
        );
        if (!me.pfUtil.isAnyNull(rightTableTmp)) {
          me.rightTable = rightTableTmp.key;
          me.rightFieldList = me.getFieldDropdownDataByTableId(
            me.join['source-table']
          );

          if ('all' === me.join.fields) {
            me.outFieldId = me.rightFieldList.map((a) => parseInt(a.key));
          } else if ('none' === me.join.fields) {
            me.outFieldId = [];
          } else {
            const tmp: any[] = me.join.fields;
            //debugger;
            me.outFieldId = me.rightFieldList
              .filter(
                (a) => tmp.findIndex((b) => b[2][1].toString() === a.key) > -1
              )
              .map((a) => parseInt(a.key));
          }
        }
      }
    }
    me.joinType = me.join.strategy;
    //console.info("join-step ngOnChanges");

    // me.sqlQueryUtil.queryFields(this.query).subscribe(
    //   (response) => {
    //     //me.fieldList = response;
    //     me.leftFieldList = me.getFieldDropdownDataByTableId(
    //       me.query["source-table"]
    //     );
    //     me.rightFieldList = me.getFieldDropdownDataByTableId(
    //       me.join["source-table"]
    //     );
    //   },
    //   (e) => {
    //     debugger;
    //   }
    // );
    //me.fieldList = response;
  }
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
  public getSourceName() {
    const me = this;
    if (me.pfUtil.isAnyNull(me.query['source-query'])) {
      return me.getTableName(me.query['source-table']);
    } else {
      return '上一个结果集';
    }
  }
  public getTableName(tableId) {
    const me = this;
    // if (me.addingTable !== null && me.addingTable !== undefined) {
    //   //选择table后,fieldList是异步更新的,用addingTable的name反而更实时
    //   return me.addingTable.TableName;
    // }
    if (me.fieldList.length < 1) {
      return '请选择表';
    }
    //debugger;
    const item = me.fieldList.find((a) => a.key.ShortId === tableId);
    if (item !== null && item !== undefined) {
      return item.key.TableName;
    }
    return '请选择表';
  }
  public getJoinTableName(tableId) {
    const me = this;
    if (me.rightTable !== null && me.rightTable !== undefined) {
      //选择table后,fieldList是异步更新的,用addingTable的name反而更实时
      return me.rightTable.TableName;
    }
    return me.getTableName(tableId);
  }
  // public getTableName() {
  //   const me = this;
  //   return me.addingTable === null || me.addingTable === undefined
  //     ? "请选择表"
  //     : me.addingTable.TableName;
  // }
  // public getJoinTableName() {
  //   const me = this;
  //   if (me.fieldList.length < 1) {
  //     return "";
  //   }
  //   //debugger;
  //   const item = me.fieldList.find(
  //     (a) => a.key.ShortId === me.join["source-table"]
  //   );
  //   if (item !== null && item !== undefined) {
  //     return item.key.TableName;
  //   }
  //   return "";
  // }
  public showSelectTablePopups(event, selectTablePopups) {
    const me = this;
    const btn = event.currentTarget;
    //if (me.query.database === null) {
    if (me.databaseId === null) {
      me.step = 'database';
      me.reference.getDatabasePageList().subscribe((response) => {
        me.databaseList = response.DataSource;
        selectTablePopups.open(btn);
      });
    } else {
      me.step = 'table';
      //me.reference.getDataTableList(me.query.database).subscribe((response) => {
      me.reference.getDataTableList(me.databaseId).subscribe((response) => {
        me.tableList = response.DataSource;
        selectTablePopups.open(btn);
      });
    }
    // if("database"==me.step){
    //   me.goSelectDatabase()
    // }
    // selectTablePopups.open(event.currentTarget);
  }
  goSelectTable(database: DatabaseModel, addFilterPopups) {
    const me = this;
    me.step = 'table';
    //me.query.database = database.ShortId;
    me.addingDatabase = database;

    me.tableList = [];
    if (me.query != null) {
      me.reference.getDataTableList(database.ShortId).subscribe((response) => {
        me.tableList = response.DataSource;
        addFilterPopups.resize();
      });
    }
  }
  goSelectDatabase(addFilterPopups) {
    const me = this;
    me.step = 'database';
    if (me.query != null) {
      me.reference.getDatabasePageList().subscribe((response) => {
        me.databaseList = response.DataSource;
        console.info(response.DataSource);
        addFilterPopups.resize();
      });
    }
  }
  private getAliasTableName(table: DataTableUIModel) {
    const me = this;
    let aliasName = table.TableName;
    let cnt = 2;
    while (
      me.query.joins.findIndex((a) => a.alias === aliasName) > -1 ||
      me.leftTable.TableName === aliasName
    ) {
      aliasName = table.TableName + '_' + cnt.toString();
      cnt++;
    }
    table.TableIdxName = aliasName;
    return aliasName;
  }
  selectTable(table: DataTableUIModel) {
    const me = this;
    me.rightTable = table;
    //注意这里修改了join是不会触发ngOnChanges的
    me.join['source-table'] = table.ShortId;
    //me.tableIdChange.emit(me.query["source-table"]);
    me.tableIdChange.emit();
    me.join.condition = [];
    // let cnt = me.query.joins.filter(
    //   (a) => a["source-table"] === table.ShortId
    // ).length;

    //这样算cnt不严谨,例如1 2 3删除2的话，再加1个，就会变成1 3 3
    // let cnt =
    //   me.fieldList.filter((a) => a.key.ShortId === table.ShortId).length + 1;
    // me.join.alias =
    //   cnt < 2 ? table.TableName : table.TableName + "_" + cnt.toString();

    me.join.alias = me.getAliasTableName(table);

    //此时query中并没有增加新的tableId,所以不能这样
    me.sqlQueryUtil.queryFields(me.databaseId, this.query).subscribe(
      (response) => {
        me.fieldList = response;
        // me.leftFieldList = me.getFieldDropdownDataByTableId(
        //   me.query["source-table"]
        // );
        // me.rightFieldList = me.getFieldDropdownDataByTableId(
        //   me.join["source-table"]
        // );
        // me.rightTable = me.fieldList.find(
        //   (a) => a.key.ShortId == me.join["source-table"]
        // ).key;
        me.rightFieldList = me.getFieldDropdownDataByTableId(
          me.join['source-table']
        );

        setTimeout(function () {
          // // const targetElement =
          // //   me.el.nativeElement.ownerDocument.getElementsByClassName(
          // //     "addConditionBtn"
          // //   )[0];
          // const targetElement = document.querySelector(".addConditionBtn");
          // debugger;
          // const event =
          //   me.el.nativeElement.ownerDocument.createEvent("HTMLEvents");
          // event.initEvent("click", true, false);
          // targetElement.dispatchEvent(event);
          //debugger;
          me.pfUtil.triggerEvent(
            me.el.nativeElement.ownerDocument,
            // ".addConditionBtn",
            me.el.nativeElement.querySelector('.addConditionBtn'),
            'click'
          );
        }, 100);
      },
      (e) => {
        debugger;
      }
    );
    // me.sqlQueryUtil
    //   .queryFieldsByTableId(me.query.database, [
    //     me.query["source-table"],
    //     ...me.query.joins.map((a) => a["source-table"], table.ShortId),
    //   ])
    //   .subscribe(
    //     (response) => {
    //       me.fieldList = response;
    //       // me.leftFieldList = me.getFieldDropdownDataByTableId(
    //       //   me.query["source-table"]
    //       // );
    //       // me.rightFieldList = me.getFieldDropdownDataByTableId(
    //       //   me.join["source-table"]
    //       // );
    //     },
    //     (e) => {
    //       debugger;
    //     }
    //   );
  }
  public likeText(columnName: string, text: string) {
    // if (columnName !== undefined) {
    //   return columnName.indexOf(text) > -1;
    // }
    // return false;
    return PfUtil.likeText(columnName, text);
  }
  public getDatabaseName() {
    const me = this;
    return me.addingDatabase === null || me.addingDatabase === undefined
      ? '请选择数据库'
      : me.addingDatabase.DatabaseName;
  }
  // showSelectFieldPopups(filter, event, selectFieldPopups) {
  //   const me = this;
  //   const btn = event.currentTarget;
  //   // // me.isAdd = false;
  //   // // // me.addAndOr = filter[0];
  //   // // // me.addStep = "compare";
  //   // const f = me.sqlQueryUtil.getFieldByFilter(filter[1], me.fieldList);
  //   // const f2 = me.sqlQueryUtil.getFieldByFilter(filter[1], me.fieldList);
  //   // if (f !== null && f2 !== null) {
  //   //   me.leftField = f.value;
  //   //   me.rightField = f2.value;
  //   //   me.leftFieldId = f.value.ShortId.toString();
  //   //   me.rightFieldId = f2.value.ShortId.toString();
  //   //   // me.addingTable = f.key;
  //   //   // me.addingColumn = f.value;
  //   //   // me.compareValue = filter[2];
  //   // }
  //   selectFieldPopups.open(btn);
  // }
  getFieldFullName(filter): string {
    const me = this;
    // if (
    //   filter !== undefined &&
    //   filter.length > 1 &&
    //   filter[1] === "T_System_Monitor_Server"
    // ) {
    //   debugger;
    // }
    return me.sqlQueryUtil.getFieldFullName(filter, me.fieldList);
  }
  getFieldName(filter): string {
    const me = this;
    // if (
    //   filter !== undefined &&
    //   filter.length > 1 &&
    //   filter[1] === "T_System_Monitor_Server"
    // ) {
    //   debugger;
    // }
    return me.sqlQueryUtil.getFieldName(filter, me.fieldList);
  }
  initAddingParam() {
    const me = this;
    me.isAdd = true;
    //me.isAddingBracket = false;
    //me.addAndOr = "and";
    me.leftField = null;
    me.rightField = null;
    me.leftFieldId = '';
    me.rightFieldId = '';
    //me.fieldForm.reset();
    //formDirective.resetForm();
    // Object.keys(me.fieldForm.controls).forEach((key) => {
    //   me.fieldForm.get(key).setErrors(null);
    // });
    // me.fieldForm.reset(
    //   { leftFieldId: "", rightFieldId: "" },
    //   { emitEvent: false }
    // );
    me.pfUtil.resetForm(
      me.fieldForm,
      { leftFieldId: '', rightFieldId: '' },
      { emitEvent: false }
    );
    // // debugger;
    // me.fieldForm = this.fb.group({
    //   //leftFieldId: ["51", Validators.required],
    //   leftFieldId: ["", Validators.required],
    //   //leftFieldId3: ["", Validators.required],
    //   rightFieldId: ["", Validators.required],
    // });
    // me.fieldForm.patchValue(
    //   { leftFieldId: "", rightFieldId: "" },
    //   { emitEvent: false }
    // ); //这样会触发验证红框,看看怎么可以跳过--benjamin
  }
  initEditingParam(/*filter,*/ idx, filter) {
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

    const f = me.sqlQueryUtil.getFieldByFilter(filter[1], me.fieldList);
    const f2 = me.sqlQueryUtil.getFieldByFilter(filter[2], me.fieldList);
    // if (f !== null && f2 !== null) {
    if (!me.pfUtil.isAnyNull(f)) {
      me.leftField = f.value;
      me.leftFieldId = f.value.ShortId.toString();
      // me.addingTable = f.key;
      // me.addingColumn = f.value;
      // me.compareValue = filter[2];
    } else {
      me.leftField = null;
      me.leftFieldId = '';
    }
    //debugger;
    if (!me.pfUtil.isAnyNull(f2)) {
      me.rightField = f2.value;
      me.rightFieldId = f2.value.ShortId.toString();
      // me.addingTable = f.key;
      // me.addingColumn = f.value;
      // me.compareValue = filter[2];
    } else {
      me.rightField = null;
      me.rightFieldId = '';
    }
    me.fieldForm.patchValue(
      {
        leftFieldId: me.leftFieldId,
        rightFieldId: me.rightFieldId,
      },
      { emitEvent: false }
    );
    me.addingIdx = idx;
  }
  public saveField(selectFieldPopups) {
    const me = this;
    for (const i in this.fieldForm.controls) {
      this.fieldForm.controls[i].markAsDirty();
      this.fieldForm.controls[i].updateValueAndValidity();
    }
    if (!this.fieldForm.valid) {
      return;
    }
    me.leftFieldId = me.fieldForm.value.leftFieldId;
    me.rightFieldId = me.fieldForm.value.rightFieldId;
    //debugger;
    me.rightField = me.fieldList
      .find((a) => a.key.ShortId === me.join['source-table'])
      .value.find(
        (a) => a.ShortId.toString() === me.fieldForm.value.rightFieldId
      );
    let filter1: ConcreteField = null;
    if (me.isSourceQuery) {
      filter1 = me.sourceOutFieldList.find((a) => a[1] === me.leftFieldId);
    } else {
      me.leftField = me.fieldList
        .find((a) => a.key.ShortId === me.query['source-table'])
        .value.find(
          (a) => a.ShortId.toString() === me.fieldForm.value.leftFieldId
        );
      // filter1 = me.sqlQueryUtil.getFilterByField(
      //   me.leftField,
      //   me.leftTable,
      //   me.fieldList
      // );
      filter1 = me.sqlQueryUtil.getFilterByColumn(
        me.leftField,
        me.leftTable
        //me.fieldList
      );
    }

    // const filter2 = me.sqlQueryUtil.getFilterByField(
    //   me.rightField,
    //   me.rightTable,
    //   me.fieldList
    // );
    const filter2 = me.sqlQueryUtil.getJoinFilterByColumn(
      me.rightField,
      me.rightTable
    );
    debugger;

    const compare = ['=', filter1, filter2];
    let tmpFilter: any = me.join.condition;
    if (me.isAdd) {
      if (tmpFilter.length > 0) {
        tmpFilter.push('and');
      }
      tmpFilter.push(compare);
    } else {
      //tmpFilter[me.addingIdx] = compare;
      let tmpJoin: any = me.join;
      //update(tmpFilter, me.addingIdx, compare);
      // // let tmpTest = update(tmpFilter, me.addingIdx, compare);
      // debugger;
      tmpJoin.condition = update(tmpFilter, me.addingIdx, compare);
      // tmpJoin.condition.splice(me.addingIdx, 1, compare);

      // tmpFilter[0] = me.compare;
      // tmpFilter[1] = me.getFilterByAdding();
      // tmpFilter[2] = filterValue;
    }
    selectFieldPopups.close();
    me.joinFieldChange.emit();
  }
  isArray(field): boolean {
    return field instanceof Array;
  }
  // getFieldDropdownData(columns: DataColumnModel[]) {
  //   if (columns === null || columns === undefined) {
  //     return [];
  //   }
  //   return columns.map((a) => new KeyValuePair(a.ColumnName, a.ColumnName));
  // }

  isFieldListEmpty() {}
  getFieldDropdownDataByTableId(tableId: number) {
    const me = this;
    if (me.pfUtil.isListEmpty(me.fieldList)) {
      return [];
    }
    const item = me.fieldList.find((a) => a.key.ShortId === tableId);
    if (item !== null && item !== undefined) {
      return me.fieldList
        .find((a) => a.key.ShortId === tableId)
        .value.map((a) => new KeyValuePair(a.ShortId.toString(), a.ColumnName));
    }
    return [];
  }
  deleteCompare(idx, first) {
    const me = this;
    // //debugger;
    // // if (idx > 1) {
    // //   me.join.condition.splice(idx - 1, 2);
    // // } else {
    // //   me.join.condition.splice(idx, 1);
    // // }
    // if (first) {
    //   if (idx + 1 < me.join.condition.length) {
    //     me.join.condition.splice(idx + 1, 1);
    //   } else {
    //     // //删除完之后为空数组
    //     // //benjamin todo
    //     // me.deleteStep.emit();
    //   }
    //   me.join.condition.splice(idx, 1);
    // } else {
    //   me.join.condition.splice(idx, 1);
    //   me.join.condition.splice(idx - 1, 1);
    // }
    me.sqlQueryUtil.deleteCompare(me.join.condition, idx, first);
  }

  public onSelectAll(selected: boolean) {
    const me = this;
    if (selected) {
      if (me.outFieldId.length === me.rightFieldList.length) {
        //全选且已全选,这种情况应该不存在
      } else {
        me.outFieldId = me.rightFieldList.map((a) => parseInt(a.key));
        me.saveColumn();
      }
    } else {
      me.outFieldId = [];
      me.saveColumn();
    }
  }
  // public onSelect(selected: boolean, column: DataColumnModel) {
  //   const me = this;
  //   if (selected) {
  //     me.outFieldId.push(column.ShortId);
  //   } else {
  //     me.outFieldId = me.outFieldId.filter((a) => a != column.ShortId);
  //   }
  //   me.saveColumn();
  // }
  public onSelect(selected: boolean, column: KeyValuePair) {
    const me = this;
    if (selected) {
      me.outFieldId.push(parseInt(column.key));
    } else {
      me.outFieldId = me.outFieldId.filter((a) => a.toString() !== column.key);
    }
    me.saveColumn();
  }

  private saveColumn() {
    const me = this;
    //let tmp = me.join;
    if (me.outFieldId.length === me.rightFieldList.length) {
      me.join.fields = 'all';
    } else if (0 === me.outFieldId.length) {
      me.join.fields = 'none';
    } else {
      me.join.fields = me.rightFieldList
        .filter((a) => me.outFieldId.indexOf(parseInt(a.key)) > -1)
        .map((a) => ['joined-field', me.join.alias, parseInt(a.key)]);
    }
  }
  public tParseInt(s) {
    return parseInt(s);
  }
}
