import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
// import { QuartzCronModule, UnixCronModule } from "@sbzen/ng-cron";
import { PfDropdownPopupsModule } from "../pf-dropdown-popups";
import { PfSelectComponent } from "./pf-select.component";
import { IconDefinition } from "@ant-design/icons-angular";
import { NzIconModule } from "ng-zorro-antd/icon";
import { DownOutline } from "@ant-design/icons-angular/icons";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";

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
    NzToolTipModule,
    NzIconModule.forRoot(icons),
  ],
  declarations: [PfSelectComponent],
  exports: [PfSelectComponent],
})
export class PfSelectModule {}
