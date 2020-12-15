var RollingCylinder1 = function () {
    this.maxDuration = 2;
};

RollingCylinder1.prototype.setNiceViewCenter = function (gameGraphics, canvas) {
    gameGraphics.PTM = 500;
    var center = {x: 0.67, y: 0.25}
    setViewCenterWorld(gameGraphics, canvas, center, true);
}

RollingCylinder1.prototype.setup = function (gameState, gameGraphics) {

    var UNHITTABLE = 1 << 16;
    var SHAPES = 1 << 1;

    var world = gameState.world;
    world.gravity = cp.v(0, -9.8);
    world.collisionSlop = 0.0001;
    world.minSurfaceVelocity = 10**-3
    world.collisionBias = Math.pow(1 - 0.99, 60);

    var body1;
    var staticBody = new cp.Space().staticBody;

    var axisX = world.addShape(new cp.SegmentShape(world.staticBody, v(-100, 0), v(100, 0), 0.005));
    axisX.setElasticity(1);
    axisX.setFriction(1);
    axisX.setLayers(SHAPES);

    var axisX2 = world.addShape(new cp.SegmentShape(world.staticBody, v(0.8, 0.2), v(100, 0.2), 0.005));
    axisX2.setElasticity(1);
    axisX2.setFriction(1);
    axisX2.setLayers(SHAPES);

    var pixelFactor = 40;
    
    var axisY = world.addShape(new cp.SegmentShape(world.staticBody, v(0, 0), v(0, 0.5), 0.005));
    axisY.setElasticity(1);
    axisY.setFriction(1);
    axisY.setLayers(UNHITTABLE);

    var ramp1 = world.addShape(new cp.SegmentShape(world.staticBody, v(0, 0.1), v(0.8, 0), 0.005));
    ramp1.setElasticity(1);
    ramp1.setFriction(1);
    ramp1.setLayers(SHAPES);

    var ramp2 = world.addShape(new cp.SegmentShape(world.staticBody, v(0, 0.3), v(0.8, 0.2), 0.005));
    ramp2.setElasticity(1);
    ramp2.setFriction(1);
    ramp2.setLayers(SHAPES);


    for (var gridBar = -200; gridBar <= 200; gridBar++) {
        // Runs 5 times, with values of step 0 through 10.
        var gridV = world.addShape(new cp.SegmentShape(world.staticBody, v(-gridBar / 10, -0.1), v(-gridBar / 10, 0.5), 0));
        gridV.setLayers(UNHITTABLE);
        
        gridV.draw = function(context) {
            context.scale(1 / pixelFactor, -1 / pixelFactor);
            context.fillStyle = "blue";
            context.font = "bold 1px Arial";

            var text = (100*this.ta.x).toFixed(0)+" cm";

            context.save();

            context.translate(pixelFactor * this.ta.x, pixelFactor*this.ta.y);
            context.rotate(-Math.PI/2);
            context.fillText(text, -pixelFactor*0.19, -pixelFactor * (this.ta.y+0.1));
            context.restore();

            context.scale(pixelFactor, -pixelFactor);

            context.strokeStyle = 'rgb(106,108,110)';
            var oldLineWidth = context.lineWidth;
            context.lineWidth = 0.001;
            drawLine(context, this.ta, this.tb);
            context.lineWidth = oldLineWidth;
        }

        if (gridBar >=5 && gridBar <= 10) {
            var gridH = world.addShape(new cp.SegmentShape(world.staticBody, v(-100, -gridBar / 10 + 1), v(100, -gridBar / 10 + 1), 0));
            gridH.setLayers(UNHITTABLE);

            gridH.draw = function (context) {
                context.scale(1 / pixelFactor, -1 / pixelFactor);
                context.fillStyle = "blue";
                context.font = "bold 1px Arial";

                var text = (100 * this.ta.y).toFixed(0) + " cm";

                context.fillText(text, pixelFactor * (this.ta.x+this.tb.x+0.02)/2, -pixelFactor * (this.ta.y + this.tb.y+0.01) / 2);
                context.scale(pixelFactor, -pixelFactor);

                context.strokeStyle = 'rgb(106,108,110)';
                var oldLineWidth = context.lineWidth;
                context.lineWidth = 0.001;
                drawLine(context, this.ta, this.tb);
                context.lineWidth = oldLineWidth;
            }
        }

    }

    //set all mathematical quantities
    var mass1 = 1;
    var mass2 = 1;
    var radOuter = 0.05;
    var radInner = 0.8 * radOuter;
    var h = radOuter + 0.075 + 0.005;

    this.radius = radOuter;

    //important position vectors
    var zr_pt = cp.v(0, 0)    //origin vector, for calculations
    var st_pt1 = cp.v(0.2, h);
    var st_pt2 = cp.v(0.2, h+0.2);

    //define a box with the following dimensions:

    var body1 = world.addBody(new cp.Body(mass1, cp.momentForCircle(mass1, radInner, radOuter, zr_pt)));
    body1.setPos(st_pt1);
    body1.setAngle(0);

    var shape1 = gameState.shapeArray[0] = world.addShape(new cp.CircleShape(body1, radOuter, zr_pt));
    shape1.setElasticity(0);
    shape1.setFriction(0.5, 0.25);
    shape1.setLayers(SHAPES);

    var body2 = world.addBody(new cp.Body(mass2, cp.momentForCircle(mass2, 0, radOuter, zr_pt)));
    body2.setPos(st_pt2);
    body2.setAngle(0);

    var shape2 = gameState.shapeArray[1] = world.addShape(new cp.CircleShape(body2, radOuter, zr_pt));
    shape2.setElasticity(0);
    shape2.setFriction(0.5, 0.25);
    shape2.setLayers(SHAPES);

    shape1.fillStyle = function () { return 'rgba(211, 211, 211, 1)'; };
    shape1.strokeStyle = function () { return 'rgb(0,0,0)'; };
    shape1.draw = function (context) {
        var rOut = this.r;
        var rIn = rOut * 0.8;
        drawCircle(context, this.tc, rOut);
        
        drawLine(context, cp.v.rotate(cp.v(1, 0), cp.v.mult(this.body.rot, rIn)).add(this.tc) , cp.v.rotate(cp.v(1, 0), cp.v.mult(this.body.rot, rOut)).add(this.tc));
        drawLine(context, cp.v.rotate(cp.v(0, 1), cp.v.mult(this.body.rot, rIn)).add(this.tc), cp.v.rotate(cp.v(0, 1), cp.v.mult(this.body.rot, rOut)).add(this.tc));
        drawLine(context, cp.v.rotate(cp.v(-1, 0), cp.v.mult(this.body.rot, rIn)).add(this.tc), cp.v.rotate(cp.v(-1, 0), cp.v.mult(this.body.rot, rOut)).add(this.tc));
        drawLine(context, cp.v.rotate(cp.v(0, -1), cp.v.mult(this.body.rot, rIn)).add(this.tc), cp.v.rotate(cp.v(0, -1), cp.v.mult(this.body.rot, rOut)).add(this.tc));

        context.fillStyle = 'rgb(255,255,255)'
        drawCircle(context, this.tc, rIn);
    };
    shape1.drawVelocity = function (context, PTM, gameGraphics) {
        var velocity = cp.v(this.body.vx, this.body.vy);
        var start = cp.v(this.body.p.x, this.body.p.y);

        if (cp.v.len(velocity) == 0)
            return
        context.save();
        context.setLineDash([3 / PTM, 3 / PTM])
        velocity.mult(gameGraphics.velocityScale);
        velocity.draw(context, PTM, start, "orange");
        context.restore();
    };
    shape1.drawAngVel = function (context, PTM, gameGraphics) {
        var body = this.body;
        var angVel = body.w;

        context.save();
        context.lineWidth = 4 / PTM;
        var color = "cyan"
        context.strokeStyle = color;
        context.setLineDash([3 / PTM, 3 / PTM]);
        context.fillStyle = color;

        var radius = Math.abs(angVel) * gameGraphics.angVelScale;
        var start;
        var end;
        var normVec;

        if (angVel > 0) {
            start = 3 * Math.PI / 4
            end = 5 * Math.PI / 4
            drawCircleArc(context, this.body.p, radius, start, end, false)
            normVec = cp.v(Math.cos(end + Math.PI / 2), Math.sin(end + Math.PI / 2)).mult(radius);
        }
        else if (angVel < 0) {
            start = + Math.PI / 4
            end = - Math.PI / 4
            drawCircleArc(context, this.body.p, radius, start, end, true)
            normVec = cp.v(Math.cos(end - Math.PI / 2), Math.sin(end - Math.PI / 2)).mult(radius);
        }
        else {
            context.restore();
            return
        }

        var startVec = cp.v(Math.cos(start), Math.sin(start)).mult(radius).add(this.body.p);
        var endVec = cp.v(Math.cos(end), Math.sin(end)).mult(radius).add(this.body.p)

        var leftTip = cp.v(0, 0.1);
        var rightTip = cp.v(0, -0.1);
        var frontTip = cp.v(0.3, 0)

        var prong1 = cp.v.rotate(normVec, leftTip);
        var prong2 = cp.v.rotate(normVec, rightTip);
        var prongTip = cp.v.rotate(normVec, frontTip);

        var end1 = cp.v.add(endVec, prong1);
        var end2 = cp.v.add(endVec, prong2);
        var endTip = cp.v.add(endVec, prongTip);

        drawCircle(context, startVec, context.lineWidth);

        context.beginPath();
        context.moveTo(endTip.x, endTip.y);
        context.lineTo(end1.x, end1.y);
        context.lineTo(end2.x, end2.y);
        context.lineTo(endTip.x, endTip.y);
        context.fill();
        context.stroke();

        context.restore();
    };


    shape2.fillStyle = function () { return 'rgba(211, 211, 211, 1)'; };
    shape2.strokeStyle = function () { return 'rgb(0,0,0)'; };
    shape2.draw = function (context) {
        var rOut = this.r;
        var rIn = 0;
        drawCircle(context, this.tc, rOut);

        drawLine(context, cp.v.rotate(cp.v(1, 0), cp.v.mult(this.body.rot, rIn)).add(this.tc), cp.v.rotate(cp.v(1, 0), cp.v.mult(this.body.rot, rOut)).add(this.tc));
        drawLine(context, cp.v.rotate(cp.v(0, 1), cp.v.mult(this.body.rot, rIn)).add(this.tc), cp.v.rotate(cp.v(0, 1), cp.v.mult(this.body.rot, rOut)).add(this.tc));
        drawLine(context, cp.v.rotate(cp.v(-1, 0), cp.v.mult(this.body.rot, rIn)).add(this.tc), cp.v.rotate(cp.v(-1, 0), cp.v.mult(this.body.rot, rOut)).add(this.tc));
        drawLine(context, cp.v.rotate(cp.v(0, -1), cp.v.mult(this.body.rot, rIn)).add(this.tc), cp.v.rotate(cp.v(0, -1), cp.v.mult(this.body.rot, rOut)).add(this.tc));

        context.fillStyle = 'rgb(255,255,255)'
        drawCircle(context, this.tc, rIn);
    };
   
    

    var t1 = 0;
    var v1 = 0;
    var w1 = 0;
    var v2 = 0;
    var w2 = 0;

    this.updateInitialParameters();
    this.updateCurrentParameters(t1.toFixed(3) + 's', v1.toFixed(2) + 'm/s', w1.toFixed(1) + 'rad/s', v2.toFixed(2) + 'm/s', w2.toFixed(1) + 'rad/s');
}

