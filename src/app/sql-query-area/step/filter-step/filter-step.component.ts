import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { KeyValuePair } from '../../../common/pfModel';
import { PfUtil } from '../../../common/pfUtil';
import {
  DataColumnModel,
  DataTableModel,
  DataTableUIModel,
} from '../../../model/data-integration';
//import { ComputesReferenceService } from "../../../../core/services/computes-reference.service";
import {
  //CompoundFilter,
  ConcreteField,
  FieldLiteral,
  FilterClause,
  StructuredQuery,
} from '../../model/Query';
import { KeyValuePairT, SqlQueryUtil } from '../../sql-query-util';
import { NzIconService } from 'ng-zorro-antd/icon';
import { PfSvgIconPathDirective } from '../../../share/pf-svg-icon/pf-svg-icon-path.directive';

export type filterAddStep = 'andOr' | 'field' | 'compare';

// const ngZorroIconLiteral =
//   '<svg viewBox="0 0 106 120" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n  <defs>\n    <linearGradient x1="68.1279872%" y1="-35.6905737%" x2="30.4400914%" y2="114.942679%" id="linearGradient-1">\n      <stop stop-color="#FA8E7D" offset="0%"></stop>\n      <stop stop-color="#F74A5C" offset="51.2635191%"></stop>\n      <stop stop-color="#F51D2C" offset="100%"></stop>\n    </linearGradient>\n    <linearGradient x1="68.1279872%" y1="-35.6905737%" x2="74.5363914%" y2="162.511755%" id="linearGradient-2">\n      <stop stop-color="#FA8E7D" offset="0%"></stop>\n      <stop stop-color="#F74A5C" offset="51.2635191%"></stop>\n      <stop stop-color="#F51D2C" offset="100%"></stop>\n    </linearGradient>\n    <linearGradient x1="69.644116%" y1="0%" x2="69.644116%" y2="100%" id="linearGradient-3">\n      <stop stop-color="#29CDFF" offset="0%"></stop>\n      <stop stop-color="#148EFF" offset="37.8600687%"></stop>\n      <stop stop-color="#0A60FF" offset="100%"></stop>\n    </linearGradient>\n    <linearGradient x1="-19.8191553%" y1="-36.7931464%" x2="138.57919%" y2="157.637507%" id="linearGradient-4">\n      <stop stop-color="#29CDFF" offset="0%"></stop>\n      <stop stop-color="#0F78FF" offset="100%"></stop>\n    </linearGradient>\n  </defs>\n  <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n    <g id="Angular" transform="translate(-11.000000, -4.000000)">\n      <g id="Group-9" transform="translate(11.000000, 4.000000)">\n        <path d="M65.63,72.2 L53.23,53.2 L46,63.69 L53.37,63.69 C56.4075661,63.69 58.87,66.1524339 58.87,69.19 C58.87,72.2275661 56.4075661,74.69 53.37,74.69 L35.49,74.69 C33.4448986,74.6890667 31.569189,73.5534846 30.620326,71.7418281 C29.671463,69.9301715 29.8061511,67.7416349 30.97,66.06 L48.84,40.26 C49.879226,38.7527636 51.6013948,37.8627393 53.4320154,37.8868264 C55.2626361,37.9109135 56.960791,38.8459421 57.96,40.38 L74.84,66.18 C75.9449505,67.8698206 76.0352122,70.0292067 75.0751376,71.8053446 C74.115063,73.5814826 72.2590116,74.6888076 70.24,74.69 C68.3799194,74.6978131 66.6433454,73.7598372 65.63,72.2 Z" id="Path" fill="url(#linearGradient-1)"></path>\n        <path d="M70.28,25 C69.0616939,25.0004053 67.8648105,24.6796268 66.81,24.07 L52.87,16.07 L39,24 C36.8331842,25.2504298 34.1638674,25.249892 31.9975556,23.9985892 C29.8312438,22.7472865 28.4970513,20.4353214 28.4975555,17.933589 C28.4980597,15.4318566 29.833184,13.1204295 32,11.87 L49.34,1.87 C51.5058075,0.619570435 54.1741925,0.619570435 56.34,1.87 L73.76,11.87 C76.574107,13.4207731 77.9710889,16.688234 77.147902,19.7941088 C76.324715,22.8999837 73.492775,25.0466031 70.28,25 Z" id="Path" fill="url(#linearGradient-2)"></path>\n        <path d="M52.86,119.92 C51.6310454,119.919338 50.4239235,119.595139 49.36,118.98 L3.93,92.75 C1.76486614,91.4999595 0.43077789,89.190081 0.43,86.69 L0.43,34.23 C0.43077789,31.729919 1.76486614,29.4200405 3.93,28.17 L15.16,21.69 C17.3290879,20.369153 20.0434251,20.3267208 22.2527396,21.5791219 C24.4620541,22.831523 25.8197544,25.182284 25.8004986,27.7218131 C25.7812428,30.2613423 24.3880518,32.5912449 22.16,33.81 L14.43,38.27 L14.43,82.65 L52.86,104.83 L89.7896161,83.5159515 C90.7180357,82.9801111 91.29,81.9896088 91.29,80.9176536 L91.29,40.0028421 C91.29,38.9306213 90.7177545,37.9399157 89.7889721,37.4041727 L83.61,33.84 C81.4431842,32.5895704 80.1080601,30.2781434 80.1075559,27.7764111 C80.1070518,25.2746788 81.4412443,22.9627138 83.6075559,21.7114111 C85.7738676,20.4601083 88.4431842,20.4595704 90.61,21.71 L101.79,28.17 C103.955134,29.4200405 105.289222,31.729919 105.29,34.23 L105.29,86.69 C105.289222,89.190081 103.955134,91.4999595 101.79,92.75 L56.36,119 C55.2952279,119.610805 54.087499,119.928265 52.86,119.92 Z" id="Path" fill="url(#linearGradient-3)" fill-rule="nonzero"></path>\n        <path d="M78.06,106.45 C66.89,113 52.87,104.83 52.87,104.83 L15.9403839,83.5159515 C15.0119643,82.9801111 14.44,81.9896088 14.44,80.9176536 L14.44,40.0026171 C14.44,38.9305169 15.0121179,37.9399035 15.9407356,37.4041163 L22.17,33.81 C24.3980518,32.5912449 25.7912428,30.2613423 25.8104986,27.7218131 C25.8297544,25.182284 24.4720541,22.831523 22.2627396,21.5791219 C20.0534251,20.3267208 17.3390879,20.369153 15.17,21.69 L3.94,28.17 C1.77486614,29.4200405 0.44077789,31.729919 0.44,34.23 L0.44,86.69 C0.44077789,89.190081 1.77486614,91.4999595 3.94,92.75 L49.36,119 C51.5258075,120.25043 54.1941925,120.25043 56.36,119 L78.06,106.47 L78.06,106.45 Z" id="Path" fill="url(#linearGradient-4)" fill-rule="nonzero"></path>\n      </g>\n    </g>\n  </g>\n</svg>';

