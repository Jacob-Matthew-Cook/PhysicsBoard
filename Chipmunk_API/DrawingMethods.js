// Drawing helper methods
var drawCircle = function (context, c, radius) {
    var cx = c.x;
    var cy = c.y;
    //var c = getWorldPointFromPixelPoint(c);
    context.beginPath();
    context.arc(c.x, c.y, radius, 0, 2 * Math.PI, false);
    context.fill();
    context.stroke();
};

var drawCircleArc = function (context, c, radius, start, end, counterClockwise) {
    var cx = c.x;
    var cy = c.y;
    //var c = getWorldPointFromPixelPoint(c);
    context.beginPath();
    context.arc(c.x, c.y, radius, start, end, counterClockwise);
    //context.fill();
    context.stroke();
};

var drawCircleArcFilled = function (context, c, radius, start, end, counterClockwise) {
    var cx = c.x;
    var cy = c.y;
    //var c = getWorldPointFromPixelPoint(c);
    context.beginPath();
    context.arc(c.x, c.y, radius, start, end, counterClockwise);
    context.fill();
    context.stroke();
};

var drawLine = function (context, a, b) {
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
};

var drawRect = function (context, pos, size) {
    var pos_ = pos;
    var size_ = cp.v.sub((cp.v.add(pos, size)), pos_);
    context.fillRect(pos_.x, pos_.y, size_.x, size_.y);
};

var drawSpring = function (context, a, b) {
    var springPoints = [
        cp.v(0.00, 0.0),
        cp.v(0.20, 0.0),
        cp.v(0.25, 3.0),
        cp.v(0.30, -6.0),
        cp.v(0.35, 6.0),
        cp.v(0.40, -6.0),
        cp.v(0.45, 6.0),
        cp.v(0.50, -6.0),
        cp.v(0.55, 6.0),
        cp.v(0.60, -6.0),
        cp.v(0.65, 6.0),
        cp.v(0.70, -3.0),
        cp.v(0.75, 6.0),
        cp.v(0.80, 0.0),
        cp.v(1.00, 0.0)
    ];

    context.beginPath();
    context.moveTo(a.x, a.y);

    var delta = v.sub(b, a);
    var len = v.len(delta);
    var rot = v.mult(delta, 1 / len);

    for (var i = 1; i < springPoints.length; i++) {

        var p = v.add(a, v.rotate(v(springPoints[i].x * len, springPoints[i].y ), rot));

        //var p = v.add(a, v.rotate(springPoints[i], delta));

        context.lineTo(p.x, p.y);
    }

    context.stroke();
};


// **** Draw methods for Shapes

cp.PolyShape.prototype.draw = function (context) {
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
};

cp.SegmentShape.prototype.draw = function (context) {
    var oldLineWidth = context.lineWidth;
    context.strokeStyle = 'rgb(0, 0, 0)';
    context.fillStyle = 'rgb(106,108,110)';

    var segAngle = Math.PI*angle(this.ta.x, this.ta.y, this.tb.x, this.tb.y)/180
    var segAngle1 = segAngle - Math.PI / 2;
    var segAngle2 = segAngle + Math.PI / 2;
    var segAngle3 = segAngle + 3 * Math.PI / 2;

    var radius = this.r;

    context.beginPath();
    context.arc(this.ta.x, this.ta.y, radius, segAngle1, segAngle2, true);
    context.arc(this.tb.x, this.tb.y, radius, segAngle2, segAngle3, true);
    context.closePath();
    context.stroke();
    context.fill();
};

cp.CircleShape.prototype.draw = function (context) {
    drawCircle(context, this.tc, this.r);
    //cp.v.mult(this.body.rot, this.r).add(this.tc)

    // And draw a little radian so you can see the circle roll.
    drawLine(context, this.tc, cp.v.mult(this.body.rot, this.r).add(this.tc));
};


// Draw methods for constraints

cp.PinJoint.prototype.draw = function (context,PTM) {
    var a = this.a.local2World(this.anchr1);
    var b = this.b.local2World(this.anchr2);

    context.lineWidth = 2/PTM;
    context.strokeStyle = "black";
    drawLine(context, a, b);
};

cp.PinJoint.prototype.drawForce = function (context, PTM, timeStep, gameGraphics) {
    var cont = this;
    if (cont.n) {
        var nMag = cont.jnAcc / (timeStep)
        if (nMag != 0) {
            var n1Vec = cp.v(cont.n.x, cont.n.y);
            var n2Vec = cp.v.rotate(cont.n, cp.v(-1,0));

            var start1 = cp.v.add(cont.a.p, cont.r1);;
            n1Vec.mult(-nMag * gameGraphics.vectorScale);

            var start2 = cp.v.add(cont.b.p, cont.r2);;
            n2Vec.mult(-nMag * gameGraphics.vectorScale);

            n1Vec.draw(context, PTM, start1, "cyan");
            n2Vec.draw(context, PTM, start2, "cyan");
        }
    }
}

