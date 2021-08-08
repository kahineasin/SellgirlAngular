//https://blog.csdn.net/weixin_34112181/article/details/88748838
//自写drop组件，建议用在position: relative;属性的元素上，这样方便后面的计算,同时也可以限制光标的移动范围
//测试此组件发现效果不好，改为drag事件方式(需copy dom之后用xy定位到鼠标位置，未完成)
import {
  Directive,
  ElementRef,
  OnInit,
  HostListener,
  EventEmitter,
  Output,
} from "@angular/core";
//import { debug } from "console";
import { DragType, PfDragDirective } from "./pf-drag.directive";

export class PfDropModel {
  public dragDom: any;
  // public dropDom: any;
  // public cursorDom: any;
  // //public arrowDom: any;
  // //要把起点坐标记下来，让pfDrop来计算
  public x2: number=0;
  public y2: number=0;
  // //为了在pfDrop里判断，正在移动时不用再计算x1
  // public isCursorMoving: boolean = false;
  // public dragType: DragType = DragType.copySrc;
}

@Directive({
  selector: "[pfDrop]",
})
export class PfDropDirective implements OnInit {
  @Output() pfDropEnd = new EventEmitter<PfDropModel>();
  constructor(public el: ElementRef) {}
  //isRelative = false;
  public isDown = false;

  public disX: number=0; // 记录鼠标点击事件的位置 X

  public disY: number=0; // 记录鼠标点击事件的位置 Y

  private totalOffsetX = 0; // 记录总偏移量 X轴
  private totalOffsetY = 0; // 记录总偏移量 Y轴

  // // 点击事件
  // @HostListener("mousedown", ["$event"]) onMousedown(event) {
  //   this.isDown = true;
  //   this.disX = event.clientX;
  //   this.disY = event.clientY;
  // }

  // // 监听document移动事件事件
  // @HostListener("document:mousemove", ["$event"]) onMousemove(event) {
  //   // 判断该元素是否被点击了。
  //   if (this.isDown) {
  //     this.el.nativeElement.style.left =
  //       this.totalOffsetX + event.clientX - this.disX + "px";
  //     this.el.nativeElement.style.top =
  //       this.totalOffsetY + event.clientY - this.disY + "px";
  //   }
  // }

  // // 监听document离开事件
  // @HostListener("document:mouseup", ["$event"]) onMouseup(event) {
  //   // 只用当元素移动过了，离开函数体才会触发。
  //   if (this.isDown) {
  //     console.log("fail");
  //     this.totalOffsetX += event.clientX - this.disX;
  //     this.totalOffsetY += event.clientY - this.disY;
  //     this.isDown = false;
  //   }
  // }

