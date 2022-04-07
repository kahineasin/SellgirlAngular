import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd/message";
import { Observable, Observer } from "rxjs";
//import { PfUtil } from "../../../../../../core/common/pfUtil";
import { PfUtil } from "../../../common/pfUtil";
import { DataCenterReferenceService } from "../../../service/datacenter-reference.service";
import { UserProviderService } from "../../../service/user-provider.service";
import {
  DatabaseModel,
  DatamodelGroupUIModel,
  DatamodelQueryUIModel,
  DataTableModel,
  DataTableUIModel,
} from "../../../model/data-integration";
import { ComputesReferenceService } from "../../../service/computes-reference.service";
import {
  SelectColumnModel,
  SelectColumnModelClass,
  SelectTableModel,
  SelectTableModelClass,
} from "../../model/SelectColumnModel";
import { KeyValuePairT, SqlQueryUtil } from "../../sql-query-util";

//export type filterAddStep = "database" | "table" | "datamodel";

@Component({
  selector: "sql-select-table-ul",
  templateUrl: "./sql-select-table-ul.component.html",
  styleUrls: ["./sql-select-table-ul.component.scss"],
})
export class SqlSelectTableUlComponent implements OnInit {
  @Input() public databaseId = null;
  //@Input() public databaseList: DatabaseModel[] = [];
  @Output() public sizeChange = new EventEmitter(); //命名一定要是上面的字段名后加Change
  @Output() selectTableModel = new EventEmitter<
    KeyValuePairT<SelectTableModel, SelectColumnModel[]>
  >();
  step: string = "table";
  public databaseList: DatabaseModel[] = [];
  public tableList: DataTableUIModel[] = [];
  public datamodelGroupList: DatamodelGroupUIModel[] = [];
  public datamodelList: DatamodelQueryUIModel[] = [];
  // addingDatabase?: DatabaseModel = null;
  // addingTable?: DataTableUIModel = null;
  public addingDatabase?: DatabaseModel = null;
  public addingTable?: DataTableUIModel = null;
  addingDatamodelGroup?: DatamodelGroupUIModel = null;
  addingDatamodel?: DatamodelQueryUIModel = null;
  /**
   * 如果不双向绑定1个变量,那后面if的过滤就只会在input失去焦点时才触发
   */
  searchText = "";
  searchText2 = "";
  constructor(
    public pfUtil: PfUtil,
    private sqlQueryUtil: SqlQueryUtil,
    private userProvider: UserProviderService,
    private reference: ComputesReferenceService,
    private dataCenterReference: DataCenterReferenceService,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    const me = this;
    if (!me.pfUtil.isNull(me.databaseId) && me.databaseId > -1) {
      me.reference.getDatabase(me.databaseId).subscribe((response) => {
        //debugger;
        me.addingDatabase = response;
        //console.info(response.DataSource);
        //addFilterPopups.resize();
        me.reference.getDataTableList(me.databaseId).subscribe((response) => {
          me.tableList = response.DataSource;
          me.sizeChange.emit();
          //selectTablePopups.open(btn);
        });
      });
    } else {
      // me.step = "database";
      me.goSelectDatabase();
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
  goSelectTable(
    database: DatabaseModel //, addFilterPopups
  ) {
    const me = this;
    me.step = "table";
    // me.query.database = database.ShortId;
    //debugger;
    //me.databaseIdChange.emit(database.ShortId);
    me.addingDatabase = database;
    // //debugger;
    // me.tableList = [];
    //if (me.query != null) {
    me.reference.getDataTableList(database.ShortId).subscribe((response) => {
      me.tableList = response.DataSource;
      me.sizeChange.emit();
      // addFilterPopups.resize();
    });
    //}
  }
  goSelectDatabase() {
    //addFilterPopups
    const me = this;
    me.step = "database";
    //if (me.query != null) {
    me.reference.getDatabasePageList().subscribe((response) => {
      //debugger;
      me.databaseList = response.DataSource;
      //console.info(response.DataSource);
      //addFilterPopups.resize();
      me.sizeChange.emit();
    });
    //}
  }
  goSelectDatamodel(
    database: DatamodelGroupUIModel //, addFilterPopups
  ) {
    const me = this;
    me.step = "datamodel";
    me.addingDatamodelGroup = database;
    //if (me.query != null) {
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
          //addFilterPopups.resize();
          me.sizeChange.emit();
        },
        (error) => {
          me.msg.error(error);
        }
      );
    //}
  }
  private updateColumnList(): Observable<SelectColumnModel[]> {
    const me = this;
    //me.isAllColumnSelected = false;
    return new Observable((observer: Observer<SelectColumnModel[]>) => {
      //意思是定义一个异步操作
      if (!me.pfUtil.isAnyNull(me.addingTable)) {
        me.reference
          .getDataColumnPageList(me.addingTable.ShortId)
          .subscribe((response) => {
            //debugger;
            //me.columnList = response.DataSource;

            let selectColumnList = response.DataSource.map((a) => {
              return new SelectColumnModelClass().initByField(
                me.sqlQueryUtil.FieldUIModelToType(a)
              );
            });

            observer.next(selectColumnList);
          });
      }
    });
  }
  private updateSourceOutFieldList(): Observable<SelectColumnModel[]> {
    const me = this;
    //me.isAllColumnSelected = false;
    return new Observable((observer: Observer<SelectColumnModel[]>) => {
      //意思是定义一个异步操作
      if (!me.pfUtil.isAnyNull(me.addingDatamodel)) {
        me.reference
          .getDatamodelQuery(me.addingDatamodel.DatamodelQueryId)
          .subscribe(
            (response) => {
              me.dataCenterReference
                .datamodelExecute(response.Id, "", "", "", 1)
                .subscribe((response2) => {
                  // me.sourceOutFieldList = response2.metabase.map((a) => [
                  //   "field-literal",
                  //   a.name,
                  //   a.type,
                  // ]);

                  //me.isAllSelected = me.pfUtil.isEmpty(me.query.fields);
                  let selectColumnList = response2.metabase.map((a) => {
                    return new SelectColumnModelClass().initByLiteralField(
                      ["field-literal", a.name, a.type],
                      me.addingDatamodel.DatamodelQueryId
                    );
                  });

                  observer.next(selectColumnList);
                });
            },
            (error) => {
              observer.error(error);
            }
          );
      }
    });
  }
  selectTable(table: DataTableUIModel) {
    const me = this;
    me.addingTable = table;
    me.addingDatamodel = null;
    //me.sourceType = "table";
    me.updateColumnList().subscribe((response) => {
      me.selectTableModel.emit(
        new KeyValuePairT<SelectTableModel, SelectColumnModel[]>(
          new SelectTableModelClass().initByTable(
            me.sqlQueryUtil.TableUIModelToType(table, null)
          ),
          response
        )
      );
    });
  }
  public likeText(columnName: string, text: string) {
    return PfUtil.likeText(columnName, text);
  }
  selectDatamodel(table: DatamodelQueryUIModel) {
    const me = this;
    me.addingDatamodel = table;
    me.addingTable = null;
    me.updateSourceOutFieldList().subscribe((response) => {
      // me.selectColumnList.forEach((a) => (a.selected = true));
      // me.isAllColumnSelected = true;

      me.selectTableModel.emit(
        new KeyValuePairT<SelectTableModel, SelectColumnModel[]>(
          new SelectTableModelClass().initByCard(
            me.sqlQueryUtil.QuestionUIModelToType(table)
          ),
          response
        )
      );
    });
  }
}
