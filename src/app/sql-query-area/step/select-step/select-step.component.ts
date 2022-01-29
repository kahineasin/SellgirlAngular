import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { KeyValuePair } from '../../../common/pfModel';
import { PfUtil } from '../../../common/pfUtil';
import {
  DatabaseModel,
  DataColumnModel,
  DatamodelQuery,
  DataTableModel,
  DataTableUIModel,
} from '../../../model/data-integration';
import { ComputesReferenceService } from '../../../service/computes-reference.service';
import TableClass from '../../metabase-lib/lib/metadata/TableClass';
import PfStructuredQueryClass from '../../metabase-lib/lib/queries/PfStructuredQueryClass';
import { StructuredQuery } from '../../model/Query';
import { SqlQueryUtil } from '../../sql-query-util';

export type filterAddStep = 'database' | 'table';

@Component({
  selector: 'select-step',
  templateUrl: './select-step.component.html',
  styleUrls: ['./select-step.component.scss', '../sql-query-area-step.scss'],
})
export class SelectStepComponent implements OnInit {
  //@Input() public query: DatamodelQuery = null;
  @Input() public databaseId: number = null;
  @Input() public query: StructuredQuery = null;
  @Input() public queryClass: PfStructuredQueryClass = null;
  // @Input() public databaseList: DatabaseModel[] = [];
  //@Input() public tableId?: number = null; //"jack";
  //@Input() public tableList: DataTableModel[] = [];//这个tableList真的不用外面传进来,因为切换数据库时还要刷新的
  @Input() color: number[] = [0, 0, 0];
  @Output() public tableIdChange = new EventEmitter<{
    tableId: number;
    databaseId: number;
  }>(); //命名一定要是上面的字段名后加Change
  //@Output() public databaseIdChange = new EventEmitter(); //命名一定要是上面的字段名后加Change

  step: filterAddStep = 'table';
  public databaseList: DatabaseModel[] = [];
  public columnId: number[] = [];
  public columnList: DataColumnModel[] = [];
  //public columnGridData: KeyValuePair[] = []; //[{key:DataColumnModel,value:true}]
  public tableList: DataTableModel[] = [];
  //public tableList2: TableClass[] = [];
  addingDatabase?: DatabaseModel = null;
  addingTable?: DataTableModel = null;

  /**
   * 如果不双向绑定1个变量,那后面if的过滤就只会在input失去焦点时才触发
   */
  searchText = '';

  constructor(
    private reference: ComputesReferenceService,
    private sqlQueryUtil: SqlQueryUtil,
    public pfUtil: PfUtil
  ) {}

  ngOnInit(): void {
    const me = this;
    // if (me.query["source-table"] != null) {
    //   me.onTableChange();
    // }

    // // if (me.query != null) {
    // //   me.reference.getDataTableList(me.query.database).subscribe((response) => {
    // //     me.tableList = response.DataSource;
    // //   });
    // // }

    // console.info("ngOnInit:" + this.tableList.length);
    // me.addingTable = this.tableList.find(
    //   (a) => a.ShortId == me.query["source-table"]
    // );

    //debugger;
    if (!me.pfUtil.isAnyNull(me.query['source-table'])) {
      me.reference
        .getDataColumnPageList(me.query['source-table'])
        .subscribe((response) => {
          //debugger;
          me.columnList = response.DataSource;
          // me.addingTable = this.tableList.find(
          //   (a) => a.ShortId == me.query["source-table"]
          // );

          if (me.pfUtil.isAnyNull(me.query.fields)) {
            //metabase中没有fields属性时是全选
            me.columnId = me.columnList.map((a) => a.ShortId);
          } else {
            me.columnId = me.query.fields.map((a) => a[1]);
          }
        });
    }

    // //debugger;
    // if (me.query.database === null) {
    //   me.step = "database";
    // }
  }
  // ngAfterContentInit() {
  //   console.info("ngAfterContentInit:" + this.tableList.length);
  // }
  // ngAfterViewInit() {
  //   console.info("ngAfterViewInit:" + this.tableList.length);
  // }
  ngOnChanges() {
    const me = this;
    //debugger;
    // //console.info("ngOnChanges:" + this.tableList.length);
    // //tableList是在父组件的OnInit中异步取得的,所以只能在本组件的ngOnChanges里处理
    //新版tableList改为父组件传入,应该不用在这里更新了,试试吧
    //debugger;
    if (me.databaseId > 0) {
      me.reference.getDataTableList(me.databaseId).subscribe((response) => {
        me.tableList = response.DataSource;
        me.addingTable = this.tableList.find(
          (a) => a.ShortId == me.query['source-table']
        );
      });
    }
    // me.addingDatabase = this.databaseList.find(
    //   (a) => a.ShortId == me.query.database
    // );

    me.reference.getDatabasePageList().subscribe((response) => {
      me.databaseList = response.DataSource;
      me.addingDatabase = me.databaseList.find(
        //(a) => a.ShortId == me.query.database
        (a) => a.ShortId == me.databaseId
      );
    });
  }

