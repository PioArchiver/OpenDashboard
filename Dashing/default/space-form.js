(function () {
    let _app_root_ = document.querySelector("x-exentension"),
        _spaceform = document.getElementById("space-form"),
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
            let val = this.querySelector("input[name='list-type-opts']").value;
            xtag.fireEvent(_searchinput, "datalistSelected", {
                detail: {
                    list: val
                }
            });
        }
    });
})();