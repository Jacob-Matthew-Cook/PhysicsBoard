//Level: Exploratory
var Exploratory = function () {
    this.maxDuration = 10;
};

Exploratory.prototype.setNiceViewCenter = function (gameGraphics, canvas) {
    var point = { x: 0.02, y: 0.22 };
    gameGraphics.PTM = 550;
    setViewCenterWorld(gameGraphics, canvas, point, true);
}

Exploratory.prototype.setup = function (gameState, gameGraphics) {
    
    var mass1 = massSlider.noUiSlider.get();
    var angle1 = angleSlider.noUiSlider.get();
    var length = lengthSlider.noUiSlider.get();

    var mass2 = mass2Slider.noUiSlider.get();
    var angle2 = angle2Slider.noUiSlider.get();
    var cor = corSlider.noUiSlider.get();
    var elast = Math.sqrt(cor);
    var numWeights = !(numWeightsRadio[0].checked == true) + 1;

    var UNHITTABLE = 1 << 15;
    var SHAPES = 1 << 1;

    var world = gameState.world;
    world.iterations = 10;
    world.gravity = cp.v(0, -9.8);
    world.collisionSlop = 0;
    world.collisionBias = Math.pow(1 - 0.5, 60);

    var body1;
    var staticBody = new cp.Space().staticBody;

    var axisX = world.addShape(new cp.SegmentShape(world.staticBody, v(-0.5, -0.1), v(0.6, -0.1), 0.005));
    axisX.setElasticity(1);
    axisX.setFriction(1);
    axisX.setLayers(UNHITTABLE);

    var pixelFactor = 40;

    var axisY = world.addShape(new cp.SegmentShape(world.staticBody, v(-0.5, -0.1), v(-0.5, 0.5), 0.005));
    axisY.setElasticity(1);
    axisY.setFriction(1);
    axisY.setLayers(UNHITTABLE);

    for (var gridBar = -1; gridBar <= 10; gridBar++) {
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
            var gridH = world.addShape(new cp.SegmentShape(world.staticBody, v(-0.5, -gridBar / 10 + 1), v(0.6, -gridBar / 10 + 1), 0));
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
    }

    //set all mathematical quantities
    var l = length;  // 0.510;
    var h = 0.5; // 0.510;
    //var hook_offset = 0.00 //0.01;

    var angle_deg1 = 270 - angle1;
    var angle_deg2 = 270 - angle2;

    var pi = Math.PI;
    var theta1 = 2 * pi * (angle_deg1 / 360);
    var theta2 = 2 * pi * (angle_deg2 / 360);

    //inferred mathematical quantities
    var l_cos1 = l * Math.cos(theta1);
    var l_sin1 = l * Math.sin(theta1);
    var l_cos2 = l * Math.cos(theta2);
    var l_sin2 = l * Math.sin(theta2);

    //Shared Pendulum Body Properties
    var radInner = 0;
    var radOuter = 0.05

    //important position vectors
    var zr_pt = cp.v(0, 0)    //origin vector, for calculations
    var st_pt1 = cp.v(l_cos1, h + l_sin1); //first weight (moving)
    var st_pt2 = cp.v(l_cos2 + 2 * radOuter, h + l_sin2); //first weight (moving)

    var rev_pt1 = cp.v(0, h); //revolution point of hanging weights
    var rev_pt2 = cp.v(2 * radOuter, h); //revolution point of hanging weights

    //Create First Pendulum
    body1 = world.addBody(new cp.Body(mass1, cp.momentForCircle(mass1, radInner, radOuter, zr_pt)));
    body1.setPos(st_pt1);
    body1.setAngle(0);

    var shape1 = gameState.shapeArray[0] = world.addShape(new cp.CircleShape(body1, radOuter, zr_pt));
    shape1.setElasticity(elast);
    shape1.setFriction(1);
    shape1.setLayers(SHAPES);

    world.addConstraint(new cp.PinJoint(body1, staticBody, zr_pt, rev_pt1));

    shape1.fillStyle = function () { return 'rgba(0, 0, 200, 0.7)'; };
    shape1.strokeStyle = function () { return 'rgb(0,0,160)'; };
    shape1.draw = function (context) {
        drawCircle(context, this.tc, this.r);
    };

    if (numWeights == 2) {
        //create Second Pendulum
        body2 = world.addBody(new cp.Body(mass2, cp.momentForCircle(mass2, radInner, radOuter, zr_pt)));
        body2.setPos(st_pt2);
        body2.setAngle(0);

        var shape2 = gameState.shapeArray[1] = world.addShape(new cp.CircleShape(body2, radOuter, zr_pt));
        shape2.setElasticity(elast);
        shape2.setFriction(1);
        shape2.setLayers(SHAPES);

        world.addConstraint(new cp.PinJoint(body2, staticBody, zr_pt, rev_pt2));

        shape2.fillStyle = function () { return 'rgba(230, 25, 25, 0.7)'; };
        shape2.strokeStyle = function () { return 'rgb(200, 0, 0)'; };
        shape2.draw = function (context) {
            drawCircle(context, this.tc, this.r);
        };
    }


    var numPend = !(numWeightsRadio[0].checked == true) + 1;
    var text = graphOptionDropdown.options[graphOptionDropdown.selectedIndex].innerHTML;
    var p1;
    var p2 = "N/A";

    var shape1 = gameState.shapeArray[0];

    var sampleT = 0;
    sampleT = sampleT.toFixed(3) + 's';

    if (numPend == 1) {
        if (text == "Height") {
            p1 = 100 * shape1.body.p.y;
            var sampleH = myRound(p1, 1);
            sampleH = sampleH.toFixed(1) + 'cm';

            this.updateCurrentParameters(sampleT, sampleH, p2);
        }
        else if (text == "Angle") {
            p1 = 270 - angle(0, 0.5, shape1.body.p.x, shape1.body.p.y);
            var sampleA = myRound(p1, 1);
            sampleA = sampleA.toFixed(1) + 'deg';

            this.updateCurrentParameters(sampleT, sampleA, p2);
        }
        else if (text == "Velocity") {
            p1 = 100 * Math.sqrt(shape1.body.vx ** 2 + shape1.body.vy ** 2);

            var sampleV = myRound(p1, 1);
            sampleV = sampleV.toFixed(1) + 'cm/s';

            this.updateCurrentParameters(sampleT, sampleV, p2);
        }
    }

    else if (numPend == 2) {
        var shape2 = gameState.shapeArray[1];

        if (text == "Height") {
            p1 = 100 * shape1.body.p.y;
            p2 = 100 * shape2.body.p.y;
            var sampleH = myRound(p1, 1);
            sampleH = sampleH.toFixed(1) + 'cm';
            var sampleH2 = myRound(p2, 1);
            sampleH2 = sampleH2.toFixed(1) + 'cm';

            this.updateCurrentParameters(sampleT, sampleH, sampleH2);
        }
        else if (text == "Angle") {
            p1 = 270 - angle(0, 0.5, shape1.body.p.x, shape1.body.p.y);
            p2 = 270 - angle(0.1, 0.5, shape2.body.p.x, shape2.body.p.y);
            var sampleA = myRound(p1, 1);
            sampleA = sampleA.toFixed(1) + 'deg';
            var sampleA2 = myRound(p2, 1);
            sampleA2 = sampleA2.toFixed(1) + 'deg';

            this.updateCurrentParameters(sampleT, sampleA, sampleA2);
        }
        else if (text == "Velocity") {
            p1 = 100 * Math.sqrt(shape1.body.vx ** 2 + shape1.body.vy ** 2);
            p2 = 100 * Math.sqrt(shape2.body.vx ** 2 + shape2.body.vy ** 2);
            var sampleV = myRound(p1, 1);
            sampleV = sampleV.toFixed(1) + 'cm/s';
            var sampleV2 = myRound(p2, 1);
            sampleV2 = sampleV2.toFixed(1) + 'cm/s';

            this.updateCurrentParameters(sampleT, sampleV, sampleV2);
        }
    }
}

