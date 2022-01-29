// import { NgModel } from "@angular/forms";
// import { Observable } from "rxjs";
// import { ValueAccessorBase } from "./value-accessor";
// import {
//   AsyncValidatorArray,
//   ValidatorArray,
//   ValidationResult,
//   message,
//   validate,
// } from "./validate";
// import { filter, map } from "rxjs/operators";

// export abstract class ElementBase<T> extends ValueAccessorBase<T> {
//   protected abstract model: NgModel; //实测时,无法从子类注入此属性(永远是null),导致此基类测试不通过--benjamin todo

//   // we will ultimately get these arguments from @Inject on the derived class
//   constructor(
//     private validators: ValidatorArray,
//     private asyncValidators: AsyncValidatorArray
//   ) {
//     super();
//   }

//   protected validate(): Observable<ValidationResult> {
//     return validate(this.validators, this.asyncValidators)(this.model.control);
//   }

//   //   protected get invalid(): Observable<boolean> {
//   //     return this.validate().map((v) => Object.keys(v || {}).length > 0);
//   //   }
//   protected get invalid(): Observable<boolean> {
//     //return this.validate().map((v) => Object.keys(v || {}).length > 0);
//     //return this.validate().pipe(filter((v) => Object.keys(v || {}).length > 0));
//     return this.validate().pipe(map((v) => Object.keys(v || {}).length > 0));
//   }

//   //   protected get failures(): Observable<Array<string>> {
//   //     return this.validate().map((v) => Object.keys(v).map((k) => message(v, k)));
//   //   }
//   protected get failures(): Observable<Array<string>> {
//     //return this.validate().map((v) => Object.keys(v).map((k) => message(v, k)));
//     return this.validate().pipe(
//       map((v) => Object.keys(v).map((k) => message(v, k)))
//     );
//   }
// }
