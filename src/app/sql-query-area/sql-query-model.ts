// export interface JoinConditionModel {
//   leftField: number;
//   rightField: number;
//   Operator: string;
// }
export interface JoinModel {
  fields: string[];
  leftTable: number;
  rightTable: number;
  rightTableAlias: string;
  //condition: JoinConditionModel[];
  condition: any[];
}
// export class JoinModel {
//   fields: string[];
//   leftTable: number;
//   rightTable: number;
//   condition=[
//     {
//       leftField:number;
//     }
//   ];
//   Port: string;
//   UserName: string;
//   Passwordame: string;
//   CreatorName: string;
//   MetaId: string;
//   TableName: string;
//   Enable: string;
//   Creator: string;
//   CreateTime: string;
//   SourceId: string;
//   UpdateTime: string;
//   ShortId: string;
// }
