// DOMTokenList polyfill for IE9
(function () {

    if (typeof window.Element === "undefined" || "classList" in document.documentElement) return;
    var prototype = Array.prototype,
        indexOf = prototype.indexOf,
        slice = prototype.slice,
        push = prototype.push,
        splice = prototype.splice,
        join = prototype.join;

    function DOMTokenList(el) {
        this._element = el;
        if (el.className != this._classCache) {
            this._classCache = el.className;

            if (!this._classCache) return;

            // The className needs to be trimmed and split on whitespace
            // to retrieve a list of classes.
            var classes = this._classCache.replace(/^\s+|\s+$/g, '').split(/\s+/),
                i;
            for (i = 0; i < classes.length; i++) {
                push.call(this, classes[i]);
            }
        }
    };

    function setToClassName(el, classes) {
        el.className = classes.join(' ');
    }

    DOMTokenList.prototype = {
        add: function (token) {
            if (this.contains(token)) return;
            push.call(this, token);
            setToClassName(this._element, slice.call(this, 0));
        },
        contains: function (token) {
            return indexOf.call(this, token) !== -1;
        },
        item: function (index) {
            return this[index] || null;
        },
        remove: function (token) {
            var i = indexOf.call(this, token);
            if (i === -1) {
                return;
            }
            splice.call(this, i, 1);
            setToClassName(this._element, slice.call(this, 0));
        },
        toString: function () {
            return join.call(this, ' ');
        },
        toggle: function (token) {
            if (indexOf.call(this, token) === -1) {
                this.add(token);
            } else {
                this.remove(token);
            }
        }
    };

    window.DOMTokenList = DOMTokenList;

    function defineElementGetter(obj, prop, getter) {
        if (Object.defineProperty) {
            Object.defineProperty(obj, prop, {
                get: getter
            })
        } else {
            obj.__defineGetter__(prop, getter);
        }
    }

    defineElementGetter(Element.prototype, 'classList', function () {
        return new DOMTokenList(this);
    });

})();

/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version 0.7.20
(function () {
    window.WebComponents = window.WebComponents || {
        flags: {}
    };
    var file = "webcomponents.js";
    var script = document.querySelector('script[src*="' + file + '"]');
    var flags = {};
    if (!flags.noOpts) {
        location.search.slice(1).split("&").forEach(function (option) {
            var parts = option.split("=");
            var match;
            if (parts[0] && (match = parts[0].match(/wc-(.+)/))) {
                flags[match[1]] = parts[1] || true;
            }
        });
        if (script) {
            for (var i = 0, a; a = script.attributes[i]; i++) {
                if (a.name !== "src") {
                    flags[a.name] = a.value || true;
                }
            }
        }
        if (flags.log && flags.log.split) {
            var parts = flags.log.split(",");
            flags.log = {};
            parts.forEach(function (f) {
                flags.log[f] = true;
            });
        } else {
            flags.log = {};
        }
    }
    flags.shadow = flags.shadow || flags.shadowdom || flags.polyfill;
    if (flags.shadow === "native") {
        flags.shadow = false;
    } else {
        flags.shadow = flags.shadow || !HTMLElement.prototype.createShadowRoot;
    }
    if (flags.register) {
        window.CustomElements = window.CustomElements || {
            flags: {}
        };
        window.CustomElements.flags.register = flags.register;
    }
    WebComponents.flags = flags;
})();