@Component({
  selector: 'filter-step',
  templateUrl: './filter-step.component.html',
  styleUrls: ['./filter-step.component.scss', '../sql-query-area-step.scss'],
})
export class FilterStepComponent implements OnInit {
  @Input() public isFirstFloor: boolean = false;
  /**
   * ?????????:
  ["and", ["=", ["field-id", 276], "967122"],
	    		["=", ["field-id", 274], true],
			    ["=", ["joined-field", "chinese_city", ["field-id", 249]], "?????????"],
			    ["=", ["field-id", 149], "???????????????"]
   */
  @Input() public query: StructuredQuery = null;
  //@Input() public filter: any[] = [];
  /**
   * ???????????????????????????,??????????????????????????????????????????
   */
  @Input() public filter: FilterClause = [];
  /**
   * ???query????????????????????????????????????????????????????????????query??????filter, ??????query???filter??????????????????????????????????????????)
   */
  @Output() public filterChange = new EventEmitter(); //??????????????????????????????????????????Change

  /**
   * ??????????????????????????????list?????????field???name,????????????Input????????????
   * ??????fieldList????????????????????????????????????,???????????????sql-query-area?????????(??????,????????????????????????????????????)
   *
   * filter?????????3????????????
   * 1. [xxx,and,xxx,or...]
   * 2.[bracket,[]]
   */
  @Input() fieldList: KeyValuePairT<DataTableUIModel, DataColumnModel[]>[] = []; //????????? [{tb,cols}]
  /**
   * ??????source-query????????????????????????(?????????????????????)
   */
  @Input() sourceOutFieldList: FieldLiteral[] = []; //ConcreteField
  //@Output() public filterChange = new EventEmitter(); //??????????????????????????????????????????Change
  // /**
  //  * ?????????????????????,
  //  */
  // @Input() public filterParent: any[] = [];
  // @Input() public filterIdx: any[] = [];
  @Input() public testCnt: number = 0;
  @Output() deleteStep = new EventEmitter<any>();
  isAdd = true;
  addAndOr = 'and';
  addStep: filterAddStep = 'andOr';

