import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { Observable, Observer } from "rxjs";
import { PfUtil } from "../common/pfUtil";
import { PfDropDirective } from "../pf_drag/pf-drop.directive";

/**
 * 画箭头用(推荐放在relative的div内部)
 */
@Component({
  selector: "pf-click-arrow",
  templateUrl: "./pf-click-arrow.component.html",
  styleUrls: ["./pf-click-arrow.component.scss"],
})
export class PfClickArrowComponent implements OnInit {
  @Input() startMove$?: Observable<any>;
  @Output() moveEnd = new EventEmitter<any>();
  // @Input() getIsDragging$: Observable<any>;
  lineX1: number = 0;
  lineY1: number = 0;
  lineX2: number = 0;
  lineY2: number = 0;
  svgWidth: number = 0;
  svgHeight: number = 0;
  public isDragging: boolean = false;
  isCursorMoving: boolean = false;  
  startDom: any = null;
  startRect: any = null;
  relativeDom: any = null;

  //以下参数参考https://blog.csdn.net/weixin_34112181/article/details/88748838
  public disX:number=0; // 记录鼠标点击事件的位置 X

  public disY:number=0; // 记录鼠标点击事件的位置 Y

  private totalOffsetX = 0; // 记录总偏移量 X轴
  private totalOffsetY = 0; // 记录总偏移量 Y轴

  constructor(public el: ElementRef) {}

