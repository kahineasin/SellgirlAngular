import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
// import { ConfigService } from "../../../../core/services/app-config.service";
// import { ReferenceService } from "../../../../core/services/app-reference.service";
import { Observable } from "rxjs";
import { ReferenceService } from './app-reference.service';
import { ConfigService } from './app-config.service';
import { UserProviderService } from './user-provider.service';
import { KeyValuePair } from '../common/pfModel';
import { JobFile } from "../job-model/job-model";
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
  jobCacheKey="jobCacheKey";
  fileCacheKey="fileCacheKey";
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
  public getJob(jobId: string): Observable<any> {
    var me = this;
    const observable = new Observable<TaskModel>((subscriber) => {
      var cacheHistory=me.pfUtil.getLocalStorage(me.jobCacheKey);
      if(cacheHistory==null){
        //return null;
      }else{
        for(var i=0;i<cacheHistory.length;i++){
          var item=cacheHistory[i];
          if(item.JobId==jobId){
            subscriber.next(item);
          }
        }
      }
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
  
  public getFileList(id:string
    ): Observable<JobFile[]> {
      var me = this;
      const observable = new Observable<JobFile[]>((subscriber) => {
        var fileList:JobFile[]=me.pfUtil.getLocalStorage(me.fileCacheKey);
        subscriber.next(fileList.filter(a=>a.Id==id));
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
    public saveFile(id:string,filePath:string,name:string,domfile:any
      ): Observable<string> {
        var me = this;
        const observable = new Observable<string>((subscriber) => {
          //debugger;
          
        // formData.append("file", item.file as any);
        // formData.append("filePath", "xschedulerjob");
        //debugger;
        var pathArr=me.pfUtil.splitPath(domfile.name);
        var d = new Date();
        //debugger;
        var ds=""+d.getFullYear()+me.pfUtil.padZeroLeft(d.getMonth()+1,2)+
        me.pfUtil.padZeroLeft(d.getDate(),2)+
        me.pfUtil.padZeroLeft(d.getHours(),2)+
        me.pfUtil.padZeroLeft(d.getMinutes(),2)+me.pfUtil.padZeroLeft(d.getMinutes(),2);
        var fileName="xschedulerjob/"+pathArr[1]+ds+pathArr[2];
        var file:JobFile={
          FileId:"",
          Id:id,
          Name:name,
          Url:fileName
        };

          var cacheHistory:JobFile[]=me.pfUtil.getLocalStorage(me.fileCacheKey);
          if(cacheHistory==null){
            cacheHistory=[];
          }
          for(var i=0;i<cacheHistory.length;i++){
            var item=cacheHistory[i];
            if(item.Url==file.Url){
              cacheHistory.splice(i,1);
              break;
            }
          }
          cacheHistory.push(file);
          me.pfUtil.setLocalStorage(me.fileCacheKey,cacheHistory);
            subscriber.next(fileName);
        });
    
        return observable;
      }
      public isSvgIcon(procedureType: string): boolean {
        return ["APP_JAVA"].indexOf(procedureType) < 0;
      }
      public getProcedureIconImage(procedureType: string): boolean {
        var img = {
          APP_JAVA: "assets/img/job-digraph/java.png",
        };
        return img[procedureType];
      }
}
