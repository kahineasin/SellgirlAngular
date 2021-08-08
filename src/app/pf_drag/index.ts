import { NgModule } from "@angular/core";
import { PfDragDirective } from "./pf-drag.directive";
import { PfDropDirective } from "./pf-drop.directive";
import { PfDrag001Directive } from "./pf-drag001.directive";
// import { PfCronJobsComponent } from "./pf-cron-jobs/pf-cron-jobs.component";
// import { DataService } from "./services/data.service";
// import { PosixService } from "./services/posix.service";
// import { QuartzService } from "./services/quartz.service";

@NgModule({
  declarations: [PfDragDirective, PfDropDirective, PfDrag001Directive],
  exports: [PfDragDirective, PfDropDirective, PfDrag001Directive],
  //providers: [DataService, PosixService, QuartzService],
})
export class PfDragModule {}