RollingCylinder1.prototype.step = function (gameState, gameDygraph, dataTimeStep, graphTimeStep) {

    var r = cp.v(this.radius / 2, 0);
    var shape1 = gameState.shapeArray[0];
    var shape2 = gameState.shapeArray[1];
    var world = gameState.world;
    var timeStep = gameState.stepTime;

    var v1 = Math.sqrt(shape1.body.vx ** 2 + shape1.body.vy ** 2);
    var w1 = shape1.body.w;
    var v2 = Math.sqrt(shape2.body.vx ** 2 + shape2.body.vy ** 2);
    var w2 = shape2.body.w;


    var sampleT = myRound(gameDygraph.itr * gameState.stepTime, 3);
        sampleT = sampleT.toFixed(3) + 's';
    var sampleV1 = myRound(v1, 2);
        sampleV1 = sampleV1.toFixed(2) + 'm/s';
    var sampleW1 = myRound(w1, 1);
        sampleW1 = sampleW1.toFixed(1) + 'rad/s';
    var sampleV2 = myRound(v2, 2);
        sampleV2 = sampleV2.toFixed(2) + 'm/s';
    var sampleW2 = myRound(w2, 1);
        sampleW2 = sampleW2.toFixed(1) + 'rad/s';

    this.addToDygraph(gameState, gameDygraph, dataTimeStep, graphTimeStep, v1, w1, v2, w2);
    this.updateCurrentParameters(sampleT, sampleV1, sampleW1, sampleV2, sampleW2);
}

