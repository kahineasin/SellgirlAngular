import { Injectable } from "@angular/core";
import { KeyValuePair, IPfObject } from "./pfModel";



@Injectable({
  providedIn: "root",
})
export class PfUtil {
  constructor() {}

/*
 *保存本地cache数组（localStorage.setItem的扩展）
 *param arr 类型Array
 */
setLocalStorage (key:any, arr:any) {
  if (arr === null || arr === undefined || arr.length < 1) {
    localStorage.removeItem(key);
  } else {
    //localStorage.setItem(key, arr.toString());
    localStorage.setItem(key, JSON.stringify(arr));
  }
};
getLocalStorage  (key:any):any {
  var s = localStorage.getItem(key);
  if (s !== null && s !== "") {
    //空字符串split后会有length:1
    //return s.split(',');
    return JSON.parse(s);
  } else {
    //没cache就全选
    return null;
  }
};
  setUrlParams(url: string, arr: KeyValuePair[] | IPfObject): string {
    if (arr == null || arr == undefined) {
      return url;
    }
    if (url.indexOf("?") < 0) {
      url += "?";
    } else {
      var lc = url[url.length - 1];
      if (lc !== "?" && lc !== "&") {
        url += "&";
      }
    }

    function setParam(sUrl:any, name:any, val:any) {
      if (val instanceof Array) {
        for (var i = 0; i < val.length; i++) {
          sUrl += name + "=" + encodeURIComponent(val[i]) + "&";
        }
      } else {
        sUrl += name + "=" + encodeURIComponent(val) + "&";
      }
      return sUrl;
    }
    function removeSameParam(sUrl:any, pName:any) {
      //移除url中已经存在的同名参数,已考虑 xx[]的情况
      var patt1 = new RegExp(
        "([&?]{1})" + pName + "[\\[\\]]{0,2}=[^&]*[&]{0,1}",
        "g"
      );
      return sUrl.replace(patt1, "$1");
    }
    //到这里url格式为 xx? 或者 xx?xx&
    if (arr instanceof Array) {
      for (var i = 0; i < arr.length; i++) {
        //考虑到有数组的情况,必需全部移除再设置
        url = removeSameParam(url, arr[i].key);
      }
      for (var i = 0; i < arr.length; i++) {
        url = setParam(url, arr[i].key, arr[i].value);
      }
    } else {
      //object
      for (var item in arr) {
        //考虑到有数组的情况,必需全部移除再设置
        if (arr.hasOwnProperty(item)) {
          url = removeSameParam(url, item);
        }
      }
      for (var item in arr) {
        if (arr.hasOwnProperty(item)) {
          url = setParam(url, item, arr[item]);
        }
      }
    }
    if (url[url.length - 1] === "&") {
      url = url.substr(0, url.length - 1);
    }
    return url;
  }

  /**
   * 把 /aa/bb/cc.jar 之类的路径 分隔成3部分
   * 1 aa/bb
   * 2 cc
   * 3 .jar
   * @param fullPath
   * @return
   */
  splitPath(fullPath: string): string[] {
    fullPath = fullPath.replace("\\\\", "/");
    if (fullPath.length > 0 && fullPath.charAt(0) == "/") {
      fullPath = fullPath.substring(1);
    }
    var r: string[] = ["", "", ""];
    var postIdx: number = fullPath.lastIndexOf(".");
    var pathEndIdx: number = fullPath.lastIndexOf("/");
    var postfix: string = postIdx > -1 ? fullPath.substring(postIdx) : ""; //后缀,带.
    //String path=pathEndIdx>-1?fullPath.substring(0,pathEndIdx+1):"";
    var path: string = pathEndIdx > -1 ? fullPath.substring(0, pathEndIdx) : "";
    //String fileName=fullPath.substring(path.length(),fullPath.length()-postfix.length());
    //String fileName=fullPath.substring(path.length()+1,fullPath.length()-postfix.length());
    var fileName: string = fullPath.substring(
      path.length,
      fullPath.length - postfix.length
    );
    if (fileName.charAt(0) == "/") {
      //当pathEndIdx是-1时,
      fileName = fileName.substring(1);
    }
    r[0] = path;
    r[1] = fileName;
    r[2] = postfix;
    return r;
  }
  /**
   * 左边补0
   * padZeroLeft(15,4)==0015
   * @param num
   * @param n
   * @returns
   */
  padZeroLeft(num: number, n: number) {
    return (
      Array(n > ("" + num).length ? n - ("" + num).length + 1 : 0).join("0") +
      num
    );
  }
  /**
   * 结果如
   *               -90
   *          -135     -45
   *         180          0
   *           135      45
   *                90
   * @param start 
   * @param end 
   * @returns 
   */
   public static getAngle(start, end) :number{
    //  //这样的角度范围是+90~-90,不完整
    //   var diff_x = end.x - start.x,
    //       diff_y = end.y - start.y;
    //   //返回角度,不是弧度
    //   return 360 * Math.atan(diff_y / diff_x) / (2 * Math.PI);
      
		var diff_x:number = end.x - start.x;
		var diff_y:number = end.y - start.y;
		var angle :number= 360 * Math.atan(diff_y / diff_x) / 6.283185307179586;//(2 * Math.PI)
		if (diff_x < 0 && diff_y > 0) {
			angle += 180;
			// return (360.0D * Math.atan(Double.valueOf(diff_y).doubleValue() / diff_x) /
			// 6.283185307179586D)+180;
		}else
		if (diff_x < 0 && diff_y < 0) {
			angle -= 180;
			// return (360.0D * Math.atan(Double.valueOf(diff_y).doubleValue() / diff_x) /
			// 6.283185307179586D)-180;
		}else if (diff_x < 0 && diff_y == 0) {
			angle += 180;
		}
		return angle;
  }
}

