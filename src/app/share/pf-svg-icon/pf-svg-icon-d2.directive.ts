//https://blog.csdn.net/weixin_34112181/article/details/88748838
//自写drop组件，建议用在position: relative;属性的元素上，这样方便后面的计算,同时也可以限制光标的移动范围
//测试此组件发现效果不好，改为drag事件方式(需copy dom之后用xy定位到鼠标位置，未完成)
import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChange,
} from "@angular/core";
//import { debug } from "console";
//import { DragType, PfDragDirective } from "./pf-drag.directive";

// export class PfDropModel {
//   public dragDom: any;
//   // public dropDom: any;
//   // public cursorDom: any;
//   // //public arrowDom: any;
//   // //要把起点坐标记下来，让pfDrop来计算
//   public x2: number;
//   public y2: number;
//   // //为了在pfDrop里判断，正在移动时不用再计算x1
//   // public isCursorMoving: boolean = false;
//   // public dragType: DragType = DragType.copySrc;
// }

@Directive({
  selector: "[pfSvgIconD2]",
})
export class PfSvgIconD2Directive implements OnInit, OnChanges {
  //@Output() pfDropEnd = new EventEmitter<PfDropModel>();
  @Input() svgIconType: string; //APP_JAVA等
  constructor(public el: ElementRef) {
    //debugger;
  }
  // //isRelative = false;
  // public isDown = false;

  // public disX; // 记录鼠标点击事件的位置 X

  // public disY; // 记录鼠标点击事件的位置 Y

  // private totalOffsetX = 0; // 记录总偏移量 X轴
  // private totalOffsetY = 0; // 记录总偏移量 Y轴

  // // // 点击事件
  // // @HostListener("mousedown", ["$event"]) onMousedown(event) {
  // //   this.isDown = true;
  // //   this.disX = event.clientX;
  // //   this.disY = event.clientY;
  // // }

  // // // 监听document移动事件事件
  // // @HostListener("document:mousemove", ["$event"]) onMousemove(event) {
  // //   // 判断该元素是否被点击了。
  // //   if (this.isDown) {
  // // this.el.nativeElement.style.left =
  // //   this.totalOffsetX + event.clientX - this.disX + "px";
  // // this.el.nativeElement.style.top =
  // //   this.totalOffsetY + event.clientY - this.disY + "px";
  // //   }
  // // }

  // // // 监听document离开事件
  // // @HostListener("document:mouseup", ["$event"]) onMouseup(event) {
  // //   // 只用当元素移动过了，离开函数体才会触发。
  // //   if (this.isDown) {
  // // console.log("fail");
  // // this.totalOffsetX += event.clientX - this.disX;
  // // this.totalOffsetY += event.clientY - this.disY;
  // // this.isDown = false;
  // //   }
  // // }

  // @HostListener("dragover", ["$event"]) onDragOver(event: DragEvent) {
  //   var me = this;
  //   event.preventDefault();
  //   console.info("[drop]-dragover" + event.x + "---" + event.y); //event.x和y应该是相对于浏览器可见部位的左上角开始的

  //   //这样的话，cursorDom.left-正确值=dropDom.left;
  //   //cursorDom.top-正确值=dropDom.top;
  //   // PfDragDirective.cursorDom.style.left = event.x + "px";
  //   // PfDragDirective.cursorDom.style.top = event.y + "px";

  //   // //参照原版，这样完全不动
  //   // PfDragDirective.cursorDom.style.left =
  //   //   (me.totalOffsetX + event.clientX - me.disX) + "px";
  //   // PfDragDirective.cursorDom.style.top =
  //   //   (me.totalOffsetY + event.clientY - me.disY) + "px";

  //   // debugger;
  //   // PfDragDirective.cursorDom.style.left = event.x - me.disX + "px";
  //   // PfDragDirective.cursorDom.style.top = event.y - me.disY + "px";

  //   //debugger;
  //   if (DragType.copySrc == PfDragDirective.currentDraggingModel.dragType) {
  // //var rect = this.el.nativeElement.getBoundingClientRect();
  // var cursorRect =
  //   PfDragDirective.currentDraggingModel.cursorDom.getBoundingClientRect();

  // var relativeDom = PfDropDirective.findUpRelativeDom(me.el.nativeElement);
  // var relativeRect =
  //   relativeDom == null ? null : relativeDom.getBoundingClientRect();

  // //其实这样通过isRelative判断也是不太准确，最好是把cursorRect换成第一个relative的parent的rect
  // // PfDragDirective.currentDraggingModel.cursorDom.style.left =
  // //   event.x - (me.isRelative ? rect.left : 0) - cursorRect.width / 2 + "px";
  // // PfDragDirective.currentDraggingModel.cursorDom.style.top =
  // //   event.y - (me.isRelative ? rect.top : 0) - cursorRect.height / 2 + "px";
  // PfDragDirective.currentDraggingModel.cursorDom.style.left =
  //   event.x -
  //   (relativeRect != null ? relativeRect.left : 0) -
  //   cursorRect.width / 2 +
  //   "px";
  // PfDragDirective.currentDraggingModel.cursorDom.style.top =
  //   event.y -
  //   (relativeRect != null ? relativeRect.top : 0) -
  //   cursorRect.height / 2 +
  //   "px";
  //   } else if (
  // DragType.arrow == PfDragDirective.currentDraggingModel.dragType
  //   ) {
  // //debugger;
  // //var rect = this.el.nativeElement.getBoundingClientRect();

