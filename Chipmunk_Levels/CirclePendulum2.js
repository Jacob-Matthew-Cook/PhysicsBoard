//Level: Pendulum
var CirclePendulum2 = function () {
    this.maxDuration = 0.741;
};

CirclePendulum2.prototype.setNiceViewCenter = function (gameGraphics, canvas) {
    var point = { x: -0.01, y: 0.25 };
    gameGraphics.PTM = 580;
    setViewCenterWorld(gameGraphics, canvas, point, true);
}

CirclePendulum2.prototype.setup = function (gameState, gameGraphics) {


    var UNHITTABLE = 1 << 16;
    var SHAPES = 1 << 1;

    var world = gameState.world;
    world.iterations = 10;
    world.gravity = cp.v(0, -9.8);
    world.collisionSlop = 0;
    world.collisionBias = Math.pow(1 - 0.5, 60);

    var body1;
    var staticBody = new cp.Space().staticBody;

    var axisX = world.addShape(new cp.SegmentShape(world.staticBody, v(-0.5, -0.1), v(0.5, -0.1), 0.005));
    axisX.setElasticity(1);
    axisX.setFriction(1);
    axisX.setLayers(UNHITTABLE);

    var pixelFactor = 40;


    var axisY = world.addShape(new cp.SegmentShape(world.staticBody, v(-0.5, -0.1), v(-0.5, 0.5), 0.005));
    axisY.setElasticity(1);
    axisY.setFriction(1);
    axisY.setLayers(UNHITTABLE);



    for (var gridBar = 0; gridBar <= 10; gridBar++) {
        var gridV = world.addShape(new cp.SegmentShape(world.staticBody, v(-gridBar / 10 + 0.5, -0.1), v(-gridBar / 10 + 0.5, 0.5), 0));
        gridV.setLayers(UNHITTABLE);

        gridV.draw = function (context) {
            context.scale(1 / pixelFactor, -1 / pixelFactor);
            context.fillStyle = "blue";
            context.font = "bold 1px Arial";

            var text = (100 * this.ta.x).toFixed(0) + " cm";

            //context.fillText(text, pixelFactor*this.ta.x, -pixelFactor*this.ta.y);
            context.scale(pixelFactor, -pixelFactor);

            context.strokeStyle = 'rgb(106,108,110)';
            var oldLineWidth = context.lineWidth;
            context.lineWidth = 0.001;
            drawLine(context, this.ta, this.tb);
            context.lineWidth = oldLineWidth;
        }

        if (gridBar >= 5) {
            var gridH = world.addShape(new cp.SegmentShape(world.staticBody, v(-0.5, -gridBar / 10 + 1), v(0.5, -gridBar / 10 + 1), 0));
            gridH.setLayers(UNHITTABLE);

            gridH.draw = function (context) {
                context.scale(1 / pixelFactor, -1 / pixelFactor);
                context.fillStyle = "blue";
                context.font = "bold 1px Arial";

                var text = (100 * this.ta.y).toFixed(0) + " cm";

                context.fillText(text, pixelFactor * (this.ta.x + -0.08), -pixelFactor * (this.ta.y + this.tb.y) / 2);
                context.scale(pixelFactor, -pixelFactor);

                context.strokeStyle = 'rgb(106,108,110)';
                var oldLineWidth = context.lineWidth;
                context.lineWidth = 0.001;
                drawLine(context, this.ta, this.tb);
                context.lineWidth = oldLineWidth;
            }
        }

        /*
        context.scale(1 / pixelFactor, -1 / pixelFactor);
        context.font = "1px Arial";
        context.fillText("Q", pixelFactor * this.tc.x, -pixelFactor * this.tc.y);
        context.scale(pixelFactor, -pixelFactor);
        */
    }
        /*
        context.scale(1 / pixelFactor, -1 / pixelFactor);
        context.font = "1px Arial";
        context.fillText("Q", pixelFactor * this.tc.x, -pixelFactor * this.tc.y);
        context.scale(pixelFactor, -pixelFactor);
        */
    
    //set all mathematical quantities
    var l = 0.5;  // 0.510;
    var h = 0.5; // 0.510;
    //var hook_offset = 0.00 //0.01;

    var angle_deg1 = 270 - 60;
    var angle_deg2 = 270;

    var pi = Math.PI;
    var theta1 = 2 * pi * (angle_deg1 / 360);
    var theta2 = 2 * pi * (angle_deg2 / 360);

    //inferred mathematical quantities
    var l_cos1 = l * Math.cos(theta1);
    var l_sin1 = l * Math.sin(theta1);
    var l_cos2 = l * Math.cos(theta2);
    var l_sin2 = l * Math.sin(theta2);

    //Shared Pendulum Body Properties
    var mass = 0.5;
    var radInner = 0;
    var radOuter = 0.05

    //important position vectors
    var zr_pt = cp.v(0, 0)    //origin vector, for calculations
    var st_pt1 = cp.v(l_cos1, h + l_sin1); //first weight (moving)
    var st_pt2 = cp.v(l_cos2+2*radOuter, h + l_sin2); //first weight (moving)

    var rev_pt1 = cp.v(0, h); //revolution point of hanging weights
    var rev_pt2 = cp.v(2*radOuter, h); //revolution point of hanging weights

    //Create First Pendulum
    body1 = world.addBody(new cp.Body(mass, cp.momentForCircle(mass, radInner, radOuter, zr_pt)));
    body1.setPos(st_pt1);
    body1.setAngle(0);

    var shape1 = gameState.shapeArray[0]  = world.addShape(new cp.CircleShape(body1, radOuter, zr_pt));
    shape1.setElasticity(0);
    shape1.setFriction(1);
    shape1.setLayers(SHAPES);

    world.addConstraint(new cp.PinJoint(body1, staticBody, zr_pt, rev_pt1));

    //create Second Pendulum
    body2 = world.addBody(new cp.Body(mass, cp.momentForCircle(mass, radInner, radOuter, zr_pt)));
    body2.setPos(st_pt2);
    body2.setAngle(0);

    var shape2 = gameState.shapeArray[1] = world.addShape(new cp.CircleShape(body2, radOuter, zr_pt));
    shape2.setElasticity(0);
    shape2.setFriction(1);
    shape2.setLayers(SHAPES);

    world.addConstraint(new cp.PinJoint(body2, staticBody, zr_pt, rev_pt2));


    shape1.fillStyle = function () { return 'rgba(0, 0, 200, 0.7)'; };
    shape1.strokeStyle = function () { return 'rgb(0,0,160)'; };
    shape1.draw = function (context) {
        drawCircle(context, this.tc, this.r);
    };

    shape2.fillStyle = function () { return 'rgba(230, 25, 25, 0.7)'; };
    shape2.strokeStyle = function () { return 'rgb(200, 0, 0)'; };
    shape2.draw = function (context) {
        drawCircle(context, this.tc, this.r);
    };

    var pinLength = 0.03;
    var Ax = -pinLength;
    var Ay = -pinLength;
    var Bx = 0;
    var By = pinLength;
    var Cx = pinLength;
    var Cy = -pinLength;

    var verts = [Ax, Ay, Bx, By, Cx, Cy];
    var pinBody1 = new cp.Space().staticBody;
    pinBody1.setPos(rev_pt1);
    pinBody1.setAngle(Math.PI);

    var pinShape1 = world.addShape(new cp.PolyShape(pinBody1, verts, zr_pt));
    pinShape1.setElasticity(0);
    pinShape1.setFriction(1);
    pinShape1.setLayers(SHAPES);
    pinShape1.fillStyle = function () { return 'rgba(106, 108, 110, 0.7)'; };
    pinShape1.strokeStyle = function () { return 'rgb(106,108,110)'; };

    var pinBody2 = new cp.Space().staticBody;
    pinBody2.setPos(rev_pt2);
    pinBody2.setAngle(Math.PI);

    var pinShape2 = world.addShape(new cp.PolyShape(pinBody2, verts, zr_pt));
    pinShape2.setElasticity(0);
    pinShape2.setFriction(1);
    pinShape2.setLayers(SHAPES);
    pinShape2.fillStyle = function () { return 'rgba(106, 108, 110, 0.7)'; };
    pinShape2.strokeStyle = function () { return 'rgb(106,108,110)'; };

    var roof = world.addShape(new cp.SegmentShape(world.staticBody, v(-0.5, 0.5 + pinLength), v(0.5, 0.5 + pinLength), pinLength / 2));
    roof.setElasticity(1);
    roof.setFriction(1);
    roof.setLayers(UNHITTABLE);


    var t1 = 0;
    var h1 = 0.25;
    var h2 = 0;

    this.updateInitialParameters();
    this.updateCurrentParameters(t1.toFixed(3) + 's', (100 * h1).toFixed(1) + 'cm', (100 * h2).toFixed(1) + 'cm');
}

