import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { PfUtil } from '../../common/pfUtil';
//import { PfUtil } from "../../../../../core/common/pfUtil";

/**
 * 下拉窗口
 * 不用ant下拉的原因是,ant的弹窗当下拉的内容有变动时,不会出现滚动条,而是会超出浏览器范围.
 * 如在datamodel-query-add画面的filter新增时就几乎无法解决此问题
 *
 * 使用方式:
 * 1.<input (click)="addFilterPopups.open($event.currentTarget)">
 * 2.<pf-dropdown-popups #addFilterPopups>
 * 3.如果弹窗中有元素是动态生成到body外层的(如ant的nz-select),此时需要在该元素中加
 *   [nzDropdownClassName]="addFilterPopups.hashId"
 * 4.如果要主动关闭弹窗 addFilterPopups.close()
 *
 * 定位模式:
 * 1.fxied(推荐)
 *   这个定位不会被relative+overflow的父级挡住
 *   如果要跟着按钮滚动,要在按钮的滚动层要设置relative
 * 2.absolute
 *
 * 注意,本下拉是absolute方式,必要时给对应的父元素设置为relative,absolute的好处是可以跟着内容滚动
 *
 * 优化:
 * 1.metabase的弹窗是absolute的,生成到body下的所以不会被挡住.(这点应该在此用不上)
 */
@Component({
  selector: 'pf-dropdown-popups',
  templateUrl: './pf-dropdown-popups.component.html',
  styleUrls: ['./pf-dropdown-popups.component.scss'],
})
export class PfDropdownPopupsComponent implements OnInit {
  /**
   * 便于在父组件的脚本中打开本弹窗
   * 注意这个open方法,当前已是打开时,调用此方法就会关闭弹窗(是为了方便,也防止关不掉弹窗的bug)
   */
  @Input() startOpen$: Observable<any>;
  /**
   * 与startOpen的区别是,此方法执行完后弹窗一定是打开的状态
   */
  @Input() startOpenIfClosed$: Observable<any>;
  @Input() startClose$: Observable<void>;
  /**
   * 为了便于在其它dom元素(如ant弹窗在body内的浮动层),判断该元素是否属于本pfDropdown内部元素(如果是,点击那些元素时不要关闭此pfDropdown)
   */
  public hashId = '';
  visible: boolean = false;
  /**
   * 弹窗位置(参考ant组件,ant的这个属性有问题,默认bottomLeft是对齐按钮左下角,但实际弹窗位置是右下,我把这个错误定义修正)
   *'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight'
   */
  pfPlacement: string = 'bottomRight';
  paddingInner: number = 5;
  paddingOuter: number = 20;
  //isClosing: boolean = false;
  btn: any = null;
  //fixedOrAbsolute = "fixed";
  isFixed = true;

  private subscribeScoll?: Subscription = null;
  onWindowScroll(event) {
    const me = this;
    if (me.isTopAlign()) {
      const btnRect = me.btn.getBoundingClientRect();
      const bodyDom = me.el.nativeElement.ownerDocument.body;
      const bodyRect = bodyDom.getBoundingClientRect();
      delete me.el.nativeElement.style.top;
      me.el.nativeElement.style.bottom =
        bodyRect.height -
        btnRect.top -
        (bodyDom.offsetHeight - bodyDom.clientHeight) + //减去relative容器的下滚动条高度(如果有)
        me.paddingInner +
        'px'; //向上弹出时,要设置bottom才有意义,如果设置top的话,那maxHeight的自动伸缩就没有意义了
    } else {
      const btnRect = me.btn.getBoundingClientRect();
      const top = btnRect.top + btnRect.height + me.paddingInner;
      delete me.el.nativeElement.style.bottom;
      me.el.nativeElement.style.top = top + 'px';
    }
  }

