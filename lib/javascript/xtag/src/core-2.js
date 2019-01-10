(function(){

  var docElement = document.documentElement;
  (Element.prototype.matches || (Element.prototype.matches = docElement.webkitMatchesSelector ||
                                                             docElement.msMatchesSelector ||
                                                             docElement.oMatchesSelector));

  var regexParseExt = /(\w+)|(::|:)(\w+)(?:\((.+?(?=\)))\))?/g;
  var regexCommaArgs = /,\s*/;
  var range = document.createRange();

	/** 
	 * @name: delegatAction
	 */
  function delegateAction(node, pseudo, event) {
    var match,
        target = event.target,
        root = event.currentTarget;

	while (!match && target && target != root) {
      if (target.tagName && target.matches(pseudo.args)) match = target;
      target = target.parentNode;
    }

    if (!match && root.tagName && root.matches(pseudo.args)) match = root;
    if (match) pseudo.fn = pseudo.fn.bind(match);
    else return null;
  }

  /**
   * @Name: xtag
   * @Tags: Object, Window, WebComponents 
   */
  var xtag = {
    events: {},
    pseudos: {
      delegate: {
        onInvoke: delegateAction
      }
    },
    extensions: {
      rxn: {
        onParse (klass, prop, args, descriptor, key){
          delete klass.prototype[key];
          return false;
        },
        onConstruct (node, property, args, descriptor){
          node.rxn(property, descriptor.value, !!args[1]);
        }
      },
      attr: {
        mixin: (base) => class extends base {
          attributeChangedCallback(attr, last, current){
            var desc = this.constructor.getOptions('attributes')[attr];
            if (desc && desc.set && !desc._skip) {
              desc._skip = true;
              desc.set.call(this, current);
              desc._skip = null;
            }
          }
        },
        types: {
          boolean: {
            set: function(prop, val){
              val || val === '' ? this.setAttribute(prop, '') : this.removeAttribute(prop);
            },
            get: function(prop){
              return this.hasAttribute(prop);
            }
          }
        },
        onParse (klass, prop, args, descriptor, key){
          if (descriptor.value) throw 'Attribute accessor "'+ prop +'" was declared as a value, but must be declared as get or set';
          klass.getOptions('attributes')[prop] = descriptor;
          var type = this.types[args[0]] || {};
          let descSet = descriptor.set;
          let typeSet = type.set || HTMLElement.prototype.setAttribute;
          descriptor.set = function(val){
            if (!descriptor._skip){
              descriptor._skip = true;
              var output;
              if (descSet) output = descSet.call(this, val);
              typeSet.call(this, prop, typeof output == 'undefined' ? val : output);
              descriptor._skip = null;
            }
          }
          let descGet = descriptor.get;
          let typeGet = type.get || HTMLElement.prototype.getAttribute;
          descriptor.get = function(){
            var output;
            var val = typeGet.call(this, prop);
            if (descGet) output = descGet.call(this, val);
            return typeof output == 'undefined' ? val : output;
          }
          delete klass.prototype[key];
        },
        onCompiled (klass){
          klass.observedAttributes = Object.keys(klass.getOptions('attributes')).concat(klass.observedAttributes || [])
        }
      },
      event: {
        onParse (klass, property, args, descriptor, key){
          delete klass.prototype[key];
          return false;
        },
        onConstruct (node, property, args, descriptor){
          xtag.addEvent(node, property, descriptor.value);
        }
      },
      template: {
        insert: function(node, template, resolve){
          var frag = range.createContextualFragment(template.call(node));
          Array.from(frag.children).forEach(child => child._templateNode = true);
          Array.from(node.children).forEach(child => {
            if (child._templateNode) node.removeChild(child)
          });
          node.appendChild(frag);  
          if (resolve) resolve();
        },
        render: function(node, name, frame){
          var promise;
          var _name = name || 'default';
          var template = node.templates[_name];
          if (template) {
            cancelAnimationFrame(node._templateFrame);
            if (frame) {
              if (!node._templatePromise || node._templatePromise.resolved) {
                node._templatePromise = new Promise(resolve =>  {
                  node._templateFrame = requestAnimationFrame(() => {
                    this.insert(node, template, resolve);
                  });

                })
              }
              
            }
            else {
              this.insert(node, template, resolve);
            }
            
            node._templateRender();
          }
          else throw new ReferenceError('Template "' + _name + '" is undefined');
        },
        mixin: (base) => class extends base {
          set 'template::attr' (name){
            this.render(name);
          }
          get templates (){
            return this.constructor.getOptions('templates');
          }
          render (name, options = {}){
            return new Promise((resolve, reject) => {
              this.template = name;
              var _name = name || 'default';
              var template = this.templates[_name];
              if (this.template != name) this.template = _name;
              if (template) {
                xtag.extensions.template.insert(this, template, resolve);
              }
              else {
                throw new ReferenceError('Template "' + _name + '" is undefined');
                reject(this);
              }
            }).then(() => {
              processRxns(this, 'render');
            });
          }
        },
        onParse (klass, property, args, descriptor){
          klass.getOptions('templates')[property || 'default'] = descriptor.value;
          return false;
        },
        onReady (node, resolve, property, args){
          if (JSON.parse(args[0] || false)) {
            if (args[1] == 'ready') node.render(property);
            else node.rxn('firstpaint', () => node.render(property));
          }
          resolve();
        }
      }
    },
    create (name, klass){
      var c = klass || name;
      c.options = Object.assign({}, c.options);
      onParse(c); 
      if (klass && name) customElements.define(name, c);
      return c;
    },
    register (name, klass) {
      customElements.define(name, klass);
    },
    addEvents (node, events){
      let refs = {};
      for (let z in events) refs[z] = xtag.addEvent(node, z, events[z]);
      return refs;
    },
    addEvent (node, key, fn, capture){
      var type;  
      var stack = fn;
      var ref = { data: {}, capture: capture };
      var pseudos = node.constructor.getOptions('pseudos');
      key.replace(regexParseExt, (match, name, pseudo1, args, pseudo2) => {
        if (name) type = name;
        else {
          var pseudo = pseudo1 || pseudo2,
              pseudo = pseudos[pseudo] || xtag.pseudos[pseudo];
          var _args = args ? args.split(regexCommaArgs) : [];
          stack = pseudoWrap(pseudo, _args, stack, ref);
          if (pseudo.onParse) pseudo.onParse(node, type, _args, stack, ref);
        }
      });
      node.addEventListener(type, stack, capture);
      ref.type = type;
      ref.listener = stack;
      var event = node.constructor.getOptions('events')[type] || xtag.events[type];
      if (event) {
        var listener = function(e){
          new Promise((resolve, reject) => {
            event.onFilter(this, e, ref, resolve, reject);
          }).then(() => {
            xtag.fireEvent(e.target, type);
          });
        }
        ref.attached = event.attach.map(key => {
          return xtag.addEvent(node, key, listener, true);
        });
        if (event.onAdd) event.onAdd(node, ref);
      }
      return ref;
    },
    removeEvents (node, refs) {
      for (let z in refs) xtag.removeEvent(node, refs[z]);
    },
    removeEvent (node, ref){
      node.removeEventListener(ref.type, ref.listener, ref.capture);
      var event = node.constructor.getOptions('events')[ref.type] || xtag.events[ref.type];
      if (event && event.onRemove) event.onRemove(node, ref);
      if (ref.attached) ref.attached.forEach(attached => { xtag.removeEvent(node, ref) })
    },
    fireEvent (node, name, obj = {}){
      let options = Object.assign({
        bubbles: true,
        cancelable: true
      }, obj);
      node.dispatchEvent(new CustomEvent(name, options));
    }
  }

  var rxnID = 0;
  function processRxns(node, type){
    var rxn = node.rxns[type];
    var queue = rxn.queue;
    for (let z in queue) {
      queue[z].fn.call(node);
      if (rxn.singleton || !queue[z].recurring) delete queue[z];
    }
    rxn.fired = true;
  }

  /**
   * @name createClass
   * @param {any} options
   * @note 
   */
  function createClass(options = {}){
    var klass;
    klass = class extends (options.native ? Object.getPrototypeOf(document.createElement(options.native)).constructor : HTMLElement) {
      constructor () {
        super();
        if (!this.rxns) this.rxns = {
          ready: { queue: {}, singleton: true },
          firstpaint: { queue: {}, singleton: true },
          render: { queue: {} }
        };
        onConstruct(this);
        new Promise(resolve => onReady(this, resolve)).then(() => processRxns(this, 'ready'))
      }
      connectedCallback () {
        onConnect(this);
        if (!this.rxns.firstpaint.frame) {
          this.rxns.firstpaint.frame = requestAnimationFrame(() => processRxns(this, 'firstpaint'));
        }
      }
      
      rxn (type, fn, recurring){
        var rxn = this.rxns[type];
        if (rxn.singleton && rxn.fired) fn.call(this);
        else {
          rxn.queue[rxnID++] = { fn: fn, recurring: recurring };
          return rxnID;
        }
      }
      
      cancelRxn (type, id){
        delete this.rxns[type].queue[id];
      }
    };

    klass.options = {
      extensions: {},
      pseudos: {}
    };
    
    klass.getOptions = function(name){
      return this.options[name] || (this.options[name] = Object.assign({}, Object.getPrototypeOf(this).options ? Object.getPrototypeOf(this).options[name] : {}));
    }

    klass.extensions = function extensions(...extensions){
      var exts = this.getOptions('extensions');
      return extensions.reduce((current, extension) => {
        var mixin;
        var extended = current;
        if (!exts[extension.name]) {
          if (typeof extension == 'string') {
            mixin = xtag.extensions[extension].mixin;
          }
          else {
            mixin = extension.mixin;
            exts[extension.name] = extension;
          }
          if (mixin) {
            extended = mixin(current);
            onParse(extended);
          }
        }
        return extended;
      }, this);
    }

    klass.as = function(tag){
      return createClass({
        native: tag
      });
    }

    return klass.extensions('attr', 'event', 'template');
  }

  /**
   * @note future enhancements could be to allow a prevent method so that a parameter
   *  ** could be loaded with the XTagElement.
   *  ** This behavior is native already to the library, but a stronger API for loading 
   *  ** is already needed for Apple compatibility. 
   *  ** The behavior could be hooked into the build behavior for the xtag object and help
   *  ** in automagically ensuring that the xtag object will be exposed to the globals object.
   */
  XTagElement = createClass();

  function pseudoWrap(pseudo, args, fn, detail){
    return function(){
      var _pseudo = { fn: fn, args: args, detail: detail };
      var output = pseudo.onInvoke(this, _pseudo, ...arguments);
      if (output === null || output === false) return output;
      return _pseudo.fn.apply(this, output instanceof Array ? output : arguments);
    };
  }

  function onParse(target){
    var processedProps = {};
    var descriptors = getDescriptors(target);
    var extensions = target.getOptions('extensions');
    var processed = target._processedExtensions = new Map();   
    for (let z in descriptors) {
      let matches = [];
      let property;
      let extension;
      let extensionArgs = [];
      let descriptor = descriptors[z];
      let pseudos = target._pseudos || xtag.pseudos;
      z.replace(regexParseExt, function(){ matches.unshift(arguments);  });
      matches.forEach(a => function(match, prop, dots, name, args){
        property = prop || property;
        if (args) var _args = args.split(regexCommaArgs);
        if (dots == '::') {
          extensionArgs = _args || [];
          extension = extensions[name] || xtag.extensions[name];
          if (!processed.get(extension)) processed.set(extension, []);
        }
        else if (!prop){
          let pseudo = pseudos[name];
          if (pseudo) {
            for (let y in descriptor) {
              let fn = descriptor[y];
              if (typeof fn == 'function' && pseudo.onInvoke) {
                fn = descriptor[y] = pseudoWrap(pseudo, _args, fn);
                if (pseudo.onParse) pseudo.onParse(target, property, _args, fn);
              }
            }
          }
        }
      }.apply(null, a));
      let attachProperty;
      if (extension) {
        processed.get(extension).push([property, extensionArgs, descriptor]);
        if (extension.onParse) attachProperty = extension.onParse(target, property, extensionArgs, descriptor, z);
      }
      if (!property) delete target.prototype[z];
      else if (attachProperty !== false) {
        let prop = processedProps[property] || (processedProps[property] = {});
        for (let y in descriptor) prop[y] = descriptor[y];
      }
    }
    for (let ext of processed.keys()) {
      if (ext.onCompiled) ext.onCompiled(target, processedProps);
    }
    Object.defineProperties(target.prototype, processedProps);
  }

  function onConstruct (target){
    var processed = target.constructor._processedExtensions;
    for (let [ext, items] of processed) {
      if (ext.onConstruct) items.forEach(item => ext.onConstruct(target, ...item))
    }
  }

  function onReady (target, resolve){
    var processed = target.constructor._processedExtensions;
    for (let [ext, items] of processed) {
      if (ext.onReady) Promise.all(items.map(item => {
        return new Promise(resolve => ext.onReady(target, resolve, ...item))
      })).then(() => resolve())
    }
  }

  function onConnect (target){
    var processed = target.constructor._processedExtensions;
    for (let [ext, items] of processed) {
      if (ext.onConnect) items.forEach(item => ext.onConnect(target, ...item))
    }
  }

  function getDescriptors(target){
    var descriptors = {};
    var proto = target.prototype;
    Object.getOwnPropertyNames(proto).forEach(key => {
      descriptors[key] = Object.getOwnPropertyDescriptor(proto, key);
    });
    return descriptors;
  }

  /** 
   * @note: Apple products don't read the xtag object 
   */
  if (typeof define === 'function' && define.amd) {
    define(xtag);
    define(XTagElement);
  }
  else if (typeof module !== 'undefined' && module.exports) {
    module.exports = { xtag: xtag, XTagElement: XTagElement };
  }
  else {
    window.xtag = xtag;
    window.XTagElement = XTagElement;
  }

})();