import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
// import { ConfigService } from "../../../../core/services/app-config.service";
// import { ReferenceService } from "../../../../core/services/app-reference.service";
import { Observable } from "rxjs";
import { ReferenceService } from './app-reference.service';
import { ConfigService } from './app-config.service';
import { UserProviderService } from './user-provider.service';
import { KeyValuePair } from '../common/pfModel';
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
  constructor(
     protected appConfig: ConfigService,
    protected http: HttpClient,
     private userProvider: UserProviderService
  ) {
    super(appConfig, http);
    //this.userId=this.userProvider.getUserInfo()["UserId"];
  }
  jobCacheKey="jobCacheKey";
  public saveJob(job:any
  ): Observable<boolean> {
    var me = this;
    const observable = new Observable<boolean>((subscriber) => {
      var cacheHistory=me.pfUtil.getLocalStorage(me.jobCacheKey);
      if(cacheHistory==null){
        cacheHistory=[];
      }
      for(var i=0;i<cacheHistory.length;i++){
        var item=cacheHistory[i];
        if(item.JobId==job.JobId){
          cacheHistory.splice(i,1);
          break;
        }
      }
      cacheHistory.push(job);
      me.pfUtil.setLocalStorage(me.jobCacheKey,cacheHistory);
        subscriber.next(true);
    });

    return observable;
  }
  public getTaskList(
    userId: string,
    taskName: string,
    taskId: string,
    pageSize: number,
    pageIndex: number,
    status:number
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
  
  public getImageList(
  ): Observable<string[]> {
    var me = this;
    const observable = new Observable<string[]>((subscriber) => {
      var data: string[] = ["jdk8-jre","spark-client"];
      subscriber.next(data);
    });

    return observable;
  }
  public getImageVersionList(image:string
  ): Observable<string[]> {
    var me = this;
    const observable = new Observable<string[]>((subscriber) => {
      var data: KeyValuePair[] = [new KeyValuePair("jdk8-jre",["1.8","1.9"]),new KeyValuePair("spark-client",["3.2","3.3"])];
      var item=data.find(a=>a.key==image);
      if(item!=null){

        subscriber.next(item.value);
      }
    });

    return observable;
  }
}
