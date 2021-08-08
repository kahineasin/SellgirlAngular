//https://blog.csdn.net/weixin_34112181/article/details/88748838
//测试此组件发现效果不好,这是原版
//这种方式的mouseup是在document上的，似乎会被其它事件阻止，不好用
import { Directive, ElementRef, OnInit, HostListener } from "@angular/core";

@Directive({
  selector: "[pfDrag001]",
})
export class PfDrag001Directive implements OnInit {
  constructor(public el: ElementRef) {}
  public isDown = false;

  public disX:number=0; // 记录鼠标点击事件的位置 X

  public disY:number=0; // 记录鼠标点击事件的位置 Y

  private totalOffsetX = 0; // 记录总偏移量 X轴
  private totalOffsetY = 0; // 记录总偏移量 Y轴

  // 点击事件
  @HostListener("mousedown", ["$event"]) onMousedown(event:any) {
    this.isDown = true;
    this.disX = event.clientX;
    this.disY = event.clientY;
  }

  // 监听document移动事件事件
  @HostListener("document:mousemove", ["$event"]) onMousemove(event:any) {
    // 判断该元素是否被点击了。
    if (this.isDown) {
      this.el.nativeElement.style.left =
        this.totalOffsetX + event.clientX - this.disX + "px";
      this.el.nativeElement.style.top =
        this.totalOffsetY + event.clientY - this.disY + "px";
    }
  }

  // 监听document离开事件
  @HostListener("document:mouseup", ["$event"]) onMouseup(event:any) {
    // 只用当元素移动过了，离开函数体才会触发。
    if (this.isDown) {
      console.log("fail");
      this.totalOffsetX += event.clientX - this.disX;
      this.totalOffsetY += event.clientY - this.disY;
      this.isDown = false;
    }
  }

  ngOnInit() {
    this.el.nativeElement.style.position = "relative";
  }
}
