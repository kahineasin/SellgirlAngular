/**
 * 注意,此service改为了local方法,所以不要全复盖,1个1个方法加过来吧
 */
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
// import { ConfigService } from "../../../../core/services/app-config.service";
// import { ReferenceService } from "../../../../core/services/app-reference.service";
import { Observable } from "rxjs";
import {
  NetworkServiceResponse,
  PageResult,
  ReferenceService,
} from "./app-reference.service";
import { ConfigService } from "./app-config.service";
import { UserProviderService } from "./user-provider.service";
import { KeyValuePair } from "../common/pfModel";
import {
  ImageDocker,
  JobFile,
  ProcedureModel,
  RegistryImage,
} from "../model/job-model";
import { Guid } from "guid-typescript";
import {
  DatabaseModel,
  DatabaseModelClass,
  DataColumnModel,
  DataColumnUIModel,
  Datamodel,
  DatamodelGroupModel,
  DatamodelQuery,
  DatamodelQueryUIModel,
  DataTableModel,
  DataTableUIModel,
} from "../model/data-integration";
import { map } from "rxjs/operators";
import {
  databaseLocal,
  datamodelGroupLocal,
  datamodelLocal,
} from "./computes-local-test-data";
import { datatableLocal } from "./local-test-data/datatable-data";
import { datacolumnLocal } from "./local-test-data/datacolumn-data";
import { dataModelQueryLocal } from "./local-test-data/datamodelquery-data";
// import { UserProviderService } from "../../../../core/services/user-provider.service";
// import { KeyValuePair } from "../../../../core/common/pfModel";

export interface TaskModel {
  TaskId: string;
  JobId: string;
  TaskName: string;
  Configure: string;
  Dependencies: string;
  Status: number;
  Time: string;
  UserId: string;
  Del: string;
  UpdateTime: string;
  PageSize: number;
  PageIndex: number;
}

@Injectable({ providedIn: "root" })
export class ComputesReferenceService extends ReferenceService {
  //userId="";
  public normalColor: string = "#000000";
  public finishedColor: string = "#1890ff";
  public errorColor: string = "red";
  public validColor = "#1890ff";
  public invalidColor = "red";
  constructor(
    protected appConfig: ConfigService,
    protected http: HttpClient,
    private userProvider: UserProviderService
  ) {
    super(appConfig, http);
    //this.userId=this.userProvider.getUserInfo()["UserId"];
  }
  jobCacheKey = "jobCacheKey";
  fileCacheKey = "fileCacheKey";
  public saveJob(job: any): Observable<boolean> {
    var me = this;
    const observable = new Observable<boolean>((subscriber) => {
      var cacheHistory = me.pfUtil.getLocalStorage(me.jobCacheKey);
      if (cacheHistory == null) {
        cacheHistory = [];
      }
      for (var i = 0; i < cacheHistory.length; i++) {
        var item = cacheHistory[i];
        if (item.JobId == job.JobId) {
          cacheHistory.splice(i, 1);
          break;
        }
      }
      cacheHistory.push(job);
      me.pfUtil.setLocalStorage(me.jobCacheKey, cacheHistory);
      subscriber.next(true);
    });

    return observable;
  }
  public getJob(jobId: string): Observable<any> {
    var me = this;
    const observable = new Observable<TaskModel>((subscriber) => {
      var cacheHistory = me.pfUtil.getLocalStorage(me.jobCacheKey);
      if (cacheHistory == null) {
        //return null;
      } else {
        for (var i = 0; i < cacheHistory.length; i++) {
          var item = cacheHistory[i];
          if (item.JobId == jobId) {
            subscriber.next(item);
          }
        }
      }
    });

    return observable;
  }
  public getJobPageList(
    userId: string,
    JobName: string,
    JobId: string,
    pageSize: number,
    pageIndex: number
  ): Observable<PageResult<any>> {
    var me = this;
    return me.httpResult<any>(
      "POST",
      "XSchedulerJob/GetRecords",
      this.userProvider.getToken(),
      null,
      {
        UserId: userId,
        JobName: JobName,
        JobId: !JobId.match(/^[ ]*$/) ? JobId : Guid.EMPTY, //00000000-0000-0000-0000-000000000000
        PageSize: pageSize,
        PageIndex: pageIndex,
      }
    );
  }
  public getTaskList(
    userId: string,
    taskName: string,
    taskId: string,
    pageSize: number,
    pageIndex: number,
    status: number
  ): Observable<TaskModel[]> {
    var me = this;
    const observable = new Observable<TaskModel[]>((subscriber) => {
      me.request(
        "POST",
        "XSchedulerTask/GetRecords",
        me.userProvider.getToken(),

        JSON.stringify({
          UserId: userId,
          TaskName: taskName,
          TaskId: taskId,
          PageSize: pageSize,
          PageIndex: pageIndex,
          Status: status,
        }),

        true
      ).subscribe((response) => {
        if (response.Success == "True" && response.Result != null) {
          var data: TaskModel[] = JSON.parse(me.base64Decode(response.Result));
          subscriber.next(data);
        }
      });
    });

    return observable;
  }
  public getTask(taskId: string): Observable<TaskModel> {
    var me = this;
    const observable = new Observable<TaskModel>((subscriber) => {
      me.httpRequest(
        "GET",
        "XSchedulerTask/GetItemInfo",
        this.userProvider.getToken(),
        [new KeyValuePair("taskId", taskId)],

        true
      ).subscribe((response) => {
        //debugger;
        if (response.Success == "True" && response.Result != null) {
          var data: TaskModel = JSON.parse(me.base64Decode(response.Result));
          subscriber.next(data);
        }
      });
    });

    return observable;
  }