  addingColumn?: DataColumnModel = null;
  addingTable?: DataTableUIModel = null;
  isAddingBracket?: boolean = false;
  addingSourceOutField?: FieldLiteral = null;
  //tableList: DataTableModel[] = [];
  //fieldList:KeyValuePair[]=[];

  compare: string = '=';
  /**
   * ????????????????????????
   */
  compareValue: string = '';
  compareList: KeyValuePair[] = [
    { key: '=', value: '???' },
    { key: '!=', value: '??????' },
    { key: '>', value: '??????' },
    { key: '>=', value: '???????????????' },
    { key: '<', value: '??????' },
    { key: '<=', value: '???????????????' },
    { key: 'contains', value: '??????' },
    { key: 'does-not-contain', value: '?????????' },
    { key: 'is-null', value: '??????' },
    { key: 'not-null', value: '?????????' },
    { key: 'starts-with', value: '???...??????' },
    { key: 'ends-with', value: '???...??????' },

    // { key: "=", value: "???" },
    // { key: "!=", value: "??????" },
    // { key: "contains", value: "??????" },
    // { key: "does-not-contain", value: "?????????" },
    // { key: "is-null", value: "??????" },
    // { key: "not-null", value: "?????????" },
    // { key: "starts-with", value: "???...??????" },
    // { key: "ends-with", value: "???...??????" },
  ];

  /**
   * ?????????????????????1?????????,?????????if?????????????????????input????????????????????????
   */
  searchText = '';
  // addStepMaxHeight = "100px";

  constructor(
    //private reference: ComputesReferenceService,
    public el: ElementRef,
    private msg: NzMessageService,
    private sqlQueryUtil: SqlQueryUtil,
    public pfUtil: PfUtil,
    private iconService: NzIconService
  ) {
    //this.iconService.addIconLiteral("ng-zorro:antd", ngZorroIconLiteral);
    this.iconService.addIconLiteral(
      'pfIcon:LEFT_JOIN',

      PfSvgIconPathDirective.getSvg('SQL_LEFT_JOIN')
    );
  }

  xxxx() {
    const me = this;
    return (
      ['=', '!=', '>', '>=', '<', '<='].indexOf((me.filter as any)[0]) > -1
    );
  }
  ngOnInit(): void {
    var me = this;
    //console.info(me.filter);
  }
  isArray(field): boolean {
    return field instanceof Array;
  }
  // deleteCompare(filter: any[]): void {
  //   const me = this;
  //   // filter.splice(0, filter.length);
  //   //debugger;
  //   me.deleteStep.emit(filter);

