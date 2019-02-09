/*
 * @name Basic Silo Template
 * For Develpment:
 * Cylo template files are written for the express purpose of working with the Silo Plugin,
 * as a result each different template can each contain their own unique dependencies.
 * 
 * Information regarding dependencies of each template should be made available in the JsonSchema.json file.
 * Found here => [lib/JsonSchema.json]
 * 
 * The exposed api that cytoscape provides should not need to be altered, except in cases where a change might
 * make it as a PR contribution to the core project. 
 * 
 */
(function () {
    let xextension = document.getElementById("dash_book"),
        DashingPlugin = document.getElementById("graphing-plugin"),
        cylo = document.getElementById("basic-silo-template");

    let cy = cytoscape({
        container: cylo,
        elements: [ { 
                group: 'nodes', 
                data: {
                    id: 'r2',
                    name: 'Top Resizer',
                    parent: 'Workspace'
                },

                // scratchpad data (usually temp or nonserialisable data)
                // app fields prefixed by underscore; extension fields unprefixed
                scratch: {
                    _foo: 'bar' 
                },

                position: {
                    x: -500,
                    y: 0
                }, 
                selected: false, 
                selectable: true, 
                locked: false, 
                grabbable: true, 
                classes: 'foo bar'
            }, 
            // d2
            {
                data: {
                    id: 'd2',
                    name: 'Bottom Resizer',
                    parent: 'Workspace'
                },
                position: { x: 0, y: 200 }, 
                selected: false,  
                selectable: true,  
                locked: false,  
                grabbable: true, 
                classes: 'foo bar'
            },

            {
                // Workspace
                data: {
                    id: 'Workspace'
                }
            }
        ],

        layout: {
            name: 'preset'
        },

        // so we can see the ids
        style: [{
            selector: 'node[id="d2"]',
            style: {
                width: 25,
                height: 25,
                shape: "polygon",
                "shape-polygon-points": "0, -1   -1, -1,   -1, 1,   0, 1,   1, 0",
                'background-color': "rgb(65,65,65)"
            }
        }, {
            selector: 'node[id="Workspace"]',
            style: {
                'content': 'data(id)',
                'background-color': "darkgray"
            }
        }, {
            selector: 'node[id="r2"]',
                style: {
                content: "data(id)",
                width: 25,
                height: 25,
                shape: "polygon",
                "shape-polygon-points": "0, -1   1, -1,   1, 1,   0, 1,   -1, 0",
                'background-color': "rgb(65,65,65)"
            }
        }],
        // initial viewport state:
        zoom: 1,
        pan: { x: 550, y: 50 },

        // interaction options:
        zoomingEnabled: false,
        userZoomingEnabled: false,
        panningEnabled: true,
        userPanningEnabled: false,
        boxSelectionEnabled: false,
        selectionType: 'single',
        touchTapThreshold: 8,
        desktopTapThreshold: 4,
        autolock: true,
        autoungrabify: false,
        autounselectify: false,

        // rendering options:
        headless: false,
        styleEnabled: true,
        hideEdgesOnViewport: false,
        hideLabelsOnViewport: false,
        textureOnViewport: false,
        motionBlur: false,
        motionBlurOpacity: 0.2,
        wheelSensitivity: 1,
        pixelRatio: 'auto'
    });

    DashingPlugin.workspaces = { id: cylo.id, silo: cy };

    DashingPlugin.silo = class {
        static panning(e) {
            if (cy.autolock() === false) {
                cy.autolock(true);
                e.target.removeAttribute("selected");
            }
            else {
                cy.autolock(false);
                e.target.setAttribute("selected", "");
            }
        }

        static selector(e) {
            if (e.target.hasAttribute("selected") === true) {
                e.target.removeAttribute("selected");
            }
            else {
                e.target.setAttribute("selected", "");
            }
        }
    };




    let box = cylo.parentElement.parentElement.getBoundingClientRect();


})();
    