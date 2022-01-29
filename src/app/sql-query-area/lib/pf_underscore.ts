/**
 * 暂时用此类来模拟underscore这个包
 */
export class PfUnderscore {
  public static isEqual(object: any, other: any) {
    return JSON.stringify(object) === JSON.stringify(other);
  }
  public static all<T>(
    collection: T[],
    iteratee?: (value: T, index: number) => boolean
  ): boolean {
    for (let i = 0; i < collection.length; i++) {
      if (!iteratee(collection[i], i)) {
        return false;
      }
    }
    return true;
  }
  public static any<T>(
    collection: T[],
    iteratee?: (value: T, index: number) => boolean
  ): boolean {
    for (let i = 0; i < collection.length; i++) {
      if (iteratee(collection[i], i)) {
        return true;
      }
    }
    return false;
  }
  public static findIndex<T>(
    collection: T[],
    iteratee?: (value: T, index: number) => boolean
  ): number {
    return collection.findIndex(iteratee);
  }
  public static find<T>(
    collection: T[],
    iteratee?: (value: T, index: number) => boolean
  ): T {
    return collection.find(iteratee);
  }
  public static last<T>(collection: T[]): T {
    var [last] = [...collection].reverse();
    return last;
  }
  public static map<T, U>(
    collection: T[],
    iteratee?: (value: T, index: number) => U
  ): U[] {
    return collection.map(iteratee);
  }

  /**
   * Produces a duplicate-free version of `list`, using === to test
   * object equality. If you know in advance that `list` is sorted,
   * passing true for isSorted will run a much faster algorithm. If you
   * want to compute unique items based on a transformation, pass an
   * iteratee function.
   * @param list The list to remove duplicates from.
   * @param isSorted True if `list` is already sorted, optional,
   * default = false.
   * @param iteratee Transform the elements of `list` before comparisons
   * for uniqueness.
   * @param context 'this' object in `iteratee`, optional.
   * @returns An array containing only the unique elements in `list`.
   **/
  public static uniq<T>(
    list: T[],
    isSorted?: boolean,
    iteratee?: (value: T, index: number) => boolean
  ): T[] {
    return [...new Set(list)];
  }
  /**
   * https://www.cnblogs.com/DM428/p/8687919.html
   * @param array
   * @param result
   * @returns
   */
  public static flatten(array, result) {
    var result = result || [];
    var length = array.length;
    var toString = Object.prototype.toString;
    var type = toString.call(array);
    if (type !== "[object Array]")
      throw new TypeError("The parameter you passed is not a array");
    else {
      for (var i = 0; i < length; i++) {
        if (toString.call(array[i]) !== "[object Array]") {
          result.push(array[i]);
        } else {
          arguments.callee(array[i], result);
        }
      }
    }
    return result;
  }
  /**
   * Return a copy of `object` that is filtered to only have values for
   * the allowed keys (or array of keys).
   * @param object The object to pick specific keys in.
   * @param keys The keys to keep on `object`.
   * @returns A copy of `object` with only the `keys` properties.
   **/
  public static pick<V>(object: V, ...keys: string[]): any {
    //_Pick<V, K>
    let r = {};
    for (let i = 0; i < keys.length; i++) {
      r[keys[i]] = object[keys[i]];
    }
    return r;
  }
  public static findWhere(collection: any[], properties: any): any[] {
    return collection.find((a) => {
      let isMatch = true;
      for (let j in properties) {
        if (properties.hasOwnProperty(j)) {
          if (properties[j] === a[j]) {
          } else {
            isMatch = false;
          }
        }
      }
      return isMatch;
    });
    // let r = [];
    // for (let i = 0; i < collection.length; i++) {
    //   let isMatch = true;
    //   for (let j in properties) {
    //     if (properties.hasOwnProperty(j)) {
    //       if (properties[j] === collection[i][j]) {
    //       } else {
    //         isMatch = false;
    //       }
    //     }
    //   }
    //   if (isMatch) {
    //     r.push(collection[i]);
    //   }
    // }
    // return r;
  }

  /**
   * Merges together the values of each of the `lists` with the values at
   * the corresponding position. Useful when you have separate data
   * sources that are coordinated through matching list indexes.
   * 
   * 将相对应位置的数组的值合并到一起
   * _.zip(['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false]);
=> [["moe", 30, true], ["larry", 40, false], ["curly", 50, false]]
   * 
   * @param lists The lists to zip.
   * @returns The zipped version of `lists`.
   **/
  public static zip(...lists: any[][]): any[][] {
    let r: any[][] = [];
    //  for(let i=0;i<lists[0].length;i++){
    //    r.push()
    //  }
    let maxY = lists[0].length;
    for (let i = 0; i < lists.length; i++) {
      let item = [];

      for (let j = 0; j < maxY; j++) {
        item.push(lists[i][j]);
      }
      r.push(item);
    }
    return r;
  }
}