  //暂时为了修复一个滚动条bug
  lastTimeMaxW: number = -1;
  constructor(public el: ElementRef, private pfUtil: PfUtil) {
    const me = this;
    me.hashId = 'dp' + PfUtil.newHashId();
  }
  // ngAfterViewInit() {
  //   const me = this;
  // }
  ngOnInit(): void {
    const me = this;
    me.el.nativeElement.style.position = me.isFixed ? 'fixed' : 'absolute'; // me.fixedOrAbsolute; // "absolute";
    me.el.nativeElement.style.zIndex = '999';
    me.el.nativeElement.style.overflow = 'auto'; //注意,如果用auto的话,设置maxWith和maxHeight时页面需要渲染后再次调整(第一次渲染时width不会计算滚动条的宽度)

    //边框和阴影
    me.el.nativeElement.style.border = '1px solid #edf2f5';
    me.el.nativeElement.style.boxShadow = '0 4px 10px rgb(0 0 0 / 13%)';
    me.el.nativeElement.style.backgroundColor = '#ffffff';
    me.el.nativeElement.style.borderRadius = '6px';

    //me.el.nativeElement.style.overflowY = "scroll";

    me.close();
    if (!me.pfUtil.isAnyNull(me.startOpen$)) {
      me.startOpen$.subscribe((btnDom) => {
        me.open(btnDom);
      });
    }
    if (!me.pfUtil.isAnyNull(me.startOpenIfClosed$)) {
      me.startOpenIfClosed$.subscribe((btnDom) => {
        me.openIfClosed(btnDom);
      });
    }
    if (!me.pfUtil.isAnyNull(me.startClose$)) {
      me.startClose$.subscribe((btnDom) => {
        me.close();
      });
    }
  }
  /**
   *
   * @param btn 触发下拉弹窗的按钮(此参数的意义是用于计算定位)
   */
  public open(btn) {
    const me = this;
    // //debugger;
    // //console.info("open:" + me.visible);
    // if (!me.visible) {
    //   //const btn = event.target;//target是实际点击的元素,有可能是click的内部子元素
    //   //const btn = event.currentTarget;
    //   me.btn = btn;
    //   me.resize();

    //   // //这里有个问题,第一次展开时,如果出现y滚动条,宽度有可能不够导致内容换行(再次展开却没问题)
    //   setTimeout(function () {
    //     //debugger;
    //     me.el.nativeElement.style.maxWidth = me.lastTimeMaxW - 1 + "px";
    //     me.visible = true;
    //     //me.el.nativeElement.style.maxWidth = me.lastTimeMaxW + "px";
    //   }, 10);
    // } else {
    //   me.visible = false;
    //   //debugger;
    //   me.close();
    // }
    // //me.isClosing = false;
    // //me.visible = !me.visible;

    // //如果是fixed布局,监听relative父级的第一个儿子的滚动事件
    // if (me.isFixed && me.subscribeScoll == null) {
    //   let relativeDom = PfUtil.findUpRelativeDom(me.btn);
    //   if (relativeDom == null) {
    //     relativeDom = me.el.nativeElement.ownerDocument.body;
    //   }
    //   //debugger;
    //   //me.subscribeScoll = fromEvent(relativeDom.children[0], "scroll")
    //   me.subscribeScoll = fromEvent(relativeDom, "scroll")
    //     // debounceTime(500) // 防抖
    //     .subscribe((event) => {
    //       me.onWindowScroll(event);
    //     });
    // }

    if (!me.visible) {
      me.openIfClosed(btn);
    } else {
      me.visible = false;
      //debugger;
      me.close();
    }
  }
  public openIfClosed(btn) {
    const me = this;
    //debugger;
    //console.info("open:" + me.visible);
    if (!me.visible) {
      //const btn = event.target;//target是实际点击的元素,有可能是click的内部子元素
      //const btn = event.currentTarget;
      me.btn = btn;
      me.resize();

      // //这里有个问题,第一次展开时,如果出现y滚动条,宽度有可能不够导致内容换行(再次展开却没问题)
      setTimeout(function () {
        //debugger;
        me.el.nativeElement.style.maxWidth = me.lastTimeMaxW - 1 + 'px';
        me.visible = true;
        //me.el.nativeElement.style.maxWidth = me.lastTimeMaxW + "px";
      }, 10);
    } else {
      // me.visible = false;
      // //debugger;
      // me.close();
    }
    //me.isClosing = false;
    //me.visible = !me.visible;

    //如果是fixed布局,监听relative父级的第一个儿子的滚动事件
    if (me.isFixed && me.subscribeScoll == null) {
      let relativeDom = PfUtil.findUpRelativeDom(me.btn);
      if (relativeDom == null) {
        relativeDom = me.el.nativeElement.ownerDocument.body;
      }
      //debugger;
      //me.subscribeScoll = fromEvent(relativeDom.children[0], "scroll")
      me.subscribeScoll = fromEvent(relativeDom, 'scroll')
        // debounceTime(500) // 防抖
        .subscribe((event) => {
          me.onWindowScroll(event);
        });
    }
  }

