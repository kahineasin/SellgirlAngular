import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { zh_CN } from 'ng-zorro-antd/i18n';
import { CommonModule, registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconsProviderModule } from './icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { JobDigraphComponent } from './job-digraph/job-digraph.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
// import { CommonModule } from "@angular/common";
// import { NgModule } from "@angular/core";
// import { FormsModule, ReactiveFormsModule } from "@angular/forms";
// import { HttpClientModule } from "@angular/common/http";
//import { MonacoEditorModule } from "ngx-monaco-editor";

import { NzInputModule } from 'ng-zorro-antd/input';
//import { NzButtonModule } from "ng-zorro-antd/button";
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NgxGraphModule } from '@swimlane/ngx-graph';
//import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzDividerModule } from 'ng-zorro-antd/divider';

// import { ComputesRoutingModule } from "./computes-routing.module";
// import { ComputesXSchedulerJobListComponent } from "../../components/xSchedulerJob-list/xSchedulerJob-list.component";
// import { ComputesXSchedulerJobFormComponent } from "../../components/xSchedulerJob-form/xSchedulerJob-form.component";
// import { ComputesXSchedulerTaskListComponent } from "../../components/xSchedulerTask-list/xSchedulerTask-list.component";
// import { ComputesXSchedulerTaskScheduleListComponent } from "../../components/xSchedulerTaskSchedule-list/xSchedulerTaskSchedule-list.component";
// import { AiXSchedulerJobDigraphComponent } from "../../components/xSchedulerJob-digraph/xSchedulerJob-digraph.component";

import { PfQuartzCronModule } from './pf-quartz-cron';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PfDragModule } from './pf_drag';
import { PfSvgBtnModule } from './share/pf-svg-btn';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { PfClickArrowModule } from './pf-click-arrow';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

import { IconDefinition } from '@ant-design/icons-angular';
// 引入你需要的图标，比如你需要 fill 主题的 AccountBook Alert 和 outline 主题的 Alert，推荐 ✔️
import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  DashboardOutline,
  FormOutline,
  AccountBookFill,
  AlertFill,
  AlertOutline,
  DragOutline,
  RiseOutline,
  DeleteOutline,
} from '@ant-design/icons-angular/icons';
import { PfSvgIconModule } from './share/pf-svg-icon';

import { PfDropdownPopupsModule } from './share/pf-dropdown-popups';
import { PfSelectModule } from './share/pf-select';
import { PfInputModule } from './share/pf-input';
import { PfHoverModule } from './share/pf-hover-style';
import { SqlQueryAreaModule } from './sql-query-area';
import { DatamodelQueryEditComponent } from './datamodel-query-edit/datamodel-query-edit.component';
//import { SqlQueryAreaImportTestModule } from './sql-query-area-import-test';
import {HashLocationStrategy, LocationStrategy} from "@angular/common";

const icons: IconDefinition[] = [
  MenuFoldOutline,
  MenuUnfoldOutline,
  DashboardOutline,
  FormOutline,
  AccountBookFill,
  AlertOutline,
  AlertFill,
  DragOutline,
  RiseOutline,
  DeleteOutline,
];
//import { XSchedulerTaskDetailComponent } from "../../components/x-scheduler-task-detail/x-scheduler-task-detail.component";

registerLocaleData(zh);

@NgModule({
  declarations: [
    AppComponent,
    JobDigraphComponent,
    DatamodelQueryEditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,

    CommonModule,
    HttpClientModule,
    //ComputesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzSelectModule,
    NzMessageModule,
    NzModalModule,
    NzTableModule,
    NzPaginationModule,
    NzInputModule,
    NzIconModule,
    NzFormModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzToolTipModule,
    NzDescriptionsModule,
    NzDrawerModule,
    //MonacoEditorModule,
    NgxGraphModule,
    NzLayoutModule,
    NzSpaceModule,
    NzAffixModule,
    NzUploadModule,
    NzDividerModule,

    PfQuartzCronModule,
    NzSpinModule,
    NzInputNumberModule,
    NzPopconfirmModule,
    NzProgressModule,
    NzTabsModule,
    DragDropModule,
    PfDragModule,
    PfSvgBtnModule,
    NzRadioModule,
    PfClickArrowModule,
    NzDropDownModule,
    NzIconModule,
    PfSvgIconModule,

    PfDropdownPopupsModule,
    PfSelectModule,
    PfInputModule,
    PfHoverModule,

    //SqlQueryAreaImportTestModule,
    SqlQueryAreaModule,
    NzIconModule.forRoot(icons),
  ],
  providers: [{ provide: NZ_I18N, useValue: zh_CN },{
    provide:LocationStrategy,
    useClass:HashLocationStrategy
  }],
  bootstrap: [AppComponent],
})
export class AppModule {}
