import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
//import { any } from "list";
import { NzMessageService } from 'ng-zorro-antd/message';
//import { forkJoin, Observable } from "rxjs";
import { KeyValuePair } from '../../common/pfModel';
import { PfUtil } from '../../common/pfUtil';
//import { PageResult } from "../../../../../../core/services/app-reference.service";
import {
  DataColumnModel,
  DataTableModel,
  DataTableUIModel,
} from '../../model/data-integration';
//import { ComputesReferenceService } from "../../../../core/services/computes-reference.service";
import {
  //CompoundFilter,
  ConcreteField,
  FieldLiteral,
  FilterClause,
  StructuredQuery,
} from '../model/Query';
import { KeyValuePairT, SqlQueryUtil } from '../sql-query-util';
import { NzIconService } from 'ng-zorro-antd/icon';
//import { PfSvgIconPathDirective } from "../../share/pf-svg-icon/pf-svg-icon-path.directive";
//import * as AGGREGATION from "../lib/query/aggregation";
import { STANDARD_AGGREGATIONS } from '../lib/expressions/config';

import {
  setCaretPosition,
  getSelectionPosition,
  isObscured,
  saveSelection,
} from '../lib/dom';
import { parse } from '../lib/expressions/parser';
import { processSource } from '../lib/expressions/process'; //暂时未能移植此类--benjamin todo
//import memoize from "lodash.memoize";
import StructuredQueryClass from '../metabase-lib/lib/queries/StructuredQueryClass';
import { format } from '../lib/expressions/format';

//测试可用的包
export * from '../lib/expressions/config';

// import Dimension from "../../metabase-lib/lib/Dimension";
//import { FK_SYMBOL } from "../lib/formatting"; //引用报错--benjamin todo
import {
  isCoordinate,
  isDate,
  //isDateWithoutTime,
  isEmail,
  isLatitude,
  isLongitude,
  isNumber,
  isTime,
  isURL,
} from '../lib/schema_metadata';
import { parseTime, parseTimestamp } from '../lib/time';
// // import { rangeForValue } from "metabase/lib/dataset";
// // import { getFriendlyName } from "metabase/visualizations/lib/utils";
// // import { decimalCount } from "metabase/visualizations/lib/numeric";

// // import {
// //   clickBehaviorIsValid,
// //   getDataFromClicked,
// // } from "metabase/lib/click-behavior";

import {
  DEFAULT_DATE_STYLE,
  DEFAULT_TIME_STYLE,
  getDateFormatFromStyle,
  getTimeFormatFromStyle,
  hasHour,
  DateStyle,
  TimeEnabled,
  TimeStyle,
} from '../lib/formatting/date';

import type { Column, Value } from '../model/Dataset';
import type { DatetimeUnit } from '../model/Query';
import type { Moment } from '../metabase-types/types';
//import Field from "../metabase-lib/lib/metadata/Field"; //引用报错--benjamin todo

import Base from '../metabase-lib/lib/metadata/Base';
import PfQuestion from '../metabase-lib/lib/PfQuestion';
import PfStructuredQueryClass from '../metabase-lib/lib/queries/PfStructuredQueryClass';
import { Observable, Subject } from 'rxjs';
import FieldClass from '../metabase-lib/lib/metadata/FieldClass';
//import Table from "../metabase-lib/lib/metadata/Table"; //引用报错--benjamin todo

//import Base from "./Base";

// import { singularize } from "../../../lib/formatting";
// import { getAggregationOperatorsWithFields } from "../../../lib/schema_metadata";
// import { memoize, createLookupByProperty } from "../utils";

// //import moment from "moment";

// import Dimension from "../Dimension";

// // import { formatField, stripId } from "metabase/lib/formatting";
// // import { getFieldValues } from "metabase/lib/query/field";
// import { formatField, stripId } from "../../../lib/formatting";
// import { getFieldValues } from "../../../lib/query/field";
// import {
//   isDate,
//   isTime,
//   isNumber,
//   isNumeric,
//   isBoolean,
//   isString,
//   isSummable,
//   isCategory,
//   isAddress,
//   isCity,
//   isState,
//   isZipCode,
//   isCountry,
//   isCoordinate,
//   isLocation,
//   isDimension,
//   isMetric,
//   isPK,
//   isFK,
//   isEntityName,
//   getIconForField,
//   getFilterOperators,
// } from "../../../lib/schema_metadata";

// //import type { FieldValues } from "metabase/meta/types/Field";
// import type { FieldValues } from "../../../model/Field";
// import dayjs from "dayjs";

// import {
//   OPERATORS,
//   FUNCTIONS,
//   EDITOR_QUOTES,
//   EDITOR_FK_SYMBOLS,
//   getMBQLName,
// } from "../lib/expressions/config";

/**
 * 此组件是要取代未能完全移值的metabase的PfExpressionFieldComponent 自定义表达式组件
 * 从filter-step改过来
 */
@Component({
  selector: 'pf-expression-field-jq',
  templateUrl: './pf-expression-field-jq.component.html',
  styleUrls: ['./pf-expression-field-jq.component.scss'],
})
export class PfExpressionFieldJqComponent implements OnInit {
  @Input() public isFirstFloor: boolean = false;
  @Input() public databaseId: number = null;
  /**
   * 格式如:
  ["and", ["=", ["field-id", 276], "967122"],
	    		["=", ["field-id", 274], true],
			    ["=", ["joined-field", "chinese_city", ["field-id", 249]], "临沂市"],
			    ["=", ["field-id", 149], "上海分公司"]
   */
  @Input() public query: StructuredQuery = null;
  @Input() public queryClass: PfStructuredQueryClass = null; //metabase很多处理都用此类型来获得可选结构，可以取代之前用的fieldList方式，但性能会降低
  //@Input() public queryClass: any = null; //metabase很多处理都用此类型来获得可选结构，可以取代之前用的fieldList方式，但性能会降低
  //@Input() public filter: any[] = [];
  /**
   * 这个属性是一定要的,因为递归用自身时会传子级进来
   * 这里相当于aggregation-options内部的配置,如:
   * ["+", ["avg", ["field-id", 119]], ["max", ["field-id", 128]]]
   */
  //@Input() public filter: FilterClause = [];
  @Input() public expressionOption: any[] = null;
  //@Input() public invalid: boolean = false;

  /**
   * 当query是嵌套时，需要通过此事件来通知父组件更新query中的filter, 否则query的filter不会更新。（未知有无更好办法)
   */
  @Output() public expressionOptionChange = new EventEmitter(); //命名一定要是上面的字段名后加Change
  //@Output() public invalidChange = new EventEmitter(); //命名一定要是上面的字段名后加Change

  /**
   * 因为递归都要用到字段list来显示field的name,所以还是Input传递好了
   * 而且fieldList在此组件内是不会被修改的,所以最好从sql-query-area传进来(算了,第一次递归的时候查出来吧)
   *
   * filter的值有3种情况：
   * 1. [xxx,and,xxx,or...]
   * 2.[bracket,[]]
   */
  @Input() fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = []; //结构如 [{tb,cols}]
  /**
   * 内层source-query中的聚合输出字段(外层传入比较好)
   */
  @Input() sourceOutFieldList: FieldLiteral[] = []; //ConcreteField
  //@Output() public filterChange = new EventEmitter(); //命名一定要是上面的字段名后加Change
  // /**
  //  * 为了删除本节点,
  //  */
  // @Input() public filterParent: any[] = [];
  // @Input() public filterIdx: any[] = [];
  @Input() public testCnt: number = 0;
  @Output() deleteStep = new EventEmitter<any>();