  // public close2() {
  //   const me = this;
  //   me.visible = false;
  //   //me.el.nativeElement.style.top = "-99999px";//如果这样写的话,似乎在chrome上有bug,有时想显示的时候却不能显示出来,鼠标移动一下才可以显示(原因不明)
  //   me.el.nativeElement.style.left = "99999px";
  // }
  public close() {
    //console.info("close");
    const me = this;
    me.visible = false;
    //me.el.nativeElement.style.top = "-99999px";//如果这样写的话,似乎在chrome上有bug,有时想显示的时候却不能显示出来,鼠标移动一下才可以显示(原因不明)
    me.el.nativeElement.style.left = '99999px';
  }
  public isOpened() {
    const me = this;
    return me.visible;
  }
  private isTopAlign(): boolean {
    const me = this;
    return 'topRight' === me.pfPlacement || 'topLeft' === me.pfPlacement;
  }
  /**
   * @deprecated 用isLeftAlign吧,因为和top对应的应该是left
   * @returns
   */
  private isRightAlign(): boolean {
    const me = this;
    return 'bottomRight' === me.pfPlacement || 'topRight' === me.pfPlacement;
  }
  private isLeftAlign(): boolean {
    const me = this;
    return !me.isRightAlign();
  }
  // /**
  //  * @deprecated 考虑直接通用 resizeFixed(在内部运算时再判断)
  //  */
  // private resizeAbsolute() {
  //   const me = this;
  //   //debugger;
  //   const rect = me.el.nativeElement.getBoundingClientRect();
  //   //debugger;
  //   //console.info(me.el.nativeElement);
  //   const btnRect = me.btn.getBoundingClientRect();
  //   //let relativeDom = PfUtil.findUpRelativeDom(me.el.nativeElement);
  //   let relativeDom = PfUtil.findUpRelativeDom(me.btn);
  //   if (relativeDom == null) {
  //     relativeDom = me.el.nativeElement.ownerDocument.body;
  //   }
  //   const relativeRect =
  //     relativeDom == null ? null : relativeDom.getBoundingClientRect();

  //   let maxW = -1;
  //   let maxH = -1;

  //   //计算弹窗最好的方向(宽高最大)
  //   let n = {};
  //   const widthL = btnRect.left + btnRect.width - relativeRect.left;
  //   const widthR = relativeRect.width - btnRect.left;
  //   const heightTop = btnRect.top - relativeRect.top;
  //   const heightBottom = relativeRect.height - btnRect.top - btnRect.height;
  //   if (widthL > widthR) {
  //     n["left"] = true;
  //   } else {
  //     n["right"] = true;
  //   }
  //   if (heightTop > heightBottom) {
  //     n["top"] = true;
  //   } else {
  //     n["bottom"] = true;
  //   }

  //   if (n["top"] && n["right"]) {
  //     me.pfPlacement = "topRight";
  //   } else if (n["top"] && n["left"]) {
  //     me.pfPlacement = "topLeft";
  //   } else if (n["bottom"] && n["left"]) {
  //     me.pfPlacement = "bottomLeft";
  //   }
  //   //console.info("pfPlacement:" + me.pfPlacement);

  //   // if ("bottomRight" === me.pfPlacement) {
  //   //   maxW = relativeRect.width - rect.left;
  //   //   maxH = relativeRect.height - rect.top - rect.height;
  //   // }

  //   // let paddingTop = paddingInner;
  //   // let paddingBottom = paddingOuter;
  //   if ("bottomRight" === me.pfPlacement || "topRight" === me.pfPlacement) {
  //     maxW = widthR;
  //   } else {
  //     maxW = widthL;
  //   }
  //   if (me.isTopAlign()) {
  //     maxH = heightTop;
  //     // paddingBottom = paddingInner;
  //     // paddingTop = paddingOuter;
  //   } else {
  //     maxH = heightBottom;
  //   }

  //   maxH = maxH - me.paddingInner - me.paddingOuter;

