(function() {
    const _app = document.querySelector("x-extension"),
        _ext = _app.enxtensions,
        _plugins = _app.extensions.plugins,
        _plugin = _plugins["space-plugin"];

    _plugin.node.pageSidebar = _plugin.node.pageSidebar;
    _plugin.sidebar = _plugin.node.sidebar;

    _plugin.sidebar.menu = {
        buttons: {}
    };

    const _bar = _plugin.sidebar,
        _data = _plugin.node.DATA,
        _data_space_lists = _data.SpaceTypes.datalists,
        _data_space_lists_keys = _data_space_lists.keys;

    // Class [datalists]
    const _listing_ = [];
    class datalists { 
        constructor(_list, attrs) { 
            let _list_ = document.createElement("datalist");

            _list_.setAttribute("title", attrs.title);
            _list_.id = attrs.id;

            for (var i = 0; i < _list.length; i++) {
                let _opt = document.createElement("option");

                _opt.value = _list[i];

                _list_.appendChild(_opt);
                _listing_.push(`${_list[i]} [${attrs.title||false }]`);
            }
            this.items = _list_;
        } 
        // Creates a merged type datalist
        CreateFromListings() { 
            let _datalist_ = document.createElement("datalist"),
                index = _listing_.length;

            for (let i = 0; i < index; i++) {
                let opts = document.createElement("option"); 
                opts.innerHTML = `${_listing_[i]}`;
                _datalist_.appendChild(opts); 
            }

            return _datalist_;
        }
        setOptionAttrs(_opt_) { 
            //
        } 
        set listing(item) { 
            this.listings.push(item);
        } 
    } 

    const _listtitles = [
        "Worlds",
        "Silos",
        "Data Sheets"
    ];
    const _listids = [
        "WorldsDatalist",
        "SilosDatalist",
        "DataSheetsDatalist"
    ];
    for (let i = 0; i < _data_space_lists_keys.length; i++) {
        let _list = _data_space_lists[_data_space_lists_keys[i]], 
            _listed = new datalists(_list, {
                title: _listtitles[i],
                id: _listids[i]
            });

        _plugin.node.appendChild(_listed.items); 

        if (_data_space_lists_keys.length - 1 === i) {
            let _all_space_types_list = _listed.CreateFromListings();

            _all_space_types_list.id = "_all_space_types_list";
            _plugin.node.appendChild(_all_space_types_list);
        }
    }

    
})();