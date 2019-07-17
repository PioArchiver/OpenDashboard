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
        noop = function () { return false; },
        trueop = function () { return true; },
        regexReplaceCommas = /,/g,
        regexCamelToDash = /([a-z])([A-Z])/g,
        regexPseudoParens = /\(|\)/g,
        regexPseudoCapture = /:(\w+)\u276A(.+?(?=\u276B))|:(\w+)/g,
        regexDigits = /(\d+)/g,
        keypseudo = {
            action: function psuedoAction(pseudo, event) {
                var pmatched = pseudo.value.match(regexDigits),
                    psuedoindexed = pmatched.indexOf(String(event.keyCode));
                return psuedoindexed > -1 == (pseudo.name == 'keypass') || null;
            }
        },
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
            var pre = ((keys.match(/,(ms)/) ||
                keys.match(/,(moz)/) || keys.match(/,(O)/)) ||
                [null, 'webkit'])[1].toLowerCase();
            return {
                dom: pre == 'ms' ? 'MS' : pre,
                lowercase: pre,
                css: '-' + pre + '-',
                js: pre == 'ms' ? pre : pre.charAt(0).toUpperCase() + pre.substring(1)
            };
        })(),
        matchSelector = Element.prototype.matches ||
            Element.prototype.matchesSelector ||
            Element.prototype[prefix.lowercase + 'MatchesSelector'];

    function convertToCamels(name) {
        return name.replace(/\-\w/g, function ceNameRexex(matched) {
            return matched.replace("-", "").toUpperCase();
        });
    }

    /* Compile Attributes */
    function CompileAttrs(definition, attrs) {

        Object.create(definition, attrs);
        for (var attr in attrs) {
            xtag.applyPseudos(attr, attrs[attr], undefined, definition);
        }

        return definition;
    }
    /* Parse Attributes */
    function ParseAttrs(attrs) {
        attrs = attrs();
        let obj = {};
        for (var attr in attrs) {
            obj[attr] = attrs[attr];
        }
        return obj;
    }
    /* CompileMethods */
    function CompileMethods(definition, methods) {
        Object.create(definition, methods);
        for (var method in methods) {
            definition.prototype[method] = methods[method];
            xtag.applyPseudos(method, methods[method], undefined, definition);
        }

        return true;
    }
    /* ParseMethods */
    function ParseMethods(methods) {
        methods = methods();
        let obj = {};
        for (var method in methods) { obj[method] = methods[method]; }
        return obj;
    }
    /* ParseEvents */
    function ParseEvents(elem, eventees) {
        eventees = eventees();
        xtag.addEvents(elem, eventees);
    }
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
    function morphClass(to, klass) {
        switch (to) {
            case "object":
                var klasskeys = Object.getOwnPropertyNames(klass),
                    kobj = {};
                for (var x = 0; x < klasskeys.length; x++) {
                    kobj[klasskeys[x]] = klass[klasskeys[x]];
                }
                return kobj;
        }
    }
    function excludeClassKeys(obj, excludes) {
        let proto = xtag.typeOf(obj) === "function" ? obj.prototype : obj,
            keys = Object.getOwnPropertyNames(proto),
            _class = {},
            objklass = morphClass("object", proto);
        for (var i = 0; i < (excludes || []).length; i++) {
            var key = excludes[i];
            objklass[key] ? delete objklass[key] : false;
        }
        return objklass;
    }
    function mergeOne(source, key, current) {
        var type = typeOf(current);
        if (type == 'object' && typeOf(source[key]) == 'object') { xtag.merge(source[key], current); }
        else { source[key] = clone(current, type); }
        return source;
    }
    function clone(item, type) {
        var fn = clone[type || typeOf(item)];
        return fn ? fn(item) : item;
    };
    clone.object = function (src) {
        var obj = {};
        for (var key in src) {
            obj[key] = clone(src[key]);
        }
        return obj;
    };
    clone.array = function (src) {
        var i = src.length,
            array = new Array(i);
        while (i--) {
            array[i] = clone(src[i]);
        }
        return array;
    };
    /*
      The toArray() method allows for conversion of any object to a true array. For types that
      cannot be converted to an array, the method returns a 1 item array containing the passed-in object.
    */
    var unsliceable = { 'undefined': 1, 'null': 1, 'number': 1, 'boolean': 1, 'string': 1, 'function': 1 };
    function toArray(obj) {
        return unsliceable[typeOf(obj)] ? [obj] :
            Array.prototype.slice.call(obj, 0);
    }
    // DOM
    function query(element, selector) {
        return (selector || "").length ?
            toArray(element.querySelectorAll(selector)) : [];
    }
    // Pseudos 
    function parsePseudo(fn) { fn(); }
    // Events 
    function delegateAction(pseudo, event) {
        var match,
            target = event.target,
            root = event.currentTarget;
        while (!match && target && target != root) {
            if (target.tagName && matchSelector.call(target, pseudo.value)) {
                match = target;
            }
            target = target.parentNode;
        }
        if (!match && root.tagName && matchSelector.call(root, pseudo.value)) match = root;
        return match ? pseudo.listener = pseudo.listener.bind(match) : null;
    }
    function touchFilter(event) { return event.button === 0; }
    // Attributes 
    function connectAttributes(elem, scope, attrs, camels) {
        for (let attr in attrs) {
            if (attrs[attr].connected === true && elem.hasAttribute(attr) === true) {
                attrs[attr].set ? attrs[attr].set.apply(elem, [elem.getAttribute(attr)]) : false;
            }
            else if (attrs[attr].connected === true && elem.hasAttribute(attr) === false) {
                attrs[attr].set ? attrs[attr].set.apply(elem, [elem.getAttribute(attr) || false]) : false;
            }
            else if (attrs[attr].connected === undefined ||
                attrs[attr].connected === null ||
                attrs[attr].connected === false) { false; }
            else {
                throw "ERROR[" + elem.nodeName.toLowerCase() + "[" + attr + "]" +
                "]: 'connected' property must be true, false, null, or undefined";
            }

            if (camels === true) {
                if (attrs[attr].active === true) {
                    let camelName = attr.replace(/\-\w/g,
                        function makeCamel(stg) {
                            return stg.match(/\w/)[0].toUpperCase();
                        }
                    );
                    Object.defineProperty(scope, camelName, {
                        get: attrs[attr].get,
                        set: attrs[attr].set
                    });
                }
                else if (attrs[attr].active === undefined ||
                    attrs[attr].active === null ||
                    attrs[attr].active === false) { false; }
                else {
                    throw "ERROR[" + attr +
                    "]: 'active' property must be true, false, null, or undefined";
                }
            }
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
    let DashingReady = {};
    var xtag = {
        register: function Register(name, definition) {
            var attrs = ParseAttrs(definition.attributes || function _parseAttrs() { return {}; });
            CompileAttrs(definition, attrs);
            var methods = ParseMethods(definition.methods || function _parseMethods() { return {}; });
            CompileMethods(definition, methods);

            class DashedTag extends definition {
                connectedCallback() {
                    if (DashingReady[name] === true) {
                        ParseEvents(this, definition.events || function () { return {}; });
                        let attrs = definition.prototype.constructor.attributes;
                        attrs ? connectAttributes(this, definition.prototype, attrs(), false) : null;
                        (definition.prototype.connectedCallback || noop).apply(this);
                    }
                    else {
                        DashingReady[name] = true;
                        ParseEvents(this, definition.events || function () { return {}; });
                        let attrs = definition.prototype.constructor.attributes;
                        attrs ? connectAttributes(this, definition.prototype, attrs(), true) : null;
                        (definition.prototype.connectedCallback || noop).apply(this);
                    }
                }
            }
            return window.customElements.define(name, DashedTag);
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
                    event.delta = event.wheelDelta ?
                        event.wheelDelta / 40 :
                        Math.round(event.detail / 3.5 * -1);
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
                        if (!custom.tapmoveListeners) {
                            custom.tapmoveListeners = xtag.addEvents(document, {
                                pointermove: listener,
                                pointerup: listener,
                                pointercancel: listener
                            });
                        }
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
        wrap: function Wrap(original, fn) {
            return function _Wrap_() {
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
        cancelFrame: (function CancelFrame() {
            var cancel = win.cancelAnimationFrame ||
                win[prefix.lowercase + 'CancelAnimationFrame'] ||
                win.clearTimeout;
            return function _CancelFrame(id) { return cancel(id); };
        })(),
        skipFrame: function (fn) {
            var id = xtag.requestFrame(function () { id = xtag.requestFrame(fn); });
            return id;
        },
        matchSelector: function (element, selector) { return matchSelector.call(element, selector); },
        set: function (element, method, value) {
            element[method] = value;
            if (window.CustomElements) { CustomElements.upgradeAll(element); }
        },
        innerHTML: function (el, html) { xtag.set(el, 'innerHTML', html); },
        hasClass: function (element, klass) {
            return element.className.split(' ').indexOf(klass.trim()) > -1;
        },
        addClass: function (element, klass) {
            var list = element.className.trim().split(' ');
            klass.trim().split(' ').forEach(function (name) {
                if (!~list.indexOf(name)) {
                    list.push(name);
                }
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
            // This is causing the following bug 
            // [InvalidStateError: An attempt was made to use an object that is not, or is no longer, usable]
            return document.importNode(template.content, true);
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
		/* 
		 * Name: queryArray 
		 * Desc: 
		 * Return's match if a one is found or else return's false
		 */
        queryArray: function QueryArray(arr, val) {
            if (xtag.typeOf(val) === "string") {
                let mat = false;
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i] === val) { return i; }
                }
                return false;
            }
        },
        /* PSEUDOS */
        applyPseudos: function ApplyPseudos(key, fn, target, source) {
            var listener = fn,
                pseudos = {};
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
                while (i--) {
                    parsePseudo(function () {
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
                        var original = pseudo.listener = listener
                        listener = function psuedoListener() {
                            var output = pseudo.action.apply(this, [pseudo].concat(toArray(arguments)));
                            if (output === null || output === false) { return output; }
                            output = pseudo.listener.apply(this, arguments);
                            pseudo.listener = original;
                            return output;
                        };
                        if (target === undefined) { pseudo.onAdd.call(fn, pseudo); }
                        else { xtag.pseudos[key] = pseudo; target.push(pseudo); }
                    });
                }
            }
            for (var z in pseudos) {
                if (pseudos[z].onCompiled) {
                    listener = pseudos[z].onCompiled(listener, pseudos[z]) || listener;
                }
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
    var replaceSpaces = / /g,
        captureTimes = /(\d|\d+?[.]?\d+?)(s|ms)(?!\w)/gi,
        transPre = 'transition' in getComputedStyle(document.documentElement) ? 't' : xtag.prefix.js + 'T',
        transDel = transPre + 'ransitionDelay',
        transDur = transPre + 'ransitionDuration',
        loading = document.readyState == 'complete' ?
            xtag.skipFrame(function TransitionSkipFrame() { loading = false }) :
            xtag.addEvent(document, 'readystatechange', function TransitionReadyStateChane() {
                if (document.readyState == 'complete') {
                    xtag.skipFrame(function () { loading = false });
                    xtag.removeEvent(document, 'readystatechange', loading);
                }
            });
    function parseTimes(style) {
        var value = 0;
        style.replace(captureTimes, function TimeParseRegEx(match, time, unit) {
            time = parseFloat(time) * (unit === 's' ? 1000 : 1);
            if (time >= value) { value = time; }
        });
        return value;
    }
    function startTransition(node, name, transitions) {
        var current = node.getAttribute('transition');
        transitions[current] ? clearTimeout(transitions[current].timer) : null;
        node.setAttribute('transition', name);
        var transition = transitions[name],
            max = transition.max;
        if (isNaN(max)) {
            var styles = getComputedStyle(node);
            max = transition.max = parseTimes(styles[transDel]) + parseTimes(styles[transDur]);
        }
        transition.timer = setTimeout(function transitionTimeout() {
            node.removeAttribute('transitioning');
            transition.after ? transition.after.call(node) : null;
            xtag.fireEvent(node, name + '-transition');
        }, loading ? 0 : max);
    }
    xtag.transition = function Transition(node, name, obj) {
        if (node.getAttribute('transition') != name) {
            var transitions = node.__transitions__ || (node.__transitions__ = {}),
                options = transitions[name] = obj || transitions[name] || {};
            !loading ? node.setAttribute('transitioning', name) : null;
            options.immediate ? options.immediate.call(node) : null;
            if (options.before) {
                options.before.call(node);
                if (loading) {
                    xtag.skipTransition(node, function () {
                        startTransition(node, name, transitions);
                    });
                }
                else {
                    xtag.skipFrame(function () {
                        startTransition(node, name, transitions);
                    });
                }
            }
            else {
                xtag.skipFrame(function SkipFrame() {
                    startTransition(node, name, transitions);
                });
            }
        }
    };
    xtag.pseudos.transition = {
        onCompiled: function compileTransition(fn, pseudo) {
            var when = pseudo.arguments[0] || 'immediate',
                name = pseudo.arguments[1] || pseudo.key.split(':')[0];
            return function () {
                var options = {},
                    args = arguments;
                options[when] = function () {
                    return fn.apply(this, args);
                }
                xtag.transition(this, name, options);
            }
        }
    }
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

