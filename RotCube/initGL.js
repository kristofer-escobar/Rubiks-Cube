/*
    initGL.js - Essential setup for our WebGL application
*/

var canvas; // global to hold reference to an HTML5 canvas
var gl; // global to hold reference to our WebGL context

// a few simple constants
const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;

var drawables = []; // used to store any objects that need to be drawn

/* Initialize global WebGL stuff - not object specific */
function initGL()
{
    // look up our canvas element
    canvas = document.getElementById( "gl-canvas" );

    // obtain a WebGL context bound to our canvas
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height ); // use the whole canvas
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 ); // background color
    gl.enable(gl.DEPTH_TEST); // required for 3D hidden-surface elimination

    // set the projection matrix
    // note: added rotation just to better see the shapes of our cubes
    projection = ortho(-4, 4, -4, 4, -100, 100);
    projection = mult(projection, rotate(20, [0.5, 1, 0.12]));

    // set up an event handler for this button
    var a = document.getElementById("Btn_TR");
    a.addEventListener("click",
        function(){
            
            // Check for a second cube.
            if(drawables.length > 1){
                var secondCube = drawables[1];
                secondCube.rotateAngle = 90;
            }

            disableBtns();
        },
        false
    );

    // set up an event handler for this button
    var b = document.getElementById("Btn_TL");
    b.addEventListener("click",
        function(){

            // Check for a second cube.
            if(drawables.length > 1){
                var secondCube = drawables[1];
                secondCube.rotateAngle = -90;
            }

            disableBtns();
        },
        false
    );

    // set up an event handler for this button
    var c = document.getElementById("Btn_Perspective");
    c.addEventListener("click",
        function(){

            // Check for a second cube.
            if(drawables.length > 1){

                // Change prespective.
                projection = mult(projection,perspective(55, (canvas.width/canvas.height), 0.3, 1));
                projection = mult(projection,lookAt([0,0,-1],[0,-1,1],[0,1,0]));
                projection = mult(projection,ortho(-4, 4, -4, 4, -100,100));
            }
        },
        false
    );

    // set up an event handler for this button
    var d = document.getElementById("Btn_Orthographic");
    d.addEventListener("click",
        function(){

            // Check for a second cube.
            if(drawables.length > 1){

                // Change othrographic projection.
                projection = ortho(-4, 4, -4, 4, -100,100);
                projection = mult(projection, rotate(70, [0.5, 1, 0.12]));
            }
        },
        false
    );

    // Orbit top cube slice to the left.
    $('#btnOrbitTopLeft').click(function () {
        for(var i = 18; i < 28; i++){
            drawables[i].orbitSlice(90, Y_AXIS);
        }
    });

    // Orbit top cube slice to the right.
    $('#btnOrbitTopRight').click(function () {
        for(var i = 18; i < 27; i++){
            drawables[i].orbitSlice(-90, Y_AXIS);
        }
    });

    // Orbit bottom cube slice to the left.
    $('#btnOrbitBottomLeft').click(function () {
        for(var i = 0; i < 9; i++){
            drawables[i].orbitSlice(90, Y_AXIS);
        }
    });

    // Orbit bottom cube slice to the right.
    $('#btnOrbitBottomRight').click(function () {
        for(var i = 0; i < 9; i++){
            drawables[i].orbitSlice(-90, Y_AXIS);
        }
    });

    // Orbit left cube slice down.
    $('#btnOrbitLeftDown').click(function () {
        for(var i = 0; i < 9; i++){
            drawables[i].orbit = 90;
        }
    });

    // Orbit left cube slice up
    $('#btnOrbitLeftUp').click(function () {
        for(var i = 0; i < 9; i++){
            drawables[i].orbit = -90;
        }
    });

}

function enableBtns(){
    // enable buttons.
    document.getElementById('Btn_TL').disabled = false;
    document.getElementById('Btn_TR').disabled = false;
}

function disableBtns(){
    // disable buttons.
    document.getElementById('Btn_TL').disabled = true;
    document.getElementById('Btn_TR').disabled = true;
}

/* Global render callback - would draw multiple objects if there were more than one */
var renderScene = function(){
    // start from a clean frame buffer for this frame
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // loop over all objects and draw each
    var i;
    for (i in drawables) {
        drawables[i].draw();
    }

    // queue up this same callback for the next frame
    requestAnimFrame(renderScene);
}
