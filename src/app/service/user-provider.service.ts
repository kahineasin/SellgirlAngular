import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { LoginReferenceService } from "./login-reference.service";
import { Observable, Observer, of } from "rxjs";
import { userInfoLocal } from "./local-test-data/user-info-data";

interface UserInfoModel {
  Enabled: boolean;
  LastLoginIP: string;
  LastLoginTime: Date;
  Password: string;
  RealName: string;
  RelationId: string;
  RoleId: string;
  RoleName: string;
  Time: Date;
  UserId: string;
  UserNo: string;
}

@Injectable({ providedIn: "root" })
export class UserProviderService {
  private token = "";
  private purviews: any[] = [];
  private userInfo: UserInfoModel | null = null;
  private timer: any = null;
  private purviewId: string | null = null;
  private moudleName = "";

  constructor(
    private reference: LoginReferenceService,
    private router: Router
  ) {
    const me = this;
    if (localStorage) {
      const token: string | null = localStorage.getItem("$token");
      if (token != null) {
        this.token = token;
      }

      const info: string | null = localStorage.getItem("$userInfo");
      if (info != null) {
        this.userInfo = JSON.parse(info);
      }

      const ps: string | null = localStorage.getItem("$purviews");
      if (ps != null) {
        this.purviews = JSON.parse(ps);
      }

      const cps: string | null = localStorage.getItem("$purviewId");
      if (cps != null) {
        this.purviewId = cps;
      }

      const mn: string | null = localStorage.getItem("$moudleName");
      if (mn != null) {
        this.moudleName = mn;
      }
    }

    if (null === me.userInfo) {
      me.userInfo = userInfoLocal;
    }

    this.timer = setInterval(() => {
      this.proving();
    }, 300000);
  }

  public getToken(): string {
    return this.token;
  }

  public setToken(value: string) {
    this.token = value;

    if (localStorage) {
      localStorage.setItem("$token", value);
    }
  }

  public setMoudleName(value: string): void {
    this.moudleName = value;

    if (localStorage) {
      localStorage.setItem("$moudleName", value);
    }
  }

  public getMoudleName() {
    return this.moudleName;
  }

  public setPurviewId(value: string): void {
    this.purviewId = value;
    if (localStorage) {
      localStorage.setItem("$purviewId", value);
    }
  }

  public getPurviewId(): string | null {
    return this.purviewId;
  }

  public getUserInfo(): UserInfoModel | null {
    return this.userInfo;
  }

  public getPurviews(purviewId: string): any[] {
    console.log(purviewId);
    if (purviewId == null || purviewId === "") {
      return this.purviews;
    }

    if (this.purviews.length === 0) {
      return [];
    }

    const purviews: any[] = [];
    for (const purview of this.purviews) {
      if (purview.ParentPurviewId === purviewId) {
        purviews.push(purview);
      }
    }

    return purviews;
  }

  public initUserInfo(): Observable<boolean> {
    // const observable = new Observable<boolean>((subscriber) => {
    //   this.reference
    //     .request(
    //       "POST",
    //       "SystemUser/GetItemInfo2",
    //       this.token,
    //       [{ key: "userIdentification", value: "" }],
    //       false
    //     )
    //     .subscribe((response:any) => {
    //       if (response == null || response.Success === "False") {
    //         subscriber.next(false);
    //       } else {
    //         this.userInfo = JSON.parse(
    //           this.reference.base64Decode(response.Result)
    //         );
    //         if (localStorage) {
    //           localStorage.setItem("$userInfo", JSON.stringify(this.userInfo));
    //         }
    //         subscriber.next(true);
    //       }
    //     });
    // });
    var me = this;
    const observable = new Observable<boolean>((subscriber) => {
      me.userInfo = {
        Enabled: true,
        LastLoginIP: "",
        LastLoginTime: new Date(),
        Password: "string",
        RealName: "string",
        RelationId: "string",
        RoleId: "string",
        RoleName: "string",
        Time: new Date(),
        UserId: "1712002",
        UserNo: "1712002",
      };
      if (localStorage) {
        localStorage.setItem("$userInfo", JSON.stringify(this.userInfo));
      }
      subscriber.next(true);
    });

    return observable;
  }

  public initPurviews(): Observable<boolean> {
    var me = this;
    const observable = new Observable<boolean>((subscriber) => {
      if (me.userInfo == null) {
        return;
      }
      this.reference
        .request(
          "POST",
          "SystemRolePurview/GetItems",
          this.token,
          [
            { key: "roleId", value: me.userInfo.RoleId },
            { key: "enabled", value: "True" },
          ],
          false
        )
        .subscribe((response: any) => {
          if (response != null && response.Success === "True") {
            const data = JSON.parse(
              this.reference.base64Decode(response.Result)
            );
            this.purviews = data;
            if (localStorage) {
              localStorage.setItem("$purviews", JSON.stringify(this.purviews));
            }
            subscriber.next(true);
          } else {
            subscriber.next(false);
          }
        });
    });

    return observable;
  }

  public proving(): void {
    // this.reference
    //   .request(
    //     "POST",
    //     "Test/Alive",
    //     this.token,
    //     [{ key: "msg", value: "proving" }],
    //     false
    //   )
    //   .subscribe((response:any) => {
    //     if (
    //       !(
    //         response != null &&
    //         response.Success === "True" &&
    //         response.Message === "proving"
    //       )
    //     ) {
    //       this.router.navigate(["login"]);
    //     }
    //   });
  }
}
