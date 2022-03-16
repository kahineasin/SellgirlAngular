import FieldClass from '../metabase-lib/lib/metadata/FieldClass';
import { IField } from './IField';
import { IObjInitHelper } from './IObjInitHelper';

export class ObjInitHelper implements IObjInitHelper {
  public field(): IField {
    return new FieldClass();
  }
  public fieldByObj(obj): IField {
    return new FieldClass(obj);
  }
}
