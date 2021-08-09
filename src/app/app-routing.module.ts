import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JobDigraphComponent } from './job-digraph/job-digraph.component';

const routes: Routes = [
  // { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: '', pathMatch: 'full', redirectTo: '/job-add' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule) },
  {
    path: "job-add",
    component: JobDigraphComponent,
  },
  {
    path: "job-edit/:jobId",
    component: JobDigraphComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
