/*
    cube.js - Drawable WebGL cube object definition

    IMPORTANT NOTE:
    This scripts assumes that the initGL.js script has already been loaded,
    and that consequently a variety of global variables are already defined,
    such as: gl, drawables, X_AXIS, Y_AXIS, Z_AXIS
*/

/*  Variable to keep count of angle increment 
    and determine when to stop animating. */
var Cube = function (program, colors) { this.init(program, colors); }

// Create reference to local storage.
var localStorage = window.localStorage;

/* Initialize properties of this color cube object. */
Cube.prototype.init = function(program, colors)
{
    this.count = 0;
    this.points = []; // this array will hold raw vertex positions
    this.colors = []; // this array will hold per-vertex color data
    this.transform = mat4(); // initialize object transform as identity matrix
    this.rotateAngle = 0; // initialize rotate angle.
    this.orbitAngle = 0; // initialize orbit angle.
    this.orbitAxis = 0; // initialize orbit axis.

    this.mkcube(colors); // delegate to auxiliary function

    this.program = program; // Load shaders and initialize attribute buffers

    this.cBufferId = gl.createBuffer(); // reserve a buffer object
    gl.bindBuffer( gl.ARRAY_BUFFER, this.cBufferId ); // set active array buffer
    /* send vert colors to the buffer, must repeat this
       wherever we change the vert colors for this cube */
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW );

    this.vBufferId = gl.createBuffer(); // reserve a buffer object
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBufferId ); // set active array buffer
    /* send vert positions to the buffer, must repeat this
       wherever we change the vert positions for this cube */
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.points), gl.STATIC_DRAW );



}

Cube.prototype.draw = function () {

    // Check if we need to rotate.
    if (this.rotateAngle > 0) {
        // Rotate right.
        this.rotateRight();
    } else if (this.rotateAngle < 0) {
        // Rotate left.
        this.rotateLeft();
    }

    // Check if we need to orbit.
    if (this.orbitAngle != 0) {
        this.orbitSlice(this.orbitAngle, this.orbitAxis);
    }

    gl.useProgram(this.program ); // set the current shader programs

    var projId = gl.getUniformLocation(this.program, "projection"); 
    gl.uniformMatrix4fv(projId, false, flatten(projection));

    var xformId = gl.getUniformLocation(this.program, "modeltransform");
    gl.uniformMatrix4fv(xformId, false, flatten(this.transform));

    gl.bindBuffer( gl.ARRAY_BUFFER, this.cBufferId ); // set active array buffer
    // map buffer data to the vertex shader attribute
    var vColorId = gl.getAttribLocation( this.program, "vColor" );
    gl.vertexAttribPointer( vColorId, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColorId );

    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBufferId ); // set active array buffer
    // map buffer data to the vertex shader attribute
    var vPosId = gl.getAttribLocation( this.program, "vPosition" );
    gl.vertexAttribPointer( vPosId, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosId );

    var vNormal = gl.getAttribLocation(this.program, "vNormal");
	gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vNormal);

	var lightPosition = vec4(-1, -2.0, 0.0, 1.0);
	var lightAmbient = vec4(0.8, 0.8, 0.8, 1.0);
	var lightDiffuse = vec4(.8, 1, .9, 1.0);
	var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

	var materialAmbient = vec4(0.0, 0.0, 0.0, 1.0);
	var materialDiffuse = vec4(1.5, 1.0, 1.0, 1.0);
	var materialSpecular = vec4(0.4, 0.3, 0.3, 0.0);
	var materialShininess = 8.0;

	var ambientProduct = mult(lightAmbient, materialAmbient);
	var diffuseProduct = mult(lightDiffuse, materialDiffuse);
	var specularProduct = mult(lightSpecular, materialSpecular);

	gl.uniform4fv(gl.getUniformLocation(this.program, "ambientProduct"), flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(this.program, "diffuseProduct"), flatten(diffuseProduct));
	gl.uniform4fv(gl.getUniformLocation(this.program, "specularProduct"), flatten(specularProduct));
	gl.uniform4fv(gl.getUniformLocation(this.program, "lightPosition"), flatten(lightPosition));
	gl.uniform1f(gl.getUniformLocation(this.program, "shininess"), materialShininess);

    gl.drawArrays( gl.TRIANGLES, 0, this.numverts() );

}

