//import { Component, OnInit } from '@angular/core';
import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  Validators,
  FormBuilder,
  AbstractControl,
  FormControl,
  ValidationErrors,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
//import {  NgxGraphModule } from '@swimlane/ngx-graph';
import { Node } from "@swimlane/ngx-graph";
import { NzMessageService } from "ng-zorro-antd/message";
//import { NzModalService } from 'ng-zorro-antd/modal';

import { Guid } from "guid-typescript";
import format from "date-fns/format";

// import { ComputesReferenceService } from "../../core/services/computes-reference.service";
// import { UserProviderService } from "../../../../core/services/user-provider.service";
// import { DcosReferenceService } from "../../../dcos/core/services/dcos-reference.service";
import { Observable, Observer, Operator, Subject, Subscription } from "rxjs";
import { NzUploadChangeParam, NzUploadFile } from "ng-zorro-antd/upload";
//import { ConfigService } from "../../../../core/services/app-config.service";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { filter } from "rxjs/operators";
//import { addListener } from "process";
// import { KeyValuePair } from "../../../../core/common/pfModel";
// import { PfUtil, ProcedureManager } from "../../../../core/common/pfUtil";
// import { PfCronJobsConfig } from "../pf_ngx_cron_job/lib/contracts/contracts";
import {
  FetchUri,
  LinkModel,
  PaintType,
  //NodeModel,
  ProcedureModel,
} from "../job-model/job-model";
//import { deprecate } from "util";
import { NzModalService } from "ng-zorro-antd/modal";
import { DragType } from "../pf_drag/pf-drag.directive";
import { PfClickArrowComponent } from "../pf-click-arrow/pf-click-arrow.component";
import { PfDropModel } from "../pf_drag/pf-drop.directive";
import { KeyValuePair, IPfObject } from '../common/pfModel';
import { ProcedureManager, PfUtil } from '../common/pfUtil';
import { ConfigService } from '../service/app-config.service';
import { ComputesReferenceService } from '../service/computes-reference.service';
import { UserProviderService } from '../service/user-provider.service';

interface JobFile {
  FileId: string;
  Id: string;
  Url: string;
  Name: string;
}

interface JobModel {
  JobId: string;
  JobName: string;
  CRON: string;
  TimeZone: string;
  Configure: string;
  Dependencies: string;
  Description: string;
  Time: string;
}
@Component({
  selector: 'app-job-digraph',
  templateUrl: './job-digraph.component.html',
  styleUrls: ['./job-digraph.component.css']
})
export class JobDigraphComponent implements OnInit {

  // constructor() { }

  // ngOnInit(): void {
  // }

  public applicationName: string = "";
  public pageSize: number = 13;
  public pageIndex: number = 1;

  validColor = "#1890ff";
  invalidColor = "red";

  isVisible = false;

  //有向图
  update$: Subject<boolean> = new Subject();
  startMove$: Subject<any> = new Subject();
  //getIsDragging$: Subject<any> = new Subject();
  //pvalid = false;
  digraphVisible = false;

  imageBaseUrl = "uat-registry.perfect99.com";

  //画图工具按钮
  size: string = "";
  currentPaintType: PaintType = PaintType.none;
  // none: PaintType = PaintType.None;
  // line: PaintType = PaintType.Line;
  // delete: PaintType = PaintType.Delete;
  PaintType: typeof PaintType = PaintType;

  //拖动新增步骤
  isDragging: boolean = false;
  draggingX: number = 0;
  draggingY: number = 0;
  DragType: typeof DragType = DragType;

  //画线
  lineX1: number = 0;
  lineY1: number = 0;
  lineX2: number = 0;
  lineY2: number = 0;
  arrowStartNode: Node={id:""};
  //arrowEndNode:Node;
  @ViewChild(PfClickArrowComponent)
  private pfClickArrow!: PfClickArrowComponent;

  //步骤弹窗
  newNodeX: number=0; //当拖动新增时，打开新增弹窗时保存的临时节点位置
  newNodeY: number=0;
  newNodeId: number = 1;

  //上传弹窗
  isFetchPopupsVisible = false;
  isFetchPopupsLoading = false;
  isFetchPopupsUploading = false;
  fetchPopupsUploadingSubscription?: Subscription; //为了终止上传
  mainLoading = false;
  uploadedPercent: number = 0;
  uploadStatus: string = "";
  uploadStatusText: string = "上传中";

  //历史弹窗
  isHistoryPopupsVisible = false;
  isHistoryAllChecked = false;
  fetchHistoryloading = false;
  fetchHistoryIndeterminate = false;
  fetchHistoryGridData: JobFile[] = [];
  fetchHistoryGridPageData: JobFile[] = [];
  fetchHistoryCheckedId = new Set<string>();
  //listOfData: ReadonlyArray<Data> = [];
  //listOfCurrentPageData: ReadonlyArray<Data> = [];

  defaultValue: any = "value5";
  menus: any[] = [];

  //作业信息弹窗
  isJobInfoPopupsVisible = false;
  //referenceData: Array<KeyValuePair> = [];
  dependenciesData: KeyValuePair[] = [];
  //validReference: string[] = [];

  //环境变量弹窗
  isENVPopupsVisible = false;
  environmentListOfControl: Array<{ id: number; key: string; value: string }> =
    [];
  validENV :IPfObject= {}; //已验证的环境变量(点保存时把 environmentListOfControl 存到 validENV)

  //CRON编辑弹窗
  isCRONPopupsVisible = false;
  //cronData = "2,0,4,3,1 0/1 3/2 ? * 4/5 *";
  //cronData = "";
  //cronData = "* * * * * * *";
  // cronData = "? ? ? ? ? ? ?";
  emptyCronData = "* * * ? ? ? *";
  cronData = "* * * ? ? ? *";

  // //cron测试
  // freq = "";
  // cronConfig: PfCronJobsConfig = {
  //   multiple: true,
  //   quartz: true,
  //   bootstrap: false, //原true
  // };
  // cronValue = "2,0,4,3,1 0/1 3/2 ? * 4/5 *";

  cusListener?: Observable<string> ;
  cusListenerer?: Observer<string> ;

  digraphLinkData: LinkModel[] = [
    // {
    //   id: "a",
    //   source: "first",
    //   target: "second",
    //   label: "is parent of",
    // },
    // {
    //   id: "b",
    //   source: "first",
    //   target: "c1",
    //   label: "custom label",
    // },
    // {
    //   id: "d",
    //   source: "first",
    //   target: "c2",
    //   label: "custom label",
    // },
    // {
    //   id: "e",
    //   source: "c1",
    //   target: "d",
    //   label: "first link",
    // },
    // {
    //   id: "f",
    //   source: "c1",
    //   target: "d",
    //   label: "second link",
    // },
  ];
  // digraphNodeData: NodeModel[] = [
  //   // {
  //   //   id: "first",
  //   //   label: "流程A",
  //   // },
  //   // {
  //   //   id: "second",
  //   //   label: "流程B",
  //   // },
  //   // {
  //   //   id: "c1",
  //   //   label: "流程C1",
  //   // },
  //   // {
  //   //   id: "c2",
  //   //   label: "流程C2",
  //   // },
  //   // {
  //   //   id: "d",
  //   //   label: "流程D",
  //   // },
  // ];
  digraphNodeData: Node[] = [
    // {
    //   id: "first",
    //   label: "流程A",
    // },
    // {
    //   id: "second",
    //   label: "流程B",
    // },
    // {
    //   id: "c1",
    //   label: "流程C1",
    // },
    // {
    //   id: "c2",
    //   label: "流程C2",
    // },
    // {
    //   id: "d",
    //   label: "流程D",
    // },
  ];
  digraphIdPrev: string = "dig"; //https://www.cnblogs.com/zxy-joy/p/10469116.html   id会作为dom的id,css标准不能以数字开头,会报错 Failed to execute 'querySelector' on 'Element': '#96f5b2a7-5d8d-fb65-0e46-7c635095370546d32a9a-a2b5-698b-c540-38378aa95b37' is not a valid selector.

  procedureManager: ProcedureManager<ProcedureModel> = new ProcedureManager(
    "procedureId",
    "from",
    "to"
  );

