import { Injectable } from '@angular/core';
import { FormGroup, ValidationErrors } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { KeyValuePair, IPfObject } from './pfModel';

@Injectable({
  providedIn: 'root',
})
export class PfUtil {
  private pfIFrameMessageHandlers = {};
  constructor() {}

  /*
   *保存本地cache数组（localStorage.setItem的扩展）
   *param arr 类型Array
   */
  setLocalStorage(key: any, arr: any) {
    if (arr === null || arr === undefined || arr.length < 1) {
      localStorage.removeItem(key);
    } else {
      //localStorage.setItem(key, arr.toString());
      localStorage.setItem(key, JSON.stringify(arr));
    }
  }
  getLocalStorage(key: any): any {
    var s = localStorage.getItem(key);
    if (s !== null && s !== '') {
      //空字符串split后会有length:1
      //return s.split(',');
      return JSON.parse(s);
    } else {
      //没cache就全选
      return null;
    }
  }
  setUrlParams(url: string, arr: KeyValuePair[] | object): string {
    if (arr == null || arr === undefined) {
      return url;
    }
    if (url.indexOf('?') < 0) {
      url += '?';
    } else {
      const lc = url[url.length - 1];
      if (lc !== '?' && lc !== '&') {
        url += '&';
      }
    }

    function setParam(sUrl, name, val) {
      if (val instanceof Array) {
        for (const ch of val) {
          sUrl += name + '=' + encodeURIComponent(ch) + '&';
        }
      } else {
        sUrl += name + '=' + encodeURIComponent(val) + '&';
      }
      return sUrl;
    }

    function removeSameParam(sUrl, pName) {
      // 移除url中已经存在的同名参数,已考虑 xx[]的情况
      const patt1 = new RegExp(
        '([&?]{1})' + pName + '[\\[\\]]{0,2}=[^&]*[&]{0,1}',
        'g'
      );
      return sUrl.replace(patt1, '$1');
    }

    // 到这里url格式为 xx? 或者 xx?xx&
    if (arr instanceof Array) {
      for (const kvp of arr) {
        // 考虑到有数组的情况,必需全部移除再设置
        url = removeSameParam(url, kvp.key);
      }

      for (const kvp of arr) {
        url = setParam(url, kvp.key, kvp.value);
      }
    } else {
      for (const item in arr) {
        // 考虑到有数组的情况,必需全部移除再设置
        if (arr.hasOwnProperty(item)) {
          url = removeSameParam(url, item);
        }
      }
      for (const item in arr) {
        if (arr.hasOwnProperty(item)) {
          url = setParam(url, item, arr[item]);
        }
      }
    }
    if (url[url.length - 1] === '&') {
      url = url.substr(0, url.length - 1);
    }
    return url;
  }

