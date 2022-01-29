import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormControl,
  ValidationErrors,
} from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
// import { Node } from "@swimlane/ngx-graph";
import { NzMessageService } from 'ng-zorro-antd/message';

// import { Guid } from "guid-typescript";
// import format from "date-fns/format";

import { ComputesReferenceService } from '../service/computes-reference.service';
import { UserProviderService } from '../service/user-provider.service';
import {
  DcosReferenceService,
  RegistryImage,
} from '../service/dcos-reference.service';
// import { forkJoin, Observable, Observer, Subject, Subscription } from "rxjs";
import { ConfigService } from '../service/app-config.service';

import {
  HttpClient,
  // HttpEvent,
  // HttpEventType,
  // HttpRequest,
  // HttpResponse,
} from '@angular/common/http';
// import { filter } from "rxjs/operators";
//import { KeyValuePair } from "../../../../core/common/pfModel";
//import { PfUtil, ProcedureManager } from "../../../../core/common/pfUtil";
import { PfUtil } from '../common/pfUtil';
// import {
//   FetchUri,
//   LinkModel,
//   PaintType,
//   ProcedureModel,
//   ProcedureType,
// } from "../../core/model/x-scheduler-job";
import { NzModalService } from 'ng-zorro-antd/modal';
// import { DragType } from "../../core/directive/drag.directive";
// import { PfClickArrowComponent } from "../share/pf-click-arrow/pf-click-arrow.component";
// import { DropModel } from "../../core/directive/drop.directive";
// import { timezone } from "../../../../core/declares/timezone";
//import { DataQuery } from "../../core/model/report-card";
import {
  DatabaseModel,
  DatabaseModelClass,
  DataColumnModel,
  // DatamodelQuery,
  DataTableModel,
  DataTableUIModel,
  // DataTableModelClass,
} from '../model/data-integration';
import { ConcreteField, FieldLiteral, StructuredQuery } from './model/Query';
//import { KeyValuePairT } from "./step/filter-step/filter-step.component";
import { KeyValuePairT, SqlQueryUtil } from './sql-query-util';
import PfStructuredQueryClass from './metabase-lib/lib/queries/PfStructuredQueryClass';
import PfQuestion from './metabase-lib/lib/PfQuestion';
import FieldClass from './metabase-lib/lib/metadata/FieldClass';

export class QueryAddLevelModel {
  public showXForFirstTime: string;
  public innerQuery: StructuredQuery;
}

@Component({
  selector: 'sql-query-area',
  templateUrl: './sql-query-area.component.html',
  styleUrls: ['./sql-query-area.component.scss'],
})
export class SqlQueryAreaComponent implements OnInit {
  @Input() public isFirstFloor: boolean = false; //SqlQueryArea是多级嵌套,会用到此属性
  @Input() public databaseId: number = null;
  // @Input() databaseId: string;
  // @Input() public sourceTableId: string = "jack";
  @Input() public tableList: DataTableModel[] = [];
  // @Input() public joins: any[] = [];
  //@Input() public query: DatamodelQuery = null;
  @Input() public query: StructuredQuery = null;
  //@Input() public showAggregationForFirstTime: boolean = false;
  @Input() public showXForFirstTime: string = '';
  @Input() public question: PfQuestion = null;

  @Output() public queryAddLevel = new EventEmitter<QueryAddLevelModel>();
  @Output() public queryDeleteLevel = new EventEmitter<StructuredQuery>();
  // @Output() public databaseIdChange = new EventEmitter();
  @Output() public tableIdChange = new EventEmitter<{
    tableId: number;
    databaseId: number;
  }>(); //命名一定要是上面的字段名后加Change
  /**
   * 内层的输出字段有变时(如:1.聚合输出变了;2.join字段变了),要告诉外层更新可选的字段
   */
  @Output() public outFieldChange = new EventEmitter(); //命名一定要是上面的字段名后加Change
  //@Output() public showAggregationForFirstTimeChange = new EventEmitter(); //命名一定要是上面的字段名后加Change
  @Output() public showXForFirstTimeChange = new EventEmitter<string>();

  public queryClass: PfStructuredQueryClass = null;
  public isSourceQuery: boolean = false;

  //filterColor: [113, 114, 173];
  public readonly cellColor = {
    select: [80, 158, 227],
    filter: [113, 114, 173],
    join: [80, 158, 227],
    aggregation: [136, 191, 77],
    order: [147, 161, 171],
    customColumn: [147, 161, 171],
  };
  //@Output() public queryChange = new EventEmitter(); //命名一定要是上面的字段名后加Change
  //public databaseId: string = "";
  // public databaseId?: number = null;
  public tableId?: number = null; //"jack";
  public databaseList: DatabaseModel[] = [];
  //public tableList: DataTableUIModel[] = [];
  /**
   * 因为filter递归都要用到字段list来显示field的name,所以还是Input传递好了
   * 而且fieldList在此组件内是不会被修改的,所以最好从sql-query-area传进filter组件
   */
  //@Input() fieldList: KeyValuePairT<DataTableModel, DataColumnModel[]>[] = []; //结构如 [{tb,cols}]
  public fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = []; //结构如 [{tb,cols}]
  /**
   * 内层source-query中的聚合输出字段
   */
  sourceOutFieldList: FieldLiteral[] = []; //ConcreteField
  //public joins: any[] = [];
  //public filter: any[] = [];
  // @Output() public tableListChange = new EventEmitter(); //命名一定要是上面的字段名后加Change
  // areaTableList: DataTableModel[] = [];

