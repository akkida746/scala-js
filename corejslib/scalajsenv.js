/* ------------------
 * The top-level ScalaJS environment
 * ------------------ */

function $ScalaJSEnvironmentClass() {
  // Fields
  this.classes = {};
  this.modules = {};
  this.natives = {};

  // Core mechanism

  this.createClass = function(name, typeFunction, parent, ancestors) {
    var data = {
      name: name,
      type: typeFunction,
      parent: parent,
      ancestors: ancestors,
      _class: undefined,
      get class() {
        if (this._class === undefined)
          this._class = $ScalaJSEnvironment.createClassInstance(this);
        return this._class;
      }
    };
    typeFunction.prototype.$classData = data;

    Object.defineProperty(this.classes, name, {
      __proto__: null,
      enumerable: true,
      configurable: false,
      writable: false,
      value: data
    });
  };

  this.createInterface = function(name, ancestors) {
    var data = {
      name: name,
      ancestors: ancestors,
      _class: undefined,
      get class() {
        if (this._class === undefined)
          this._class = $ScalaJSEnvironment.createClassInstance(this);
        return this._class;
      }
    };

    Object.defineProperty(this.classes, name, {
      __proto__: null,
      enumerable: true,
      configurable: false,
      writable: false,
      value: data
    });
  };

  this.registerClass = function(name, createFunction) {
    var self = this;
    Object.defineProperty(this.classes, name, {
      __proto__: null,
      enumerable: true,
      configurable: true,
      get: function() {
        createFunction(self); // hopefully this calls createClass(name) ...
        return this[name];    // ... otherwise this will recurse infinitely
      }
    });
  }

  this.registerModule = function(name, className, constructorName) {
    var self = this;
    var data = {
      _instance: undefined,
      get instance() {
        if (this._instance === undefined)
          this._instance = new self.classes[className].type()[constructorName]();
        return this._instance
      }
    };
    this.modules[name] = data;
  }

  this.createClassInstance = function(data) {
    return new this.classes["java.lang.Class"].type()[
      "<init>(<special>):java.lang.Class"](data);
  }

  this.registerNative = function(fullName, nativeFunction) {
    this.natives[fullName] = nativeFunction;
  }

  // Runtime functions

  // Defined in javalangString.js
  // this.makeNativeStrWrapper = function(nativeStr) {...};

  this.isInstance = function(instance, classFullName) {
    if ((typeof(instance) !== "object") || (instance === null))
      return false;
    else {
      var classData = instance.$classData;
      if (classData === undefined)
        return false;
      else
        return classData.ancestors[classFullName] ? true : false;
    }
  };

  this.asInstance = function(instance, classFullName) {
    if ((instance === null) || this.isInstance(instance, classFullName))
      return instance;
    else
      throw new this.classes["java.lang.ClassCastException"].type()[
        "<init>(java.lang.String):java.lang.ClassCastException"](
          this.makeNativeStrWrapper(
            instance + " is not an instance of " + classFullName));
  };
}

var $ScalaJSEnvironment = new $ScalaJSEnvironmentClass();