//https://blog.csdn.net/weixin_34112181/article/details/88748838
//测试此组件发现效果不好，改为drag事件方式(需copy dom之后用xy定位到鼠标位置，未完成)
//复制图标的方式已完成
//drag箭头方式也已完成，但没用上，因为有向图的svg元素的drag方法好像有冲突
import {
  Directive,
  ElementRef,
  OnInit,
  HostListener,
  Input,
} from "@angular/core";
import { PfDropDirective } from "./pf-drop.directive";

export enum DragType {	  /**
  * 后来发现html5拖动时本身就是有跟随图标的，只是当win7使用了桌面“经典模式”后，跟随图标会不显示
  */
 html5,
  /**
   * 复制源dom(默认方式)
   */
  copySrc,
  /**
   * 箭头
   */
  arrow,
}
export class PfDraggingModel {
  public dragDom: any;
  public dropDom: any;
  public cursorDom: any;
  //public arrowDom: any;
  //要把起点坐标记下来，让pfDrop来计算
  public x1: number=0;
  public y1: number=0;
  //为了在pfDrop里判断，正在移动时不用再计算x1
  public isCursorMoving: boolean = false;
  public dragType: DragType = DragType.copySrc;
}

@Directive({
  selector: "[pfDrag]",
})
export class PfDragDirective implements OnInit {
  @Input() dragType: DragType = DragType.copySrc;
  constructor(public el: ElementRef) {}
  public isDown = false;

  public disX?:number; // 记录鼠标点击事件的位置 X

  public disY?:number; // 记录鼠标点击事件的位置 Y

  private totalOffsetX = 0; // 记录总偏移量 X轴
  private totalOffsetY = 0; // 记录总偏移量 Y轴
  //public dragType: PfDraggingModel; //用于创建临时dom，当作鼠标指针