RollingCylinder1.prototype.initializeDygraph = function (gameState, gameDygraph, graphID) {
    gameDygraph.data = [[0, 0, 0, 0, 0]];
    gameDygraph.graph = new Dygraph(
        document.getElementById(graphID),
        gameDygraph.data,
        {
            labels: ['Time', 'Vtop', 'Wtop', 'Vbot', 'Wbot'],
            xlabel: 'Time (s)',
            ylabel: 'Speed (m/s)',
            y2label: 'Angular Velocity (Rad/s)',
            series: {
                'Vtop': {
                    color: 'rgb(239, 114, 21)',
                    strokeWidth: 2
                },
                'Wtop': {
                    color: 'blue',
                    strokeWidth: 2,
                    axis: 'y2'
                },
                'Vbot': {
                    color: 'rgb(239, 114, 21)',
                    strokeWidth: 2,
                    strokePattern: Dygraph.DASHED_LINE
                },
                'Wbot': {
                    color: 'blue',
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
                        return myRound(y, 2) + 'm/s';
                    }
                },
                y2: {
                    valueFormatter: function (y) {
                        return myRound(y, 1) + 'rad/s';
                    },
                    axisLabelFormatter: function (y) {
                        return myRound(y, 1);
                    }
                }
            }
        }          // options
    );
}

