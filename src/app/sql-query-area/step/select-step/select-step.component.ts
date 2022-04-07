import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd/message";
import { Observable, Observer } from "rxjs";
import { KeyValuePair } from "../../../common/pfModel";
import { PfUtil } from "../../../common/pfUtil";
import {
  DatabaseModel,
  DataColumnModel,
  DatamodelGroupUIModel,
  DatamodelQuery,
  DatamodelQueryUIModel,
  DataTableModel,
  DataTableUIModel,
} from "../../../model/data-integration";
import { ComputesReferenceService } from "../../../service/computes-reference.service";
import { DataCenterReferenceService } from "../../../service/datacenter-reference.service";
import { UserProviderService } from "../../../service/user-provider.service";
import TableClass from "../../metabase-lib/lib/metadata/TableClass";
import PfStructuredQueryClass from "../../metabase-lib/lib/queries/PfStructuredQueryClass";
import { FieldLiteral, StructuredQuery } from "../../model/Query";
import {
  SelectColumnModel,
  SelectColumnModelClass,
  SelectTableModel,
  SelectTableModelClass,
} from "../../model/SelectColumnModel";
import { KeyValuePairT, SqlQueryUtil } from "../../sql-query-util";

export type filterAddStep = "database" | "table" | "datamodel";
export class TableIdChangeModel {
  tableId?: number;
  databaseId: number;
  modelId?: number;
}
export type DatamodelSourceType = "table" | "datamodel";