  //metabase的ExpressionEditorTextfield组件使用到的属性
  @Input() startRule: string = 'expression'; //默认expression,汇总组件中使用时为aggregation
  @Input() startRenderByExpression$: Observable<any[]>;

  isAdd = true;
  // addAndOr = "and";
  mark = '';
  addStep: string = 'andOr';

  addingColumn?: DataColumnModel = null;
  addingTable?: DataTableUIModel = null;
  isAddingBracket?: boolean = false;
  addingSourceOutField?: FieldLiteral = null;
  //tableList: DataTableModel[] = [];
  //fieldList:KeyValuePair[]=[];

  compare: string = '=';
  // /**
  //  * 为了编辑时绑定值
  //  */
  // compareValue: string = "";
  // compareList: KeyValuePair[] = [
  //   { key: "=", value: "是" },
  //   { key: "!=", value: "不是" },
  //   { key: "contains", value: "包含" },
  //   { key: "does-not-contain", value: "不包含" },
  //   { key: "is-null", value: "为空" },
  //   { key: "not-null", value: "不为空" },
  //   { key: "starts-with", value: "以...开始" },
  //   { key: "ends-with", value: "以...结束" },

  //   // { key: "=", value: "是" },
  //   // { key: "!=", value: "不是" },
  //   // { key: "contains", value: "包含" },
  //   // { key: "does-not-contain", value: "不包含" },
  //   // { key: "is-null", value: "为空" },
  //   // { key: "not-null", value: "不为空" },
  //   // { key: "starts-with", value: "以...开始" },
  //   // { key: "ends-with", value: "以...结束" },
  // ];

  /**
   * 如果不双向绑定1个变量,那后面if的过滤就只会在input失去焦点时才触发
   */
  searchText = '';

  private expressionField: any = null;

  private source: string = '';
  private syntaxTree: any[] = null;
  public invalid = false;
  public invalidMessage: string = '';
  /**
   * 由于contenteditable的div没有change事件,试试比对上次的值,看看效果怎样
   * 实测这种方法解决不了中文输入中也会触发事件的问题
   */
  private lastSource: string = '';

  //测试用的属性
  public testExpressionString: string = '';
  public testSource: string = '';
  public testSyntaxTreeString: string = '';
  public testParseResult: string = '';

  public suggestions: any[] = [];

  startOpenSuggest$: Subject<any> = new Subject();
  startOpenSuggestIfClosed$: Subject<any> = new Subject();
  startCloseSuggest$: Subject<void> = new Subject();

  private lastExpressionOption = '';
  constructor(
    //private reference: ComputesReferenceService,
    public el: ElementRef,
    private msg: NzMessageService,
    private sqlQueryUtil: SqlQueryUtil,
    public pfUtil: PfUtil,
    private iconService: NzIconService, //private renderer: Renderer2
    private renderer: Renderer2
  ) {
    const me = this;
    // this._processSource = memoize(processSource, ({ source, targetOffset }) =>
    //   // resovle should include anything that affect the results of processSource
    //   // except currently we exclude `startRule` and `query` since they shouldn't change
    //   [source, targetOffset].join(",")
    // );

    // me.queryClass = new PfStructuredQueryClass(
    //   new PfQuestion(),
    //   {
    //     type: "query",
    //     database: me.databaseId,
    //     query: me.query,
    //     parameters: null,
    //     version: "perfect",
    //   },
    //   pfUtil
    // );

    // //this.iconService.addIconLiteral("ng-zorro:antd", ngZorroIconLiteral);
    // this.iconService.addIconLiteral(
    //   "pfIcon:LEFT_JOIN",
    //   // '<svg viewBox="0 0 32 32" >' +
    //   //   PfSvgIconPathDirective.systemIconType.SQL_LEFT_JOIN +
    //   //   "</svg>"
    //   PfSvgIconPathDirective.getSvg("SQL_LEFT_JOIN")
    // );

    //this.el.nativeElement.draggable = true;
    //me.el.nativeElement.ownerDocument.getElementById("xx");

    // let dom = me.el.nativeElement.querySelector(".pf-expression-field-jq-edit"); //当只有一个match时,返回的是对象不是数组
    // console.info("---------pf-expression-field-jq-----------");
    // console.info(dom);
    // console.info("---------pf-expression-field-jq end-----------");
    // //this.renderer.
    // //me.generateDomByOption(dom, me.expressionOption);
  }

  // /**
  //  *
  //  * @param dom
  //  * @param o
  //  * @returns
  //  * @deprecated 改用syntaxTree生成
  //  */
  // private generateDomByOption(dom, o) {
  //   const me = this;
  //   if (me.pfUtil.isAnyNull(o)) {
  //     return;
  //   }
  //   //debugger;
  //   if (me.isThatBinaryOperation(o)) {
  //     let p = me.renderer.createElement("span");
  //     me.renderer.addClass(p, "Expression-node");
  //     me.renderer.addClass(p, "Expression-math");
  //     let m = me.renderer.createElement("span");

  //     m.innerHTML = o[0];
  //     for (let i = 1; i < o.length; i++) {
  //       if (i > 1) {
  //         let space = me.renderer.createElement("span");
  //         me.renderer.addClass(space, "Expression-node");
  //         me.renderer.addClass(space, "Expression-whitespace");
  //         space.innerHTML = "&nbsp;";
  //         me.renderer.appendChild(p, space);
  //         me.renderer.appendChild(p, m);
  //         me.renderer.appendChild(p, space.cloneNode(true));
  //       }
  //       me.generateDomByOption(p, o[i]);
  //     }
  //     // me.generateDomByOption(p,o[1]);
  //     // me.renderer.appendChild(p, m);
  //     // me.generateDomByOption(p,o[2]);
  //     me.renderer.appendChild(dom, p);
  //   } else if (me.sqlQueryUtil.isMainTableField(o)) {
  //     let p = me.renderer.createElement("span");
  //     me.renderer.addClass(p, "Expression-node");
  //     me.renderer.addClass(p, "Expression-identifier");
  //     p.innerHTML = "[" + me.getFieldFullName(o) + "]";
  //     me.renderer.appendChild(dom, p);
  //   } else if (
  //     // false
  //     STANDARD_AGGREGATIONS.has(o[0])
  //     //&&AGGREGATION.isStandard(o)
  //   ) {
  //     //debugger;
  //     let p = me.renderer.createElement("span");
  //     me.renderer.addClass(p, "Expression-node");
  //     me.renderer.addClass(p, "Expression-aggregation");
  //     let m = me.renderer.createElement("span");
  //     me.renderer.addClass(m, "Expression-function-name");
  //     m.innerHTML = o[0];

  //     let g = me.renderer.createElement("span");
  //     me.renderer.addClass(g, "Expression-node");
  //     me.renderer.addClass(g, "Expression-group");

  //     let bracket1 = me.renderer.createElement("span");
  //     me.renderer.addClass(bracket1, "Expression-node");
  //     me.renderer.addClass(bracket1, "Expression-open-paren");
  //     bracket1.innerHTML = "(";
  //     let bracket2 = me.renderer.createElement("span");
  //     me.renderer.addClass(bracket2, "Expression-node");
  //     me.renderer.addClass(bracket2, "Expression-close-paren");

  //     bracket2.innerHTML = ")";

  //     me.renderer.appendChild(g, bracket1);
  //     me.generateDomByOption(g, o[1]);
  //     me.renderer.appendChild(g, bracket2);

  //     me.renderer.appendChild(p, m);
  //     me.renderer.appendChild(p, g);
  //     me.renderer.appendChild(dom, p);

