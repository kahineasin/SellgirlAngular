import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
// import { ConfigService } from "../../../../core/services/app-config.service";
import { ConfigService } from './app-config.service';
import { PageResult, ReferenceService } from '../service/app-reference.service';
import { UserProviderService } from '../service/user-provider.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { KeyValuePair } from '../common/pfModel';

export interface mesosLog {
  logUrl: string;
  data: string;
}
export interface mesosSandBox {
  gid: string;
  mode: string;
  mtime: string;
  //nlink: number;
  path: string;
  size: number;
  uid: string;
  name: string;
  sizeInfo: string;
}
export class mesosSandBoxUIModel implements mesosSandBox {
  gid: string = '';
  mode: string = '';
  mtime: string = '';
  //nlink: number = 0;
  path: string = '';
  size: number = 0;
  uid: string = '';
  name: string = '';
  sizeInfo: string = '';
  constructor(m: any) {
    const me = this;
    me.gid = m.gid;
    me.mode = m.mode;
    me.mtime = m.mtime;
    //me.nlink = m.nlink;
    me.path = m.path;
    me.size = parseInt(m.size);
    me.uid = m.uid;
    me.name = m.name;
    me.sizeInfo = m.sizeInfo;
  }
}
export interface RegistryImage {
  Name: string;
  Type: string; //如APP_JAVA
}

export interface ImageDocker {
  dockerName: string;
  tag: string;
  eTag: string;
  size: string;
  time: string;
}
@Injectable({ providedIn: 'root' })
export class DcosReferenceService extends ReferenceService {
  constructor(
    protected appConfig: ConfigService,
    protected http: HttpClient,
    private userProvider: UserProviderService
  ) {
    super(appConfig, http);
  }
  public getTaskList(schedulerId: string): Observable<any[]> {
    var me = this;

    return me.httpResult(
      'POST',
      'DcosService/GetTaskList',
      me.userProvider.getToken(),
      null,
      [{ key: 'id', value: schedulerId }]
    );
  }
  public getTaskInfo(taskId: string): Observable<any> {
    var me = this;

    return me.httpResult<any>(
      'POST',
      'DcosService/GetTaskInfo',
      this.userProvider.getToken(),
      null,
      [{ key: 'taskId', value: taskId }]
    );
  }
  /**
   *现在的日志接口有些问题，txt读的是第一页最旧的内容
   * @param agent_id
   * @param framework_id
   * @param container_id
   * @param taskId
   * @param logType stdout/stderr
   */
  public getLog(
    agent_id: string,
    framework_id: string,
    executor_id: string,
    container_id: string,
    taskId: string,
    logType: string,
    offset?: number,
    length?: number
  ): Observable<mesosLog> {
    const me = this;
    if (me.pfUtil.isAnyNull(offset)) {
      offset = 0;
    }
    if (me.pfUtil.isAnyNull(length)) {
      length = 50000;
    }
    // const me = this;
    //需要和云平台比对时可以考虑输出这个
    // let path =
    //   "/var/lib/mesos/slave/slaves/{agent_id}/frameworks/{framework_id}/executors/{executor_id}/runs/{container_id}/"
    //     .replace("{agent_id}", agent_id)
    //     .replace("{framework_id}", framework_id)
    //     .replace("{executor_id}", executor_id)
    //     .replace("{container_id}", container_id);
    // console.info(path);
    return this.httpResult<mesosLog>(
      'POST',
      'DcosService/GetLog',
      this.userProvider.getToken(),
      null,
      [
        { key: 'agent_id', value: agent_id },
        { key: 'framework_id', value: framework_id },
        { key: 'executor_id', value: executor_id },
        { key: 'container_id', value: container_id },
        { key: 'container_parent_id', value: '' },
        { key: 'taskId', value: taskId },
        { key: 'logType', value: logType },
        { key: 'offset', value: offset },
        { key: 'length', value: length },
      ]
    );
  }

  public getSandBox(
    agent_id: string,
    framework_id: string,
    executor_id: string,
    container_id: string,
    taskId: string,
    path?: string
  ): Observable<mesosSandBoxUIModel[]> {
    const me = this;
    if (me.pfUtil.isAnyNull(path)) {
      path = '';
    }
    // const me = this;
    return this.httpResult<mesosSandBox[]>(
      'POST',
      'DcosService/GetSandBox',
      this.userProvider.getToken(),
      null,
      [
        { key: 'agent_id', value: agent_id },
        { key: 'framework_id', value: framework_id },
        { key: 'executor_id', value: executor_id },
        { key: 'container_id', value: container_id },
        { key: 'container_parent_id', value: '' },
        { key: 'taskId', value: taskId },
        { key: 'path', value: path },
      ]
    ).pipe(
      map((v) => {
        return v.map((a) => new mesosSandBoxUIModel(a));
      })
    );
  }