Exploratory.prototype.step = function (gameState, gameDygraph, dataTimeStep, graphTimeStep) {
    var numPend = !(numWeightsRadio[0].checked == true) + 1;
    var text = graphOptionDropdown.options[graphOptionDropdown.selectedIndex].innerHTML;
    var p1;
    var p2 =  "N/A";

    var shape1 = gameState.shapeArray[0];

    var sampleT = myRound(gameDygraph.itr * gameState.stepTime, 3);
    sampleT = sampleT.toFixed(3) + 's';

    if (numPend == 1) {
        if (text == "Height") {
            p1 = 100 * shape1.body.p.y;
            var sampleH = myRound(p1, 1);
            sampleH = sampleH.toFixed(1) + 'cm';

            this.updateCurrentParameters(sampleT, sampleH, p2);
            this.addToDygraph(gameState, gameDygraph, dataTimeStep, graphTimeStep, p1);
        }
        else if (text == "Angle") {
            p1 = 270 - angle(0, 0.5, shape1.body.p.x, shape1.body.p.y);
            var sampleA = myRound(p1, 1);
            sampleA = sampleA.toFixed(1) + 'deg';

            this.updateCurrentParameters(sampleT, sampleA, p2);
            this.addToDygraph(gameState, gameDygraph, dataTimeStep, graphTimeStep, p1);
        }
        else if (text == "Velocity") {
            p1 = 100 * Math.sqrt(shape1.body.vx ** 2 + shape1.body.vy ** 2);

            var sampleV = myRound(p1, 1);
            sampleV = sampleV.toFixed(1) + 'cm/s';

            this.updateCurrentParameters(sampleT, sampleV, p2);
            this.addToDygraph(gameState, gameDygraph, dataTimeStep, graphTimeStep, p1);
        }
    }

    else if (numPend == 2) {
        var shape2 = gameState.shapeArray[1];

        if (text == "Height") {
            p1 = 100 * shape1.body.p.y;
            p2 = 100 * shape2.body.p.y; 
            var sampleH = myRound(p1, 1);
            sampleH = sampleH.toFixed(1) + 'cm';
            var sampleH2 = myRound(p2, 1);
            sampleH2 = sampleH2.toFixed(1) + 'cm';

            this.updateCurrentParameters(sampleT, sampleH, sampleH2);
            this.addToDygraph(gameState, gameDygraph, dataTimeStep, graphTimeStep, p1, p2);
        }
        else if (text == "Angle") {
            p1 = 270 - angle(0, 0.5, shape1.body.p.x, shape1.body.p.y);
            p2 = 270 - angle(0.1, 0.5, shape2.body.p.x, shape2.body.p.y);
            var sampleA = myRound(p1, 1);
            sampleA = sampleA.toFixed(1) + 'deg';
            var sampleA2 = myRound(p2, 1);
            sampleA2 = sampleA2.toFixed(1) + 'deg';

            this.updateCurrentParameters(sampleT, sampleA, sampleA2);
            this.addToDygraph(gameState, gameDygraph, dataTimeStep, graphTimeStep, p1, p2);
        }
        else if (text == "Velocity") {
            p1 = 100 * Math.sqrt(shape1.body.vx ** 2 + shape1.body.vy ** 2);
            p2 = 100 * Math.sqrt(shape2.body.vx ** 2 + shape2.body.vy ** 2);
            var sampleV = myRound(p1, 1);
            sampleV = sampleV.toFixed(1) + 'cm/s';
            var sampleV2 = myRound(p2, 1);
            sampleV2 = sampleV2.toFixed(1) + 'cm/s';

            this.updateCurrentParameters(sampleT, sampleV, sampleV2);
            this.addToDygraph(gameState, gameDygraph, dataTimeStep, graphTimeStep, p1, p2);
        }
    }
}

