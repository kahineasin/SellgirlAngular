import {
  Component,
  ElementRef,
  EventEmitter,
  Host,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
  Renderer2,
  SkipSelf,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  FormGroup,
  NgModel,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validator,
  ValidatorFn,
} from '@angular/forms';
import { KeyValuePair } from '../../common/pfModel';
//import { PfUtil } from "../../../../../core/common/pfUtil";
import { QuestionBase } from '../test-component/pf-dynamic-form/question-base';
import { QuestionControlService } from '../test-component/pf-dynamic-form/question-control.service';
import { TextboxQuestion } from '../test-component/pf-dynamic-form/question-textbox';
// import { ElementBase } from "../pf-form/form";
import { PfInputComponent } from '../pf-input/pf-input.component';

/**
 * 用于替换ant的select组件
 * 
 * 使用方法:
  <pf-select
    [(ngModel)]="joinType"
    [list]="joinTypeList"
    [disabled]="false"
    style="width: 80px"
  >
  </pf-select>

 * 注意:
 * 1.list不要绑到函数返回值,最好绑到实际的属性上,否则当嵌套使用时,点击子窗下拉时,event.target.parentElement将是null,无法判断是属于父窗口内
 * 
 * ant下拉有3个缺点
 * 1.不能自适应高度
 * 2.不能跟随滚动
 * 3.不好判断它是在其它组件内部(因为浮动层生成在document.body下,不处于原来位置)
 */
