var App = Ember.Application.create();

var attr = Ember.attr;

App.Person = Ember.Model.extend({
  id: attr(),
  name: attr()
});

App.Person.reopenClass({
  adapter: Ember.LocalStorageAdapter.create()
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return App.Person.find();
  }
});

App.IndexController = Ember.ArrayController.extend({
  newName: null,

  save: function() {
    App.Person.create({name: this.get('newName')}).save();
    this.set('newName', null);
  },

  deleteRecord: function(model) {
    model.deleteRecord();
  }
});