// Sierpinski triangle object
// Rob Moran 17/06/2014

// The triangle points work like this:
//
//            /\
//           /p2\
//          /    \
//         /______\
//        /\n1  n2/\
//       /  \    /  \
//      /    \n3/    \
//     /p1____\/____p3\
  
// Main 'constructor'
sierpinski = function(x, y, width, height, opts) {

    // Our initial triangle points
    this.p1 = { x: x, y: y + height };
    this.p2 = { x: x + (width >> 1), y: y };
    this.p3 = { x: x + width, y: y + height };

    // Default options
    this.options = {
        colour: "#f00",
        quality: 5 // Lower is better/slower
    };

    // Merge options
    if (opts) {
        for (var item in opts) {
            if (this.options[item]) {
                this.options[item] = opts[item];
            }
        }
    }
};

// Function to translate the triangle points for panning
sierpinski.prototype.move = function(offset) {

    function translate(point) {
        return {
            x: point.x + offset.x,
            y: point.y + offset.y
      	};
    }

    this.p1 = translate(this.p1);
    this.p2 = translate(this.p2);
    this.p3 = translate(this.p3);
};

// Function to translate the triangle points for zooming
sierpinski.prototype.scale = function(origin, factor) {

    // Shape dilation
    function translate(point) {
        return {
            x: ((point.x - origin.x) * factor) + origin.x ,
            y: ((point.y - origin.y) * factor) + origin.y
        };
    }

    this.p1 = translate(this.p1);
    this.p2 = translate(this.p2);
    this.p3 = translate(this.p3);
};

// The main render function
sierpinski.prototype.render = function(context) {

    // Some context variables
    var canvas = context.canvas;
    var quality = this.options.quality;

    // Builds a triangle object from 3 co-ordinates and includes the 3 mid points
    function createTriangle(p1, p2, p3) {

        // Midpoint between 2 other points
        function midpoint(p1, p2) {
            return {
                x: (p1.x + p2.x) / 2,
                y: (p1.y + p2.y) / 2
            };
        }

        return {
            p1: p1,
            p2: p2,
            p3: p3,
            n1: midpoint(p1, p2),
            n2: midpoint(p2, p3),
            n3: midpoint(p3, p1),
            x: p1.x,
            y: p2.y,
            width: Math.abs(p3.x - p1.x),
            height: Math.abs(p1.y - p2.y)
        };
    }

    // Function to determine whether a triangle is visible
    function visible(triangle, bounds) {
        if (triangle.x > bounds.width
            || triangle.y > bounds.height
            || triangle.x + triangle.width < 0
            || triangle.y + triangle.height < 0)
        {
            return false;
        }

        return true;
    }

    // Plot a triangle path
    function plot(context, p1, p2, p3) {
        context.moveTo(p1.x, p1.y);
        context.lineTo(p2.x, p2.y);
        context.lineTo(p3.x, p3.y);
        context.lineTo(p1.x, p1.y);
    }

    // Recursion
    function recurse(context, triangle) {

        // Stop if the triangle is too small
        if (triangle.width < quality) {
            return;
        }

        // Stop if the triangle is off screen
        if (!visible(triangle, canvas)) {
            return;
        }

        // Remove inner triangle by plotting the path counter-clockwise
        plot(context, triangle.n1, triangle.n3, triangle.n2);

        // Create 3 smaller triangles from the larger one
        var t1 = createTriangle(triangle.p1, triangle.n1, triangle.n3);
        var t2 = createTriangle(triangle.n1, triangle.p2, triangle.n2);
        var t3 = createTriangle(triangle.n3, triangle.n2, triangle.p3);

        // Recurse the new triangles
        recurse(context, t1);
        recurse(context, t2);
        recurse(context, t3);
    }

    // Create initial triangle object
    var triangle = createTriangle(this.p1, this.p2, this.p3);

    // Start the path and colour the main triangle
    context.beginPath();
    context.fillStyle = this.options.colour;

    // Draw the outer triangle by plotting the path clockwise
    plot(context, triangle.p1, triangle.p2, triangle.p3);

    // Begin recursion
    recurse(context, triangle);

    // Complete the path
    context.fill();
};