  jobConfigData: ProcedureModel[] = [];
  containerImage:any[] = [];
  containerImageVersion:any[] = [];
  isConfirmLoading = false;
  isJobInfoConfirmLoading = false;
  listOfData: JobFile[] = [
    // {
    //   key: '1',
    //   name: 'John Brown',
    //   age: 32,
    //   address: 'New York No. 1 Lake Park'
    // },
    // {
    //   key: '2',
    //   name: 'Jim Green',
    //   age: 42,
    //   address: 'London No. 1 Lake Park'
    // },
    // {
    //   key: '3',
    //   name: 'Joe Black',
    //   age: 32,
    //   address: 'Sidney No. 1 Lake Park'
    // }
  ];
  //fetchGridData:FetchUri[]=[];//grid的源最好别放到FormGroup里,否则resetFrom时有可能不同步到grid
  //fetchGridData=[];
  validFetch: FetchUri[] = [];
  /**
   * fetch下拉框(数据源为validFetch union historyUri)
   */
  fetchList: FetchUri[] = [];
  userNameAsyncValidator = (control: FormControl) => {
    // if (this.digraphNodeData.findIndex(x => x.label ==control.value)>-1) {
    //   // you have to return `{error: true}` to mark it as an error event
    //   return { error: true, duplicated: true };
    // } else {
    //   return null;
    // }
    var me = this;
    return new Observable((observer: Observer<ValidationErrors | null>) => {
      // if (this.digraphNodeData.findIndex(x => x.label ==control.value)>-1) {
      //   // you have to return `{error: true}` to mark it as an error event
      //   observer.next({ error: true, duplicated: true });
      // } else {
      //   observer.next(null);
      // }
      // observer.complete();
      setTimeout(() => {
        //debugger;
        //if (control.value === 'JasonWood') {
        if (
          me.procedureForm.value.isAdd &&
          this.digraphNodeData.findIndex((x) => x.label == control.value) > -1
        ) {
          // you have to return `{error: true}` to mark it as an error event
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      }, 0);
    });
  };

  envAsyncValidator = (control: AbstractControl) =>//FormControl不行?
    new Observable((observer: Observer<ValidationErrors | null>) => {
      //这样的异步验证,重新打开弹窗时会是验证中的图标在转,未找到解决办法--benjamin todo
      setTimeout(() => {
        //debugger;
        if (
          this.environmentListOfControl.findIndex(
            (x) =>
              this.environmentForm.value[x.key] == control.value &&
              this.environmentForm.get(x.key) != control
          ) > -1
        ) {
          // you have to return `{error: true}` to mark it as an error event
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      }, 0);
    });

  public procedureForm = this.fb.group({
    //JobId: ["", Validators.required],
    isAdd: [true],
    procedureId: [""],
    procedureName: ["", [Validators.required], [this.userNameAsyncValidator]],
    //from:["", Validators.required],
    from: [[]],
    to: [[]],
    envShort: [""],
    cmdShort: [""],
    containerImage: ["", Validators.required],
    containerImageName: [""],
    containerImageVersion: [""],
    cmd: ["", Validators.required],
    fetch: [[]],
    //fetchUri: ["", Validators.required],
    fetchShort: "",
    maxLaunchDelay: [3600],
    retry: [3],
    retryInterval: [300],
    description: [""], //,
    //Time: [format(new Date(), 'yyyy-MM-dd HH:mm:ss'), Validators.required]
  });
  public jobForm = this.fb.group({
    //isAdd:[true],
    JobId: ["", Validators.required],
    JobName: ["", Validators.required],
    CRON: ["", Validators.required],
    TimeZone: ["Asia/Shanghai", Validators.required],
    //Configure: ["", Validators.required],
    // Dependencies: [""],
    Dependencies: [[]],
    Description: [""],
    Time: [format(new Date(), "yyyy-MM-dd HH:mm:ss"), Validators.required],
    UpdateTime: [""],
    UserId: ["", Validators.required],
  });
  public environmentForm = this.fb.group({});

  public treeItems: any[] = [];
  //private jobId: string = "00000000-0000-0000-0000-000000000000";
  private jobIsAdd = true; //当前如果点保存,是新增还是修改
  private action: string = "Add";
  private isJobInfoFilled = false; //两部分,config和jobInfo.如果点保存时jobInfo未填写过,弹出弹窗

  //private userId = this.userProvider.getUserInfo().UserId;
  private userId = "";

  constructor(
    public config: ConfigService,
    private reference: ComputesReferenceService,
    private userProvider: UserProviderService,
    //private dcosReference: DcosReferenceService,
    private activatRouter: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private msg: NzMessageService, //,private modal: NzModalService
    private http: HttpClient,
    private modalService: NzModalService,
    private pfUtil: PfUtil
  ) {
    var me=this;
    var userInfo=me.userProvider.getUserInfo();
    if(userInfo!=null){
      me.userId=userInfo.UserId;
    }
    
    me.cusListener = new Observable((observer: Observer<string>) => {
      me.cusListenerer = observer;
      //me.msg.info("1111");
      // observer.next("22222");
      // observer.next(null);
      // observer.complete();
    });
  }

  isAdd(): boolean {
    // return this.jobId==undefined||this.jobId==null||this.jobId=="";
    return this.jobIsAdd;
  }
  isProcedureAdd(): boolean {
    // return this.jobId==undefined||this.jobId==null||this.jobId=="";
    return this.procedureForm.value.isAdd;
  }
  private testRequest(): void {
    var me = this;
    //debugger;
    // var token = this.userProvider.getToken();
    // this.reference
    //   .request(
    //     "POST",
    //     "XSchedulerJob/GetRecords111",
    //     token,
    //     JSON.stringify({
    //       JobId: "ad97b34e-475e-20de-6e98-a894f742ddb4",
    //       JobName: "aa",
    //       CRON: "aa",
    //       TimeZone: "式",
    //       Configure:
    //         "W3sicHJvY2VkdXJlSWQiOiI5MzRiYTkyNy1iZThkLWZmNDYtZTAzMS1mYjU2NTc5YjRiZmEiLCJwcm9jZWR1cmVOYW1lIjoiYWEiLCJzY2hlZHVsZXJJZCI6IiIsInN0YXR1cyI6IiIsIm1heExhdW5jaERlbGF5IjozNjAwLCJyZXRyeSI6MywicmV0cnlJbnRlcnZhbCI6MzAwLCJmcm9tIjpbXSwidG8iOltdLCJzY2hlZHVsZXIiOnsidXNlciI6InJvb3QiLCJjcHVzIjoiMS4wIiwibWVtIjoiMTAyNC4wIiwiZW52Ijp7ImFhYWEiOiJiYmJiIn0sImNvbnRhaW5lciI6eyJ0eXBlIjoiTUVTT1MiLCJkb2NrZXIiOnsiaW1hZ2UiOm51bGwsImZvcmNlUHVsbEltYWdlIjpmYWxzZSwicHJpdmxlZGdlZCI6ZmFsc2UsInBhcmFtZXRlcnMiOltdfX0sImNtZCI6ImFhIiwiZmV0Y2giOnsiaXNBZGQiOmZhbHNlLCJwcm9jZWR1cmVJZCI6IjkzNGJhOTI3LWJlOGQtZmY0Ni1lMDMxLWZiNTY1NzliNGJmYSIsInByb2NlZHVyZU5hbWUiOiJhYSIsImZyb20iOltdLCJ0byI6W10sImVudlNob3J0IjpudWxsLCJjbWRTaG9ydCI6bnVsbCwiY29udGFpbmVySW1hZ2UiOiJodHRwczovL3VhdC1yZWdpc3RyeS5wZXJmZWN0OTkuY29tL2NlcGg6My4wLjEiLCJjb250YWluZXJJbWFnZU5hbWUiOiJjZXBoIiwiY29udGFpbmVySW1hZ2VWZXJzaW9uIjoiMy4wLjEiLCJjbWQiOiJhYSIsImZldGNoIjpudWxsLCJmZXRjaFNob3J0Ijoi5bey5LiK5LygMeS4qiIsImRlc2NyaXB0aW9uIjoiYWEifSwibmV0d29ya3MiOlt7Im5hbWUiOiJkY29zIiwibW9kZSI6ImNvbnRhaW5lciJ9XSwiY29uc3RyYWludHMiOltdLCJwb3J0RGVmaW5pdGlvbnMiOltdLCJ2b2x1bWVzIjpbXX0sImRlc2NyaXB0aW9uIjoiYWEifV0: ",
    //       Description: "",
    //       Time: "2021-07-14 10:48:16",
    //       UserId: "33d8d854-6a07-47b3-8326-c9403db7a430",
    //     }),
    //     true
    //   )
    //   .subscribe((response) => {
    //     //debugger;
    //   });
    // this.reference
    //   .httpRequest(
    //     "POST",
    //     "XSchedulerJob/GetRecords111",
    //     token,
    //     null,
    //     JSON.stringify({
    //       JobId: "ad97b34e-475e-20de-6e98-a894f742ddb4",
    //       JobName: "aa",
    //       CRON: "aa",
    //       TimeZone: "式",
    //       Configure:
    //         "W3sicHJvY2VkdXJlSWQiOiI5MzRiYTkyNy1iZThkLWZmNDYtZTAzMS1mYjU2NTc5YjRiZmEiLCJwcm9jZWR1cmVOYW1lIjoiYWEiLCJzY2hlZHVsZXJJZCI6IiIsInN0YXR1cyI6IiIsIm1heExhdW5jaERlbGF5IjozNjAwLCJyZXRyeSI6MywicmV0cnlJbnRlcnZhbCI6MzAwLCJmcm9tIjpbXSwidG8iOltdLCJzY2hlZHVsZXIiOnsidXNlciI6InJvb3QiLCJjcHVzIjoiMS4wIiwibWVtIjoiMTAyNC4wIiwiZW52Ijp7ImFhYWEiOiJiYmJiIn0sImNvbnRhaW5lciI6eyJ0eXBlIjoiTUVTT1MiLCJkb2NrZXIiOnsiaW1hZ2UiOm51bGwsImZvcmNlUHVsbEltYWdlIjpmYWxzZSwicHJpdmxlZGdlZCI6ZmFsc2UsInBhcmFtZXRlcnMiOltdfX0sImNtZCI6ImFhIiwiZmV0Y2giOnsiaXNBZGQiOmZhbHNlLCJwcm9jZWR1cmVJZCI6IjkzNGJhOTI3LWJlOGQtZmY0Ni1lMDMxLWZiNTY1NzliNGJmYSIsInByb2NlZHVyZU5hbWUiOiJhYSIsImZyb20iOltdLCJ0byI6W10sImVudlNob3J0IjpudWxsLCJjbWRTaG9ydCI6bnVsbCwiY29udGFpbmVySW1hZ2UiOiJodHRwczovL3VhdC1yZWdpc3RyeS5wZXJmZWN0OTkuY29tL2NlcGg6My4wLjEiLCJjb250YWluZXJJbWFnZU5hbWUiOiJjZXBoIiwiY29udGFpbmVySW1hZ2VWZXJzaW9uIjoiMy4wLjEiLCJjbWQiOiJhYSIsImZldGNoIjpudWxsLCJmZXRjaFNob3J0Ijoi5bey5LiK5LygMeS4qiIsImRlc2NyaXB0aW9uIjoiYWEifSwibmV0d29ya3MiOlt7Im5hbWUiOiJkY29zIiwibW9kZSI6ImNvbnRhaW5lciJ9XSwiY29uc3RyYWludHMiOltdLCJwb3J0RGVmaW5pdGlvbnMiOltdLCJ2b2x1bWVzIjpbXX0sImRlc2NyaXB0aW9uIjoiYWEifV0: ",
    //       Description: "",
    //       Time: "2021-07-14 10:48:16",
    //       UserId: "33d8d854-6a07-47b3-8326-c9403db7a430",
    //     })
    //   )
    //   .subscribe((response) => {
    //     //debugger;
    //   });
    // //测试httpRequest的效果通过(与原版request一致)
    // var token = this.userProvider.getToken();
    // var testUrl = "SystemApplication/GetItems";
    // var formData = [
    //   new KeyValuePair("applicationName", ""),
    //   new KeyValuePair("pageSize", 13),
    //   new KeyValuePair("pageIndex", 1),
    // ];
    // this.reference
    //   // .request("POST", testUrl, this.userProvider.getToken(), formData, false)
    //   .request(
    //     "POST",
    //     testUrl,
    //     this.userProvider.getToken(),
    //     [
    //       { key: "applicationName", value: this.applicationName },
    //       { key: "pageSize", value: this.pageSize.toString() },
    //       { key: "pageIndex", value: this.pageIndex.toString() },
    //     ],
    //     false
    //   )
    //   .subscribe((response) => {
    //     console.info("-------request response---------");
    //     console.info(response);
    //     //debugger;
    //   });
    // this.reference
    //   .httpRequest("POST", testUrl, this.userProvider.getToken(), null, [
    //     { key: "applicationName", value: this.applicationName },
    //     { key: "pageSize", value: this.pageSize.toString() },
    //     { key: "pageIndex", value: this.pageIndex.toString() },
    //   ])
    //   .subscribe((response) => {
    //     console.info("-------httpRequest response---------");
    //     console.info(response);
    //     //debugger;
    //   });
    // this.reference
    //   .request(
    //     "GET",
    //     "DcosRegistryImage/GetItems",
    //     this.userProvider.getToken(),
    //     '{"p001":"aaa"}',
    //     false
    //   )
    //   .subscribe((response) => {
    //     //debugger;
    //     if (response.Success == "True") {
    //       var data = JSON.parse(this.reference.base64Decode(response.Result));
    //       //me.containerImage=[];
    //       me.containerImage.splice(0, me.containerImage.length);
    //       for (var i = 0; i < data.length; i++) {
    //         me.containerImage.push(data[i]);
    //       }
    //       //console.log(data);
    //     }
    //   });
    //console.info("token");
    //console.info(this.userProvider.getToken()); //待删除--benjamin todo
    //console.info(this.userProvider.getUserInfo());
  }
  // ngAfterViewInit() {
  //   this.update$.next(true);
  // }

  updateDigraphByProcedureManager() {
    var me = this;
    //me.getCurrentProcedure().procedureId
    me.digraphNodeData = me.procedureManager.getNodes().map((a) => {
      return { id: me.digraphIdPrev + a.procedureId, label: a.procedureName };
    });
    me.digraphLinkData = me.procedureManager.getLinks().map((a) => {
      return {
        id:
          me.digraphIdPrev +
          a.source.procedureId +
          me.digraphIdPrev +
          a.target.procedureId,
        source: me.digraphIdPrev + a.source.procedureId,
        target: me.digraphIdPrev + a.target.procedureId,
        label: "",
      };
    });
  }
  ngAfterViewInit() {
    //ngAfterViewInit  ngAfterViewChecked(会死锁)  ngDoCheck ngAfterContentInit
    var me = this;
    //me.update$.next(true);
    //console.info("ngAfterViewInit");
    // me.updateDigraphByProcedureManager();
    // me.update$.next(true); //这里组件还未初始化,所以不用update
    setTimeout(function () {
      //这里的重置位置不一定会生效，所以在ngOnInit里还是要执行updateDigraphByProcedureManager，那样可以保存即使不生效也有图像显示（只是位置不居中）（这里是为了解决ngx-graph的autoCenter="true"计算不准确的问题)
      //debugger;
      //me.currentPaintType = PaintType.line;
      me.updateDigraphByProcedureManager();
      me.update$.next(true);
      me.digraphVisible = true;
    }, 500);
  }
  ngOnInit() {
    var me = this;
    //console.info("ngOnInit");
    // console.info("token");
    // console.info(me.userProvider.getToken());

    for (let i = 0; i <= 6; i++) {
      this.menus.push({
        value: "value" + i,
        label: "item" + i,
      });
    }

    //me.testRequest();
    let jobId = this.activatRouter.snapshot.paramMap.get("jobId");
    this.jobIsAdd = jobId == undefined || jobId == null || jobId == "";
    if (!this.isAdd()) {
      this.action = "Update";
      this.reference
        .request(
          "POST",
          "XSchedulerJob/GetItemInfo",
          this.userProvider.getToken(),
          [new KeyValuePair("jobId", jobId)],
          false
        )
        .subscribe((response) => {
          if (response.Success == "True" && response.Result != null) {
            let itemInfo = JSON.parse(
              this.reference.base64Decode(response.Result)
            );

            //console.log(itemInfo);
            //this.baseForm.setValue(itemInfo);
            var configObj = JSON.parse(
              this.reference.base64Decode(itemInfo.Configure)
            );

            //如果数据库的from放进了不存在的from或to,要去掉(错误数据处理)
            for (var i = 0; i < configObj.length; i++) {
              var configI = configObj[i];
              configI.from = configI.from.filter(
                (a:any) => configObj.findIndex((b:any) => b.procedureId == a) > -1
              );
              configI.to = configI.to.filter(
                (a:any) => configObj.findIndex((b:any) => b.procedureId == a) > -1
              );
            }

            //debugger;
            for (var i = 0; i < configObj.length; i++) {
              var configI = configObj[i];

              //更新图表
              var tmpJobConfig: ProcedureModel = {
                isAdd: false,
                procedureId: configI.procedureId,
                procedureName: configI.procedureName,
                status: configI.status,
                from: configI.from,
                to: configI.to,
                env: configI.scheduler.env ==null? {}:configI.scheduler.env,
                containerImage: configI.scheduler.container.docker.image,
                cmd: configI.scheduler.cmd,
                fetch:
                  configI.scheduler.fetch instanceof Array
                    ? configI.scheduler.fetch
                    : [],
                maxLaunchDelay: configI.maxLaunchDelay,
                retry: configI.retry,
                retryInterval: configI.retryInterval,
                description: configI.description,
              };
              me.procedureManager.addProcedure(tmpJobConfig);

              me.updateDigraphByProcedureManager();
              //me.update$.next(true); //这里组件还未初始化,所以不用update

              // setTimeout(function () {
              //   //不延迟的话，居中会偏右，原因未明(似乎和“新增步骤”按钮的绝对定位有关)
              //   me.updateDigraphByProcedureManager();
              //   me.update$.next(true); //这里组件还未初始化,所以不用update
              // }, 1000);

              //更新数据
              // //debugger;
              me.jobConfigData.push(tmpJobConfig);

              // me.digraphNodeData.push({
              //   id: me.digraphIdPrev + configI.procedureId,
              //   label: configI.procedureName,
              // });
              // //this.update$.next(true);
              // for (var j = 0; j < configI.from.length; j++) {
              //   if (
              //     this.digraphLinkData.findIndex(
              //       (x) =>
              //         x.source == me.digraphIdPrev + configI.from[j] &&
              //         x.target == me.digraphIdPrev + configI.procedureId
              //     ) < 0
              //   ) {
              //     this.digraphLinkData.push({
              //       id:
              //         me.digraphIdPrev + configI.from[j] + configI.procedureId,
              //       source: me.digraphIdPrev + configI.from[j],
              //       target: me.digraphIdPrev + configI.procedureId,
              //       label: "",
              //     });
              //   }
              // }
              // for (var j = 0; j < configI.to.length; j++) {
              //   if (
              //     this.digraphLinkData.findIndex(
              //       (x) =>
              //         x.source == me.digraphIdPrev + configI.procedureId &&
              //         x.target == me.digraphIdPrev + configI.to[j]
              //     ) < 0
              //   ) {
              //     this.digraphLinkData.push({
              //       id: me.digraphIdPrev + configI.procedureId + configI.to[j],
              //       source: me.digraphIdPrev + configI.procedureId,
              //       target: me.digraphIdPrev + configI.to[j],
              //       label: "",
              //     });
              //   }
              // }
              // //this.update$.next(true);
            }

            //me.procedureManager.printContent();

            // for (var i = 0; i < configObj.length; i++) {
            //   var configI = configObj[i];

            //   for (var j = 0; j < configI.from.length; j++) {
            //     this.digraphLinkData.push({
            //       id: configI.from[j] + configI.procedureId,
            //       source: configI.from[j],
            //       target: configI.procedureId,
            //       label: "",
            //     });
            //   }
            //   for (var j = 0; j < configI.to.length; j++) {
            //     this.digraphLinkData.push({
            //       id: configI.procedureId + configI.to[j],
            //       source: configI.procedureId,
            //       target: configI.to[j],
            //       label: "",
            //     });
            //   }
            // }
            //debugger;
            //me.jobForm.setValue(itemInfo);
            itemInfo.Dependencies = itemInfo.Dependencies.split(",");
            me.jobForm.patchValue(itemInfo);
            me.cronData = itemInfo.CRON;
            me.isJobInfoFilled = true;

            // setTimeout(function () {
            //   me.updateDigraphByProcedureManager();
            //   me.update$.next(true); //这里组件还未初始化,所以不用update
            // }, 1000);
            // me.updateDigraphByProcedureManager();
            // me.update$.next(true); //这里组件还未初始化,所以不用update
          }
        });
    } else {
      //me.jobId = Guid.create().toString();
      //this.jobForm.patchValue({ JobId: Guid.create().toString() });
      //this.baseForm.patchValue({ procedureId: Guid.create().toString() });
    }

    //下拉框
    this.reference
      // .request(
      //   "GET",
      //   "DcosRegistryImage/GetItems",
      //   this.userProvider.getToken(),
      //   "",
      //   false
      // )
      .getImageList()
      .subscribe((response) => {
        // if (response.Success == "True") {
        //   var data = JSON.parse(this.reference.base64Decode(response.Result));
        //   //me.containerImage=[];
        //   me.containerImage.splice(0, me.containerImage.length);
        //   for (var i = 0; i < data.length; i++) {
        //     me.containerImage.push(data[i]);
        //   }
        //   //console.log(data);
        // }
        
        me.containerImage.splice(0, me.containerImage.length);
        for (var i = 0; i < response.length; i++) {
          me.containerImage.push(response[i]);
        }
      });

    // //作业依赖下拉框
    // this.reference
    //   .httpRequest(
    //     "POST",
    //     "XSchedulerJob/GetRecords",
    //     this.userProvider.getToken(),
    //     null,
    //     {
    //       UserId: me.userId,
    //       PageSize: me.pageSize.toString(),
    //       PageIndex: me.pageIndex.toString(),
    //     }
    //   )
    //   .subscribe((response) => {
    //     if (response.Success == "True") {
    //       var data = JSON.parse(this.reference.base64Decode(response.Result));

    //       //me.containerImage=[];
    //       me.dependenciesData = [];
    //       //me.containerImage.splice(0, me.containerImage.length);
    //       //debugger;
    //       for (var i = 0; i < data.DataSource.length; i++) {
    //         me.dependenciesData.push(
    //           new KeyValuePair(
    //             data.DataSource[i].JobId,
    //             data.DataSource[i].JobName
    //           )
    //         );
    //       }
    //       //console.log(data);
    //     }
    //   });

    // me.cusListener = new Observable((observer: Observer<string>) => {
    //   me.msg.info("收到事件"+observer);
    // });

  }

  back(): void {
    history.go(-1);
  }
  // containerImageVersionPlace():string{
  //   var me=this;
  //   //debugger;
  //   //console.info("bbbbbbbbbbbbbbbbbbbbbbb");
  //   //console.info(me.baseForm.get("containerImage").value);
  //   if(me.baseForm.get("containerImage").value!=null&&me.baseForm.get("containerImage").value!=""){
  //     return "选择镜像版本";
  //   }else{
  //     return "先选择镜像";
  //   }
  // }
  updateContainerImage(): void {
    var me = this;
    let baseFormObj: any = this.procedureForm.value;
    me.procedureForm.patchValue({
      containerImage:
        //"https://uat-registry.perfect99.com/" +
        me.imageBaseUrl +
        "/" +
        baseFormObj.containerImageName +
        ":" +
        baseFormObj.containerImageVersion,
    });
  }
  containerImageChange(value: string): void {
    var me = this;
    //alert(1);
    //this.selectedCity = this.cityData[value][0];
    me.containerImageVersion.splice(0, me.containerImageVersion.length); //这里要改成远程获得版本号--benjamin todo
    // me.containerImageVersion = ["3.0.1", "2.0.1", "1.0.1"];
    // if (me.containerImageVersion.length > 0) {
    //   me.baseForm.patchValue({
    //     containerImageVersion: me.containerImageVersion[0],
    //   });
    // }
    // me.updateContainerImage();

    this.reference
      // .httpRequest(
      //   "POST",
      //   "DcosRegistryImage/GetImageVersions",
      //   this.userProvider.getToken(),
      //   null,
      //   [{ key: "image", value: me.procedureForm.value.containerImageName }]
      // )
      .getImageVersionList(me.procedureForm.value.containerImageName)
      .subscribe((response) => {
        // if (response.Success == "True") {
        //   me.containerImageVersion = JSON.parse(
        //     this.reference.base64Decode(response.Result)
        //   );
        //   if (me.containerImageVersion.length > 0) {
        //     me.procedureForm.patchValue({
        //       containerImageVersion: me.containerImageVersion[0],
        //     });
        //   }
        //   me.updateContainerImage();
        // }
        
        me.containerImageVersion = response;
        if (me.containerImageVersion.length > 0) {
          me.procedureForm.patchValue({
            containerImageVersion: me.containerImageVersion[0],
          });
        }
        me.updateContainerImage();
      });
  }
  containerImageVersionChange(value: string): void {
    var me = this;
    me.updateContainerImage();
  }

  fmt(a: boolean): String {
    return "aa";
  }

  // encrypt(): void {
  //   if (
  //     this.procedureForm.get("Encrypt").value == false ||
  //     (this.procedureForm.get("PrivateKey").value != "" &&
  //       this.procedureForm.get("PublicKey").value != "")
  //   )
  //     return;

  //   this.reference
  //     .request(
  //       "GET",
  //       "XSchedulerJob/CreateRSA",
  //       this.userProvider.getToken(),
  //       null,
  //       false
  //     )
  //     .subscribe((response) => {
  //       if (response.Success == "True") {
  //         this.procedureForm.patchValue({
  //           PrivateKey: response.Result.PrivateKey,
  //           PublicKey: response.Result.PublicKey,
  //         });
  //         console.log(JSON.stringify(this.procedureForm.value));
  //       }
  //     });
  // }

  // multiplyByTen(input) {
  //   return new Observable(function subscribe22anyname(observer) {
  //     input.subscribe({
  //       next: (v) => observer.next(10 * v),
  //       error: (err) => observer.error(err),
  //       complete: () => observer.complete()
  //     });
  //   });
  // }

  confirm(): void {
    var me = this;

    //订阅测试通过
    // me.cusListener = new Observable((observer: Observer<string>) => {
    //   me.msg.info("1111");
    //   observer.next("22222");
    //   observer.next(null);
    //   observer.complete();
    // });
    // me.cusListener.subscribe({
    //   next: (x) => me.msg.info("3333" + x),
    //   error: (err) => me.msg.info("4444" + err),
    //   complete: () => me.msg.info("5555"),
    // });
    // function multiplyByTen(input) {
    //   return new Observable(function subscribe22anyname(observer) {
    //     input.subscribe({
    //       next: (v) => observer.next(10 * v),
    //       error: (err) => observer.error(err),
    //       complete: () => observer.complete()
    //     });
    //   });
    // }

    // me.cusListener = new Observable((observer: Observer<string>) => {
    //   // me.msg.info("1111");
    //   // observer.next("22222");
    //   // observer.next(null);
    //   // observer.complete();
    // });
    // me.cusListener.subscribe({
    //   next: (x) => me.msg.info("3333" + x),
    //   error: (err) => me.msg.info("4444" + err),
    //   complete: () => me.msg.info("5555"),
    // });
    // me.cusListener.lift((observer: Observer<string>) => {
    //   observer.complete();
    // });

    // const inpute = from([1, 2, 3, 4]);
    // const output = me.multiplyByTen(inpute);
    // output.subscribe(x => console.log(x));

    // me.cusListener.pipe((a) => {
    //   return a.lift((b: string) => {
    //     me.msg.info("aaa");
    //     return b;
    //   });
    //   // return a;
    //   // return new Observable((observer: Observer<Object>) => {
    //   //   observer.next("pipe aabb");
    //   //   //observer.next(null);
    //   //   observer.complete();
    //   // });
    // });

    // me.cusListener.lift((b: string, c: string) => {
    //   me.msg.info("lift");
    //   return new Observable((observer: Observer<string>) => {
    //     me.msg.info("subs");
    //     observer.next("aaabbb");
    //     observer.next(null);
    //     observer.complete();
    //   });
    // });

    //me.cusListener.toPromise();
    //return;
    if (me.jobConfigData.length < 1) {
      me.msg.info("没有建任何步骤");
      return;
    }
    if (!me.isJobInfoFilled&&me.cusListener!=null) {
      me.msg.info("请先填写作业信息");
      me.cusListener.subscribe({
        next: (x) => me.msg.info("3333" + x),
        error: (err) => me.msg.info("4444" + err),
        complete: () => {
          //me.msg.info("5555");
          me.saveJob();
        },
      });

      me.showEditJobInfoPopups();
    } else {
      me.saveJob();
    }

    //me.msg.info("confirm ok");
    // if(me.isJobInfoFilled){

    // }

    //alert(1);
    //this.router.navigate(['ai/xSchedulerJob-add']);
    // let itemInfo: any = this.baseForm.value;

    // this.reference.request("POST",
    //   this.action == "Add" ? "XSchedulerJob/Insert" : "XSchedulerJob/Update",
    //   this.userProvider.getToken(),
    //   JSON.stringify(itemInfo),
    //   true)
    //   .subscribe((response) => {
    //     if (response.Success == "True") {
    //       this.router.navigate([this.userProvider.getMoudleName(), "xSchedulerJob-list"]);
    //     }
    //   });
  }

  getNewNodeName():string{
    var me=this;
    var i:number=me.jobConfigData.length + 1;
    while(true){
      var n="n" + me.pfUtil.padZeroLeft(i , 3);
      if(me.jobConfigData.findIndex(a=>a.procedureName==n)>-1){
        i++;
      }else{
        return n;
      }
    }
  }
  addProcedure(): void {
    //this.message.info('This is a normal message');
    var me = this;
    // debugger;
    this.procedureForm.reset();
    this.procedureForm.patchValue({
      isAdd: true, //正式时改为true--benjamin todo
      procedureId: Guid.create().toString(),
      procedureName:
        // "n" + me.pfUtil.padZeroLeft(me.jobConfigData.length + 1, 3),
        me.getNewNodeName(),
      from: [],
      to: [],
      maxLaunchDelay: 3600,
      retry: 3,
      retryInterval: 300,
    });
    //me.fetchGridData.splice(0, me.fetchGridData.length);//这样的话，会使procedureManager.nodes里的fetch[]引用清空
    me.validFetch = [];
    me.validENV = {};

    me.fetchHistoryGridData = [];
    me.fetchList = [];
    me.updateUploadShort();

    this.isVisible = true;
  }
  // showModal(): void {
  //   this.isVisible = true;
  // }

  saveProcedure(): void {
    var me = this;
    // this.baseForm.setErrors({"procedureName":"节点名重复"});
    // return;
    // for (const i in this.baseForm.controls) {

    //   this.baseForm.controls[i].markAsDirty();
    //   this.baseForm.controls[i].updateValueAndValidity();

    //   if(!this.baseForm.controls[i].valid)
    //   {
    //     this.message.create('error','请先完善配置');
    //     return;
    //   }
    // }
    //debugger;
    if (this.procedureForm.valid) {
      // me.updateDigraphByProcedure();
      var tmpJobConfig = me.getCurrentProcedure();
      //tmpJobConfig.env = me.validENV;
      tmpJobConfig.env = Object.assign({}, me.validENV); //对象型的要复制，否则容易受到其它操作的影响
      if (me.isProcedureAdd()) {
        tmpJobConfig.isAdd = false;
        me.procedureManager.addProcedure(tmpJobConfig);
        //me.jobConfigData.push(tmpJobConfig);
      } else {
        me.procedureManager.editProcedure(tmpJobConfig);
      }
      me.procedureManager.printContent();
      me.updateDigraphByProcedureManager();

      me.jobConfigData = me.procedureManager.getNodes();

      this.isVisible = false;
    }
    // if(this.baseForm.valid){
    //   this.isVisible = false;
    // }else{
    //   this.message.create('error','请先完善配置');
    // }
    // for (const i in this.baseForm.controls) {

    //   if(!this.baseForm.controls[i].valid)
    //   {
    //     this.message.create('error','请先完善配置');
    //     return;
    //   }
    // }
    // // console.log('Button ok clicked!');
    //  this.isVisible = false;
  }

  handleCancel(): void {
    console.log("EditProcedurePopups closed");
    var me = this;
    if (
      me.isFetchPopupsLoading &&
      me.fetchPopupsUploadingSubscription != null
    ) {
      me.fetchPopupsUploadingSubscription.unsubscribe();
      me.isFetchPopupsUploading = false;
    }
    this.isVisible = false;
  }
  getLinkByProcedure(): LinkModel[] {
    var me = this;

    //debugger;
    let baseFormObj = me.getCurrentProcedure(); // me.baseForm.value;
    return [
      ...baseFormObj.from.map((a) => {
        return {
          id: me.digraphIdPrev + a + baseFormObj.procedureId,
          source: me.digraphIdPrev + a,
          target: me.digraphIdPrev + baseFormObj.procedureId,
          label: "",
        };
      }),
      ...baseFormObj.to.map((a) => {
        return {
          id: me.digraphIdPrev + baseFormObj.procedureId + a,
          source: me.digraphIdPrev + baseFormObj.procedureId,
          target: me.digraphIdPrev + a,
          label: "",
        };
      }),
    ];
  }
  deleteProcedure(): void {
    var me = this;
    me.isConfirmLoading = true;

    // let baseFormObj = this.procedureForm.value;
    // var link = me.getLinkByProcedure();
    // me.digraphLinkData = me.digraphLinkData.filter(
    //   (a) => link.findIndex((b) => b.id == a.id) < 0
    // );
    // me.digraphNodeData = me.digraphNodeData.filter(
    //   (a) => baseFormObj.procedureName != a.label
    // );
    // me.jobConfigData = me.jobConfigData.filter(
    //   (a) => baseFormObj.procedureName != a.procedureName
    // );
    // this.update$.next(true);

    var procedure = me.getCurrentProcedure();
    me.doDeleteProcedure(procedure);

    me.isConfirmLoading = false;
    me.isVisible = false;
  }
  doDeleteProcedure(procedure: ProcedureModel): void {
    var me = this;
    me.procedureManager.deleteProcedure(procedure);
    //me.updateDigraphByProcedure();
    me.updateDigraphByProcedureManager();
    me.update$.next(true);

    me.jobConfigData = me.procedureManager.getNodes();
  }
  //画图相关
  public getStyles(
    node:any //: Node
  ): any {
    var c =
      node.data != undefined && node.data.backgroundColor != undefined
        ? node.data.backgroundColor
        : "red";
    //console.info(c);
    return {
      "background-color": c,
    };
  }
  public onLegendLabelClick(e:any): any {
    console.info("dddd");
    console.info(e);
  }
  // private nodeToProcedure(p:Node){
  //   return
  // }
  //pf-click-arrow组件的end事件的target有可能是node内部的任意元素
  public findUpNodeDom(dom:any) :any{
    var me = this;
    if (
      dom.id != undefined &&
      dom.id != null &&
      dom.id.indexOf(me.digraphIdPrev) == 0
    ) {
      return dom;
    } else if (dom.parentElement != undefined && dom.parentElement != null) {
      return me.findUpNodeDom(dom.parentElement);
    }
    return null;
  }
  public onArrowMoveEnd(event:any) {
    // //me.isDragging = false;
    // //debugger;
    var me = this;
    var nodeDom = me.findUpNodeDom(event);
    if (nodeDom != null && nodeDom.id != me.arrowStartNode.id) {
      //debugger;
      var startNode = me.jobConfigData.find(
        (a) => me.digraphIdPrev + a.procedureId == me.arrowStartNode.id
      );
      var endNode = me.jobConfigData.find(
        (a) => me.digraphIdPrev + a.procedureId == nodeDom.id
      );
      if(startNode!=null&&endNode!=null){
        
      me.procedureManager.addLink(startNode, endNode);
      me.updateDigraphByProcedureManager();
      me.update$.next(true);
      }
    }
    // //debugger;
    // var startNode = me.jobConfigData.find(
    //   (a) => me.digraphIdPrev + a.procedureId == me.arrowStartNode.id
    // );
    // var endNode = me.jobConfigData.find(
    //   (a) => me.digraphIdPrev + a.procedureId == event.id
    // );
    // me.procedureManager.addLink(startNode, endNode);
    // me.updateDigraphByProcedureManager();
    // me.update$.next(true);
  }
  public onNodeClick(event: Node) {
    var me = this;
    //debugger;
    if (PaintType.none == me.currentPaintType) {
      me.showEditProcedurePopups(event);
    } else if (PaintType.delete == me.currentPaintType) {
      this.modalService.confirm({
        nzTitle: "<i>确定</i>",
        nzContent: "<b>确定删除步骤" + event.label + "吗</b>",
        nzOnOk: () => {
          var tmpJobConfig :ProcedureModel|null= this.jobConfigData.find(
            (x) => x.procedureName == event.label
          )||null;
          if(tmpJobConfig!=null){

            me.doDeleteProcedure(tmpJobConfig);
          }
        },
      });
    } else if (PaintType.line == me.currentPaintType) {
      //me.lineX2 = 500;
      //me.startMove$.next([event.position.x, event.position.y]);

      console.info("arrow Click");
      if (me.pfClickArrow.isDragging) {
        //不会进入这里，因为箭头挡住了
        //debugger;
        console.info("arrow Click isDragging");
        // //箭头挡住不会触发这里的click事件
        // me.onArrowMoveEnd(event);
        // me.arrowStartNode = null;
        // //me.isDragging = false;
        // //debugger;
        // var startNode = me.jobConfigData.find(
        //   (a) => me.digraphIdPrev + a.procedureId == me.arrowStartNode.id
        // );
        // var endNode = me.jobConfigData.find(
        //   (a) => me.digraphIdPrev + a.procedureId == event.id
        // );
        // me.procedureManager.addLink(startNode, endNode);
        // me.updateDigraphByProcedureManager();
        // me.update$.next(true);
      } else {
        me.arrowStartNode = event;
        me.startMove$.next(event.position);
      }

      // me.getIsDragging$.subscribe({
      //   //定阅远程操作,当远程操作完成时要做什么
      //   next: (x) => {
      //     //debugger;
      //     me.msg.info("3333" + x);
      //     me.startMove$.next(event.position);
      //   },
      //   // error: (err) => me.msg.info("4444" + err),
      //   // complete: () => me.msg.info("5555"),
      // });
    }
  }
  public onLinkClick(event:any) {
    var me = this;
    //debugger;
    console.info("onLinkClick");
    console.info(event);
    if (PaintType.none == me.currentPaintType) {
      //me.showEditProcedurePopups(event);
    } else if (PaintType.delete == me.currentPaintType) {
      var id = event.target.parentElement.parentElement.id; //"dig43424c97-b27b-4fd2-a569-0c041ced9acddig1c72eebd-23f3-d8f9-4994-d3a9300df0a7"
      var idArr = id.split("dig");
      var l:ProcedureModel|null = me.procedureManager.getNode(idArr[1]);
      var r:ProcedureModel|null = me.procedureManager.getNode(idArr[2]);
      if(l!=null&&r!=null){

        this.modalService.confirm({
          nzTitle: "<i>确定</i>",
          nzContent:
            "<b>确定删除关系 " +
            l.procedureName +
            "=>" +
            r.procedureName +
            " 吗</b>",
          nzOnOk: () => {
            // var tmpJobConfig = this.jobConfigData.find(
            //   (x) => x.procedureName == event.label
            // );
            // me.doDeleteProcedure(tmpJobConfig);
            //me.procedureManager.deleteLinkByKey(idArr[1], idArr[2]);
      if(l!=null&&l!=undefined&&r!=null){
            me.procedureManager.deleteLink(l, r);
      }
            me.updateDigraphByProcedureManager();
            me.update$.next(true);
          },
        });
      }
      
    }
  }
  public showEditProcedurePopups(e: any): any {
    var me = this;
    // console.info("eeee");
    // console.info(e);

    this.procedureForm.reset();

    //debugger;
    var tmpJobConfig = this.jobConfigData.find(
      (x) => x.procedureName == e.label
    );
    if(tmpJobConfig==null){return;}
    //debugger;
    this.procedureForm.patchValue(tmpJobConfig);
    me.validENV = tmpJobConfig.env;
    me.updateENVShort();
    me.validFetch = tmpJobConfig.fetch ||[];
    me.updateUploadShort();

    // me.getHistoryData();
    me.getFetchList();

    me.procedureForm.patchValue({
      fetch: tmpJobConfig.fetch.map((a) => a.uri),
    });

    this.isVisible = true;
  }
  /** @deprecated */
  public updateDigraphByProcedure() {
    // for (const i in this.baseForm.controls) {

    //   this.baseForm.controls[i].markAsDirty();
    //   this.baseForm.controls[i].updateValueAndValidity();

    //   // if(!this.baseForm.controls[i].valid)
    //   // {
    //   //   this.message.create('error','请先完善配置');
    //   //   return;
    //   // }
    // }
    var me = this;
    let baseFormObj = me.getCurrentProcedure(); // this.baseForm.value;
    if (
      me.isProcedureAdd() &&
      this.digraphNodeData.findIndex(
        (x) => x.id == me.digraphIdPrev + baseFormObj.procedureId
      ) < 0
    ) {
      this.digraphNodeData.push({
        id: me.digraphIdPrev + baseFormObj.procedureId,
        label: me.digraphIdPrev + baseFormObj.procedureName,
      });
      for (var i = 0; i < baseFormObj.from.length; i++) {
        if (
          this.digraphLinkData.findIndex(
            (x) =>
              x.source == me.digraphIdPrev + baseFormObj.from[i] &&
              x.target == me.digraphIdPrev + baseFormObj.procedureId
          ) < 0
        ) {
          this.digraphLinkData.push({
            id:
              me.digraphIdPrev + baseFormObj.from[i] + baseFormObj.procedureId,
            source: me.digraphIdPrev + baseFormObj.from[i],
            target: me.digraphIdPrev + baseFormObj.procedureId,
            label: "",
          });
          // you have to return `{error: true}` to mark it as an error event
          //observer.next({ error: true, duplicated: true });
        }
      }
      for (var i = 0; i < baseFormObj.to.length; i++) {
        if (
          this.digraphLinkData.findIndex(
            (x) =>
              x.source == me.digraphIdPrev + baseFormObj.procedureId &&
              x.target == me.digraphIdPrev + baseFormObj.to[i]
          ) < 0
        ) {
          this.digraphLinkData.push({
            id: me.digraphIdPrev + baseFormObj.procedureId + baseFormObj.to[i],
            source: me.digraphIdPrev + baseFormObj.procedureId,
            target: me.digraphIdPrev + baseFormObj.to[i],
            label: "",
          });
          // you have to return `{error: true}` to mark it as an error event
          //observer.next({ error: true, duplicated: true });
        }
      }
      baseFormObj.isAdd = false;
      //debugger;
      me.jobConfigData.push(baseFormObj);
      // you have to return `{error: true}` to mark it as an error event
      //observer.next({ error: true, duplicated: true });
    } else {
      //编辑节点 --benjamin todo

      //这样有问题的,其它config的线会丢了
      // me.digraphLinkData = [
      //   ...baseFormObj.from.map((a) => {
      //     return {
      //       id: baseFormObj.procedureName + a,
      //       source: baseFormObj.procedureName,
      //       target: a,
      //       label: "",
      //     };
      //   }),
      //   ...baseFormObj.to.map((a) => {
      //     return {
      //       id: a + baseFormObj.procedureName,
      //       source: a,
      //       target: baseFormObj.procedureName,
      //       label: "",
      //     };
      //   }),
      // ];

      var link = me.getLinkByProcedure();
      me.digraphLinkData = me.digraphLinkData.filter(
        (a) =>
          (a.source != me.digraphIdPrev + baseFormObj.procedureId &&
            a.target != me.digraphIdPrev + baseFormObj.procedureId) || //和此步骤无关的要保留
          link.findIndex((b) => b.id == a.id) > -1 //或者是此步骤的连线
      );
      me.digraphLinkData = [
        ...me.digraphLinkData,
        ...link.filter(
          (a) => me.digraphLinkData.findIndex((b) => b.id == a.id) < 0
        ), //把新的加进来
      ];
      //debugger;
      // if(baseFormObj.from.findIndex(a=>me.jobConfigData.findIndex(b=>b.procedureId==a))<0){//如果
      // }
      var old = me.jobConfigData.find(
        (a) => baseFormObj.procedureId == a.procedureId
      );
      old = Object.assign(old, baseFormObj);
      // me.digraphLinkData=baseFormObj.from.map(function (user) { return {id:"aa",source:""}; });
      // me.digraphLinkData=baseFormObj.from.map((a)=>{ return {id:"aa",source:""};});
      // //去掉form和to里都没有的
      // me.digraphLinkData = me.digraphLinkData.filter(
      //   (a) =>
      //     !baseFormObj.from.any(
      //       (b) => b == a.source && a.target == baseFormObj.procedureName
      //     ) &&
      //     !baseFormObj.to.any(
      //       (b) => b == a.target && a.source == baseFormObj.procedureName
      //     )
      // );
      // me.digraphLinkData = [
      // //   ...me.digraphLinkData,
      // //   baseFormObj.from
      // //     .filter((aa) =>
      // //       me.digraphLinkData.any(
      // //         (b) => b.source == aa && b.target == baseFormObj.procedureName
      // //       )
      // //     )
      // //     .map((a) => {}),
      // // ];
      // for (var i = 0; i < baseFormObj.from.length; i++) {
      //   if (
      //     this.digraphLinkData.findIndex(
      //       (x) =>
      //         x.source == baseFormObj.from[i] &&
      //         x.target == baseFormObj.procedureName
      //     ) < 0
      //   ) {
      //     this.digraphLinkData.push({
      //       id: baseFormObj.from[i] + baseFormObj.procedureName,
      //       source: baseFormObj.from[i],
      //       target: baseFormObj.procedureName,
      //       label: "",
      //     });
      //     // you have to return `{error: true}` to mark it as an error event
      //     //observer.next({ error: true, duplicated: true });
      //   }
      // }
      // for (var i = 0; i < baseFormObj.to.length; i++) {
      //   if (
      //     this.digraphLinkData.findIndex(
      //       (x) =>
      //         x.source == baseFormObj.procedureName &&
      //         x.target == baseFormObj.to[i]
      //     ) < 0
      //   ) {
      //     this.digraphLinkData.push({
      //       id: baseFormObj.procedureName + baseFormObj.to[i],
      //       source: baseFormObj.procedureName,
      //       target: baseFormObj.to[i],
      //       label: "",
      //     });
      //     // you have to return `{error: true}` to mark it as an error event
      //     //observer.next({ error: true, duplicated: true });
      //   }
      // }
    }
    this.update$.next(true);
    //  for(var i=0;i<baseItemInfo.from.length;i++){
    //   if (this.digraphNodeData.findIndex(x => x.label ==baseItemInfo.from[i])<0) {
    //     this.digraphNodeData.push({id:,label:});
    //     // you have to return `{error: true}` to mark it as an error event
    //     //observer.next({ error: true, duplicated: true });
    //   }
    //  }
    // for (let key of keys(obj)) {
    //   console.log(key); // 'a', 'b', 'c'
    // }
    // for (let [key, value] of entries(baseItemInfo)) {
    //   console.log([key, value]); // ['a', 1], ['b', 2], ['c', 3]
    // }
  }
  // //上传镜像
  // handleUploaded(info: NzUploadChangeParam): void {
  //  //debugger;
  //   if (info.file.status !== 'uploading') {
  //     console.log(info.file, info.fileList);
  //   }
  //   if (info.file.status === 'done') {
  //     this.msg.success(`${info.file.name} file uploaded successfully`);
  //   } else if (info.file.status === 'error') {
  //     this.msg.error(`${info.file.name} file upload failed.`);
  //   }
  // }
  editFetchList(e: MouseEvent): void {
    e.preventDefault();
    var me = this;
    me.isFetchPopupsVisible = true;
  }
  deleteFetch(idx: any): void {
    var me = this;
    // // var oldFetch= me.baseForm.value.fetch;
    // // if(oldFetch==null){
    // //   return;
    // // }
    // // // else{
    // // //   me.baseForm.value.fetch.splice(idx,1);
    // // // }
    // // oldFetch.splice(idx,1);
    // // me.baseForm.patchValue({
    // //   fetch:oldFetch
    // // });
    // me.fetchGridData.splice(idx,1);//用splice的话,Grid不会跟踪,似乎要用下面的赋值方式

    me.validFetch = me.validFetch.filter((d, i) => i !== idx);
    me.procedureForm.patchValue({ fetch: me.validFetch });
    me.updateUploadShort();
  }
  selectUriToCmd(uri: string): void {
    //debugger;
    var me = this;
    var s = me.getCurrentProcedure().cmd;
    if (s == null || s == undefined) {
      s = "";
    }
    if (s.length > 0 && s[s.length] != " ") {
      s += " ";
    }
    //s += "$MESOS_SANDBOX/" + uri;

    // var i = uri.indexOf("?filePath=");
    //s += "$MESOS_SANDBOX/" + decodeURIComponent(uri.substr(i + 1 + 9));

    // var i = uri.lastIndexOf("%2F");
    // var decodeUri = decodeURIComponent(uri.substr(i + 3));
    // s += "$MESOS_SANDBOX/" + decodeUri;

    // var i = uri.indexOf("?filePath=");
    // var path = decodeURIComponent(uri.substr(i + 1 + 9));
    // var pathArr = me.pfUtil.splitPath(path);
    var pathArr = me.getFilePathByFetchDownloadUri(uri);
    if ("" == s) {
      if (".jar" == pathArr[2]) {
        // s +=
        //   "chmod +x & java -jar " + "$MESOS_SANDBOX/" + pathArr[1] + pathArr[2];
        s +=
          "chmod +x $MESOS_SANDBOX/" +
          pathArr[1] +
          pathArr[2] +
          " & java -jar " +
          "$MESOS_SANDBOX/" +
          pathArr[1] +
          pathArr[2];
      } else {
        s += "$MESOS_SANDBOX/" + pathArr[1] + pathArr[2];
      }
    } else if (s.indexOf(pathArr[1] + pathArr[2]) < 0) {
      s += "$MESOS_SANDBOX/" + pathArr[1] + pathArr[2];
    }

    me.isFetchPopupsVisible = false;
    me.procedureForm.patchValue({ cmd: s });
    me.msg.info("已添加:" + pathArr[1] + pathArr[2]);
  }
  getFetchDownloadUri(uri: string): string {
    var me = this;
    //旧版本的下载url是这种形式：http://localhost:29201/download?filePath=testPath001%2Ftest001国_20210702172118.jar
    // return (
    //   me.config.getUploadBaseUrl() +
    //   "/download?filePath=" +
    //   encodeURIComponent(uri)
    // );
    //新版本的下载url优化成这种形式：http://localhost:29201/download/testPath001/test001_20210702164841.jar(这是为了便于第三方下载此文件时用/分隔文件名)
    return me.config.getUploadBaseUrl() + "/download/" + uri;
  }
  getFilePathByFetchDownloadUri(uri: string): string[] {
    var me = this;
    // var i = uri.indexOf("?filePath=");
    // var path = decodeURIComponent(uri.substr(i + 1 + 9));
    // var pathArr = me.pfUtil.splitPath(path);
    var pathArr = me.pfUtil.splitPath(uri);
    return pathArr;
  }
  getFileNameByFetchDownloadUri(uri: string): string {
    var me = this;
    // //debugger;
    // var i = uri.indexOf("?filePath=");
    // var path = decodeURIComponent(uri.substr(i + 1 + 9));
    // var pathArr = me.pfUtil.splitPath(path);
    var pathArr = me.pfUtil.splitPath(uri);
    return pathArr[1] + pathArr[2];
  }
  // //用默认方式的nzData指定body没成功,好像不是POST请求
  // getUploadBody =(file: NzUploadFile) =>{
  //   // const { accessId, policy, signature } = this.mockOSSData;

  //   // return {
  //   //   key: file.url,
  //   //   OSSAccessKeyId: accessId,
  //   //   policy: policy,
  //   //   Signature: signature
  //   // };
  //   var me=this;
  //       let baseFormObj: any = me.baseForm.value;
  //   return {
  //     filePath: "xschedulerjob",
  //     funcName: baseFormObj.procedureName??baseFormObj.procedureId,
  //     id: baseFormObj.procedureId
  //   };
  // }
  updateUploadShort() {
    var me = this;
    // me.baseForm.patchValue({fetchShort:"已上传"+me.baseForm.value.fetch.length+"个"});
    me.procedureForm.patchValue({
      //fetchShort: "已上传" + me.validFetch.length + "个", //,
      fetchShort: "已选择" + me.validFetch.length + "个", //,
      //fetch: me.fetchGridData,
    });
  }
  updateENVShort() {
    var me = this;
    me.procedureForm.patchValue({
      envShort: Object.keys(me.validENV).join(","),
    });
  }
  handleUpload = (item:any): any => {
    //debugger;
    console.info("aaaaaaaaaaaaaaaaaaaaaaaaa");
    var me = this;
    me.isFetchPopupsLoading = true;
    me.mainLoading = true;
    me.isFetchPopupsUploading = true;
    const formData = new FormData();
    // // tslint:disable-next-line:no-any
    // this.fileList.forEach((file: any) => {
    //   formData.append('files[]', file);
    // });
    // this.uploading = true;
    // You can use any AJAX library you like
    let baseFormObj: any = me.procedureForm.value;
    // observer.next({
    //   filePath:"xschedulerjob",
    //   funcName: baseFormObj.procedureName??baseFormObj.procedureId,
    //   id:baseFormObj.procedureId
    // });
    formData.append("file", item.file as any);
    formData.append("filePath", "xschedulerjob");
    formData.append(
      "funcName",
      baseFormObj.procedureName || baseFormObj.procedureId
    );
    formData.append("id", baseFormObj.procedureId);
    // let headers = new HttpHeaders();
    // headers= headers.set('content-type', 'text/plain;charset=utf-8');
    const req = new HttpRequest("POST", item.action, formData, {
      responseType: "text",
      reportProgress: true,
      //headers:headers
      // reportProgress: true
    });
    me.uploadedPercent = 0;
    me.uploadStatus = "active";

    //远程
    // me.fetchPopupsUploadingSubscription = me.http
    //   .request(req)
    //   .pipe(
    //     filter((e) => {
    //       // // var aa=e instanceof HttpResponse;
    //       // ////debugger;
    //       // return e instanceof HttpResponse; //如果不过滤,会有{type:0}的返回,真正成功时是{type:4}
    //       switch (e.type) {
    //         case HttpEventType.UploadProgress: {
    //           if(e.total!=null){

    //             me.uploadedPercent = Math.ceil((e.loaded * 100) / e.total);
    //             console.info(me.uploadedPercent);
    //           }
    //           break;
    //         }
    //         case HttpEventType.Response: {
    //           return true;
    //           break;
    //         }
    //       }
    //       return false;
    //     })
    //   )
    //   .subscribe(
    //     (event: HttpEvent<any>) => {
    //       //debugger;
    //       // this.uploading = false;
    //       // this.fileList = [];
    //       //debugger;
    //       this.msg.success("上传镜像成功.");
    //       var uri = (event as HttpResponse<string>).body||"";
    //       // //
    //       // // if(me.baseForm.value.fetch==null){
    //       // //   me.baseForm.value.fetch=[];
    //       // // }
    //       // //me.baseForm.value.fetch.push({uri:uri,extract:true,executable:true,cache:false});
    //       // //me.baseForm.patchValue({fetchShort:"已上传"+me.baseForm.value.fetch.length+"个"});
    //       // var oldFetch= me.baseForm.value.fetch;
    //       // if(oldFetch==null){
    //       //   oldFetch=[];
    //       // }
    //       // oldFetch.push({uri:uri,extract:true,executable:true,cache:false});
    //       // me.baseForm.patchValue({
    //       //   fetchShort:"已上传"+oldFetch.length+"个",
    //       //   fetch:oldFetch
    //       // });
    //       // // var oldFetch= me.baseForm.value.fetch;
    //       // // oldFetch.push()
    //       // // me.baseForm.patchValue({uri:uri,extract:true,executable:true,cache:false})

    //       //me.fetchGridData.push(new FetchUri{uri:uri,extract:true,executable:true,cache:false});

    //       //me.fetchGridData.push({uri:uri,extract:true,executable:true,cache:false});

    //       // //原版fetch用gird
    //       me.validFetch = [
    //         ...me.validFetch,
    //         {
    //           uri: me.getFetchDownloadUri(uri),
    //           extract: true,
    //           executable: true,
    //           cache: false,
    //         },
    //       ];
    //       //me.procedureForm.patchValue({ fetch: me.validFetch });

    //       //新版fetch用下拉
    //       var fetch = [
    //         ...(baseFormObj.fetch || []),
    //         me.getFetchDownloadUri(uri),
    //       ];
    //       //me.getHistoryData();
    //       me.getFetchList();
    //       me.selectUriToCmd(uri);
    //       me.procedureForm.patchValue({ fetch: fetch });

    //       me.updateUploadShort();
    //       me.isFetchPopupsLoading = false;
    //       me.isFetchPopupsUploading = false;
    //       me.mainLoading = false;
    //     },
    //     (err) => {
    //       //debugger;
    //       // this.uploading = false;
    //       me.msg.error("上传失败.");
    //       me.uploadStatus = "exception";
    //     }
    //   );
    
    //本地模拟
    const observable = new Observable<string>((subscriber) => {
      var total=100;
      for(var i=0;i<10;i++){
          me.uploadedPercent = Math.ceil((10*i * 100) / total);

      }      
      // formData.append("file", item.file as any);
      // formData.append("filePath", "xschedulerjob");
      debugger;
      var pathArr=me.pfUtil.splitPath(item.file.name);
      var d = new Date();
      var ds=d.getFullYear()+d.getMonth()+d.getDate()+d.getHours()+d.getMinutes()+d.getMinutes();
      var fileName="xschedulerjob/"+pathArr[1]+ds+pathArr[2];
      subscriber.next(fileName);
    });
    observable
      .subscribe(
        (event: string) => {
          //debugger;
          // this.uploading = false;
          // this.fileList = [];
          //debugger;
          this.msg.success("上传镜像成功.");
          var uri = event;
          // //
          // // if(me.baseForm.value.fetch==null){
          // //   me.baseForm.value.fetch=[];
          // // }
          // //me.baseForm.value.fetch.push({uri:uri,extract:true,executable:true,cache:false});
          // //me.baseForm.patchValue({fetchShort:"已上传"+me.baseForm.value.fetch.length+"个"});
          // var oldFetch= me.baseForm.value.fetch;
          // if(oldFetch==null){
          //   oldFetch=[];
          // }
          // oldFetch.push({uri:uri,extract:true,executable:true,cache:false});
          // me.baseForm.patchValue({
          //   fetchShort:"已上传"+oldFetch.length+"个",
          //   fetch:oldFetch
          // });
          // // var oldFetch= me.baseForm.value.fetch;
          // // oldFetch.push()
          // // me.baseForm.patchValue({uri:uri,extract:true,executable:true,cache:false})

          //me.fetchGridData.push(new FetchUri{uri:uri,extract:true,executable:true,cache:false});

          //me.fetchGridData.push({uri:uri,extract:true,executable:true,cache:false});

          // //原版fetch用gird
          me.validFetch = [
            ...me.validFetch,
            {
              uri: me.getFetchDownloadUri(uri),
              extract: true,
              executable: true,
              cache: false,
            },
          ];
          //me.procedureForm.patchValue({ fetch: me.validFetch });

          //新版fetch用下拉
          var fetch = [
            ...(baseFormObj.fetch || []),
            me.getFetchDownloadUri(uri),
          ];
          //me.getHistoryData();
          me.getFetchList();
          me.selectUriToCmd(uri);
          me.procedureForm.patchValue({ fetch: fetch });

          me.updateUploadShort();
          me.isFetchPopupsLoading = false;
          me.isFetchPopupsUploading = false;
          me.mainLoading = false;
        },
        (err) => {
          //debugger;
          // this.uploading = false;
          me.msg.error("上传失败.");
          me.uploadStatus = "exception";
        }
      );
  };
  private getCurrentProcedure(): ProcedureModel {
    var me = this;
    var r: ProcedureModel = me.procedureForm.value;
    // r.fetch =
    //   me.procedureForm.value.fetch == null
    //     ? []
    //     : me.procedureForm.value.fetch.map((a) => {
    //         var r = { uri: a, extract: true, executable: true, cache: false };
    //         return r;
    //       });
    r.fetch = me.validFetch;
    return me.procedureForm.value;
  }
  showHistoryUri(): void {
    var me = this;
    me.getHistoryData();
    // this.reference
    //   .request(
    //     "POST",
    //     "DcosService/GetFileList",
    //     this.userProvider.getToken(),
    //     //"",
    //     //[{ key: "id", value: "1403141437104" }], //id改为me.baseForm.procedureId--benjamin todo
    //     [{ key: "id", value: me.getCurrentProcedure().procedureId }], //id改为me.baseForm.procedureId--benjamin todo
    //     false
    //   )
    //   .subscribe((response) => {
    //     if (response.Success == "True") {
    //       var data = JSON.parse(this.reference.base64Decode(response.Result));
    //       //me.containerImage=[];
    //       me.fetchHistoryGridData = data;
    //       for (var i = 0; i < me.fetchHistoryGridData.length; i++) {
    //         me.fetchHistoryGridData[i].Url = me.getFetchDownloadUri(
    //           me.fetchHistoryGridData[i].Url
    //         );
    //       }
    //       // me.listOfData.splice(0,me.listOfData.length);
    //       // for(var i=0;i<data.length;i++){
    //       //   me.listOfData.push(data[i]);
    //       // }
    //       console.log(me.fetchHistoryGridData);
    //     }
    //   });

    me.isHistoryPopupsVisible = true;
  }
  /**@deprecated */
  getHistoryData() {
    var me = this;
    this.reference
      .request(
        "POST",
        "DcosService/GetFileList",
        this.userProvider.getToken(),
        //"",
        //[{ key: "id", value: "1403141437104" }], //id改为me.baseForm.procedureId--benjamin todo
        [{ key: "id", value: me.getCurrentProcedure().procedureId }], //id改为me.baseForm.procedureId--benjamin todo
        false
      )
      .subscribe((response) => {
        if (response.Success == "True") {
          var data = JSON.parse(this.reference.base64Decode(response.Result));
          //me.containerImage=[];
          me.fetchHistoryGridData = data;
          for (var i = 0; i < me.fetchHistoryGridData.length; i++) {
            me.fetchHistoryGridData[i].Url = me.getFetchDownloadUri(
              me.fetchHistoryGridData[i].Url
            );
          }
          // me.listOfData.splice(0,me.listOfData.length);
          // for(var i=0;i<data.length;i++){
          //   me.listOfData.push(data[i]);
          // }
          console.log(me.fetchHistoryGridData);
        }
      });
  }
  getFetchList() {
    var me = this;
    this.reference
      .request(
        "POST",
        "DcosService/GetFileList",
        this.userProvider.getToken(),
        //"",
        //[{ key: "id", value: "1403141437104" }], //id改为me.baseForm.procedureId--benjamin todo
        [{ key: "id", value: me.getCurrentProcedure().procedureId }], //id改为me.baseForm.procedureId--benjamin todo
        false
      )
      .subscribe((response) => {
        if (response.Success == "True") {
          var data: JobFile[] = JSON.parse(
            this.reference.base64Decode(response.Result)
          );
          //me.containerImage=[];
          //me.fetchHistoryGridData = data;
          // for (var i = 0; i < me.fetchHistoryGridData.length; i++) {
          //   me.fetchHistoryGridData[i].Url = me.getFetchDownloadUri(
          //     me.fetchHistoryGridData[i].Url
          //   );
          // }

          //debugger;
          me.fetchList = [
            ...me.validFetch,
            ...data
              .map((a) => {
                var r: FetchUri = {
                  uri: me.getFetchDownloadUri(a.Url),
                  extract: true,
                  executable: true,
                  cache: false,
                };
                // r.uri = me.getFetchDownloadUri(a);
                return r;
              })
              .filter(
                (a) => me.validFetch.findIndex((b) => b.uri == a.uri) < 0
              ),
          ];
          me.fetchHistoryCheckedId.clear();
          me.validFetch.map((a) => {
            me.fetchHistoryCheckedId.add(a.uri);
          });
          // me.listOfData.splice(0,me.listOfData.length);
          // for(var i=0;i<data.length;i++){
          //   me.listOfData.push(data[i]);
          // }
          console.log(me.fetchHistoryGridData);
        }
      });
  }
  //fetchHistoryGrid
  updateCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.fetchHistoryCheckedId.add(id);
    } else {
      this.fetchHistoryCheckedId.delete(id);
    }
  }

