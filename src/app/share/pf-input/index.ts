import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
// import { QuartzCronModule, UnixCronModule } from "@sbzen/ng-cron";
import { PfDropdownPopupsModule } from "../pf-dropdown-popups";
import { IconDefinition } from "@ant-design/icons-angular";
import { NzIconModule } from "ng-zorro-antd/icon";
import { DownOutline } from "@ant-design/icons-angular/icons";
//import { PfInputComponent } from "./pf-input.component";
//import { PfInputTest1Component } from "./pf-input-test1/pf-input-test1.component";
//import { PfSelectModule } from "../pf-select";

// 引入你需要的图标，比如你需要 fill 主题的 AccountBook Alert 和 outline 主题的 Alert，推荐 ✔️
const icons: IconDefinition[] = [DownOutline];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // QuartzCronModule,
    // UnixCronModule,
    PfDropdownPopupsModule,
    // PfSelectModule,
    NzIconModule.forRoot(icons),
  ],
  // declarations: [PfInputComponent],
  // exports: [PfInputComponent],
  // declarations: [PfInputTest1Component],
  // exports: [PfInputTest1Component],
})
export class PfInputModule {}