  public getImageList(name: string, type: string): Observable<RegistryImage[]> {
    var me = this;
    const observable = new Observable<RegistryImage[]>((subscriber) => {
      var data: RegistryImage[] = [
        { Name: "jdk8-jre", Type: "APP_JAVA" },
        { Name: "spark-client", Type: "APP_SPARK" },
      ];
      subscriber.next(
        data.filter(
          (a) =>
            (name == "" || name == a.Name) && (type == "" || type == a.Type)
        )
      );
    });

    return observable;
  }
  public getImageVersionList(image: string): Observable<string[]> {
    var me = this;
    const observable = new Observable<string[]>((subscriber) => {
      var data: KeyValuePair[] = [
        new KeyValuePair("jdk8-jre", ["1.8", "1.9"]),
        new KeyValuePair("spark-client", ["3.2", "3.3"]),
      ];
      var item = data.find((a) => a.key == image);
      if (item != null) {
        subscriber.next(item.value);
      }
    });

    return observable;
  }

  public getImageDockerList(
    containerImageName: string
  ): Observable<ImageDocker[]> {
    var me = this;
    // return me.httpResult<ImageDocker[]>(
    //   "POST",
    //   "DcosRegistryImage/GetDockerList",
    //   this.userProvider.getToken(),
    //   null,
    //   [{ key: "dockerName", value: containerImageName }]
    // );
    const observable = new Observable<ImageDocker[]>((subscriber) => {
      // var data: KeyValuePair[] = [new KeyValuePair("jdk8-jre",["1.8","1.9"]),new KeyValuePair("spark-client",["3.2","3.3"])];
      // var item=data.find(a=>a.key==image);
      // if(item!=null){

      //   subscriber.next(item.value);
      // }

      var data: ImageDocker[] = [
        { dockerName: "jdk8-jre", tag: "1.8" },
        { dockerName: "jdk8-jre", tag: "1.9" },
        { dockerName: "spark-client", tag: "3.2" },
        { dockerName: "spark-client", tag: "3.3" },
      ];
      subscriber.next(
        data.filter(
          (a) => containerImageName == "" || containerImageName == a.dockerName
        )
      );
    });

    return observable;
  }

  public getFileList(id: string): Observable<JobFile[]> {
    var me = this;
    const observable = new Observable<JobFile[]>((subscriber) => {
      var fileList: JobFile[] = me.pfUtil.getLocalStorage(me.fileCacheKey);
      subscriber.next(fileList.filter((a) => a.Id == id));
    });

    return observable;
  }