  onCurrentPageDataChange(fetchHistoryGridPageData: JobFile[]): void {
    this.fetchHistoryGridPageData = fetchHistoryGridPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.fetchHistoryGridPageData; //.filter(({ disabled }) => !disabled);
    this.isHistoryAllChecked = listOfEnabledData.every(({ FileId }, i) =>
      this.fetchHistoryCheckedId.has(FileId)
    );
    this.fetchHistoryIndeterminate =
      listOfEnabledData.some(({ FileId }) =>
        this.fetchHistoryCheckedId.has(FileId)
      ) && !this.isHistoryAllChecked;
  }

  getNewFetch(uri: string): FetchUri {
    return { uri: uri, extract: true, executable: true, cache: false };
  }
  onItemChecked(id: string, checked: boolean): void {
    var me = this;
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
    if (checked) {
      me.validFetch.push(me.getNewFetch(id));
      me.selectUriToCmd(id);
    } else {
      me.validFetch = me.validFetch.filter((a) => a.uri != id);
    }
    me.updateUploadShort();
  }

  onAllChecked(checked: boolean): void {
    this.fetchHistoryGridPageData //.filter(({ disabled }) => !disabled)
      .forEach(({ FileId }) => this.updateCheckedSet(FileId, checked));
    this.refreshCheckedStatus();
  }

