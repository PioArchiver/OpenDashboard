(function () {

    /*** Variables ***/
    var win = window,
        doc = document,
        attrProto = {
            setAttribute: Element.prototype.setAttribute,
            removeAttribute: Element.prototype.removeAttribute
        },
        hasShadow = Element.prototype.createShadowRoot,
        container = doc.createElement('div'),
        noop = function () { },
        trueop = function () { return true; },
        regexReplaceCommas = /,/g,
        regexCamelToDash = /([a-z])([A-Z])/g,
        regexPseudoParens = /\(|\)/g,
        regexPseudoCapture = /:(\w+)\u276A(.+?(?=\u276B))|:(\w+)/g,
        regexDigits = /(\d+)/g,
        keypseudo = { action: function (pseudo, event) { return pseudo.value.match(regexDigits).indexOf(String(event.keyCode)) > -1 == (pseudo.name == 'keypass') || null; } },
        /*
          - The prefix object generated here is added to the xtag object as xtag.prefix later in the code
          - Prefix provides a variety of prefix variations for the browser in which your code is running
          - The 4 variations of prefix are as follows:
            * prefix.dom: the correct prefix case and form when used on DOM elements/style properties
            * prefix.lowercase: a lowercase version of the prefix for use in various user-code situations
            * prefix.css: the lowercase, dashed version of the prefix
            * prefix.js: addresses prefixed APIs present in global and non-Element contexts
        */
        prefix = (function () {
            var keys = Object.keys(window).join();
            var pre = ((keys.match(/,(ms)/) || keys.match(/,(moz)/) || keys.match(/,(O)/)) || [null, 'webkit'])[1].toLowerCase();
            return {
                dom: pre == 'ms' ? 'MS' : pre,
                lowercase: pre,
                css: '-' + pre + '-',
                js: pre == 'ms' ? pre : pre.charAt(0).toUpperCase() + pre.substring(1)
            };
        })(),
        matchSelector = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype[prefix.lowercase + 'MatchesSelector'];

    /*** Functions ***/
        // Utilities
    /*
      This is an enhanced typeof check for all types of objects. Where typeof would normaly return
      'object' for many common DOM objects (like NodeLists and HTMLCollections).
      - For example: typeOf(document.children) will correctly return 'htmlcollection'
    */
    var typeCache = {},
        typeString = typeCache.toString,
        typeRegexp = /\s([a-zA-Z]+)/;
    function typeOf(obj) {
        var type = typeString.call(obj);
        return typeCache[type] || (typeCache[type] = type.match(typeRegexp)[1].toLowerCase());
    }

    function getDataAttr(_node, _attr, _setattr) {
        var _dat = _node.hasAttribute("data-" + _attr),
            _att = _node.hasAttribute(_attr),
            _response = false,
            _attrtype = null;
        // find the data attribute if present
        _attrtype = _dat === true ? (_response = _node.getAttribute("data-" + _attr), "data-" + _attr) : _att === true ? (_response = _node.getAttribute(_attr), _attr) : _attr;
        // check if _setattr is defined
        _setattr !== undefined ? _node.setAttribute(_attrtype, _node.getAttribute(_attrtype)) : false;
        return _response;
    }

    function morphClass(to, klass) {
        switch (to) {
            case "object":
                var klasskeys = Object.getOwnPropertyNames(klass),
                    kobj = { };
                for (var x = 0; x < klasskeys.length; x++) { kobj[klasskeys[x]] = klass[klasskeys[x]]; }
                return kobj;
        }
    }

    function getKeyNames(keys, obj, excludes) {
        var r = {};
        if (keys === "*") {
            var _keys = Object.keys(obj), _rex = {};
            for (var c = 0; c < excludes.length; c++) { for (var k = 0; k < _keys.length; k++) { if (_keys[k] !== excludes[c]) { _rex[_keys[k]] = obj[_keys[k]]; } } }
            return _rex;
        }
        for (var i = 0; i < keys.length; i++) { r[keys[i]] = obj[keys[i]]; }
        return r;
    }

    function getClassKeys(obj, excludes) {
        let proto = xtag.typeOf(obj) === "function" ? obj.prototype : obj,
            keys = Object.getOwnPropertyNames(proto),
            _class = {},
            objklass = morphClass("object", proto);
        for (var i = 0; i < (excludes||[]).length; i++) {
            var key = excludes[i];
            objklass[key] ? delete objklass[key] : false;
        }
        return objklass;
    }

    function mergeOne(source, key, current) {
        var type = typeOf(current);
        if (type == 'object' && typeOf(source[key]) == 'object') xtag.merge(source[key], current);
        else source[key] = clone(current, type);
        return source;
    }

    function clone(item, type) {
        var fn = clone[type || typeOf(item)];
        return fn ? fn(item) : item;
    };
        clone.object = function (src) {
            var obj = {};
            for (var key in src) obj[key] = clone(src[key]);
            return obj;
        };
        clone.array = function (src) {
            var i = src.length, array = new Array(i);
            while (i--) array[i] = clone(src[i]);
            return array;
        };

    /*
      The toArray() method allows for conversion of any object to a true array. For types that
      cannot be converted to an array, the method returns a 1 item array containing the passed-in object.
    */
    var unsliceable = { 'undefined': 1, 'null': 1, 'number': 1, 'boolean': 1, 'string': 1, 'function': 1 };
    function toArray(obj) { return unsliceable[typeOf(obj)] ? [obj] : Array.prototype.slice.call(obj, 0); }

    // DOM
    var str = '';
    function query(element, selector) { return (selector || str).length ? toArray(element.querySelectorAll(selector)) : []; }

    // Pseudos 
    function parsePseudo(fn) { fn(); }

    // Attributes
    function setElemAttr(elem, key, obj) {
        obj[key].configurable = true;
        obj[key].enumerable = true;
        Object.defineProperty(elem.prototype, key, obj[key]);
        return true;
    }

    // Mixins 
    function writeMixin(proto, mix) {
        var _proto = proto.prototype;

        // get methods
        var methods = mix.prototype.methods ? mix.prototype.methods() : {};

        // get events
        var events = mix.prototype.events ? mix.prototype.events() : {};

        // loop through retrieved objects 
        for (var _key in methods) { 
            var psdo = xtag.applyPseudos(_key, methods[_key], pseudoArray, methods[_key]), 
                obj = {}, 
                keymatch = _key.match(/^[\w\-]+/g);

            obj[keymatch[0]] = methods[_key]; 

            _key.match(regexPseudoCapture) !== null ? _proto.pseudoCaptures = _key.match(regexPseudoCapture) : null; 

            var pmet = null;
            if (_pseudos_[_key]) { 
                pmet = _pseudos_[_key]; 
                writeProperty(keymatch[0], _proto, pmet); 
            } 
            else if (methods[_key]) { 
                pmet = methods[_key]; 
                writeProperty(keymatch[0], _proto, pmet, _proto); 
            }
                 
        } 
        for (var ekey in events) { 
            var _psdo = xtag.applyPseudos(_key, methods[_key], pseudoArray, proto); 
            xtag.addEvents(proto, events); 
            _key.match(regexPseudoCapture) !== null ? _proto.pseudoCaptures = _key.match(regexPseudoCapture) : null; 
        } 
        return true;
    }
    function addMixins(mixinClass, names, mixins) {
        mixinClass = mixinClass === undefined ? class { } : mixinClass;
        if (names[0] === "self") {
            writeMixin(mixinClass, mixins.self); return true;
        }
        for (var z = 0; z < names.length; z++) {
            var name = names[z],
                _defmethod = mixins[name].prototype.methods(); 

            name === "typed" ? (
                writeMixin(mixinClass, mixins[name]), 
                setElemAttr(mixinClass, "type", { 
                    type: { 
                        set: function SetType(val) { 
                            if (!val) { throw val + " Type event callback error."; } 
                            xtag.addEvent(this, this.type, val); 
                            xtag.fireEvent(this, this.type, { detail: {} }); 
                            this.setAttribute("type", this.type); 
                        }, 
                        get: function GetType() { return this.getAttribute("type"); } 
                    }
                })
            ) : null;

            name === "themed" ? (
                writeMixin(mixinClass, mixins[name]),
                setElemAttr(mixinClass, "theme", { 
                    theme: { 
                        set: function SetType(val) { 
                            if (!val) { throw val + " Theme event callback error."; } 
                            xtag.addEvent(this, this.theme, val); 
                            xtag.fireEvent(this, this.theme, { 
                                detail: {} 
                            }); 
                            this.setAttribute("theme", this.theme); 
                        }, 
                        get: function GetType() { 
                            return this.getAttribute("theme"); 
                        } 
                    } 
                })
            ) : writeMixin(mixinClass, mixins[name]);
 
        }
        return true; 
    }
    function attrMixins(mix) {
        var _mixins = xtag.mixins, 
            _added = mix.prototype.mixins ? mix.prototype.mixins() : false, 
            _attrs = {}, 
            attrs = {}; 
        for (var k = 0; k < _added.length; k++) {
            var key = _added[k];
            attrs = _mixins[key].prototype.attrs ? _mixins[key].prototype.attrs() : false;
            xtag.merge(_attrs, attrs);
        }
        var test = Object.keys(_attrs).length > 0 ? _attrs : false;
        return test;
    }

    // Events 
    function delegateAction(pseudo, event) {
        var match,
            target = event.target,
            root = event.currentTarget;
        while (!match && target && target != root) {
            if (target.tagName && matchSelector.call(target, pseudo.value)) match = target;
            target = target.parentNode;
        }
        if (!match && root.tagName && matchSelector.call(root, pseudo.value)) match = root;
        return match ? pseudo.listener = pseudo.listener.bind(match) : null;
    }

    // More Utils
    function touchFilter(event) { return event.button === 0; }

    function writeProperty(key, event, base, desc) {
        if (desc) { 
            try {
                Object.defineProperty(event, key, {
                    enumerable: true,
                    value: base
                });
            }
            catch (e) { /**/ }
        } 
        else if (base) { 
            try {
                base.onAdd.name === "noop" ? null : base.onAdd(base);
                Object.defineProperty(event, key, {
                    enumerable: true,
                    value: function ApplyPseudoMethodChainEvent() {
                        base.action.apply(this, [base, this]);
                        base.listener.apply(this, [base, this]);
                    }
                });
            }
            catch (e) { /* */ }
        }
    }

    var skipProps = {};
    for (var z in doc.createEvent('CustomEvent')) { skipProps[z] = 1; }
    function inheritEvent(event, base) {
        var desc = Object.getOwnPropertyDescriptor(event, 'target');
        for (var z in base) {
            if (!skipProps[z]) { writeProperty(z, event, base, desc); }
        }
        event.baseEvent = base;
    }

    var unwrapComment = /\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//;
    function parseMultiline(fn) {
        return typeof fn == 'function' ? unwrapComment.exec(fn.toString())[1] : fn;
    }

    /*** X-Tag Object Definition ***/
    var attributes = {}, pseudoArray = [], _pseudos_ = {};
    var xtag = {
        defaultOptions: {
            pseudos: [ ],
            mixins: [ ],
            methods: { },
            events: { },
            accessors: { },
            lifecycle: { },
            attributes: { },
            prototype: {
                xtag: { get: function () { return this.__xtag__ ? this.__xtag__ : (this.__xtag__ = { data: {} }); } }
            }
        },
        register: function Register (name, _this) {
            let _name = null,
                _proto = getClassKeys( _this, 
                    ["attrs",
                    "mixins",
                    "constructor",
                    "events",
                    "created",
                    "inserted",
                    "removed",
                    "attributeChanged",
                    "lifecycle",
                    "isHTML"] );

            if (typeof name === 'string') { _name = name; }
            else { throw 'First argument must be a Custom Element string name'; }

            var lifecycle = _this.prototype.lifecycle === undefined ? { 
                created: _this.prototype.created, 
                inserted: _this.prototype.inserted, 
                removed: _this.prototype.removed, 
                attrributeChanged: _this.prototype.attrributeChanged 
            } : _this.prototype.lifecycle();

            // Get the Events and attrs 
            var _hasAttributes = _this.prototype.attrs === undefined ? {} : _this.prototype.attrs(), 
                ckeys = Object.keys(_hasAttributes); 

            // Create the HTML Element Prototype Mixin 
            class XTagElement extends _this { 
                constructor() { 
                    super(); 
                    var hasEvents = _this.prototype.events === undefined ? false : _this.prototype.events(); 
                        xtag.addEvents(this, hasEvents); 
                    (lifecycle.created || noop).apply(this); 

                } 

                // Dashing is for the Dashing Components Build Package 
                connectedCallback(Dashing) { 
                    (lifecycle.inserted || noop).apply(this);
                    this.type !== false ? this.type = this[this.type] : false;
                } 

                // Dashing is for the Dashing Components Build Package
                disconnectedCallback(Dashing) {
                    (lifecycle.removed || noop).apply(this);
                } 

                attributeChangedCallback() {
                    // 
                } 
                get xtag() { 
                    return this.__xtag__ ? this.__xtag__ : (this.__xtag__ = { data: {} }); 
                } 
            } 

            // Get _proto keys. 
            var get_protokeys = Object.keys(_proto), 
                _method = {}; 
            if (get_protokeys.length > 0) { 
                get_protokeys.forEach(function Get_Protokeys(item) { _method[item] = _this.prototype[item]; });
                xtag.mixins.self = class { 
                    methods() { return _method; } 
                }; 
            } 

            // Create the mixins.
            var mixins = _this.prototype.mixins === undefined ? [] : _this.prototype.mixins(); 
                addMixins(XTagElement, mixins, xtag.mixins); 
                addMixins(XTagElement, ["self"], xtag.mixins); 

            // Create Attribute getter/setters. 
            var _attrMixins = attrMixins(_this); 
                _attrMixins === false ? false : xtag.merge(_hasAttributes, _attrMixins); 
                ckeys = Object.keys(_hasAttributes); 

            // Loop through ckeys 
            for (var i = 0; i < ckeys.length; i++) { 
                var key = ckeys[i]; 
                _hasAttributes !== false ? setElemAttr(XTagElement, key, _hasAttributes) : XTagElement; 
            } 
            return window.customElements.define(_name, XTagElement); 
        },

        /*** Exposed Variables ***/
        mixins: {},

        prefix: prefix,

        captureEvents: { focus: 1, blur: 1, scroll: 1, DOMMouseScroll: 1 },

        customEvents: {
            animationstart: {
                attach: [prefix.dom + 'AnimationStart']
            },
            animationend: {
                attach: [prefix.dom + 'AnimationEnd']
            },
            transitionend: {
                attach: [prefix.dom + 'TransitionEnd']
            },
            move: {
                attach: ['pointermove']
            },
            enter: {
                attach: ['pointerenter']
            },
            leave: {
                attach: ['pointerleave']
            },
            scrollwheel: {
                attach: ['DOMMouseScroll', 'mousewheel'],
                condition: function (event) {
                    event.delta = event.wheelDelta ? event.wheelDelta / 40 : Math.round(event.detail / 3.5 * -1);
                    return true;
                }
            },
            tap: {
                attach: ['pointerdown', 'pointerup'],
                condition: function (event, custom) {
                    if (event.type == 'pointerdown') {
                        custom.startX = event.clientX;
                        custom.startY = event.clientY;
                    }
                    else if (event.button === 0 &&
                        Math.abs(custom.startX - event.clientX) < 10 &&
                        Math.abs(custom.startY - event.clientY) < 10) return true;
                }
            },
            tapstart: {
                attach: ['pointerdown'],
                condition: touchFilter
            },
            tapend: {
                attach: ['pointerup'],
                condition: touchFilter
            },
            tapmove: {
                attach: ['pointerdown'],
                condition: function (event, custom) {
                    if (event.type == 'pointerdown') {
                        var listener = custom.listener.bind(this);
                        if (!custom.tapmoveListeners) custom.tapmoveListeners = xtag.addEvents(document, {
                            pointermove: listener,
                            pointerup: listener,
                            pointercancel: listener
                        });
                    }
                    else if (event.type == 'pointerup' || event.type == 'pointercancel') {
                        xtag.removeEvents(document, custom.tapmoveListeners);
                        custom.tapmoveListeners = null;
                    }
                    return true;
                }
            },
            taphold: {
                attach: ['pointerdown', 'pointerup'],
                condition: function (event, custom) {
                    if (event.type == 'pointerdown') {
                        (custom.pointers = custom.pointers || {})[event.pointerId] = setTimeout(
                            xtag.fireEvent.bind(null, this, 'taphold'),
                            custom.duration || 1000
                        );
                    }
                    else if (event.type == 'pointerup') {
                        if (custom.pointers) {
                            clearTimeout(custom.pointers[event.pointerId]);
                            delete custom.pointers[event.pointerId];
                        }
                    }
                    else return true;
                }
            }
        },

        pseudos: {
            keypass: keypseudo,
            keyfail: keypseudo,
            delegate: {
                action: delegateAction
            },
            preventable: { action: function (pseudo, event) { return !event.defaultPrevented; } },
            duration: {
                onAdd: function (pseudo) {
                    pseudo.source.duration = Number(pseudo.value);
                }
            },
            capture: {
                onCompiled: function (fn, pseudo) { if (pseudo.source) { pseudo.source.capture = true; } }
            }
        },

        /* UTILITIES */
        clone: clone,

        typeOf: typeOf,

        toArray: toArray,

        wrap: function (original, fn) {
            return function () {
                var output = original.apply(this, arguments);
                fn.apply(this, arguments);
                return output;
            };
        },

        /*
          Recursively merges one object with another. The first argument is the destination object,
          all other objects passed in as arguments are merged from right to left, conflicts are overwritten
        */
        merge: function (source, k, v) {
            if (typeOf(k) == 'string') { return mergeOne(source, k, v); }
            for (var i = 1, l = arguments.length; i < l; i++) {
                var object = arguments[i];
                for (var key in object) mergeOne(source, key, object[key]);
            }
            return source;
        },

        /*
          ----- This should be simplified! -----
          Generates a random ID string
        */
        uid: function () { return Math.random().toString(36).substr(2, 10); },

        /* DOM */
        query: query,

        skipTransition: function (element, fn, bind) {
            var prop = prefix.js + 'TransitionProperty';
            element.style[prop] = element.style.transitionProperty = 'none';
            var callback = fn ? fn.call(bind || element) : null;
            return xtag.skipFrame(function () {
                element.style[prop] = element.style.transitionProperty = '';
                if (callback) callback.call(bind || element);
            });
        },

        requestFrame: (function () {
            var raf = win.requestAnimationFrame ||
                win[prefix.lowercase + 'RequestAnimationFrame'] ||
                function (fn) { return win.setTimeout(fn, 20); };
            return function (fn) { return raf(fn); };
        })(),

        cancelFrame: (function () {
            var cancel = win.cancelAnimationFrame ||
                win[prefix.lowercase + 'CancelAnimationFrame'] ||
                win.clearTimeout;
            return function (id) { return cancel(id); };
        })(),

        skipFrame: function (fn) {
            var id = xtag.requestFrame(function () { id = xtag.requestFrame(fn); });
            return id;
        },

        matchSelector: function (element, selector) { return matchSelector.call(element, selector); },

        set: function (element, method, value) {
            element[method] = value;
            console.log("X-TAG SET");
            if (window.CustomElements) { CustomElements.upgradeAll(element); }
        },

        innerHTML: function (el, html) { xtag.set(el, 'innerHTML', html); },

        hasClass: function (element, klass) {
            return element.className.split(' ').indexOf(klass.trim()) > -1;
        },

        addClass: function (element, klass) {
            var list = element.className.trim().split(' ');
            klass.trim().split(' ').forEach(function (name) {
                if (!~list.indexOf(name)) list.push(name);
            });
            element.className = list.join(' ').trim();
            return element;
        },

        removeClass: function RemoveClass(element, klass) {
            var classes = klass.trim().split(' ');
            element.className = element.className.trim().split(' ').filter(function (name) {
                return name && !~classes.indexOf(name);
            }).join(' ');
            return element;
        },

        toggleClass: function ToggleClass(element, klass) {
            return xtag[xtag.hasClass(element, klass) ? 'removeClass' : 'addClass'].call(null, element, klass);
        },

        /* Runs a query on only the children of an element */
        queryChildren: function QueryChildren(element, selector) {
            var id = element.id,
                attr = '#' + (element.id = id || 'x_' + xtag.uid()) + ' > ',
                parent = element.parentNode || !container.appendChild(element); 
            selector = attr + (selector + '').replace(regexReplaceCommas, ',' + attr);
            var result = element.parentNode.querySelectorAll(selector);
            if (!id) { element.removeAttribute('id'); }
            if (!parent) { container.removeChild(element); }
            return toArray(result);
        },

        /*
          Creates a document fragment with the content passed in - content can be
          a string of HTML, an element, or an array/collection of elements
        */
        createFragment: function CreateFragment(content) {
            var template = document.createElement('template');
            if (content) {
                if (content.nodeName) toArray(arguments).forEach(function (e) {
                    template.content.appendChild(e);
                });
                else template.innerHTML = parseMultiline(content);
            }
            // This is causing the following bug [InvalidStateError: An attempt was made to use an object that is not, or is no longer, usable]
            return document.importNode( template.content, true);
        },

        /*
          Removes an element from the DOM for more performant node manipulation. The element
          is placed back into the DOM at the place it was taken from.
        */
        manipulate: function Manipulate(element, fn) {
            var next = element.nextSibling,
                parent = element.parentNode,
                returned = fn.call(element) || element;
            if (next) { parent.insertBefore(returned, next); }
            else { parent.appendChild(returned); }
        },

        /* PSEUDOS */
        applyPseudos: function ApplyPseudos(key, fn, target, source) {
            var listener = fn, pseudos = {};
            if (key.match(':')) {
                var matches = [],
                    valueFlag = 0;
                key.replace(regexPseudoParens, function (match) {
                    if (match == '(') return ++valueFlag == 1 ? '\u276A' : '(';
                    return !--valueFlag ? '\u276B' : ')';
                }).replace(regexPseudoCapture, function (z, name, value, solo) {
                    matches.push([name || solo, value]);
                });
                var i = matches.length;
                while (i--) parsePseudo(function () { 
                    var name = matches[i][0], 
                        value = matches[i][1]; 
                    if (!xtag.pseudos[name]) { throw "pseudo not found: " + name + " " + value; }  
                        value = (value === '' || typeof value == 'undefined') ? null : value; 
                    var pseudo = pseudos[i] = Object.create(xtag.pseudos[name]); 
                        pseudo.key = key; 
                        pseudo.name = name; 
                        pseudo.value = value; 
                        pseudo['arguments'] = (value || '').split(','); 
                        pseudo.action = pseudo.action || trueop; 
                        pseudo.source = source; 
                        pseudo.onAdd = pseudo.onAdd || noop; 
                        pseudo.onRemove = pseudo.onRemove || noop; 
                    var original = pseudo.listener = listener; 
                        listener = function () { 
                        var output = pseudo.action.apply(this, [pseudo].concat(toArray(arguments))); 
                        if (output === null || output === false) return output; 
                        output = pseudo.listener.apply(this, arguments); 
                        pseudo.listener = original; 
                        return output; 
                    };
                    if (target === undefined) { console.log("HI"); pseudo.onAdd.call(fn, pseudo); }
                    else { _pseudos_[key] = pseudo; target.push(pseudo); }
                });
            }
            for (var z in pseudos) {
                if (pseudos[z].onCompiled) { listener = pseudos[z].onCompiled(listener, pseudos[z]) || listener; }
            }
            return listener;
        },

        removePseudos: function (target, pseudos) {
            pseudos.forEach(function (obj) {
                obj.onRemove.call(target, obj);
            });
        },

        /* Events */
        parseEvent: function (type, fn) {
            var pseudos = type.split(':'),
                key = pseudos.shift(),
                custom = xtag.customEvents[key],
                event = xtag.merge({
                    type: key,
                    stack: noop,
                    condition: trueop,
                    capture: xtag.captureEvents[key],
                    attach: [],
                    _attach: [],
                    pseudos: '',
                    _pseudos: [],
                    onAdd: noop,
                    onRemove: noop
                }, custom || {});
            event.attach = toArray(event.base || event.attach);
            event.chain = key + (event.pseudos.length ? ':' + event.pseudos : '') + (pseudos.length ? ':' + pseudos.join(':') : '');
            var stack = xtag.applyPseudos(event.chain, fn, event._pseudos, event);
            event.stack = function (e) {
                e.currentTarget = e.currentTarget || this;
                var detail = e.detail || {};
                if (!detail.__stack__) return stack.apply(this, arguments);
                else if (detail.__stack__ == stack) {
                    e.stopPropagation();
                    e.cancelBubble = true;
                    return stack.apply(this, arguments);
                }
            };
            event.listener = function (e) {
                var args = toArray(arguments),
                    output = event.condition.apply(this, args.concat([event]));
                if (!output) return output;
                return event.stack.apply(this, args);
            };
            event.attach.forEach(function (name) {
                event._attach.push(xtag.parseEvent(name, event.listener));
            });
            return event;
        },

        addEvent: function (element, type, fn, capture) { 
            var event = typeof fn == 'function' ? xtag.parseEvent(type, fn) : fn;
            event._pseudos.forEach(function (obj) {
                obj.onAdd.call(element, obj);
            });
            event._attach.forEach(function (obj) {
                xtag.addEvent(element, obj.type, obj);
            });
            event.onAdd.call(element, event, event.listener);
            element.addEventListener(event.type, event.stack, capture || event.capture);
            return event;
        },

        addEvents: function (element, obj) {
            var events = {}; 
            for (var z in obj) { events[z] = xtag.addEvent(element, z, obj[z]); }
            return events;
        },

        removeEvent: function (element, type, event) {
            event = event || type;
            event.onRemove.call(element, event, event.listener);
            xtag.removePseudos(element, event._pseudos);
            event._attach.forEach(function (obj) {
                xtag.removeEvent(element, obj);
            });
            element.removeEventListener(event.type, event.stack);
        },

        removeEvents: function (element, obj) {
            for (var z in obj) xtag.removeEvent(element, obj[z]);
        },

        fireEvent: function (element, type, options) {
            var event = doc.createEvent('CustomEvent');
            options = options || {};
            event.initCustomEvent(type,
                options.bubbles !== false,
                options.cancelable !== false,
                options.detail
            );
            if (options.baseEvent) inheritEvent(event, options.baseEvent);
            element.dispatchEvent(event);
        }

    };
    if (typeof define === 'function' && define.amd) { define(xtag); }
    else if (typeof module !== 'undefined' && module.exports) { module.exports = xtag; }
    else { win.xtag = xtag; }
    doc.addEventListener('WebComponentsReady', function __WebComponentsReady__() { xtag.fireEvent(doc.body, 'DOMComponentsLoaded'); });
})();