  /**
   * change
   * @deprecated 测试ant的nz-select时用到而已,待删除
   */
  public onTableChange() {
    const me = this;
    //me.tableIdChange.emit(me.query["source-table"]);
    //如果分页
    me.reference
      .getDataColumnPageList(me.query['source-table'])
      .subscribe((response) => {
        //debugger;
        me.columnList = response.DataSource;
      });
    // me.reference.getDataColumnList(me.tableId).subscribe((response) => {
    //   me.columnList = response;
    // });
  }
  // public onColumnChange(userName: string) {
  //   const me = this;
  //   //me.tableIdChange.emit(me.tableId);
  //   me.reference.getDataColumnList(me.tableId).subscribe((response) => {
  //     me.columnList = response.DataSource;
  //   });
  // }
  public onSelectAll(selected: boolean) {
    const me = this;
    if (selected) {
      if (me.columnId.length === me.columnList.length) {
        //不能全不选(和metabase的行为一致)
      } else {
        me.columnId = me.columnList.map((a) => a.ShortId);
        me.saveColumn();
      }
    }
  }
  public onSelect(selected: boolean, column: DataColumnModel) {
    const me = this;
    if (selected) {
      me.columnId.push(column.ShortId);
    } else {
      me.columnId = me.columnId.filter((a) => a != column.ShortId);
    }
    me.saveColumn();
  }

  private saveColumn() {
    const me = this;
    me.query.fields = me.columnList
      .filter((a) => me.columnId.indexOf(a.ShortId) > -1)
      .map((a) => ['field-id', a.ShortId]);
  }

  goSelectTable(database: DatabaseModel, addFilterPopups) {
    const me = this;
    me.step = 'table';
    // me.query.database = database.ShortId;
    //debugger;
    //me.databaseIdChange.emit(database.ShortId);
    me.addingDatabase = database;
    // //debugger;
    // me.tableList = [];
    if (me.query != null) {
      me.reference.getDataTableList(database.ShortId).subscribe((response) => {
        me.tableList = response.DataSource;
        addFilterPopups.resize();
      });
      // me.sqlQueryUtil
      //   .getLocalDataTableList(me.queryClass, database.ShortId)
      //   .subscribe((response) => {
      //     me.tableList = response.map((a) => {
      //       return me.sqlQueryUtil.TableClassToUIModel(a);
      //     });
      //     addFilterPopups.resize();
      //   });
    }
  }
  goSelectDatabase(addFilterPopups) {
    const me = this;
    me.step = 'database';
    if (me.query != null) {
      me.reference.getDatabasePageList().subscribe((response) => {
        //debugger;
        me.databaseList = response.DataSource;
        console.info(response.DataSource);
        addFilterPopups.resize();
      });
    }
  }
  selectTable(table: DataTableModel) {
    const me = this;
    me.addingTable = table;
    me.query['source-table'] = table.ShortId;
    //me.tableIdChange.emit(me.query["source-table"]);
    me.tableIdChange.emit({
      tableId: me.query['source-table'],
      databaseId: me.addingDatabase.ShortId,
    });
    me.reference
      .getDataColumnPageList(me.query['source-table'])
      .subscribe((response) => {
        //debugger;
        me.columnList = response.DataSource;
        // me.addingTable = this.tableList.find(
        //   (a) => a.ShortId == me.query["source-table"]
        // );
      });
  }
  public likeText(columnName: string, text: string) {
    // if (columnName !== undefined) {
    //   return columnName.indexOf(text) > -1;
    // }
    // return false;
    return PfUtil.likeText(columnName, text);
  }
  public getTableName() {
    const me = this;
    // return me.addingTable === null || me.addingTable === undefined
    //   ? "请选择表"
    //   : me.addingTable.TableName;
    if (me.pfUtil.isAnyNull(me.addingDatabase)) {
      return '请选择数据库';
    }
    if (me.pfUtil.isAnyNull(me.addingTable)) {
      return '请选择表';
    }
    return me.addingTable.TableName;
  }
  public getDatabaseName() {
    const me = this;
    return me.addingDatabase === null || me.addingDatabase === undefined
      ? '请选择数据库'
      : me.addingDatabase.DatabaseName;
  }
  public showSelectTablePopups(event, selectTablePopups) {
    const me = this;
    const btn = event.currentTarget;
    //debugger;
    //if (me.pfUtil.isAnyNull(me.query.database)) {
    if (me.pfUtil.isAnyNull(me.databaseId) || me.databaseId < 0) {
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
      //selectTablePopups.open(btn);
    }
    // if("database"==me.step){
    //   me.goSelectDatabase()
    // }
    // selectTablePopups.open(event.currentTarget);
  }
  // onSearchChange(event) {
  //   console.info(event);
  // }

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
  public getColumnFullName(column: DataColumnModel): string {
    const me = this;
    if (me.pfUtil.isEmpty(column.ChineseName)) {
      return column.ColumnName;
    }
    return column.ColumnName + '(' + column.ChineseName + ')';
  }
}