  // public saveFile(job:JobFile
  //   ): Observable<string> {
  //     var me = this;
  //     const observable = new Observable<boolean>((subscriber) => {
  //       debugger;
  //       var cacheHistory:JobFile[]=me.pfUtil.getLocalStorage(me.fileCacheKey);
  //       if(cacheHistory==null){
  //         cacheHistory=[];
  //       }
  //       for(var i=0;i<cacheHistory.length;i++){
  //         var item=cacheHistory[i];
  //         if(item.Url==job.Url){
  //           cacheHistory.splice(i,1);
  //           break;
  //         }
  //       }
  //       cacheHistory.push(job);
  //       me.pfUtil.setLocalStorage(me.fileCacheKey,cacheHistory);
  //         subscriber.next(true);
  //     });

  //     return observable;
  //   }
  public saveFile(
    id: string,
    filePath: string,
    name: string,
    domfile: any
  ): Observable<string> {
    var me = this;
    const observable = new Observable<string>((subscriber) => {
      //debugger;

      // formData.append("file", item.file as any);
      // formData.append("filePath", "xschedulerjob");
      //debugger;
      var pathArr = me.pfUtil.splitPath(domfile.name);
      var d = new Date();
      //debugger;
      var ds =
        "" +
        d.getFullYear() +
        me.pfUtil.padZeroLeft(d.getMonth() + 1, 2) +
        me.pfUtil.padZeroLeft(d.getDate(), 2) +
        me.pfUtil.padZeroLeft(d.getHours(), 2) +
        me.pfUtil.padZeroLeft(d.getMinutes(), 2) +
        me.pfUtil.padZeroLeft(d.getMinutes(), 2);
      var fileName = "xschedulerjob/" + pathArr[1] + ds + pathArr[2];
      var file: JobFile = {
        FileId: "",
        Id: id,
        Name: name,
        Url: fileName,
      };

      var cacheHistory: JobFile[] = me.pfUtil.getLocalStorage(me.fileCacheKey);
      if (cacheHistory == null) {
        cacheHistory = [];
      }
      for (var i = 0; i < cacheHistory.length; i++) {
        var item = cacheHistory[i];
        if (item.Url == file.Url) {
          cacheHistory.splice(i, 1);
          break;
        }
      }
      cacheHistory.push(file);
      me.pfUtil.setLocalStorage(me.fileCacheKey, cacheHistory);
      subscriber.next(fileName);
    });

    return observable;
  }
  public getProcedureModelByConfig(configI: any): ProcedureModel {
    const me = this;
    let r: ProcedureModel = {
      isAdd: false,
      procedureId: configI.procedureId,
      procedureName: configI.procedureName,
      status: configI.status,
      from: configI.from,
      to: configI.to,
      env: configI.scheduler.env ?? {},
      containerImage: configI.scheduler.container.docker.image,
      cmd: configI.scheduler.cmd,
      fetch:
        configI.scheduler.fetch instanceof Array ? configI.scheduler.fetch : [],
      maxLaunchDelay: configI.maxLaunchDelay,
      retry: configI.retry,
      retryInterval: configI.retryInterval,
      //executor: configI.executor,
      // executorType: me.pfUtil.isAnyNullAction(
      //   configI,
      //   (a) => a.scheduler,
      //   (a) => a.scheduler.executor,
      //   (a) => a.scheduler.executor.type
      // )
      //   ? "DEFAULT"
      //   : configI.scheduler.executor.type,
      //executorType: configI.executorType,
      description: configI.description,

      // slaveId: configI.scheduler.schedule.slaveId,
      // frameworkId: configI.scheduler.schedule.frameworkId,
      // containerId: configI.scheduler.schedule.containerId,
      // taskId: configI.scheduler.schedule.taskId,

      type: configI.type,
    };
    if (
      !me.pfUtil.isAnyNullAction(
        configI,
        (a) => a.scheduler,
        (a) => a.scheduler.schedule
      )
    ) {
      r.slaveId = configI.scheduler.schedule.slaveId;
      r.frameworkId = configI.scheduler.schedule.frameworkId;
      r.containerId = configI.scheduler.schedule.containerId;
      r.taskId = configI.scheduler.schedule.taskId;
      //r.executorId = configI.scheduler.schedule.executorId;
    }
    return r;
  }