interface ProcedureLink<T extends IPfObject> {
  source: T;
  target: T;
}
/*
 * 用于步骤的增删改 未测试
 * node格式如：
 * {
 * 	procedureId
 *  procedureName
 *  from:[]
 *  to:[]
 * }
 * 使用方法：
 * 
            let procedureManager = new ProcedureManager(
              "procedureId","from","to"
            );
 */
export class ProcedureManager<T1 extends IPfObject> {
  nodes: T1[] = []; //格式如{procedureId,from:[],to:[]}
  links: ProcedureLink<T1>[] = []; //格式如[{ source: node, target: node }]
  constructor(
    protected key: string,
    protected from: string,
    public to: string
  ) {}
  public getNode(v:any): T1|null {
    var me = this;
    for (var i = 0; i < me.nodes.length; i++) {
      if (v == me.nodes[i][me.key]) {
        return me.nodes[i];
      }
    }
    return null;
  }
  public addProcedure(node:any): void {
    var me = this;
    me.nodes.push(node);
    for (var i = 0; i < node[me.from].length; i++) {
      var n = me.getNode(node[me.from][i]);
      if (n != null) {
        me.links.push({ source: n, target: node });

        if (n[me.to].findIndex((a:any) => a == node[me.key]) < 0) {
          //新加节点时,是为true进入这里的,但由于edit页面加载时也是用addProcedure初始化数据库的数据,那么target里早就有关联了,所以不应再进入这里
          n[me.to].push(node[me.key]); //必要
        }
      }
    }
    for (var i = 0; i < node[me.to].length; i++) {
      var n = me.getNode(node[me.to][i]);
      if (n != null) {
        me.links.push({ source: node, target: n });

        if (n[me.from].findIndex((a:any) => a == node[me.key]) < 0) {
          n[me.from].push(node[me.key]);
        }
      }
    }
  }
  /**
   * 编辑时要保留node的原有位置
   */
  public editProcedure(node:any): void {
    var me = this;
    var oldI = -1;
    for (var i = 0; i < me.nodes.length; i++) {
      if (node[me.key] == me.nodes[i][me.key]) {
        oldI = i;
      }
    }
    //删线
    for (var i = me.links.length - 1; i >= 0; i--) {
      if (
        me.nodes[oldI][me.key] == me.links[i].source[me.key] ||
        me.nodes[oldI][me.key] == me.links[i].target[me.key]
      ) {
        me.links.splice(i, 1);
      }
    }
    //删原node的相关from to
    var tmpN:T1|null;
    for (var i = 0; i < me.nodes[oldI][me.from].length; i++) {
      var n :any= me.getNode(me.nodes[oldI][me.from][i]);
      if(n==null){continue;}
      n[me.to] = n[me.to].filter((a:any) => a != me.nodes[oldI][me.key]);
    }
    for (var i = 0; i < me.nodes[oldI][me.to].length; i++) {
      var n:any = me.getNode(me.nodes[oldI][me.to][i]);
      if(n==null){continue;}
      n[me.from] = n[me.from].filter((a:any) => a != me.nodes[oldI][me.key]);
    }
    //加线
    for (var i = 0; i < node[me.from].length; i++) {
      var n:any = me.getNode(node[me.from][i]);
      if (n != null) {
        me.links.push({ source: n, target: node });
      }
    }
    for (var i = 0; i < node[me.to].length; i++) {
       tmpN= me.getNode(node[me.to][i]);
      if (tmpN != null) {
        me.links.push({ source: node, target: tmpN });
      }
    }
    //加node的相关from to
    for (var i = 0; i < node[me.from].length; i++) {
      tmpN = me.getNode(node[me.from][i]);
      if (tmpN != null) {
        tmpN[me.to].push(node[me.key]); //必要
      }
    }
    for (var i = 0; i < node[me.to].length; i++) {
      tmpN= me.getNode(node[me.to][i]);
      if (tmpN != null) {
        tmpN[me.from].push(node[me.key]);
      }
    }
    //替换node
    me.nodes.splice(oldI, 1, node);
  }
  public deleteProcedure  (node: T1) {
    var me = this;
    //old这样不能删除此节点在其它节点里的 from to引用
    // for (var i = 0; i < me.nodes.length; i++) {
    //   if (node[me.key] == me.nodes[i][me.key]) {
    //     me.nodes.splice(i, 1);
    //     break;
    //   }
    // }
    for (var i = me.nodes.length - 1; i >= 0; i--) {
      if (node[me.key] == me.nodes[i][me.key]) {
        me.nodes.splice(i, 1);
      } else {
        // me.nodes[i][me.from] = me.nodes[i].from.filter((a:any) => a != node[me.key]);
        // me.nodes[i][me.to] = me.nodes[i].to.filter((a:any) => a != node[me.key]);
        Object.assign(me.nodes[i],{[me.from] :me.nodes[i].from.filter((a:any) => a != node[me.key])});
        Object.assign(me.nodes[i],{[me.to] :me.nodes[i].to.filter((a:any) => a != node[me.key])});
      }
    }
    for (var i = me.links.length - 1; i >= 0; i--) {
      if (
        node[me.key] == me.links[i].source[me.key] ||
        node[me.key] == me.links[i].target[me.key]
      ) {
        me.links.splice(i, 1);
      }
    }
  };
  /**@deprecated */
  public deleteLinkByKey(l: string, r: string): void {
    var me = this;
    for (var i = me.links.length - 1; i >= 0; i--) {
      if (l == me.links[i].source[me.key] && r == me.links[i].target[me.key]) {
        me.links.splice(i, 1);
      }
    }
    var ln:T1|null = me.getNode(l);
    if(ln!=null){
      //var tmpArr:string[]=ln[me.to].filter((a:string) => a != r);
      // var testO:Object={};
      // testO.valueOf(@aa)=5;
      // //ln[me.to] ;
      // Object.
      //ln[me.to] = tmpArr;

      // ln[me.to] = ln[me.to].filter((a:string) => a != r);
      Object.assign(ln,{[me.to]:ln[me.to].filter((a:string) => a != r)});
    }
    var rn = me.getNode(r);
    if(rn!=null){
      Object.assign(rn,{[me.from]:rn[me.from].filter((a:any) => a != l)});
      // rn[me.from] = rn[me.from].filter((a:any) => a != l);
    }
  }
  public deleteLink(l: T1, r: T1): void {
    var me = this;
    for (var i = me.links.length - 1; i >= 0; i--) {
      if (
        l[me.key] == me.links[i].source[me.key] &&
        r[me.key] == me.links[i].target[me.key]
      ) {
        me.links.splice(i, 1);
      }
    }
    var ln = me.getNode(l[me.key]);
    if(ln!=null){
      Object.assign(ln,{[me.to]:ln[me.to].filter((a:any) => a != r[me.key])});
      // ln[me.to] = ln[me.to].filter((a:any) => a != r[me.key]);
    }
    var rn = me.getNode(r[me.key]);
    if(rn!=null){
      Object.assign(rn,{[me.from]:rn[me.from].filter((a:any) => a != l[me.key])});
      // rn[me.from] = rn[me.from].filter((a:any) => a != l[me.key]);
    }
  }
  public addLink(l: T1, r: T1): void {
    var me = this;
    for (var i = me.links.length - 1; i >= 0; i--) {
      if (
        l[me.key] == me.links[i].source[me.key] &&
        r[me.key] == me.links[i].target[me.key]
      ) {
        return; //存在则不加
      }
    }
    var ln = me.getNode(l[me.key]);
    if(ln!=null){

      ln[me.to].push(r[me.key]);
    }
    var rn = me.getNode(r[me.key]);
    if(rn!=null){

      rn[me.from].push(l[me.key]);
    }
    me.links.push({ source: l, target: r });
  }
  public getLinks(): ProcedureLink<T1>[] {
    var me = this;
    return me.links;
  }
  public getNodes(): T1[] {
    var me = this;
    return me.nodes;
  }
  public empty() {
    var me = this;
    me.links = [];
    me.nodes = [];
  }
  public printContent() {
    var me = this;
    console.info("---------nodes--------");
    console.info(me.nodes);
    console.info("---------links--------");
    console.info(me.links);
  }
}
