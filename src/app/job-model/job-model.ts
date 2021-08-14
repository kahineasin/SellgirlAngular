export interface FetchUri {
  uri: string;
  extract: boolean;
  executable: boolean;
  cache: boolean;
}
export interface ProcedureModel {
  isAdd: boolean;
  procedureId: string;
  procedureName: string;
  status: string;
  from: string[];
  to: string[];
  env: Object;
  containerImage: string;
  cmd: string;
  fetch: FetchUri[];
  maxLaunchDelay: number;
  retry: number;
  retryInterval: number;
  description: string;

  slaveId?: string; //agentId
  frameworkId?: string;
  containerId?: string;
  taskId?: string;
  type: string; //如 APP_JAVA APP_SPARK
}

/*
参考ngx-graph里的 Node接口
 */
export interface NodePosition {
  x: number;
  y: number;
}
export interface NodeModel {
  id: string;
  label: string;
  position?: NodePosition;
}
export interface LinkModel {
  id: string;
  source: string;
  target: string;
  label: string;
}
export enum PaintType {
  none = 1,
  line = 2,
  //DeleteLine,
  delete = 3,
}
export class TestImport {
  constructor(public key: string, public value: any) {}
}

export interface JobFile {
  FileId: string;
  Id: string;
  Url: string;
  Name: string;
}
export class ProcedureType {
  public static APP_JAVA = "APP_JAVA";
  public static APP_SPARK = "APP_SPARK";
}