  //   //???????????????????????????,???????????????parent,???????????????parent????????????
  //   // if(me.filterParent!=null&&me.filterParent.length>0){
  //   //   me.filterParent.
  //   // }
  //   // delete filter;
  // }
  deleteCompare(): void {
    const me = this;
    me.deleteStep.emit(); //???????????????,?????????????????????????????????idx
  }
  onDelete(parentFilter: any[], idx: number, first: boolean): void {
    const me = this;
    // //debugger;

    // //parentFilter.splice(idx, 1);
    // //???????????????
    // if (first) {
    //   if (idx + 1 < parentFilter.length) {
    //     parentFilter.splice(idx + 1, 1);
    //   } else {
    //     //???????????????????????????
    //     //benjamin todo
    //     me.deleteStep.emit();
    //   }
    //   parentFilter.splice(idx, 1);
    // } else {
    //   parentFilter.splice(idx, 1);
    //   parentFilter.splice(idx - 1, 1);
    // }
    me.sqlQueryUtil.deleteCompare(parentFilter, idx, first);
    if (0 === parentFilter.length) {
      me.deleteStep.emit();
    }
  }
  // onAdd(event: boolean) {
  //   var me = this;
  //   if (event) {
  //     me.addAndOr = "and";
  //     me.addStep = "andOr";
  //     // // me.addStep = "field"; //???????????????????????????,???????????????????????????
  //     // me.addCompare();
  //   }
  // }