// XTAG MIXINS, EXTENSIONS, PLUGINS, and PSEUDOS
// TRANSITIONS
(function () {
})();

// OUTER
(function () {
    var events = {},
        elements = {},
        observers = {};

    function outerNodes(element, event) {
        var type = event.type,
            el = elements[type] || (elements[type] = []),
            ev = events[type] || (events[type] = []),
            i = el.indexOf(element);
        if (i == -1) {
            el.push(element);
            ev.push(event);
        }
        else {
            el.splice(i, 1);
            ev.splice(i, 1);
        }
        return el;
    }

    xtag.pseudos.outer = { 
        action: function (pseudo, e) {
            if (this == e.target || this.contains && this.contains(e.target)) return null;
        },
        onRemove: function (pseudo) {
            if (!outerNodes(this, pseudo.source).length) {
                xtag.removeEvent(document, observers[pseudo.source.type]);
            }
        },
        onAdd: function (pseudo) {
            // Enhancements use psuedo arguments to a target to add an event to.
            outerNodes(this, pseudo.source);
            var element = this,
                type = pseudo.source.type;
            if (!observers[type]) {
                observers[type] = xtag.addEvent(document, type, function (e) {
                    elements[type].forEach(function (node, i) { 
                        if (node == e.target || node.contains(e.target)) { return; } 
                        events[type][i].stack.call(node, e); 
                    }); 
                }); 
            } 
        } 
    }; 
})(); 

// PLOAD
(function () {
    xtag.pseudos.pload = {
        onAdd: function (n) {
            // to do;
        },
        action: function (n) {
            this.plugins === undefined ? this.plugins = {} : true;
            n.arguments.forEach((c) => { this.plugins[c] = this.querySelector(`x-page[plugin-title="${c}"]`); });
        },
        onRemove: function (n) { console.log("removed"); }
    };

})();
