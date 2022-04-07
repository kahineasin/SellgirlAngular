import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  Validators,
  FormBuilder,
  FormControl,
  ValidationErrors,
  FormGroup,
} from "@angular/forms";

import { Router, ActivatedRoute } from "@angular/router";
import { Node } from "@swimlane/ngx-graph";
import { NzMessageService } from "ng-zorro-antd/message";

import { Guid } from "guid-typescript";
import format from "date-fns/format";

import { ComputesReferenceService } from "../service/computes-reference.service";
import { UserProviderService } from "../service/user-provider.service";
import {
  DcosReferenceService,
  RegistryImage,
} from "../service/dcos-reference.service";
import { fromEvent, Observable, Observer, Subject, Subscription } from "rxjs";
import { ConfigService } from "../service/app-config.service";

import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { filter } from "rxjs/operators";
import { KeyValuePair } from "../common/pfModel";
import { PfUtil, ProcedureManager } from "../common/pfUtil";
// import {
//   FetchUri,
//   LinkModel,
//   PaintType,
//   ProcedureModel,
//   ProcedureType,
// } from '../../core/model/x-scheduler-job';
import { NzModalService } from "ng-zorro-antd/modal";
import { DragType } from "../pf_drag/pf-drag.directive";
import { PfClickArrowComponent } from "../pf-click-arrow/pf-click-arrow.component";
import { PfDropModel } from "../pf_drag/pf-drop.directive";
// import { timezone } from '../../../../core/declares/timezone';
// import { DataQuery } from '../../core/model/report-card';
import {
  DatabaseModel,
  DatamodelQuery,
  DataTableModel,
  DataTableUIModel,
} from "../model/data-integration";
import {
  DatasetQuery,
  StructuredDatasetQuery,
} from "../sql-query-area/model/Card";
// import StructuredQueryClass from '../sql-query-area/metabase-lib/lib/queries/StructuredQueryClass';
// import PfStructuredQueryClass from '../sql-query-area/metabase-lib/lib/queries/PfStructuredQueryClass';
import PfQuestion from "../sql-query-area/metabase-lib/lib/PfQuestion";
import { SqlQueryUtil } from "../sql-query-area/sql-query-util";
import { QueryAddLevelModel } from "../sql-query-area/sql-query-area.component";
import { DataCenterReferenceService } from "../service/datacenter-reference.service";
import { TableIdChangeModel } from "../sql-query-area/step/select-step/select-step.component";
// import { QuestionBase } from "../pf-dynamic-form/question-base";
// import { QuestionService } from "../pf-dynamic-form/question.service";

@Component({
  selector: "computes-datamodel-query-edit",
  templateUrl: "./datamodel-query-edit.component.html",
  styleUrls: ["./datamodel-query-edit.component.scss"],
  //providers: [QuestionService],
})
export class DatamodelQueryEditComponent implements OnInit {
  //路由过来的参数
  //datamodelQueryId = "";
  datamodelId = "";
  public datamodelQueryName = "";
  public description = "";

  //public isAdd: boolean = true; // 当前如果点保存,是新增还是修改
  public isDatamodelAdd: boolean = true; // 当前如果点保存,是新增还是修改
  // queryList: DatamodelQuery[] = [];
  public query: DatamodelQuery = null;
  public question: PfQuestion = null; //benjamin
  // queryClass: PfStructuredQueryClass = null;
  //public cardForm;
  public databaseId: number = -1;
  public databaseUUID = "";
  //public expressionBase64 = "";
  //public tableList: DataTableUIModel[] = [];
  // databaseList: DatabaseModel[] = [];

  //public dataQuery: DataQuery[] = [];
  public selectedIndex: number = 0;
  andOrData: string[] = ["and", "or"];
  testValue = "";
  // testList = ["and", "and", "and"];
  testList2 = [
    { key: "", value: "" },
    { key: "and", value: "and" },
    { key: "or", value: "or" },
  ];

  //测试属性
  isFilterJsonVisible = false;
  // questions$: Observable<QuestionBase<any>[]>;

  fieldForm: FormGroup = null;
  public baseForm?: FormGroup = null;

  public isAddModelVisible = false;
  public groupSelectedValue = "";
  public modelGroupList = [];

  //public showAggregationForFirstTime = false;
  public showXForFirstTime = "";

  // public testUserName1 = "";
  // public testUserName2 = "";

  public isSqlPopupsVisible = false;
  public sql = "";