  initAddingParam() {
    const me = this;
    me.isAddingBracket = false;
    me.compareValue = '';
    me.addingColumn = null;
    me.addingSourceOutField = null;
    //me.addAndOr = "and";
    // me.pfUtil.resetForm(
    //   me.fieldForm,
    //   { leftFieldId: "", rightFieldId: "" },
    //   { emitEvent: false }
    // );
  }
  //showEditFieldPopups
  initEditingParam(filter) {
    const me = this;
    // this.msg.info("This is a normal message");
    // console.info("This is a normal message");
    me.isAdd = false;
    //addFilterPopups.open(btn);
    me.addAndOr = filter[0];
    me.compareValue = filter[2];
    me.addStep = 'compare';
    //debugger;
    //if (me.sqlQueryUtil.isLiteralField(filter[1][0])) {
    if (me.sqlQueryUtil.isLiteralField(filter[1])) {
      me.addingSourceOutField = filter[1];
    } else {
      //const f = me.getFieldByFilter(filter[1]);
      const f = me.sqlQueryUtil.getFieldByFilter(filter[1], me.fieldList);
      if (f !== null) {
        me.addingTable = f.key;
        me.addingColumn = f.value;
      }
    }
  }
  onAddOld(event, addFilterPopups) {
    var me = this;

    me.addAndOr = 'and';
    me.addStep = 'andOr';
  }
  onAdd(event, addFilterPopups) {
    var me = this;
    me.isAdd = true;
    // // me.addStep = "field"; //???????????????????????????,???????????????????????????
    // me.addCompare();

    //???????????????,open?????????????????????????????????addField????????????,?????????????????????,?????????
    const btn = event.currentTarget;
    if (me.pfUtil.isListEmpty(me.filter)) {
      me.addAndOr = '';
      me.addStep = 'field';
      addFilterPopups.open(btn);
      return;
    }
    if (addFilterPopups.isOpened()) {
      addFilterPopups.open(btn);
      me.addAndOr = 'and';
      me.addStep = 'andOr';
    } else {
      me.addAndOr = 'and';
      me.addStep = 'andOr';
      setTimeout(function () {
        addFilterPopups.open(btn);
      }, 100);
    }
  }
  // /**
  //  * @deprecated ?????????????????????Observable,?????????
  //  * @param tableId
  //  */
  // private updateTable(tableId: number) {
  //   const me = this;
  //   me.reference
  //     .getDataTable(me.query.database, tableId)
  //     .subscribe((response) => {
  //       //me.tableList.push(response);
  //       me.reference.getDataColumnPageList(tableId).subscribe((response2) => {
  //         me.fieldList.push(
  //           new KeyValuePairT<DataTableModel, DataColumnModel[]>(
  //             response,
  //             response2.DataSource
  //           )
  //         );
  //       });
  //     });
  // }
  // /**
  //  * ????????????????????????updateTable,????????????????????????????????????
  //  * @param tableId
  //  * @returns
  //  */
  // private queryFields(tableId: number[]) {
  //   const me = this;
  //   let r: KeyValuePairT<DataTableModel, DataColumnModel[]>[] = [];
  //   const observable = new Observable<
  //     KeyValuePairT<DataTableModel, DataColumnModel[]>[]
  //   >((subscriber) => {
  //     const ro = new Observable<
  //       KeyValuePairT<DataTableModel, DataColumnModel[]>
  //     >((rSubscriber) => {
  //       me.reference
  //         .getDataTableList(me.query.database)
  //         .subscribe((response) => {
  //           let tableList = response.DataSource.filter(
  //             (t) => tableId.indexOf(t.ShortId) > -1
  //           );
  //           //debugger;
  //           let oList: Observable<boolean>[] = [];
  //           tableList.map((a) => {
  //             const tmpO = new Observable<boolean>((subscriber2) => {
  //               me.reference
  //                 .getDataColumnPageList(a.ShortId)
  //                 .subscribe((response2) => {
  //                   r.push(
  //                     new KeyValuePairT<DataTableModel, DataColumnModel[]>(
  //                       a,
  //                       response2.DataSource
  //                     )
  //                   );
  //                   subscriber2.next(true);
  //                   subscriber2.complete();
  //                 });
  //             });
  //             oList.push(tmpO);
  //           });
  //           forkJoin(oList).subscribe(
  //             (a) => {
  //               //??????????????????????????????aa???bb???observer.complete()???????????????????????????????????????????????????next????????????????????????
  //               rSubscriber.next(null);
  //             },
  //             (e) => {
  //               debugger;
  //             }
  //           );
  //         });
  //     });
  //     ro.subscribe(
  //       (a) => {
  //         //??????????????????????????????,????????????next,?????????????????????a???????????????
  //         subscriber.next(r); //rSubscriber.next(null)????????????????????????.??????????????????????????????queryFields()???????????????next??????
  //       },
  //       (e) => {
  //         debugger;
  //       }
  //     );
  //   });
  //   return observable;
  // }
  goSelectFieldOld(addAndOr) {
    const me = this;
    me.addStep = 'field';
    me.addAndOr = addAndOr;

    // /**
    //  * ??????????????????table
    //  */
    // me.fieldList = [];
    // if (me.query != null) {
    //   if (me.query["source-table"] != null) {
    //     me.updateTable(me.query["source-table"]);
    //   }
    //   if (me.query.joins != null) {
    //     for (let i = 0; i < me.query.joins.length; i++) {
    //       me.updateTable(me.query.joins[i]["source-table"]);
    //     }
    //   }
    // }
  }
  goSelectField(addAndOr, addFilterPopups) {
    const me = this;
    me.addStep = 'field';
    me.addAndOr = addAndOr;

    //console.info(me.fieldList);

    //fieldList???sql-query-field????????????,?????????????????????
    // /**
    //  * ??????????????????table
    //  */
    // me.fieldList = [];
    // if (me.query != null) {
    //   //??????
    //   let tableIds: number[] = [];
    //   if (me.query["source-table"] != null) {
    //     tableIds.push(me.query["source-table"]);
    //   }
    //   if (me.query.joins != null) {
    //     for (let i = 0; i < me.query.joins.length; i++) {
    //       tableIds.push(me.query.joins[i]["source-table"]);
    //     }
    //   }
    //   me.queryFields(tableIds).subscribe(
    //     (response) => {
    //       me.fieldList = [...me.fieldList, ...response];
    //       addFilterPopups.resize();
    //     },
    //     (e) => {
    //       debugger;
    //     }
    //   );
    // }
  }
  public onAndOrChange(newAndOr: string, idx: number) {
    //debugger;
    const me = this;
    //me.filter.splice(idx, 1, newAndOr.target.value);
    me.filter[idx] = newAndOr;
    //me.filter[idx] = newAndOr.target.value; //newAndOr;
    //me.filterChange.emit(me.filter);
  }