Exploratory.prototype.initializeDygraph = function (gameState, gameDygraph, graphID) {
    var numPend = !(numWeightsRadio[0].checked == true) + 1;
    var text = graphOptionDropdown.options[graphOptionDropdown.selectedIndex].innerHTML;

    if (numPend == 1) {
        if (text == "Height") {
            gameDygraph.data = [[0, 100 * gameState.shapeArray[0].body.p.y]];
            gameDygraph.graph = new Dygraph(
                document.getElementById(graphID),
                    gameDygraph.data,
                {
                    labels: ['Time', 'Height'],
                    xlabel: 'Time (s)',
                    ylabel: 'Height (cm)',
                    series: {
                        'Height': {
                            color: 'rgba(0,0,255,0.7)',
                            strokeWidth: 2
                        },
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
                }
            )
        }
        else if (text == "Angle") {
            gameDygraph.data = [[0, 270-angle(0, 0.5, gameState.shapeArray[0].body.p.x, gameState.shapeArray[0].body.p.y)]];
            gameDygraph.graph = new Dygraph(
                document.getElementById(graphID),
                    gameDygraph.data,
                {
                    labels: ['Time', 'Angle'],
                    xlabel: 'Time (s)',
                    ylabel: 'Angle (deg)',
                    series: {
                        'Angle': {
                            color: 'rgba(0,0,255,0.7)',
                            strokeWidth: 2
                        },
                    },
                    axes: {
                        x: {
                            valueFormatter: function (x) {
                                return x + 's';
                            }
                        },
                        y: {
                            valueFormatter: function (y) {
                                return myRound(y, 1) + 'deg';
                            }
                        }
                    }
                }
            )
        }
        else if (text == "Velocity") {
            gameDygraph.data = [[0, 100 * Math.sqrt(gameState.shapeArray[0].body.vx ** 2 + gameState.shapeArray[0].body.vy ** 2)]]
            gameDygraph.graph = new Dygraph(
                document.getElementById(graphID),
                    gameDygraph.data,
                {
                    labels: ['Time', 'Velocity'],
                    xlabel: 'Time (s)',
                    ylabel: 'Velocity (cm/s)',
                    series: {
                        'Velocity': {
                            color: 'rgba(0,0,255,0.7)',
                            strokeWidth: 2
                        },
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
                            }
                        }
                    }
                }
            )
        }
    }
    else if (numPend == 2) {
        if (text == "Height") {
            gameDygraph.data = [[0, 100 * gameState.shapeArray[0].body.p.y, 100 * gameState.shapeArray[1].body.p.y]];
            gameDygraph.graph = new Dygraph(
                document.getElementById(graphID),
                gameDygraph.data,
                {
                    labels: ['Time', 'Height1', 'Height2'],
                    xlabel: 'Time (s)',
                    ylabel: 'Height (cm)',
                    series: {
                        'Height1': {
                            color: 'rgba(0,0,255,0.7)',
                            strokeWidth: 2
                        },
                        'Height2': {
                            color: 'rgba(255,0,0.7)',
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
                }
            )
        }
        else if (text == "Angle") {
            gameDygraph.data = [[0, 270 - angle(0, 0.5, gameState.shapeArray[0].body.p.x, gameState.shapeArray[0].body.p.y), 270 - angle(0.1, 0.5, gameState.shapeArray[1].body.p.x, gameState.shapeArray[1].body.p.y)]];
            gameDygraph.graph = new Dygraph(
                document.getElementById(graphID),
                gameDygraph.data,
                {
                    labels: ['Time', 'Angle1', 'Angle2'],
                    xlabel: 'Time (s)',
                    ylabel: 'Angle (deg)',
                    series: {
                        'Angle1': {
                            color: 'rgba(0,0,255,0.7)',
                            strokeWidth: 2
                        },
                        'Angle2': {
                            color: 'rgba(255,0,0.7)',
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
                                return myRound(y, 1) + 'deg';
                            }
                        }
                    }
                }
            )
        }
        else if (text == "Velocity") {
            gameDygraph.data = [[0, 100 * Math.sqrt(gameState.shapeArray[0].body.vx ** 2 + gameState.shapeArray[0].body.vy ** 2), 100 * Math.sqrt(gameState.shapeArray[1].body.vx ** 2 + gameState.shapeArray[1].body.vy ** 2)]]
            gameDygraph.graph = new Dygraph(
                document.getElementById(graphID),
                gameDygraph.data,
                {
                    labels: ['Time', 'Velocity1','Velocity2'],
                    xlabel: 'Time (s)',
                    ylabel: 'Velocity (cm/s)',
                    series: {
                        'Velocity1': {
                            color: 'rgba(0,0,255,0.7)',
                            strokeWidth: 2
                        },
                        'Velocity2': {
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
                                return myRound(y, 1) + 'cm/s';
                            }
                        }
                    }
                }
            )
        }
    }
}