  constructor(
    public config: ConfigService,
    private reference: ComputesReferenceService,
    private userProvider: UserProviderService,
    private dcosReference: DcosReferenceService,
    private activatRouter: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private http: HttpClient,
    private modalService: NzModalService,
    private pfUtil: PfUtil,
    private sqlQueryUtil: SqlQueryUtil, //benjamin
    public el: ElementRef, //service: QuestionService
    private dataCenterReference: DataCenterReferenceService
  ) {
    const me = this;

    me.fieldForm = this.fb.group({
      //leftFieldId: ["51", Validators.required],
      leftFieldId2: ["and", Validators.required],
      leftFieldId3: ["and", [Validators.required, Validators.minLength(5)]],
      rightFieldId: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    //console.log("ngOnInit enter");
    const me = this;

    me.datamodelId = me.activatRouter.snapshot.paramMap.get("datamodelId");
    let hasLocalQuery: boolean =
      me.activatRouter.snapshot.queryParams["hasLocalQuery"];
    // let expressionBase64 =
    //   me.activatRouter.snapshot.queryParams["expressionBase64"];

    this.isDatamodelAdd =
      me.datamodelId === undefined ||
      me.datamodelId == null ||
      me.datamodelId === "";
    //debugger;
    if (!this.isDatamodelAdd) {
      this.reference
        .getDatamodelQueryByUUID(me.datamodelId)
        .subscribe((response) => {
          me.query = response;
          //if (!me.pfUtil.isEmpty(expressionBase64)) {
          if (hasLocalQuery) {
            //编辑后未保存跳到其它页面再跳回来本页面的时候
            // me.query.query = JSON.parse(
            //   this.reference.base64Decode(expressionBase64)
            // );
            me.query.query = me.sqlQueryUtil.getLocalQuery();
          } else {
            me.query.query = JSON.parse(
              this.reference.base64Decode(response.QueryConfig)
            );
          }
          me.datamodelQueryName = response.DatamodelQueryName;
          me.description = response.Description;
          me.groupSelectedValue =
            response.GroupId !== null ? response.GroupId.toLowerCase() : "";
          me.updatePropertyByQuery();
        });
    } else {
      //测试时
      // me.query = {
      //   Id: "45264ecf-1184-2c03-b255-492f8eb4e57d",
      //   DatamodelQueryId: 1,
      //   DatamodelQueryName: "",
      //   QueryConfig: "",
      //   DatabaseId: "8EDC4C89-88D1-A59D-8CB5-787489993B08",
      //   TableId: "",
      //   QueryType: "query",
      //   query: {
      //     database: 2,
      //     query: {
      //       "source-table": 10,
      //       joins: [],
      //       filter: [],
      //       breakout: [],
      //       aggregation: [
      //         ["sum", ["field-id", 121]],
      //         [
      //           "aggregation-options",
      //           ["+", ["avg", ["field-id", 119]], ["max", ["field-id", 128]]],
      //           {
      //             "display-name": "cus_col_01",
      //           },
      //         ],
      //       ],
      //       "order-by": [],
      //     },
      //     type: "query",
      //     version: "perfect",
      //   },
      //   Description: "",
      //   Time: "",
      //   UpdateTime: "",
      //   UserId: "",
      //   Enable: true,
      //   GroupId: "",
      // };
      // me.updatePropertyByQuery();

      //正式时
      me.query = {
        Id: Guid.create().toString(),
        DatamodelQueryId: 1,
        DatamodelQueryName: "",
        QueryConfig: "",
        DatabaseId: "", //-1,
        TableId: "",
        QueryType: "query",
        //query: {},
        query: {
          database: -1,
          query: {},
          type: "query",
          version: "perfect",
        },
        Description: "",
        Time: "",
        UpdateTime: "",
        UserId: "",
        Enable: true,
        GroupId: "",
        Cache: false,
        CacheInterval: 0,
      };
      //if (!me.pfUtil.isEmpty(expressionBase64)) {
      if (hasLocalQuery) {
        //编辑后未保存跳到其它页面再跳回来本页面的时候
        // me.query.query = JSON.parse(
        //   this.reference.base64Decode(expressionBase64)
        // );
        me.query.query = me.sqlQueryUtil.getLocalQuery(); //benjamin
        me.updatePropertyByQuery();
      }
    }

    this.getGroupList();
  }

  back(): void {
    history.go(-1);
  }

  confirm(): void {
    const me = this;
    // if (me.jobConfigData.length < 1) {
    //   me.msg.info("没有建任何步骤");
    //   return;
    // }
    // if (!me.isJobInfoFilled) {
    //   me.msg.info("请先填写作业信息");
    //   me.cusListener.subscribe({
    //     next: (x) => me.msg.info("3333" + x),
    //     error: (err) => me.msg.info("4444" + err),
    //     complete: () => {
    //       me.saveJob();
    //     },
    //   });

    //   me.showEditJobInfoPopups();
    // } else {
    //   me.saveJob();
    // }

    const paramStr = this.reference.base64Encode(JSON.stringify(me.query));
    // if (me.isAdd) {
    //   me.router.navigate(["computes/datamodel-add"], {
    //     queryParams: { query: paramStr },
    //   });
    // } else {
    //   me.router.navigate(["computes/datamodel-edit"], {
    //     queryParams: { query: paramStr },
    //   });
    // }

    this.isAddModelVisible = true;
  }
  private updatePropertyByQuery() {
    const me = this;
    me.databaseId = me.query.query.database;

    me.sqlQueryUtil
      .getQuestion(
        // me.datamodelQueryId,
        me.databaseId,
        me.sqlQueryUtil.QuestionUIModelToType(me.query),
        (this.query.query as StructuredDatasetQuery).query
      )
      .subscribe((response) => {
        me.question = response;
      });
    me.reference.getDatabase(me.databaseId).subscribe((database) => {
      me.databaseUUID = database.DataSourceId;
    });
  }

  // private getNewDataQueryName(oldQueryList: DatamodelQuery[]): string {
  //   const me = this;
  //   let i: number = oldQueryList.length + 1;
  //   while (true) {
  //     const n = "query" + me.pfUtil.padZeroLeft(i, 2);
  //     if (oldQueryList.findIndex((a) => a.DatamodelQueryName === n) > -1) {
  //       i++;
  //     } else {
  //       return n;
  //     }
  //   }
  // }
  public getCurrentFilter() {
    const me = this;
    //return JSON.stringify(me.testList); //me.query);
    return JSON.stringify(me.query); //me.query);
  }
  // public onAndOrChange(dom: string, idx: number) {
  //   //debugger;
  //   const me = this;
  //   me.testList[idx] = dom; //.target.value;
  //   // me.testList.splice(0, 3);
  //   // me.testList = [];
  //   // //me.testList = ["or", "and", "and"];
  //   // me.testList.push("or");
  //   // me.testList.push("and");
  //   // me.testList.push("and");
  //   //me.testList[idx].a = dom.target.value;

  //   // me.testList.splice(idx, 1);
  //   // me.testList.splice(idx, 0, dom.target.value);
  //   // me.testList[idx] = dom.target.value;
  //   // me.testList.splice(idx, 1, dom.target.value);
  //   //me.testList[idx].a = dom.target.value;
  //   //me.filter[idx] = newAndOr.target.value; //newAndOr;
  //   //me.filterChange.emit(me.filter);
  // }
  public changeMiddelItem() {
    const me = this;
    //me.testList[1] = "or";
  }
  public changeMiddelItem2() {
    const me = this;
    //me.testList.splice(1, 1, "or");
  }

  // public onQueryAddLevel(innerQuery) {
  //   const me = this;
  //   // me.query.query = {
  //   //   "source-query": innerQuery,
  //   // };
  //   me.showAggregationForFirstTime = true;
  //   (me.query.query as StructuredDatasetQuery).query = {
  //     "source-query": innerQuery,
  //   };
  // }
  public onQueryAddLevel(
    //queryAddLevel: any) {
    queryAddLevel: QueryAddLevelModel
  ) {
    //benjamin
    const me = this;
    // me.query.query = {
    //   "source-query": innerQuery,
    // };
    //me.showAggregationForFirstTime = true;
    me.showXForFirstTime = queryAddLevel.showXForFirstTime;
    (me.query.query as StructuredDatasetQuery).query = {
      "source-query": queryAddLevel.innerQuery,
    };
  }
  public onQueryDeleteLevel(innerQuery) {
    const me = this;
    // debugger;
    //me.query.query = innerQuery;
    (me.query.query as StructuredDatasetQuery).query = innerQuery;
  }

  addModelCancel(): void {
    this.isAddModelVisible = false;
  }
  addModelOk(): void {
    const me = this;
    if (this.datamodelQueryName === "" || this.description === "") {
      this.msg.success("参数不能为空");
      return;
    }
    this.query.UserId = this.userProvider.getUserInfo().UserId;
    this.query.DatamodelQueryName = this.datamodelQueryName;
    this.query.Description = this.description;
    this.query.QueryConfig = this.reference.base64Encode(
      JSON.stringify(this.query.query)
    );
    this.query.GroupId =
      this.groupSelectedValue !== ""
        ? this.groupSelectedValue.toUpperCase()
        : "";
    me.query.DatabaseId = me.databaseUUID;
    //console.log("confirm == >" + JSON.stringify(this.query));
    if (me.isDatamodelAdd) {
      me.query.Cache = false;
      me.query.CacheInterval = 0;
    }
    me.reference
      .updateDatamodelQuery(me.query, me.isDatamodelAdd)
      .subscribe((response) => {
        if (response.Success) {
          this.isAddModelVisible = false;
          this.router.navigate(["computes/datamodel"]);
        } else {
          me.msg.error(response.Message ?? "保存失败");
        }
      });
  }

  getGroupList(): void {
    // this.reference
    //   .request(
    //     'POST',
    //     'DataMdoelGroup/GetItems',
    //     this.userProvider.getToken(),
    //     [
    //       { key: 'pageSize', value: 0 },
    //       { key: 'pageIndex', value: 0 },
    //       { key: 'userId', value: this.userProvider.getUserInfo().UserId },
    //       { key: 'roleId', value: this.userProvider.getUserInfo().RoleId },
    //       { key: 'groupType', value: 0 },
    //     ],
    //     false
    //   )
    //   .subscribe((response) => {
    //     if (response.Success === 'True' && response.Result != null) {
    //       const data = JSON.parse(this.reference.base64Decode(response.Result));
    //       //console.log(JSON.stringify(data));
    //       this.modelGroupList = data.DataSource;
    //     } else {
    //       this.msg.error('请求失败');
    //     }
    //   });
    this.reference.getDatamodelGroup(0).subscribe(
      (response) => {
        this.modelGroupList = response;
      },
      (err) => {
        this.msg.error(err);
      }
    );
  }

  public onTableIdChange(event: TableIdChangeModel) {
    const me = this;

    me.query.query.database = event.databaseId;
    me.databaseId = event.databaseId;
    //debugger;
    (me.query.query as StructuredDatasetQuery).query = {
      //benjamin
      "source-table": event.tableId,
      "source-model": event.modelId,
    };
    if (me.pfUtil.isAnyNull(me.question)) {
      // me.updatePropertyByQuery();
      me.sqlQueryUtil
        .getQuestion(
          // me.datamodelQueryId,
          me.databaseId,
          me.sqlQueryUtil.QuestionUIModelToType(me.query),
          (this.query.query as StructuredDatasetQuery).query
        )
        .subscribe((response) => {
          //debugger;
          me.question = response;
        });
    } else {
      me.sqlQueryUtil
        .getMetadata(
          me.databaseId,
          (this.query.query as StructuredDatasetQuery).query
        )
        .subscribe((response) => {
          //debugger;
          me.question = new PfQuestion(
            me.sqlQueryUtil.QuestionUIModelToType(me.query),
            response
          );
        });
    }
    me.reference.getDatabase(me.databaseId).subscribe((database) => {
      me.databaseUUID = database.DataSourceId;
    });
  }

  public goTableListPage() {
    const me = this;
    //me.router.navigate(["/computes/datamodel-table-list/" + me.datamodelId]);
    // me.router.navigate([
    //   "/computes/datamodel-table-list/" +
    //     me.databaseUUID +
    //     "/" +
    //     me.reference.base64Encode(JSON.stringify(me.query.query)),
    // ]);
    let backUrl = "";
    if (me.isDatamodelAdd) {
      backUrl = "/computes/datamodel-query-add";
    } else {
      backUrl = "/computes/datamodel-query-edit/" + me.datamodelId;
    }
    me.sqlQueryUtil.saveLocalQuery(me.query.query); //benjamin
    me.router.navigate(
      //["/computes/datamodel-table-list/" + me.reference.base64Encode(backUrl)],
      ["/computes/datamodel-table-list/" + me.datamodelId],
      {
        queryParams: {
          //datamodelId: me.datamodelId,
          datamodelName: me.datamodelQueryName,
          //"source-model": event.modelId,
          databaseId: me.databaseId,
          // expressionBase64: me.reference.base64Encode(
          //   JSON.stringify(me.query.query)
          // ),
          hasLocalQuery: true,
          backUrlBase64: me.reference.base64Encode(backUrl),
        },
      }
    );
  }
  public openSqlPopups() {
    const me = this;
    me.isSqlPopupsVisible = !me.isSqlPopupsVisible;
    // me.dataCenterReference
    //   .datamodelConvertToSQL(me.datamodelId, "", "", "")
    //   .subscribe(
    //     (response) => {
    //       //debugger;
    //       me.sql = response;
    //     },
    //     (err) => {
    //       //debugger;
    //       me.msg.info(err);
    //     }
    //   );
    me.dataCenterReference
      .datamodelConvertToSQL2(
        me.databaseId,
        //me.databaseUUID,
        me.reference.base64Encode(JSON.stringify(me.query.query))
      )
      .subscribe(
        (response) => {
          //debugger;
          me.sql = response;
        },
        (err) => {
          //debugger;
          me.msg.info(err);
        }
      );
  }
  public copySql() {
    const me = this;
    navigator.clipboard.writeText(me.sql);
    me.msg.info("已复制");
  }
}
