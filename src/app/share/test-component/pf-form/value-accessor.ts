// import { ControlValueAccessor } from '@angular/forms';

// export class ValueAccessorBase<T> implements ControlValueAccessor {
//     private innerValue: T;
//     private changed = new Array<(val: T) => void>();
//     private touched = new Array<() => void>();

//     get val(): T {
//         return this.innerValue;
//     }

//     set val(val: T) {
//         if (this.innerValue !== val) {
//             this.innerValue = val;
//             this.changed.forEach(f => f(val));
//         }
//     }

//     touch() {
//         this.touched.forEach(f => f());
//     }

//     writeValue(val: T): void {
//         this.innerValue = val;
//     }

//     registerOnChange(fn: (val: T) => void): void {
//         this.changed.push(fn);
//     }

//     registerOnTouched(fn: () => void): void {
//         this.touched.push(fn);
//     }

// }
