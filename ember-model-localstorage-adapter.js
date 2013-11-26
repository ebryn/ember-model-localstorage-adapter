var Promise = Ember.RSVP.Promise;

function classToString(klass) {
  return klass.toString().split('.')[1];
}

function key(klass, id) {
  return classToString(klass) + '-' + id;
}

Ember.LocalStorageAdapter = Ember.Adapter.extend({
  find: function(record, id) {
    var data = this._getItem(record.constructor, id);

    return new Promise(function(resolve, reject) {
      if (data) {
        record.load(id, data);
        resolve(record);
      } else {
        reject(record);
      }
    });
  },

  findAll: function(klass, records) {
    var self = this;

    return new Promise(function(resolve, reject) {
      var ids = localStorage[classToString(klass) + '!ids'],
          data = [];

      if (ids) {
        ids = ids.split(',');

        for (var i = 0, l = ids.length; i < l; i++) {
          data.push(self._getItem(klass, ids[i]));
        }
      }

      records.load(klass, data);
      resolve(records);
    });
  },

  findMany: function(klass, records, ids) {
    var self = this;

    return new Promise(function (resolve, reject) {
      var idsL = localStorage[classToString(klass) + '!ids'],
          data = [];

      if (idsL) {
        idsL = idsL.split(',');
        for (var i = 0, l = ids.length; i < l; i++) {
          data.push(self._getItem(klass, idsL[i]));
        }
      }
      console.log(data,ids);
      records.load(klass, data);
      resolve(records);
    });
  },

  findQuery: function(klass, records, params) {
    var self = this;

    return new Promise(function (resolve, reject) {
      var ids = localStorage[classToString(klass) + '!ids'],
          data = [];

      if (ids) {
        ids = ids.split(',');
        for (var i = 0, l = ids.length; i < l; i++) {
          var dontInsert = false;
          var record = self._getItem(klass, ids[i]);
          for (var key in params) {
            if (!params.hasOwnProperty(key)) { continue; }
            var value = params[key];
            if (record[key] !== value) { dontInsert = true; }
          }
          if (!dontInsert)
            data.push(self._getItem(klass, ids[i]));
        }
      }
      records.load(klass, data);
      resolve(records);
    });
  },

  createRecord: function(record) {
    var self = this,
        klass = record.constructor;

    return new Promise(function(resolve, reject) {
      var newId = localStorage[classToString(klass) + '!nextId'] || "1";
      record.set(klass.primaryKey, newId);
      self._setItem(klass, newId, record.toJSON());

      self._updateIds(klass, newId);

      localStorage[classToString(klass) + '!nextId'] = parseInt(newId, 10) + 1;
      record.didCreateRecord();
      resolve(record);
    });
  },

  saveRecord: function(record) {
    var self = this,
        klass = record.constructor;

    return new Promise(function(resolve, reject) {
      self._setItem(klass, record.get(klass.primaryKey), record.toJSON());
      record.didSaveRecord();
      resolve(record);
    });
  },

  deleteRecord: function(record) {
    var self = this,
        klass = record.constructor;

    return new Promise(function(resolve, reject) {
      self._deleteItem(klass, record.get(klass.primaryKey));
      record.didDeleteRecord();
      resolve(record);
    });
  },

  _getItem: function(klass, id) {
    var value = localStorage[key(klass, id)];
    return value && JSON.parse(value);
  },

  _setItem: function(klass, id, data) {
    localStorage[key(klass, id)] = JSON.stringify(data);
  },

  _deleteItem: function(klass, id) {
    delete localStorage[key(klass, id)];

    var idsKey = classToString(klass) + '!ids',
        ids = localStorage[idsKey].split(',');

    for (var i = 0, l = ids.length; i < l; i++) {
      if (ids[i] === ''+id) { // handling id being a number or string
        ids.splice(i, 1);
        break;
      }
    }

    localStorage[idsKey] = ids.join(',');
  },

  _updateIds: function(klass, newId) {
    var key = classToString(klass) + '!ids',
        currentIds = localStorage[key];
    if (currentIds) {
      localStorage[key] += ',' + newId;
    } else {
      localStorage[key] = newId;
    }
  }
});