  /**@deprecated */
  selectFetchHistory(): void {
    var me = this;
    this.fetchHistoryloading = true;
    const requestData = this.fetchHistoryGridData.filter((data) =>
      this.fetchHistoryCheckedId.has(data.FileId)
    );
    console.log(requestData);
    setTimeout(() => {
      // this.fetchGridData = [
      //   ...this.fetchGridData,
      //   ...requestData
      // ];

      for (var i = 0; i < requestData.length; i++) {
        this.validFetch = [
          ...this.validFetch,
          {
            uri: requestData[i].Url,
            extract: true,
            executable: true,
            cache: false,
          },
        ];
      }
      me.procedureForm.patchValue({ fetch: me.validFetch });
      me.updateUploadShort();

      this.fetchHistoryCheckedId.clear();
      this.refreshCheckedStatus();
      this.fetchHistoryloading = false;

      me.isHistoryPopupsVisible = false;
    }, 0);
  }
  onHistoryUriChange(event: EventEmitter<any[]>) {
    //debugger;
  }

  //编辑作业信息的弹窗
  showEditJobInfoPopups(): void {
    //this.message.info('This is a normal message');
    var me = this;
    // //debugger;
    // this.jobForm.reset();
    // this.jobForm.patchValue({
    //   "isAdd":false,  //正式时改为true--benjamin todo
    //   "procedureId":Guid.create().toString()
    // });
    // me.fetchGridData.splice(0,me.fetchGridData.length);
    //debugger;
    let jobId = me.jobForm.value.JobId;
    if (me.isAdd() && (jobId == undefined || jobId == null || jobId == "")) {
      this.jobForm.patchValue({
        JobId: Guid.create().toString(),
        Time: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        UserId: me.userId,
      });
    }
    me.isJobInfoPopupsVisible = true;
  }
  onCronChange(event:any): void {
    var me = this;
    console.info(event);
    console.info(me.cronData);
    me.jobForm.patchValue({ CRON: event });
  }

