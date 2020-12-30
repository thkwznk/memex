class Wrap {
  commaSplit(data) {
    if (!data) return data;

    return data.split(",").map((dataEntry) => dataEntry.trim().toLowerCase());
  }

  objectSplit(data) {
    if (Array.isArray(data)) {
      for (let o = 0; o < data.length; o++) {
        if (data[o].startsWith("> ")) {
          data[o] = data[o].substr(2);
        }
      }
    }

    return data;
  }

  start(data) {
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
    if (!target) return db;

    let tempDatabase = {};

    if (target === "term") {
      for (const key in db) {
        let value = db[key];

        if (value.TERM) {
          tempDatabase[key] = db[key];
        }
      }

      return tempDatabase;
    }

    var splitTarget = target.split("-");
    let targetType = splitTarget[0];
    let targetName = decodeURI(splitTarget[1]);

    if (targetType == "tag") {
      // TAG
      for (const dbKey in db) {
        const tags = db[dbKey].TAGS;

        if (!tags) continue;

        for (const tag of tags) {
          if (tag === targetName) {
            tempDatabase[dbKey] = db[dbKey];
          }
        }
      }
    }

    if (targetType == "proj") {
      // PROJECT
      for (const dbKey in db) {
        const projects = db[dbKey].PROJ;

        if (!projects) continue;

        for (const project of projects) {
          if (project === targetName) {
            tempDatabase[dbKey] = db[dbKey];
          }
        }
      }
    }

    if (targetType === "type") {
      // TYPE
      for (const dbKey in db) {
        let types = db[dbKey].TYPE;

        if (!types) continue;

        types = Array.isArray(types) ? types : [types];

        for (const type of types) {
          if (type === targetName) {
            tempDatabase[dbKey] = db[dbKey];
          }
        }
      }
    }

    if (targetType == "done") {
      // DONE
      for (const dbKey in db) {
        const done = db[dbKey].DONE;

        if (
          (targetName === "true" && done === "true") ||
          (targetName !== "true" && done !== "true")
        ) {
          tempDatabase[dbKey] = db[dbKey];
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
