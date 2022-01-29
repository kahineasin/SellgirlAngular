import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatamodelQueryEditComponent } from './datamodel-query-edit/datamodel-query-edit.component';
import { JobDigraphComponent } from './job-digraph/job-digraph.component';

const routes: Routes = [
  // { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: '', pathMatch: 'full', redirectTo: '/job-add' },
  {
    path: 'welcome',
    loadChildren: () =>
      import('./pages/welcome/welcome.module').then((m) => m.WelcomeModule),
  },
  {
    path: 'job-add',
    component: JobDigraphComponent,
  },
  {
    path: 'job-edit/:jobId',
    component: JobDigraphComponent,
  },
  { path: 'datamodel-add', component: DatamodelQueryEditComponent },
  {
    path: 'datamodel-edit/:datamodelId',
    component: DatamodelQueryEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
