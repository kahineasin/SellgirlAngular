import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { CronLocalization } from "@sbzen/ng-cron";

@Component({
  selector: "pf-quartz-cron",
  templateUrl: "./pf-quartz-cron.component.html",
  //styles: ["./bootstrap.min.css"],
  styleUrls: [
    //"./bootstrap.min.css",
    //"./bootstrapforchild.css",
    //"bootstrapnav.scss",
    //"bootstrap_test.css",
    "bootstrap_fix.css",
    "./pf-quartz-cron.component.scss",
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PfQuartzCronComponent),
      multi: true,
    },
  ],
  encapsulation: ViewEncapsulation.None,
}) // //, ControlValueAccessor
export class PfQuartzCronComponent implements OnInit, ControlValueAccessor {
  //cronData = "0 06 10 * * ?";
  cronData: string="";
  //为了解决这个问题：刚加载时，bootstrap的样式没出来
  visible: boolean = false;
  //本地化说明:https://bzenkosergey.github.io/ng-cron/angular/#/doc/localization
  localization: CronLocalization = {
    common: {
      month: {
        january: "1月",
        february: "2月",
        march: "3月",
        april: "4月",
        may: "5月",
        june: "6月",
        july: "7月",
        august: "8月",
        september: "9月",
        october: "10月",
        november: "11月",
        december: "12月",
      },
      dayOfWeek: {
        sunday: "星期日",
        monday: "星期一",
        tuesday: "星期二",
        wednesday: "星期三",
        thursday: "星期四",
        friday: "星期五",
        saturday: "星期六",
      },
      dayOfMonth: {
        "1st": "1日",
        "2nd": "2日",
        "3rd": "3日",
        "4th": "4日",
        "5th": "5日",
        "6th": "6日",
        "7th": "7日",
        "8th": "8日",
        "9th": "9日",
        "10th": "10日",
        "11th": "11日",
        "12th": "12日",
        "13th": "13日",
        "14th": "14日",
        "15th": "15日",
        "16th": "16日",
        "17th": "17日",
        "18th": "18日",
        "19th": "19日",
        "20th": "20日",
        "21st": "21日",
        "22nd": "22日",
        "23rd": "23日",
        "24th": "24日",
        "25th": "25日",
        "26th": "26日",
        "27th": "27日",
        "28th": "28日",
        "29th": "29日",
        "30th": "30日",
        "31st": "31日",
      },
    },
    tabs: {
      seconds: "秒",
      minutes: "分",
      hours: "时",
      day: "日",
      month: "月",
      year: "年",
    },
    quartz: {
      day: {
        every: {
          label: "每天",
        },
        dayOfWeekIncrement: {
          label1: "每",
          label2: "天开始于",
        },
        dayOfMonthIncrement: {
          label1: "每",
          label2: "天开始于当月的",
          label3: "",
        },
        dayOfWeekAnd: {
          label: "周内的某天（选择一个或多个）",
        },
        dayOfWeekRange: {
          label1: "每天从",
          label2: "到",
        },
        dayOfMonthAnd: {
          label: "月内的某天（选择一个或多个）",
        },
        dayOfMonthLastDay: {
          label: "月的最后一天",
        },
        dayOfMonthLastDayWeek: {
          label: "月的最后一个周工作日",
        },
        dayOfWeekLastNTHDayWeek: {
          label1: "月的最后一个",
          label2: "",
        },
        dayOfMonthDaysBeforeEndMonth: {
          label: "天在月结之前",
        },
        dayOfMonthNearestWeekDayOfMonth: {
          label1: "最近的工作日,相对月的",
          label2: "",
        },
        dayOfWeekNTHWeekDayOfMonth: {
          label1: "在月的",
          label2: "",
        },
      },
      month: {
        every: {
          label: "每月",
        },
        increment: {
          label1: "每",
          label2: "个月,开始于",
        },
        and: {
          label: "某月（选择一个或多个）",
        },
        range: {
          label1: "每月,从",
          label2: "到",
        },
      },
      second: {
        every: {
          label: "每秒",
        },
        increment: {
          label1: "每",
          label2: "秒开始于",
        },
        and: {
          label: "特定秒（选择一个或多个）",
        },
        range: {
          label1: "每秒从",
          label2: "到",
        },
      },
      minute: {
        every: {
          label: "每分钟",
        },
        increment: {
          label1: "每",
          label2: "分钟,开始于",
        },
        and: {
          label: "特定分（选择一个或多个）",
        },
        range: {
          label1: "每分钟,从",
          label2: "到",
        },
      },
      hour: {
        every: {
          label: "每小时",
        },
        increment: {
          label1: "每",
          label2: "小时,开始于",
        },
        and: {
          label: "特定时（选择一个或多个）",
        },
        range: {
          label1: "每小时,从",
          label2: "到",
        },
      },
      year: {
        every: {
          label: "任何年",
        },
        increment: {
          label1: "每",
          label2: "年,开始于",
        },
        and: {
          label: "特定年（选择一个或多个）",
        },
        range: {
          label1: "每年,从",
          label2: "到",
        },
      },
    },
  };
  //@Input() public value: string;

  //ControlValueAccessor
  //private onChange = (_: any) => {};
  public onChange?: (cronValue: string) => {};
  public onTouched?: () => {};
  //@Input() formControl: FormControl;

  //@Input() public userName;
  //@Output() public userNameChange = new EventEmitter();
  /**
   * change
   */
  public change(userName: string) {
    //debugger;

    //this.userNameChange.emit(this.cronData);//如果不是用quartz-cron的change器,就是这样改变

    //this.onChange(this.cronData);
    //this.cronData = userName;
    if(this.onChange==null){return;}
    this.onChange(userName);
  }
  public onChanged(event:any) {
    console.info("onChanged");
    console.info(event);
  }
  constructor() {}
  writeValue(obj: any): void {
    //debugger;
    var me = this;
    //me.cronData = me.value;
    //console.info(me.value);
    //console.info(me.cronData);
    me.cronData = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
    //this.userNameChange = fn;
    //var me = this;
    //debugger;
    //me.cronData = me.value;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {}
  //public cronJobsForm: FormGroup;

  ngAfterViewInit() {
    var me = this;
    setTimeout(function () {
      me.visible = true;
    }, 0);
  }
  ngOnInit(): void {
    console.info("------------pf-quartz-cron  ngOnInit-------------");
    //console.info(this.value);
    var me = this;
  }
}