  @HostListener("dragover", ["$event"]) onDragOver(event: DragEvent) {
    var me = this;
    event.preventDefault();
    console.info("[drop]-dragover" + event.x + "---" + event.y); //event.x和y应该是相对于浏览器可见部位的左上角开始的

    //这样的话，cursorDom.left-正确值=dropDom.left;
    //cursorDom.top-正确值=dropDom.top;
    // PfDragDirective.cursorDom.style.left = event.x + "px";
    // PfDragDirective.cursorDom.style.top = event.y + "px";

    // //参照原版，这样完全不动
    // PfDragDirective.cursorDom.style.left =
    //   (me.totalOffsetX + event.clientX - me.disX) + "px";
    // PfDragDirective.cursorDom.style.top =
    //   (me.totalOffsetY + event.clientY - me.disY) + "px";

    // debugger;
    // PfDragDirective.cursorDom.style.left = event.x - me.disX + "px";
    // PfDragDirective.cursorDom.style.top = event.y - me.disY + "px";

    //debugger;
    if(PfDragDirective.currentDraggingModel==null){
      return;
    }
    if (DragType.copySrc == PfDragDirective.currentDraggingModel.dragType) {
      //var rect = this.el.nativeElement.getBoundingClientRect();
      var cursorRect =
        PfDragDirective.currentDraggingModel.cursorDom.getBoundingClientRect();

      var relativeDom = PfDropDirective.findUpRelativeDom(me.el.nativeElement);
      var relativeRect =
        relativeDom == null ? null : relativeDom.getBoundingClientRect();

      //其实这样通过isRelative判断也是不太准确，最好是把cursorRect换成第一个relative的parent的rect
      // PfDragDirective.currentDraggingModel.cursorDom.style.left =
      //   event.x - (me.isRelative ? rect.left : 0) - cursorRect.width / 2 + "px";
      // PfDragDirective.currentDraggingModel.cursorDom.style.top =
      //   event.y - (me.isRelative ? rect.top : 0) - cursorRect.height / 2 + "px";
      PfDragDirective.currentDraggingModel.cursorDom.style.left =
        event.x -
        (relativeRect != null ? relativeRect.left : 0) -
        cursorRect.width / 2 +
        "px";
      PfDragDirective.currentDraggingModel.cursorDom.style.top =
        event.y -
        (relativeRect != null ? relativeRect.top : 0) -
        cursorRect.height / 2 +
        "px";
    } else if (
      DragType.arrow == PfDragDirective.currentDraggingModel.dragType
    ) {
      //debugger;
      //var rect = this.el.nativeElement.getBoundingClientRect();

      //console.info("rect.left " + rect.left + " rect.top " + rect.top);

      //var escapeMouse = 2;
      //var escapeMouse = 0; //好像不用躲开指针也行
      var escapeMouse = -5; //箭头的角可能会超出

      var relativeDom = PfDropDirective.findUpRelativeDom(me.el.nativeElement);
      var relativeRect =
        relativeDom == null ? null : relativeDom.getBoundingClientRect();

      var x1 =
        PfDragDirective.currentDraggingModel.x1 -
        (relativeRect != null ? relativeRect.left : 0);
      var y1 =
        PfDragDirective.currentDraggingModel.y1 -
        (relativeRect != null ? relativeRect.top : 0);
      var x2 = event.x - (relativeRect != null ? relativeRect.left : 0);
      var y2 = event.y - (relativeRect != null ? relativeRect.top : 0);
      var cursorWidth = Math.max(x1, x2) - escapeMouse;
      var cursorHeight = Math.max(y1, y2) - escapeMouse;

      //好像只要设置svg的宽就行了，div没有宽度似乎没有影响
      // PfDragDirective.currentDraggingModel.cursorDom.style.width =
      //   cursorWidth + "px";
      // PfDragDirective.currentDraggingModel.cursorDom.style.height =
      //   cursorHeight + "px";

      //var arrowLine =
      //  PfDragDirective.currentDraggingModel.cursorDom.children[0].children[0];
      var arrowSvg = PfDragDirective.getCurrentCursorSvgDom();
      var arrowLine = PfDragDirective.getCurrentCursorArrowDom();
      arrowSvg.style.width = cursorWidth + "px";
      arrowSvg.style.height = cursorHeight + "px";
      if (!PfDragDirective.currentDraggingModel.isCursorMoving) {
        PfDragDirective.currentDraggingModel.isCursorMoving = true;
        arrowLine.setAttribute("x1", x1);
        arrowLine.setAttribute("y1", y1);
      }

      arrowLine.setAttribute("x2", x2);
      arrowLine.setAttribute("y2", y2);

      // var divDeviation = 10; //div的偏差值，没有的话不能显示完整箭头，原因未明

      // console.info(
      //   "x1 " +
      //     arrowLine.getAttribute("x1") +
      //     " y1 " +
      //     arrowLine.getAttribute("y1") +
      //     " x2 " +
      //     arrowLine.getAttribute("x2") +
      //     " y2 " +
      //     arrowLine.getAttribute("y2")
      // );
      // console.info(
      //   "div width " +
      //     PfDragDirective.currentDraggingModel.cursorDom.style.width +
      //     " div height " +
      //     PfDragDirective.currentDraggingModel.cursorDom.style.height
      // );
      //
      // var cursorRect =
      //   PfDragDirective.currentDraggingModel.cursorDom.getBoundingClientRect();
      // PfDragDirective.currentDraggingModel.cursorDom.setAttribute(
      //   "x2",
      //   event.x
      // );
      // PfDragDirective.currentDraggingModel.cursorDom.setAttribute(
      //   "y2",
      //   event.y
      // );
    }
    //var dom: any = event.target;
    //debugger;
    // me.cursorDom = dom.cloneNode(true);
    // me.cursorDom.style.position = "absolute";
    // me.cursorDom.style.top = "0px";
    // me.cursorDom.style.left = "0px";
    // dom.parentElement.appendChild(me.cursorDom);
  }
  /**
   *
   * @param event {target:被拖动的元素,currentTarget拖进的目标}
   */
  @HostListener("drop", ["$event"]) onDrop(event: DragEvent) {
    //debugger;
    console.info("[drop]-drop");
    event.preventDefault();
    console.info(event.target); //检测拖到非pfDrag元素的情况
    if(PfDragDirective.currentDraggingModel==null){
      return;
    }
    console.info(
      "cursorDom is null:" +
        (PfDragDirective.currentDraggingModel.cursorDom == null)
    );
    //debugger;
    //if (event.target == PfDragDirective.currentDraggingModel.cursorDom) {//当pfDrag是div->svg->path的元素时，target竟然是path...
    if (
      PfDropDirective.isChildDomOf(
        event.target,
        PfDragDirective.currentDraggingModel.cursorDom
      )
    ) {
      //有时dop的target会是<rect class="panning-rect" width="158200" height="27700" transform="translate(-79100,-13850)"></rect>，原因不明
      var m = new PfDropModel();
      m.x2 = event.x;
      m.y2 = event.y;
      m.dragDom = PfDragDirective.currentDraggingModel.cursorDom;
      this.pfDropEnd.emit(m);
    } else {
      console.info("drop.target is not pfDrag");
    }
    //event.originalEvent.dataTransfer.setData("Text", event.target.innerHTML);
  }
  // @HostListener("dragstart", ["$event"]) onDragStart(event) {
  //   console.info("dragstart");
  //   //event.originalEvent.dataTransfer.setData("Text", event.target.innerHTML);
  // }
  ngOnInit() {
    var me = this;
    //me.isRelative = me.el.nativeElement.style.position == "relative";
    //debugger;
    //this.el.nativeElement.style.position = "relative";
    //this.el.nativeElement.draggable = true;
  }
  /**
   * 往上查找第一个relative的元素
   */
  public static findUpRelativeDom(dom:any):any {
    if (dom == null) {
      return null;
    }
    if (dom.style.position == "relative") {
      return dom;
    }
    if (dom.parentElement != null) {
      return PfDropDirective.findUpRelativeDom(dom.parentElement);
    }
    return null;
  }
  public static isChildDomOf(child:any, parent:any):any {
    if (child == null || child == undefined) {
      return false;
    }
    if (child == parent) {
      return true;
    }
    if (child.parentElement != null && child.parentElement != undefined) {
      return PfDropDirective.isChildDomOf(child.parentElement, parent);
    }
    return false;
  }
}