cp.RopeJoint.prototype.draw = function (context, PTM) {
    var a = this.a.local2World(this.anchr1);
    var b = this.b.local2World(this.anchr2);

    context.lineWidth = 2 / PTM;
    context.strokeStyle = "brown";
    drawLine(context, a, b);
};

cp.RopeJoint.prototype.drawForce = function (context, PTM, timeStep, gameGraphics) {
    var cont = this;
    if (cont.n) {
        var nMag = cont.jnAcc / (timeStep)
        if (nMag != 0) {
            var n1Vec = cp.v(cont.n.x, cont.n.y);
            var n2Vec = cp.v.rotate(cont.n, cp.v(-1, 0));

            var start1 = cp.v.add(cont.a.p, cont.r1);;
            n1Vec.mult(-nMag * gameGraphics.vectorScale);

            var start2 = cp.v.add(cont.b.p, cont.r2);;
            n2Vec.mult(-nMag * gameGraphics.vectorScale);

            n1Vec.draw(context, PTM, start1, "orange");
            n2Vec.draw(context, PTM, start2, "orange");
        }
    }
}

cp.PulleyJointRatio.prototype.draw = function (context, PTM) {
    var p1 = this.a.local2World(this.anchr1);
    var p2 = this.b.local2World(this.anchr2);
    var p3 = this.b.local2World(this.anchr3);
    var p4 = this.c.local2World(this.anchr4);

    context.lineWidth = 2 / PTM;
    context.strokeStyle = "lime";
    drawLine(context, p1, p2);
    drawLine(context, p3, p4);
};

cp.PulleyJointRatio.prototype.drawForce = function (context, PTM, timeStep, gameGraphics) {
    var cont = this;
    var ratio = cont.ratio;
    var nMag = cont.jnAcc / (timeStep)
    if (nMag) {
        if (cp.v.len(cont.n12)) {
            var n1Vec = cp.v(cont.n12.x, cont.n12.y);
            var n2Vec = cp.v.rotate(n1Vec, cp.v(-1, 0));

            var start1 = cp.v.add(cont.a.p, cont.r1);
            n1Vec.mult(-nMag * gameGraphics.vectorScale);
            var start2 = cp.v.add(cont.b.p, cont.r2);
            n2Vec.mult(-nMag * gameGraphics.vectorScale);

            n1Vec.draw(context, PTM, start1, "grey");
            n2Vec.draw(context, PTM, start2, "grey");
        }
        if (cp.v.len(cont.n23)) {
            var n3Vec = cp.v(cont.n23.x, cont.n23.y);
            var n4Vec = cp.v.rotate(n3Vec, cp.v(-1, 0));

            var start3 = cp.v.add(cont.b.p, cont.r3);
            n3Vec.mult(-nMag * ratio * gameGraphics.vectorScale);
            var start4 = cp.v.add(cont.c.p, cont.r4);
            n4Vec.mult(-nMag * ratio * gameGraphics.vectorScale);

            n3Vec.draw(context, PTM, start3, "grey");
            n4Vec.draw(context, PTM, start4, "grey");
        }
    }
}

cp.PulleyJoint2.prototype.draw = function (context, PTM) {
    var p1 = this.a.local2World(this.anchr1);
    var p2 = this.b.local2World(this.anchr2);
    var p3 = this.b.local2World(this.anchr3);
    var p4 = this.c.local2World(this.anchr4);

    context.lineWidth = 3 / PTM;
    context.strokeStyle = "brown";
    drawLine(context, p1, p2);
    drawLine(context, p3, p4);
};

