var Pulley5 = function () {
  this.maxDuration = 0.59;
};

Pulley5.prototype.setNiceViewCenter = function (gameGraphics, canvas) {
    var point = { x: 1, y: 1.2 };
    gameGraphics.PTM = 200;
    setViewCenterWorld(gameGraphics, canvas, point, true);
}

Pulley5.prototype.setup = function (gameState, gameGraphics) {

    var UNHITTABLE = 1 << 16;
    var SHAPES = 1 << 1;

    var world = gameState.world;
    world.iterations = 10;
    world.gravity = cp.v(0, -10);
    world.collisionSlop = 0;
    world.collisionBias = Math.pow(1 - 0.5, 60);

    var body1;
    var staticBody = new cp.Space().staticBody;
 

    var axisX = world.addShape(new cp.SegmentShape(world.staticBody, v(0, 0), v(2, 0), 0.005));
    axisX.setElasticity(1);
    axisX.setFriction(1);
    axisX.setLayers(UNHITTABLE);

    var pixelFactor = 20;

    var axisY = world.addShape(new cp.SegmentShape(world.staticBody, v(0, 0), v(0, 2), 0.005));
    axisY.setElasticity(1);
    axisY.setFriction(1);
    axisY.setLayers(UNHITTABLE);


    for (var gridBar = 0; gridBar <= 20; gridBar++) {
        // Runs 5 times, with values of step 0 through 10.
        var gridV = world.addShape(new cp.SegmentShape(world.staticBody, v(gridBar / 10, 0), v(gridBar / 10, 2), 0));
        gridV.setLayers(UNHITTABLE);

        gridV.draw = function(context) {
            context.scale(1 / pixelFactor, -1 / pixelFactor);
            context.fillStyle = "blue";
            context.font = "bold 1px Arial";

            var text = (100*this.ta.x).toFixed(0)+" cm";

            //context.fillText(text, pixelFactor*this.ta.x, -pixelFactor*this.ta.y);
            context.scale(pixelFactor, -pixelFactor);

            context.strokeStyle = 'rgb(106,108,110)';
            var oldLineWidth = context.lineWidth;
            context.lineWidth = 0.002;
            drawLine(context, this.ta, this.tb);
            context.lineWidth = oldLineWidth;
        }

        var gridH = world.addShape(new cp.SegmentShape(world.staticBody, v(0, gridBar / 10), v(2, gridBar / 10), 0));
        gridH.setLayers(UNHITTABLE);

        gridH.draw = function (context) {
            context.scale(1 / pixelFactor, -1 / pixelFactor);
            context.fillStyle = "blue";
            context.font = "bold 1px Arial";

            var text = (100 * this.ta.y).toFixed(0) + " cm";

            context.fillText(text, pixelFactor * (this.ta.x+ -0.18), -pixelFactor * (this.ta.y + this.tb.y) / 2);
            context.scale(pixelFactor, -pixelFactor);

            context.strokeStyle = 'rgb(106,108,110)';
            var oldLineWidth = context.lineWidth;
            context.lineWidth = 0.002;
            drawLine(context, this.ta, this.tb);
            context.lineWidth = oldLineWidth;
        }
    }

    var mass1 = 0.00001;
    var mass2 = 0.200;
    var mass3 = 0.300;
    var mass4 = 0.200;
    var radInner = 0;
    var radOuter = 0.10;

    //set all mathematical quantities
    var l = 1.0 + 2 * radOuter;  // 0.510;
    var h = 2.0 + 2 * radOuter; // 0.510;

    var horizOffset = 1;
    var angle_deg1 = 270;

    var pi = Math.PI;
    var theta1 = 2 * pi * (angle_deg1 / 360)

    //inferred mathematical quantities
    var l_cos1 = l * Math.cos(theta1);
    var l_sin1 = l * Math.sin(theta1);

    //important position vectors
    var zr_pt = cp.v(0, 0)    //origin vector, for calculations
    var st_pt1 = cp.v(l_cos1 + horizOffset - 6*radOuter, h + l_sin1);
    var st_pt2 = cp.v(l_cos1 + horizOffset - 2*radOuter, h + l_sin1);
    var st_pt3 = cp.v(l_cos1 + horizOffset + 2 * radOuter, h + l_sin1);
    var st_pt4 = cp.v(l_cos1 + horizOffset + 6 * radOuter, h + l_sin1);

    var rev_pt1 = cp.v(horizOffset - 6 * radOuter, h); //revolution point of hanging weights
    var rev_pt2 = cp.v(horizOffset - 2 * radOuter, h);
    var rev_pt3 = cp.v(horizOffset + 2 * radOuter, h);
    var rev_pt4 = cp.v(horizOffset + 6 * radOuter, h);

    var hook = cp.v(0, radOuter);

    var Ax = -radOuter;
    var Ay = -radOuter;
    var Bx = -radOuter;
    var By = radOuter;
    var Cx = radOuter;
    var Cy = radOuter;
    var Dx = radOuter;
    var Dy = -radOuter;

    var verts = [Ax, Ay, Bx, By, Cx, Cy, Dx, Dy];

    var pinBody1 = new cp.Space().staticBody;
    pinBody1.setPos(cp.v(horizOffset - 4 * radOuter, h));

    var pinShape1 = world.addShape(new cp.CircleShape(pinBody1, 2*radOuter, zr_pt));
    pinShape1.setElasticity(0);
    pinShape1.setFriction(1);
    pinShape1.setLayers(SHAPES);
    pinShape1.fillStyle = function () { return 'rgba(106, 108, 110, 0.7)'; };
    pinShape1.strokeStyle = function () { return 'rgb(106,108,110)'; };
    pinShape1.draw = function (context) {
        drawCircle(context, this.tc, this.r);
    };

    var pinBody2 = new cp.Space().staticBody;
    pinBody2.setPos(cp.v(horizOffset + 4 * radOuter, h));

    var pinShape2 = world.addShape(new cp.CircleShape(pinBody2, 2 * radOuter, zr_pt));
    pinShape2.setElasticity(0);
    pinShape2.setFriction(1);
    pinShape2.setLayers(SHAPES);
    pinShape2.fillStyle = function () { return 'rgba(106, 108, 110, 0.7)'; };
    pinShape2.strokeStyle = function () { return 'rgb(106,108,110)'; };
    pinShape2.draw = function (context) {
        drawCircle(context, this.tc, this.r);
    };

    var body1 = world.addBody(new cp.Body(mass1, cp.momentForCircle(mass1, 0, 0.001, zr_pt)));
    body1.setPos(st_pt1);
    body1.setAngle(0);
    body1.w_limit = 1.5;

    var shape1 = gameState.shapeArray[0] = world.addShape(new cp.CircleShape(body1, 0.001, zr_pt));
    shape1.setElasticity(0);
    shape1.setFriction(1);
    shape1.setLayers(SHAPES);

    var body2 = world.addBody(new cp.Body(mass2, cp.momentForPoly(mass2, verts, zr_pt)));
    body2.setPos(st_pt2);
    body2.setAngle(0);
    body2.w_limit = 1.5;

    var shape2 = gameState.shapeArray[1] = world.addShape(new cp.PolyShape(body2, verts, zr_pt));
    shape2.setElasticity(0);
    shape2.setFriction(1);
    shape2.setLayers(SHAPES);

    world.addConstraint(new cp.PulleyJoint2(body1, staticBody, body2, zr_pt, rev_pt1, rev_pt2, hook));

    shape1.fillStyle = function () { return 'rgba(80, 80, 200, 1)'; };
    shape1.strokeStyle = function () { return 'rgb(0,0,160)'; };
    shape1.draw = function (context) {
        var pixelFactor = 10
        context.fillStyle = "black";
        context.font = "bold 1px Arial";

        var text = (1000 * this.body.m).toFixed(0) + "g";

        context.scale(1 / (pixelFactor), -1 / (pixelFactor));
        context.fillText("3 N", pixelFactor * (this.body.p.x - 0.07), -pixelFactor * (this.body.p.y - 0.2));
        context.scale(pixelFactor, -pixelFactor);
    };
    
    shape2.fillStyle = function () { return 'rgba(80, 80, 200, 1)'; };
    shape2.strokeStyle = function () { return 'rgb(0,0,160)'; };
    shape2.draw = function (context) {
        context.beginPath();

        var verts = this.tVerts;
        var len = verts.length;
        var lastPoint = new cp.Vect(verts[len - 2], verts[len - 1]);
        context.moveTo(lastPoint.x, lastPoint.y);

        for (var i = 0; i < len; i += 2) {
            var p = new cp.Vect(verts[i], verts[i + 1]);
            context.lineTo(p.x, p.y);
        }
        context.fill();
        context.stroke();

        var pixelFactor = 10
        context.scale(1 / pixelFactor, -1 / pixelFactor);
        context.fillStyle = "black";
        context.font = "bold 1px Arial";

        var text = (1000 * this.body.m).toFixed(0) + "g";

        context.fillText(text, pixelFactor * (this.body.p.x - 0.1), -pixelFactor * (this.body.p.y - 0.2));
        context.scale(pixelFactor, -pixelFactor);

        context.scale(1 / (pixelFactor/2), -1 / (pixelFactor/2));
        context.fillText("A", pixelFactor/2 * (this.body.p.x-0.07), -pixelFactor/2 * (this.body.p.y-0.07));
        context.scale(pixelFactor/2, -pixelFactor/2);
    };

    var body3 = world.addBody(new cp.Body(mass3, cp.momentForPoly(mass3, verts, zr_pt)))
    body3.setPos(st_pt3);
    body3.setAngle(0);
    body3.w_limit = 1.5;

    var shape3 = gameState.shapeArray[2] = world.addShape(new cp.PolyShape(body3, verts, zr_pt));
    shape3.setElasticity(0);
    shape3.setFriction(1);
    shape3.setLayers(SHAPES);

    shape3.fillStyle = function () { return 'rgba(240, 60, 60, 1)'; };
    shape3.strokeStyle = function () { return 'rgb(200,0,0)'; };
    shape3.draw = function (context) {
        context.beginPath();

        var verts = this.tVerts;
        var len = verts.length;
        var lastPoint = new cp.Vect(verts[len - 2], verts[len - 1]);
        context.moveTo(lastPoint.x, lastPoint.y);

        for (var i = 0; i < len; i += 2) {
            var p = new cp.Vect(verts[i], verts[i + 1]);
            context.lineTo(p.x, p.y);
        }
        context.fill();
        context.stroke();

        var pixelFactor = 10
        context.scale(1 / pixelFactor, -1 / pixelFactor);
        context.fillStyle = "black";
        context.font = "bold 1px Arial";

        var text = (1000 * this.body.m).toFixed(0) + "g";

        context.fillText(text, pixelFactor * (this.body.p.x - 0.1), -pixelFactor * (this.body.p.y - 0.2));
        context.scale(pixelFactor, -pixelFactor);

        context.scale(1 / (pixelFactor / 2), -1 / (pixelFactor / 2));
        context.fillText("", pixelFactor / 2 * (this.body.p.x - 0.07), -pixelFactor / 2 * (this.body.p.y - 0.07));
        context.scale(pixelFactor / 2, -pixelFactor / 2);
    };

    var body4 = world.addBody(new cp.Body(mass4, cp.momentForPoly(mass4, verts, zr_pt)));
    body4.setPos(st_pt4);
    body4.setAngle(0);
    body4.w_limit = 1.5;

    var shape4 = gameState.shapeArray[3] = world.addShape(new cp.PolyShape(body4, verts, zr_pt));
    shape4.setElasticity(0);
    shape4.setFriction(1);
    shape4.setLayers(SHAPES); 

    shape4.fillStyle = function () { return 'rgba(240, 60, 60, 1)'; };
    shape4.strokeStyle = function () { return 'rgb(200,0,0)'; };
    shape4.draw = function (context) {
        context.beginPath();

        var verts = this.tVerts;
        var len = verts.length;
        var lastPoint = new cp.Vect(verts[len - 2], verts[len - 1]);
        context.moveTo(lastPoint.x, lastPoint.y);

        for (var i = 0; i < len; i += 2) {
            var p = new cp.Vect(verts[i], verts[i + 1]);
            context.lineTo(p.x, p.y);
        }
        context.fill();
        context.stroke();

        var pixelFactor = 10
        context.scale(1 / pixelFactor, -1 / pixelFactor);
        context.fillStyle = "black";
        context.font = "bold 1px Arial";

        var text = (1000 * this.body.m).toFixed(0) + "g";

        context.fillText(text, pixelFactor * (this.body.p.x - 0.1), -pixelFactor * (this.body.p.y - 0.2));
        context.scale(pixelFactor, -pixelFactor);

        context.scale(1 / (pixelFactor / 2), -1 / (pixelFactor / 2));
        context.fillText("B", pixelFactor / 2 * (this.body.p.x - 0.07), -pixelFactor / 2 * (this.body.p.y - 0.07));
        context.scale(pixelFactor / 2, -pixelFactor / 2);
    };

    world.addConstraint(new cp.PulleyJoint2(body3, staticBody, body4, hook, rev_pt3, rev_pt4, hook));



    var roof = world.addShape(new cp.SegmentShape(world.staticBody, v(0, h - 2 * radOuter), v(2, h - 2 * radOuter), 0.005));
    roof.setElasticity(1);
    roof.setFriction(1);
    roof.setLayers(SHAPES);

    var t1 = 0;
    var v1 = 0
    var v2 = 0
    var h1 = 1;
    var h2 = 1;

    force = cp.v(0, -3);
    shape1.body.applyForce(force, zr_pt);

    this.updateInitialParameters();
    this.updateCurrentParameters(t1.toFixed(3) + 's', (100 * v1).toFixed(1) + 'cm', (100 * v2).toFixed(1) + 'cm', (100 * h1).toFixed(1) + 'cm', (100 * h2).toFixed(1) + 'cm');
}

