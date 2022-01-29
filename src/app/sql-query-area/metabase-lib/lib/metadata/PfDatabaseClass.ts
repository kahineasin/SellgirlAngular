/* @flow weak */

//import Question from "../Question";

// import Base from './Base';
// import TableClass from './TableClass';
import Schema from './Schema';

//import { generateSchemaId } from "../../../metabase/schema";

// import type { SchemaName } from "metabase/meta/types/Table";
// import type { DatabaseFeature } from "metabase/meta/types/Database";
// import type { SchemaName } from '../../../model/Table';
import type { DatabaseFeature } from '../../../model/Database';
import DatabaseClass from './DatabaseClass';
import { PfUtil } from '../../../../common/pfUtil';
//import { PfUtil } from "../../../../../../../core/common/pfUtil";

type VirtualDatabaseFeature = 'join';

/**
 * Wrapper class for database metadata objects. Contains {@link Schema}s, {@link Table}s, {@link Metric}s, {@link Segment}s.
 *
 * Backed by types/Database data structure which matches the backend API contract
 */
export default class PfDatabaseClass extends DatabaseClass {
  private pfUtil: PfUtil = null;
  constructor(object = {}) {
    super(object);
    const me = this;
    me.pfUtil = new PfUtil();
    // me._plainObject = object;
    // for (const property in object) {
    //   me[property] = object[property]; //这样写其实有风险的, 如果子类的成员是这样:public db: any = null; 那么这里的值会被null复盖掉
    // }
    super.initPropertyByObject(object);
    if (me.pfUtil.isEmpty(me.features)) {
      me.features = PfDatabaseClass.sqlServerFeature;
    }
  }
  public static readonly sqlServerFeature: DatabaseFeature[] = [
    'basic-aggregations',
    'standard-deviation-aggregations',
    'expression-aggregations',
    'foreign-keys',
    'right-join',
    'left-join',
    'native-parameters',
    'nested-queries',
    'expressions',
    'case-sensitivity-string-filter-options',
    'binning',
    'inner-join',
    'advanced-math-expressions',
  ];
}
