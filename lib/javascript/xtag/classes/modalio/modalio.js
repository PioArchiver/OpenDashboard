class Modalio extends Conditions {
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
                        var _modaltemplateid = _modaled.active.lastChild.id,
                            returnedNode = null;
                        _modaled.appendOverlay === true ? ( _modaled.overlay.appendChild(_modaled.active, _modaled.overlay) ) :
                            ( returnedNode = _modaled.overlay.parentNode.replaceChild(_modaled.active, _modaled.overlay) );
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
                        _modaled.appendOverlay === true ? (_modaled.overlay.appendChild(_modaled.active)) : (returnedNode = _modaled.overlay.parentNode.replaceChild(_modaled.active, _modaled.overlay));
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
    set conditions(conditioner) { this.interaction = conditioner; }
    set ready(conditions) {
        var cks = Object.keys(conditions),
            isNotReady = { length: 0 };
        for (var c = 0; c < cks.length; c++) { conditions[cks[c]] === true ? "" : (isNotReady[cks[c]] = false, isNotReady.length++); }
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