  //   let top: number = -1;
  //   let left: number = -1;
  //   //console.info("pfPlacement:" + me.pfPlacement);
  //   //debugger;
  //   if (me.isTopAlign()) {
  //     //top = btnRect.top - rect.height - paddingInner;
  //     //top = btnRect.top - maxH - paddingInner;
  //     //top = btnRect.top - Math.min(maxH, rect.height) - paddingInner;
  //     top =
  //       btnRect.top -
  //       relativeRect.top -
  //       Math.min(maxH, rect.height) -
  //       me.paddingInner;
  //   } else {
  //     top = btnRect.top + btnRect.height + me.paddingInner;
  //   }
  //   if (me.isRightAlign()) {
  //     // left = btnRect.left;//注意rect对象都是相对于浏览器可见区域的
  //     left = btnRect.left - relativeRect.left;
  //   } else {
  //     //left = btnRect.left + btnRect.width - rect.width;
  //     left = btnRect.left + btnRect.width - Math.min(maxW, rect.width);
  //   }

  //   if (maxW > -1) {
  //     //console.info("maxW :" + maxW);
  //     //me.el.nativeElement.style.position = "absolute";
  //     //me.el.nativeElement.style.overflow = "auto";
  //     me.el.nativeElement.style.maxHeight = maxH + "px"; //通常是高度显示滚动,所以先设置高度好处,这面计算宽度时才能把滚动条算上
  //     me.el.nativeElement.style.maxWidth = maxW + "px";
  //     me.el.nativeElement.style.left = left + "px";
  //     //debugger;
  //     if (me.isTopAlign()) {
  //       delete me.el.nativeElement.style.top;
  //       me.el.nativeElement.style.bottom =
  //         relativeRect.height -
  //         (btnRect.top - relativeRect.top) -
  //         (relativeDom.offsetHeight - relativeDom.clientHeight) + //减去relative容器的下滚动条高度(如果有)
  //         me.paddingInner +
  //         "px"; //向上弹出时,要设置bottom才有意义,如果设置top的话,那maxHeight的自动伸缩就没有意义了
  //     } else {
  //       delete me.el.nativeElement.style.bottom;
  //       me.el.nativeElement.style.top = top + "px";
  //     }
  //     //me.el.nativeElement.style.zIndex = 999;
  //   }
  // }
  /**
   * left right top bottom的空值
   */
  private leftEmpty = '';
  private resizeFixed() {
    const me = this;
    //debugger;
    const bodyDom = me.el.nativeElement.ownerDocument.body;
    const bodyRect = bodyDom.getBoundingClientRect();

    //const rect = me.el.nativeElement.getBoundingClientRect();
    //debugger;
    //console.info(me.el.nativeElement);
    const btnRect = me.btn.getBoundingClientRect();
    //debugger;
    //let relativeDom = PfUtil.findUpRelativeDom(me.el.nativeElement);
    let relativeDom = PfUtil.findUpRelativeDom(me.btn);
    if (relativeDom == null) {
      relativeDom = me.el.nativeElement.ownerDocument.body;
    }
    const relativeRect =
      relativeDom == null ? null : relativeDom.getBoundingClientRect();

    let maxW = -1;
    let maxH = -1;

    //计算弹窗最好的方向(宽高最大)
    let n = {};
    const widthL = btnRect.left + btnRect.width - relativeRect.left;
    const widthR = relativeRect.width - btnRect.left;
    const heightTop = btnRect.top - (me.isFixed ? 0 : relativeRect.top);
    const heightBottom =
      (me.isFixed ? bodyRect.height : relativeRect.height) -
      btnRect.top -
      btnRect.height;
    if (widthL > widthR) {
      n['left'] = true;
    } else {
      n['right'] = true;
    }
    if (heightTop > heightBottom) {
      n['top'] = true;
    } else {
      n['bottom'] = true;
    }

    if (n['top'] && n['right']) {
      me.pfPlacement = 'topRight';
    } else if (n['top'] && n['left']) {
      me.pfPlacement = 'topLeft';
    } else if (n['bottom'] && n['left']) {
      me.pfPlacement = 'bottomLeft';
    } else {
      me.pfPlacement = 'bottomRight';
    }
    //debugger;
    console.info('pfPlacement:' + me.pfPlacement);

    // if ("bottomRight" === me.pfPlacement) {
    //   maxW = relativeRect.width - rect.left;
    //   maxH = relativeRect.height - rect.top - rect.height;
    // }

    // let paddingTop = paddingInner;
    // let paddingBottom = paddingOuter;
    if ('bottomRight' === me.pfPlacement || 'topRight' === me.pfPlacement) {
      maxW = widthR;
    } else {
      maxW = widthL;
    }
    if (me.isTopAlign()) {
      maxH = heightTop;
      // paddingBottom = paddingInner;
      // paddingTop = paddingOuter;
    } else {
      maxH = heightBottom;
    }
    // const paddingInner: number = 5;
    // const paddingOuter: number = 20;

    maxH = maxH - me.paddingInner - me.paddingOuter;

    let top: number = -1;
    let bottom: number = -1; //当下拉方向向上时,用设置bottom而不设置top,这是为了maxHeight自动收缩的方向(left也同理,以后再补代码)
    let left: number = -1;
    let right: number = -1;
    //console.info("pfPlacement:" + me.pfPlacement);
    //debugger;
    if (me.isTopAlign()) {
      // //top = btnRect.top - rect.height - paddingInner;
      // //top = btnRect.top - maxH - paddingInner;
      // //top = btnRect.top - Math.min(maxH, rect.height) - paddingInner;
      // top =
      //   btnRect.top -
      //   relativeRect.top -
      //   Math.min(maxH, rect.height) -
      //   paddingInner;

      if (me.isFixed) {
        bottom =
          bodyRect.height -
          btnRect.top -
          (bodyDom.offsetHeight - bodyDom.clientHeight) + //减去relative容器的下滚动条高度(如果有)
          me.paddingInner; //向上弹出时,要设置bottom才有意义,如果设置top的话,那maxHeight的自动伸缩就没有意义了
      } else {
        bottom =
          relativeRect.height -
          (btnRect.top - relativeRect.top) -
          (relativeDom.offsetHeight - relativeDom.clientHeight) + //减去relative容器的下滚动条高度(如果有)
          me.paddingInner; //向上弹出时,要设置bottom才有意义,如果设置top的话,那maxHeight的自动伸缩就没有意义了
      }
    } else {
      top = btnRect.top + btnRect.height + me.paddingInner; //应该要加isFixed判断
    }
    if (me.isRightAlign()) {
      // left = btnRect.left;//注意rect对象都是相对于浏览器可见区域的
      left = btnRect.left - (me.isFixed ? 0 : relativeRect.left);
    } else {
      // //left = btnRect.left + btnRect.width - rect.width;
      // left = btnRect.left + btnRect.width - Math.min(maxW, rect.width);
      if (me.isFixed) {
        //此部分判断未测试
        //right = btnRect.left + btnRect.width - Math.min(maxW, rect.width);
        right =
          bodyRect.width -
          btnRect.left -
          btnRect.width -
          (bodyDom.offsetWidth - bodyDom.clientWidth); //减去relative容器的下滚动条高度(如果有) //向上弹出时,要设置bottom才有意义,如果设置top的话,那maxHeight的自动伸缩就没有意义了
      } else {
        right =
          relativeRect.width -
          (btnRect.left - relativeRect.left) -
          btnRect.width -
          (relativeDom.offsetWidth - relativeDom.clientWidth); //减去relative容器的下滚动条高度(如果有) //向上弹出时,要设置bottom才有意义,如果设置top的话,那maxHeight的自动伸缩就没有意义了
      }
    }

    if (maxW > -1) {
      //const hasScrollY = rect.height > maxH;
      //console.info("maxW :" + maxW);
      //me.el.nativeElement.style.position = "absolute";
      //me.el.nativeElement.style.overflow = "auto";
      me.lastTimeMaxW = maxW;
      me.el.nativeElement.style.maxWidth = maxW + 'px';
      me.el.nativeElement.style.maxHeight = maxH + 'px'; //通常是高度显示滚动,所以先设置高度好处,这面计算宽度时才能把滚动条算上
      //me.el.nativeElement.style.maxWidth = (hasScrollY ? 15 : 0) + maxW + "px";
      if (me.isLeftAlign()) {
        //delete me.el.nativeElement.style.left;
        me.el.nativeElement.style.left = me.leftEmpty;
        me.el.nativeElement.style.right = right + 'px';
      } else {
        //delete me.el.nativeElement.style.right;
        me.el.nativeElement.style.right = me.leftEmpty;
        me.el.nativeElement.style.left = left + 'px';
      }
      //debugger;
      if (me.isTopAlign()) {
        // console.info("------------------open--------------------");
        // console.info(
        //   "relative: height " +
        //     relativeRect.height +
        //     " top " +
        //     relativeRect.top +
        //     " offsetHeight " +
        //     relativeDom.offsetHeight +
        //     " clientHeight " +
        //     relativeDom.clientHeight
        // );
        // console.info("btn: top " + btnRect.top);

        //delete me.el.nativeElement.style.top;
        me.el.nativeElement.style.top = me.leftEmpty;
        me.el.nativeElement.style.bottom = bottom + 'px';
        // if (me.isFixed) {
        //   // const bodyDom = me.el.nativeElement.ownerDocument.body;
        //   // const bodyRect = bodyDom.getBoundingClientRect();
        //   me.el.nativeElement.style.bottom =
        //     bodyRect.height -
        //     btnRect.top -
        //     (bodyDom.offsetHeight - bodyDom.clientHeight) + //减去relative容器的下滚动条高度(如果有)
        //     paddingInner +
        //     "px"; //向上弹出时,要设置bottom才有意义,如果设置top的话,那maxHeight的自动伸缩就没有意义了
        // } else {
        //   me.el.nativeElement.style.bottom =
        //     relativeRect.height -
        //     (btnRect.top - relativeRect.top) -
        //     (relativeDom.offsetHeight - relativeDom.clientHeight) + //减去relative容器的下滚动条高度(如果有)
        //     paddingInner +
        //     "px"; //向上弹出时,要设置bottom才有意义,如果设置top的话,那maxHeight的自动伸缩就没有意义了
        // }
      } else {
        //delete me.el.nativeElement.style.bottom;
        me.el.nativeElement.style.bottom = me.leftEmpty;
        me.el.nativeElement.style.top = top + 'px';
      }
      //me.el.nativeElement.style.zIndex = 999;
    }
  }
  public resize() {
    const me = this;
    // if ("fixed" === me.fixedOrAbsolute) {
    if (me.isFixed) {
      me.resizeFixed();
    } else {
      //me.resizeAbsolute();
      me.resizeFixed();
    }
    //console.info("width:" + me.el.nativeElement.getBoundingClientRect().width);
  }
  /**
   * @param event
   */
  //@HostListener("document:mouseup", ["$event"]) onMouseup(event) {//不用keyup事件,是为了这种情况:鼠标按下时在dropdown内,放开时在dropdown外的情况
  @HostListener('document:mousedown', ['$event']) onMouseup(event) {
    // 只用当元素移动过了，离开函数体才会触发。
    const me = this;
    //debugger;

    // let aa = PfUtil.domIsParentOf(me.el.nativeElement, event.target);
    // let aa2 = PfUtil.domHasAnyParent(event.target, function (dom) {
    //   //这种方法也有时不能阻止,因为似乎没有办法可以加自定义的特性到nz-select中(当nzDropdownMatchSelectWidth时)
    //   return (
    //     dom.hasAttribute("pfDropDownPreventClose") ||
    //     (dom.className !== null &&
    //       PfUtil.domHasClass(dom, "cdk-overlay-container")) //ant组件的弹出层都是放在这里的(这句应该有漏洞,当ant弹窗内放pf-dropdown时,可能由于这句而无法关闭pf-dropdown)
    //   );
    // });
    // let aa3 =
    //   me.visible &&
    //   me.btn !== null &&
    //   //me.btn !== event.currentTarget &&
    //   //me.btn !== event.target &&
    //   me.el.nativeElement !== event.target &&
    //   //!PfUtil.domIsParentOf(me.btn, event.target) &&//当点击对象是按钮内部时,不在此关闭(由按钮本身的open事件触发关闭)
    //   !PfUtil.domIsParentOf(me.el.nativeElement, event.target) && //当点击的是弹窗内部时,不执行关闭
    //   // (PfUtil.domIsParentOf(event.target, me.btn) || //如果没有这个条件,把ant下拉放到pf-dropdown时,点ant下拉时会关闭pf-dropdown(但如果有缺点,点其它树分支时也不会关闭pf-dropdown,如点左边菜单拦时)
    //   //   PfUtil.domIsParentOf(event.target, me.el.nativeElement))

    //   !PfUtil.domHasAnyParent(event.target, function (dom) {
    //     //这种方法也有时不能阻止,因为似乎没有办法可以加自定义的特性到nz-select中(当nzDropdownMatchSelectWidth时)
    //     return (
    //       dom.hasAttribute("pfDropDownPreventClose") ||
    //       (dom.className !== null &&
    //         PfUtil.domHasClass(dom, "cdk-overlay-container")) //ant组件的弹出层都是放在这里的(这句应该有漏洞,当ant弹窗内放pf-dropdown时,可能由于这句而无法关闭pf-dropdown)
    //     );
    //   });
    //const rect = me.el.nativeElement.getBoundingClientRect();
    // debugger;

    //这里有个问题,当点击当前按钮时,先进入此方法,然后还会触发open().
    //那结果就是:连续点按钮时,下拉不能收起来
    //这个判断就是为了解决此问题
    /**
     * 分开3个区域
     * 1.btn区域,由open操作(close一定不要控制这部分,否则事件有交叉非常容易出现不能预料的结果)
     * 2.弹窗区域,由close操作
     * 3.其它区域,由close操作
     */
    if (
      me.visible &&
      me.btn !== null &&
      me.btn !== event.currentTarget &&
      me.btn !== event.target &&
      me.el.nativeElement !== event.target &&
      !PfUtil.domIsParentOf(me.btn, event.target) && //当点击对象是按钮内部时,不在此关闭(由按钮本身的open事件触发关闭)(这个判断一定不能去掉)
      !PfUtil.domIsParentOf(me.el.nativeElement, event.target) && //当点击的是弹窗内部时,不执行关闭
      // (PfUtil.domIsParentOf(event.target, me.btn) || //如果没有这个条件,把ant下拉放到pf-dropdown时,点ant下拉时会关闭pf-dropdown(但如果有缺点,点其它树分支时也不会关闭pf-dropdown,如点左边菜单拦时)
      //   PfUtil.domIsParentOf(event.target, me.el.nativeElement))

      !PfUtil.domHasAnyParent(event.target, function (dom) {
        //这里要判断是否在本pfDropdown内部生成的元素(如ant下拉)
        return PfUtil.domHasClass(dom, me.hashId); //这句应该也有问题,如果有3层时,2 3层想阻止关闭,就都有此特性.最后导致点第二层时第三层也不能关闭
        //这种方法也有时不能阻止,因为似乎没有办法可以加自定义的特性到nz-select中(当nzDropdownMatchSelectWidth时);
        //而且这样应该有其它问题,当有3层时,2 3层想阻止关闭,就都有此特性.最后导致点第二层时第三层也不能关闭
        //return dom.hasAttribute("pfDropDownPreventClose");
        // ||(dom.className !== null &&
        //   PfUtil.domHasClass(dom, "cdk-overlay-container")) //ant组件的弹出层都是放在这里的(这句应该有漏洞,当ant弹窗内放pf-dropdown时,点击ant弹窗内部时,由于这句而无法关闭pf-dropdown)
      }) //&&
      // (event.x < rect.left || //可以考虑通过鼠标位置来判断
      //   event.x > rect.left + rect.width ||
      //   event.y < rect.top ||
      //   event.y > rect.top + rect.height)
    ) {
      //debugger;
      //event.isPfDropdownPopupsEvent = true;
      me.visible = false;
      me.close();
      //me.isClosing = true;
      //me.endMove();
      // // event.target.parentElement.parentElement.style.display = "none";
      // // 这是div，不用属性绑定是因为,属性绑定不能立刻生效，所以隐藏了还是会影响elementFromPoint的返回结果
      // me.el.nativeElement.children[0].style.display = "none";
      // const elem = event.target.ownerDocument.elementFromPoint(
      //   event.clientX,
      //   event.clientY
      // );
      //me.moveEnd.emit(elem);
    }
  }
  // onContentChange($event) {
  //   console.info($event);
  // }
}
