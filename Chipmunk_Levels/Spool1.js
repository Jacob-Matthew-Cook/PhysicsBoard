var Spool1 = function () {
    this.maxDuration = 2.5;
};

Spool1.prototype.setNiceViewCenter = function (gameGraphics, canvas) {
    gameGraphics.PTM = 1000;
    setViewCenterWorld(gameGraphics, canvas, this.position, true);
}

Spool1.prototype.setup = function (gameState, gameGraphics) {

    var UNHITTABLE = 1 << 16;
    var SHAPES = 1 << 1;

    var world = gameState.world;
    world.gravity = cp.v(0, -9.8);
    world.collisionSlop = 0.0001;
    world.minSurfaceVelocity = 10**-3
    world.collisionBias = Math.pow(1 - 0.99, 60);

    var body1;
    var staticBody = new cp.Space().staticBody;

    var axisX = world.addShape(new cp.SegmentShape(world.staticBody, v(-100, -0.1), v(100, -0.1), 0.005));
    axisX.setElasticity(1);
    axisX.setFriction(1);
    axisX.setLayers(SHAPES);

    var pixelFactor = 40;
    
    var axisY = world.addShape(new cp.SegmentShape(world.staticBody, v(0, -0.1), v(0, 0.5), 0.005));
    axisY.setElasticity(1);
    axisY.setFriction(1);
    axisY.setLayers(UNHITTABLE);


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
            context.fillText(text, -pixelFactor*0.18, -pixelFactor * (this.ta.y));
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

                context.fillText(text, pixelFactor * (this.ta.x+this.tb.x+0.02)/2, -pixelFactor * (this.ta.y + this.tb.y) / 2);
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
    var mass = 0.001;
    var radInner = 0;
    var radOuter = 0.4/(2*Math.PI);
    var radMiddle = radOuter/2;
    var h = radOuter - 0.1 + 0.005;

    this.radius = radOuter;

    //important position vectors
    var zr_pt = cp.v(0, 0)    //origin vector, for calculations
    var st_pt1 = cp.v(0.2, h);
    var st_pt2 = cp.v(0.2, h);

    var body1 = world.addBody(new cp.Body(mass, cp.momentForCircle(mass, radInner, radOuter, zr_pt)));
    body1.setPos(st_pt1);
    body1.setAngle(0);

    var shape1 = gameState.shapeArray[0] = world.addShape(new cp.CircleShape(body1, radOuter, zr_pt));
    shape1.setElasticity(0);
    shape1.setFriction(0.5, 0.25);
    shape1.setLayers(SHAPES);

    shape1.fillStyle = function () { return 'rgba(193, 154, 107, 1)'; };
    shape1.strokeStyle = function () { return 'rgb(0,0,0)'; };
    shape1.draw = function (context) {
        drawCircle(context, this.tc, this.r);
        
        drawLine(context, cp.v.rotate(cp.v(1, 0), cp.v.mult(this.body.rot, this.r/2)).add(this.tc) , cp.v.rotate(cp.v(1, 0), cp.v.mult(this.body.rot, this.r)).add(this.tc));
        drawLine(context, cp.v.rotate(cp.v(0, 1), cp.v.mult(this.body.rot, this.r / 2)).add(this.tc), cp.v.rotate(cp.v(0, 1), cp.v.mult(this.body.rot, this.r)).add(this.tc));
        drawLine(context, cp.v.rotate(cp.v(-1, 0), cp.v.mult(this.body.rot, this.r / 2)).add(this.tc), cp.v.rotate(cp.v(-1, 0), cp.v.mult(this.body.rot, this.r)).add(this.tc));
        drawLine(context, cp.v.rotate(cp.v(0, -1), cp.v.mult(this.body.rot, this.r / 2)).add(this.tc), cp.v.rotate(cp.v(0, -1), cp.v.mult(this.body.rot, this.r)).add(this.tc));

        context.save();
        context.lineWidth = 0.005;
        context.strokeStyle = 'rgb(0, 0, 0)';
        drawLine(context, cp.v(this.r / 2, 0).add(this.tc), cp.v(this.r / 2, 0).add(this.tc).add(cp.v(0, -this.body.p.x/2+0.2)));
        context.lineWidth = 0.003;
        context.strokeStyle = 'rgba(213, 174, 127, 1)';
        drawLine(context, cp.v(this.r / 2, 0).add(this.tc), cp.v(this.r / 2, 0).add(this.tc).add(cp.v(0, -this.body.p.x / 2+0.2)));
        context.restore();
        drawCircle(context, this.tc, this.r / 2);
    };


    var force = cp.v(0, 0);
    var r = cp.v(this.radius, 0);
    this.position = cp.v(shape1.body.p.x, shape1.body.p.y).add(cp.v(0, 0.05));
    setViewCenterWorld(gameState.graphics, gameState.graphics.canvas, this.position, false);

    var t1 = 0;
    var f1 = 0;
    var f2 = mass*cp.v.len(world.gravity);
    var f3 = 0;

    this.updateInitialParameters();
    this.updateCurrentParameters(t1.toFixed(3) + 's', (1000 * f1).toFixed(1) + 'mN', (1000 * f2).toFixed(1) + 'mN', (1000 * f3).toFixed(1) + 'mN');
}