  //     // me.renderer.listen(bracket2, "keyUp", (e) => {
  //     //   //alert(e.keyCode);
  //     //   "---------pf-expression-field-jq inner span keyUp-----------";
  //     //   console.info(e.keyCode);
  //     // });
  //   }
  // }
  private generateDomBySyntaxTree(syntaxTree) {
    const me = this;
    if (me.pfUtil.isAnyNull(syntaxTree)) {
      return null;
    }
    let span = me.renderer.createElement('span');
    me.renderer.addClass(span, 'Expression-node');
    me.renderer.addClass(span, 'Expression-' + syntaxTree.type);
    if (syntaxTree.tokenized) {
      me.renderer.addClass(span, 'Expression-tokenized');
    }
    if (syntaxTree.text != null) {
      span.innerHTML = syntaxTree.text;
    } else if (!me.pfUtil.isAnyNull(syntaxTree.children)) {
      for (let i = 0; i < syntaxTree.children.length; i++) {
        let child = me.generateDomBySyntaxTree(syntaxTree.children[i]);
        if (null !== child) {
          me.renderer.appendChild(span, child);
        }
      }
    }
    return span;
  }
  private refreshDomByTree(syntaxTree) {
    const me = this;
    if (null !== me.expressionField) {
      me.expressionField.innerHTML = '';
      let span = me.generateDomBySyntaxTree(syntaxTree);
      if (null !== span) {
        me.renderer.appendChild(me.expressionField, span);
      }
      //me.msg.info("生成dom");
    }
  }
  // private generateDomByOption(dom, o) {
  //   const me = this;
  //   if (me.isThatBinaryOperation(o)) {
  //     let p = me.renderer.createElement("span");
  //     me.renderer.addClass(p, "Expression-node");
  //     me.renderer.addClass(p, "Expression-math");
  //     let m = me.renderer.createElement("span");
  //     m.innerHTML = o[0];
  //     me.renderer.appendChild(p, me.generateDomByOption());
  //     me.renderer.appendChild(p, m);
  //     me.renderer.appendChild(dom, p);
  //   }
  // }

  /**
   * 是否2元运算
   * @returns
   */
  isBinaryOperation() {
    const me = this;
    // return (
    //   ["=", "!=", ">", ">=", "<", "<="].indexOf(
    //     (me.expressionOption as any)[0]
    //   ) > -1
    // );
    return (
      ['=', '!=', '>', '>=', '<', '<=', '+', '-'].indexOf(
        (me.expressionOption as any)[0]
      ) > -1
    );
  }
  isThatBinaryOperation(o) {
    const me = this;
    if (me.pfUtil.isAnyNull(o)) {
      return false;
    }
    // return (
    //   ["=", "!=", ">", ">=", "<", "<="].indexOf(
    //     (me.expressionOption as any)[0]
    //   ) > -1
    // );
    return (
      ['=', '!=', '>', '>=', '<', '<=', '+', '-'].indexOf((o as any)[0]) > -1
    );
  }
  ngOnInit(): void {
    var me = this;
    //console.info(me.filter);
    if (!me.pfUtil.isAnyNull(me.startRenderByExpression$)) {
      me.startRenderByExpression$.subscribe((expression) => {
        me.renderByExpression(expression);
      });
    }
  }
  ngAfterViewInit() {
    var me = this;
    let dom = me.el.nativeElement.querySelector('.pf-expression-field-jq-edit'); //当只有一个match时,返回的是对象不是数组
    me.expressionField = dom;
    // console.info("---------pf-expression-field-jq ngAfterViewInit-----------");
    // console.info(dom);
    // console.info(
    //   "---------pf-expression-field-jq ngAfterViewInit end-----------"
    // );

    // me.generateDomByOption(dom, me.expressionOption);

    //debugger;
    setTimeout(function () {
      //不延迟的话,有时会报错:ERROR Error: NG0100: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked
      //debugger;
      me.source = me.expressionToSource(me.expressionOption);
      let syntaxTreeObj = me.sourceToSyntaxTree(me.source);
      me.syntaxTree = syntaxTreeObj.syntaxTree;
      //debugger;
      me.refreshDomByTree(me.syntaxTree);
    }, 500);
    // // me.renderer.listen(dom, "keyup", (e) => {
    // //   //alert(e.keyCode);
    // //   console.info(
    // //     "---------pf-expression-field-jq ngAfterViewInit keyUp-----------"
    // //   );
    // //   console.info(e.keyCode);
    // // });
    // // me.renderer.listen(dom, "click", (e) => {
    // //   // //alert(e.keyCode);
    // //   // console.info(
    // //   //   "---------pf-expression-field-jq ngAfterViewInit click-----------"
    // //   // );
    // //   // console.info(e.keyCode);
    // //   //debugger;
    // //   me.onCusorChange(0, 0);
    // // });
    // me.renderer.listen(dom, "blur", (e) => {
    //   // //alert(e.keyCode);
    //   // console.info(
    //   //   "---------pf-expression-field-jq ngAfterViewInit click-----------"
    //   // );
    //   // console.info(e.keyCode);
    //   //debugger;
    //   // me.parseExpression();

    //   let source = me.expressionField.innerText;
    //   if (true || me.source !== source) {
    //     //如果值没改变,就不刷新dom
    //     //debugger;
    //     let tree = me.sourceToSyntaxTree(source);
    //     me.refreshDomByTree(tree.syntaxTree);
    //     // if (!me.pfUtil.isAnyNull(tree.compileError)) {
    //     //   me.invalid=!me.pfUtil.isAnyNull(tree.compileError);
    //     // }
    //     me.invalid = !me.pfUtil.isAnyNull(tree.compileError);
    //     if (me.invalid) {
    //       me.invalidMessage = tree.compileError.message;
    //     } else {
    //       me.expressionOptionChange.emit(tree.expression);
    //     }

    //     //debugger;
    //     me.source = source;
    //   }
    // });
    // // me.renderer.listen(dom, "keyup.enter", (e) => {
    // //   //alert(e.keyCode);
    // //   console.info(
    // //     "---------pf-expression-field-jq ngAfterViewInit enter-----------"
    // //   );
    // //   console.info(e.keyCode);
    // // });

    // // let testInput = me.el.nativeElement.querySelector(".testInput");
    // // me.renderer.listen(testInput, "keyup", (e) => {
    // //   //alert(e.keyCode);
    // //   console.info(
    // //     "---------pf-expression-field-jq ngAfterViewInit input keyUp-----------"
    // //   );
    // //   console.info(e.keyCode);
    // // });

    // // let testInput2 = me.el.nativeElement.querySelector(".testInput2");
    // // me.renderer.listen(testInput2, "keyup", (e) => {
    // //   //alert(e.keyCode);
    // //   console.info(
    // //     "---------pf-expression-field-jq ngAfterViewInit testInput2 keyUp-----------"
    // //   );
    // //   console.info(e.keyCode);
    // // });
    // // me.renderer.listen(testInput2, "keydown", (e) => {
    // //   //alert(e.keyCode);
    // //   console.info(
    // //     "---------pf-expression-field-jq ngAfterViewInit testInput2 keydown-----------"
    // //   );
    // //   console.info(e.keyCode);
    // // });

    // // let span = dom.querySelectorAll("span");
    // // //debugger;
    // // for (let i = 0; i < span.length; i++) {
    // //   me.renderer.listen(span[i], "keyup", (e) => {
    // //     //alert(e.keyCode);
    // //     console.info(
    // //       "---------pf-expression-field-jq ngAfterViewInit span keyUp-----------"
    // //     );
    // //     console.info(e.keyCode);
    // //   });
    // // }

    // me.renderer.listen("window", "keyup", (e) => {
    //   //复制粘贴时好像会进入这里,需验证
    //   //alert(e.keyCode);
    //   console.info(
    //     "---------pf-expression-field-jq ngAfterViewInit window keyUp-----------"
    //   );
    //   console.info(e.keyCode);
    //   const [start, end] = getSelectionPosition(me.expressionField); //0 0 时为没在范围内
    //   if (0 === start && 0 === end) {
    //     //因为事件是在window上的,所以这里认为与本插件无关
    //   } else {
    //     me.onCusorChange(start, end);
    //     //debugger;
    //   }
    // });
    // // setTimeout(function () {
    // //   let dom2 = me.el.nativeElement.querySelector(
    // //     ".pf-expression-field-jq-edit"
    // //   ); //当只有一个match时,返回的是对象不是数组
    // //   console.info(
    // //     "---------pf-expression-field-jq ngAfterViewInit 2-----------"
    // //   );
    // //   console.info(dom2);
    // //   console.info(
    // //     "---------pf-expression-field-jq ngAfterViewInit 2 end-----------"
    // //   );
    // // }, 1000);
    // // this.greetDiv.nativeElement.style.backgroundColor = 'red';

    // // this.renderer.setStyle(
    // //   this.greetDiv.nativeElement,
    // //   "backgroundColor",
    // //   "red"
    // // );
  }