  public isSvgIcon(procedureType: string): boolean {
    return ["APP_JAVA"].indexOf(procedureType) < 0;
  }
  public getProcedureIconImage(procedureType: string): boolean {
    var img = {
      //APP_JAVA: 'assets/img/xSchedulerJob/java.png',
      APP_JAVA: "assets/img/job-digraph/java.png",
    };
    return img[procedureType];
  }

  // public scheduleJob(jobId: string): Observable<HttpEvent<{}>> {
  //   const req = new HttpRequest(
  //     "POST",
  //     environment.xSchedulerUrl + "/api/job/schedule/" + jobId,
  //     null,
  //     {
  //       responseType: "text",
  //       reportProgress: true,
  //     }
  //   );
  //   var me = this;
  //   return me.http.request(req);
  // }

  public scheduleJob(jobId: string): Observable<NetworkServiceResponse> {
    const me = this;
    return me.httpRequest(
      "GET",
      "XSchedulerJob/Schedule",
      this.userProvider.getToken(),
      [new KeyValuePair("jobId", jobId)],
      null
    );
  }

  /**
   * 查询一条ReportCard数据
   * @deprecated
   */
  public getReportCard(id: string): Observable<TaskModel> {
    var me = this;
    // return me.httpResult<TaskModel>(
    //   "GET",
    //   "ReportCard/GetRecord",
    //   this.userProvider.getToken(),
    //   [new KeyValuePair("id", id)],
    //   null
    // );
    return me.getTask(id);
  }

  public getDatabase(shortId: number): Observable<DatabaseModelClass> {
    const me = this;
    // const observable = me.httpResult<DatabaseModelClass>(
    //   'POST',
    //   'DataSource/GetItemInfoByShortId',
    //   this.userProvider.getToken(),
    //   null,
    //   [new KeyValuePair('shortId', shortId)]
    // );
    // // const observable = me.getDatabasePageList(0, 0).pipe(
    // //   map((v) => {
    // //     // let newV: PageResult<DatabaseModelClass[]> = {
    // //     //   DataSource: v.DataSource.map((a) => new DatabaseModelClass(a)),
    // //     //   RecordCount: v.RecordCount,
    // //     // };
    // //     let r = v.DataSource.find((a) => databaseId === a.ShortId);
    // //     return r;
    // //   })
    // // );
    // return observable;
    const observable = new Observable<DatabaseModelClass>((subscriber) => {
      var data: DatabaseModelClass = databaseLocal.find(
        (a) => a.ShortId === shortId
      );
      subscriber.next(data);
    });
    return observable;
  }
  public getDatabaseByUUID(guid: string): Observable<DatabaseModelClass> {
    const me = this;
    const observable = me.httpResult<DatabaseModelClass>(
      "POST",
      "DataSource/GetItemInfo",
      this.userProvider.getToken(),
      null,
      [new KeyValuePair("dataSourceId", guid)]
    );
    return observable;
  }

  public getDatabasePageList(
    pageSize: number = 0,
    pageIndex: number = 0
  ): Observable<PageResult<DatabaseModelClass[]>> {
    const me = this;
    //debugger;
    // return me
    //   .httpResult<PageResult<DatabaseModel[]>>(
    //     'POST',
    //     'DataSource/GetItems',
    //     this.userProvider.getToken(),
    //     null,
    //     [
    //       new KeyValuePair('userId', me.userProvider.getUserInfo().UserId),
    //       new KeyValuePair('roleId', me.userProvider.getUserInfo().RoleId),
    //       new KeyValuePair('pageSize', pageSize),
    //       new KeyValuePair('pageIndex', pageIndex),
    //     ]
    //   )
    //   .pipe(
    //     map((v) => {
    //       let newV: PageResult<DatabaseModelClass[]> = {
    //         DataSource: v.DataSource.map((a) => new DatabaseModelClass(a)),
    //         RecordCount: v.RecordCount,
    //       };
    //       return newV;
    //     })
    //   );
    const observable = new Observable<PageResult<DatabaseModelClass[]>>(
      (subscriber) => {
        //var data: DatabaseModelClass[] = datamodelGroupLocal;
        let data: PageResult<DatabaseModelClass[]> = {
          DataSource: databaseLocal,
          RecordCount: databaseLocal.length,
        };
        subscriber.next(data);
      }
    );
    return observable;
  }
  // public getDataTableList(
  //   dbType,
  //   ip,
  //   port,
  //   user,
  //   pwd,
  //   database
  // ): Observable<any> {
  //   const me = this;
  //   return me.httpResult<any>(
  //     "POST",
  //     "DataSource/GetTableList",--这个是查实时的数据库结构
  //     this.userProvider.getToken(),
  //     null,
  //     [
  //       { key: "dbType", value: dbType },
  //       { key: "ip", value: ip },
  //       { key: "port", value: port },
  //       { key: "user", value: user },
  //       {
  //         key: "pwd",
  //         value: pwd,
  //       },
  //       { key: "database", value: database },
  //     ]
  //   );
  // }