if (WebComponents.flags.shadow) {
    if (typeof WeakMap === "undefined") {
        (function () {
            var defineProperty = Object.defineProperty;
            var counter = Date.now() % 1e9;
            var WeakMap = function () {
                this.name = "__st" + (Math.random() * 1e9 >>> 0) + (counter++ + "__");
            };
            WeakMap.prototype = {
                set: function (key, value) {
                    var entry = key[this.name];
                    if (entry && entry[0] === key) entry[1] = value; else defineProperty(key, this.name, {
                        value: [key, value],
                        writable: true
                    });
                    return this;
                },
                get: function (key) {
                    var entry;
                    return (entry = key[this.name]) && entry[0] === key ? entry[1] : undefined;
                },
                "delete": function (key) {
                    var entry = key[this.name];
                    if (!entry || entry[0] !== key) return false;
                    entry[0] = entry[1] = undefined;
                    return true;
                },
                has: function (key) {
                    var entry = key[this.name];
                    if (!entry) return false;
                    return entry[0] === key;
                }
            };
            window.WeakMap = WeakMap;
        })();
    }
    window.ShadowDOMPolyfill = {};
    (function (scope) {
        "use strict";
        var constructorTable = new WeakMap();
        var nativePrototypeTable = new WeakMap();
        var wrappers = Object.create(null);
        function detectEval() {
            if (typeof chrome !== "undefined" && chrome.app && chrome.app.runtime) {
                return false;
            }
            if (navigator.getDeviceStorage) {
                return false;
            }
            try {
                var f = new Function("return true;");
                return f();
            } catch (ex) {
                return false;
            }
        }
        var hasEval = detectEval();
        function assert(b) {
            if (!b) throw new Error("Assertion failed");
        }
        var defineProperty = Object.defineProperty;
        var getOwnPropertyNames = Object.getOwnPropertyNames;
        var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        function mixin(to, from) {
            var names = getOwnPropertyNames(from);
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                defineProperty(to, name, getOwnPropertyDescriptor(from, name));
            }
            return to;
        }
        function mixinStatics(to, from) {
            var names = getOwnPropertyNames(from);
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                switch (name) {
                    case "arguments":
                    case "caller":
                    case "length":
                    case "name":
                    case "prototype":
                    case "toString":
                        continue;
                }
                defineProperty(to, name, getOwnPropertyDescriptor(from, name));
            }
            return to;
        }
        function oneOf(object, propertyNames) {
            for (var i = 0; i < propertyNames.length; i++) {
                if (propertyNames[i] in object) return propertyNames[i];
            }
        }
        var nonEnumerableDataDescriptor = {
            value: undefined,
            configurable: true,
            enumerable: false,
            writable: true
        };
        function defineNonEnumerableDataProperty(object, name, value) {
            nonEnumerableDataDescriptor.value = value;
            defineProperty(object, name, nonEnumerableDataDescriptor);
        }
        getOwnPropertyNames(window);
        function getWrapperConstructor(node, opt_instance) {
            var nativePrototype = node.__proto__ || Object.getPrototypeOf(node);
            if (isFirefox) {
                try {
                    getOwnPropertyNames(nativePrototype);
                } catch (error) {
                    nativePrototype = nativePrototype.__proto__;
                }
            }
            var wrapperConstructor = constructorTable.get(nativePrototype);
            if (wrapperConstructor) return wrapperConstructor;
            var parentWrapperConstructor = getWrapperConstructor(nativePrototype);
            var GeneratedWrapper = createWrapperConstructor(parentWrapperConstructor);
            registerInternal(nativePrototype, GeneratedWrapper, opt_instance);
            return GeneratedWrapper;
        }
        function addForwardingProperties(nativePrototype, wrapperPrototype) {
            installProperty(nativePrototype, wrapperPrototype, true);
        }
        function registerInstanceProperties(wrapperPrototype, instanceObject) {
            installProperty(instanceObject, wrapperPrototype, false);
        }
        var isFirefox = /Firefox/.test(navigator.userAgent);
        var dummyDescriptor = {
            get: function () { },
            set: function (v) { },
            configurable: true,
            enumerable: true
        };
        function isEventHandlerName(name) {
            return /^on[a-z]+$/.test(name);
        }
        function isIdentifierName(name) {
            return /^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(name);
        }
        function getGetter(name) {
            return hasEval && isIdentifierName(name) ? new Function("return this.__impl4cf1e782hg__." + name) : function () {
                return this.__impl4cf1e782hg__[name];
            };
        }
        function getSetter(name) {
            return hasEval && isIdentifierName(name) ? new Function("v", "this.__impl4cf1e782hg__." + name + " = v") : function (v) {
                this.__impl4cf1e782hg__[name] = v;
            };
        }
        function getMethod(name) {
            return hasEval && isIdentifierName(name) ? new Function("return this.__impl4cf1e782hg__." + name + ".apply(this.__impl4cf1e782hg__, arguments)") : function () {
                return this.__impl4cf1e782hg__[name].apply(this.__impl4cf1e782hg__, arguments);
            };
        }
        function getDescriptor(source, name) {
            try {
                return Object.getOwnPropertyDescriptor(source, name);
            } catch (ex) {
                return dummyDescriptor;
            }
        }
        var isBrokenSafari = function () {
            var descr = Object.getOwnPropertyDescriptor(Node.prototype, "nodeType");
            return descr && !descr.get && !descr.set;
        }();
        function installProperty(source, target, allowMethod, opt_blacklist) {
            var names = getOwnPropertyNames(source);
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                if (name === "polymerBlackList_") continue;
                if (name in target) continue;
                if (source.polymerBlackList_ && source.polymerBlackList_[name]) continue;
                if (isFirefox) {
                    source.__lookupGetter__(name);
                }
                var descriptor = getDescriptor(source, name);
                var getter, setter;
                if (typeof descriptor.value === "function") {
                    if (allowMethod) {
                        target[name] = getMethod(name);
                    }
                    continue;
                }
                var isEvent = isEventHandlerName(name);
                if (isEvent) getter = scope.getEventHandlerGetter(name); else getter = getGetter(name);
                if (descriptor.writable || descriptor.set || isBrokenSafari) {
                    if (isEvent) setter = scope.getEventHandlerSetter(name); else setter = getSetter(name);
                }
                var configurable = isBrokenSafari || descriptor.configurable;
                defineProperty(target, name, {
                    get: getter,
                    set: setter,
                    configurable: configurable,
                    enumerable: descriptor.enumerable
                });
            }
        }
        function register(nativeConstructor, wrapperConstructor, opt_instance) {
            if (nativeConstructor == null) {
                return;
            }
            var nativePrototype = nativeConstructor.prototype;
            registerInternal(nativePrototype, wrapperConstructor, opt_instance);
            mixinStatics(wrapperConstructor, nativeConstructor);
        }
        function registerInternal(nativePrototype, wrapperConstructor, opt_instance) {
            var wrapperPrototype = wrapperConstructor.prototype;
            assert(constructorTable.get(nativePrototype) === undefined);
            constructorTable.set(nativePrototype, wrapperConstructor);
            nativePrototypeTable.set(wrapperPrototype, nativePrototype);
            addForwardingProperties(nativePrototype, wrapperPrototype);
            if (opt_instance) registerInstanceProperties(wrapperPrototype, opt_instance);
            defineNonEnumerableDataProperty(wrapperPrototype, "constructor", wrapperConstructor);
            wrapperConstructor.prototype = wrapperPrototype;
        }
        function isWrapperFor(wrapperConstructor, nativeConstructor) {
            return constructorTable.get(nativeConstructor.prototype) === wrapperConstructor;
        }
        function registerObject(object) {
            var nativePrototype = Object.getPrototypeOf(object);
            var superWrapperConstructor = getWrapperConstructor(nativePrototype);
            var GeneratedWrapper = createWrapperConstructor(superWrapperConstructor);
            registerInternal(nativePrototype, GeneratedWrapper, object);
            return GeneratedWrapper;
        }
        function createWrapperConstructor(superWrapperConstructor) {
            function GeneratedWrapper(node) {
                superWrapperConstructor.call(this, node);
            }
            var p = Object.create(superWrapperConstructor.prototype);
            p.constructor = GeneratedWrapper;
            GeneratedWrapper.prototype = p;
            return GeneratedWrapper;
        }
        function isWrapper(object) {
            return object && object.__impl4cf1e782hg__;
        }
        function isNative(object) {
            return !isWrapper(object);
        }
        function wrap(impl) {
            if (impl === null) return null;
            assert(isNative(impl));
            var wrapper = impl.__wrapper8e3dd93a60__;
            if (wrapper != null) {
                return wrapper;
            }
            return impl.__wrapper8e3dd93a60__ = new (getWrapperConstructor(impl, impl))(impl);
        }
        function unwrap(wrapper) {
            if (wrapper === null) return null;
            assert(isWrapper(wrapper));
            return wrapper.__impl4cf1e782hg__;
        }
        function unsafeUnwrap(wrapper) {
            return wrapper.__impl4cf1e782hg__;
        }
        function setWrapper(impl, wrapper) {
            wrapper.__impl4cf1e782hg__ = impl;
            impl.__wrapper8e3dd93a60__ = wrapper;
        }
        function unwrapIfNeeded(object) {
            return object && isWrapper(object) ? unwrap(object) : object;
        }
        function wrapIfNeeded(object) {
            return object && !isWrapper(object) ? wrap(object) : object;
        }
        function rewrap(node, wrapper) {
            if (wrapper === null) return;
            assert(isNative(node));
            assert(wrapper === undefined || isWrapper(wrapper));
            node.__wrapper8e3dd93a60__ = wrapper;
        }
        var getterDescriptor = {
            get: undefined,
            configurable: true,
            enumerable: true
        };
        function defineGetter(constructor, name, getter) {
            getterDescriptor.get = getter;
            defineProperty(constructor.prototype, name, getterDescriptor);
        }
        function defineWrapGetter(constructor, name) {
            defineGetter(constructor, name, function () {
                return wrap(this.__impl4cf1e782hg__[name]);
            });
        }
        function forwardMethodsToWrapper(constructors, names) {
            constructors.forEach(function (constructor) {
                names.forEach(function (name) {
                    constructor.prototype[name] = function () {
                        var w = wrapIfNeeded(this);
                        return w[name].apply(w, arguments);
                    };
                });
            });
        }
        scope.addForwardingProperties = addForwardingProperties;
        scope.assert = assert;
        scope.constructorTable = constructorTable;
        scope.defineGetter = defineGetter;
        scope.defineWrapGetter = defineWrapGetter;
        scope.forwardMethodsToWrapper = forwardMethodsToWrapper;
        scope.isIdentifierName = isIdentifierName;
        scope.isWrapper = isWrapper;
        scope.isWrapperFor = isWrapperFor;
        scope.mixin = mixin;
        scope.nativePrototypeTable = nativePrototypeTable;
        scope.oneOf = oneOf;
        scope.registerObject = registerObject;
        scope.registerWrapper = register;
        scope.rewrap = rewrap;
        scope.setWrapper = setWrapper;
        scope.unsafeUnwrap = unsafeUnwrap;
        scope.unwrap = unwrap;
        scope.unwrapIfNeeded = unwrapIfNeeded;
        scope.wrap = wrap;
        scope.wrapIfNeeded = wrapIfNeeded;
        scope.wrappers = wrappers;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        function newSplice(index, removed, addedCount) {
            return {
                index: index,
                removed: removed,
                addedCount: addedCount
            };
        }
        var EDIT_LEAVE = 0;
        var EDIT_UPDATE = 1;
        var EDIT_ADD = 2;
        var EDIT_DELETE = 3;
        function ArraySplice() { }
        ArraySplice.prototype = {
            calcEditDistances: function (current, currentStart, currentEnd, old, oldStart, oldEnd) {
                var rowCount = oldEnd - oldStart + 1;
                var columnCount = currentEnd - currentStart + 1;
                var distances = new Array(rowCount);
                for (var i = 0; i < rowCount; i++) {
                    distances[i] = new Array(columnCount);
                    distances[i][0] = i;
                }
                for (var j = 0; j < columnCount; j++) distances[0][j] = j;
                for (var i = 1; i < rowCount; i++) {
                    for (var j = 1; j < columnCount; j++) {
                        if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1])) distances[i][j] = distances[i - 1][j - 1]; else {
                            var north = distances[i - 1][j] + 1;
                            var west = distances[i][j - 1] + 1;
                            distances[i][j] = north < west ? north : west;
                        }
                    }
                }
                return distances;
            },
            spliceOperationsFromEditDistances: function (distances) {
                var i = distances.length - 1;
                var j = distances[0].length - 1;
                var current = distances[i][j];
                var edits = [];
                while (i > 0 || j > 0) {
                    if (i == 0) {
                        edits.push(EDIT_ADD);
                        j--;
                        continue;
                    }
                    if (j == 0) {
                        edits.push(EDIT_DELETE);
                        i--;
                        continue;
                    }
                    var northWest = distances[i - 1][j - 1];
                    var west = distances[i - 1][j];
                    var north = distances[i][j - 1];
                    var min;
                    if (west < north) min = west < northWest ? west : northWest; else min = north < northWest ? north : northWest;
                    if (min == northWest) {
                        if (northWest == current) {
                            edits.push(EDIT_LEAVE);
                        } else {
                            edits.push(EDIT_UPDATE);
                            current = northWest;
                        }
                        i--;
                        j--;
                    } else if (min == west) {
                        edits.push(EDIT_DELETE);
                        i--;
                        current = west;
                    } else {
                        edits.push(EDIT_ADD);
                        j--;
                        current = north;
                    }
                }
                edits.reverse();
                return edits;
            },
            calcSplices: function (current, currentStart, currentEnd, old, oldStart, oldEnd) {
                var prefixCount = 0;
                var suffixCount = 0;
                var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
                if (currentStart == 0 && oldStart == 0) prefixCount = this.sharedPrefix(current, old, minLength);
                if (currentEnd == current.length && oldEnd == old.length) suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);
                currentStart += prefixCount;
                oldStart += prefixCount;
                currentEnd -= suffixCount;
                oldEnd -= suffixCount;
                if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0) return [];
                if (currentStart == currentEnd) {
                    var splice = newSplice(currentStart, [], 0);
                    while (oldStart < oldEnd) splice.removed.push(old[oldStart++]);
                    return [splice];
                } else if (oldStart == oldEnd) return [newSplice(currentStart, [], currentEnd - currentStart)];
                var ops = this.spliceOperationsFromEditDistances(this.calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd));
                var splice = undefined;
                var splices = [];
                var index = currentStart;
                var oldIndex = oldStart;
                for (var i = 0; i < ops.length; i++) {
                    switch (ops[i]) {
                        case EDIT_LEAVE:
                            if (splice) {
                                splices.push(splice);
                                splice = undefined;
                            }
                            index++;
                            oldIndex++;
                            break;

                        case EDIT_UPDATE:
                            if (!splice) splice = newSplice(index, [], 0);
                            splice.addedCount++;
                            index++;
                            splice.removed.push(old[oldIndex]);
                            oldIndex++;
                            break;

                        case EDIT_ADD:
                            if (!splice) splice = newSplice(index, [], 0);
                            splice.addedCount++;
                            index++;
                            break;

                        case EDIT_DELETE:
                            if (!splice) splice = newSplice(index, [], 0);
                            splice.removed.push(old[oldIndex]);
                            oldIndex++;
                            break;
                    }
                }
                if (splice) {
                    splices.push(splice);
                }
                return splices;
            },
            sharedPrefix: function (current, old, searchLength) {
                for (var i = 0; i < searchLength; i++) if (!this.equals(current[i], old[i])) return i;
                return searchLength;
            },
            sharedSuffix: function (current, old, searchLength) {
                var index1 = current.length;
                var index2 = old.length;
                var count = 0;
                while (count < searchLength && this.equals(current[--index1], old[--index2])) count++;
                return count;
            },
            calculateSplices: function (current, previous) {
                return this.calcSplices(current, 0, current.length, previous, 0, previous.length);
            },
            equals: function (currentValue, previousValue) {
                return currentValue === previousValue;
            }
        };
        scope.ArraySplice = ArraySplice;
    })(window.ShadowDOMPolyfill);
    (function (context) {
        "use strict";
        var OriginalMutationObserver = window.MutationObserver;
        var callbacks = [];
        var pending = false;
        var timerFunc;
        function handle() {
            pending = false;
            var copies = callbacks.slice(0);
            callbacks = [];
            for (var i = 0; i < copies.length; i++) {
                (0, copies[i])();
            }
        }
        if (OriginalMutationObserver) {
            var counter = 1;
            var observer = new OriginalMutationObserver(handle);
            var textNode = document.createTextNode(counter);
            observer.observe(textNode, {
                characterData: true
            });
            timerFunc = function () {
                counter = (counter + 1) % 2;
                textNode.data = counter;
            };
        } else {
            timerFunc = window.setTimeout;
        }
        function setEndOfMicrotask(func) {
            callbacks.push(func);
            if (pending) return;
            pending = true;
            timerFunc(handle, 0);
        }
        context.setEndOfMicrotask = setEndOfMicrotask;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var setEndOfMicrotask = scope.setEndOfMicrotask;
        var wrapIfNeeded = scope.wrapIfNeeded;
        var wrappers = scope.wrappers;
        var registrationsTable = new WeakMap();
        var globalMutationObservers = [];
        var isScheduled = false;
        function scheduleCallback(observer) {
            if (observer.scheduled_) return;
            observer.scheduled_ = true;
            globalMutationObservers.push(observer);
            if (isScheduled) return;
            setEndOfMicrotask(notifyObservers);
            isScheduled = true;
        }
        function notifyObservers() {
            isScheduled = false;
            while (globalMutationObservers.length) {
                var notifyList = globalMutationObservers;
                globalMutationObservers = [];
                notifyList.sort(function (x, y) {
                    return x.uid_ - y.uid_;
                });
                for (var i = 0; i < notifyList.length; i++) {
                    var mo = notifyList[i];
                    mo.scheduled_ = false;
                    var queue = mo.takeRecords();
                    removeTransientObserversFor(mo);
                    if (queue.length) {
                        mo.callback_(queue, mo);
                    }
                }
            }
        }
        function MutationRecord(type, target) {
            this.type = type;
            this.target = target;
            this.addedNodes = new wrappers.NodeList();
            this.removedNodes = new wrappers.NodeList();
            this.previousSibling = null;
            this.nextSibling = null;
            this.attributeName = null;
            this.attributeNamespace = null;
            this.oldValue = null;
        }
        function registerTransientObservers(ancestor, node) {
            for (; ancestor; ancestor = ancestor.parentNode) {
                var registrations = registrationsTable.get(ancestor);
                if (!registrations) continue;
                for (var i = 0; i < registrations.length; i++) {
                    var registration = registrations[i];
                    if (registration.options.subtree) registration.addTransientObserver(node);
                }
            }
        }
        function removeTransientObserversFor(observer) {
            for (var i = 0; i < observer.nodes_.length; i++) {
                var node = observer.nodes_[i];
                var registrations = registrationsTable.get(node);
                if (!registrations) return;
                for (var j = 0; j < registrations.length; j++) {
                    var registration = registrations[j];
                    if (registration.observer === observer) registration.removeTransientObservers();
                }
            }
        }
        function enqueueMutation(target, type, data) {
            var interestedObservers = Object.create(null);
            var associatedStrings = Object.create(null);
            for (var node = target; node; node = node.parentNode) {
                var registrations = registrationsTable.get(node);
                if (!registrations) continue;
                for (var j = 0; j < registrations.length; j++) {
                    var registration = registrations[j];
                    var options = registration.options;
                    if (node !== target && !options.subtree) continue;
                    if (type === "attributes" && !options.attributes) continue;
                    if (type === "attributes" && options.attributeFilter && (data.namespace !== null || options.attributeFilter.indexOf(data.name) === -1)) {
                        continue;
                    }
                    if (type === "characterData" && !options.characterData) continue;
                    if (type === "childList" && !options.childList) continue;
                    var observer = registration.observer;
                    interestedObservers[observer.uid_] = observer;
                    if (type === "attributes" && options.attributeOldValue || type === "characterData" && options.characterDataOldValue) {
                        associatedStrings[observer.uid_] = data.oldValue;
                    }
                }
            }
            for (var uid in interestedObservers) {
                var observer = interestedObservers[uid];
                var record = new MutationRecord(type, target);
                if ("name" in data && "namespace" in data) {
                    record.attributeName = data.name;
                    record.attributeNamespace = data.namespace;
                }
                if (data.addedNodes) record.addedNodes = data.addedNodes;
                if (data.removedNodes) record.removedNodes = data.removedNodes;
                if (data.previousSibling) record.previousSibling = data.previousSibling;
                if (data.nextSibling) record.nextSibling = data.nextSibling;
                if (associatedStrings[uid] !== undefined) record.oldValue = associatedStrings[uid];
                scheduleCallback(observer);
                observer.records_.push(record);
            }
        }
        var slice = Array.prototype.slice;
        function MutationObserverOptions(options) {
            this.childList = !!options.childList;
            this.subtree = !!options.subtree;
            if (!("attributes" in options) && ("attributeOldValue" in options || "attributeFilter" in options)) {
                this.attributes = true;
            } else {
                this.attributes = !!options.attributes;
            }
            if ("characterDataOldValue" in options && !("characterData" in options)) this.characterData = true; else this.characterData = !!options.characterData;
            if (!this.attributes && (options.attributeOldValue || "attributeFilter" in options) || !this.characterData && options.characterDataOldValue) {
                throw new TypeError();
            }
            this.characterData = !!options.characterData;
            this.attributeOldValue = !!options.attributeOldValue;
            this.characterDataOldValue = !!options.characterDataOldValue;
            if ("attributeFilter" in options) {
                if (options.attributeFilter == null || typeof options.attributeFilter !== "object") {
                    throw new TypeError();
                }
                this.attributeFilter = slice.call(options.attributeFilter);
            } else {
                this.attributeFilter = null;
            }
        }
        var uidCounter = 0;
        function MutationObserver(callback) {
            this.callback_ = callback;
            this.nodes_ = [];
            this.records_ = [];
            this.uid_ = ++uidCounter;
            this.scheduled_ = false;
        }
        MutationObserver.prototype = {
            constructor: MutationObserver,
            observe: function (target, options) {
                target = wrapIfNeeded(target);
                var newOptions = new MutationObserverOptions(options);
                var registration;
                var registrations = registrationsTable.get(target);
                if (!registrations) registrationsTable.set(target, registrations = []);
                for (var i = 0; i < registrations.length; i++) {
                    if (registrations[i].observer === this) {
                        registration = registrations[i];
                        registration.removeTransientObservers();
                        registration.options = newOptions;
                    }
                }
                if (!registration) {
                    registration = new Registration(this, target, newOptions);
                    registrations.push(registration);
                    this.nodes_.push(target);
                }
            },
            disconnect: function () {
                this.nodes_.forEach(function (node) {
                    var registrations = registrationsTable.get(node);
                    for (var i = 0; i < registrations.length; i++) {
                        var registration = registrations[i];
                        if (registration.observer === this) {
                            registrations.splice(i, 1);
                            break;
                        }
                    }
                }, this);
                this.records_ = [];
            },
            takeRecords: function () {
                var copyOfRecords = this.records_;
                this.records_ = [];
                return copyOfRecords;
            }
        };
        function Registration(observer, target, options) {
            this.observer = observer;
            this.target = target;
            this.options = options;
            this.transientObservedNodes = [];
        }
        Registration.prototype = {
            addTransientObserver: function (node) {
                if (node === this.target) return;
                scheduleCallback(this.observer);
                this.transientObservedNodes.push(node);
                var registrations = registrationsTable.get(node);
                if (!registrations) registrationsTable.set(node, registrations = []);
                registrations.push(this);
            },
            removeTransientObservers: function () {
                var transientObservedNodes = this.transientObservedNodes;
                this.transientObservedNodes = [];
                for (var i = 0; i < transientObservedNodes.length; i++) {
                    var node = transientObservedNodes[i];
                    var registrations = registrationsTable.get(node);
                    for (var j = 0; j < registrations.length; j++) {
                        if (registrations[j] === this) {
                            registrations.splice(j, 1);
                            break;
                        }
                    }
                }
            }
        };
        scope.enqueueMutation = enqueueMutation;
        scope.registerTransientObservers = registerTransientObservers;
        scope.wrappers.MutationObserver = MutationObserver;
        scope.wrappers.MutationRecord = MutationRecord;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        function TreeScope(root, parent) {
            this.root = root;
            this.parent = parent;
        }
        TreeScope.prototype = {
            get renderer() {
                if (this.root instanceof scope.wrappers.ShadowRoot) {
                    return scope.getRendererForHost(this.root.host);
                }
                return null;
            },
            contains: function (treeScope) {
                for (; treeScope; treeScope = treeScope.parent) {
                    if (treeScope === this) return true;
                }
                return false;
            }
        };
        function setTreeScope(node, treeScope) {
            if (node.treeScope_ !== treeScope) {
                node.treeScope_ = treeScope;
                for (var sr = node.shadowRoot; sr; sr = sr.olderShadowRoot) {
                    sr.treeScope_.parent = treeScope;
                }
                for (var child = node.firstChild; child; child = child.nextSibling) {
                    setTreeScope(child, treeScope);
                }
            }
        }
        function getTreeScope(node) {
            if (node instanceof scope.wrappers.Window) {
                debugger;
            }
            if (node.treeScope_) return node.treeScope_;
            var parent = node.parentNode;
            var treeScope;
            if (parent) treeScope = getTreeScope(parent); else treeScope = new TreeScope(node, null);
            return node.treeScope_ = treeScope;
        }
        scope.TreeScope = TreeScope;
        scope.getTreeScope = getTreeScope;
        scope.setTreeScope = setTreeScope;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var forwardMethodsToWrapper = scope.forwardMethodsToWrapper;
        var getTreeScope = scope.getTreeScope;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var setWrapper = scope.setWrapper;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var unwrap = scope.unwrap;
        var wrap = scope.wrap;
        var wrappers = scope.wrappers;
        var wrappedFuns = new WeakMap();
        var listenersTable = new WeakMap();
        var handledEventsTable = new WeakMap();
        var currentlyDispatchingEvents = new WeakMap();
        var targetTable = new WeakMap();
        var currentTargetTable = new WeakMap();
        var relatedTargetTable = new WeakMap();
        var eventPhaseTable = new WeakMap();
        var stopPropagationTable = new WeakMap();
        var stopImmediatePropagationTable = new WeakMap();
        var eventHandlersTable = new WeakMap();
        var eventPathTable = new WeakMap();
        function isShadowRoot(node) {
            return node instanceof wrappers.ShadowRoot;
        }
        function rootOfNode(node) {
            return getTreeScope(node).root;
        }
        function getEventPath(node, event) {
            var path = [];
            var current = node;
            path.push(current);
            while (current) {
                var destinationInsertionPoints = getDestinationInsertionPoints(current);
                if (destinationInsertionPoints && destinationInsertionPoints.length > 0) {
                    for (var i = 0; i < destinationInsertionPoints.length; i++) {
                        var insertionPoint = destinationInsertionPoints[i];
                        if (isShadowInsertionPoint(insertionPoint)) {
                            var shadowRoot = rootOfNode(insertionPoint);
                            var olderShadowRoot = shadowRoot.olderShadowRoot;
                            if (olderShadowRoot) path.push(olderShadowRoot);
                        }
                        path.push(insertionPoint);
                    }
                    current = destinationInsertionPoints[destinationInsertionPoints.length - 1];
                } else {
                    if (isShadowRoot(current)) {
                        if (inSameTree(node, current) && eventMustBeStopped(event)) {
                            break;
                        }
                        current = current.host;
                        path.push(current);
                    } else {
                        current = current.parentNode;
                        if (current) path.push(current);
                    }
                }
            }
            return path;
        }
        function eventMustBeStopped(event) {
            if (!event) return false;
            switch (event.type) {
                case "abort":
                case "error":
                case "select":
                case "change":
                case "load":
                case "reset":
                case "resize":
                case "scroll":
                case "selectstart":
                    return true;
            }
            return false;
        }
        function isShadowInsertionPoint(node) {
            return node instanceof HTMLShadowElement;
        }
        function getDestinationInsertionPoints(node) {
            return scope.getDestinationInsertionPoints(node);
        }
        function eventRetargetting(path, currentTarget) {
            if (path.length === 0) return currentTarget;
            if (currentTarget instanceof wrappers.Window) currentTarget = currentTarget.document;
            var currentTargetTree = getTreeScope(currentTarget);
            var originalTarget = path[0];
            var originalTargetTree = getTreeScope(originalTarget);
            var relativeTargetTree = lowestCommonInclusiveAncestor(currentTargetTree, originalTargetTree);
            for (var i = 0; i < path.length; i++) {
                var node = path[i];
                if (getTreeScope(node) === relativeTargetTree) return node;
            }
            return path[path.length - 1];
        }
        function getTreeScopeAncestors(treeScope) {
            var ancestors = [];
            for (; treeScope; treeScope = treeScope.parent) {
                ancestors.push(treeScope);
            }
            return ancestors;
        }
        function lowestCommonInclusiveAncestor(tsA, tsB) {
            var ancestorsA = getTreeScopeAncestors(tsA);
            var ancestorsB = getTreeScopeAncestors(tsB);
            var result = null;
            while (ancestorsA.length > 0 && ancestorsB.length > 0) {
                var a = ancestorsA.pop();
                var b = ancestorsB.pop();
                if (a === b) result = a; else break;
            }
            return result;
        }
        function getTreeScopeRoot(ts) {
            if (!ts.parent) return ts;
            return getTreeScopeRoot(ts.parent);
        }
        function relatedTargetResolution(event, currentTarget, relatedTarget) {
            if (currentTarget instanceof wrappers.Window) currentTarget = currentTarget.document;
            var currentTargetTree = getTreeScope(currentTarget);
            var relatedTargetTree = getTreeScope(relatedTarget);
            var relatedTargetEventPath = getEventPath(relatedTarget, event);
            var lowestCommonAncestorTree;
            var lowestCommonAncestorTree = lowestCommonInclusiveAncestor(currentTargetTree, relatedTargetTree);
            if (!lowestCommonAncestorTree) lowestCommonAncestorTree = relatedTargetTree.root;
            for (var commonAncestorTree = lowestCommonAncestorTree; commonAncestorTree; commonAncestorTree = commonAncestorTree.parent) {
                var adjustedRelatedTarget;
                for (var i = 0; i < relatedTargetEventPath.length; i++) {
                    var node = relatedTargetEventPath[i];
                    if (getTreeScope(node) === commonAncestorTree) return node;
                }
            }
            return null;
        }
        function inSameTree(a, b) {
            return getTreeScope(a) === getTreeScope(b);
        }
        var NONE = 0;
        var CAPTURING_PHASE = 1;
        var AT_TARGET = 2;
        var BUBBLING_PHASE = 3;
        var pendingError;
        function dispatchOriginalEvent(originalEvent) {
            if (handledEventsTable.get(originalEvent)) return;
            handledEventsTable.set(originalEvent, true);
            dispatchEvent(wrap(originalEvent), wrap(originalEvent.target));
            if (pendingError) {
                var err = pendingError;
                pendingError = null;
                throw err;
            }
        }
        function isLoadLikeEvent(event) {
            switch (event.type) {
                case "load":
                case "beforeunload":
                case "unload":
                    return true;
            }
            return false;
        }
        function dispatchEvent(event, originalWrapperTarget) {
            if (currentlyDispatchingEvents.get(event)) throw new Error("InvalidStateError");
            currentlyDispatchingEvents.set(event, true);
            scope.renderAllPending();
            var eventPath;
            var overrideTarget;
            var win;
            if (isLoadLikeEvent(event) && !event.bubbles) {
                var doc = originalWrapperTarget;
                if (doc instanceof wrappers.Document && (win = doc.defaultView)) {
                    overrideTarget = doc;
                    eventPath = [];
                }
            }
            if (!eventPath) {
                if (originalWrapperTarget instanceof wrappers.Window) {
                    win = originalWrapperTarget;
                    eventPath = [];
                } else {
                    eventPath = getEventPath(originalWrapperTarget, event);
                    if (!isLoadLikeEvent(event)) {
                        var doc = eventPath[eventPath.length - 1];
                        if (doc instanceof wrappers.Document) win = doc.defaultView;
                    }
                }
            }
            eventPathTable.set(event, eventPath);
            if (dispatchCapturing(event, eventPath, win, overrideTarget)) {
                if (dispatchAtTarget(event, eventPath, win, overrideTarget)) {
                    dispatchBubbling(event, eventPath, win, overrideTarget);
                }
            }
            eventPhaseTable.set(event, NONE);
            currentTargetTable.delete(event, null);
            currentlyDispatchingEvents.delete(event);
            return event.defaultPrevented;
        }
        function dispatchCapturing(event, eventPath, win, overrideTarget) {
            var phase = CAPTURING_PHASE;
            if (win) {
                if (!invoke(win, event, phase, eventPath, overrideTarget)) return false;
            }
            for (var i = eventPath.length - 1; i > 0; i--) {
                if (!invoke(eventPath[i], event, phase, eventPath, overrideTarget)) return false;
            }
            return true;
        }
        function dispatchAtTarget(event, eventPath, win, overrideTarget) {
            var phase = AT_TARGET;
            var currentTarget = eventPath[0] || win;
            return invoke(currentTarget, event, phase, eventPath, overrideTarget);
        }
        function dispatchBubbling(event, eventPath, win, overrideTarget) {
            var phase = BUBBLING_PHASE;
            for (var i = 1; i < eventPath.length; i++) {
                if (!invoke(eventPath[i], event, phase, eventPath, overrideTarget)) return;
            }
            if (win && eventPath.length > 0) {
                invoke(win, event, phase, eventPath, overrideTarget);
            }
        }
        function invoke(currentTarget, event, phase, eventPath, overrideTarget) {
            var listeners = listenersTable.get(currentTarget);
            if (!listeners) return true;
            var target = overrideTarget || eventRetargetting(eventPath, currentTarget);
            if (target === currentTarget) {
                if (phase === CAPTURING_PHASE) return true;
                if (phase === BUBBLING_PHASE) phase = AT_TARGET;
            } else if (phase === BUBBLING_PHASE && !event.bubbles) {
                return true;
            }
            if ("relatedTarget" in event) {
                var originalEvent = unwrap(event);
                var unwrappedRelatedTarget = originalEvent.relatedTarget;
                if (unwrappedRelatedTarget) {
                    if (unwrappedRelatedTarget instanceof Object && unwrappedRelatedTarget.addEventListener) {
                        var relatedTarget = wrap(unwrappedRelatedTarget);
                        var adjusted = relatedTargetResolution(event, currentTarget, relatedTarget);
                        if (adjusted === target) return true;
                    } else {
                        adjusted = null;
                    }
                    relatedTargetTable.set(event, adjusted);
                }
            }
            eventPhaseTable.set(event, phase);
            var type = event.type;
            var anyRemoved = false;
            targetTable.set(event, target);
            currentTargetTable.set(event, currentTarget);
            listeners.depth++;
            for (var i = 0, len = listeners.length; i < len; i++) {
                var listener = listeners[i];
                if (listener.removed) {
                    anyRemoved = true;
                    continue;
                }
                if (listener.type !== type || !listener.capture && phase === CAPTURING_PHASE || listener.capture && phase === BUBBLING_PHASE) {
                    continue;
                }
                try {
                    if (typeof listener.handler === "function") listener.handler.call(currentTarget, event); else listener.handler.handleEvent(event);
                    if (stopImmediatePropagationTable.get(event)) return false;
                } catch (ex) {
                    if (!pendingError) pendingError = ex;
                }
            }
            listeners.depth--;
            if (anyRemoved && listeners.depth === 0) {
                var copy = listeners.slice();
                listeners.length = 0;
                for (var i = 0; i < copy.length; i++) {
                    if (!copy[i].removed) listeners.push(copy[i]);
                }
            }
            return !stopPropagationTable.get(event);
        }
        function Listener(type, handler, capture) {
            this.type = type;
            this.handler = handler;
            this.capture = Boolean(capture);
        }
        Listener.prototype = {
            equals: function (that) {
                return this.handler === that.handler && this.type === that.type && this.capture === that.capture;
            },
            get removed() {
                return this.handler === null;
            },
            remove: function () {
                this.handler = null;
            }
        };
        var OriginalEvent = window.Event;
        OriginalEvent.prototype.polymerBlackList_ = {
            returnValue: true,
            keyLocation: true
        };
        function Event(type, options) {
            if (type instanceof OriginalEvent) {
                var impl = type;
                if (!OriginalBeforeUnloadEvent && impl.type === "beforeunload" && !(this instanceof BeforeUnloadEvent)) {
                    return new BeforeUnloadEvent(impl);
                }
                setWrapper(impl, this);
            } else {
                return wrap(constructEvent(OriginalEvent, "Event", type, options));
            }
        }
        Event.prototype = {
            get target() {
                return targetTable.get(this);
            },
            get currentTarget() {
                return currentTargetTable.get(this);
            },
            get eventPhase() {
                return eventPhaseTable.get(this);
            },
            get path() {
                var eventPath = eventPathTable.get(this);
                if (!eventPath) return [];
                return eventPath.slice();
            },
            stopPropagation: function () {
                stopPropagationTable.set(this, true);
            },
            stopImmediatePropagation: function () {
                stopPropagationTable.set(this, true);
                stopImmediatePropagationTable.set(this, true);
            }
        };
        var supportsDefaultPrevented = function () {
            var e = document.createEvent("Event");
            e.initEvent("test", true, true);
            e.preventDefault();
            return e.defaultPrevented;
        }();
        if (!supportsDefaultPrevented) {
            Event.prototype.preventDefault = function () {
                if (!this.cancelable) return;
                unsafeUnwrap(this).preventDefault();
                Object.defineProperty(this, "defaultPrevented", {
                    get: function () {
                        return true;
                    },
                    configurable: true
                });
            };
        }
        registerWrapper(OriginalEvent, Event, document.createEvent("Event"));
        function unwrapOptions(options) {
            if (!options || !options.relatedTarget) return options;
            return Object.create(options, {
                relatedTarget: {
                    value: unwrap(options.relatedTarget)
                }
            });
        }
        function registerGenericEvent(name, SuperEvent, prototype) {
            var OriginalEvent = window[name];
            var GenericEvent = function (type, options) {
                if (type instanceof OriginalEvent) setWrapper(type, this); else return wrap(constructEvent(OriginalEvent, name, type, options));
            };
            GenericEvent.prototype = Object.create(SuperEvent.prototype);
            if (prototype) mixin(GenericEvent.prototype, prototype);
            if (OriginalEvent) {
                try {
                    registerWrapper(OriginalEvent, GenericEvent, new OriginalEvent("temp"));
                } catch (ex) {
                    registerWrapper(OriginalEvent, GenericEvent, document.createEvent(name));
                }
            }
            return GenericEvent;
        }
        var UIEvent = registerGenericEvent("UIEvent", Event);
        var CustomEvent = registerGenericEvent("CustomEvent", Event);
        var relatedTargetProto = {
            get relatedTarget() {
                var relatedTarget = relatedTargetTable.get(this);
                if (relatedTarget !== undefined) return relatedTarget;
                return wrap(unwrap(this).relatedTarget);
            }
        };
        function getInitFunction(name, relatedTargetIndex) {
            return function () {
                arguments[relatedTargetIndex] = unwrap(arguments[relatedTargetIndex]);
                var impl = unwrap(this);
                impl[name].apply(impl, arguments);
            };
        }
        var mouseEventProto = mixin({
            initMouseEvent: getInitFunction("initMouseEvent", 14)
        }, relatedTargetProto);
        var focusEventProto = mixin({
            initFocusEvent: getInitFunction("initFocusEvent", 5)
        }, relatedTargetProto);
        var MouseEvent = registerGenericEvent("MouseEvent", UIEvent, mouseEventProto);
        var FocusEvent = registerGenericEvent("FocusEvent", UIEvent, focusEventProto);
        var defaultInitDicts = Object.create(null);
        var supportsEventConstructors = function () {
            try {
                new window.FocusEvent("focus");
            } catch (ex) {
                return false;
            }
            return true;
        }();
        function constructEvent(OriginalEvent, name, type, options) {
            if (supportsEventConstructors) return new OriginalEvent(type, unwrapOptions(options));
            var event = unwrap(document.createEvent(name));
            var defaultDict = defaultInitDicts[name];
            var args = [type];
            Object.keys(defaultDict).forEach(function (key) {
                var v = options != null && key in options ? options[key] : defaultDict[key];
                if (key === "relatedTarget") v = unwrap(v);
                args.push(v);
            });
            event["init" + name].apply(event, args);
            return event;
        }
        if (!supportsEventConstructors) {
            var configureEventConstructor = function (name, initDict, superName) {
                if (superName) {
                    var superDict = defaultInitDicts[superName];
                    initDict = mixin(mixin({}, superDict), initDict);
                }
                defaultInitDicts[name] = initDict;
            };
            configureEventConstructor("Event", {
                bubbles: false,
                cancelable: false
            });
            configureEventConstructor("CustomEvent", {
                detail: null
            }, "Event");
            configureEventConstructor("UIEvent", {
                view: null,
                detail: 0
            }, "Event");
            configureEventConstructor("MouseEvent", {
                screenX: 0,
                screenY: 0,
                clientX: 0,
                clientY: 0,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                button: 0,
                relatedTarget: null
            }, "UIEvent");
            configureEventConstructor("FocusEvent", {
                relatedTarget: null
            }, "UIEvent");
        }
        var OriginalBeforeUnloadEvent = window.BeforeUnloadEvent;
        function BeforeUnloadEvent(impl) {
            Event.call(this, impl);
        }
        BeforeUnloadEvent.prototype = Object.create(Event.prototype);
        mixin(BeforeUnloadEvent.prototype, {
            get returnValue() {
                return unsafeUnwrap(this).returnValue;
            },
            set returnValue(v) {
                unsafeUnwrap(this).returnValue = v;
            }
        });
        if (OriginalBeforeUnloadEvent) registerWrapper(OriginalBeforeUnloadEvent, BeforeUnloadEvent);
        function isValidListener(fun) {
            if (typeof fun === "function") return true;
            return fun && fun.handleEvent;
        }
        function isMutationEvent(type) {
            switch (type) {
                case "DOMAttrModified":
                case "DOMAttributeNameChanged":
                case "DOMCharacterDataModified":
                case "DOMElementNameChanged":
                case "DOMNodeInserted":
                case "DOMNodeInsertedIntoDocument":
                case "DOMNodeRemoved":
                case "DOMNodeRemovedFromDocument":
                case "DOMSubtreeModified":
                    return true;
            }
            return false;
        }
        var OriginalEventTarget = window.EventTarget;
        function EventTarget(impl) {
            setWrapper(impl, this);
        }
        var methodNames = ["addEventListener", "removeEventListener", "dispatchEvent"];
        [Node, Window].forEach(function (constructor) {
            var p = constructor.prototype;
            methodNames.forEach(function (name) {
                Object.defineProperty(p, name + "_", {
                    value: p[name]
                });
            });
        });
        function getTargetToListenAt(wrapper) {
            if (wrapper instanceof wrappers.ShadowRoot) wrapper = wrapper.host;
            return unwrap(wrapper);
        }
        EventTarget.prototype = {
            addEventListener: function (type, fun, capture) {
                if (!isValidListener(fun) || isMutationEvent(type)) return;
                var listener = new Listener(type, fun, capture);
                var listeners = listenersTable.get(this);
                if (!listeners) {
                    listeners = [];
                    listeners.depth = 0;
                    listenersTable.set(this, listeners);
                } else {
                    for (var i = 0; i < listeners.length; i++) {
                        if (listener.equals(listeners[i])) return;
                    }
                }
                listeners.push(listener);
                var target = getTargetToListenAt(this);
                target.addEventListener_(type, dispatchOriginalEvent, true);
            },
            removeEventListener: function (type, fun, capture) {
                capture = Boolean(capture);
                var listeners = listenersTable.get(this);
                if (!listeners) return;
                var count = 0, found = false;
                for (var i = 0; i < listeners.length; i++) {
                    if (listeners[i].type === type && listeners[i].capture === capture) {
                        count++;
                        if (listeners[i].handler === fun) {
                            found = true;
                            listeners[i].remove();
                        }
                    }
                }
                if (found && count === 1) {
                    var target = getTargetToListenAt(this);
                    target.removeEventListener_(type, dispatchOriginalEvent, true);
                }
            },
            dispatchEvent: function (event) {
                var nativeEvent = unwrap(event);
                var eventType = nativeEvent.type;
                handledEventsTable.set(nativeEvent, false);
                scope.renderAllPending();
                var tempListener;
                if (!hasListenerInAncestors(this, eventType)) {
                    tempListener = function () { };
                    this.addEventListener(eventType, tempListener, true);
                }
                try {
                    return unwrap(this).dispatchEvent_(nativeEvent);
                } finally {
                    if (tempListener) this.removeEventListener(eventType, tempListener, true);
                }
            }
        };
        function hasListener(node, type) {
            var listeners = listenersTable.get(node);
            if (listeners) {
                for (var i = 0; i < listeners.length; i++) {
                    if (!listeners[i].removed && listeners[i].type === type) return true;
                }
            }
            return false;
        }
        function hasListenerInAncestors(target, type) {
            for (var node = unwrap(target); node; node = node.parentNode) {
                if (hasListener(wrap(node), type)) return true;
            }
            return false;
        }
        if (OriginalEventTarget) registerWrapper(OriginalEventTarget, EventTarget);
        function wrapEventTargetMethods(constructors) {
            forwardMethodsToWrapper(constructors, methodNames);
        }
        var originalElementFromPoint = document.elementFromPoint;
        function elementFromPoint(self, document, x, y) {
            scope.renderAllPending();
            var element = wrap(originalElementFromPoint.call(unsafeUnwrap(document), x, y));
            if (!element) return null;
            var path = getEventPath(element, null);
            var idx = path.lastIndexOf(self);
            if (idx == -1) return null; else path = path.slice(0, idx);
            return eventRetargetting(path, self);
        }
        function getEventHandlerGetter(name) {
            return function () {
                var inlineEventHandlers = eventHandlersTable.get(this);
                return inlineEventHandlers && inlineEventHandlers[name] && inlineEventHandlers[name].value || null;
            };
        }
        function getEventHandlerSetter(name) {
            var eventType = name.slice(2);
            return function (value) {
                var inlineEventHandlers = eventHandlersTable.get(this);
                if (!inlineEventHandlers) {
                    inlineEventHandlers = Object.create(null);
                    eventHandlersTable.set(this, inlineEventHandlers);
                }
                var old = inlineEventHandlers[name];
                if (old) this.removeEventListener(eventType, old.wrapped, false);
                if (typeof value === "function") {
                    var wrapped = function (e) {
                        var rv = value.call(this, e);
                        if (rv === false) e.preventDefault(); else if (name === "onbeforeunload" && typeof rv === "string") e.returnValue = rv;
                    };
                    this.addEventListener(eventType, wrapped, false);
                    inlineEventHandlers[name] = {
                        value: value,
                        wrapped: wrapped
                    };
                }
            };
        }
        scope.elementFromPoint = elementFromPoint;
        scope.getEventHandlerGetter = getEventHandlerGetter;
        scope.getEventHandlerSetter = getEventHandlerSetter;
        scope.wrapEventTargetMethods = wrapEventTargetMethods;
        scope.wrappers.BeforeUnloadEvent = BeforeUnloadEvent;
        scope.wrappers.CustomEvent = CustomEvent;
        scope.wrappers.Event = Event;
        scope.wrappers.EventTarget = EventTarget;
        scope.wrappers.FocusEvent = FocusEvent;
        scope.wrappers.MouseEvent = MouseEvent;
        scope.wrappers.UIEvent = UIEvent;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var UIEvent = scope.wrappers.UIEvent;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var setWrapper = scope.setWrapper;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var wrap = scope.wrap;
        var OriginalTouchEvent = window.TouchEvent;
        if (!OriginalTouchEvent) return;
        var nativeEvent;
        try {
            nativeEvent = document.createEvent("TouchEvent");
        } catch (ex) {
            return;
        }
        var nonEnumDescriptor = {
            enumerable: false
        };
        function nonEnum(obj, prop) {
            Object.defineProperty(obj, prop, nonEnumDescriptor);
        }
        function Touch(impl) {
            setWrapper(impl, this);
        }
        Touch.prototype = {
            get target() {
                return wrap(unsafeUnwrap(this).target);
            }
        };
        var descr = {
            configurable: true,
            enumerable: true,
            get: null
        };
        ["clientX", "clientY", "screenX", "screenY", "pageX", "pageY", "identifier", "webkitRadiusX", "webkitRadiusY", "webkitRotationAngle", "webkitForce"].forEach(function (name) {
            descr.get = function () {
                return unsafeUnwrap(this)[name];
            };
            Object.defineProperty(Touch.prototype, name, descr);
        });
        function TouchList() {
            this.length = 0;
            nonEnum(this, "length");
        }
        TouchList.prototype = {
            item: function (index) {
                return this[index];
            }
        };
        function wrapTouchList(nativeTouchList) {
            var list = new TouchList();
            for (var i = 0; i < nativeTouchList.length; i++) {
                list[i] = new Touch(nativeTouchList[i]);
            }
            list.length = i;
            return list;
        }
        function TouchEvent(impl) {
            UIEvent.call(this, impl);
        }
        TouchEvent.prototype = Object.create(UIEvent.prototype);
        mixin(TouchEvent.prototype, {
            get touches() {
                return wrapTouchList(unsafeUnwrap(this).touches);
            },
            get targetTouches() {
                return wrapTouchList(unsafeUnwrap(this).targetTouches);
            },
            get changedTouches() {
                return wrapTouchList(unsafeUnwrap(this).changedTouches);
            },
            initTouchEvent: function () {
                throw new Error("Not implemented");
            }
        });
        registerWrapper(OriginalTouchEvent, TouchEvent, nativeEvent);
        scope.wrappers.Touch = Touch;
        scope.wrappers.TouchEvent = TouchEvent;
        scope.wrappers.TouchList = TouchList;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var unsafeUnwrap = scope.unsafeUnwrap;
        var wrap = scope.wrap;
        var nonEnumDescriptor = {
            enumerable: false
        };
        function nonEnum(obj, prop) {
            Object.defineProperty(obj, prop, nonEnumDescriptor);
        }
        function NodeList() {
            this.length = 0;
            nonEnum(this, "length");
        }
        NodeList.prototype = {
            item: function (index) {
                return this[index];
            }
        };
        nonEnum(NodeList.prototype, "item");
        function wrapNodeList(list) {
            if (list == null) return list;
            var wrapperList = new NodeList();
            for (var i = 0, length = list.length; i < length; i++) {
                wrapperList[i] = wrap(list[i]);
            }
            wrapperList.length = length;
            return wrapperList;
        }
        function addWrapNodeListMethod(wrapperConstructor, name) {
            wrapperConstructor.prototype[name] = function () {
                return wrapNodeList(unsafeUnwrap(this)[name].apply(unsafeUnwrap(this), arguments));
            };
        }
        scope.wrappers.NodeList = NodeList;
        scope.addWrapNodeListMethod = addWrapNodeListMethod;
        scope.wrapNodeList = wrapNodeList;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        scope.wrapHTMLCollection = scope.wrapNodeList;
        scope.wrappers.HTMLCollection = scope.wrappers.NodeList;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var EventTarget = scope.wrappers.EventTarget;
        var NodeList = scope.wrappers.NodeList;
        var TreeScope = scope.TreeScope;
        var assert = scope.assert;
        var defineWrapGetter = scope.defineWrapGetter;
        var enqueueMutation = scope.enqueueMutation;
        var getTreeScope = scope.getTreeScope;
        var isWrapper = scope.isWrapper;
        var mixin = scope.mixin;
        var registerTransientObservers = scope.registerTransientObservers;
        var registerWrapper = scope.registerWrapper;
        var setTreeScope = scope.setTreeScope;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var unwrap = scope.unwrap;
        var unwrapIfNeeded = scope.unwrapIfNeeded;
        var wrap = scope.wrap;
        var wrapIfNeeded = scope.wrapIfNeeded;
        var wrappers = scope.wrappers;
        function assertIsNodeWrapper(node) {
            assert(node instanceof Node);
        }
        function createOneElementNodeList(node) {
            var nodes = new NodeList();
            nodes[0] = node;
            nodes.length = 1;
            return nodes;
        }
        var surpressMutations = false;
        function enqueueRemovalForInsertedNodes(node, parent, nodes) {
            enqueueMutation(parent, "childList", {
                removedNodes: nodes,
                previousSibling: node.previousSibling,
                nextSibling: node.nextSibling
            });
        }
        function enqueueRemovalForInsertedDocumentFragment(df, nodes) {
            enqueueMutation(df, "childList", {
                removedNodes: nodes
            });
        }
        function collectNodes(node, parentNode, previousNode, nextNode) {
            if (node instanceof DocumentFragment) {
                var nodes = collectNodesForDocumentFragment(node);
                surpressMutations = true;
                for (var i = nodes.length - 1; i >= 0; i--) {
                    node.removeChild(nodes[i]);
                    nodes[i].parentNode_ = parentNode;
                }
                surpressMutations = false;
                for (var i = 0; i < nodes.length; i++) {
                    nodes[i].previousSibling_ = nodes[i - 1] || previousNode;
                    nodes[i].nextSibling_ = nodes[i + 1] || nextNode;
                }
                if (previousNode) previousNode.nextSibling_ = nodes[0];
                if (nextNode) nextNode.previousSibling_ = nodes[nodes.length - 1];
                return nodes;
            }
            var nodes = createOneElementNodeList(node);
            var oldParent = node.parentNode;
            if (oldParent) {
                oldParent.removeChild(node);
            }
            node.parentNode_ = parentNode;
            node.previousSibling_ = previousNode;
            node.nextSibling_ = nextNode;
            if (previousNode) previousNode.nextSibling_ = node;
            if (nextNode) nextNode.previousSibling_ = node;
            return nodes;
        }
        function collectNodesNative(node) {
            if (node instanceof DocumentFragment) return collectNodesForDocumentFragment(node);
            var nodes = createOneElementNodeList(node);
            var oldParent = node.parentNode;
            if (oldParent) enqueueRemovalForInsertedNodes(node, oldParent, nodes);
            return nodes;
        }
        function collectNodesForDocumentFragment(node) {
            var nodes = new NodeList();
            var i = 0;
            for (var child = node.firstChild; child; child = child.nextSibling) {
                nodes[i++] = child;
            }
            nodes.length = i;
            enqueueRemovalForInsertedDocumentFragment(node, nodes);
            return nodes;
        }
        function snapshotNodeList(nodeList) {
            return nodeList;
        }
        function nodeWasAdded(node, treeScope) {
            setTreeScope(node, treeScope);
            node.nodeIsInserted_();
        }
        function nodesWereAdded(nodes, parent) {
            var treeScope = getTreeScope(parent);
            for (var i = 0; i < nodes.length; i++) {
                nodeWasAdded(nodes[i], treeScope);
            }
        }
        function nodeWasRemoved(node) {
            setTreeScope(node, new TreeScope(node, null));
        }
        function nodesWereRemoved(nodes) {
            for (var i = 0; i < nodes.length; i++) {
                nodeWasRemoved(nodes[i]);
            }
        }
        function ensureSameOwnerDocument(parent, child) {
            var ownerDoc = parent.nodeType === Node.DOCUMENT_NODE ? parent : parent.ownerDocument;
            if (ownerDoc !== child.ownerDocument) ownerDoc.adoptNode(child);
        }
        function adoptNodesIfNeeded(owner, nodes) {
            if (!nodes.length) return;
            var ownerDoc = owner.ownerDocument;
            if (ownerDoc === nodes[0].ownerDocument) return;
            for (var i = 0; i < nodes.length; i++) {
                scope.adoptNodeNoRemove(nodes[i], ownerDoc);
            }
        }
        function unwrapNodesForInsertion(owner, nodes) {
            adoptNodesIfNeeded(owner, nodes);
            var length = nodes.length;
            if (length === 1) return unwrap(nodes[0]);
            var df = unwrap(owner.ownerDocument.createDocumentFragment());
            for (var i = 0; i < length; i++) {
                df.appendChild(unwrap(nodes[i]));
            }
            return df;
        }
        function clearChildNodes(wrapper) {
            if (wrapper.firstChild_ !== undefined) {
                var child = wrapper.firstChild_;
                while (child) {
                    var tmp = child;
                    child = child.nextSibling_;
                    tmp.parentNode_ = tmp.previousSibling_ = tmp.nextSibling_ = undefined;
                }
            }
            wrapper.firstChild_ = wrapper.lastChild_ = undefined;
        }
        function removeAllChildNodes(wrapper) {
            if (wrapper.invalidateShadowRenderer()) {
                var childWrapper = wrapper.firstChild;
                while (childWrapper) {
                    assert(childWrapper.parentNode === wrapper);
                    var nextSibling = childWrapper.nextSibling;
                    var childNode = unwrap(childWrapper);
                    var parentNode = childNode.parentNode;
                    if (parentNode) originalRemoveChild.call(parentNode, childNode);
                    childWrapper.previousSibling_ = childWrapper.nextSibling_ = childWrapper.parentNode_ = null;
                    childWrapper = nextSibling;
                }
                wrapper.firstChild_ = wrapper.lastChild_ = null;
            } else {
                var node = unwrap(wrapper);
                var child = node.firstChild;
                var nextSibling;
                while (child) {
                    nextSibling = child.nextSibling;
                    originalRemoveChild.call(node, child);
                    child = nextSibling;
                }
            }
        }
        function invalidateParent(node) {
            var p = node.parentNode;
            return p && p.invalidateShadowRenderer();
        }
        function cleanupNodes(nodes) {
            for (var i = 0, n; i < nodes.length; i++) {
                n = nodes[i];
                n.parentNode.removeChild(n);
            }
        }
        var originalImportNode = document.importNode;
        var originalCloneNode = window.Node.prototype.cloneNode;
        function cloneNode(node, deep, opt_doc) {
            var clone;
            if (opt_doc) clone = wrap(originalImportNode.call(opt_doc, unsafeUnwrap(node), false)); else clone = wrap(originalCloneNode.call(unsafeUnwrap(node), false));
            if (deep) {
                for (var child = node.firstChild; child; child = child.nextSibling) {
                    clone.appendChild(cloneNode(child, true, opt_doc));
                }
                if (node instanceof wrappers.HTMLTemplateElement) {
                    var cloneContent = clone.content;
                    for (var child = node.content.firstChild; child; child = child.nextSibling) {
                        cloneContent.appendChild(cloneNode(child, true, opt_doc));
                    }
                }
            }
            return clone;
        }
        function contains(self, child) {
            if (!child || getTreeScope(self) !== getTreeScope(child)) return false;
            for (var node = child; node; node = node.parentNode) {
                if (node === self) return true;
            }
            return false;
        }
        var OriginalNode = window.Node;
        function Node(original) {
            assert(original instanceof OriginalNode);
            EventTarget.call(this, original);
            this.parentNode_ = undefined;
            this.firstChild_ = undefined;
            this.lastChild_ = undefined;
            this.nextSibling_ = undefined;
            this.previousSibling_ = undefined;
            this.treeScope_ = undefined;
        }
        var OriginalDocumentFragment = window.DocumentFragment;
        var originalAppendChild = OriginalNode.prototype.appendChild;
        var originalCompareDocumentPosition = OriginalNode.prototype.compareDocumentPosition;
        var originalIsEqualNode = OriginalNode.prototype.isEqualNode;
        var originalInsertBefore = OriginalNode.prototype.insertBefore;
        var originalRemoveChild = OriginalNode.prototype.removeChild;
        var originalReplaceChild = OriginalNode.prototype.replaceChild;
        var isIEOrEdge = /Trident|Edge/.test(navigator.userAgent);
        var removeChildOriginalHelper = isIEOrEdge ? function (parent, child) {
            try {
                originalRemoveChild.call(parent, child);
            } catch (ex) {
                if (!(parent instanceof OriginalDocumentFragment)) throw ex;
            }
        } : function (parent, child) {
            originalRemoveChild.call(parent, child);
        };
        Node.prototype = Object.create(EventTarget.prototype);
        mixin(Node.prototype, {
            appendChild: function (childWrapper) {
                return this.insertBefore(childWrapper, null);
            },
            insertBefore: function (childWrapper, refWrapper) {
                assertIsNodeWrapper(childWrapper);
                var refNode;
                if (refWrapper) {
                    if (isWrapper(refWrapper)) {
                        refNode = unwrap(refWrapper);
                    } else {
                        refNode = refWrapper;
                        refWrapper = wrap(refNode);
                    }
                } else {
                    refWrapper = null;
                    refNode = null;
                }
                refWrapper && assert(refWrapper.parentNode === this);
                var nodes;
                var previousNode = refWrapper ? refWrapper.previousSibling : this.lastChild;
                var useNative = !this.invalidateShadowRenderer() && !invalidateParent(childWrapper);
                if (useNative) nodes = collectNodesNative(childWrapper); else nodes = collectNodes(childWrapper, this, previousNode, refWrapper);
                if (useNative) {
                    ensureSameOwnerDocument(this, childWrapper);
                    clearChildNodes(this);
                    originalInsertBefore.call(unsafeUnwrap(this), unwrap(childWrapper), refNode);
                } else {
                    if (!previousNode) this.firstChild_ = nodes[0];
                    if (!refWrapper) {
                        this.lastChild_ = nodes[nodes.length - 1];
                        if (this.firstChild_ === undefined) this.firstChild_ = this.firstChild;
                    }
                    var parentNode = refNode ? refNode.parentNode : unsafeUnwrap(this);
                    if (parentNode) {
                        originalInsertBefore.call(parentNode, unwrapNodesForInsertion(this, nodes), refNode);
                    } else {
                        adoptNodesIfNeeded(this, nodes);
                    }
                }
                enqueueMutation(this, "childList", {
                    addedNodes: nodes,
                    nextSibling: refWrapper,
                    previousSibling: previousNode
                });
                nodesWereAdded(nodes, this);
                return childWrapper;
            },
            removeChild: function (childWrapper) {
                assertIsNodeWrapper(childWrapper);
                if (childWrapper.parentNode !== this) {
                    var found = false;
                    var childNodes = this.childNodes;
                    for (var ieChild = this.firstChild; ieChild; ieChild = ieChild.nextSibling) {
                        if (ieChild === childWrapper) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        throw new Error("NotFoundError");
                    }
                }
                var childNode = unwrap(childWrapper);
                var childWrapperNextSibling = childWrapper.nextSibling;
                var childWrapperPreviousSibling = childWrapper.previousSibling;
                if (this.invalidateShadowRenderer()) {
                    var thisFirstChild = this.firstChild;
                    var thisLastChild = this.lastChild;
                    var parentNode = childNode.parentNode;
                    if (parentNode) removeChildOriginalHelper(parentNode, childNode);
                    if (thisFirstChild === childWrapper) this.firstChild_ = childWrapperNextSibling;
                    if (thisLastChild === childWrapper) this.lastChild_ = childWrapperPreviousSibling;
                    if (childWrapperPreviousSibling) childWrapperPreviousSibling.nextSibling_ = childWrapperNextSibling;
                    if (childWrapperNextSibling) {
                        childWrapperNextSibling.previousSibling_ = childWrapperPreviousSibling;
                    }
                    childWrapper.previousSibling_ = childWrapper.nextSibling_ = childWrapper.parentNode_ = undefined;
                } else {
                    clearChildNodes(this);
                    removeChildOriginalHelper(unsafeUnwrap(this), childNode);
                }
                if (!surpressMutations) {
                    enqueueMutation(this, "childList", {
                        removedNodes: createOneElementNodeList(childWrapper),
                        nextSibling: childWrapperNextSibling,
                        previousSibling: childWrapperPreviousSibling
                    });
                }
                registerTransientObservers(this, childWrapper);
                return childWrapper;
            },
            replaceChild: function (newChildWrapper, oldChildWrapper) {
                assertIsNodeWrapper(newChildWrapper);
                var oldChildNode;
                if (isWrapper(oldChildWrapper)) {
                    oldChildNode = unwrap(oldChildWrapper);
                } else {
                    oldChildNode = oldChildWrapper;
                    oldChildWrapper = wrap(oldChildNode);
                }
                if (oldChildWrapper.parentNode !== this) {
                    throw new Error("NotFoundError");
                }
                var nextNode = oldChildWrapper.nextSibling;
                var previousNode = oldChildWrapper.previousSibling;
                var nodes;
                var useNative = !this.invalidateShadowRenderer() && !invalidateParent(newChildWrapper);
                if (useNative) {
                    nodes = collectNodesNative(newChildWrapper);
                } else {
                    if (nextNode === newChildWrapper) nextNode = newChildWrapper.nextSibling;
                    nodes = collectNodes(newChildWrapper, this, previousNode, nextNode);
                }
                if (!useNative) {
                    if (this.firstChild === oldChildWrapper) this.firstChild_ = nodes[0];
                    if (this.lastChild === oldChildWrapper) this.lastChild_ = nodes[nodes.length - 1];
                    oldChildWrapper.previousSibling_ = oldChildWrapper.nextSibling_ = oldChildWrapper.parentNode_ = undefined;
                    if (oldChildNode.parentNode) {
                        originalReplaceChild.call(oldChildNode.parentNode, unwrapNodesForInsertion(this, nodes), oldChildNode);
                    }
                } else {
                    ensureSameOwnerDocument(this, newChildWrapper);
                    clearChildNodes(this);
                    originalReplaceChild.call(unsafeUnwrap(this), unwrap(newChildWrapper), oldChildNode);
                }
                enqueueMutation(this, "childList", {
                    addedNodes: nodes,
                    removedNodes: createOneElementNodeList(oldChildWrapper),
                    nextSibling: nextNode,
                    previousSibling: previousNode
                });
                nodeWasRemoved(oldChildWrapper);
                nodesWereAdded(nodes, this);
                return oldChildWrapper;
            },
            nodeIsInserted_: function () {
                for (var child = this.firstChild; child; child = child.nextSibling) {
                    child.nodeIsInserted_();
                }
            },
            hasChildNodes: function () {
                return this.firstChild !== null;
            },
            get parentNode() {
                return this.parentNode_ !== undefined ? this.parentNode_ : wrap(unsafeUnwrap(this).parentNode);
            },
            get firstChild() {
                return this.firstChild_ !== undefined ? this.firstChild_ : wrap(unsafeUnwrap(this).firstChild);
            },
            get lastChild() {
                return this.lastChild_ !== undefined ? this.lastChild_ : wrap(unsafeUnwrap(this).lastChild);
            },
            get nextSibling() {
                return this.nextSibling_ !== undefined ? this.nextSibling_ : wrap(unsafeUnwrap(this).nextSibling);
            },
            get previousSibling() {
                return this.previousSibling_ !== undefined ? this.previousSibling_ : wrap(unsafeUnwrap(this).previousSibling);
            },
            get parentElement() {
                var p = this.parentNode;
                while (p && p.nodeType !== Node.ELEMENT_NODE) {
                    p = p.parentNode;
                }
                return p;
            },
            get textContent() {
                var s = "";
                for (var child = this.firstChild; child; child = child.nextSibling) {
                    if (child.nodeType != Node.COMMENT_NODE) {
                        s += child.textContent;
                    }
                }
                return s;
            },
            set textContent(textContent) {
                if (textContent == null) textContent = "";
                var removedNodes = snapshotNodeList(this.childNodes);
                if (this.invalidateShadowRenderer()) {
                    removeAllChildNodes(this);
                    if (textContent !== "") {
                        var textNode = unsafeUnwrap(this).ownerDocument.createTextNode(textContent);
                        this.appendChild(textNode);
                    }
                } else {
                    clearChildNodes(this);
                    unsafeUnwrap(this).textContent = textContent;
                }
                var addedNodes = snapshotNodeList(this.childNodes);
                enqueueMutation(this, "childList", {
                    addedNodes: addedNodes,
                    removedNodes: removedNodes
                });
                nodesWereRemoved(removedNodes);
                nodesWereAdded(addedNodes, this);
            },
            get childNodes() {
                var wrapperList = new NodeList();
                var i = 0;
                for (var child = this.firstChild; child; child = child.nextSibling) {
                    wrapperList[i++] = child;
                }
                wrapperList.length = i;
                return wrapperList;
            },
            cloneNode: function (deep) {
                return cloneNode(this, deep);
            },
            contains: function (child) {
                return contains(this, wrapIfNeeded(child));
            },
            compareDocumentPosition: function (otherNode) {
                return originalCompareDocumentPosition.call(unsafeUnwrap(this), unwrapIfNeeded(otherNode));
            },
            isEqualNode: function (otherNode) {
                return originalIsEqualNode.call(unsafeUnwrap(this), unwrapIfNeeded(otherNode));
            },
            normalize: function () {
                var nodes = snapshotNodeList(this.childNodes);
                var remNodes = [];
                var s = "";
                var modNode;
                for (var i = 0, n; i < nodes.length; i++) {
                    n = nodes[i];
                    if (n.nodeType === Node.TEXT_NODE) {
                        if (!modNode && !n.data.length) this.removeChild(n); else if (!modNode) modNode = n; else {
                            s += n.data;
                            remNodes.push(n);
                        }
                    } else {
                        if (modNode && remNodes.length) {
                            modNode.data += s;
                            cleanupNodes(remNodes);
                        }
                        remNodes = [];
                        s = "";
                        modNode = null;
                        if (n.childNodes.length) n.normalize();
                    }
                }
                if (modNode && remNodes.length) {
                    modNode.data += s;
                    cleanupNodes(remNodes);
                }
            }
        });
        defineWrapGetter(Node, "ownerDocument");
        registerWrapper(OriginalNode, Node, document.createDocumentFragment());
        delete Node.prototype.querySelector;
        delete Node.prototype.querySelectorAll;
        Node.prototype = mixin(Object.create(EventTarget.prototype), Node.prototype);
        scope.cloneNode = cloneNode;
        scope.nodeWasAdded = nodeWasAdded;
        scope.nodeWasRemoved = nodeWasRemoved;
        scope.nodesWereAdded = nodesWereAdded;
        scope.nodesWereRemoved = nodesWereRemoved;
        scope.originalInsertBefore = originalInsertBefore;
        scope.originalRemoveChild = originalRemoveChild;
        scope.snapshotNodeList = snapshotNodeList;
        scope.wrappers.Node = Node;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLCollection = scope.wrappers.HTMLCollection;
        var NodeList = scope.wrappers.NodeList;
        var getTreeScope = scope.getTreeScope;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var wrap = scope.wrap;
        var originalDocumentQuerySelector = document.querySelector;
        var originalElementQuerySelector = document.documentElement.querySelector;
        var originalDocumentQuerySelectorAll = document.querySelectorAll;
        var originalElementQuerySelectorAll = document.documentElement.querySelectorAll;
        var originalDocumentGetElementsByTagName = document.getElementsByTagName;
        var originalElementGetElementsByTagName = document.documentElement.getElementsByTagName;
        var originalDocumentGetElementsByTagNameNS = document.getElementsByTagNameNS;
        var originalElementGetElementsByTagNameNS = document.documentElement.getElementsByTagNameNS;
        var OriginalElement = window.Element;
        var OriginalDocument = window.HTMLDocument || window.Document;
        function filterNodeList(list, index, result, deep) {
            var wrappedItem = null;
            var root = null;
            for (var i = 0, length = list.length; i < length; i++) {
                wrappedItem = wrap(list[i]);
                if (!deep && (root = getTreeScope(wrappedItem).root)) {
                    if (root instanceof scope.wrappers.ShadowRoot) {
                        continue;
                    }
                }
                result[index++] = wrappedItem;
            }
            return index;
        }
        function shimSelector(selector) {
            return String(selector).replace(/\/deep\/|::shadow|>>>/g, " ");
        }
        function shimMatchesSelector(selector) {
            return String(selector).replace(/:host\(([^\s]+)\)/g, "$1").replace(/([^\s]):host/g, "$1").replace(":host", "*").replace(/\^|\/shadow\/|\/shadow-deep\/|::shadow|\/deep\/|::content|>>>/g, " ");
        }
        function findOne(node, selector) {
            var m, el = node.firstElementChild;
            while (el) {
                if (el.matches(selector)) return el;
                m = findOne(el, selector);
                if (m) return m;
                el = el.nextElementSibling;
            }
            return null;
        }
        function matchesSelector(el, selector) {
            return el.matches(selector);
        }
        var XHTML_NS = "http://www.w3.org/1999/xhtml";
        function matchesTagName(el, localName, localNameLowerCase) {
            var ln = el.localName;
            return ln === localName || ln === localNameLowerCase && el.namespaceURI === XHTML_NS;
        }
        function matchesEveryThing() {
            return true;
        }
        function matchesLocalNameOnly(el, ns, localName) {
            return el.localName === localName;
        }
        function matchesNameSpace(el, ns) {
            return el.namespaceURI === ns;
        }
        function matchesLocalNameNS(el, ns, localName) {
            return el.namespaceURI === ns && el.localName === localName;
        }
        function findElements(node, index, result, p, arg0, arg1) {
            var el = node.firstElementChild;
            while (el) {
                if (p(el, arg0, arg1)) result[index++] = el;
                index = findElements(el, index, result, p, arg0, arg1);
                el = el.nextElementSibling;
            }
            return index;
        }
        function querySelectorAllFiltered(p, index, result, selector, deep) {
            var target = unsafeUnwrap(this);
            var list;
            var root = getTreeScope(this).root;
            if (root instanceof scope.wrappers.ShadowRoot) {
                return findElements(this, index, result, p, selector, null);
            } else if (target instanceof OriginalElement) {
                list = originalElementQuerySelectorAll.call(target, selector);
            } else if (target instanceof OriginalDocument) {
                list = originalDocumentQuerySelectorAll.call(target, selector);
            } else {
                return findElements(this, index, result, p, selector, null);
            }
            return filterNodeList(list, index, result, deep);
        }
        var SelectorsInterface = {
            querySelector: function (selector) {
                var shimmed = shimSelector(selector);
                var deep = shimmed !== selector;
                selector = shimmed;
                var target = unsafeUnwrap(this);
                var wrappedItem;
                var root = getTreeScope(this).root;
                if (root instanceof scope.wrappers.ShadowRoot) {
                    return findOne(this, selector);
                } else if (target instanceof OriginalElement) {
                    wrappedItem = wrap(originalElementQuerySelector.call(target, selector));
                } else if (target instanceof OriginalDocument) {
                    wrappedItem = wrap(originalDocumentQuerySelector.call(target, selector));
                } else {
                    return findOne(this, selector);
                }
                if (!wrappedItem) {
                    return wrappedItem;
                } else if (!deep && (root = getTreeScope(wrappedItem).root)) {
                    if (root instanceof scope.wrappers.ShadowRoot) {
                        return findOne(this, selector);
                    }
                }
                return wrappedItem;
            },
            querySelectorAll: function (selector) {
                var shimmed = shimSelector(selector);
                var deep = shimmed !== selector;
                selector = shimmed;
                var result = new NodeList();
                result.length = querySelectorAllFiltered.call(this, matchesSelector, 0, result, selector, deep);
                return result;
            }
        };
        var MatchesInterface = {
            matches: function (selector) {
                selector = shimMatchesSelector(selector);
                return scope.originalMatches.call(unsafeUnwrap(this), selector);
            }
        };
        function getElementsByTagNameFiltered(p, index, result, localName, lowercase) {
            var target = unsafeUnwrap(this);
            var list;
            var root = getTreeScope(this).root;
            if (root instanceof scope.wrappers.ShadowRoot) {
                return findElements(this, index, result, p, localName, lowercase);
            } else if (target instanceof OriginalElement) {
                list = originalElementGetElementsByTagName.call(target, localName, lowercase);
            } else if (target instanceof OriginalDocument) {
                list = originalDocumentGetElementsByTagName.call(target, localName, lowercase);
            } else {
                return findElements(this, index, result, p, localName, lowercase);
            }
            return filterNodeList(list, index, result, false);
        }
        function getElementsByTagNameNSFiltered(p, index, result, ns, localName) {
            var target = unsafeUnwrap(this);
            var list;
            var root = getTreeScope(this).root;
            if (root instanceof scope.wrappers.ShadowRoot) {
                return findElements(this, index, result, p, ns, localName);
            } else if (target instanceof OriginalElement) {
                list = originalElementGetElementsByTagNameNS.call(target, ns, localName);
            } else if (target instanceof OriginalDocument) {
                list = originalDocumentGetElementsByTagNameNS.call(target, ns, localName);
            } else {
                return findElements(this, index, result, p, ns, localName);
            }
            return filterNodeList(list, index, result, false);
        }
        var GetElementsByInterface = {
            getElementsByTagName: function (localName) {
                var result = new HTMLCollection();
                var match = localName === "*" ? matchesEveryThing : matchesTagName;
                result.length = getElementsByTagNameFiltered.call(this, match, 0, result, localName, localName.toLowerCase());
                return result;
            },
            getElementsByClassName: function (className) {
                return this.querySelectorAll("." + className);
            },
            getElementsByTagNameNS: function (ns, localName) {
                var result = new HTMLCollection();
                var match = null;
                if (ns === "*") {
                    match = localName === "*" ? matchesEveryThing : matchesLocalNameOnly;
                } else {
                    match = localName === "*" ? matchesNameSpace : matchesLocalNameNS;
                }
                result.length = getElementsByTagNameNSFiltered.call(this, match, 0, result, ns || null, localName);
                return result;
            }
        };
        scope.GetElementsByInterface = GetElementsByInterface;
        scope.SelectorsInterface = SelectorsInterface;
        scope.MatchesInterface = MatchesInterface;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var NodeList = scope.wrappers.NodeList;
        function forwardElement(node) {
            while (node && node.nodeType !== Node.ELEMENT_NODE) {
                node = node.nextSibling;
            }
            return node;
        }
        function backwardsElement(node) {
            while (node && node.nodeType !== Node.ELEMENT_NODE) {
                node = node.previousSibling;
            }
            return node;
        }
        var ParentNodeInterface = {
            get firstElementChild() {
                return forwardElement(this.firstChild);
            },
            get lastElementChild() {
                return backwardsElement(this.lastChild);
            },
            get childElementCount() {
                var count = 0;
                for (var child = this.firstElementChild; child; child = child.nextElementSibling) {
                    count++;
                }
                return count;
            },
            get children() {
                var wrapperList = new NodeList();
                var i = 0;
                for (var child = this.firstElementChild; child; child = child.nextElementSibling) {
                    wrapperList[i++] = child;
                }
                wrapperList.length = i;
                return wrapperList;
            },
            remove: function () {
                var p = this.parentNode;
                if (p) p.removeChild(this);
            }
        };
        var ChildNodeInterface = {
            get nextElementSibling() {
                return forwardElement(this.nextSibling);
            },
            get previousElementSibling() {
                return backwardsElement(this.previousSibling);
            }
        };
        var NonElementParentNodeInterface = {
            getElementById: function (id) {
                if (/[ \t\n\r\f]/.test(id)) return null;
                return this.querySelector('[id="' + id + '"]');
            }
        };
        scope.ChildNodeInterface = ChildNodeInterface;
        scope.NonElementParentNodeInterface = NonElementParentNodeInterface;
        scope.ParentNodeInterface = ParentNodeInterface;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var ChildNodeInterface = scope.ChildNodeInterface;
        var Node = scope.wrappers.Node;
        var enqueueMutation = scope.enqueueMutation;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var OriginalCharacterData = window.CharacterData;
        function CharacterData(node) {
            Node.call(this, node);
        }
        CharacterData.prototype = Object.create(Node.prototype);
        mixin(CharacterData.prototype, {
            get nodeValue() {
                return this.data;
            },
            set nodeValue(data) {
                this.data = data;
            },
            get textContent() {
                return this.data;
            },
            set textContent(value) {
                this.data = value;
            },
            get data() {
                return unsafeUnwrap(this).data;
            },
            set data(value) {
                var oldValue = unsafeUnwrap(this).data;
                enqueueMutation(this, "characterData", {
                    oldValue: oldValue
                });
                unsafeUnwrap(this).data = value;
            }
        });
        mixin(CharacterData.prototype, ChildNodeInterface);
        registerWrapper(OriginalCharacterData, CharacterData, document.createTextNode(""));
        scope.wrappers.CharacterData = CharacterData;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var CharacterData = scope.wrappers.CharacterData;
        var enqueueMutation = scope.enqueueMutation;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        function toUInt32(x) {
            return x >>> 0;
        }
        var OriginalText = window.Text;
        function Text(node) {
            CharacterData.call(this, node);
        }
        Text.prototype = Object.create(CharacterData.prototype);
        mixin(Text.prototype, {
            splitText: function (offset) {
                offset = toUInt32(offset);
                var s = this.data;
                if (offset > s.length) throw new Error("IndexSizeError");
                var head = s.slice(0, offset);
                var tail = s.slice(offset);
                this.data = head;
                var newTextNode = this.ownerDocument.createTextNode(tail);
                if (this.parentNode) this.parentNode.insertBefore(newTextNode, this.nextSibling);
                return newTextNode;
            }
        });
        registerWrapper(OriginalText, Text, document.createTextNode(""));
        scope.wrappers.Text = Text;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        if (!window.DOMTokenList) {
            console.warn("Missing DOMTokenList prototype, please include a " + "compatible classList polyfill such as http://goo.gl/uTcepH.");
            return;
        }
        var unsafeUnwrap = scope.unsafeUnwrap;
        var enqueueMutation = scope.enqueueMutation;
        function getClass(el) {
            return unsafeUnwrap(el).getAttribute("class");
        }
        function enqueueClassAttributeChange(el, oldValue) {
            enqueueMutation(el, "attributes", {
                name: "class",
                namespace: null,
                oldValue: oldValue
            });
        }
        function invalidateClass(el) {
            scope.invalidateRendererBasedOnAttribute(el, "class");
        }
        function changeClass(tokenList, method, args) {
            var ownerElement = tokenList.ownerElement_;
            if (ownerElement == null) {
                return method.apply(tokenList, args);
            }
            var oldValue = getClass(ownerElement);
            var retv = method.apply(tokenList, args);
            if (getClass(ownerElement) !== oldValue) {
                enqueueClassAttributeChange(ownerElement, oldValue);
                invalidateClass(ownerElement);
            }
            return retv;
        }
        var oldAdd = DOMTokenList.prototype.add;
        DOMTokenList.prototype.add = function () {
            changeClass(this, oldAdd, arguments);
        };
        var oldRemove = DOMTokenList.prototype.remove;
        DOMTokenList.prototype.remove = function () {
            changeClass(this, oldRemove, arguments);
        };
        var oldToggle = DOMTokenList.prototype.toggle;
        DOMTokenList.prototype.toggle = function () {
            return changeClass(this, oldToggle, arguments);
        };
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var ChildNodeInterface = scope.ChildNodeInterface;
        var GetElementsByInterface = scope.GetElementsByInterface;
        var Node = scope.wrappers.Node;
        var ParentNodeInterface = scope.ParentNodeInterface;
        var SelectorsInterface = scope.SelectorsInterface;
        var MatchesInterface = scope.MatchesInterface;
        var addWrapNodeListMethod = scope.addWrapNodeListMethod;
        var enqueueMutation = scope.enqueueMutation;
        var mixin = scope.mixin;
        var oneOf = scope.oneOf;
        var registerWrapper = scope.registerWrapper;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var wrappers = scope.wrappers;
        var OriginalElement = window.Element;
        var matchesNames = ["matches", "mozMatchesSelector", "msMatchesSelector", "webkitMatchesSelector"].filter(function (name) {
            return OriginalElement.prototype[name];
        });
        var matchesName = matchesNames[0];
        var originalMatches = OriginalElement.prototype[matchesName];
        function invalidateRendererBasedOnAttribute(element, name) {
            var p = element.parentNode;
            if (!p || !p.shadowRoot) return;
            var renderer = scope.getRendererForHost(p);
            if (renderer.dependsOnAttribute(name)) renderer.invalidate();
        }
        function enqueAttributeChange(element, name, oldValue) {
            enqueueMutation(element, "attributes", {
                name: name,
                namespace: null,
                oldValue: oldValue
            });
        }
        var classListTable = new WeakMap();
        function Element(node) {
            Node.call(this, node);
        }
        Element.prototype = Object.create(Node.prototype);
        mixin(Element.prototype, {
            createShadowRoot: function () {
                var newShadowRoot = new wrappers.ShadowRoot(this);
                unsafeUnwrap(this).polymerShadowRoot_ = newShadowRoot;
                var renderer = scope.getRendererForHost(this);
                renderer.invalidate();
                return newShadowRoot;
            },
            get shadowRoot() {
                return unsafeUnwrap(this).polymerShadowRoot_ || null;
            },
            setAttribute: function (name, value) {
                var oldValue = unsafeUnwrap(this).getAttribute(name);
                unsafeUnwrap(this).setAttribute(name, value);
                enqueAttributeChange(this, name, oldValue);
                invalidateRendererBasedOnAttribute(this, name);
            },
            removeAttribute: function (name) {
                var oldValue = unsafeUnwrap(this).getAttribute(name);
                unsafeUnwrap(this).removeAttribute(name);
                enqueAttributeChange(this, name, oldValue);
                invalidateRendererBasedOnAttribute(this, name);
            },
            get classList() {
                var list = classListTable.get(this);
                if (!list) {
                    list = unsafeUnwrap(this).classList;
                    if (!list) return;
                    list.ownerElement_ = this;
                    classListTable.set(this, list);
                }
                return list;
            },
            get className() {
                return unsafeUnwrap(this).className;
            },
            set className(v) {
                this.setAttribute("class", v);
            },
            get id() {
                return unsafeUnwrap(this).id;
            },
            set id(v) {
                this.setAttribute("id", v);
            }
        });
        matchesNames.forEach(function (name) {
            if (name !== "matches") {
                Element.prototype[name] = function (selector) {
                    return this.matches(selector);
                };
            }
        });
        if (OriginalElement.prototype.webkitCreateShadowRoot) {
            Element.prototype.webkitCreateShadowRoot = Element.prototype.createShadowRoot;
        }
        mixin(Element.prototype, ChildNodeInterface);
        mixin(Element.prototype, GetElementsByInterface);
        mixin(Element.prototype, ParentNodeInterface);
        mixin(Element.prototype, SelectorsInterface);
        mixin(Element.prototype, MatchesInterface);
        registerWrapper(OriginalElement, Element, document.createElementNS(null, "x"));
        scope.invalidateRendererBasedOnAttribute = invalidateRendererBasedOnAttribute;
        scope.matchesNames = matchesNames;
        scope.originalMatches = originalMatches;
        scope.wrappers.Element = Element;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var Element = scope.wrappers.Element;
        var defineGetter = scope.defineGetter;
        var enqueueMutation = scope.enqueueMutation;
        var mixin = scope.mixin;
        var nodesWereAdded = scope.nodesWereAdded;
        var nodesWereRemoved = scope.nodesWereRemoved;
        var registerWrapper = scope.registerWrapper;
        var snapshotNodeList = scope.snapshotNodeList;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var unwrap = scope.unwrap;
        var wrap = scope.wrap;
        var wrappers = scope.wrappers;
        var escapeAttrRegExp = /[&\u00A0"]/g;
        var escapeDataRegExp = /[&\u00A0<>]/g;
        function escapeReplace(c) {
            switch (c) {
                case "&":
                    return "&amp;";

                case "<":
                    return "&lt;";

                case ">":
                    return "&gt;";

                case '"':
                    return "&quot;";

                case " ":
                    return "&nbsp;";
            }
        }
        function escapeAttr(s) {
            return s.replace(escapeAttrRegExp, escapeReplace);
        }
        function escapeData(s) {
            return s.replace(escapeDataRegExp, escapeReplace);
        }
        function makeSet(arr) {
            var set = {};
            for (var i = 0; i < arr.length; i++) {
                set[arr[i]] = true;
            }
            return set;
        }
        var voidElements = makeSet(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]);
        var plaintextParents = makeSet(["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"]);
        var XHTML_NS = "http://www.w3.org/1999/xhtml";
        function needsSelfClosingSlash(node) {
            if (node.namespaceURI !== XHTML_NS) return true;
            var doctype = node.ownerDocument.doctype;
            return doctype && doctype.publicId && doctype.systemId;
        }
        function getOuterHTML(node, parentNode) {
            switch (node.nodeType) {
                case Node.ELEMENT_NODE:
                    var tagName = node.tagName.toLowerCase();
                    var s = "<" + tagName;
                    var attrs = node.attributes;
                    for (var i = 0, attr; attr = attrs[i]; i++) {
                        s += " " + attr.name + '="' + escapeAttr(attr.value) + '"';
                    }
                    if (voidElements[tagName]) {
                        if (needsSelfClosingSlash(node)) s += "/";
                        return s + ">";
                    }
                    return s + ">" + getInnerHTML(node) + "</" + tagName + ">";

                case Node.TEXT_NODE:
                    var data = node.data;
                    if (parentNode && plaintextParents[parentNode.localName]) return data;
                    return escapeData(data);

                case Node.COMMENT_NODE:
                    return "<!--" + node.data + "-->";

                default:
                    console.error(node);
                    throw new Error("not implemented");
            }
        }
        function getInnerHTML(node) {
            if (node instanceof wrappers.HTMLTemplateElement) node = node.content;
            var s = "";
            for (var child = node.firstChild; child; child = child.nextSibling) {
                s += getOuterHTML(child, node);
            }
            return s;
        }
        function setInnerHTML(node, value, opt_tagName) {
            var tagName = opt_tagName || "div";
            node.textContent = "";
            var tempElement = unwrap(node.ownerDocument.createElement(tagName));
            tempElement.innerHTML = value;
            var firstChild;
            while (firstChild = tempElement.firstChild) {
                node.appendChild(wrap(firstChild));
            }
        }
        var oldIe = /MSIE/.test(navigator.userAgent);
        var OriginalHTMLElement = window.HTMLElement;
        var OriginalHTMLTemplateElement = window.HTMLTemplateElement;
        function HTMLElement(node) {
            Element.call(this, node);
        }
        HTMLElement.prototype = Object.create(Element.prototype);
        mixin(HTMLElement.prototype, {
            get innerHTML() {
                return getInnerHTML(this);
            },
            set innerHTML(value) {
                if (oldIe && plaintextParents[this.localName]) {
                    this.textContent = value;
                    return;
                }
                var removedNodes = snapshotNodeList(this.childNodes);
                if (this.invalidateShadowRenderer()) {
                    if (this instanceof wrappers.HTMLTemplateElement) setInnerHTML(this.content, value); else setInnerHTML(this, value, this.tagName);
                } else if (!OriginalHTMLTemplateElement && this instanceof wrappers.HTMLTemplateElement) {
                    setInnerHTML(this.content, value);
                } else {
                    unsafeUnwrap(this).innerHTML = value;
                }
                var addedNodes = snapshotNodeList(this.childNodes);
                enqueueMutation(this, "childList", {
                    addedNodes: addedNodes,
                    removedNodes: removedNodes
                });
                nodesWereRemoved(removedNodes);
                nodesWereAdded(addedNodes, this);
            },
            get outerHTML() {
                return getOuterHTML(this, this.parentNode);
            },
            set outerHTML(value) {
                var p = this.parentNode;
                if (p) {
                    p.invalidateShadowRenderer();
                    var df = frag(p, value);
                    p.replaceChild(df, this);
                }
            },
            insertAdjacentHTML: function (position, text) {
                var contextElement, refNode;
                switch (String(position).toLowerCase()) {
                    case "beforebegin":
                        contextElement = this.parentNode;
                        refNode = this;
                        break;

                    case "afterend":
                        contextElement = this.parentNode;
                        refNode = this.nextSibling;
                        break;

                    case "afterbegin":
                        contextElement = this;
                        refNode = this.firstChild;
                        break;

                    case "beforeend":
                        contextElement = this;
                        refNode = null;
                        break;

                    default:
                        return;
                }
                var df = frag(contextElement, text);
                contextElement.insertBefore(df, refNode);
            },
            get hidden() {
                return this.hasAttribute("hidden");
            },
            set hidden(v) {
                if (v) {
                    this.setAttribute("hidden", "");
                } else {
                    this.removeAttribute("hidden");
                }
            }
        });
        function frag(contextElement, html) {
            var p = unwrap(contextElement.cloneNode(false));
            p.innerHTML = html;
            var df = unwrap(document.createDocumentFragment());
            var c;
            while (c = p.firstChild) {
                df.appendChild(c);
            }
            return wrap(df);
        }
        function getter(name) {
            return function () {
                scope.renderAllPending();
                return unsafeUnwrap(this)[name];
            };
        }
        function getterRequiresRendering(name) {
            defineGetter(HTMLElement, name, getter(name));
        }
        ["clientHeight", "clientLeft", "clientTop", "clientWidth", "offsetHeight", "offsetLeft", "offsetTop", "offsetWidth", "scrollHeight", "scrollWidth"].forEach(getterRequiresRendering);
        function getterAndSetterRequiresRendering(name) {
            Object.defineProperty(HTMLElement.prototype, name, {
                get: getter(name),
                set: function (v) {
                    scope.renderAllPending();
                    unsafeUnwrap(this)[name] = v;
                },
                configurable: true,
                enumerable: true
            });
        }
        ["scrollLeft", "scrollTop"].forEach(getterAndSetterRequiresRendering);
        function methodRequiresRendering(name) {
            Object.defineProperty(HTMLElement.prototype, name, {
                value: function () {
                    scope.renderAllPending();
                    return unsafeUnwrap(this)[name].apply(unsafeUnwrap(this), arguments);
                },
                configurable: true,
                enumerable: true
            });
        }
        ["focus", "getBoundingClientRect", "getClientRects", "scrollIntoView"].forEach(methodRequiresRendering);
        registerWrapper(OriginalHTMLElement, HTMLElement, document.createElement("b"));
        scope.wrappers.HTMLElement = HTMLElement;
        scope.getInnerHTML = getInnerHTML;
        scope.setInnerHTML = setInnerHTML;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLElement = scope.wrappers.HTMLElement;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var wrap = scope.wrap;
        var OriginalHTMLCanvasElement = window.HTMLCanvasElement;
        function HTMLCanvasElement(node) {
            HTMLElement.call(this, node);
        }
        HTMLCanvasElement.prototype = Object.create(HTMLElement.prototype);
        mixin(HTMLCanvasElement.prototype, {
            getContext: function () {
                var context = unsafeUnwrap(this).getContext.apply(unsafeUnwrap(this), arguments);
                return context && wrap(context);
            }
        });
        registerWrapper(OriginalHTMLCanvasElement, HTMLCanvasElement, document.createElement("canvas"));
        scope.wrappers.HTMLCanvasElement = HTMLCanvasElement;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLElement = scope.wrappers.HTMLElement;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var OriginalHTMLContentElement = window.HTMLContentElement;
        function HTMLContentElement(node) {
            HTMLElement.call(this, node);
        }
        HTMLContentElement.prototype = Object.create(HTMLElement.prototype);
        mixin(HTMLContentElement.prototype, {
            constructor: HTMLContentElement,
            get select() {
                return this.getAttribute("select");
            },
            set select(value) {
                this.setAttribute("select", value);
            },
            setAttribute: function (n, v) {
                HTMLElement.prototype.setAttribute.call(this, n, v);
                if (String(n).toLowerCase() === "select") this.invalidateShadowRenderer(true);
            }
        });
        if (OriginalHTMLContentElement) registerWrapper(OriginalHTMLContentElement, HTMLContentElement);
        scope.wrappers.HTMLContentElement = HTMLContentElement;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLElement = scope.wrappers.HTMLElement;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var wrapHTMLCollection = scope.wrapHTMLCollection;
        var unwrap = scope.unwrap;
        var OriginalHTMLFormElement = window.HTMLFormElement;
        function HTMLFormElement(node) {
            HTMLElement.call(this, node);
        }
        HTMLFormElement.prototype = Object.create(HTMLElement.prototype);
        mixin(HTMLFormElement.prototype, {
            get elements() {
                return wrapHTMLCollection(unwrap(this).elements);
            }
        });
        registerWrapper(OriginalHTMLFormElement, HTMLFormElement, document.createElement("form"));
        scope.wrappers.HTMLFormElement = HTMLFormElement;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLElement = scope.wrappers.HTMLElement;
        var registerWrapper = scope.registerWrapper;
        var unwrap = scope.unwrap;
        var rewrap = scope.rewrap;
        var OriginalHTMLImageElement = window.HTMLImageElement;
        function HTMLImageElement(node) {
            HTMLElement.call(this, node);
        }
        HTMLImageElement.prototype = Object.create(HTMLElement.prototype);
        registerWrapper(OriginalHTMLImageElement, HTMLImageElement, document.createElement("img"));
        function Image(width, height) {
            if (!(this instanceof Image)) {
                throw new TypeError("DOM object constructor cannot be called as a function.");
            }
            var node = unwrap(document.createElement("img"));
            HTMLElement.call(this, node);
            rewrap(node, this);
            if (width !== undefined) node.width = width;
            if (height !== undefined) node.height = height;
        }
        Image.prototype = HTMLImageElement.prototype;
        scope.wrappers.HTMLImageElement = HTMLImageElement;
        scope.wrappers.Image = Image;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLElement = scope.wrappers.HTMLElement;
        var mixin = scope.mixin;
        var NodeList = scope.wrappers.NodeList;
        var registerWrapper = scope.registerWrapper;
        var OriginalHTMLShadowElement = window.HTMLShadowElement;
        function HTMLShadowElement(node) {
            HTMLElement.call(this, node);
        }
        HTMLShadowElement.prototype = Object.create(HTMLElement.prototype);
        HTMLShadowElement.prototype.constructor = HTMLShadowElement;
        if (OriginalHTMLShadowElement) registerWrapper(OriginalHTMLShadowElement, HTMLShadowElement);
        scope.wrappers.HTMLShadowElement = HTMLShadowElement;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLElement = scope.wrappers.HTMLElement;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var unwrap = scope.unwrap;
        var wrap = scope.wrap;
        var contentTable = new WeakMap();
        var templateContentsOwnerTable = new WeakMap();
        function getTemplateContentsOwner(doc) {
            if (!doc.defaultView) return doc;
            var d = templateContentsOwnerTable.get(doc);
            if (!d) {
                d = doc.implementation.createHTMLDocument("");
                while (d.lastChild) {
                    d.removeChild(d.lastChild);
                }
                templateContentsOwnerTable.set(doc, d);
            }
            return d;
        }
        function extractContent(templateElement) {
            var doc = getTemplateContentsOwner(templateElement.ownerDocument);
            var df = unwrap(doc.createDocumentFragment());
            var child;
            while (child = templateElement.firstChild) {
                df.appendChild(child);
            }
            return df;
        }
        var OriginalHTMLTemplateElement = window.HTMLTemplateElement;
        function HTMLTemplateElement(node) {
            HTMLElement.call(this, node);
            if (!OriginalHTMLTemplateElement) {
                var content = extractContent(node);
                contentTable.set(this, wrap(content));
            }
        }
        HTMLTemplateElement.prototype = Object.create(HTMLElement.prototype);
        mixin(HTMLTemplateElement.prototype, {
            constructor: HTMLTemplateElement,
            get content() {
                if (OriginalHTMLTemplateElement) return wrap(unsafeUnwrap(this).content);
                return contentTable.get(this);
            }
        });
        if (OriginalHTMLTemplateElement) registerWrapper(OriginalHTMLTemplateElement, HTMLTemplateElement);
        scope.wrappers.HTMLTemplateElement = HTMLTemplateElement;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLElement = scope.wrappers.HTMLElement;
        var registerWrapper = scope.registerWrapper;
        var OriginalHTMLMediaElement = window.HTMLMediaElement;
        if (!OriginalHTMLMediaElement) return;
        function HTMLMediaElement(node) {
            HTMLElement.call(this, node);
        }
        HTMLMediaElement.prototype = Object.create(HTMLElement.prototype);
        registerWrapper(OriginalHTMLMediaElement, HTMLMediaElement, document.createElement("audio"));
        scope.wrappers.HTMLMediaElement = HTMLMediaElement;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLMediaElement = scope.wrappers.HTMLMediaElement;
        var registerWrapper = scope.registerWrapper;
        var unwrap = scope.unwrap;
        var rewrap = scope.rewrap;
        var OriginalHTMLAudioElement = window.HTMLAudioElement;
        if (!OriginalHTMLAudioElement) return;
        function HTMLAudioElement(node) {
            HTMLMediaElement.call(this, node);
        }
        HTMLAudioElement.prototype = Object.create(HTMLMediaElement.prototype);
        registerWrapper(OriginalHTMLAudioElement, HTMLAudioElement, document.createElement("audio"));
        function Audio(src) {
            if (!(this instanceof Audio)) {
                throw new TypeError("DOM object constructor cannot be called as a function.");
            }
            var node = unwrap(document.createElement("audio"));
            HTMLMediaElement.call(this, node);
            rewrap(node, this);
            node.setAttribute("preload", "auto");
            if (src !== undefined) node.setAttribute("src", src);
        }
        Audio.prototype = HTMLAudioElement.prototype;
        scope.wrappers.HTMLAudioElement = HTMLAudioElement;
        scope.wrappers.Audio = Audio;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLElement = scope.wrappers.HTMLElement;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var rewrap = scope.rewrap;
        var unwrap = scope.unwrap;
        var wrap = scope.wrap;
        var OriginalHTMLOptionElement = window.HTMLOptionElement;
        function trimText(s) {
            return s.replace(/\s+/g, " ").trim();
        }
        function HTMLOptionElement(node) {
            HTMLElement.call(this, node);
        }
        HTMLOptionElement.prototype = Object.create(HTMLElement.prototype);
        mixin(HTMLOptionElement.prototype, {
            get text() {
                return trimText(this.textContent);
            },
            set text(value) {
                this.textContent = trimText(String(value));
            },
            get form() {
                return wrap(unwrap(this).form);
            }
        });
        registerWrapper(OriginalHTMLOptionElement, HTMLOptionElement, document.createElement("option"));
        function Option(text, value, defaultSelected, selected) {
            if (!(this instanceof Option)) {
                throw new TypeError("DOM object constructor cannot be called as a function.");
            }
            var node = unwrap(document.createElement("option"));
            HTMLElement.call(this, node);
            rewrap(node, this);
            if (text !== undefined) node.text = text;
            if (value !== undefined) node.setAttribute("value", value);
            if (defaultSelected === true) node.setAttribute("selected", "");
            node.selected = selected === true;
        }
        Option.prototype = HTMLOptionElement.prototype;
        scope.wrappers.HTMLOptionElement = HTMLOptionElement;
        scope.wrappers.Option = Option;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLElement = scope.wrappers.HTMLElement;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var unwrap = scope.unwrap;
        var wrap = scope.wrap;
        var OriginalHTMLSelectElement = window.HTMLSelectElement;
        function HTMLSelectElement(node) {
            HTMLElement.call(this, node);
        }
        HTMLSelectElement.prototype = Object.create(HTMLElement.prototype);
        mixin(HTMLSelectElement.prototype, {
            add: function (element, before) {
                if (typeof before === "object") before = unwrap(before);
                unwrap(this).add(unwrap(element), before);
            },
            remove: function (indexOrNode) {
                if (indexOrNode === undefined) {
                    HTMLElement.prototype.remove.call(this);
                    return;
                }
                if (typeof indexOrNode === "object") indexOrNode = unwrap(indexOrNode);
                unwrap(this).remove(indexOrNode);
            },
            get form() {
                return wrap(unwrap(this).form);
            }
        });
        registerWrapper(OriginalHTMLSelectElement, HTMLSelectElement, document.createElement("select"));
        scope.wrappers.HTMLSelectElement = HTMLSelectElement;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLElement = scope.wrappers.HTMLElement;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var unwrap = scope.unwrap;
        var wrap = scope.wrap;
        var wrapHTMLCollection = scope.wrapHTMLCollection;
        var OriginalHTMLTableElement = window.HTMLTableElement;
        function HTMLTableElement(node) {
            HTMLElement.call(this, node);
        }
        HTMLTableElement.prototype = Object.create(HTMLElement.prototype);
        mixin(HTMLTableElement.prototype, {
            get caption() {
                return wrap(unwrap(this).caption);
            },
            createCaption: function () {
                return wrap(unwrap(this).createCaption());
            },
            get tHead() {
                return wrap(unwrap(this).tHead);
            },
            createTHead: function () {
                return wrap(unwrap(this).createTHead());
            },
            createTFoot: function () {
                return wrap(unwrap(this).createTFoot());
            },
            get tFoot() {
                return wrap(unwrap(this).tFoot);
            },
            get tBodies() {
                return wrapHTMLCollection(unwrap(this).tBodies);
            },
            createTBody: function () {
                return wrap(unwrap(this).createTBody());
            },
            get rows() {
                return wrapHTMLCollection(unwrap(this).rows);
            },
            insertRow: function (index) {
                return wrap(unwrap(this).insertRow(index));
            }
        });
        registerWrapper(OriginalHTMLTableElement, HTMLTableElement, document.createElement("table"));
        scope.wrappers.HTMLTableElement = HTMLTableElement;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLElement = scope.wrappers.HTMLElement;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var wrapHTMLCollection = scope.wrapHTMLCollection;
        var unwrap = scope.unwrap;
        var wrap = scope.wrap;
        var OriginalHTMLTableSectionElement = window.HTMLTableSectionElement;
        function HTMLTableSectionElement(node) {
            HTMLElement.call(this, node);
        }
        HTMLTableSectionElement.prototype = Object.create(HTMLElement.prototype);
        mixin(HTMLTableSectionElement.prototype, {
            constructor: HTMLTableSectionElement,
            get rows() {
                return wrapHTMLCollection(unwrap(this).rows);
            },
            insertRow: function (index) {
                return wrap(unwrap(this).insertRow(index));
            }
        });
        registerWrapper(OriginalHTMLTableSectionElement, HTMLTableSectionElement, document.createElement("thead"));
        scope.wrappers.HTMLTableSectionElement = HTMLTableSectionElement;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLElement = scope.wrappers.HTMLElement;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var wrapHTMLCollection = scope.wrapHTMLCollection;
        var unwrap = scope.unwrap;
        var wrap = scope.wrap;
        var OriginalHTMLTableRowElement = window.HTMLTableRowElement;
        function HTMLTableRowElement(node) {
            HTMLElement.call(this, node);
        }
        HTMLTableRowElement.prototype = Object.create(HTMLElement.prototype);
        mixin(HTMLTableRowElement.prototype, {
            get cells() {
                return wrapHTMLCollection(unwrap(this).cells);
            },
            insertCell: function (index) {
                return wrap(unwrap(this).insertCell(index));
            }
        });
        registerWrapper(OriginalHTMLTableRowElement, HTMLTableRowElement, document.createElement("tr"));
        scope.wrappers.HTMLTableRowElement = HTMLTableRowElement;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLContentElement = scope.wrappers.HTMLContentElement;
        var HTMLElement = scope.wrappers.HTMLElement;
        var HTMLShadowElement = scope.wrappers.HTMLShadowElement;
        var HTMLTemplateElement = scope.wrappers.HTMLTemplateElement;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var OriginalHTMLUnknownElement = window.HTMLUnknownElement;
        function HTMLUnknownElement(node) {
            switch (node.localName) {
                case "content":
                    return new HTMLContentElement(node);

                case "shadow":
                    return new HTMLShadowElement(node);

                case "template":
                    return new HTMLTemplateElement(node);
            }
            HTMLElement.call(this, node);
        }
        HTMLUnknownElement.prototype = Object.create(HTMLElement.prototype);
        registerWrapper(OriginalHTMLUnknownElement, HTMLUnknownElement);
        scope.wrappers.HTMLUnknownElement = HTMLUnknownElement;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var Element = scope.wrappers.Element;
        var HTMLElement = scope.wrappers.HTMLElement;
        var registerWrapper = scope.registerWrapper;
        var defineWrapGetter = scope.defineWrapGetter;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var wrap = scope.wrap;
        var mixin = scope.mixin;
        var SVG_NS = "http://www.w3.org/2000/svg";
        var OriginalSVGElement = window.SVGElement;
        var svgTitleElement = document.createElementNS(SVG_NS, "title");
        if (!("classList" in svgTitleElement)) {
            var descr = Object.getOwnPropertyDescriptor(Element.prototype, "classList");
            Object.defineProperty(HTMLElement.prototype, "classList", descr);
            delete Element.prototype.classList;
        }
        function SVGElement(node) {
            Element.call(this, node);
        }
        SVGElement.prototype = Object.create(Element.prototype);
        mixin(SVGElement.prototype, {
            get ownerSVGElement() {
                return wrap(unsafeUnwrap(this).ownerSVGElement);
            }
        });
        registerWrapper(OriginalSVGElement, SVGElement, document.createElementNS(SVG_NS, "title"));
        scope.wrappers.SVGElement = SVGElement;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var unwrap = scope.unwrap;
        var wrap = scope.wrap;
        var OriginalSVGUseElement = window.SVGUseElement;
        var SVG_NS = "http://www.w3.org/2000/svg";
        var gWrapper = wrap(document.createElementNS(SVG_NS, "g"));
        var useElement = document.createElementNS(SVG_NS, "use");
        var SVGGElement = gWrapper.constructor;
        var parentInterfacePrototype = Object.getPrototypeOf(SVGGElement.prototype);
        var parentInterface = parentInterfacePrototype.constructor;
        function SVGUseElement(impl) {
            parentInterface.call(this, impl);
        }
        SVGUseElement.prototype = Object.create(parentInterfacePrototype);
        if ("instanceRoot" in useElement) {
            mixin(SVGUseElement.prototype, {
                get instanceRoot() {
                    return wrap(unwrap(this).instanceRoot);
                },
                get animatedInstanceRoot() {
                    return wrap(unwrap(this).animatedInstanceRoot);
                }
            });
        }
        registerWrapper(OriginalSVGUseElement, SVGUseElement, useElement);
        scope.wrappers.SVGUseElement = SVGUseElement;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var EventTarget = scope.wrappers.EventTarget;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var wrap = scope.wrap;
        var OriginalSVGElementInstance = window.SVGElementInstance;
        if (!OriginalSVGElementInstance) return;
        function SVGElementInstance(impl) {
            EventTarget.call(this, impl);
        }
        SVGElementInstance.prototype = Object.create(EventTarget.prototype);
        mixin(SVGElementInstance.prototype, {
            get correspondingElement() {
                return wrap(unsafeUnwrap(this).correspondingElement);
            },
            get correspondingUseElement() {
                return wrap(unsafeUnwrap(this).correspondingUseElement);
            },
            get parentNode() {
                return wrap(unsafeUnwrap(this).parentNode);
            },
            get childNodes() {
                throw new Error("Not implemented");
            },
            get firstChild() {
                return wrap(unsafeUnwrap(this).firstChild);
            },
            get lastChild() {
                return wrap(unsafeUnwrap(this).lastChild);
            },
            get previousSibling() {
                return wrap(unsafeUnwrap(this).previousSibling);
            },
            get nextSibling() {
                return wrap(unsafeUnwrap(this).nextSibling);
            }
        });
        registerWrapper(OriginalSVGElementInstance, SVGElementInstance);
        scope.wrappers.SVGElementInstance = SVGElementInstance;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var setWrapper = scope.setWrapper;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var unwrap = scope.unwrap;
        var unwrapIfNeeded = scope.unwrapIfNeeded;
        var wrap = scope.wrap;
        var OriginalCanvasRenderingContext2D = window.CanvasRenderingContext2D;
        function CanvasRenderingContext2D(impl) {
            setWrapper(impl, this);
        }
        mixin(CanvasRenderingContext2D.prototype, {
            get canvas() {
                return wrap(unsafeUnwrap(this).canvas);
            },
            drawImage: function () {
                arguments[0] = unwrapIfNeeded(arguments[0]);
                unsafeUnwrap(this).drawImage.apply(unsafeUnwrap(this), arguments);
            },
            createPattern: function () {
                arguments[0] = unwrap(arguments[0]);
                return unsafeUnwrap(this).createPattern.apply(unsafeUnwrap(this), arguments);
            }
        });
        registerWrapper(OriginalCanvasRenderingContext2D, CanvasRenderingContext2D, document.createElement("canvas").getContext("2d"));
        scope.wrappers.CanvasRenderingContext2D = CanvasRenderingContext2D;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var addForwardingProperties = scope.addForwardingProperties;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var setWrapper = scope.setWrapper;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var unwrapIfNeeded = scope.unwrapIfNeeded;
        var wrap = scope.wrap;
        var OriginalWebGLRenderingContext = window.WebGLRenderingContext;
        if (!OriginalWebGLRenderingContext) return;
        function WebGLRenderingContext(impl) {
            setWrapper(impl, this);
        }
        mixin(WebGLRenderingContext.prototype, {
            get canvas() {
                return wrap(unsafeUnwrap(this).canvas);
            },
            texImage2D: function () {
                arguments[5] = unwrapIfNeeded(arguments[5]);
                unsafeUnwrap(this).texImage2D.apply(unsafeUnwrap(this), arguments);
            },
            texSubImage2D: function () {
                arguments[6] = unwrapIfNeeded(arguments[6]);
                unsafeUnwrap(this).texSubImage2D.apply(unsafeUnwrap(this), arguments);
            }
        });
        var OriginalWebGLRenderingContextBase = Object.getPrototypeOf(OriginalWebGLRenderingContext.prototype);
        if (OriginalWebGLRenderingContextBase !== Object.prototype) {
            addForwardingProperties(OriginalWebGLRenderingContextBase, WebGLRenderingContext.prototype);
        }
        var instanceProperties = /WebKit/.test(navigator.userAgent) ? {
            drawingBufferHeight: null,
            drawingBufferWidth: null
        } : {};
        registerWrapper(OriginalWebGLRenderingContext, WebGLRenderingContext, instanceProperties);
        scope.wrappers.WebGLRenderingContext = WebGLRenderingContext;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var Node = scope.wrappers.Node;
        var GetElementsByInterface = scope.GetElementsByInterface;
        var NonElementParentNodeInterface = scope.NonElementParentNodeInterface;
        var ParentNodeInterface = scope.ParentNodeInterface;
        var SelectorsInterface = scope.SelectorsInterface;
        var mixin = scope.mixin;
        var registerObject = scope.registerObject;
        var registerWrapper = scope.registerWrapper;
        var OriginalDocumentFragment = window.DocumentFragment;
        function DocumentFragment(node) {
            Node.call(this, node);
        }
        DocumentFragment.prototype = Object.create(Node.prototype);
        mixin(DocumentFragment.prototype, ParentNodeInterface);
        mixin(DocumentFragment.prototype, SelectorsInterface);
        mixin(DocumentFragment.prototype, GetElementsByInterface);
        mixin(DocumentFragment.prototype, NonElementParentNodeInterface);
        registerWrapper(OriginalDocumentFragment, DocumentFragment, document.createDocumentFragment());
        scope.wrappers.DocumentFragment = DocumentFragment;
        var Comment = registerObject(document.createComment(""));
        scope.wrappers.Comment = Comment;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var DocumentFragment = scope.wrappers.DocumentFragment;
        var TreeScope = scope.TreeScope;
        var elementFromPoint = scope.elementFromPoint;
        var getInnerHTML = scope.getInnerHTML;
        var getTreeScope = scope.getTreeScope;
        var mixin = scope.mixin;
        var rewrap = scope.rewrap;
        var setInnerHTML = scope.setInnerHTML;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var unwrap = scope.unwrap;
        var wrap = scope.wrap;
        var shadowHostTable = new WeakMap();
        var nextOlderShadowTreeTable = new WeakMap();
        function ShadowRoot(hostWrapper) {
            var node = unwrap(unsafeUnwrap(hostWrapper).ownerDocument.createDocumentFragment());
            DocumentFragment.call(this, node);
            rewrap(node, this);
            var oldShadowRoot = hostWrapper.shadowRoot;
            nextOlderShadowTreeTable.set(this, oldShadowRoot);
            this.treeScope_ = new TreeScope(this, getTreeScope(oldShadowRoot || hostWrapper));
            shadowHostTable.set(this, hostWrapper);
        }
        ShadowRoot.prototype = Object.create(DocumentFragment.prototype);
        mixin(ShadowRoot.prototype, {
            constructor: ShadowRoot,
            get innerHTML() {
                return getInnerHTML(this);
            },
            set innerHTML(value) {
                setInnerHTML(this, value);
                this.invalidateShadowRenderer();
            },
            get olderShadowRoot() {
                return nextOlderShadowTreeTable.get(this) || null;
            },
            get host() {
                return shadowHostTable.get(this) || null;
            },
            invalidateShadowRenderer: function () {
                return shadowHostTable.get(this).invalidateShadowRenderer();
            },
            elementFromPoint: function (x, y) {
                return elementFromPoint(this, this.ownerDocument, x, y);
            },
            getSelection: function () {
                return document.getSelection();
            },
            get activeElement() {
                var unwrappedActiveElement = unwrap(this).ownerDocument.activeElement;
                if (!unwrappedActiveElement || !unwrappedActiveElement.nodeType) return null;
                var activeElement = wrap(unwrappedActiveElement);
                if (activeElement === this.host) {
                    return null;
                }
                while (!this.contains(activeElement) && !this.host.contains(activeElement)) {
                    while (activeElement.parentNode) {
                        activeElement = activeElement.parentNode;
                    }
                    if (activeElement.host) {
                        activeElement = activeElement.host;
                    } else {
                        return null;
                    }
                }
                return activeElement;
            }
        });
        scope.wrappers.ShadowRoot = ShadowRoot;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var registerWrapper = scope.registerWrapper;
        var setWrapper = scope.setWrapper;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var unwrap = scope.unwrap;
        var unwrapIfNeeded = scope.unwrapIfNeeded;
        var wrap = scope.wrap;
        var getTreeScope = scope.getTreeScope;
        var OriginalRange = window.Range;
        var ShadowRoot = scope.wrappers.ShadowRoot;
        function getHost(node) {
            var root = getTreeScope(node).root;
            if (root instanceof ShadowRoot) {
                return root.host;
            }
            return null;
        }
        function hostNodeToShadowNode(refNode, offset) {
            if (refNode.shadowRoot) {
                offset = Math.min(refNode.childNodes.length - 1, offset);
                var child = refNode.childNodes[offset];
                if (child) {
                    var insertionPoint = scope.getDestinationInsertionPoints(child);
                    if (insertionPoint.length > 0) {
                        var parentNode = insertionPoint[0].parentNode;
                        if (parentNode.nodeType == Node.ELEMENT_NODE) {
                            refNode = parentNode;
                        }
                    }
                }
            }
            return refNode;
        }
        function shadowNodeToHostNode(node) {
            node = wrap(node);
            return getHost(node) || node;
        }
        function Range(impl) {
            setWrapper(impl, this);
        }
        Range.prototype = {
            get startContainer() {
                return shadowNodeToHostNode(unsafeUnwrap(this).startContainer);
            },
            get endContainer() {
                return shadowNodeToHostNode(unsafeUnwrap(this).endContainer);
            },
            get commonAncestorContainer() {
                return shadowNodeToHostNode(unsafeUnwrap(this).commonAncestorContainer);
            },
            setStart: function (refNode, offset) {
                refNode = hostNodeToShadowNode(refNode, offset);
                unsafeUnwrap(this).setStart(unwrapIfNeeded(refNode), offset);
            },
            setEnd: function (refNode, offset) {
                refNode = hostNodeToShadowNode(refNode, offset);
                unsafeUnwrap(this).setEnd(unwrapIfNeeded(refNode), offset);
            },
            setStartBefore: function (refNode) {
                unsafeUnwrap(this).setStartBefore(unwrapIfNeeded(refNode));
            },
            setStartAfter: function (refNode) {
                unsafeUnwrap(this).setStartAfter(unwrapIfNeeded(refNode));
            },
            setEndBefore: function (refNode) {
                unsafeUnwrap(this).setEndBefore(unwrapIfNeeded(refNode));
            },
            setEndAfter: function (refNode) {
                unsafeUnwrap(this).setEndAfter(unwrapIfNeeded(refNode));
            },
            selectNode: function (refNode) {
                unsafeUnwrap(this).selectNode(unwrapIfNeeded(refNode));
            },
            selectNodeContents: function (refNode) {
                unsafeUnwrap(this).selectNodeContents(unwrapIfNeeded(refNode));
            },
            compareBoundaryPoints: function (how, sourceRange) {
                return unsafeUnwrap(this).compareBoundaryPoints(how, unwrap(sourceRange));
            },
            extractContents: function () {
                return wrap(unsafeUnwrap(this).extractContents());
            },
            cloneContents: function () {
                return wrap(unsafeUnwrap(this).cloneContents());
            },
            insertNode: function (node) {
                unsafeUnwrap(this).insertNode(unwrapIfNeeded(node));
            },
            surroundContents: function (newParent) {
                unsafeUnwrap(this).surroundContents(unwrapIfNeeded(newParent));
            },
            cloneRange: function () {
                return wrap(unsafeUnwrap(this).cloneRange());
            },
            isPointInRange: function (node, offset) {
                return unsafeUnwrap(this).isPointInRange(unwrapIfNeeded(node), offset);
            },
            comparePoint: function (node, offset) {
                return unsafeUnwrap(this).comparePoint(unwrapIfNeeded(node), offset);
            },
            intersectsNode: function (node) {
                return unsafeUnwrap(this).intersectsNode(unwrapIfNeeded(node));
            },
            toString: function () {
                return unsafeUnwrap(this).toString();
            }
        };
        if (OriginalRange.prototype.createContextualFragment) {
            Range.prototype.createContextualFragment = function (html) {
                return wrap(unsafeUnwrap(this).createContextualFragment(html));
            };
        }
        registerWrapper(window.Range, Range, document.createRange());
        scope.wrappers.Range = Range;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var Element = scope.wrappers.Element;
        var HTMLContentElement = scope.wrappers.HTMLContentElement;
        var HTMLShadowElement = scope.wrappers.HTMLShadowElement;
        var Node = scope.wrappers.Node;
        var ShadowRoot = scope.wrappers.ShadowRoot;
        var assert = scope.assert;
        var getTreeScope = scope.getTreeScope;
        var mixin = scope.mixin;
        var oneOf = scope.oneOf;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var unwrap = scope.unwrap;
        var wrap = scope.wrap;
        var ArraySplice = scope.ArraySplice;
        function updateWrapperUpAndSideways(wrapper) {
            wrapper.previousSibling_ = wrapper.previousSibling;
            wrapper.nextSibling_ = wrapper.nextSibling;
            wrapper.parentNode_ = wrapper.parentNode;
        }
        function updateWrapperDown(wrapper) {
            wrapper.firstChild_ = wrapper.firstChild;
            wrapper.lastChild_ = wrapper.lastChild;
        }
        function updateAllChildNodes(parentNodeWrapper) {
            assert(parentNodeWrapper instanceof Node);
            for (var childWrapper = parentNodeWrapper.firstChild; childWrapper; childWrapper = childWrapper.nextSibling) {
                updateWrapperUpAndSideways(childWrapper);
            }
            updateWrapperDown(parentNodeWrapper);
        }
        function insertBefore(parentNodeWrapper, newChildWrapper, refChildWrapper) {
            var parentNode = unwrap(parentNodeWrapper);
            var newChild = unwrap(newChildWrapper);
            var refChild = refChildWrapper ? unwrap(refChildWrapper) : null;
            remove(newChildWrapper);
            updateWrapperUpAndSideways(newChildWrapper);
            if (!refChildWrapper) {
                parentNodeWrapper.lastChild_ = parentNodeWrapper.lastChild;
                if (parentNodeWrapper.lastChild === parentNodeWrapper.firstChild) parentNodeWrapper.firstChild_ = parentNodeWrapper.firstChild;
                var lastChildWrapper = wrap(parentNode.lastChild);
                if (lastChildWrapper) lastChildWrapper.nextSibling_ = lastChildWrapper.nextSibling;
            } else {
                if (parentNodeWrapper.firstChild === refChildWrapper) parentNodeWrapper.firstChild_ = refChildWrapper;
                refChildWrapper.previousSibling_ = refChildWrapper.previousSibling;
            }
            scope.originalInsertBefore.call(parentNode, newChild, refChild);
        }
        function remove(nodeWrapper) {
            var node = unwrap(nodeWrapper);
            var parentNode = node.parentNode;
            if (!parentNode) return;
            var parentNodeWrapper = wrap(parentNode);
            updateWrapperUpAndSideways(nodeWrapper);
            if (nodeWrapper.previousSibling) nodeWrapper.previousSibling.nextSibling_ = nodeWrapper;
            if (nodeWrapper.nextSibling) nodeWrapper.nextSibling.previousSibling_ = nodeWrapper;
            if (parentNodeWrapper.lastChild === nodeWrapper) parentNodeWrapper.lastChild_ = nodeWrapper;
            if (parentNodeWrapper.firstChild === nodeWrapper) parentNodeWrapper.firstChild_ = nodeWrapper;
            scope.originalRemoveChild.call(parentNode, node);
        }
        var distributedNodesTable = new WeakMap();
        var destinationInsertionPointsTable = new WeakMap();
        var rendererForHostTable = new WeakMap();
        function resetDistributedNodes(insertionPoint) {
            distributedNodesTable.set(insertionPoint, []);
        }
        function getDistributedNodes(insertionPoint) {
            var rv = distributedNodesTable.get(insertionPoint);
            if (!rv) distributedNodesTable.set(insertionPoint, rv = []);
            return rv;
        }
        function getChildNodesSnapshot(node) {
            var result = [], i = 0;
            for (var child = node.firstChild; child; child = child.nextSibling) {
                result[i++] = child;
            }
            return result;
        }
        var request = oneOf(window, ["requestAnimationFrame", "mozRequestAnimationFrame", "webkitRequestAnimationFrame", "setTimeout"]);
        var pendingDirtyRenderers = [];
        var renderTimer;
        function renderAllPending() {
            for (var i = 0; i < pendingDirtyRenderers.length; i++) {
                var renderer = pendingDirtyRenderers[i];
                var parentRenderer = renderer.parentRenderer;
                if (parentRenderer && parentRenderer.dirty) continue;
                renderer.render();
            }
            pendingDirtyRenderers = [];
        }
        function handleRequestAnimationFrame() {
            renderTimer = null;
            renderAllPending();
        }
        function getRendererForHost(host) {
            var renderer = rendererForHostTable.get(host);
            if (!renderer) {
                renderer = new ShadowRenderer(host);
                rendererForHostTable.set(host, renderer);
            }
            return renderer;
        }
        function getShadowRootAncestor(node) {
            var root = getTreeScope(node).root;
            if (root instanceof ShadowRoot) return root;
            return null;
        }
        function getRendererForShadowRoot(shadowRoot) {
            return getRendererForHost(shadowRoot.host);
        }
        var spliceDiff = new ArraySplice();
        spliceDiff.equals = function (renderNode, rawNode) {
            return unwrap(renderNode.node) === rawNode;
        };
        function RenderNode(node) {
            this.skip = false;
            this.node = node;
            this.childNodes = [];
        }
        RenderNode.prototype = {
            append: function (node) {
                var rv = new RenderNode(node);
                this.childNodes.push(rv);
                return rv;
            },
            sync: function (opt_added) {
                if (this.skip) return;
                var nodeWrapper = this.node;
                var newChildren = this.childNodes;
                var oldChildren = getChildNodesSnapshot(unwrap(nodeWrapper));
                var added = opt_added || new WeakMap();
                var splices = spliceDiff.calculateSplices(newChildren, oldChildren);
                var newIndex = 0, oldIndex = 0;
                var lastIndex = 0;
                for (var i = 0; i < splices.length; i++) {
                    var splice = splices[i];
                    for (; lastIndex < splice.index; lastIndex++) {
                        oldIndex++;
                        newChildren[newIndex++].sync(added);
                    }
                    var removedCount = splice.removed.length;
                    for (var j = 0; j < removedCount; j++) {
                        var wrapper = wrap(oldChildren[oldIndex++]);
                        if (!added.get(wrapper)) remove(wrapper);
                    }
                    var addedCount = splice.addedCount;
                    var refNode = oldChildren[oldIndex] && wrap(oldChildren[oldIndex]);
                    for (var j = 0; j < addedCount; j++) {
                        var newChildRenderNode = newChildren[newIndex++];
                        var newChildWrapper = newChildRenderNode.node;
                        insertBefore(nodeWrapper, newChildWrapper, refNode);
                        added.set(newChildWrapper, true);
                        newChildRenderNode.sync(added);
                    }
                    lastIndex += addedCount;
                }
                for (var i = lastIndex; i < newChildren.length; i++) {
                    newChildren[i].sync(added);
                }
            }
        };
        function ShadowRenderer(host) {
            this.host = host;
            this.dirty = false;
            this.invalidateAttributes();
            this.associateNode(host);
        }
        ShadowRenderer.prototype = {
            render: function (opt_renderNode) {
                if (!this.dirty) return;
                this.invalidateAttributes();
                var host = this.host;
                this.distribution(host);
                var renderNode = opt_renderNode || new RenderNode(host);
                this.buildRenderTree(renderNode, host);
                var topMostRenderer = !opt_renderNode;
                if (topMostRenderer) renderNode.sync();
                this.dirty = false;
            },
            get parentRenderer() {
                return getTreeScope(this.host).renderer;
            },
            invalidate: function () {
                if (!this.dirty) {
                    this.dirty = true;
                    var parentRenderer = this.parentRenderer;
                    if (parentRenderer) parentRenderer.invalidate();
                    pendingDirtyRenderers.push(this);
                    if (renderTimer) return;
                    renderTimer = window[request](handleRequestAnimationFrame, 0);
                }
            },
            distribution: function (root) {
                this.resetAllSubtrees(root);
                this.distributionResolution(root);
            },
            resetAll: function (node) {
                if (isInsertionPoint(node)) resetDistributedNodes(node); else resetDestinationInsertionPoints(node);
                this.resetAllSubtrees(node);
            },
            resetAllSubtrees: function (node) {
                for (var child = node.firstChild; child; child = child.nextSibling) {
                    this.resetAll(child);
                }
                if (node.shadowRoot) this.resetAll(node.shadowRoot);
                if (node.olderShadowRoot) this.resetAll(node.olderShadowRoot);
            },
            distributionResolution: function (node) {
                if (isShadowHost(node)) {
                    var shadowHost = node;
                    var pool = poolPopulation(shadowHost);
                    var shadowTrees = getShadowTrees(shadowHost);
                    for (var i = 0; i < shadowTrees.length; i++) {
                        this.poolDistribution(shadowTrees[i], pool);
                    }
                    for (var i = shadowTrees.length - 1; i >= 0; i--) {
                        var shadowTree = shadowTrees[i];
                        var shadow = getShadowInsertionPoint(shadowTree);
                        if (shadow) {
                            var olderShadowRoot = shadowTree.olderShadowRoot;
                            if (olderShadowRoot) {
                                pool = poolPopulation(olderShadowRoot);
                            }
                            for (var j = 0; j < pool.length; j++) {
                                destributeNodeInto(pool[j], shadow);
                            }
                        }
                        this.distributionResolution(shadowTree);
                    }
                }
                for (var child = node.firstChild; child; child = child.nextSibling) {
                    this.distributionResolution(child);
                }
            },
            poolDistribution: function (node, pool) {
                if (node instanceof HTMLShadowElement) return;
                if (node instanceof HTMLContentElement) {
                    var content = node;
                    this.updateDependentAttributes(content.getAttribute("select"));
                    var anyDistributed = false;
                    for (var i = 0; i < pool.length; i++) {
                        var node = pool[i];
                        if (!node) continue;
                        if (matches(node, content)) {
                            destributeNodeInto(node, content);
                            pool[i] = undefined;
                            anyDistributed = true;
                        }
                    }
                    if (!anyDistributed) {
                        for (var child = content.firstChild; child; child = child.nextSibling) {
                            destributeNodeInto(child, content);
                        }
                    }
                    return;
                }
                for (var child = node.firstChild; child; child = child.nextSibling) {
                    this.poolDistribution(child, pool);
                }
            },
            buildRenderTree: function (renderNode, node) {
                var children = this.compose(node);
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    var childRenderNode = renderNode.append(child);
                    this.buildRenderTree(childRenderNode, child);
                }
                if (isShadowHost(node)) {
                    var renderer = getRendererForHost(node);
                    renderer.dirty = false;
                }
            },
            compose: function (node) {
                var children = [];
                var p = node.shadowRoot || node;
                for (var child = p.firstChild; child; child = child.nextSibling) {
                    if (isInsertionPoint(child)) {
                        this.associateNode(p);
                        var distributedNodes = getDistributedNodes(child);
                        for (var j = 0; j < distributedNodes.length; j++) {
                            var distributedNode = distributedNodes[j];
                            if (isFinalDestination(child, distributedNode)) children.push(distributedNode);
                        }
                    } else {
                        children.push(child);
                    }
                }
                return children;
            },
            invalidateAttributes: function () {
                this.attributes = Object.create(null);
            },
            updateDependentAttributes: function (selector) {
                if (!selector) return;
                var attributes = this.attributes;
                if (/\.\w+/.test(selector)) attributes["class"] = true;
                if (/#\w+/.test(selector)) attributes["id"] = true;
                selector.replace(/\[\s*([^\s=\|~\]]+)/g, function (_, name) {
                    attributes[name] = true;
                });
            },
            dependsOnAttribute: function (name) {
                return this.attributes[name];
            },
            associateNode: function (node) {
                unsafeUnwrap(node).polymerShadowRenderer_ = this;
            }
        };
        function poolPopulation(node) {
            var pool = [];
            for (var child = node.firstChild; child; child = child.nextSibling) {
                if (isInsertionPoint(child)) {
                    pool.push.apply(pool, getDistributedNodes(child));
                } else {
                    pool.push(child);
                }
            }
            return pool;
        }
        function getShadowInsertionPoint(node) {
            if (node instanceof HTMLShadowElement) return node;
            if (node instanceof HTMLContentElement) return null;
            for (var child = node.firstChild; child; child = child.nextSibling) {
                var res = getShadowInsertionPoint(child);
                if (res) return res;
            }
            return null;
        }
        function destributeNodeInto(child, insertionPoint) {
            getDistributedNodes(insertionPoint).push(child);
            var points = destinationInsertionPointsTable.get(child);
            if (!points) destinationInsertionPointsTable.set(child, [insertionPoint]); else points.push(insertionPoint);
        }
        function getDestinationInsertionPoints(node) {
            return destinationInsertionPointsTable.get(node);
        }
        function resetDestinationInsertionPoints(node) {
            destinationInsertionPointsTable.set(node, undefined);
        }
        var selectorStartCharRe = /^(:not\()?[*.#[a-zA-Z_|]/;
        function matches(node, contentElement) {
            var select = contentElement.getAttribute("select");
            if (!select) return true;
            select = select.trim();
            if (!select) return true;
            if (!(node instanceof Element)) return false;
            if (!selectorStartCharRe.test(select)) return false;
            try {
                return node.matches(select);
            } catch (ex) {
                return false;
            }
        }
        function isFinalDestination(insertionPoint, node) {
            var points = getDestinationInsertionPoints(node);
            return points && points[points.length - 1] === insertionPoint;
        }
        function isInsertionPoint(node) {
            return node instanceof HTMLContentElement || node instanceof HTMLShadowElement;
        }
        function isShadowHost(shadowHost) {
            return shadowHost.shadowRoot;
        }
        function getShadowTrees(host) {
            var trees = [];
            for (var tree = host.shadowRoot; tree; tree = tree.olderShadowRoot) {
                trees.push(tree);
            }
            return trees;
        }
        function render(host) {
            new ShadowRenderer(host).render();
        }
        Node.prototype.invalidateShadowRenderer = function (force) {
            var renderer = unsafeUnwrap(this).polymerShadowRenderer_;
            if (renderer) {
                renderer.invalidate();
                return true;
            }
            return false;
        };
        HTMLContentElement.prototype.getDistributedNodes = HTMLShadowElement.prototype.getDistributedNodes = function () {
            renderAllPending();
            return getDistributedNodes(this);
        };
        Element.prototype.getDestinationInsertionPoints = function () {
            renderAllPending();
            return getDestinationInsertionPoints(this) || [];
        };
        HTMLContentElement.prototype.nodeIsInserted_ = HTMLShadowElement.prototype.nodeIsInserted_ = function () {
            this.invalidateShadowRenderer();
            var shadowRoot = getShadowRootAncestor(this);
            var renderer;
            if (shadowRoot) renderer = getRendererForShadowRoot(shadowRoot);
            unsafeUnwrap(this).polymerShadowRenderer_ = renderer;
            if (renderer) renderer.invalidate();
        };
        scope.getRendererForHost = getRendererForHost;
        scope.getShadowTrees = getShadowTrees;
        scope.renderAllPending = renderAllPending;
        scope.getDestinationInsertionPoints = getDestinationInsertionPoints;
        scope.visual = {
            insertBefore: insertBefore,
            remove: remove
        };
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var HTMLElement = scope.wrappers.HTMLElement;
        var assert = scope.assert;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var unwrap = scope.unwrap;
        var wrap = scope.wrap;
        var elementsWithFormProperty = ["HTMLButtonElement", "HTMLFieldSetElement", "HTMLInputElement", "HTMLKeygenElement", "HTMLLabelElement", "HTMLLegendElement", "HTMLObjectElement", "HTMLOutputElement", "HTMLTextAreaElement"];
        function createWrapperConstructor(name) {
            if (!window[name]) return;
            assert(!scope.wrappers[name]);
            var GeneratedWrapper = function (node) {
                HTMLElement.call(this, node);
            };
            GeneratedWrapper.prototype = Object.create(HTMLElement.prototype);
            mixin(GeneratedWrapper.prototype, {
                get form() {
                    return wrap(unwrap(this).form);
                }
            });
            registerWrapper(window[name], GeneratedWrapper, document.createElement(name.slice(4, -7)));
            scope.wrappers[name] = GeneratedWrapper;
        }
        elementsWithFormProperty.forEach(createWrapperConstructor);
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var registerWrapper = scope.registerWrapper;
        var setWrapper = scope.setWrapper;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var unwrap = scope.unwrap;
        var unwrapIfNeeded = scope.unwrapIfNeeded;
        var wrap = scope.wrap;
        var OriginalSelection = window.Selection;
        function Selection(impl) {
            setWrapper(impl, this);
        }
        Selection.prototype = {
            get anchorNode() {
                return wrap(unsafeUnwrap(this).anchorNode);
            },
            get focusNode() {
                return wrap(unsafeUnwrap(this).focusNode);
            },
            addRange: function (range) {
                unsafeUnwrap(this).addRange(unwrapIfNeeded(range));
            },
            collapse: function (node, index) {
                unsafeUnwrap(this).collapse(unwrapIfNeeded(node), index);
            },
            containsNode: function (node, allowPartial) {
                return unsafeUnwrap(this).containsNode(unwrapIfNeeded(node), allowPartial);
            },
            getRangeAt: function (index) {
                return wrap(unsafeUnwrap(this).getRangeAt(index));
            },
            removeRange: function (range) {
                unsafeUnwrap(this).removeRange(unwrap(range));
            },
            selectAllChildren: function (node) {
                unsafeUnwrap(this).selectAllChildren(node instanceof ShadowRoot ? unsafeUnwrap(node.host) : unwrapIfNeeded(node));
            },
            toString: function () {
                return unsafeUnwrap(this).toString();
            }
        };
        if (OriginalSelection.prototype.extend) {
            Selection.prototype.extend = function (node, offset) {
                unsafeUnwrap(this).extend(unwrapIfNeeded(node), offset);
            };
        }
        registerWrapper(window.Selection, Selection, window.getSelection());
        scope.wrappers.Selection = Selection;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var registerWrapper = scope.registerWrapper;
        var setWrapper = scope.setWrapper;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var unwrapIfNeeded = scope.unwrapIfNeeded;
        var wrap = scope.wrap;
        var OriginalTreeWalker = window.TreeWalker;
        function TreeWalker(impl) {
            setWrapper(impl, this);
        }
        TreeWalker.prototype = {
            get root() {
                return wrap(unsafeUnwrap(this).root);
            },
            get currentNode() {
                return wrap(unsafeUnwrap(this).currentNode);
            },
            set currentNode(node) {
                unsafeUnwrap(this).currentNode = unwrapIfNeeded(node);
            },
            get filter() {
                return unsafeUnwrap(this).filter;
            },
            parentNode: function () {
                return wrap(unsafeUnwrap(this).parentNode());
            },
            firstChild: function () {
                return wrap(unsafeUnwrap(this).firstChild());
            },
            lastChild: function () {
                return wrap(unsafeUnwrap(this).lastChild());
            },
            previousSibling: function () {
                return wrap(unsafeUnwrap(this).previousSibling());
            },
            previousNode: function () {
                return wrap(unsafeUnwrap(this).previousNode());
            },
            nextNode: function () {
                return wrap(unsafeUnwrap(this).nextNode());
            }
        };
        registerWrapper(OriginalTreeWalker, TreeWalker);
        scope.wrappers.TreeWalker = TreeWalker;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var GetElementsByInterface = scope.GetElementsByInterface;
        var Node = scope.wrappers.Node;
        var ParentNodeInterface = scope.ParentNodeInterface;
        var NonElementParentNodeInterface = scope.NonElementParentNodeInterface;
        var Selection = scope.wrappers.Selection;
        var SelectorsInterface = scope.SelectorsInterface;
        var ShadowRoot = scope.wrappers.ShadowRoot;
        var TreeScope = scope.TreeScope;
        var cloneNode = scope.cloneNode;
        var defineGetter = scope.defineGetter;
        var defineWrapGetter = scope.defineWrapGetter;
        var elementFromPoint = scope.elementFromPoint;
        var forwardMethodsToWrapper = scope.forwardMethodsToWrapper;
        var matchesNames = scope.matchesNames;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var renderAllPending = scope.renderAllPending;
        var rewrap = scope.rewrap;
        var setWrapper = scope.setWrapper;
        var unsafeUnwrap = scope.unsafeUnwrap;
        var unwrap = scope.unwrap;
        var wrap = scope.wrap;
        var wrapEventTargetMethods = scope.wrapEventTargetMethods;
        var wrapNodeList = scope.wrapNodeList;
        var implementationTable = new WeakMap();
        function Document(node) {
            Node.call(this, node);
            this.treeScope_ = new TreeScope(this, null);
        }
        Document.prototype = Object.create(Node.prototype);
        defineWrapGetter(Document, "documentElement");
        defineWrapGetter(Document, "body");
        defineWrapGetter(Document, "head");
        defineGetter(Document, "activeElement", function () {
            var unwrappedActiveElement = unwrap(this).activeElement;
            if (!unwrappedActiveElement || !unwrappedActiveElement.nodeType) return null;
            var activeElement = wrap(unwrappedActiveElement);
            while (!this.contains(activeElement)) {
                while (activeElement.parentNode) {
                    activeElement = activeElement.parentNode;
                }
                if (activeElement.host) {
                    activeElement = activeElement.host;
                } else {
                    return null;
                }
            }
            return activeElement;
        });
        function wrapMethod(name) {
            var original = document[name];
            Document.prototype[name] = function () {
                return wrap(original.apply(unsafeUnwrap(this), arguments));
            };
        }
        ["createComment", "createDocumentFragment", "createElement", "createElementNS", "createEvent", "createEventNS", "createRange", "createTextNode"].forEach(wrapMethod);
        var originalAdoptNode = document.adoptNode;
        function adoptNodeNoRemove(node, doc) {
            originalAdoptNode.call(unsafeUnwrap(doc), unwrap(node));
            adoptSubtree(node, doc);
        }
        function adoptSubtree(node, doc) {
            if (node.shadowRoot) doc.adoptNode(node.shadowRoot);
            if (node instanceof ShadowRoot) adoptOlderShadowRoots(node, doc);
            for (var child = node.firstChild; child; child = child.nextSibling) {
                adoptSubtree(child, doc);
            }
        }
        function adoptOlderShadowRoots(shadowRoot, doc) {
            var oldShadowRoot = shadowRoot.olderShadowRoot;
            if (oldShadowRoot) doc.adoptNode(oldShadowRoot);
        }
        var originalGetSelection = document.getSelection;
        mixin(Document.prototype, {
            adoptNode: function (node) {
                if (node.parentNode) node.parentNode.removeChild(node);
                adoptNodeNoRemove(node, this);
                return node;
            },
            elementFromPoint: function (x, y) {
                return elementFromPoint(this, this, x, y);
            },
            importNode: function (node, deep) {
                return cloneNode(node, deep, unsafeUnwrap(this));
            },
            getSelection: function () {
                renderAllPending();
                return new Selection(originalGetSelection.call(unwrap(this)));
            },
            getElementsByName: function (name) {
                return SelectorsInterface.querySelectorAll.call(this, "[name=" + JSON.stringify(String(name)) + "]");
            }
        });
        var originalCreateTreeWalker = document.createTreeWalker;
        var TreeWalkerWrapper = scope.wrappers.TreeWalker;
        Document.prototype.createTreeWalker = function (root, whatToShow, filter, expandEntityReferences) {
            var newFilter = null;
            if (filter) {
                if (filter.acceptNode && typeof filter.acceptNode === "function") {
                    newFilter = {
                        acceptNode: function (node) {
                            return filter.acceptNode(wrap(node));
                        }
                    };
                } else if (typeof filter === "function") {
                    newFilter = function (node) {
                        return filter(wrap(node));
                    };
                }
            }
            return new TreeWalkerWrapper(originalCreateTreeWalker.call(unwrap(this), unwrap(root), whatToShow, newFilter, expandEntityReferences));
        };
        if (document.registerElement) {
            var originalRegisterElement = document.registerElement;
            Document.prototype.registerElement = function (tagName, object) {
                var prototype, extendsOption;
                if (object !== undefined) {
                    prototype = object.prototype;
                    extendsOption = object.extends;
                }
                if (!prototype) prototype = Object.create(HTMLElement.prototype);
                if (scope.nativePrototypeTable.get(prototype)) {
                    throw new Error("NotSupportedError");
                }
                var proto = Object.getPrototypeOf(prototype);
                var nativePrototype;
                var prototypes = [];
                while (proto) {
                    nativePrototype = scope.nativePrototypeTable.get(proto);
                    if (nativePrototype) break;
                    prototypes.push(proto);
                    proto = Object.getPrototypeOf(proto);
                }
                if (!nativePrototype) {
                    throw new Error("NotSupportedError");
                }
                var newPrototype = Object.create(nativePrototype);
                for (var i = prototypes.length - 1; i >= 0; i--) {
                    newPrototype = Object.create(newPrototype);
                }
                ["createdCallback", "attachedCallback", "detachedCallback", "attributeChangedCallback"].forEach(function (name) {
                    var f = prototype[name];
                    if (!f) return;
                    newPrototype[name] = function () {
                        if (!(wrap(this) instanceof CustomElementConstructor)) {
                            rewrap(this);
                        }
                        f.apply(wrap(this), arguments);
                    };
                });
                var p = {
                    prototype: newPrototype
                };
                if (extendsOption) p.extends = extendsOption;
                function CustomElementConstructor(node) {
                    if (!node) {
                        if (extendsOption) {
                            return document.createElement(extendsOption, tagName);
                        } else {
                            return document.createElement(tagName);
                        }
                    }
                    setWrapper(node, this);
                }
                CustomElementConstructor.prototype = prototype;
                CustomElementConstructor.prototype.constructor = CustomElementConstructor;
                scope.constructorTable.set(newPrototype, CustomElementConstructor);
                scope.nativePrototypeTable.set(prototype, newPrototype);
                var nativeConstructor = originalRegisterElement.call(unwrap(this), tagName, p);
                return CustomElementConstructor;
            };
            forwardMethodsToWrapper([window.HTMLDocument || window.Document], ["registerElement"]);
        }
        forwardMethodsToWrapper([window.HTMLBodyElement, window.HTMLDocument || window.Document, window.HTMLHeadElement, window.HTMLHtmlElement], ["appendChild", "compareDocumentPosition", "contains", "getElementsByClassName", "getElementsByTagName", "getElementsByTagNameNS", "insertBefore", "querySelector", "querySelectorAll", "removeChild", "replaceChild"]);
        forwardMethodsToWrapper([window.HTMLBodyElement, window.HTMLHeadElement, window.HTMLHtmlElement], matchesNames);
        forwardMethodsToWrapper([window.HTMLDocument || window.Document], ["adoptNode", "importNode", "contains", "createComment", "createDocumentFragment", "createElement", "createElementNS", "createEvent", "createEventNS", "createRange", "createTextNode", "createTreeWalker", "elementFromPoint", "getElementById", "getElementsByName", "getSelection"]);
        mixin(Document.prototype, GetElementsByInterface);
        mixin(Document.prototype, ParentNodeInterface);
        mixin(Document.prototype, SelectorsInterface);
        mixin(Document.prototype, NonElementParentNodeInterface);
        mixin(Document.prototype, {
            get implementation() {
                var implementation = implementationTable.get(this);
                if (implementation) return implementation;
                implementation = new DOMImplementation(unwrap(this).implementation);
                implementationTable.set(this, implementation);
                return implementation;
            },
            get defaultView() {
                return wrap(unwrap(this).defaultView);
            }
        });
        registerWrapper(window.Document, Document, document.implementation.createHTMLDocument(""));
        if (window.HTMLDocument) registerWrapper(window.HTMLDocument, Document);
        wrapEventTargetMethods([window.HTMLBodyElement, window.HTMLDocument || window.Document, window.HTMLHeadElement]);
        function DOMImplementation(impl) {
            setWrapper(impl, this);
        }
        var originalCreateDocument = document.implementation.createDocument;
        DOMImplementation.prototype.createDocument = function () {
            arguments[2] = unwrap(arguments[2]);
            return wrap(originalCreateDocument.apply(unsafeUnwrap(this), arguments));
        };
        function wrapImplMethod(constructor, name) {
            var original = document.implementation[name];
            constructor.prototype[name] = function () {
                return wrap(original.apply(unsafeUnwrap(this), arguments));
            };
        }
        function forwardImplMethod(constructor, name) {
            var original = document.implementation[name];
            constructor.prototype[name] = function () {
                return original.apply(unsafeUnwrap(this), arguments);
            };
        }
        wrapImplMethod(DOMImplementation, "createDocumentType");
        wrapImplMethod(DOMImplementation, "createHTMLDocument");
        forwardImplMethod(DOMImplementation, "hasFeature");
        registerWrapper(window.DOMImplementation, DOMImplementation);
        forwardMethodsToWrapper([window.DOMImplementation], ["createDocument", "createDocumentType", "createHTMLDocument", "hasFeature"]);
        scope.adoptNodeNoRemove = adoptNodeNoRemove;
        scope.wrappers.DOMImplementation = DOMImplementation;
        scope.wrappers.Document = Document;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var EventTarget = scope.wrappers.EventTarget;
        var Selection = scope.wrappers.Selection;
        var mixin = scope.mixin;
        var registerWrapper = scope.registerWrapper;
        var renderAllPending = scope.renderAllPending;
        var unwrap = scope.unwrap;
        var unwrapIfNeeded = scope.unwrapIfNeeded;
        var wrap = scope.wrap;
        var OriginalWindow = window.Window;
        var originalGetComputedStyle = window.getComputedStyle;
        var originalGetDefaultComputedStyle = window.getDefaultComputedStyle;
        var originalGetSelection = window.getSelection;
        function Window(impl) {
            EventTarget.call(this, impl);
        }
        Window.prototype = Object.create(EventTarget.prototype);
        OriginalWindow.prototype.getComputedStyle = function (el, pseudo) {
            return wrap(this || window).getComputedStyle(unwrapIfNeeded(el), pseudo);
        };
        if (originalGetDefaultComputedStyle) {
            OriginalWindow.prototype.getDefaultComputedStyle = function (el, pseudo) {
                return wrap(this || window).getDefaultComputedStyle(unwrapIfNeeded(el), pseudo);
            };
        }
        OriginalWindow.prototype.getSelection = function () {
            return wrap(this || window).getSelection();
        };
        delete window.getComputedStyle;
        delete window.getDefaultComputedStyle;
        delete window.getSelection;
        ["addEventListener", "removeEventListener", "dispatchEvent"].forEach(function (name) {
            OriginalWindow.prototype[name] = function () {
                var w = wrap(this || window);
                return w[name].apply(w, arguments);
            };
            delete window[name];
        });
        mixin(Window.prototype, {
            getComputedStyle: function (el, pseudo) {
                renderAllPending();
                return originalGetComputedStyle.call(unwrap(this), unwrapIfNeeded(el), pseudo);
            },
            getSelection: function () {
                renderAllPending();
                return new Selection(originalGetSelection.call(unwrap(this)));
            },
            get document() {
                return wrap(unwrap(this).document);
            }
        });
        if (originalGetDefaultComputedStyle) {
            Window.prototype.getDefaultComputedStyle = function (el, pseudo) {
                renderAllPending();
                return originalGetDefaultComputedStyle.call(unwrap(this), unwrapIfNeeded(el), pseudo);
            };
        }
        registerWrapper(OriginalWindow, Window, window);
        scope.wrappers.Window = Window;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var unwrap = scope.unwrap;
        var OriginalDataTransfer = window.DataTransfer || window.Clipboard;
        var OriginalDataTransferSetDragImage = OriginalDataTransfer.prototype.setDragImage;
        if (OriginalDataTransferSetDragImage) {
            OriginalDataTransfer.prototype.setDragImage = function (image, x, y) {
                OriginalDataTransferSetDragImage.call(this, unwrap(image), x, y);
            };
        }
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var registerWrapper = scope.registerWrapper;
        var setWrapper = scope.setWrapper;
        var unwrap = scope.unwrap;
        var OriginalFormData = window.FormData;
        if (!OriginalFormData) return;
        function FormData(formElement) {
            var impl;
            if (formElement instanceof OriginalFormData) {
                impl = formElement;
            } else {
                impl = new OriginalFormData(formElement && unwrap(formElement));
            }
            setWrapper(impl, this);
        }
        registerWrapper(OriginalFormData, FormData, new OriginalFormData());
        scope.wrappers.FormData = FormData;
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var unwrapIfNeeded = scope.unwrapIfNeeded;
        var originalSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function (obj) {
            return originalSend.call(this, unwrapIfNeeded(obj));
        };
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        "use strict";
        var isWrapperFor = scope.isWrapperFor;
        var elements = {
            a: "HTMLAnchorElement",
            area: "HTMLAreaElement",
            audio: "HTMLAudioElement",
            base: "HTMLBaseElement",
            body: "HTMLBodyElement",
            br: "HTMLBRElement",
            button: "HTMLButtonElement",
            canvas: "HTMLCanvasElement",
            caption: "HTMLTableCaptionElement",
            col: "HTMLTableColElement",
            content: "HTMLContentElement",
            data: "HTMLDataElement",
            datalist: "HTMLDataListElement",
            del: "HTMLModElement",
            dir: "HTMLDirectoryElement",
            div: "HTMLDivElement",
            dl: "HTMLDListElement",
            embed: "HTMLEmbedElement",
            fieldset: "HTMLFieldSetElement",
            font: "HTMLFontElement",
            form: "HTMLFormElement",
            frame: "HTMLFrameElement",
            frameset: "HTMLFrameSetElement",
            h1: "HTMLHeadingElement",
            head: "HTMLHeadElement",
            hr: "HTMLHRElement",
            html: "HTMLHtmlElement",
            iframe: "HTMLIFrameElement",
            img: "HTMLImageElement",
            input: "HTMLInputElement",
            keygen: "HTMLKeygenElement",
            label: "HTMLLabelElement",
            legend: "HTMLLegendElement",
            li: "HTMLLIElement",
            link: "HTMLLinkElement",
            map: "HTMLMapElement",
            marquee: "HTMLMarqueeElement",
            menu: "HTMLMenuElement",
            menuitem: "HTMLMenuItemElement",
            meta: "HTMLMetaElement",
            meter: "HTMLMeterElement",
            object: "HTMLObjectElement",
            ol: "HTMLOListElement",
            optgroup: "HTMLOptGroupElement",
            option: "HTMLOptionElement",
            output: "HTMLOutputElement",
            p: "HTMLParagraphElement",
            param: "HTMLParamElement",
            pre: "HTMLPreElement",
            progress: "HTMLProgressElement",
            q: "HTMLQuoteElement",
            script: "HTMLScriptElement",
            select: "HTMLSelectElement",
            shadow: "HTMLShadowElement",
            source: "HTMLSourceElement",
            span: "HTMLSpanElement",
            style: "HTMLStyleElement",
            table: "HTMLTableElement",
            tbody: "HTMLTableSectionElement",
            template: "HTMLTemplateElement",
            textarea: "HTMLTextAreaElement",
            thead: "HTMLTableSectionElement",
            time: "HTMLTimeElement",
            title: "HTMLTitleElement",
            tr: "HTMLTableRowElement",
            track: "HTMLTrackElement",
            ul: "HTMLUListElement",
            video: "HTMLVideoElement"
        };
        function overrideConstructor(tagName) {
            var nativeConstructorName = elements[tagName];
            var nativeConstructor = window[nativeConstructorName];
            if (!nativeConstructor) return;
            var element = document.createElement(tagName);
            var wrapperConstructor = element.constructor;
            window[nativeConstructorName] = wrapperConstructor;
        }
        Object.keys(elements).forEach(overrideConstructor);
        Object.getOwnPropertyNames(scope.wrappers).forEach(function (name) {
            window[name] = scope.wrappers[name];
        });
    })(window.ShadowDOMPolyfill);
    (function (scope) {
        var ShadowCSS = {
            strictStyling: false,
            registry: {},
            shimStyling: function (root, name, extendsName) {
                var scopeStyles = this.prepareRoot(root, name, extendsName);
                var typeExtension = this.isTypeExtension(extendsName);
                var scopeSelector = this.makeScopeSelector(name, typeExtension);
                var cssText = stylesToCssText(scopeStyles, true);
                cssText = this.scopeCssText(cssText, scopeSelector);
                if (root) {
                    root.shimmedStyle = cssText;
                }
                this.addCssToDocument(cssText, name);
            },
            shimStyle: function (style, selector) {
                return this.shimCssText(style.textContent, selector);
            },
            shimCssText: function (cssText, selector) {
                cssText = this.insertDirectives(cssText);
                return this.scopeCssText(cssText, selector);
            },
            makeScopeSelector: function (name, typeExtension) {
                if (name) {
                    return typeExtension ? "[is=" + name + "]" : name;
                }
                return "";
            },
            isTypeExtension: function (extendsName) {
                return extendsName && extendsName.indexOf("-") < 0;
            },
            prepareRoot: function (root, name, extendsName) {
                var def = this.registerRoot(root, name, extendsName);
                this.replaceTextInStyles(def.rootStyles, this.insertDirectives);
                this.removeStyles(root, def.rootStyles);
                if (this.strictStyling) {
                    this.applyScopeToContent(root, name);
                }
                return def.scopeStyles;
            },
            removeStyles: function (root, styles) {
                for (var i = 0, l = styles.length, s; i < l && (s = styles[i]); i++) {
                    s.parentNode.removeChild(s);
                }
            },
            registerRoot: function (root, name, extendsName) {
                var def = this.registry[name] = {
                    root: root,
                    name: name,
                    extendsName: extendsName
                };
                var styles = this.findStyles(root);
                def.rootStyles = styles;
                def.scopeStyles = def.rootStyles;
                var extendee = this.registry[def.extendsName];
                if (extendee) {
                    def.scopeStyles = extendee.scopeStyles.concat(def.scopeStyles);
                }
                return def;
            },
            findStyles: function (root) {
                if (!root) {
                    return [];
                }
                var styles = root.querySelectorAll("style");
                return Array.prototype.filter.call(styles, function (s) {
                    return !s.hasAttribute(NO_SHIM_ATTRIBUTE);
                });
            },
            applyScopeToContent: function (root, name) {
                if (root) {
                    Array.prototype.forEach.call(root.querySelectorAll("*"), function (node) {
                        node.setAttribute(name, "");
                    });
                    Array.prototype.forEach.call(root.querySelectorAll("template"), function (template) {
                        this.applyScopeToContent(template.content, name);
                    }, this);
                }
            },
            insertDirectives: function (cssText) {
                cssText = this.insertPolyfillDirectivesInCssText(cssText);
                return this.insertPolyfillRulesInCssText(cssText);
            },
            insertPolyfillDirectivesInCssText: function (cssText) {
                cssText = cssText.replace(cssCommentNextSelectorRe, function (match, p1) {
                    return p1.slice(0, -2) + "{";
                });
                return cssText.replace(cssContentNextSelectorRe, function (match, p1) {
                    return p1 + " {";
                });
            },
            insertPolyfillRulesInCssText: function (cssText) {
                cssText = cssText.replace(cssCommentRuleRe, function (match, p1) {
                    return p1.slice(0, -1);
                });
                return cssText.replace(cssContentRuleRe, function (match, p1, p2, p3) {
                    var rule = match.replace(p1, "").replace(p2, "");
                    return p3 + rule;
                });
            },
            scopeCssText: function (cssText, scopeSelector) {
                var unscoped = this.extractUnscopedRulesFromCssText(cssText);
                cssText = this.insertPolyfillHostInCssText(cssText);
                cssText = this.convertColonHost(cssText);
                cssText = this.convertColonHostContext(cssText);
                cssText = this.convertShadowDOMSelectors(cssText);
                if (scopeSelector) {
                    var self = this, cssText;
                    withCssRules(cssText, function (rules) {
                        cssText = self.scopeRules(rules, scopeSelector);
                    });
                }
                cssText = cssText + "\n" + unscoped;
                return cssText.trim();
            },
            extractUnscopedRulesFromCssText: function (cssText) {
                var r = "", m;
                while (m = cssCommentUnscopedRuleRe.exec(cssText)) {
                    r += m[1].slice(0, -1) + "\n\n";
                }
                while (m = cssContentUnscopedRuleRe.exec(cssText)) {
                    r += m[0].replace(m[2], "").replace(m[1], m[3]) + "\n\n";
                }
                return r;
            },
            convertColonHost: function (cssText) {
                return this.convertColonRule(cssText, cssColonHostRe, this.colonHostPartReplacer);
            },
            convertColonHostContext: function (cssText) {
                return this.convertColonRule(cssText, cssColonHostContextRe, this.colonHostContextPartReplacer);
            },
            convertColonRule: function (cssText, regExp, partReplacer) {
                return cssText.replace(regExp, function (m, p1, p2, p3) {
                    p1 = polyfillHostNoCombinator;
                    if (p2) {
                        var parts = p2.split(","), r = [];
                        for (var i = 0, l = parts.length, p; i < l && (p = parts[i]); i++) {
                            p = p.trim();
                            r.push(partReplacer(p1, p, p3));
                        }
                        return r.join(",");
                    } else {
                        return p1 + p3;
                    }
                });
            },
            colonHostContextPartReplacer: function (host, part, suffix) {
                if (part.match(polyfillHost)) {
                    return this.colonHostPartReplacer(host, part, suffix);
                } else {
                    return host + part + suffix + ", " + part + " " + host + suffix;
                }
            },
            colonHostPartReplacer: function (host, part, suffix) {
                return host + part.replace(polyfillHost, "") + suffix;
            },
            convertShadowDOMSelectors: function (cssText) {
                for (var i = 0; i < shadowDOMSelectorsRe.length; i++) {
                    cssText = cssText.replace(shadowDOMSelectorsRe[i], " ");
                }
                return cssText;
            },
            scopeRules: function (cssRules, scopeSelector) {
                var cssText = "";
                if (cssRules) {
                    Array.prototype.forEach.call(cssRules, function (rule) {
                        if (rule.selectorText && (rule.style && rule.style.cssText !== undefined)) {
                            cssText += this.scopeSelector(rule.selectorText, scopeSelector, this.strictStyling) + " {\n	";
                            cssText += this.propertiesFromRule(rule) + "\n}\n\n";
                        } else if (rule.type === CSSRule.MEDIA_RULE) {
                            cssText += "@media " + rule.media.mediaText + " {\n";
                            cssText += this.scopeRules(rule.cssRules, scopeSelector);
                            cssText += "\n}\n\n";
                        } else {
                            try {
                                if (rule.cssText) {
                                    cssText += rule.cssText + "\n\n";
                                }
                            } catch (x) {
                                if (rule.type === CSSRule.KEYFRAMES_RULE && rule.cssRules) {
                                    cssText += this.ieSafeCssTextFromKeyFrameRule(rule);
                                }
                            }
                        }
                    }, this);
                }
                return cssText;
            },
            ieSafeCssTextFromKeyFrameRule: function (rule) {
                var cssText = "@keyframes " + rule.name + " {";
                Array.prototype.forEach.call(rule.cssRules, function (rule) {
                    cssText += " " + rule.keyText + " {" + rule.style.cssText + "}";
                });
                cssText += " }";
                return cssText;
            },
            scopeSelector: function (selector, scopeSelector, strict) {
                var r = [], parts = selector.split(",");
                parts.forEach(function (p) {
                    p = p.trim();
                    if (this.selectorNeedsScoping(p, scopeSelector)) {
                        p = strict && !p.match(polyfillHostNoCombinator) ? this.applyStrictSelectorScope(p, scopeSelector) : this.applySelectorScope(p, scopeSelector);
                    }
                    r.push(p);
                }, this);
                return r.join(", ");
            },
            selectorNeedsScoping: function (selector, scopeSelector) {
                if (Array.isArray(scopeSelector)) {
                    return true;
                }
                var re = this.makeScopeMatcher(scopeSelector);
                return !selector.match(re);
            },
            makeScopeMatcher: function (scopeSelector) {
                scopeSelector = scopeSelector.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
                return new RegExp("^(" + scopeSelector + ")" + selectorReSuffix, "m");
            },
            applySelectorScope: function (selector, selectorScope) {
                return Array.isArray(selectorScope) ? this.applySelectorScopeList(selector, selectorScope) : this.applySimpleSelectorScope(selector, selectorScope);
            },
            applySelectorScopeList: function (selector, scopeSelectorList) {
                var r = [];
                for (var i = 0, s; s = scopeSelectorList[i]; i++) {
                    r.push(this.applySimpleSelectorScope(selector, s));
                }
                return r.join(", ");
            },
            applySimpleSelectorScope: function (selector, scopeSelector) {
                if (selector.match(polyfillHostRe)) {
                    selector = selector.replace(polyfillHostNoCombinator, scopeSelector);
                    return selector.replace(polyfillHostRe, scopeSelector + " ");
                } else {
                    return scopeSelector + " " + selector;
                }
            },
            applyStrictSelectorScope: function (selector, scopeSelector) {
                scopeSelector = scopeSelector.replace(/\[is=([^\]]*)\]/g, "$1");
                var splits = [" ", ">", "+", "~"], scoped = selector, attrName = "[" + scopeSelector + "]";
                splits.forEach(function (sep) {
                    var parts = scoped.split(sep);
                    scoped = parts.map(function (p) {
                        var t = p.trim().replace(polyfillHostRe, "");
                        if (t && splits.indexOf(t) < 0 && t.indexOf(attrName) < 0) {
                            p = t.replace(/([^:]*)(:*)(.*)/, "$1" + attrName + "$2$3");
                        }
                        return p;
                    }).join(sep);
                });
                return scoped;
            },
            insertPolyfillHostInCssText: function (selector) {
                return selector.replace(colonHostContextRe, polyfillHostContext).replace(colonHostRe, polyfillHost);
            },
            propertiesFromRule: function (rule) {
                var cssText = rule.style.cssText;
                if (rule.style.content && !rule.style.content.match(/['"]+|attr/)) {
                    cssText = cssText.replace(/content:[^;]*;/g, "content: '" + rule.style.content + "';");
                }
                var style = rule.style;
                for (var i in style) {
                    if (style[i] === "initial") {
                        cssText += i + ": initial; ";
                    }
                }
                return cssText;
            },
            replaceTextInStyles: function (styles, action) {
                if (styles && action) {
                    if (!(styles instanceof Array)) {
                        styles = [styles];
                    }
                    Array.prototype.forEach.call(styles, function (s) {
                        s.textContent = action.call(this, s.textContent);
                    }, this);
                }
            },
            addCssToDocument: function (cssText, name) {
                if (cssText.match("@import")) {
                    addOwnSheet(cssText, name);
                } else {
                    addCssToDocument(cssText);
                }
            }
        };
        var selectorRe = /([^{]*)({[\s\S]*?})/gim, cssCommentRe = /\/\*[^*]*\*+([^\/*][^*]*\*+)*\//gim, cssCommentNextSelectorRe = /\/\*\s*@polyfill ([^*]*\*+([^\/*][^*]*\*+)*\/)([^{]*?){/gim, cssContentNextSelectorRe = /polyfill-next-selector[^}]*content\:[\s]*?['"](.*?)['"][;\s]*}([^{]*?){/gim, cssCommentRuleRe = /\/\*\s@polyfill-rule([^*]*\*+([^\/*][^*]*\*+)*)\//gim, cssContentRuleRe = /(polyfill-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim, cssCommentUnscopedRuleRe = /\/\*\s@polyfill-unscoped-rule([^*]*\*+([^\/*][^*]*\*+)*)\//gim, cssContentUnscopedRuleRe = /(polyfill-unscoped-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim, cssPseudoRe = /::(x-[^\s{,(]*)/gim, cssPartRe = /::part\(([^)]*)\)/gim, polyfillHost = "-shadowcsshost", polyfillHostContext = "-shadowcsscontext", parenSuffix = ")(?:\\((" + "(?:\\([^)(]*\\)|[^)(]*)+?" + ")\\))?([^,{]*)";
        var cssColonHostRe = new RegExp("(" + polyfillHost + parenSuffix, "gim"), cssColonHostContextRe = new RegExp("(" + polyfillHostContext + parenSuffix, "gim"), selectorReSuffix = "([>\\s~+[.,{:][\\s\\S]*)?$", colonHostRe = /\:host/gim, colonHostContextRe = /\:host-context/gim, polyfillHostNoCombinator = polyfillHost + "-no-combinator", polyfillHostRe = new RegExp(polyfillHost, "gim"), polyfillHostContextRe = new RegExp(polyfillHostContext, "gim"), shadowDOMSelectorsRe = [/>>>/g, /::shadow/g, /::content/g, /\/deep\//g, /\/shadow\//g, /\/shadow-deep\//g, /\^\^/g, /\^/g];
        function stylesToCssText(styles, preserveComments) {
            var cssText = "";
            Array.prototype.forEach.call(styles, function (s) {
                cssText += s.textContent + "\n\n";
            });
            if (!preserveComments) {
                cssText = cssText.replace(cssCommentRe, "");
            }
            return cssText;
        }
        function cssTextToStyle(cssText) {
            var style = document.createElement("style");
            style.textContent = cssText;
            return style;
        }
        function cssToRules(cssText) {
            var style = cssTextToStyle(cssText);
            document.head.appendChild(style);
            var rules = [];
            if (style.sheet) {
                try {
                    rules = style.sheet.cssRules;
                } catch (e) { }
            } else {
                console.warn("sheet not found", style);
            }
            style.parentNode.removeChild(style);
            return rules;
        }
        var frame = document.createElement("iframe");
        frame.style.display = "none";
        function initFrame() {
            frame.initialized = true;
            document.body.appendChild(frame);
            var doc = frame.contentDocument;
            var base = doc.createElement("base");
            base.href = document.baseURI;
            doc.head.appendChild(base);
        }
        function inFrame(fn) {
            if (!frame.initialized) {
                initFrame();
            }
            document.body.appendChild(frame);
            fn(frame.contentDocument);
            document.body.removeChild(frame);
        }
        var isChrome = navigator.userAgent.match("Chrome");
        function withCssRules(cssText, callback) {
            if (!callback) {
                return;
            }
            var rules;
            if (cssText.match("@import") && isChrome) {
                var style = cssTextToStyle(cssText);
                inFrame(function (doc) {
                    doc.head.appendChild(style.impl);
                    rules = Array.prototype.slice.call(style.sheet.cssRules, 0);
                    callback(rules);
                });
            } else {
                rules = cssToRules(cssText);
                callback(rules);
            }
        }
        function rulesToCss(cssRules) {
            for (var i = 0, css = []; i < cssRules.length; i++) {
                css.push(cssRules[i].cssText);
            }
            return css.join("\n\n");
        }
        function addCssToDocument(cssText) {
            if (cssText) {
                getSheet().appendChild(document.createTextNode(cssText));
            }
        }
        function addOwnSheet(cssText, name) {
            var style = cssTextToStyle(cssText);
            style.setAttribute(name, "");
            style.setAttribute(SHIMMED_ATTRIBUTE, "");
            document.head.appendChild(style);
        }
        var SHIM_ATTRIBUTE = "shim-shadowdom";
        var SHIMMED_ATTRIBUTE = "shim-shadowdom-css";
        var NO_SHIM_ATTRIBUTE = "no-shim";
        var sheet;
        function getSheet() {
            if (!sheet) {
                sheet = document.createElement("style");
                sheet.setAttribute(SHIMMED_ATTRIBUTE, "");
                sheet[SHIMMED_ATTRIBUTE] = true;
            }
            return sheet;
        }
        if (window.ShadowDOMPolyfill) {
            addCssToDocument("style { display: none !important; }\n");
            var doc = ShadowDOMPolyfill.wrap(document);
            var head = doc.querySelector("head");
            head.insertBefore(getSheet(), head.childNodes[0]);
            document.addEventListener("DOMContentLoaded", function () {
                var urlResolver = scope.urlResolver;
                if (window.HTMLImports && !HTMLImports.useNative) {
                    var SHIM_SHEET_SELECTOR = "link[rel=stylesheet]" + "[" + SHIM_ATTRIBUTE + "]";
                    var SHIM_STYLE_SELECTOR = "style[" + SHIM_ATTRIBUTE + "]";
                    HTMLImports.importer.documentPreloadSelectors += "," + SHIM_SHEET_SELECTOR;
                    HTMLImports.importer.importsPreloadSelectors += "," + SHIM_SHEET_SELECTOR;
                    HTMLImports.parser.documentSelectors = [HTMLImports.parser.documentSelectors, SHIM_SHEET_SELECTOR, SHIM_STYLE_SELECTOR].join(",");
                    var originalParseGeneric = HTMLImports.parser.parseGeneric;
                    HTMLImports.parser.parseGeneric = function (elt) {
                        if (elt[SHIMMED_ATTRIBUTE]) {
                            return;
                        }
                        var style = elt.__importElement || elt;
                        if (!style.hasAttribute(SHIM_ATTRIBUTE)) {
                            originalParseGeneric.call(this, elt);
                            return;
                        }
                        if (elt.__resource) {
                            style = elt.ownerDocument.createElement("style");
                            style.textContent = elt.__resource;
                        }
                        HTMLImports.path.resolveUrlsInStyle(style, elt.href);
                        style.textContent = ShadowCSS.shimStyle(style);
                        style.removeAttribute(SHIM_ATTRIBUTE, "");
                        style.setAttribute(SHIMMED_ATTRIBUTE, "");
                        style[SHIMMED_ATTRIBUTE] = true;
                        if (style.parentNode !== head) {
                            if (elt.parentNode === head) {
                                head.replaceChild(style, elt);
                            } else {
                                this.addElementToDocument(style);
                            }
                        }
                        style.__importParsed = true;
                        this.markParsingComplete(elt);
                        this.parseNext();
                    };
                    var hasResource = HTMLImports.parser.hasResource;
                    HTMLImports.parser.hasResource = function (node) {
                        if (node.localName === "link" && node.rel === "stylesheet" && node.hasAttribute(SHIM_ATTRIBUTE)) {
                            return node.__resource;
                        } else {
                            return hasResource.call(this, node);
                        }
                    };
                }
            });
        }
        scope.ShadowCSS = ShadowCSS;
    })(window.WebComponents);
}

(function (scope) {
    if (window.ShadowDOMPolyfill) {
        window.wrap = ShadowDOMPolyfill.wrapIfNeeded;
        window.unwrap = ShadowDOMPolyfill.unwrapIfNeeded;
    } else {
        window.wrap = window.unwrap = function (n) {
            return n;
        };
    }
})(window.WebComponents);

(function (scope) {
    "use strict";
    var hasWorkingUrl = false;
    if (!scope.forceJURL) {
        try {
            var u = new URL("b", "http://a");
            u.pathname = "c%20d";
            hasWorkingUrl = u.href === "http://a/c%20d";
        } catch (e) { }
    }
    if (hasWorkingUrl) return;
    var relative = Object.create(null);
    relative["ftp"] = 21;
    relative["file"] = 0;
    relative["gopher"] = 70;
    relative["http"] = 80;
    relative["https"] = 443;
    relative["ws"] = 80;
    relative["wss"] = 443;
    var relativePathDotMapping = Object.create(null);
    relativePathDotMapping["%2e"] = ".";
    relativePathDotMapping[".%2e"] = "..";
    relativePathDotMapping["%2e."] = "..";
    relativePathDotMapping["%2e%2e"] = "..";
    function isRelativeScheme(scheme) {
        return relative[scheme] !== undefined;
    }
    function invalid() {
        clear.call(this);
        this._isInvalid = true;
    }
    function IDNAToASCII(h) {
        if ("" == h) {
            invalid.call(this);
        }
        return h.toLowerCase();
    }
    function percentEscape(c) {
        var unicode = c.charCodeAt(0);
        if (unicode > 32 && unicode < 127 && [34, 35, 60, 62, 63, 96].indexOf(unicode) == -1) {
            return c;
        }
        return encodeURIComponent(c);
    }
    function percentEscapeQuery(c) {
        var unicode = c.charCodeAt(0);
        if (unicode > 32 && unicode < 127 && [34, 35, 60, 62, 96].indexOf(unicode) == -1) {
            return c;
        }
        return encodeURIComponent(c);
    }
    var EOF = undefined, ALPHA = /[a-zA-Z]/, ALPHANUMERIC = /[a-zA-Z0-9\+\-\.]/;
    function parse(input, stateOverride, base) {
        function err(message) {
            errors.push(message);
        }
        var state = stateOverride || "scheme start", cursor = 0, buffer = "", seenAt = false, seenBracket = false, errors = [];
        loop: while ((input[cursor - 1] != EOF || cursor == 0) && !this._isInvalid) {
            var c = input[cursor];
            switch (state) {
                case "scheme start":
                    if (c && ALPHA.test(c)) {
                        buffer += c.toLowerCase();
                        state = "scheme";
                    } else if (!stateOverride) {
                        buffer = "";
                        state = "no scheme";
                        continue;
                    } else {
                        err("Invalid scheme.");
                        break loop;
                    }
                    break;

                case "scheme":
                    if (c && ALPHANUMERIC.test(c)) {
                        buffer += c.toLowerCase();
                    } else if (":" == c) {
                        this._scheme = buffer;
                        buffer = "";
                        if (stateOverride) {
                            break loop;
                        }
                        if (isRelativeScheme(this._scheme)) {
                            this._isRelative = true;
                        }
                        if ("file" == this._scheme) {
                            state = "relative";
                        } else if (this._isRelative && base && base._scheme == this._scheme) {
                            state = "relative or authority";
                        } else if (this._isRelative) {
                            state = "authority first slash";
                        } else {
                            state = "scheme data";
                        }
                    } else if (!stateOverride) {
                        buffer = "";
                        cursor = 0;
                        state = "no scheme";
                        continue;
                    } else if (EOF == c) {
                        break loop;
                    } else {
                        err("Code point not allowed in scheme: " + c);
                        break loop;
                    }
                    break;

                case "scheme data":
                    if ("?" == c) {
                        this._query = "?";
                        state = "query";
                    } else if ("#" == c) {
                        this._fragment = "#";
                        state = "fragment";
                    } else {
                        if (EOF != c && "	" != c && "\n" != c && "\r" != c) {
                            this._schemeData += percentEscape(c);
                        }
                    }
                    break;

                case "no scheme":
                    if (!base || !isRelativeScheme(base._scheme)) {
                        err("Missing scheme.");
                        invalid.call(this);
                    } else {
                        state = "relative";
                        continue;
                    }
                    break;

                case "relative or authority":
                    if ("/" == c && "/" == input[cursor + 1]) {
                        state = "authority ignore slashes";
                    } else {
                        err("Expected /, got: " + c);
                        state = "relative";
                        continue;
                    }
                    break;

                case "relative":
                    this._isRelative = true;
                    if ("file" != this._scheme) this._scheme = base._scheme;
                    if (EOF == c) {
                        this._host = base._host;
                        this._port = base._port;
                        this._path = base._path.slice();
                        this._query = base._query;
                        this._username = base._username;
                        this._password = base._password;
                        break loop;
                    } else if ("/" == c || "\\" == c) {
                        if ("\\" == c) err("\\ is an invalid code point.");
                        state = "relative slash";
                    } else if ("?" == c) {
                        this._host = base._host;
                        this._port = base._port;
                        this._path = base._path.slice();
                        this._query = "?";
                        this._username = base._username;
                        this._password = base._password;
                        state = "query";
                    } else if ("#" == c) {
                        this._host = base._host;
                        this._port = base._port;
                        this._path = base._path.slice();
                        this._query = base._query;
                        this._fragment = "#";
                        this._username = base._username;
                        this._password = base._password;
                        state = "fragment";
                    } else {
                        var nextC = input[cursor + 1];
                        var nextNextC = input[cursor + 2];
                        if ("file" != this._scheme || !ALPHA.test(c) || nextC != ":" && nextC != "|" || EOF != nextNextC && "/" != nextNextC && "\\" != nextNextC && "?" != nextNextC && "#" != nextNextC) {
                            this._host = base._host;
                            this._port = base._port;
                            this._username = base._username;
                            this._password = base._password;
                            this._path = base._path.slice();
                            this._path.pop();
                        }
                        state = "relative path";
                        continue;
                    }
                    break;

                case "relative slash":
                    if ("/" == c || "\\" == c) {
                        if ("\\" == c) {
                            err("\\ is an invalid code point.");
                        }
                        if ("file" == this._scheme) {
                            state = "file host";
                        } else {
                            state = "authority ignore slashes";
                        }
                    } else {
                        if ("file" != this._scheme) {
                            this._host = base._host;
                            this._port = base._port;
                            this._username = base._username;
                            this._password = base._password;
                        }
                        state = "relative path";
                        continue;
                    }
                    break;

                case "authority first slash":
                    if ("/" == c) {
                        state = "authority second slash";
                    } else {
                        err("Expected '/', got: " + c);
                        state = "authority ignore slashes";
                        continue;
                    }
                    break;

                case "authority second slash":
                    state = "authority ignore slashes";
                    if ("/" != c) {
                        err("Expected '/', got: " + c);
                        continue;
                    }
                    break;

                case "authority ignore slashes":
                    if ("/" != c && "\\" != c) {
                        state = "authority";
                        continue;
                    } else {
                        err("Expected authority, got: " + c);
                    }
                    break;

                case "authority":
                    if ("@" == c) {
                        if (seenAt) {
                            err("@ already seen.");
                            buffer += "%40";
                        }
                        seenAt = true;
                        for (var i = 0; i < buffer.length; i++) {
                            var cp = buffer[i];
                            if ("	" == cp || "\n" == cp || "\r" == cp) {
                                err("Invalid whitespace in authority.");
                                continue;
                            }
                            if (":" == cp && null === this._password) {
                                this._password = "";
                                continue;
                            }
                            var tempC = percentEscape(cp);
                            null !== this._password ? this._password += tempC : this._username += tempC;
                        }
                        buffer = "";
                    } else if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c) {
                        cursor -= buffer.length;
                        buffer = "";
                        state = "host";
                        continue;
                    } else {
                        buffer += c;
                    }
                    break;

                case "file host":
                    if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c) {
                        if (buffer.length == 2 && ALPHA.test(buffer[0]) && (buffer[1] == ":" || buffer[1] == "|")) {
                            state = "relative path";
                        } else if (buffer.length == 0) {
                            state = "relative path start";
                        } else {
                            this._host = IDNAToASCII.call(this, buffer);
                            buffer = "";
                            state = "relative path start";
                        }
                        continue;
                    } else if ("	" == c || "\n" == c || "\r" == c) {
                        err("Invalid whitespace in file host.");
                    } else {
                        buffer += c;
                    }
                    break;

                case "host":
                case "hostname":
                    if (":" == c && !seenBracket) {
                        this._host = IDNAToASCII.call(this, buffer);
                        buffer = "";
                        state = "port";
                        if ("hostname" == stateOverride) {
                            break loop;
                        }
                    } else if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c) {
                        this._host = IDNAToASCII.call(this, buffer);
                        buffer = "";
                        state = "relative path start";
                        if (stateOverride) {
                            break loop;
                        }
                        continue;
                    } else if ("	" != c && "\n" != c && "\r" != c) {
                        if ("[" == c) {
                            seenBracket = true;
                        } else if ("]" == c) {
                            seenBracket = false;
                        }
                        buffer += c;
                    } else {
                        err("Invalid code point in host/hostname: " + c);
                    }
                    break;

                case "port":
                    if (/[0-9]/.test(c)) {
                        buffer += c;
                    } else if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c || stateOverride) {
                        if ("" != buffer) {
                            var temp = parseInt(buffer, 10);
                            if (temp != relative[this._scheme]) {
                                this._port = temp + "";
                            }
                            buffer = "";
                        }
                        if (stateOverride) {
                            break loop;
                        }
                        state = "relative path start";
                        continue;
                    } else if ("	" == c || "\n" == c || "\r" == c) {
                        err("Invalid code point in port: " + c);
                    } else {
                        invalid.call(this);
                    }
                    break;

                case "relative path start":
                    if ("\\" == c) err("'\\' not allowed in path.");
                    state = "relative path";
                    if ("/" != c && "\\" != c) {
                        continue;
                    }
                    break;

                case "relative path":
                    if (EOF == c || "/" == c || "\\" == c || !stateOverride && ("?" == c || "#" == c)) {
                        if ("\\" == c) {
                            err("\\ not allowed in relative path.");
                        }
                        var tmp;
                        if (tmp = relativePathDotMapping[buffer.toLowerCase()]) {
                            buffer = tmp;
                        }
                        if (".." == buffer) {
                            this._path.pop();
                            if ("/" != c && "\\" != c) {
                                this._path.push("");
                            }
                        } else if ("." == buffer && "/" != c && "\\" != c) {
                            this._path.push("");
                        } else if ("." != buffer) {
                            if ("file" == this._scheme && this._path.length == 0 && buffer.length == 2 && ALPHA.test(buffer[0]) && buffer[1] == "|") {
                                buffer = buffer[0] + ":";
                            }
                            this._path.push(buffer);
                        }
                        buffer = "";
                        if ("?" == c) {
                            this._query = "?";
                            state = "query";
                        } else if ("#" == c) {
                            this._fragment = "#";
                            state = "fragment";
                        }
                    } else if ("	" != c && "\n" != c && "\r" != c) {
                        buffer += percentEscape(c);
                    }
                    break;

                case "query":
                    if (!stateOverride && "#" == c) {
                        this._fragment = "#";
                        state = "fragment";
                    } else if (EOF != c && "	" != c && "\n" != c && "\r" != c) {
                        this._query += percentEscapeQuery(c);
                    }
                    break;

                case "fragment":
                    if (EOF != c && "	" != c && "\n" != c && "\r" != c) {
                        this._fragment += c;
                    }
                    break;
            }
            cursor++;
        }
    }
    function clear() {
        this._scheme = "";
        this._schemeData = "";
        this._username = "";
        this._password = null;
        this._host = "";
        this._port = "";
        this._path = [];
        this._query = "";
        this._fragment = "";
        this._isInvalid = false;
        this._isRelative = false;
    }
    function jURL(url, base) {
        if (base !== undefined && !(base instanceof jURL)) base = new jURL(String(base));
        this._url = url;
        clear.call(this);
        var input = url.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g, "");
        parse.call(this, input, null, base);
    }
    jURL.prototype = {
        toString: function () {
            return this.href;
        },
        get href() {
            if (this._isInvalid) return this._url;
            var authority = "";
            if ("" != this._username || null != this._password) {
                authority = this._username + (null != this._password ? ":" + this._password : "") + "@";
            }
            return this.protocol + (this._isRelative ? "//" + authority + this.host : "") + this.pathname + this._query + this._fragment;
        },
        set href(href) {
            clear.call(this);
            parse.call(this, href);
        },
        get protocol() {
            return this._scheme + ":";
        },
        set protocol(protocol) {
            if (this._isInvalid) return;
            parse.call(this, protocol + ":", "scheme start");
        },
        get host() {
            return this._isInvalid ? "" : this._port ? this._host + ":" + this._port : this._host;
        },
        set host(host) {
            if (this._isInvalid || !this._isRelative) return;
            parse.call(this, host, "host");
        },
        get hostname() {
            return this._host;
        },
        set hostname(hostname) {
            if (this._isInvalid || !this._isRelative) return;
            parse.call(this, hostname, "hostname");
        },
        get port() {
            return this._port;
        },
        set port(port) {
            if (this._isInvalid || !this._isRelative) return;
            parse.call(this, port, "port");
        },
        get pathname() {
            return this._isInvalid ? "" : this._isRelative ? "/" + this._path.join("/") : this._schemeData;
        },
        set pathname(pathname) {
            if (this._isInvalid || !this._isRelative) return;
            this._path = [];
            parse.call(this, pathname, "relative path start");
        },
        get search() {
            return this._isInvalid || !this._query || "?" == this._query ? "" : this._query;
        },
        set search(search) {
            if (this._isInvalid || !this._isRelative) return;
            this._query = "?";
            if ("?" == search[0]) search = search.slice(1);
            parse.call(this, search, "query");
        },
        get hash() {
            return this._isInvalid || !this._fragment || "#" == this._fragment ? "" : this._fragment;
        },
        set hash(hash) {
            if (this._isInvalid) return;
            this._fragment = "#";
            if ("#" == hash[0]) hash = hash.slice(1);
            parse.call(this, hash, "fragment");
        },
        get origin() {
            var host;
            if (this._isInvalid || !this._scheme) {
                return "";
            }
            switch (this._scheme) {
                case "data":
                case "file":
                case "javascript":
                case "mailto":
                    return "null";
            }
            host = this.host;
            if (!host) {
                return "";
            }
            return this._scheme + "://" + host;
        }
    };
    var OriginalURL = scope.URL;
    if (OriginalURL) {
        jURL.createObjectURL = function (blob) {
            return OriginalURL.createObjectURL.apply(OriginalURL, arguments);
        };
        jURL.revokeObjectURL = function (url) {
            OriginalURL.revokeObjectURL(url);
        };
    }
    scope.URL = jURL;
})(self);

(function (global) {
    if (global.JsMutationObserver) {
        return;
    }
    var registrationsTable = new WeakMap();
    var setImmediate;
    if (/Trident|Edge/.test(navigator.userAgent)) {
        setImmediate = setTimeout;
    } else if (window.setImmediate) {
        setImmediate = window.setImmediate;
    } else {
        var setImmediateQueue = [];
        var sentinel = String(Math.random());
        window.addEventListener("message", function (e) {
            if (e.data === sentinel) {
                var queue = setImmediateQueue;
                setImmediateQueue = [];
                queue.forEach(function (func) {
                    func();
                });
            }
        });
        setImmediate = function (func) {
            setImmediateQueue.push(func);
            window.postMessage(sentinel, "*");
        };
    }
    var isScheduled = false;
    var scheduledObservers = [];
    function scheduleCallback(observer) {
        scheduledObservers.push(observer);
        if (!isScheduled) {
            isScheduled = true;
            setImmediate(dispatchCallbacks);
        }
    }
    function wrapIfNeeded(node) {
        return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(node) || node;
    }
    function dispatchCallbacks() {
        isScheduled = false;
        var observers = scheduledObservers;
        scheduledObservers = [];
        observers.sort(function (o1, o2) {
            return o1.uid_ - o2.uid_;
        });
        var anyNonEmpty = false;
        observers.forEach(function (observer) {
            var queue = observer.takeRecords();
            removeTransientObserversFor(observer);
            if (queue.length) {
                observer.callback_(queue, observer);
                anyNonEmpty = true;
            }
        });
        if (anyNonEmpty) dispatchCallbacks();
    }
    function removeTransientObserversFor(observer) {
        observer.nodes_.forEach(function (node) {
            var registrations = registrationsTable.get(node);
            if (!registrations) return;
            registrations.forEach(function (registration) {
                if (registration.observer === observer) registration.removeTransientObservers();
            });
        });
    }
    function forEachAncestorAndObserverEnqueueRecord(target, callback) {
        for (var node = target; node; node = node.parentNode) {
            var registrations = registrationsTable.get(node);
            if (registrations) {
                for (var j = 0; j < registrations.length; j++) {
                    var registration = registrations[j];
                    var options = registration.options;
                    if (node !== target && !options.subtree) continue;
                    var record = callback(options);
                    if (record) registration.enqueue(record);
                }
            }
        }
    }
    var uidCounter = 0;
    function JsMutationObserver(callback) {
        this.callback_ = callback;
        this.nodes_ = [];
        this.records_ = [];
        this.uid_ = ++uidCounter;
    }
    JsMutationObserver.prototype = {
        observe: function (target, options) {
            target = wrapIfNeeded(target);
            if (!options.childList && !options.attributes && !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
                throw new SyntaxError();
            }
            var registrations = registrationsTable.get(target);
            if (!registrations) registrationsTable.set(target, registrations = []);
            var registration;
            for (var i = 0; i < registrations.length; i++) {
                if (registrations[i].observer === this) {
                    registration = registrations[i];
                    registration.removeListeners();
                    registration.options = options;
                    break;
                }
            }
            if (!registration) {
                registration = new Registration(this, target, options);
                registrations.push(registration);
                this.nodes_.push(target);
            }
            registration.addListeners();
        },
        disconnect: function () {
            this.nodes_.forEach(function (node) {
                var registrations = registrationsTable.get(node);
                for (var i = 0; i < registrations.length; i++) {
                    var registration = registrations[i];
                    if (registration.observer === this) {
                        registration.removeListeners();
                        registrations.splice(i, 1);
                        break;
                    }
                }
            }, this);
            this.records_ = [];
        },
        takeRecords: function () {
            var copyOfRecords = this.records_;
            this.records_ = [];
            return copyOfRecords;
        }
    };
    function MutationRecord(type, target) {
        this.type = type;
        this.target = target;
        this.addedNodes = [];
        this.removedNodes = [];
        this.previousSibling = null;
        this.nextSibling = null;
        this.attributeName = null;
        this.attributeNamespace = null;
        this.oldValue = null;
    }
    function copyMutationRecord(original) {
        var record = new MutationRecord(original.type, original.target);
        record.addedNodes = original.addedNodes.slice();
        record.removedNodes = original.removedNodes.slice();
        record.previousSibling = original.previousSibling;
        record.nextSibling = original.nextSibling;
        record.attributeName = original.attributeName;
        record.attributeNamespace = original.attributeNamespace;
        record.oldValue = original.oldValue;
        return record;
    }
    var currentRecord, recordWithOldValue;
    function getRecord(type, target) {
        return currentRecord = new MutationRecord(type, target);
    }
    function getRecordWithOldValue(oldValue) {
        if (recordWithOldValue) return recordWithOldValue;
        recordWithOldValue = copyMutationRecord(currentRecord);
        recordWithOldValue.oldValue = oldValue;
        return recordWithOldValue;
    }
    function clearRecords() {
        currentRecord = recordWithOldValue = undefined;
    }
    function recordRepresentsCurrentMutation(record) {
        return record === recordWithOldValue || record === currentRecord;
    }
    function selectRecord(lastRecord, newRecord) {
        if (lastRecord === newRecord) return lastRecord;
        if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord)) return recordWithOldValue;
        return null;
    }
    function Registration(observer, target, options) {
        this.observer = observer;
        this.target = target;
        this.options = options;
        this.transientObservedNodes = [];
    }
    Registration.prototype = {
        enqueue: function (record) {
            var records = this.observer.records_;
            var length = records.length;
            if (records.length > 0) {
                var lastRecord = records[length - 1];
                var recordToReplaceLast = selectRecord(lastRecord, record);
                if (recordToReplaceLast) {
                    records[length - 1] = recordToReplaceLast;
                    return;
                }
            } else {
                scheduleCallback(this.observer);
            }
            records[length] = record;
        },
        addListeners: function () {
            this.addListeners_(this.target);
        },
        addListeners_: function (node) {
            var options = this.options;
            if (options.attributes) node.addEventListener("DOMAttrModified", this, true);
            if (options.characterData) node.addEventListener("DOMCharacterDataModified", this, true);
            if (options.childList) node.addEventListener("DOMNodeInserted", this, true);
            if (options.childList || options.subtree) node.addEventListener("DOMNodeRemoved", this, true);
        },
        removeListeners: function () {
            this.removeListeners_(this.target);
        },
        removeListeners_: function (node) {
            var options = this.options;
            if (options.attributes) node.removeEventListener("DOMAttrModified", this, true);
            if (options.characterData) node.removeEventListener("DOMCharacterDataModified", this, true);
            if (options.childList) node.removeEventListener("DOMNodeInserted", this, true);
            if (options.childList || options.subtree) node.removeEventListener("DOMNodeRemoved", this, true);
        },
        addTransientObserver: function (node) {
            if (node === this.target) return;
            this.addListeners_(node);
            this.transientObservedNodes.push(node);
            var registrations = registrationsTable.get(node);
            if (!registrations) registrationsTable.set(node, registrations = []);
            registrations.push(this);
        },
        removeTransientObservers: function () {
            var transientObservedNodes = this.transientObservedNodes;
            this.transientObservedNodes = [];
            transientObservedNodes.forEach(function (node) {
                this.removeListeners_(node);
                var registrations = registrationsTable.get(node);
                for (var i = 0; i < registrations.length; i++) {
                    if (registrations[i] === this) {
                        registrations.splice(i, 1);
                        break;
                    }
                }
            }, this);
        },
        handleEvent: function (e) {
            e.stopImmediatePropagation();
            switch (e.type) {
                case "DOMAttrModified":
                    var name = e.attrName;
                    var namespace = e.relatedNode.namespaceURI;
                    var target = e.target;
                    var record = new getRecord("attributes", target);
                    record.attributeName = name;
                    record.attributeNamespace = namespace;
                    var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
                    forEachAncestorAndObserverEnqueueRecord(target, function (options) {
                        if (!options.attributes) return;
                        if (options.attributeFilter && options.attributeFilter.length && options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
                            return;
                        }
                        if (options.attributeOldValue) return getRecordWithOldValue(oldValue);
                        return record;
                    });
                    break;

                case "DOMCharacterDataModified":
                    var target = e.target;
                    var record = getRecord("characterData", target);
                    var oldValue = e.prevValue;
                    forEachAncestorAndObserverEnqueueRecord(target, function (options) {
                        if (!options.characterData) return;
                        if (options.characterDataOldValue) return getRecordWithOldValue(oldValue);
                        return record;
                    });
                    break;

                case "DOMNodeRemoved":
                    this.addTransientObserver(e.target);

                case "DOMNodeInserted":
                    var changedNode = e.target;
                    var addedNodes, removedNodes;
                    if (e.type === "DOMNodeInserted") {
                        addedNodes = [changedNode];
                        removedNodes = [];
                    } else {
                        addedNodes = [];
                        removedNodes = [changedNode];
                    }
                    var previousSibling = changedNode.previousSibling;
                    var nextSibling = changedNode.nextSibling;
                    var record = getRecord("childList", e.target.parentNode);
                    record.addedNodes = addedNodes;
                    record.removedNodes = removedNodes;
                    record.previousSibling = previousSibling;
                    record.nextSibling = nextSibling;
                    forEachAncestorAndObserverEnqueueRecord(e.relatedNode, function (options) {
                        if (!options.childList) return;
                        return record;
                    });
            }
            clearRecords();
        }
    };
    global.JsMutationObserver = JsMutationObserver;
    if (!global.MutationObserver) {
        global.MutationObserver = JsMutationObserver;
        JsMutationObserver._isPolyfilled = true;
    }
})(self);

(function (scope) {
    "use strict";
    if (!window.performance) {
        var start = Date.now();
        window.performance = {
            now: function () {
                return Date.now() - start;
            }
        };
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function () {
            var nativeRaf = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
            return nativeRaf ? function (callback) {
                return nativeRaf(function () {
                    callback(performance.now());
                });
            } : function (callback) {
                return window.setTimeout(callback, 1e3 / 60);
            };
        }();
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function () {
            return window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || function (id) {
                clearTimeout(id);
            };
        }();
    }
    var workingDefaultPrevented = function () {
        var e = document.createEvent("Event");
        e.initEvent("foo", true, true);
        e.preventDefault();
        return e.defaultPrevented;
    }();
    if (!workingDefaultPrevented) {
        var origPreventDefault = Event.prototype.preventDefault;
        Event.prototype.preventDefault = function () {
            if (!this.cancelable) {
                return;
            }
            origPreventDefault.call(this);
            Object.defineProperty(this, "defaultPrevented", {
                get: function () {
                    return true;
                },
                configurable: true
            });
        };
    }
    var isIE = /Trident/.test(navigator.userAgent);
    if (!window.CustomEvent || isIE && typeof window.CustomEvent !== "function") {
        window.CustomEvent = function (inType, params) {
            params = params || {};
            var e = document.createEvent("CustomEvent");
            e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
            return e;
        };
        window.CustomEvent.prototype = window.Event.prototype;
    }
    if (!window.Event || isIE && typeof window.Event !== "function") {
        var origEvent = window.Event;
        window.Event = function (inType, params) {
            params = params || {};
            var e = document.createEvent("Event");
            e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable));
            return e;
        };
        window.Event.prototype = origEvent.prototype;
    }
})(window.WebComponents);

window.HTMLImports = window.HTMLImports || {
    flags: {}
};

(function (scope) {
    var IMPORT_LINK_TYPE = "import";
    var useNative = Boolean(IMPORT_LINK_TYPE in document.createElement("link"));
    var hasShadowDOMPolyfill = Boolean(window.ShadowDOMPolyfill);
    var wrap = function (node) {
        return hasShadowDOMPolyfill ? window.ShadowDOMPolyfill.wrapIfNeeded(node) : node;
    };
    var rootDocument = wrap(document);
    var currentScriptDescriptor = {
        get: function () {
            var script = window.HTMLImports.currentScript || document.currentScript || (document.readyState !== "complete" ? document.scripts[document.scripts.length - 1] : null);
            return wrap(script);
        },
        configurable: true
    };
    Object.defineProperty(document, "_currentScript", currentScriptDescriptor);
    Object.defineProperty(rootDocument, "_currentScript", currentScriptDescriptor);
    var isIE = /Trident/.test(navigator.userAgent);
    function whenReady(callback, doc) {
        doc = doc || rootDocument;
        whenDocumentReady(function () {
            watchImportsLoad(callback, doc);
        }, doc);
    }
    var requiredReadyState = isIE ? "complete" : "interactive";
    var READY_EVENT = "readystatechange";
    function isDocumentReady(doc) {
        return doc.readyState === "complete" || doc.readyState === requiredReadyState;
    }
    function whenDocumentReady(callback, doc) {
        if (!isDocumentReady(doc)) {
            var checkReady = function () {
                if (doc.readyState === "complete" || doc.readyState === requiredReadyState) {
                    doc.removeEventListener(READY_EVENT, checkReady);
                    whenDocumentReady(callback, doc);
                }
            };
            doc.addEventListener(READY_EVENT, checkReady);
        } else if (callback) {
            callback();
        }
    }
    function markTargetLoaded(event) {
        event.target.__loaded = true;
    }
    function watchImportsLoad(callback, doc) {
        var imports = doc.querySelectorAll("link[rel=import]");
        var parsedCount = 0, importCount = imports.length, newImports = [], errorImports = [];
        function checkDone() {
            if (parsedCount == importCount && callback) {
                callback({
                    allImports: imports,
                    loadedImports: newImports,
                    errorImports: errorImports
                });
            }
        }
        function loadedImport(e) {
            markTargetLoaded(e);
            newImports.push(this);
            parsedCount++;
            checkDone();
        }
        function errorLoadingImport(e) {
            errorImports.push(this);
            parsedCount++;
            checkDone();
        }
        if (importCount) {
            for (var i = 0, imp; i < importCount && (imp = imports[i]); i++) {
                if (isImportLoaded(imp)) {
                    newImports.push(this);
                    parsedCount++;
                    checkDone();
                } else {
                    imp.addEventListener("load", loadedImport);
                    imp.addEventListener("error", errorLoadingImport);
                }
            }
        } else {
            checkDone();
        }
    }
    function isImportLoaded(link) {
        return useNative ? link.__loaded || link.import && link.import.readyState !== "loading" : link.__importParsed;
    }
    if (useNative) {
        new MutationObserver(function (mxns) {
            for (var i = 0, l = mxns.length, m; i < l && (m = mxns[i]); i++) {
                if (m.addedNodes) {
                    handleImports(m.addedNodes);
                }
            }
        }).observe(document.head, {
            childList: true
        });
        function handleImports(nodes) {
            for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
                if (isImport(n)) {
                    handleImport(n);
                }
            }
        }
        function isImport(element) {
            return element.localName === "link" && element.rel === "import";
        }
        function handleImport(element) {
            var loaded = element.import;
            if (loaded) {
                markTargetLoaded({
                    target: element
                });
            } else {
                element.addEventListener("load", markTargetLoaded);
                element.addEventListener("error", markTargetLoaded);
            }
        }
        (function () {
            if (document.readyState === "loading") {
                var imports = document.querySelectorAll("link[rel=import]");
                for (var i = 0, l = imports.length, imp; i < l && (imp = imports[i]); i++) {
                    handleImport(imp);
                }
            }
        })();
    }
    whenReady(function (detail) {
        window.HTMLImports.ready = true;
        window.HTMLImports.readyTime = new Date().getTime();
        var evt = rootDocument.createEvent("CustomEvent");
        evt.initCustomEvent("HTMLImportsLoaded", true, true, detail);
        rootDocument.dispatchEvent(evt);
    });
    scope.IMPORT_LINK_TYPE = IMPORT_LINK_TYPE;
    scope.useNative = useNative;
    scope.rootDocument = rootDocument;
    scope.whenReady = whenReady;
    scope.isIE = isIE;
})(window.HTMLImports);

(function (scope) {
    var modules = [];
    var addModule = function (module) {
        modules.push(module);
    };
    var initializeModules = function () {
        modules.forEach(function (module) {
            module(scope);
        });
    };
    scope.addModule = addModule;
    scope.initializeModules = initializeModules;
})(window.HTMLImports);

window.HTMLImports.addModule(function (scope) {
    var CSS_URL_REGEXP = /(url\()([^)]*)(\))/g;
    var CSS_IMPORT_REGEXP = /(@import[\s]+(?!url\())([^;]*)(;)/g;
    var path = {
        resolveUrlsInStyle: function (style, linkUrl) {
            var doc = style.ownerDocument;
            var resolver = doc.createElement("a");
            style.textContent = this.resolveUrlsInCssText(style.textContent, linkUrl, resolver);
            return style;
        },
        resolveUrlsInCssText: function (cssText, linkUrl, urlObj) {
            var r = this.replaceUrls(cssText, urlObj, linkUrl, CSS_URL_REGEXP);
            r = this.replaceUrls(r, urlObj, linkUrl, CSS_IMPORT_REGEXP);
            return r;
        },
        replaceUrls: function (text, urlObj, linkUrl, regexp) {
            return text.replace(regexp, function (m, pre, url, post) {
                var urlPath = url.replace(/["']/g, "");
                if (linkUrl) {
                    urlPath = new URL(urlPath, linkUrl).href;
                }
                urlObj.href = urlPath;
                urlPath = urlObj.href;
                return pre + "'" + urlPath + "'" + post;
            });
        }
    };
    scope.path = path;
});

window.HTMLImports.addModule(function (scope) {
    var xhr = {
        async: true,
        ok: function (request) {
            return request.status >= 200 && request.status < 300 || request.status === 304 || request.status === 0;
        },
        load: function (url, next, nextContext) {
            var request = new XMLHttpRequest();
            if (scope.flags.debug || scope.flags.bust) {
                url += "?" + Math.random();
            }
            request.open("GET", url, xhr.async);
            request.addEventListener("readystatechange", function (e) {
                if (request.readyState === 4) {
                    var redirectedUrl = null;
                    try {
                        var locationHeader = request.getResponseHeader("Location");
                        if (locationHeader) {
                            redirectedUrl = locationHeader.substr(0, 1) === "/" ? location.origin + locationHeader : locationHeader;
                        }
                    } catch (e) {
                        console.error(e.message);
                    }
                    next.call(nextContext, !xhr.ok(request) && request, request.response || request.responseText, redirectedUrl);
                }
            });
            request.send();
            return request;
        },
        loadDocument: function (url, next, nextContext) {
            this.load(url, next, nextContext).responseType = "document";
        }
    };
    scope.xhr = xhr;
});

window.HTMLImports.addModule(function (scope) {
    var xhr = scope.xhr;
    var flags = scope.flags;
    var Loader = function (onLoad, onComplete) {
        this.cache = {};
        this.onload = onLoad;
        this.oncomplete = onComplete;
        this.inflight = 0;
        this.pending = {};
    };
    Loader.prototype = {
        addNodes: function (nodes) {
            this.inflight += nodes.length;
            for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
                this.require(n);
            }
            this.checkDone();
        },
        addNode: function (node) {
            this.inflight++;
            this.require(node);
            this.checkDone();
        },
        require: function (elt) {
            var url = elt.src || elt.href;
            elt.__nodeUrl = url;
            if (!this.dedupe(url, elt)) {
                this.fetch(url, elt);
            }
        },
        dedupe: function (url, elt) {
            if (this.pending[url]) {
                this.pending[url].push(elt);
                return true;
            }
            var resource;
            if (this.cache[url]) {
                this.onload(url, elt, this.cache[url]);
                this.tail();
                return true;
            }
            this.pending[url] = [elt];
            return false;
        },
        fetch: function (url, elt) {
            flags.load && console.log("fetch", url, elt);
            if (!url) {
                setTimeout(function () {
                    this.receive(url, elt, {
                        error: "href must be specified"
                    }, null);
                }.bind(this), 0);
            } else if (url.match(/^data:/)) {
                var pieces = url.split(",");
                var header = pieces[0];
                var body = pieces[1];
                if (header.indexOf(";base64") > -1) {
                    body = atob(body);
                } else {
                    body = decodeURIComponent(body);
                }
                setTimeout(function () {
                    this.receive(url, elt, null, body);
                }.bind(this), 0);
            } else {
                var receiveXhr = function (err, resource, redirectedUrl) {
                    this.receive(url, elt, err, resource, redirectedUrl);
                }.bind(this);
                xhr.load(url, receiveXhr);
            }
        },
        receive: function (url, elt, err, resource, redirectedUrl) {
            this.cache[url] = resource;
            var $p = this.pending[url];
            for (var i = 0, l = $p.length, p; i < l && (p = $p[i]); i++) {
                this.onload(url, p, resource, err, redirectedUrl);
                this.tail();
            }
            this.pending[url] = null;
        },
        tail: function () {
            --this.inflight;
            this.checkDone();
        },
        checkDone: function () {
            if (!this.inflight) {
                this.oncomplete();
            }
        }
    };
    scope.Loader = Loader;
});

window.HTMLImports.addModule(function (scope) {
    var Observer = function (addCallback) {
        this.addCallback = addCallback;
        this.mo = new MutationObserver(this.handler.bind(this));
    };
    Observer.prototype = {
        handler: function (mutations) {
            for (var i = 0, l = mutations.length, m; i < l && (m = mutations[i]); i++) {
                if (m.type === "childList" && m.addedNodes.length) {
                    this.addedNodes(m.addedNodes);
                }
            }
        },
        addedNodes: function (nodes) {
            if (this.addCallback) {
                this.addCallback(nodes);
            }
            for (var i = 0, l = nodes.length, n, loading; i < l && (n = nodes[i]); i++) {
                if (n.children && n.children.length) {
                    this.addedNodes(n.children);
                }
            }
        },
        observe: function (root) {
            this.mo.observe(root, {
                childList: true,
                subtree: true
            });
        }
    };
    scope.Observer = Observer;
});

window.HTMLImports.addModule(function (scope) {
    var path = scope.path;
    var rootDocument = scope.rootDocument;
    var flags = scope.flags;
    var isIE = scope.isIE;
    var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;
    var IMPORT_SELECTOR = "link[rel=" + IMPORT_LINK_TYPE + "]";
    var importParser = {
        documentSelectors: IMPORT_SELECTOR,
        importsSelectors: [IMPORT_SELECTOR, "link[rel=stylesheet]:not([type])", "style:not([type])", "script:not([type])", 'script[type="application/javascript"]', 'script[type="text/javascript"]'].join(","),
        map: {
            link: "parseLink",
            script: "parseScript",
            style: "parseStyle"
        },
        dynamicElements: [],
        parseNext: function () {
            var next = this.nextToParse();
            if (next) {
                this.parse(next);
            }
        },
        parse: function (elt) {
            if (this.isParsed(elt)) {
                flags.parse && console.log("[%s] is already parsed", elt.localName);
                return;
            }
            var fn = this[this.map[elt.localName]];
            if (fn) {
                this.markParsing(elt);
                fn.call(this, elt);
            }
        },
        parseDynamic: function (elt, quiet) {
            this.dynamicElements.push(elt);
            if (!quiet) {
                this.parseNext();
            }
        },
        markParsing: function (elt) {
            flags.parse && console.log("parsing", elt);
            this.parsingElement = elt;
        },
        markParsingComplete: function (elt) {
            elt.__importParsed = true;
            this.markDynamicParsingComplete(elt);
            if (elt.__importElement) {
                elt.__importElement.__importParsed = true;
                this.markDynamicParsingComplete(elt.__importElement);
            }
            this.parsingElement = null;
            flags.parse && console.log("completed", elt);
        },
        markDynamicParsingComplete: function (elt) {
            var i = this.dynamicElements.indexOf(elt);
            if (i >= 0) {
                this.dynamicElements.splice(i, 1);
            }
        },
        parseImport: function (elt) {
            elt.import = elt.__doc;
            if (window.HTMLImports.__importsParsingHook) {
                window.HTMLImports.__importsParsingHook(elt);
            }
            if (elt.import) {
                elt.import.__importParsed = true;
            }
            this.markParsingComplete(elt);
            if (elt.__resource && !elt.__error) {
                elt.dispatchEvent(new CustomEvent("load", {
                    bubbles: false
                }));
            } else {
                elt.dispatchEvent(new CustomEvent("error", {
                    bubbles: false
                }));
            }
            if (elt.__pending) {
                var fn;
                while (elt.__pending.length) {
                    fn = elt.__pending.shift();
                    if (fn) {
                        fn({
                            target: elt
                        });
                    }
                }
            }
            this.parseNext();
        },
        parseLink: function (linkElt) {
            if (nodeIsImport(linkElt)) {
                this.parseImport(linkElt);
            } else {
                linkElt.href = linkElt.href;
                this.parseGeneric(linkElt);
            }
        },
        parseStyle: function (elt) {
            var src = elt;
            elt = cloneStyle(elt);
            src.__appliedElement = elt;
            elt.__importElement = src;
            this.parseGeneric(elt);
        },
        parseGeneric: function (elt) {
            this.trackElement(elt);
            this.addElementToDocument(elt);
        },
        rootImportForElement: function (elt) {
            var n = elt;
            while (n.ownerDocument.__importLink) {
                n = n.ownerDocument.__importLink;
            }
            return n;
        },
        addElementToDocument: function (elt) {
            var port = this.rootImportForElement(elt.__importElement || elt);
            port.parentNode.insertBefore(elt, port);
        },
        trackElement: function (elt, callback) {
            var self = this;
            var done = function (e) {
                elt.removeEventListener("load", done);
                elt.removeEventListener("error", done);
                if (callback) {
                    callback(e);
                }
                self.markParsingComplete(elt);
                self.parseNext();
            };
            elt.addEventListener("load", done);
            elt.addEventListener("error", done);
            if (isIE && elt.localName === "style") {
                var fakeLoad = false;
                if (elt.textContent.indexOf("@import") == -1) {
                    fakeLoad = true;
                } else if (elt.sheet) {
                    fakeLoad = true;
                    var csr = elt.sheet.cssRules;
                    var len = csr ? csr.length : 0;
                    for (var i = 0, r; i < len && (r = csr[i]); i++) {
                        if (r.type === CSSRule.IMPORT_RULE) {
                            fakeLoad = fakeLoad && Boolean(r.styleSheet);
                        }
                    }
                }
                if (fakeLoad) {
                    setTimeout(function () {
                        elt.dispatchEvent(new CustomEvent("load", {
                            bubbles: false
                        }));
                    });
                }
            }
        },
        parseScript: function (scriptElt) {
            var script = document.createElement("script");
            script.__importElement = scriptElt;
            script.src = scriptElt.src ? scriptElt.src : generateScriptDataUrl(scriptElt);
            scope.currentScript = scriptElt;
            this.trackElement(script, function (e) {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                scope.currentScript = null;
            });
            this.addElementToDocument(script);
        },
        nextToParse: function () {
            this._mayParse = [];
            return !this.parsingElement && (this.nextToParseInDoc(rootDocument) || this.nextToParseDynamic());
        },
        nextToParseInDoc: function (doc, link) {
            if (doc && this._mayParse.indexOf(doc) < 0) {
                this._mayParse.push(doc);
                var nodes = doc.querySelectorAll(this.parseSelectorsForNode(doc));
                for (var i = 0, l = nodes.length, p = 0, n; i < l && (n = nodes[i]); i++) {
                    if (!this.isParsed(n)) {
                        if (this.hasResource(n)) {
                            return nodeIsImport(n) ? this.nextToParseInDoc(n.__doc, n) : n;
                        } else {
                            return;
                        }
                    }
                }
            }
            return link;
        },
        nextToParseDynamic: function () {
            return this.dynamicElements[0];
        },
        parseSelectorsForNode: function (node) {
            var doc = node.ownerDocument || node;
            return doc === rootDocument ? this.documentSelectors : this.importsSelectors;
        },
        isParsed: function (node) {
            return node.__importParsed;
        },
        needsDynamicParsing: function (elt) {
            return this.dynamicElements.indexOf(elt) >= 0;
        },
        hasResource: function (node) {
            if (nodeIsImport(node) && node.__doc === undefined) {
                return false;
            }
            return true;
        }
    };
    function nodeIsImport(elt) {
        return elt.localName === "link" && elt.rel === IMPORT_LINK_TYPE;
    }
    function generateScriptDataUrl(script) {
        var scriptContent = generateScriptContent(script);
        return "data:text/javascript;charset=utf-8," + encodeURIComponent(scriptContent);
    }
    function generateScriptContent(script) {
        return script.textContent + generateSourceMapHint(script);
    }
    function generateSourceMapHint(script) {
        var owner = script.ownerDocument;
        owner.__importedScripts = owner.__importedScripts || 0;
        var moniker = script.ownerDocument.baseURI;
        var num = owner.__importedScripts ? "-" + owner.__importedScripts : "";
        owner.__importedScripts++;
        return "\n//# sourceURL=" + moniker + num + ".js\n";
    }
    function cloneStyle(style) {
        var clone = style.ownerDocument.createElement("style");
        clone.textContent = style.textContent;
        path.resolveUrlsInStyle(clone);
        return clone;
    }
    scope.parser = importParser;
    scope.IMPORT_SELECTOR = IMPORT_SELECTOR;
});

window.HTMLImports.addModule(function (scope) {
    var flags = scope.flags;
    var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;
    var IMPORT_SELECTOR = scope.IMPORT_SELECTOR;
    var rootDocument = scope.rootDocument;
    var Loader = scope.Loader;
    var Observer = scope.Observer;
    var parser = scope.parser;
    var importer = {
        documents: {},
        documentPreloadSelectors: IMPORT_SELECTOR,
        importsPreloadSelectors: [IMPORT_SELECTOR].join(","),
        loadNode: function (node) {
            importLoader.addNode(node);
        },
        loadSubtree: function (parent) {
            var nodes = this.marshalNodes(parent);
            importLoader.addNodes(nodes);
        },
        marshalNodes: function (parent) {
            return parent.querySelectorAll(this.loadSelectorsForNode(parent));
        },
        loadSelectorsForNode: function (node) {
            var doc = node.ownerDocument || node;
            return doc === rootDocument ? this.documentPreloadSelectors : this.importsPreloadSelectors;
        },
        loaded: function (url, elt, resource, err, redirectedUrl) {
            flags.load && console.log("loaded", url, elt);
            elt.__resource = resource;
            elt.__error = err;
            if (isImportLink(elt)) {
                var doc = this.documents[url];
                if (doc === undefined) {
                    doc = err ? null : makeDocument(resource, redirectedUrl || url);
                    if (doc) {
                        doc.__importLink = elt;
                        this.bootDocument(doc);
                    }
                    this.documents[url] = doc;
                }
                elt.__doc = doc;
            }
            parser.parseNext();
        },
        bootDocument: function (doc) {
            this.loadSubtree(doc);
            this.observer.observe(doc);
            parser.parseNext();
        },
        loadedAll: function () {
            parser.parseNext();
        }
    };
    var importLoader = new Loader(importer.loaded.bind(importer), importer.loadedAll.bind(importer));
    importer.observer = new Observer();
    function isImportLink(elt) {
        return isLinkRel(elt, IMPORT_LINK_TYPE);
    }
    function isLinkRel(elt, rel) {
        return elt.localName === "link" && elt.getAttribute("rel") === rel;
    }
    function hasBaseURIAccessor(doc) {
        return !!Object.getOwnPropertyDescriptor(doc, "baseURI");
    }
    function makeDocument(resource, url) {
        var doc = document.implementation.createHTMLDocument(IMPORT_LINK_TYPE);
        doc._URL = url;
        var base = doc.createElement("base");
        base.setAttribute("href", url);
        if (!doc.baseURI && !hasBaseURIAccessor(doc)) {
            Object.defineProperty(doc, "baseURI", {
                value: url
            });
        }
        var meta = doc.createElement("meta");
        meta.setAttribute("charset", "utf-8");
        doc.head.appendChild(meta);
        doc.head.appendChild(base);
        doc.body.innerHTML = resource;
        if (window.HTMLTemplateElement && HTMLTemplateElement.bootstrap) {
            HTMLTemplateElement.bootstrap(doc);
        }
        return doc;
    }
    if (!document.baseURI) {
        var baseURIDescriptor = {
            get: function () {
                var base = document.querySelector("base");
                return base ? base.href : window.location.href;
            },
            configurable: true
        };
        Object.defineProperty(document, "baseURI", baseURIDescriptor);
        Object.defineProperty(rootDocument, "baseURI", baseURIDescriptor);
    }
    scope.importer = importer;
    scope.importLoader = importLoader;
});

window.HTMLImports.addModule(function (scope) {
    var parser = scope.parser;
    var importer = scope.importer;
    var dynamic = {
        added: function (nodes) {
            var owner, parsed, loading;
            for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
                if (!owner) {
                    owner = n.ownerDocument;
                    parsed = parser.isParsed(owner);
                }
                loading = this.shouldLoadNode(n);
                if (loading) {
                    importer.loadNode(n);
                }
                if (this.shouldParseNode(n) && parsed) {
                    parser.parseDynamic(n, loading);
                }
            }
        },
        shouldLoadNode: function (node) {
            return node.nodeType === 1 && matches.call(node, importer.loadSelectorsForNode(node));
        },
        shouldParseNode: function (node) {
            return node.nodeType === 1 && matches.call(node, parser.parseSelectorsForNode(node));
        }
    };
    importer.observer.addCallback = dynamic.added.bind(dynamic);
    var matches = HTMLElement.prototype.matches || HTMLElement.prototype.matchesSelector || HTMLElement.prototype.webkitMatchesSelector || HTMLElement.prototype.mozMatchesSelector || HTMLElement.prototype.msMatchesSelector;
});

(function (scope) {
    var initializeModules = scope.initializeModules;
    var isIE = scope.isIE;
    if (scope.useNative) {
        return;
    }
    initializeModules();
    var rootDocument = scope.rootDocument;
    function bootstrap() {
        window.HTMLImports.importer.bootDocument(rootDocument);
    }
    if (document.readyState === "complete" || document.readyState === "interactive" && !window.attachEvent) {
        bootstrap();
    } else {
        document.addEventListener("DOMContentLoaded", bootstrap);
    }
})(window.HTMLImports);

window.CustomElements = window.CustomElements || {
    flags: {}
};

(function (scope) {
    var flags = scope.flags;
    var modules = [];
    var addModule = function (module) {
        modules.push(module);
    };
    var initializeModules = function () {
        modules.forEach(function (module) {
            module(scope);
        });
    };
    scope.addModule = addModule;
    scope.initializeModules = initializeModules;
    scope.hasNative = Boolean(document.registerElement);
    scope.isIE = /Trident/.test(navigator.userAgent);
    scope.useNative = !flags.register && scope.hasNative && !window.ShadowDOMPolyfill && (!window.HTMLImports || window.HTMLImports.useNative);
})(window.CustomElements);

window.CustomElements.addModule(function (scope) {
    var IMPORT_LINK_TYPE = window.HTMLImports ? window.HTMLImports.IMPORT_LINK_TYPE : "none";
    function forSubtree(node, cb) {
        findAllElements(node, function (e) {
            if (cb(e)) {
                return true;
            }
            forRoots(e, cb);
        });
        forRoots(node, cb);
    }
    function findAllElements(node, find, data) {
        var e = node.firstElementChild;
        if (!e) {
            e = node.firstChild;
            while (e && e.nodeType !== Node.ELEMENT_NODE) {
                e = e.nextSibling;
            }
        }
        while (e) {
            if (find(e, data) !== true) {
                findAllElements(e, find, data);
            }
            e = e.nextElementSibling;
        }
        return null;
    }
    function forRoots(node, cb) {
        var root = node.shadowRoot;
        while (root) {
            forSubtree(root, cb);
            root = root.olderShadowRoot;
        }
    }
    function forDocumentTree(doc, cb) {
        _forDocumentTree(doc, cb, []);
    }
    function _forDocumentTree(doc, cb, processingDocuments) {
        doc = window.wrap(doc);
        if (processingDocuments.indexOf(doc) >= 0) {
            return;
        }
        processingDocuments.push(doc);
        var imports = doc.querySelectorAll("link[rel=" + IMPORT_LINK_TYPE + "]");
        for (var i = 0, l = imports.length, n; i < l && (n = imports[i]); i++) {
            if (n.import) {
                _forDocumentTree(n.import, cb, processingDocuments);
            }
        }
        cb(doc);
    }
    scope.forDocumentTree = forDocumentTree;
    scope.forSubtree = forSubtree;
});

window.CustomElements.addModule(function (scope) {
    var flags = scope.flags;
    var forSubtree = scope.forSubtree;
    var forDocumentTree = scope.forDocumentTree;
    function addedNode(node, isAttached) {
        return added(node, isAttached) || addedSubtree(node, isAttached);
    }
    function added(node, isAttached) {
        if (scope.upgrade(node, isAttached)) {
            return true;
        }
        if (isAttached) {
            attached(node);
        }
    }
    function addedSubtree(node, isAttached) {
        forSubtree(node, function (e) {
            if (added(e, isAttached)) {
                return true;
            }
        });
    }
    var hasThrottledAttached = window.MutationObserver._isPolyfilled && flags["throttle-attached"];
    scope.hasPolyfillMutations = hasThrottledAttached;
    scope.hasThrottledAttached = hasThrottledAttached;
    var isPendingMutations = false;
    var pendingMutations = [];
    function deferMutation(fn) {
        pendingMutations.push(fn);
        if (!isPendingMutations) {
            isPendingMutations = true;
            setTimeout(takeMutations);
        }
    }
    function takeMutations() {
        isPendingMutations = false;
        var $p = pendingMutations;
        for (var i = 0, l = $p.length, p; i < l && (p = $p[i]); i++) {
            p();
        }
        pendingMutations = [];
    }
    function attached(element) {
        if (hasThrottledAttached) {
            deferMutation(function () {
                _attached(element);
            });
        } else {
            _attached(element);
        }
    }
    function _attached(element) {
        if (element.__upgraded__ && !element.__attached) {
            element.__attached = true;
            if (element.attachedCallback) {
                element.attachedCallback();
            }
        }
    }
    function detachedNode(node) {
        detached(node);
        forSubtree(node, function (e) {
            detached(e);
        });
    }
    function detached(element) {
        if (hasThrottledAttached) {
            deferMutation(function () {
                _detached(element);
            });
        } else {
            _detached(element);
        }
    }
    function _detached(element) {
        if (element.__upgraded__ && element.__attached) {
            element.__attached = false;
            if (element.detachedCallback) {
                element.detachedCallback();
            }
        }
    }
    function inDocument(element) {
        var p = element;
        var doc = window.wrap(document);
        while (p) {
            if (p == doc) {
                return true;
            }
            p = p.parentNode || p.nodeType === Node.DOCUMENT_FRAGMENT_NODE && p.host;
        }
    }
    function watchShadow(node) {
        if (node.shadowRoot && !node.shadowRoot.__watched) {
            flags.dom && console.log("watching shadow-root for: ", node.localName);
            var root = node.shadowRoot;
            while (root) {
                observe(root);
                root = root.olderShadowRoot;
            }
        }
    }
    function handler(root, mutations) {
        if (flags.dom) {
            var mx = mutations[0];
            if (mx && mx.type === "childList" && mx.addedNodes) {
                if (mx.addedNodes) {
                    var d = mx.addedNodes[0];
                    while (d && d !== document && !d.host) {
                        d = d.parentNode;
                    }
                    var u = d && (d.URL || d._URL || d.host && d.host.localName) || "";
                    u = u.split("/?").shift().split("/").pop();
                }
            }
            console.group("mutations (%d) [%s]", mutations.length, u || "");
        }
        var isAttached = inDocument(root);
        mutations.forEach(function (mx) {
            if (mx.type === "childList") {
                forEach(mx.addedNodes, function (n) {
                    if (!n.localName) {
                        return;
                    }
                    addedNode(n, isAttached);
                });
                forEach(mx.removedNodes, function (n) {
                    if (!n.localName) {
                        return;
                    }
                    detachedNode(n);
                });
            }
        });
        flags.dom && console.groupEnd();
    }
    function takeRecords(node) {
        node = window.wrap(node);
        if (!node) {
            node = window.wrap(document);
        }
        while (node.parentNode) {
            node = node.parentNode;
        }
        var observer = node.__observer;
        if (observer) {
            handler(node, observer.takeRecords());
            takeMutations();
        }
    }
    var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
    function observe(inRoot) {
        if (inRoot.__observer) {
            return;
        }
        var observer = new MutationObserver(handler.bind(this, inRoot));
        observer.observe(inRoot, {
            childList: true,
            subtree: true
        });
        inRoot.__observer = observer;
    }
    function upgradeDocument(doc) {
        doc = window.wrap(doc);
        flags.dom && console.group("upgradeDocument: ", doc.baseURI.split("/").pop());
        var isMainDocument = doc === window.wrap(document);
        addedNode(doc, isMainDocument);
        observe(doc);
        flags.dom && console.groupEnd();
    }
    function upgradeDocumentTree(doc) {
        forDocumentTree(doc, upgradeDocument);
    }
    var originalCreateShadowRoot = Element.prototype.createShadowRoot;
    if (originalCreateShadowRoot) {
        Element.prototype.createShadowRoot = function () {
            var root = originalCreateShadowRoot.call(this);
            window.CustomElements.watchShadow(this);
            return root;
        };
    }
    scope.watchShadow = watchShadow;
    scope.upgradeDocumentTree = upgradeDocumentTree;
    scope.upgradeDocument = upgradeDocument;
    scope.upgradeSubtree = addedSubtree;
    scope.upgradeAll = addedNode;
    scope.attached = attached;
    scope.takeRecords = takeRecords;
});

window.CustomElements.addModule(function (scope) {
    var flags = scope.flags;
    function upgrade(node, isAttached) {
        if (node.localName === "template") {
            if (window.HTMLTemplateElement && HTMLTemplateElement.decorate) {
                HTMLTemplateElement.decorate(node);
            }
        }
        if (!node.__upgraded__ && node.nodeType === Node.ELEMENT_NODE) {
            var is = node.getAttribute("is");
            var definition = scope.getRegisteredDefinition(node.localName) || scope.getRegisteredDefinition(is);
            if (definition) {
                if (is && definition.tag == node.localName || !is && !definition.extends) {
                    return upgradeWithDefinition(node, definition, isAttached);
                }
            }
        }
    }
    function upgradeWithDefinition(element, definition, isAttached) {
        flags.upgrade && console.group("upgrade:", element.localName);
        if (definition.is) {
            element.setAttribute("is", definition.is);
        }
        implementPrototype(element, definition);
        element.__upgraded__ = true;
        created(element);
        if (isAttached) {
            scope.attached(element);
        }
        scope.upgradeSubtree(element, isAttached);
        flags.upgrade && console.groupEnd();
        return element;
    }
    function implementPrototype(element, definition) {
        if (Object.__proto__) {
            element.__proto__ = definition.prototype;
        } else {
            customMixin(element, definition.prototype, definition.native);
            element.__proto__ = definition.prototype;
        }
    }
    function customMixin(inTarget, inSrc, inNative) {
        var used = {};
        var p = inSrc;
        while (p !== inNative && p !== HTMLElement.prototype) {
            var keys = Object.getOwnPropertyNames(p);
            for (var i = 0, k; k = keys[i]; i++) {
                if (!used[k]) {
                    Object.defineProperty(inTarget, k, Object.getOwnPropertyDescriptor(p, k));
                    used[k] = 1;
                }
            }
            p = Object.getPrototypeOf(p);
        }
    }
    function created(element) {
        if (element.createdCallback) {
            element.createdCallback();
        }
    }
    scope.upgrade = upgrade;
    scope.upgradeWithDefinition = upgradeWithDefinition;
    scope.implementPrototype = implementPrototype;
});

window.CustomElements.addModule(function (scope) {
    var isIE = scope.isIE;
    var upgradeDocumentTree = scope.upgradeDocumentTree;
    var upgradeAll = scope.upgradeAll;
    var upgradeWithDefinition = scope.upgradeWithDefinition;
    var implementPrototype = scope.implementPrototype;
    var useNative = scope.useNative;
    function register(name, options) {
        var definition = options || {};
        if (!name) {
            throw new Error("document.registerElement: first argument `name` must not be empty");
        }
        if (name.indexOf("-") < 0) {
            throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '" + String(name) + "'.");
        }
        if (isReservedTag(name)) {
            throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '" + String(name) + "'. The type name is invalid.");
        }
        if (getRegisteredDefinition(name)) {
            throw new Error("DuplicateDefinitionError: a type with name '" + String(name) + "' is already registered");
        }
        if (!definition.prototype) {
            definition.prototype = Object.create(HTMLElement.prototype);
        }
        definition.__name = name.toLowerCase();
        definition.lifecycle = definition.lifecycle || {};
        definition.ancestry = ancestry(definition.extends);
        resolveTagName(definition);
        resolvePrototypeChain(definition);
        overrideAttributeApi(definition.prototype);
        registerDefinition(definition.__name, definition);
        definition.ctor = generateConstructor(definition);
        definition.ctor.prototype = definition.prototype;
        definition.prototype.constructor = definition.ctor;
        if (scope.ready) {
            upgradeDocumentTree(document);
        }
        return definition.ctor;
    }
    function overrideAttributeApi(prototype) {
        if (prototype.setAttribute._polyfilled) {
            return;
        }
        var setAttribute = prototype.setAttribute;
        prototype.setAttribute = function (name, value) {
            changeAttribute.call(this, name, value, setAttribute);
        };
        var removeAttribute = prototype.removeAttribute;
        prototype.removeAttribute = function (name) {
            changeAttribute.call(this, name, null, removeAttribute);
        };
        prototype.setAttribute._polyfilled = true;
    }
    function changeAttribute(name, value, operation) {
        name = name.toLowerCase();
        var oldValue = this.getAttribute(name);
        operation.apply(this, arguments);
        var newValue = this.getAttribute(name);
        if (this.attributeChangedCallback && newValue !== oldValue) {
            this.attributeChangedCallback(name, oldValue, newValue);
        }
    }
    function isReservedTag(name) {
        for (var i = 0; i < reservedTagList.length; i++) {
            if (name === reservedTagList[i]) {
                return true;
            }
        }
    }
    var reservedTagList = ["annotation-xml", "color-profile", "font-face", "font-face-src", "font-face-uri", "font-face-format", "font-face-name", "missing-glyph"];
    function ancestry(extnds) {
        var extendee = getRegisteredDefinition(extnds);
        if (extendee) {
            return ancestry(extendee.extends).concat([extendee]);
        }
        return [];
    }
    function resolveTagName(definition) {
        var baseTag = definition.extends;
        for (var i = 0, a; a = definition.ancestry[i]; i++) {
            baseTag = a.is && a.tag;
        }
        definition.tag = baseTag || definition.__name;
        if (baseTag) {
            definition.is = definition.__name;
        }
    }
    function resolvePrototypeChain(definition) {
        if (!Object.__proto__) {
            var nativePrototype = HTMLElement.prototype;
            if (definition.is) {
                var inst = document.createElement(definition.tag);
                nativePrototype = Object.getPrototypeOf(inst);
            }
            var proto = definition.prototype, ancestor;
            var foundPrototype = false;
            while (proto) {
                if (proto == nativePrototype) {
                    foundPrototype = true;
                }
                ancestor = Object.getPrototypeOf(proto);
                if (ancestor) {
                    proto.__proto__ = ancestor;
                }
                proto = ancestor;
            }
            if (!foundPrototype) {
                console.warn(definition.tag + " prototype not found in prototype chain for " + definition.is);
            }
            definition.native = nativePrototype;
        }
    }
    function instantiate(definition) {
        return upgradeWithDefinition(domCreateElement(definition.tag), definition);
    }
    var registry = {};
    function getRegisteredDefinition(name) {
        if (name) {
            return registry[name.toLowerCase()];
        }
    }
    function registerDefinition(name, definition) {
        registry[name] = definition;
    }
    function generateConstructor(definition) {
        return function () {
            return instantiate(definition);
        };
    }
    var HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
    function createElementNS(namespace, tag, typeExtension) {
        if (namespace === HTML_NAMESPACE) {
            return createElement(tag, typeExtension);
        } else {
            return domCreateElementNS(namespace, tag);
        }
    }
    function createElement(tag, typeExtension) {
        if (tag) {
            tag = tag.toLowerCase();
        }
        if (typeExtension) {
            typeExtension = typeExtension.toLowerCase();
        }
        var definition = getRegisteredDefinition(typeExtension || tag);
        if (definition) {
            if (tag == definition.tag && typeExtension == definition.is) {
                return new definition.ctor();
            }
            if (!typeExtension && !definition.is) {
                return new definition.ctor();
            }
        }
        var element;
        if (typeExtension) {
            element = createElement(tag);
            element.setAttribute("is", typeExtension);
            return element;
        }
        element = domCreateElement(tag);
        if (tag.indexOf("-") >= 0) {
            implementPrototype(element, HTMLElement);
        }
        return element;
    }
    var domCreateElement = document.createElement.bind(document);
    var domCreateElementNS = document.createElementNS.bind(document);
    var isInstance;
    if (!Object.__proto__ && !useNative) {
        isInstance = function (obj, ctor) {
            if (obj instanceof ctor) {
                return true;
            }
            var p = obj;
            while (p) {
                if (p === ctor.prototype) {
                    return true;
                }
                p = p.__proto__;
            }
            return false;
        };
    } else {
        isInstance = function (obj, base) {
            return obj instanceof base;
        };
    }
    function wrapDomMethodToForceUpgrade(obj, methodName) {
        var orig = obj[methodName];
        obj[methodName] = function () {
            var n = orig.apply(this, arguments);
            upgradeAll(n);
            return n;
        };
    }
    wrapDomMethodToForceUpgrade(Node.prototype, "cloneNode");
    wrapDomMethodToForceUpgrade(document, "importNode");
    if (isIE) {
        (function () {
            var importNode = document.importNode;
            document.importNode = function () {
                var n = importNode.apply(document, arguments);
                if (n.nodeType == n.DOCUMENT_FRAGMENT_NODE) {
                    var f = document.createDocumentFragment();
                    f.appendChild(n);
                    return f;
                } else {
                    return n;
                }
            };
        })();
    }
    document.registerElement = register;
    document.createElement = createElement;
    document.createElementNS = createElementNS;
    scope.registry = registry;
    scope.instanceof = isInstance;
    scope.reservedTagList = reservedTagList;
    scope.getRegisteredDefinition = getRegisteredDefinition;
    document.register = document.registerElement;
});

(function (scope) {
    var useNative = scope.useNative;
    var initializeModules = scope.initializeModules;
    var isIE = scope.isIE;
    if (useNative) {
        var nop = function () { };
        scope.watchShadow = nop;
        scope.upgrade = nop;
        scope.upgradeAll = nop;
        scope.upgradeDocumentTree = nop;
        scope.upgradeSubtree = nop;
        scope.takeRecords = nop;
        scope.instanceof = function (obj, base) {
            return obj instanceof base;
        };
    } else {
        initializeModules();
    }
    var upgradeDocumentTree = scope.upgradeDocumentTree;
    var upgradeDocument = scope.upgradeDocument;
    if (!window.wrap) {
        if (window.ShadowDOMPolyfill) {
            window.wrap = window.ShadowDOMPolyfill.wrapIfNeeded;
            window.unwrap = window.ShadowDOMPolyfill.unwrapIfNeeded;
        } else {
            window.wrap = window.unwrap = function (node) {
                return node;
            };
        }
    }
    if (window.HTMLImports) {
        window.HTMLImports.__importsParsingHook = function (elt) {
            if (elt.import) {
                upgradeDocument(wrap(elt.import));
            }
        };
    }
    function bootstrap() {
        upgradeDocumentTree(window.wrap(document));
        window.CustomElements.ready = true;
        var requestAnimationFrame = window.requestAnimationFrame || function (f) {
            setTimeout(f, 16);
        };
        requestAnimationFrame(function () {
            setTimeout(function () {
                window.CustomElements.readyTime = Date.now();
                if (window.HTMLImports) {
                    window.CustomElements.elapsed = window.CustomElements.readyTime - window.HTMLImports.readyTime;
                }
                document.dispatchEvent(new CustomEvent("WebComponentsReady", {
                    bubbles: true
                }));
            });
        });
    }
    if (document.readyState === "complete" || scope.flags.eager) {
        bootstrap();
    } else if (document.readyState === "interactive" && !window.attachEvent && (!window.HTMLImports || window.HTMLImports.ready)) {
        bootstrap();
    } else {
        var loadEvent = window.HTMLImports && !window.HTMLImports.ready ? "HTMLImportsLoaded" : "DOMContentLoaded";
        window.addEventListener(loadEvent, bootstrap);
    }
})(window.CustomElements);

(function (scope) {
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (scope) {
            var self = this;
            var args = Array.prototype.slice.call(arguments, 1);
            return function () {
                var args2 = args.slice();
                args2.push.apply(args2, arguments);
                return self.apply(scope, args2);
            };
        };
    }
})(window.WebComponents);

(function (scope) {
    var style = document.createElement("style");
    style.textContent = "" + "body {" + "transition: opacity ease-in 0.2s;" + " } \n" + "body[unresolved] {" + "opacity: 0; display: block; overflow: hidden; position: relative;" + " } \n";
    var head = document.querySelector("head");
    head.insertBefore(style, head.firstChild);
})(window.WebComponents);

(function (scope) {
    window.Platform = scope;
})(window.WebComponents);
/*!
 * PEP v0.4.1 | https://github.com/jquery/PEP
 * Copyright jQuery Foundation and other contributors | http://jquery.org/license
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            global.PointerEventsPolyfill = factory()
}(this, function () {
    'use strict';

    /**
     * This is the constructor for new PointerEvents.
     *
     * New Pointer Events must be given a type, and an optional dictionary of
     * initialization properties.
     *
     * Due to certain platform requirements, events returned from the constructor
     * identify as MouseEvents.
     *
     * @constructor
     * @param {String} inType The type of the event to create.
     * @param {Object} [inDict] An optional dictionary of initial event properties.
     * @return {Event} A new PointerEvent of type `inType`, initialized with properties from `inDict`.
     */
    var MOUSE_PROPS = [
        'bubbles',
        'cancelable',
        'view',
        'detail',
        'screenX',
        'screenY',
        'clientX',
        'clientY',
        'ctrlKey',
        'altKey',
        'shiftKey',
        'metaKey',
        'button',
        'relatedTarget',
        'pageX',
        'pageY'
    ];

    var MOUSE_DEFAULTS = [
        false,
        false,
        null,
        null,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null,
        0,
        0
    ];

    function PointerEvent(inType, inDict) {
        inDict = inDict || Object.create(null);

        var e = document.createEvent('Event');
        e.initEvent(inType, inDict.bubbles || false, inDict.cancelable || false);

        // define inherited MouseEvent properties
        // skip bubbles and cancelable since they're set above in initEvent()
        for (var i = 2, p; i < MOUSE_PROPS.length; i++) {
            p = MOUSE_PROPS[i];
            e[p] = inDict[p] || MOUSE_DEFAULTS[i];
        }
        e.buttons = inDict.buttons || 0;

        // Spec requires that pointers without pressure specified use 0.5 for down
        // state and 0 for up state.
        var pressure = 0;
        if (inDict.pressure) {
            pressure = inDict.pressure;
        } else {
            pressure = e.buttons ? 0.5 : 0;
        }

        // add x/y properties aliased to clientX/Y
        e.x = e.clientX;
        e.y = e.clientY;

        // define the properties of the PointerEvent interface
        e.pointerId = inDict.pointerId || 0;
        e.width = inDict.width || 0;
        e.height = inDict.height || 0;
        e.pressure = pressure;
        e.tiltX = inDict.tiltX || 0;
        e.tiltY = inDict.tiltY || 0;
        e.pointerType = inDict.pointerType || '';
        e.hwTimestamp = inDict.hwTimestamp || 0;
        e.isPrimary = inDict.isPrimary || false;
        return e;
    }

    var _PointerEvent = PointerEvent;

    /**
     * This module implements a map of pointer states
     */
    var USE_MAP = window.Map && window.Map.prototype.forEach;
    var PointerMap = USE_MAP ? Map : SparseArrayMap;

    function SparseArrayMap() {
        this.array = [];
        this.size = 0;
    }

    SparseArrayMap.prototype = {
        set: function (k, v) {
            if (v === undefined) {
                return this.delete(k);
            }
            if (!this.has(k)) {
                this.size++;
            }
            this.array[k] = v;
        },
        has: function (k) {
            return this.array[k] !== undefined;
        },
        delete: function (k) {
            if (this.has(k)) {
                delete this.array[k];
                this.size--;
            }
        },
        get: function (k) {
            return this.array[k];
        },
        clear: function () {
            this.array.length = 0;
            this.size = 0;
        },

        // return value, key, map
        forEach: function (callback, thisArg) {
            return this.array.forEach(function (v, k) {
                callback.call(thisArg, v, k, this);
            }, this);
        }
    };

    var _pointermap = PointerMap;

    var CLONE_PROPS = [

        // MouseEvent
        'bubbles',
        'cancelable',
        'view',
        'detail',
        'screenX',
        'screenY',
        'clientX',
        'clientY',
        'ctrlKey',
        'altKey',
        'shiftKey',
        'metaKey',
        'button',
        'relatedTarget',

        // DOM Level 3
        'buttons',

        // PointerEvent
        'pointerId',
        'width',
        'height',
        'pressure',
        'tiltX',
        'tiltY',
        'pointerType',
        'hwTimestamp',
        'isPrimary',

        // event instance
        'type',
        'target',
        'currentTarget',
        'which',
        'pageX',
        'pageY',
        'timeStamp'
    ];

    var CLONE_DEFAULTS = [

        // MouseEvent
        false,
        false,
        null,
        null,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null,

        // DOM Level 3
        0,

        // PointerEvent
        0,
        0,
        0,
        0,
        0,
        0,
        '',
        0,
        false,

        // event instance
        '',
        null,
        null,
        0,
        0,
        0,
        0
    ];

    var BOUNDARY_EVENTS = {
        'pointerover': 1,
        'pointerout': 1,
        'pointerenter': 1,
        'pointerleave': 1
    };

    var HAS_SVG_INSTANCE = (typeof SVGElementInstance !== 'undefined');

    /**
     * This module is for normalizing events. Mouse and Touch events will be
     * collected here, and fire PointerEvents that have the same semantics, no
     * matter the source.
     * Events fired:
     *   - pointerdown: a pointing is added
     *   - pointerup: a pointer is removed
     *   - pointermove: a pointer is moved
     *   - pointerover: a pointer crosses into an element
     *   - pointerout: a pointer leaves an element
     *   - pointercancel: a pointer will no longer generate events
     */
    var dispatcher = {
        pointermap: new _pointermap(),
        eventMap: Object.create(null),
        captureInfo: Object.create(null),

        // Scope objects for native events.
        // This exists for ease of testing.
        eventSources: Object.create(null),
        eventSourceList: [],
        /**
         * Add a new event source that will generate pointer events.
         *
         * `inSource` must contain an array of event names named `events`, and
         * functions with the names specified in the `events` array.
         * @param {string} name A name for the event source
         * @param {Object} source A new source of platform events.
         */
        registerSource: function (name, source) {
            var s = source;
            var newEvents = s.events;
            if (newEvents) {
                newEvents.forEach(function (e) {
                    if (s[e]) {
                        this.eventMap[e] = s[e].bind(s);
                    }
                }, this);
                this.eventSources[name] = s;
                this.eventSourceList.push(s);
            }
        },
        register: function (element) {
            var l = this.eventSourceList.length;
            for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {

                // call eventsource register
                es.register.call(es, element);
            }
        },
        unregister: function (element) {
            var l = this.eventSourceList.length;
            for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {

                // call eventsource register
                es.unregister.call(es, element);
            }
        },
        contains: /*scope.external.contains || */function (container, contained) {
            try {
                return container.contains(contained);
            } catch (ex) {

                // most likely: https://bugzilla.mozilla.org/show_bug.cgi?id=208427
                return false;
            }
        },

        // EVENTS
        down: function (inEvent) {
            inEvent.bubbles = true;
            this.fireEvent('pointerdown', inEvent);
        },
        move: function (inEvent) {
            inEvent.bubbles = true;
            this.fireEvent('pointermove', inEvent);
        },
        up: function (inEvent) {
            inEvent.bubbles = true;
            this.fireEvent('pointerup', inEvent);
        },
        enter: function (inEvent) {
            inEvent.bubbles = false;
            this.fireEvent('pointerenter', inEvent);
        },
        leave: function (inEvent) {
            inEvent.bubbles = false;
            this.fireEvent('pointerleave', inEvent);
        },
        over: function (inEvent) {
            inEvent.bubbles = true;
            this.fireEvent('pointerover', inEvent);
        },
        out: function (inEvent) {
            inEvent.bubbles = true;
            this.fireEvent('pointerout', inEvent);
        },
        cancel: function (inEvent) {
            inEvent.bubbles = true;
            this.fireEvent('pointercancel', inEvent);
        },
        leaveOut: function (event) {
            this.out(event);
            if (!this.contains(event.target, event.relatedTarget)) {
                this.leave(event);
            }
        },
        enterOver: function (event) {
            this.over(event);
            if (!this.contains(event.target, event.relatedTarget)) {
                this.enter(event);
            }
        },

        // LISTENER LOGIC
        eventHandler: function (inEvent) {

            // This is used to prevent multiple dispatch of pointerevents from
            // platform events. This can happen when two elements in different scopes
            // are set up to create pointer events, which is relevant to Shadow DOM.
            if (inEvent._handledByPE) {
                return;
            }
            var type = inEvent.type;
            var fn = this.eventMap && this.eventMap[type];
            if (fn) {
                fn(inEvent);
            }
            inEvent._handledByPE = true;
        },

        // set up event listeners
        listen: function (target, events) {
            events.forEach(function (e) {
                this.addEvent(target, e);
            }, this);
        },

        // remove event listeners
        unlisten: function (target, events) {
            events.forEach(function (e) {
                this.removeEvent(target, e);
            }, this);
        },
        addEvent: /*scope.external.addEvent || */function (target, eventName) {
            target.addEventListener(eventName, this.boundHandler);
        },
        removeEvent: /*scope.external.removeEvent || */function (target, eventName) {
            target.removeEventListener(eventName, this.boundHandler);
        },

        // EVENT CREATION AND TRACKING
        /**
         * Creates a new Event of type `inType`, based on the information in
         * `inEvent`.
         *
         * @param {string} inType A string representing the type of event to create
         * @param {Event} inEvent A platform event with a target
         * @return {Event} A PointerEvent of type `inType`
         */
        makeEvent: function (inType, inEvent) {

            // relatedTarget must be null if pointer is captured
            if (this.captureInfo[inEvent.pointerId]) {
                inEvent.relatedTarget = null;
            }
            var e = new _PointerEvent(inType, inEvent);
            if (inEvent.preventDefault) {
                e.preventDefault = inEvent.preventDefault;
            }
            e._target = e._target || inEvent.target;
            return e;
        },

        // make and dispatch an event in one call
        fireEvent: function (inType, inEvent) {
            var e = this.makeEvent(inType, inEvent);
            return this.dispatchEvent(e);
        },
        /**
         * Returns a snapshot of inEvent, with writable properties.
         *
         * @param {Event} inEvent An event that contains properties to copy.
         * @return {Object} An object containing shallow copies of `inEvent`'s
         *    properties.
         */
        cloneEvent: function (inEvent) {
            var eventCopy = Object.create(null);
            var p;
            for (var i = 0; i < CLONE_PROPS.length; i++) {
                p = CLONE_PROPS[i];
                eventCopy[p] = inEvent[p] || CLONE_DEFAULTS[i];

                // Work around SVGInstanceElement shadow tree
                // Return the <use> element that is represented by the instance for Safari, Chrome, IE.
                // This is the behavior implemented by Firefox.
                if (HAS_SVG_INSTANCE && (p === 'target' || p === 'relatedTarget')) {
                    if (eventCopy[p] instanceof SVGElementInstance) {
                        eventCopy[p] = eventCopy[p].correspondingUseElement;
                    }
                }
            }

            // keep the semantics of preventDefault
            if (inEvent.preventDefault) {
                eventCopy.preventDefault = function () {
                    inEvent.preventDefault();
                };
            }
            return eventCopy;
        },
        getTarget: function (inEvent) {
            var capture = this.captureInfo[inEvent.pointerId];
            if (!capture) {
                return inEvent._target;
            }
            if (inEvent._target === capture || !(inEvent.type in BOUNDARY_EVENTS)) {
                return capture;
            }
        },
        setCapture: function (inPointerId, inTarget) {
            if (this.captureInfo[inPointerId]) {
                this.releaseCapture(inPointerId);
            }
            this.captureInfo[inPointerId] = inTarget;
            var e = document.createEvent('Event');
            e.initEvent('gotpointercapture', true, false);
            e.pointerId = inPointerId;
            this.implicitRelease = this.releaseCapture.bind(this, inPointerId);
            document.addEventListener('pointerup', this.implicitRelease);
            document.addEventListener('pointercancel', this.implicitRelease);
            e._target = inTarget;
            this.asyncDispatchEvent(e);
        },
        releaseCapture: function (inPointerId) {
            var t = this.captureInfo[inPointerId];
            if (t) {
                var e = document.createEvent('Event');
                e.initEvent('lostpointercapture', true, false);
                e.pointerId = inPointerId;
                this.captureInfo[inPointerId] = undefined;
                document.removeEventListener('pointerup', this.implicitRelease);
                document.removeEventListener('pointercancel', this.implicitRelease);
                e._target = t;
                this.asyncDispatchEvent(e);
            }
        },
        /**
         * Dispatches the event to its target.
         *
         * @param {Event} inEvent The event to be dispatched.
         * @return {Boolean} True if an event handler returns true, false otherwise.
         */
        dispatchEvent: /*scope.external.dispatchEvent || */function (inEvent) {
            var t = this.getTarget(inEvent);
            if (t) {
                return t.dispatchEvent(inEvent);
            }
        },
        asyncDispatchEvent: function (inEvent) {
            requestAnimationFrame(this.dispatchEvent.bind(this, inEvent));
        }
    };
    dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);

    var _dispatcher = dispatcher;

    var targeting = {
        shadow: function (inEl) {
            if (inEl) {
                return inEl.shadowRoot || inEl.webkitShadowRoot;
            }
        },
        canTarget: function (shadow) {
            return shadow && Boolean(shadow.elementFromPoint);
        },
        targetingShadow: function (inEl) {
            var s = this.shadow(inEl);
            if (this.canTarget(s)) {
                return s;
            }
        },
        olderShadow: function (shadow) {
            var os = shadow.olderShadowRoot;
            if (!os) {
                var se = shadow.querySelector('shadow');
                if (se) {
                    os = se.olderShadowRoot;
                }
            }
            return os;
        },
        allShadows: function (element) {
            var shadows = [];
            var s = this.shadow(element);
            while (s) {
                shadows.push(s);
                s = this.olderShadow(s);
            }
            return shadows;
        },
        searchRoot: function (inRoot, x, y) {
            if (inRoot) {
                var t = inRoot.elementFromPoint(x, y);
                var st, sr;

                // is element a shadow host?
                sr = this.targetingShadow(t);
                while (sr) {

                    // find the the element inside the shadow root
                    st = sr.elementFromPoint(x, y);
                    if (!st) {

                        // check for older shadows
                        sr = this.olderShadow(sr);
                    } else {

                        // shadowed element may contain a shadow root
                        var ssr = this.targetingShadow(st);
                        return this.searchRoot(ssr, x, y) || st;
                    }
                }

                // light dom element is the target
                return t;
            }
        },
        owner: function (element) {
            var s = element;

            // walk up until you hit the shadow root or document
            while (s.parentNode) {
                s = s.parentNode;
            }

            // the owner element is expected to be a Document or ShadowRoot
            if (s.nodeType !== Node.DOCUMENT_NODE && s.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
                s = document;
            }
            return s;
        },
        findTarget: function (inEvent) {
            var x = inEvent.clientX;
            var y = inEvent.clientY;

            // if the listener is in the shadow root, it is much faster to start there
            var s = this.owner(inEvent.target);

            // if x, y is not in this root, fall back to document search
            if (!s.elementFromPoint(x, y)) {
                s = document;
            }
            return this.searchRoot(s, x, y);
        }
    };

    /**
     * This module uses Mutation Observers to dynamically adjust which nodes will
     * generate Pointer Events.
     *
     * All nodes that wish to generate Pointer Events must have the attribute
     * `touch-action` set to `none`.
     */
    var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
    var map = Array.prototype.map.call.bind(Array.prototype.map);
    var toArray = Array.prototype.slice.call.bind(Array.prototype.slice);
    var filter = Array.prototype.filter.call.bind(Array.prototype.filter);
    var MO = window.MutationObserver || window.WebKitMutationObserver;
    var SELECTOR = '[touch-action]';
    var OBSERVER_INIT = {
        subtree: true,
        childList: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['touch-action']
    };

    function Installer(add, remove, changed, binder) {
        this.addCallback = add.bind(binder);
        this.removeCallback = remove.bind(binder);
        this.changedCallback = changed.bind(binder);
        if (MO) {
            this.observer = new MO(this.mutationWatcher.bind(this));
        }
    }

    Installer.prototype = {
        watchSubtree: function (target) {

            // Only watch scopes that can target find, as these are top-level.
            // Otherwise we can see duplicate additions and removals that add noise.
            //
            // TODO(dfreedman): For some instances with ShadowDOMPolyfill, we can see
            // a removal without an insertion when a node is redistributed among
            // shadows. Since it all ends up correct in the document, watching only
            // the document will yield the correct mutations to watch.
            if (this.observer && targeting.canTarget(target)) {
                this.observer.observe(target, OBSERVER_INIT);
            }
        },
        enableOnSubtree: function (target) {
            this.watchSubtree(target);
            if (target === document && document.readyState !== 'complete') {
                this.installOnLoad();
            } else {
                this.installNewSubtree(target);
            }
        },
        installNewSubtree: function (target) {
            forEach(this.findElements(target), this.addElement, this);
        },
        findElements: function (target) {
            if (target.querySelectorAll) {
                return target.querySelectorAll(SELECTOR);
            }
            return [];
        },
        removeElement: function (el) {
            this.removeCallback(el);
        },
        addElement: function (el) {
            this.addCallback(el);
        },
        elementChanged: function (el, oldValue) {
            this.changedCallback(el, oldValue);
        },
        concatLists: function (accum, list) {
            return accum.concat(toArray(list));
        },

        // register all touch-action = none nodes on document load
        installOnLoad: function () {
            document.addEventListener('readystatechange', function () {
                if (document.readyState === 'complete') {
                    this.installNewSubtree(document);
                }
            }.bind(this));
        },
        isElement: function (n) {
            return n.nodeType === Node.ELEMENT_NODE;
        },
        flattenMutationTree: function (inNodes) {

            // find children with touch-action
            var tree = map(inNodes, this.findElements, this);

            // make sure the added nodes are accounted for
            tree.push(filter(inNodes, this.isElement));

            // flatten the list
            return tree.reduce(this.concatLists, []);
        },
        mutationWatcher: function (mutations) {
            mutations.forEach(this.mutationHandler, this);
        },
        mutationHandler: function (m) {
            if (m.type === 'childList') {
                var added = this.flattenMutationTree(m.addedNodes);
                added.forEach(this.addElement, this);
                var removed = this.flattenMutationTree(m.removedNodes);
                removed.forEach(this.removeElement, this);
            } else if (m.type === 'attributes') {
                this.elementChanged(m.target, m.oldValue);
            }
        }
    };

    var installer = Installer;

    function shadowSelector(v) {
        return 'body /shadow-deep/ ' + selector(v);
    }
    function selector(v) {
        return '[touch-action="' + v + '"]';
    }
    function rule(v) {
        return '{ -ms-touch-action: ' + v + '; touch-action: ' + v + '; touch-action-delay: none; }';
    }
    var attrib2css = [
        'none',
        'auto',
        'pan-x',
        'pan-y',
        {
            rule: 'pan-x pan-y',
            selectors: [
                'pan-x pan-y',
                'pan-y pan-x'
            ]
        }
    ];
    var styles = '';

    // only install stylesheet if the browser has touch action support
    var hasNativePE = window.PointerEvent || window.MSPointerEvent;

    // only add shadow selectors if shadowdom is supported
    var hasShadowRoot = !window.ShadowDOMPolyfill && document.head.createShadowRoot;

    function applyAttributeStyles() {
        if (hasNativePE) {
            attrib2css.forEach(function (r) {
                if (String(r) === r) {
                    styles += selector(r) + rule(r) + '\n';
                    if (hasShadowRoot) {
                        styles += shadowSelector(r) + rule(r) + '\n';
                    }
                } else {
                    styles += r.selectors.map(selector) + rule(r.rule) + '\n';
                    if (hasShadowRoot) {
                        styles += r.selectors.map(shadowSelector) + rule(r.rule) + '\n';
                    }
                }
            });

            var el = document.createElement('style');
            el.textContent = styles;
            document.head.appendChild(el);
        }
    }

    var mouse__pointermap = _dispatcher.pointermap;

    // radius around touchend that swallows mouse events
    var DEDUP_DIST = 25;

    // left, middle, right, back, forward
    var BUTTON_TO_BUTTONS = [1, 4, 2, 8, 16];

    var HAS_BUTTONS = false;
    try {
        HAS_BUTTONS = new MouseEvent('test', { buttons: 1 }).buttons === 1;
    } catch (e) { }

    // handler block for native mouse events
    var mouseEvents = {
        POINTER_ID: 1,
        POINTER_TYPE: 'mouse',
        events: [
            'mousedown',
            'mousemove',
            'mouseup',
            'mouseover',
            'mouseout'
        ],
        register: function (target) {
            _dispatcher.listen(target, this.events);
        },
        unregister: function (target) {
            _dispatcher.unlisten(target, this.events);
        },
        lastTouches: [],

        // collide with the global mouse listener
        isEventSimulatedFromTouch: function (inEvent) {
            var lts = this.lastTouches;
            var x = inEvent.clientX;
            var y = inEvent.clientY;
            for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {

                // simulated mouse events will be swallowed near a primary touchend
                var dx = Math.abs(x - t.x);
                var dy = Math.abs(y - t.y);
                if (dx <= DEDUP_DIST && dy <= DEDUP_DIST) {
                    return true;
                }
            }
        },
        prepareEvent: function (inEvent) {
            var e = _dispatcher.cloneEvent(inEvent);

            // forward mouse preventDefault
            var pd = e.preventDefault;
            e.preventDefault = function () {
                inEvent.preventDefault();
                pd();
            };
            e.pointerId = this.POINTER_ID;
            e.isPrimary = true;
            e.pointerType = this.POINTER_TYPE;
            return e;
        },
        prepareButtonsForMove: function (e, inEvent) {
            var p = mouse__pointermap.get(this.POINTER_ID);
            e.buttons = p ? p.buttons : 0;
            inEvent.buttons = e.buttons;
        },
        mousedown: function (inEvent) {
            if (!this.isEventSimulatedFromTouch(inEvent)) {
                var p = mouse__pointermap.get(this.POINTER_ID);
                var e = this.prepareEvent(inEvent);
                if (!HAS_BUTTONS) {
                    e.buttons = BUTTON_TO_BUTTONS[e.button];
                    if (p) { e.buttons |= p.buttons; }
                    inEvent.buttons = e.buttons;
                }
                mouse__pointermap.set(this.POINTER_ID, inEvent);
                if (!p) {
                    _dispatcher.down(e);
                } else {
                    _dispatcher.move(e);
                }
            }
        },
        mousemove: function (inEvent) {
            if (!this.isEventSimulatedFromTouch(inEvent)) {
                var e = this.prepareEvent(inEvent);
                if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
                _dispatcher.move(e);
            }
        },
        mouseup: function (inEvent) {
            if (!this.isEventSimulatedFromTouch(inEvent)) {
                var p = mouse__pointermap.get(this.POINTER_ID);
                var e = this.prepareEvent(inEvent);
                if (!HAS_BUTTONS) {
                    var up = BUTTON_TO_BUTTONS[e.button];

                    // Produces wrong state of buttons in Browsers without `buttons` support
                    // when a mouse button that was pressed outside the document is released
                    // inside and other buttons are still pressed down.
                    e.buttons = p ? p.buttons & ~up : 0;
                    inEvent.buttons = e.buttons;
                }
                mouse__pointermap.set(this.POINTER_ID, inEvent);

                // Support: Firefox <=44 only
                // FF Ubuntu includes the lifted button in the `buttons` property on
                // mouseup.
                // https://bugzilla.mozilla.org/show_bug.cgi?id=1223366
                if (e.buttons === 0 || e.buttons === BUTTON_TO_BUTTONS[e.button]) {
                    this.cleanupMouse();
                    _dispatcher.up(e);
                } else {
                    _dispatcher.move(e);
                }
            }
        },
        mouseover: function (inEvent) {
            if (!this.isEventSimulatedFromTouch(inEvent)) {
                var e = this.prepareEvent(inEvent);
                if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
                _dispatcher.enterOver(e);
            }
        },
        mouseout: function (inEvent) {
            if (!this.isEventSimulatedFromTouch(inEvent)) {
                var e = this.prepareEvent(inEvent);
                if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
                _dispatcher.leaveOut(e);
            }
        },
        cancel: function (inEvent) {
            var e = this.prepareEvent(inEvent);
            _dispatcher.cancel(e);
            this.cleanupMouse();
        },
        cleanupMouse: function () {
            mouse__pointermap.delete(this.POINTER_ID);
        }
    };

    var mouse = mouseEvents;

    var captureInfo = _dispatcher.captureInfo;
    var findTarget = targeting.findTarget.bind(targeting);
    var allShadows = targeting.allShadows.bind(targeting);
    var touch__pointermap = _dispatcher.pointermap;

    // This should be long enough to ignore compat mouse events made by touch
    var DEDUP_TIMEOUT = 2500;
    var CLICK_COUNT_TIMEOUT = 200;
    var ATTRIB = 'touch-action';
    var INSTALLER;

    // The presence of touch event handlers blocks scrolling, and so we must be careful to
    // avoid adding handlers unnecessarily.  Chrome plans to add a touch-action-delay property
    // (crbug.com/329559) to address this, and once we have that we can opt-in to a simpler
    // handler registration mechanism.  Rather than try to predict how exactly to opt-in to
    // that we'll just leave this disabled until there is a build of Chrome to test.
    var HAS_TOUCH_ACTION_DELAY = false;

    // handler block for native touch events
    var touchEvents = {
        events: [
            'touchstart',
            'touchmove',
            'touchend',
            'touchcancel'
        ],
        register: function (target) {
            if (HAS_TOUCH_ACTION_DELAY) {
                _dispatcher.listen(target, this.events);
            } else {
                INSTALLER.enableOnSubtree(target);
            }
        },
        unregister: function (target) {
            if (HAS_TOUCH_ACTION_DELAY) {
                _dispatcher.unlisten(target, this.events);
            } else {

                // TODO(dfreedman): is it worth it to disconnect the MO?
            }
        },
        elementAdded: function (el) {
            var a = el.getAttribute(ATTRIB);
            var st = this.touchActionToScrollType(a);
            if (st) {
                el._scrollType = st;
                _dispatcher.listen(el, this.events);

                // set touch-action on shadows as well
                allShadows(el).forEach(function (s) {
                    s._scrollType = st;
                    _dispatcher.listen(s, this.events);
                }, this);
            }
        },
        elementRemoved: function (el) {
            el._scrollType = undefined;
            _dispatcher.unlisten(el, this.events);

            // remove touch-action from shadow
            allShadows(el).forEach(function (s) {
                s._scrollType = undefined;
                _dispatcher.unlisten(s, this.events);
            }, this);
        },
        elementChanged: function (el, oldValue) {
            var a = el.getAttribute(ATTRIB);
            var st = this.touchActionToScrollType(a);
            var oldSt = this.touchActionToScrollType(oldValue);

            // simply update scrollType if listeners are already established
            if (st && oldSt) {
                el._scrollType = st;
                allShadows(el).forEach(function (s) {
                    s._scrollType = st;
                }, this);
            } else if (oldSt) {
                this.elementRemoved(el);
            } else if (st) {
                this.elementAdded(el);
            }
        },
        scrollTypes: {
            EMITTER: 'none',
            XSCROLLER: 'pan-x',
            YSCROLLER: 'pan-y',
            SCROLLER: /^(?:pan-x pan-y)|(?:pan-y pan-x)|auto$/
        },
        touchActionToScrollType: function (touchAction) {
            var t = touchAction;
            var st = this.scrollTypes;
            if (t === 'none') {
                return 'none';
            } else if (t === st.XSCROLLER) {
                return 'X';
            } else if (t === st.YSCROLLER) {
                return 'Y';
            } else if (st.SCROLLER.exec(t)) {
                return 'XY';
            }
        },
        POINTER_TYPE: 'touch',
        firstTouch: null,
        isPrimaryTouch: function (inTouch) {
            return this.firstTouch === inTouch.identifier;
        },
        setPrimaryTouch: function (inTouch) {

            // set primary touch if there no pointers, or the only pointer is the mouse
            if (touch__pointermap.size === 0 || (touch__pointermap.size === 1 && touch__pointermap.has(1))) {
                this.firstTouch = inTouch.identifier;
                this.firstXY = { X: inTouch.clientX, Y: inTouch.clientY };
                this.scrolling = false;
                this.cancelResetClickCount();
            }
        },
        removePrimaryPointer: function (inPointer) {
            if (inPointer.isPrimary) {
                this.firstTouch = null;
                this.firstXY = null;
                this.resetClickCount();
            }
        },
        clickCount: 0,
        resetId: null,
        resetClickCount: function () {
            var fn = function () {
                this.clickCount = 0;
                this.resetId = null;
            }.bind(this);
            this.resetId = setTimeout(fn, CLICK_COUNT_TIMEOUT);
        },
        cancelResetClickCount: function () {
            if (this.resetId) {
                clearTimeout(this.resetId);
            }
        },
        typeToButtons: function (type) {
            var ret = 0;
            if (type === 'touchstart' || type === 'touchmove') {
                ret = 1;
            }
            return ret;
        },
        touchToPointer: function (inTouch) {
            var cte = this.currentTouchEvent;
            var e = _dispatcher.cloneEvent(inTouch);

            // We reserve pointerId 1 for Mouse.
            // Touch identifiers can start at 0.
            // Add 2 to the touch identifier for compatibility.
            var id = e.pointerId = inTouch.identifier + 2;
            e.target = captureInfo[id] || findTarget(e);
            e.bubbles = true;
            e.cancelable = true;
            e.detail = this.clickCount;
            e.button = 0;
            e.buttons = this.typeToButtons(cte.type);
            e.width = inTouch.radiusX || inTouch.webkitRadiusX || 0;
            e.height = inTouch.radiusY || inTouch.webkitRadiusY || 0;
            e.pressure = inTouch.force || inTouch.webkitForce || 0.5;
            e.isPrimary = this.isPrimaryTouch(inTouch);
            e.pointerType = this.POINTER_TYPE;

            // forward touch preventDefaults
            var self = this;
            e.preventDefault = function () {
                self.scrolling = false;
                self.firstXY = null;
                cte.preventDefault();
            };
            return e;
        },
        processTouches: function (inEvent, inFunction) {
            var tl = inEvent.changedTouches;
            this.currentTouchEvent = inEvent;
            for (var i = 0, t; i < tl.length; i++) {
                t = tl[i];
                inFunction.call(this, this.touchToPointer(t));
            }
        },

        // For single axis scrollers, determines whether the element should emit
        // pointer events or behave as a scroller
        shouldScroll: function (inEvent) {
            if (this.firstXY) {
                var ret;
                var scrollAxis = inEvent.currentTarget._scrollType;
                if (scrollAxis === 'none') {

                    // this element is a touch-action: none, should never scroll
                    ret = false;
                } else if (scrollAxis === 'XY') {

                    // this element should always scroll
                    ret = true;
                } else {
                    var t = inEvent.changedTouches[0];

                    // check the intended scroll axis, and other axis
                    var a = scrollAxis;
                    var oa = scrollAxis === 'Y' ? 'X' : 'Y';
                    var da = Math.abs(t['client' + a] - this.firstXY[a]);
                    var doa = Math.abs(t['client' + oa] - this.firstXY[oa]);

                    // if delta in the scroll axis > delta other axis, scroll instead of
                    // making events
                    ret = da >= doa;
                }
                this.firstXY = null;
                return ret;
            }
        },
        findTouch: function (inTL, inId) {
            for (var i = 0, l = inTL.length, t; i < l && (t = inTL[i]); i++) {
                if (t.identifier === inId) {
                    return true;
                }
            }
        },

        // In some instances, a touchstart can happen without a touchend. This
        // leaves the pointermap in a broken state.
        // Therefore, on every touchstart, we remove the touches that did not fire a
        // touchend event.
        // To keep state globally consistent, we fire a
        // pointercancel for this "abandoned" touch
        vacuumTouches: function (inEvent) {
            var tl = inEvent.touches;

            // pointermap.size should be < tl.length here, as the touchstart has not
            // been processed yet.
            if (touch__pointermap.size >= tl.length) {
                var d = [];
                touch__pointermap.forEach(function (value, key) {

                    // Never remove pointerId == 1, which is mouse.
                    // Touch identifiers are 2 smaller than their pointerId, which is the
                    // index in pointermap.
                    if (key !== 1 && !this.findTouch(tl, key - 2)) {
                        var p = value.out;
                        d.push(p);
                    }
                }, this);
                d.forEach(this.cancelOut, this);
            }
        },
        touchstart: function (inEvent) {
            this.vacuumTouches(inEvent);
            this.setPrimaryTouch(inEvent.changedTouches[0]);
            this.dedupSynthMouse(inEvent);
            if (!this.scrolling) {
                this.clickCount++;
                this.processTouches(inEvent, this.overDown);
            }
        },
        overDown: function (inPointer) {
            touch__pointermap.set(inPointer.pointerId, {
                target: inPointer.target,
                out: inPointer,
                outTarget: inPointer.target
            });
            _dispatcher.over(inPointer);
            _dispatcher.enter(inPointer);
            _dispatcher.down(inPointer);
        },
        touchmove: function (inEvent) {
            if (!this.scrolling) {
                if (this.shouldScroll(inEvent)) {
                    this.scrolling = true;
                    this.touchcancel(inEvent);
                } else {
                    inEvent.preventDefault();
                    this.processTouches(inEvent, this.moveOverOut);
                }
            }
        },
        moveOverOut: function (inPointer) {
            var event = inPointer;
            var pointer = touch__pointermap.get(event.pointerId);

            // a finger drifted off the screen, ignore it
            if (!pointer) {
                return;
            }
            var outEvent = pointer.out;
            var outTarget = pointer.outTarget;
            _dispatcher.move(event);
            if (outEvent && outTarget !== event.target) {
                outEvent.relatedTarget = event.target;
                event.relatedTarget = outTarget;

                // recover from retargeting by shadow
                outEvent.target = outTarget;
                if (event.target) {
                    _dispatcher.leaveOut(outEvent);
                    _dispatcher.enterOver(event);
                } else {

                    // clean up case when finger leaves the screen
                    event.target = outTarget;
                    event.relatedTarget = null;
                    this.cancelOut(event);
                }
            }
            pointer.out = event;
            pointer.outTarget = event.target;
        },
        touchend: function (inEvent) {
            this.dedupSynthMouse(inEvent);
            this.processTouches(inEvent, this.upOut);
        },
        upOut: function (inPointer) {
            if (!this.scrolling) {
                _dispatcher.up(inPointer);
                _dispatcher.out(inPointer);
                _dispatcher.leave(inPointer);
            }
            this.cleanUpPointer(inPointer);
        },
        touchcancel: function (inEvent) {
            this.processTouches(inEvent, this.cancelOut);
        },
        cancelOut: function (inPointer) {
            _dispatcher.cancel(inPointer);
            _dispatcher.out(inPointer);
            _dispatcher.leave(inPointer);
            this.cleanUpPointer(inPointer);
        },
        cleanUpPointer: function (inPointer) {
            touch__pointermap.delete(inPointer.pointerId);
            this.removePrimaryPointer(inPointer);
        },

        // prevent synth mouse events from creating pointer events
        dedupSynthMouse: function (inEvent) {
            var lts = mouse.lastTouches;
            var t = inEvent.changedTouches[0];

            // only the primary finger will synth mouse events
            if (this.isPrimaryTouch(t)) {

                // remember x/y of last touch
                var lt = { x: t.clientX, y: t.clientY };
                lts.push(lt);
                var fn = (function (lts, lt) {
                    var i = lts.indexOf(lt);
                    if (i > -1) {
                        lts.splice(i, 1);
                    }
                }).bind(null, lts, lt);
                setTimeout(fn, DEDUP_TIMEOUT);
            }
        }
    };

    if (!HAS_TOUCH_ACTION_DELAY) {
        INSTALLER = new installer(touchEvents.elementAdded, touchEvents.elementRemoved,
            touchEvents.elementChanged, touchEvents);
    }

    var touch = touchEvents;

    var ms__pointermap = _dispatcher.pointermap;
    var HAS_BITMAP_TYPE = window.MSPointerEvent &&
        typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE === 'number';
    var msEvents = {
        events: [
            'MSPointerDown',
            'MSPointerMove',
            'MSPointerUp',
            'MSPointerOut',
            'MSPointerOver',
            'MSPointerCancel',
            'MSGotPointerCapture',
            'MSLostPointerCapture'
        ],
        register: function (target) {
            _dispatcher.listen(target, this.events);
        },
        unregister: function (target) {
            _dispatcher.unlisten(target, this.events);
        },
        POINTER_TYPES: [
            '',
            'unavailable',
            'touch',
            'pen',
            'mouse'
        ],
        prepareEvent: function (inEvent) {
            var e = inEvent;
            if (HAS_BITMAP_TYPE) {
                e = _dispatcher.cloneEvent(inEvent);
                e.pointerType = this.POINTER_TYPES[inEvent.pointerType];
            }
            return e;
        },
        cleanup: function (id) {
            ms__pointermap.delete(id);
        },
        MSPointerDown: function (inEvent) {
            ms__pointermap.set(inEvent.pointerId, inEvent);
            var e = this.prepareEvent(inEvent);
            _dispatcher.down(e);
        },
        MSPointerMove: function (inEvent) {
            var e = this.prepareEvent(inEvent);
            _dispatcher.move(e);
        },
        MSPointerUp: function (inEvent) {
            var e = this.prepareEvent(inEvent);
            _dispatcher.up(e);
            this.cleanup(inEvent.pointerId);
        },
        MSPointerOut: function (inEvent) {
            var e = this.prepareEvent(inEvent);
            _dispatcher.leaveOut(e);
        },
        MSPointerOver: function (inEvent) {
            var e = this.prepareEvent(inEvent);
            _dispatcher.enterOver(e);
        },
        MSPointerCancel: function (inEvent) {
            var e = this.prepareEvent(inEvent);
            _dispatcher.cancel(e);
            this.cleanup(inEvent.pointerId);
        },
        MSLostPointerCapture: function (inEvent) {
            var e = _dispatcher.makeEvent('lostpointercapture', inEvent);
            _dispatcher.dispatchEvent(e);
        },
        MSGotPointerCapture: function (inEvent) {
            var e = _dispatcher.makeEvent('gotpointercapture', inEvent);
            _dispatcher.dispatchEvent(e);
        }
    };

    var ms = msEvents;

    function platform_events__applyPolyfill() {

        // only activate if this platform does not have pointer events
        if (!window.PointerEvent) {
            window.PointerEvent = _PointerEvent;

            if (window.navigator.msPointerEnabled) {
                var tp = window.navigator.msMaxTouchPoints;
                Object.defineProperty(window.navigator, 'maxTouchPoints', {
                    value: tp,
                    enumerable: true
                });
                _dispatcher.registerSource('ms', ms);
            } else {
                _dispatcher.registerSource('mouse', mouse);
                if (window.ontouchstart !== undefined) {
                    _dispatcher.registerSource('touch', touch);
                }
            }

            _dispatcher.register(document);
        }
    }

    var n = window.navigator;
    var s, r;
    function assertDown(id) {
        if (!_dispatcher.pointermap.has(id)) {
            throw new Error('InvalidPointerId');
        }
    }
    if (n.msPointerEnabled) {
        s = function (pointerId) {
            assertDown(pointerId);
            this.msSetPointerCapture(pointerId);
        };
        r = function (pointerId) {
            assertDown(pointerId);
            this.msReleasePointerCapture(pointerId);
        };
    } else {
        s = function setPointerCapture(pointerId) {
            assertDown(pointerId);
            _dispatcher.setCapture(pointerId, this);
        };
        r = function releasePointerCapture(pointerId) {
            assertDown(pointerId);
            _dispatcher.releaseCapture(pointerId, this);
        };
    }

    function _capture__applyPolyfill() {
        if (window.Element && !Element.prototype.setPointerCapture) {
            Object.defineProperties(Element.prototype, {
                'setPointerCapture': {
                    value: s
                },
                'releasePointerCapture': {
                    value: r
                }
            });
        }
    }

    applyAttributeStyles();
    platform_events__applyPolyfill();
    _capture__applyPolyfill();

    var pointerevents = {
        dispatcher: _dispatcher,
        Installer: installer,
        PointerEvent: _PointerEvent,
        PointerMap: _pointermap,
        targetFinding: targeting
    };

    return pointerevents;

}));

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
        keypseudo = {
            action: function (pseudo, event) {
                return pseudo.value.match(regexDigits).indexOf(String(event.keyCode)) > -1 == (pseudo.name == 'keypass') || null;
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

    function clone(item, type) {
        var fn = clone[type || typeOf(item)];
        return fn ? fn(item) : item;
    }
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
    function toArray(obj) {
        return unsliceable[typeOf(obj)] ? [obj] : Array.prototype.slice.call(obj, 0);
    }

    // DOM
    var str = '';
    function query(element, selector) {
        return (selector || str).length ? toArray(element.querySelectorAll(selector)) : [];
    }

    // Pseudos
    function parsePseudo(fn) { fn(); }

    // Mixins
    function mergeOne(source, key, current) {
        var type = typeOf(current);
        if (type == 'object' && typeOf(source[key]) == 'object') xtag.merge(source[key], current);
        else source[key] = clone(current, type);
        return source;
    }

    function mergeMixin(tag, original, mixin, name) {
        var key, keys = {};
        for (var z in original) keys[z.split(':')[0]] = z;
        for (z in mixin) {
            key = keys[z.split(':')[0]];
            if (typeof original[key] == 'function') {
                if (!key.match(':mixins')) {
                    original[key + ':mixins'] = original[key];
                    delete original[key];
                    key = key + ':mixins';
                }
                original[key].__mixin__ = xtag.applyPseudos(z + (z.match(':mixins') ? '' : ':mixins'), mixin[z], tag.pseudos, original[key].__mixin__);
            }
            else {
                original[z] = mixin[z];
                delete original[key];
            }
        }
    }

    var uniqueMixinCount = 0;
    function addMixin(tag, original, mixin) {
        for (var z in mixin) {
            original[z + ':__mixin__(' + (uniqueMixinCount++) + ')'] = xtag.applyPseudos(z, mixin[z], tag.pseudos);
        }
    }

    function resolveMixins(mixins, output) {
        var index = mixins.length;
        while (index--) {
            output.unshift(mixins[index]);
            if (xtag.mixins[mixins[index]].mixins) resolveMixins(xtag.mixins[mixins[index]].mixins, output);
        }
        return output;
    }

    function applyMixins(tag) {
        resolveMixins(tag.mixins, []).forEach(function (name) {
            var mixin = xtag.mixins[name];
            for (var type in mixin) {
                var item = mixin[type],
                    original = tag[type];
                if (!original) tag[type] = item;
                else {
                    switch (type) {
                        case 'mixins': break;
                        case 'events': addMixin(tag, original, item); break;
                        case 'accessors':
                        case 'prototype':
                            for (var z in item) {
                                if (!original[z]) original[z] = item[z];
                                else mergeMixin(tag, original[z], item[z], name);
                            }
                            break;
                        default: mergeMixin(tag, original, item, name);
                    }
                }
            }
        });
        return tag;
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

    function touchFilter(event) {
        return event.button === 0;
    }

    function writeProperty(key, event, base, desc) {
        if (desc) event[key] = base[key];
        else Object.defineProperty(event, key, {
            writable: true,
            enumerable: true,
            value: base[key]
        });
    }

    var skipProps = {};
    for (var z in doc.createEvent('CustomEvent')) skipProps[z] = 1;
    function inheritEvent(event, base) {
        var desc = Object.getOwnPropertyDescriptor(event, 'target');
        for (var z in base) {
            if (!skipProps[z]) writeProperty(z, event, base, desc);
        }
        event.baseEvent = base;
    }

    // Accessors
    function modAttr(element, attr, name, value, method) {
        attrProto[method].call(element, name, attr && attr.boolean ? '' : value);
    }

    function syncAttr(element, attr, name, value, method) {
        if (attr && (attr.property || attr.selector)) {
            var nodes = attr.property ? [element.xtag[attr.property]] : attr.selector ? xtag.query(element, attr.selector) : [],
                index = nodes.length;
            while (index--) nodes[index][method](name, value);
        }
    }

    function attachProperties(tag, prop, z, accessor, attr, name) {
        var key = z.split(':'), type = key[0];
        if (type == 'get') {
            key[0] = prop;
            tag.prototype[prop].get = xtag.applyPseudos(key.join(':'), accessor[z], tag.pseudos, accessor[z]);
        }
        else if (type == 'set') {
            key[0] = prop;
            var setter = tag.prototype[prop].set = xtag.applyPseudos(key.join(':'), attr ? function (value) {
                var old, method = 'setAttribute';
                if (attr.boolean) {
                    value = !!value;
                    old = this.hasAttribute(name);
                    if (!value) method = 'removeAttribute';
                }
                else {
                    value = attr.validate ? attr.validate.call(this, value) : value;
                    old = this.getAttribute(name);
                }
                modAttr(this, attr, name, value, method);
                accessor[z].call(this, value, old);
                syncAttr(this, attr, name, value, method);
            } : accessor[z] ? function (value) {
                accessor[z].call(this, value);
            } : null, tag.pseudos, accessor[z]);

            if (attr) attr.setter = accessor[z];
        }
        else tag.prototype[prop][z] = accessor[z];
    }

    function parseAccessor(tag, prop) {
        tag.prototype[prop] = {};
        var accessor = tag.accessors[prop],
            attr = accessor.attribute,
            name;

        if (attr) {
            name = attr.name = (attr ? (attr.name || prop.replace(regexCamelToDash, '$1-$2')) : prop).toLowerCase();
            attr.key = prop;
            tag.attributes[name] = attr;
        }

        for (var z in accessor) attachProperties(tag, prop, z, accessor, attr, name);

        if (attr) {
            if (!tag.prototype[prop].get) {
                var method = (attr.boolean ? 'has' : 'get') + 'Attribute';
                tag.prototype[prop].get = function () {
                    return this[method](name);
                };
            }
            if (!tag.prototype[prop].set) tag.prototype[prop].set = function (value) {
                value = attr.boolean ? !!value : attr.validate ? attr.validate.call(this, value) : value;
                var method = attr.boolean ? (value ? 'setAttribute' : 'removeAttribute') : 'setAttribute';
                modAttr(this, attr, name, value, method);
                syncAttr(this, attr, name, value, method);
            };
        }
    }

    var unwrapComment = /\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//;
    function parseMultiline(fn) {
        return typeof fn == 'function' ? unwrapComment.exec(fn.toString())[1] : fn;
    }

	/** ---------------------- @Edit Start ---------------------- 
     * @editor: Steven Van Sant
     * @changelog:
     * 1. Added _prevent parameter to the xtag.register method.
     * 2. Added a conditional if statement to check to see if the _prevent parameter is passed
     * 3. Added a conditional if statement to check keys for presences of extensions syntax from v2
     * @roadmap:
     * 1. Finish the `extension` API in accordance with the directives from the open dashboard project. 
     *   a. @github: open-dashboard/directives/roadmap_xtag_v1-7-0.md
     *   b. @docs: github open-dashboard wiki.
     * 2. Create an api to check for methods not included in the library by default the switch() method.
     * 3. Implement callback extension system to detect lotusJS components with extensions added to them.
     *   a. @example: context.compnentMap.mapComponent("io-lotus-main::bin:add(myUxPart)",Lotus,proto,xtag);
     *     This is a variation from the open-dashboard where instead of checking the object keys the Lotus 
     *     framework will detect it during its component maping phase.
     */
    /**
     * @name: getExtensionPath
     * @param {any} target
     * @param {any} _pathArray
     */
    function getExtensionPath(target, _pathArray) {
        var _r = target;
        for (var i = 1; i < _pathArray.length - 1; i++) {
            _r = _r[_pathArray[i].match(/\w+/gi)[0]] = {};
        }
        return _r;
    }

	/**
	 * @Name: setExtension
	 * @Note: Extensions are coded here, the library doesn't offer an API for extension creation like in V2
	 */
    function setExtension(_ext) {
        switch (_ext[0]) {
            /**
             * @case: collection
             * @desc: 
             */
            case "collection":
                let obj = getExtensionPath(dashboard.collection, _ext),
                    _m = _ext[_ext.length - 1].match(/\([a-z]+\/[a-z]+\)|\(\*\/[a-z]+\)|\([a-z]+\/\*\)/gi),
                    _arrayNodeList = {};
                _m = _m[0].replace(regexPseudoParens, "");
                let _mats = _m.match(/\w+/gi).length > 1 ? _m : _m.match(/\w+/gi)[0];
                let _node = document.body.querySelectorAll("[type]");
                for (var i = 0; i < _node.length; i++) {
                    if (_node[i].nodeName === "SCRIPT" || _node[i].nodeName === "LINK" || _node[i].nodeName === "STYLE") { null; }
                    else if (/[a-z]+\/[a-z]+/gi.test(_node[i].getAttribute('type'))) {
                        _node[i].getAttribute('type').match(_mats) !== null ? _arrayNodeList[_node[i].id] = _node[i] : null;
                    }
                }
                return _arrayNodeList;

            /**
             * @case: bin
             * @desc: 
             */
            case "bin":
                return getExtensionPath(dashboard.bin, _ext);

            /**
             * @case: interface
             * @desc: 
             */
            case "interface":
                return getExtensionPath(dashboard.interface, _ext);

            /**
             * @case: render
             * @desc: 
             */
            case "render":
                return getExtensionPath(dashboard.render, _ext);
        }
    }

	/**
	 * @Name: extio
	 * @note: extio is an object used for your class definition 'callback' and doesn't get exposed to the GLOBAL thread
	 */
    var extio = { _Errors: [] };

    /**
     * @name: buildExtension
     * @note: This method is used to catch extensions passed to the applyPseudo method
     */
    extio.buildExtension = function _buildExtension(_key_, _fn, args, _func) {
        let _parsed = _key_.match(/(\w+)|(::|:)(\w+)(?:\((.+?(?=\)))\))?/g),
            _target = setExtension(_parsed, _fn);
        return true;
    }

    /**
     * @Name: onBuild
     */
    extio.onBuild = function onBuild(_name, _obj, tag, _xtag) {
        return _obj.onBuild(_name, _obj, tag, _xtag);
    };

    /**
     * @Name: onRender
     */
    extio.onRender = function onRender(_name, _obj, _xtag, _temp) {
        _obj.onRender(_name, _obj, _xtag, _temp);
    };

	/**
	 * @Name: extensions
	 */
    function extensions(_name, _define_, _xtag_, definition) {
        var _def = null,
            _temp = null;
        try {
            _def = new _define_();
        }
        catch (er) {
            extio._Errors.push({
                id: "definePreventClassError",
                system: er,
            });
        }

		/**
		 * @note: Build is executed before Render object and its return value is passed to the onRender method.
		 */
        if (typeof _define_ === "function") {
            // Invoke the onBuild function
            _temp = extio.onBuild(_name, _def, _xtag_, definition);
            // Invoke the onRender function and pass the onBuild's return;
            extio.onRender(_name, _def, _xtag_, _temp);
        }
        else throw "Define a class or constructor object method.";

        /**
         * @note: The extensions method is used for internal mapping and build time function exection.
         * @note: The extensions method closes returns itself depending on the preloadedPolyfill value.
         * @value: preloadedPolyfill = default
         * @value: preloadedPolyfill = #linkpreloadID
         * @value: preloadedPolyfill = url/path/poly.js
         */
        if (_def.preloadedPolyfill === "default") {
            return doc.registerElement(_name, definition);
        }
        else if (typeof _def.preloadedPolyfill === "function") {
            /**
             * @note: Fired functions must return the preload link id [#yourLinkId] or script url
             */
            var _link = this.preloadedPolyfill(),
                _script = document.createElement("script");

            _script.type = "text/javascript";

            if (_link[0] === "#") {
                _link = docoment.getElementById(_link);
                _script.src = _link.getAttribute("href");
            }
            else {
                _script.src = _link;
            }
            document.head.appendChild(_script);
        }
        else return _define_;
    }

    /*** X-Tag Object Definition ***/
    var xtag = {
        tags: {},
        defaultOptions: {
            pseudos: [],
            mixins: [],
            events: {},
            methods: {},
            accessors: {},
            lifecycle: {},
            attributes: {},
            'prototype': {
                xtag: {
                    get: function () {
                        return this.__xtag__ ? this.__xtag__ : (this.__xtag__ = { data: {} });
                    }
                }
            }
        },

        /**
         * @Name: register
         * ____________________________________________________________________________ *
         * @Changelog: [ location: /xtag_changelog.md, line: TBA ]
         ****** 1. Added `_prevent` parameter [ line: param(#3) ]
         ****** 2. Added optimization in first if else statement. [ line: scope(~132) ]
         ****** 3. Added a prevent system to override execution of custom element [ line: scope(~1); ]
         * ____________________________________________________________________________ *
         */
        register: function _register_(name, options, _prevent) {
            var _name;
            if (typeof name == 'string') (_name = name.toLowerCase(), xtag.tags[_name] = options || {});
            else throw 'First argument must be a Custom Element string name';

            var basePrototype = options.prototype;
            delete options.prototype;

            /** 
             * @Names: tag, proto, lifecycle. 
             */
            var tag = xtag.tags[_name].compiled = applyMixins(xtag.merge({}, xtag.defaultOptions, options));
            var proto = tag.prototype;
            var lifecycle = tag.lifecycle;
            for (var z in tag.events) tag.events[z] = xtag.parseEvent(z, tag.events[z]);
            for (z in lifecycle) lifecycle[z.split(':')[0]] = xtag.applyPseudos(z, lifecycle[z], tag.pseudos, lifecycle[z]);
            for (z in tag.methods) proto[z.split(':')[0]] = { value: xtag.applyPseudos(z, tag.methods[z], tag.pseudos, tag.methods[z]), enumerable: true };
            for (z in tag.accessors) parseAccessor(tag, z);

            if (tag.shadow) tag.shadow = tag.shadow.nodeName ? tag.shadow : xtag.createFragment(tag.shadow);
            if (tag.content) tag.content = tag.content.nodeName ? tag.content.innerHTML : parseMultiline(tag.content);

            var created = lifecycle.created;
            var finalized = lifecycle.finalized;
            proto.createdCallback = {
                enumerable: true,
                value: function () {
                    var element = this;
                    if (tag.shadow && hasShadow) this.createShadowRoot().appendChild(tag.shadow.cloneNode(true));
                    if (tag.content) this.appendChild(document.createElement('div')).outerHTML = tag.content;
                    var output = created ? created.apply(this, arguments) : null;
                    xtag.addEvents(this, tag.events);
                    for (var name in tag.attributes) {
                        var attr = tag.attributes[name],
                            hasAttr = this.hasAttribute(name),
                            hasDefault = attr.def !== undefined;
                        if (hasAttr || attr.boolean || hasDefault) {
                            this[attr.key] = attr.boolean ? hasAttr : !hasAttr && hasDefault ? attr.def : this.getAttribute(name);
                        }
                    }
                    tag.pseudos.forEach(function (obj) {
                        obj.onAdd.call(element, obj);
                    });
                    this.xtagComponentReady = true;
                    if (finalized) finalized.apply(this, arguments);
                    return output;
                }
            };

            var inserted = lifecycle.inserted;
            var removed = lifecycle.removed;
            if (inserted || removed) {
                proto.attachedCallback = {
                    value: function () {
                        if (removed) this.xtag.__parentNode__ = this.parentNode;
                        if (inserted) return inserted.apply(this, arguments);
                    }, enumerable: true
                };
            }
            if (removed) {
                proto.detachedCallback = {
                    value: function () {
                        var args = toArray(arguments);
                        args.unshift(this.xtag.__parentNode__);
                        var output = removed.apply(this, args);
                        delete this.xtag.__parentNode__;
                        return output;
                    }, enumerable: true
                };
            }
            if (lifecycle.attributeChanged) proto.attributeChangedCallback = { value: lifecycle.attributeChanged, enumerable: true };

            proto.setAttribute = {
                writable: true,
                enumerable: true,
                value: function (name, value) {
                    var old;
                    var _name = name.toLowerCase();
                    var attr = tag.attributes[_name];
                    if (attr) {
                        old = this.getAttribute(_name);
                        value = attr.boolean ? '' : attr.validate ? attr.validate.call(this, value) : value;
                    }
                    modAttr(this, attr, _name, value, 'setAttribute');
                    if (attr) {
                        if (attr.setter) attr.setter.call(this, attr.boolean ? true : value, old);
                        syncAttr(this, attr, _name, value, 'setAttribute');
                    }
                }
            };

            proto.removeAttribute = {
                writable: true,
                enumerable: true,
                value: function (name) {
                    var _name = name.toLowerCase();
                    var attr = tag.attributes[_name];
                    var old = this.hasAttribute(_name);
                    modAttr(this, attr, _name, '', 'removeAttribute');
                    if (attr) {
                        if (attr.setter) attr.setter.call(this, attr.boolean ? false : undefined, old);
                        syncAttr(this, attr, _name, '', 'removeAttribute');
                    }
                }
            };

            var definition = {};
            var instance = basePrototype instanceof win.HTMLElement;
            var extended = tag['extends'] && (definition['extends'] = tag['extends']);

            if (basePrototype) Object.getOwnPropertyNames(basePrototype).forEach(function (z) {
                var prop = proto[z];
                var desc = instance ? Object.getOwnPropertyDescriptor(basePrototype, z) : basePrototype[z];
                if (prop) {
                    for (var y in desc) {
                        if (typeof desc[y] == 'function' && prop[y]) prop[y] = xtag.wrap(desc[y], prop[y]);
                        else prop[y] = desc[y];
                    }
                }
                proto[z] = prop || desc;
            });

            definition['prototype'] = Object.create(
                extended ? Object.create(doc.createElement(extended).constructor).prototype : win.HTMLElement.prototype,
                proto
            );

            /**
             * @Lognote: If _prevent parameter is available registration of element will be halted for that elements definition
             * ** and you can use your own build/registration method by passing the _prevent parameter as an ES6 class.
             * ** @More[ Location: /lognotes.md ] 
             */
            if (_prevent) return extensions(_name, _prevent, tag, definition);
            return doc.registerElement(_name, definition);

        },

        /**
         * Exposed Variables 
         */
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
            /** @bug: tap initiates func call on both pointerdown and pointerup */
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
            __mixin__: {},
            mixins: {
                onCompiled: function (fn, pseudo) {
                    var mixin = pseudo.source && pseudo.source.__mixin__ || pseudo.source;
                    if (mixin) switch (pseudo.value) {
                        case null: case '': case 'before': return function () {
                            mixin.apply(this, arguments);
                            return fn.apply(this, arguments);
                        };
                        case 'after': return function () {
                            var returns = fn.apply(this, arguments);
                            mixin.apply(this, arguments);
                            return returns;
                        };
                        case 'none': return fn;
                    }
                    else return fn;
                }
            },
            keypass: keypseudo,
            keyfail: keypseudo,
            delegate: {
                action: delegateAction
            },
            preventable: {
                action: function (pseudo, event) {
                    return !event.defaultPrevented;
                }
            },
            duration: {
                onAdd: function (pseudo) {
                    pseudo.source.duration = Number(pseudo.value);
                }
            },
            capture: {
                onCompiled: function (fn, pseudo) {
                    if (pseudo.source) pseudo.source.capture = true;
                }
            }
        },

        /** 
         * @Name: UTILITIES 
         */
        clone: clone,
        typeOf: typeOf,
        toArray: toArray,
        /** 
         * @Name: wrap
         */
        wrap: function _wrap(original, fn) {
            return function () {
                var output = original.apply(this, arguments);
                fn.apply(this, arguments);
                return output;
            };
        },
        /**
         * @Name: merge
         * Recursively merges one object with another. The first argument is the destination object,
         * all other objects passed in as arguments are merged from right to left, conflicts are overwritten
        */
        merge: function _merge(source, k, v) {
            if (typeOf(k) == 'string') return mergeOne(source, k, v);
            for (var i = 1, l = arguments.length; i < l; i++) {
                var object = arguments[i];
                for (var key in object) mergeOne(source, key, object[key]);
            }
            return source;
        },

        /**
         * @Name: _parseUidToken
         */
        _parseUidToken: function _parseUidToken() { /** To Do? */ },

        /**
         * ----- This should be simplified! -----
         * Generates a random ID string
         * @Name: uid
        */
        uid: function (_token, fn) {
            // ToDo:_token override
            return Math.random().toString(36).substr(2, 10);
        },

        /** 
         * @Name: DOM 
         */

        query: query,

        /**
         * @Name: skipTransition
         */
        skipTransition: function (element, fn, bind) {
            var prop = prefix.js + 'TransitionProperty';
            element.style[prop] = element.style.transitionProperty = 'none';
            var callback = fn ? fn.call(bind || element) : null;
            return xtag.skipFrame(function () {
                element.style[prop] = element.style.transitionProperty = '';
                if (callback) callback.call(bind || element);
            });
        },

        /**
         * @Name: requestFrame
         */
        requestFrame: (function () {
            var raf = win.requestAnimationFrame ||
                win[prefix.lowercase + 'RequestAnimationFrame'] ||
                function (fn) { return win.setTimeout(fn, 20); };
            return function (fn) { return raf(fn); };
        })(),

        /**
         * @Name: cancelFrame
         */
        cancelFrame: (function () {
            var cancel = win.cancelAnimationFrame ||
                win[prefix.lowercase + 'CancelAnimationFrame'] ||
                win.clearTimeout;
            return function (id) { return cancel(id); };
        })(),

        /**
         * @Name: skipFrame
         */

        skipFrame: function (fn) {
            var id = xtag.requestFrame(function () { id = xtag.requestFrame(fn); });
            return id;
        },

        /**
         * @Name: matchSelector
         */
        matchSelector: function (element, selector) {
            return matchSelector.call(element, selector);
        },

        /**
         * @Name: set
         */
        set: function (element, method, value) {
            element[method] = value;
            if (window.CustomElements) CustomElements.upgradeAll(element);
        },

        /**
         * @Name: innerHTML
         */
        innerHTML: function (el, html) {
            xtag.set(el, 'innerHTML', html);
        },

        /**
         * @Name: hasClass
         */
        hasClass: function (element, klass) {
            return element.className.split(' ').indexOf(klass.trim()) > -1;
        },

        /**
         * @Name: addClass
         */
        addClass: function (element, klass) {
            var list = element.className.trim().split(' ');

            klass.trim().split(' ').forEach(function (name) {
                if (!~list.indexOf(name)) list.push(name);
            });

            element.className = list.join(' ').trim();
            return element;
        },

        /**
         * @Name: removeClass
         */
        removeClass: function (element, klass) {
            var classes = klass.trim().split(' ');
            element.className = element.className.trim().split(' ').filter(function (name) {
                return name && !~classes.indexOf(name);
            }).join(' ');
            return element;
        },

        /**
         * @Name: toggleClass
         */
        toggleClass: function (element, klass) {
            return xtag[xtag.hasClass(element, klass) ? 'removeClass' : 'addClass'].call(null, element, klass);
        },

        /**
         * @Name: queryChildren
         * @Description: Runs a query on only the children of an element
         */
        queryChildren: function (element, selector) {
            var id = element.id,
                attr = '#' + (element.id = id || 'x_' + xtag.uid()) + ' > ',
                parent = element.parentNode || !container.appendChild(element);
            selector = attr + (selector + '').replace(regexReplaceCommas, ',' + attr);
            var result = element.parentNode.querySelectorAll(selector);
            if (!id) element.removeAttribute('id');
            if (!parent) container.removeChild(element);
            return toArray(result);
        },

        /**
         * @name: createFragment
         * @description: Creates a document fragment with the content passed in - content can be
         *  ** a string of HTML, an element, or an array/collection of elements
        */
        createFragment: function (content) {
            var template = document.createElement('template');
            if (content) {
                if (content.nodeName) toArray(arguments).forEach(function (e) {
                    template.content.appendChild(e);
                });
                else template.innerHTML = parseMultiline(content);
            }
            return document.importNode(template.content, true);
        },

        /**
         * @description: Removes an element from the DOM for more performant node manipulation. The element
         * is placed back into the DOM at the place it was taken from.
        */
        manipulate: function (element, fn) {
            var next = element.nextSibling,
                parent = element.parentNode,
                returned = fn.call(element) || element;
            if (next) parent.insertBefore(returned, next);
            else parent.appendChild(returned);
        },

        /** 
         * @name: applyPseudos
         * @tags: Parent, Pseudos, Method
        */
        applyPseudos: function (key, fn, target, source) {
            var listener = fn,
                pseudos = {};

            /**
             * @changelog#4:
             * ** catch extension syntax and build new def if present
             */
            var ext = false;
            if (/\:\:/gi.test(key)) {
                ext = extio.buildExtension(key, fn, target, source);
            }

            /** 
             * @note: V1 original script below 
             */
            if (key.match(':') && ext === false) {
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

                    if (!xtag.pseudos[name]) {
                        throw "pseudo not found: " + name + " " + value;
                    }

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

                    if (!target) { pseudo.onAdd.call(fn, pseudo); }
                    else { target.push(pseudo); }

                });
            }

            for (var z in pseudos) {
                if (pseudos[z].onCompiled) listener = pseudos[z].onCompiled(listener, pseudos[z]) || listener;
            }
            return listener;
        },

        removePseudos: function (target, pseudos) {
            pseudos.forEach(function (obj) {
                obj.onRemove.call(target, obj);
            });
        },

        /**
         * @name: parseEvent
         * @tags: Parent, Window, Methods, Event
         */
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

                if (!output) { return output; }

                // The second condition in this IF is to address the following Blink regression: https://code.google.com/p/chromium/issues/detail?id=367537
                // Remove this when affected browser builds with this regression fall below 5% marketshare
                if (e.type != key && (e.baseEvent && e.type != e.baseEvent.type)) {
                    console.log(e.type);
                    xtag.fireEvent(e.target, key, {
                        baseEvent: e,
                        detail: output !== true && (output.__stack__ = stack) ? output : { __stack__: stack }
                    });
                }
                else return event.stack.apply(this, args);

            };

            event.attach.forEach(function (name) {
                event._attach.push(xtag.parseEvent(name, event.listener));
            });
            return event;
        },

        /**
         * @name: addEvent
         */
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

        /**
         * @name: addEvents
         */
        addEvents: function (element, obj) {
            var events = {};
            for (var z in obj) {
                events[z] = xtag.addEvent(element, z, obj[z]);
            }
            return events;
        },

        /**
         * @name: removeEvent
         */
        removeEvent: function (element, type, event) {
            event = event || type;
            event.onRemove.call(element, event, event.listener);
            xtag.removePseudos(element, event._pseudos);
            event._attach.forEach(function (obj) {
                xtag.removeEvent(element, obj);
            });
            element.removeEventListener(event.type, event.stack);
        },

        /**
         * @name: removeEvents
         */
        removeEvents: function (element, obj) {
            for (var z in obj) xtag.removeEvent(element, obj[z]);
        },

        /**
         * @name: fireEvent
         */
        fireEvent: function _fireEvent(element, type, options) {
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

    if (typeof define === 'function' && define.amd) define(xtag);
    else if (typeof module !== 'undefined' && module.exports) module.exports = xtag;
    else win.xtag = xtag;

    doc.addEventListener('WebComponentsReady', function () {
        xtag.fireEvent(doc.body, 'DOMComponentsLoaded');
    });

})();