Pulley5.prototype.step = function (gameState, gameDygraph, dataTimeStep, graphTimeStep) {

    var shape1 = gameState.shapeArray[1];
    var shape2 = gameState.shapeArray[3];

    var vx = shape1.body.vx;
    var vy = shape1.body.vy;
    var v1 = Math.sqrt(vx ** 2 + vy ** 2);
    vx = shape2.body.vx;
    vy = shape2.body.vy;
    var v2 = Math.sqrt(vx ** 2 + vy ** 2);
    var h1 = shape1.body.p.y
    var h2 = shape2.body.p.y
    var sampleT = myRound(gameDygraph.itr * gameState.stepTime, 3);
    sampleT = sampleT.toFixed(3) + 's';

    var sampleV1 = myRound(100*v1, 1);
    sampleV1 = sampleV1.toFixed(1) + 'cm/s';
    var sampleV2 = myRound(100*v2, 1);
    sampleV2 = sampleV2.toFixed(1) + 'cm/s';
    var sampleH1 = myRound(100*h1, 1);
    sampleH1 = sampleH1.toFixed(1) + 'cm';
    var sampleH2 = myRound(100*h2, 1);
    sampleH2 = sampleH2.toFixed(1) + 'cm';

    this.addToDygraph(gameState, gameDygraph, dataTimeStep, graphTimeStep, 100 * v1, 100 * h1, 100 * v2, 100 * h2);
    this.updateCurrentParameters(sampleT, sampleV1, sampleV2, sampleH1, sampleH2);
}

