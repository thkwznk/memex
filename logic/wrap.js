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
