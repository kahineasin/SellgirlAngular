/**
 * 模块说明:
 * 参考metabase的文件对应(引入时以开源版本的代码为主，因为收费版的代码似乎不能运行)
 * 1.model
 *   ->E:\svn\metabase-master\frontend\src\metabase\meta\types\Query.js  开源
 *   ->E:\svn\metabase专业版2\metabase\frontend\src\metabase-types\types\Query.js  企业
 * 2.metabase-types\types
 *   和1重复了,待删除
 * 3.lib
 *   ->E:\svn\metabase-master\frontend\src\metabase\lib\query
 *   暂时没完全用上,后来看到好像不是给前端用的(不确定),好像是给E:\svn\metabase-master\frontend\src\metabase-lib\lib\queries\StructuredQuery.js 使用的
 *   还有E:\svn\metabase-master\frontend\src\metabase\query_builder\components\BreakoutName.jsx
 * 4.metabase-lib
 *   ->E:\svn\metabase-master\frontend\src\metabase-lib
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SqlQueryAreaComponent } from './sql-query-area.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectStepComponent } from './step/select-step/select-step.component';
import { JoinStepComponent } from './step/join-step/join-step.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FilterStepComponent } from './step/filter-step/filter-step.component';

import { IconDefinition } from '@ant-design/icons-angular';
import {
  FilterFill,
  TableOutline,
  DatabaseOutline,
} from '@ant-design/icons-angular/icons';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { PfSvgIconModule } from '../share/pf-svg-icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzInputModule } from 'ng-zorro-antd/input';
import { PfDropdownPopupsModule } from '../share/pf-dropdown-popups';
import { PfSelectModule } from '../share/pf-select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { AggregationStepComponent } from './step/aggregation-step/aggregation-step.component';
import { StepRowComponent } from './step-row/step-row.component';
import { PfHoverModule } from '../share/pf-hover-style';
import { OrderStepComponent } from './step/order-step/order-step.component';
//import { ExpressionEditorTextfieldComponent } from "./expression/expression-editor-textfield/expression-editor-textfield.component"; //如果能导入这个组件不报错，那就说明metabase的自定义表达式基本能用了--benjamin todo
import { TokenizedExpressionComponent } from './expression/tokenized-expression/tokenized-expression.component';
import { TokenizedInputComponent } from './expression/tokenized-input/tokenized-input.component';
import { PfExpressionFieldComponent } from './pf-expression-field/pf-expression-field.component';
import { PfExpressionFieldJqComponent } from './pf-expression-field-jq/pf-expression-field-jq.component';
import { CustomColumnStepComponent } from './step/custom-column-step/custom-column-step.component';
import { SqlSelectColumnUlComponent } from './share/sql-select-column-ul/sql-select-column-ul.component';
import { LimitStepComponent } from './step/limit-step/limit-step.component';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
// 引入你需要的图标，比如你需要 fill 主题的 AccountBook Alert 和 outline 主题的 Alert，推荐 ✔️
const icons: IconDefinition[] = [FilterFill, TableOutline, DatabaseOutline];

@NgModule({
  imports: [
    CommonModule,
    NzSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzSpaceModule,
    NzDropDownModule,
    PfSvgIconModule,
    NzMenuModule,
    NzInputModule,
    PfDropdownPopupsModule,
    PfSelectModule,
    NzCheckboxModule,
    NzInputNumberModule,
    PfHoverModule,
    NzIconModule.forRoot(icons),
  ],
  declarations: [
    SqlSelectColumnUlComponent,
    SqlQueryAreaComponent,
    StepRowComponent,
    SelectStepComponent,
    JoinStepComponent,
    FilterStepComponent,
    AggregationStepComponent,
    OrderStepComponent,
    CustomColumnStepComponent,
    LimitStepComponent,
    TokenizedExpressionComponent,
    TokenizedInputComponent,
    //ExpressionEditorTextfieldComponent,
    PfExpressionFieldComponent,
    PfExpressionFieldJqComponent,
  ],
  exports: [
    SqlSelectColumnUlComponent,
    SqlQueryAreaComponent,
    StepRowComponent,
    SelectStepComponent,
    JoinStepComponent,
    FilterStepComponent,
    AggregationStepComponent,
    OrderStepComponent,
    CustomColumnStepComponent,
    LimitStepComponent,
    TokenizedExpressionComponent,
    TokenizedInputComponent,
    PfExpressionFieldJqComponent,
    //ExpressionEditorTextfieldComponent,
  ],
})
export class SqlQueryAreaModule {}
