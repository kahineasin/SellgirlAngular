export class KeyValuePair {
  constructor(public key: string, public value: any) {}
}
export interface IPfObject {
  [key: string]: any,
}