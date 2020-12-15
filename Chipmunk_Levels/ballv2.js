var Balls = function () {

}

Balls.prototype.setup = function () {

	world.iterations = 60;
	world.gravity = v(0, -500);
	world.sleepTimeThreshold = 0.5;
	world.collisionSlop = 0.5;
    world.sleepTimeThreshold = 0.5;

    var staticBody = world.staticBody;

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

	var width = 50;
	var height = 60;
	var mass = width * height * 1/1000;
	var rock = world.addBody(new cp.Body(mass, cp.momentForBox(mass, width, height)));
	rock.setPos(v(500, 100));
	rock.setAngle(1);
	shape = world.addShape(new cp.BoxShape(rock, width, height));
	shape.setFriction(0.3);
	shape.setElasticity(0.3);

	for (var i = 1; i <= 10; i++) {
		var radius = 20;
		mass = 3;
		var body = world.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, v(0, 0))));
		body.setPos(v(200 + i, (2 * radius + 5) * i));
		var circle = world.addShape(new cp.CircleShape(body, radius, v(0, 0)));
		circle.setElasticity(0.8);
		circle.setFriction(1);
	}
/*
 * atom.canvas.onmousedown = function(e) {
      radius = 10;
      mass = 3;
      body = world.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, v(0, 0))));
      body.setPos(v(e.clientX, e.clientY));
      circle = world.addShape(new cp.CircleShape(body, radius, v(0, 0)));
      circle.setElasticity(0.5);
      return circle.setFriction(1);
    };
*/

	var ramp = world.addShape(new cp.SegmentShape(world.staticBody, v(100, 100), v(300, 200), 10));
	ramp.setElasticity(1);
	ramp.setFriction(1);
	ramp.setLayers(NOT_GRABABLE_MASK);
};