  arrowColor: string = "#40A9FF";
  /**
   * 当前拖动的东西只可能是一个，所以用静态成员便于共享值
   */
  //public static cursorDom: any; //用于创建临时dom，当作鼠标指针
  public static currentDraggingModel?: PfDraggingModel|null; //用于创建临时dom，当作鼠标指针

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
    //这个事件应该加到目标上才行
    var me = this;
    event.preventDefault();
    // console.info("[drag]-dragover");
    console.info("[drag]-dragover" + event.x + "---" + event.y);
    //me.cursorDom;
  }
  public static getCurrentCursorArrowDom() {
    //return PfDragDirective.currentDraggingModel.cursorDom.children[0];
    if(PfDragDirective.currentDraggingModel==null){return null;}
    return PfDragDirective.currentDraggingModel.cursorDom.children[0]
      .children[0];
  }
  public static getCurrentCursorSvgDom() {
    if(PfDragDirective.currentDraggingModel==null){return null;}
    return PfDragDirective.currentDraggingModel.cursorDom.children[0];
  }
  @HostListener("dragstart", ["$event"]) onDragStart(event: DragEvent) {
    var me = this;
    //var aa: EventTarget;
    console.info("[drag]-dragstart " + me.dragType.toString());
    console.info("x " + event.x + " y " + event.y);
    var dom: any = event.target;

    // me.cursorDom = dom.cloneNode(true);
    // me.cursorDom.style.position = "absolute";
    // me.cursorDom.style.top = "0px";
    // me.cursorDom.style.left = "0px";
    // dom.parentElement.appendChild(me.cursorDom);
    PfDragDirective.currentDraggingModel = new PfDraggingModel();
    PfDragDirective.currentDraggingModel.dragType = me.dragType;
    if (DragType.copySrc == me.dragType) {
      //debugger;
      //PfDragDirective.currentDraggingModel = new PfDraggingModel();
      PfDragDirective.currentDraggingModel.cursorDom = dom.cloneNode(true);
      var domRect = dom.getBoundingClientRect();
      var cursorRect =
        PfDragDirective.currentDraggingModel.cursorDom.getBoundingClientRect();
      //debugger;
      if (cursorRect.width == 0) {
        PfDragDirective.currentDraggingModel.cursorDom.style.width =
          domRect.width + "px";
        PfDragDirective.currentDraggingModel.cursorDom.style.height =
          domRect.height + "px";
      }
      PfDragDirective.currentDraggingModel.cursorDom.style.position =
        "absolute";

      PfDragDirective.currentDraggingModel.cursorDom.style.top = "-10000px"; //这里不能显示出来，否则会挡住pfDrop的dragover事件触发不了
      PfDragDirective.currentDraggingModel.cursorDom.style.left = "-10000px";

      // PfDragDirective.cursorDom.style.top = event.y + "px";
      // PfDragDirective.cursorDom.style.left = event.x + "px";
      dom.parentElement.appendChild(
        PfDragDirective.currentDraggingModel.cursorDom
      );
    } else if (DragType.html5 == me.dragType) {
      //debugger;
      //PfDragDirective.currentDraggingModel = new PfDraggingModel();
      PfDragDirective.currentDraggingModel.cursorDom = dom;
    }else if (DragType.arrow == me.dragType) {
      //PfDragDirective.currentDraggingModel = new PfDraggingModel();
      //PfDragDirective.currentDraggingModel.dragType = DragType.arrow;
      PfDragDirective.currentDraggingModel.x1 = event.x;
      PfDragDirective.currentDraggingModel.y1 = event.y;

    

      //方法1
      //不能用div蒙版，否则会挡住，不能触发绑定了pfDrop的元素的drop事件(后来发现drop事件还是生效的)
      PfDragDirective.currentDraggingModel.cursorDom =
        dom.ownerDocument.createElement("div");
      PfDragDirective.currentDraggingModel.cursorDom.style.position =
        "absolute";
      PfDragDirective.currentDraggingModel.cursorDom.style.zIndex = "999";
      PfDragDirective.currentDraggingModel.cursorDom.style.left = "0px";
      PfDragDirective.currentDraggingModel.cursorDom.style.top = "0px";
      // PfDragDirective.currentDraggingModel.cursorDom.style.width = "100%";//不能挡住鼠标
      // PfDragDirective.currentDraggingModel.cursorDom.style.height = "100%";
      PfDragDirective.currentDraggingModel.cursorDom.style.width = "0px";
      PfDragDirective.currentDraggingModel.cursorDom.style.height = "0px";
      // PfDragDirective.currentDraggingModel.cursorDom.style.color =
      //   me.arrowColor;
      PfDragDirective.currentDraggingModel.cursorDom.innerHTML =
        '<svg><line x1="0" y1="0" x2="0" y2="0" stroke="' +
        me.arrowColor +
        '" stroke-width="2" marker-end="url(#arrow)" /></svg>';

      //方法2
      //直接生成svg，坐标基点为上层relative的dom
      //这样也有问题,svg一定要在一个absolute的浮动层上面显示才好(否则要么占位，要么不能显示出来,似乎和flex box 的parent还有冲突)
      // PfDragDirective.currentDraggingModel.cursorDom =
      //   dom.ownerDocument.createElement("svg");
      // PfDragDirective.currentDraggingModel.cursorDom.innerHTML =
      //   '<line x1="0" y1="0" x2="0" y2="0" stroke="red" stroke-width="2" marker-end="url(#arrow)" />';

      // PfDragDirective.currentDraggingModel.cursorDom.setAttribute(
      //   "draggable",
      //   "true"
      // );

      // PfDragDirective.currentDraggingModel.cursorDom.innerHTML =
      //   '<svg><line x1="' +
      //   event.x +
      //   '" y1="' +
      //   event.y +
      //   '" x2="' +
      //   100 +
      //   '" y2="' +
      //   100 +
      //   '" stroke="red" stroke-width="2" marker-end="url(#arrow)" /></svg>';
      // // PfDragDirective.currentDraggingModel.cursorDom.innerHTML =
      // //   '<svg><line x1="0" y1="0" x2="' +
      // //   100 +
      // //   '" y2="' +
      // //   100 +
      // //   '" stroke="red" stroke-width="2" marker-end="url(#arrow)" /></svg>';

      // var p = dom.ownerDocument.createElement("p");
      // p.setAttribute("x1", "0");
      // debugger;
      // p.innerHtml = "aabb";
      // PfDragDirective.currentDraggingModel.cursorDom.appendChild(p);

      // var svg = dom.ownerDocument.createElement("svg");
      // svg.innerHtml =
      //   '<line x1="0" y1="0" x2="200" y2="50" stroke="red" stroke-width="2" marker-end="url(#arrow)" />';
      //dom.parentElement.appendChild(svg);

      //var line = dom.ownerDocument.createElement("line");
      //dialogDiv.className = 'agentDialog';
      //dialogDiv.innerHTML = '<iframe src="" style="width:100%"></iframe>';
      //     line.style.position = 'absolute';
      // canvas.style.zIndex = '-100';
      // canvas.style.top = '0px';
      // dom.appendChild(canvas);

      //   <line
      //   x1="0"
      //   y1="0"
      //   x2="200"
      //   y2="50"
      //   stroke="red"
      //   stroke-width="2"
      //   marker-end="url(#arrow)"
      // />
      dom.parentElement.appendChild(
        PfDragDirective.currentDraggingModel.cursorDom
      );
      // svg.appendChild(line);
      // line.x1 = "0";
      // line.y1 = "0";
      // line.x2 = "200";
      // line.y2 = "50";
      // line.stroke = "red";
      // line.strokeWidth = "2";
      // line.markerEnd = "url(#arrow)";
      //debugger;
    }

    // var cursorDom=dom.cloneNode(true);
    // dom.parentElement.appendChild(cursorDom);
    //debugger;
    //event.originalEvent.dataTransfer.setData("Text", event.target.innerHTML);
  }
  @HostListener("dragend", ["$event"]) onDragEnd(event:any) {
    var me = this;
    console.info("[drag]-dragend");
    //return;
    if(PfDragDirective.currentDraggingModel==null){return ;}
    if (DragType.copySrc == me.dragType) {
      //测试时注释--benjamin todo
      //event.originalEvent.dataTransfer.setData("Text", event.target.innerHTML);
      PfDragDirective.currentDraggingModel.cursorDom.parentElement.removeChild(
        PfDragDirective.currentDraggingModel.cursorDom
      );
      PfDragDirective.currentDraggingModel.cursorDom = null;
      PfDragDirective.currentDraggingModel = null;
    } else if (DragType.html5 == me.dragType) {
      PfDragDirective.currentDraggingModel.cursorDom = null;
      PfDragDirective.currentDraggingModel = null;
    } else if (DragType.arrow == me.dragType) {
      //测试时注释--benjamin todo
      //event.originalEvent.dataTransfer.setData("Text", event.target.innerHTML);
      PfDragDirective.currentDraggingModel.cursorDom.parentElement.removeChild(
        PfDragDirective.currentDraggingModel.cursorDom
      );
      PfDragDirective.currentDraggingModel.cursorDom = null;
      PfDragDirective.currentDraggingModel = null;
    }
  }
  @HostListener("drop", ["$event"]) onDrop(event:any) {
    console.info("[drag]-drop");
    //event.originalEvent.dataTransfer.setData("Text", event.target.innerHTML);
  }
  ngOnInit() {
    //this.el.nativeElement.style.position = "relative";
    this.el.nativeElement.draggable = true;
  }
}