Exploratory.prototype.updateCurrentParameters = function (t1, h1, h2) {
    var time = document.getElementById('running-time');
    var currentHeight1 = document.getElementById('pendulum-param-1');
    var currentHeight2 = document.getElementById('pendulum-param-2');

    time.innerText = t1;
    currentHeight1.innerText = h1;
    currentHeight2.innerText = h2;
}
Exploratory.prototype.addToDygraph = function (gameState, gameDygraph, dataTimeStep, graphTimeStep, x, y) {

    var time = myRound(gameDygraph.itr * gameState.stepTime, 3);
    var data = gameDygraph.data;
    var graph = gameDygraph.graph;

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

Exploratory.prototype.updateInitialParameters = function () {

}

function initializeSliders() {
    // Input slider set up
    lengthSlider = document.getElementById("length-slider");
    massSlider = document.getElementById("mass-slider");
    angleSlider = document.getElementById("angle-slider");

    mass2Slider = document.getElementById("mass-2-slider");
    angle2Slider = document.getElementById("angle-2-slider");
    corSlider = document.getElementById("cor-slider");

    numWeightsRadio = document.getElementsByName('number-of-weights');
    graphOptionDropdown = document.getElementById('graph-options');


    noUiSlider.create(lengthSlider, {
        start: [0.5],
        step: 0.01,
        connect: true,
        tooltips: true,
        range: {
            'min': [0.1],
            'max': [0.5]
        }
    });

    noUiSlider.create(massSlider, {
        start: [20],
        step: 1,
        connect: true,
        tooltips: true,
        range: {
            'min': [1],
            'max': [200]
        }
    });

    noUiSlider.create(angleSlider, {
        start: [60],
        step: 1,
        connect: true,
        tooltips: true,
        range: {
            'min': [-90],
            'max': [90]
        }
    });

    noUiSlider.create(mass2Slider, {
        start: [20],
        step: 1,
        connect: true,
        tooltips: true,
        range: {
            'min': [1],
            'max': [200]
        }
    });

    noUiSlider.create(angle2Slider, {
        start: [0],
        step: 1,
        connect: true,
        tooltips: true,
        range: {
            'min': [-90],
            'max': [90]
        }
    });

    noUiSlider.create(corSlider, {
        start: [1],
        step: 0.1,
        connect: true,
        tooltips: true,
        range: {
            'min': [0],
            'max': [1]
        }
    });
}
function initializeSliderUpdates() {
    // whenever length slider changed handler
    lengthSlider.noUiSlider.on('update', function () {
        resetLevel();
    });

    massSlider.noUiSlider.on('update', function () {
        resetLevel();
    });

    angleSlider.noUiSlider.on('update', function () {
        resetLevel();
    });

    mass2Slider.noUiSlider.on('update', function () {
        resetLevel();
    });

    angle2Slider.noUiSlider.on('update', function () {
        resetLevel();
    });

    corSlider.noUiSlider.on('update', function () {
        resetLevel();
    });

    mass2Slider = document.getElementById("mass-2-slider");
    angle2Slider = document.getElementById("angle-2-slider");
    corSlider = document.getElementById("cor-slider");
    numWeightsRadio = document.getElementsByName('number-of-weights');

    var numWeights = !(numWeightsRadio[0].checked == true)+1;
    var height2Info = document.getElementById('height-2-container');
    var velocity2Info = document.getElementById('velocity-2-container');

    if (numWeights == "1") {
        // disable sliders
        mass2Slider.setAttribute('disabled', true);
        angle2Slider.setAttribute('disabled', true);
        corSlider.setAttribute('disabled', true);

    }
    else if (numWeights == "2") {
        // reenable sliders
        mass2Slider.removeAttribute('disabled');
        angle2Slider.removeAttribute('disabled');
        corSlider.removeAttribute('disabled');

    }

    numWeightsRadio[0].onchange = function () {

        var numWeights = !(numWeightsRadio[0].checked == true) +1;
        var height2Info = document.getElementById('height-2-container');
        var velocity2Info = document.getElementById('velocity-2-container');

        if (numWeights == "1") {
            // disable sliders
            mass2Slider.setAttribute('disabled', true);
            angle2Slider.setAttribute('disabled', true);
            corSlider.setAttribute('disabled', true);

        }
        else if (numWeights == "2") {
            // reenable sliders
            mass2Slider.removeAttribute('disabled');
            angle2Slider.removeAttribute('disabled');
            corSlider.removeAttribute('disabled');

        }
        resetLevel();
    };
    numWeightsRadio[1].onchange = function () {

        var numWeights = !(numWeightsRadio[0].checked == true) + 1;
        var height2Info = document.getElementById('height-2-container');
        var velocity2Info = document.getElementById('velocity-2-container');

        if (numWeights == "1") {
            // disable sliders
            mass2Slider.setAttribute('disabled', true);
            angle2Slider.setAttribute('disabled', true);
            corSlider.setAttribute('disabled', true);

        }
        else if (numWeights == "2") {
            // reenable sliders
            mass2Slider.removeAttribute('disabled');
            angle2Slider.removeAttribute('disabled');
            corSlider.removeAttribute('disabled');

        }
        resetLevel();
    };

    graphOptionDropdown.onchange = function () {
        resetLevel();
    };
}

