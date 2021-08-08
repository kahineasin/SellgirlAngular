import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { ConfigService } from "./app-config.service";
import { ReferenceService } from "./app-reference.service";

@Injectable({ providedIn: "root" })
export class LoginReferenceService extends ReferenceService {
  constructor(protected appConfig: ConfigService, protected http: HttpClient) {
    super(appConfig, http);

    /*
    super.applicationId = appConfig.getLoginApplicationId();
    super.applicationKey = appConfig.getLoginApplicationKey();
    super.secertKey = appConfig.getLoginSecertKey();
    super.requestBaseUrl = appConfig.getLoginRequestBaseUrl();
    */
  }
}
