import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "./app-config.service";
import { ReferenceService } from "./app-reference.service";
import { Observable } from "rxjs";
import { UserProviderService } from "./user-provider.service";
import { PfUtil } from "../common/pfUtil";

@Injectable({ providedIn: "root" })
export class DataCenterReferenceService extends ReferenceService {
  constructor(
    protected appConfig: ConfigService,
    protected http: HttpClient,
    private userProvider: UserProviderService
  ) {
    super(appConfig, http);
    this.applicationId = appConfig.getDataCenterId();
    this.applicationKey = appConfig.getDataCenterKey();
    this.secertKey = appConfig.getDataCenterSecertKey();
    this.requestBaseUrl = appConfig.getDataCenterUrl();
  }

  public datamodelExecute(
    modelId,
    filterExpression: string,
    aggregationExpression: string,
    breakoutExpression: string,
    limit?: number
  ): Observable<any> {
    var me = this;
    if (me.pfUtil.isNull(limit)) {
      limit = 100;
    }
    return me.httpResult<any>(
      "POST",
      "DataModel/Execute",
      this.userProvider.getToken(),
      null,
      [
        { key: "modelId", value: modelId },
        { key: "limit", value: limit },
        { key: "filterExpression", value: filterExpression },
        { key: "aggregationExpression", value: aggregationExpression },
        { key: "breakoutExpression", value: breakoutExpression },
      ]
    );
  }
  public datamodelExecute2(
    databaseId: number,
    //databaseUUID: string,
    expressionBase64,
    limit?: number
  ): Observable<any> {
    var me = this;
    if (me.pfUtil.isNull(limit)) {
      limit = 100;
    }
    return me.httpResult<any>(
      "POST",
      "DataModel/Execute2",
      this.userProvider.getToken(),
      null,
      [
        { key: "dataSourceId", value: databaseId },
        { key: "expressionBase64", value: expressionBase64 },
        { key: "limit", value: limit },
      ]
    );
  }
  public datamodelConvertToSQL(
    modelId,
    filterExpression: string,
    aggregationExpression: string,
    breakoutExpression: string,
    limit?: number
  ): Observable<string> {
    var me = this;
    if (me.pfUtil.isNull(limit)) {
      limit = 100;
    }
    return me.httpResult<string>(
      "POST",
      "DataModel/ConvertToSQL",
      this.userProvider.getToken(),
      null,
      [
        { key: "modelId", value: modelId },
        { key: "limit", value: limit },
        { key: "filterExpression", value: filterExpression },
        { key: "aggregationExpression", value: aggregationExpression },
        { key: "breakoutExpression", value: breakoutExpression },
      ]
    );
  }
  public datamodelConvertToSQL2(
    databaseId: number,
    //databaseUUID: string,
    expressionBase64,
    limit?: number
  ): Observable<string> {
    var me = this;
    if (me.pfUtil.isNull(limit)) {
      limit = 100;
    }
    return me.httpResult<string>(
      "POST",
      "DataModel/ConvertToSQL2",
      this.userProvider.getToken(),
      null,
      [
        { key: "dataSourceId", value: databaseId },
        { key: "expressionBase64", value: expressionBase64 },
        { key: "limit", value: limit },
      ]
    );
  }
}
