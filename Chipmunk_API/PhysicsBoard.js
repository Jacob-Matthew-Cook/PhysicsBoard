var v = cp.v;

var play;
var pause;
var resetLevel;
var slowMotion;
var fastForward;
var loadLevel;
var onClickStep;

var zoomIn;
var zoomOut;
var recenter;
var linearAdjust;

var GRABABLE_MASK_BIT = 1 << 31;
var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;


function myRound(val, places) {
    var c = 1;
    for (var i = 0; i < places; i++)
        c *= 10;
    return Math.round(val * c) / c;
}

function setViewCenterWorld(gameGraphics, canvas, position, instantaneous) {
    var currentViewCenterWorld = getWorldPointFromPixelPoint(gameGraphics, canvas, gameGraphics.viewCenterPixel);
    var toMoveX = position.x - currentViewCenterWorld.x;
    var toMoveY = position.y - currentViewCenterWorld.y;
    var fraction = instantaneous ? 1 : 0.25;
    canvas.offset.x -= myRound(fraction * toMoveX * gameGraphics.PTM, 0);
    canvas.offset.y += myRound(fraction * toMoveY * gameGraphics.PTM, 0);
}

function getWorldPointFromPixelPoint(gameGraphics, canvas, pixelPoint) {
    return {
        x: (pixelPoint.x - canvas.offset.x) / gameGraphics.PTM,
        y: (pixelPoint.y - (canvas.id.height - canvas.offset.y)) / gameGraphics.PTM
    };
}

function angle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}