  //hasJoin: boolean = false;
  allowJoin: boolean = true;
  allowFilter: boolean = true;
  // hasFilter: boolean = false;
  // hasAggregation: boolean = false;
  allowAggregation: boolean = true;
  allowCustomColumn: boolean = true;
  allowOrder: boolean = true;

  aggregationDelBtnVisible: boolean = false;
  delBtnVisible: Object = {};
  rowVisible: Object = {};

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
    public pfUtil: PfUtil,
    public el: ElementRef,
    private sqlQueryUtil: SqlQueryUtil
  ) {
    const me = this;
    // me.cardForm = me.fb.group({
    //   CardId: ["", Validators.required],
    //   CardName: ["", Validators.required],
    //   //如果需要图表的显示方式字段
    //   //Display:["line", Validators.required],
    //   //visualization_settings

    //   DataQuery: ["line", Validators.required],
    //   DatabaseId: ["", Validators.required],
    //   TableId: ["", Validators.required],
    //   QueryType: ["query", Validators.required], //这个类型是参考metabase的,暂不清楚有什么用
    //   //result_metadata: ["line", Validators.required],//来自metabase,暂不清楚有什么用.格式如 [{"base_type":"type/Date","display_name":"日期","name":"cday","description":"Cda Y","special_type":"type/PK","unit":"month","fingerprint":{"global":{"distinct-count":111,"nil%":0.0},"type":{"type/DateTime":{"earliest":"2011-04-01T00:00:00+08:00","latest":"2020-06-01T00:00:00+08:00"}}}},{"base_type":"type/Decimal","display_name":"客单价","name":"expression","special_type":null,"fingerprint":{"global":{"distinct-count":111,"nil%":0.0},"type":{"type/Number":{"min":1002.066521,"q1":1248.855449411434,"q3":1631.1762484751403,"max":2223.38569,"sd":264.3380020519317,"avg":1450.0562181531532}}}}]

    //   Description: [""],
    //   Time: [format(new Date(), "yyyy-MM-dd HH:mm:ss"), Validators.required],
    //   UpdateTime: [""],
    //   UserId: ["", Validators.required],
    // });
  }

  ngOnInit(): void {
    const me = this;
    console.info(
      '---------------------sql-query-area.component ngOnInit-----------------------'
    );
    if (me.query == null) {
      //新增
    }
    // // me.tableList.push({
    // //   SourceName: "a",
    // //   SourceType: "a",
    // //   DatabaseName: "a",
    // //   Ip: "a",
    // //   Port: "a",
    // //   UserName: "a",
    // //   Passwordame: "a",
    // //   CreatorName: "a",
    // //   MetaId: "a",
    // //   TableName: "a",
    // //   Enable: "a",
    // //   Creator: "a",
    // //   CreateTime: "a",
    // //   SourceId: "a",
    // //   UpdateTime: "a",
    // //   ShortId: "a",
    // // });
    // //me.areaTableList=me.tableList;

    // //这个逻辑应该放到idAdd==false 时
    // //一层的情况,测试ok
    // // me.filter = [
    // //   "and",
    // //   ["=", ["field-id", 276], "967122"],
    // //   [">", ["field-id", 274], true],
    // //   ["<=", ["joined-field", "chinese_city", ["field-id", 249]], "临沂市"],
    // //   ["=", ["field-id", 149], "上海分公司"],
    // //   [
    // //     "contains",
    // //     ["field-id", 147],
    // //     "aa",
    // //     {
    // //       "case-sensitive": false,
    // //     },
    // //   ],
    // // ];
    // // //改造and配置方式(为了兼容or)
    // // me.filter = [
    // //   ["=", ["field-id", 276], "967122"],
    // //   "and",
    // //   [">", ["field-id", 274], true],
    // //   "and",
    // //   ["<=", ["joined-field", "chinese_city", ["field-id", 249]], "临沂市"],
    // //   "and",
    // //   [
    // //     "contains",
    // //     ["field-id", 147],
    // //     "aa",
    // //     {
    // //       "case-sensitive": false,
    // //     },
    // //   ],
    // // ];
    // //me.filter = me.query.query;
    // //旧版
    // // me.filter = [
    // //   "and",
    // //   ["=", ["field-id", 276], "967122"],
    // //   [">", ["field-id", 274], true],
    // // ];
    // //改造and配置方式(为了兼容or)
    // // me.filter = [
    // //   ["=", ["field-id", 276], "967122"],
    // //   "and",
    // //   ["=", ["field-id", 274], true],
    // // ];
    // //me.filter = [["=", ["field-id", 274], true]];
    // // me.hasFilter =
    // //   me.query != null &&
    // //   me.query != undefined &&
    // //   me.query.filter != null &&
    // //   me.query.filter != undefined &&
    // //   me.query.filter.length > 0;
    // me.rowVisible["filter"] =
    //   me.query != null &&
    //   me.query != undefined &&
    //   me.query.filter != null &&
    //   me.query.filter != undefined &&
    //   me.query.filter.length > 0;

    // me.rowVisible["aggregation"] =
    //   me.query != null &&
    //   me.query != undefined &&
    //   me.query.breakout != null &&
    //   me.query.breakout != undefined &&
    //   me.query.breakout.length > 0;
    // me.rowVisible["join"] =
    //   me.query != null &&
    //   me.query != undefined &&
    //   me.query.joins != null &&
    //   me.query.joins != undefined &&
    //   me.query.joins.length > 0;
    // me.rowVisible["order"] =
    //   !me.pfUtil.isAnyNull(me.query) &&
    //   !me.pfUtil.isListEmpty(me.query["order-by"]);

    // if (
    //   // me.query != null &&
    //   // me.query != undefined &&
    //   // me.query.database != null &&
    //   // me.query.database != undefined
    //   !me.pfUtil.isAnyNull(me.query, me.databaseId)
    // ) {
    //   //me.databaseId = me.query.query.database.toString();
    //   //me.databaseId = me.query.database;
    //   me.databaseId = me.databaseId;
    // }

    // //console.info(me.query.database);
    // // // 下拉框
    // this.reference.getDatabasePageList().subscribe((response) => {
    //   me.databaseList =
    //     response.DataSource !== null
    //       ? response.DataSource.map((a) => new DatabaseModelClass(a))
    //       : null;

    //   console.info(response.DataSource);
    // });

    // me.tableId = me.query["source-table"];
    // me.onDatabaseChange(); //注意这里使用了异步,子组件的OnInit中无法使用tableList这个值
    // //me.tableList = [new DataTableModelClass({})];

    // //修改时先把已选表的字段查出来

    // let tableIds: number[] = [];
    // if (me.query["source-table"] != null) {
    //   tableIds.push(me.query["source-table"]);
    // }
    // if (me.query.joins != null) {
    //   for (let i = 0; i < me.query.joins.length; i++) {
    //     tableIds.push(me.query.joins[i]["source-table"]);
    //   }
    // }

    // // me.queryFields(tableIds).subscribe(
    // //   (response) => {
    // //     me.fieldList = [...me.fieldList, ...response];
    // //   },
    // //   (e) => {
    // //     debugger;
    // //   }
    // // );
    // // me.queryFields(tableIds).subscribe(
    // //   (response) => {
    // //     me.fieldList = response;
    // //   },
    // //   (e) => {
    // //     debugger;
    // //   }
    // // );
    // me.sqlQueryUtil.queryFields(this.databaseId, this.query).subscribe(
    //   (response) => {
    //     me.fieldList = response;
    //   },
    //   (e) => {
    //     debugger;
    //   }
    // );
    // me.sqlQueryUtil
    //   .getSourceQueryOutFields(me.databaseId, me.query)
    //   .subscribe((response) => {
    //     me.sourceOutFieldList = response;
    //   });
    // me.updateBtnAllowStatus();

    // me.queryClass = new PfStructuredQueryClass(
    //   //new PfQuestion(),
    //   me.question == null,
    //   //Object.assign(new PfQuestion(), { _metadata: {} }),
    //   {
    //     type: "query",
    //     database: me.databaseId,
    //     query: me.query,
    //     parameters: null,
    //     version: "perfect",
    //   }
    // );
    me.initQueryClassByQuestion();
    // me.sqlQueryUtil.queryFields(this.databaseId,me.query).subscribe(
    //   (response) => {
    //   },
    //   (e) => {
    //     debugger;
    //   }
    // );
    // debugger;
    // if (me.showAggregationForFirstTime) {
    //   me.rowVisible["aggregation"] = true;
    //   //me.showAggregationForFirstTimeChange.emit(false);
    // }
  }
  private initQueryClassByQuestion() {
    const me = this;
    if (!me.pfUtil.isAnyNull(me.question)) {
      me.queryClass = new PfStructuredQueryClass(
        //new PfQuestion(),
        me.question,
        //Object.assign(new PfQuestion(), { _metadata: {} }),
        {
          type: 'query',
          database: me.databaseId,
          query: me.query,
          parameters: null,
          version: 'perfect',
        }
      );
    }
  }
  /**
   * 更新按钮的可用状态(现时是不可用就不显示)
   */
  updateBtnAllowStatus() {
    const me = this;
    me.allowJoin =
      !me.pfUtil.isAnyNull(me.query['source-table']) ||
      !me.pfUtil.isAnyNull(me.query['source-query']);
    //me.allowAggregation = me.allowJoin;
    me.allowFilter = me.allowJoin;
    me.allowOrder = me.allowJoin;

    // if (!me.allowJoin) {
    //   me.allowAggregation = false;
    // } else {
    //   if (me.isFirstFloor) {
    //     if (
    //       me.rowVisible["aggregation"] &&
    //       me.pfUtil.isListEmpty(me.query.breakout)
    //     ) {
    //       me.allowAggregation = false;
    //     } else {
    //       me.allowAggregation = true;
    //     }
    //   } else {
    //     if (me.rowVisible["aggregation"]) {
    //       me.allowAggregation = false;
    //     } else {
    //       me.allowAggregation = true;
    //     }
    //   }
    // }

    //debugger;
    // if (me.showAggregationForFirstTime) {
    //   me.rowVisible["aggregation"] = true;
    //   //me.showAggregationForFirstTimeChange.emit(false);
    // }
    if (!me.pfUtil.isEmpty(me.showXForFirstTime)) {
      me.rowVisible[me.showXForFirstTime] = true;
      //me.showAggregationForFirstTimeChange.emit(false);
    }

    // let a = me.pfUtil.isEmpty("");
    // let b = me.pfUtil.isEmpty([]);
    // let c = me.pfUtil.isEmpty({});
    // let d = me.pfUtil.isEmpty(null);
    // let e = me.pfUtil.isEmpty({ a });
    // let f = me.pfUtil.isEmpty([1]);
    // console.info("-----------------text isEmpty----------------");
    // console.info(a);
    // console.info(b);
    // console.info(c);
    // console.info(d);
    // console.info(e);
    // console.info(f);

    if (
      me.pfUtil.isAllNull(me.query['source-table'], me.query['source-query'])
    ) {
      //开始新增未选择表时
      me.allowAggregation = false;
      me.allowCustomColumn = false;
    } else if (
      (me.rowVisible['aggregation'] || me.rowVisible['customColumn']) &&
      me.pfUtil.isAllEmpty(me.query.breakout, me.query.expressions)
    ) {
      //选择了汇总或自定义字段方式,但还未进行字段编辑时
      me.allowAggregation = false;
      me.allowCustomColumn = false;
    } else if (
      !me.isFirstFloor &&
      !me.pfUtil.isAllEmpty(me.query.breakout, me.query.expressions)
    ) {
      //编辑完汇总或自定义字段,且非最外层
      me.allowAggregation = false;
      me.allowCustomColumn = false;
    } else if (
      me.isFirstFloor &&
      !me.pfUtil.isAllEmpty(me.query.breakout, me.query.expressions)
    ) {
      //编辑完汇总或自定义字段,是最外层
      me.allowAggregation = true;
      me.allowCustomColumn = true;
    } else if (
      (me.rowVisible['aggregation'] || me.rowVisible['customColumn']) &&
      !me.isFirstFloor
    ) {
      //已经显示aggregation或customColumn,且非最外层
      me.allowAggregation = false;
      me.allowCustomColumn = false;
    } else if (me.rowVisible['aggregation']) {
      me.allowCustomColumn = false;
    } else if (me.rowVisible['customColumn']) {
      me.allowAggregation = false;
    } else {
      me.allowAggregation = true;
      me.allowCustomColumn = true;
      // if (false) {
      // }
      // // else if (
      // //   me.rowVisible["aggregation"] &&
      // //   me.pfUtil.isListEmpty(me.query.breakout)
      // // ) {
      // //   me.allowAggregation = false;
      // // }
      // //  else if (
      // //   //开始新增未选择表时
      // //   me.pfUtil.isAnyNull(me.query["source-table"]) &&
      // //   me.pfUtil.isAnyNull(me.query["source-query"])
      // // ) {
      // //   me.allowAggregation = false;
      // // }
      // else if (
      //   //最外层未选择breakout时
      //   me.rowVisible["aggregation"] &&
      //   me.pfUtil.isAnyNull(me.query["source-table"]) &&
      //   !me.pfUtil.isAnyNull(me.query["source-query"]) &&
      //   me.pfUtil.isListEmpty(me.query.breakout)
      // ) {
      //   me.allowAggregation = false;
      // }
      // // else if (
      // //   //已经显示aggregation-step且非最外层
      // //   me.rowVisible["aggregation"] &&
      // //   !me.isFirstFloor
      // // ) {
      // //   me.allowAggregation = false;
      // // }
      // // else if (me.rowVisible["customColumn"]) {
      // //   me.allowAggregation = false;
      // // }
      // else {
      //   me.allowAggregation = true;
      // }

      // //debugger;
      // // if (me.rowVisible["aggregation"]) {
      // //   me.allowCustomColumn = false;
      // // }
      // if (
      //   me.rowVisible["customColumn"] &&
      //   me.pfUtil.isAnyNull(me.query.expressions)
      // ) {
      //   me.allowCustomColumn = false;
      // } else if (
      //   //已经显示step且非最外层
      //   me.rowVisible["customColumn"] &&
      //   !me.isFirstFloor
      // ) {
      //   me.allowCustomColumn = false;
      // } else {
      //   me.allowCustomColumn = true;
      // }
    }
  }
  /**
   * 注意,删除step时是不会进入此事件的
   */
  ngOnChanges() {
    const me = this;
    me.isSourceQuery = !me.pfUtil.isAnyNullAction(
      me.query,
      (a) => a['source-query']
    );

    // console.info(
    //   "---------------------sql-query-area.component ngOnChanges-----------------------"
    // );
    //debugger;
    //本来应该不需要这个判断,但当删除最外层query时,不知为何会有query为undefined的情况,估计和组件消毁的过程有关
    if (!me.pfUtil.isAnyNull(me.query)) {
      me.rowVisible['filter'] =
        me.query != null &&
        me.query != undefined &&
        me.query.filter != null &&
        me.query.filter != undefined &&
        me.query.filter.length > 0;

      // me.rowVisible["aggregation"] =
      //   me.query != null &&
      //   me.query != undefined &&
      //   me.query.breakout != null &&
      //   me.query.breakout != undefined &&
      //   me.query.breakout.length > 0;
      me.rowVisible['aggregation'] =
        me.query != null &&
        me.query != undefined &&
        ((me.query.breakout != null &&
          me.query.breakout != undefined &&
          me.query.breakout.length > 0) ||
          (me.query.aggregation != null &&
            me.query.aggregation != undefined &&
            me.query.aggregation.length > 0));
      me.rowVisible['join'] =
        me.query != null &&
        me.query != undefined &&
        me.query.joins != null &&
        me.query.joins != undefined &&
        me.query.joins.length > 0;
      me.rowVisible['order'] =
        !me.pfUtil.isAnyNull(me.query) &&
        !me.pfUtil.isListEmpty(me.query['order-by']);

      // me.rowVisible["customColumn"] = !me.pfUtil.isAnyNullAction(
      //   me.query,
      //   (a) => a["expressions"]
      // );
      me.rowVisible['customColumn'] = !me.pfUtil.isAnyEmptyAction(
        me.query,
        (a) => a['expressions']
      );

      console.info('------aaa------');
      //console.info(typeof me.query["expressions"]);
      console.info(me.rowVisible['customColumn']);
      console.info(me.rowVisible['aggregation']);
      //debugger;

      if (
        // me.query != null &&
        // me.query != undefined &&
        // me.query.database != null &&
        // me.query.database != undefined
        !me.pfUtil.isAnyNull(me.query, me.databaseId)
      ) {
        //me.databaseId = me.query.query.database.toString();
        //me.databaseId = me.query.database;
        me.databaseId = me.databaseId;
      }

      //console.info(me.query.database);
      // // 下拉框
      this.reference.getDatabasePageList().subscribe((response) => {
        me.databaseList =
          response.DataSource !== null
            ? response.DataSource.map((a) => new DatabaseModelClass(a))
            : null;

        console.info(response.DataSource);
      });

      me.tableId = me.query['source-table'];
      //me.onDatabaseChange(); //注意这里使用了异步,子组件的OnInit中无法使用tableList这个值
      //me.tableList = [new DataTableModelClass({})];

      //修改时先把已选表的字段查出来

      let tableIds: number[] = [];
      if (me.query['source-table'] != null) {
        tableIds.push(me.query['source-table']);
      }
      if (me.query.joins != null) {
        for (let i = 0; i < me.query.joins.length; i++) {
          tableIds.push(me.query.joins[i]['source-table']);
        }
      }

      // me.queryFields(tableIds).subscribe(
      //   (response) => {
      //     me.fieldList = [...me.fieldList, ...response];
      //   },
      //   (e) => {
      //     debugger;
      //   }
      // );
      // me.queryFields(tableIds).subscribe(
      //   (response) => {
      //     me.fieldList = response;
      //   },
      //   (e) => {
      //     debugger;
      //   }
      // );
      me.sqlQueryUtil.queryFields(this.databaseId, this.query).subscribe(
        (response) => {
          me.fieldList = response;
          // const numbers = [1, 2, 3, 4, 5];
          // const doubled = numbers.map((number) => number * 2);

          // //me.fieldList = response;
          // for (let i = 0; i < me.fieldList.length; i++) {
          //   let fields = me.fieldList[i].value.map((a) => {
          //     return {
          //       id: a.ShortId,

          //       name: a.ColumnName,
          //       display_name: a.ColumnName,
          //       description: a.Description,
          //       base_type: a.DataType,

          //       special_type: null,
          //       active: null,
          //       visibility_type: null,
          //       preview_display: null,
          //       position: null,
          //       parent_id: null,

          //       table_id: a.MetabaseShortId,

          //       fk_target_field_id: null,

          //       max_value: null,
          //       min_value: null,

          //       caveats: null,
          //       points_of_interest: null,

          //       last_analyzed: null,
          //       created_at: null,
          //       updated_at: null,

          //       values: null,
          //       dimensions: null,
          //     };
          //   });
          //   me.queryClass.addFields(fields);
          //   let table = me.fieldList[i].key;
          //   me.queryClass.addTables([
          //     {
          //       id: table.ShortId,
          //       db_id: table.SourceShortId,

          //       schema: null,
          //       name: table.TableName,
          //       display_name: table.TableName,

          //       description: table.TableName,
          //       active: null,
          //       visibility_type: null,

          //       fields: fields, //.map((a) => a)
          //       segments: [],
          //       metrics: [],
          //       rows: null,

          //       caveats: null,
          //       points_of_interest: null,
          //       show_in_getting_started: null,
          //     },
          //   ]);
          // }
        },
        (e) => {
          debugger;
        }
      );
      // me.queryClass = new PfStructuredQueryClass(
      //   //new PfQuestion(),
      //   me.question,
      //   //Object.assign(new PfQuestion(), { _metadata: {} }),
      //   {
      //     type: "query",
      //     database: me.databaseId,
      //     query: me.query,
      //     parameters: null,
      //     version: "perfect",
      //   }
      // );
      me.initQueryClassByQuestion();
      me.sqlQueryUtil
        .getSourceQueryOutFields(me.databaseId, me.query)
        .subscribe((response) => {
          me.sourceOutFieldList = response;
        });
      //debugger;
      me.updateBtnAllowStatus();
    }
  }

  getBackColor(colorName: string): string {
    const me = this;
    const color = me.cellColor[colorName];
    return 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',0.1)';
  }
  getFrontColor(colorName: string): string {
    const me = this;
    const color = me.cellColor[colorName];
    return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
  }
  getFrontHoverColor(colorName: string): string {
    const me = this;
    const color = me.cellColor[colorName];
    return 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',0.8)';
  }

  // /**
  //  * 此方法的作用类似updateTable,但此方法方便可以异步等待
  //  * @deprecated 用SqlQueryUtil里的方法
  //  * @param tableId
  //  * @returns
  //  */
  // private queryFields(tableId: number[]) {
  //   const me = this;
  //   let r: KeyValuePairT<DataTableModel, DataColumnModel[]>[] = [];
  //   const observable = new Observable<
  //     KeyValuePairT<DataTableModel, DataColumnModel[]>[]
  //   >((subscriber) => {
  //     const ro = new Observable<
  //       KeyValuePairT<DataTableModel, DataColumnModel[]>
  //     >((rSubscriber) => {
  //       me.reference
  //         //.getDataTableList(me.query.database)
  //         .getDataTableList(me.databaseId)
  //         .subscribe((response) => {
  //           let tableList = response.DataSource.filter(
  //             (t) => tableId.indexOf(t.ShortId) > -1
  //           );
  //           //debugger;
  //           let oList: Observable<boolean>[] = [];
  //           tableList.map((a) => {
  //             const tmpO = new Observable<boolean>((subscriber2) => {
  //               me.reference
  //                 .getDataColumnPageList(a.ShortId)
  //                 .subscribe((response2) => {
  //                   r.push(
  //                     new KeyValuePairT<DataTableModel, DataColumnModel[]>(
  //                       a,
  //                       response2.DataSource
  //                     )
  //                   );
  //                   subscriber2.next(true);
  //                   subscriber2.complete();
  //                 });
  //             });
  //             oList.push(tmpO);
  //           });
  //           forkJoin(oList).subscribe(
  //             (a) => {
  //               //这里有些奇怪，只有当aa和bb的observer.complete()执行完才会进入这里（一般会误以为是next执行完就进来吧）
  //               rSubscriber.next(null);
  //             },
  //             (e) => {
  //               debugger;
  //             }
  //           );
  //         });
  //     });
  //     ro.subscribe(
  //       (a) => {
  //         //这里实际是等待完成的,但返回用next,所以这里的参数a没有使用到
  //         //debugger;
  //         if (r !== null && r !== undefined) {
  //           //结果要按tableId来排列(便于后面把第0项识别为主表)
  //           r = r.sort(function (a, b) {
  //             return (
  //               tableId.indexOf(a.key.ShortId) - tableId.indexOf(b.key.ShortId)
  //             );
  //           });
  //         }
  //         subscriber.next(r); //rSubscriber.next(null)运行之后进入本句.本句执行完之后会触发queryFields()返回值里的next事件
  //       },
  //       (e) => {
  //         debugger;
  //       }
  //     );
  //   });
  //   return observable;
  // }
  // onDatabaseChange(): void {
  //   const me = this;
  //   me.reference
  //     //.getDataTableList("", "", "", "", "", me.databaseId)
  //     .getDataTableList(me.databaseId)
  //     .subscribe((response) => {
  //       // //debugger;
  //       // me.tableList = response.DataSource.filter(
  //       //   (a) => me.databaseId == a.SourceId
  //       // );
  //       me.tableList = response.DataSource;
  //       console.info("sql-query-area onDatabaseChange:" + me.tableList.length);
  //     });
  // }
  public addFilter(event): void {
    const me = this;
    // me.hasJoin = !me.hasJoin;
    if (me.pfUtil.isAnyNull(me.query.joins)) {
      me.query.joins = [];
    }
    if (me.rowVisible['filter']) {
      me.rowVisible['filter'] = !me.rowVisible['filter'];
    } else {
      me.rowVisible['filter'] = !me.rowVisible['filter'];
      // //me.rowVisible["join"] = true;
      // me.query.joins.push({
      //   // fields: [
      //   //   // ["joined-field", "chinese_city", ["field-id", 251]],
      //   //   // ["joined-field", "chinese_city", ["field-id", 250]],
      //   //   // ["joined-field", "chinese_city", ["field-id", 252]]
      //   // ],
      //   fields: "all",
      //   //"source-table": me.query["source-table"],
      //   // "condition": ["=", ["field-id", 152],
      //   //   ["joined-field", "chinese_city", ["field-id", 252]]
      //   // ],
      //   condition: [],
      //   //"alias": "chinese_city",
      //   strategy: "left-join",
      // });

      //me.joins.push();
      setTimeout(function () {
        let cellItem = me.el.nativeElement //.getElementsByClassName("JoinRTableCellItem")
          .querySelectorAll('filter-step .NotebookCellItem');
        me.pfUtil.triggerEvent(
          me.el.nativeElement.ownerDocument,
          // ".addConditionBtn",
          // me.el.nativeElement.querySelector(".addConditionBtn"),
          cellItem[cellItem.length - 1],
          'click'
        );
      }, 100);
    }
  }
  public addJoin(event): void {
    const me = this;
    // me.hasJoin = !me.hasJoin;
    if (me.pfUtil.isAnyNull(me.query.joins)) {
      me.query.joins = [];
    }
    me.rowVisible['join'] = true;
    me.query.joins.push({
      // fields: [
      //   // ["joined-field", "chinese_city", ["field-id", 251]],
      //   // ["joined-field", "chinese_city", ["field-id", 250]],
      //   // ["joined-field", "chinese_city", ["field-id", 252]]
      // ],
      fields: 'all',
      //"source-table": me.query["source-table"],
      // "condition": ["=", ["field-id", 152],
      //   ["joined-field", "chinese_city", ["field-id", 252]]
      // ],
      condition: [],
      //"alias": "chinese_city",
      strategy: 'left-join',
    });

    //me.joins.push();
    setTimeout(function () {
      let cellItem =
        me.el.nativeElement.getElementsByClassName('JoinRTableCellItem');
      me.pfUtil.triggerEvent(
        me.el.nativeElement.ownerDocument,
        // ".addConditionBtn",
        // me.el.nativeElement.querySelector(".addConditionBtn"),
        cellItem[cellItem.length - 1],
        'click'
      );
    }, 100);
  }
  public addAggregation(event) {
    const me = this;
    // //debugger;
    // if (
    //   //me.pfUtil.isAnyNull(me.query.aggregation) &&
    //   me.pfUtil.isAnyNull(me.query.breakout)
    // ) {
    //   // me.rowVisible['aggregation'] = !me.rowVisible['aggregation'];
    //   me.rowVisible["aggregation"] = true;
    //   me.allowAggregation = false;
    // } else {
    //   //当已经有聚合时,再点聚合,就变成潜套
    //   // let newQuery: StructuredQuery = {
    //   //   "source-query": me.query,
    //   // };
    //   // me.query = newQuery;
    //   // me.query = Object.assign(
    //   //   {},
    //   //   {
    //   //     "source-query": me.query,
    //   //   }
    //   // );
    //   // me.query = {
    //   //   "source-query": {},
    //   // };
    //   // me.query["source-query"] = Object.assign({}, me.query);
    //   // me.query["source-table"] = null;
    //   // me.query.filter = null;
    //   // me.query["source-query"] = {
    //   //   "source-table": 8,
    //   //   joins: [],
    //   //   filter: [],
    //   // };
    //   //me.query["source-query"] = Object.assign({}, me.query);
    //   // me.query["source-table"]=null;
    //   // me.query = Object.assign(
    //   //   {},
    //   //   {
    //   //     "source-query": me.query,
    //   //   }
    //   // );
    //   if (me.isFirstFloor) {
    //     //me.queryAddLevel.emit(Object.assign({}, me.query)); //query属性是@Input属性,不能在此组件中嵌套操作
    //     me.queryAddLevel.emit(
    //       Object.assign(
    //         {},
    //         { innerQuery: me.query, showXForFirstTime: "aggregation" }
    //       )
    //     );
    //   }
    // }
    if (me.pfUtil.isAllEmpty(me.query.breakout, me.query.expressions)) {
      me.rowVisible['aggregation'] = true;
      // me.allowAggregation = false;
      me.updateBtnAllowStatus();
    } else {
      if (me.isFirstFloor) {
        //me.queryAddLevel.emit(Object.assign({}, me.query)); //query属性是@Input属性,不能在此组件中嵌套操作
        me.queryAddLevel.emit(
          Object.assign(
            {},
            { innerQuery: me.query, showXForFirstTime: 'aggregation' }
          )
        );
      }
    }
  }
  public addCustomColumn(event) {
    const me = this;

    if (me.pfUtil.isAnyNull(me.query.expressions)) {
      me.query.expressions = {};
    }
    //debugger;
    if (me.pfUtil.isAllEmpty(me.query.breakout, me.query.expressions)) {
      me.rowVisible['customColumn'] = true;
      //me.allowCustomColumn = false;
      me.updateBtnAllowStatus();
    } else {
      if (me.isFirstFloor) {
        //me.queryAddLevel.emit(Object.assign({}, me.query)); //query属性是@Input属性,不能在此组件中嵌套操作
        me.queryAddLevel.emit(
          Object.assign(
            {},
            { innerQuery: me.query, showXForFirstTime: 'customColumn' }
          )
        );
      }
    }
  }
  onSourceQueryDelete() {
    const me = this;
    if (me.isFirstFloor) {
      //debugger;
      me.queryDeleteLevel.emit(Object.assign({}, me.query['source-query'])); //query属性是@Input属性,不能在此组件中嵌套操作
    }
  }
  public deleteRow() {
    const me = this;
    //debugger;
    me.msg.info('aaa');
  }
  // public showDeleteBtn(b) {
  //   const me = this;
  //   me.aggregationDelBtnVisible = b;
  // }
  public showDeleteBtn(t, b) {
    const me = this;
    // me.aggregationDelBtnVisible = b;
    me.delBtnVisible[t] = b;
  }

  // private updateFieldList() {
  //   const me = this;

  //   let tableIds: number[] = [];
  //   if (me.query["source-table"] != null) {
  //     tableIds.push(me.query["source-table"]);
  //   }
  //   if (me.query.joins != null) {
  //     for (let i = 0; i < me.query.joins.length; i++) {
  //       tableIds.push(me.query.joins[i]["source-table"]);
  //     }
  //   }
  //   me.queryFields(tableIds).subscribe(
  //     (response) => {
  //       me.fieldList = response;
  //     },
  //     (e) => {
  //       debugger;
  //     }
  //   );
  //   me.sqlQueryUtil.queryFields()
  // }
  public onTableIdChange(e: { tableId: number; databaseId: number }) {
    const me = this;
    // //debugger;
    // // me.allowJoin = !me.pfUtil.isAnyNull(me.query["source-table"]);
    // // me.allowAggregation = me.allowJoin;
    // me.query.joins = [];
    // me.query.filter = [];
    // me.query.breakout = [];
    // me.query.aggregation = [];
    // me.query["order-by"] = [];
    // // me.updateFieldList();
    // me.sqlQueryUtil
    //   .queryFields(me.databaseId, me.query)
    //   .subscribe((response) => {
    //     me.fieldList = response;
    //     me.updateBtnAllowStatus();
    //   });

    me.tableIdChange.emit(e);
  }
  public onJoinTableIdChange() {
    const me = this;
    //debugger;
    // me.allowJoin = !me.pfUtil.isAnyNull(me.query["source-table"]);
    // me.allowAggregation = me.allowJoin;
    // me.query.joins = [];
    // me.query.filter = [];
    // me.updateFieldList();
    me.sqlQueryUtil
      .queryFields(me.databaseId, me.query)
      .subscribe((response) => {
        me.fieldList = response;
        //me.updateBtnAllowStatus();
      });
  }
  public onBreakoutChange(event) {
    const me = this;
    // me.msg.info(
    //   "------------------------onBreakoutChange------------------------------"
    // );
    // debugger;
    me.updateBtnAllowStatus();
    me.outFieldChange.emit();
  }
  public onCustomColumnChange(event) {
    const me = this;
    debugger;
    me.updateBtnAllowStatus();
    me.outFieldChange.emit();
  }
  public onFilterChange(event) {
    const me = this;
    me.query.filter = event;
  }
  private filterValidAggregationField() {
    const me = this;
    if (!me.pfUtil.isAnyNull(me.query.aggregation)) {
      me.query.aggregation = me.query.aggregation.filter((a) =>
        me.isFilterInSourceOut(a[1])
      );
    }
    if (!me.pfUtil.isAnyNull(me.query.breakout)) {
      me.query.breakout = me.query.breakout.filter((a) =>
        me.isFilterInSourceOut(a)
      );
    }
  }
  public onInnerOutFieldChange() {
    const me = this;
    console.info(
      '---------------------sql-query-area.component onInnerOutFieldChange-----------------------'
    );
    me.sqlQueryUtil
      .getSourceQueryOutFields(me.databaseId, me.query)
      .subscribe((response) => {
        me.sourceOutFieldList = response;
        me.filterValidAggregationField();
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
      });
  }
  public onJoinFieldChange() {
    const me = this;
    // me.sqlQueryUtil
    //   .queryFields(me.databaseId, me.query)
    //   .subscribe((response) => {
    //     me.fieldList = response;
    //     // me.filterValidAggregationField();
    //     // // if (!me.pfUtil.isAnyNull(me.query.aggregation)) {
    //     // //   me.query.aggregation = me.query.aggregation.filter((a) =>
    //     // //     me.isFilterInSourceOut(a[1])
    //     // //   );
    //     // // }
    //     // // if (!me.pfUtil.isAnyNull(me.query.breakout)) {
    //     // //   me.query.breakout = me.query.breakout.filter((a) =>
    //     // //     me.isFilterInSourceOut(a)
    //     // //   );
    //     // // }
    //   });
    // // if (!me.isFirstFloor) {
    // //   me.outFieldChange.emit();
    // // }
  }
  /**
   * 验证已选字段在不是source的输出列表里
   * @param ConcreteField
   */
  private isFilterInSourceOut(field: ConcreteField): boolean {
    const me = this;
    if (me.sqlQueryUtil.isLiteralField(field)) {
      return (
        me.sourceOutFieldList.findIndex((a) =>
          me.sqlQueryUtil.isLiteralFieldEqual(a, field)
        ) > -1
      );
    } else {
      return (
        me.fieldList.findIndex(
          (a) =>
            a.value.findIndex((b) =>
              me.sqlQueryUtil.isFilterMatchField(field, b, a.key)
            ) > -1
        ) > -1
      );
    }
  }
  // public onDatabaseIdChange(event) {
  //   const me = this;
  //   //me.databaseIdChange.emit(event);
  //   me.databaseIdChange.emit({ databaseId: event, innerQuery: me.query }); //当有多层时,innerQuery用于把内层table移到外层
  // }
  // public onSurceQueryDatabaseIdChange(event) {
  //   const me = this;
  //   me.databaseIdChange.emit(event);
  // }
  //ngif的条件尽量不用函数,因为会无限调用的
  // public isSourceQuery() {
  //   const me = this;

  //   // debugger;
  //   //return !me.pfUtil.isAnyNullAction(me.query, (a) => a["source-query"]);
  //   let r = !me.pfUtil.isAnyNullAction(me.query, (a) => a["source-query"]);
  //   console.info(new Date());
  //   console.info(r);
  //   return r;
  // }
  // public isSourceQuery2() {
  //   const me = this;

  //   // debugger;
  //   //return !me.pfUtil.isAnyNullAction(me.query, (a) => a["source-query"]);
  //   console.info("------------------isSourceQuery2-------------------");
  //   console.info(new Date());
  //   return false;
  // }

  public getQueryClassString() {
    const me = this;
    return JSON.stringify(me.queryClass, undefined, 4);
  }
}