CirclePendulum2.prototype.step = function (gameState, gameDygraph, dataTimeStep, graphTimeStep) {
    var shape1 = gameState.shapeArray[0]; 
    var shape2 = gameState.shapeArray[1];


    var py = 100 * shape1.body.p.y;
    var py2 = 100 * shape2.body.p.y;

    var sampleT = myRound(gameDygraph.itr * gameState.stepTime, 3);
    sampleT = sampleT.toFixed(3) + 's';
    var sampleH = myRound(py, 1);
    sampleH = sampleH.toFixed(1) + 'cm';
    var sampleH2 = myRound(py2, 1);
    sampleH2 = sampleH2.toFixed(1) + 'cm';

    this.updateCurrentParameters(sampleT, sampleH, sampleH2);
    this.addToDygraph(gameState, gameDygraph, dataTimeStep, graphTimeStep, py, py2);
}

CirclePendulum2.prototype.initializeDygraph = function (gameState, gameDygraph, graphID) {
    gameDygraph.data = [[0, 100 * gameState.shapeArray[0].body.p.y, 100 * gameState.shapeArray[1].body.p.y]];
    gameDygraph.graph = new Dygraph(
        document.getElementById(graphID),
        gameDygraph.data,
        {
            labels: ['Time', 'Height1', 'Height2'],
            xlabel: 'Time (s)',
            ylabel: 'Height (cm)',
            y2label: 'Height 2 (cm)',
            series: {
                'Height1': {
                    color: 'rgba(0,0,255,0.7)',
                    strokeWidth: 2
                },
                'Height2': {
                    color: 'rgba(255,0,0,0.7)',
                    strokeWidth: 2
                }
            },
            axes: {
                x: {
                    valueFormatter: function (x) {
                        return x + 's';
                    }
                },
                y: {
                    valueFormatter: function (y) {
                        return myRound(y, 1) + 'cm';
                    }
                }
            }
        }          // options
    );
}

