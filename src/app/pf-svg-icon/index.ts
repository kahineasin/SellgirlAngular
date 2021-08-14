import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { PfSvgIconComponent } from "./pf-svg-icon.component";
import { PfSvgIconPathDirective } from "./pf-svg-icon-path.directive";
import { PfSvgIconD2Directive } from "./pf-svg-icon-d2.directive";

@NgModule({
  imports: [CommonModule],
  declarations: [
    PfSvgIconComponent,
    PfSvgIconPathDirective,
    PfSvgIconD2Directive,
  ],
  exports: [PfSvgIconComponent, PfSvgIconPathDirective, PfSvgIconD2Directive],
})
export class PfSvgIconModule {}