  // //console.info("rect.left " + rect.left + " rect.top " + rect.top);

  // //var escapeMouse = 2;
  // //var escapeMouse = 0; //好像不用躲开指针也行
  // var escapeMouse = -5; //箭头的角可能会超出

  // var relativeDom = PfDropDirective.findUpRelativeDom(me.el.nativeElement);
  // var relativeRect =
  //   relativeDom == null ? null : relativeDom.getBoundingClientRect();

  // var x1 =
  //   PfDragDirective.currentDraggingModel.x1 -
  //   (relativeRect != null ? relativeRect.left : 0);
  // var y1 =
  //   PfDragDirective.currentDraggingModel.y1 -
  //   (relativeRect != null ? relativeRect.top : 0);
  // var x2 = event.x - (relativeRect != null ? relativeRect.left : 0);
  // var y2 = event.y - (relativeRect != null ? relativeRect.top : 0);
  // var cursorWidth = Math.max(x1, x2) - escapeMouse;
  // var cursorHeight = Math.max(y1, y2) - escapeMouse;

  // //好像只要设置svg的宽就行了，div没有宽度似乎没有影响
  // // PfDragDirective.currentDraggingModel.cursorDom.style.width =
  // //   cursorWidth + "px";
  // // PfDragDirective.currentDraggingModel.cursorDom.style.height =
  // //   cursorHeight + "px";

  // //var arrowLine =
  // //  PfDragDirective.currentDraggingModel.cursorDom.children[0].children[0];
  // var arrowSvg = PfDragDirective.getCurrentCursorSvgDom();
  // var arrowLine = PfDragDirective.getCurrentCursorArrowDom();
  // arrowSvg.style.width = cursorWidth + "px";
  // arrowSvg.style.height = cursorHeight + "px";
  // if (!PfDragDirective.currentDraggingModel.isCursorMoving) {
  //   PfDragDirective.currentDraggingModel.isCursorMoving = true;
  //   arrowLine.setAttribute("x1", x1);
  //   arrowLine.setAttribute("y1", y1);
  // }

  // arrowLine.setAttribute("x2", x2);
  // arrowLine.setAttribute("y2", y2);

  // // var divDeviation = 10; //div的偏差值，没有的话不能显示完整箭头，原因未明

  // // console.info(
  // //   "x1 " +
  // // arrowLine.getAttribute("x1") +
  // // " y1 " +
  // // arrowLine.getAttribute("y1") +
  // // " x2 " +
  // // arrowLine.getAttribute("x2") +
  // // " y2 " +
  // // arrowLine.getAttribute("y2")
  // // );
  // // console.info(
  // //   "div width " +
  // // PfDragDirective.currentDraggingModel.cursorDom.style.width +
  // // " div height " +
  // // PfDragDirective.currentDraggingModel.cursorDom.style.height
  // // );
  // //
  // // var cursorRect =
  // //   PfDragDirective.currentDraggingModel.cursorDom.getBoundingClientRect();
  // // PfDragDirective.currentDraggingModel.cursorDom.setAttribute(
  // //   "x2",
  // //   event.x
  // // );
  // // PfDragDirective.currentDraggingModel.cursorDom.setAttribute(
  // //   "y2",
  // //   event.y
  // // );
  //   }
  //   //var dom: any = event.target;
  //   //debugger;
  //   // me.cursorDom = dom.cloneNode(true);
  //   // me.cursorDom.style.position = "absolute";
  //   // me.cursorDom.style.top = "0px";
  //   // me.cursorDom.style.left = "0px";
  //   // dom.parentElement.appendChild(me.cursorDom);
  // }
  // /**
  //  *
  //  * @param event {target:被拖动的元素,currentTarget拖进的目标}
  //  */
  // @HostListener("drop", ["$event"]) onDrop(event: DragEvent) {
  //   //debugger;
  //   console.info("[drop]-drop");
  //   event.preventDefault();
  //   console.info(event.target); //检测拖到非pfDrag元素的情况
  //   console.info(
  // "cursorDom is null:" +
  //   (PfDragDirective.currentDraggingModel.cursorDom == null)
  //   );
  //   //debugger;
  //   //有时dop的target会是<rect class="panning-rect" width="158200" height="27700" transform="translate(-79100,-13850)"></rect>，原因不明
  //   var m = new PfDropModel();
  //   m.x2 = event.x;
  //   m.y2 = event.y;
  //   m.dragDom = PfDragDirective.currentDraggingModel.cursorDom;
  //   this.pfDropEnd.emit(m);

