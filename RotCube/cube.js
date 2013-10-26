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

/* Initialize properties of this color cube object. */
Cube.prototype.init = function(program, colors)
{
    this.count = 0;
    this.points = []; // this array will hold raw vertex positions
    this.colors = []; // this array will hold per-vertex color data
    this.transform = mat4(); // initialize object transform as identity matrix
    this.rotateAngle = 0; // initialize rotate angle.
    this.orbitAngle = 0;
    this.orbitAxis = 0;

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

    gl.useProgram( this.program ); // set the current shader programs

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

    // now push buffer data through the pipeline to render this object
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

    //this.transform = mult(rotate(angle, avec), this.transform);
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
    }
}

// Rotate this cube to the right.
Cube.prototype.rotateRight = function () {
    count++;
    this.transform = mult(this.transform, rotate(1, [0, 1, 0]));

    if (count == this.rotateAngle) {
        // Stop rotating.
        this.rotateAngle = 0;

        // Reset count.
        count = 0;
    
        // Re-enable buttons.
        enableBtns();
    }
}

// Rotate this cube to the left.
Cube.prototype.rotateLeft = function () {
    count--;
    this.transform = mult(this.transform, rotate(-1, [0, 1, 0]));

    if (count == this.rotateAngle) {
        // Stop rotating.
        this.rotateAngle = 0;

        // Reset count.
        count = 0;

        // Re-enable buttons.
        enableBtns();
    }
}

/* Set up event callback to start the application */
window.onload = function () {

    // Hide other buttons for now.
    $('.turn_buttons').hide();
    $('.view_buttons').hide();

    initGL(); // basic WebGL setup for the scene 

    // load and compile our shaders into a program object
    var shaders = initShaders( gl, "vertex-shader", "fragment-shader" );

    // Counter for current Y_AXIS.
    var currentY = 0;

    // Loop and create cubes.
    for (var i = 0; i < 27; i++) {

        // Create colored cubes.
        var cube = new Cube(shaders, [colors[(1 + i) % 5], colors[(2 + i) % 5], colors[(3 + i) % 5], colors[(4 + i) % 5], colors[(5 + i) % 5], colors[(6 + i) % 5]])

        // Nine Cubes per slice.
        var mod = i % 9;
        
        // Increase Y_AXIS
        if (mod == 0) {
            currentY++;
        }

        // Set initial cube positions.
        if (mod < 3) {
            cube.move(-1, X_AXIS);
            cube.move(currentY, Y_AXIS);
            cube.move((i % 3) - 1, Z_AXIS);
        } else if (mod < 6) {
            cube.move(0, X_AXIS);
            cube.move(currentY, Y_AXIS);
            cube.move((i % 3) - 1, Z_AXIS);
        } else {
            cube.move(1, X_AXIS);
            cube.move(currentY, Y_AXIS);
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
var colors = [
    [1.0, 0.0, 0.0, 1.0], // red
    [1.0, 1.0, 0.0, 1.0], // yellow
    [0.0, 1.0, 0.0, 1.0], // green
    [0.0, 0.0, 1.0, 1.0], // blue
    [1.0, 0.0, 1.0, 1.0], // magenta
    [1.0, 1.0, 1.0, 1.0]  // white
    ];