@Component({
  selector: 'pf-select',
  templateUrl: './pf-select.component.html',
  styleUrls: ['./pf-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PfSelectComponent,
      multi: true,
    },
  ],
})
//extends ElementBase<string>
export class PfSelectComponent
  extends PfInputComponent
  implements OnInit, ControlValueAccessor
{
  @Input() list: KeyValuePair[] = [];
  @Input() editable = true;
  @Input() pfPlaceHolder = '';
  //@Input() formControlName: string;
  // protected getFormControlName() {
  //   return this.formControlName;
  // }

  // @Output() input: EventEmitter<any> = new EventEmitter();
  //@ViewChild(NgModel) model: NgModel;

  //感觉如果要自定义input样式时,还不如单纯用pf-dropdown-popups好了,只是少了li的hover样式而已
  // @Input() inputStyle: Object = {};
  pfKey: any;
  pfValue: any;
  pfDisabled = false;
  // currentInputStyle: Object = {
  //   backgroundColor: "#fff",
  //   border: "1px solid #d9d9d9",
  // };
  public onChange: (cronValue: string) => {};
  public onTouched: () => {};
  //validators: Array<any> = null;

  //尝试增加验证
  //@ViewChild(NgModel) model: NgModel; //这个值就是null
  form!: FormGroup;
  questions: QuestionBase<string>[] | null = [];
  // @Input() formControlName: string;
  // private control: AbstractControl;
  /*
  *如果直接使用control.invalid会有问题:
  1.未填表(第一次加载)时可能并不想要显示红框
  */
  public invalid: boolean = false;
  //public errorMsg: string = "";
  //private hasInit: boolean = false;
  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    //private pfUtil: PfUtil,
    @Optional()
    @Inject(NG_VALIDATORS)
    private validators2: Array<any>,
    // @Optional() @Inject(NG_VALIDATORS) asyncValidators: Array<any>
    @Optional() @Inject(NG_VALIDATORS) validators: Array<any>,
    @Optional() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: Array<any>,
    private qcs: QuestionControlService, //model: NgModel

    @Optional()
    @Host()
    @SkipSelf()
    protected controlContainer: ControlContainer
  ) {
    //super(validators, asyncValidators); // ValueAccessor base
    super(controlContainer); // ValueAccessor base
    const me = this;
    // for (let j in me.inputStyle) {
    //   if (me.inputStyle.hasOwnProperty(j)) {
    //     var fn = me.inputStyle[j];
    //     //me.normalStyle[j] = me._elementRef.nativeElement.style[j];
    //     me._elementRef.nativeElement.style[j] = fn;//颜色是设置到input上才对
    //   }
    // }
    //debugger;
    //me.validators = validators;

    this.questions = [
      // new DropdownQuestion({
      //   key: 'brave',
      //   label: 'Bravery Rating',
      //   options: [
      //     {key: 'solid',  value: 'Solid'},
      //     {key: 'great',  value: 'Great'},
      //     {key: 'good',   value: 'Good'},
      //     {key: 'unproven', value: 'Unproven'}
      //   ],
      //   order: 3
      // }),

      new TextboxQuestion({
        key: 'firstName',
        label: 'First name',
        value: 'Bombasto',
        required: true,
        order: 1,
      }),

      // new TextboxQuestion({
      //   key: 'emailAddress',
      //   label: 'Email',
      //   type: 'email',
      //   order: 2
      // })
    ];
    this.form = this.qcs.toFormGroup(this.questions as QuestionBase<string>[]);
  }
  writeValue(obj: any): void {
    //console.info(1);
    const me = this;
    me.pfKey = obj;
    let item = me.list.find((a) => a.key == obj);
    //debugger;
    if (item !== null && item !== undefined) {
      me.pfValue = item.value;
    } else {
      me.pfValue = '';
    }
    // if (!me.pfUtil.isAnyNull(me.control)) {
    //   me.control.statusChanges.subscribe((status) => {
    //     me.invalid = "INVALID" === status;
    //   });
    // }
  }
  // registerOnChange(fn: any): void {
  //   const me = this;
  //   this.onChange = fn;

  //   // if (!me.pfUtil.isAnyNull(me.control)) {
  //   //   me.control.statusChanges.subscribe((status) => {
  //   //     me.invalid = "INVALID" === status;
  //   //   });
  //   // }
  // }
  // registerOnTouched(fn: any): void {
  //   this.onTouched = fn;
  // }
  // setDisabledState?(isDisabled: boolean): void {
  //   //此方法是跟踪绑定到本组件的[disabled]属性的
  //   const me = this;
  //   me.pfDisabled = isDisabled;
  // }

  // ngAfterViewChecked() {
  //   const me = this;
  //   if (!me.pfUtil.isAnyNull(me.control)) {
  //     me.control.statusChanges.subscribe((status) => {
  //       me.invalid = "INVALID" === status;
  //     });
  //   }
  // }
  ngOnInit(): void {
    super.ngOnInit();
    const me = this;
    // // //debugger;
    // // for (let j in me.inputStyle) {
    // //   if (me.inputStyle.hasOwnProperty(j)) {
    // //     var fn = me.inputStyle[j];
    // //     debugger;
    // //     me.currentInputStyle[j] = fn;
    // //   }
    // // }
    // if (this.controlContainer) {
    //   if (this.formControlName) {
    //     this.control = this.controlContainer.control.get(this.formControlName);
    //     me.control.statusChanges.subscribe((status) => {
    //       // if (me.hasInit) {
    //       //   me.invalid = "INVALID" === status;
    //       // } else {
    //       //   me.hasInit = true;
    //       // }
    //       me.invalid = "INVALID" === status; //在此绑定失效状态是可以实现第一次加载时不触发的,后面改变状态才触发,这样是最好的情况(如果你的页面上不是这样,请检查你自己的代码)
    //       console.info(me.formControlName + "____" + status);
    //       // me.control.invalid()
    //       debugger;
    //       if (me.invalid) {
    //         me.errorMsg = me.control.errors[0];
    //       }
    //     });
    //   } else {
    //     console.warn(
    //       "Missing FormControlName directive from host element of the component"
    //     );
    //   }
    // } else {
    //   console.warn("Can't find parent FormGroup directive");
    // }
  }
  // onInput(event) {
  //   this.input.emit(event);
  // }

  /*
   * 这个不是ControlValueAccessor必需的方法
   */
  selectItem(item: KeyValuePair) {
    const me = this;
    me.pfKey = item.key;
    me.pfValue = item.value;
    me.onChange(me.pfKey); //这句主动把修改后的值反馈到父组件绑定到ngModel的变量上(双向绑定的重点是这里)
    //me.invalid = !me.control.valid;
  }
  showPopups(event, popups) {
    const me = this;
    if (!me.pfDisabled) {
      popups.open(event.currentTarget);
    }
  }
  isValid() {
    const me = this;

    // me.invalid.subscribe((response) => {
    //   console.info(response);
    //   debugger;
    //   me.status["userName"] = response;
    //   if (response) {
    //     me.failures.subscribe((response) => {
    //       // console.info(response);
    //       me.msg["userName"] = response;
    //     });
    //   } else {
    //     me.msg["userName"] = "";
    //   }
    // });

    let b = true;
    // if (me.pfUtil.isAnyNull(me.validators)) {
    //   b = true;
    // } else {
    //   for (let i = 0; i < me.validators.length; i++) {
    //     let tmpValid: Validator = me.validators[i]; //Function | Validator
    //     if (!me.pfUtil.isAnyNull(tmpValid)) {
    //       let r = tmpValid.validate(me);
    //       debugger;
    //       if (r === null) {
    //         b = true;
    //       } else {
    //         b = false;
    //       }
    //       debugger;
    //     }
    //   }
    // }
    if (me.pfUtil.isAnyNull(me.control)) {
      b = true;
    } else {
      b = me.control.valid;
    }
    console.info(b);
  }
  get isValid2() {
    const me = this;
    this.form.patchValue({ firstName: me.pfKey });
    //debugger;
    return this.form.controls['firstName'].valid;
  }
}
