import Base from '../sql-query-area/metabase-lib/lib/metadata/Base';
import BbbClass from './bbb-class';

export default class AaaClass extends Base {
  public bbb = BbbClass;
  public ccc: BbbClass;
}