  private doGetDataTableList(
    databaseShortId?: number,
    //string userId, string roleId,
    pageSize: number = 0,
    pageIndex: number = 0
  ): Observable<PageResult<DataTableUIModel[]>> {
    const me = this;
    //debugger;
    // return me
    //   .httpResult<PageResult<DataTableModel[]>>(
    //     'POST',
    //     'DataMetabase/GetTableBySourceShortId',
    //     this.userProvider.getToken(),
    //     null,
    //     [
    //       new KeyValuePair('sourceShortId', databaseShortId),
    //       new KeyValuePair('userId', me.userProvider.getUserInfo().UserId),
    //       new KeyValuePair('roleId', me.userProvider.getUserInfo().RoleId),
    //       new KeyValuePair('pageSize', pageSize),
    //       new KeyValuePair('pageIndex', pageIndex),
    //     ]
    //   )
    //   .pipe(
    //     map((v) => {
    //       let r: PageResult<DataTableUIModel[]> = {
    //         DataSource: v.DataSource.map((a) => new DataTableUIModel(a)),
    //         RecordCount: v.RecordCount,
    //       };
    //       return r;
    //     })
    //   );
    const observable = new Observable<PageResult<DataTableUIModel[]>>(
      (subscriber) => {
        //var data: DatabaseModelClass[] = datamodelGroupLocal;
        //debugger;
        let data: PageResult<DataTableUIModel[]> = {
          DataSource: datatableLocal
            //.filter((a) => a.ShortId === databaseShortId)
            .filter((a) => a.SourceShortId === databaseShortId)

            .map((a) => new DataTableUIModel(a)),
          RecordCount: 8,
        };
        subscriber.next(data);
      }
    );
    return observable;
  }
  public getDataTableList(
    databaseShortId: number,
    pageSize: number = 0,
    pageIndex: number = 0
  ): Observable<PageResult<DataTableUIModel[]>> {
    const me = this;
    const observable = new Observable<PageResult<DataTableUIModel[]>>(
      (subscriber) => {
        me.doGetDataTableList(databaseShortId, pageSize, pageIndex).subscribe(
          (response) => {
            // response.DataSource = response.DataSource.map(
            //   (a) => new DataTableUIModel(a)
            // );
            subscriber.next(response);
          },
          (error) => subscriber.error(error)
        );
      }
    );
    return observable;
  }
  public getDataTable(
    databaseShortId: number,
    tableId: number
  ): Observable<DataTableModel> {
    const me = this;
    const observable = new Observable<DataTableModel>((subscriber) => {
      me.getDataTableList(databaseShortId, 1, 0).subscribe(
        (response) => {
          subscriber.next(
            response.DataSource.find((a) => tableId == a.ShortId)
          );
        },
        (error) => subscriber.error(error)
      );
    });
    return observable;
  }
  private doGetDataColumnPageList(
    tableId: number,
    pageSize: number = 0,
    pageIndex: number = 0
  ): Observable<PageResult<DataColumnUIModel[]>> {
    const me = this;
    // return me.httpResult<PageResult<DataColumnModel[]>>(
    //   'POST',
    //   'DataMetabase/GetTableColumnsByTableShortId',
    //   this.userProvider.getToken(),
    //   null,
    //   [
    //     new KeyValuePair('tableShortId', tableId),
    //     // new KeyValuePair("userId", me.userProvider.getUserInfo().UserId),
    //     // new KeyValuePair("roleId", me.userProvider.getUserInfo().RoleId),
    //     new KeyValuePair('pageSize', pageSize),
    //     new KeyValuePair('pageIndex', pageIndex),
    //   ]
    // );
    const observable = new Observable<PageResult<DataColumnUIModel[]>>(
      (subscriber) => {
        //var data: DatabaseModelClass[] = datamodelGroupLocal;
        let data: PageResult<DataColumnUIModel[]> = {
          DataSource: datacolumnLocal.filter((a) => a.TableShortId === tableId),
          RecordCount: datacolumnLocal.length,
        };
        subscriber.next(data);
      }
    );
    return observable;
  }
  public getDataColumnPageList(
    tableId: number,
    pageSize: number = 0,
    pageIndex: number = 0
  ): Observable<PageResult<DataColumnUIModel[]>> {
    const me = this;
    const observable = new Observable<PageResult<DataColumnUIModel[]>>(
      (subscriber) => {
        this.doGetDataColumnPageList(tableId, pageSize, pageIndex).subscribe(
          (response) => {
            response.DataSource = response.DataSource.map(
              (a) => new DataColumnUIModel(a)
            );
            subscriber.next(response);
          },
          (err) => subscriber.next(err)
        );
      }
    );
    return observable;
  }
  /**
   *
   * @param tableId @deprecated 现在后台是分页的,所以不用此方法
   * @returns
   */
  public getDataColumnList(tableId: string): Observable<DataColumnModel[]> {
    const me = this;
    return me.httpResult<DataColumnModel[]>(
      "POST",
      "DataMetabase/GetTableColumnsByMetaShortId",
      this.userProvider.getToken(),
      null,
      [
        new KeyValuePair("metaShortId", tableId),
        new KeyValuePair("pageSize", 0),
        new KeyValuePair("pageIndex", 0),
      ]
    );
  }
  /**
   *
   * @param tableId @deprecated 好像不需要查一列的信息
   * @param columnId
   * @returns
   */
  public getDataColumn(
    tableId: number,
    columnId: number
  ): Observable<DataColumnModel> {
    const me = this;
    const observable = new Observable<DataColumnModel>((subscriber) => {
      me.getDataColumnPageList(tableId, 1, 0).subscribe(
        (response) => {
          subscriber.next(
            response.DataSource.find((a) => columnId == a.ShortId)
          );
        },
        (error) => subscriber.error(error)
      );
    });
    return observable;
  }