RollingCylinder1.prototype.updateCurrentParameters = function (t1, w, x, y, z) {
    var time = document.getElementById('running-time');
    var v1 = document.getElementById('v1');
    var w1 = document.getElementById('w1');
    var v2 = document.getElementById('v2');
    var w2 = document.getElementById('w2');

    time.innerText = t1;
    v1.innerText = w;
    w1.innerText = x;
    v2.innerText = y;
    w2.innerText = z;
}

RollingCylinder1.prototype.addToDygraph = function (gameState, gameDygraph, dataTimeStep, graphTimeStep, w, x, y, z) {

    var time = myRound(gameDygraph.itr * gameState.stepTime, 3);
    var data = gameDygraph.data;
    var graph = gameDygraph.graph;

    var dataMod = myRound(dataTimeStep / (gameState.stepTime), 0); //total iterations until we add data to dygraph
    var graphMod = myRound(graphTimeStep / (gameState.stepTime), 0);

    if (gameDygraph.itr % dataMod == 0) {
        data.push([time, y, z, w, x,]);
        linearAdjust();
    }

    if (gameDygraph.itr % graphMod == 0) {
        graph.updateOptions({ 'file': data });
    }
}

RollingCylinder1.prototype.updateInitialParameters = function () {
    var table = document.getElementById('initial-values');
    table.innerHTML =
        '<tbody>' +
        '<tr>' +
        '<td colspan="2"><br>Initial Conditions<br><br></td>' +
        '</tr>' +
        //body1

        '<tr class=\'both-pendulums-init\'>' +
        '<td>Mass<sub>Top</sub></td>' +
        '<td id=\"mass-initial-1\">1 kg</td>' +
        '</tr>' +

        '<tr class=\'both-pendulums-init\'>' +
        '<td>Mass<sub>Bottom</sub></td>' +
        '<td id=\"mass-initial-1\">1 kg</td>' +
        '</tr>' +

        '<tr class=\'both-pendulums-init\'>' +
        '<td>Time Interval</td>' +
        '<td id="time-interval-1">2 s</td>' +
        '</tr>' +

        '</tbody>'
}
