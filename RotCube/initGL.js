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

// Initialize slices.
var topSlice = [18,21,24,19,22,25,20,23,26];
var bottomSlice = [2,5,8,1,4,7,0,3,6];
var leftSlice = [18,19,20,9,10,11,0,1,2];
var rightSlice = [26,25,24,17,16,15,8,7,6];
var backSlice = [18,21,24,15,12,9,6,3,0];
var frontSlice = [20,23,26,11,14,17,2,5,8];

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

   /***********************
    * Slice rotation handlers.
    ***********************/

    // Orbit top cube slice to the left.
    $('#btnOrbitTopLeft').click(function () {
        disableBtns();

        for(i in topSlice){
            drawables[topSlice[i]].orbitSlice(90, Y_AXIS);
        }

        updateTopSlices(90);
    });

    // Orbit top cube slice to the right.
    $('#btnOrbitTopRight').click(function () {
        disableBtns();

        for(i in topSlice){
            drawables[topSlice[i]].orbitSlice(-90, Y_AXIS);
        }
        
        updateTopSlices(-90);
    });

    // Orbit bottom cube slice to the left. (Clockwise)
    $('#btnOrbitBottomLeft').click(function () {
        disableBtns();

        for(i in bottomSlice){
            drawables[bottomSlice[i]].orbitSlice(90, Y_AXIS);
        }

        updateBottomSlices(90);
    });

    // Orbit bottom cube slice to the right. (Counter Clockwise)
    $('#btnOrbitBottomRight').click(function () {
        disableBtns();

        for(i in bottomSlice){
            drawables[bottomSlice[i]].orbitSlice(-90, Y_AXIS);
        }

        updateBottomSlices(-90);
    });

    // Orbit left cube slice down.
    $('#btnOrbitLeftDown').click(function () {
        disableBtns();

        for(i in leftSlice){
            drawables[leftSlice[i]].orbitSlice(90, X_AXIS);
        }

        updateLeftSlices(90);
    });

    // Orbit left cube slice up
    $('#btnOrbitLeftUp').click(function () {
        disableBtns();

        for(i in leftSlice){
            drawables[leftSlice[i]].orbitSlice(-90, X_AXIS);
        }

        updateLeftSlices(-90);
    });

    // Orbit right cube slice down.
    $('#btnOrbitRightDown').click(function () {
        disableBtns();

        for(i in rightSlice){
            drawables[rightSlice[i]].orbitSlice(90, X_AXIS);
        }

        updateRightSlices(90);
    });

    // Orbit right cube slice up
    $('#btnOrbitRightUp').click(function () {
        disableBtns();

        for(i in rightSlice){
            drawables[rightSlice[i]].orbitSlice(-90, X_AXIS);
        }

        updateRightSlices(-90);
    });

    // Orbit back cube slice left.
    $('#btnOrbitBackLeft').click(function () {
        disableBtns();

        for(i in backSlice){
            drawables[backSlice[i]].orbitSlice(90, Z_AXIS);
        }

        updateBackSlices(90);
    });

    // Orbit back cube slice right.
    $('#btnOrbitBackRight').click(function () {
        disableBtns();

        for(i in backSlice){
            drawables[backSlice[i]].orbitSlice(-90, Z_AXIS);
        }

        updateBackSlices(-90);
    });

    // Orbit front cube slice left.
    $('#btnOrbitFrontLeft').click(function () {
        disableBtns();

        for(i in frontSlice){
            drawables[frontSlice[i]].orbitSlice(90, Z_AXIS);
        }

        updateFrontSlices(90);
    });

    // Orbit front cube right up
    $('#btnOrbitFrontRight').click(function () {
        disableBtns();

        for(i in frontSlice){
            drawables[frontSlice[i]].orbitSlice(-90, Z_AXIS);
        }

        updateFrontSlices(-90);
    });

    /********************************
     * Entire cube rotation handlers.
     ********************************/

    // Rotate left.
    $('#btnRotateCubeLeft').click(function () {
        disableBtns();

        for(var i = 0; i < 27; i++){
            drawables[i].orbitSlice(90, Y_AXIS);
        }
    });

    // Rotate right.
    $('#btnRotateCubeRight').click(function () {
        disableBtns();

        for(var i = 0; i < 27; i++){
            drawables[i].orbitSlice(-90, Y_AXIS);
        }
    });

    // Rotate Up.
    $('#btnRotateCubeUp').click(function () {
        disableBtns();

        for(var i = 0; i < 27; i++){
            drawables[i].orbitSlice(-90, X_AXIS);
        }
    });

    // Rotate down.
    $('#btnRotateCubeDown').click(function () {
        disableBtns();

        for(var i = 0; i < 27; i++){
            drawables[i].orbitSlice(90, X_AXIS);
        }
    });
}

