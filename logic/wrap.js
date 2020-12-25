class Wrap {
  start(data) {
    this.commaSplit = function (data) {
      if (!data) return data;

      return data.split(",").map((dataEntry) => dataEntry.trim().toLowerCase());
    };

    this.objectSplit = function (data) {
      if (typeof data === "object") {
        for (let o = 0; o < data.length; o++) {
          if (data[o].substr(0, 2) == "> ") {
            data[o] = data[o].substr(2, data[o].length - 1);
          }
        }
      }

      return data;
    };

    let database = new Indental(data).parse();
    let keys = Object.keys(database);

    for (let i = 0; i < keys.length; i++) {
      let entry = database[keys[i]];

      entry.AUTH = this.commaSplit(entry.AUTH);
      entry.TAGS = this.commaSplit(entry.TAGS);
      entry.TYPE = this.commaSplit(entry.TYPE);
      entry.PROJ = this.commaSplit(entry.PROJ);

      entry.LINK = this.objectSplit(entry.LINK);
      entry.FILE = this.objectSplit(entry.FILE);

      database[keys[i]].DIID = i;
    }

    return database;
  }

  filter(target, db) {
    if (target === "") return db;

    let tempDatabase = {};

    let keys = Object.keys(db);

    if (target === "term") {
      for (const key in db) {
        let value = db[key];

        if (value.TERM) {
          tempDatabase[key] = db[key];
        }
      }
    } else {
      var splitTarget = target.split("-");

      if (splitTarget[0] == "tag") {
        // TAG
        let tagRequest = decodeURI(splitTarget[1]);
        for (let i = 0; i < keys.length; i++) {
          let value = db[keys[i]];
          if (typeof value.TAGS !== "undefined") {
            for (let t = 0; t < value.TAGS.length; t++) {
              if (value.TAGS[t] == tagRequest) {
                tempDatabase[keys[i]] = db[keys[i]];
              }
            }
          }
        }
      }

      if (splitTarget[0] == "proj") {
        // PROJECT
        let projectRequest = decodeURI(splitTarget[1]);
        for (let i = 0; i < keys.length; i++) {
          let value = db[keys[i]];
          if (typeof value.PROJ !== "undefined") {
            for (let p = 0; p < value.PROJ.length; p++) {
              if (value.PROJ[p] == projectRequest) {
                tempDatabase[keys[i]] = db[keys[i]];
              }
            }
          }
        }
      } else if (splitTarget[0] == "type") {
        // TYPE
        let typeRequest = decodeURI(splitTarget[1]);
        for (let i = 0; i < keys.length; i++) {
          let value = db[keys[i]];
          if (typeof value.TYPE !== "undefined") {
            if (typeof value.TYPE == "object") {
              // This entry has multiple types
              for (let t = 0; t < value.TYPE.length; t++) {
                if (value.TYPE[t] == typeRequest) {
                  tempDatabase[keys[i]] = db[keys[i]];
                }
              }
            } else {
              // This entry has a single type
              if (value.TYPE == typeRequest) {
                tempDatabase[keys[i]] = db[keys[i]];
              }
            }
          }
        }
      } else if (splitTarget[0] == "done") {
        // DONE
        let doneValue = decodeURI(splitTarget[1]);
        for (let i = 0; i < keys.length; i++) {
          let value = db[keys[i]];
          if (doneValue == "true") {
            // true
            if (typeof value.DONE !== "undefined") {
              if (value.DONE == "true") {
                tempDatabase[keys[i]] = db[keys[i]];
              }
            }
          } else {
            // false
            if (typeof value.DONE === "undefined") {
              tempDatabase[keys[i]] = db[keys[i]];
            } else if (value.DONE == "false") {
              tempDatabase[keys[i]] = db[keys[i]];
            }
          }
        }
      }
    }

    return tempDatabase;
  }

  stats(db) {
    // CALCULATE
    var stats = new Stats();

    for (const dbKey in db) {
      stats.incrementTotal();
      stats.incrementType(db[dbKey].TYPE);
      stats.incrementTags(db[dbKey].TAGS);
      stats.incrementTerm(db[dbKey].TERM);
      stats.incrementDone(db[dbKey].DONE);
    }

    return stats;
  }
}

class Stats {
  constructor() {
    this.total = 0;
    this._types = {};
    this._tags = {};
    this.terms = 0;
    this.done = 0;
  }

  incrementTotal() {
    this.total++;
  }

  incrementType(type) {
    if (!type) return;

    if (this._types[type]) this._types[type]++;
    else this._types[type] = 1;
  }

  incrementTags(tags) {
    if (!tags) return;

    for (let tag of tags) {
      if (this._tags[tag]) this._tags[tag]++;
      else this._tags[tag] = 1;
    }
  }

  incrementTerm(term) {
    if (!term) return;

    let count = 0;

    for (let t of term) if (t.substr(0, 2) === "> ") count++;

    this.terms += count;
  }

  incrementDone(done) {
    if (!done || done !== "true") return;

    this.done++;
  }

  getSortedTypes(count) {
    // SORT TYPES, TAKE TOP X
    // Create items array
    var typeItems = Object.keys(this._types).map((type) => ({
      name: type,
      count: this._types[type],
    }));

    // Sort the array based on the type's count
    typeItems.sort((first, second) => second.count - first.count);

    return typeItems.slice(0, count);
  }

  getSortedTags(count) {
    // SORT TAGS, TAKE TOP X
    // Create items array
    var tagItems = Object.keys(this._tags).map((tag) => ({
      name: tag,
      count: this._tags[tag],
    }));

    // Sort the array based on the tag's count
    tagItems.sort((first, second) => second.count - first.count);

    return tagItems.slice(0, count);
  }
}
