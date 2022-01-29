import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FormsModule } from "@angular/forms";
import { PfDropdownPopupsComponent } from "./pf-dropdown-popups.component";

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [PfDropdownPopupsComponent],
  exports: [PfDropdownPopupsComponent],
})
export class PfDropdownPopupsModule {}