/* Returns the total count of vertices to be sent into the pipeline. */
Cube.prototype.numverts = function() {return this.points.length;};

/* Default vertex positions for unit cube centered at the origin. */
Cube.prototype.vertices = [
    [ -0.5, -0.5,  0.5, 1.0 ],
    [ -0.5,  0.5,  0.5, 1.0 ],
    [  0.5,  0.5,  0.5, 1.0 ],
    [  0.5, -0.5,  0.5, 1.0 ],
    [ -0.5, -0.5, -0.5, 1.0 ],
    [ -0.5,  0.5, -0.5, 1.0 ],
    [  0.5,  0.5, -0.5, 1.0 ],
    [  0.5, -0.5, -0.5, 1.0 ]
];

/* Default vertex colors for the color cube. */
Cube.prototype.vcolors = [
    [ 0.0, 0.0, 0.0, 1.0 ], // black
    [ 1.0, 0.0, 0.0, 1.0 ], // red
    [ 1.0, 1.0, 0.0, 1.0 ], // yellow
    [ 0.0, 1.0, 0.0, 1.0 ], // green
    [ 0.0, 0.0, 1.0, 1.0 ], // blue
    [ 1.0, 0.0, 1.0, 1.0 ], // magenta
    [ 1.0, 1.0, 1.0, 1.0 ], // white
    [ 0.0, 1.0, 1.0, 1.0 ]  // cyan
];

/*
    Build one of the faces for this cube object.
*/
Cube.prototype.mkquad = function(a, b, c, d, color)
{
    this.points.push( vec4(this.vertices[a]) );
    this.colors.push( vec4(color) );

    this.points.push( vec4(this.vertices[b]) );
    this.colors.push(vec4(color));

    this.points.push( vec4(this.vertices[c]) );
    this.colors.push(vec4(color));

    this.points.push( vec4(this.vertices[a]) );
    this.colors.push(vec4(color));

    this.points.push( vec4(this.vertices[c]) );
    this.colors.push(vec4(color));

    this.points.push( vec4(this.vertices[d]) );
    this.colors.push(vec4(color));
}

/*
    Build all faces of this cube object.
*/
Cube.prototype.mkcube = function(colors)
{
    this.mkquad(1, 0, 3, 2, colors[0] );
    this.mkquad(2, 3, 7, 6, colors[1]);
    this.mkquad(3, 0, 4, 7, colors[2]);
    this.mkquad(6, 5, 1, 2, colors[3]);
    this.mkquad(4, 5, 6, 7, colors[4]);
    this.mkquad(5, 4, 0, 1, colors[5]);
}

/* Translate this cube along the specified canonical axis. */
Cube.prototype.move = function(dist, axis){
    var delta = [0, 0, 0];

    if (axis === undefined) axis = Y_AXIS;
    delta[axis] = dist;

    this.transform = mult(translate(delta), this.transform);
}

/* Rotate this cube around the specified canonical axis. */
Cube.prototype.turn = function (angle, axis) {
    
    var avec = [0, 0, 0];

    if (axis === undefined) axis = Y_AXIS;
    avec[axis] = 1;

    this.transform = mult(this.transform, rotate(angle, avec));
}

/* Orbit cube slice around a specified axis and for a given angle. */
Cube.prototype.orbitSlice = function (angle, axis) {

    // No orbit, exit.
    if (angle == 0)
        return;
    
    // Initialize.
    var step = 0;
    var avec = [0, 0, 0];

    // If no axis is given, default to Y_AXIS.
    if (axis === undefined) axis = Y_AXIS;
    avec[axis] = 1;

    // Set angle of orbit.
    this.orbitAngle = angle;
    
    // Set orbit axis.
    this.orbitAxis = axis;

    // Check for positive or negative angle.
    if (angle >= 0) {
        step = 1;
    } else {
        step = -1;
    }

    // Keep track of orbit animation.
    this.count = this.count + step;

    // Transformation matrix.
    this.transform = mult(rotate(step, avec), this.transform);

    // Check when to stop orbit.
    if (this.count == angle) {

        // Stop orbit.
        this.orbitAngle = 0;

        // Reset count.
        this.count = 0;

        enableBtns();
    }
}

// Rotate this cube to the right.
Cube.prototype.rotateRight = function () {
    this.count++;
    this.transform = mult(this.transform, rotate(1, [0, 1, 0]));

    if (this.count == this.rotateAngle) {
        // Stop rotating.
        this.rotateAngle = 0;

        // Reset count.
        this.count = 0;
    
        // Re-enable buttons.
        enableBtns();
    }
}

