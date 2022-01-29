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
} from '@angular/core';
import { PfUtil } from '../common/pfUtil';
//import { debug } from "console";
import { DragType, PfDragDirective } from './pf-drag.directive';

export class PfDropModel {
  public dragDom: any;
  // public dropDom: any;
  // public cursorDom: any;
  // //public arrowDom: any;
  // //要把起点坐标记下来，让pfDrop来计算
  public x2: number = 0;
  public y2: number = 0;
  // //为了在pfDrop里判断，正在移动时不用再计算x1
  // public isCursorMoving: boolean = false;
  // public dragType: DragType = DragType.copySrc;
}

@Directive({
  selector: '[pfDrop]',
})
export class PfDropDirective implements OnInit {
  /**
   * 注意，此事件不是100%触发的，因为当拖出范围时就不会触发。如果要100%触发的事件，请改用drag.directive.ts的pfDragEnd事件
   */
  @Output() pfDropEnd = new EventEmitter<PfDropModel>();
  /**
   * 新增此事件，为了做aplit条的拖动效果--benjamin 20220125
   */
  @Output() pfDragging = new EventEmitter<PfDropModel>();
  constructor(public el: ElementRef) {}
  public isDown = false;

  public disX; // 记录鼠标点击事件的位置 X

  public disY; // 记录鼠标点击事件的位置 Y

  private totalOffsetX = 0; // 记录总偏移量 X轴
  private totalOffsetY = 0; // 记录总偏移量 Y轴

  /**
   * 往上查找第一个relative的元素
   */
  public static findUpRelativeDom(dom) {
    // if (dom == null) {
    //   return null;
    // }
    // if (dom.style.position === "relative") {
    //   return dom;
    // }
    // if (dom.parentElement != null) {
    //   return PfDropDirective.findUpRelativeDom(dom.parentElement);
    // }
    // return null;
    return PfUtil.findUpRelativeDom(dom);
  }
  public static isChildDomOf(child, parent) {
    if (child == null || child === undefined) {
      return false;
    }
    if (child === parent) {
      return true;
    }
    if (child.parentElement != null && child.parentElement !== undefined) {
      return PfDropDirective.isChildDomOf(child.parentElement, parent);
    }
    return false;
  }

  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    const me = this;
    event.preventDefault();
    if (DragType.copySrc === PfDragDirective.currentDraggingModel.dragType) {
      const cursorRect =
        PfDragDirective.currentDraggingModel.cursorDom.getBoundingClientRect();
      const relativeDom = PfDropDirective.findUpRelativeDom(
        me.el.nativeElement
      );
      const relativeRect =
        relativeDom == null ? null : relativeDom.getBoundingClientRect();

      PfDragDirective.currentDraggingModel.cursorDom.style.left =
        event.x -
        (relativeRect != null ? relativeRect.left : 0) -
        cursorRect.width / 2 +
        'px';
      PfDragDirective.currentDraggingModel.cursorDom.style.top =
        event.y -
        (relativeRect != null ? relativeRect.top : 0) -
        cursorRect.height / 2 +
        'px';
    } else if (
      DragType.arrow === PfDragDirective.currentDraggingModel.dragType
    ) {
      const escapeMouse = -5; // 箭头的角可能会超出

      const relativeDom = PfDropDirective.findUpRelativeDom(
        me.el.nativeElement
      );
      const relativeRect =
        relativeDom == null ? null : relativeDom.getBoundingClientRect();

      const x1 =
        PfDragDirective.currentDraggingModel.x1 -
        (relativeRect != null ? relativeRect.left : 0);
      const y1 =
        PfDragDirective.currentDraggingModel.y1 -
        (relativeRect != null ? relativeRect.top : 0);
      const x2 = event.x - (relativeRect != null ? relativeRect.left : 0);
      const y2 = event.y - (relativeRect != null ? relativeRect.top : 0);
      const cursorWidth = Math.max(x1, x2) - escapeMouse;
      const cursorHeight = Math.max(y1, y2) - escapeMouse;

      const arrowSvg = PfDragDirective.getCurrentCursorSvgDom();
      const arrowLine = PfDragDirective.getCurrentCursorArrowDom();
      arrowSvg.style.width = cursorWidth + 'px';
      arrowSvg.style.height = cursorHeight + 'px';
      if (!PfDragDirective.currentDraggingModel.isCursorMoving) {
        PfDragDirective.currentDraggingModel.isCursorMoving = true;
        arrowLine.setAttribute('x1', x1);
        arrowLine.setAttribute('y1', y1);
      }

      arrowLine.setAttribute('x2', x2);
      arrowLine.setAttribute('y2', y2);
    }

    const m = new PfDropModel();
    m.x2 = event.x;
    m.y2 = event.y;
    m.dragDom = PfDragDirective.currentDraggingModel.cursorDom;
    this.pfDragging.emit(m);
  }
  /**
   *
   * @param event {target:被拖动的元素,currentTarget拖进的目标}
   */
  @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
    event.preventDefault();
    // debugger;
    // 有时dop的target会是<rect class="panning-rect" width="158200" height="27700" transform="translate(-79100,-13850)"></rect>，原因不明
    const m = new PfDropModel();
    m.x2 = event.x;
    m.y2 = event.y;
    m.dragDom = PfDragDirective.currentDraggingModel.cursorDom;
    this.pfDropEnd.emit(m);
  }

  ngOnInit() {}
}