  public likeText(columnName: string, text: string) {
    //return columnName.indexOf(text) > -1;
    return PfUtil.likeText(columnName, text);
  }
  public selectColumn(column: DataColumnModel, table: DataTableUIModel) {
    const me = this;
    me.addStep = 'compare';
    me.addingColumn = column;
    me.addingTable = table;
    //me.filter.push();
  }
  public selectColumnBySourceOut(field: FieldLiteral) {
    const me = this;
    me.addStep = 'compare';
    //debugger;
    me.addingSourceOutField = field;
  }

  /**
   *
   * @returns @deprecated Placement?????????????????????????????????,????????????
   */
  public getAddDropDownPlacement() {
    const me = this;
    if (me.addStep === 'andOr') {
      return 'bottomLeft';
    } else if (me.addStep === 'field') {
      return 'topLeft';
    }
    return 'bottomLeft';
  }
  public saveFilter(filterValue) {
    const me = this;
    if (me.pfUtil.isAnyNull(me.filter)) {
      me.filter = [];
    }
    if (me.isAdd) {
      //me.filter.push(["=", ["field-id", 276], "967122"]);
      //me.filter=["and", ["=", ["field-id", 276], "967122"]];
      let tmpFilter: any = me.filter;
      //me.filter.push(["=", ["field-id", 276], "967122"]);
      if (me.isAddingBracket) {
        if (tmpFilter.length > 0) {
          tmpFilter.push(me.addAndOr);
        }
        let bracket = ['bracket', []];
        tmpFilter.push(bracket);
        tmpFilter = bracket[1];
      }
      if (tmpFilter.length > 0) {
        tmpFilter.push(me.addAndOr);
      }
      switch (me.compare) {
        case 'aa':
          break;
        default:
          tmpFilter.push([
            me.compare,
            //["field-id", me.addingColumn.ShortId], //????????????????????????joinField--benjamin
            me.getFilterByAdding(), //????????????????????????joinField--benjamin
            filterValue,
          ]);
          break;
      }
    } else {
      let tmpFilter: any = me.filter;
      tmpFilter[0] = me.compare;
      tmpFilter[1] = me.getFilterByAdding();
      tmpFilter[2] = filterValue;
    }
    me.filterChange.emit(me.filter);
  }

  // public doGetFieldFullName(field: ConcreteField){

