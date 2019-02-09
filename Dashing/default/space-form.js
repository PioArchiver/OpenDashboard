(function () {
    let _app_root_ = document.querySelector("x-extension"),
        _spaceform = document.getElementById("space-form"),
        _plugins = _app_root_.extensions.plugins,
        _space_plugin = _plugins["space-plugin"],
        _space_page = _space_plugin.node,
        _searchinput = document.getElementById("datalist-search-input");

    // Add Events for inputs.
    xtag.addEvents(_spaceform, {
        "datalistSelected": function searchSelectedDatalist(e) {
            _searchinput.setAttribute("list", e.detail.list);
        },
        "mousedown:delegate(input[name='list-type-opts'])": function SearchSelector(e) {
            xtag.fireEvent(_searchinput, "datalistSelected", {
                detail: {
                    list: this.value
                }
            });
        },
        "mousedown:delegate(aside > div.radio-opts > label)": function SearchSelector(e) {
            let val = this.querySelector("input[name='list-type-opts']").value,
                _asideparent = this.parentNode.parentNode,
                _radio = this.querySelector("input[type='radio']");

            if (e.target.nodeName !== "INPUT" && _radio.checked === false) {
                _radio.checked = true;
            }

            // Fire the change event for the list input's [list] attribute.
            xtag.fireEvent(_searchinput, "datalistSelected", {
                detail: {
                    list: val
                }
            });

            // Check to see if the drop down list has been activated
            let doc = _asideparent.querySelector("x-list[data-id='auto-list']"); 
            if (doc) {
                doc.innerHTML = _searchinput.list.innerHTML;
            }
        },
        "mousedown:delegate(button[name='show-selected-space-type-options'])": function ShowSelectedSpaceTypeOptions(e) {
            let _parent = this.parentNode, 
                _selectedList = _searchinput.list, 
                _clonedlist = _selectedList.cloneNode(true), 
                _frag = document.createElement("x-list"), 
                _ico = this.firstElementChild; 

            if (this.hasAttribute("active") === true) {
                let doc = _parent.querySelector("x-list[data-id='auto-list']"); 

                    _ico.setAttribute("class", "rotate-up");
                    doc.outerHTML = "";
                    this.removeAttribute("active");
            }
            else if (this.hasAttribute("active") === false) {

                _frag.setAttribute("data-id", "auto-list"); 
                _frag.innerHTML = _selectedList.innerHTML; 

                this.setAttribute("active", "");
                _ico.setAttribute("class", "rotate-down");
                _parent.appendChild(_frag);

            }
            else {
                // 
            }
        }
    });
})();