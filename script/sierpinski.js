// Sierpinski triangle renderer
// Rob Moran 17/06/2014

// The triangle points work like this

        //\\
       //p2\\ 
      //    \\  
     //______\\
    //\n1  n2/\\
   //  \    /  \\
  //    \n3/    \\
 //p1    \/    p3\\
//================\\

// Main 'constructor'
sierpinski = function(p1, p2, p3, opts) {
   
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    
    // Default options
    this.options = {
        colour: "#0000FF",
        minimumSize: 5
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
}

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
}

// The main render function
sierpinski.prototype.render = function(stage) {
    
    // Some context variables
    var canvas = stage.canvas;
    var minimumSize = this.options.minimumSize;

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
       
    // Draw the outer triangle by plotting the path counter-clockwise
    function draw(context, triangle) {   
        context.moveTo(triangle.p1.x, triangle.p1.y);
        context.lineTo(triangle.p2.x, triangle.p2.y);
        context.lineTo(triangle.p3.x, triangle.p3.y);
        context.lineTo(triangle.p1.x, triangle.p1.y);
    }
    
    // Remove the inner triangle by plotting the path clockwise
    function remove(context, triangle) {
    	context.moveTo(triangle.n1.x, triangle.n1.y);
    	context.lineTo(triangle.n3.x, triangle.n3.y);
    	context.lineTo(triangle.n2.x, triangle.n2.y);
    	context.lineTo(triangle.n1.x, triangle.n1.y);
    }
    
    function recurse(context, triangle, needsBackground) {
        
        // Stop if the triangle is too small
        if (triangle.width < minimumSize) {
            return;
        }

        // Stop if the triangle is off screen
        if (triangle.x > canvas.width
            || triangle.y > canvas.height
            || triangle.x + triangle.width < 0
            || triangle.y + triangle.height < 0)
        {
            return;
        }
        
        // Create 3 smaller triangles from larger one
        var t1 = createTriangle(triangle.p1, triangle.n1, triangle.n3);
        var t2 = createTriangle(triangle.n1, triangle.p2, triangle.n2);
        var t3 = createTriangle(triangle.n3, triangle.n2, triangle.p3);
        
        if (needsBackground) {
              /*      if (
                        ((t1.x-t1.width > 0 && t1.x < canvas.width)
                    && (t1.y-t1.height > 0 && t1.y < canvas.height))
                        ||
                                               ((t2.x-t2.width > 0 && t2.x < canvas.width)
                    && (t2.y-t2.height > 0 && t2.y < canvas.height))
                        ||
                                               ((t3.x-t3.width > 0 && t3.x < canvas.width)
                    && (t3.y-t3.height > 0 && t3.y < canvas.height))
                    ){*/
       //     || t1.x + triangle.width < 0
         //   || t1.y + triangle.height < 0)
   
            draw(context, triangle);
            needsBackground = false;
                  //  }
        }

        // Remove inner triangle
        remove(context, triangle);
        
        // Recurse the new triangles
        recurse(context, t1, needsBackground);
        recurse(context, t2, needsBackground);
        recurse(context, t3, needsBackground);
    }
    
    // Our easel shape
    var shape = new createjs.Shape();
    
    // Colour the shape
    shape.graphics.beginFill(this.options.colour);     
    
    // Create initial triangle object
	var triangle = createTriangle(this.p1, this.p2, this.p3);
    
    // Begin recursion
    recurse(shape.graphics, triangle, true);
    
    // Return the completed shape
    return shape;
}
        

        
