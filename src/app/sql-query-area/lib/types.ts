//import _ from "underscore";

//import MetabaseSettings from "metabase/lib/settings";

//const PARENTS = MetabaseSettings.get("types");//这个属性似乎就是E:\svn\metabase-master\frontend\test\metabase-bootstrap.js 里面定义的,我是console开源版得到的这个内容
const PARENTS = {
  "type/DruidHyperUnique": ["type/*"],
  "type/Longitude": ["type/Coordinate"],
  "type/TimeWithTZ": ["type/Time"],
  "type/IPAddress": ["type/TextLike"],
  "type/TimeWithLocalTZ": ["type/TimeWithTZ"],
  "type/URL": ["type/Text"],
  "type/BigInteger": ["type/Integer"],
  "type/Category": ["type/Special"],
  "type/Owner": ["type/User"],
  "type/TextLike": ["type/*"],
  "type/Discount": ["type/Currency"],
  "type/UNIXTimestampSeconds": ["type/UNIXTimestamp"],
  "type/PostgresEnum": ["type/Text"],
  "type/Time": ["type/Temporal"],
  "type/Integer": ["type/Number"],
  "type/Currency": ["type/Float"],
  "type/Author": ["type/User"],
  "type/Cost": ["type/Currency"],
  "type/Quantity": ["type/Integer"],
  "type/Instant": ["type/DateTimeWithLocalTZ"],
  "type/Number": ["type/*"],
  "type/JoinTimestamp": ["type/DateTime"],
  "type/Subscription": ["type/Category"],
  "type/DeletionTime": ["type/Date", "type/DeletionTimestamp"],
  "type/State": ["type/Category", "type/Address", "type/Text"],
  "type/CancelationDate": ["type/Date", "type/CancelationTimestamp"],
  "type/CancelationTime": ["type/Date", "type/CancelationTimestamp"],
  "type/DeletionDate": ["type/Date", "type/DeletionTimestamp"],
  "type/DateTimeWithZoneID": ["type/DateTimeWithTZ"],
  "type/Address": ["type/*"],
  "type/Source": ["type/Category"],
  "type/Name": ["type/Category", "type/Text"],
  "type/Decimal": ["type/Float"],
  "type/Birthdate": ["type/Date"],
  "type/Date": ["type/Temporal"],
  "type/Text": ["type/*"],
  "type/FK": ["type/Special"],
  "type/SerializedJSON": ["type/Text", "type/Collection"],
  "type/DateTimeWithZoneOffset": ["type/DateTimeWithTZ"],
  "type/MongoBSONID": ["type/TextLike"],
  "type/Duration": ["type/Number"],
  "type/Temporal": ["type/*"],
  "type/Float": ["type/Number"],
  "type/CreationTimestamp": ["type/DateTime"],
  "type/Email": ["type/Text"],
  "type/City": ["type/Category", "type/Address", "type/Text"],
  "type/Title": ["type/Category", "type/Text"],
  "type/Special": ["type/*"],
  "type/Dictionary": ["type/Collection"],
  "type/Description": ["type/Text"],
  "type/JoinTime": ["type/JoinTimestamp", "type/Date"],
  "type/Company": ["type/Category"],
  "type/PK": ["type/Special"],
  "type/Latitude": ["type/Coordinate"],
  "type/CreationTime": ["type/Time", "type/CreationTimestamp"],
  "type/Coordinate": ["type/Float"],
  "type/UUID": ["type/Text"],
  "type/Country": ["type/Category", "type/Address", "type/Text"],
  "type/DateTimeWithTZ": ["type/DateTime"],
  "type/JoinDate": ["type/JoinTimestamp", "type/Date"],
  "type/Boolean": ["type/Category", "type/*"],
  "type/CancelationTimestamp": ["type/DateTime"],
  "type/GrossMargin": ["type/Currency"],
  "type/CreationDate": ["type/Date", "type/CreationTimestamp"],
  "type/AvatarURL": ["type/ImageURL"],
  "type/Share": ["type/Float"],
  "type/Product": ["type/Category"],
  "type/ImageURL": ["type/URL"],
  "type/Price": ["type/Currency"],
  "type/UNIXTimestampMilliseconds": ["type/UNIXTimestamp"],
  "type/Collection": ["type/*"],
  "type/User": ["type/*"],
  "type/Array": ["type/Collection"],
  "type/Income": ["type/Currency"],
  "type/Comment": ["type/Text"],
  "type/DeletionTimestamp": ["type/DateTime"],
  "type/TimeWithZoneOffset": ["type/TimeWithTZ"],
  "type/Score": ["type/Number"],
  "type/ZipCode": ["type/Address", "type/Text"],
  "type/DateTime": ["type/Temporal"],
  "type/DateTimeWithLocalTZ": ["type/DateTimeWithTZ"],
  "type/UNIXTimestamp": ["type/Integer", "type/Instant"],
  "type/Enum": ["type/Category", "type/*"],
};

/// Basically exactly the same as Clojure's isa?
/// Recurses through the type hierarchy until it can give you an answer.
/// isa(TYPE.BigInteger, TYPE.Number) -> true
/// isa(TYPE.Text, TYPE.Boolean) -> false
export function isa(child, ancestor) {
  if (!child || !ancestor) {
    return false;
  }

  if (child === ancestor) {
    return true;
  }

  const parents = PARENTS[child];
  if (!parents) {
    if (child !== "type/*") {
      console.error("Invalid type:", child);
    } // the base type is the only type with no parents, so anything else that gets here is invalid
    return false;
  }

  for (const parent of parents) {
    if (isa(parent, ancestor)) {
      return true;
    }
  }

  return false;
}

// build a pretty sweet dictionary of top-level types, so people can do TYPE.Latitude instead of "type/Latitude" and get error messages / etc.
// this should also make it easier to keep track of things when we tweak the type hierarchy
export const TYPE: any = {};
for (const type of Object.keys(PARENTS)) {
  const key = type.substring(5); // strip off "type/"
  TYPE[key] = type;
}

// convenience functions since these operations are super-common
// this will also make it easier to tweak how these checks work in the future,
// e.g. when we add an `is_pk` column and eliminate the PK special type we can just look for places that use isPK

export function isPK(type) {
  return isa(type, TYPE["PK"]);
}

export function isFK(type) {
  return isa(type, TYPE["FK"]);
}