  // onCusEvent = function (name:any, action:any) {};
  saveJobInfo(): void {
    var me = this;
    me.isJobInfoConfirmLoading = true;
    //me.jobForm.patchValue({xx:me.validReference.join()})
    for (const i in this.jobForm.controls) {
      this.jobForm.controls[i].markAsDirty();
      this.jobForm.controls[i].updateValueAndValidity();
    }
    if (this.jobForm.valid) {
      me.isJobInfoFilled = true;
      this.isJobInfoPopupsVisible = false;

      if (me.cusListenerer != null) {
        me.cusListenerer.complete();
      }
    }
    me.isJobInfoConfirmLoading = false;
  }
  /**
   * 最终提交保存
   */
  saveJob(): void {
    var me = this;

    var jobConfig = [];
    for (var i = 0; i < me.jobConfigData.length; i++) {
      jobConfig.push({
        procedureId: me.jobConfigData[i].procedureId,
        procedureName: me.jobConfigData[i].procedureName,
        schedulerId: "",
        status: "NONE",
        maxLaunchDelay: me.jobConfigData[i].maxLaunchDelay,
        retry: me.jobConfigData[i].retry,
        retryInterval: me.jobConfigData[i].retryInterval,
        from: me.jobConfigData[i].from,
        to: me.jobConfigData[i].to,
        scheduler: {
          user: "root",
          cpus: "1.0",
          mem: "1024.0",
          env: me.jobConfigData[i].env,
          container: {
            type: "MESOS",
            docker: {
              image: me.jobConfigData[i].containerImage, //"uat-registry.perfect99.com/datax:2021.05.17.0933",
              forcePullImage: false,
              privledged: false,
              parameters: [],
            },
          },
          cmd: me.jobConfigData[i].cmd, //"/usr/local/datax/bin/datax.py $MESOS_SANDBOX/shop_user_to_hive.json",
          fetch: me.jobConfigData[i].fetch,
          // "fetch":[
          //     {
          //         "uri":"http://uat-dcos.perfect99.com:8083/spark/shop_user_to_hive.json",
          //         "extract":true,
          //         "executable":true,
          //         "cache":false
          //     }
          // ],
          networks: [
            {
              name: "dcos",
              mode: "container",
            },
          ],
          constraints: [],
          portDefinitions: [],
          volumes: [],
        },
        description: me.jobConfigData[i].description,
      });
    }

    let baseFormObj: JobModel = me.jobForm.value;
    //debugger;
    baseFormObj.Dependencies = me.jobForm.value.Dependencies.join();
    // var postData = [
    //   new KeyValuePair("JobId", baseFormObj.JobId),
    //   new KeyValuePair("JobName", baseFormObj.JobName),
    //   new KeyValuePair("CRON", baseFormObj.CRON),
    //   new KeyValuePair("TimeZone", baseFormObj.TimeZone),
    //   new KeyValuePair(
    //     "Configure",
    //     me.reference.base64Encode(JSON.stringify(jobConfig))
    //   ),
    //   new KeyValuePair("Description", baseFormObj.Description),
    //   new KeyValuePair("Time", baseFormObj.Time),
    // ];

    //debugger;
    var updateTime = me.isAdd()
      ? baseFormObj.Time
      : format(new Date(), "yyyy-MM-dd HH:mm:ss");
    me.reference
      // .request(
      //   "POST",
      //   "XSchedulerJob/Insert",
      //   me.userProvider.getToken(),
      //   JSON.stringify({
      //     JobId: baseFormObj.JobId,
      //     JobName: baseFormObj.JobName,
      //     CRON: baseFormObj.CRON,
      //     TimeZone: baseFormObj.TimeZone,
      //     //"Configure":  baseFormObj.Configure ,
      //     Configure: this.reference.base64Encode(JSON.stringify(jobConfig)),
      //     //"Dependencies":  baseFormObj.cmd ,
      //     Description: baseFormObj.Description,
      //     Time: baseFormObj.Time,
      //     UserId: me.userId,
      //   }),
      //   //postData,
      //   true
      // )
      // .httpRequest(
      //   "POST",
      //   me.isAdd() ? "XSchedulerJob/Insert" : "XSchedulerJob/Save",
      //   me.userProvider.getToken(),
      //   null,
      //   {
      //     JobId: baseFormObj.JobId,
      //     JobName: baseFormObj.JobName,
      //     CRON: baseFormObj.CRON,
      //     TimeZone: baseFormObj.TimeZone,
      //     //"Configure":  baseFormObj.Configure ,
      //     Configure: this.reference.base64Encode(JSON.stringify(jobConfig)),
      //     Dependencies: baseFormObj.Dependencies,
      //     Description: baseFormObj.Description,
      //     Time: baseFormObj.Time,
      //     UserId: me.userId,
      //     UpdateTime: updateTime,
      //   }
      // )
      .saveJob(
          {
            JobId: baseFormObj.JobId,
            JobName: baseFormObj.JobName,
            CRON: baseFormObj.CRON,
            TimeZone: baseFormObj.TimeZone,
            //"Configure":  baseFormObj.Configure ,
            Configure: this.reference.base64Encode(JSON.stringify(jobConfig)),
            Dependencies: baseFormObj.Dependencies,
            Description: baseFormObj.Description,
            Time: baseFormObj.Time,
            UserId: me.userId,
            UpdateTime: updateTime,
          }

      )
      .subscribe((response) => {
        // //debugger;
        // if (response.Success == "True") {
        //   me.msg.success("保存成功");
        //   if (me.isAdd()) {
        //     this.router.navigate([
        //       "computes/xSchedulerJob-edit/" + me.jobForm.value.JobId,
        //     ]);
        //   } else {
        //     me.jobForm.patchValue({ UpdateTime: updateTime });
        //   }
        // } else {
        //   me.msg.info(response.Message ?? "保存失败");
        // }
        
        me.msg.success("保存成功");
        if (me.isAdd()) {
          this.router.navigate([
            "computes/xSchedulerJob-edit/" + me.jobForm.value.JobId,
          ]);
        } else {
          me.jobForm.patchValue({ UpdateTime: updateTime });
        }
        
        
      });
  }
  // setMediaUploadHeaders = (file: UploadFile) => {
  //   return {
  //     "Content-Type": "multipart/form-data",
  //     "Accept": "application/json",
  //   }
  // };
  // customUploadReq = (item: UploadXHRArgs) => {
  //   const formData = new FormData();
  //   formData.append('file', item.file as any); // tslint:disable-next-line:no-any
  //   ///formData.append('id', '1000');
  //   const req = new HttpRequest('POST', item.action, formData, {
  //     reportProgress : true,
  //     withCredentials: false
  //   });
  //   // Always return a `Subscription` object, nz-upload will automatically unsubscribe at the appropriate time
  //  return this.http.request(req).subscribe((event: HttpEvent<{}>) => {
  //     if (event.type === HttpEventType.UploadProgress) {
  //       if (event.total > 0) {
  //         (event as any).percent = event.loaded / event.total * 100; // tslint:disable-next-line:no-any
  //       }
  //       // To process the upload progress bar, you must specify the `percent` attribute to indicate progress.
  //       item.onProgress(event, item.file);
  //     } else if (event instanceof HttpResponse) { /* success */
  //       item.onSuccess(event.body, item.file, event);
  //     }
  //   },(err) => { /* error */
  //     item.onError(err, item.file);
  //   });
  // }