  ngOnChanges() {
    const me = this;
    // me.source = me.expressionToSource(me.expressionOption);
    // let syntaxTreeObj = me.sourceToSyntaxTree(me.source);
    // me.syntaxTree = syntaxTreeObj.syntaxTree;
    // //debugger;
    // me.refreshDomByTree(me.syntaxTree);

    //在ngOnChanges里渲染树,怎么都觉得不对,因为Accept时会触发ngOnChanges,当expression再次转为source时,source有可能和编辑中的source不一样,如Max()变成了Max
    // if (me.pfUtil.isAllNull(me.expressionOption)) {
    //   me.lastExpressionOption = "";
    // } else {
    //   let thisTime = JSON.stringify(me.expressionOption);
    //   if (thisTime !== me.lastExpressionOption) {
    //     me.lastExpressionOption = thisTime;
    //     setTimeout(function () {
    //       //不延迟的话,有时会报错:ERROR Error: NG0100: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked
    //       //debugger;
    //       me.source = me.expressionToSource(me.expressionOption);
    //       let syntaxTreeObj = me.sourceToSyntaxTree(me.source);
    //       me.syntaxTree = syntaxTreeObj.syntaxTree;
    //       debugger;
    //       me.refreshDomByTree(me.syntaxTree);
    //     }, 0);
    //   }
    // }

    // setTimeout(function () {
    //   //不延迟的话,有时会报错:ERROR Error: NG0100: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked
    //   //debugger;
    //   me.source = me.expressionToSource(me.expressionOption);
    //   let syntaxTreeObj = me.sourceToSyntaxTree(me.source);
    //   me.syntaxTree = syntaxTreeObj.syntaxTree;
    //   //debugger;
    //   me.refreshDomByTree(me.syntaxTree);
    // }, 500);

    //me.msg.info("ngOnChanges");
  }
  private renderByExpression(expression) {
    var me = this;
    me.source = me.expressionToSource(expression);
    let tree = me.sourceToSyntaxTree(me.source);
    me.syntaxTree = tree.syntaxTree;
    //debugger;
    me.refreshDomByTree(me.syntaxTree);
    me.invalid = me.isSyntaxTreeInvalid(tree);
  }
  private isSyntaxTreeInvalid(tree) {
    const me = this;
    return !me.pfUtil.isAnyNull(tree.compileError);
    // if (me.invalid) {
    //   me.invalidMessage = tree.compileError.message;
    // } else {
    //   me.expressionOptionChange.emit(tree.expression);
    // }
  }
  public onFieldBlur(e) {
    const me = this;
    // //alert(e.keyCode);
    // console.info(
    //   "---------pf-expression-field-jq ngAfterViewInit click-----------"
    // );
    // console.info(e.keyCode);
    //debugger;
    // me.parseExpression();

    let source = me.expressionField.innerText;
    if (true || me.source !== source) {
      //如果值没改变,就不刷新dom
      //debugger;
      let tree = me.sourceToSyntaxTree(source);
      me.refreshDomByTree(tree.syntaxTree);
      // if (!me.pfUtil.isAnyNull(tree.compileError)) {
      //   me.invalid=!me.pfUtil.isAnyNull(tree.compileError);
      // }
      //me.invalid = !me.pfUtil.isAnyNull(tree.compileError);
      me.invalid = me.isSyntaxTreeInvalid(tree);

      if (me.invalid) {
        me.invalidMessage = tree.compileError.message;
      } else {
        me.expressionOptionChange.emit(tree.expression);
      }

      //debugger;
      me.source = source;
    }
    me.startOpenSuggest$.next(me.expressionField); //测试先写这里--benjamin todo
  }

