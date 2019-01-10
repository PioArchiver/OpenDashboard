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
(function Dashio() {
    class Model extends XMLHttpRequest {
        constructor(name, mod) {
            super();
        }
        get modelTemplate() { /* */ }
        set modelTemplate(templating) { /* */ }
    }
    class Cases {
        constructor(condition, cases) {

        }
        success(e, _super, _this) {

        }
        error(e, _super, _this) {

        }
    }
    class Conditions extends Cases{
        constructor() { }
    }
    class Modalio extends Condtions {
        constructor(modaler) {
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
        }
        set open(ev) {
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
        }
        get getopener() { return this.opener; }
        set closing(ev) {
            var mname = ev.scope.getAttribute("data-modal"),
                app = Dashing.modaled[mname];

            app.active.parentNode.removeChild(app.active);

            app.lastActive = app.active;
            app.active = false;
            ev.target.setAttribute("active", "false");
            ev.target.setAttribute("data-event-active", "false");
            ev.target.setAttribute("data-modal-active", "false");
        }
        set conditions(conditioner) {
            this.interaction = conditioner;
        }
        set ready(conditions) {
            var cks = Object.keys(conditions),
                isNotReady = { length: 0 };
            for (var c = 0; c < cks.length; c++) {
                conditions[cks[c]] === true ? "" : (isNotReady[cks[c]] = false, isNotReady.length++);
            }
            isNotReady.length === cks.length ? this.readied = false :
                isNotReady.length < cks.length ? this.readied = { error: "Incomplete", incomplete: isNotReady } :
                    this.ready = true;
        }
        get ready() { return this.readied; }
        reset(e, modaler) {
            modaler.active = false;
            modaler.lastActive = null;
            ev.target.setAttribute("active", "false");
            ev.target.setAttribute("data-event-active", "false");
            ev.target.setAttribute("data-modal-active", "false");
        }
        interject(modaler) {
            modaler.prompt.firstChild.id = modaler.id;
            modaler.prompt.firstChild.name = (modaler.name || "default").replace(/\s+/g, "_");
            modaled[modaler.id].prompt = modaler.prompt;

            this.id = modaler.id;
            this.name = modaler.name;
            this.create = function () { console.log(modaler.prompt.cloneNode(true)); return modaler.prompt.cloneNode(true); };
        }
    }
    class Carouselio extends Conditions {
        constructor(timerOptions) {
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
        }
        reset(ev, modaler) {
            modaler.active = false;
            modaler.lastActive = null;
            ev.target.setAttribute("active", "false");
            ev.target.setAttribute("data-event-active", "false");
            ev.target.setAttribute("data-modal-active", "false");
        }
        interject(modaler) {
            modaler.prompt.firstChild.id = modaler.id;
            modaler.prompt.firstChild.name = (modaler.name || "default").replace(/\s+/g, "_");
            modaled[modaler.id].prompt = modaler.prompt;

            this.id = modaler.id;
            this.name = modaler.name;
            this.create = function () { console.log(modaler.prompt.cloneNode(true)); return modaler.prompt.cloneNode(true); };
        }
        set open(ev) {
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
        }
        get open() { return this.opener; }
        set close(ev) {
            var mname = ev.scope.getAttribute("data-modal"),
                app = Dashing.modaled[mname];

            app.active.parentNode.removeChild(app.active);

            app.lastActive = app.active;
            app.active = false;
            ev.target.setAttribute("active", "false");
            ev.target.setAttribute("data-event-active", "false");
            ev.target.setAttribute("data-modal-active", "false");
        }
        get close() { return this.closer; }
        set conditions(conditioner) { this.interaction = conditioner; }
        set ready(conditions) {
            var cks = Object.keys(conditions),
                isNotReady = { length: 0 };
            for (var c = 0; c < cks.length; c++) {
                conditions[cks[c]] === true ? "" : (isNotReady[cks[c]] = false, isNotReady.length++);
            }
            isNotReady.length === cks.length ? this.readied = false :
                isNotReady.length < cks.length ? this.readied = { error: "Incomplete", incomplete: isNotReady } :
                    this.ready = true;
        }
        get ready() { this.readied }
    }
    class pioDB extends Conditions {
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
                    else { this.upgrade(Dashing.pio.db, { alias: alias, dbname: name }, data.upgrade); }
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
                    return { allready: false, message: `Error: Stores not upgraded for, ${name}` };
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
            var _pio = window.indexedDB.open(name || "PioDashed");
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
    }
    class Dashboard extends Conditions {
        constructor() {
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
        add(opts) {
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
        }
        build(nm, def) {
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
        write() {

        }
        writer() {
            return {
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
                    length: 1
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
            };
        }
        writeJSON(type, data) {
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
        setAddedProps(dashed) {
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
        fireProps() {
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
        isDataAttr(_node, _attr, _setattr) {
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
        BrowserInfo(appNavReady) {
            var browmtc = navigator.userAgent.match(/Firefox|OPR|Edge|Chrome/g),
                oldiOS = /OS [1-4]_\d like Mac OS X/i.test(navigator.userAgent),
                oldDroid = /Android 2.\d.+AppleWebKit/.test(navigator.userAgent),
                gingerbread = /Android 2\.3.+AppleWebKit/.test(navigator.userAgent);
            this.browser = browmtc ? browmtc[0] : "Error: The browser you're using couldn't be found.";
            this.oldiOS = oldiOS;
            this.oldDroid = oldDroid;
            this["android_v2-3"] = gingerbread;
        }
        getObjectKeys(keys, obj, excludes) {
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
        }
        fnQuery(query, fn) {
            var qy = document.querySelector(query);
            return fn(qy);
        }
        createAccessor(selector) {
            return {
                get: function () {
                    return xtag.queryChildren(this, selector)[0];
                }
            };
        }

        get templates(name) { return dashboard.prototype.writer.templated || false; }
        set bounded(elem) {
            elem.bounds = {
                top: elem.getBoundingClientRect().top,
                left: elem.getBoundingClientRect().left,
                bottom: elem.getBoundingClientRect().bottom,
                right: elem.getBoundingClientRect().right,
                width: elem.getBoundingClientRect().width,
                height: elem.getBoundingClientRect().height
            };
        }
        set xtags(val) {
            if (val === true) { xtag.merge(Dashing, this.xtags); }
            else {
                this.on = function events(elem, opts) {
                    var keyed = Object.keys(opts);
                    for (var i = 0; i < keyed.length; i++) { elem.addEventListener(keyed[i], opts[keyed[i]]); }
                };
            }

        }
        get xtags() {
            return {
                on: xtag.addEvents,
            }
        }
        set platform(Platform) {
            // Enhancement: create a theme class with getters and setters for platform and other properties
            this.theme ? true : this.theme = {};
            this.theme.platform = Platform;
        }
        get platform() { return this.theme.platform || false; }
    }
})();