  //环境变量弹窗
  showEditENVPopups(e: MouseEvent): void {
    e.preventDefault();
    var me = this;
    //debugger;
    //me.environmentListOfControl = [];
    // for (var i = me.environmentListOfControl.length-1; i >=0; i--) {
    //   me.doRemoveField(me.environmentListOfControl[i], "environment");
    // }
    me.doRemoveAllField("environment");
    for (let key in me.validENV) {
      me.doAddField("environment", key, me.validENV[key]);
    }
    me.isENVPopupsVisible = true;
  }
  showEditCRONPopups(e: MouseEvent): void {
    e.preventDefault();
    var me = this;
    //if (me.isAdd()) {
    me.cronData = me.jobForm.value.CRON;
    //}
    me.isCRONPopupsVisible = true;
  }
  passengerChange(property:any): void {
    // var list = new Array();
    // var json= JSON.parse(this.description);
    // let itemInfo:any ;
    // var key=property;
    // if(property.indexOf('-')>0)
    // {
    //   var arrys= property.split('-');
    //   if(arrys.length==2)
    //     key=arrys[0];
    // }
    // if(property=="fetch-url")
    //   itemInfo =this.urlForm.value;
    // if(property=="env")
    //   itemInfo =this.environmentForm.value;
    // else  if(property=="labels")
    //    itemInfo =this.labelForm.value;
    //   json[key]= this.tool.getPassengerJson(property,itemInfo);
    // this.description= JSON.stringify(json,undefined,4);
  }
  doRemoveAllField(type: string): void {
    var me = this;
    for (var i = me.environmentListOfControl.length - 1; i >= 0; i--) {
      me.doRemoveField(me.environmentListOfControl[i], type);
    }
  }
  doRemoveField(
    i: { id: number; key: string; value: string },
    type: string
  ): void {
    if (type == "environment") {
      if (this.environmentListOfControl.length > 0) {
        const index = this.environmentListOfControl.indexOf(i);
        this.environmentListOfControl.splice(index, 1);
        this.environmentForm.removeControl(i.key);
        this.environmentForm.removeControl(i.value);

        //let itemInfo: any = this.environmentForm.value;
        // json["env"]= this.tool.getPassengerJson("env",itemInfo);
      }
    }
  }
  removeField(
    i: { id: number; key: string; value: string },
    type: string,
    e: MouseEvent
  ): void {
    var me = this;
    e.preventDefault();
    me.doRemoveField(i, type);
    // // var json= JSON.parse(this.description);
    // // var list = new Array();
    // // var name;
    // if (type == "environment") {
    //   if (this.environmentListOfControl.length > 0) {
    //     const index = this.environmentListOfControl.indexOf(i);
    //     this.environmentListOfControl.splice(index, 1);
    //     this.environmentForm.removeControl(i.key);
    //     this.environmentForm.removeControl(i.value);

    //     let itemInfo: any = this.environmentForm.value;
    //     // json["env"]= this.tool.getPassengerJson("env",itemInfo);
    //   }
    // }

    // else if(type=='label')
    // {
    //   if (this.labelListOfControl.length > 0) {
    //     const index = this.labelListOfControl.indexOf(i);
    //      this.labelListOfControl.splice(index, 1);
    //      this.labelForm.removeControl(i.key);
    //      this.labelForm.removeControl(i.value);

    //      let itemInfo:any =this.labelForm.value;
    //      json["labels"]= this.tool.getPassengerJson("labels",itemInfo);
    //    }
    // }
    // else if(type=='url')
    // {
    //   if (this.urlListOfControl.length > 0) {
    //     const index = this.urlListOfControl.indexOf(i);
    //      this.urlListOfControl.splice(index, 1);
    //      this.urlForm.removeControl(i.key);
    //      this.urlForm.removeControl(i.value);

    //      let itemInfo:any =this.urlForm.value;
    //      for (name in itemInfo) {
    //        if(name.toString().startsWith("value"))
    //        {
    //          list.push({"url":itemInfo[name]})
    //        }
    //       }
    //      json["fetch"]=list;

    //    }
    // }
    // this.description= JSON.stringify(json,undefined,4);
  }

