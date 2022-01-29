/**
 *
 * 暂时没使用，因为组件方式外层套了一层，导致svg显示有问题，改用指令pfSvgIconD
 * 此组件未完成
 */
import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "pf-svg-icon",
  templateUrl: "./pf-svg-icon.component.html",
  styleUrls: ["./pf-svg-icon.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class PfSvgIconComponent implements OnInit {
  @Input() x: number;
  @Input() iconType: string; //APP_JAVA等
  constructor() {}

  ngOnInit(): void {}
}
