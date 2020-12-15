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

var PyramidFall = function () {
}

PyramidFall.prototype.setup = function()
{
	var WIDTH = 4;
	var HEIGHT = 30;
	
	var add_domino = function(pos, flipped)
	{
		var mass = 1;
		var moment = cp.momentForBox(mass, WIDTH, HEIGHT);
		
		var body = world.addBody(new cp.Body(mass, moment));
		body.setPos(pos);

		var shape = (flipped ? new cp.BoxShape(body, HEIGHT, WIDTH) : new cp.BoxShape(body, WIDTH, HEIGHT));
		world.addShape(shape);
		shape.setElasticity(0);
		shape.setFriction(0.6);
	};

	world.iterations = 30;
	world.gravity = v(0, -300);
	world.sleepTimeThreshold = 0.5;
	world.collisionSlop = 0.5;
	
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

	
	// Add the dominoes.
	var n = 12;
	for(var i=0; i<n; i++){
		for(var j=0; j<(n - i); j++){
			var offset = v(320 + (j - (n - 1 - i)*0.5)*1.5*HEIGHT, (i + 0.5)*(HEIGHT + 2*WIDTH) - WIDTH);
			add_domino(offset, false);
			add_domino(cp.v.add(offset, v(0, (HEIGHT + WIDTH)/2)), true);
			
			if(j === 0){
				add_domino(cp.v.add(offset, v(0.5*(WIDTH - HEIGHT), HEIGHT + WIDTH)), false);
			}
			
			if(j != n - i - 1){
				add_domino(cp.v.add(offset, v(HEIGHT*0.75, (HEIGHT + 3*WIDTH)/2)), true);
			} else {
				add_domino(cp.v.add(offset, v(0.5*(HEIGHT - WIDTH), HEIGHT + WIDTH)), false);
			}
		}
	}

	// Add a circle to knock the dominoes down
	/*
	var body = world.addBody(new cp.Body(2, cp.momentForCircle(2, 0, 5, v(0,0))));
	body.setPos(v(65, 100));
	var shape = world.addShape(new cp.CircleShape(body, 5, v(0,0)));
	shape.setElasticity(0);
	*/
};