  public getDatamodelPageList(
    userId: string,
    datamodelName: string,
    datamodelId: string,
    pageSize: number = 0,
    pageIndex: number = 0
  ): Observable<Datamodel[]> {
    var me = this;
    // return me.httpResult<any>(
    //   "POST",
    //   "ReportCard/GetRecords",
    //   this.userProvider.getToken(),
    //   null,
    //   {
    //     UserId: userId,
    //     PageSize: pageSize,
    //     PageIndex: pageIndex,
    //   }
    // );

    // //未有后端,暂时测试
    // return me.getJobList(userId, CardName, CardId, pageSize, pageIndex);

    const observable = new Observable<Datamodel[]>((subscriber) => {
      var data: Datamodel[] = datamodelLocal;
      subscriber.next(data);
    });
    return observable;
  }

  /**
   * 查询一条ReportCard数据
   */
  public getDatamodel(id: string): Observable<TaskModel> {
    var me = this;
    // return me.httpResult<TaskModel>(
    //   "GET",
    //   "ReportCard/GetRecord",
    //   this.userProvider.getToken(),
    //   [new KeyValuePair("id", id)],
    //   null
    // );
    return me.getTask(id);
  }

  /**
   * @param userId
   * @param CardName
   * @param CardId
   * @param pageSize
   * @param pageIndex
   * @returns
   */
  public getDatamodelQueryPageList(
    userId: String,
    roleId: String,
    groupUUID: String,
    searchKey: String,
    pageSize: Number,
    pageIndex: Number,
    enable: boolean
  ): Observable<PageResult<DatamodelQueryUIModel[]>> {
    var me = this;
    // return me
    //   .httpResult<PageResult<DatamodelQuery[]>>(
    //     "POST",
    //     "DataModel/GetItems",
    //     this.userProvider.getToken(),
    //     null,
    //     [
    //       { key: "pageSize", value: pageSize },
    //       { key: "pageIndex", value: pageIndex },
    //       { key: "userId", value: userId },
    //       { key: "roleId", value: roleId },
    //       { key: "groupId", value: groupId },
    //       { key: "searchKey", value: searchKey },
    //       { key: "enable", value: enable },
    //     ]
    //   )
    //   .pipe(
    //     map((v) => {
    //       //debugger;
    //       v.DataSource = v.DataSource.map((a) => {
    //         let r = new DatamodelQueryUIModel(a);
    //         try {
    //           r.query = JSON.parse(me.base64Decode(a.QueryConfig));
    //         } catch (e) {
    //           // debugger;
    //           console.info(e);
    //         }
    //         return r;
    //       });
    //       return v as any;
    //     })
    //   );

    const observable = new Observable<PageResult<DatamodelQueryUIModel[]>>(
      (subscriber) => {
        //var data: DatabaseModelClass[] = datamodelGroupLocal;
        let list = dataModelQueryLocal.filter((a) => a.GroupId === groupUUID);
        let data: PageResult<DatamodelQueryUIModel[]> = {
          DataSource: list.map((a) => {
            let r = new DatamodelQueryUIModel(a);
            try {
              r.query = JSON.parse(me.base64Decode(a.QueryConfig));
            } catch (e) {
              // debugger;
              console.info(e);
            }
            return r;
          }),
          RecordCount: list.length,
        };
        subscriber.next(data);
      }
    );
    return observable;
  }

