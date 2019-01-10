/** ____________________ X-TAG COMPONENTS ____________________ **/
/** ____________________
 * @message: 
 * - This document is commented all the way through if you would like to find a method or object try pressing
 * - `control + f`, if your on windows and doing a search for the name of the method or object, ect you need or want to 
 * - modify.  
 * -
 * - Comments written on this page will be provided as often as possible, please see the github wiki for more info on
 * - x-components.js and its commenting system. ___
 * 
 * Copyright 2018,
 * Licencse MIT 
 * 
 * 
 * @THANKS TO EVERY ONE WHO HAS CONTRIBUTED CODE TO THE CORE OF THIS OPEN SOURCE PROJECT.
____________________ **/
(function () {
    /** ____________________
     * @note Methods and variables for tabbox
     * ** @name rules
     * ** @name _elements
     * ** @name _observers
    ____________________ **/
    var rules = {},
        _observers = {

        },
        _elements = {

        };

    // Dashing gets assigned a new value when a new instance of dashboard is called.
    var Dashing = function dashboardReadyFalse() { return { msg: "Dashboard not ready.", status: false }; };

    /** ____________________
     * @name sheet
     * **
     * **
     * ** @note sheet is appended to the head and is a required object
     * ** @note Enhancement. You can move this into the dashboard objects contructor function
     * ** -- so that it can be built with the rest of the application, and so that you can check to see
     * ** -- if a style element is already provided for the page in the document. ___
    ____________________ ** */
    var ApplicationInlineStyleElement = document.getElementById("_ApplicationInlineStyleElement_") || false,
        sheet = null;
    if (ApplicationInlineStyleElement === false) {
        sheet = document.head.appendChild(document.createElement('style')).sheet;
    }
    else {
        sheet = ApplicationInlineStyleElement.sheet
    }

    /** ____________________
     *  @name setTop
     * ** @param {any}
    ____________________ **/
    function setTop(modal) { modal.style.top = (window.pageYOffset + window.innerHeight * 0.5) + 'px'; }

    /** ____________________
     * @name insertOverlay
     * @param {any} modal
    ____________________ **/
    function insertOverlay(modal) {
        var next = modal.nextElementSibling;
        if (next) { modal.parentNode.insertBefore(modal.overlayElement, next); }
        else { modal.parentNode.appendChild(modal.overlayElement) }
    }

    /** ____________________
     * @name Conditions
    ____________________ **/
    class Conditions {
        constructor(conditionals, args, optionals) {
            var keys = Object.keys(conditionals || {});

            // Check for optionals parameter
            var _readyName = false,
                _setter = false,
                _getter = false;

            if (optionals) {
                _readyName = optionals.readyName || "ready",
                _setter = optionals.set,
                _getter = optionals.get;
            }

            this.cased = {};
            this.keys = args;

            var bool = optionals ? {
                accessor: {
                    get: _getter,
                    set: _setter
                },
                detail: {
                    allready: false,
                    falseCount: 0,
                    trueCount: 0,
                    count: 0
                },
                name: _readyName
            } : {
                    allready: false,
                    falseCount: 0,
                    trueCount: 0,
                    count: 0
                };
            // Set A Dashing ReadyBoolean
            this.ReadyBoolean = Conditions.ReadyBooleanConstructor(bool, this, true);

            // Loop through arg keys to retrieve conditions;
            for (var i = 0; i < this.keys.length; i++) {
                this.casing = false;
                this.currentCondition = this.keys[i];
                this.case = conditionals[this.keys[i]];
                this.cased[this.keys[i]] = conditionals[this.keys[i]];

                this.cased[this.keys[i]].formContexts = document.getElementById(this.keys[i]) || document.querySelector("form[data-page-form='" + this.keys[i] + "']") || Dashing.rootElement;
 
            }

            this.casing = "complete";
            this.currentCondition = null;
            // Merge conditionals
            Dashing.conditioned ? xtag.merge(Dashing.conditioned, this.cased) : Dashing.conditioned = this.cased;

            // Loop through conditional keys looking for cases
            for (var z = 0; z < keys.length; z++) {
                var _psd = null,
                    mpsd = null;

                // Push cases and @cases to their definitions
                if (/^case/.test(keys[z]) === true || /^\@case/.test(keys[z]) === true) {

                    _psd = keys[z].match(/\(.+\)$/gi);
                    mpsd = _psd[0].replace(/[\(\)]/g, "").match(/[^\=]+/gi);

                    // Attach case to the condition
                    conditionals[keys[i]][mpsd[1]] ? true :
                        Conditions.add(mpsd[1], Dashing.conditioned[mpsd[0]], conditionals[keys[z]]);

                    Dashing.conditioned[mpsd[0]][mpsd[1]].formContexts = document.getElementById(mpsd[0]) || document.querySelector("form[data-page-form='" + mpsd[0] + "']") || Dashing.rootElement;

                }

                // Push as global if @case is present
                if (/^\@case/.test(keys[z]) === true) {

                    _psd = keys[z].match(/\(.+\)$/gi);
                    mpsd = _psd[0].replace(/[\(\)]/g, "").match(/[^\=]+/gi);

                    Dashing.conditioned.cases = Dashing.conditioned.cases === undefined ? {} : Dashing.conditioned.cases;
                    Dashing.conditioned.cases[keys[z]] = Dashing.conditioned.cases[keys[z]] === undefined ? conditionals[keys[z]] : Dashing.conditioned.cases[keys[z]];

                    conditionals[keys[0]].formContexts = document.getElementById(mpsd[0]) || document.querySelector("form[data-page-form='" + mpsd[0] + "']") || Dashing.rootElement;
                }
            }
        }
        static MixinDetail(detail, mixin, updateScopeDetail, updateScopeMixins, updateScopeAll) {

            // get detail keys
            var _merged = xtag.merge(detail, mixin),
                keys = Object.keys(_merged),
                mxnkeys = Object.keys(mixin),
                dtlkeys = Object.keys(detail);

            // update scope detail if parameter present
            if (typeof updateScopeDetail === "object" || typeof updateScopeDetail === "function") {

                // loop through detail keys
                for (var i = 0; i < dtlkeys.length; i++) {
                    updateScopeDetail[keys[i]] = detail[keys[i]];
                }

            }

            // update scope mixin if parameter present
            if (typeof updateScopeMixins === "object" || typeof updateScopeMixins === "function") {
                // loop through mixin keys
                for (var i = 0; i < mxnkeys.length; i++) { updateScopeMixins[keys[i]] = mixin[keys[i]]; }
            }

            // update scope all if parameter present
            if (typeof updateScopeAll === "object" || typeof updateScopeAll === "function") {

                // loop through all merged keys
                for (var i = 0; i < keys.length; i++) {

                    updateScopeAll[keys[i]] = _merged[keys[i]];

                }

            }

            return _merged;
        }
        static ConditionDetail(detail, updateScope, mixins) {

            // get detail keys
            var keys = Object.keys(detail),
                detailed = detail;

            // check for detail mixins
            if (typeof mixins === "object") { detailed = Conditions.MixinDetail(detail, mixins); }

            // check if updateScope is an object or function
            if (typeof updateScope === "string" || typeof updateScope === "function") {
                // update the `updateScope` parameter
                var _merged = xtag.merge(detailed, { length: 0, status: null, allready: false });
                Dashing[updateScope] = detailed; 
            }

            return detailed;
        }
        static ReadyBooleanConstructor(ReadyCondition, scope, scopedTo) {

            var _ReadyCondition, _l, _tc, _fc, _a;
            if (ReadyCondition.detail) {
                _ReadyCondition = ReadyCondition.detail;
                _a = _ReadyCondition.allready;
                _l = _ReadyCondition.count;
                _fc = _ReadyCondition.falseCount;
                _tc = _ReadyCondition.trueCount;
            }
            else {
                _a = ReadyCondition.allready;
                _l = ReadyCondition.count;
                _fc = ReadyCondition.falseCount;
                _tc = ReadyCondition.trueCount;
            }

            (scope || this).allready = _a;
            (scope || this).count = _l;
            (scope || this).falseCount = _fc;
            (scope || this).trueCount = _tc;

            if (scopedTo === true) { typeof Dashing.ReadyBoolean === "object" ? Dashing.ReadyBoolean.length++ : Dashing.ReadyBoolean = ReadyCondition; }
            else if (typeof scopedTo === "string") { scope[scopedTo].ReadyBoolean = ReadyCondition; }
            else if (scopedTo === undefined) { Dashing.ReadyBoolean = ReadyCondition; }

            // Check to see if a condition name is present
            // if present create a setter/getter and attach
            // it to the scope.
            if (ReadyCondition.accessor) {
                Object.defineProperty(scope, ReadyCondition.name, ReadyCondition.accessor);
            }

            return true;
        }    
        static add(_case, _cond, _def) {
            // Add key words passed as cases here.
            switch (_case) {
                case "startCase":
                    _cond.startCase = _cond;
                    return _def;
                case "finishCase":
                    _cond.finishCase = _cond;
                    return _def;
                default:
                    _cond.caseKeys === undefined ? (
                        _cond.caseKeys = [],
                        _cond.caseKeys.push(_case),
                        _cond[_case] = _def) : _cond.caseKeys.toString().match(_case) ? true : _cond.caseKeys.push(_case), _cond[_case] = _def;
                    return _def;
            }
        }
        set case(conditioner) {

            if (conditioner === undefined) { throw "Error: Please, define a condition definition for, " + this.currentCondition; }

            this.casing = conditioner;

            Object.defineProperties(conditioner.prototype, {
                error: {
                    value: function ConditionError(message, e, cond, def) {
                        def(message, e, cond);
                        return `<strong class="error error-box error-text">${message}</strong>`;
                    }
                },
                success: {
                    value: function CondtionSuccess(ev, def) {
                        var keys = def.caseKeys,
                            msg = {},
                            allready = 0;
                        // Loop through condition cases
                        for (var i = 0; i < keys.length; i++) {

                            var msgs = def[keys[i]](ev, def, def[keys[i]]);

                            msgs.allready === true ?
                                (
                                    msg[i] = msgs,
                                    allready++
                                ) : msg[i] = msgs;

                        }
                        // set parent allready
                        if (allready === keys.length) { msg.allready = true; }
                        else { msg.allready = false; }

                        return msg;

                    }
                }
            });

        }
        set detail(dtl) {
            Dashing[dtl.name] = dtl.value;
            if (dtl.mixin) { Conditions.ConditionDetail(dtl.value, Dashing[dtl.name], dtl.mixin); }
        }
    }

    /** ____________________ 
     * @name dashboard 
     * ____________________ **/
    (function dashio() {
        function dashboard(dashed) {
            Dashing = this;

            var appHeader = document.head,
                importLinks = appHeader.querySelectorAll("link[rel='x-import']"),
                keys = Object.keys(dashed),
                protokeys = [];

            // set xtags dependency namespace
            this.xtags = dashed.xtags;

            // set the html elements namespace
            this.HTMLElement = typeof dashed.HTMLElement === undefined ? false : dashed.HTMLElement;

            // set the namespace components
            this.namespaces = dashed.namespaces;

            // set the rootElement
            this.rootElement = document.querySelector(dashed.rootElement) || document.querySelector("x-extension");

            // Set added properties
            protokeys = Dashing.setAddedProps(dashed);

            // Check for prototyped keys
            Dashing.fireProps(dashed, keys, protokeys);

            // Init the onStart callback
            dashed.onStart === undefined ? null : dashed.onStart(dashboard.prototype);

            // Add a model that checks for the header for browser info.
            Dashing.add({
                type: "model",
                model: {
                    name: "ReadyModel",
                    navigator: new Dashing.BrowserInfo(),
                    imports: importLinks,
                    protokeys: protokeys,
                    details: {
                        status: null,
                        errorCount: 0,
                        succesCount: 0,
                        active: null,
                        ModelReady: false
                    },
                    'conditions(BrowserModel)': {
                        BrowserModel: function BrowserReadyModel(e, _this) {

                            var _allready = false,
                                _checked = {},
                                _message = _this.prototype.success(e, _this);

                            _this.prototype.error(_message, e, _this, function BrowserModelError() {
                                /* If Browser Model return allready = false */
                            });

                            _checked.allready = _allready;

                            return _checked;
                        },
                        'case(BrowserModel=BrowserLinkCase)': function BrowserLinkCase(model, _this) {

                            var navi = model.navigator,
                                readyBool = Dashing.ReadyModel,
                                _allready = {
                                    allready: false
                                };

                            readyBool.status = {
                                allready: false,
                                linkReady: null
                            };
                            var _ready = 0;
                            for (var i = 0; i < model.imports.length; i++) {
                                var _link = model.imports[i];
                                // Keep track of this condition and more exceptions as needed to 
                                    // make sure it remains compat with the current hack => [<link>.__doc] in browsers that allow it.
                                if (/Chrome/.test(navi)) {
                                    readyBool.status.linkReady = false;
                                }
                                else {
                                    readyBool.status.linkReady = true;
                                    _ready++;
                                }
                            }
                            if (_ready === model.imports.length) { _allready.allready = true; }
                            return _allready;
                        },
                        'case(BrowserModel=PlatformCase)': function DevicePlatformCase(e, def) {
                            var _allready = {
                                allready: false
                            };
                            var doc = Dashing.writer.draw({ target: document.body, name: "selection-prompt" }, {
                                parent: {
                                    values: JSON.parse(`["None Selected", "Desktop", "Laptop", "Tablet", "Mobile"]`),
                                    message: `<strong>What type of device are you on?</strong>`,
                                },
                                child: {}
                            });

                            return _allready;
                        }
                    }
                }
            });

            // Check to see if the model ready boolean is ready and fire callback events
            if (Dashing.ReadyModelBoolean && Dashing.ReadyModelBoolean.requests === true) {
                // Enhacement: XHR model enhancement
            }

            // Build Components
            var elem = this.build(dashed.namespaces, dashed),
                z = 0;
            // Register Elements with x-tags if x-tag = true
            if (dashed.xtags === true) {
                // Register the componensts using xtag's registration method. 
                for (var name in elem) {
                    xtag.register(dashed.namespaces[z], elem[name]);
                    z++;
                }
            }
            else {
                // enhancement: dynamic custom elements  
            }
        }

        /** @name dashboard prototype */
        Object.defineProperties(dashboard.prototype, {
            bounded: {
                set: function setBounding(elem) {
                    cssWriter.media.clientBounds = {
                        top: elem.getBoundingClientRect().top,
                        left: elem.getBoundingClientRect().left,
                        bottom: elem.getBoundingClientRect().bottom,
                        right: elem.getBoundingClientRect().right,
                        width: elem.getBoundingClientRect().width,
                        height: elem.getBoundingClientRect().height
                    };
                },
                get: function getBounding(elem) {

                },
                enumerable: true,
                configurable: true
            },
            add: {
                value: function add(opts) {

                    switch (opts.type) {

                        case "prototype":
                            if (dashboard.prototype[opts.name]) {
                                console.error("Error: The prototype, " + opts.name + " is already present.");
                                break;
                            }
                            else { dashboard.prototype[opts.name] = opts.value; }

                            break;

                        case "event":

                            var _events = {}, keyed = Object.keys(opts.value);
                            for (var i = 0; i < keyed.length; i++) {

                                keyed[i] !== "target" ? _events[keyed[i]] = opts.value[keyed[i]] : false;

                            }

                            if (opts.name === "window") {

                                Dashing.on(window, _events);

                                break;

                            }

                            Dashing.on(document.querySelector(opts.name), _events);

                            break;

                        case "mixin":

                            xtag.mixins[opts.name] = opts.value;

                            break;

                        case "psuedo":

                            xtag.pseudos[opts.name] = opts.value;

                            break;

                        case "template":

                            for (var i = 0; i < opts.keys.length; i++) {

                                dashboard.prototype.writer.templater(opts.keys[i], opts[opts.keys[i]]);

                            }

                            break;
                        case "model":
                            // Fire model prop keys
                            var keysFired = Dashing.fireProps(opts.model, Object.keys(opts.model), opts.model.protokeys);
                            // Create an object on the Dashing object for the ModelReady boolean object
                            Dashing[opts.model.name] = {};
                            // Create a mixin detail and merge it with the ready model object
                            Dashing.conditions.MixinDetail(opts.model.details, {}, Dashing[opts.model.name]);
                            // Init conditions ready boolean check
                            var _BrowserModelSuccess = Dashing.conditioned.BrowserModel(opts.model, Dashing.conditioned.BrowserModel);

                            break;
                        case "link":
                            var xhr = new XMLHttpRequest();

                            xhr.open("GET", opts.url, true);

                            xhr.onload = opts.load || function XhrModelLoadSuccess() { return true; };
                            xhr.onerror = opts.error || function XhrModelError(e) { console[("error" || "log")]("XhrModel Error: " + e); };
                            break;

                    }

                    return true;

                }
            },
            setAddedProps: {
                value: function SetAddProps(dashed) {
                    var keys = Object.keys(dashed),
                        protokeys = [];

                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i],
                            props = {};

                        // Check to see if the key is an add property
                        if (/^add/.test(key) === true) {
                            props = {
                                type: key.match(/\w+(?=\=)/g) ? key.match(/\w+(?=\=)/g)[0] : false,
                                name: key.match(/[^\=]+(?=\))/g) ? key.match(/[^\=]+(?=\))/g)[0] : false,
                                value: dashed[key]
                            };
                            props.type === "prototype" ? protokeys.push(props.name) : false;
                            Dashing.add(props);
                        }

                    }

                    return protokeys;
                }

            }, 
            fireProps: {
                value: function FireProp(dashed, keys, protokeys) {
                    var keyed = [];
                    for (var i = 0; i < keys.length; i++) {
                        var _key = keys[i],
                            _nameprop = _key.match(/^\w+(?=\()/g);

                        if (_nameprop && _nameprop[0] && _nameprop[0] !== "add") {
                            protokeys.forEach(function checkProtoKeys(item, index) {
                                _nameprop = _nameprop ? _nameprop : false;
                                if (_nameprop[0] === item) {
                                    var args = _key.match(/[^=\(]+(?=\))/g)[0];
                                    new Dashing[_nameprop[0]](dashed[_key], args.match(/[^\,]+/g));
                                    keyed.push(_key);
                                }
                            });
                        }
                    }
                    return keyed;
                }
            },
            xtags: {
                // DEV IDEA: mixin filtering versus mixin assigning?
                set: function xtagREADY(val) {
                    if (val === true) {
                        xtag.merge(Dashing, this.xtags);
                    }
                    else {
                        this.on = function events(elem, opts) {
                            var keyed = Object.keys(opts);
                            for (var i = 0; i < keyed.length; i++) { elem.addEventListener(keyed[i], opts[keyed[i]]); }
                        };
                    }
                },
                get: function getXtag() {
                    return {
                        on: xtag.addEvents,
                    }
                }
            },
            isDataAttr: {
                value: function IsDataAttribute(_node, _attr, _setattr) {
                    var _dat = _node.hasAttribute("data-" + _attr),
                        _att = _node.hasAttribute(_attr),
                        _response = false,
                        _attrtype = null;

                    // find the data attribute if present
                    _attrtype = _dat === true ? (_response = _node.getAttribute("data-" + _attr), "data-" + _attr) : _att === true ? (_response = _node.getAttribute(_attr), _attr) : false;

                    // check if _setattr is defined
                    _setattr !== undefined ? _node.setAttribute(_attrtype, _setattr) : false

                    return _response;
                }
            },
            BrowserInfo: {
                value: function BrowserData(appNavReady) {
                    var browmtc = navigator.userAgent.match(/Firefox|OPR|Edge|Chrome/g),
                        oldiOS = /OS [1-4]_\d like Mac OS X/i.test(navigator.userAgent),
                        oldDroid = /Android 2.\d.+AppleWebKit/.test(navigator.userAgent),
                        gingerbread = /Android 2\.3.+AppleWebKit/.test(navigator.userAgent);

                    this.browser = browmtc ? browmtc[0] : "Error: The browser you're using couldn't be found.";
                    this.oldiOS = oldiOS;
                    this.oldDroid = oldDroid;
                    this["android_v2-3"] = gingerbread;
                }
            },
            writeJSON: {
                value: function WriteJSON(type, data) {
                    var typekeys = Object.keys(type),
                        datakeys = Object.keys(data);
                    if (!this.templates[type.type]) { throw "Error Draw(type.type): The type of JSON you want to write doesn't exist."; }

                    var templating = xtag.createFragment(`<template></template>`),
                        _keyrootinput = document.createElement("input");

                    _keyrootinput.setAttribute("json-root", type.keyName);
                    _keyrootinput.setAttribute("data-colspan", "1 2");
                    _keyrootinput.setAttribute("data-row", "1");
                    _keyrootinput.type = "text";
                    _keyrootinput.value = type.keyName;
                    _keyrootinput.className = type.keyRootClass;

                    type.keyClassName = "text-centered item-title";
                    type.valueClassName = "text-centered item-title";

                    templating = this.writer.draw({ name: type.type, target: templating }, { parent: data, child: type });

                    templating.appendChild(_keyrootinput);

                    return templating;
                }
            },
            write: {
                value: function Writer(msg, target, frag) {
                    var _frag = frag(msg);
                    target.appendChild(_frag);
                    return _frag;
                }
            },
            writer: {
                value: {
                    templated: {
                        "json-grid-div": function DivGrid(data, attrs) {
                            var keys = Object.keys(data),
                                _id = attrs.id ? "id='" + attrs.id + "'" : "",
                                _class = attrs.className ? "class='" + attrs.className + "'" : "",
                                _cols = attrs.colspan ? "data-colspan='" + attrs.colspan + "'" : "",
                                _rows = attrs.rows ? "data-row='" + attrs.rows + "'" : "",
                                _valueclassname = attrs.keyClassName,
                                _keyclassname = attrs.valueClassName;

                            var divnode = xtag.createFragment(`<div data-grid-template="2" ${_id} ${_class} ${_cols} ${_rows}></div>`);

                            for (var c = 0; c < keys.length; c++) {
                                var keyinput = document.createElement("input"),
                                    valueinput = document.createElement("input");

                                keyinput.type = "text";
                                keyinput.value = keys[c];
                                keyinput.className = _keyclassname;
                                keyinput.setAttribute("json-key", keys[c]);
                                keyinput.setAttribute("data-colspan", "1");
                                keyinput.setAttribute("data-row", `${c + 2}`);

                                divnode.firstElementChild.appendChild(keyinput);

                                valueinput.type = "text";
                                valueinput.value = data[keys[c]];
                                valueinput.className = _valueclassname;
                                valueinput.setAttribute("json-value", data[keys[c]]);
                                valueinput.setAttribute("data-colspan", "2");
                                valueinput.setAttribute("data-row", `${c + 2}`);

                                divnode.firstElementChild.appendChild(valueinput);

                            }

                            return divnode;
                        },
                        length: 0
                    },
                    templater: function templater(named, templatee) {
                        dashboard.prototype.writer.templated.length++;
                        dashboard.prototype.writer.templated[named] = templatee;
                    },
                    draw: function draw(type, attrs, frags, hasTypeCallback) {
                        var _frag = this.templated[type.name](attrs.parent, attrs.child).firstElementChild;

                        // check for hasTypeCallback parameter callback must be named [not anonymouse] [Needs Implementation]
                        if (typeof hasTypeCallback === "object") { this[type.name] = hasTypeCallback; }

                        // check for template callback that accompanies the template type
                        if (this[type.name] && typeof this[type.name].creator === "function") { this[type.name].creator(_frag, attrs.parent.data || Dashing.rootElement.jsonSchema || {}); }
                        if (this[type.name] && typeof this[type.name].events === "object") { Dashing.on(type.target, this[type.name].events); }

                        frags ? _frag.firstElementChild.appendChild(frags) : null;

                        // append node to type target root
                        type.target.appendChild(_frag);

                        return _frag;

                    }
                }
            },
            getObjectKeys: {
                value: function getObjectKeys(keys, obj, excludes) {

                    if (keys === "*") {
                        var _keys = Object.keys(obj),
                            _rex = {};

                        for (var c = 0; c < excludes.length; c++) {
                            for (var k = 0; k < _keys.length; k++) {
                                if (_keys[k] !== excludes[c]) {
                                    _rex[_keys[k]] = obj[_keys[k]];
                                }
                            }
                        }
                        return _rex;
                    }

                    var r = {};
                    for (var i = 0; i < keys.length; i++) { r[keys[i]] = obj[keys[i]]; }
                    return r;
                },
                configurable: false,
                enumerable: false,
                writable: false
            },
            build: {
                value: function _build(nm, def) {
                    var mxn = def.mixin,
                        lc = def.lifecycle,
                        acc = def.accessors,
                        e = def.events,
                        _proto_ = def.prototype,
                        comps = function elems() { }

                    // loop through namespaces
                    for (var i = 0; i < nm.length; i++) {
                        // Parse name space to camel case
                        var nms = nm[i].replace(/\-\w/g, function (stg) {
                            var r = stg.toUpperCase();
                            return r[1];
                        });
                        comps[nms] = {};
                    }

                    comps = def.components(comps, sheet, this, def);
                    return comps;
                }
            },
            templates: {
                get: function getTemplate(name) {
                    return dashboard.prototype.writer.templated || false;
                },
                enumerable: true,
                configurable: true
            },
            fnQuery: {
                value: function _fnQuery(qeury, fn) {
                    var qy = document.querySelector(qeury);
                    return fn(qy);
                }
            },
            createAccessor: {
                value: function createAccessor(selector) {
                    return {
                        get: function () {
                            return xtag.queryChildren(this, selector)[0];
                        }
                    };
                }
            },
            platform: {
                set: function SetPlatform(Platform) {
                    this.theme ? true : this.theme = {};
                    this.theme.platform = Platform;
                    // Enhancement: create a theme class with getters and setters for platform and other properties
                },
                get: function GetPlatform() {
                    return this.theme.platform || false;
                }
            }
        });

        /** @name Add templates */
        dashboard.prototype.add({
            type: "template",
            keys: ["create-tools", "json-table", "resize-controller", "pointer-opts", "zoom-opts", "modal-form", "magi-screen", "magi-plugin", "magi-console", "selection-prompt"],
            "create-tools": function CreateModal(ev, _modaled) {
                var stdocs = xtag.createFragment(function CreateModal() {/* 
                                 <x-book id="create-modal" class="modal modal-menu create-modal" data-modal-prompt="true" data-modal="true" data-page-form="true" active>
                                    <x-page id="create-modal" class="create-modal" page-transition="slide-left" selected active>
                                        <header class="container">
                                            <strong class="block">Project Magi</strong>
                                        </header>
                                        <section class="container">
                                            <ol class="block">
                                                <li><button>Photo Album</button></li>
                                                <li><button>Cartoon Reel</button></li>
                                            </ol>
                                        </section>
                                        <footer class="container">
                                        </footer>
                                    </x-page>
                                </x-book>
                            */});
                return stdocs;
            },
            "pointer-opts": function PointerModal(ev, _modaled) {
                var rdocs = xtag.createFragment(function PointerModal() {/*
                                 <x-book id="pointer-modal" class="pointer-modal" data-modal-prompt="true" data-modal="true" data-page-form="true" active>
                                     <x-page id="pointer-page" class="pointer-modal" page-transition="slide-right" selected active>
                                        <header class="container">
                                            <strong class="block">Pointers</strong>
                                        </header>
                                        <section class="container">
                                            <ol class="block">
                                                <li><button></button></li>
                                            </ol>
                                        </section>
                                        <footer class="container">
                                        </footer>
                                    </x-page>
                                </x-book>
                            */});
                return rdocs
            },
            "zoom-opts": function ZoomModal(ev, _modaled) {
                var hdoc = xtag.createFragment(function helptoolsShiftbox() {/*
                             <x-shiftbox id="zoom-modal" class="zoom-modal" data-modal-prompt="true" data-modal="true">
                                    <section>
                                        <strong class="block menu-title">Help and Faqs</strong>
                                        <button data-shift="up">Navigation</button>
                                        <button data-shift="down">Users's Manual</button>
                                        <button data-shift="right">Community</button>
                                    </section>
                                    <aside shift="up">
                                        <strong class="block"></strong>
                                    </aside>
                                    <aside shift="down">
                                        <strong class="block">User's Manual</strong>
                                    </aside>
                                    <aside shift="right">
                                        <strong>Community</strong>
                                    </aside>
                                </x-shiftbox>
                            */});
                return hdoc;
            },
            "modal-form": function ModalForm(drawing, form) {

                drawing.clickHide = drawing.clickHide === true ? "click-hide" : "";
                drawing.id = drawing.id ? "id='" + drawing.id + "'" : "";
                drawing.className = drawing.className ? "class='" + drawing.className + "'" : "";
                drawing.type = drawing.type ? "type='" + drawing.type + "'" : "";
                drawing.overlay = drawing.overlay === true ? "overlay=''" : "";
                drawing.modal = drawing.modal ? "data-modal='" + drawing.modal + "'" : "";
                drawing.theme = drawing.theme ? "theme='" + drawing.theme + "'" : "";
                drawing.focus = drawing.focus ? "data-focus='" + drawing.focus + "'" : "";
                drawing.dataGridTemplate = drawing.dataGridTemplate ? "data-grid-template='" + drawing.dataGridTemplate + "'" : "";

                form.id = form.id ? "id='" + form.id + "'" : "";
                form.className = form.className ? "class='" + form.className + "'" : "";
                form.name = form.name ? "name='" + form.name + "'" : "";
                form.dataGridTemplate = form.dataGridTemplate ? "data-grid-template='" + form.dataGridTemplate + "'" : "";
                form.fieldsetId = form.fieldsetId ? "id='" + form.fieldsetId + "'" : "";
                form.fieldsetClassName = form.fieldsetClassName ? "class='" + form.fieldsetClassName + "'" : "";
                form.fieldsetGridTemplate = form.fieldsetGridTemplate ? "data-grid-template='" + form.fieldsetGridTemplate + "'" : "";
                form.fieldsetLegend = form.fieldsetLegend ? "<legend>" + form.fieldsetLegend + "</legend>" : "";

                var modalform = xtag.createFragment(`
                    <x-modal ${drawing.id} ${drawing.className} ${drawing.type} ${drawing.modal} ${drawing.clickHide} ${drawing.overlay} ${drawing.theme} ${drawing.dataGridTemplate} ${drawing.focus}>
                        <form ${form.id} ${form.name} ${form.className} ${form.dataGridTemplate} method="post">
                            <fieldset ${form.fieldsetId} ${form.fieldsetClassName} ${form.fieldsetGridTemplate}>
                                ${form.fieldsetLegend}
                                ${form.fieldsetMsg}
                            </fieldset>
                        </form>
                    </x-modal>
                `);

                return modalform;

            },
            "magi-screen": function MagiScreen(ev, _items) {
                var magifrag = xtag.createFragment(function CreateModal() {/* 
                                     <x-modal id="dashed-prompt" class="prompt" type="startup" overlay="" click-hide="">
                                        <!-- == MENU == -->
                                        <menu id="startup-modalmenu" class="modal-menu">
                                            <img src="images/pio-characters/pio-face-01.svg" width="auto" height="50px" style="background-color: aliceblue; border-radius:50%;" />
                                            <h5 class="lite-text" data-sequence-messages="startup"
                                                data-meta="header-messages">
                                                <span>The Magi...</span>
                                            </h5>
                                            <aside class="lite-text">
                                                <h5>Lives on with you...</h5>
                                                <h5>Pass knowledge forward...</h5>
                                            </aside>
                                        </menu>
                                        <!-- == FORM BOOK == -->
                                        <x-book id="dashed_startscreenBook" class="lite-text" type="formbook">
                                            <!-- == USER FORM == -->
                                            <x-page class="modalBookPage" page-transition="slide-left" active="">
                                                <header>
                                                    <h5 class="lite-text">Your Magi Set Up</h5>
                                                </header>
                                                <section>
                                                    <form id="startscreen-form" class="co-form dark-text" action="lib/php/setup.php" method="POST" target="_blank">
                                                        <label class="block">
                                                            <span>Magi Alias</span>
                                                            <input type="text" class="dark-text" id="magialias" placeholder="Alias" />
                                                        </label>
                                                        <input type="button" id="createuser-request" value="Create User" />
                                                    </form>
                                                </section>
                                            </x-page>
                                        </x-book>
                                    </x-modal>
                            */});
                return magifrag;
            },
            "magi-manager": function MagiPlugin(ev, _items) {
                return xtag.createFragment(`<x-modal id="plugin-modal" class="modal modal-plugin">
                                                <x-page id="magi-plugin-page" class="page page-plugin" page-transition="slide-right" selected active>
                                                    <header id="magi-plugin-header" class="span span-left">
                                                        <strong id="magi-plugin-title" class="block"></strong>
                                                    </header>
                                                    <section id="magi-plugin-section" class="span span-right"></section>
                                                </x-page>
                                            </x-modal>`);
            },
            "magi-console": function MagiConsole(ev, _items) {
                var mcon = xtag.createFragment(function helptoolsShiftbox() {/*
                             <x-console id="magi-console" class="console console-magi">
                                <form id="magi-console-form" class="memory">
                                    <input type="hidden" name="console-active" value="false" />
                                </form>
                             </x-console>
                            */});
                return mcon;
            },
            "x-tabbox": function XTabbox(box, parts) {
                var frag = `<x-tabbox ${box.tabPosition} ${box.className} ${box.id}>
                        <menu ${parts.menu.className} ${box.menu.id}>${parts.menu.buttons}</menu>
                        <ul  ${parts.tabs.id} ${parts.tabs.className}>
                            ${parts.tabs.boxes()}
                        </ul>
                    </x-tabbox>`;
                return xtag.createFragment(frag);
            },
            "resize-controller": function resizeController(menu, items) {
                var fragstg = `<svg><svg>`;
            },
            "theme-selector": function ThemeSelector(theme, templates) {
                var _name = theme.name ? "name='" + theme.name + "'" : "name='table-theme'",
                    _colspan = theme.colspan ? "name='" + theme.colspan + "'" : "",
                    _row = theme.row ? "name='" + theme.row + "'" : "";

                var frag = `<select ${_name} ${_colspan} ${_row}></select>`;

                return xtag.createFragment(frag);

            },
            "json-table": function JsonTable(table, data) {
                var menutray = table.menuTray ? "data-menu-tray='" + table.menuTray + "'" : "",
                    _id = table.id ? "id='" + table.id + "'" : "",
                    _class = table.className ? "class='" + table.className + "'" : "",
                    _tableGrid = table.gridTemplate ? "data-grid-template ='" + table.gridTemplate + "'" : "",
                    _gridCol = table.gridCols ? "data-columns='" + table.gridCols + "'" : "",
                    _gridRow = table.gridRows ? "data-rows='" + table.gridRows + "'" : "",
                    _fmGrid = table.formGridTemplate ? "data-grid-template='" + table.formGridTemplate + "'" : "",
                    _fmGridSpan = table.formGridSpan ? "data-colspan='" + table.formGridSpan + "'" : "",
                    _fieldsetGridCols = table.fieldsetGridSpan ? "data-colspan='" + table.fieldsetGridSpan + "'" : "",
                    _btnGridCols = table.buttonGridSpan ? "data-colspan='" + table.buttonGridSpan  + "'" : "",
                    _fmGridRow = table.formGridRow ? "data-row='" + table.formGridRow + "'" : "",
                    _href = table.href ? "data-href='" + table.href + "'" : "",
                    _buttonRow = table.buttonGridRow ? "data-row='" + table.buttonGridRow + "'" : "",
                    _fieldsetRow = table.fieldsetRow ? "data-row='" + table.fieldsetRow + "'" : "",
                    _keycolwidth = table.keyColWidth ? "grid-key-width='" + table.keyColWidth + "'" : "",
                    _themeSel = table.themeSelector ? "theme-selector='" + table.themeSelector + "'" : "",
                    _selTheme = table.selectableThemes ? "selectable-themes='" + table.selectableThemes + "'" : "",
                    _cellMenuSpan = table.cellMenuSpan ? "cell-menu-span='" + table.cellMenuSpan + "'" : "",
                    _cellMenuRow = table.cellMenuRow ? "cell-menu-row='" + table.cellMenuRow + "'" : "",
                    _submitValue = table.submitValue ? table.submitValue : "",
                    _message = table.message ? table.message : "";

                var frag = `<x-table type="json" theme="default-JsonSchema" ${_cellMenuSpan} ${_cellMenuRow} ${_id} ${_class} ${menutray} ${_id} ${_tableGrid} ${_gridCol} ${_gridRow} ${_href} ${_themeSel} ${_selTheme}>
                    <form data-table="true" ${_fmGridRow} ${_keycolwidth} ${_fmGrid}>
                        <fieldset ${_fieldsetGridCols} ${_fieldsetRow}>
                            <legend>${data.headertitle || "<p>Welcome to your reporting station.</p>"}</legend>
                            ${_message||`<p>Welcome!</p>`}
                            <button type="button" data-icon="gh" value="GH Login" name="gh-signin">
                                <svg width="25px" height="25px">
                                    <use xlink:href="#github" />
                                </svg>
                                <strong>GH Login</strong>
                            </button>
                        </fieldset>
                        <button type="button" data-icon="print" data-modal="topQuickbar" data-event="true" name="print-json" value="${_submitValue}" ${_btnGridCols} ${_buttonRow}>
                            <svg width="25px" height="25px">
                                <use xlink:href="#print"></use></svg>
                            <strong>${_submitValue}</strong>
                        </button>
                    </form>
                </x-table>`;

                return xtag.createFragment(frag);
            },
            "selection-prompt": function SelectionPrompt(_prompt, selection) {
                var _opts = typeof _prompt.values === "undefined" ? '' : JSON.stringify(_prompt.values),
                    _msg = typeof _prompt.message === "undefined" ? "" : _prompt.message; 
                return xtag.createFragment(`<x-modal modal-index="${document.getElementsByTagName("x-modal").length+1}" type="selection" data-focus="true" overlay="" click-hide="" data-options='${_opts}' theme="single-column" data-grid-template="1">
                    <section class="text-warning"><p>${_msg}</p></section>
                </x-modal>`);
            }
        });

        /** Application Template Code Below. */
        var modaled = dashboard.prototype.modaled = {}
        Dashing = new dashboard({
            namespaces: ["x-extension", "x-book", "x-page", "x-table", "x-header", "x-footer", "x-shiftbox", "x-tabbox", "x-modal"],
            xtags: true,
            onStart: function startDashedApp(protos) {
                Dashing.ReadyBoolean = {};
                Dashing.DBReadyBoolean = {};
                Dashing.LocalDB = {};

                // Modalio Prototype
                if (protos.modalio) {
                    var modalio = dashboard.prototype.modalio.prototype;

                    Object.defineProperties(modaled, {
                        length: {
                            value: 0,
                            writable: true
                        },
                        active: {
                            value: false,
                            writable: true
                        }
                    });

                    Object.defineProperties(modalio, {
                        open: {
                            set: function opening(ev) {
                                var _ptemp = ev.target.getAttribute("data-modal-template"),
                                    mname = ev.target.getAttribute("data-modal"),
                                    _modaled = Dashing.modaled[mname],
                                    _temp = null,
                                    _id = null;
                                
                                if (/^\#/g.test(_ptemp) === true && _modaled.preloaded === true) {
                                    _temp = document.getElementById(_ptemp.replace("#", ""));
                                    _id = _temp.lastChild.id;
                                }
                                else {
                                    _temp = Dashing.templates[_ptemp]().cloneNode(true).lastChild;
                                    _id = _temp.lastChild.id;
                                }

                                _modaled.lastActive = _modaled.lastActive ? _modaled.lastActive : "started";
                                
                                if (_modaled.lastActive === "started") {
                                    _modaled.active = _temp;
                                    _modaled.lastActive = null;
                                    _modaled.lastPressed = null;
                                    ev.target.setAttribute("data-event-active", "true");
                                    ev.target.setAttribute("data-modal-active", "true");

                                    _modaled.active.setAttribute("data-focus", "true");
                                }
                                else {
                                    _modaled.active = _modaled.active ? (_temp.id === _modaled.active.id ? _modaled.active : _temp) : _temp;
                                    ev.target.setAttribute("data-event-active", "true");
                                    ev.target.setAttribute("data-modal-active", "true");
                                    _modaled.lastPressed.setAttribute("data-event-active", "false");

                                    _modaled.active.setAttribute("data-focus", "true");
                                    if (_modaled.preloaded === true) { _modaled.lastActive.setAttribute("data-focus", "false"); }
                                    else { _modaled.lastActive.parentNode.removeChild(_modaled.lastActive); }
                                }
                            },
                            get: function getopener() { return this.opener; },
                            configurable: true,
                            enumerable: true
                        },
                        close: {
                            set: function closing(ev) {
                                var mname = ev.scope.getAttribute("data-modal"),
                                    app = Dashing.modaled[mname];

                                app.active.parentNode.removeChild(app.active);

                                app.lastActive = app.active;
                                app.active = false;
                                ev.target.setAttribute("active", "false");
                                ev.target.setAttribute("data-event-active", "false");
                                ev.target.setAttribute("data-modal-active", "false");
                            },
                            get: function getcloser() {
                                return this.closer;
                            },
                            configurable: true,
                            enumerable: true
                        },
                        reset: {
                            value: function reset(ev, modaler) {
                                modaler.active = false;
                                modaler.lastActive = null;
                                ev.target.setAttribute("active", "false");
                                ev.target.setAttribute("data-event-active", "false");
                                ev.target.setAttribute("data-modal-active", "false");
                            }
                        },
                        conditions: {
                            set: function conditioning(conditioner) {
                                this.interaction = conditioner;

                            },
                            configurable: true,
                            enumerable: true

                        },
                        ready: {
                            set: function readied(conditions) {
                                var cks = Object.keys(conditions),
                                    isNotReady = { length: 0 };
                                for (var c = 0; c < cks.length; c++) {
                                    conditions[cks[c]] === true ? "" : (isNotReady[cks[c]] = false, isNotReady.length++);
                                }
                                isNotReady.length === cks.length ? this.readied = false :
                                    isNotReady.length < cks.length ? this.readied = { error: "Incomplete", incomplete: isNotReady } :
                                        this.ready = true;
                            },
                            get: function isReadied() {
                                return this.readied;
                            },
                            configurable: true,
                            enumerable: true
                        },
                        interject: {
                            value: function _interject(modaler) {
                                modaler.prompt.firstChild.id = modaler.id;
                                modaler.prompt.firstChild.name = (modaler.name || "default").replace(/\s+/g, "_");
                                modaled[modaler.id].prompt = modaler.prompt;

                                this.id = modaler.id;
                                this.name = modaler.name;
                                this.create = function () { console.log(modaler.prompt.cloneNode(true)); return modaler.prompt.cloneNode(true); };

                            }
                        }
                    });
                }
                else { false; }

                // Carouselio Constructor
                if (protos.carouselio) {

                    Object.defineProperties(protos.carouselio.prototype, {
                        "container": {
                            set: function setcontainer(containerval) {

                                this.ride = containerval;
                                this.keyframe = {
                                    name: containerval.getAttribute("data-carousel") || containerval.id,
                                    interval: Number(containerval.getAttribute("data-interval")) || 5000
                                };

                            },
                            enumerable: true,
                            configurable: true
                        },
                        "items": {
                            set: function setitems(itemsval) { this.seats = itemsval; },
                            enumerable: true,
                            configurable: true
                        },
                        "hourglass": {
                            set: function sethourglass(changeval) { this.change = changeval; },
                            enumerable: true,
                            configurable: true
                        },
                        "start": {
                            set: function startCarousel(rider) {
                                this.index = 1;
                                carousel.lastSeatedAt = 1;
                                this.carouselSeatedAt = this.carouselSeatedAt ? this.carouselSeatedAt : (Number(rider.ride.getAttribute("data-start-carousel")) || 1);

                                // carousel interval key
                                this.carouselInterval = window.setInterval(function _hourglass() {
                                    if (rider.seatedAt < rider.seats.length) {
                                        rider.seatedAt = "+";
                                    }
                                    else if (rider.seatedAt === rider.seats.length) {
                                        rider.lastSeatedAt = rider.carouselSeatedAt;
                                        rider.carouselSeatedAt = 1;
                                    }
                                    rider.seats[rider.lastSeatedAt - 1].setAttribute("class", "item");
                                    rider.seats[rider.seatedAt - 1].setAttribute("class", "item active");
                                    rider.indicators[rider.lastSeatedAt - 1].removeAttribute("class");
                                    rider.indicators[rider.seatedAt - 1].setAttribute("class", "active");
                                }, this.keyframe.interval);
                            },
                            enumerable: true,
                            configurable: true
                        },
                        "stop": {
                            set: function stopCarousel(rider) {
                                window.clearInterval(rider.carouselInterval);
                            },
                            enumerable: true,
                            configurable: true
                        },
                        "goto": {
                            set: function _goto(index) {
                                carousel.seats[carousel.seatedAt - 1].setAttribute("class", "item");
                                carousel.seats[index - 1].setAttribute("class", "item active");

                                carousel.indicators[carousel.seatedAt - 1].removeAttribute("class");
                                carousel.indicators[index - 1].setAttribute("class", "active");

                                carousel.lastSeatedAt = carousel.seatedAt;
                                carousel.carouselSeatedAt = index;
                            },
                            enumerable: true,
                            configurable: true
                        },
                        "next": {
                            set: function nextitem(rider) {
                                if (rider.seatedAt < rider.seats.length) {
                                    rider.seatedAt = "+";
                                    rider.seats[rider.lastSeatedAt - 1].setAttribute("class", "item");
                                    rider.seats[rider.seatedAt - 1].setAttribute("class", "item active");
                                    rider.indicators[rider.lastSeatedAt - 1].removeAttribute("class");
                                    rider.indicators[rider.seatedAt - 1].setAttribute("class", "active");
                                }
                                else if (rider.seatedAt === rider.seats.length) {
                                    rider.lastSeatedAt = rider.carouselSeatedAt;
                                    rider.carouselSeatedAt = 1;
                                    rider.seats[rider.lastSeatedAt - 1].setAttribute("class", "item");
                                    rider.seats[rider.seatedAt - 1].setAttribute("class", "item active");
                                    rider.indicators[rider.lastSeatedAt - 1].removeAttribute("class");
                                    rider.indicators[rider.seatedAt - 1].setAttribute("class", "active");
                                }
                            },
                            enumerable: true,
                            configurable: true
                        },
                        "previous": {
                            set: function previousitem(rider) {

                                if (rider.seatedAt > 1) {
                                    rider.seatedAt = "-";
                                    rider.seats[rider.lastSeatedAt - 1].setAttribute("class", "item");
                                    rider.seats[rider.seatedAt - 1].setAttribute("class", "item active");
                                    rider.indicators[rider.lastSeatedAt - 1].removeAttribute("class");
                                    rider.indicators[rider.seatedAt - 1].setAttribute("class", "active");
                                }
                                else if (rider.seatedAt === 1) {
                                    rider.lastSeatedAt = rider.carouselSeatedAt;
                                    rider.carouselSeatedAt = rider.seats.length;
                                    rider.seats[rider.lastSeatedAt - 1].setAttribute("class", "item");
                                    rider.seats[rider.seatedAt - 1].setAttribute("class", "item active");
                                    rider.indicators[rider.lastSeatedAt - 1].removeAttribute("class");
                                    rider.indicators[rider.seatedAt - 1].setAttribute("class", "active");
                                }

                            },
                            enumerable: true,
                            configurable: true
                        },
                        "seatedAt": {
                            set: function seatedDelta(directionBoolean) {

                                this.lastSeatedAt = this.carouselSeatedAt;

                                if (directionBoolean === "-") {
                                    this.carouselSeatedAt--;
                                }
                                else if (directionBoolean === "+") {
                                    this.carouselSeatedAt++;
                                }
                                else { null; }

                            },
                            get: function seatedPosition() {
                                return this.carouselSeatedAt;
                            },
                            enumerable: true,
                            configurable: true
                        },
                        "add": {
                            value: function adding(type, name, definer) {

                                switch (type) {
                                    case "control":
                                        break;
                                    case "image":
                                        break;
                                    case "project":
                                        break;
                                    case "keyframe":
                                        break;
                                    default:
                                        break;
                                }

                            }
                        }
                    });

                }
                else { false; }

                return true;
            },
            "add(prototype=modalio)": function Modalio(modaler) {
                var _modaled = modaled[modaler.id] ? modaled[modaler.id] : (modaled.length++ , modaled[modaler.id] = this);

                this.appendOverlay = modaler.appendOverlay === undefined ? true : modaler.appendOverlay;
                this.overlay = modaler.overlay === undefined ? document.body : modaler.overlay;

                this.opener = modaler.opener === undefined ? function openee() { return true; } : modaler.opener;
                this.closer = modaler.closer === undefined ? function closee() { return true; } : modaler.closer;
                this.errorer = modaler.errorer === undefined ? function errory() { return true; } : modaler.errorer;
                this.conditions = modaler.conditions === undefined ? false : modaler.conditions;

                this.active = modaler.startTab !== undefined ? document.querySelector(modaler.startTab.getAttribute("data-modal-template")) : false;
                this.lastActive = false;
                this.lastPressed = modaler.startTab !== undefined ? modaler.startTab : false;
                this.xtags = modaler.xtags === undefined ? false : modaler.xtags;
                this.tabbox = modaler.tabbox === undefined ? false : modaler.tabbox;
                this.allowForceClose = modaler.allowForceClose === undefined ? true : modaler.allowForceClose;
                this.innerFired = modaler.innerFired === undefined ? false : modaler.innerFired;
                this.preloaded = modaler.preloaded === undefined ? false : modaler.preloaded;

                modaler.prompt === undefined ? this.prompt = false :
                    modaler.prompt === false ? this.prompt = false : this.promptFragment = new this.interject(modaler);

                this.id = modaler.id || null;
                this.name = modaler.name || null;

                if (modaler.startTab) {
                    this.active = document.getElementById(modaler.startTab.getAttribute("data-modal-template").replace("#", ""));
                    this.lastPressed = modaler.startTab;
                    this.lastActive = this.active;
                }

                // FOR LOOP 
                for (var z = 0; z < modaler.firedOn.length; z++) {
                    var _doc = document.getElementById(modaler.firedOn[z]);
                    Dashing.on(_doc, {
                        "click": function opening(ev) {
                            var _modaled = Dashing.modaled[this.getAttribute("data-modal")];

                            // Check to make sure the innerFired attribute is set.
                            if (ev.target.id !== this.id && _modaled.innerFired === false) { return true; }
                            else if (ev.target.id !== this.id && _modaled.innerFired === true) { ev.target = this; }

                            var _ptemp = this.getAttribute("data-modal-template"),
                                _temp = null,
                                _id = null;

                            // Check for DOM target in the data-modal-template attribute
                            if (/^\#/g.test(_ptemp) === true && _modaled.preloaded === true) {
                                _temp = document.getElementById(_ptemp.replace("#", ""));
                                _id = _temp.id;
                            }
                            else {
                                _temp = Dashing.templates[_ptemp]().cloneNode(true);
                                _id = _temp.lastChild.id;
                            }

                            // TABBOX ROUTINE
                            if (_modaled.tabbox === false) {
                                if (_modaled.active === false) {
                                    if (this.getAttribute("data-modal-active") === "true" && this.getAttribute("data-event-active") === "false") {
                                        _modaled.lastActive.setAttribute("data-focused", "false");
                                        _modaled.lastPressed.setAttribute("data-event-active", "false");

                                        _modaled.active = document.getElementById(_temp.id);
                                        _modaled.lastActive = _modaled.active;
                                        _modaled.lastPressed = this;

                                        _modaled.active.setAttribute("data-focus", "true");

                                        this.setAttribute("active", "true");
                                        this.setAttribute("data-event-active", "true");
                                        this.setAttribute("data-modal-active", "true");

                                        return true;
                                    }

                                    _modaled.active = _temp;
                                    // _modaled.overlay.appendChild(_modaled.active);
                                    _modaled.active = document.getElementById(_id);
                                    _modaled.active.setAttribute("data-focus", "true");

                                    _modaled.lastActive = _modaled.active;
                                    _modaled.lastPressed = this;

                                    this.setAttribute("active", "true");
                                    this.setAttribute("data-event-active", "true");
                                    this.setAttribute("data-modal-active", "true");

                                    _modaled.opener(ev);

                                }
                                else {
                                    // Check to make sure the active isn't false while the modal is up in tabbox mode.
                                    if (_modaled.active !== false && this.getAttribute("data-modal-active") === "true") {
                                        _modaled.lastActive.setAttribute("data-focus", "false");
                                        try {
                                            _modaled.active = document.getElementById(_temp.lastChild.id);
                                            _modaled.active.setAttribute("data-focus", "true");
                                        }
                                        catch (e) {
                                            _modaled.active = false;
                                            _modaled.lastPressed.click();
                                            return false;
                                        }

                                        _modaled.lastPressed.setAttribute("data-event-active", "false");

                                        this.setAttribute("active", "true");
                                        this.setAttribute("data-event-active", "true");
                                        this.setAttribute("data-modal-active", "true");

                                        _modaled.lastPressed = this;
                                        _modaled.lastActive = _modaled.active;

                                        _modaled.opener(ev);

                                        return true;
                                    }

                                    _modaled.active = _temp.lastChild;

                                    _modaled.lastActive.setAttribute("data-focus", "false");
                                    _modaled.lastPressed.setAttribute("active", "false");
                                    _modaled.lastPressed.setAttribute("data-event-active", "false");

                                    _modaled.active = _temp.lastChild;
                                    _modaled.overlay.appendChild(_modaled.active);
                                    _modaled.active = document.getElementById(_id);
                                    _modaled.active.setAttribute("data-focus", "true");

                                    _modaled.lastActive = _modaled.active;
                                    _modaled.lastPressed = this;

                                    this.setAttribute("active", "true");
                                    this.setAttribute("data-event-active", "true");
                                    this.setAttribute("data-modal-active", "true");

                                }
                                return true;
                            }

                            _modaled.lastActive === null ? _modaled.lastActive = _modaled.active : null;
                            _modaled.innerFired === true ? ev = { target: this } : false;

                            // DEFAULT ROUTINE.
                            if (_modaled.active === false && this.hasAttribute("data-event") === true) {
                                _modaled.open = ev;
                                // To Do: Conditioners.

                                var _modaltemplateid = _modaled.active.lastChild.id;

                                var returnedNode = null;
                                _modaled.appendOverlay === true ?
                                    (
                                        _modaled.overlay.appendChild(_modaled.active, _modaled.overlay)
                                    ) :
                                    (
                                        returnedNode = _modaled.overlay.parentNode.replaceChild(_modaled.active, _modaled.overlay)
                                    );

                                var modaltemplate = _modaled.open === false ? false : _modaled.open(ev, _modaled);
                                _modaled.lastPressed = this;
                                _modaled.layer = document.getElementById(_modaltemplateid);

                            }
                            else if (_modaled.active !== false && this.id !== _modaled.lastPressed.id && this.hasAttribute("data-event") === true) {
                                _modaled.open = ev;
                                // To Do: opener returns and conditioners.

                                var __modaltemplateid = _modaled.active.lastChild.id;
                                if (_modaled.preloaded === true) {
                                    var _modaltemplate = _modaled.opener ? false : _modaled.opener(ev, _modaled);
                                    _modaled.lastPressed = this;
                                    _modaled.layer = document.getElementById(__modaltemplateid);

                                    _modaled.lastActive = _modaled.active;

                                    return true;
                                }

                                var returnedNode = null;
                                _modaled.appendOverlay === true ?
                                    (_modaled.overlay.appendChild(_modaled.active)) :
                                    (returnedNode = _modaled.overlay.parentNode.replaceChild(_modaled.active, _modaled.overlay));

                                var _modaltemplate = _modaled.open === false ? false : _modaled.open(ev, _modaled);
                                _modaled.lastPressed = this;
                                _modaled.layer = document.getElementById(__modaltemplateid);
                                _modaled.lastActive = _modaled.active;

                            }
                        },
                        "dblclick": function closing(ev) {
                            var _modaled = Dashing.modaled[this.getAttribute("data-modal")];

                            if (_modaled.active === null) { return false; }
                            if (_modaled.active.type === "startup" || _modaled.active.type === "selection") { return false; }
                            // If force close isn't allow return modal error.
                            if (_modaled.allowForceClose === false) { return _modaled.errorer; }

                            // make sure code doen't execute unless the modal tabbox is open.
                            if (this.getAttribute("data-event-active") === "false") { return false; }

                            // check to see if the event target needs to be adjusted as per the innerFired property
                            if (ev.target.hasAttribute("data-event") === false && _modaled.innerFired === false) { return true; }
                            else if (ev.target.hasAttribute("data-event") === true && _modaled.innerFired === true) { ev = { target: this }; }

                            _modaled.close = ev;

                            var modaltemplate = _modaled.close(ev, _modaled);
                            if (_modaled.tabbox === false) { return true; }

                            _modaled.lastActive = false;
                            _modaled.lastPressed = this;
                            _modaled.active = false;
                        }
                    });
                }
            },
            "add(prototype=carouselio)": function Carouselio(timerOptions) {

                this.container = timerOptions.container;
                this.items = timerOptions.items;
                this.indicators = timerOptions.trackers;
                this.controls = timerOptions.controls;
                this.hourglass = timerOptions.change;
                this.start = this;

                this.controls.stop.addEventListener("mouseup", function StopControls() { carousel.stop = carousel; });
                this.controls.start.addEventListener("mouseup", function StartControls() { carousel.start = carousel; });
                this.controls.previous.addEventListener("mouseup", function PreviousControls() { carousel.previous = carousel; });
                this.controls.next.addEventListener("mouseup", function NextControls() { carousel.next = carousel; });
                this.controls.indicator.addEventListener("mouseup", function ControlIndicators(ev) { if (ev.target.hasAttribute("data-target")) { carousel.goto = Number(ev.target.getAttribute("data-slide-to")); } });

            },
            "add(prototype=conditions)": Conditions,
            // @add prototype @name pioDB
            "add(prototype=pioDB)": class PioIndexedDB extends Conditions {
                constructor(data, conditions, args) {
                    var _accessor = data.accessor,
                        name = data.name || Dashing.rootElement.jsonSchema.meta.name || "PioDashed",
                        alias = data.alias || Dashing.rootElement.jsonSchema.meta.name || "PioDashed";
                    super(conditions, args, _accessor);
                    this.cycles = {};

                    this._data = function DataConstructor(opts) {
                        /* Enhancement: Needs Update Constructor */            
                    };

                    Dashing.pio = this;
                    var _name = null,
                        _version = null,
                        _message = PioIndexedDB.InitDBConditions(this);
                    if (_message.allready === true) {
                        if (data.init === true) {
                            this.init = data.name || Dashing.rootElement.jsonSchema.meta.name || "PioDashed";
                            this.data = Dashing.rootElement.jsonSchema;
                            if (data.dbopen === false) { _interface = this.upgrade(dbname, Dashing.rootElement.jsonSchema.meta.version, data.upgrade); }
                            else { this.upgrade(Dashing.pio.db, {alias: alias, dbname: name}, data.upgrade); }
                        }
                        else if (typeof data.update === "object") {
                            this.data = Dashing.rootElement.jsonSchema;
                            _interface = this.upgrade(name, 1, data.upgrade);
                        }
                        else if (typeof data.update === "function") {
                            // Enhancement: Allow the update behavior to call a constructor to pass the data
                        }
                        this.init = true;
                    }
                }
                // @name InitDBConditions
                static InitDBConditions(_this) {
                    var _messages = { allready: false },
                        _trueCount = 0;
                    for (var i = 0; i < _this.keys.length; i++) {
                        _messages[_this.keys[i]] = _this.cased[_this.keys[i]]({}, _this.cased[_this.keys[i]]);
                        _messages[_this.keys[i]].allready !== false ? _trueCount++ : false;
                    }
                    _trueCount === _this.keys.length ? _messages.allready = true : false;
                    return _messages;
                }
                static query(name, query) {
                    var _dbq = window.indexedDB.open(name || "PioDashed");
     
                    _dbq.onsuccess = function QueryOpenSuccess(e) {
                        try {
                            var _dbqs = e.target.result,
                                storage = null,
                                _key = query.key;
                            // create an transaction object store.
                            storage = _dbqs.transaction(query.store, "readwrite").objectStore(query.store);
                            query.onfound(e);
                        }
                        catch (e) {
                            query.onerror(e);
                            return {allready:false, message: `Error: Stores not upgraded for, ${name}`};
                        }
                            var _reqg = storage.get(_key);
                            // Create query system that enables a callback event that either initiates a new db upgrade or not depending on what is present.
                            _reqg.onsuccess = query.success ? function QuerySuccess(e, fn) {
                                Dashing.DBReadyBoolean.queried ? Dashing.DBReadyBoolean.queried.push(query.store + "." + query.key) : false;
                                Dashing.DBReadyBoolean.currentQuery = _reqg.result || false;
                                if (query.update === true) {
                                    var data = e.target.result;
                                    data = query.value;
                                    var _put = storage.put(data, query.key);
                                    _put.onsuccess = function PutSuccess(e) { 
                                        /* Enhancement needed. */
                                        Dashing.DBReadyBoolean.currentQuery = _reqg.result || false;
                                    };
                                    _put.onerror = function PutSuccess(e) { /* Enhancement needed. */ };
                                }
                                query.success(e);
                                Dashing.pioDB.pio.init = lc;
                                return true;
                            } :
                                function QuerySuccess(e) {
                                    Dashing.DBReadyBoolean.initCheck = _reqg.result || false;
                                    Dashing.DBReadyBoolean.currentQuery = _reqg.result || false;
                                    if (query.update === true) {
                                        var data = e.target.result;
                                        data = query.value;
                                        var _put = storage.put(data, query.key);
                                        _put.onsuccess = function PutSuccess(e) { 
                                            /* Enhancement needed. */
                                            Dashing.DBReadyBoolean.initiated = true;
                                        };
                                        _put.onerror = function PutSuccess(e) { /* Enhancement needed. */ };
                                    }
                                    Dashing.rootElement.jsonSchema.meta.version += 1;
                                    return true;
                            };
                            _reqg.onerror = query.success ? function QueryError(e, fn) {
                                Dashing.DBReadyBoolean.initCheck = _reqg.result || false;
                                query.error(e);
                                Dashing.pioDB.pio.init = lc;
                                return false;
                            } :
                                function QueryError(e) {
                                    Dashing.DBReadyBoolean.initCheck = _reqg.result || false;
                                    Dashing.rootElement.jsonSchema.meta.version += 1;
                                    return false;
                                };
                    };

                    return _dbq;

                }
                static queryAll(name, queries) {
                    // Needs Enhancement
                    for (var i = 0; i < query.keys.length; i++) {
                        var _key = keys[i],
                            _req = _dbq.get(query._key);
                    }
                }
                set data(info) {
                    this._data.version = this._data.version ? this._data.version + 1 : Dashing.rootElement.jsonSchema;
                    if (typeof info === "string") {
                        this._data.value = info;
                    }
                    else if (typeof info === "object") {
                        var data = Dashing.getObjectKeys(info.keys, info);
                        xtag.merge(this._data.prototype, data);
                        this._data.dataKeys = info.keys;
                    }
                    else if (typeof info === "object" && info.length) {
                        for (var i = 0; i < info.length; i++) {
                            this._data[i.toString()] = info[i];
                        }
                    }
                    else { throw "Error [Data type not accepted]: For more advance data options refer to the documentation."; }
                }
                get data() {
                    if (this._data.value) { return this._data.value; }
                    else { return Dashing.getObjectKeys(this._data.dataKeys, this._data); }
                }
                set init(name) {
                    if (name === false) {
                        Dashing.DBReadyBoolean.init = "error";
                        Dashing.DBReadyBoolean.status = "failed";
                    }
                    else if (name === true) {
                        Dashing.DBReadyBoolean.init = "awaiting";
                        Dashing.DBReadyBoolean.status = "completed";
                    }
                    else {
                        Dashing.DBReadyBoolean.dbname = name;
                        Dashing.DBReadyBoolean.init = name;
                        Dashing.DBReadyBoolean.status = "initiating";
                    }
                }
                get init() { return this.cycles[Dashing.DBReadyBoolean.init]; }
                open(name, opts) {
                    var _pio = window.indexedDB.open(name||"PioDashed");
                        /*  */ 
                }
                upgrade(db, version, upgrade) {
                    if (typeof db === "string") {
                        // var _piup = window.indexedDB.open(db, version + 1);
                        console.log(Dashing.pio.db);
                    }
                    else {
                        try {
                            Dashing.DBReadyBoolean.alias = version.alias;
                            console.log(Dashing.DBReadyBoolean);
                            db.onupgradeneeded = function PioSyncUpgrade(e) { upgrade(e); };
                        }
                        catch (e) { console.error(e); }
                    }
                }
            },
            "modalio(topQuickbar)": {
                id: "topQuickbar",
                name: "top-Quickbar",
                firedOn: ["toggle-setup"],
                innerFired: true,
                overlay: document.body,
                appendOverlay: false,
                preloaded: true,
                startTab: document.querySelector("#toggle-setup"),
                tabbox: false,
                conditions: ["StartupFormConditions"],
                allowForceClose: true,
                xtags: true,
                opener: function open(ev) {
                    var _md = Dashing.modaled[ev.target.getAttribute("data-modal")];
                    _md.active.toggle();
                },
                closer: function Closer(e) {
                    var targetButton = null;
                    if (e.target.nodeName === "BUTTON") { targetButton = e.target; }
                    else if (e.detail && e.detail.button && e.detail.button.nodeName === "BUTTON") { targetButton = e.detail.button; }
                    else if (e.target.previousElementSibling.nodeName === "BUTTON") { targetButton = e.target.previousElementSibling; }
                    else { targetButton = e.target; }
                    var _md = Dashing.modaled[targetButton.getAttribute("data-modal")],
                        _it = document.querySelector("x-modal[type='startup']").querySelectorAll("aside.error") || [];

                    for (var i = 0; i < _it.length; i++) {
                        if (_it && _it[i]) {
                            _it[i].parentNode.removeAttribute("style");
                            _it[i].parentNode.removeChild(_it[i]);
                        }
                    }

                },
                errorer: function errorer(message) {
                    return "Error: " + message;
                }
            },
            "conditions(StartupFormConditions)": {
                "case(StartupFormConditions=checkPrivacy)": function CheckPrivacy(ev, def, _this) {
                    var fct = _this.formContexts,
                        ict = fct.querySelector("input[name='privacy-confirmation']");

                    var _checked = {},
                        _allready = false;

                    if (ict.checked === false) {
                        _checked[ict.id] = "Please read the, 'Privacy' agreement.";
                        _allready = false;
                    }
                    else {
                        _checked[ict.id] = true;
                        _allready = true;
                    }

                    _checked.allready = _allready;

                    return _checked;
                },
                "case(StartupFormConditions=checkTermsOfUse)": function CheckTermsOfUse(ev, _super, _this) {
                    var fct = _this.formContexts,
                        ict = fct.querySelector("input[name='termsofuse-confirmation']");

                    var _checked = {},
                        _allready = false;

                    if (ict.checked === false) {
                        _checked[ict.id] = "Please read the, 'Terms of Use' agreement.";
                    }
                    else {
                        _checked[ict.id] = true;
                        _allready =true;
                    }

                    _checked.allready = _allready;

                    return _checked;
                },
                "case(StartupFormConditions=defaultAlias)": function DefaultAlias(e, _super, _this) {
                    var fct = _this.formContexts,
                        itt = fct.querySelector("input[type='text'][name='user-name']"),
                        _allready = false,
                        _checked = {};

                    // Check for the database name value
                    if (itt.value === "" && !itt.value) {
                        itt.value = "Magi";
                        _checked[itt.id] = "<strong>A user alias is needed, the default is provided.</strong>";
                        _allready = false;
                    }
                    else {
                        _checked[itt.id] = true;
                        _allready = true;
                    }

                    _checked.allready = _allready;

                    return _checked;
                },
                "case(StartupFormConditions=defaultDatabase)": function DefaultDatabase(e, _super, _this) {
                    var fct = _this.formContexts,
                        itt = fct.querySelector("input[type='text'][name='indexeddb-name']"),
                        _allready = false,
                        _checked = {};

                    // Check for the database name value
                    if (itt.value === "" && !itt.value) {
                        _checked[itt.id] = "<strong>A database name is needed, the default is provided.</strong>";
                        _allready = false;
                        itt.value = "PioDashed";
                    }
                    else {
                        _checked[itt.id] = true;
                        _allready = true;
                    }

                    _checked.allready = _allready;

                    return _checked;
                },
                "case(StartupFormConditions=platformTypeCase)": function PlatformTypeCase(e, _super, _this) {
                    var _allready = false,
                        _checked = { allready: false };

                    // Check for the platform property on the Dashing object.
                    if (Dashing.platform) {
                        _checked["0"] = true;
                        _allready = true;
                    } else {
                        var _selectionModal = document.querySelector("x-modal[type='selection']") || document;
                        var _selectables = _selectionModal.querySelector("select") || {};
                        _checked[_selectables.id] = `<strong class="warning-text">Please Select device platform option.</strong>`;
                        _checked.right = true;
                    }

                    _checked.allready = _allready;

                    return _checked;
                },
                StartupFormConditions: function StartupFormConditions(ev, def) {
                    var _message = null;
                    _message = def.prototype.success(ev, def);

                    _message.allready === true ? true :
                        def.prototype.error(_message, ev, def, function StartFormError(msg, ev, cc) {
                            var keys = Object.keys(msg);

                            // loop through msg keys
                            for (var i = 0; i < keys.length; i++) {
                                var doc = null;

                                if (Number(keys[i]).toString() !== "NaN" && keys[i] !== "allready") {
                                    StartFormError(msg[keys[i]], ev, cc);
                                }
                                else if (/^allready/gi.test(keys[i]) === false) {

                                    doc = document.getElementById(keys[i]);
                                    if (!doc) { break; }

                                    var docTarCheck = doc.parentNode.querySelector("aside");

                                    if (msg[keys[i]] === true && docTarCheck) {
                                        doc.parentNode.removeChild(docTarCheck);
                                        doc.parentNode.removeAttribute("style");
                                    }
                                    else if (msg[keys[i]] !== true && !docTarCheck) {
                                        doc.parentNode.style.borderBottom = "red dotted 2px";
                                        var _pos = "left:-100%; top: 0px;";
                                        if (msg.right) {
                                            _pos = "right:0%; top: 0px;";
                                        }
                                        else if (msg.top) {
                                            _pos = "top: 100%; left: 0px;";
                                        }
                                        else if (msg.bottom) {
                                            _pos = "bottom: 100%; left: 0px";
                                        }

                                        Dashing.write(msg[keys[i]], doc.parentNode, function ErrorFrag(msg) {
                                            var frag = xtag.createFragment(`<aside class="error error-prompt" style="position: relative; ${_pos} overflow: visible; border: red dashed 1px; background-color: aliceblue; padding: 5px 8px; border-radius: 8px;">
                                                        <strong class="error error-message"></strong>
                                                     </aside>`);
                                            frag.lastChild.querySelector("strong.error").innerHTML = msg;
                                            return frag.lastChild;
                                        });
                                    }
                                }

                            }
                        });
                    
                    return _message;
                }
            },
            "conditions(TextFilter,CharFilter,AudioFilter,SubmitFilter)": {
                CharFilter: function CharFilter(e, def) {

                    var inps = e.detail.inputs;
                    // Final Checks for form submission.

                },
                SubmitFilter: function SubmitFiltering(e, def) {

                    var inps = e.detail.inputs,
                        _message = { allready: false };

                    // Final Checks for form submission.

                    return _message;

                },
                TextFilter: function TextFiltering(e, def) {

                    var _checked = def.prototype.success(e, def);

                    return _checked;

                },
                AudioFilter: function AudioFiltering() {

                    var _message = { allready: false, falseCount: 0, trueCount: 0 }

                    return _message;

                },
                "case(CharFilter=LUND)": function LUNDExpression(e, cond, def) {

                    var _allready = { allready: false };

                    Dashing.InputReadyBoolean.totalcases++;

                    /[^\w\-]/i.test(e.charCode) === false ? (_allready.allready = true, Dashing.InputReadyBoolean.successCount++) : (_allready.allready = false, Dashing.InputReadyBoolean.errorCount++);

                    return _allready;

                },
                "case(TextFilter=LundValue)": function LundValue(e, cond, def) {

                    var _allready = { allready: false };

                    Dashing.InputReadyBoolean.totalcases++;

                    if (e.target.value === undefined) {
                        return { allready: false }
                    }
                    else if (e.target.value === "") {
                        return { allready: false }
                    }

                    /[^\w\-]+/gi.test(e.target.value) === false ? (
                        _allready.allready = true
                    ) : (
                            _allready.allready = false
                        );

                    return _allready;

                }
            },
            "conditions(modal-book,webapp)": {
                "case(modal-book=SchemaBind)": function SchemaBind(e, cond, def) {

                    var extension = e.target,
                        Ejsn = extension.jsonSchema,
                        devee = e.detail,
                        _checkedIndex = 0,
                        _allready = 0,
                        _ready = false,
                        _checked = {};

                    var detailing = Dashing.conditions.ConditionDetail({
                        name: devee.name,
                        pageset: devee.pageset,
                        conditions: devee.conditions,
                        pageform: devee.pageform,
                        multipage: devee.multipage,
                        startpage: devee.startpage,
                        totalcases: devee.totalcases++
                    }, Dashing.ReadyBoolean);

                    // Check the json schema to ensure it is not false
                    if (extension.schemes !== false) {

                        Dashing.conditions.prototype.detail = {
                            name: "DBReadyBoolean",
                            value: {
                                initiated: Ejsn.indexedDB,
                                successCount: 0,
                                errorCount: 0,
                                status: null
                            }
                        }

                        _checked.msg = "Successful";
                        _allready++;
                        _ready = true;
                        Dashing.ReadyBoolean.trueCount++;

                    }
                    else {

                        _checked.msg = "Checked the x-extension for the presence of a json schema, and none was found.";
                        Dashing.ReadyBoolean.falseCount++;
                        _ready = false;

                    }

                    _checked.allready = _ready;

                    return _checked;

                },
                "case(modal-book=IndexedDBBind)": function IndexedDBBind(e, cond, def) {

                    var _result = Dashing.DBReadyBoolean.currentQuery;
                    var extension = e.target,
                        Ejsn = extension.jsonSchema,
                        _initRequest = false,
                        _ready = { allready: false };

                    Ejsn.indexedDB = _result;

                    var devee = e.detail,
                        detailing = Dashing.conditions.ConditionDetail({
                            name: devee.name,
                            pageset: devee.pageset,
                            conditions: devee.conditions,
                            pageform: devee.pageform,
                            multipage: devee.multipage,
                            startpage: devee.startpage,
                            totalcases: devee.totalcases++
                        }, Dashing.ReadyBoolean);

                    // Check the jsonSchema's indexedDB to see if it's been updated and returns true.
                    Ejsn.indexedDB !== false ? (
                        _ready.allready = true,
                        Dashing.ReadyBoolean.trueCount++
                    ) : (
                            _ready.allready = false,
                            Dashing.ReadyBoolean.falseCount++
                        );

                    if (Dashing.DBReadyBoolean.initiated === true) { _ready.allready = true; }
                    return _ready;

                },
                "modal-book": function AppIsBinded(e, def) {
                    var _allready = { allready: false },
                        _checked = 0,
                        _dfpage = document.querySelectorAll("data-page-form"),
                        _gdpage = document.querySelectorAll("data-grid-template"),
                        _message = def.prototype.success(e, def);

                    _message.allready === true ? _allready.allready = true :
                        def.prototype.error = function AppBindError(e) {
                            console.log("Im an ERROR HEAD");
                        };


                    return _allready;

                },
                "webapp": function Webapp(e, def) {
                    return { allready: false };
                }
            },

            /** ____________________
            * @name keyframer
            ____________________ **/
            "add(mixin=Keyframer)": {
                methods: {
                    addRootFrame: function AddRootFrame(name, eventee, frames) {
                        // 
                    },
                    addFrame: function AddFrame(name, eventee, frames) {
                        // 
                    },
                    addFrameItem: function AddFrameItem(name, eventee, frames) {
                        // 
                    },
                    addFrameBackDrop: function AddFrameItem(name, eventee, frames) {
                        // 
                    },
                    addFrameCharacter: function AddFrameCharacter(name, eventee, frames) {
                        // 
                    },
                    addFrameText: function AddFrameText(name, eventee, frames) {
                        // 
                    },
                    addFrameCondition: function AddFramCondition() {
                        //
                    }
                },
                events: {
                    itemMoved: function ItemMoved(e) {
                        // 
                    }
                }
            },

            /** ____________________
             * @name typed 
             * type namespaces: [plugins, webapp, startup, prompt, json, display, cells]
             ____________________ **/
            "add(mixin=typed)": {
                methods: {
                    webapp: function DashioWebApp(ev, config) {
                        console.info("Info: Type enhancement needed for " + this.nodeName.toLowerCase() + "[type='webapp'].");
                    },
                    startup: function StartUp(e) {

                        var _md = Dashing.modaled[e.target.modal];
                        if (Dashing.DBReadyBoolean.initiated === true) {
                            e.target.toggle();
                            e.target.createJsonSchemaTable();
                            e.target.setAttribute("data-focus", "false");
                            _md.lastActive = this;
                            _md.lastPressed = document.querySelector("button[data-modal-template='#dashed-prompt']");
                            _md.lastPressed.setAttribute("data-event-active", "false");
                            _md.lastPressed.setAttribute("data-modal-active", "false");
                            _md.lastPressed.setAttribute("active", "false");
                        }
                        else {
                            // enhancement: allow for dynamic query targeting
                            _md.active = e.target;
                            _md.lastActive = false;
                            _md.lastPressed = document.querySelector("button[data-modal-template='#dashed-prompt']");
                                
                            this.xtag.lastParent = this.parentNode;
                        }
                        insertOverlay(e.target);

                    },
                    "modal-book": function ModalBook(e) {
                        var _this = e.target;
                        if (_this.parentNode.nodeName !== "X-MODAL") { throw "Error [Type Schema]: X-BOOK[TYPE='modal-book'] requires its parent node to be X-MODAL"; }
                        _this.xtag.plugin = {};
                        _this.xtag.plugin.errorPage = _this.querySelector("x-page[response-type='error']");
                        _this.xtag.plugin.loadPage = _this.parentNode.querySelector('x-page[response-type="load"]');
                        _this.xtag.plugin.progressPage = _this.querySelector("x-page[response-type='progressing']");

                    },
                    "modal-page": function ModalPage(e) {
                        if (_this.parentNode.nodeName !== "X-BOOK") { throw "Error [Type Schema]: X-PAGE[TYPE='modal-page'] requires its parent node to be X-BOOK"; }
                        this.xbook = this.parentnode;
                    },
                    plugins: function DashioPluginsType(e) {
                        console.info("Info: Type enhancement needed for " + this.nodeName.toLowerCase() + "[type='plugins'].");
                    },
                    prompt: function Prompt(ev) {

                        var _APP_DOMRoot = Dashing.rootElement,
                            transactionPreference = _APP_DOMRoot.userRequestServices("prompt", this, {

                                onConfirm: function dbconfirmation(e) {

                                    e.target.querySelector("form").submit();

                                },

                                onCancel: function dbcancellation(e) {

                                    console.log("cancelling");
                                    console.log(e.target);
                                    console.log(e.detail);

                                }
                            });

                    },
                    json: function JsonTableType(e) {
                        console.info("Info: Type enhancement needed for " + this.nodeName.toLowerCase() + "[type='json'].");
                    },
                    display: function Display(e) {
                        console.info("Info: Type enhancement needed for " + this.nodeName.toLowerCase() + "[type='display'].");
                    },
                    cells: function CellsTableType() {
                        console.info("Info: Type enhancement needed for " + this.nodeName.toLowerCase() + "[type='cells'].");
                    },
                    selection: function ModalSelectionPrompt() {
                        this.appendChild(this.writeOptions(JSON.parse(this.getAttribute("data-options")) || []));
                        this.submitEvent = this.submitEvent;
                    }
                },
                accessors: {
                    conditions: {
                        attribute: {
                            validate: function ValidateConditions(cond) {
                                console.log("HI cond val type");
                                Dashing.conditioned ? "" : "";
                                return cond;
                            }
                        },
                        set: function SetConditions(cond) {
                            // Enhancement for type condition callback events
                        },
                        get: function GetConditions() { var dbfile = Dashing.conditioned[this.type]; return dbfile; }
                    },
                    type: {
                        set: function SetType(def) {
                            this.typed === undefined ? this.typed = {} : true;
                            Dashing.on(this, def);
                            return Object.keys(def)[0];
                        },
                        get: function GetType() { return this.getAttribute("type") || false; }
                    }
                }
            },

            /** ____________________
             * @name themed
             ____________________ **/
            "add(mixin=themed)": {
                methods: {
                    "themeInit": function ThemeStart() {
                        // To determine if the application requires a theme to run.
                        console.info("Info: Theme init method needed for `themed` mixin.")
                    },
                    "single-column": function SingleColumn(e) {
                        Dashing.theme["single-column_" + this.id || xtag.uid()] = {
                            name: "single-column",
                            isGridTheme: e.detail.isGridTheme,
                            gridRows: Number(this.gridTemplate.match(/\d+$/g)[0]),
                            gridColumns: Number(this.gridTemplate.match(/^\d+/g)[0])
                        };
                        return true;
                    },
                    "body-panel": function BodyPanel(e) {

                        Dashing.theme["body-panel#" + this.id || xtag.uid()] = {
                            name: "body-panel",
                            isGridTheme: e.detail.isGridTheme,
                            gridRows: Number(this.gridTemplate.match(/\d+$/g)[0]),
                            gridColumns: Number(this.gridTemplate.match(/^\d+/g)[0])
                        };
                        return true;

                    },
                    "book-grid": function (e) {
                        Dashing.theme["book-grid_" + this.id || xtag.uid()] = {
                            name: "book-grid",
                            isGridTheme: e.detail.isGridTheme,
                            gridRows: Number(this.gridTemplate.match(/\d+$/g)[0]),
                            gridColumns: Number(this.gridTemplate.match(/^\d+/g)[0])
                        };
                    },
                    "dashboard-panels": function DashboardPanels(e) {
                        console.info("Info: Theme needed for " + this.nodeName.toLowerCase() + "[theme='dashobard-panels'].");
                    },
                    "default-JsonSchema": function DefaultJsonSchema(e) {

                        var target = e.currentTarget,
                            data = e.detail.data,
                            recurseIndex = e.detail.recurseIndex || false;

                        var plugins = data.plugins || {},
                            keys = plugins.keys || [],
                            _form = null;

                        // Check to see if recurseIndex parameter exists of type number
                        if (typeof recurseIndex === "number") {
                            target = e.detail.target;
                            _form = target;
                            plugins = e.detail.data || {};
                            keys = Object.keys(e.detail.data) || [];
                            recurseIndex === 0 ? recurseIndex = 1 : recurseIndex = recurseIndex * 2 + 1;

                        } else {
                            _form = target.querySelector("form[data-table='true']") || target;
                            recurseIndex = 0;
                        }

                        // Check to see if the JSON SCHEMA file has been successfully uploaded
                        if (data.indexedDB !== undefined) {

                            var _datas = Dashing.getObjectKeys("*", data.data, ["length"]),
                                _keys = Object.keys(_datas),
                                _keytitle = document.createElement("input"),
                                _indexDBNode = document.createElement("div"),
                                _indexDataKeyEntries = document.createElement("input"),
                                _indexDataValueEntries = document.createElement("input");

                            _indexDBNode.setAttribute("data-grid-template", "2");
                            _indexDBNode.setAttribute("data-colspan", "3 4");
                            _indexDBNode.setAttribute("data-row", "1 3");
                            _indexDBNode.className = "fill-150px overflow-auto";

                            _indexDataKeyEntries.setAttribute("data-row", "2");
                            _indexDataKeyEntries.setAttribute("data-colspan", "1");
                            _indexDataKeyEntries.setAttribute("json-key", "length");
                            _indexDataKeyEntries.className = "text-centered item-title";
                            _indexDataKeyEntries.type = "text";
                            _indexDataKeyEntries.value = "length";

                            _indexDataValueEntries.setAttribute("data-row", "2");
                            _indexDataValueEntries.setAttribute("data-colspan", "2");
                            _indexDataValueEntries.setAttribute("json-value", data.data.length);
                            _indexDataValueEntries.type = "text";
                            _indexDataValueEntries.className = "text-centered item-title";
                            _indexDataValueEntries.value = data.data.length;

                            _keytitle.type = "text";
                            _keytitle.className = "text-centered item-title";
                            _keytitle.setAttribute("data-colspan", "1 2");
                            _keytitle.setAttribute("data-row", "1");
                            _keytitle.setAttribute("json-root", "data");
                            _keytitle.disabled = true;
                            _keytitle.value = "IndexedDB Data";

                            for (var c = 0; c < data.data.length; c++) {
                                var inpdatakey = document.createElement("input"),
                                    inpdatavalue = document.createElement("input");

                                inpdatakey.className = "text-centered item-title json-key";
                                inpdatakey.type = "text";
                                inpdatavalue.type = "text";

                                inpdatakey.setAttribute("json-key", "true");
                                inpdatakey.setAttribute("data-colspan", "1");
                                inpdatakey.setAttribute("data-row", c + 3);

                                inpdatavalue.setAttribute("data-json-value", "true");
                                inpdatavalue.setAttribute("data-colspan", "2");
                                inpdatavalue.setAttribute("data-row", c + 3);
                                inpdatavalue.setAttribute("json-value", "true");
                                inpdatavalue.className = "text-centered item-title";

                                inpdatakey.value = _keys[c];
                                inpdatavalue.value = _datas[_keys[c]];

                                _indexDBNode.appendChild(_indexDataKeyEntries);
                                _indexDBNode.appendChild(inpdatakey);
                                _indexDBNode.appendChild(inpdatavalue);

                            }

                            _indexDBNode.appendChild(_keytitle);
                            _indexDBNode.appendChild(_indexDataValueEntries);
                            _form.appendChild(_indexDBNode);
                        }

                        var _templatesFrag = null;
                        // Check to see if the JSON SCHEMA contains templates
                        if (typeof data.templates === "object") {
                            _templatesFrag = Dashing.writeJSON({ type: "json-grid-div", keyRootClass: "text-centered item-title", keyName: "templates", colspan: "1 2", rows: "5", className: "json-panel", id: "templates-json" }, data.templates);
                            _form.appendChild(_templatesFrag);
                        }

                        var _themesFrag = null;
                        // Check to see if the JSON SCHEMA contains themes
                        if (typeof data.themes === "object") {
                            _themesFrag = Dashing.writeJSON({ type: "json-grid-div", keyRootClass: "text-centered item-title", keyName: "themes", colspan: "3 4", rows: "5", className: "json-panel", id: "themes-json" }, data.themes);
                            _form.appendChild(_themesFrag);
                        }

                        var _metasFrag = null;
                        // Check to see if the JSON SCHEMA contains themes
                        if (typeof data.meta === "object") {
                            _themesFrag = Dashing.writeJSON({ type: "json-grid-div", keyRootClass: "text-centered item-title", keyName: "meta", colspan: "5 6", rows: "5", className: "json-panel", id: "meta-json" }, data.meta);
                            _form.appendChild(_themesFrag);
                        }

                        // Loop through object data
                        for (var i = 0; i < keys.length; i++) {

                            var inppluginkey = document.createElement("input"),
                                inppluginvalue = document.createElement("input"),
                                keytitle = document.createElement("input"),
                                _pluginNode = document.createElement("div"),
                                key = keys[i],
                                _plugin = data[key];

                            _pluginNode.className = "plugin-gridpanel";
                            _pluginNode.setAttribute("data-grid-template", "2");
                            _pluginNode.setAttribute("data-colspan", (2 * i + 1).toString() + " " + (2 * i + 2).toString());
                            _pluginNode.setAttribute("data-row", "4");


                            inppluginkey.type = "text";

                            inppluginvalue.type = "text";

                            if (typeof data[key] === "object") {
                                keytitle.type = "text";
                                keytitle.value = key;
                                keytitle.className = "text-centered item-title";
                                keytitle.setAttribute("data-colspan", "1 2");
                                keytitle.setAttribute("data-row", "1");
                                keytitle.setAttribute("json-root", key);
                                _pluginNode.appendChild(keytitle);
                                e.detail.recurseIndex = i + 1;
                                e.detail.target = _pluginNode;
                                e.detail.data = data[key];

                                DefaultJsonSchema(e);

                                _form.appendChild(_pluginNode);
                            }
                            else {

                                inppluginkey.className = "text-centered item-title";
                                inppluginkey.value = key;
                                inppluginvalue.value = data[key];

                                inppluginkey.setAttribute("data-colspan", (1).toString());
                                inppluginkey.setAttribute("data-row", (2 + i).toString());
                                inppluginkey.setAttribute("json-key", key);

                                inppluginvalue.className = "text-centered item-title";
                                inppluginvalue.setAttribute("data-colspan", (2).toString());
                                inppluginvalue.setAttribute("data-row", (2 + i).toString());
                                inppluginvalue.setAttribute("json-value", data[key]);

                                _form.appendChild(inppluginkey);
                                _form.appendChild(inppluginvalue);

                            }

                        }
                        return target;
                    },
                    "default-Cells": function DefaultCells() {
                        console.info("Info: Theme needed for " + this.nodeName.toLowerCase() + "[theme='default-Cells'].");
                    },
                    "modal-manager": function ModalManager(e) {
                        // Enhance this
                    },
                    "plugin-book": function PluginBook(e) {
                        console.info("Info: Theme needed for " + this.nodeName.toLowerCase() + "[theme='plugin-book'].");
                        return true;
                    }
                },
                accessors: {
                    theme: {
                        set: function SetTheme(def) {
                            Dashing.theme ? true : Dashing.theme = {};
                            Dashing.on(this, def);
                        },
                        get: function GetTheme() {
                            if (this.hasAttribute("theme") === false) {
                                console.error("Event Source: " + this.nodeName.toLowerCase() + "#" + this.id + "." + this.className);
                                throw "The dashio framework uses themes please see our wiki on getting started with development [Please use a registered theme that has a callback defined.]";
                            }
                            return this.getAttribute("data-theme") || this.getAttribute("theme");
                        }
                    },
                    gridTemplate: {
                        get: function GetGridTemplate() {
                            if (this.hasAttribute("data-grid-template") === false && this.hasAttribute("grid-template") === false) {
                                console.error("Event Source: " + this.nodeName.toLowerCase() + "#" + this.id + "." + this.className);
                                throw "The dashio framework uses themes please see our wiki on getting started with development [Please use the data-grid-template atribute]";
                            }
                            return this.getAttribute("data-grid-template") || this.getAttribute("grid-template");
                        }
                    }
                }
            },

            /** ____________________
             * @name dashed
            ____________________ **/
            "add(mixin=dashed)": {
                methods: {
                    createJsonSchemaTable: function createJsonSchemaTable(className) {
                        var _gridcols = Dashing.rootElement.jsonSchema.plugins.keys.length,
                            drawing = Dashing.writer.draw({
                                name: "json-table",
                                target: this.displayer
                            }, {
                                    parent: {
                                        id: "jsonSchemaSpreadsheet",
                                        className: className || "json-table",
                                        fieldsetGridSpan: "1 3",
                                        themeSelector: 'select[name="select-theme"]',
                                        selectableThemes: '["default-JsonSchema","default-Cells"]',
                                        fieldsetRow: "1 3",
                                        buttonGridSpan: "5",
                                        buttonGridRow: "2",
                                        data: Dashing.rootElement.jsonSchema,
                                        gridTemplate: "1",
                                        gridCols: "1",
                                        gridRows: "1",
                                        formGridSpan: "1 3",
                                        formGridTemplate: "6",
                                        keyColWidth: "40%",
                                        submitValue: "Print or Save to IndexedDB",
                                        cellMenuSpan: "5",
                                        cellMenuRow: "1 2",
                                        message: `<p>${Dashing.rootElement.jsonSchema.meta.description} If your new to <strong>Pio Dashed</strong>, you can get acquainted by reading the Wiki =&gt; <a href="#">Wiki || GitHub</a>.</p>`
                                    },
                                    child: {
                                        templates: Dashing.rootElement.jsonSchema.templates,
                                        themes: Dashing.rootElement.jsonSchema.templates,
                                        meta: Dashing.rootElement.jsonSchema.meta
                                    }
                                },
                                xtag.createFragment(`<select name="table-theme" data-colspan="5" data-row="3" data-theme-options="0"><option value="Default JSON" selected>Default JSON</option><option value="Box Groups">Box Groups</option></select>`),
                                {
                                    events: {
                                        "tap:delegate(button[value='Print or Save to IndexedDB')": function SubmitPrintAndSave(e) {
                                            //
                                        },
                                        "change:delegate(select[name='table-theme'])": function ChangeJsonTableTheme(e) {
                                            Dashing.theme.active = this.selected;
                                        }
                                    },
                                    creator: function ChangeModalCreator(e, s) {
                                        /* Enhancement: Create Callback */
                                    }

                                });
                    },
                    writeJSON: function WriteJson(frag, data) {

                    },
                    writeOptions: function WriteOptions(values) {
                        var frag = document.createElement("select");
                        for (var i = 0; i < values.length; i++) {
                            var _opt = document.createElement("option");
                            _opt.value = values[i];
                            _opt.innerHTML = values[i];
                            frag.appendChild(_opt);
                            i === 0 ? frag.selected = _opt.selected=true : null;
                        }
                        frag.id = i.toString() + this.nodeName.toLowerCase() + "PioSelectables";
                        return frag;
                    }
                }
            },

            /** ____________________
            * @name appbind
            ____________________ **/
            "add(psuedo=appbind)": {
                action: function AppBindAction(p, e) { e.detail.conditions = p.arguments; }
            },

            /** ____________________
            * @name pageforms
            ____________________ **/
            "add(psuedo=pageforms)": {
                action: function pageformAction(psuedo, ev) {
                    var args = psuedo.arguments;

                    ev.detail.formbook = psuedo.formbook;
                    ev.detail.formbook.conditions = args;

                    for (var i = 0; i < args.length; i++) {
                        ev.detail.formbook[args[i]].conditions = args;
                    }
                    return args;
                },
                onAdd: function pageformAdd(psuedo) {
                    var args = psuedo.arguments,
                        formbook = {};

                    psuedo.formbook = {};

                    for (var i = 0; i < args.length; i++) {
                        formbook[args[i]] = {};
                        formbook[args[i]].FormArray = document.querySelector("form[data-page-form='" + args[i] + "']");
                    }

                    psuedo.formbook = formbook;
                    return formbook;
                }
            },

            /** ____________________
            * @name ResizeGrid
            ____________________ **/
            "add(event=window)": {
                resize: function _resize(ev) {

                    xtag.fireEvent(ev.target, "ResizeGrid", {
                        detail: {
                            container: {
                                extension: Dashing.rootElement,
                                header: Dashing.rootElement.querySelector("x-header[data-resize]"),
                                footer: Dashing.rootElement.querySelector("x-footer[data-resize]"),
                                book: Dashing.rootElement.querySelector("x-book[data-resize]"),
                                pages: Dashing.rootElement.querySelectorAll("x-page[data-resize]"),
                                plugins: ["silos", "worlds", "spreadsheets", "json manager"]
                            },
                            platform: document.querySelector("x-extension").getAttribute("data-platform"),
                            device: document.querySelector("x-extension").getAttribute("data-platform-device")
                        }
                    });

                },
                ResizeGrid: function ResizeXBookGrid(ev) {
                    var devee = ev.detail,
                        _platform = devee.platform,
                        _device = devee.device,
                        _container = devee.container,
                        _extension = _container.extension,
                        _header = _container.header,
                        _pages = _container.footer,
                        _plugins = _container.plugins;
                    // MOBILE-LANDSCAPE: HEIGHT GREATER THAN 600 AND WIDTH LESS THAN 900
                    if (window.innerHeight >= 600 && window.innerWidth < 900) {
                        // 
                    }
                    else if (window.innerHeight < 600 && window.innerWidth < 900) {
                        // 
                    }

                    // MOBILE-LANDSCAPE: HEIGHT GREATER THAN 600 AND WIDTH GREATER THAN 900
                    else if (window.innerHeight >= 600 && window.innerWidth >= 900) {


                    }
                    else if (window.innerHeight < 600 && window.innerWidth >= 900) {
                        // 
                    }

                }
            },

            components: function (elems, _css, dashed, def) {
                /** ____________________
                * @name x-extension 
                ____________________ **/
                elems.xExtension = {
                    mixins: ["dashed", "typed", "themed"],
                    methods: {
                        textInputFilter: function TextInputFilter(onTalk, Read, details) {
                            var detailing = {
                                conditions: null,
                                currentRead: Read,
                                contextRead: null,
                                finishedRead: false,
                                suggestedRead: false
                            },
                                _message = {},
                                node = details.target;

                            switch (onTalk) {
                                case "user-name":
                                case "indexeddb-name":
                                    var txtfltr = Dashing.isDataAttr(node, "text-filter"),
                                        def = Dashing.conditioned[txtfltr] || function defaultTextFilter() { };
                                    Dashing.InputReadyBoolean.active = true;
                                    _message = Dashing.conditioned[txtfltr](details, def);
                                    return _message;
                                case "graph":
                                case "cytoscape":
                                case "physicsjs":
                                case "calculator":
                                    return _message;
                                case "index":
                                    return _message;
                            }

                        },
                        userRequestServices: function UserRequestServices(isInNeedOf, target, assistant) {
                            // get the reqeusted service
                            switch (isInNeedOf) {
                                case "prompt":
                                    /* Enhancement: Use to create a prompt for the Pio Dashed user */
                                    break;

                                case "PioInit":
                                    var dbname = target.dbname || assistant.id || assistant.meta.id || "PioDashed",
                                        alias = target.alias || assistant.meta.name || "Magi",
                                        ver = assistant.meta.version + 1,
                                        db = new Dashing.pioDB({
                                            alias: target.alias,
                                            name: dbname,
                                            dbopen: true,
                                            init: true,
                                            upgrade: function PioInit(e) {
                                                var _db = e.target.result,
                                                    hasPatron = _db.objectStoreNames.contains("Patron");
                                                if (hasPatron === false) {
                                                    var store = _db.createObjectStore("Patron", { autoIncrement: false });

                                                    store.createIndex("alias", "alias", { unique: true });
                                                    store.createIndex("coaliases", "coaliases", { unique: true });
                                                    store.createIndex("dbname", "dbname", { unique: true });
                                                    store.createIndex("initiated", "initiated", { unique: true });
                                                    store.createIndex("platform", "platform", { unique: true });
                                                    store.createIndex("version", "version", { unique: true });

                                                    store.transaction.oncomplete = function PioPatronInitComplete(e) {
                                                        var pioDBT = _db.transaction("Patron", "readwrite").objectStore("Patron");

                                                        pioDBT.add(Dashing.DBReadyBoolean.alias || "Magi", "alias");
                                                        pioDBT.add("", "coaliases");
                                                        pioDBT.add(Dashing.DBReadyBoolean.dbname||"PioDashed", "dbname");
                                                        pioDBT.add(true, "initiated");
                                                        pioDBT.add(ver, "version");

                                                    };

                                                    store.transaction.onerror = function InitPioError(e) {
                                                        throw "Error [Transaction Error]: " + e;
                                                    };
                                                    Dashing.DBReadyBoolean.init = db.name;
                                                    Dashing.rootElement.jsonSchema.meta.version = db.version;
                                                }
                                            }
                                        }, {
                                                InitialCondition: function InitialCondition(e, _this) {
                                                    var _msg = _this.prototype.success(e, _this);
                                                    return _msg;
                                                },
                                                "case(InitialCondition=PioModalInputs)": function Pio(e) {
                                                    var _form = document.querySelector("x-modal[type='startup']"),
                                                        _inputs = _form.querySelector("input[type='checkbox']");
                                                    var _allready = true;
                                                    for (var i = 0; i < _inputs.length; i++) { if (!_inputs[i].checked) { _allready = false;  } }
                                                    if (_allready === true) {
                                                        Dashing.DBReadyBoolean.status = "complete";
                                                    }
                                                    return { allready: _allready };
                                                },
                                                "case(InitialCondition=InitCompleted)": function Pio(e) {
                                                    // Since this is the init check we are looking for the counter boolean :)
                                                    var db = Dashing.pioDB.query(document.querySelector("x-modal[type='startup']").querySelector("input[type='text'][name='indexeddb-name']").value||" PioDashed", {
                                                        store: "Patron",
                                                        key: "initiated",
                                                        onfound: function FoundPatron(e) {
                                                            Dashing.DBReadyBoolean.init = "completed";
                                                        },
                                                        onerror: function ErrorPatron(e) {
                                                            Dashing.DBReadyBoolean.init = "error";
                                                        }
                                                    });
                                                    Dashing.rootElement.jsonSchema.meta.version += 1;
                                                    // Init case is checking to make sure the PioDashed indexeddb hasn't been 
                                                    // properly recorded yet, if it hasn't been allready is true
                                                    var _allready = Dashing.DBReadyBoolean.init ? false : true;
                                                    if (_allready === true) { Dashing.DBReadyBoolean.status = "awaiting"; Dashing.pio.db = db; }
                                                    return { allready: _allready };
                                                }
                                            }, ["InitialCondition"]);

                                    return db;

                                case "icos":

                                    for (var i = 0; i < target.imports.length; i++) {

                                        var _link = document.querySelector("link[href='" + target.imports[i] + "']");
                                        if (assistant.append === true) {

                                            if (_link.__doc) { document.body.appendChild(_link.__doc.body.firstElementChild); }
                                            else { /* Maintenance: Chrome depreciating HTML Imports March 2019*/ }
                                            

                                        }

                                    }

                                    return true;

                                case "camera":
                                    return;

                                case "microphone":
                                    return;

                                case "gyroscope":
                                    return;

                                case "compass":
                                    return;

                                case "location":
                                    return;

                                default:
                                    return "Error: No User request service exists named: " + isInNeedOf;

                            }

                        }
                    },
                    lifecycle: {
                        created: function CreatedExentsion() {
                            var _evo = {}, _tevo = {};

                            var schemalink = document.querySelector('link[href="lib/JsonSchema.json"]'),
                                DocString = Dashing,
                                parsedlink = JSON.parse(schemalink.__doc.body.innerHTML);

                            // Set type
                            this.type === false ? false :
                                (

                                    _evo[this.type] = this[this.type],

                                    this.type = _evo,

                                    _tevo[this.theme] = this[this.theme],

                                    this.theme = _tevo,

                                    xtag.fireEvent(this, this.type, { detail: parsedlink } ),

                                    xtag.fireEvent( this, this.theme, { detail: { isGridTheme: this.hasAttribute("data-grid-template") } } )

                                );

                            // set schemes
                            this.schemes = this.schemes !== false ? schemalink.__doc.body.innerHTML : false;

                            var creationDetailing = Dashing.conditions.ConditionDetail({
                                active: null,
                                focused: null,
                                plugins: null
                            }, "ReadyBoolean");


                        },
                        inserted: function InsertedExentsion() {

                            // Bring in linkImports
                            if (this.linkImports !== true) {
                                this.userRequestServices("icos", {
                                    imports: this.linkImports
                                }, {
                                        append: this.appendResources
                                    });
                            }

                        },
                        removed: function RemovedExtension() {
                            this.closeDashed(this.schemes);
                        }
                    },
                    accessors: {
                        appendResources: {
                            get: function GetAppendBool() {
                                return JSON.parse(this.getAttribute("append-resources")) || false;
                            }
                        },
                        linkImports: {
                            get: function GetLinkImports() {
                                var linkz = this.getAttribute("link-imports") || "false";
                                return JSON.parse(linkz);
                            },
                            set: function SetLinkImports(importz) {
                                var testz = this.linkImports !== false ? true : false;
                                this.setAttribute("link-imports", testz);
                            }
                        },
                        schemes: {
                            set: function SetSchemes(jsnString) {
                                var jsn = JSON.parse(jsnString);

                                this.jsonSchema = jsn;
                                jsn !== false ? Dashing.isDataAttr(this, "schemes", "true") : Dashing.isDataAttr(this, "schemes", "false");

                            },
                            get: function GetSchemes() {
                                return Dashing.isDataAttr(this, "schemes");
                            }
                        }
                    }
                };

                /** ____________________
                 * @name x-table 
                ____________________ **/
                elems.xTable = {
                    mixins: ["typed", "themed", "dashed"],
                    methods: {
                        add: function Add(name, opts) {
                            /* Enhancement: Be able to add html tables, form tables, svg charts, canvas charts, and list tables. */
                        },
                        start: function () {

                            this.datasheet = {
                                columns: {
                                    length: this.dataColumns
                                },
                                rows: {
                                    length: this.dataRows
                                },
                                style: {
                                    height: this.tableHeight,
                                    width: this.tableWidth
                                }
                            };

                            var _r = this.datasheet.rows.length,
                                _c = this.datasheet.columns.length,
                                rr = 1,
                                cc = 1,
                                _cells = _r * _c,
                                _form = this.querySelector("form[data-table='true']") || document.createElement("form");

                            for (var z = 1; z <= _cells; z++) {

                                var cell = document.createElement("input");

                                cell.type = "text";

                                // check to see if the condition _cells count is equal to 1
                                if (_cells === 1) {
                                    this.cellMenu = {
                                        cell: cell,
                                        tableform: _form,
                                        colspan: this.cellMenuSpan,
                                        row: this.cellMenuRow
                                    };

                                    return true;
                                }

                                var dc = "cell-r" + rr + "-c" + cc;

                                cell.setAttribute("data-cells", dc);
                                cell.setAttribute("data-rows", rr);
                                cell.setAttribute("data-columns", cc);
                                cell.setAttribute("placeholder", "+ Edit");

                                if (z % _c === 0) {
                                    cc = 1;
                                    rr++;
                                }
                                else { cc++; }

                                _form.appendChild(cell);

                            }

                            this.appendChild(_form);

                        },
                        getByLabels: function GetByLabels(_labelname, _spreadsheet) {
                            // Enhancement 
                        },
                        getTableRoots: function GetTableRoots(_spreadsheet) {
                            // Enhancement 
                        },
                        themeSelected: function ThemeSelector() {
                            if (this.querySelector("select") && this.querySelector("select").hasAttribute("data-table") === true) {
                                console.log(this.querySelector("select").value);
                            }
                            else {
                                console.log(false);
                            }

                        }
                    },
                    lifecycle: {
                        created: function TableCreated() {
                            var _evo = {}, _tevo = {}, href = this.href;

                            // Set type
                            this.type === false ? false :
                                (

                                    _evo[this.type] = this[this.type],

                                    this.type = _evo,

                                    _tevo[this.theme] = this[this.theme],

                                    this.theme = _tevo,

                                    xtag.fireEvent(this, this.type, {
                                        detail: {}

                                    }),

                                    xtag.fireEvent(this, this.theme, {

                                        detail: {
                                            data: href || Dashing.rootElement.jsonSchema,
                                            recurseIndex: false
                                        }

                                    })

                                );

                            // set form sheet to false if it isn't present
                            this.formsheet = this.formsheet !== false ? this.formsheet : false;

                        },
                        inserted: function () {

                            this.start();

                        },
                        attributeChanged: function INputsChanged() {

                            console.log("attributeChanged");

                        }
                    },
                    events: {

                    },
                    accessors: {
                        dataColumns: {
                            attribute: {
                                validate: function ValidateTableColumns(val) {
                                    this.dataColumns !== false ? true : this.setAttribute("data-columns", "1");
                                    return Number(this.dataColumns);
                                }
                            },
                            set: function SetDataColumns(val) {
                                this.cols = val;
                            },
                            get: function GetDataColumns() {
                                return Number(this.getAttribute("data-columns")) || false;
                            }
                        },
                        dataRows: {
                            attribute: {
                                validate: function ValidateTableRows(val) {
                                    this.dataColumns !== false ? true : this.setAttribute("data-columns", "1");
                                    return Number(this.dataColumns);
                                }
                            },
                            set: function SetDataRows(val) {
                                this.rows = val;
                            },
                            get: function () {
                                return Number(this.getAttribute("data-rows"));
                            }
                        },
                        tableWidth: {
                            get: function () {
                                return this.getAttribute("table-width");
                            }
                        },
                        tableHeight: {
                            get: function () {
                                return this.getAttribute("table-height");
                            }
                        },
                        formsheet: {
                            get: function FormSheet() {
                                return this.querySelector("form[data-table='true']") || false;
                            },
                            set: function SetFormSheet(val) {
                                this.tableform = val;
                                Dashing.isDataAttr(this, "table-form");
                            }
                        },
                        themeSelector: {
                            attribute: {
                                validate: function ValidateThemeSelector(val) {
                                    var selectorID = Dashing.isDataAttr(this, "theme-selector");
                                    return selectorID;
                                }
                            },
                            get: function GetThemeSelector() {
                                var sel = true;
                                console.log(selectorID);
                                return sel;
                            },
                            set: function SetThemeSelector() {

                            }
                        },
                        selectableThemes: {
                            //
                        },
                        href: {
                            get: function GetTableHref() {
                                return this.getAttribute("href") || false;
                            }
                        },
                        cellMenu: {
                            set: function SetCellMenu(cell) {
                                var _cellwrapper = document.createElement("strong");

                                _cellwrapper.setAttribute("data-cell-wrapper", "true");

                                _cellwrapper.setAttribute("data-cell-menu", "true");
                                _cellwrapper.setAttribute("data-colspan", cell.colspan);
                                _cellwrapper.setAttribute("data-row", cell.row);

                                cell.cell.setAttribute("data-cell-menu", "true");
                                cell.cell.setAttribute("data-colspan", cell.colspan);
                                cell.cell.setAttribute("data-row", cell.row);
                                cell.cell.placeholder = "+ Edit";

                                _cellwrapper.appendChild(cell.cell);
                                cell.tableform.appendChild(_cellwrapper);
                                this.appendChild(cell.tableform);
                            }
                        },
                        cellMenuSpan: {
                            get: function GetCellMenuSpan() {
                                return this.getAttribute("cell-menu-span") || 1;
                            }
                        },
                        cellMenuRow: {
                            get: function GetCellMenuRow() {
                                return this.getAttribute("cell-menu-row") || 1;
                            }
                        }
                    }
                };

                /** ____________________
                 * @name x-modal
                ____________________ **/
                elems.xModal = {
                    mixins: ["dashed", "themed", "typed"],
                    methods: {
                        'show:transition(before)': function ShowModal() { this.removeAttribute('hidden'); },
                        'hide:transition(after)': function HideModal() { this.setAttribute('hidden', ''); },
                        toggle: function ToggleModal() {
                            if (this.hasAttribute('hidden') && this.clickHide) { this.show(); }
                            else if (this.clickHide) { this.hide(); }
                        }
                    },
                    lifecycle: {
                        created: function ModalCreator() {
                            // check for input boolean
                            if (Dashing.InputReadyBoolean === undefined) { Dashing.conditions.prototype.detail = {
                                    name: "InputReadyBoolean",
                                    value: {
                                        status: { allready: false },
                                        successCount: 0,
                                        errorCount: 0,
                                        active: false,
                                        focused: false,
                                        totalcases: 0
                                    }
                                }; }

                            this.overlayElement = document.createElement('x-modal-overlay');

                            _css.insertRule("x-modal-overlay{z-index:1;}");
                            _css.insertRule("x-modal{z-index:2;}");

                            var _evo = {},
                                _tevo = {};

                            this.type === false ? false : (
                                _evo[this.type] = this[this.type],
                                this.type = _evo,
                                _tevo[this.theme] = this[this.theme],
                                this.theme = _tevo,
                                xtag.fireEvent(this, this.type, {
                                    detail: {
                                        theme: this.theme
                                    }
                                }),
                                xtag.fireEvent(this, this.theme, {

                                    detail: {

                                        isGridTheme: this.hasAttribute("data-grid-template")

                                    }

                                })
                            );
                        },
                        inserted: function ModalInserted() {
                            if (Dashing.BrowserInfo.oldiOS || Dashing.BrowserInfo.oldDroid) { setTop(this); }

                            if (Dashing.BrowserInfo.oldiOS || Dashing.BrowserInfo.oldDroid) { setTop(this); }
                        },
                        removed: function ModalRemoved() {
                            if (this.type === "startup") {
                                (this.parentElement || document.body).removeChild(this.overlayElement);
                                this.xtag.lastParent = null;
                            }

                        }
                    },
                    events: {
                        'tap:outer': function TapOuterModal(e) {
                            if (e.target.hasAttribute("data-modal-event") === false && e.target.nodeName !== "X-MODAL-OVERLAY") { return false; }
                            if (this.modal === false) { return false; }
                            if (e.target.nodeName === "BUTTON" || e.target.nodeName === "INPUT") { return false; }
                            var _md = Dashing.modaled[e.target.previousElementSibling.modal];

                            // Check modal conditions
                            if (_md.conditions !== false) {
                                var _success = Dashing.conditioned[_md.conditions](e, Dashing.conditioned[_md.conditions]);

                                if (_success.allready === false) {
                                    return _success;
                                }
                                else {
                                    var _et = document.querySelector("button[data-modal-template='#dashed-prompt']");
                                        _et.getAttribute("data-event-active") === "true" ? _md.closer(e) : false;
                                    _md.reset({ target: _et }, _md);
                                    _et.style.visibility = "visible";
                                }
                            }
                            else {
                                _md.reset({ target: document.querySelector("button[data-modal-template='#dashed-prompt']") }, _md);
                            }
                            // Check modal type
                            if (this.type === "startup" || this.type === "modal") { this.removeAttribute("data-focus"); this.toggle(); }
                        },
                        'tap:delegate(input[value="Create"])': function SubmitModal(e) {
                            var checking = Dashing.conditioned.StartupFormConditions(e, Dashing.conditioned["StartupFormConditions"]),
                                parentModal = this.parentNode.parentNode.parentNode.parentNode.parentNode;

                            // if ready fire IndexDBService event
                            if (checking.allready === true) {

                                if (Dashing.rootElement.jsonSchema.indexedDB === true) {
                                    // 
                                }
                                else {

                                    // @draw `json-table` 
                                    // display the json schema on a text editable table 
                                    // and see if they want to update it.
                                    var _gridcols = Dashing.rootElement.jsonSchema.plugins.keys.length,
                                        drawing = Dashing.writer.draw({
                                            name: "json-table",
                                            target: parentModal.displayer
                                        }, {
                                                parent: {
                                                    id: "jsonSchemaSpreadsheet",
                                                    className: "json-table",
                                                    fieldsetGridSpan: "1 3",
                                                    themeSelector: 'select[name="select-theme"]',
                                                    selectableThemes: '["default-JsonSchema","default-Cells"]',
                                                    fieldsetRow: "1 3",
                                                    buttonGridSpan: "5",
                                                    buttonGridRow: "2",
                                                    data: Dashing.rootElement.jsonSchema,
                                                    gridTemplate: "1",
                                                    gridCols: "1",
                                                    gridRows: "1",
                                                    formGridSpan: "1 3",
                                                    formGridTemplate: "6",
                                                    keyColWidth: "40%",
                                                    submitValue: "Print or Save to IndexedDB",
                                                    cellMenuSpan: "5",
                                                    cellMenuRow: "1 2",
                                                    message: `<p>${Dashing.rootElement.jsonSchema.meta.description} If your new to <strong>Pio Dashed</strong>, you can get acquainted by reading the Wiki =&gt; <a href="#">Wiki || GitHub</a>.</p>`
                                                },
                                                child: {
                                                    templates: Dashing.rootElement.jsonSchema.templates,
                                                    themes: Dashing.rootElement.jsonSchema.templates,
                                                    meta: Dashing.rootElement.jsonSchema.meta
                                                }
                                            },
                                            xtag.createFragment(`<select name="table-theme" data-colspan="5" data-row="3" data-theme-options="0"><option value="Default JSON" selected>Default JSON</option><option value="Box Groups">Box Groups</option></select>`),
                                            {
                                                events: {
                                                    "tap:delegate(button[value='Print or Save to IndexedDB')": function SubmitPrintAndSave(e) {
                                                        var _form = "",
                                                            _data = "";
                                                        var db = Dashing.pio.upgrade;
                                                        console.log(Dashing.pio.upgrade);
                                                    },
                                                    "change:delegate(select[name='table-theme'])": function ChangeJsonTableTheme(e) {
                                                        console.log(this);
                                                    }
                                                },
                                                creator: function ChangeModalCreator(e, s) {
                                                    /* Enhancement: Create Callback */
                                                }

                                            });
                                }
                                var dbname = this.parentNode.querySelector("input[type='text'][name='indexeddb-name']").value || "PioDashed",
                                    alias = this.parentNode.querySelector("input[type='text'][name='user-name']").value || "PioDashed";
                                console.log(dbname);
                                Dashing.rootElement.userRequestServices("PioInit", { alias: alias, dbname: dbname }, Dashing.rootElement.jsonSchema);

                                xtag.fireEvent(this, "hider", {
                                    detail: {
                                        button: document.querySelector("#toggle-setup")
                                    }
                                });

                            }

                        },
                        'tap:delegate(button[value="Confirm"])': function ConfirmPlatform(e) {
                            Dashing.platform = { type: this.parentNode.parentNode.querySelector('select').value };
                            if (this.parentNode.type === "selection") {
                                this.parentNode.parentNode.removeChild(this.parentNode);
                            }
                        },
                        IndexDBServices: function IndexDBServicer(e) {
                            // Enhancement: This may become obseleted.
                        },
                        hider: function Hider(e) {
                            if (e.detail.button.hasAttribute("data-modal-event") === false && e.detail.button.nodeName !== "X-MODAL-OVERLAY") { return false; }

                            var _md = Dashing.modaled[this.modal];
                            // Check modal conditions
                            if (_md.conditions !== false) {

                                var _success = Dashing.conditioned[_md.conditions](e, Dashing.conditioned[_md.conditions]);

                                if (_success.allready === false) {
                                    return _success;
                                }
                                else {
                                    var _et = document.querySelector("button[data-modal-template='#dashed-prompt']");
                                    _et.getAttribute("data-event-active") === "true" ? _md.closer(e) : false;
                                    _md.reset({ target: _et }, _md);
                                }
                            }
                            else {
                                _md.reset({ target: document.querySelector("button[data-modal-template='#dashed-prompt']") }, _md);
                            }

                            // Check modal type
                            if (this.type === "startup" || this.type === "modal") {
                                this.removeAttribute("data-focus");
                                this.toggle();
                            }
                        }
                    },
                    accessors: {
                        submitEvent: {
                            set: function SetSubmitEvent(val) {
                                var frag = document.createElement("button");

                                frag.type = "button";

                                frag.innerHTML = "Confirm";
                                frag.value = "Confirm";
                                this.appendChild(frag);
                            },
                            get: function GetSubmitEvent() {
                                return this.getAttribute("submit-event");
                            }
                        },
                        cancelEvent: {
                            validate: function ValidateCancelEvent(val) {

                            },
                            set: function SetCancelEvent(val) {

                            },
                            get: function GetCancelEvent() {

                            }
                        },
                        displayer: {
                            get: function GetDisplay() {
                                return document.querySelector(this.getAttribute("modal-responses"));
                            }
                        },
                        modal: {
                            get: function GetModal() {
                                return this.getAttribute("modal") || this.getAttribute("data-modal") || false;
                            }
                        },
                        overlay: {
                            attribute: { boolean: true },
                            set: function () {
                                var last = this.className;
                                this.className += ' x-modal-safari-redraw-bug';
                                this.className = last;
                            }
                        },
                        modalForm: {
                            get: function GetModalForm() {
                                return document.getElementById(this.getAttribute("modal-form")) || false;
                            }
                        },
                        modalSubmit: {
                            get: function GetModalForm() {
                                return document.getElementById(this.getAttribute("modal-submit")) || false;
                            }
                        },
                        escapeHide: {
                            attribute: {
                                boolean: true,
                                name: 'escape-hide'
                            }
                        },
                        clickHide: {
                            attribute: {
                                boolean: true,
                                name: 'click-hide'
                            }
                        },
                        toggling: {
                            attribute: {
                                boolean: true,
                            }
                        },
                        startScreen: {
                            set: function (modal) {
                                if (modal === true) {
                                    this.toggle();
                                }
                            },
                            attribute: {
                                boolean: true,
                                name: 'start-screen'
                            }
                        }
                    }
                };

                /** ____________________
                 * @name x-shiftbox 
                ____________________ **/
                elems.xShiftbox = {
                    lifecycle: {
                        created: function () {
                            // flag to prevent opened and closed event from firing multiple times
                            // when transitionend is fired for each animated property
                            this.xtag.data.opened = this.hasAttribute('open');
                        }
                    },
                    events: {
                        'transitionend': function OnTransitionend(e) {
                            if (xtag.matchSelector(e.target, 'x-shiftbox > section')) {
                                if (this.hasAttribute('open') && !this.xtag.data.opened) {
                                    this.xtag.data.opened = true;
                                    xtag.fireEvent(this, 'opened');
                                }
                                else if (!this.hasAttribute('open') && this.xtag.data.opened) {
                                    this.xtag.data.opened = false;
                                    xtag.fireEvent(this, 'closed');
                                }
                            }
                        }
                    },
                    accessors: {
                        'shift': {
                            attribute: {},
                            get: function () {
                                return this.getAttribute('shift') || '';
                            }
                        },
                        'open': {
                            attribute: {},
                            set: function () {
                                var asideWidth = getComputedStyle(xtag.query(this, 'aside')[0]).width;
                                this.setAttribute('data-asideSize', asideWidth);
                            }
                        }
                    },
                    methods: {
                        'toggle': function ShiftboxToggle() {
                            if (this.hasAttribute('open')) {
                                this.removeAttribute('open');
                            }
                            else {
                                this.setAttribute('open', '');
                            }
                        }
                    }
                };

                /** ____________________
                 * @name x-header 
                ____________________ **/
                elems.xHeader = {
                    methods: {

                    },
                    lifecycle: {
                        inserted: function () {
                            Dashing.rootElement.querySelector("x-header");
                        }
                    },
                    accessors: {
                        minimized: {
                            set: function SetMinimized(minzd) {

                            },
                            get: function GetMinimized() {

                            }
                        },
                        minimizer: {
                            set: function SetMinimizer(mizer) {

                            },
                            get: function GetMinimizer() {
                                return Dashing.templates[this.getAttribute("minimizer")];
                            }
                        },
                        minimizerIco: {
                            set: function SetMinimizerIcon(minzd) {
                                this.minimizer({
                                    ico: this.minimizerIco
                                }, {

                                    });
                            },
                            get: function GetMinimizerIco() {
                                return this.getAttribute("minimizer-ico") || false;
                            }
                        }
                    }
                };

                /** ____________________
                 * @name x-book 
                ____________________ **/
                elems.xBook = {
                    mixins: ["typed", "themed"],
                    methods: {
                        addPage: function AddPage() {
                            // to do: add page
                        },
                        removePage: function RemovePage() {
                            // to do: remove page
                        }
                    },
                    lifecycle: {
                        created: function () {
                            var _evo = {},
                                _tevo = {};
                            this.type === false ? false : (
                                _evo[this.type] = this[this.type],
                                this.type = _evo,
                                _tevo[this.theme] = this[this.theme],
                                this.theme = _tevo,
                                xtag.fireEvent(this, this.type, {
                                    detail: {
                                        theme: this.theme
                                    }
                                }),
                                xtag.fireEvent(this, this.theme, { detail: { isGridTheme: this.hasAttribute("data-grid-template") } })
                            );

                        },
                        inserted: function () {
                            
                        }
                    }
                };

                /** ____________________
                 * @name x-page
                ____________________ */
                elems.xPage = {
                    mixins: ["typed", "themed"],
                    lifecycle: {
                        inserted: function XPageInserted() {
                            if (this.active === true) { this.show(); }
                        }
                    },
                    events: {
                        // Put in events for page turning
                    },
                    accessors: {
                        active: {
                            attribute: { boolean: true },
                            set: function (val, old) {
                                if (val !== old) xtag.transition(this, val ? 'active' : 'inactive');
                            },
                            get: function isActive() {
                                return this.hasAttribute("active");
                            }
                        },
                        selected: {
                            attribute: {
                                boolean: true
                            },
                            set: function (val, old) {
                                if (val && val != old && this.parentNode) {
                                    xtag.query(document, 'x-page').forEach(function (node) {
                                        if (node !== this) node.selected = false;
                                    }, this);
                                }
                            }
                        }
                    },
                    methods: {
                        "show:transition(after)": function (deactivate) {
                            this.selected = true;
                            this.active = true;
                            if (deactivate) xtag.query(document, 'x-page').forEach(function (node) {
                                node.active = node === this;
                            }, this);
                        },
                        hide: function () {
                            this.selected = false;
                            this.active = false;
                        }
                    }
                };

                /** ____________________
                * @name x-footer
                ____________________ **/
                elems.xFooter = {
                    methods: {
                    },
                    lifecycle: {
                        created: function () { },
                        inserted: function () { }
                    },
                    accessors: {

                    }
                };

                /** ____________________
                * @name x-tabbox
                ____________________ **/
                elems.xTabbox = {
                    events: {
                        "selectTab": function selectTab(e) {

                            var previous = [],
                                tab = e.detail.tab,
                                fireSelected = tab && !tab.hasAttribute('selected');

                            xtag.queryChildren(this, 'menu > [selected], ul > [selected]').forEach(function (node) {
                                previous.push(node);
                                node.removeAttribute('selected');
                            });

                            tab.setAttribute('selected', '');
                            var index = xtag.toArray(tab.parentNode.children).indexOf(tab);

                            if (index != this.selectedIndex) { this.selectedIndex = index; }
                            if (!rules[index]) {
                                rules[index] = 1;
                                var transform = 'transform: translateX(' + (index * -100) + '%);';
                                sheet.insertRule('x-tabbox[selected-index="' + index + '"] > ul > li:nth-of-type(' + (index + 1) + '){ opacity: 1; z-index: 1; ' + xtag.prefix.css + transform + transform + '}', sheet.cssRules.length);
                            }

                            var panel = xtag.queryChildren(this, 'ul > li')[e.detail.index];
                            if (panel) panel.setAttribute('selected', '');
                            if (fireSelected) xtag.fireEvent(this, 'tabselected', {
                                detail: {
                                    currentTab: tab,
                                    currentPanel: panel,
                                    previousTab: previous[0],
                                    previousPanel: previous[1]
                                }
                            });
                        },
                        'selectEvent': function selectEvent(e) {
                            if (this.selectedIndex !== e.detail.index) {

                                xtag.fireEvent(e.currentTarget, "selectTab", {
                                    detail: {
                                        index: e.detail.index,
                                        tab: xtag.queryChildren(this, 'menu > *')[e.detail.index]
                                    }
                                });
                            }
                        },
                        'tap:delegate(x-tabbox > menu > *)': function TapSelectEvent(e) { xtag.fireEvent(this, "selectEvent", { detail: { index: Number(e.target.getAttribute("index")) } }); },
                        'keydown:delegate(x-tabbox > menu > *):keypass(13, 32)': function KeySelectEvent(e) { xtag.fireEvent(this, "selectEvent", {}); }
                    },
                    lifecycle: {
                        created: function tabboxCreator() {
                            this.selectedIndex = this.selectedIndex;
                        }
                    },
                    accessors: {
                        tabElements: {
                            get: function () {
                                return xtag.queryChildren(this, 'menu > *');
                            }
                        },
                        panelElements: {
                            get: function () {
                                return xtag.queryChildren(this, 'ul');
                            }
                        },
                        selectedIndex: {
                            attribute: {
                                validate: function (val) {
                                    var index = Number(val);

                                    var tab = xtag.queryChildren(this, 'menu > *')[index];
                                    return tab ? index : -1;
                                }
                            },
                            set: function (val, old) {

                                xtag.fireEvent(this, "selectTab", {
                                    detail: { tab: xtag.queryChildren(this, 'menu > *')[val] }
                                });
                            },
                            get: function () {
                                return Number(this.getAttribute("selected-index"));
                            }
                        },
                        selectedTab: Dashing.createAccessor("menu > [selected]"),
                        selectedPanel: Dashing.createAccessor("menu > [selected]")
                    }
                };

                return elems;
            }

        });
        console.log(Dashing);

    })();

    /** ________________________________________________________________________________
    * @note: For Develepment purposes any enhancements that doesn't deal with dashboard or one of its dependencies goes below this comment.
    ________________________________________________________________________________ **/

})();