/*
 * Slice cubes update functions.
 */
function updateTopSlices(angle){
    var clockwise = 1;

    if(angle >= 0){
        clockwise = -1;
    } else{
        clockwise = 1;
    }

    if(clockwise == -1){
        topSlice = transformArray(topSlice, false);
    } else{
        topSlice = transformArray(topSlice, true);
    }

    // Then update all slices that are affected.
    
    // Left slice
    leftSlice[0] = topSlice[0];
    leftSlice[1] = topSlice[3];
    leftSlice[2] = topSlice[6];

    // Right Slice
    rightSlice[2] = topSlice[2]; 
    rightSlice[1] = topSlice[5]; 
    rightSlice[0] = topSlice[8]; 

    // Back slice
    backSlice[2] = topSlice[0]; 
    backSlice[1] = topSlice[1]; 
    backSlice[0] = topSlice[2];

    // Front slice.
    frontSlice[0] = topSlice[6]; 
    frontSlice[1] = topSlice[7]; 
    frontSlice[2] = topSlice[8];
}

//
function updateBottomSlices(angle){
    var clockwise = -1;

    if(angle >= 0){
        clockwise = 1;
    } else{
        clockwise = -1;
    }

    if(clockwise == -1){
        bottomSlice = transformArray(bottomSlice, false);
    } else{
        bottomSlice = transformArray(bottomSlice, true);
    }

    // Then update all slices that are affected.
    
    // Left slice
    leftSlice[6] = bottomSlice[6];
    leftSlice[7] = bottomSlice[3];
    leftSlice[8] = bottomSlice[0];

    // Right Slice
    rightSlice[6] = bottomSlice[2]; 
    rightSlice[7] = bottomSlice[5]; 
    rightSlice[8] = bottomSlice[8]; 

    // Back slice
    backSlice[8] = bottomSlice[6]; 
    backSlice[7] = bottomSlice[7]; 
    backSlice[6] = bottomSlice[8];

    // Front slice.
    frontSlice[6] = bottomSlice[0]; 
    frontSlice[7] = bottomSlice[1]; 
    frontSlice[8] = bottomSlice[2];
}

function updateLeftSlices(angle){
    var clockwise = 1;

    if(angle >= 0){
        clockwise = 1;
    } else{
        clockwise = -1;
    }

    if(clockwise == -1){
        leftSlice = transformArray(leftSlice, false);
    } else{
        leftSlice = transformArray(leftSlice, true);
    }

    // Then update all slices that are affected.
    
    // Front slice
    frontSlice[0] = leftSlice[2];
    frontSlice[3] = leftSlice[5];
    frontSlice[6] = leftSlice[8];

    // Top Slice
    topSlice[0] = leftSlice[0]; 
    topSlice[3] = leftSlice[1]; 
    topSlice[6] = leftSlice[2]; 

    // Bottom slice
    bottomSlice[6] = leftSlice[6]; 
    bottomSlice[3] = leftSlice[7]; 
    bottomSlice[0] = leftSlice[8];

    // Back slice.
    backSlice[2] = leftSlice[0]; 
    backSlice[5] = leftSlice[3]; 
    backSlice[8] = leftSlice[6];
}