  /**
   * 把 /aa/bb/cc.jar 之类的路径 分隔成3部分
   * 1 aa/bb
   * 2 cc
   * 3 .jar
   * fullPath
   */
  splitPath(fullPath: string): string[] {
    fullPath = fullPath.replace('\\\\', '/');
    if (fullPath.length > 0 && fullPath.charAt(0) == '/') {
      fullPath = fullPath.substring(1);
    }
    const r: string[] = ['', '', ''];
    const postIdx: number = fullPath.lastIndexOf('.');
    const pathEndIdx: number = fullPath.lastIndexOf('/');
    const postfix: string = postIdx > -1 ? fullPath.substring(postIdx) : ''; // 后缀,带.
    const path: string =
      pathEndIdx > -1 ? fullPath.substring(0, pathEndIdx) : '';
    let fileName: string = fullPath.substring(
      path.length,
      fullPath.length - postfix.length
    );
    if (fileName.charAt(0) === '/') {
      // 当pathEndIdx是-1时,
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
   * num
   * n
   */
  padZeroLeft(num: number, n: number) {
    return (
      Array(n > ('' + num).length ? n - ('' + num).length + 1 : 0).join('0') +
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
  public static getAngle(start, end): number {
    //  //这样的角度范围是+90~-90,不完整
    //   var diff_x = end.x - start.x,
    //       diff_y = end.y - start.y;
    //   //返回角度,不是弧度
    //   return 360 * Math.atan(diff_y / diff_x) / (2 * Math.PI);

    var diff_x: number = end.x - start.x;
    var diff_y: number = end.y - start.y;
    var angle: number = (360 * Math.atan(diff_y / diff_x)) / 6.283185307179586; //(2 * Math.PI)
    if (diff_x < 0 && diff_y > 0) {
      angle += 180;
      // return (360.0D * Math.atan(Double.valueOf(diff_y).doubleValue() / diff_x) /
      // 6.283185307179586D)+180;
    } else if (diff_x < 0 && diff_y < 0) {
      angle -= 180;
      // return (360.0D * Math.atan(Double.valueOf(diff_y).doubleValue() / diff_x) /
      // 6.283185307179586D)-180;
    } else if (diff_x < 0 && diff_y == 0) {
      angle += 180;
    }
    return angle;
  }
  /**
   * 往上查找第一个relative的元素
   */
  public static findUpRelativeDom(dom) {
    if (dom == null) {
      return null;
    }
    if (dom.style.position === 'relative') {
      return dom;
    }
    if (dom.parentElement != null) {
      return PfUtil.findUpRelativeDom(dom.parentElement);
    }
    return null;
  }
  public static domIsParentOf(parent, child): boolean {
    if (child === null || parent === null) {
      return false;
    }
    if (child.parentElement == parent) {
      return true;
    }
    if (child.parentElement != null) {
      return PfUtil.domIsParentOf(parent, child.parentElement);
    }
    return false;
  }
  public static domHasAnyParent(child, match: Function): boolean {
    if (child === null || child === undefined) {
      return false;
    }
    if (match(child)) {
      return true;
    }
    if (child.parentElement != null) {
      return PfUtil.domHasAnyParent(child.parentElement, match);
    }
    return false;
  }

  // //未使用
  // public static triggerMouseEvent(ownerDocument, selector, eventName) {
  //   const targetElement = document.querySelector(selector);
  //   if (document.createEvent) {
  //     const event = document.createEvent("MouseEvents");
  //     event.initEvent("mouseover", true, false);
  //     targetElement.dispatchEvent(event);
  //   } else if (document.createEventObject) {
  //     //兼容IE
  //     targetElement.fireEvent("onmouseover");
  //   }
  // }

  // public triggerEvent(ownerDocument, selector, eventName) {
  //   //const targetElement = document.querySelector(selector);
  //   const targetElement = selector.querySelector(selector);
  //   if (document.createEvent) {
  //     const event = ownerDocument.createEvent("HTMLEvents");
  //     event.initEvent(eventName, true, false);
  //     targetElement.dispatchEvent(event);
  //   } else if (ownerDocument.createEventObject) {
  //     //兼容IE
  //     targetElement.fireEvent(eventName);
  //   }
  // }

  /**
 * 触发dom事件
 * 使用方法:
        me.pfUtil.triggerEvent(
          me.el.nativeElement.ownerDocument,
          me.el.nativeElement.querySelector(".addConditionBtn"),
          "click"
        );
 * @param ownerDocument 
 * @param targetElement 
 * @param eventName 
 */
  public triggerEvent(ownerDocument, targetElement, eventName) {
    //const targetElement = document.querySelector(selector);
    //const targetElement = selector.querySelector(selector);
    if (document.createEvent) {
      const event = ownerDocument.createEvent('HTMLEvents');
      event.initEvent(eventName, true, false);
      targetElement.dispatchEvent(event);
    } else if (ownerDocument.createEventObject) {
      //兼容IE
      targetElement.fireEvent(eventName);
    }
  }
  public stopPropagation(event) {
    if (event.stopPropagation) {
      event.stopPropagation();
    } else {
      event.cancelBubble = true;
    }
  }

  public static replaceAll(sourceStr, targetStr, newStr) {
    //var sourceStr = this.valueOf();

    while (sourceStr.indexOf(targetStr) !== -1) {
      sourceStr = sourceStr.replace(targetStr, newStr);
    }

    return sourceStr;
  }
  public static domHasClass(dom, cls: string): boolean {
    if (dom === null || dom === undefined) {
      return false;
    }
    if (typeof dom.className === 'string') {
      return dom.className.indexOf(cls) > -1;
    }
    if ('path' === dom.tagName) {
      //path元素的className是SVGAnimatedString类型,内部有animVal和baseVal属性--benjamin todo
      return false;
    }
    return false;
  }
  public static newHashId(): string {
    return PfUtil.replaceAll(Guid.create().toString(), '-', '');
  }
  public static likeText(columnName: string, text: string) {
    if (text === null || text === undefined) {
      text = '';
    }
    if (text === null || text === undefined) {
      columnName = '';
    }
    return (
      columnName.toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) > -1
    );
  }
  public isArray(field): boolean {
    return field instanceof Array;
  }
  public isObject(field): boolean {
    return typeof field === 'object';
  }
  public arrayLastIndex<T>(
    list: Array<T>,
    predicate: (value: T, index: number, obj: T[]) => unknown,
    thisArg?: any
  ): number {
    return [...list].reverse().findIndex(predicate, thisArg);
  }
  public arrayLast<T>(list: Array<T>): T {
    var [last] = [...list].reverse();
    return last;
  }
  public arrayUniq<T>(list: Array<T>, p: (value: T) => unknown): Array<T> {
    var r: Array<T> = [];
    for (let i = 0; i < list.length; i++) {
      if (r.findIndex((a) => p(a) === p(list[i])) > -1) {
      } else {
        r.push(list[i]);
      }
    }
    return r;
  }
  /**
   * 代替underscore的omit方法
   * @param o
   * @param String
   */
  public static objectOmit(o: any, ...keys: string[]) {
    let r = { ...o };
    for (let i = 0; i < keys.length; i++) {
      if (r.hasOwnProperty(keys[i])) {
        delete r[keys[i]];
      }
    }
    return r;
  }
  public isListEmpty(list: any): boolean {
    const me = this;
    return list === null || list === undefined || list.length < 1;
  }
  public isObjectEmpty(obj: Object): boolean {
    const me = this;
    if (obj === null || obj === undefined) {
      return true;
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }
  /**
   * null or undefined 等调用会报错的类型
   */
  public isNull(obj): boolean {
    const me = this;
    if (obj === null || obj === undefined) {
      return true;
    }
    return false;
  }
  /**
   * Empty包含空数组和空对象等,如[],{},""
   */
  public isEmpty(obj): boolean {
    const me = this;
    if (me.isNull(obj)) {
      return true;
    }
    if (me.isArray(obj) && me.isListEmpty(obj)) {
      return true;
    }
    if (me.isObject(obj) && me.isObjectEmpty(obj)) {
      return true;
    }
    if (typeof obj === 'string' && '' === obj) {
      return true;
    }
    return false;
  }
  public isAnyNull(...list): boolean {
    const me = this;
    for (let i = 0; i < list.length; i++) {
      // //console.info(list[i]);
      // if (list[i] === null || list[i] === undefined) {
      //   return true;
      // }
      // if (me.isArray(list[i]) && me.isListEmpty(list[i])) {
      //   return true;
      // }
      if (me.isNull(list[i])) {
        return true;
      }
      // if (me.isObject(list[i]) && me.isObjectEmpty(list[i])) {
      //   return true;
      // }
      // if (typeof list[i] === "string" && "" === list[i]) {
      //   return true;
      // }
    }
    return false;
  }
  public isAllNull(...list): boolean {
    const me = this;
    for (let i = 0; i < list.length; i++) {
      // //console.info(list[i]);
      // if (list[i] === null || list[i] === undefined) {
      //   //return true;
      // } else if (me.isArray(list[i]) && me.isListEmpty(list[i])) {
      //   //return true;
      // } else if (typeof list[i] === "string" && "" === list[i]) {
      //   //return true;
      // } else {
      //   return false;
      // }
      if (me.isNull(list[i])) {
      } else {
        return false;
      }
    }
    return true;
  }
  /**
   * Empty包含空数组和空对象等,如[],{},""
   * @param list
   * @returns
   */
  public isAllEmpty(...list): boolean {
    const me = this;
    for (let i = 0; i < list.length; i++) {
      if (me.isEmpty(list[i])) {
      } else {
        return false;
      }
    }
    return true;
  }
  public isAnyNullAction<T>(
    obj: T,
    ...list: ((value: T) => unknown)[]
  ): boolean {
    const me = this;
    if (obj === null || obj === undefined) {
      return true;
    }
    for (let i = 0; i < list.length; i++) {
      if (me.isNull(list[i](obj))) {
        return true;
      }
    }
    return false;
  }
  public isAnyEmptyAction<T>(
    obj: T,
    ...list: ((value: T) => unknown)[]
  ): boolean {
    const me = this;
    if (obj === null || obj === undefined) {
      return true;
    }
    for (let i = 0; i < list.length; i++) {
      if (me.isEmpty(list[i](obj))) {
        return true;
      }
    }
    return false;
  }
  public resetForm(
    form: FormGroup,
    value?: any,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ) {
    Object.keys(form.controls).forEach((key) => {
      form.get(key).setErrors(null);
    });
    form.reset(value, options);
  }
  /**
   * 获得第一个form验证器里的第一个错误信息
   * @param error
   * @returns
   */
  public getFormFirstErrorMessage(error: ValidationErrors) {
    const me = this;
    const message = (validator: ValidationErrors, key: string): string => {
      switch (key) {
        case 'required':
          return '必填';
        case 'pattern':
          return '值不匹配正则';
        case 'minlength':
          return '最少' + validator[key]['requiredLength'] + '个字符';
        case 'maxlength':
          return '最多' + validator[key]['requiredLength'] + '个字符';
      }

      switch (typeof validator[key]) {
        case 'string':
          return <string>validator[key];
        default:
          return `验证失败: ${key}`;
      }
    };
    const r = Object.keys(error)
      .map((k) => message(error, k))
      .filter((a) => '' !== a);
    if (!me.isListEmpty(r)) {
      return r[0];
    }
    return '';
  }

  //var pfIFrameMessageHandlers = {};
  /**
 * 全能的跨域方式
 *
 * 用法:
 * 监听的页面:
 *    
      $pf.scrossMessageListen(window);
      $pf.addIFrameMessageListener("getWater", function (data) {
        return data + "_" + $("#txt01").val();
      });
   发出消息的页面:
        $goBtn3.click(function () {
          $pf.getMessageFromWindow(
            window.parent,  //或document.getElementById("targetUrl").contentWindow,
            "getWater",
            $("#txt01").val(),
            function (datapi) {
              alert("getWater_" + datapi);
            }
          );
        });
 *
 * @param {*} dataName
 * @param {*} callback
 */
  public addIFrameMessageListener(dataName, callback) {
    this.pfIFrameMessageHandlers[dataName] = callback;
  }
  public removeIFrameMessageListener(dataName) {
    delete this.pfIFrameMessageHandlers[dataName];
  }

  public scrossMessageListen(win) {
    const me = this;
    win.addEventListener('message', function (event) {
      //alert("message appear");
      for (var dataName in me.pfIFrameMessageHandlers) {
        if (
          me.pfIFrameMessageHandlers.hasOwnProperty(dataName) &&
          event.data.hasOwnProperty(dataName)
        ) {
          event.source.postMessage(
            {
              ['response_' + dataName]: me.pfIFrameMessageHandlers[dataName](
                event.data[dataName]
              ),
            },
            '*'
          );
        }
      }
    });
  }

  public getMessageFromWindow(win, dataName, dataValue, callback) {
    const me = this;
    var responseDataName = 'response_' + dataName;
    me.addIFrameMessageListener(responseDataName, function (data) {
      callback(data);
      me.removeIFrameMessageListener(responseDataName);
    });
    win.postMessage({ [dataName]: dataValue }, '*');
  }

  // public static getLocalizedText(...strings: string[]) {
  //   return strings.join();
  // }
}

export function t(strings: TemplateStringsArray, ...expr: any[]): string {
  let r = strings.toString();
  if (expr !== null && expr !== undefined) {
    r += expr.map((a) => a.toString()).join();
  }
  return r;
}

interface ProcedureLink<T> {
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
export class ProcedureManager<T> {
  nodes: T[] = []; // 格式如{procedureId,from:[],to:[]}
  links: ProcedureLink<T>[] = []; // 格式如[{ source: node, target: node }]
  constructor(
    protected key: string,
    protected from: string,
    protected to: string
  ) {}
  public getNode(v): T {
    const me = this;
    for (const nd of me.nodes) {
      if (v === nd[me.key]) {
        return nd;
      }
    }
    return null;
  }
  public addProcedure(node): void {
    const me = this;
    me.nodes.push(node);

    for (const nd of node[me.from]) {
      const n = me.getNode(nd);
      if (n != null) {
        me.links.push({ source: n, target: node });

        if (n[me.to].findIndex((a) => a === node[me.key]) < 0) {
          // 新加节点时,是为true进入这里的,但由于edit页面加载时也是用addProcedure初始化数据库的数据,那么target里早就有关联了,所以不应再进入这里
          n[me.to].push(node[me.key]); // 必要
        }
      }
    }

    for (const nd of node[me.to]) {
      const n = me.getNode(nd);
      if (n != null) {
        me.links.push({ source: node, target: n });

        if (n[me.from].findIndex((a) => a === node[me.key]) < 0) {
          n[me.from].push(node[me.key]);
        }
      }
    }
  }

  /**
   * 编辑时要保留node的原有位置
   */
  public editProcedure(node): void {
    const me = this;
    let oldI = -1;
    for (let i = 0; i < me.nodes.length; i++) {
      if (node[me.key] === me.nodes[i][me.key]) {
        oldI = i;
      }
    }

    // 删线
    for (let b = me.links.length - 1; b >= 0; b--) {
      if (
        me.nodes[oldI][me.key] === me.links[b].source[me.key] ||
        me.nodes[oldI][me.key] === me.links[b].target[me.key]
      ) {
        me.links.splice(b, 1);
      }
    }

    // 删原node的相关from to
    for (const nd of me.nodes[oldI][me.from]) {
      const nd2 = me.getNode(nd);
      nd2[me.to] = nd2[me.to].filter((a) => a !== me.nodes[oldI][me.key]);
    }

    for (const nd of me.nodes[oldI][me.to]) {
      const n2 = me.getNode(nd);
      n2[me.from] = n2[me.from].filter((a) => a !== me.nodes[oldI][me.key]);
    }

    // 加线
    for (const nd of node[me.from]) {
      const n2 = me.getNode(nd);
      if (n2 != null) {
        me.links.push({ source: n2, target: node });
      }
    }

    for (const nd of node[me.to]) {
      const n2 = me.getNode(nd);
      if (n2 != null) {
        me.links.push({ source: node, target: n2 });
      }
    }

    // 加node的相关from to
    for (const nd of node[me.from]) {
      const n2 = me.getNode(nd);
      if (n2 != null) {
        n2[me.to].push(node[me.key]); // 必要
      }
    }

    for (const nd of node[me.to]) {
      const n = me.getNode(nd);
      if (n != null) {
        n[me.from].push(node[me.key]);
      }
    }

    // 替换node
    me.nodes.splice(oldI, 1, node);
  }

  public deleteProcedure = function (node: T) {
    const me = this;

    for (let i = me.nodes.length - 1; i >= 0; i--) {
      if (node[me.key] === me.nodes[i][me.key]) {
        me.nodes.splice(i, 1);
      } else {
        me.nodes[i].from = me.nodes[i].from.filter((a) => a !== node[me.key]);
        me.nodes[i].to = me.nodes[i].to.filter((a) => a !== node[me.key]);
      }
    }
    for (let i = me.links.length - 1; i >= 0; i--) {
      if (
        node[me.key] === me.links[i].source[me.key] ||
        node[me.key] === me.links[i].target[me.key]
      ) {
        me.links.splice(i, 1);
      }
    }
  };

  /** @deprecated */
  public deleteLinkByKey(l: string, r: string): void {
    const me = this;
    for (let i = me.links.length - 1; i >= 0; i--) {
      if (
        l === me.links[i].source[me.key] &&
        r === me.links[i].target[me.key]
      ) {
        me.links.splice(i, 1);
      }
    }
    const ln = me.getNode(l);
    ln[me.to] = ln[me.to].filter((a) => a !== r);
    const rn = me.getNode(r);
    rn[me.from] = rn[me.from].filter((a) => a !== l);
  }

  public deleteLink(l: T, r: T): void {
    const me = this;
    for (let i = me.links.length - 1; i >= 0; i--) {
      if (
        l[me.key] === me.links[i].source[me.key] &&
        r[me.key] === me.links[i].target[me.key]
      ) {
        me.links.splice(i, 1);
      }
    }
    const ln = me.getNode(l[me.key]);
    ln[me.to] = ln[me.to].filter((a) => a !== r[me.key]);
    const rn = me.getNode(r[me.key]);
    rn[me.from] = rn[me.from].filter((a) => a !== l[me.key]);
  }

  public addLink(l: T, r: T): void {
    const me = this;
    for (let i = me.links.length - 1; i >= 0; i--) {
      if (
        l[me.key] === me.links[i].source[me.key] &&
        r[me.key] === me.links[i].target[me.key]
      ) {
        return; // 存在则不加
      }
    }
    const ln = me.getNode(l[me.key]);
    ln[me.to].push(r[me.key]);
    const rn = me.getNode(r[me.key]);
    rn[me.from].push(l[me.key]);
    me.links.push({ source: l, target: r });
  }

  public getLinks(): ProcedureLink<T>[] {
    const me = this;
    return me.links;
  }

  public getNodes(): T[] {
    const me = this;
    return me.nodes;
  }

  public empty() {
    const me = this;
    me.links = [];
    me.nodes = [];
  }

  public printContent() {
    const me = this;
  }
}