@Component({
  selector: "select-step",
  templateUrl: "./select-step.component.html",
  styleUrls: ["./select-step.component.scss", "../sql-query-area-step.scss"],
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
  @Output() public tableIdChange = new EventEmitter<TableIdChangeModel>(); //命名一定要是上面的字段名后加Change
  //@Output() public databaseIdChange = new EventEmitter(); //命名一定要是上面的字段名后加Change

  step: filterAddStep = "table";
  public databaseList: DatabaseModel[] = [];

  //选择字段
  /**
   * @deprecated
   */
  public columnId: number[] = [];
  //public columnId: (string | number)[] = [];
  //(用selectColumnList取代)
  public columnList: DataColumnModel[] = [];
  //public columnList: (DataColumnModel | FieldLiteral)[] = [];
  public sourceOutFieldName: string[] = [];
  //(用selectColumnList取代)
  public sourceOutFieldList: FieldLiteral[] = []; //ConcreteField

  public selectColumnList: SelectColumnModel[] = [];
  public isAllColumnSelected: boolean = false;

  // //public columnGridData: KeyValuePair[] = []; //[{key:DataColumnModel,value:true}]
  // public tableList: DataTableModel[] = [];
  public datamodelGroupList: DatamodelGroupUIModel[] = [];
  public datamodelList: DatamodelQueryUIModel[] = [];
  //public tableList2: TableClass[] = [];
  addingDatabase?: DatabaseModel = null;
  //addingTable?: DataTableModel = null;
  addingTable?: SelectTableModel = null;
  addingDatamodelGroup?: DatamodelGroupUIModel = null;
  //addingDatamodel?: DatamodelQueryUIModel = null;

  public sourceType: DatamodelSourceType = "table";

  /**
   * 如果不双向绑定1个变量,那后面if的过滤就只会在input失去焦点时才触发
   */
  searchText = "";

  constructor(
    private userProvider: UserProviderService,
    private reference: ComputesReferenceService,
    private dataCenterReference: DataCenterReferenceService,
    private sqlQueryUtil: SqlQueryUtil,
    public pfUtil: PfUtil,
    private msg: NzMessageService
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
    if (!me.pfUtil.isAnyNull(me.query["source-table"])) {
      me.sourceType = "table";
      // me.reference
      //   .getDataColumnPageList(me.query["source-table"])
      //   .subscribe((response) => {
      //     //debugger;
      //     me.columnList = response.DataSource;

      //     //me.selectColumnList=response.DataSource.map((a)=>new SelectColumnModelClass(){});
      //     //let aa={aa:"aa"};

      //     // me.addingTable = this.tableList.find(
      //     //   (a) => a.ShortId == me.query["source-table"]
      //     // );

      //     if (me.pfUtil.isAnyNull(me.query.fields)) {
      //       //metabase中没有fields属性时是全选
      //       me.columnId = me.columnList.map((a) => a.ShortId);
      //     } else {
      //       me.columnId = me.query.fields.map((a) => a[1]);
      //     }

      //     me.selectColumnList = response.DataSource.map((a) => {
      //       let item = new SelectColumnModelClass();
      //       item.isLiteralField = false;
      //       item.selected = false;
      //       item.column = a;
      //       item.literalField = null;
      //       // return {
      //       //   isLiteralField: false,
      //       //   selected: false,
      //       //   column: a,
      //       //   literalField: null,
      //       // };
      //       return item;
      //     });
      //     // me.selectColumnList = response.DataSource.map((a) => {
      //     //   return new SelectColumnModelClass(){
      //     //     isLiteralField= false,
      //     //     selected= false,
      //     //     column= a,
      //     //     literalField= null,
      //     //   };
      //     // });
      //   });

      me.updateColumnList().subscribe(() => {
        if (me.pfUtil.isAnyNull(me.query.fields)) {
          //metabase中没有fields属性时是全选
          me.columnId = me.columnList.map((a) => a.ShortId);
        } else {
          me.columnId = me.query.fields.map((a) => a[1]);
        }
        me.updateColumnSelectStatus();
      });
    } else if (!me.pfUtil.isAnyNull(me.query["source-model"])) {
      // me.reference
      //   .getDatamodelQuery(me.query["source-model"])
      //   .subscribe((response) => {
      //     me.dataCenterReference
      //       .datamodelExecute(response.Id, "", "", "", 1)
      //       .subscribe((response2) => {
      //         me.sourceOutFieldList = response2.metabase.map((a) => [
      //           "field-literal",
      //           a.name,
      //           a.type,
      //         ]);
      //       });
      //   });
      me.sourceType = "datamodel";
      me.updateSourceOutFieldList().subscribe(() => {
        if (me.pfUtil.isAnyNull(me.query.fields)) {
          //metabase中没有fields属性时是全选
          me.sourceOutFieldName = me.sourceOutFieldList.map((a) => a[1]);
        } else {
          me.sourceOutFieldName = me.query.fields.map((a) => a[1]);
        }
        me.updateColumnSelectStatus();
      });
    }

    const userInfo = this.userProvider.getUserInfo();
    this.reference
      .getDatamodelGroupPageList(0, userInfo.UserId, userInfo.RoleId, 0, 0)
      .subscribe(
        (response) => {
          //if (response.Success === "True" && response.Result != null) {
          //const data = JSON.parse(this.reference.base64Decode(response.Result));
          me.datamodelGroupList = response.DataSource;
          //}
        },
        (error) => {
          me.msg.error(error);
        }
      );

    // this.reference
    //   .getDatamodelQueryPageList(
    //     userInfo.UserId,
    //     userInfo.RoleId,
    //     "",
    //     "",
    //     0,
    //     0,
    //     true
    //   )
    //   .subscribe(
    //     (response) => {
    //       //if (response.Success === "True" && response.Result != null) {
    //       //const data = JSON.parse(this.reference.base64Decode(response.Result));
    //       me.datamodelList = response.DataSource;
    //       //}
    //     },
    //     (error) => {
    //       me.msg.error(error);
    //     }
    //   );

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
    // //debugger;
    // // //console.info("ngOnChanges:" + this.tableList.length);
    // // //tableList是在父组件的OnInit中异步取得的,所以只能在本组件的ngOnChanges里处理
    // //新版tableList改为父组件传入,应该不用在这里更新了,试试吧
    // //debugger;
    // if (me.databaseId > 0) {
    //   me.reference.getDataTableList(me.databaseId).subscribe((response) => {
    //     me.tableList = response.DataSource;
    //     if (!me.pfUtil.isAnyNull(me.query["source-table"])) {
    //       // me.addingTable = this.tableList.find(
    //       //   (a) => a.ShortId == me.query["source-table"]
    //       // );
    //       let tmpTable = this.tableList.find(
    //         (a) => a.ShortId == me.query["source-table"]
    //       );
    //       me.addingTable = new SelectTableModelClass().initByTable(
    //         me.sqlQueryUtil.TableUIModelToType(tmpTable, null)
    //       );
    //     } else if (!me.pfUtil.isAnyNull(me.query["source-model"])) {
    //       me.reference
    //         .getDatamodelQuery(me.query["source-model"])
    //         .subscribe((response) => {
    //           me.addingDatamodel = response;
    //         });
    //     }
    //   });
    // }

    if (!me.pfUtil.isAnyNull(me.query["source-table"])) {
      // me.addingTable = this.tableList.find(
      //   (a) => a.ShortId == me.query["source-table"]
      // );
      me.reference
        .getDataTable(me.databaseId, me.query["source-table"])
        .subscribe((response) => {
          me.addingTable = new SelectTableModelClass().initByTable(
            me.sqlQueryUtil.TableUIModelToType(response, null)
          );
        });
    } else if (!me.pfUtil.isAnyNull(me.query["source-model"])) {
      me.reference
        .getDatamodelQuery(me.query["source-model"])
        .subscribe((response) => {
          //me.addingDatamodel = response;
          me.addingTable = new SelectTableModelClass().initByCard(
            me.sqlQueryUtil.QuestionUIModelToType(response)
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
  public updateColumnSelectStatus() {
    const me = this;
    me.isAllColumnSelected = me.pfUtil.isAnyNull(me.query.fields);
    if (me.isAllColumnSelected) {
      me.selectColumnList.forEach((a) => {
        a.selected = true;
      });
    } else {
      me.selectColumnList.forEach((a) => {
        if ("table" === me.sourceType) {
          // a.selected =
          //   me.query.fields.findIndex((b) => b[1] === a.column.ShortId) > -1;
          a.selected =
            me.query.fields.findIndex((b) => b[1] === a.column.id) > -1;
        } else {
          a.selected =
            me.query.fields.findIndex((b) => b[1] === a.literalField[1]) > -1;
        }
      });
    }
  }
  private updateColumnList(): Observable<void> {
    const me = this;
    //me.isAllColumnSelected = false;
    return new Observable((observer: Observer<void>) => {
      //意思是定义一个异步操作
      if (!me.pfUtil.isAnyNull(me.query["source-table"])) {
        me.reference
          .getDataColumnPageList(me.query["source-table"])
          .subscribe((response) => {
            //debugger;
            me.columnList = response.DataSource;

            //me.selectColumnList=response.DataSource.map((a)=>new SelectColumnModelClass(){});
            //let aa={aa:"aa"};

            // me.addingTable = this.tableList.find(
            //   (a) => a.ShortId == me.query["source-table"]
            // );

            // if (me.pfUtil.isAnyNull(me.query.fields)) {
            //   //metabase中没有fields属性时是全选
            //   me.columnId = me.columnList.map((a) => a.ShortId);
            // } else {
            //   me.columnId = me.query.fields.map((a) => a[1]);
            // }

            me.selectColumnList = response.DataSource.map((a) => {
              // let item = new SelectColumnModelClass();
              // item.isLiteralField = false;
              // item.selected = false;
              // item.column = me.sqlQueryUtil.FieldUIModelToType(a);
              // item.literalField = null;
              // // return {
              // //   isLiteralField: false,
              // //   selected: false,
              // //   column: a,
              // //   literalField: null,
              // // };
              // return item;
              return new SelectColumnModelClass().initByField(
                me.sqlQueryUtil.FieldUIModelToType(a)
              );
            });

            observer.next();
          });
      }
    });
  }
  private updateSourceOutFieldList(): Observable<void> {
    const me = this;
    //me.isAllColumnSelected = false;
    return new Observable((observer: Observer<void>) => {
      //意思是定义一个异步操作
      if (!me.pfUtil.isAnyNull(me.query["source-model"])) {
        me.reference.getDatamodelQuery(me.query["source-model"]).subscribe(
          (response) => {
            me.dataCenterReference
              .datamodelExecute(response.Id, "", "", "", 1)
              .subscribe((response2) => {
                me.sourceOutFieldList = response2.metabase.map((a) => [
                  "field-literal",
                  a.name,
                  a.type,
                ]);

                //me.isAllSelected = me.pfUtil.isEmpty(me.query.fields);
                me.selectColumnList = response2.metabase.map((a) => {
                  // let item = new SelectColumnModelClass();
                  // item.isLiteralField = true;
                  // item.selected = false;
                  // item.column = null;
                  // item.literalField = ["field-literal", a.name, a.type];
                  // // return {
                  // //   isLiteralField: true,
                  // //   selected: me.isAllColumnSelected,
                  // //   column: null,
                  // //   literalField: ["field-literal", a.name, a.type],
                  // // };
                  // return item;

                  return new SelectColumnModelClass().initByLiteralField(
                    ["field-literal", a.name, a.type],
                    me.query["source-model"]
                  );
                });

                observer.next();
              });
          },
          (error) => {
            observer.error(error);
          }
        );
      }
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
      .getDataColumnPageList(me.query["source-table"])
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
  /**
   *
   * @param selected
   * @deprecated 改用onSelectAllColumnModel
   */
  public onSelectAll(selected: boolean) {
    const me = this;
    debugger;
    if ("table" === me.sourceType) {
      if (selected) {
        if (me.columnId.length === me.columnList.length) {
          //不能全不选(和metabase的行为一致)
        } else {
          me.columnId = me.columnList.map((a) => a.ShortId);
          me.saveColumn();
        }
      }
    } else {
      if (selected) {
        if (me.sourceOutFieldName.length === me.sourceOutFieldList.length) {
          //不能全不选(和metabase的行为一致)
        } else {
          me.sourceOutFieldName = me.sourceOutFieldList.map((a) => a[1]);
          me.saveColumn();
        }
      }
    }
  }
  public onSelect(selected: boolean, column: DataColumnModel) {
    const me = this;
    if (selected) {
      me.columnId.push(column.ShortId);
    } else {
      me.columnId = me.columnId.filter((a) => a != column.ShortId);
      if (0 === me.columnId.length) {
        me.columnId = me.columnList.map((a) => a[1]);
      }
    }
    me.saveColumn();
  }
  public onSelectSourceOutField(selected: boolean, column: FieldLiteral) {
    const me = this;
    debugger;
    if (selected) {
      me.sourceOutFieldName.push(column[1]);
    } else {
      me.sourceOutFieldName = me.sourceOutFieldName.filter(
        (a) => a != column[1]
      );
      if (0 === me.sourceOutFieldName.length) {
        me.sourceOutFieldName = me.sourceOutFieldList.map((a) => a[1]);
      }
    }
    me.saveColumn();
  }
  public onSelectColumnModel(
    selected: boolean,
    column: SelectColumnModelClass
  ) {
    const me = this;
    // debugger;
    // if (selected) {
    //   me.sourceOutFieldName.push(column[1]);
    // } else {
    //   me.sourceOutFieldName = me.sourceOutFieldName.filter(
    //     (a) => a != column[1]
    //   );
    //   if (0 === me.sourceOutFieldName.length) {
    //     me.sourceOutFieldName = me.sourceOutFieldList.map((a) => a[1]);
    //   }
    // }
    let item = me.selectColumnList.find((a) => a.equals(column));
    if (!me.pfUtil.isNull(item)) {
      item.selected = selected;
    }
    // if (me.selectColumnList.findIndex((a) => !a.selected) < 0) {
    //   me.isAllColumnSelected = true;
    // } else {
    //   me.isAllColumnSelected = false;
    // }
    me.isAllColumnSelected =
      me.selectColumnList.length > 0 &&
      me.selectColumnList.findIndex((a) => !a.selected) < 0;
    // me.saveColumn();
    me.saveQueryByColumnModel();
  }

  public onSelectAllColumnModel(selected: boolean) {
    const me = this;

    if (selected) {
      me.selectColumnList.forEach((a) => {
        a.selected = true;
      });
    } else {
      me.selectColumnList.forEach((a) => {
        a.selected = false;
      });
      // me.selectColumnList.forEach((a) => {
      //   if ("table" === me.sourceType) {
      //     a.selected =
      //       me.query.fields.findIndex((b) => b[1] === a.column.ShortId) > -1;
      //   } else {
      //     a.selected =
      //       me.query.fields.findIndex((b) => b[1] === a.literalField[1]) > -1;
      //   }
      // });
    }
    if (me.isAllColumnSelected !== selected) {
      me.isAllColumnSelected = selected;
    }
    me.saveQueryByColumnModel();
  }

  /**
   * @deprecated 用 saveQueryByColumnModel方式
   */
  private saveColumn() {
    const me = this;
    if ("table" === me.sourceType) {
      if (me.columnList.length === me.columnId.length) {
        delete me.query.fields;
      } else {
        me.query.fields = me.columnList
          .filter((a) => me.columnId.indexOf(a.ShortId) > -1)
          .map((a) => ["field-id", a.ShortId]);
      }
    }
    if ("datamodel" === me.sourceType) {
      if (me.sourceOutFieldList.length === me.sourceOutFieldName.length) {
        delete me.query.fields;
      } else {
        me.query.fields = me.sourceOutFieldList
          .filter((a) => me.sourceOutFieldName.indexOf(a[1]) > -1)
          .map((a) => a);
      }
    }
  }
  private saveQueryByColumnModel() {
    const me = this;
    if (me.isAllColumnSelected) {
      delete me.query.fields;
    } else {
      // let cols=me.selectColumnList.filter(a=>a.selected);
      // if(cols.length>0){
      //   if(cols[0].isLiteralField){
      //     me.query.fields = cols.map((a) => a.literalField);
      //   }
      // }

      me.query.fields = me.selectColumnList
        .filter((a) => a.selected)
        .map((a) =>
          // a.isLiteralField ? a.literalField : ["field-id", a.column.ShortId]
          a.isLiteralField ? a.literalField : ["field-id", a.column.id]
        ) as any;
    }
    // if ("table" === me.sourceType) {
    //   if (me.columnList.length === me.columnId.length) {
    //     delete me.query.fields;
    //   } else {
    //     me.query.fields = me.columnList
    //       .filter((a) => me.columnId.indexOf(a.ShortId) > -1)
    //       .map((a) => ["field-id", a.ShortId]);
    //   }
    // }
    // if ("datamodel" === me.sourceType) {
    //   if (me.sourceOutFieldList.length === me.sourceOutFieldName.length) {
    //     delete me.query.fields;
    //   } else {
    //     me.query.fields = me.sourceOutFieldList
    //       .filter((a) => me.sourceOutFieldName.indexOf(a[1]) > -1)
    //       .map((a) => a);
    //   }
    // }
  }

  // goSelectTable(database: DatabaseModel, addFilterPopups) {
  //   const me = this;
  //   me.step = "table";
  //   // me.query.database = database.ShortId;
  //   //debugger;
  //   //me.databaseIdChange.emit(database.ShortId);
  //   me.addingDatabase = database;
  //   // //debugger;
  //   // me.tableList = [];
  //   if (me.query != null) {
  //     me.reference.getDataTableList(database.ShortId).subscribe((response) => {
  //       me.tableList = response.DataSource;
  //       addFilterPopups.resize();
  //     });
  //     // me.sqlQueryUtil
  //     //   .getLocalDataTableList(me.queryClass, database.ShortId)
  //     //   .subscribe((response) => {
  //     //     me.tableList = response.map((a) => {
  //     //       return me.sqlQueryUtil.TableClassToUIModel(a);
  //     //     });
  //     //     addFilterPopups.resize();
  //     //   });
  //   }
  // }
  /**
   *
   * @deprecated 封装到sql-select-table-ul
   */
  goSelectDatabase(addFilterPopups) {
    const me = this;
    me.step = "database";
    if (me.query != null) {
      me.reference.getDatabasePageList().subscribe((response) => {
        //debugger;
        me.databaseList = response.DataSource;
        console.info(response.DataSource);
        addFilterPopups.resize();
      });
    }
  }
  /**
   *
   * @deprecated 封装到sql-select-table-ul
   */
  goSelectDatamodel(database: DatamodelGroupUIModel, addFilterPopups) {
    const me = this;
    me.step = "datamodel";
    me.addingDatamodelGroup = database;
    if (me.query != null) {
      // me.reference.getDataTableList(database.ShortId).subscribe((response) => {
      //   me.tableList = response.DataSource;
      //   addFilterPopups.resize();
      // });
      me.reference
        .getDatamodelQueryPageList(
          this.userProvider.getUserInfo().UserId,
          this.userProvider.getUserInfo().RoleId,
          database.Id,
          "",
          0,
          0,
          true
        )
        .subscribe(
          (response) => {
            //debugger;
            me.datamodelList = response.DataSource;
            addFilterPopups.resize();
          },
          (error) => {
            me.msg.error(error);
          }
        );
    }
  }
  // /**
  //  *
  //  * @deprecated
  //  */
  // selectTable(table: DataTableModel) {
  //   const me = this;
  //   me.addingTable = table;
  //   me.addingDatamodel = null;
  //   me.query["source-table"] = table.ShortId;
  //   me.sourceType = "table";
  //   me.tableIdChange.emit({
  //     tableId: me.query["source-table"],
  //     databaseId: me.addingDatabase.ShortId,
  //   });
  //   me.updateColumnList().subscribe(() => {
  //     me.selectColumnList.forEach((a) => (a.selected = true));
  //     me.isAllColumnSelected = true;
  //   });
  // }
  // public likeText(columnName: string, text: string) {
  //   // if (columnName !== undefined) {
  //   //   return columnName.indexOf(text) > -1;
  //   // }
  //   // return false;
  //   return PfUtil.likeText(columnName, text);
  // }
  // /**
  //  *
  //  * @deprecated
  //  */
  // selectDatamodel(table: DatamodelQueryUIModel) {
  //   const me = this;
  //   me.addingDatamodel = table;
  //   me.addingTable = null;
  //   me.query["source-model"] = table.DatamodelQueryId;
  //   me.sourceType = "datamodel";
  //   me.tableIdChange.emit({
  //     databaseId: table.query.database,
  //     modelId: me.query["source-model"],
  //   });
  //   me.updateSourceOutFieldList().subscribe(() => {
  //     me.selectColumnList.forEach((a) => (a.selected = true));
  //     me.isAllColumnSelected = true;
  //   });
  // }

  selectTableModel(
    event: KeyValuePairT<SelectTableModel, SelectColumnModel[]>
  ) {
    const me = this;
    let table = event.key;
    me.addingTable = table;
    //me.addingDatamodel = null;
    me.sourceType = "datamodel";
    //debugger;
    if (table.isDataModel) {
      me.query["source-model"] = table.id;
      delete me.query["source-table"];
      me.tableIdChange.emit({
        modelId: table.id,
        // databaseId: me.addingDatabase.ShortId,
        databaseId: table.databaseId,
      });
    } else {
      me.query["source-table"] = table.id;
      delete me.query["source-model"];
      me.tableIdChange.emit({
        tableId: table.id,
        //databaseId: me.addingDatabase.ShortId,
        databaseId: table.databaseId,
      });
    }

    me.selectColumnList = event.value;
    me.selectColumnList.forEach((a) => (a.selected = true));
    me.isAllColumnSelected = true; //这句需要吗? 要的

    // setTimeout(function () {
    //   me.pfUtil.triggerEvent(
    //     me.el.nativeElement.ownerDocument,
    //     // ".addConditionBtn",
    //     me.el.nativeElement.querySelector(".addConditionBtn"),
    //     "click"
    //   );
    // }, 100);
  }
  public getTableName() {
    const me = this;
    // return me.addingTable === null || me.addingTable === undefined
    //   ? "请选择表"
    //   : me.addingTable.TableName;
    if (me.pfUtil.isAnyNull(me.addingDatabase)) {
      return "请选择数据库";
    }
    // if (!me.pfUtil.isNull(me.addingTable)) {
    //   //return me.addingTable.TableName;
    //   return me.addingTable.displayIdxName;
    // }
    // // // if (!me.pfUtil.isNull(me.addingDatamodel)) {
    // // //   return me.addingDatamodel.DatamodelQueryName;
    // // // }
    if (me.pfUtil.isNull(me.addingTable)) {
      return "请选择表";
    }
    return me.addingTable.displayIdxName;
    //return "请选择表";
  }
  public getDatabaseName() {
    const me = this;
    return me.addingDatabase === null || me.addingDatabase === undefined
      ? "请选择数据库"
      : me.addingDatabase.DatabaseName;
  }
  public getDatamodelGroupName() {
    const me = this;
    return me.pfUtil.isNull(me.addingDatamodelGroup)
      ? "请选择数据库"
      : me.addingDatamodelGroup.Name;
  }
  public showSelectTablePopups(event, selectTablePopups) {
    const me = this;
    const btn = event.currentTarget;
    // //debugger;
    // //if (me.pfUtil.isAnyNull(me.query.database)) {
    // if (me.pfUtil.isAnyNull(me.databaseId) || me.databaseId < 0) {
    //   me.step = "database";
    //   me.reference.getDatabasePageList().subscribe((response) => {
    //     me.databaseList = response.DataSource;
    //     selectTablePopups.open(btn);
    //   });
    // } else {
    //   me.step = "table";
    //   //me.reference.getDataTableList(me.query.database).subscribe((response) => {
    //   me.reference.getDataTableList(me.databaseId).subscribe((response) => {
    //     me.tableList = response.DataSource;
    //     selectTablePopups.open(btn);
    //   });
    // }

    selectTablePopups.open(btn);
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
    return column.ColumnName + "(" + column.ChineseName + ")";
  }
  // public getColumnFullName2(column: SelectColumnModel): string {
  //   const me = this;
  //   if (column.isLiteralField) {
  //     return column.literalField[1];
  //   }
  //   return me.getColumnFullName3(column.column);
  // }
  // public getColumnFullName3(column: Field): string {
  //   const me = this;
  //   if (me.pfUtil.isEmpty(column.display_name)) {
  //     return column.name;
  //   }
  //   return column.name + "(" + column.display_name + ")";
  // }

  public testConsole1() {
    const me = this;
    // return me.pfUtil.isNull(me.sourceOutFieldName)
    //   ? ""
    //   : me.sourceOutFieldName.join(",");
    return JSON.stringify(me.selectColumnList);
  }
  public testConsole2() {
    const me = this;
    return me.pfUtil.isNull(me.sourceOutFieldList)
      ? ""
      : JSON.stringify(me.sourceOutFieldList);
  }
}