CirclePendulum2.prototype.updateCurrentParameters = function (t1, h1, h2) {
    var time = document.getElementById('running-time');
    var currentHeight1 = document.getElementById('pendulum-height-1');
    var currentHeight2 = document.getElementById('pendulum-height-2');

    time.innerText = t1;
    currentHeight1.innerText = h1;
    currentHeight2.innerText = h2;
}
CirclePendulum2.prototype.addToDygraph = function (gameState, gameDygraph, dataTimeStep, graphTimeStep, x, y) {

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

}

CirclePendulum2.prototype.updateInitialParameters = function () {
    var table = document.getElementById('initial-values');
    table.innerHTML =
        '<tbody>' +
        '<tr>' +
        '<td colspan="2"><br>Initial Conditions<br><br></td>' +
        '</tr>' +
        //length
        '<tr class=\'both-pendulums-init\'>' +
        '<td>Length</td>' +
        '<td id=\"length-initial-1\">50 cm</td>' +
        '</tr>' +

        //COEF
        '<tr class=\'both-pendulums-init\'>' +
        '<td>Coefficient of Restitution</td>' +
        '<td id=\"coef-initial-1\">0</td>' +
        '</tr>' +
        //body1
        '<tr class=\'pendulum-1-init\'>' +
        '<td>Mass</td>' +
        '<td id=\"mass-initial-1\">0.5 kg</td>' +
        '</tr>' +

        '<tr class=\'pendulum-1-init\'>' +
        '<td>Angle</td>' +
        '<td id="angle-initial-1">60 deg</td>' +
        '</tr>' +

        '<tr class=\'pendulum-1-init\'>' +
        '<td>Height</td>' +
        '<td id="height-initial-1">25 cm</td>' +
        '</tr>' +

         //body2
        '<tr class=\'pendulum-2-init\'>' +
        '<td>Mass</td>' +
        '<td id=\"mass-initial-2\">0.5 kg</td>' +
        '</tr>' +

        '<tr class=\'pendulum-2-init\'>' +
        '<td>Angle</td>' +
        '<td id="angle-initial-2">0 deg</td>' +
        '</tr>' +

        '<tr class=\'pendulum-2-init\'>' +
        '<td>Height</td>' +
        '<td id="height-initial-2">0 cm</td>' +
        '</tr>' +


        '</tbody>'
}