  addHandler(element:any, type:any, handler:any) {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent("on" + type, handler);
    } else {
      element["on" + type] = handler;
    }
  }
  // 监听document移动事件事件
  @HostListener("document:mousemove", ["$event"]) onMousemove(
    event: MouseEvent
  ) {
    // 判断该元素是否被点击了。
    var me = this;
    if (this.isDragging) {
      // this.el.nativeElement.style.left =
      //   this.totalOffsetX + event.clientX - this.disX + "px";
      // this.el.nativeElement.style.top =
      //   this.totalOffsetY + event.clientY - this.disY + "px";
      //debugger;

      //console.info("x " + event.clientX + " y " + event.clientY);
      var escapeMouse = -5; //箭头的角可能会超出
      // var relativeDom = PfDropDirective.findUpRelativeDom(me.el.nativeElement);
      var relativeDom = me.relativeDom;
      var relativeRect =
        relativeDom == null ? null : relativeDom.getBoundingClientRect();

      // var x2 = event.x - (relativeRect != null ? relativeRect.left : 0);
      // var y2 = event.y - (relativeRect != null ? relativeRect.top : 0);
      var x2 = event.clientX - (relativeRect != null ? relativeRect.left : 0);
      var y2 = event.clientY - (relativeRect != null ? relativeRect.top : 0);
      if (!me.isCursorMoving) {
        me.isCursorMoving = true;
        me.lineX1 = x2;
        me.lineY1 = y2;
      } else {
        //修复起始点在startDom的边缘
        // var fixX = 0;
        // var fixY = 0;
        //debugger;
        var startLeft =
          me.startRect.left - (relativeRect != null ? relativeRect.left : 0);
        var startRight = startLeft + me.startRect.width;
        var startTop =
          me.startRect.top - (relativeRect != null ? relativeRect.top : 0);
        var startBottom = startTop + me.startRect.height;

        //方法1.这种方法的边线中点范围太小,不好
        // if (x2 < startLeft) {
        //   me.lineX1 = startLeft;
        // } else if (x2 > startRight) {
        //   me.lineX1 = startRight;
        // } else {
        //   me.lineX1 = (startLeft + startRight) / 2;
        // }
        // if (y2 < startTop) {
        //   me.lineY1 = startTop;
        // } else if (y2 > startBottom) {
        //   me.lineY1 = startBottom;
        // } else {
        //   me.lineY1 = (startTop + startBottom) / 2;
        // }

        //方法2.改用三角函数
        var angle=PfUtil.getAngle({x:(startLeft+startRight)/2,y:(startTop+startBottom)/2},{x:x2,y:y2});//
        console.info(angle);
        if(x2>startLeft&&x2<startRight&&y2>startTop&&y2<startBottom){//鼠标在节点内部   
          me.lineX1 =  (startLeft + startRight) / 2;
          me.lineY1 =(startTop + startBottom) / 2;
        }else 
        if(angle>=-22.5&&angle<22.5){
          me.lineX1 = startRight;
          me.lineY1 = (startTop + startBottom) / 2;
        }else if(angle>=22.5&&angle<67.5){
          me.lineX1 = startRight;
          me.lineY1 = startBottom;
        }else if(angle>=67.5&&angle<112.5){
          me.lineX1 = (startLeft + startRight) / 2;
          me.lineY1 =startBottom;
        }else if(angle>=112.5&&angle<157.5){
          me.lineX1 = startLeft;
          me.lineY1 =startBottom;
        }else if(angle>=-67.5&&angle<-22.5){
          me.lineX1 = startRight;
          me.lineY1 = startTop;
        }else if(angle>=-112.5&&angle<-67.5){
          me.lineX1 = (startLeft + startRight) / 2;
          me.lineY1 = startTop;
        }else if(angle>=-157.5&&angle<112.5){
          me.lineX1 = startLeft;
          me.lineY1 =startTop;
        }else {
          me.lineX1 = startLeft;
          me.lineY1 = (startTop + startBottom) / 2;
        }

        // var startRect =
        //   relativeDom == null ? null : relativeDom.getBoundingClientRect();
      }
      var cursorWidth = Math.max(me.lineX1, x2) - escapeMouse;
      var cursorHeight = Math.max(me.lineY1, y2) - escapeMouse;

      me.svgWidth = cursorWidth;
      me.svgHeight = cursorHeight;
      me.lineX2 = x2;
      me.lineY2 = y2;

      // if (me.isCursorMoving) {
      //   me.isFirstMove = false;
      //   // me.lineX1 = this.totalOffsetX + event.clientX - this.disX;
      //   // me.lineY1 = this.totalOffsetY + event.clientY - this.disY;
      //   me.lineX1 = event.clientX;
      //   me.lineY1 = event.clientY;
      // }
      // // me.lineX2 = this.totalOffsetX + event.clientX - this.disX;
      // // me.lineY2 = this.totalOffsetY + event.clientY - this.disY;
      // me.lineX2 = event.clientX;
      // me.lineY2 = event.clientY;
      // console.info("x " + event.clientX + " y " + event.clientY);
    }
  }

  //后来想想，还是不要自已结束为好，父组件可以决定在哪个事件中结束（这样便于取得想要的target对象)(但这样有别的问题，就是箭头挡住目标的问题)
  // 监听document离开事件
  @HostListener("document:mouseup", ["$event"]) onMouseup(event:any) {
    // 只用当元素移动过了，离开函数体才会触发。
    var me = this;
    //console.log("fail");
    if (me.isDragging) {
      //me.isDragging=false;
      //debugger;
      me.endMove();
      //event.target.parentElement.parentElement.style.display = "none";
      //这是div，不用属性绑定是因为,属性绑定不能立刻生效，所以隐藏了还是会影响elementFromPoint的返回结果
      me.el.nativeElement.children[0].style.display = "none";
      var elem = event.target.ownerDocument.elementFromPoint(
        event.clientX,
        event.clientY
      );
      // //debugger;
      // var cevent: any = document.createEvent("HTMLEvents");
      // // initEvent接受3个参数：
      // // 事件类型，是否冒泡，是否阻止浏览器的默认行为
      // //cevent.initEvent("click", true, true);
      // cevent.initEvent("click", true, false);
      // cevent.eventType = "message";
      // //触发document上绑定的自定义事件ondataavailable
      // elem.dispatchEvent(cevent);
      me.moveEnd.emit(elem);
      // console.log("fail");
      // // this.totalOffsetX += event.clientX - this.disX;
      // // this.totalOffsetY += event.clientY - this.disY;
      // this.isDragging = false;
      // me.isCursorMoving = false;
      // me.lineX1 = 0;
      // me.lineY1 = 0;
      // me.lineX2 = 0;
      // me.lineY2 = 0;
      // debugger;
      // me.moveEnd.emit(event);
      // // event.target.click(event);
      // //event.target.ownerDocument.fireEvent("click", event);
    }
  }

  ngOnInit(): void {
    var me = this;
    //this.el.nativeElement.style.position = "relative";
    if(me.startMove$==null){return;}
    me.startMove$.subscribe((srcDom) => {
      //me.startMove(nums[0], nums[1]);
      me.startMove(srcDom);
    });
    // // me.getIsDragging$.subscribe((srcDom) => {
    // //   //me.startMove(nums[0], nums[1]);
    // //   me.isDragging();
    // // });
    // me.getIsDragging$ = new Observable((observer: Observer<any>) => {
    //   //意思是定义一个异步操作
    //   observer.next(me.isDragging);
    //   // observer.next(null);
    //   // observer.complete();
    // });
  }
  // startMove(x: number, y: number) {
  //   //benjamin todo
  //   var me = this;
  //   this.disX = x;
  //   this.disY = y;
  //   me.lineX1 = x;
  //   me.lineY1 = y;
  //   // this.disX = event.clientX;
  //   // this.disY = event.clientY;
  //   me.isDragging = true;
  // }
  startMove(startDom:any):void {
    //benjamin todo
    var me = this;
    //debugger;
    me.el.nativeElement.children[0].style.display = "";
    // this.disX = x;
    // this.disY = y;
    // me.lineX1 = x;
    // me.lineY1 = y;
    // this.disX = event.clientX;
    // this.disY = event.clientY;
    me.isDragging = true;
    me.isCursorMoving = false;
    me.startDom = startDom;
    me.startRect = startDom.getBoundingClientRect();
    me.relativeDom = PfDropDirective.findUpRelativeDom(me.el.nativeElement);
  }
  endMove() {
    // 只用当元素移动过了，离开函数体才会触发。
    var me = this;
    if (this.isDragging) {
      console.log("fail");
      // this.totalOffsetX += event.clientX - this.disX;
      // this.totalOffsetY += event.clientY - this.disY;
      this.isDragging = false;
      me.isCursorMoving = false;
      me.lineX1 = 0;
      me.lineY1 = 0;
      me.lineX2 = 0;
      me.lineY2 = 0;
      // debugger;
      // me.moveEnd.emit(event);
      // event.target.click(event);
      //event.target.ownerDocument.fireEvent("click", event);
    }
  }
}