  //   // //if (event.target == PfDragDirective.currentDraggingModel.cursorDom) {//当pfDrag是div->svg->path的元素时，target竟然是path...
  //   // if(DragType.html5==PfDragDirective.currentDraggingModel.dragType){

  //   // }else{
  //   //   if (
  //   // PfDropDirective.isChildDomOf(
  //   //   event.target,
  //   //   PfDragDirective.currentDraggingModel.cursorDom
  //   // )
  //   //   ) {
  //   // //有时dop的target会是<rect class="panning-rect" width="158200" height="27700" transform="translate(-79100,-13850)"></rect>，原因不明
  //   // var m = new PfDropModel();
  //   // m.x2 = event.x;
  //   // m.y2 = event.y;
  //   // m.dragDom = PfDragDirective.currentDraggingModel.cursorDom;
  //   // this.pfDropEnd.emit(m);
  //   //   } else {
  //   // console.info("drop.target is not pfDrag");
  //   //   }
  //   //   //event.originalEvent.dataTransfer.setData("Text", event.target.innerHTML);
  //   // }
  // }
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
    //var svgDom = me.el.nativeElement.ownerDocument.createElement("svg");
    // debugger;
    // //me.el.nativeElement.appendChild(svgDom);
    // me.el.nativeElement.innerHtml = p;
    // var pathDom = me.el.nativeElement.ownerDocument.createElement("path");
    // me.el.nativeElement.appendChild(pathDom);

