import {
  Component,
  Host,
  Input,
  OnInit,
  Optional,
  SkipSelf,
} from "@angular/core";
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
} from "@angular/forms";
import { PfUtil } from "../../common/pfUtil";

/**
 * 为实现继承原生ngModel和formControlName的组件绑定
 * 继承此类时要有provider定义,如:(更具体可以参考pf-input-test1.component组件)
  @Component({
  selector: "pf-select",
  templateUrl: "./pf-select.component.html",
  styleUrls: ["./pf-select.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PfSelectComponent,
      multi: true,
    },
  ],
})
 */
@Component({
  template: "",
})
export abstract class PfInputBaseComponent
  implements OnInit, ControlValueAccessor
{
  //
  // value: any = null;
  //pfValue: string;
  pfDisabled = false;
  // currentInputStyle: Object = {
  //   backgroundColor: "#fff",
  //   border: "1px solid #d9d9d9",
  // };
  public onChange: (cronValue: string) => {};
  public onTouched: () => {};

  /*报错 Class is using Angular features but is not decorated. Please add an explicit Angular decorator*/
  @Input() formControlName: string;
  //protected abstract getFormControlName();
  //protected  string getFormControlName();
  protected control: AbstractControl;
  /*
  *如果直接使用control.invalid会有问题:
  1.未填表(第一次加载)时可能并不想要显示红框
  */
  public invalid: boolean = false;
  public errorMsg: string = "";
  protected pfUtil = new PfUtil();
  constructor(
    //private pfUtil: PfUtil,

    // @Optional()
    // @Host()
    // @SkipSelf()
    protected controlContainer: ControlContainer
  ) {
    //debugger;
    const me = this;
  }

  // /*
  //  * 参考此方法来双向绑定
  //  */
  // selectItem(item: KeyValuePair) {
  //   const me = this;
  //   me.onChange(me.pfKey); //这句主动把修改后的值反馈到父组件绑定到ngModel的变量上(双向绑定的重点是这里)
  //   //me.invalid = !me.control.valid;
  // }

  // writeValue(obj: any): void {
  //   // //console.info(1);
  //   const me = this;
  //   me.value = obj;
  //   // let item = me.list.find((a) => a.key == obj);
  //   // //debugger;
  //   // if (item !== null && item !== undefined) {
  //   //   me.pfValue = item.value;
  //   // } else {
  //   //   me.pfValue = "";
  //   // }
  // }
  abstract writeValue(obj: any);
  // writeValue(obj: any) {
  //   this.pfValue = obj;
  // }
  registerOnChange(fn: any): void {
    const me = this;
    this.onChange = fn;

    // if (!me.pfUtil.isAnyNull(me.control)) {
    //   me.control.statusChanges.subscribe((status) => {
    //     me.invalid = "INVALID" === status;
    //   });
    // }
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    //此方法是跟踪绑定到本组件的[disabled]属性的
    const me = this;
    me.pfDisabled = isDisabled;
  }

  ngOnInit(): void {
    const me = this;
    if (this.controlContainer) {
      //debugger;
      if (this.formControlName) {
        this.control = this.controlContainer.control.get(this.formControlName);
        me.control.statusChanges.subscribe((status) => {
          // if (me.hasInit) {
          //   me.invalid = "INVALID" === status;
          // } else {
          //   me.hasInit = true;
          // }
          //debugger;
          me.invalid = "INVALID" === status; //在此绑定失效状态是可以实现第一次加载时不触发的,后面改变状态才触发,这样是最好的情况(如果你的页面上不是这样,请检查你自己的代码)
          console.info(me.formControlName + "____" + status);
          if (me.invalid) {
            if (me.invalid && me.control.errors !== null) {
              //debugger;
              me.errorMsg = me.pfUtil.getFormFirstErrorMessage(
                me.control.errors
              );
            } else {
              me.errorMsg = "验证不通过";
            }
          } else {
            me.errorMsg = "";
          }
        });
      } else {
        // console.warn(
        //   "Missing FormControlName directive from host element of the component"
        // );
      }
    } else {
      //console.warn("Can't find parent FormGroup directive");
    }
  }
}