  public onFieldClick(e) {
    const me = this;
    //debugger;
    //me.msg.info("mouseClick");

    //这里有个bug,当选择suggest之后,再点击编辑框进入这里时saveSelection的位置不对,猜想是未focus的问题(但加了下面一句也不行)--benjamin todo
    //猜想解决办法应该是:当selection的范围在expressionField外面时,end=end-1  --benjamin todo
    //me.expressionField.focus();
    me.validSourceAndRerender(me.expressionField.innerText); //这里会修复光标位置,感觉在onFieldClick时不需要(后来觉得好像又需要,因为dom的刷新了,光标默认是会回到起点)
    // let source = me.expressionField.innerText;
    // if (true || me.source !== source) {
    //   const restore = saveSelection(me.expressionField);
    //   //如果值没改变,就不刷新dom
    //   //debugger;
    //   let tree = me.sourceToSyntaxTree(source);
    //   me.refreshDomByTree(tree.syntaxTree);

    //   me.invalid = !me.pfUtil.isAnyNull(tree.compileError);
    //   if (me.invalid) {
    //     me.invalidMessage = tree.compileError.message;
    //   } else {
    //     me.expressionOptionChange.emit(tree.expression);
    //   }

    //   //debugger;
    //   me.source = source;

    //   // setTimeout(function () {
    //   //   //if (document.activeElement === inputNode) {
    //   //   restore();
    //   //   //}
    //   // }, 0);
    // }

    // const showSuggestions = !me.pfUtil.isAnyNull(me.suggestions);
    // if (showSuggestions) {
    //   // me.startOpenSuggest$.next(me.expressionField);
    //   me.startOpenSuggestIfClosed$.next(me.expressionField);
    // } else {
    //   me.startCloseSuggest$.next();
    // }
  }
  // public onFieldChange(e) {
  //   //似乎div上没有此事件
  //   const me = this;
  //   //debugger;
  //   me.msg.info("onFieldChange");
  // }
  private doing: boolean = false;
  /**
   * 注意此方法会修正光标,并弹出提示框
   * @param source
   */
  private validSourceAndRerender(source: string) {
    const me = this;
    //let source = me.expressionField.innerText;
    if (true || me.source !== source) {
      const restore = saveSelection(me.expressionField);
      //如果值没改变,就不刷新dom
      //debugger;
      let tree = me.sourceToSyntaxTree(source);
      me.refreshDomByTree(tree.syntaxTree);

      me.invalid = !me.pfUtil.isAnyNull(tree.compileError);
      if (me.invalid) {
        me.invalidMessage = tree.compileError.message;
      } else {
        me.expressionOptionChange.emit(tree.expression);
      }

      //debugger;
      me.source = source;

      setTimeout(function () {
        //if (document.activeElement === inputNode) {
        restore();
        //}
      }, 0);
    }

    const showSuggestions = !me.pfUtil.isAnyNull(me.suggestions);
    if (showSuggestions) {
      // me.startOpenSuggest$.next(me.expressionField);
      me.startOpenSuggestIfClosed$.next(me.expressionField);
    } else {
      me.startCloseSuggest$.next();
    }
  }
  // _triggerAutosuggest = () => {
  //   this.onExpressionChange(this.state.source);
  // };
  // _setCaretPosition = (position, autosuggest) => {
  //   const me = this;
  //   setCaretPosition(me.expressionField, position);
  //   if (autosuggest) {
  //     setTimeout(() => this._triggerAutosuggest());
  //   }
  // };
  /**
   * 此方法是参考metabase frontend\src\metabase\query_builder\components\expressions\ExpressionEditorTextfield.jsx->onSuggestionAccepted()
   * @param suggestIdx
   */
  public onSuggestionAccepted = () => {
    const me = this;
    // const { source } = this.state;
    //const suggestion = this.state.suggestions[this.state.highlightedSuggestion];
    const suggestion = me.suggestions[me.highlightedSuggestion];

    if (suggestion) {
      let prefix = me.source.slice(0, suggestion.index);
      if (suggestion.prefixTrim) {
        prefix = prefix.replace(suggestion.prefixTrim, '');
      }
      let postfix = me.source.slice(suggestion.index);
      if (suggestion.postfixTrim) {
        postfix = postfix.replace(suggestion.postfixTrim, '');
      }
      if (!postfix && suggestion.postfixText) {
        postfix = suggestion.postfixText;
      }

      //metabase原版(原版这里实际有问题的,onExpressionChange执行了两次)
      //this.onExpressionChange(prefix + suggestion.text + postfix);
      // setTimeout(() =>
      //   this._setCaretPosition((prefix + suggestion.text).length, true)
      // );

      //let tree = me.sourceToSyntaxTree(prefix + suggestion.text + postfix);
      let newSource = prefix + suggestion.text + postfix;
      //me.validSourceAndRerender(newSource);
      let tree = me.sourceToSyntaxTree(newSource);
      //debugger;
      me.source = tree.source;

      /**
       * 点击suggest项目后再点保存按钮, 之间并不会触发blur事件,所以在此去掉失效标记是有必要的
       * 又由于是编辑中,所以不主动力设置为失效
       */
      let tmpInvalid = !me.pfUtil.isAnyNull(tree.compileError);
      if (tmpInvalid) {
        //me.invalidMessage = tree.compileError.message;
      } else {
        if (me.invalid) {
          me.invalid = false;
          me.invalidMessage = '';
        }
        me.expressionOptionChange.emit(tree.expression);
      }

      me.refreshDomByTree(tree.syntaxTree);

      // //this._setCaretPosition((prefix + suggestion.text).length, true);
      setCaretPosition(me.expressionField, (prefix + suggestion.text).length);
      // //注意只要上面执行了expressionOptionChange.emit,就会进入ngChange周期,视图会刷新,光标会丢掉
      // setTimeout(function () {
      //   //debugger;
      //   //setCaretPosition(me.expressionField, (prefix + suggestion.text).length);
      //   setCaretPosition(me.expressionField, 2);
      //   // const showSuggestions = !me.pfUtil.isAnyNull(me.suggestions);
      //   // if (showSuggestions) {
      //   //   //me.startOpenSuggest$.next(me.expressionField);//弹窗已是打开状态,不用再open
      //   // } else {
      //   //   //me.startCloseSuggest$.next();
      //   // }
      // }, 6000);
      // // if (autosuggest) {
      // //   setTimeout(() => this._triggerAutosuggest());
      // // }
    }

    // this.setState({
    //   highlightedSuggestion: 0,
    // });
    me.highlightedSuggestion = 0;
  };
  /**
   * metabase由于setState之后在回调里执行suggestAccept,所以才需要此参数,在这里其实可以去掉
   */
  private highlightedSuggestion: number = 0;
  onSuggestionMouseDown = (event, index) => {
    const me = this;
    // when a suggestion is clicked, we'll highlight the clicked suggestion and then hand off to the same code that deals with ENTER / TAB keydowns
    event.preventDefault();
    event.stopPropagation();

    // this.setState({ highlightedSuggestion: index }, this.onSuggestionAccepted);
    me.highlightedSuggestion = index;
    this.onSuggestionAccepted();
  };
  doSomething() {
    const me = this;
    //me.msg.info("onCompositionChange:" + me.expressionField.innerText);

    // let source = me.expressionField.innerText;
    // if (true || me.source !== source) {
    //   const restore = saveSelection(me.expressionField);
    //   //如果值没改变,就不刷新dom
    //   //debugger;
    //   let tree = me.sourceToSyntaxTree(source);
    //   me.refreshDomByTree(tree.syntaxTree);

    //   me.invalid = !me.pfUtil.isAnyNull(tree.compileError);
    //   if (me.invalid) {
    //     me.invalidMessage = tree.compileError.message;
    //   } else {
    //     me.expressionOptionChange.emit(tree.expression);
    //   }

    //   //debugger;
    //   me.source = source;

    //   setTimeout(function () {
    //     //if (document.activeElement === inputNode) {
    //     restore();
    //     //}
    //   }, 0);
    // }

    // const showSuggestions = !me.pfUtil.isAnyNull(me.suggestions);
    // if (showSuggestions) {
    //   me.startOpenSuggest$.next(me.expressionField);
    // } else {
    //   me.startCloseSuggest$.next();
    // }

    me.validSourceAndRerender(me.expressionField.innerText);
  }
  public onFieldInput(e) {
    //metabase中是用此事件来调用change方法
    const me = this;
    // // me.msg.info("onFieldInput");
    // if (me.lastSource === me.expressionField.innerText) {
    // } else {
    //   //debugger;
    //   let msg =
    //     "onFieldChange: old[" +
    //     me.lastSource +
    //     "] -> new[" +
    //     me.expressionField.innerText +
    //     "]";
    //   me.msg.info(msg);
    //   console.info(msg);
    //   console.info(me.expressionField);
    //   me.lastSource = me.expressionField.innerText;
    // }

    if (!me.doing) {
      me.doSomething();
    }
  }
  public onFieldCompositionstart(e) {
    const me = this;
    //me.msg.info("onFieldCompositionstart");
    me.doing = true;
  }
  public onFieldCompositionend(e) {
    const me = this;
    //me.msg.info("onFieldCompositionend");
    me.doing = false;
    me.doSomething();
  }
  private parseExpression() {
    const me = this;
    const [selectionStart, selectionEnd] = getSelectionPosition(
      me.expressionField
    ); //0 0 时为没在范围内
    let source = me.expressionField.innerText;

    const hasSelection = selectionStart !== selectionEnd;
    const isAtEnd = selectionEnd === source.length;
    const endsWithWhitespace = /\s$/.test(source);
    const targetOffset = !hasSelection ? selectionEnd : null;

    let options = {
      source,
      targetOffset,
      ...this._getParserOptions(),
    };
    //const { source, targetOffset } = options;

    let expression;
    let suggestions = [];
    let helpText;
    let syntaxTree;
    let compileError;

    // // PARSE
    // const {
    //   cst,
    //   tokenVector,
    //   parserErrors,
    //   //, typeErrors
    //   lexerErrors,
    // } = parse({
    //   ...options,
    //   recover: true,
    // });
    // let r = parse({
    //   ...options,
    //   recover: true,
    // });
    // debugger;
  }
  // private parseExpression2() {
  //   const me = this;
  //   const [selectionStart, selectionEnd] = getSelectionPosition(
  //     me.expressionField
  //   ); //0 0 时为没在范围内
  //   let source = me.expressionField.innerText;