  doAddField(type: string, key: string, value: string): void {
    var me = this;

    // var json= JSON.parse(this.description);

    if (type == "environment") {
      const id =
        this.environmentListOfControl.length > 0
          ? this.environmentListOfControl[
              this.environmentListOfControl.length - 1
            ].id + 1
          : 0;
      const control = {
        id,
        value: `value${id}`,
        key: `key${id}`,
      };
      //debugger;
      const index = this.environmentListOfControl.push(control);
      this.environmentForm.addControl(
        this.environmentListOfControl[index - 1].key,
        new FormControl(key, [Validators.required], [me.envAsyncValidator])
      );
      this.environmentForm.addControl(
        this.environmentListOfControl[index - 1].value,
        new FormControl(value, Validators.required)
      );
    }
    // else if(type=='label')
    // {

    //   const id = this.labelListOfControl.length > 0 ? this.labelListOfControl[this.labelListOfControl.length - 1].id + 1 : 0;

    //   const control = {
    //    id,
    //    value: `value${id}`,
    //    key: `key${id}`,

    //  };
    //   const index = this.labelListOfControl.push(control);
    //  this.labelForm.addControl(this.labelListOfControl[index - 1].key, new FormControl(null, Validators.required));
    //  this.labelForm.addControl(this.labelListOfControl[index - 1].value, new FormControl(''));
    // }
    // else if(type=='url')
    // {
    //   if(json["fetch"]==undefined)
    //   {
    //     json["fetch"]=[];
    //     this.description= JSON.stringify(json,undefined,4);
    //   }
    //   const id = this.urlListOfControl.length > 0 ? this.urlListOfControl[this.urlListOfControl.length - 1].id + 1 : 0;
    //   console.log(id)
    //   const control = {
    //    id,
    //    value: `value${id}`,

    //  };
    //   const index = this.urlListOfControl.push(control);
    //  this.urlForm.addControl(this.urlListOfControl[index - 1].value, new FormControl(null, Validators.required));

    //}
  }
  addField(type: string, e?: MouseEvent): void {
    var me = this;
    if (e) {
      e.preventDefault();
    }
    me.doAddField(type, "", "");
    // // var json= JSON.parse(this.description);

    // if (type == "environment") {
    //   const id =
    //     this.environmentListOfControl.length > 0
    //       ? this.environmentListOfControl[
    //           this.environmentListOfControl.length - 1
    //         ].id + 1
    //       : 0;
    //   const control = {
    //     id,
    //     value: `value${id}`,
    //     key: `key${id}`,
    //   };
    //   //debugger;
    //   const index = this.environmentListOfControl.push(control);
    //   this.environmentForm.addControl(
    //     this.environmentListOfControl[index - 1].key,
    //     new FormControl("", [Validators.required], [me.envAsyncValidator])
    //   );
    //   this.environmentForm.addControl(
    //     this.environmentListOfControl[index - 1].value,
    //     new FormControl("", Validators.required)
    //   );
    // }
    // // else if(type=='label')
    // // {

    // //   const id = this.labelListOfControl.length > 0 ? this.labelListOfControl[this.labelListOfControl.length - 1].id + 1 : 0;

    // //   const control = {
    // //    id,
    // //    value: `value${id}`,
    // //    key: `key${id}`,

    // //  };
    // //   const index = this.labelListOfControl.push(control);
    // //  this.labelForm.addControl(this.labelListOfControl[index - 1].key, new FormControl(null, Validators.required));
    // //  this.labelForm.addControl(this.labelListOfControl[index - 1].value, new FormControl(''));
    // // }
    // // else if(type=='url')
    // // {
    // //   if(json["fetch"]==undefined)
    // //   {
    // //     json["fetch"]=[];
    // //     this.description= JSON.stringify(json,undefined,4);
    // //   }
    // //   const id = this.urlListOfControl.length > 0 ? this.urlListOfControl[this.urlListOfControl.length - 1].id + 1 : 0;
    // //   console.log(id)
    // //   const control = {
    // //    id,
    // //    value: `value${id}`,

    // //  };
    // //   const index = this.urlListOfControl.push(control);
    // //  this.urlForm.addControl(this.urlListOfControl[index - 1].value, new FormControl(null, Validators.required));

    // //}
  }

