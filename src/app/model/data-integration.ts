//import { bool } from "aws-sdk/clients/signer";
import { deprecate } from "util";
import { DatasetQuery } from "../sql-query-area/model/Card";
// import { StructuredQuery } from "../../components/sql-query-area/model/Query";

export interface DatabaseModel {
  DataSourceId: string;
  SourceType: string;
  SourceName: string;
  IpAddress: string;
  Port: string;
  UserName: string;
  Password: string;
  DatabaseName: string;
  Desc: string;
  Enable: string;
  Params: string;
  Creator: string;
  CreatorName: string;
  CreateTime: string;
  UpdateTime: string;
  ShortId: number;
}
/**
 * 此模型暂时是为了解决后台返回的int变成字符串的问题
 */
export class DatabaseModelClass {
  DataSourceId: string = "";
  SourceType: string = "";
  SourceName: string = "";
  IpAddress: string = "";
  Port: string = "";
  UserName: string = "";
  Password: string = "";
  DatabaseName: string = "";
  Desc: string = "";
  Enable: string = "";
  Params: string = "";
  Creator: string = "";
  CreatorName: string = "";
  CreateTime: string = "";
  UpdateTime: string = "";
  ShortId: number = -1;
  //constructor() {}
  constructor(m: any) {
    const me = this;
    me.DataSourceId = m.DataSourceId;
    me.SourceType = m.SourceType;
    me.SourceName = m.SourceName;
    me.IpAddress = m.IpAddress;
    me.Port = m.Port;
    me.UserName = m.UserName;
    me.Password = m.Password;
    me.DatabaseName = m.DatabaseName;
    me.Desc = m.Desc;
    me.Enable = m.Enable;
    me.Params = m.Params;
    me.Creator = m.Creator;
    me.CreatorName = m.CreatorName;
    me.CreateTime = m.CreateTime;
    me.UpdateTime = m.UpdateTime;
    me.ShortId = parseInt(m.ShortId);
  }
}

export interface DataTableModel {
  SourceName: string;
  SourceType: string;
  DatabaseName: string;
  MetabaseName: string;
  Ip: string;
  Port: string;
  UserName: string;
  Password: string;
  CreatorName: string;
  ShortId: number;
  MetaId: string;
  TableName: string;
  Enable: string;
  Creator: string;
  CreateTime: string;
  SourceId: string;
  UpdateTime: string;
  SourceShortId: number;
  //TableShortId: number;

  // //下面是非数据库字段,用于页面显示
  // isJoinedTable?: boolean;
  // TableName
}
export class DataTableUIModel implements DataTableModel {
  SourceName: string = "";
  SourceType: string = "";
  DatabaseName: string = "";
  MetabaseName: string;
  Ip: string = "";
  Port: string = "";
  UserName: string = "";
  Password: string = "";
  CreatorName: string = "";
  ShortId: number = 0;
  MetaId: string = "";
  TableName: string = "";
  Enable: string = "";
  Creator: string = "";
  CreateTime: string = "";
  SourceId: string = "";
  UpdateTime: string = "";
  SourceShortId: number = 0;

  // //下面是非数据库字段,用于页面显示
  isJoinedTable?: boolean = true;
  isMenuOpened?: boolean = false;
  /**
   * Table唯一名,当join相当table时,后面要加_1 _2来区分
   */
  TableIdxName: string = "";
  //TableShortId: number = 0;
  constructor(m: any) {
    const me = this;
    me.SourceName = m.SourceName;
    me.SourceType = m.SourceType;
    me.DatabaseName = m.DatabaseName;
    me.MetabaseName = m.MetabaseName;
    me.Ip = m.Ip;
    me.Port = m.Port;
    me.UserName = m.UserName;
    me.Password = m.Password;
    me.CreatorName = m.CreatorName;
    me.ShortId = parseInt(m.ShortId);
    me.MetaId = m.MetaId;
    me.TableName = m.TableName;
    me.Enable = m.Enable;
    me.Creator = m.Creator;
    me.CreateTime = m.CreateTime;
    me.SourceId = m.SourceId;
    me.UpdateTime = m.UpdateTime;
    me.SourceShortId = parseInt(m.SourceShortId);
    me.isJoinedTable = m.isJoinedTable;
    me.TableIdxName = m.TableIdxName;
    //me.TableShortId = m.TableShortId;
  }
}

export interface DataColumnModel {
  ShortId: number;
  Status: string;
  Id: string;
  MetaId: string;
  ColumnName: string;
  ChineseName: string;
  Description: string;
  DataType: string;
  Order: string;
  MetabaseShortId: number;
  TableShortId: number;
}

