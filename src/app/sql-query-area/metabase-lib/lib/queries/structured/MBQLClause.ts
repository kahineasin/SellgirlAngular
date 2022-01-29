//import type StructuredQueryClass from '../StructuredQueryClass';
import { IStructuredQuery } from '../../../../model/IStructuredQuery';

export default class MBQLArrayClause extends Array<any> {
  _index: number;
  _query: IStructuredQuery;

  constructor(mbql: Array<any>, index?: number, query?: IStructuredQuery) {
    super(...mbql);
    //super(mbql.length);

    //super();
    // for(let i in mbql){
    //   this.push(i);
    // }
    _private(this, '_index', index);
    _private(this, '_query', query);
  }

  // There is a mismatch between the constructor args for `MBQLArrayClause` and `Array`
  // so we need to reconcile things in the MBQLArrayClause[Symbol.species] constructor function
  // See https://stackoverflow.com/questions/54522949
  static get [Symbol.species]() {
    return Object.assign(function (...items) {
      return new MBQLArrayClause(new Array(...items), this._index, this._query);
    }, MBQLArrayClause) as any;
  }

  set(mbql: any[]) {
    return this.constructor(mbql, this._index, this._query);
  }

  replace(replacement: Array<any>): IStructuredQuery {
    // StructuredQueryClass {
    throw new Error('Abstract method `replace` not implemented');
  }

  /**
   * returns the parent query object
   */
  query(): any {
    //StructuredQueryClass  {
    return this._query;
  }

  setQuery(query: any) {
    //StructuredQueryClass) {
    return this.constructor(this, this._index, query);
  }

  index() {
    return this._index;
  }

  /**
   * replaces the previous clause with this one and propagates an update, recursively
   */
  update(...args: any) {
    return (this.replace(this) as any).update(undefined, ...args);
  }

  parent() {
    return this.replace(this);
  }

  /**
   * return the Metadata instance from the linked Query
   */
  metadata() {
    return this._query.metadata();
  }

  raw(): any[] {
    return [...this];
  }
}

export class MBQLObjectClause {
  _index: number;
  _query: IStructuredQuery; // StructuredQueryClass;

  constructor(mbql: Object, index?: number, query?: IStructuredQuery) {
    // StructuredQueryClass) {
    Object.assign(this, mbql);
    _private(this, '_index', index);
    _private(this, '_query', query);
  }

  set(mbql: any) {
    return this.constructor(mbql, this._index, this._query);
  }

  replace(replacement: any): IStructuredQuery {
    // StructuredQueryClass {
    throw new Error('Abstract method `replace` not implemented');
  }

  /**
   * returns the parent query object
   */
  query(): IStructuredQuery {
    // StructuredQueryClass {
    return this._query;
  }

  setQuery(query: IStructuredQuery) {
    // StructuredQueryClass) {
    return this.constructor(this, this._index, query);
  }

  index() {
    return this._index;
  }

  /**
   * replaces the previous clause with this one and propagates an update, recursively
   */
  update(...args: any) {
    return (this.replace(this) as any).update(undefined, ...args);
  }

  parent() {
    return this.replace(this);
  }

  /**
   * return the Metadata instance from the linked Query
   */
  metadata() {
    return this._query.metadata();
  }

  raw() {
    const entriesWithDefinedValue = Object.entries(this).filter((entry) => {
      const [, value] = entry;
      return value !== undefined;
    });
    //return Object.fromEntries(entriesWithDefinedValue);
    return Object.entries(entriesWithDefinedValue);
  }
}

function _private(object, key, value) {
  // this prevents properties from being serialized
  Object.defineProperty(object, key, { value: value, enumerable: false });
}