  public getDatamodelQueryByUUID(uuid: String): Observable<DatamodelQuery> {
    var me = this;
    return me
      .httpResult<DatamodelQuery>(
        "POST",
        "DataMdoel/GetItemInfo",
        this.userProvider.getToken(),
        null,
        [{ key: "Id", value: uuid }]
      )
      .pipe(
        map((v) => {
          let r: DatamodelQueryUIModel = new DatamodelQueryUIModel(v);
          //这里也许应该把query序列化先--benjamin todo
          return r;
        })
      );
  }
  public getDatamodelQuery(shortId: number): Observable<DatamodelQueryUIModel> {
    var me = this;
    // return me
    //   .httpResult<DatamodelQuery>(
    //     "POST",
    //     "DataModel/GetItemInfoByShortId",
    //     this.userProvider.getToken(),
    //     null,
    //     [{ key: "shortId", value: shortId }]
    //   )
    //   .pipe(
    //     map((v) => {
    //       let r: DatamodelQueryUIModel = new DatamodelQueryUIModel(v);
    //       //这里也许应该把query序列化先--benjamin
    //       r.query = JSON.parse(me.base64Decode(r.QueryConfig));
    //       return r;
    //     })
    //   );

    const observable = new Observable<DatamodelQueryUIModel>((subscriber) => {
      var data: DatamodelQuery = dataModelQueryLocal.find(
        (a) => shortId === a.DatamodelQueryId
      );
      subscriber.next(new DatamodelQueryUIModel(data));
    });
    return observable;
  }
  public updateDatamodelQuery(
    query: DatamodelQuery,
    isAdd: boolean
  ): Observable<NetworkServiceResponse> {
    var me = this;
    return me.httpRequest(
      "POST",
      isAdd ? "DataMdoel/Insert" : "DataMdoel/Update",
      this.userProvider.getToken(),
      null,
      JSON.stringify(query)
    );
  }
  public getDatamodelGroup(
    groupType: Number,
    pageSize: number = 0,
    pageIndex: number = 0
  ): Observable<any[]> {
    var me = this;
    const observable = new Observable<any[]>((subscriber) => {
      var data: any[] = datamodelGroupLocal;
      subscriber.next(data);
    });
    return observable;
  }

