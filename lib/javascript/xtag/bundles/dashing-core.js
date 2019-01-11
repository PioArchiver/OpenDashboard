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
    /** ____________________
     * @note Methods and variables for tabbox
     * ** @name rules
     * ** @name _elements
     * ** @name _observers
    ____________________ **/
    const rules = {},
        _observers = {},
        _elements = {},
        _requests = {},
        _mod = { initiated: false };

    const states = {},
        insertRule = CSSStyleSheet.prototype.insertRule,
        deleteRule = CSSStyleSheet.prototype.deleteRule,
        regexpConditionMatch = /\s*state\s*:\s*(\w+)/;

    // StyleSheet 
    class CssWriter {
        constructor(name) {
            if (document.getElementById(name)) { 
                this.Stylesheet = { ready: document.getElementById(name) }; 
            } 
            else { 
                let sy = document.createElement("style"); 
                sy.id = name; 
                this.Stylesheet = { progressing: sy }; 
            }

            document.addEventListener('load', function LoadCss(e) {
                var node = e.target;
                if ((node.nodeName === 'LINK' || node.nodeName === 'STYLE') && node.sheet) {
                    Array.prototype.forEach.call(node.sheet.cssRules, function (rule) { css.parseRule(node, rule); });
                }
            }, true);

        } 

        get Stylesheet() { return this.css.sheet; } 
        set Stylesheet(_sy) { 
            if (_sy.ready) { 
                this.sheet = _sy.ready.sheet; 
                this.style = _sy.ready; 
            }
            else {
                let _syid = _sy.progressing.id;
                    document.head.appendChild(_sy.progressing); 
                    this.sheet = document.getElementById(_syid).sheet; 
                    this.style = document.getElementById(_syid); 
            }
        }

        transitions(elem, options, state) {       
            if (state === "hide") {
                let _applyStyle = `${elem.nodeName.toLowerCase()}[type="${elem.type}"][transitioned="${elem.getAttribute("transition-end")}"]{ -webkit-transition:`,
                    _deltaStyle = `${elem.nodeName.toLowerCase()}[type="${elem.type}"][transitioned="${elem.getAttribute("transition-end")}"]{`;
                elem.setAttribute("transitioned", elem.getAttribute("transition-end"));
                elem.removeAttribute("transitioning");
                options.keys.forEach((item, index, source) => {
                    _applyStyle += `${item} ${options[item]}`;
                    _deltaStyle += `${item}: ${options.delta[item]}`;
                    let z = index + 1;
                    if (z === source.length) {
                        _applyStyle += `;}`;
                        _deltaStyle += `;}`;
                    }
                    else {
                        _applyStyle += `,`;
                        _deltaStyle += `;`;
                    }
                });
                sheet.insertRule(_applyStyle);
                sheet.insertRule(_deltaStyle);
            }
            else if (state === "show") {
                let _applyStyle = `${elem.nodeName.toLowerCase()}[type="${elem.type}"][transitioning="${elem.getAttribute("transition-start")}"]{ -webkit-transition:`,
                    _deltaStyle = `${elem.nodeName.toLowerCase()}[type="${elem.getAttribute("type")}"][transitioning="${elem.getAttribute("transition-start")}"]{`;
                elem.setAttribute("transitioning", elem.getAttribute("transition-start"));
                elem.removeAttribute("transitioned");
                options.keys.forEach((item, index, source) => {
                    _applyStyle += `${item} ${options[item]}`;
                    _deltaStyle += `${item}: ${options.delta[item]}`;
                    let z = index + 1;
                    if (z === source.length) {
                        _applyStyle += `;}`;
                        _deltaStyle += `;}`;
                    }
                    else {
                        _applyStyle += `,`;
                        _deltaStyle += `;`;
                    }
                });
                sheet.insertRule(_applyStyle);
                sheet.insertRule(_deltaStyle);
            }
        }

        parseRule(node, rule, remove) {
            if (rule instanceof CSSSupportsRule) {
                var match = rule.conditionText.match(regexpConditionMatch);
                if (match) {
                    var state = states[match[1]];
                    var entries = (state || (state = states[match[1]] = { active: false, entries: [] })).entries;
                    var entry = rule.__CSSStateRule__ = {
                        sheet: node.sheet,
                        rule: rule,
                        text: '@media all {' + Array.prototype.reduce.call(rule.cssRules, function (str, z) {
                            return str + ' ' + z.cssText;
                        }, '') + '}'
                    };
                    entries.push(entry);
                    if (state.active) activateEntry(entry);
                }
            }
        }

        activateEntry(entry) {
            var index = Array.prototype.indexOf.call(entry.sheet.cssRules, entry.rule) + 1;
            entry.sheet.insertRule(entry.text, index);
            entry.active = entry.sheet.cssRules[index];
        }

        activate(name) {
            var state = states[name] || (states[name] = { entries: [] });
            state.active = true;
            state.entries.forEach(activateEntry);
        }

        deactivate(name) {
            var state = states[name];
            if (state && state.active) {
                state.active = false;
                state.entries.forEach(function (entry) {
                    var index = Array.prototype.indexOf.call(entry.sheet.cssRules, entry.active);
                    entry.sheet.deleteRule(index);
                    delete entry.active;
                });
            }
        }

    }

    // Create new CssWriter
    var css = new CssWriter("ApplicationInlineStyleElement");
    var sheet = css.sheet; 



    Object.defineProperty(HTMLDocument.prototype, 'state', {
        value: {
            activate: css.activate,
            deactivate: css.deactivate,
            get active() {
                var active = [];
                for (let state in states) {
                    if (states[state].active) active.push(state);
                }
                return active;
            }
        }
    });

