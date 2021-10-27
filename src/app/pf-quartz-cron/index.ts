import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PfQuartzCronComponent } from './pf-quartz-cron.component';
import { QuartzCronModule } from '@sbzen/ng-cron';
// import { PfCronJobsComponent } from "./pf-cron-jobs/pf-cron-jobs.component";
// import { DataService } from "./services/data.service";
// import { PosixService } from "./services/posix.service";
// import { QuartzService } from "./services/quartz.service";

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, QuartzCronModule],
  declarations: [PfQuartzCronComponent],
  exports: [PfQuartzCronComponent],
  //providers: [DataService, PosixService, QuartzService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PfQuartzCronModule {}