Spool1.prototype.step = function (gameState, gameDygraph, dataTimeStep, graphTimeStep) {
    var force = cp.v(0, 2*gameState.stepTime / (500));
    var r = cp.v(this.radius/2, 0);
    var shape1 = gameState.shapeArray[0];
    var world = gameState.world;
    var timeStep = gameState.stepTime;

    var upForce = cp.v.len(gameState.shapeArray[0].body.f);
    var normForce = 0;
    var fricForce = 0;
    
        world.eachBody(function (body) {
            body.eachArbiter(function (arbiter) {
                var arb = arbiter;
                var contacts = arb.contacts;
                if (arb.a.type != "segment") {
                    contacts.forEach(callbackA);
                };
                if (arb.b.type != "segment") {
                    contacts.forEach(callbackB);
                };
                function callbackA(cont) {
                    var nMag = cont.jnAcc / (timeStep);
                    normForce = Math.abs(nMag);

                    var tMag = cont.jtAcc / (timeStep);
                    fricForce = Math.abs(tMag);
                };
                function callbackB(cont) {
                    var nMag = cont.jnAcc / (timeStep);
                    normForce = Math.abs(nMag);

                    var tMag = cont.jtAcc / (timeStep);
                    fricForce = Math.abs(tMag);
                };
            })
        });


        var sampleT = myRound(gameDygraph.itr * gameState.stepTime, 3);
        sampleT = sampleT.toFixed(3) + 's';
        var sampleU = myRound(1000 * upForce, 1);
        sampleU = sampleU.toFixed(1) + 'mN';
        var sampleN = myRound(1000 * normForce, 1);
        sampleN = sampleN.toFixed(1) + 'mN';
        var sampleF = myRound(1000 * fricForce, 1);
        sampleF = sampleF.toFixed(1) + 'mN';

        this.addToDygraph(gameState, gameDygraph, dataTimeStep, graphTimeStep, 1000 * upForce, 1000 * normForce, 1000 * fricForce);
        this.updateCurrentParameters(sampleT, sampleU, sampleN, sampleF);


    this.position = cp.v(shape1.body.p.x,shape1.body.p.y).add(cp.v(0,0.05));
    setViewCenterWorld(gameState.graphics, gameState.graphics.canvas, this.position, false);

    shape1.body.applyForce(force, r);
}

Spool1.prototype.initializeDygraph = function (gameState, gameDygraph, graphID) {
    gameDygraph.data = [[0, 0, 1000*cp.v.len(gameState.world.gravity) * gameState.shapeArray[0].body.m, 0]];
    gameDygraph.graph = new Dygraph(
        document.getElementById(graphID),
        gameDygraph.data,
        {
            labels: ['Time', 'Str. F', 'Norm. F', 'Fric. F'],
            xlabel: 'Time (s)',
            ylabel: 'Force (mN)',
            series: {
                'Str. F': {
                    color: 'rgba(0, 0, 255, 0.7)',
                    strokeWidth: 2
                },
                'Norm. F': {
                    color: 'rgba(0, 0, 0, 0.7)',
                    strokeWidth: 2
                },
                'Fric. F': {
                    color: 'rgba(255, 0 , 0, 0.7)',
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
                        return myRound(y, 1) + 'mN';
                    }
                }
            }
        }          // options
    );

}

Spool1.prototype.updateCurrentParameters = function (t1, f1, f2, f3) {
    var time = document.getElementById('running-time');
    var forceUp = document.getElementById('spool-up');
    var forceNormal = document.getElementById('spool-norm');
    var forceFriction = document.getElementById('spool-fric');

    time.innerText = t1;
    forceUp.innerText = f1;
    forceNormal.innerText = f2;
    forceFriction.innerText = f3;
}
Spool1.prototype.addToDygraph = function (gameState, gameDygraph, dataTimeStep, graphTimeStep, x, y, z) {

    var time = myRound(gameDygraph.itr * gameState.stepTime, 3);
    var data = gameDygraph.data;
    var graph = gameDygraph.graph;

    var dataMod = myRound(dataTimeStep / (gameState.stepTime), 0); //total iterations until we add data to dygraph
    var graphMod = myRound(graphTimeStep / (gameState.stepTime), 0);

    if (gameDygraph.itr % dataMod == 0) {
        data.push([time, x, y, z]);
        linearAdjust();
    }

    if (gameDygraph.itr % graphMod == 0) {
        graph.updateOptions({ 'file': data });
    }
}

Spool1.prototype.updateInitialParameters = function () {
    var table = document.getElementById('initial-values');
    table.innerHTML =
        '<tbody>' +
        '<tr>' +
        '<td colspan="2"><br>Initial Conditions<br><br></td>' +
        '</tr>' +
        //length
        '<tr class=\'both-pendulums-init\'>' +
        '<td>String Force Direction</td>' +
        '<td id=\"length-initial-1\">Upwards</td>' +
        '</tr>' +
        //body1
        '<tr class=\'both-pendulums-init\'>' +
        '<td>Mass</td>' +
        '<td id=\"mass-initial-1\">1 g</td>' +
        '</tr>' +

        '<tr class=\'both-pendulums-init\'>' +
        '<td>Coeff. of Static Friction</td>' +
        '<td id="u-static-1">0.5</td>' +
        '</tr>' +

        '<tr class=\'both-pendulums-init\'>' +
        '<td>Coeff. of Kinetic Friction</td>' +
        '<td id="u-kinetic-1">0.25</td>' +
        '</tr>' +

        '<tr class=\'both-pendulums-init\'>' +
        '<td>Initial Pulling Force</td>' +
        '<td id="force-initial-1">0 mN</td>' +
        '</tr>' +

        '<tr class=\'both-pendulums-init\'>' +
        '<td>Final Pulling Force</td>' +
        '<td id="force-final-1">10 mN</td>' +
        '</tr>' +

        '<tr class=\'both-pendulums-init\'>' +
        '<td>Time Interval</td>' +
        '<td id="time-interval-1">2.5 s</td>' +
        '</tr>' +

        '</tbody>'
}