function PhysicsBoard(levelToLoad, inputTimeStep, inputDataTimeStep, inputGraphTimeStep, inputPlotInterval, canvasID, graphID, visualOptions) {
    var worldAxes;
    var timeStep = inputTimeStep; //Seconds

    //animate Loop variables
    var delta = 0;
    var lastFrameTimeMs = 0;

    var GRABABLE_MASK_BIT = 1 << 31;
    var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;
    var load_time = Date.now();

    var canvas = {
        id: document.getElementById(canvasID),
        offset: { x: 0, y: 0 }
    };

    var gameGraphics = gameGraphics = {
        canvas: canvas,
        PTM: 500,
        lineThickness: 3,
        viewCenterPixel: { x: 0, y: 0 },
        speed: 1,
        fps: 0,
        fpsQueue: [],
        fpsQueueLength: 50,
        timeStamp: null,
        animationFrame: null,
        draw: {
            appliedForce: ((visualOptions.drawAppliedForce) ? visualOptions.drawAppliedForce : false),
            normalAndFrictionForces: ((visualOptions.drawNormalAndFrictionForces) ? visualOptions.drawNormalAndFrictionForces : false),
            constraintForces: ((visualOptions.drawConstraintForces) ? visualOptions.drawConstraintForces : false),
            gravityForce: ((visualOptions.drawGravityForce) ? visualOptions.drawGravityForce : false),
            boundingBox: ((visualOptions.drawBoundingBox) ? visualOptions.drawBoundingBox : false),
            velocity: ((visualOptions.drawVelocity) ? visualOptions.drawVelocity : false),
            angVel: ((visualOptions.drawAngVel) ? visualOptions.drawAngVel : false)
        },
        vectorScale: ((visualOptions.vectorScale) ? visualOptions.vectorScale : 1),
        velocityScale: ((visualOptions.velocityScale) ? visualOptions.velocityScale : 1),
        angVelScale: ((visualOptions.angVelScale) ? visualOptions.angVelScale : 1)
    }

    var gameDygraph = {
        itr: 0,
        graph: null,
        data: [],
        plotMax: 3000, //500
        dataPlotInterval: inputDataTimeStep, //Add a Data Point Once Every Time Period
        graphUpdateInterval: inputGraphTimeStep //Update Graph Once Every Time Period
    }

    var mouse = {
        joint: null,
        body: null,
        buttonDown: false,
        posPixel: { x: 0, y: 0 },
        prevPosPixel: { x: 0, y: 0 },
        posWorld: { x: 0, y: 0 }
    }

    //Game State
    var gameState = {
        stepTime: inputTimeStep,
        run: false,
        reset: true,
        currentTest: null,
        world: null,
        shapeArray: [],
        graphics: gameGraphics,
        dygraph: gameDygraph
    }

    var statusUpdateCounter = 0;
    var shiftDown = false;

    //calling 1st Layer Functions
    initializeEvents(gameGraphics,canvas);
    initializeLevel(levelToLoad);


    //Top Layer Function
    function initializeEvents(gameGraphics, canvas) {
        var canvasID = canvas.id;

        canvas.offset.x = canvasID.width / 2;
        canvas.offset.y = canvasID.height / 2;

        setCenterViewPixel(gameGraphics, canvas);

        canvasID.addEventListener('mousemove', function (evt) {
            onMouseMove(gameGraphics, canvas, evt);
        }, false);

        canvasID.addEventListener('mousedown', function (evt) {
            onMouseDown(canvas, evt);
        }, false);

        canvasID.addEventListener('mouseup', function (evt) {
            onMouseUp(canvas, evt);
        }, false);

        canvasID.addEventListener('mouseout', function (evt) {
            onMouseOut(canvas, evt);
        }, false);

        canvasID.addEventListener('keydown', function (evt) {
            onKeyDown(gameGraphics, canvas, mouse, evt);
        }, false);

        canvasID.addEventListener('keyup', function (evt) {
            onKeyUp(canvas, evt);
        }, false);

        canvasID.addEventListener('wheel', function (e) {
            if (e.deltaY < 0) {
                zoomOutMouse(gameGraphics, canvas, mouse);
            }
            if (e.deltaY > 0) {
                zoomInMouse(gameGraphics, canvas, mouse);
            }
        });
        document.addEventListener('visibilitychange', function (evt) {
            pause();
        }, false);


    }

    function initializeLevel(name) {

        //taken from resetScene()
        gameState.shapeArray = [];

        erasePlotData();
        gameState.run = false;
        gameState.reset = true; //true
        createWorldFromName(name);

        //taken from changeTest()
        var currentTest = gameState.currentTest;
        if (currentTest && currentTest.setNiceViewCenter)
            currentTest.setNiceViewCenter(gameGraphics, canvas);
        else {
            defaultSetNiceViewCenter(gameGraphics, canvas);
        }
        if (currentTest && currentTest.initializeDygraph) {
            currentTest.initializeDygraph(gameState, gameDygraph, graphID);
        }
        else {
            defaultDygraph();
        }
        draw();

        return this;
    }


    //Second Layer Functions

    //Events: Buttons and Controls
    function onMouseMove(gameGraphics, canvas, evt) {
        mouse.prevPosPixel = mouse.posPixel;
        updateMousePos(canvas, evt);

        //if (shiftDown) {
        if (mouse.buttonDown && mouse.joint == null) {
            canvas.offset.x += (mouse.posPixel.x - mouse.prevPosPixel.x);
            canvas.offset.y -= (mouse.posPixel.y - mouse.prevPosPixel.y);
            draw();
        }
        else if (mouse.buttonDown && mouse.joint != null) {
            updateMousePos(canvas, evt);
        }
    }
    function onMouseDown(canvas, evt) {
        updateMousePos(canvas, evt);
        if (!mouse.buttonDown) {
            startMouseJoint();
        }
        mouse.buttonDown = true;
    }

    function onMouseUp(canvas, evt) {
        var world = gameState.world;
        mouse.buttonDown = false;
        updateMousePos(canvas, evt);
        if (mouse.joint != null) {
            world.removeConstraint(mouse.joint);
            mouse.joint = null;
        }
    }
    function onMouseOut(canvas, evt) {
        onMouseUp(canvas, evt);
    }

    function onKeyDown(gameGraphics, canvas, mouse, evt) {
        if (evt.keyCode == 13) {//ENTER
            play();
        }
        else if (evt.keyCode == 80) {//p
            pause();
        }
        else if (evt.keyCode == 81) {//q
            stop();
        }
        else if (evt.keyCode == 82) {//r
            resetScene();
        }
        else if (evt.keyCode == 83) {//s
            step(timeStep);
        }
        else if (evt.keyCode == 88) {//x
            zoomOut(gameGraphics, canvas, mouse);
        }
        else if (evt.keyCode == 90) {//z
            zoomIn(gameGraphics, canvas, mouse);
        }
        else if (evt.keyCode == 37) {//left
            canvas.offset.x += 32;
        }
        else if (evt.keyCode == 39) {//right
            canvas.offset.x -= 32;
        }
        else if (evt.keyCode == 38) {//up
            canvas.offset.y += 32;
        }
        else if (evt.keyCode == 40) {//down
            canvas.offset.y -= 32;
        }
        else if (evt.keyCode == 16) {//shift
            shiftDown = true;
        }

        if (gameState.currentTest && gameState.currentTest.onKeyDown)
            gameState.currentTest.onKeyDown(gameGraphics, canvas, mouse, evt);
    }

    function onKeyUp(canvas, evt) {
        if (evt.keyCode == 16) {//shift
            shiftDown = false;
        }
        if (gameState.currentTest && gameState.currentTest.onKeyUp)
            gameState.currentTest.onKeyUp(canvas, evt);
    }

    function zoomInMouse(gameGraphics, canvas, mouse) {
        var currentViewCenterWorld = getWorldPointFromPixelPoint(gameGraphics, canvas, mouse.posPixel); //get the center pixel current location
        gameGraphics.PTM *= 1.1; //stretch the current location linearly away from the origin
        var newViewCenterWorld = getWorldPointFromPixelPoint(gameGraphics, canvas, mouse.posPixel); //get the new location for the center (Globally accounts for the zoom)
        canvas.offset.x += (newViewCenterWorld.x - currentViewCenterWorld.x) * gameGraphics.PTM; //shift the necessary corresponding linear displacement
        canvas.offset.y -= (newViewCenterWorld.y - currentViewCenterWorld.y) * gameGraphics.PTM;
        if (gameState.run == false) {
            draw();
        }
    }

    function zoomOutMouse(gameGraphics, canvas, mouse) {
        var currentViewCenterWorld = getWorldPointFromPixelPoint(gameGraphics, canvas, mouse.posPixel);
        gameGraphics.PTM /= 1.1;
        var newViewCenterWorld = getWorldPointFromPixelPoint(gameGraphics, canvas, mouse.posPixel);
        canvas.offset.x += (newViewCenterWorld.x - currentViewCenterWorld.x) * gameGraphics.PTM;
        canvas.offset.y -= (newViewCenterWorld.y - currentViewCenterWorld.y) * gameGraphics.PTM;
        if (gameState.run == false) {
            draw();
        }
    }
    function zoomInFunction() {
        var currentViewCenterWorld = getWorldPointFromPixelPoint(gameGraphics, canvas, gameGraphics.viewCenterPixel);
        gameGraphics.PTM *= 1.1;
        var newViewCenterWorld = getWorldPointFromPixelPoint(gameGraphics, canvas, gameGraphics.viewCenterPixel);
        canvas.offset.x += (newViewCenterWorld.x - currentViewCenterWorld.x) * gameGraphics.PTM;
        canvas.offset.y -= (newViewCenterWorld.y - currentViewCenterWorld.y) * gameGraphics.PTM;
        if (gameState.run == false) {
            draw();
        }

        return zoomInFunction;
    }
    zoomIn = zoomInFunction;

    function zoomOutFunction() {
        var currentViewCenterWorld = getWorldPointFromPixelPoint(gameGraphics, canvas, gameGraphics.viewCenterPixel);
        gameGraphics.PTM /= 1.1;
        var newViewCenterWorld = getWorldPointFromPixelPoint(gameGraphics, canvas, gameGraphics.viewCenterPixel);
        canvas.offset.x += (newViewCenterWorld.x - currentViewCenterWorld.x) * gameGraphics.PTM;
        canvas.offset.y -= (newViewCenterWorld.y - currentViewCenterWorld.y) * gameGraphics.PTM;
                if (gameState.run == false) {
            draw();
        }

        return zoomOutFunction;
    }
    zoomOut = zoomOutFunction;



    function animate(timestamp) {
        // ...
        //if a timestamp doesnt exist, then we will assume delta is zero
        if (!timestamp) {
            delta = 0;
            lastFrameTimeMs = performance.now();
        }
        //otherwise, we will set our time between animations to delta
        else {
            // Track the accumulated time that hasn't been simulated yet
            delta += gameGraphics.speed*(timestamp - lastFrameTimeMs); // note += here
            lastFrameTimeMs = timestamp;
        }

        // Simulate the total elapsed time in fixed-size chunks
        while (delta > 0) { //iterate this until sim has caught up to real-life
            step(timeStep); //iterate the game by the established timestep
            delta -= timeStep*1000; //subtract our timestamp from our time difference between frames
        }
        draw();
        gameGraphics.animationFrame = requestAnimationFrame(animate);
    }

    function setCenterViewPixel(gameGraphics, canvas) {
        gameGraphics.viewCenterPixel.x = canvas.id.width / 2;
        gameGraphics.viewCenterPixel.y = canvas.id.height / 2;
    }

    function updateMousePos(canvas, evt) {
        var rect = canvas.id.getBoundingClientRect();
        mouse.posPixel = {
            x: evt.clientX - rect.left,
            y: canvas.id.height - (evt.clientY - rect.top)
        };
        mouse.posWorld = getWorldPointFromPixelPoint(gameGraphics, canvas, mouse.posPixel);
    }

    function defaultSetNiceViewCenter(gameGraphics, canvas) {
        var maxHeight_M = 480;
        var minHeight_M = 0;
        var minLeft_M = 0;
        var maxLeft_M = 640;

        var maxHeight_P = canvas.id.height;
        var maxLeft_P = canvas.id.width;

        var PTM_byHeight = canvas.id.height / (maxHeight_M - minHeight_M);
        var PTM_byWidth = canvas.id.width / (maxLeft_M - minLeft_M);

        gameGraphics.PTM = 0.5 * Math.min(PTM_byHeight, PTM_byWidth);

        var position = new cp.v((maxLeft_M + minLeft_M) / 2, (maxHeight_M + minHeight_M) / 2);
        setViewCenterWorld(gameGraphics, canvas, position, true);
    }



    function draw() { //   function draw(gameGraphics, canvas) {
        // Draw shapes
        var world = gameState.world;

        var context = (document.getElementById("canvas")).getContext('2d');

        //Make the white background
        context.fillStyle = 'rgb(255,255,255)';
        context.fillRect(0, 0, canvas.id.width, canvas.id.height);

        //save default state for camera
        context.save();

        //move the camera to the default offset 
        context.translate(canvas.offset.x, canvas.offset.y);

        //invert the y-axis so it is no longer inverted. This gives proper cartesian coordinates
        context.scale(1, -1);

        //zoom the camera by Pixels to Meter (PTM)
        context.scale(gameGraphics.PTM, gameGraphics.PTM);

        //set the default line width to be independent of zoom
        context.lineWidth /= gameGraphics.PTM / gameGraphics.lineThickness;

        //draw segments first
        world.eachShape(function (shape) {
            if (shape.type == "segment") {
                context.fillStyle = shape.fillStyle(gameState);
                context.strokeStyle = shape.strokeStyle(gameState);
                context.strokeWidth = 2 / gameGraphics.PTM
                shape.draw(context, gameGraphics.PTM);

                //if (gameGraphics.draw.boundingBox)
                //    shape.drawBoundingBox(context, gameGraphics.PTM, gameGraphics);
            }
        });

        //draw the shapes on top of the segments
        world.eachShape(function (shape) {
            if (shape.type != "segment") {
                context.fillStyle = shape.fillStyle(gameState);
                context.strokeStyle = shape.strokeStyle(gameState);
                context.strokeWidth = 2 / gameGraphics.PTM
                shape.draw(context, gameGraphics.PTM);

                if (gameGraphics.draw.gravityForce)
                    shape.drawGravity(context, gameGraphics.PTM, gameGraphics);
                if (gameGraphics.draw.appliedForce)
                    shape.drawForceWithTorqueOffset(context, gameGraphics.PTM, gameGraphics);
                if (gameGraphics.draw.boundingBox)
                    shape.drawBoundingBox(context, gameGraphics.PTM, gameGraphics);
                if (gameGraphics.draw.velocity)
                    shape.drawVelocity(context, gameGraphics.PTM, gameGraphics)
                if (gameGraphics.draw.angVel)
                    shape.drawAngVel(context, gameGraphics.PTM, gameGraphics)
            }
        });

        world.eachConstraint(function (constraint) {
            if (constraint.draw) {
                constraint.draw(context, gameGraphics.PTM);
                if (gameGraphics.draw.constraintForces)
                    constraint.drawForce(context, gameGraphics.PTM, gameState.stepTime, gameGraphics);
            }
        });

        world.eachBody(function (body) {
            body.eachArbiter(function (arbiter) {
                if (gameGraphics.draw.normalAndFrictionForces)
                    arbiter.draw(context, gameGraphics.PTM, gameState.stepTime, gameGraphics);
            })
        });

        gameGraphics.fps = myRound(1000/(performance.now() - gameGraphics.timeStamp),0);
        gameGraphics.timeStamp = performance.now();
        gameGraphics.fpsQueue.push(gameGraphics.fps);
        while (gameGraphics.fpsQueue.length > gameGraphics.fpsQueueLength)
            gameGraphics.fpsQueue.shift();

        drawSimulationState(context, gameGraphics.PTM, gameState);

        context.restore();

        

        return this;

    }

    var requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000/60);
            };
    })();

    var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

    function drawSimulationState(context, PTM, gameState) {
        var scale = 16;

        var center = getWorldPointFromPixelPoint(gameGraphics, canvas, gameGraphics.viewCenterPixel);
        context.translate(center.x, center.y);
        context.scale(scale / PTM, -scale / PTM);
        //context.translate(-canvas.id.width / 2, -canvas.id.height / 2);

        context.fillStyle = "black";
        //context.font = "bold 1px Arial";

        var text = gameGraphics.speed;

        if (text < 1) {
            text = "1/" + (1 / text).toFixed(0);
        }
        text = "Speed: " + text + "x";
        var state = "Time Step Size: " + gameState.stepTime * 1000 + " ms";
        var run = "Paused: " + !gameState.run
        var reset = "Reset: " + gameState.reset
        var iteration = "# of Steps: " + gameState.world.stamp;
        var x = -gameGraphics.canvas.id.width / (scale * 2);//;-0.0005 *  * scale;
        var y = -gameGraphics.canvas.id.height / (scale * 2);//-0.0005 * gameGraphics.canvas.id.height/2 * scale;

        context.font = "bold 1px Arial";
        context.fillText("Simulation Status", x, y + 1);
        context.font = "1px Arial";
        context.strokeStyle = 'rgb(0, 0, 0)';
        context.lineWidth = 1/10;
        drawLine(context, { x: x, y: y + 1.1 }, { x: x+8.5, y: y + 1.1 })

        var average = 0;
        for (idx = 0; idx < gameGraphics.fpsQueue.length; idx++) {
            average += gameGraphics.fpsQueue[idx];
        }
        average /= gameGraphics.fpsQueue.length;


        context.fillText(text, x, y + 2);
        context.fillText(state, x, y + 3);
        context.fillText(run, x, y + 4);
        //context.fillText(reset, x, y + 5);
        //context.fillText(iteration, x, y + 6);
        //context.fillText("Frame Rate: " + myRound(average, 0) + " Hz", x, y + 7);
        //context.fillText("Zoom: " + myRound(PTM, 1) + " pixels/m", x, y + 8);

        //var camCenter = getWorldPointFromPixelPoint(gameGraphics, canvas, gameGraphics.viewCenterPixel); 
        //context.fillText("Camera Center: " + myRound(camCenter.x, 2) + " m, " + myRound(camCenter.y, 2) + " m", x, y + 9);
    }

    function startMouseJoint(canvas, evt) {
        var world = gameState.world;
        if (mouse.joint != null) {
            return;
        }
        var point = cp.v(mouse.posWorld.x, mouse.posWorld.y);
        var shape = world.pointQueryFirst(point, GRABABLE_MASK_BIT, cp.NO_GROUP);

        if (shape) {
            var a = mouse.body
            var b = shape.body;
            
            var anchr1 = cp.v(0, 0)
            var anchr2 = b.world2Local(point);

            mouse.joint = new cp.PivotJoint(a, b, anchr1, anchr2)
            world.addConstraint(mouse.joint);
        }
    }

    function defaultDygraph() {
        gameDygraph.graph = new Dygraph(
            document.getElementById(graphID),
            [[0, 0, 0, 0, 0]],
            {
                labels: ['Time', 'Y1', 'Y2', 'Y3', 'Y4'],
                ylabel: 'Body Height',
                y2label: 'Body Velocity',
                series: {
                    'Y1': {
                        color: 'rgba(255,0,0,1)',
                        strokeWidth: 2
                    },
                    'Y2': {
                        color: 'rgba(255,128,0,1)',
                        strokeWidth: 2,
                        axis: 'y2'
                    },
                    "Y3": {
                        color: 'rgba(0,255,0,1)',
                        strokeWidth: 2
                    },
                    'Y4': {
                        color: 'rgba(0,0,255,1)',
                        strokeWidth: 2,
                        axis: 'y2'
                    }
                },
                axes: {
                    y2: {
                        // set axis-related properties here
                        labelsKMB: true,
                        drawGrid: true,
                        independentTicks: true,
                        gridLinePattern: [2, 2]
                    }
                }
            }          // options
        );
    }

    function changeTest() {
        resetLevel();
        if (currentTest && currentTest.setNiceViewCenter)
            currentTest.setNiceViewCenter(gameGraphics, canvas);
        else {
            defaultSetNiceViewCenter();
        }
        if (currentTest && currentTest.initializeDygraph) {
            currentTest.initializeDygraph(gameState,gameDygraph,graphID);
        }
        else {
            defaultDygraph();
        }

        draw();
    }


    function createWorldFromName(name) {
        gameState.world = new cp.Space();
        mouse.body = new cp.Body(Infinity, Infinity);

        eval("var currentTest = new " + name + "();");

        gameState.currentTest = currentTest;

        currentTest.setup(gameState, gameGraphics);
    }

    function createWorld() {
        gameState.world = new cp.Space();
        mouse.body = new cp.Body(Infinity, Infinity);
        var e = document.getElementById("testSelection");
        var v = e.options[e.selectedIndex].value;

        eval("currentTest = new " + v + "();");

        currentTest.setup(gameState, gameGraphics);
    }

    function resetLevelFunction() {
        gameState.run = false; //false
        gameState.reset = true; //true
        gameState.shapeArray = [];
        gameGraphics.speed = 1;

        cancelAnimationFrame(gameGraphics.animationFrame);

        mouse.buttonDown = false;
        mouse.joint = null

        erasePlotData();
        gameGraphics.fps = 0;
        gameGraphics.fpsQueue = [];
        initializeLevel(gameState.currentTest.constructor.name);

        return resetLevelFunction
    }

    resetLevel = resetLevelFunction;

    function loadLevelFunction(levelName) {
        gameState.run = false; //false
        gameState.reset = true; //true
        gameState.shapeArray = [];
        gameState.currentTest = null;
        cancelAnimationFrame(gameGraphics.animationFrame);

        erasePlotData();
        initializeLevel(levelName);
        draw();

        return loadLevelFunction;
    }

    loadLevel = loadLevelFunction;

    function recenterFunction() {
        var currentTest = gameState.currentTest;

        if (currentTest && currentTest.setNiceViewCenter)
            currentTest.setNiceViewCenter(gameGraphics, canvas);
        else {
            defaultSetNiceViewCenter();
        }
        if (gameState.run == false) {
            draw();
        }
        return recenterFunction;
    }

    recenter = recenterFunction;

    function step(timeStep) {
        var world = gameState.world;
        var currentTest = gameState.currentTest;
        if (!maxDurationExceeded()) {
            if (!gameState.reset && gameState.run) { //        if (!reset && !maxFramesExceeded()) { !!!
                world.step(timeStep);
                iterator = ++gameDygraph.itr;
                if (currentTest && currentTest.step)
                    currentTest.step(gameState, gameDygraph, inputDataTimeStep, inputGraphTimeStep);
                                
                var newPoint = v.lerp(mouse.body.p, mouse.posWorld, 0.25);
                mouse.body.v = v.mult(v.sub(newPoint, mouse.body.p), 60);
                mouse.body.p = newPoint;
                return;
            }
        }
    }

    function onClickStepFunction(duration) {
        if (gameState.reset == true)
            gameState.reset = false;

        var world = gameState.world;
        var currentTest = gameState.currentTest;

        var timeStep = gameState.stepTime;
        var iterator = gameDygraph.itr;

        var start = timeStep * iterator;
        var end = start + duration;
        if ((!maxDurationExceeded())&&gameState.run==false) {
            while (timeStep * iterator < end) {
                if (!gameState.run) { //        if (!reset && !maxFramesExceeded()) { !!!
                    world.step(timeStep);
                    iterator = ++gameDygraph.itr;
                    if (currentTest && currentTest.step)
                        currentTest.step(gameState, gameDygraph, inputDataTimeStep, inputGraphTimeStep);

                    var newPoint = v.lerp(mouse.body.p, mouse.posWorld, 0.25);
                    mouse.body.v = v.mult(v.sub(newPoint, mouse.body.p), 60);
                    mouse.body.p = newPoint;
                }
            }
            draw();
        }

        return this;
    }

    onClickStep = onClickStepFunction;

    function pauseFunction() {
        if (gameState.run == true) {
            gameState.run = false;
            cancelAnimationFrame(gameGraphics.animationFrame);
            draw();
        }
        else {
            gameState.run = true;
            gameState.reset = false;
            animate();
        }
        return this;
    }

    pause = pauseFunction;

    function playFunction() {
        gameGraphics.speed = 1;
        if (gameState.run == false) {
            gameState.run = true;
            gameState.reset = false;
            animate();
        }

        return this;
    }

    play = playFunction;

    function slowMotionFunction() {
        if (gameState.reset == true)
            gameState.reset = false;
        if (gameState.run == false)
            gameGraphics.speed = 1;
        else
            cancelAnimationFrame(gameGraphics.animationFrame)

        gameGraphics.speed *= 0.5;
        gameState.run = true;
        animate();
        return this;
    }

    slowMotion = slowMotionFunction;

    function fastForwardFunction() {
        if (gameState.reset == true)
            gameState.reset = false;
        if (gameState.run == false)
            gameGraphics.speed = 1;
        else
            cancelAnimationFrame(gameGraphics.animationFrame)

        gameGraphics.speed *= 2;
        gameState.run = true;
        animate();
        return this;
    }

    fastForward = fastForwardFunction;


    function linearAdjustFunction() {
        var data = gameDygraph.data;
        var plotMax = inputPlotInterval / inputDataTimeStep //total time I want (s)* 1
        if (data.length >= plotMax) {
            //rewrite data 
            data.shift();
        }
        return this;
    }
    linearAdjust = linearAdjustFunction;

    function erasePlotData() {
        //    data = [[0, 0, 0, 0, 0]];
        var currentTest = gameState.currentTest;
        gameDygraph.data = null;
        gameDygraph.itr = 0;
    }


    function maxDurationExceeded() {
        var currentTest = gameState.currentTest;
        if (currentTest && currentTest.maxDuration) {
            if (gameDygraph.itr*gameState.stepTime <= currentTest.maxDuration) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }

    }
}