cp.PulleyJoint2.prototype.drawForce = function (context, PTM, timeStep, gameGraphics) {
    var cont = this;
    var nMag = cont.jnAcc / (timeStep)
    if (nMag) {
        if (cp.v.len(cont.n12)) {
            var n1Vec = cp.v(cont.n12.x, cont.n12.y);
            var n2Vec = cp.v.rotate(n1Vec, cp.v(-1, 0));

            var start1 = cp.v.add(cont.a.p, cont.r1);
            n1Vec.mult(-nMag * gameGraphics.vectorScale);
            var start2 = cp.v.add(cont.b.p, cont.r2);
            n2Vec.mult(-nMag * gameGraphics.vectorScale);

            n1Vec.draw(context, PTM, start1, "grey");
            n2Vec.draw(context, PTM, start2, "grey");
        }
        if (cp.v.len(cont.n23)) {
            var n3Vec = cp.v(cont.n23.x, cont.n23.y);
            var n4Vec = cp.v.rotate(n3Vec, cp.v(-1, 0));

            var start3 = cp.v.add(cont.b.p, cont.r3);
            n3Vec.mult(-nMag * gameGraphics.vectorScale);
            var start4 = cp.v.add(cont.c.p, cont.r4);
            n4Vec.mult(-nMag * gameGraphics.vectorScale);

            n3Vec.draw(context, PTM, start3, "grey");
            n4Vec.draw(context, PTM, start4, "grey");
        }
    }
}


cp.PulleyJoint3.prototype.draw = function (context, PTM) {
    var p1 = this.a.local2World(this.anchr1);
    var p2 = this.b.local2World(this.anchr2);
    var p3 = this.b.local2World(this.anchr3);
    var p4 = this.c.local2World(this.anchr4);
    var p5 = this.c.local2World(this.anchr5);
    var p6 = this.d.local2World(this.anchr6);

    context.lineWidth = 2 / PTM;
    context.strokeStyle = "purple";
    drawLine(context, p1, p2);
    drawLine(context, p3, p4);
    drawLine(context, p5, p6);
};

cp.PulleyJoint3.prototype.drawForce = function (context, PTM, timeStep, gameGraphics) {
    var cont = this;
    var nMag = cont.jnAcc / (timeStep)
    if (nMag) {
        if (cp.v.len(cont.n12)) {
            var n1Vec = cp.v(cont.n12.x, cont.n12.y);
            var n2Vec = cp.v.rotate(n1Vec, cp.v(-1, 0));

            var start1 = cp.v.add(cont.a.p, cont.r1);
            n1Vec.mult(-nMag * gameGraphics.vectorScale);
            var start2 = cp.v.add(cont.b.p, cont.r2);
            n2Vec.mult(-nMag * gameGraphics.vectorScale);

            n1Vec.draw(context, PTM, start1, "grey");
            n2Vec.draw(context, PTM, start2, "grey");
        }
        if (cp.v.len(cont.n23))
        {
            var n3Vec = cp.v(cont.n23.x, cont.n23.y);
            var n4Vec = cp.v.rotate(n3Vec, cp.v(-1, 0));

            var start3 = cp.v.add(cont.b.p, cont.r3);
            n3Vec.mult(-nMag * gameGraphics.vectorScale);
            var start4 = cp.v.add(cont.c.p, cont.r4);
            n4Vec.mult(-nMag * gameGraphics.vectorScale);

            n3Vec.draw(context, PTM, start3, "grey");
            n4Vec.draw(context, PTM, start4, "grey");
        }
        if (cp.v.len(cont.n34))
        {
            var n5Vec = cp.v(cont.n34.x, cont.n34.y);
            var n6Vec = cp.v.rotate(n5Vec, cp.v(-1, 0));

            var start5 = cp.v.add(cont.c.p, cont.r5);
            n5Vec.mult(-nMag * gameGraphics.vectorScale);
            var start6 = cp.v.add(cont.d.p, cont.r6);
            n6Vec.mult(-nMag * gameGraphics.vectorScale);

            n5Vec.draw(context, PTM, start5, "grey");
            n6Vec.draw(context, PTM, start6, "grey");
        }
    }
}

cp.SlideJoint.prototype.draw = function (context,PTM) {
    var a = this.a.local2World(this.anchr1);
    var b = this.b.local2World(this.anchr2);
    var midpoint = v.add(a, v.clamp(v.sub(b, a), this.min));

    context.lineWidth = 2 / PTM;
    context.strokeStyle = "grey";
    drawLine(context, a, b);
    context.strokeStyle = "red";
    drawLine(context, a, midpoint);
};

cp.PivotJoint.prototype.draw = function (context, PTM) {
    var a = this.a.local2World(this.anchr1);
    var b = this.b.local2World(this.anchr2);
    context.strokeStyle = "magenta";
    context.fillStyle = "grey";
    drawCircle(context, a, 2/PTM);
    drawCircle(context, b, 2 / PTM);
    context.lineWidth = 2 / PTM;
    drawLine(context, a, b);
};

