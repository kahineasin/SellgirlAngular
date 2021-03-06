import { addValidOperatorsToFields } from "./schema_metadata";

// import _ from "underscore";
import { PfUnderscore as _ } from "./pf_underscore";

//import { MetabaseApi } from "metabase/services";

// export async function loadTableAndForeignKeys(tableId) {
//   const [table, foreignKeys] = await Promise.all([
//     MetabaseApi.table_query_metadata({ tableId }),
//     MetabaseApi.table_fks({ tableId }),
//   ]);

//   await augmentTable(table);

//   return {
//     table,
//     foreignKeys,
//   };
// }

// export async function augmentTable(table) {
//   table = populateQueryOptions(table);
//   table = await loadForeignKeyTables(table);
//   return table;
// }

export function augmentDatabase(database) {
  database.tables_lookup = createLookupByProperty(database.tables, "id");
  for (const table of database.tables) {
    addValidOperatorsToFields(table);
    table.fields_lookup = createLookupByProperty(table.fields, "id");
    for (const field of table.fields) {
      addFkTargets(field, database.tables_lookup);
      field.filter_operators_lookup = createLookupByProperty(
        field.filter_operators,
        "name"
      );
    }
  }
  return database;
}

// async function loadForeignKeyTables(table) {
//   // Load joinable tables
//   await Promise.all(
//     table.fields
//       .filter((f) => f.target != null)
//       .map(async (field) => {
//         const targetTable = await MetabaseApi.table_query_metadata({
//           tableId: field.target.table_id,
//         });
//         field.target.table = populateQueryOptions(targetTable);
//       })
//   );
//   return table;
// }

// function populateQueryOptions(table) {
//   table = addValidOperatorsToFields(table);

//   table.fields_lookup = {};

//   _.each(table.fields, function (field) {
//     table.fields_lookup[field.id] = field;
//     field.filter_operators_lookup = {};
//     _.each(field.filter_operators, function (operator) {
//       field.filter_operators_lookup[operator.name] = operator;
//     });
//   });

//   return table;
// }

function addFkTargets(field, tables) {
  if (field.target != null) {
    field.target.table = tables[field.target.table_id];
  }
}

export function createLookupByProperty(items, property) {
  return items.reduce((lookup, item) => {
    lookup[item[property]] = item;
    return lookup;
  }, {});
}