  //   const hasSelection = selectionStart !== selectionEnd;
  //   const isAtEnd = selectionEnd === source.length;
  //   const endsWithWhitespace = /\s$/.test(source);
  //   const targetOffset = !hasSelection ? selectionEnd : null;

  //   let options = {
  //     source,
  //     targetOffset,
  //     ...this._getParserOptions(),
  //   };

  //   // debugger;
  //   // const { expression, compileError, syntaxTree } = processSource({
  //   //   source,
  //   //   ...this._getParserOptions(),
  //   // });
  //   // debugger;
  //   // console.info(expression);
  //   // console.info(compileError);
  //   // console.info(syntaxTree);
  // }
  public testExpressionToSource() {
    const me = this;
    const source = format(
      JSON.parse(me.testExpressionString),
      me._getParserOptions() as any
    );
    me.testSource = source;
    // parserOptions:
    // {query: StructuredQuery, startRule: 'aggregation'}
  }
  public testSome() {
    const me = this;
    // me.source = "aaabbb"; //测试ngchange有没有触发
    // me.msg.info(me.source);
    // setTimeout(function () {
    //   me.source = "bbbcccc"; //测试ngchange有没有触发
    //   me.msg.info(me.source);
    // }, 500);
    debugger;
    new FieldClass({ id: 11, id2: 22 });
  }
  public expressionToSource(expression) {
    const me = this;
    const source = format(expression, me._getParserOptions() as any);
    return source;
    //me.testSource = source;
    // parserOptions:
    // {query: StructuredQuery, startRule: 'aggregation'}
  }
  public testSourceToSyntaxTree() {
    const me = this;
    const [selectionStart, selectionEnd] = getSelectionPosition(
      me.expressionField
    ); //0 0 时为没在范围内
    //let source = me.expressionField.innerText;
    let source = me.testSource;

    const hasSelection = selectionStart !== selectionEnd;
    const isAtEnd = selectionEnd === source.length;
    const endsWithWhitespace = /\s$/.test(source);
    const targetOffset = !hasSelection ? selectionEnd : null;

    let options = {
      source,
      targetOffset,
      ...this._getParserOptions(),
    };

    // debugger;
    const { expression, compileError, syntaxTree } = processSource(options);
    // debugger;
    console.info(expression);
    console.info(compileError);
    console.info(syntaxTree);
    me.testSyntaxTreeString = JSON.stringify(syntaxTree);
  }
  /**
   * 此方法基本相当于metabase的onExpressionChange(source) 方法
   * @param source
   * @returns
   */
  public sourceToSyntaxTree(source: string) {
    const me = this;
    const [selectionStart, selectionEnd] = getSelectionPosition(
      me.expressionField
    ); //0 0 时为没在范围内
    //let source = me.expressionField.innerText;
    //let source = me.testSource;

    const hasSelection = selectionStart !== selectionEnd;
    const isAtEnd = selectionEnd === source.length;
    const endsWithWhitespace = /\s$/.test(source);
    //debugger;
    const targetOffset = !hasSelection ? selectionEnd : null;

    let options = {
      source,
      targetOffset,
      ...this._getParserOptions(),
    };

    // debugger;
    // const tree = processSource({
    //   source,
    //   ...this._getParserOptions(),
    // });
    const tree = processSource(options);

    // console.info(
    //   '---------------------------sourceToSyntaxTree--------------------------'
    // );
    // console.info(selectionEnd);
    // console.info(hasSelection);
    // console.info(targetOffset);
    // console.info(tree);
    if (!me.pfUtil.isAnyNull(tree.suggestions)) {
      me.suggestions = tree.suggestions;
    }

    //const isValid = !me.pfUtil.isAnyNull(tree.expression);
    // don't show suggestions if
    // * there's a selection
    // * we're at the end of a valid expression, unless the user has typed another space
    // const showSuggestions =
    //   !hasSelection && !(isValid && isAtEnd && !endsWithWhitespace);//metabase开源版本的写法

    return tree;
  }
  public testSourceToX() {
    const me = this;
    const [selectionStart, selectionEnd] = getSelectionPosition(
      me.expressionField
    ); //0 0 时为没在范围内
    let source = me.expressionField.innerText;

    const hasSelection = selectionStart !== selectionEnd;
    const isAtEnd = selectionEnd === source.length;
    const endsWithWhitespace = /\s$/.test(source);
    const targetOffset = !hasSelection ? selectionEnd : null;

    let options = {
      source,
      targetOffset,
      ...this._getParserOptions(),
    };
    //const { source, targetOffset } = options;

    let expression;
    let suggestions = [];
    let helpText;
    let syntaxTree;
    let compileError;

    console.info('aaaaaaaaaaaaaaaaaaaaaaa');
    // PARSE
    const {
      cst,
      tokenVector,
      parserErrors,
      //, typeErrors
      lexerErrors,
    } = parse({
      ...options,
      recover: true,
    });
    // debugger;
    // let r = parse({
    //   ...options,
    //   recover: true,
    // });
    // debugger;
    // me.testParseResult = JSON.stringify(r);
  }
  // private onCusorChange(selectionStart: number, selectionEnd: number) {
  //   const me = this;
  //   me.parseExpression();
  // }
  onExpressionChange(source) {
    const me = this;
    return me.sourceToSyntaxTree(source);
    // // const inputElement = ReactDOM.findDOMNode(this.refs.input);
    // const inputElement = me.el.nativeElement.querySelector(
    //   ".pf-expression-field-jq-edit"
    // );
    // // if (!inputElement) {
    // //   return;
    // // }

    // // console.info("benjamin_test_________________________onExpressionChange");
    // // console.info(source);

    // const [selectionStart, selectionEnd] = getSelectionPosition(inputElement);
    // const hasSelection = selectionStart !== selectionEnd;
    // const isAtEnd = selectionEnd === source.length;
    // const endsWithWhitespace = /\s$/.test(source);
    // const targetOffset = !hasSelection ? selectionEnd : null;

    // // const { expression, compileError, suggestions, helpText, syntaxTree } =
    // //   this._processSource({
    // //     source,
    // //     targetOffset,
    // //     ...this._getParserOptions({ query: me.query, startRule: me.startRule }),
    // //   });
    // // const { expression, compileError, suggestions, helpText, syntaxTree } =
    // //   processSource({
    // //     source,
    // //     targetOffset,
    // //     ...this._getParserOptions({ query: me.query, startRule: me.startRule }),
    // //   });

    // // debugger;
    // // const isValid = expression !== undefined;
    // // // don't show suggestions if
    // // // * there's a selection
    // // // * we're at the end of a valid expression, unless the user has typed another space
    // // const showSuggestions =
    // //   !hasSelection && !(isValid && isAtEnd && !endsWithWhitespace);

    // // this.setState({
    // //   source,
    // //   expression,
    // //   syntaxTree,
    // //   compileError,
    // //   suggestions: showSuggestions ? suggestions : [],
    // //   helpText,
    // // });
  }
  isArray(field): boolean {
    return field instanceof Array;
  }
  //metabase中,此方法用了memoize来优化--benjamin todo
  private _processSource: any = null;
  // private _processSource2({ source, targetOffset }) {
  //   return [source, targetOffset].join(",");
  // }
  // _getParserOptions(props) {
  //   return {
  //     query: props.query,
  //     startRule: props.startRule,
  //   };
  // }
  _getParserOptions(): {
    query: StructuredQueryClass;
    //query: any;
    startRule: string;
  } {
    const me = this;
    return {
      query: me.queryClass,
      startRule: me.startRule,
    };
  }
  // _getParserOptions2() {
  //   const me = this;
  //   return {
  //     query: me.query,
  //     startRule: me.startRule,
  //   };
  // }
  // deleteCompare(filter: any[]): void {
  //   const me = this;
  //   // filter.splice(0, filter.length);
  //   //debugger;
  //   me.deleteStep.emit(filter);