  getDatamodelGroupPageList(
    groupType: Number,
    userId: String,
    roleId: String,
    //searchKey: String,,
    //enable: boolean
    pageSize: Number,
    pageIndex: Number
  ): Observable<PageResult<DatamodelGroupModel[]>> {
    // return this.httpResult<PageResult<DatamodelGroupModel[]>>(
    //   "POST",
    //   "DataModelGroup/GetItems",
    //   this.userProvider.getToken(),
    //   null,
    //   [
    //     { key: "pageSize", value: pageSize },
    //     { key: "pageIndex", value: pageIndex },
    //     { key: "userId", value: userId },
    //     { key: "roleId", value: roleId },
    //     { key: "groupType", value: groupType },
    //   ]
    // );

    const observable = new Observable<PageResult<DatamodelGroupModel[]>>(
      (subscriber) => {
        //var data: DatabaseModelClass[] = datamodelGroupLocal;
        let data: PageResult<DatamodelGroupModel[]> = {
          DataSource: datamodelGroupLocal,
          RecordCount: datamodelGroupLocal.length,
        };
        subscriber.next(data);
      }
    );
    return observable;
  }

  public getTableListByMetabaseShortId(
    metabaseShortId: number
  ): Observable<PageResult<any>> {
    const me = this;
    const observable = me.httpResult<PageResult<any>>(
      "POST",
      "DataMetabase/GetTableListByMetabaseShortId",
      this.userProvider.getToken(),
      null,
      [new KeyValuePair("metabaseShortId", metabaseShortId)]
    );
    return observable;
  }

  public getTableColsFromMetabaseColumn(tableShortId: number): Observable<any> {
    const me = this;
    const observable = me.httpResult<any>(
      "POST",
      "DataMetabase/GetTableColumns",
      this.userProvider.getToken(),
      null,
      [
        new KeyValuePair("tableShortId", tableShortId),
        new KeyValuePair("pageSize", 0),
        new KeyValuePair("pageIndex", 0),
      ]
    );
    return observable;
  }

  public getDataMetabaseInfo(
    metabaseId: string,
    tableShortId: number
  ): Observable<any> {
    const me = this;
    const observable = me.httpResult<any>(
      "POST",
      "DataMetabase/GetItemInfo",
      this.userProvider.getToken(),
      null,
      [
        new KeyValuePair("metabaseId", metabaseId),
        new KeyValuePair("tableShortId", tableShortId),
      ]
    );
    return observable;
  }

  //阿亮加的重复方法
  // public getSourceList(
  //   userId: string,
  //   roleId: string,
  //   pageSize: string,
  //   pageIndex: string
  // ): Observable<PageResult<any>> {
  //   const me = this;
  //   const observable = me.httpResult<PageResult<any>>(
  //     'POST',
  //     'DataSource/GetItems',
  //     this.userProvider.getToken(),
  //     null,
  //     [
  //       new KeyValuePair('userId', userId),
  //       new KeyValuePair('roleId', roleId),
  //       new KeyValuePair('pageSize', pageSize),
  //       new KeyValuePair('pageIndex', pageIndex),
  //     ]
  //   );
  //   return observable;
  // }

  public getTableList(
    dbType: string,
    ip: string,
    port: string,
    user: string,
    pwd: string,
    database: string
  ): Observable<any> {
    const me = this;
    const observable = me.httpResult<any>(
      "POST",
      "DataSource/GetTableList",
      this.userProvider.getToken(),
      null,
      [
        new KeyValuePair("dbType", dbType),
        new KeyValuePair("ip", ip),
        new KeyValuePair("port", port),
        new KeyValuePair("user", user),
        new KeyValuePair("pwd", pwd),
        new KeyValuePair("database", database),
      ]
    );
    return observable;
  }

  public updateMetabaseTable(
    data: any,
    isAdd: boolean
  ): Observable<NetworkServiceResponse> {
    const me = this;
    const observable = me.httpResult<any>(
      "POST",
      isAdd
        ? "DataMetabase/InsertMetabaseTable"
        : "DataMetabase/UpdateMetabaseTable",
      this.userProvider.getToken(),
      null,
      JSON.stringify(data)
    );
    return observable;
  }
}
