/** 
 *  Licensce: OSFL [Open Source Franchise License]
 *  Liability LImitied
 *  Filename: space-sidebar.js
 * */
(function () {
    const _app = document.querySelector("x-extension"),
        _ext = _app.enxtensions,
        _plugins = _app.extensions.plugins,
        _plugin = _plugins["space-plugin"],
        _bar = document.getElementById(_plugin.node.pageSidebar),
        _keys = _plugins.keys,
        shifter = ["left", "right", "up", "down"];

    // Sidebar fragments
    const barForms = {
        // Spaces sidebar fragment
        left: {
            parent: {
                fragment: xtag.createFragment(`<form></form>`)
            },
            child: {
                omsg: `<label><strong>Add LocalDB</strong><input type=checkbox /></label>`,
                POST: `Silos/silos.html`,
                GET: false,
                labels: {
                    checkboxes: {
                        length: 1,
                        sets: {

                        }
                    }
                }
            },
            creator: function CreateSpaceSidebar() {

            },
            events: {

            }
        },

        // Data Sheets sidebar fragment
        right: {
            parent: {
                fragment: xtag.createFragment(`<form></form>`)
            },
            child: {
                omsg: `<label><strong>Add LocalDB</strong><input type=checkbox /></label>`,
                POST: ``,
                GET: ``
            },
            creator: function CreateSpaceSidebar() {

            },
            events: {

            }
        },

        // Worlds sidebar fragment
        up: {
            parent: {
                fragment: xtag.createFragment(`<form></form>`)
            },
            child: {
                omsg: `<label><strong>Worlds</strong><input type=checkbox /></label>`,
                POST: ``,
                GET: ``
            },
            creator: function CreateSpaceSidebar() {

            },
            events: {

            }
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
            creator: function CreateSpaceSidebar() {

            },
            events: {

            }
        }
    }; 

    let k = 0;
    for (let i = 0; i < _keys.length; i++) { 

        let pluginbutton = document.createElement('button'),
            pluginaside = document.createElement("aside"),
            _aid =xtag.uid(),
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

            _bar.add("fragment", pluginaside, barForms[shifter[k]]);
            k += 1;

            _bar.querySelector("section > menu").appendChild(pluginbutton);
            _bar.appendChild(pluginaside);
            _bar.menu ? true : _bar.menu = { buttons: { } };
            _bar.menu.buttons[i] = document.getElementById(_id);

        xtag.addEvent(_bar.menu.buttons[i], "mousedown", function OpenShiftboxPanel(e) {
            xtag.fireEvent(_bar, "open", {
                detail: {
                    shiftbox: _bar,
                    targetShift: this.getAttribute("shift")
                }
            });
        });
    }

})();