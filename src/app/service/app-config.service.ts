import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ConfigService {
  //api 请求参数
  private applicationId = "408D8304D4C36DA99A5C01486FD92360";
  private applicationKey = "AppDesfefsfDfwerfweDsfsfds";
  private secertKey = "DDfewfdsdsfafewfsfdsfdDsfewdDfsfafdf";

  private requestBaseUrl =
    "http://uat-cloud.perfect99.com:10142/NSCloud/SNSAPI/";
  private authorizationUrl =
    "http://uat-cloud.perfect99.com:10142/NSCloud/Authorization/";

  //private requestBaseUrl = "http://localhost:9099/NSCloud/SNSAPI/";

  //private authorizationUrl = "http://localhost:9099/NSCloud/Authorization/";

  private registryUrl = "https://uat-registry.perfect99.com";
  private mesosApiUrl = "http://uat-dcos.perfect99.com:8080";
  // private fileUrl = "http://uat-dcos.perfect99.com:29201/download?filePath=";
  private fileUrl = "http://uat-dcos.perfect99.com:29201/download";
  private uploadBaseUrl = "http://uat-dcos.perfect99.com:29201";
  private webshellUrl = "http://uat-registry.perfect99.com:4230/"; //?host=节点Ip&user=用户名&cmd=SSH

  public getRegistryUrl(): string {
    return this.registryUrl;
  }

  //default
  public getApplicationId(): string {
    return this.applicationId;
  }

  public getApplicationKey(): string {
    return this.applicationKey;
  }

  public getSecertKey(): string {
    return this.secertKey;
  }

  public getRequestBaseUrl(): string {
    return this.requestBaseUrl;
  }

  public getAuthorizationUrl(): string {
    return this.authorizationUrl;
  }

  public getMesosApiUrl(): string {
    return this.mesosApiUrl;
  }
  public getFileUrl(): string {
    return this.fileUrl;
  }
  public getUploadBaseUrl(): string {
    return this.uploadBaseUrl;
  }
  public getWebshellUrl(): string {
    return this.webshellUrl;
  }
}
