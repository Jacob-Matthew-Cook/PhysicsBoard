//Level: Pendulum!
var Pendulum2 = function () {
  //  this.maxFrames = 142;
};

Pendulum2.prototype.setNiceViewCenter = function (gameGraphics, canvas) {
    point = { x: 0, y: 0.5 };
    PTM = 500;
    setViewCenterWorld(gameGraphics, canvas, point, true);
}

Pendulum2.prototype.setup = function (gameState, gameGraphics) {
    //this function will be called at the beginning of every time step
    var world = gameState.world;
    world.iterations = 10;
    world.gravity = cp.v(0, -9.8/10);
    world.collisionSlop = 0;
    world.collisionBias = Math.pow(1 - 0.5, 60);

    var body1;
    var body2;
    var staticBody = new cp.Space().staticBody;

    var floor = world.addShape(new cp.SegmentShape(world.staticBody, v(-1, 0), v(1, 0), 0));
    floor.setElasticity(1);
    floor.setFriction(1);
    floor.setLayers(NOT_GRABABLE_MASK);


    //set all mathematical quantities
    var l = 0.5;  // 0.510;
    var h = 1; // 0.510;
    var hook_offset = 0.05 //0.01;

    var angle_deg1 = 270 - 60;
    var angle_deg2 = 270;

    var pi = Math.PI;
    var theta1 = 2 * pi * (angle_deg1 / 360)
    var theta2 = 2 * pi * (angle_deg2 / 360)

    var len = 0.01; //0.05;
    var wid = 0.08;
    var mass = 0.5;

    //inferred mathematical quantities
    var l_cos1 = l * Math.cos(theta1);
    var l_sin1 = l * Math.sin(theta1);
    var l_cos2 = l * Math.cos(theta2);
    var l_sin2 = l * Math.sin(theta2);

    //important position vectors
    var zr_pt = cp.v(0, 0)    //origin vector, for calculations
    var st_pt1 = cp.v(l_cos1, h + l_sin1); //first weight (moving)
    var st_pt2 = cp.v(l_cos2+2*len, h + l_sin2); //second weight (at base)

    var rev_pt1 = cp.v(0, h); //revolution point of hanging weights
    var rev_pt2 = cp.v(2*len, h); //revolution point of hanging weights
    var hook = cp.v(-hook_offset, 0); //attachment point for each weight

        //define a box with the following dimensions:


    body1 = world.addBody(new cp.Body(mass, cp.momentForBox(mass, 2*wid, 2*len) ));
    body1.setPos(st_pt1);
    body1.setAngle(theta1)

    var GLOBAL_SHAPE1 = gameState.GLOBAL_SHAPE1 = world.addShape(new cp.BoxShape(body1, 2*wid, 2*len));
    GLOBAL_SHAPE1.setElasticity(0);
    GLOBAL_SHAPE1.setFriction(1);
    //shape.setDamping(0);
    world.addConstraint(new cp.PinJoint(body1, staticBody, hook, rev_pt1));

    body2 = world.addBody(new cp.Body(mass, cp.momentForBox(mass, 2 * wid, 2 * len)));
    body2.setPos(st_pt2);
    body2.setAngle(theta2)

    var GLOBAL_SHAPE2 = gameState.GLOBAL_SHAPE2 = world.addShape(new cp.BoxShape(body2, 2 * wid, 2 * len));
    GLOBAL_SHAPE2.setElasticity(0);
    GLOBAL_SHAPE2.setFriction(1);
    //shape.setDamping(0);
    world.addConstraint(new cp.PinJoint(body2, staticBody, hook, rev_pt2));


    GLOBAL_SHAPE1.fillStyle = function () { return 'rgba(0, 0, 200, 0.7)'; };
    GLOBAL_SHAPE1.strokeStyle = function () { return 'rgb(0,0,160)'; };

    GLOBAL_SHAPE2.fillStyle = function () { return 'rgba(230, 25, 25, 0.7)'; };
    GLOBAL_SHAPE2.strokeStyle = function () { return 'rgb(200, 0, 0)'; };

    this.updateInitialParameters();
    this.updateCurrentParameters('0.000', '0.75m', '0.50m')
}

Pendulum2.prototype.step = function (gameState, gameDygraph, dataTimeStep, graphTimeStep) {
    var GLOBAL_SHAPE1 = gameState.GLOBAL_SHAPE1;
    var GLOBAL_SHAPE2 = gameState.GLOBAL_SHAPE2;


        var py = GLOBAL_SHAPE1.body.p.y;

        var py2 = GLOBAL_SHAPE2.body.p.y;
        //addToPlot4Var(Math.sqrt(vx ** 2 + vy ** 2), py, 0, 0);
        // }
        //GLOBAL_SHAPE1.getBody
        //addToPlot4Var();
        var sampleT = myRound(gameDygraph.itr * gameState.stepTime, 3);
        sampleT = sampleT.toFixed(3) + 's';
        var sampleH = myRound(py, 2);
        sampleH = sampleH.toFixed(2) + 'm';
        var sampleH2 = myRound(py2, 2);
        sampleH2 = sampleH2.toFixed(2) + 'm';

        this.updateCurrentParameters(sampleT, sampleH, sampleH2);
        this.addToDygraph(gameState, gameDygraph, dataTimeStep, graphTimeStep, py, py2);
}