cp.PivotJoint.prototype.drawForce = function (context, PTM, timeStep, gameGraphics) {
    var cont = this;
    var nVec = cp.v(-cont.jAcc.x / timeStep, -cont.jAcc.y / timeStep);
    var nMag = cp.v.len(nVec);

    var start = cp.v.add(cont.b.p, cont.r2);

    nVec.mult(-gameGraphics.vectorScale);

    if (nMag != 0) {
        nVec.draw(context, PTM, start, "black");
    }
}


cp.GrooveJoint.prototype.draw = function (context,PTM) {
    var a = this.a.local2World(this.grv_a);
    var b = this.a.local2World(this.grv_b);
    var c = this.b.local2World(this.anchr2);

    context.lineWidth = 2 / PTM;
    context.strokeStyle = 'rgb(85,63,35)';
    drawLine(context, a, b);
    drawCircle(context, c, 3);
};

cp.DampedSpring.prototype.draw = function (context,PTM) {
    var a = this.a.local2World(this.anchr1);
    var b = this.b.local2World(this.anchr2);

    context.lineWidth = 2 / PTM;
    context.strokeStyle = "grey";
    //drawSpring(context, a, b); //old
    //new
    context.lineWidth = 2 / PTM;
    drawLine(context, a, b);
};

var randColor = function () {
    return Math.floor(Math.random() * 256);
};

var styles = [];
for (var i = 0; i < 100; i++) {
    styles.push("rgb(" + randColor() + ", " + randColor() + ", " + randColor() + ")");
}

styles = ['rgba(255,0,0,0.5)', 'rgba(0,255,0,0.5)', 'rgba(0,0,255,0.5)'];


cp.Shape.prototype.drawGravity = function (context, PTM, gameGraphics) {
    var gravityVec = cp.v(this.space.gravity.x, this.space.gravity.y);
    gravityVec.mult(this.body.m * gameGraphics.vectorScale);
    gravityVec.draw(context, gameGraphics, this.body.p, "green");
}



cp.Shape.prototype.drawForceWithTorqueOffset = function (context, PTM, gameGraphics) {
    var forceVec = cp.v(this.body.f.x, this.body.f.y);
    var rVec = cp.v(1, 0);

    var A = cp.v.len(forceVec);
    var torque = this.body.t;
    var start = cp.v(this.body.p.x, this.body.p.y);

    if (A==0)
        return
    else if (torque == 0) {
        forceVec.mult(gameGraphics.vectorScale);
        forceVec.draw(context, PTM, start, "blue");
        return
    }

    var B = torque / A;
    var fUnit = cp.v(forceVec.x / A, forceVec.y / A);
    rVec = cp.v.rotate(cp.v(0, -B), fUnit);
    start = cp.v.add(start, rVec);

    forceVec.mult(gameGraphics.vectorScale);
    forceVec.draw(context, PTM, start, "blue");
}

cp.Shape.prototype.drawBoundingBox = function (context, PTM, gameGraphics) {
    var shape = this;

    var left =   shape.bb_l;
    var right =  shape.bb_r;
    var top =    shape.bb_t;
    var bottom = shape.bb_b;

    var lb = cp.v(shape.bb_l, shape.bb_b);
    var rb = cp.v(shape.bb_r, shape.bb_b);
    var lt = cp.v(shape.bb_l, shape.bb_t);
    var rt = cp.v(shape.bb_r, shape.bb_t);

    context.strokeStyle = "yellow";

    drawLine(context, lb, rb);
    drawLine(context, lt, rt);
    drawLine(context, lb, lt);
    drawLine(context, rb, rt);
    //var gravityVec = cp.v(this.space.gravity.x, this.space.gravity.y);
    //gravityVec.mult(this.body.m * gameGraphics.vectorScale);
    //gravityVec.draw(context, gameGraphics, this.body.p, "green");
}

cp.Shape.prototype.drawVelocity = function (context, PTM, gameGraphics) {
    var velocity = cp.v(this.body.vx, this.body.vy);
    var start = cp.v(this.body.p.x, this.body.p.y);

    if (cp.v.len(velocity) == 0)
        return

    velocity.mult(gameGraphics.velocityScale);
    velocity.draw(context, PTM, start, "orange");
}

cp.Shape.prototype.drawAngVel= function (context, PTM, gameGraphics) {
    var body = this.body;
    var angVel = body.w;

    context.lineWidth = 4 / PTM;
    var color = "cyan"
    context.strokeStyle = color;
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
    else
        return
    
    var startVec = cp.v(Math.cos(start), Math.sin(start)).mult(radius).add(this.body.p);
    var endVec = cp.v(Math.cos(end), Math.sin(end)).mult(radius).add(this.body.p)

    var leftTip = cp.v(0, 0.1);
    var rightTip = cp.v(0, -0.1);
    var frontTip = cp.v(0.3,0)

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
}