  //   //用删除的方法比较难,首先要知道parent,还要知道是parent的第几项
  //   // if(me.filterParent!=null&&me.filterParent.length>0){
  //   //   me.filterParent.
  //   // }
  //   // delete filter;
  // }
  deleteCompare(): void {
    const me = this;
    me.deleteStep.emit(); //由父级删除,因为数组结构的删除需要idx
  }
  onDelete(parentFilter: any[], idx: number, first: boolean): void {
    const me = this;
    // //debugger;

    // //parentFilter.splice(idx, 1);
    // //删除关系符
    // if (first) {
    //   if (idx + 1 < parentFilter.length) {
    //     parentFilter.splice(idx + 1, 1);
    //   } else {
    //     //删除完之后为空数组
    //     //benjamin todo
    //     me.deleteStep.emit();
    //   }
    //   parentFilter.splice(idx, 1);
    // } else {
    //   parentFilter.splice(idx, 1);
    //   parentFilter.splice(idx - 1, 1);
    // }
    me.sqlQueryUtil.deleteCompare(parentFilter, idx, first);
    if (0 === parentFilter.length) {
      me.deleteStep.emit();
    }
  }
  // onAdd(event: boolean) {
  //   var me = this;
  //   if (event) {
  //     me.addAndOr = "and";
  //     me.addStep = "andOr";
  //     // // me.addStep = "field"; //测试直接打开第二步,看看一拉会不会滚动
  //     // me.addCompare();
  //   }
  // }

  // initAddingParam() {
  //   const me = this;
  //   me.isAddingBracket = false;
  //   //me.compareValue = "";
  //   me.addingColumn = null;
  //   me.addingSourceOutField = null;
  //   //me.addAndOr = "and";
  //   // me.pfUtil.resetForm(
  //   //   me.fieldForm,
  //   //   { leftFieldId: "", rightFieldId: "" },
  //   //   { emitEvent: false }
  //   // );
  // }
  //showEditFieldPopups
  initEditingParam(filter) {
    const me = this;
    me.isAdd = false;
    // // this.msg.info("This is a normal message");
    // // console.info("This is a normal message");
    // //addFilterPopups.open(btn);
    // me.addAndOr = filter[0];
    // me.compareValue = filter[2];
    // me.addStep = "compare";
    // //debugger;
    // //if (me.sqlQueryUtil.isLiteralField(filter[1][0])) {
    // if (me.sqlQueryUtil.isLiteralField(filter[1])) {
    //   me.addingSourceOutField = filter[1];
    // } else {
    //   //const f = me.getFieldByFilter(filter[1]);
    //   const f = me.sqlQueryUtil.getFieldByFilter(filter[1], me.fieldList);
    //   if (f !== null) {
    //     me.addingTable = f.key;
    //     me.addingColumn = f.value;
    //   }
    // }
  }
  // onAddOld(event, addFilterPopups) {
  //   var me = this;

  //   me.addAndOr = "and";
  //   me.addStep = "andOr";
  // }
  // onAdd(event, addFilterPopups) {
  //   var me = this;
  //   me.isAdd = true;
  //   // // // me.addStep = "field"; //测试直接打开第二步,看看一拉会不会滚动
  //   // // me.addCompare();

  //   // //不异步的话,open时计算高度有可能用的是addField时的高度,但这样也有问题,新增时
  //   // const btn = event.currentTarget;
  //   // if (me.pfUtil.isListEmpty(me.filter)) {
  //   //   me.addAndOr = "";
  //   //   me.addStep = "field";
  //   //   addFilterPopups.open(btn);
  //   //   return;
  //   // }
  //   // if (addFilterPopups.isOpened()) {
  //   //   addFilterPopups.open(btn);
  //   //   me.addAndOr = "and";
  //   //   me.addStep = "andOr";
  //   // } else {
  //   //   me.addAndOr = "and";
  //   //   me.addStep = "andOr";
  //   //   setTimeout(function () {
  //   //     addFilterPopups.open(btn);
  //   //   }, 100);
  //   // }
  // }
  // /**
  //  * 此方法的作用类似updateTable,但此方法方便可以异步等待
  //  * @param tableId
  //  * @returns
  //  */
  // private queryFields(tableId: number[]) {
  //   const me = this;
  //   let r: KeyValuePairT<DataTableModel, DataColumnModel[]>[] = [];
  //   const observable = new Observable<
  //     KeyValuePairT<DataTableModel, DataColumnModel[]>[]
  //   >((subscriber) => {
  //     const ro = new Observable<
  //       KeyValuePairT<DataTableModel, DataColumnModel[]>
  //     >((rSubscriber) => {
  //       me.reference
  //         .getDataTableList(me.query.database)
  //         .subscribe((response) => {
  //           let tableList = response.DataSource.filter(
  //             (t) => tableId.indexOf(t.ShortId) > -1
  //           );
  //           //debugger;
  //           let oList: Observable<boolean>[] = [];
  //           tableList.map((a) => {
  //             const tmpO = new Observable<boolean>((subscriber2) => {
  //               me.reference
  //                 .getDataColumnPageList(a.ShortId)
  //                 .subscribe((response2) => {
  //                   r.push(
  //                     new KeyValuePairT<DataTableModel, DataColumnModel[]>(
  //                       a,
  //                       response2.DataSource
  //                     )
  //                   );
  //                   subscriber2.next(true);
  //                   subscriber2.complete();
  //                 });
  //             });
  //             oList.push(tmpO);
  //           });
  //           forkJoin(oList).subscribe(
  //             (a) => {
  //               //这里有些奇怪，只有当aa和bb的observer.complete()执行完才会进入这里（一般会误以为是next执行完就进来吧）
  //               rSubscriber.next(null);
  //             },
  //             (e) => {
  //             // debugger;
  //             }
  //           );
  //         });
  //     });
  //     ro.subscribe(
  //       (a) => {
  //         //这里实际是等待完成的,但返回用next,所以这里的参数a没有使用到
  //         subscriber.next(r); //rSubscriber.next(null)运行之后进入本句.本句执行完之后会触发queryFields()返回值里的next事件
  //       },
  //       (e) => {
  //       // debugger;
  //       }
  //     );
  //   });
  //   return observable;
  // }
  // goSelectFieldOld(addAndOr) {
  //   const me = this;
  //   // me.addStep = "field";
  //   // me.addAndOr = addAndOr;

  //   // /**
  //   //  * 查出可选择的table
  //   //  */
  //   // me.fieldList = [];
  //   // if (me.query != null) {
  //   //   if (me.query["source-table"] != null) {
  //   //     me.updateTable(me.query["source-table"]);
  //   //   }
  //   //   if (me.query.joins != null) {
  //   //     for (let i = 0; i < me.query.joins.length; i++) {
  //   //       me.updateTable(me.query.joins[i]["source-table"]);
  //   //     }
  //   //   }
  //   // }
  // }
  goSelectField(addAndOr, addFilterPopups) {
    const me = this;
    // me.addStep = "field";
    // me.addAndOr = addAndOr;

    //console.info(me.fieldList);

    //fieldList在sql-query-field里面更新,不在这里更新了
    // /**
    //  * 查出可选择的table
    //  */
    // me.fieldList = [];
    // if (me.query != null) {
    //   //同步
    //   let tableIds: number[] = [];
    //   if (me.query["source-table"] != null) {
    //     tableIds.push(me.query["source-table"]);
    //   }
    //   if (me.query.joins != null) {
    //     for (let i = 0; i < me.query.joins.length; i++) {
    //       tableIds.push(me.query.joins[i]["source-table"]);
    //     }
    //   }
    //   me.queryFields(tableIds).subscribe(
    //     (response) => {
    //       me.fieldList = [...me.fieldList, ...response];
    //       addFilterPopups.resize();
    //     },
    //     (e) => {
    //     // debugger;
    //     }
    //   );
    // }
  }
  public onAndOrChange(newAndOr: string, idx: number) {
    //debugger;
    const me = this;
    // //me.filter.splice(idx, 1, newAndOr.target.value);
    // me.filter[idx] = newAndOr;
    // //me.filter[idx] = newAndOr.target.value; //newAndOr;
    // //me.filterChange.emit(me.filter);
  }