Pendulum2.prototype.initializeDygraph = function (gameState, gameDygraph, graphID) {
    gameDygraph.data = [[0, gameState.GLOBAL_SHAPE1.body.p.y, gameState.GLOBAL_SHAPE2.body.p.y]];
    gameDygraph.graph = new Dygraph(
        document.getElementById(graphID),
        gameDygraph.data,
        {
            labels: ['Time', 'Height1', 'Height2'],
            xlabel: 'Time (s)',
            ylabel: 'Height 1 (m)',
            y2label: 'Height 2 (m)',
            series: {
                'Height1': {
                    color: 'rgba(0,0,255,0.7)',
                    strokeWidth: 2
                },
                'Height2': {
                    color: 'rgba(255,0,0,0.7)',
                    strokeWidth: 2
                }
            }
        }          // options
    );
}

Pendulum2.prototype.addToDygraph = function (gameState, gameDygraph, dataTimeStep, graphTimeStep, x, y) {
    //var t = Date.now() - load_time;

    // logAdjust();
    var time = myRound(gameDygraph.itr * gameState.stepTime, 3);
    var data = gameDygraph.data;
    var graph = gameDygraph.graph;

    //Use this
    //  data.push([t, x, y, z]);
    //  graphDy.updateOptions({ 'file': data });

    var dataMod = myRound(dataTimeStep / (gameState.stepTime), 0); //total iterations until we add data to dygraph
    var graphMod = myRound(graphTimeStep / (gameState.stepTime), 0);

    if (gameDygraph.itr % dataMod == 0) {
        //data.push([time, myRound(x, 4)]);
        data.push([time, x, y]);
        linearAdjust();
    }
    if (gameDygraph.itr % graphMod == 0) {
        graph.updateOptions({ 'file': data });
    }

    gameDygraph.itr++;

}

Pendulum2.prototype.updateInitialParameters = function () {
    var table = document.getElementById('initial-values');
    table.innerHTML =
        '<tbody>' +
        '<tr class=\'pendulum-1-init\'>' +
        '<td colspan="2">Initial Conditions</td>' +
        '</tr>' +
        //length
        '<tr class=\'both-pendulums-init\'>' +
        '<td>Length</td>' +
        '<td id=\"length-initial-1\">0.5 m</td>' +
        '</tr>' +
        //cor
        '<tr class=\'both-pendulums-init\'>' +
        '<td>Coefficient of Restitution</td>' +
        '<td id="coef-init"> 0 </td>' +
        '</tr>' +
        //body1
        '<tr class=\'pendulum-1-init\'>' +
        '<td>Mass 1</td>' +
        '<td id=\"mass-initial-1\">0.5 kg</td>' +
        '</tr>' +

        '<tr class=\'pendulum-1-init\'>' +
        '<td>Angle 1</td>' +
        '<td id="angle-initial-1">60 deg</td>' +
        '</tr>' +

        '<tr class=\'pendulum-1-init\'>' +
        '<td>Height 1</td>' +
        '<td id="height-initial-1">0.75 m</td>' +
        '</tr>' +

        //body2
        '<tr class=\'pendulum-2-init\'>' +
        '<td>Mass 2</td>' +
        '<td id=\"mass-initial-2\">0.5 kg</td>' +
        '</tr>' +

        '<tr class=\'pendulum-2-init\'>' +
        '<td>Angle 2</td>' +
        '<td id="angle-initial-2">0 deg</td>' +
        '</tr>' +

        '<tr class=\'pendulum-2-init\'>' +
        '<td>Height 2</td>' +
        '<td id="height-initial-2">0.50 m</td>' +
        '</tr>' +

        '</tbody>'
}

Pendulum2.prototype.updateCurrentParameters = function (t1, h1, h2) {
    var time = document.getElementById('running-time');
    var currentHeight1 = document.getElementById('pendulum-height');
    var currentHeight2 = document.getElementById('pendulum-height-2');
    //var currentHeight2 =

    time.innerText = t1;
    currentHeight1.innerText = h1;
    currentHeight2.innerText = h2;
}

/*
 var embox2dTest_template = function() {
    //constructor
}

embox2dTest_template.prototype.setNiceViewCenter = function() {
    //called once when the user changes to this test from another test
    PTM = 32;
    setViewCenterWorld( new b2Vec2(0,0), true );
}

embox2dTest_template.prototype.setup = function() {
    //set up the Box2D scene here - the world is already created
}

embox2dTest_template.prototype.step = function() {
    //this function will be called at the beginning of every time step
}

embox2dTest_template.prototype.onKeyDown = function(canvas, evt) {
    if ( evt.keyCode == 65 ) { // 'a'
        //do something when the 'a' key is pressed
    }
}

embox2dTest_template.prototype.onKeyUp = function(canvas, evt) {
    if ( evt.keyCode == 65 ) { // 'a'
        //do something when the 'a' key is released
    }
}
 
 */