  // /**
  //  *
  //  * @param agent_id
  //  * @param framework_id
  //  * @param container_id
  //  * @param taskId
  //  * @param logType stdout/stderr
  //  */
  // public getLog(
  //   agent_id,
  //   framework_id,
  //   container_id,
  //   taskId,
  //   logType
  // ): Observable<mesosLog> {
  //   var me = this;
  //   const observable = new Observable<mesosLog>((subscriber) => {
  //     me.httpResult<mesosLog>(
  //       "POST",
  //       "DcosService/GetLog",
  //       me.userProvider.getToken(),
  //       null,
  //       [
  //         { key: "agent_id", value: agent_id },
  //         { key: "framework_id", value: framework_id },
  //         { key: "container_id", value: container_id },
  //         { key: "taskId", value: taskId },
  //         { key: "logType", value: logType },
  //       ]
  //     ).subscribe(
  //       (response) => {
  //         debugger;
  //         const req = new HttpRequest("GET", response.logUrl, null, {
  //           //No 'Access-Control-Allow-Origin' header is present on the requested resource.
  //           // responseType: "text",
  //           responseType: "json",
  //           reportProgress: true,
  //           headers: new HttpHeaders({
  //             "Access-Control-Allow-Origin": "*",
  //           }),
  //           // reportProgress: true
  //         });
  //         //现在的日志接口有些问题，txt读的是第一页最旧的内容,所以再发请求下载完整的
  //         me.http
  //           .request(req)
  //           .pipe(
  //             filter((e) => {
  //               // // var aa=e instanceof HttpResponse;
  //               // ////debugger;
  //               // return e instanceof HttpResponse; //如果不过滤,会有{type:0}的返回,真正成功时是{type:4}
  //               switch (e.type) {
  //                 case HttpEventType.UploadProgress: {
  //                   // me.uploadedPercent = Math.ceil((e.loaded * 100) / e.total);
  //                   // console.info(me.uploadedPercent);
  //                   break;
  //                 }
  //                 case HttpEventType.Response: {
  //                   return true;
  //                   break;
  //                 }
  //               }
  //               return false;
  //             })
  //           )
  //           .subscribe(
  //             (event: HttpEvent<{}>) => {
  //               //debugger;
  //               // this.uploading = false;
  //               // this.fileList = [];
  //               //debugger;
  //               //this.msg.success("上传镜像成功.");
  //               debugger;
  //               const path = (event as HttpResponse<string>).body; //如 xschedulerjob/pfError_20210721_20210812033657.txt
  //             },
  //             (err) => {
  //               subscriber.error("异常");
  //               // //debugger;
  //               // // this.uploading = false;
  //               // me.msg.error("上传失败.");
  //               // me.uploadStatus = "exception";
  //             }
  //           );
  //         subscriber.next(response);
  //       },
  //       (error) => {
  //         subscriber.error(error);
  //       }
  //     );
  //   });
  //   return observable;
  // }

  public getRegistryImageList(
    name: string,
    type: string
  ): Observable<RegistryImage[]> {
    var me = this;
    //debugger;
    return me.httpResult<RegistryImage[]>(
      'POST',
      'DcosRegistryImage/GetItems',
      this.userProvider.getToken(),
      null,
      [new KeyValuePair('name', name), new KeyValuePair('type', type)]
    );
  }

  public getRegistryImageVersionList(
    containerImageName: string
  ): Observable<any[]> {
    var me = this;
    return me.httpResult<any[]>(
      'POST',
      'DcosRegistryImage/GetImageVersions',
      this.userProvider.getToken(),
      null,
      [{ key: 'image', value: containerImageName }]
    );
  }

  public getImageDockerList(
    containerImageName: string
  ): Observable<ImageDocker[]> {
    var me = this;
    return me.httpResult<ImageDocker[]>(
      'POST',
      'DcosRegistryImage/GetDockerList',
      this.userProvider.getToken(),
      null,
      [{ key: 'dockerName', value: containerImageName }]
    );
  }
}