// Rotate this cube to the left.
Cube.prototype.rotateLeft = function () {
    this.count--;
    this.transform = mult(this.transform, rotate(-1, [0, 1, 0]));

    if (this.count == this.rotateAngle) {
        // Stop rotating.
        this.rotateAngle = 0;

        // Reset count.
        this.count = 0;

        // Re-enable buttons.
        enableBtns();
    }
}


/* Set up event callback to start the application */
window.onload = function () {

    $('#btnLoadIntialState').click(function () {

        var initialState = $('#tbInitialState').val().replace(/\s/g, "");

        // Store each face with their initial states.
        localStorage.setItem("top", initialState.substring(0, 9));
        localStorage.setItem("left", initialState.substring(9, 12) + initialState.substring(18, 21) + initialState.substring(27, 30));
        localStorage.setItem("front", initialState.substring(12, 15) + initialState.substring(21, 24) + initialState.substring(30, 33));
        localStorage.setItem("right", initialState.substring(15, 18) + initialState.substring(24, 27) + initialState.substring(33, 36));
        localStorage.setItem("bottom", initialState.substring(36, 45));
        localStorage.setItem("back", initialState.substring(45, 54));

        location.reload();
    });

    $('#btnClear').click(function () {
        localStorage.clear();
        location.reload();
    });

    $('#btnLoadSolution').click(function () {
        // Load solution.
        var solution = $('#tbSolution').val().replace(/\s/g, "");

        // Store solution.
        localStorage.setItem("solution", solution);
    });

    // Play solution animation.
    $('#btnPlay').click(function () {
        // Approx time per animation.
        var animationTime = 2000;
        var timeout = 0;

        if (localStorage.getItem("solution") !== null) {

            var solutionString = localStorage.getItem("solution");

            while (solutionString.length != 0) {
                var move = solutionString.substring(0, 1).toUpperCase();
                var times = solutionString.substring(1, 2);

                solutionString = solutionString.slice(2);

                if (move == "O") {

                    while (times > 0) {
                        setTimeout(function () {
                            $("#btnOrbitBottomLeft").trigger('click');
                        }, timeout);

                        timeout = timeout + animationTime;

                        times--;
                    }

                } else if (move == "W") {
                    while (times > 0) {
                        setTimeout(function () {
                            $("#btnOrbitBackLeft").trigger('click');
                        }, timeout);

                        timeout = timeout + animationTime;

                        times--;
                    }

                } else if (move == "R") {
                    while (times > 0) {
                        setTimeout(function () {
                            $("#btnOrbitTopRight").trigger('click');
                        }, timeout);

                        timeout = timeout + animationTime;

                        times--;
                    }

                } else if (move == "Y") {
                    while (times > 0) {
                        setTimeout(function () {
                            $("#btnOrbitFrontRight").trigger('click');
                        }, timeout);

                        timeout = timeout + animationTime;

                        times--;
                    }

                } else if (move == "G") {
                    while (times > 0) {
                        setTimeout(function () {
                            $("#btnOrbitLeftDown").trigger('click');
                        }, timeout);

                        timeout = timeout + animationTime;

                        times--;
                    }

                } else if (move == "B") {
                    while (times > 0) {
                        setTimeout(function () {
                            $("#btnOrbitRightUp").trigger('click');
                        }, timeout);

                        timeout = timeout + animationTime;

                        times--;
                    }

                } else {
                    alert("Error: Unknown move.")
                    return;
                }

            }

        } else {
            alert("Please load a solution first.");
        }

    });

    // Hide other buttons for now.
    $('.view_buttons').hide();
    $('.test_buttons').hide();

    initGL(); // basic WebGL setup for the scene 

    // load and compile our shaders into a program object
    var shaders = initShaders( gl, "vertex-shader", "fragment-shader" );


    // Counter for current Y_AXIS.
    var currentY = -2;
    var blackDefault = [0.0, 0.0, 0.0, 1.0];

    // If initial state is not loaded, then load defaults.
    if (localStorage.getItem("top") !== null && localStorage.getItem("left") !== null && localStorage.getItem("front") !== null && localStorage.getItem("right") !== null && localStorage.getItem("bottom") !== null && localStorage.getItem("back") !== null) {
        // Store colors for each face in arrays.
        var topColor = localStorage.getItem("top").split("");
        var leftColor = localStorage.getItem("left").split("");
        var frontColor = localStorage.getItem("front").split("");
        var rightColor = localStorage.getItem("right").split("");
        var bottomColor = localStorage.getItem("bottom").split("");
        var backColor = localStorage.getItem("back").split("");

        // Get rgb color values for each face.
        var rgbTopColor = split(jQuery.map(topColor, function (n) { return colors[n]; }), 9);
        var rgbLeftColor = split(jQuery.map(leftColor, function (n) { return colors[n]; }), 9);
        var rgbFrontColor = split(jQuery.map(frontColor, function (n) { return colors[n]; }), 9);
        var rgbRightColor = split(jQuery.map(rightColor, function (n) { return colors[n]; }), 9);
        var rgbBottomColor = split(jQuery.map(bottomColor, function (n) { return colors[n]; }), 9);
        var rgbBackColor = split(jQuery.map(backColor, function (n) { return colors[n]; }), 9);
    } else {
        // Load default colors.
        var rgbTopColor = [colors["R"], colors["R"], colors["R"], colors["R"], colors["R"], colors["R"], colors["R"], colors["R"], colors["R"]];
        var rgbLeftColor = [colors["Y"], colors["Y"], colors["Y"], colors["Y"], colors["Y"], colors["Y"], colors["Y"], colors["Y"], colors["Y"]];
        var rgbFrontColor = [colors["G"], colors["G"], colors["G"], colors["G"], colors["G"], colors["G"], colors["G"], colors["G"], colors["G"]];
        var rgbRightColor = [colors["B"], colors["B"], colors["B"], colors["B"], colors["B"], colors["B"], colors["B"], colors["B"], colors["B"]];
        var rgbBottomColor = [colors["O"], colors["O"], colors["O"], colors["O"], colors["O"], colors["O"], colors["O"], colors["O"], colors["O"]];
        var rgbBackColor = [colors["W"], colors["W"], colors["W"], colors["W"], colors["W"], colors["W"], colors["W"], colors["W"], colors["W"]];
    }

    // Loop and create cubes.
    for (var i = 0; i < 27; i++) {

        // Default color to black.
        var frontFaceColor = blackDefault;
        var rightFaceColor = blackDefault;
        var bottomFaceColor = blackDefault;
        var topFaceColor = blackDefault;
        var backFaceColor = blackDefault;
        var leftFaceColor = blackDefault;

        // Nine Cubes per slice.
        var mod = i % 9;
        
        // Cube positions for each face.
        var topFacePositions    = [18,21,24,19,22,25,20,23,26];
        var bottomFacePositions = [ 2, 5, 8, 1, 4, 7, 0, 3, 6];
        var leftFacePositions   = [18,19,20, 9,10,11, 0, 1, 2];
        var rightFacePositions  = [26,25,24,17,16,15, 8, 7, 6];
        var frontFacePositions  = [20,23,26,11,14,17, 2, 5, 8];
        var backFacePositions   = [0 , 3, 6, 9,12,15,18,21,24];

        // Set initial colors for each cube in a face.
        if (checkPosition(frontFacePositions, i) !== -1) {
            frontFaceColor = rgbFrontColor[checkPosition(frontFacePositions, i)];
        }

        if (checkPosition(rightFacePositions, i) !== -1) {
            rightFaceColor = rgbRightColor[checkPosition(rightFacePositions, i)];
        }

        if (checkPosition(bottomFacePositions, i) !== -1) {
            bottomFaceColor = rgbBottomColor[checkPosition(bottomFacePositions, i)];
        }

        if (checkPosition(topFacePositions, i) !== -1) {
            topFaceColor = rgbTopColor[checkPosition(topFacePositions, i)];
        }

        if (checkPosition(backFacePositions, i) !== -1) {
            backFaceColor = rgbBackColor[checkPosition(backFacePositions, i)];
        }

        if (checkPosition(leftFacePositions, i) !== -1) {
            leftFaceColor = rgbLeftColor[checkPosition(leftFacePositions, i)];
        }

        // Create cube, color order: front, right, bottom, top, back, left
        var cube = new Cube(shaders, [frontFaceColor, rightFaceColor, bottomFaceColor, topFaceColor, backFaceColor, leftFaceColor]);

        // Increase Y_AXIS
        if (mod == 0) {
            currentY++;
        }

        // Set initial cube positions.
        if (mod < 3) { // Left Slice

            // Space out cubes on X_AXIS
            if (checkPosition(leftFacePositions, i) !== -1)
                cube.move(-1.05, X_AXIS);
            else if (checkPosition(rightFacePositions, i) !== -1)
                cube.move(1.05, X_AXIS);
            else
                cube.move(-1, X_AXIS);

            // Space out cubes on Y_AXIS
            if(checkPosition(topFacePositions,i) !== -1)
                cube.move(currentY + 0.05, Y_AXIS);
            else if (checkPosition(bottomFacePositions, i) !== -1)
                cube.move(currentY - 0.05, Y_AXIS);
            else
                cube.move(currentY, Y_AXIS);

            // Space out cubes on Z_AXIS
            if (checkPosition(backFacePositions, i) !== -1)
                cube.move((i % 3) - 1.05, Z_AXIS);
            else if (checkPosition(frontFacePositions, i) !== -1)
                cube.move((i % 3) - 0.95, Z_AXIS);
            else
                cube.move((i % 3) - 1, Z_AXIS);

        } else if (mod < 6) { // Middle slice

            // Space out cubes on X_AXIS
            if (checkPosition(leftFacePositions, i) !== -1)
                cube.move(-1.05, X_AXIS);
            else if (checkPosition(rightFacePositions, i) !== -1)
                cube.move(1.05, X_AXIS);
            else
                cube.move(0, X_AXIS);

            // Space out cubes on Y_AXIS
            if (checkPosition(topFacePositions, i) !== -1)
                cube.move(currentY + 0.05, Y_AXIS);
            else if (checkPosition(bottomFacePositions, i) !== -1)
                cube.move(currentY - 0.05, Y_AXIS);
            else
                cube.move(currentY, Y_AXIS);

            // Space out cubes on Z_AXIS
            if (checkPosition(backFacePositions, i) !== -1)
                cube.move((i % 3) - 1.05, Z_AXIS);
            else if (checkPosition(frontFacePositions, i) !== -1)
                cube.move((i % 3) - 0.95, Z_AXIS);
            else
                cube.move((i % 3) - 1, Z_AXIS);

        } else { // Right slice

            // Space out cubes on X_AXIS
            if (checkPosition(leftFacePositions, i) !== -1)
                cube.move(-1.05, X_AXIS);
            else if (checkPosition(rightFacePositions, i) !== -1)
                cube.move(1.05, X_AXIS);
            else
                cube.move(1, X_AXIS);

            // Space out cubes on Y_AXIS
            if (checkPosition(topFacePositions, i) !== -1)
                cube.move(currentY + 0.05, Y_AXIS);
            else if (checkPosition(bottomFacePositions, i) !== -1)
                cube.move(currentY - 0.05, Y_AXIS);
            else
                cube.move(currentY, Y_AXIS);

            // Space out cubes on Z_AXIS
            if (checkPosition(backFacePositions, i) !== -1)
                cube.move((i % 3) - 1.05, Z_AXIS);
            else if (checkPosition(frontFacePositions, i) !== -1)
                cube.move((i % 3) - 0.95, Z_AXIS);
            else
                cube.move((i % 3) - 1, Z_AXIS);

        }

        // Add to drawable array.
        drawables.push(cube);
    }

    renderScene(); // begin render loop
}

/*  Colors array used for creating cubes 
    with different color faces.
*/
var colors = {
    "R":[202/255, 15/255, 22/255, 1.0], // red
    "Y":[255, 240/255, 1/255, 1.0], // yellow
    "G":[0.0, 114/255, 36/255, 1.0], // green
    "B":[0.0, 151/255, 230/255, 1.0], // blue
    "O":[244/255, 88/255, 1/255, 1.0], // orange
    "W":[209/255, 203/255, 207/255, 1.0]  // white
};

// Helper function to check a dictionary.
function checkPosition(dict, pos) {

    for (var i in dict) {
        if (dict[i] === pos) {
            // If found return position.
            return i;
        }
    }

    // Not found, return -1.
    return -1;
}

// Helper function to split into arrays.
function split(a, n) {
    var len = a.length, out = [], i = 0;
    while (i < len) {
        var size = Math.ceil((len - i) / n--);
        out.push(a.slice(i, i += size));
    }
    return out;
}