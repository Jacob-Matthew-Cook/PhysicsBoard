//Level: Pendulum
var Pendulum = function () {
//  this.maxFrames = 146;
};

Pendulum.prototype.setNiceViewCenter = function (gameGraphics, canvas) {
    point = { x: 0, y: 0.5 };
    gameGraphics.PTM = 500;
    setViewCenterWorld(gameGraphics, canvas, point, true);
}

Pendulum.prototype.setup = function (gameState, gameGraphics) {
    var world = gameState.world;
    world.iterations = 10;
    world.gravity = cp.v(0, -9.80 / 10);
    world.collisionSlop = 0;
    world.collisionBias = Math.pow(1 - 0.5, 60);

    var body1;
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

    var pi = Math.PI;
    var theta1 = 2 * pi * (angle_deg1 / 360)


    //inferred mathematical quantities
    var l_cos1 = l * Math.cos(theta1);
    var l_sin1 = l * Math.sin(theta1);

    //important position vectors
    var zr_pt = cp.v(0, 0)    //origin vector, for calculations
    var st_pt1 = cp.v(l_cos1, h + l_sin1); //first weight (moving)

    var rev_pt = cp.v(0, h); //revolution point of hanging weights
    var hook = cp.v(-hook_offset, 0); //attachment point for each weight
    var hook2 = cp.v(hook_offset, 0); //attachment point for each weight

    //define a box with the following dimensions:
    var len = 0.01; //0.05;
    var wid = 0.08;
    var mass = 0.5;

    body1 = world.addBody(new cp.Body(mass, cp.momentForBox(mass, 2 * wid, 2 * len)));
    body1.setPos(st_pt1);
    body1.setAngle(theta1);
    body1.w_limit = 1.5;

    var GLOBAL_SHAPE1 = gameState.GLOBAL_SHAPE1 = world.addShape(new cp.BoxShape(body1, 2 * wid, 2 * len));
    GLOBAL_SHAPE1.setElasticity(0);
    GLOBAL_SHAPE1.setFriction(1);
    //GLOBAL_SHAPE1.w_limit = 0;

    world.addConstraint(new cp.PinJoint(body1, staticBody, hook, rev_pt));
    world.addConstraint(new cp.PinJoint(body1, staticBody, hook2, rev_pt));

    GLOBAL_SHAPE1.fillStyle = function () { return 'rgba(0, 0, 200, 0.7)'; };
    GLOBAL_SHAPE1.strokeStyle = function () { return 'rgb(0,0,160)'; };

    var t1 = 0;
    var h1 = 0.75;
    var h2 = 0.5;

    this.updateInitialParameters();
    this.updateCurrentParameters(t1.toFixed(3) + 's', h1.toFixed(2) + 'm');
}

Pendulum.prototype.step = function (gameState, gameDygraph, dataTimeStep, graphTimeStep) {

    var GLOBAL_SHAPE1 = gameState.GLOBAL_SHAPE1;

    var vx = GLOBAL_SHAPE1.body.vx;
    var vy = GLOBAL_SHAPE1.body.vy;
    var px = GLOBAL_SHAPE1.body.p.x;
    var py = GLOBAL_SHAPE1.body.p.y;

    //addToPlot4Var(Math.sqrt(vx ** 2 + vy ** 2), py, 0, 0);
    // }
    //GLOBAL_SHAPE.getBody
    //addToPlot4Var();
    var sampleT = myRound(gameDygraph.itr * gameState.stepTime, 3);
    sampleT = sampleT.toFixed(3) + 's';
    var sampleH = myRound(py, 2);
    sampleH = sampleH.toFixed(2) + 'm';

    //if (gameDygraph.itr = )

    this.addToDygraph(gameState, gameDygraph, dataTimeStep, graphTimeStep, py);
    this.updateCurrentParameters(sampleT, sampleH);

    //GLOBAL_SHAPE1.body.w_limit = -10;
}

Pendulum.prototype.initializeDygraph = function (gameState, gameDygraph, graphID) {
    gameDygraph.data = [[0, 0.75]];
    gameDygraph.graph = new Dygraph(
        document.getElementById(graphID),
        gameDygraph.data,
        {
            labels: ['Time', 'Height'],
            xlabel: 'Time (s)',
            ylabel: 'Height (m)',
            series: {
                'Height': {
                    color: 'rgba(255,0,0,1)',
                    strokeWidth: 2
                }
            }
        }          // options
    );
}

Pendulum.prototype.updateCurrentParameters = function (t1, h1) {
    var time = document.getElementById('running-time');
    var currentHeight1 = document.getElementById('pendulum-height');

    time.innerText = t1;
    currentHeight1.innerText = h1;
}
Pendulum.prototype.addToDygraph = function (gameState, gameDygraph, dataTimeStep, graphTimeStep, x) {

    var time = myRound(gameDygraph.itr * gameState.stepTime,3);
    var data = gameDygraph.data;
    var graph = gameDygraph.graph;

    var dataMod = myRound(dataTimeStep/(gameState.stepTime),0); //total iterations until we add data to dygraph
    var graphMod = myRound(graphTimeStep/(gameState.stepTime),0); 
    
    if (gameDygraph.itr%dataMod == 0) {
        //data.push([time, myRound(x, 4)]);
        data.push([time, x]);
        linearAdjust();
    }
    if (gameDygraph.itr % graphMod == 0) {
        graph.updateOptions({ 'file': data });
    }

    gameDygraph.itr++;
}

Pendulum.prototype.updateInitialParameters = function () {
    var table = document.getElementById('initial-values');
    table.innerHTML =
        '<tbody>' +
        '<tr>' +
        '<td colspan="2"><br>Initial Conditions</td>' +
        '</tr>' +
        //length
        '<tr class=\'both-pendulums-init\'>' +
        '<td>Length</td>' +
        '<td id=\"length-initial-1\">0.5 m</td>' +
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
        '<td id="height-initial-1">0.750 m</td>' +
        '</tr>' +

        '</tbody>'
}
