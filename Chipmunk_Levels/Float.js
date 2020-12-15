var FLUID_DENSITY = 0.00014;
var FLUID_DRAG = 2.0;

var Float = function () {
}

Float.prototype.setup = function () {
    world.iterations = 30;
    world.gravity = cp.v(0, -500);
    //	cpworldSetDamping(world, 0.5);
    world.sleepTimeThreshold = 0.5;
    world.collisionSlop = 0.5;

    var staticBody = world.staticBody;

    /*/ Create segments around the edge of the screen.
    var shape = world.addShape(new cp.SegmentShape(staticBody, cp.v(0, 0), cp.v(0, 480), 0.0));
    shape.setElasticity(1.0);
    shape.setFriction(1.0);
    shape.setLayers(NOT_GRABABLE_MASK);

    shape = world.addShape(new cp.SegmentShape(staticBody, cp.v(640, 0), cp.v(640, 480), 0.0));
    shape.setElasticity(1.0);
    shape.setFriction(1.0);
    shape.setLayers(NOT_GRABABLE_MASK);

    shape = world.addShape(new cp.SegmentShape(staticBody, cp.v(0, 0), cp.v(640, 0), 0.0));
    shape.setElasticity(1.0);
    shape.setFriction(1.0);
    shape.setLayers(NOT_GRABABLE_MASK);

    shape = world.addShape(new cp.SegmentShape(staticBody, cp.v(0, 480), cp.v(640, 480), 0.0));
    shape.setElasticity(1.0);
    shape.setFriction(1.0);
    shape.setLayers(NOT_GRABABLE_MASK);
    */
    // {
    // Add the edges of the bucket
    var bb = new cp.BB(20, 40, 420, 240);
    var radius = 5.0;

    shape = world.addShape(new cp.SegmentShape(staticBody, cp.v(bb.l, bb.b), cp.v(bb.l, bb.t), radius));
    shape.setElasticity(1.0);
    shape.setFriction(1.0);
    shape.setLayers(NOT_GRABABLE_MASK);

    shape = world.addShape(new cp.SegmentShape(staticBody, cp.v(bb.r, bb.b), cp.v(bb.r, bb.t), radius));
    shape.setElasticity(1.0);
    shape.setFriction(1.0);
    shape.setLayers(NOT_GRABABLE_MASK);

    shape = world.addShape(new cp.SegmentShape(staticBody, cp.v(bb.l, bb.b), cp.v(bb.r, bb.b), radius));
    shape.setElasticity(1.0);
    shape.setFriction(1.0);
    shape.setLayers(NOT_GRABABLE_MASK);

    // Add the sensor for the water.
    shape = world.addShape(new cp.BoxShape2(staticBody, bb));
    shape.setSensor(true);
    shape.setCollisionType(1);
    // }


    // {
    var width = 200.0;
    var height = 50.0;
    var mass = 0.3 * FLUID_DENSITY * width * height;
    var moment = cp.momentForBox(mass, width, height);

    body = world.addBody(new cp.Body(mass, moment));
    body.setPos(cp.v(270, 140));
    body.setVel(cp.v(0, -100));
    body.setAngVel(1);

    shape = world.addShape(new cp.BoxShape(body, width, height));
    shape.setFriction(0.8);
    // }

    // {
    width = 40.0;
    height = width * 2;
    mass = 0.3 * FLUID_DENSITY * width * height;
    moment = cp.momentForBox(mass, width, height);

    body = world.addBody(new cp.Body(mass, moment));
    body.setPos(cp.v(120, 190));
    body.setVel(cp.v(0, -100));
    body.setAngVel(1);

    shape = world.addShape(new cp.BoxShape(body, width, height));
    shape.setFriction(0.8);
    // }

    world.addCollisionHandler(1, 0, null, this.waterPreSolve, null, null);
};


Float.prototype.step = function (dt) {

};

Float.prototype.waterPreSolve = function (arb, world, ptr) {
    var shapes = arb.getShapes();
    var water = shapes[0];
    var poly = shapes[1];

    var body = poly.getBody();

    // Get the top of the water sensor bounding box to use as the water level.
    var level = water.getBB().t;

    // Clip the polygon against the water level
    var count = poly.getNumVerts();

    var clipped = [];

    var j = count - 1;
    for (var i = 0; i < count; i++) {
        var a = body.local2World(poly.getVert(j));
        var b = body.local2World(poly.getVert(i));

        if (a.y < level) {
            clipped.push(a.x);
            clipped.push(a.y);
        }

        var a_level = a.y - level;
        var b_level = b.y - level;

        if (a_level * b_level < 0.0) {
            var t = Math.abs(a_level) / (Math.abs(a_level) + Math.abs(b_level));

            var v = cp.v.lerp(a, b, t);
            clipped.push(v.x);
            clipped.push(v.y);
        }
        j = i;
    }

    // Calculate Float from the clipped polygon area
    var clippedArea = cp.areaForPoly(clipped);

    var displacedMass = clippedArea * FLUID_DENSITY;
    var centroid = cp.centroidForPoly(clipped);
    var r = cp.v.sub(centroid, body.getPos());

    var dt = world.getCurrentTimeStep();
    var g = world.gravity;

    // Apply the Float force as an impulse.
    body.applyImpulse(cp.v.mult(g, -displacedMass * dt), r);

    // Apply linear damping for the fluid drag.
    var v_centroid = cp.v.add(body.getVel(), cp.v.mult(cp.v.perp(r), body.w));
    var k = 1; //k_scalar_body(body, r, cp.v.normalize_safe(v_centroid));
    var damping = clippedArea * FLUID_DRAG * FLUID_DENSITY;
    var v_coef = Math.exp(-damping * dt * k); // linear drag
    //	var v_coef = 1.0/(1.0 + damping*dt*cp.v.len(v_centroid)*k); // quadratic drag
    body.applyImpulse(cp.v.mult(cp.v.sub(cp.v.mult(v_centroid, v_coef), v_centroid), 1.0 / k), r);

    // Apply angular damping for the fluid drag.
    var w_damping = cp.momentForPoly(FLUID_DRAG * FLUID_DENSITY * clippedArea, clipped, cp.v.neg(body.p));
    body.w *= Math.exp(-w_damping * dt * (1 / body.i));

    return true;
};