function updateRightSlices(angle){
    var clockwise = 1;

    if(angle >= 0){
        clockwise = -1;
    } else{
        clockwise = 1;
    }

    if(clockwise == -1){
        rightSlice = transformArray(rightSlice, false);
    } else{
        rightSlice = transformArray(rightSlice, true);
    }

    // Then update all slices that are affected.
    
    // Front slice
    frontSlice[2] = rightSlice[0];
    frontSlice[5] = rightSlice[3];
    frontSlice[8] = rightSlice[6];

    // Top Slice
    topSlice[2] = rightSlice[2]; 
    topSlice[5] = rightSlice[1]; 
    topSlice[8] = rightSlice[0]; 

    // Bottom slice
    bottomSlice[2] = rightSlice[6]; 
    bottomSlice[5] = rightSlice[7]; 
    bottomSlice[8] = rightSlice[8];

    // Back slice.
    backSlice[0] = rightSlice[2]; 
    backSlice[3] = rightSlice[5]; 
    backSlice[6] = rightSlice[8];
}

function updateFrontSlices(angle){
    var clockwise = 1;

    if(angle >= 0){
        clockwise = -1;
    } else{
        clockwise = 1;
    }

    if(clockwise == -1){
        frontSlice = transformArray(frontSlice, false);
    } else{
        frontSlice = transformArray(frontSlice, true);
    }

    // Then update all slices that are affected.
    
    // Front slice
    leftSlice[2] = frontSlice[0];
    leftSlice[5] = frontSlice[3];
    leftSlice[8] = frontSlice[6];

    // Top Slice
    topSlice[6] = frontSlice[0]; 
    topSlice[7] = frontSlice[1]; 
    topSlice[8] = frontSlice[2]; 

    // Bottom slice
    bottomSlice[0] = frontSlice[6]; 
    bottomSlice[1] = frontSlice[7]; 
    bottomSlice[2] = frontSlice[8];

    // Back slice.
    rightSlice[0] = frontSlice[2]; 
    rightSlice[3] = frontSlice[5]; 
    rightSlice[6] = frontSlice[8];
}

function updateBackSlices(angle){
    var clockwise = 1;

    if(angle >= 0){
        clockwise = 1;
    } else{
        clockwise = -1;
    }

    if(clockwise == -1){
        backSlice = transformArray(backSlice, false);
    } else{
        // Clockwise
        backSlice = transformArray(backSlice, true);
    }

    // Then update all slices that are affected.
    
    // Front slice
    leftSlice[0] = backSlice[2];
    leftSlice[3] = backSlice[5];
    leftSlice[6] = backSlice[8];

    // Top Slice
    topSlice[0] = backSlice[2]; 
    topSlice[1] = backSlice[1]; 
    topSlice[2] = backSlice[0]; 

    // Bottom slice
    bottomSlice[8] = backSlice[6]; 
    bottomSlice[7] = backSlice[7]; 
    bottomSlice[6] = backSlice[8];

    // Back slice.
    rightSlice[2] = backSlice[0]; 
    rightSlice[5] = backSlice[3]; 
    rightSlice[8] = backSlice[6];
}

function transformArray(array, clockwise){
    var tempArray = array.slice();

    if(clockwise){
        array[0] = tempArray[2];
        array[1] = tempArray[5];
        array[2] = tempArray[8];
        array[3] = tempArray[1];
        array[4] = tempArray[4];
        array[5] = tempArray[7];
        array[6] = tempArray[0];
        array[7] = tempArray[3];
        array[8] = tempArray[6];
    } else{
        array[2] = tempArray[0];
        array[5] = tempArray[1];
        array[8] = tempArray[2];
        array[1] = tempArray[3];
        array[4] = tempArray[4];
        array[7] = tempArray[5];
        array[0] = tempArray[6];
        array[3] = tempArray[7];
        array[6] = tempArray[8];
    }

    return array.reverse();
}

function enableBtns(){
    $(":button").attr("disabled", false);
}

function disableBtns(){
    $(":button").attr("disabled", true);
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
