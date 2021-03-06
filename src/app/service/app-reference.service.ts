import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { enc, HmacSHA1 } from 'crypto-js';
import { Observable } from 'rxjs';
//import { ConfigService } from "./app-config.service";
import { PfUtil } from '../common/pfUtil';
import { KeyValuePair } from '../common/pfModel';
import { ConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export abstract class ReferenceService {
  protected applicationId: string = '';
  protected applicationKey: string = '';
  protected secertKey: string = '';
  protected requestBaseUrl: string = '';
  private timestamp: string = '';
  private nonce: string = '';
  private authorization: string = '';
  private postData: string = '';
  private signature: string = '';
  private signatureString: string = '';
  private flag: boolean = false;
  private signature_algorithm: string = 'HMACSHA1';
  protected pfUtil: PfUtil;

  constructor(protected appConfig: ConfigService, protected http: HttpClient) {
    // this.applicationId = appConfig.getApplicationId();
    // this.applicationKey = appConfig.getApplicationKey();
    // this.secertKey = appConfig.getSecertKey();
    // this.requestBaseUrl = appConfig.getRequestBaseUrl();
    this.pfUtil = new PfUtil();
  }

  public request(
    httpMethod: string,
    url: string,
    token: string,
    postData: KeyValuePair[] | string,
    body: boolean
  ): Observable<NetworkServiceResponse> {
    url = url.startsWith('http')
      ? url
      : this.requestBaseUrl + (url.startsWith('/') ? url.substring(1) : url);
    httpMethod = httpMethod.toUpperCase();
    let authData = this.getAuthorizationData();

    var requestData: any[] = [];
    this.combine(requestData, authData);

    if (httpMethod == 'POST' && postData != null && body == false)
      this.combine(requestData, <KeyValuePair[]>postData);

    var sig_url = this.flag == true ? url : this.pathAndQuery(url);
    this.signature = this.generateSignature(
      httpMethod,
      sig_url,
      token,
      requestData,
      body
    );
    authData.push(new KeyValuePair('signature', this.signature));

    console.log(url);
    console.log(token);
    //console.log(postData);
    // console.log(body);

    //console.log(this.requestBaseUrl);
    if (token != '') authData.push(new KeyValuePair('token', token));

    this.authorization = this.generateAuthorizationString('OAuth', authData);
    if (httpMethod == 'POST' && postData != null && body == false)
      this.postData = this.generatePostData(<KeyValuePair[]>postData);
    else if (httpMethod == 'POST' && postData != null)
      this.postData = <string>postData;
    else this.postData = '';

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: this.authorization,
      }),
    };

    if (httpMethod == 'POST') {
      var res = this.http.post<NetworkServiceResponse>(
        url,
        this.postData,
        httpOptions
      );
      return res;
    } else {
      var res = this.http.get<NetworkServiceResponse>(url, httpOptions);
      return res;
    }
  }

  /**
   *
   * @param httpMethod
   * @param url
   * @param token
   * @param urlParams ???????????????url?????????(??????url??????)
   * @param body ??????keyValue?????????????????????FormData?????????(??????url??????), ?????????????????????post(?????????)
   * @returns
   */
  public httpRequest(
    httpMethod: string,
    url: string,
    token: string,
    urlParams: KeyValuePair[],
    body: KeyValuePair[] | any
  ): Observable<NetworkServiceResponse> {
    var me = this;
    url = url.startsWith('http')
      ? url
      : this.requestBaseUrl + (url.startsWith('/') ? url.substring(1) : url);
    httpMethod = httpMethod.toUpperCase();

    url = me.pfUtil.setUrlParams(url, urlParams);

    let authData = this.getAuthorizationData();

    var requestData: any[] = [];
    // if (url.indexOf("XSchedulerJob/GetRecords") > -1) {
    //   debugger;
    // }
    this.combine(requestData, authData);

    //??????
    // // if (httpMethod == "POST" && postData != null && body == false)
    // //   this.combine(requestData, <KeyValuePair[]>postData);
    // //??????--benjamin
    // var bodyIsFormData = body instanceof Array; //?????????body??????boolean???,?????????bodyIsFormData????????????
    // if (bodyIsFormData) {
    //   this.combine(requestData, <KeyValuePair[]>body);
    // }

    let bodyIsFormData = false;
    if (body instanceof Array && body.length > 0) {
      if (body[0] instanceof KeyValuePair) {
        bodyIsFormData = true;
      } else if (body[0]['key'] != undefined) {
        //????????????????????????????????????:const bodyIsFormData = body instanceof Array&&body.length>0&&body[0] instanceof KeyValuePair;
        //????????????body????????????[{key,value},...]?????????????????????,????????????????????????key??????????????????formData??????
        bodyIsFormData = true;
        body = body.map((a) => new KeyValuePair(a['key'], a['value'])); //??????????????????????????????,?????????????????????,??????????????????
      }
    }
    if (bodyIsFormData) {
      this.combine(requestData, body as KeyValuePair[]);
    }

    var sig_url = this.flag == true ? url : this.pathAndQuery(url);
    // if (url.indexOf("XSchedulerJob/GetRecords") > -1) {
    //   console.info("---------httpRequest signature--------");
    //   console.info(httpMethod);
    //   console.info(sig_url);
    //   console.info(token);
    //   console.info(requestData);
    //   console.info(!bodyIsFormData);
    // }
    this.signature = this.generateSignature(
      httpMethod,
      sig_url,
      token,
      requestData,
      !bodyIsFormData
    );
    //debugger;
    authData.push(new KeyValuePair('signature', this.signature));

    if (url.indexOf('XSchedulerJob/GetRecords') > -1) {
      // console.log(url);
      // //console.log(token);
      // //console.log(postData);
      // // console.log(body);
      //   console.info("---------httpRequest signature--------");
      //   console.info(httpMethod);
      //   console.info(sig_url);
      //   console.info(token);
      //   console.info(requestData);
      //   console.info(!bodyIsFormData);
      console.info(this.signature);
    }

    //console.log(this.requestBaseUrl);
    if (token != '') authData.push(new KeyValuePair('token', token));

    this.authorization = this.generateAuthorizationString('OAuth', authData);

    //??????
    // if (httpMethod == "POST" && postData != null && body == false)
    //this.postData = this.generatePostData(<KeyValuePair[]>postData);
    // else if (httpMethod == "POST" && postData != null)
    //   this.postData = <string>postData;
    // else this.postData = "";
    //??????--benjamin
    var postBody = '';
    if (body != null) {
      if (bodyIsFormData) {
        postBody = this.generatePostData(<KeyValuePair[]>body);
      } else {
        postBody = body;
      }
    }

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: this.authorization,
      }),
    };

    if (httpMethod == 'POST') {
      var res = this.http.post<NetworkServiceResponse>(
        url,
        //this.postData,
        postBody,
        httpOptions
      );
      return res;
    } else {
      var res = this.http.get<NetworkServiceResponse>(url, httpOptions);
      return res;
    }
  }
  /**
   * ????????????????????????Result??????null,??????null??????????????????,?????????????????????Result,???????????????httpRequest??????
   *
   * ??????????????????????????????:
   * 1.keyValue???Value?????????int???????????????????????????(?????????,??????????????????int)
   * 2.??????value???null??????,???????????????keyValue (?????????,????????????????????????null??????)
   *
   * ?????????:
   * 1.?????????formBody?????????,??????body???null,???????????????;???????????????????????????,??????????????????(????????????????????????,????????????????????????)
   *
   * @httpMethod
   * @url
   * @token
   * @urlParams ???????????????url?????????(??????url??????)
   * @body ??????keyValue?????????????????????FormData?????????(??????url??????), ?????????????????????post(?????????)
   */
  public httpResult<TResult>(
    httpMethod: string,
    url: string,
    token: string,
    urlParams: KeyValuePair[],
    body: KeyValuePair[] | any
  ): Observable<TResult> {
    const me = this;
    const observable = new Observable<TResult>((subscriber) => {
      me.httpRequest(httpMethod, url, token, urlParams, body).subscribe(
        (response) => {
          //debugger;
          if (response.Success === 'True' && response.Result != null) {
            //const data: TResult = JSON.parse(me.base64Decode(response.Result));
            let s: string = me.base64Decode(response.Result);
            let data: TResult;
            try {
              data = JSON.parse(s);
            } catch (e) {
              data = s as unknown as TResult;
            }
            subscriber.next(data);
          } else {
            subscriber.error(response.Message);
          }
        },
        (err) => {
          //debugger;
          subscriber.error(err);
          // if (err instanceof HttpErrorResponse) {
          //   subscriber.error(err.message); //??????????????????error????????????string??????
          // } else {
          //   subscriber.error(err);
          // }
          // if(typeof err === 'string'){
          //   subscriber.error(err);
          // }else{
          // }
        }
      );
    });
    return observable;
  }

  private generateSignature(
    httpMethod: string,
    requestUrl: string,
    token: string,
    data: KeyValuePair[],
    body: boolean
  ): string {
    this.signatureString =
      httpMethod.toUpperCase() +
      '&' +
      this.encode(requestUrl) +
      '&' +
      this.generateSignatureString(
        httpMethod.toUpperCase(),
        requestUrl,
        data,
        '='
      );
    if (this.signature_algorithm == 'HMACSHA1') {
      let key: string = this.secertKey + (token == '' ? '' : '&' + token);
      return enc.Base64.stringify(HmacSHA1(this.signatureString, key));
    }
    return '';
  }

  private generateAuthorizationString(
    authType: string,
    data: KeyValuePair[]
  ): string {
    let authString: string = authType + ' ';
    for (var i = 0; i < data.length; i++) {
      authString =
        authString +
        data[i].key +
        '="' +
        this.encode(data[i].value.toString()) +
        '"';

      if (i < data.length - 1) authString = authString + ',';
    }

    return authString;
  }

  private generateSignatureString(
    httpMethod: string,
    url: string,
    parameters: KeyValuePair[],
    spliter: string
  ): string {
    let parameterIndex: number = url.indexOf('?');
    if (parameterIndex > -1) {
      let urlParameterString = url.substring(parameterIndex + 1);
      url = url.substring(0, parameterIndex);
      let urlParameters = urlParameterString.split('&');
      let pkv;
      for (var i = 0; i < urlParameters.length; i++) {
        pkv = urlParameters[i].split('=');
        parameters.push(new KeyValuePair(pkv[0], pkv[1]));
      }
    }

    let pairs: KeyValuePair[] = [];
    this.combine(pairs, parameters);

    pairs.sort(this.compare);
    let sigString = '';
    // for (var i = 0; i < pairs.length; i++) {
    //   sigString =
    //     sigString + pairs[i].key + spliter + this.encode(pairs[i].value);

    //   if (i < pairs.length - 1) sigString = sigString + '&';
    // }
    for (let i = 0; i < pairs.length; i++) {
      // sigString =
      //   sigString + pairs[i].key + spliter + this.encode(pairs[i].value);
      sigString =
        sigString +
        pairs[i].key +
        spliter +
        this.encode(pairs[i].value == null ? '' : pairs[i].value.toString()); //??????????????????string???value???--benjamin 20210831
      if (i < pairs.length - 1) {
        sigString = sigString + '&';
      }
    }

    return sigString;
  }

  ///?????????
  private compare(a: KeyValuePair, b: KeyValuePair): number {
    if (a.key.toLowerCase() > b.key.toLowerCase()) return 1;
    else if (a.key.toLowerCase() < b.key.toLowerCase()) return -1;
    else return 0;
  }

  private getAuthorizationData(): KeyValuePair[] {
    let data: KeyValuePair[] = [];
    data.push(new KeyValuePair('appid', this.applicationId));
    data.push(new KeyValuePair('appkey', this.applicationKey));
    data.push(
      new KeyValuePair('signature_algorithm', this.signature_algorithm)
    ); //HMACSHA1
    data.push(new KeyValuePair('timestamp', this.getTimestamp()));
    data.push(new KeyValuePair('nonce', this.getNonce()));

    return data;
  }

  // private generatePostData(data: KeyValuePair[]): string {
  //   var me = this;
  //   let dataString = '';
  //   for (var i = 0; i < data.length; i++) {
  //     try {
  //       if (data[i].value != null) {
  //         //????????????????????????????????????(???:http://localhost:4200/ai/xSchedulerJob-add)--benjamin 20210618
  //         dataString =
  //           dataString +
  //           data[i].key +
  //           '=' +
  //           me.encode(data[i].value.toString());
  //       }
  //     } catch (e) {
  //       debugger;
  //     }

  //     if (i < data.length - 1) dataString = dataString + '&';
  //   }

  //   return dataString;
  // }
  /**
   * ??????????????????null??????--benjamin20210917
   * @param data
   * @returns
   */
  private generatePostData = function (data: KeyValuePair[]): string {
    let list = [];
    for (let i = 0; i < data.length; i++) {
      try {
        list.push(
          data[i].key +
            '=' +
            this.encode(data[i].value == null ? '' : data[i].value.toString())
        );
      } catch (e) {
        console.info('ReferenceService.generatePostData');
        console.info(e);
      }
    }
    return list.join('&');
  };

  private combine(data1: any[], data2: any[]): void {
    for (var i = 0; i < data2.length; i++) data1.push(data2[i]);
  }

  private pathAndQuery(url: string): string {
    url = url.replace('http://', '').replace('https://', '');
    let index = url.indexOf('/');
    return url.substring(index);
  }

  public getTimestamp(): string {
    if (this.timestamp == '')
      return (
        new Date().getTime() - new Date('1970/01/01').getTime()
      ).toString();
    else return this.timestamp;
  }

  public setTimestamp(value: string): void {
    this.timestamp = value;
  }

  public getNonce(): string {
    if (this.nonce == '') {
      let str = '';
      let index = 0;
      while (index < 10) {
        str = str + String.fromCharCode(65 + Math.random() * 26);
        index++;
      }

      return str;
    } else return this.nonce;
  }

  public setNonce(value: string): void {
    this.nonce = value;
  }

  public encode(data: string): string {
    let str = '';
    if (data == null) {
      return str;
    }
    for (var i = 0; i < data.length; i++) {
      if (data[i] == ' ') str = str + '+';
      else {
        var chars = encodeURIComponent(data[i]);
        if (chars.length > 1) str = str + chars.toLowerCase();
        else str = str + data[i];
      }
    }

    return str;
  }

  public getPostData(): string {
    return this.postData;
  }

  public getAuthorization(): string {
    return this.authorization;
  }

  public base64Decode(base64String: string): string {
    return enc.Utf8.stringify(enc.Base64.parse(base64String));
  }

  public base64Encode(value: string): string {
    let src = enc.Utf8.parse(value);
    return enc.Base64.stringify(src);
  }

  public getSignature(): string {
    return this.signature;
  }

  public getSignatureString(): string {
    return this.signatureString;
  }
}

// export class KeyValuePair {
//   constructor(public key: string, public value: string) {}
// }

export class NetworkServiceResponse {
  public Success?: string;
  public Compress?: string;
  public Message?: string;
  public Result?: any;
  public StatusCode?: number;
}

export interface PageResult<TData> {
  DataSource: TData;
  RecordCount: number;
}
