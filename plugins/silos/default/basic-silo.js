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
    let cylo = document.getElementById("basic-silo-template");

    let cy = cytoscape({
        container: cylo,
        elements: [ // list of graph elements to start with
            { // node a
                data: {
                    id: 'a'
                }
            },
            { // node b
                data: {
                    id: 'b'
                }
            },
            { // edge ab
                data: {
                    id: 'ab',
                    source: 'a',
                    target: 'b'
                }
            }
        ],

        style: [ 
            { 
                selector: 'node', 
                style: { 
                    'background-color': '#666', 
                    'label': 'data(id)' 
                } 
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle'
                }
            }
        ],

        layout: {
            name: 'grid',
            rows: 1
        },
          // initial viewport state:
        zoom: 1,
        pan: { x: 0, y: 0 },

        // interaction options:
        zoomingEnabled: true,
        userZoomingEnabled: true,
        panningEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
        selectionType: 'single',
        touchTapThreshold: 8,
        desktopTapThreshold: 4,
        autolock: false,
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
    

})();
    