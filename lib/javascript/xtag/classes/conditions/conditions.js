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
            for (var i = 0; i < dtlkeys.length; i++) { updateScopeDetail[keys[i]] = detail[keys[i]]; }
        }

        // update scope mixin if parameter present
        if (typeof updateScopeMixins === "object" || typeof updateScopeMixins === "function") {
            // loop through mixin keys
            for (var i = 0; i < mxnkeys.length; i++) { updateScopeMixins[keys[i]] = mixin[keys[i]]; }
        }
        // update scope all if parameter present
        if (typeof updateScopeAll === "object" || typeof updateScopeAll === "function") {
            // loop through all merged keys
            for (var i = 0; i < keys.length; i++) { updateScopeAll[keys[i]] = _merged[keys[i]]; }
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
        if (ReadyCondition.accessor) { Object.defineProperty(scope, ReadyCondition.name, ReadyCondition.accessor); }
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
                        msgs.allready === true ? ( msg[i] = msgs, allready++ ) : msg[i] = msgs;
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