Pulley5.prototype.initializeDygraph = function (gameState, gameDygraph, graphID) {
    gameDygraph.data = [[0, 0, 100, 0, 100]];
    gameDygraph.graph = new Dygraph(
        document.getElementById(graphID),
        gameDygraph.data,
        {
            labels: ['Time', 'V,A', 'H,A', 'V,B', 'H,B'],
            xlabel: 'Time (s)',
            ylabel: 'Speed (cm/s)',
            y2label: 'Displacement (cm)',
            series: {
                'V,A': {
                    color: 'blue',
                    strokeWidth: 2
                },
                'H,A': {
                    color: 'blue',
                    strokeWidth: 2,
                    axis: 'y2',
                    strokePattern: Dygraph.DASHED_LINE
                },
                'V,B': {
                    color: 'red',
                    strokeWidth: 2
                },
                'H,B': {
                    color: 'red',
                    strokeWidth: 2,
                    axis: 'y2',
                    strokePattern: Dygraph.DASHED_LINE
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
                        return myRound(y, 1) + 'cm/s';
                    },
                    valueRange: [0, 300]
                },
                y2: {
                    valueFormatter: function (y) {
                        return myRound(y, 1) + 'cm';
                    },
                    valueRange: [100, 190]
                }
            }
        }          // options
    );
}