export class DataColumnUIModel implements DataColumnModel {
  ShortId: number = 0;
  Status: string = "";
  Id: string = "";
  MetaId: string = "";
  ColumnName: string = "";
  ChineseName: string = "";
  Description: string = "";
  DataType: string = "";
  Order: string = "";
  MetabaseShortId: number = 0;
  TableShortId: number = 0;
  constructor(m: any) {
    const me = this;
    me.ShortId = parseInt(m.ShortId);
    me.Status = m.Status;
    me.Id = m.Id;
    me.MetaId = m.MetaId;
    me.ColumnName = m.ColumnName;
    me.ChineseName = m.ChineseName;
    me.Description = m.Description;
    me.DataType = m.DataType;
    me.Order = m.Order;
    me.MetabaseShortId = parseInt(m.MetabaseShortId);
    me.TableShortId = parseInt(m.TableShortId);
  }
}

/**
 * 数据模型表
 * 相当于DatamodelQuery的分组
 */
export interface Datamodel {
  /**
   * 数据模型id
   */
  DatamodelId: number;
  /**
   * 数据模型名称
   */
  DatamodelName: string;
}

export interface DatamodelToQuery {
  /**
   * 外键 Datamodel->DatamodelId
   */
  DatamodelId: number;
  /**
   * 外键 DatamodelQuery->DatamodelQueryId
   */
  DatamodelQueryId: number;
}

/**
 * 数据查询模型表
 * 多出这个表而不是在Datamodel做Config[]这种格式,这是为了便于以后可以直接使用这个表的数据
 */
export interface DatamodelQuery {
  /**
   * guid
   */
  Id: string;
  /**
   * 数据查询模型id
   */
  DatamodelQueryId: number;
  /**
   * 数据查询模型名称
   */
  DatamodelQueryName: string;

  /**
   * 复杂json,后端用java版的eval来解析
   */
  QueryConfig: string;
  //query: any[];
  /**
   * 此属性的类型是参考metabase的Card.dataset_query属性,也是QueryConfig的json解析结果,不是数据库字段
   * DatasetQuery是metabase的config的类型(第一层非递归)
   */
  query: DatasetQuery; //StructuredQuery;

  DatabaseId: string; //在query里有,似乎没必要,现在已经改为uuid类型,提交时后台赋这个值
  TableId: string;
  /**
   * 查询类型(这个类型是参考metabase的:1.native原生sql;2.query可视化sql配置)
   */
  QueryType: string;
  //result_metadata: string

  /**
   * 描述
   */
  Description: string;
  /**
   * 创建时间
   */
  Time: string;
  /**
   * 更新时间
   */
  UpdateTime: string;
  /**
   * 创建用户id
   */
  UserId: string;

  Enable: boolean;

  GroupId: string;

  Cache: boolean;

  CacheInterval: number;
}

export class DatamodelQueryUIModel implements DatamodelQuery {
  DatamodelQueryId: number = 0;
  Id: string = "";
  DatamodelQueryName: string = "";
  QueryConfig: string = "";
  query: DatasetQuery; //StructuredQuery;
  TableId: string;
  QueryType: string;
  Description: string = "";
  Time: string = "";
  UpdateTime: string = "";
  UserId: string = "";
  Enable: boolean = false;
  DatabaseId: string = "";
  GroupId: string = "";
  Cache: boolean = false;
  CacheInterval: number = 0;
  // //下面是非数据库字段,用于页面显示
  isJoinedTable?: boolean = true;
  isMenuOpened?: boolean = false;
  /**
   * Table唯一名,当join相当table时,后面要加_1 _2来区分
   */
  TableIdxName: string = "";
  constructor(m: any) {
    const me = this;
    me.DatamodelQueryId = parseInt(m.DatamodelQueryId);
    me.Id = m.Id;
    me.DatamodelQueryName = m.DatamodelQueryName;
    me.QueryConfig = m.QueryConfig;
    me.TableId = m.TableId;
    me.QueryType = m.QueryType;
    me.Description = m.Description;
    me.Time = m.Time;
    me.UpdateTime = m.UpdateTime;
    me.UserId = m.UserId;
    me.Enable = m.Enable;
    //me.DatabaseId = parseInt(m.DatabaseId);
    me.DatabaseId = m.DatabaseId;
    me.GroupId = m.GroupId;
    me.Cache = m.Cache === "False" ? false : true;
    me.CacheInterval = parseInt(m.CacheInterval);
  }
}

export interface DatamodelGroupModel {
  Id: string;
  Name: string;
  Time: string;
  UserId: string;
  GroupType: string;
}

export class DatamodelGroupUIModel implements DatamodelGroupModel {
  Id: string = "";
  Name: string = "";
  Time: string = "";
  UserId: string = "";
  GroupType: string = "";
  constructor(m: any) {
    const me = this;
    me.Id = m.Id;
    me.Name = m.Name;
    me.Time = m.Time;
    me.UserId = m.UserId;
    me.GroupType = m.GroupType;
  }
}
