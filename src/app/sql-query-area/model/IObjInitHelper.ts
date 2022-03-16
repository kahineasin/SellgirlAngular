import { IField } from './IField';

/**
 * 此接口是为了解决类的循环引用,配合ObjInitHelper来使用
 */
export interface IObjInitHelper {
  field(): IField;
  fieldByObj(obj): IField;
}