Pulley5.prototype.updateCurrentParameters = function (t1, v1, v2, h1, h2) {
    var time = document.getElementById('running-time');
    var velocityL = document.getElementById('vl');
    var velocityR = document.getElementById('vr');

    var heightL = document.getElementById('hl');
    var heightR = document.getElementById('hr');

    time.innerText = t1;
    velocityL.innerText = v1;
    velocityR.innerText = v2;
    heightL.innerText = h1;
    heightR.innerText = h2;
}

Pulley5.prototype.addToDygraph = function (gameState, gameDygraph, dataTimeStep, graphTimeStep, w, x, y, z) {

    var time = myRound(gameDygraph.itr * gameState.stepTime, 3);
    var data = gameDygraph.data;
    var graph = gameDygraph.graph;

    var dataMod = myRound(dataTimeStep / (gameState.stepTime), 0); //total iterations until we add data to dygraph
    var graphMod = myRound(graphTimeStep / (gameState.stepTime), 0);

    if (gameDygraph.itr % dataMod == 0) {
        data.push([time, w, x, y, z]);
        linearAdjust();
    }

    if (gameDygraph.itr % graphMod == 0) {
        graph.updateOptions({ 'file': data });
    }

}

Pulley5.prototype.updateInitialParameters = function () {
    var table = document.getElementById('initial-values');
    table.innerHTML =
        '<tbody>' +
        '<tr>' +
        '<td colspan="2"><br>Initial Conditions<br><br></td>' +
        '</tr>' +
        //length
        '<tr class=\'both-pendulums-init\'>' +
        '<td>Initial Height</td>' +
        '<td id=\"length-initial-1\">100 cm</td>' +
        '</tr>' +
        //body1
        '<tr class=\'pendulum-1-init\'>' +
        '<td>Force<sub>A,L</td>' +
        '<td id=\"mass-initial-1\">3 N</td>' +
        '</tr>' +

        '<tr class=\'pendulum-1-init\'>' +
        '<td>Mass<sub>A,R</td>' +
        '<td id=\"mass-initial-2\">200 g</td>' +
        '</tr>' +

        '<tr class=\'pendulum-2-init\'>' +
        '<td>Mass<sub>B,L</td>' +
        '<td id=\"mass-initial-3\">300 g</td>' +
        '</tr>' +

        '<tr class=\'pendulum-2-init\'>' +
        '<td>Mass<sub>B,R</td>' +
        '<td id=\"mass-initial-4\">200 g</td>' +
        '</tr>' +

        '</tbody>'
}