cp.Shape.prototype.fillStyle = function (gameState) {
    var world = gameState.world;
    var body;
    if (this.sensor) {
        return "rgba(255,255,255,0)";
    }
    else{
        body = this.body;
        if (body.isSleeping()) {
            return "rgb(50,50,50)";
        }
        else if (body.nodeIdleTime > world.sleepTimeThreshold) {
            return "rgb(170,170,170)";
        }
        else if(this.type == "circle"){
            return "rgba(230, 25, 25, 0.7)";
        }
        else if (this.type == "segment") {
            return "rgba(0,255,255,0.3)";
        }
        else if (this.type == "poly") {
            if (this.planes.length == 3) {
                return "rgba(230, 230, 20, 0.7)";
            }
            else if (this.planes.length == 4) {
                return "rgba(20, 205, 20, 0.7)";
            }
            else {
                return "rgba(0, 0, 200, 0.7)";
            }
        }
        else {
            return "rgba(0,0,0,1)";
        }
    }
};

cp.Shape.prototype.strokeStyle = function (gameState) {
    var world = gameState.world;
    var body;
    if (this.sensor) {
        return "rgb(0,255,255)";
    }
    else {
        body = this.body;
        if (body.isSleeping()) {
            return "rgb(50,50,50)";
        }
        else if (body.nodeIdleTime > world.sleepTimeThreshold) {
            return "rgb(170,170,170)";
        }
        else if (this.type == "circle") {
            return "rgb(200, 0, 0)";
        }
        else if (this.type == "segment") {
            return "rgb(10, 10, 10)";
        }
        else if (this.type == "poly") {
            if (this.planes.length == 3) {
                return "rgb(200, 200, 0)";
            }
            else if (this.planes.length == 4) {
                return "rgb(0, 160, 0)";
            }
            else {
                return "rgb(0, 0, 160)";
            }
        }
        else {
            return "rgb(0,0,0)";
        }
    }
};


cp.Vect.prototype.draw = function (context, PTM, startVec, color) {
    context.lineWidth = 4/ PTM;
    context.strokeStyle = color;
    context.fillStyle = color;
    var normVec = this;
    var endVec = cp.v.add(startVec, normVec);

    var leftTip = cp.v(-0.15, 0.05);
    var rightTip = cp.v(-0.15, -0.05);

    var prong1 = cp.v.rotate(normVec, leftTip);
    var prong2 = cp.v.rotate(normVec, rightTip);

    var end1 = cp.v.add(endVec, prong1);
    var end2 = cp.v.add(endVec, prong2);

    drawCircle(context, startVec, context.lineWidth)
    drawLine(context, startVec, endVec);

    context.beginPath();
    context.moveTo(endVec.x, endVec.y);
    context.lineTo(end1.x, end1.y);
    context.lineTo(end2.x, end2.y);
    context.lineTo(endVec.x, endVec.y);
    context.fill();
    context.stroke();
};

cp.Arbiter.prototype.draw = function (context, PTM, timeStep, gameGraphics) {
    var arb = this;
    var contacts = arb.contacts;
    if (arb.a.type != "segment") {
        contacts.forEach(callbackA);
    };
    if (arb.b.type != "segment") {
        contacts.forEach(callbackB);
    };
    function callbackA(cont) {
        var nMag = cont.jnAcc/(timeStep);
        var nVec = cp.v(cont.n.x,cont.n.y);

        var tMag = cont.jtAcc/(timeStep);
        var tVec = cp.v.rotate(cont.n, cp.v(0, 1))

        var start = cont.p;
        nVec.mult(-nMag * gameGraphics.vectorScale);
        tVec.mult(-tMag * gameGraphics.vectorScale);

        if (nMag != 0) {
            nVec.draw(context, PTM, start, "black");
        }
        if (tMag != 0) {
            tVec.draw(context, PTM, start, "red");
        }
    };
    function callbackB(cont) {
        var nMag = cont.jnAcc / (timeStep);
        var nVec = cp.v(cont.n.x, cont.n.y);
        nVec.rotate(cp.v(-1, 0));

        var tMag = cont.jtAcc / (timeStep);
        var tVec = cp.v.rotate(cont.n, cp.v(0, -1))

        var start = cont.p;
        nVec.mult(-nMag * gameGraphics.vectorScale);
        tVec.mult(-tMag * gameGraphics.vectorScale);

        if (nMag != 0) {
            nVec.draw(context, PTM, start, "grey");
        }
        if (tMag != 0) {
            tVec.draw(context, PTM, start, "purple");
        }
    };
}


