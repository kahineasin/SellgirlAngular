import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "step-row",
  templateUrl: "./step-row.component.html",
  styleUrls: ["./step-row.component.scss"],
})
export class StepRowComponent implements OnInit {
  @Input() title: string = "";
  //@Input() visible: boolean = true; //显示属性不需要,应该
  @Input() color: number[] = [0, 0, 0];
  @Input() allowDelete: boolean = true;
  //@Input() allowDelete: boolean;
  @Output() delete = new EventEmitter<any>();
  visible: boolean = true; //显示属性不需要input
  delBtnVisible: boolean = false;
  constructor() {}

  ngOnInit(): void {
    const me = this;
    console.info(me.color);
  }
  onDelete() {
    const me = this;
    //me.visible = false;//隐藏最好通过父组件数据驱动,否则像sqlquery嵌套删除外层时,本组件隐藏了,但实际可能还需要显示出来
    me.delete.emit(); //父元素可以监听此事件
  }
  getBackColor() {
    const me = this;
    return (
      "rgba(" + me.color[0] + "," + me.color[1] + "," + me.color[2] + ",0.1)"
    );
  }
  getFrontColor() {
    const me = this;
    return "rgb(" + me.color[0] + "," + me.color[1] + "," + me.color[2] + ")";
  }
}
