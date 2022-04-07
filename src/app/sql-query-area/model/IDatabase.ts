import Dimension from "../metabase-lib/lib/Dimension";

export interface IDatabase {
  id: number;
  name: string;
  description: string;

  // tables: Table[];

  // /**
  //  * 格式如{"host":"tidb-cluster2-tidb.marathon.l4lb.thisdcos.directory","port":4000,"dbname":"finance","user":"root","password":"perfectTIDB","ssl":false,"additional-options":null,"tunnel-enabled":false}
  //  */
  // details: DatabaseDetails;
  engine: string;
  // features: DatabaseFeature[];
  // is_full_sync: boolean;
  // is_sample: boolean;
  // native_permissions: DatabaseNativePermission;

  // caveats: string;
  // points_of_interest: string;
}
