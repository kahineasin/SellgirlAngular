export default class Base {
  _plainObject = null;
  id2 = null;
  /**
   * 如果原版的子类有自己的字段,那么需要修正构造方法为这样:(如果没有自己的字段,就可以不改)--benjamin
  constructor(object = {}) {
    super(object);
    super.initPropertyByObject(object);
  }
   * @param object
   * @deprecated 慎重用此方法.如果子类的成员是这样:public db: any = null; 那么这里的值会被null复盖掉.metabase使用此方法初始化的地方,都要改为ie在子类中执行super.initPropertyByObject(object);
   */
  constructor(object = {}) {
    //debugger;
    this._plainObject = object;
    for (const property in object) {
      this[property] = object[property]; //这样写其实有风险的, 如果子类的成员是这样:public db: any = null; 那么这里的值会被null复盖掉
    }
    //debugger;
  }

  /**
   * Get the plain metadata object without hydrated fields.
   * Useful for situations where you want serialize the metadata object.
   */
  getPlainObject() {
    return this._plainObject;
  }
  /**
   * 在父类的constructor里面给子类的字段赋值是有风险的,由于类成员的初始化顺序,有可能被子类的属性覆盖掉
   * @param object
   */
  protected initPropertyByObject(object) {
    for (const property in object) {
      // console.info(
      //   property +
      //     " isOwnProperty:" +
      //     object.hasOwnProperty(property).toString()
      // );
      if (object.hasOwnProperty(property)) {
        this[property] = object[property];
      }
    }
  }
}
