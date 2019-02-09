/** 
 *  Licensce: MIT 
 *  Filename: space-sidebar.js 
 *  Company: Kippikio Company
 *  Developers: Steven Van Sant
 * */
(function () { 
    // Sidebar Class
    class Sidebar { 
        constructor(menu) { 
            this.id = menu.id||xtag.uid(); 
        } 
        createGroup(target, group) { 
            let index = group.length, 
                container = document.createElement("div"); 

            for (let z = 0; z < index; z++) { 
                let gitem = group[z]; 
                if (gitem.fragment) { 
                    container.appendChild(gitem.fragment.firstElementChild); 
                } 
            } 

            container.className = "menubar-groupset"; 
            target.appendChild(container); 

        }
        set labelAttribute(_label) {
            // 
        }
    }

    const _app = document.querySelector("x-extension"), 
          _ext = _app.enxtensions, 
          _plugins = _app.extensions.plugins, 
          _plugin = _plugins["space-plugin"], 
          _bar = document.getElementById(_plugin.node.pageSidebar), 
          _keys = _plugins.keys, 
          shifter = ["left", "right", "up", "down"]; 

    const Sidebars = {};

    // Sidebar fragments
    const UpdateRootApp = {
            'mousedown:delegate(label)': function UpdateRootApp(e) {
                // 
            },
            'mousedown:delegate(button[value="Update"])': function ClosePaneButton(e) {
                let form_parent = this.parentNode.parentNode.parentNode,
                    parent_pane = form_parent.parentNode,
                    shift_box = parent_pane.parentNode;

                // I think from here you can get the lenght of the form and iterate through its index.
                let form_length = form_parent.length;

                for (let x = 0; x < form_length; x++) {
                    let node = form_parent[x],
                        _nm = node.name,
                        _val = node .value,
                        _checked = node .checked;
                    if (_nm === "space_name") {
                        console.log(_val);
                    }
                    else if (_nm === "space_setting") {
                        console.log(_checked);
                    }
                    
                }
            }
        },
        barForms = {
        // Spaces sidebar fragment
        left: {
            parent: {
                fragment: xtag.createFragment(`<form class="column-flex"></form>`)
            },
            child: {
                omsg: `<fieldset class="menubar-msg text-centered">You can customize each plugin. Please see our documentation.</fieldset>`,
                POST: `index.html`,
                GET: false,
                labels: {
                    keys: ["UpdateStore"],
                    groups: {
                        keys: ["local-browser", "local-print", "plugin-reports"],
                        'local-browser': {
                            length: 5,  
                            "0": { 
                                type: "text",
                                fragment: xtag.createFragment(`<label class="block inline-flex"><input type="text" name="space_name" class="sidebar-text-input" placeholder="Field name?"/></label>`),
                                attrs: {
                                    title: ""
                                }
                            }, 
                            "1": {
                                type: "checkbox",
                                fragment: xtag.createFragment(`<label class="block inline-flex"><span class="bold-underline">Update Version: </span> <input type="checkbox" name="space_setting" /></label>`),
                                attrs: {
                                    title: ""
                                }
                            },
                            "2": {
                                type: "checkbox",
                                fragment: xtag.createFragment(`<label class="block inline-flex"><span class="bold-underline">Create Patron: </span> <input type="checkbox" name="space_setting" /></label>`),
                                attrs: {
                                    title: ""
                                }
                            },
                            "3": {
                                type: "checkbox",
                                fragment: xtag.createFragment(`<label class="block inline-flex"><span class="bold-underline">Create Timeline: </span> <input type="checkbox" name="space_setting" /></label>`),
                                attrs: {
                                    title: ""
                                }
                            },
                            "4": {
                                type: "button",
                                fragment: xtag.createFragment(`<label class="block inline-flex"><button type="button" value="Update">Update</button></label>`),
                                attrs: {
                                    title: "Local database name."
                                }
                            }
                        },
                        'local-print': {
                            length: 4,
                            "0": {
                                type: "checkbox",
                                fragment: xtag.createFragment(`<label class="block inline-flex"><span class="bold-underline">Include Graphs:</span> <input type="checkbox" /></label>`),
                                attrs: {
                                    title: ""
                                }
                            },
                            "1": {
                                type: "checkbox",
                                fragment: xtag.createFragment(`<label class="block inline-flex"><span class="bold-underline">Include Worlds:</span> <input type="checkbox" /></label>`),
                                attrs: {
                                    title: ""
                                }
                            },
                            "2": {
                                type: "checkbox",
                                fragment: xtag.createFragment(`<label class="block inline-flex"><span class="bold-underline">Include Data Sheets:</span> <input type="checkbox" /></label>`),
                                attrs: {
                                    title: ""
                                }
                            },
                            "3": {
                                type: "button",
                                fragment: xtag.createFragment(`<label class="block inline-flex"><button type="button">Write</button></label>`),
                                attrs: {
                                    title: ""
                                }
                            }
                        },
                        'plugin-reports': {
                            length: 1,
                            "0": {
                                type: "reports",
                                fragment: xtag.createFragment(`<x-table id="${xtag.uid()}" class="table-reports" type="indexed-database" table-confirm="true" allow-refresh="true" allow-pagination="true"></x-table>`),
                                attrs: {}
                            }
                        }
                    },
                    UpdateStore: {
                        type: "button"
                    }
                }
            },

            // Create the shiftbox display panes.
            creator: function CreateSpaceSidebar(node, data) {
                let labels = data.child.labels,
                    groups = data.child.labels.groups;

                let _keys = groups.keys,
                    index = _keys.length;

                let sbar = Sidebars[_bar.id || xtag.uid()] = new Sidebar(_bar);

                for (let z = 0; z < index; z++) {
                    let nm = _keys[z],
                        gnm = groups[nm];

                    sbar.createGroup(node, gnm);
                }
            },
            events: UpdateRootApp
        },

        // Data Sheets sidebar fragment
        right: {
            parent: {
                fragment: xtag.createFragment(`<form></form>`)
            },
            child: {
                omsg: `<strong>Config Settings</strong>`,
                POST: `DataSheets/datasheets.html`,
                GET: ``
            },
            creator: function CreateSpaceSidebar() {
                // Add labels to the node
            },
            events: UpdateRootApp
        },

        // Worlds sidebar fragment 
        up: {
            parent: {
                fragment: xtag.createFragment(`<form></form>`)
            },
            child: {
                omsg: `<label><strong>Worlds</strong><input type=checkbox /></label>`,
                POST: `Worlds/worlds.html`,
                GET: ``
            },
            creator: function CreateSpaceSidebar(node, data) {
                // Add labels to the node
            },
            events: UpdateRootApp
        },

        // Silos sidebar fragment
        down: {
            parent: {
                fragment: xtag.createFragment(`<form></form>`)
            },
            child: {
                omsg: `<label><strong>Silos</strong><input type=checkbox /></label>`,
                POST: `Silos/silos.html`,
                GET: ``
            },
            creator: function CreateSpaceSidebar(node, data) {
                // Add labels to the node
            },
            events: UpdateRootApp
        }
    }; 

    let k = 0;
    for (let i = 0; i < _keys.length; i++) { 
        let pluginbutton = document.createElement('button'),
            pluginaside = document.createElement("aside"),

                _aid = xtag.uid(),
                _id = xtag.uid();

            pluginbutton.className = "block";

            pluginbutton.innerHTML = _plugins[_keys[i]].title;
            pluginbutton.type = "button";
            pluginbutton.id = _id;
            pluginbutton.className = "block";
        
        if (i === shifter.length) {
            k = 0;
        }

            pluginaside.id = _aid;
            pluginaside.setAttribute("shift", shifter[k]);

            pluginbutton.setAttribute("shift", shifter[k]);
            pluginaside.innerHTML = `<h4>${_plugins[_keys[i]].title} Setup</h4>`; 

        if (_bar.closePaneButton === true) { 
            _bar.closePaneButton = { 
                target: pluginaside, 
                title: `<svg width='16px' height='16px'> 
                            <use xlink:href="#window-close" width="15px" height="15px" x="1px" y="2px" /> 
                        </svg>`, 
                class: "close-panel", 
                attrs: { }
            };

            // Set close button event
            let cbtn = pluginaside.querySelector("button.close-panel");
            xtag.addEvent(cbtn, "mousedown", function ClosePane(e) {
                xtag.fireEvent(_bar, "toggle", {
                    detail: {
                        shiftbox: _bar,
                        targetShift: false
                    }
                });
            });
        } 

            _bar.add("fragment", pluginaside, barForms[shifter[k]]); 
            k += 1; 

            _bar.querySelector("section > menu").appendChild(pluginbutton); 
            _bar.appendChild(pluginaside); 
            _bar.menu ? true : _bar.menu = { buttons: { } }; 
            _bar.menu.buttons[i] = document.getElementById(_id); 

        xtag.addEvent(_bar.menu.buttons[i], "mousedown", function OpenShiftboxPanel(e) {
            xtag.fireEvent(_bar, "toggle", {
                detail: {
                    shiftbox: _bar,
                    targetShift: this.getAttribute("shift")
                }
            });
        });

    }

})();