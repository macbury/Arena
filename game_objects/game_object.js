var _ = require('underscore');
var Base = require('./base_helpers');

var GameObject = function (attributes, options) {
  var defaults;
  attributes || (attributes = {});
  if (defaults = this.defaults) {
    if (_.isFunction(defaults)) defaults = defaults.call(this);
    attributes = _.extend({}, defaults, attributes);
  }
  this.attributes = {};
  this._escapedAttributes = {};
  this.cid = _.uniqueId(this.prefix);
  this.set(attributes, {silent : true});
  this._changed = false;
  this._previousAttributes = _.clone(this.attributes);
  if (options && options.collection) this.collection = options.collection;
  this.initialize(attributes, options);
}

GameObject.extend = Base.extend;
 // Attach all inheritable methods to the Model prototype.
_.extend(GameObject.prototype, Base.Events, {
  prefix: "game_object_",
  // A snapshot of the model's previous attributes, taken immediately
  // after the last `"change"` event was fired.
  _previousAttributes : null,

  // Has the item been changed since the last `"change"` event?
  _changed : false,

  // The default name for the JSON `id` attribute is `"id"`. MongoDB and
  // CouchDB users may want to set this to `"_id"`.
  idAttribute : 'id',

  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize : function(){},

  // Return a copy of the model's `attributes` object.
  toJSON : function() {
    return _.clone(this.attributes);
  },

  // Get the value of an attribute.
  get : function(attr) {
    return this.attributes[attr];
  },
  // Returns `true` if the attribute contains a value that is not null
  // or undefined.
  has : function(attr) {
    return this.attributes[attr] != null;
  },

  // Set a hash of model attributes on the object, firing `"change"` unless you
  // choose to silence it.
  set : function(attrs, options) {

    // Extract attributes and options.
    options || (options = {});
    if (!attrs) return this;
    if (attrs.attributes) attrs = attrs.attributes;
    var now = this.attributes, escaped = this._escapedAttributes;

    // Run validation.
    if (!options.silent && this.validate && !this._performValidation(attrs, options)) return false;

    // Check for changes of `id`.
    if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

    // We're about to start triggering change events.
    var alreadyChanging = this._changing;
    this._changing = true;

    // Update attributes.
    for (var attr in attrs) {
      var val = attrs[attr];
      if (!_.isEqual(now[attr], val)) {
        now[attr] = val;
        delete escaped[attr];
        this._changed = true;
        if (!options.silent) this.trigger('change:' + attr, this, val, options);
      }
    }

    // Fire the `"change"` event, if the model has been changed.
    if (!alreadyChanging && !options.silent && this._changed) this.change(options);
    this._changing = false;
    return this;
  },

  // Remove an attribute from the model, firing `"change"` unless you choose
  // to silence it. `unset` is a noop if the attribute doesn't exist.
  unset : function(attr, options) {
    if (!(attr in this.attributes)) return this;
    options || (options = {});
    var value = this.attributes[attr];

    // Run validation.
    var validObj = {};
    validObj[attr] = void 0;
    if (!options.silent && this.validate && !this._performValidation(validObj, options)) return false;

    // Remove the attribute.
    delete this.attributes[attr];
    delete this._escapedAttributes[attr];
    if (attr == this.idAttribute) delete this.id;
    this._changed = true;
    if (!options.silent) {
      this.trigger('change:' + attr, this, void 0, options);
      this.change(options);
    }
    return this;
  },

  // Clear all attributes on the model, firing `"change"` unless you choose
  // to silence it.
  clear : function(options) {
    options || (options = {});
    var attr;
    var old = this.attributes;

    // Run validation.
    var validObj = {};
    for (attr in old) validObj[attr] = void 0;
    if (!options.silent && this.validate && !this._performValidation(validObj, options)) return false;

    this.attributes = {};
    this._escapedAttributes = {};
    this._changed = true;
    if (!options.silent) {
      for (attr in old) {
        this.trigger('change:' + attr, this, void 0, options);
      }
      this.change(options);
    }
    return this;
  },

  // **parse** converts a response into the hash of attributes to be `set` on
  // the model. The default implementation is just to pass the response along.
  parse : function(resp, xhr) {
    return resp;
  },

  // Create a new model with identical attributes to this one.
  clone : function() {
    return new this.constructor(this);
  },

  // A model is new if it has never been saved to the server, and lacks an id.
  isNew : function() {
    return this.id == null;
  },

  // Call this method to manually fire a `change` event for this model.
  // Calling this will cause all objects observing the model to update.
  change : function(options) {
    this.trigger('change', this, options);
    this._previousAttributes = _.clone(this.attributes);
    this._changed = false;
  },

  // Determine if the model has changed since the last `"change"` event.
  // If you specify an attribute name, determine if that attribute has changed.
  hasChanged : function(attr) {
    if (attr) return this._previousAttributes[attr] != this.attributes[attr];
    return this._changed;
  },

  // Return an object containing all the attributes that have changed, or false
  // if there are no changed attributes. Useful for determining what parts of a
  // view need to be updated and/or what attributes need to be persisted to
  // the server.
  changedAttributes : function(now) {
    now || (now = this.attributes);
    var old = this._previousAttributes;
    var changed = false;
    for (var attr in now) {
      if (!_.isEqual(old[attr], now[attr])) {
        changed = changed || {};
        changed[attr] = now[attr];
      }
    }
    return changed;
  },

  // Get the previous value of an attribute, recorded at the time the last
  // `"change"` event was fired.
  previous : function(attr) {
    if (!attr || !this._previousAttributes) return null;
    return this._previousAttributes[attr];
  },

  // Get all of the attributes of the model at the time of the previous
  // `"change"` event.
  previousAttributes : function() {
    return _.clone(this._previousAttributes);
  },

  // Run validation against a set of incoming attributes, returning `true`
  // if all is well. If a specific `error` callback has been passed,
  // call that instead of firing the general `"error"` event.
  _performValidation : function(attrs, options) {
    var error = this.validate(attrs);
    if (error) {
      if (options.error) {
        options.error(this, error, options);
      } else {
        this.trigger('error', this, error, options);
      }
      return false;
    }
    return true;
  }
});

exports.GameObject = GameObject;