// Pseudos
(function _Pseudos_() {
    // Transitions
    class Transitions {
        constructor(options) { xtag.merge(this, options); this.allowed = []; }

        update(name, elem) {
            let delta = this[name]; 
            if (delta !== undefined && delta.ready === false) {
                delta.ready = true;
                this.attrs(this, name, {

                });
            }
            else if (delta !== undefined && delta.ready === true) {
                delta.ready = false;
                delta.hide(elem);
            }
        }

        add(name, options) {
            this[name] = { id: name, attributes: options.attrs }; 
        }

        get attrs() {
            return function ApplyAttr(init, attr, state, override) {
                if (state === "show") {
                    let val = null;

                    if (override !== undefined) { val = override; }
                    else { val = "true"; };
                    init === false ? this.removeAttribute(attr) : this.setAttribute(attr, val);
                } 
                else if (state === "hide") {
                    let val = null;

                    if (override !== undefined) { val = override; }
                    else { val = "true"; };

                    init === false ? this.setAttribute(attr, val) : this.removeAttribute(attr);
                } 
            };
        }
        get style() {
            return function ApplyStyle(pseudo, state) {
                let _style = pseudo.style,
                    _dt = _style.delta,
                    _keys = _style.keys;

                css.transitions(this, _style, state);
            };
        }

    }
    var transitions = new Transitions({ 
        show: function Show(pseudo) {
            if (pseudo.override === undefined) {
                transitions.attrs.apply(this, [transitions[pseudo.validated.name].initState, pseudo.validated.name, "show"]);
                transitions.style.apply(this, [pseudo, "show"]);
            }
            else if (typeof pseudo.override === "string") {
                transitions.attrs.apply(this, [pseudo.initState, pseudo.validated.name, "show"]);
                transitions.style.apply(this, [pseudo, "show"]);
            }
            return true;
        }, 
        hide: function Hide(pseudo) { 
            if (pseudo.override === undefined) {
                transitions.attrs.apply(this, [transitions[pseudo.validated.name].initState, pseudo.validated.name, "hide"]);
                transitions.style.apply(this, [pseudo, "hide"]);
            }
            else if (typeof pseudo.override === "string") {
                console.log(pseudo);
                transitions.attrs.apply(this, [pseudo.initState, pseudo.validated.name, "hide"]);
                transitions.style.apply(this, [pseudo, "hide"]);
            }
            return true;
        } 
    }); 

    xtag.addTransition = function AddTransition(name, options) { transitions.add(name, options); }; 

    xtag.pseudos._transition = { 
        onCompiled: function OnCompiled (fn, pseudo) {
            let args = pseudo.arguments;

            this.style = pseudo.listener() || {
                delta: {}
            }; 
            this.style.keys = Object.keys(this.style.delta);
            this.state = args[1];
            this.attrs = { };
            for (let c = 2; c < args.length; c++) {
                this.attrs[args[c]] = { name: args[c], type: args[0] };
            }
            this.attrs.keys = Object.keys(this.attrs);
            this.show = `[show="${this.keys}"]`; 
            this.hide = ``; 
        }, 
        action: function (a, n) {
            // Execute action only if n is defined. 
            if (n === undefined) { return false; }
            let args = a.arguments;

            let _sat = this.getAttribute("transition-show") || "fade-in", 
                _hat = this.getAttribute("transition-hide") || "fade-out",
                _st = transitions[_sat],
                _ht = transitions[_hat];

            for (var i = 0; i < a.attrs.keys.length; i++) {
                let _attr = this.hasAttribute(a.attrs.keys[i]) === true ? a.attrs[a.attrs.keys[i]].name : false,
                    _cstate = this.hasAttribute(a.attrs.keys[i]) === true ? true : false;

                a.validated = a.attrs[a.attrs.keys[i]].type === "boolean" ? { 
                    boolean: true, 
                    string: false, 
                    name: a.attrs[a.attrs.keys[i]].name, 
                    value: this.getAttribute(a.attrs[a.attrs.keys[i]].name) || "", 
                    duration: this.getAttribute("transition-duration") || "1s"
                } : {
                        boolean: false,
                        string: a.attrs[a.attrs.keys[i]].type,
                        name: a.attrs[a.attrs.keys[i]].name,
                        value: this.getAttribute(a.attrs[a.attrs.keys[0]].name) || "",
                        duration: this.getAttribute("transition-duration") || "1s"
                    };

                if (a.validated.boolean === true) { 
                    transitions[a.validated.name] === undefined ? transitions[a.validated.name] = { initState: _cstate } : true; 

                    a.state = _cstate === true ? "show" : args[1] === "show" ? ("show") : "hide"; 
                } 
                else {
                    transitions[a.attrs.keys[i].name] !== undefined ? transitions[a.attrs.keys[i].name] = { initState: _cstate } : true; 
                    a.state = _cstate === true ? "show" : args[1] === "show" ? ("show") : "hide"; 
                } 

                a.transitions = { 
                    hide: transitions[_hat], 
                    show: transitions[_sat] 
                }; 

                if (a.transitions[a.state].attributes[a.attrs.keys[i]] === args[0]) {
                    transitions[args[1]].apply(this, [a]); 
                } 
                else { 
                    a.override = a.validated.value; 
                    transitions[args[1]].apply(this, [a]); 
                } 

            } 
            
        } 
    }; 


    })(); 

    var _setprog = 0; 
    function noop() { return false; } 
    class Model { 
        constructor(_links, readyModelCallback) {
            
            this.requests = {};

            this.requests._progress = 0;
            this.requests._loaded = 0;
            this.requests.length = 0;

            this.requests.mappings = readyModelCallback();
            this.requests.hrefs = this.getLinkHrefs(_links); 
            
            this.requests.keys = Object.keys(this.requests.mappings);

            this.openModelLinks(); 

        } 

        static XHR(ref, options) { 
            let _xhr = new XMLHttpRequest(), 
                _id = ref.match(/[\w\-]+(?=\.\w+$)/g)[0]; 

            _xhr.open("GET", ref, true); 
            Dashing.requests ? true : Dashing.requests = {}; 
            Dashing.responses ? true : Dashing.responses = {}; 
            Dashing.requests[_id] = _xhr; 
            Dashing.responses[_id] = false; 

            _xhr.onload = options.onload ? function LoadRef(e) {
                    Dashing.responses[_id] = e.target.responses;
                    options.onload(e);
                } : function LOADREF(e) {
                    Dashing.responses[_id] = e.target.responses; 
                    }; 

            _xhr.onprogress = options.onprogress ? options.onprogress : false; 

            _xhr.onerror = options.onerror ? function ERRORREF(e) {
                Dashing.responses[_id] = `Request Error: ${e.target.responseURL}`; 
                options.onerror(e); 
            } : function ERRORREF(e) { 
                    Dashing.responses[_id] = `Request Error: ${e.target.responseURL}`; 
                }; 

            _xhr.send();
            return _id;
        }

        getLinkHrefs(links) {
            let _urlarray = [];
            for (let i = 0; i < links.length; i++) {
                let link = links[i];
                if (link.hasAttribute("data-model") === true) {
                    let _href = link.getAttribute("href");
                    _urlarray.push(_href);
                    this.requests[_href.match(/[\w\-]+(?=\.[\w\-]+$)/g)[0]] = { appendResources: link.hasAttribute("append-resource") };
                }
            }
            return _urlarray;
        } 
        openModelLinks(modelready) {
            let reqs = this.requests;
            let _links = reqs.hrefs; 
            for (let z = 0; z < _links.length; z++) { 
                let _href = _links[z].match(/[\w\-]+(?=\.[\w\-]+$)/g)[0], 
                    _insert = reqs[_href], 
                    _xlink = document.createElement(`x-link`),
                    _callbacks = reqs.mappings[_href];

                _xlink.load = _callbacks.load;
                _xlink.progress = _callbacks.progress;
                _xlink.error = _callbacks.error;

                _xlink.href = _links[z];


            }
        } 
    } 

    class Cases { 
        constructor(condition, cases) {

        } 
        success(e, _super, _this) {

        } 
        error(e, _super, _this) {

        } 
    } 

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
                for (var i = 0; i < mxnkeys.length; i++) {

                    updateScopeMixins[keys[i]] = mixin[keys[i]];

                }

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

    class Toggle { 
        constructor(obj, args) {
            this.toggleGroups = { length: 0 }; 
            this.toggle = document.getElementById(args[0]); 
            this.display = obj.display; 
            if (obj.group === true) {
                this.add("toggle-group", obj["toggle-group"]);
            }
            else if (obj.button === true) {
                this.add("toggle-button", obj);
            }
        } 
        add(name, def) { 
            switch (name) {
                case "toggle-group":
                    if (this.toggleGroups[def.name] === undefined) {
                        this.toggleGroups[def.name] = def;
                        // Create the group object and than assign events to the provided elements.
                    }
                    return name;
                case "toggle-button":
                    let tar = this.display;
                    xtag.addEvent(this.toggle, "click", function onShow(e) {
                        if (e.target.hasAttribute("active") === true) {
                            e.target.removeAttribute("active");
                            if (tar.hide) {
                                tar.hide();
                            }
                            else { console.info("Please provide a hide method form your custom element."); }
                        }
                        else {
                            e.target.setAttribute("active", "true");
                            if (tar.show) {
                                tar.show();
                            }
                            else { console.info("Please provide a show method form your custom element."); }
                        }
                    });
                    return name;
            }
        } 
    } 

    class CCSyntax { 
        constructor(options) { 
            this.commandCache = []; 
            xtag.merge(this, options || {}); 
        } 
        parseCCSLine(line) { 
            let ln = "", 
                paramln = "", 
                arr = [], 
                paramarr = [], 
                stoken = false,
                istoken = "",
                _tokens = { "[": "arrays", "{": "literals", "(": "strings", "|": "numbers" }; 

            for (let z = 0; z < line.length; z++) { 
                let chr = line[z]; 
                if (/\;/.test(chr)) { 
                    arr.push({ 
                        cmd: ln, 
                        params: paramarr, 
                        token: istoken
                    }); 
                    ln = ""; 
                    paramarr = [];
                } 
                else if (/[\{\[\(\|]/.test(chr) && stoken === false) {
                    stoken = true; 
                    istoken = _tokens[chr];
                }
                else if (/[\}\]\)\|]/.test(chr)) {
                    paramarr.push(paramln); 
                    paramln = ""; 
                    stoken = false; 
                } 
                else if (stoken === true && /\,/.test(chr) === true) {
                    paramarr.push(paramln); 
                    paramln = ""; 
                }
                else if (stoken === true) { paramln += chr; } 
                else { ln += chr; } 
            } 
            return arr;
        }
        compileCCSLine(_ccs, data) { 
            let arr = [];
            for (var n = 0; n < data.length; n++) {
                var ccsobj = _ccs[data[n].token];
                arr.push({
                    cmd: this[data[n].cmd],
                    params: data[n].params
                });
            }
            return arr;
        } 
        executeCCSStack(_ccs) {
            for (var z = 0; z < _ccs.length; z++) {
                _ccs[z].cmd(_ccs[z].params); 
            }
            return true;
        }
        // Command keys start
        write(args) {  }
        create(args) { 
            let _case = args[0];
            switch (_case) {
                case "databook":
                    break;
                case "datasheet":
                    break;
                case "datalist":
                    break;
                case "datacell":
                    break;
            }
        }
        remove(args) {  }
        edit(args) {  }
        merge(args) {  }
        sum(args) {  }
        pow(args) {  }
    } 
    const ccs = new CCSyntax();

    class pioDB extends Conditions { 
        constructor(data, conditions, args) {
            //
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
            var _dbq = window.indexedDB.open(name || "PioDashed", query.version || undefined);
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
                    query[("onerror"||"noop")](e);
                    return { allready: false, message: `Error: Stores not upgraded for, ${name}` };
                }
                var _reqg = storage.get(_key);
                _reqg.onsuccess = query.success ? function QuerySuccess(e, fn) {
                    Dashing.DBReadyBoolean.queried ? Dashing.DBReadyBoolean.queried.push(query.store + "." + query.key) : false;
                    Dashing.DBReadyBoolean.currentQuery = _reqg.result || false;
                    if (query.update === true) {
                        var data = e.target.result;
                            data = query.value;
                        var _put = storage.put(data, query.key);
                            _put.onsuccess = function PutSuccess(e) {
                            Dashing.DBReadyBoolean.currentQuery = _reqg.result || false;
                        };
                            _put.onerror = function PutSuccess(e) { Dashing.DBReadyBoolean.currentQuery = e; };
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
        static open(name, opts) {
            var _pio = window.indexedDB.open(name || "PioDashed");
            return _pio;
        } 
        upgrade(db, version, options) {
            if (typeof db === "string") {
                var _piup = window.indexedDB.open(db, version);

                _piup.onupgradeneeded = function PioUpgrade(e) {
                    if (options.upgrade) {
                        // 
                    }
                    else if (options.transactions) {
                        // 
                    }
                    else {
                        // 
                    }
                };

                _piup.onsuccess = function PioSucces(e) {
                    //
                };

                _piup.onerror = function OnError(e) {
                    // 
                };
            }
            else if (this.toString() === " [object HTMLElement]"){
                // 
            }
        } 
    } 

    var Dashing = null; 
    class dashboard { 
        constructor(dashed) {
            Dashing = this;
            var appHeader = document.head,
                importLinks = appHeader.querySelectorAll("link[rel='prefetch']"),
                keys = Object.keys(dashed),
                protokeys = [];

            // set xtags dependency namespace
            this.xtags = dashed.xtags;

            // set the namespace components
            this.namespaces = dashed.namespaces;

            // set the platform prompt
            this.platformPrompt = dashed.platformPrompt === undefined ? false : dashed.platformPrompt;
            // set the start screen
            this.startscreen = dashed.startscreen === undefined ? false : dashed.startscreen;

            // set the rootElement
            this.rootElement = document.querySelector(dashed.rootElement) || document.querySelector("x-extension");

            // Set added properties
            protokeys = Dashing.setAddedProps(dashed);

            // Check for prototyped keys
            Dashing.fireProps(dashed, keys, protokeys);

            // Init the onStart callback
            dashed.onStart === undefined ? null : dashed.onStart(dashboard.prototype);

            // Set a pio success callback
            this.onPioSuccess = dashed.onPioSuccess;
            
            // Set a pio transactions callback for upgrades
            this.onPioUprade = dashed.onPioUgrade;

            // Build Components 
            var els = Dashing.build(dashed.namespaces, dashed); 
                Dashing.built = els; 

            // Register Elements with x-tags if x-tag = true 
            if (Dashing.xtags) { 
                var z = 0, nms = Object.keys(Dashing.built); 
                // Register the componensts using xtag's registration method. 
                for (var name = 0; name < nms.length; name++) { 
                    xtag.register(Dashing.namespaces[name], Dashing.built[nms[name]]); 
                    z++; 
                } 
                Dashing.ReadyBoolean.buildReady = true; 
            }

            let ddb = this.LocalDB.dbconnection = Dashing.pioDB.open("PioDashed"); 

            // Upgrade CallBack
            ddb.onupgradeneeded = function DashedDBUpgrage(e) {
                Dashing.LocalDB.upgrade = true;

                Dashing.rootElement.userRequestServices("PioPatron", "PioDashed", 1);

            }; 

            // Success CallBack
            ddb.onsuccess = function DashedDB(e) { 
                Dashing.LocalDB.success = true;

                Dashing.LocalDB[e.target.result.name] = {
                    version: e.target.result.version
                };

                if (Dashing.LocalDB.upgrade === false) {

                    Dashing.LocalDB.model = new Dashing.model(importLinks, dashed.onModelLoaded || noop); 
                } 
                else {
                    Dashing.LocalDB.model = new Dashing.model(importLinks, dashed.onModelLoaded || noop);
                } 

            }; 
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
            for (var i = 0; i < (nm || []).length; i++) {
                // Parse name space to camel case
                var nms = nm[i].replace(/\-\w/g, function (stg) {
                    var r = stg.toUpperCase();
                    return r[1];
                });
                comps[nms] = {};
            }
            comps = def.components(comps);
            return comps;
        } 
        write(msg, target, frag) {
            // frag must be a function that return a HTMLElement
            var _frag = frag(msg);
            target.appendChild(_frag);
            return _frag;
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
        fireProps(dashed, keys, protokeys) {
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
                gingerbread = /Android 2\.3.+AppleWebKit/.test(navigator.userAgent),
                response = {};
            response.browser = browmtc ? browmtc[0] : "Error: The browser you're using couldn't be found.";
            response.oldiOS = oldiOS;
            response.oldDroid = oldDroid;
            response["android_v2-3"] = gingerbread;
            return response;
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
        get templates() { return dashboard.prototype.writer.templated || false; } 
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
            };
        } 
        set platform(Platform) {
            // Enhancement: create a theme class with getters and setters for platform and other properties
            this.themed ? true : this.themed = {};
            this.themed.platform = Platform;
        } 
        get platform() { return this.themed.platform || false; } 
        get writer() { 
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
                            _btnGridCols = table.buttonGridSpan ? "data-colspan='" + table.buttonGridSpan + "'" : "",
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
                                        ${_message || `<p>Welcome!</p>`}
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
                            _msg = typeof _prompt.message === "undefined" ? "" : _prompt.message,
                            _class = _prompt.class === undefined ? "modal-prompt" : _prompt.class,
                            _id = _prompt.id === undefined ? "modal-prompt" : _prompt.id,
                            _focus = _prompt.focus === undefined ? "" : "data-focus='" + _prompt.focus + "'",
                            _active = _prompt.active === undefined ? "" : "active='" + _prompt.active + "' overlay=''";

                        return xtag.createFragment(`<x-modal id="${_id}" class="${_class}" modal-index="${document.getElementsByTagName("x-modal").length + 1}" type="selection" data-focus="true" data-options='${_opts}' theme="single-column" grid-template="1" ${_active} ${_focus} >
                                    <section class="text-warning"><p>${_msg}</p></section>
                                </x-modal>`);
                    }, 
                    "prompter": function Prompter(prompt, _form) {
                        let _pid = prompt.id !== undefined ? `id="${prompt.id}"` : "",
                            _pclass = prompt.class !== undefined ? `class="${prompt.class}"` : "",
                            _pmessage = prompt.message !== undefined ? prompt.message : "",
                            _fmessage = _form.message !== undefined ? _form.message : "",
                            _fid = _form.id !== undefined ? `id="${_form.id}"` : "",
                            _fclass = prompt.class !== undefined ? `class="${_form.class}"` : "";
                        let _confirm = "";
                        if (_form.confirm !== undefined && _form.confirm === true) { _confirm = `<input type="button" value="Confirm" />`; }
                        let _prompter = `<x-modal type="prompt"  ${_pid} ${_pclass}>
                            <section prompt-message="true">${_pmessage}</section>
                            <form ${_fid} ${_fclass}>
                                <fieldset>
                                    ${_fmessage}
                                </fieldset>
                                ${_confirm}
                            </form>
                        </x-modal>`;
                        return xtag.createFragment(_prompter);
                    }, 
                    "_blank": function _Blank(template, details) {
                        var parent = template.fragment || xtag.createFragment(`div`);
                            parent.firstElementChild.innerHTML = details.omsg || "";
                        return parent;
                    },
                    "table-cell": function TableCell(_table, opts) {
                        let frag = xtag.createFragment(`<form> 
                            <section> 
                                <strong>$:</strong> <input type="text" placeholder="#" /> 
                                <button type="button" value="Confirm">Confirm</button> 
                            </section> 
                        </form>`);
                        return frag;
                    }, 
                    length: 5
                }, 
                templater: function templater(named, templatee) {
                    dashboard.prototype.writer.templated.length++;
                    dashboard.prototype.writer.templated[named] = templatee;
                }, 
                draw: function draw(type, attrs, frags, hasTypeCallback) { 
                    var _frag = this.templated[type.name](attrs.parent, attrs.child).firstElementChild; 

                    // check for hasTypeCallback parameter callback must be named [not anonymouse] [Needs Implementation] 
                    if (typeof hasTypeCallback === "object") { this[type.name] = hasTypeCallback; } 
                        frags ? _frag.appendChild(frags) : null; 
                    // check for template callback that accompanies the template type 
                    if (this[type.name] && typeof this[type.name].creator === "function") { this[type.name].creator(_frag, attrs || false); }
                    // append node to type target root 
                    type.target.appendChild(_frag); 
                    if (this[type.name] && typeof this[type.name].events === "object") { Dashing.on(type.target, this[type.name].events); } 
                    return _frag; 

                } 
            }; 
        } 
    } 

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
        "selection-prompt": function SelectionPrompt(_prompt, selection) {
            var _opts = typeof _prompt.values === "undefined" ? '' : JSON.stringify(_prompt.values),
                _msg = typeof _prompt.message === "undefined" ? "" : _prompt.message;
            return xtag.createFragment(`<x-modal modal-index="${document.getElementsByTagName("x-modal").length + 1}" type="selection" data-focus="true" overlay="" click-hide="" data-options='${_opts}' theme="single-column" data-grid-template="1">
                    <section class="text-warning"><p>${_msg}</p></section>
                </x-modal>`);
        } 
    }); 

    var modaled = dashboard.prototype.modaled = { length: 0 }; 
    Dashing = new dashboard({
        namespaces: ["x-extension", "x-book", "x-page", "x-table", "x-header", "x-footer", "x-shiftbox", "x-tabbox", "x-modal", "x-message", "x-link"],
        onStart: function StartShopCenter() {

            Dashing.ReadyBoolean === undefined ? Dashing.ReadyBoolean = { buildReady: false } : true;
            Dashing.ModelReady === undefined ? Dashing.ModelReady = { successCount: 0 } : true;
            Dashing.DBReadyBoolean === undefined ? Dashing.DBReadyBoolean = {} : true;
            Dashing.LocalDB === undefined ? Dashing.LocalDB = {
                success: false,
                upgraded: false,
            } : true;
            Dashing.themed === undefined ? Dashing.themed = {} : true;

            xtag.addTransition("fade-in", {
                attrs: {
                    active: "boolean",
                    selected: "boolean",
                    focus: "boolean",
                    transition: "string",
                    hidden: "boolean",
                    shown: "string"
                }
            });

            xtag.addTransition("fade-out", {
                attrs: {
                    active: "boolean",
                    selected: "boolean",
                    focus: "boolean",
                    transition: "string",
                    hidden: "boolean",
                    shown: "string"
                }
            });

            xtag.addTransition("slide-down", {
                attrs: {
                    active: "boolean",
                    selected: "boolean",
                    focused: "boolean",
                    transition: "string",
                    hidden: "boolean",
                    shown: "string"
                }
            });

            xtag.addTransition("slide-up", {
                attrs: {
                    active: "boolean",
                    selected: "boolean",
                    focused: "boolean",
                    transition: "string",
                    hidden: "boolean",
                    shown: "string"
                }
            });

            xtag.addTransition("slide-left", {
                attrs: {
                    active: "boolean",
                    selected: "boolean",
                    focused: "boolean",
                    transition: "string",
                    hidden: "boolean",
                    shown: "string"
                }
            });

            xtag.addTransition("slide-right", {
                attrs: {
                    active: "boolean",
                    selected: "boolean",
                    focused: "boolean",
                    transition: "string",
                    hidden: "boolean",
                    shown: "string"
                }
            });

            xtag.addTransition("grow-up", {
                attrs: {
                    active: "boolean",
                    selected: "boolean",
                    focused: "boolean",
                    transition: "string",
                    hidden: "boolean",
                    shown: "string"
                }
            });

            xtag.addTransition("grow-down", {
                attrs: {
                    active: "boolean",
                    selected: "boolean",
                    focused: "boolean",
                    transition: "string",
                    hidden: "boolean",
                    shown: "string"
                }
            });

            xtag.addTransition("grow-left", {
                attrs: {
                    active: "boolean",
                    selected: "boolean",
                    focused: "boolean",
                    transition: "string",
                    hidden: "boolean",
                    shown: "string"
                }
            });

            xtag.addTransition("grow-right", {
                attrs: {
                    active: "boolean",
                    selected: "boolean",
                    focused: "boolean",
                    transition: "string",
                    hidden: "boolean",
                    shown: "string"
                }
            });

        },
        startscreen: document.querySelector("#dashed-prompt"),
        onModelLoaded: function OnModelLoaded() {
            Dashing.fnQuery(`x-modal[type="startup"] x-table[type="indexed-database"]>key.memory`, function ModelLoadedKey(doc) {
                var _keydoc = document.createElement("key");
                _keydoc.className = "memory";
                _keydoc.innerHTML = "ModelStart";
                doc.insertAdjacentElement("afterend", _keydoc);
            });
            Dashing.fnQuery(`x-modal[type="startup"]>x-table[type="indexed-database"]>value`, function ModelLoadedValue(doc) {
                doc.className = "memory";
                var _valdoc = document.createElement("value");
                    _valdoc.innerHTML = "PioDashed model started.";
                    doc.className = "memory";
                    doc.insertAdjacentElement("afterend", _valdoc);
            });
            window.setTimeout(function () {
                Dashing.fnQuery(`x-table[type="indexed-database"]>svg[data-svg-icon="hourglass-start"]`, function PatronSuccessResponseValueTO(doc) {
                    doc.setAttribute("class", "rel");
                });
            }, 2000);

            return {
                icos: {
                    load: function (e) {
                        Dashing.rootElement.icos = e.target.response;
                    }
                },
                JsonSchema: {
                    load: function (e) {
                        Dashing.rootElement.scheme = e.target.response;
                    }
                }
            };

        },
        onPioSuccess: function (e) {
            console.log(e);
        },
        components: function Components(elems) {

            elems.xLink = class xLink extends HTMLElement { 
                appendResources(target, frag) {
                    if (target) {
                        target.appendChild(frag);
                    }
                    else {
                        this.appendChild(frag);
                    }
                }
                parseResources(data) {
                    //
                }
                attrs() {
                    return {
                        load: {
                            set: function (fn) { this._load = fn; },
                            get: function () { return this._load; }
                        },
                        progress: {
                            set: function (fn) { this._progress = fn; },
                            get: function () { return this._progress; }
                        },
                        error: {
                            set: function (fn) { this._error = fn; },
                            get: function () { return this._error; }
                        },
                        href: {
                            get: function GetHref() { return this.getAttribute("href"); }, 
                            set: function SetHref(val) {
                                let opts = {}; 
                                opts.onerror = this.error || noop;
                                opts.onload = this.load || noop;
                                opts.onprogress = this.progress || noop;
                                Dashing.model.XHR(val, opts) || noop;
                            }
                        }
                    };
                }
            }

            elems.xExtension = class xExtension extends HTMLElement {
                // Mixins 
                mixins() { return ["dashed", "typed", "themed"]; }
                // Methods 
                textInputFilter(onTalk, Read, details) {
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

                }
                userRequestServices(isInNeedOf, target, assistant, optionals) {
                    // get the reqeusted service 
                    switch (isInNeedOf) {
                        case "DBTable":
                            let _dbid = xtag.uid().toString();
                            Dashing.writer.draw({ name: "_blank", target: target }, {
                                parent: { fragment: xtag.createFragment(`<x-table id="${_dbid}" type="indexed-database" theme="db-responses" database-active="PioDashed" allow-pagination="true" allow-menu="DB Menu" menu-position="top" allow-refresh="true"></x-table>`) },
                                child: { omsg: assistant }
                            }, xtag.createFragment(`<svg width="25px" height="25px" class="rel spinner-1" data-svg-icon="hourglass-start"><use class="database-hourglass" width="25px" height="25px" xlink:href="#hourglass-start" /></svg>`), {
                                    creator: function Creator(doc) {
                                        doc.querySelector("svg[data-svg-icon='hourglass-start']");
                                    }
                                });
                            return true;
                        case "PioPatron":
                            let _db = Dashing.LocalDB.dbconnection,
                                _rbdid = xtag.uid().toString();
                            if (Dashing.rootElement.jsonSchema && Dashing.rootElement.jsonSchema.indexedDB === true) {
                                // Enhancement needed for users who have already created a local database entry and have update the json schema 
                                return true;
                            }

                            if (Dashing.LocalDB.success === true) {
                                try {
                                    var transact = _db.result.transaction("Patron", "readonly");
                                    transact.oncomplete = function CompletePioPatronTransact(e) {
                                        // I don't know how the element that this query gets here.
                                        window.setTimeout(function () {
                                            let _remove_trash = document.body.lastElementChild;
                                            if (_remove_trash.hasAttribute("style") && _remove_trash.nodeName === "DIV") { document.body.removeChild(_remove_trash); }
                                        }, 1000);
                                        console.log("transaction complete");
                                    };
                                    transact.onerror = function ErrorPioPatronTransact(e) {
                                        console.log("transaction error");
                                    };
                                }
                                catch (e) {
                                    Dashing.fnQuery("svg[data-svg-icon='hourglass-start']", function HOURGLASS_FNQUERY(doc) {
                                        if (doc) {
                                            window.setTimeout(function () {
                                                Dashing.fnQuery(`x-modal[type="startup"] x-table[type="indexed-database"]>key.memory`, function PatronSuccessResponseKeyTO(doc) {
                                                    var _keydoc = document.createElement("key");
                                                    _keydoc.className = "memory";
                                                    _keydoc.innerHTML = "PatronSuccess";
                                                    doc.insertAdjacentElement("afterend", _keydoc);
                                                });

                                                Dashing.fnQuery(`x-modal[type="startup"]>x-table[type="indexed-database"]>value`, function PatronSuccessResponseValueTO(doc) {
                                                    doc.className = "memory";
                                                    var _valdoc = document.createElement("value");
                                                    _valdoc.innerHTML = "PioDashed opened.";
                                                    doc.className = "memory";
                                                    doc.insertAdjacentElement("afterend", _valdoc);
                                                });
                                                setTimeout(function PatronDocSuccessTimeout() { doc.setAttribute("class", "rel"); }, 1000);
                                            }, 1000);
                                        }
                                    });
                                }
                                finally {
                                    // 
                                }

                            }
                            else if (Dashing.LocalDB.upgrade === true && Dashing.LocalDB.success === false) {
                                // If localDB isn't set the source of the request is the user.
                                // Reset the PioDashed Patron Store
                                var patron = _db.result.createObjectStore("Patron", { autoIncrement: false });

                                patron.createIndex("alias", "alias", { unique: true });
                                patron.createIndex("coaliases", "coaliases", { unique: true });
                                patron.createIndex("dbname", "dbname", { unique: true });
                                patron.createIndex("initiated", "initiated", { unique: true });
                                patron.createIndex("platform", "platform", { unique: true });
                                patron.createIndex("version", "version", { unique: true });

                                window.setTimeout(function () {
                                    Dashing.fnQuery(`x-modal[type="startup"] x-table[type="indexed-database"]>key.memory`, function PatronSuccessResponseKeyTO(doc) {
                                        var _keydoc = document.createElement("key");
                                        _keydoc.className = "memory";
                                        _keydoc.innerHTML = "PatronSuccess";
                                        doc.insertAdjacentElement("afterend", _keydoc);
                                    });
                                    Dashing.fnQuery(`x-modal[type="startup"]>x-table[type="indexed-database"]>value`, function PatronSuccessResponseValueTO(doc) {
                                        doc.className = "memory";
                                        var _valdoc = document.createElement("value");
                                        _valdoc.innerHTML = "PioDashed upgraded.";
                                        doc.className = "memory";
                                        doc.insertAdjacentElement("afterend", _valdoc);


                                        setTimeout(function PatronDocSuccessTimeout() {
                                            document.body.querySelector("svg[data-svg-icon='hourglass-start']").setAttribute("class", "rel");
                                        }, 1000);
                                    });

                                    console.log(document.body.lastElementChild);
                                    // I don't know how the element that this query gets here.
                                    let _remove_trash = document.body.lastElementChild;
                                    if (_remove_trash.hasAttribute("style") && _remove_trash.nodeName === "DIV") { document.body.removeChild(_remove_trash); }
                                }, 1000);

                            }
                            else {
                                //
                            }
                            return true;
                        case "PioInit":
                            var dbname = target.dbname || assistant.id || assistant.meta.id || "PioDashed",
                                alias = target.alias || assistant.meta.name || "Magi",
                                ver = assistant.meta.version + 1,
                                db = new Dashing.pioDB({
                                    alias: target.alias,
                                    name: dbname,
                                    dbopen: true,
                                    init: false,
                                    update: function PioInit(e) {
                                        var _db = e.target.result,
                                            hasPatron = _db.objectStoreNames.contains("Patron");
                                        if (hasPatron === false) {
                                            var store = _db.createObjectStore("Patron", { autoIncrement: false });
                                            store.transaction.oncomplete = function PioPatronInitComplete(e) {

                                                var pioDBT = _db.transaction("Patron", "readwrite").objectStore("Patron");
                                                pioDBT.add(Dashing.DBReadyBoolean.alias || "Magi", "alias");
                                                pioDBT.add("", "coaliases");
                                                pioDBT.add(Dashing.DBReadyBoolean.dbname || "PioDashed", "dbname");
                                                pioDBT.add(Dashing.themed.platform || "Desktop", "dbname");
                                                pioDBT.add(true, "initiated");
                                                pioDBT.add(ver, "version");
                                                pioDBT.add(Dashing.platform.type || "Desktop", "platform");

                                            };
                                            store.transaction.onerror = function InitPioError(e) { throw "Error [Transaction Error]: " + e; };
                                            Dashing.DBReadyBoolean.init = db.name;
                                            Dashing.rootElement.jsonSchema.meta.version = db.version || 1;
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
                                            for (var i = 0; i < _inputs.length; i++) { if (!_inputs[i].checked) { _allready = false; } }
                                            if (_allready === true) {
                                                Dashing.DBReadyBoolean.status = "complete";
                                            }
                                            return { allready: _allready };
                                        }
                                    }, ["InitialCondition"]);
                            return db;
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
                getValues(_form) {
                    var _obj = {};
                    for (var child = 0; child < _form.length; child++) {
                        _form[child].type === "text" ? _obj[_form[child].id || xtag.uid()] = _form[child].value : false;
                        _form[child].type === "radio" ? _obj[_form[child].id || xtag.uid()] = _form[child].checked : false;
                        _form[child].type === "checkbox" ? _obj[_form[child].id || xtag.uid()] = _form[child].checked : false;
                    }
                    return _obj;
                }
                addPlugin(nm, _content, _css, _scripts) {
                    // 
                }

                // Lifecycle Callbacks
                created() {
                    var creationDetailing = Dashing.conditions.ConditionDetail({
                        active: null,
                        focused: null,
                        plugins: null
                    }, "ReadyBoolean");

                }
                removed() {
                    this.closeDashed(this.schemes);
                }
                // Attributes 
                attrs() {
                    return {
                        icos: {
                            set: function SetIcos(val) { 
                                let icos = xtag.createFragment(val); 
                                this.appendChild(icos.firstElementChild); 
                                this.setAttribute("icos", "true"); 
                            }, 
                            get: function GetIcos(val) { return this.getAttribute("icos"); } 
                        }, 
                        scheme: { 
                            set: function SetSchemes(jsnString) {
                                var jsn = "";
                                try {
                                    jsn = JSON.parse(jsnString);
                                    this.setAttribute("scheme", "true");

                                }
                                catch (e) {
                                    jsn = {
                                        keys: ["data", "templates", "worlds", "silos", "spreadsheets", "data"],
                                        data: { length: 0 },
                                        plugins: { keys: [] },
                                        meta: { version: 1, name: "PioDashed", alias: "Magi" },
                                        worlds: { length: 0 },
                                        silos: { length: 0 },
                                        templates: { length: 0 }
                                    };
                                    this.setAttribute("scheme", "default");
                                }
                                finally { this.jsonSchema = jsn; }
                            }, 
                            get: function GetSchemes() { return this.getAttribute("scheme"); } 
                        } 
                    }; 
                } 
                // Events 
                events() {
                    return {
                        config: function Config(e) {
                            var _form = e.detail.startscreen.querySelector("form");
                            _form.innerHTML = "";
                        }
                    };
                } 
            }; 

            elems.xBook = class xBook extends HTMLElement { 
                mixins() {
                    return ["dashed", "typed", "themed"];
                } 
                created() {
                    var book = this;
                    this.querySelectorAll("x-page").forEach(function (node, i) {
                        if (Number(book.page) - 1 === i) { node.active = true; }
                    });

                } 
                inserted() {
                    this.allowTabs = this.allowTabs;
                } 
                attrs() {
                    return {
                        page: {
                            set: function (val) { this.setAttribute("page", val); },
                            get: function () { return this.getAttribute("page"); }
                        }
                    };
                } 
                events() { 
                    return { 
                        'click:delegate(button[page-left="true"])': function PageLeft(e) {
                            var index = Number(this.parentNode.page),
                                pages = this.parentNode.querySelectorAll("x-page");
                            if (index <= 1) {
                                this.parentNode.page = pages.length;
                                    pages[0]._hide();
                                    pages[pages.length - 1]._show();
                            }
                            else {
                                this.parentNode.page = Number(index - 1);
                                    pages[index - 1]._hide();
                                    pages[index - 2]._show();
                            }
                        }, 
                        'click:delegate(button[page-right="true"])': function PageRight(e) { 
                            var index = Number(this.parentNode.page), 
                                pages = this.parentNode.querySelectorAll("x-page"); 
                            if (index >= pages.length) {
                                this.parentNode.page = 1;
                                    pages[pages.length - 1]._hide();
                                    pages[0]._show();

                            } 
                            else { 
                                this.parentNode.page = Number(index + 1); 
                                    pages[index - 1]._hide();
                                    pages[index]._show();

                            } 
                        } 
                    }; 
                }
            };

            elems.xPage = class xPage extends HTMLElement {
                mixins() { return ["typed", "themed"]; }

                created() {
                    this.activeContent = this.activeContent; 
                }
                inserted() { }

                '_hide:_transition(boolean,hide,selected,active)'(fn) {
                    if (fn === undefined || fn === false) {
                        return {
                            height: "1s",
                            width: "1s",
                            left: "1s",
                            opacity: "1s",
                            delta: {
                                left: "0%",
                                height: "100%",
                                width: "100%",
                                opacity: "1"
                            },
                            initial: {
                                left: "100%",
                                height: "0%",
                                width: "0%",
                                opacity: "0"

                            }
                        };
                    }
                    else {
                        let r = typeof fn === "function" ? fn() : false;
                        return r;
                    }
                } 
                '_show:_transition(boolean,show,selected,active)'(fn) {
                    if (fn === undefined || fn === false) {
                        return {
                            height: "1s",
                            width: "1s",
                            left: "1s",
                            delta: {
                                height: "100%",
                                width: "100%",
                                left: "0%"
                            },
                            initial: {
                                height: "0%",
                                width: "0%",
                                left: "100%"

                            },
                            target: `x-page[selected][active][show=""]`
                        };
                    }
                    else {
                        let r = typeof fn === "function" ? fn() : false;
                        return r;
                    }
                } 

                attrs() {
                    return {
                        pluginTitle: {
                            set: function SetPluginPage(val) {
                                this.title = val;
                                this.setAttribute("plugin-title", val);
                            },
                            get: function GetPluginPage() { return this.getAttribute("plugin-title"); }
                        },
                        active: {
                            set: function SetActive(val) { this.show(); },
                            get: function GetActive() { return this.getAttribute("active"); }
                        },
                        activeContent: {
                            get: function GetActivePluginContent() { return this.getAttribute("active-content") || false; },
                            set: function SetActivePluginContent(val) {
                                
                                if (val === false) { return false; }
                                this.setAttribute("active-content", val);
                                this.currentContent = Dashing.model.XHR(val, {
                                    node: this,
                                    onload: function Load(e) {
                                        let frag = xtag.createFragment(`${e.target.response}`),
                                            _content = frag.firstElementChild.content.firstElementChild,
                                            _jsn = _content.nextElementSibling,
                                            _script = null,
                                            _css = frag.firstElementChild.content.querySelectorAll("style");

                                        try { _jsn = JSON.parse(`${_jsn.innerHTML}`); }
                                        catch (e) { console.error(e); }

                                        document.querySelector(`#${this.node.pageWorkspace}`).appendChild(_content);
                                        
                                        for (let i = 0; i < _jsn.scripts.keys.length; i++) {

                                            _script = document.createElement("script");

                                            _script.src = _jsn.scripts[_jsn.scripts.keys[i]];

                                            document.querySelector(`#${this.node.pageWorkspace}`).appendChild(_script);
                                        }
                                        
                                        document.querySelector(`#${this.node.pageWorkspace}`).appendChild(_css[0]);

                                    },
                                    onprogress: function Progress(e) {

                                    },
                                    onerror: function Error(e) {

                                    }
                                });
                            }
                        },
                        selected: {
                            set: function SetSelected(val) {
                                //
                            },
                            get: function GetSelected(val) { return this.getAttribute("selected"); }
                        },
                        transitionStart: {
                            get: function GetTransitionStart() { return this.getAttribute("tranisition-start"); }
                        },
                        transitionEnd: {
                            get: function GetTransitionStart() { return this.getAttribute("tranisition-end"); }
                        },
                        page: {
                            get: function () {
                                return this.getAttribute("page");
                            },
                            set: function (val) {
                                this.setAttribute("page", val);
                            }
                        },
                        pages: {
                            get: function () {
                                return this.getAttribute("pages");
                            },
                            set: function (val) {
                                this.setAttribute("pages", val);
                                if (this.parentNode.nodeName === "X-BOOK") {
                                    this.Pages = this.parentNode.querySelectorAll(`x-page`);
                                }
                            }
                        },
                        index: {
                            get: function () {
                                return Number(this.getAttribute("index"));
                            },
                            set: function (val) {
                                this.setAttribute("index", val);
                            }
                        },
                        pageWorkspace: {
                            set: function SetWorkspace(val) {
                                this.setAttribute("page-workspace", val);
                                this.workspace = document.getElementById(val);
                            },
                            get: function GetWorkspace() { return this.getAttribute("page-workspace"); }
                        },
                        pageSidebar: {
                            set: function SetPageSidebar(val) {
                                this.setAttribute("page-sidebar", val);
                                this.sidebar = document.getElementById(val);
                            },
                            get: function GetPageSidebar() { return this.getAttribute("page-sidebar"); }
                        }
                    };
                }

                events() {
                    return {
                        "mousedown:delegate(button[sibebar-event])": function (e) {
                            if (this.hasAttribute("plugin") && this.hasAttribute("plugin-event")) { /* */ }
                            else { /* */ }
                        }
                    };
                }
            };

            elems.xHeader = class xHeader extends HTMLElement {
                mixins() { return ["dashed", "typed", "themed"]; }
                created() { /* || */ }
            };

            elems.xFooter = class xFooter extends HTMLElement {

            };

            elems.xShiftbox = class extends HTMLElement {
                created() { /* */ }
                inserted() { /* */ }
                removed() { /* */ }
            };
            elems.xTabbox = class xFooter extends HTMLElement {
                events() {
                    return {
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
                            if (panel) { panel.setAttribute('selected', ''); }
                            if (fireSelected) {
                                xtag.fireEvent(this, 'tabselected', {
                                    detail: {
                                        currentTab: tab,
                                        currentPanel: panel,
                                        previousTab: previous[0],
                                        previousPanel: previous[1]
                                    }
                                });
                            }
                        },
                        'selectEvent': function selectEvent(e) {
                            if (this.selectedIndex !== Number(e.detail.index)) {
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
                    };
                }
                created() {
                    this.selectedIndex = this.selectedIndex;
                }
                inserted() { xtag.fireEvent(this, "selectEvent", { detail: { index: Number(this.selectedIndex) } }); }
                attrs() {
                    return {
                        tabElements: {
                            get: function TabElements() {
                                return xtag.queryChildren(this, 'menu > *');
                            }
                        },
                        panelElements: {
                            get: function PanelElements() {
                                return xtag.queryChildren(this, 'ul');
                            }
                        },
                        selectedIndex: {
                            set: function (val) {
                                this.setAttribute("selected-index", val);
                            },
                            get: function () {
                                return this.getAttribute("selected-index");
                            }
                        },
                        selectedTab: (function () { return Dashing.createAccessor("menu > [selected]"); })(),
                        selectedPanel: (function () { return Dashing.createAccessor("menu > [selected]"); })()
                    };
                }
            };

            // Command cell regular expressions
            const testLiteralCmd = /\w+\{[\w\,]+\}\;/g,
                testArrayCmd = /\w+\[[\w\,]+\]\;/g,
                testStringCmd = /\w+\([\w\,]+\)\;/g,
                testNumberCmd = /\w+\|[\d\.]+\|\;/g;
            elems.xTable = class xTable extends HTMLElement {
                mixins() { return ["typed", "themed", "dashed"]; }
                readCellValue(cVal) {
                    let _cmdstg = cVal.value,
                        _haslit = testLiteralCmd.test(cVal.value),
                        _hasarr = testArrayCmd.test(cVal.value),
                        _hasstg = testStringCmd.test(cVal.value),
                        _hasnum = testNumberCmd.test(cVal.value);

                    let obj = {};
                    if (_haslit === true) {
                        obj.literals = _cmdstg.match(testLiteralCmd);
                        testLiteralCmd.lastIndex;
                    }
                    else { testLiteralCmd.lastIndex; }
                    if (_hasarr === true) {
                        obj.arrays = _cmdstg.match(testArrayCmd);
                        testArrayCmd.lastIndex;
                    }
                    if (_hasstg === true) {
                        obj.strings = _cmdstg.match(testStringCmd);
                        testStringCmd.lastIndex;
                    }
                    if (_hasnum === true) {
                        obj.numbers = _cmdstg.match(testNumberCmd);
                        testNumberCmd.lastIndex;
                    }
                    var keylength = Object.keys(obj).length;
                    if (keylength === 0) {
                        obj = "Please provide a properly formated string.";
                    }
                    return obj;
                }
                writeTableMessage(val) {
                    return Dashing.writer.draw({ name: "_blank", target: this.databook || this }, {
                        parent: {
                            fragment: xtag.createFragment(`<x-message message-display="${this.id}" transition-end="fade-up"></x-message>`)
                        },
                        child: {
                            omsg: val
                        }
                    }, undefined, {
                            creator: function _Creator_(node, data) {
                                window.setTimeout(function () { node.setAttribute("transitioning", "fade-up"); }, 100);
                            }
                        });
                }
                cellResponse(msgs) {
                    return Dashing.writer.draw({ name: "_blank", target: this.databook || this }, {
                        parent: {
                            fragment: xtag.createFragment(`<ul is="data-list"></ul>`)
                        },
                        child: msgs
                    }, undefined, {
                            creator: function _Creator_(node, data) {
                                let _msgs = data.child;
                                for (let z = 0; z < _msgs.length; z++) {
                                    let _msg = document.createElement("li");
                                    _msg.setAttribute("is", "data-node");
                                    _msg.innerHTML = _msgs[z];
                                    node.appendChild(_msg);
                                }
                            }
                        });
                }
                removeCell(_cell) {
                    window.removeEventListener(_cell, "keydown");
                    window.removeEventListener(this.tableConfirm, "click");
                    this.tableForm.innerHTML = "";
                }

                created() {
                    this.table = {};
                    this.id ? true : this.id === xtag.uid();
                }
                inserted() {
                    if (this.allowMenu === "true") {
                        this.allowMenu = "<strong>Menu</strong>";
                    }
                    else if (typeof this.allowMenu === "string") {
                        this.allowMenu = `<strong data-menu-title="${this.allowMenu}">${this.allowMenu}</strong>`;
                    }
                    if (this.allowRefresh === "true") { this.allowRefresh = this.querySelector("menu.IDB-table-menu"); }
                    if (this.allowPagination === "true") { this.allowPagination = this.table.menu; }
                    if (typeof this.databaseActive === "string") { this.databaseActive = this.databaseActive; }
                }
                attrs() {
                    return {
                        key: {
                            set: function SetKey(val) {
                                // 
                            }
                        },
                        value: {
                            set: function SetValue(val) {
                                //
                            }
                        },
                        databaseActive: {
                            set: function SetActiveDB(val) {
                                Dashing.writer.draw({ name: "_blank", target: this }, {
                                    parent: {
                                        fragment: xtag.createFragment(`<div class="alert database-opened"></div>`)
                                    },
                                    child: {
                                        omsg: `Database Active: ${val}`
                                    }
                                }, undefined, {});
                                this.setAttribute("database-active", this.databaseActive);
                            },
                            get: function GetActiveDB() { return this.getAttribute("database-active"); }
                        },
                        allowMenu: {
                            set: function SetMenu(val) {
                                this.table.menu = Dashing.writer.draw({ name: "_blank", target: this }, {
                                    parent: {
                                        fragment: xtag.createFragment(`<menu class="IDB-table-menu"></menu>`)
                                    },
                                    child: {
                                        omsg: `<svg width="25" height="25" data-svg-icon="database"><use xlink:href="#database" height="25" width="25" /></svg>${val || "<strong>Menu</strong>"}`
                                    }
                                }, undefined, {
                                        creator: function RefreshDrawer(doc) {
                                            // 
                                        }
                                    });
                                this.setAttribute("allow-menu", val);
                            },
                            get: function GetMenu() { return this.getAttribute("allow-menu"); }
                        },
                        allowDropmenu: {
                            set: function SetDropMenu(dropico) {

                            },
                            get: function GetDropMenu() { return this.getAttribute("allow-dropmenu"); }
                        },
                        allowPagination: {
                            set: function SetPagination(_target) {
                                if (/Element\]$/i.test(_target.toString()) === false) { console.error(`Pagination controls parameter requires an element node target: ${this.nodeName.toLowerCase()}.${this.id}.${this.clasName}`); }
                                this.pagination = Dashing.writer.draw({ name: "_blank", target: _target }, {
                                    parent: { fragment: xtag.createFragment(`<menu type="controls"></menu>`) },
                                    child: {
                                        omsg: `<button type="button"><svg width="25px" height="25px"><use xlink:href="#caret-circle-up" height='25px' width='25px' /></svg></button>
                                               <button type="button"><svg width="25px" height="25px"><use xlink:href="#caret-circle-down" height='25px' width='25px' /></svg></button>`
                                    }
                                }, undefined, {
                                        creator: function RefreshDrawer(doc) {
                                            // console.log(doc);
                                        }
                                    });
                                this.setAttribute("allow-pagination", this.allowPagination);
                            },
                            get: function () { return this.getAttribute("allow-pagination"); }
                        },
                        allowRefresh: {
                            set: function SetRefresh(_tar) {
                                this.table.refresh = Dashing.writer.draw({ name: "_blank", target: _tar }, {
                                    parent: {
                                        fragment: xtag.createFragment(`<button data-svg-icon="sync-alt" type="button"></button>`)
                                    },
                                    child: {
                                        omsg: `<svg width="25px" height="25px" data-svg-icon="sync-alt"><use xlink:href="#sync-alt" height='20px' width='20px' /></svg>`
                                    }
                                }, undefined, {
                                        creator: function RefreshDrawer(doc) {
                                            // console.log(doc);
                                        }
                                    });
                            },
                            get: function GetAllowRefresh() {
                                return this.getAttribute("allow-refresh");
                            }
                        },
                        tableForm: {
                            get: function GetTableForm() { return this.tForm; },
                            set: function SetTableForm(fm) { this.tForm = fm; }
                        },
                        commandCell: {
                            get: function GetCommandCell() { return this.cmdCell; },
                            set: function SetCommandCell(_cell) { this.cmdCell = _cell; }
                        },
                        tableConfirm: {
                            get: function GetTableConfirm() { return this.confirmed; },
                            set: function SetTableConfirm(cfm) { this.confirmed = cfm; }
                        },
                        cellValue: {
                            set: function SetCellValue(val) {
                                this.cValue = val;
                            },
                            get: function GetCellValue(val) {
                                return this.readCellValue(this.cValue);
                            }
                        },
                        message: {
                            get: function GetMessage() {
                                return function GetMessage(index) {
                                    return this.messages[index] || false;
                                };
                            },
                            set: function SetMessage(option) {
                                this.messages[this.messages.length] = { node: option, text: option.textContent };
                                this.messages.length += 1;
                            }
                        },
                        multilineEnabled: {
                            set: function SetMultilineEnabled(target) {
                                let frag = xtag.createFragment(`<button type="button"><h3>+</h3></button>`);
                                target.appendChild(frag);
                                this.multiline = frag;
                            }
                        },
                        dataBook: {
                            get: function getDatabook() { return this.getAttribute("data-book") || false; },
                            set: function setDatabook(val) {
                                if (val === true) {
                                    let dbook = document.createElement("div");
                                    dbook.setAttribute("is", "data-book");
                                    this.databook = dbook;
                                    this.appendChild(dbook);
                                }
                            }
                        }
                    };
                }
            };

            elems.xModal = class xModal extends HTMLElement {
                insertOverlay(modal) {
                    var next = modal.nextElementSibling;
                    if (next) { modal.parentNode.insertBefore(modal.overlayElement, next); }
                    else { modal.parentNode.appendChild(modal.overlayElement); }
                }
                mixins() {
                    return ["dashed", "typed", "themed"];
                }

                'show:_transition(boolean,show,focus,hidden)'(fn) {
                    if (fn === undefined || fn === false) {
                        return {
                            height: "2s",
                            width: "2s",
                            left: "2s",
                            opacity: "2s",
                            delta: {
                                right: "25%",
                                height: "48%",
                                width: "90%",
                                opacity: "1"
                            },
                            initial: {
                                right: "0%",
                                height: "48%",
                                width: "90%",
                                opacity: "1"
                            }
                        };
                    }
                    else {
                        let r = typeof fn === "function" ? fn() : false;
                        if (this.Toggle) this.Toggle.setAttribute("active", "true");
                        return r;
                    }
                }
                'hide:_transition(boolean,hide,focus,hidden)'(fn) {
                    if (fn === undefined || fn === false) {
                        return {
                            height: "1s",
                            width: "1s",
                            opacity: "1s",
                            left: "2s",
                            top: "1s",
                            "background-color": "2s",
                            delta: {
                                height: "0%",
                                width: "0%",
                                "background-color": "rgba(0,0,0,1)",
                                left: "95%",
                                top: "1%",
                                opacity: "1"
                            },
                            initial: {
                                height: "0%",
                                width: "0%",
                                "background-color": "rgba(0,0,0,1)",
                                left: "95%",
                                top: "1%",
                                opacity: "1"
                            }
                        };
                    }
                    else {
                        let r = typeof fn === "function" ? fn() : false;
                        if (this.Toggle) this.Toggle.removeAttribute("active");
                        return r;
                    }
                }

                created() {
                    this.overlayElement = document.createElement('x-modal-overlay');
                    this.formStartup = this.formStartup;
                    this.buttonToggle = this.buttonToggle;
                    this.messagesAllowed = this.hasAttribute("messages-allowed");
                }
                inserted() {
                    if (Dashing.BrowserInfo.oldiOS || Dashing.BrowserInfo.oldDroid) { setTop(this); }
                    // Pass the 'this' element target to the 'database-table setter' to append the db table if needed.
                    if (this.databaseTable === "true") { this.databaseTable = "insert"; }
                }
                removed() {
                    if (this.type === "startup") {
                        (this.parentElement || document.body).removeChild(this.overlayElement);
                        this.xtag.lastParent = null;
                    }
                }

                events() {
                    return {
                        'tap:outer': function TapOuterModal(e) {
                            if (e.target.nodeName !== "X-MODAL-OVERLAY") {
                                return false;
                            }

                            // Check modal type 
                            if (this.type === "startup" || this.type === "modal") {
                                this.hide();
                            }
                        },
                        'tap:delegate(input[value="Create"])': function SubmitModal(e) {
                            var checking = Dashing.conditioned.StartupFormConditions(e, Dashing.conditioned["StartupFormConditions"]),
                                parentModal = this.parentNode.parentNode.parentNode.parentNode.parentNode;

                        },
                        'tap:delegate(button[value="Confirm"])': function ConfirmPlatform(e) {
                            if (this.parentNode.type === "selection") {
                                Dashing.platform = { type: this.parentNode.querySelector('select').value };

                                this.parentNode.outerHTML = "";

                                Dashing.writer.draw({ name: "prompter", target: document.querySelector("x-modal[type='startup']") }, {
                                    parent: {
                                        id: "platform-found-prompt",
                                        class: 'prompt-fadeOut',
                                        message: `Congratulations!`
                                    },
                                    child: {
                                        confirm: false,
                                        message: `You chose the, ${Dashing.platform.type} platform.`
                                    }
                                }, undefined, {
                                        creator: function PromptDrawerCallback(doc) {
                                            window.setTimeout(function PromptRemoveTimeout() {
                                                doc.parentNode.removeChild(doc);
                                            }, 3000);
                                        }
                                    });

                            }
                        },
                        'change:delegate(select)': function ChangePlatform(e) {
                            Dashing.rootElement.setAttribute("platform", this.selectedOptions[0].value.toLowerCase());
                        }
                    };
                }
                attrs() {
                    return {
                        messagesAllowed: {
                            get: function GetMsgsAllowed() { return this.getAttribute("messages-allowed"); },
                            set: function SetMsgsAllowed(val) {
                                this.setAttribute("messages-allowed", val);
                                this.msgsAllowed = val;
                                if (val === true) {
                                    this.messages = {
                                        length: 0
                                    };
                                }
                            }
                        },
                        focus: {
                            set: function SetFocus(val) {
                                if (this.hasAttribute("focus")) {
                                    this.show();
                                }
                                else {
                                    this.hide();
                                }
                            },
                            get: function GetFocus() { return this.getAttribute("focus"); }
                        },
                        responseTarget: {
                            set: function (val) {
                                this.setAttribute("response-target", val);
                                this.display = document.getElementById(val);
                            },
                            get: function () { return this.getAttribute("response-target"); }
                        },
                        databaseTable: {
                            get: function GetDBTable() { return this.getAttribute("database-table") || false; },
                            set: function SetDBTable(val) {
                                if (val === "true") { this.hasDBTable = true; }
                                else if (/insert$/.test(val.toString()) === true) {
                                    this.setAttribute("database-table", "true");
                                    Dashing.rootElement.userRequestServices("DBTable", this, `<key class="memory">AwaitingStart</key><value>Awaiting web application database startup.</value>`);
                                }
                                else { console.error(`Error: Setter option not available for, ${this.nodeName.toLowerCase()}#${this.id}.${this.className}`); }
                            }
                        },
                        formStartup: {
                            get: function GetStartupForm() { return this.getAttribute("form-startup") || false; },
                            set: function SetStartupForm(val) {
                                this.setAttribute("form-startup", val);
                                this.mform = document.getElementById(val);
                            }
                        },
                        buttonToggle: {
                            get: function GetButtonCreate() {
                                return this.getAttribute("button-toggle") || false;
                            },
                            set: function SetButtonCreate(val) {
                                this.setAttribute("button-toggle", val);
                                this.Toggle = document.getElementById(val);
                            }
                        },
                        buttonCreate: {
                            get: function GetButtonCreate() {
                                return this.getAttribute("button-create") || false;
                            },
                            set: function SetButtonCreate(val) {
                                this.setAttribute("button-create", val);
                                this.Create = document.getElementById(val);
                            }
                        },
                        buttonConfirm: {
                            set: function SetSubmitEvent(val) {
                                this.Confirm = document.getElementById(val);
                                if (this.Confirm === undefined) {
                                    var frag = document.createElement("button");
                                    frag.type = "button";
                                    frag.innerHTML = "Confirm";
                                    frag.value = "Confirm";

                                    this.appendChild(frag);
                                    this.Confirm = document.getElementById(val);
                                }
                                this.setAttribute("button-confirm", val);
                            },
                            get: function GetSubmitEvent() { return this.getAttribute("button-confirm"); }
                        },
                        escapeHide: {
                            get: function () { return this.hasAttribute("escape-hide"); },
                            set: function (val) { this.setAttribute("escape-hide", val); }
                        },
                        clickHide: {
                            get: function ClickHide() { return this.hasAttribute("click-hide"); },
                            set: function ClickHide(val) { this.setAttribute("click-hide", "true"); }
                        }
                    };
                }
            };

            elems.xMessage = class xMessage extends HTMLElement {
                created() {
                    this.messageDisplay = this.messageDisplay;
                }
                inserted() {
                    let index = this.display.messages.length;
                    if (this.display.messagesAllowed === true) {
                        this.display.messages[index] = this.textContent;
                        this.display.messages.length += 1;
                    }
                }
                attrs() {
                    return {
                        duration: {
                            get: function GetDuration() { return this.getAttribute("duration") || "2s"; },
                            set: function SetDuration(val) { /**/ }
                        },
                        status: {
                            get: function GetState() { return this.getAttribute("status"); },
                            set: function SetState(val) {
                                this.setAttribute("status", val);
                            }
                        },
                        messageDisplay: {
                            get: function GetMessageDisplay() { return this.getAttribute("message-display"); },
                            set: function SetMessageDsiplay(val) {
                                this.display = document.getElementById(val);
                                this.setAttribute("message-display", val);
                            }
                        }
                    };
                }
            };
            return elems;
        },
        platformPrompt: true,
        xtags: true,
        'add(mixin=dashed)': class Dashed {
            methods(XTagElement) {
                return {
                    writeOptions: function WriteOptions(values) {
                        var frag = document.createElement("select");
                        for (var i = 0; i < values.length; i++) {
                            var _opt = document.createElement("option");
                            _opt.value = values[i];
                            _opt.innerHTML = values[i];
                            frag.appendChild(_opt);
                            i === 0 ? frag.selected = _opt.selected = true : null;
                        }
                        frag.id = i.toString() + this.nodeName.toLowerCase() + "PioSelectables";
                        return frag;
                    },
                    uiSwitch: function UiSwitch(name, opts) {
                        var xbk = Dashing.rootElement.querySelector("x-book[application-start-page]"),
                            xpg = xbk.querySelector(xbk.getAttribute("application-start-page"));
                        switch (name) {
                            case "start-page":
                                Dashing.writer.draw({ name: "_blank", target: xpg },
                                    {
                                        parent: {
                                            // 
                                        },
                                        child: {
                                            // 
                                        }
                                    }, undefined, {

                                    });
                                return name;
                        }
                    }
                };
            }
            attrs(XTagElement) {
                return {
                    render: {
                        set: function SetRender(rend) {
                            console.log(rend);
                        },
                        get: function GetRender() { return true; }
                    }
                };
            }
        },
        'add(mixin=drawing)': class Drawing extends HTMLElement {
            methods(XTagElement) {
                return {};
            }
        },
        'add(mixin=typed)': class Typed {
            methods() {
                return {
                    webapp: function DashioWebApp(e) {
                        this.extensions = {
                            plugins: {}
                        };
                    },
                    startup: function StartUp(e) {
                        this.focus = this.focus;
                        this.insertOverlay ? this.insertOverlay(e.target) : null;
                        this.databaseTable = this.databaseTable;
                    },
                    "plugins": function DashioPluginsType(e) {
                        console.info("Info: Type enhancement needed for " + this.nodeName.toLowerCase() + "[type='plugins'].");
                    },
                    plugin: function DashioPluginsType(e) {
                        let _name = this.getAttribute("plugin-title");
                        
                        this.allowTab = true;
                    },
                    prompt: function Prompt(ev) { 
                        let _APP_DOMRoot = Dashing.rootElement, 
                            transactionPreference = _APP_DOMRoot.userRequestServices("prompt", this, { 
                                onConfirm: function dbconfirmation(e) { e.target.querySelector("form").submit(); }, 
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
                    cell: function CellsTableType() {
                        this.dataBook = true;
                        this.databook.setAttribute("grid-row", "2 1");

                        let frag = Dashing.writer.draw({
                                        name: "table-cell",
                                        target: this
                                    }, {
                                        parent: {
                                            table: this
                                        }
                            }, undefined, {
                                creator: function CreateTableCell(node, data) {
                                    let tcfm = document.createElement("button"); 
                                    tcfm.type = "button";
                                    tcfm.setAttribute("value", "Save Line");
                                    tcfm.innerHTML = "Save Line";
                                    node.firstElementChild.appendChild(tcfm);
                                },
                                events: {
                                    'click:delegate(button[value="Save Line"])': function SaveLine(e) {
                                        let dbup = Dashing.pioDB.open("PioDashed"); 
                                    },
                                    submitCell: function (e) {
                                        let _this = e.detail.target; 
                                        let _val = _this.readCellValue(_this.commandCell),
                                            parseddata = ccs.parseCCSLine(_this.commandCell.value);

                                        if (_val === undefined || _val === "") { return false; } 
                                        else if (typeof _val === "object") { 
                                            let stg = `Literals: ${(_val.literals || []).length}, 
                                               Arrays: ${(_val.arrays || []).length}, 
                                               Strings: ${(_val.strings || []).length}, 
                                               Numbers: ${(_val.numbers || []).length}`; 

                                            let _msg = _this.writeTableMessage(stg); 
                                                this.message = _msg; 
                                            let _val_ = ccs.compileCCSLine(_val, parseddata), 
                                                _stack = ccs.executeCCSStack(_val_), 
                                                totalcmds = (_val.literals || []).length + (_val.arrays || []).length + (_val.strings || []).length + (_val.numbers || []).length; 

                                            _this.cellResponse([ 
                                                `Total Commands: ${totalcmds}`, 
                                                `Ready: ${_stack}` 
                                            ]); 

                                        } 
                                        else if (typeof _val === "string") { 
                                            let msg = _this.writeTableMessage(_val); 
                                                _this.message = msg; 
                                                _this.cellResponse([`Error: Couldn't generate data template. Please check the log messages.`]); 
                                        } 

                                        // 

                                    },
                                    'mousedown:delegate(button[value="Confirm"])': function (e) { xtag.fireEvent(this, "submitCell", { detail: { target: this.parentNode.parentNode.parentNode } }); }, 
                                    'keydown:keypass(13)': function (e) {
                                        e.preventDefault();
                                        xtag.fireEvent(this, "submitCell", { detail: { target: this } });
                                    } 
                                } 
                            }); 

                        this.tableForm = this.querySelector("form"); 
                        this.commandCell = this.tableForm.querySelector("input[type='text']"); 
                        this.tableComfirm = this.tableForm.querySelector("input[value='Confirm']"); 
                        this.messages = { length: 0 }; 

                        this.allowPagination = this.tForm;
                        this.multilineEnabled = this.pagination;
                        this.pagination.setAttribute("menu-position", "top");
                    }, 
                    selection: function ModalSelectionPrompt() { 
                        this.insertBefore(this.writeOptions(JSON.parse(this.getAttribute("data-options")) || []), this.querySelector("button")); 
                        this.submitEvent = true; 
                    }, 
                    webpage: function webapp(ev) { console.info("Info: Type enhancement needed for " + this.nodeName.toLowerCase() + "[type='webpage']."); },
                    drawing: function drawing(e) { this.drawing = {}; },
                    "indexed-database": function (e) { console.info("Info: Type enhancement needed for " + this.nodeName.toLowerCase() + "[type='indexed-database']."); },
                    "modal-book": function modalBook(e, _this) {
                        _this = e.target;
                        if (_this.parentNode.nodeName !== "X-MODAL") { throw "Error [Type Schema]: X-BOOK[TYPE='modal-book'] requires its parent node to be X-MODAL"; }

                        _this.xtag.plugin = {};
                        _this.xtag.plugin.errorPage = _this.querySelector("x-page[response-type='error']");
                        _this.xtag.plugin.loadPage = _this.parentNode.querySelector('x-page[response-type="load"]');
                        _this.xtag.plugin.progressPage = _this.querySelector("x-page[response-type='progressing']");
                    },
                    "modal-page": function modalPage(e) {
                        if (e.target.parentNode.nodeName !== "X-BOOK") { throw "Error [Type Schema]: X-PAGE[TYPE='modal-page'] requires its parent node to be X-BOOK"; }
                        this.xbook = this.parentnode;
                    }
                };
            } 
            attrs() {
                return {
                    conditions: {
                        set: function SetConditions(cond) {
                            // Enhancement for type condition callback events
                        }
                    }
                };
            } 
        }, 
        'add(mixin=themed)': class Themed extends HTMLElement { 
            methods() {
                return {
                    "single-column": function singleColumn(e) {
                        var gt = this.gridTemplate === false ? "1" : this.gridTemplate,
                            themeid = this.id ? this.id : xtag.uid();
                        this.id = themeid;
                        this.themed["single-column" + this.id] = {
                            name: "single-column",
                            isGridTheme: e.detail.isGridTheme,
                            gridRows: Number(gt.match(/\d+$/g)[0]),
                            gridColumns: Number(gt.match(/^\d+/g)[0])
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
                        return true;
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
                    },
                    "db-responses": function DBResponses(e) {
                        
                    },
                    "template-builder": function TemplateBuilder(e) { }
                };
            } 
            attrs() {
                return {
                    gridTemplate: {
                        get: function () {
                            return this.getAttribute("grid-template");
                        },
                        set: function (val) {
                            cnosole.log(this.xtag);
                            this.setAttribute("grid-template", val);
                        }
                    }
                };
            } 
        },
        'add(prototype=toggle)': Toggle,
        'add(prototype=pioDB)': pioDB,
        'add(prototype=model)': Model, 
        'add(prototype=conditions)': Conditions,  
        "toggle(toggle-setup)": {
            button: true,
            display: document.getElementById("dashed-prompt")
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
                    _allready = true;
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
                // this is set to be an optional case but it doesn't report it on the front-end.
                    // I should create another case to define an ignore case (Basically check and let the user know that the option exists). 
                    // All of this should be able to be change once the program is started initially.
                    // So having it as a necessary case doesn't strictly follow the UX idea, either.
                var _allready = false,
                    _checked = { allready: false };

                // Check for the platform property on the Dashing object.
                if (Dashing.platform === false) {
                    _checked["platformTypeCase"] = true;
                    _allready = true;
                }
                else {
                    var _selectionModal = document.querySelector("x-modal[type='selection']") || document;
                    var _selectables = _selectionModal.querySelector("select") || {};
                    _checked[_selectables.id] = `<strong class="warning-text">Please Select device platform option.</strong>`;
                    _checked.right = true;
                    _allready = true;
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
        }
    });

})();