  public likeText(columnName: string, text: string) {
    //return columnName.indexOf(text) > -1;
    return PfUtil.likeText(columnName, text);
  }
  public selectColumn(column: DataColumnModel, table: DataTableUIModel) {
    const me = this;
    //me.addStep = "compare";
    me.addingColumn = column;
    me.addingTable = table;
    //me.filter.push();
  }
  public selectColumnBySourceOut(field: FieldLiteral) {
    const me = this;
    //me.addStep = "compare";
    //debugger;
    me.addingSourceOutField = field;
  }

  // /**
  //  *
  //  * @returns @deprecated Placement事件要展开前设置才有效,所以没用
  //  */
  // public getAddDropDownPlacement() {
  //   const me = this;
  //   if (me.addStep === "andOr") {
  //     return "bottomLeft";
  //   } else if (me.addStep === "field") {
  //     return "topLeft";
  //   }
  //   return "bottomLeft";
  // }
  // public saveFilter(filterValue) {
  //   const me = this;
  //   if (me.pfUtil.isAnyNull(me.expressionOption)) {
  //     me.expressionOption = [];
  //   }
  //   //自定义表达式应该只有add的情况,或删除
  //   if (me.isAdd) {
  //     //me.filter.push(["=", ["field-id", 276], "967122"]);
  //     //me.filter=["and", ["=", ["field-id", 276], "967122"]];
  //     let tmpFilter: any = me.expressionOption;
  //     //me.filter.push(["=", ["field-id", 276], "967122"]);
  //     if (me.isAddingBracket) {
  //       if (tmpFilter.length > 0) {
  //         tmpFilter.push(me.mark);
  //       }
  //       let bracket = ["bracket", []];
  //       tmpFilter.push(bracket);
  //       tmpFilter = bracket[1];
  //     }
  //     if (tmpFilter.length > 0) {
  //       tmpFilter.push(me.mark);
  //     }
  //     switch (me.compare) {
  //       case "aa":
  //         break;
  //       default:
  //         tmpFilter.push([
  //           me.compare,
  //           //["field-id", me.addingColumn.ShortId], //这里要判断是不是joinField--benjamin
  //           me.getFilterByAdding(), //这里要判断是不是joinField--benjamin
  //           filterValue,
  //         ]);
  //         break;
  //     }
  //   } else {
  //     // let tmpFilter: any = me.filter;
  //     // tmpFilter[0] = me.compare;
  //     // tmpFilter[1] = me.getFilterByAdding();
  //     // tmpFilter[2] = filterValue;
  //   }
  //   me.expressionOptionChange.emit(me.expressionOption);
  // }

  // public doGetFieldFullName(field: ConcreteField){

  // }
  /**
   *
   * @deprecated
   * @param field
   * @returns
   */
  public getFieldByFilter(
    field: ConcreteField
  ): KeyValuePairT<DataTableModel, DataColumnModel> {
    const me = this;
    if (
      undefined === me.fieldList ||
      null === me.fieldList ||
      me.fieldList.length < 1
    ) {
      //console.info("fieldList is null");
      return null;
    }
    //console.info("fieldList is not null");
    //debugger;
    if ('field-id' === field[0]) {
      if (me.fieldList.length > 0) {
        let f = me.fieldList[0].value.find((a) => a.ShortId === field[1]);
        if (f !== null && f !== undefined) {
          return new KeyValuePairT<DataTableModel, DataColumnModel>(
            me.fieldList[0].key,
            f
          );
        }
      }
    } else if ('joined-field' === field[0]) {
      // field[1] }}.{{ field[2][1]
      if (me.fieldList.length > 1) {
        let t = me.fieldList.find((a) => a.key.ShortId === field[1]);
        //let t = me.fieldList.find((a) => a.key.TableShortId === field[1]);
        if (t !== null && t !== undefined) {
          let f = t.value.find((a) => a.ShortId === field[1]);
          if (f !== null && f !== undefined) {
            return new KeyValuePairT<DataTableModel, DataColumnModel>(t.key, f);
          }
        }
      }
    }
  }
  private isFieldListEmpty(): boolean {
    const me = this;
    return me.fieldList === null || me.fieldList.length < 1;
  }
  // public getFilterByAdding(): ConcreteField {
  //   const me = this;
  //   if (!me.pfUtil.isAnyNull(me.addingSourceOutField)) {
  //     return me.addingSourceOutField;
  //   }
  //   if (me.addingColumn === null || me.isFieldListEmpty()) {
  //     return null;
  //   }

  //   // if (me.addingTable.ShortId === me.fieldList[0].key.ShortId) {
  //   //   return ["field-id", me.addingColumn.ShortId];
  //   // }
  //   // // if (me.addingTable.ShortId === me.fieldList[0].key.ShortId) {
  //   // //   return [
  //   // //     "joined-field",
  //   // //     me.addingTable.TableName,
  //   // //     ["field-id", me.addingColumn.ShortId],
  //   // //   ];
  //   // // }
  //   // return [
  //   //   "joined-field",
  //   //   //me.addingTable.TableName,
  //   //   me.addingTable.TableIdxName,
  //   //   ["field-id", me.addingColumn.ShortId],
  //   // ];
  //   return me.sqlQueryUtil.getFilterByField(
  //     me.addingColumn,
  //     me.addingTable,
  //     me.fieldList
  //   );
  // }
  public getFieldFullName(field: ConcreteField) {
    const me = this;
    // if (me.pfUtil.isListEmpty(me.fieldList)) {
    //   return "";
    // }
    // const f = me.getFieldByFilter(field);

    // if (f !== null && f !== undefined) {
    //   if ("field-id" === field[0]) {
    //     return f.value.ColumnName;
    //   } else if ("joined-field" === field[0]) {
    //     return f.key.TableName + "." + f.value.ColumnName;
    //   }
    // }
    // return "";
    return me.sqlQueryUtil.getFieldFullName(field, me.fieldList);
  }
  // public getFieldFullName(field: ConcreteField) {
  //   const me = this;
  //   const observable = new Observable<string>((subscriber) => {
  //     subscriber.next("测试字段名");
  //   });
  //   return observable;
  // }
  // getFieldFullName = (field: ConcreteField) => {
  //   const me = this;
  //   const observable = new Observable<string>((subscriber) => {
  //   // debugger;
  //     subscriber.next("测试字段名");
  //   });
  //   return observable.toPromise();
  // };
  isAnyNull2(item) {
    const me = this;
    //debugger;
    return me.pfUtil.isAnyNull(item);
  }
  public getTableName() {
    const me = this;
    if (me.pfUtil.isAnyNull(me.addingTable, me.addingColumn)) {
      return '请选择表';
    } else {
      return me.addingTable.TableIdxName + '.' + me.addingColumn.ColumnName;
    }
  }
  public isValid() {
    return !this.invalid;
  }
}