  // }
  /**
   *
   * @deprecated
   * @param field
   * @returns
   */
  public getFieldByFilter(
    field: ConcreteField
  ): KeyValuePairT<DataTableModel, DataColumnModel> {
    const me = this;
    if (
      undefined === me.fieldList ||
      null === me.fieldList ||
      me.fieldList.length < 1
    ) {
      //console.info("fieldList is null");
      return null;
    }
    //console.info("fieldList is not null");
    //debugger;
    if ('field-id' === field[0]) {
      if (me.fieldList.length > 0) {
        let f = me.fieldList[0].value.find((a) => a.ShortId === field[1]);
        if (f !== null && f !== undefined) {
          return new KeyValuePairT<DataTableModel, DataColumnModel>(
            me.fieldList[0].key,
            f
          );
        }
      }
    } else if ('joined-field' === field[0]) {
      // field[1] }}.{{ field[2][1]
      if (me.fieldList.length > 1) {
        let t = me.fieldList.find((a) => a.key.ShortId === field[1]);
        if (t !== null && t !== undefined) {
          let f = t.value.find((a) => a.ShortId === field[1]);
          if (f !== null && f !== undefined) {
            return new KeyValuePairT<DataTableModel, DataColumnModel>(t.key, f);
          }
        }
      }
    }
  }
  private isFieldListEmpty(): boolean {
    const me = this;
    return me.fieldList === null || me.fieldList.length < 1;
  }
  public getFilterByAdding(): ConcreteField {
    const me = this;
    if (!me.pfUtil.isAnyNull(me.addingSourceOutField)) {
      return me.addingSourceOutField;
    }
    if (me.addingColumn === null || me.isFieldListEmpty()) {
      return null;
    }

    // if (me.addingTable.ShortId === me.fieldList[0].key.ShortId) {
    //   return ["field-id", me.addingColumn.ShortId];
    // }
    // // if (me.addingTable.ShortId === me.fieldList[0].key.ShortId) {
    // //   return [
    // //     "joined-field",
    // //     me.addingTable.TableName,
    // //     ["field-id", me.addingColumn.ShortId],
    // //   ];
    // // }
    // return [
    //   "joined-field",
    //   //me.addingTable.TableName,
    //   me.addingTable.TableIdxName,
    //   ["field-id", me.addingColumn.ShortId],
    // ];
    return me.sqlQueryUtil.getFilterByColumn(
      me.addingColumn,
      me.addingTable
      //me.fieldList
    );
  }
  public getFieldFullName(field: ConcreteField) {
    const me = this;
    // if (me.pfUtil.isListEmpty(me.fieldList)) {
    //   return "";
    // }
    // const f = me.getFieldByFilter(field);

    // if (f !== null && f !== undefined) {
    //   if ("field-id" === field[0]) {
    //     return f.value.ColumnName;
    //   } else if ("joined-field" === field[0]) {
    //     return f.key.TableName + "." + f.value.ColumnName;
    //   }
    // }
    // return "";
    return me.sqlQueryUtil.getFieldFullName(field, me.fieldList);
  }
  // public getFieldFullName(field: ConcreteField) {
  //   const me = this;
  //   const observable = new Observable<string>((subscriber) => {
  //     subscriber.next("???????????????");
  //   });
  //   return observable;
  // }
  // getFieldFullName = (field: ConcreteField) => {
  //   const me = this;
  //   const observable = new Observable<string>((subscriber) => {
  //     debugger;
  //     subscriber.next("???????????????");
  //   });
  //   return observable.toPromise();
  // };
  isAnyNull2(item) {
    const me = this;
    //debugger;
    return me.pfUtil.isAnyNull(item);
  }
  public getTableName() {
    const me = this;
    if (me.pfUtil.isAnyNull(me.addingTable, me.addingColumn)) {
      return '????????????';
    } else {
      return me.addingTable.TableIdxName + '.' + me.addingColumn.ColumnName;
    }
  }
  public getIconTypeByDataType(column: DataColumnModel) {
    const me = this;
    // return "FIELD_STRING";
    //debugger;
    return me.sqlQueryUtil.getIconTypeByDataType(
      me.sqlQueryUtil.getMetabaseBaseType(column.DataType)
    );
  }
  // public getAntIconTypeByDataType(column: DataColumnModel) {
  //   const me = this;
  //   // return "FIELD_STRING";
  //   return me.sqlQueryUtil.getAntIconTypeByDataType(
  //     me.sqlQueryUtil.getMetabaseBaseType(column.DataType)
  //   )[0];
  // }

  openTableMenuHandler(table: DataTableUIModel): void {
    for (let i = 0; i < this.fieldList.length; i++) {
      if (this.fieldList[i].key.ShortId !== table.ShortId) {
        this.fieldList[i].key.isMenuOpened = false;
      }
    }
  }
}
