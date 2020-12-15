/* Copyright (c) 2007 Scott Lembcke
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 
var Pyramid = function() {
	
};

Pyramid.prototype.setup = function () {
    //space.iterations = 30;
    world.gravity = v(0, -100);
    world.sleepTimeThreshold = 0.5;
    world.collisionSlop = 0.5;


    var floor = world.addShape(new cp.SegmentShape(world.staticBody, v(0, 0), v(640, 0), 0));
    floor.setElasticity(1);
    floor.setFriction(1);
    floor.setLayers(NOT_GRABABLE_MASK);


    var wall1 = world.addShape(new cp.SegmentShape(world.staticBody, v(0, 0), v(0, 480), 0));
    wall1.setElasticity(1);
    wall1.setFriction(1);
    wall1.setLayers(NOT_GRABABLE_MASK);

    var wall2 = world.addShape(new cp.SegmentShape(world.staticBody, v(640, 0), v(640, 480), 0));
    wall2.setElasticity(1);
    wall2.setFriction(1);
    wall2.setLayers(NOT_GRABABLE_MASK);

    var body, staticBody = world.staticBody;
    var shape;

    // Add lots of boxes.
    for (var i = 0; i < 14; i++) {
        for (var j = 0; j <= i; j++) {
            body = world.addBody(new cp.Body(1, cp.momentForBox(1, 30, 30)));
            body.setPos(v(j * 32 - i * 16 + 320, 540 - i * 32));

            shape = world.addShape(new cp.BoxShape(body, 30, 30));
            shape.setElasticity(0);
            shape.setFriction(0.8);
        }
    }

    // Add a ball to make things more interesting
    var radius = 15;
    body = world.addBody(new cp.Body(10, cp.momentForCircle(10, 0, radius, v(0, 0))));
    body.setPos(v(320, radius + 5));

    shape = world.addShape(new cp.CircleShape(body, radius, v(0, 0)));
    shape.setElasticity(0);
    shape.setFriction(0.9);
}

Pyramid.prototype.step = function(dt)
{
    return;
};

