//后来发现似乎没有必要，可以直接用 nz-radio-group + nz-radio-button + nz-icon
//(如 xSchedulerJob-digraph.component.html 里的)
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
// import { FormsModule, ReactiveFormsModule } from "@angular/forms";
// import { QuartzCronModule } from "@sbzen/ng-cron";
import { PfSvgBtnComponent } from "./pf-svg-btn.component";
import { NzIconModule } from "ng-zorro-antd/icon";
// import { PfCronJobsComponent } from "./pf-cron-jobs/pf-cron-jobs.component";
// import { DataService } from "./services/data.service";
// import { PosixService } from "./services/posix.service";
// import { QuartzService } from "./services/quartz.service";

@NgModule({
  imports: [CommonModule, NzIconModule],
  declarations: [PfSvgBtnComponent],
  exports: [PfSvgBtnComponent],
  //providers: [DataService, PosixService, QuartzService],
})
export class PfSvgBtnModule {}