  saveENV(): void {
    var me = this;

    me.validENV = {};
    let baseFormObj: any = me.environmentForm.value;

    for (var i = 0; i < me.environmentListOfControl.length; i++) {
      me.validENV[baseFormObj[me.environmentListOfControl[i].key]] =
        baseFormObj[me.environmentListOfControl[i].value];
    }

    me.updateENVShort();
    me.isENVPopupsVisible = false;
  }
  saveCRON(event:any): void {
    var me = this;

    me.jobForm.patchValue({ CRON: me.cronData });
    me.isCRONPopupsVisible = false;
  }
  drop(event: CdkDragDrop<string[]>) {
    var me = this;
    me.newNodeX = event.distance.x;
    me.newNodeY = event.distance.y;
    var newNode: Node = {
      id: me.newNodeId.toString(),
      label: "new" + me.newNodeId.toString(),
      position: { x: event.distance.x, y: event.distance.y },
    };
    console.info("-----------x y-----------");
    console.info(me.newNodeX);
    console.info(me.newNodeY);
    console.info("-----------currentIndex -----------");
    console.info(event.currentIndex);
    console.info(event.previousIndex);

    console.info("-----------newNode-----------");
    console.info(newNode);
    //debugger;
    me.digraphNodeData.push(newNode);
    me.newNodeId++;
    //event.distance;
    me.update$.next(true);
    //console.info(event);
    //debugger;
    //moveItemInArray(this.customers, event.previousIndex, event.currentIndex);
  }

  //方法2 这种方式的mouseup是在document上的，似乎会被阻止，不好用
  // onProcedureMoveMouseDown(event: any) {
  //   console.info(event);
  //   var me = this;
  //   me.draggingX = event.clientX;
  //   me.draggingX = event.clientY;
  //   me.isDragging = true;
  // }
  // onProcedureMove(event: any) {
  //   console.info(event);
  //   var me = this;
  //   me.isDragging = true;
  // }

  // //方法2
  // // 监听document移动事件事件
  // @HostListener("document:mousemove", ["$event"]) onMousemove(event) {
  //   // 判断该元素是否被点击了。
  //   var me = this;
  //   if (me.isDragging) {
  //     console.info("mousemove");
  //     console.info(event);
  //     me.draggingX = event.clientX;
  //     me.draggingX = event.clientY;
  //     //   this.totalOffsetX + event.clientX - this.disX + "px";
  //     // this.el.nativeElement.style.top =
  //     //   this.totalOffsetY + event.clientY - this.disY + "px";
  //   }
  // }

  // // 监听document离开事件
  // @HostListener("document:mouseup", ["$event"]) onMouseup(event) {
  //   var me = this;
  //   // 只用当元素移动过了，离开函数体才会触发。
  //   if (this.isDragging) {
  //     console.log("end");
  //     // this.totalOffsetX += event.clientX - this.disX;
  //     // this.totalOffsetY += event.clientY - this.disY;
  //     this.isDragging = false;
  //   }
  // }

  setProcedureImage(imageName: string) {
    var me = this;
    //下拉框
    this.reference
      // .request(
      //   "GET",
      //   "DcosRegistryImage/GetItems",
      //   this.userProvider.getToken(),
      //   null,
      //   false
      // )
      // .httpRequest(
      //   "GET",
      //   //"DcosRegistryImage/GetItemInfo",
      //   "DcosRegistryImage/GetItems",
      //   this.userProvider.getToken(),
      //   // [new KeyValuePair("imageName", imageName)],
      //   null,
      //   null
      // )
      .getImageList()
      .subscribe((response) => {
        //if (response.Success == "True") {
          // //var data = JSON.parse(this.reference.base64Decode(response.Result));
          // var data: any[] = JSON.parse(
          //   this.reference.base64Decode(response.Result)
          // );
          var data: any[]=response;
          //debugger;
          var image = data.find((a) => a == imageName);
          //me.containerImage=[];
          //me.containerImage = data;//不要动态改select组件的内容，因为联动会产生各种问题
          //me.containerImage = [image];
          this.reference
            // .httpRequest(
            //   "POST",
            //   "DcosRegistryImage/GetImageVersions",
            //   this.userProvider.getToken(),
            //   null,
            //   [
            //     {
            //       key: "image",
            //       //value: me.procedureForm.value.containerImageName,
            //       //value: data[0],
            //       value: image,
            //     },
            //   ]
            // )
            .getImageVersionList(image)
            .subscribe((response) => {
              //if (response.Success == "True") {
                // var versionData: any[] = JSON.parse(
                //   this.reference.base64Decode(response.Result)
                // );
                var versionData: any[] = response;
                // me.containerImageVersion = JSON.parse(
                //   this.reference.base64Decode(response.Result)
                // );
                if (versionData.length > 0) {
                  // me.procedureForm.patchValue({
                  //   containerImageName: image,
                  //   containerImageVersion: me.containerImageVersion[0],
                  // });
                  // me.updateContainerImage();

                  me.procedureForm.patchValue({
                    containerImage:
                      //"https://uat-registry.perfect99.com/" +
                      me.imageBaseUrl + "/" + image + ":" + versionData[0],
                  });
                }
              //}
            });

        //}
      });
  }
  //方法3，自封装
  // onProcedureMoveDrop(event: DragEvent) {
  onProcedureMoveDrop(event: PfDropModel) {
    var me = this;
    //debugger;
    console.info("onProcedureMoveDrop");

    me.newNodeX = event.x2;
    me.newNodeY = event.y2;

    me.addProcedure();
    // var dragDom: any = event.target;
    var dragDom: any = event.dragDom;
    console.info(dragDom.attributes["procedureType"]);
    //debugger;
    if (dragDom.attributes["procedureType"] == undefined) {
      return;
    }
    var procedureType = dragDom.attributes["procedureType"].value;

    switch (procedureType) {
      case "java":
        me.setProcedureImage("jdk8-jre");
        break;
      case "spark":
        me.setProcedureImage("spark-client");
        break;
      default:
        break;
    }

    // return;
    // var newNode: Node = {
    //   id: me.newNodeId.toString(),
    //   label: "new" + me.newNodeId.toString(),
    //   position: { x: event.x, y: event.y },
    // };
    // console.info("-----------x y-----------");
    // console.info(me.newNodeX);
    // console.info(me.newNodeY);
    // // console.info("-----------currentIndex -----------");
    // // console.info(event.currentIndex);
    // // console.info(event.previousIndex);

    // console.info("-----------newNode-----------");
    // console.info(newNode);

    // //debugger;
    // me.digraphNodeData.push(newNode);
    // me.newNodeId++;
    // //event.distance;
    // me.update$.next(true);
    // newNode.position.x = event.x;
    // newNode.position.y = event.y;
    // me.update$.next(false);
    // //console.info(event);
    // //debugger;
    // //moveItemInArray(this.customers, event.previousIndex, event.currentIndex);
  }

  isCmdTabValid(): boolean {
    var me = this;
    //debugger;
    return !(
      me.procedureForm.value.cmd == null ||
      me.procedureForm.value.cmd == "" ||
      me.procedureForm.value.fetch == null ||
      me.procedureForm.value.fetch == ""
    );
    // me.procedureForm.value.fetch == null || me.procedureForm.value.fetch == ""
    //   ? me.validColor
    //   : me.invalidColor;
  }
  isCronTabValid(): boolean {
    var me = this;
    return !(
      me.cronData == null ||
      me.cronData == "" ||
      me.cronData == me.emptyCronData
    ); //某些未知原因，组件会自动把cronData更新为"0 0 0 ? * * *"，所以这个值也认为是验证没通过，是没问题的
  }
  isImageTabValid(): boolean {
    var me = this;
    //debugger;
    return !(
      me.procedureForm.value.containerImage == null ||
      me.procedureForm.value.containerImage == ""
    );
    // me.procedureForm.value.fetch == null || me.procedureForm.value.fetch == ""
    //   ? me.validColor
    //   : me.invalidColor;
  }
  // // 监听document移动事件事件
  // @HostListener("document:mousemove", ["$event"]) onMousemove(event) {
  //   // 判断该元素是否被点击了。
  //   if (this.isDragging) {
  //     // this.el.nativeElement.style.left = this.totalOffsetX + event.clientX - this.disX + 'px';
  //     // this.el.nativeElement.style.top = this.totalOffsetY + event.clientY - this.disY + 'px';
  //   }
  // }
}