    // var p: string = "";
    // if ("APP_JAVA" == me.svgIconType) {
    //   p =
    //     '<path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#FFD8BF" p-id="5064"   ></path>   <path d="M239.616 554.837333c18.688-72.96 88.618667-68.096 88.618667-68.096 63.146667 2.005333 75.904 55.210667 71.936 83.413334-4.266667 15.488-5.162667 31.018667-31.36 59.733333-57.642667 45.397333-107.946667 8.746667-107.946667 8.746667l-6.528 59.818666h-34.56s7.125333-92.842667 19.84-143.616z m-51.2-125.013333c33.365333 0 49.450667 23.850667 53.12 30.208l0.853333 1.536-32.768 26.88s-7.765333-18.133333-26.538666-21.76c-18.773333-3.626667-22.357333 15.701333-22.357334 15.701333 0 18.133333 33.109333 44.117333 33.109334 44.117334 33.066667 32.64 27.392 55.637333 27.392 55.637333 0 27.477333-19.072 46.805333-19.072 46.805333s-10.112 25.088-60.501334 25.088C91.306667 654.08 85.333333 609.706667 85.333333 609.706667l39.04-21.504c0 22.997333 24.149333 29.909333 24.149334 29.909333 8.96 0 17.877333-2.389333 27.733333-10.24 9.813333-7.893333 1.749333-29.610667 1.749333-29.610667-7.125333-7.594667-43.178667-45.653333-48.853333-53.504-5.674667-7.850667-9.557333-21.76-9.557333-21.76 0-4.266667-1.493333-28.117333 13.141333-45.653333 14.592-17.493333 33.664-27.477333 55.722667-27.477333z m327.765333 56.832l0.938667 0.042667c6.442667 0.341333 44.202667 4.48 63.061333 55.253333 1.578667 15.701333 0 27.776 0 32.213333 0 4.437333-11.093333 74.154667-11.093333 74.154667h-32.853333l7.765333-67.114667s4.181333-59.818667-40.533333-59.818666c-44.672 0-52.437333 48.341333-52.437334 48.341333v1.578667c0 7.466667 1.834667 39.594667 30.592 45.994666 32.597333 7.253333 48.896-17.365333 48.896-17.365333l-7.168 43.093333s-44.501333 28.245333-89.386666-12.458666c0 0-18.688-16.896-18.688-55.210667v-1.237333c0-6.570667 1.92-37.546667 33.365333-64.426667 35.370667-30.208 67.541333-23.04 67.541333-23.04z m160.554667 4.693333l-4.181333 33.877334h-22.826667s-9.557333 2.005333-12.330667 11.264l-15.274666 111.402666h-34.005334l12.928-110.805333s-0.810667-16.085333 15.488-32.64c0 0 11.52-12.672 24.064-13.056h36.138667z m64-57.002666l-10.453333 95.488 63.189333-70.4 6.570667 38.4-44.117334 48.64 72.106667 101.418666h-44.373333l-58.154667-84.48-11.904 84.48h-38.144l24.448-184.234666 40.832-29.312z m-418.474667 88.234666c-22.826667 0-51.669333 24.789333-51.669333 50.090667s20.48 44.202667 43.349333 44.202667c22.826667 0 50.858667-24.234667 50.858667-49.536 0-25.301333-19.669333-44.757333-42.538667-44.757334z" fill="#000000" fill-opacity=".85" p-id="5065"   ></path>   <path d="M809.557333 467.626667l57.514667 16.256-34.304-68.266667 52.053333-64.426667-77.952 18.858667-38.229333-63.872-15.36 79.658667-77.653333 26.752 57.173333 24.96-38.826667 26.453333-46.08-19.754667s-25.258667-11.562667-25.258666-31.658666c0-20.053333 25.856-27.050667 25.856-27.050667l76.8-24.106667 12.8-75.434666S744.192 256 764.672 256s28.885333 23.893333 39.338667 39.722667l21.248 36.096 76.288-20.266667s62.634667-13.397333 25.301333 40.533333l-54.186667 64.085334 32.085334 63.232s24.917333 51.498667-33.706667 44.586666l-55.381333-17.834666-6.058667-38.528z" fill="#E16A1A" p-id="5066"   ></path> ';
    // } else if ("APP_SPARK" == me.svgIconType) {
    //   p =
    //     ' <path    d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"    fill="#FFD8BF"    p-id="5064"  ></path>  <path    d="M239.616 554.837333c18.688-72.96 88.618667-68.096 88.618667-68.096 63.146667 2.005333 75.904 55.210667 71.936 83.413334-4.266667 15.488-5.162667 31.018667-31.36 59.733333-57.642667 45.397333-107.946667 8.746667-107.946667 8.746667l-6.528 59.818666h-34.56s7.125333-92.842667 19.84-143.616z m-51.2-125.013333c33.365333 0 49.450667 23.850667 53.12 30.208l0.853333 1.536-32.768 26.88s-7.765333-18.133333-26.538666-21.76c-18.773333-3.626667-22.357333 15.701333-22.357334 15.701333 0 18.133333 33.109333 44.117333 33.109334 44.117334 33.066667 32.64 27.392 55.637333 27.392 55.637333 0 27.477333-19.072 46.805333-19.072 46.805333s-10.112 25.088-60.501334 25.088C91.306667 654.08 85.333333 609.706667 85.333333 609.706667l39.04-21.504c0 22.997333 24.149333 29.909333 24.149334 29.909333 8.96 0 17.877333-2.389333 27.733333-10.24 9.813333-7.893333 1.749333-29.610667 1.749333-29.610667-7.125333-7.594667-43.178667-45.653333-48.853333-53.504-5.674667-7.850667-9.557333-21.76-9.557333-21.76 0-4.266667-1.493333-28.117333 13.141333-45.653333 14.592-17.493333 33.664-27.477333 55.722667-27.477333z m327.765333 56.832l0.938667 0.042667c6.442667 0.341333 44.202667 4.48 63.061333 55.253333 1.578667 15.701333 0 27.776 0 32.213333 0 4.437333-11.093333 74.154667-11.093333 74.154667h-32.853333l7.765333-67.114667s4.181333-59.818667-40.533333-59.818666c-44.672 0-52.437333 48.341333-52.437334 48.341333v1.578667c0 7.466667 1.834667 39.594667 30.592 45.994666 32.597333 7.253333 48.896-17.365333 48.896-17.365333l-7.168 43.093333s-44.501333 28.245333-89.386666-12.458666c0 0-18.688-16.896-18.688-55.210667v-1.237333c0-6.570667 1.92-37.546667 33.365333-64.426667 35.370667-30.208 67.541333-23.04 67.541333-23.04z m160.554667 4.693333l-4.181333 33.877334h-22.826667s-9.557333 2.005333-12.330667 11.264l-15.274666 111.402666h-34.005334l12.928-110.805333s-0.810667-16.085333 15.488-32.64c0 0 11.52-12.672 24.064-13.056h36.138667z m64-57.002666l-10.453333 95.488 63.189333-70.4 6.570667 38.4-44.117334 48.64 72.106667 101.418666h-44.373333l-58.154667-84.48-11.904 84.48h-38.144l24.448-184.234666 40.832-29.312z m-418.474667 88.234666c-22.826667 0-51.669333 24.789333-51.669333 50.090667s20.48 44.202667 43.349333 44.202667c22.826667 0 50.858667-24.234667 50.858667-49.536 0-25.301333-19.669333-44.757333-42.538667-44.757334z"    fill="#000000"    fill-opacity=".85"    p-id="5065"  ></path>  <path    d="M809.557333 467.626667l57.514667 16.256-34.304-68.266667 52.053333-64.426667-77.952 18.858667-38.229333-63.872-15.36 79.658667-77.653333 26.752 57.173333 24.96-38.826667 26.453333-46.08-19.754667s-25.258667-11.562667-25.258666-31.658666c0-20.053333 25.856-27.050667 25.856-27.050667l76.8-24.106667 12.8-75.434666S744.192 256 764.672 256s28.885333 23.893333 39.338667 39.722667l21.248 36.096 76.288-20.266667s62.634667-13.397333 25.301333 40.533333l-54.186667 64.085334 32.085334 63.232s24.917333 51.498667-33.706667 44.586666l-55.381333-17.834666-6.058667-38.528z"    fill="#E16A1A"    p-id="5066"  ></path>  ';
    // }
    // me.el.nativeElement.innerHTML = p;
    me.el.nativeElement.setAttribute("viewBox", "0 0 1024 1024");
    me.el.nativeElement.setAttribute("version", "1.1");
    me.el.nativeElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    me.el.nativeElement.setAttribute("p-id", "5063");
  }
  systemIconType = [
    {
      key: "APP_JAVA",
      domType: "img",
      content: "assets/img/xSchedulerJob/java.png",
    },
    {
      key: "APP_SPARK",
      domType: "svg",
      content:
        '<path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#FFD8BF" p-id="5064"   ></path>   <path d="M239.616 554.837333c18.688-72.96 88.618667-68.096 88.618667-68.096 63.146667 2.005333 75.904 55.210667 71.936 83.413334-4.266667 15.488-5.162667 31.018667-31.36 59.733333-57.642667 45.397333-107.946667 8.746667-107.946667 8.746667l-6.528 59.818666h-34.56s7.125333-92.842667 19.84-143.616z m-51.2-125.013333c33.365333 0 49.450667 23.850667 53.12 30.208l0.853333 1.536-32.768 26.88s-7.765333-18.133333-26.538666-21.76c-18.773333-3.626667-22.357333 15.701333-22.357334 15.701333 0 18.133333 33.109333 44.117333 33.109334 44.117334 33.066667 32.64 27.392 55.637333 27.392 55.637333 0 27.477333-19.072 46.805333-19.072 46.805333s-10.112 25.088-60.501334 25.088C91.306667 654.08 85.333333 609.706667 85.333333 609.706667l39.04-21.504c0 22.997333 24.149333 29.909333 24.149334 29.909333 8.96 0 17.877333-2.389333 27.733333-10.24 9.813333-7.893333 1.749333-29.610667 1.749333-29.610667-7.125333-7.594667-43.178667-45.653333-48.853333-53.504-5.674667-7.850667-9.557333-21.76-9.557333-21.76 0-4.266667-1.493333-28.117333 13.141333-45.653333 14.592-17.493333 33.664-27.477333 55.722667-27.477333z m327.765333 56.832l0.938667 0.042667c6.442667 0.341333 44.202667 4.48 63.061333 55.253333 1.578667 15.701333 0 27.776 0 32.213333 0 4.437333-11.093333 74.154667-11.093333 74.154667h-32.853333l7.765333-67.114667s4.181333-59.818667-40.533333-59.818666c-44.672 0-52.437333 48.341333-52.437334 48.341333v1.578667c0 7.466667 1.834667 39.594667 30.592 45.994666 32.597333 7.253333 48.896-17.365333 48.896-17.365333l-7.168 43.093333s-44.501333 28.245333-89.386666-12.458666c0 0-18.688-16.896-18.688-55.210667v-1.237333c0-6.570667 1.92-37.546667 33.365333-64.426667 35.370667-30.208 67.541333-23.04 67.541333-23.04z m160.554667 4.693333l-4.181333 33.877334h-22.826667s-9.557333 2.005333-12.330667 11.264l-15.274666 111.402666h-34.005334l12.928-110.805333s-0.810667-16.085333 15.488-32.64c0 0 11.52-12.672 24.064-13.056h36.138667z m64-57.002666l-10.453333 95.488 63.189333-70.4 6.570667 38.4-44.117334 48.64 72.106667 101.418666h-44.373333l-58.154667-84.48-11.904 84.48h-38.144l24.448-184.234666 40.832-29.312z m-418.474667 88.234666c-22.826667 0-51.669333 24.789333-51.669333 50.090667s20.48 44.202667 43.349333 44.202667c22.826667 0 50.858667-24.234667 50.858667-49.536 0-25.301333-19.669333-44.757333-42.538667-44.757334z" fill="#000000" fill-opacity=".85" p-id="5065"   ></path>   <path d="M809.557333 467.626667l57.514667 16.256-34.304-68.266667 52.053333-64.426667-77.952 18.858667-38.229333-63.872-15.36 79.658667-77.653333 26.752 57.173333 24.96-38.826667 26.453333-46.08-19.754667s-25.258667-11.562667-25.258666-31.658666c0-20.053333 25.856-27.050667 25.856-27.050667l76.8-24.106667 12.8-75.434666S744.192 256 764.672 256s28.885333 23.893333 39.338667 39.722667l21.248 36.096 76.288-20.266667s62.634667-13.397333 25.301333 40.533333l-54.186667 64.085334 32.085334 63.232s24.917333 51.498667-33.706667 44.586666l-55.381333-17.834666-6.058667-38.528z" fill="#E16A1A" p-id="5066"   ></path>',
    },
    {
      key: "APP_DEFAULT",
      domType: "svg",
      content:
        '<path d="M109.714286 986.038857h803.108571V36.790857H109.714286z" fill="#EEF9FF" p-id="4706"></path><path d="M912.822857 1022.537143H109.714286a36.571429 36.571429 0 0 1-36.571429-36.498286V36.790857a36.571429 36.571429 0 0 1 36.571429-36.571428h803.108571a36.571429 36.571429 0 0 1 36.571429 36.571428v949.248a36.571429 36.571429 0 0 1-36.571429 36.571429zM146.212571 949.613714h730.258286V73.289143H146.139429v876.251428z" fill="#2098F6" p-id="4707"></path><path d="M343.259429 511.414857a36.571429 36.571429 0 0 1-28.525715-13.677714L227.181714 388.242286a36.498286 36.498286 0 0 1 0-45.641143l87.552-109.494857a36.571429 36.571429 0 0 1 57.051429 45.568l-69.339429 86.747428 69.339429 86.674286a36.571429 36.571429 0 0 1-28.525714 59.318857z m336.018285 0a36.498286 36.498286 0 0 1-28.525714-59.245714l69.339429-86.747429-69.339429-86.747428a36.571429 36.571429 0 0 1 57.051429-45.568l87.478857 109.494857a36.498286 36.498286 0 0 1 0 45.641143L707.730286 497.737143a36.278857 36.278857 0 0 1-28.525715 13.677714zM473.453714 511.414857A36.571429 36.571429 0 0 1 438.857143 462.994286l75.629714-219.062857a36.571429 36.571429 0 0 1 68.973714 23.844571L507.904 486.838857a36.425143 36.425143 0 0 1-34.450286 24.576zM765.513143 685.933714H257.024a36.571429 36.571429 0 1 1 0-73.069714h508.489143a36.571429 36.571429 0 1 1 0 73.069714zM619.52 831.926857H257.024a36.571429 36.571429 0 1 1 0-72.996571h362.422857a36.571429 36.571429 0 1 1 0 72.996571z" fill="#2098F6" p-id="4708"></path>',
    },
  ];
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    var me = this;
    //let log: string[] = [];
    //debugger;
    for (let propName in changes) {
      let changedProp = changes[propName];
      //let to = JSON.stringify(changedProp.currentValue);
      // if (changedProp.isFirstChange()) {
      //   log.push(`Initial value of ${propName} set to ${to}`);
      // } else {
      //   let from = JSON.stringify(changedProp.previousValue);
      //   log.push(`${propName} changed from ${from} to ${to}`);
      // }
      if ("svgIconType" == propName) {
        //var p: string = "";
        //debugger;
        me.el.nativeElement.innerHTML = "<p>aaa</p>";
        return;
        var icon = me.systemIconType.find(
          (a) => changedProp.currentValue == a.key
        );
        debugger;
        if (icon != null) {
          if ("img" == icon.domType) {
            // me.el.nativeElement.innerHTML =
            //   '<svg:image  [attr.width]="60"  [attr.height]="60"  [attr.x]="(node.dimension.width - 60) / 2"  xlink:href="assets/img/xSchedulerJob/java.png" ></svg:image>  ';
            me.el.nativeElement.innerHTML =
              '<image  xlink:href="assets/img/xSchedulerJob/java.png" height="80" width="300" x="20" y="20"></image>';
          } else if ("svg" == icon.domType) {
            me.el.nativeElement.innerHTML = icon.content;
          }
        } else {
          //APP_DEFAULT
          icon = me.systemIconType.find((a) => "APP_DEFAULT" == a.key);
          me.el.nativeElement.innerHTML = icon.content;
        }
        // // for(var i=0;i<me.systemIconType.length;i++){
        // //   if()
        // // }
        // if ("APP_JAVA" == changedProp.currentValue) {
        //   p =
        //     '<svg:image  [attr.width]="60"  [attr.height]="60"  [attr.x]="(node.dimension.width - 60) / 2"  xlink:href="assets/img/xSchedulerJob/java.png"                 ></svg:image>  ';
        // } else if ("APP_SPARK" == changedProp.currentValue) {
        //   p =
        //     '<path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#FFD8BF" p-id="5064"   ></path>   <path d="M239.616 554.837333c18.688-72.96 88.618667-68.096 88.618667-68.096 63.146667 2.005333 75.904 55.210667 71.936 83.413334-4.266667 15.488-5.162667 31.018667-31.36 59.733333-57.642667 45.397333-107.946667 8.746667-107.946667 8.746667l-6.528 59.818666h-34.56s7.125333-92.842667 19.84-143.616z m-51.2-125.013333c33.365333 0 49.450667 23.850667 53.12 30.208l0.853333 1.536-32.768 26.88s-7.765333-18.133333-26.538666-21.76c-18.773333-3.626667-22.357333 15.701333-22.357334 15.701333 0 18.133333 33.109333 44.117333 33.109334 44.117334 33.066667 32.64 27.392 55.637333 27.392 55.637333 0 27.477333-19.072 46.805333-19.072 46.805333s-10.112 25.088-60.501334 25.088C91.306667 654.08 85.333333 609.706667 85.333333 609.706667l39.04-21.504c0 22.997333 24.149333 29.909333 24.149334 29.909333 8.96 0 17.877333-2.389333 27.733333-10.24 9.813333-7.893333 1.749333-29.610667 1.749333-29.610667-7.125333-7.594667-43.178667-45.653333-48.853333-53.504-5.674667-7.850667-9.557333-21.76-9.557333-21.76 0-4.266667-1.493333-28.117333 13.141333-45.653333 14.592-17.493333 33.664-27.477333 55.722667-27.477333z m327.765333 56.832l0.938667 0.042667c6.442667 0.341333 44.202667 4.48 63.061333 55.253333 1.578667 15.701333 0 27.776 0 32.213333 0 4.437333-11.093333 74.154667-11.093333 74.154667h-32.853333l7.765333-67.114667s4.181333-59.818667-40.533333-59.818666c-44.672 0-52.437333 48.341333-52.437334 48.341333v1.578667c0 7.466667 1.834667 39.594667 30.592 45.994666 32.597333 7.253333 48.896-17.365333 48.896-17.365333l-7.168 43.093333s-44.501333 28.245333-89.386666-12.458666c0 0-18.688-16.896-18.688-55.210667v-1.237333c0-6.570667 1.92-37.546667 33.365333-64.426667 35.370667-30.208 67.541333-23.04 67.541333-23.04z m160.554667 4.693333l-4.181333 33.877334h-22.826667s-9.557333 2.005333-12.330667 11.264l-15.274666 111.402666h-34.005334l12.928-110.805333s-0.810667-16.085333 15.488-32.64c0 0 11.52-12.672 24.064-13.056h36.138667z m64-57.002666l-10.453333 95.488 63.189333-70.4 6.570667 38.4-44.117334 48.64 72.106667 101.418666h-44.373333l-58.154667-84.48-11.904 84.48h-38.144l24.448-184.234666 40.832-29.312z m-418.474667 88.234666c-22.826667 0-51.669333 24.789333-51.669333 50.090667s20.48 44.202667 43.349333 44.202667c22.826667 0 50.858667-24.234667 50.858667-49.536 0-25.301333-19.669333-44.757333-42.538667-44.757334z" fill="#000000" fill-opacity=".85" p-id="5065"   ></path>   <path d="M809.557333 467.626667l57.514667 16.256-34.304-68.266667 52.053333-64.426667-77.952 18.858667-38.229333-63.872-15.36 79.658667-77.653333 26.752 57.173333 24.96-38.826667 26.453333-46.08-19.754667s-25.258667-11.562667-25.258666-31.658666c0-20.053333 25.856-27.050667 25.856-27.050667l76.8-24.106667 12.8-75.434666S744.192 256 764.672 256s28.885333 23.893333 39.338667 39.722667l21.248 36.096 76.288-20.266667s62.634667-13.397333 25.301333 40.533333l-54.186667 64.085334 32.085334 63.232s24.917333 51.498667-33.706667 44.586666l-55.381333-17.834666-6.058667-38.528z" fill="#E16A1A" p-id="5066"   ></path> ';
        // } else {
        //   // p =
        //   //   '<path d="M1274.09498 1003.158752H55.576662c-20.841248 0-38.903664-16.672999-38.903663-38.903664V45.850746C16.672999 25.009498 33.345997 6.947083 55.576662 6.947083h1218.518318c26.398915 0 47.240163 20.841248 47.240162 47.240163v900.341926c0 26.398915-20.841248 48.629579-47.240162 48.62958z" fill="#FAFAFA" p-id="4144"></path><path d="M1286.599729 1022.610583H52.797829c-29.177748 0-52.797829-23.620081-52.797829-52.797829v-917.014925C0 23.620081 23.620081 0 52.797829 0h1235.191316c29.177748 0 52.797829 23.620081 52.797829 52.797829v917.014925c-1.389417 29.177748-25.009498 52.797829-54.187245 52.797829zM52.797829 29.177748c-13.894166 0-25.009498 11.115332-25.009498 25.009498v917.014925c0 13.894166 11.115332 25.009498 25.009498 25.009498h1235.191316c13.894166 0 25.009498-11.115332 25.009498-25.009498v-917.014925c0-13.894166-11.115332-25.009498-25.009498-25.009498H52.797829z" fill="#D4D5D8" p-id="4145"></path><path d="M969.812754 120.87924m-33.345997 0a33.345997 33.345997 0 1 0 66.691995 0 33.345997 33.345997 0 1 0-66.691995 0Z" fill="#AAAFB7" p-id="4146"></path><path d="M1094.860244 120.87924m-33.345997 0a33.345997 33.345997 0 1 0 66.691995 0 33.345997 33.345997 0 1 0-66.691995 0Z" fill="#AAAFB7" p-id="4147"></path><path d="M1218.518318 120.87924m-33.345998 0a33.345997 33.345997 0 1 0 66.691995 0 33.345997 33.345997 0 1 0-66.691995 0Z" fill="#AAAFB7" p-id="4148"></path><path d="M1242.138399 936.466757H111.153324c-12.504749 0-23.620081-11.115332-23.620081-23.620081V241.75848c0-12.504749 11.115332-23.620081 23.620081-23.620081h1132.374491c12.504749 0 23.620081 11.115332 23.620082 23.620081v671.088196c0 13.894166-11.115332 23.620081-25.009498 23.620081z" fill="#CBCFD9" p-id="4149"></path><path d="M1228.244233 922.572592H125.04749c-12.504749 0-23.620081-11.115332-23.620082-23.620082V255.652646c0-12.504749 11.115332-23.620081 23.620082-23.620082h1104.58616c12.504749 0 23.620081 11.115332 23.620081 23.620082v643.299864c-1.389417 13.894166-11.115332 23.620081-25.009498 23.620082z" fill="#4F596F" p-id="4150"></path><path d="M234.811398 573.829037c-5.557666 0-11.115332-2.778833-13.894166-6.947083-5.557666-6.947083-2.778833-18.062415 4.16825-22.230665l83.364993-54.187246-83.364993-54.187245c-6.947083-5.557666-9.725916-15.283582-4.16825-22.230665 5.557666-6.947083 15.283582-9.725916 22.230665-4.16825l104.206241 68.081411c4.16825 2.778833 6.947083 8.336499 6.947083 13.894166s-2.778833 11.115332-6.947083 13.894166l-104.206241 68.081411c-1.389417-1.389417-5.557666 0-8.336499 0zM552.987788 573.829037h-119.489823c-8.336499 0-16.672999-6.947083-16.672999-16.672999s6.947083-16.672999 16.672999-16.672999h119.489823c8.336499 0 16.672999 6.947083 16.672999 16.672999s-6.947083 16.672999-16.672999 16.672999z" fill="#FFFFFF" p-id="4151"></path> ';
        //   p =
        //     '<path d="M109.714286 986.038857h803.108571V36.790857H109.714286z" fill="#EEF9FF" p-id="4706"></path><path d="M912.822857 1022.537143H109.714286a36.571429 36.571429 0 0 1-36.571429-36.498286V36.790857a36.571429 36.571429 0 0 1 36.571429-36.571428h803.108571a36.571429 36.571429 0 0 1 36.571429 36.571428v949.248a36.571429 36.571429 0 0 1-36.571429 36.571429zM146.212571 949.613714h730.258286V73.289143H146.139429v876.251428z" fill="#2098F6" p-id="4707"></path><path d="M343.259429 511.414857a36.571429 36.571429 0 0 1-28.525715-13.677714L227.181714 388.242286a36.498286 36.498286 0 0 1 0-45.641143l87.552-109.494857a36.571429 36.571429 0 0 1 57.051429 45.568l-69.339429 86.747428 69.339429 86.674286a36.571429 36.571429 0 0 1-28.525714 59.318857z m336.018285 0a36.498286 36.498286 0 0 1-28.525714-59.245714l69.339429-86.747429-69.339429-86.747428a36.571429 36.571429 0 0 1 57.051429-45.568l87.478857 109.494857a36.498286 36.498286 0 0 1 0 45.641143L707.730286 497.737143a36.278857 36.278857 0 0 1-28.525715 13.677714zM473.453714 511.414857A36.571429 36.571429 0 0 1 438.857143 462.994286l75.629714-219.062857a36.571429 36.571429 0 0 1 68.973714 23.844571L507.904 486.838857a36.425143 36.425143 0 0 1-34.450286 24.576zM765.513143 685.933714H257.024a36.571429 36.571429 0 1 1 0-73.069714h508.489143a36.571429 36.571429 0 1 1 0 73.069714zM619.52 831.926857H257.024a36.571429 36.571429 0 1 1 0-72.996571h362.422857a36.571429 36.571429 0 1 1 0 72.996571z" fill="#2098F6" p-id="4708"></path>';
        // }
        // me.el.nativeElement.innerHTML = p;
      }
    }
    //console.info(log.join(", "));
  }
  // /**
  //  * 往上查找第一个relative的元素
  //  */
  // public static findUpRelativeDom(dom) {
  //   if (dom == null) {
  // return null;
  //   }
  //   if (dom.style.position == "relative") {
  // return dom;
  //   }
  //   if (dom.parentElement != null) {
  // return PfDropDirective.findUpRelativeDom(dom.parentElement);
  //   }
  //   return null;
  // }
  // public static isChildDomOf(child, parent) {
  //   if (child == null || child == undefined) {
  // return false;
  //   }
  //   if (child == parent) {
  // return true;
  //   }
  //   if (child.parentElement != null && child.parentElement != undefined) {
  // return PfDropDirective.isChildDomOf(child.parentElement, parent);
  //   }
  //   return false;
  // }
}
