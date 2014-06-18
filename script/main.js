Zepto(function($) {
   
    // These guys change the amount we move by
    var panStep = 30;
    var scaleStep = 1.03;
    
    var stage = {};
    var triangle = {};
    var midPoint = {};
    
    // Parse an rgb(x, x, x) colour into #xxxxxx
    function rgb2hex(rgb) {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        function hex(num) {
            return ("0" + parseInt(num).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
    
    function init() {
    	// Ratio of side to height of an equilateral triangle
	    var ratio = Math.sqrt(3) / 2;       
        var explorer = $("#explorer");    
    	var colour = rgb2hex(explorer.css('color'));
		var canvas = explorer[0];
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;   

        var width, height, x, y;

        // Determine biggest equilateral triangle to fit on screen
        if (ratio * canvas.width < canvas.height) {
            // Triangle takes up entire width    
            width = canvas.width;
            height = ratio * canvas.width;
            x = 0;
            y = canvas.height - height;
        } else {
            // Triangle takes up entire height
            width = canvas.height / ratio;
            height = canvas.height;
            x = canvas.width / 2 - width / 2;
            y = 0;           
        }

        // Our initial triangle points
        var p1 = { x: x, y: canvas.height };
        var p2 = { x: canvas.width / 2, y: y };
        var p3 = { x: x + width, y: canvas.height };    

        stage = new createjs.Stage(canvas);
        triangle = new sierpinski(p1, p2, p3, { colour: colour });
        midPoint = { x: canvas.width / 2, y: canvas.height / 2 };
        
        render();
    }
        
    function render() {
        var shape = triangle.render(stage);
        stage.addChild(shape);
        stage.update();
        stage.removeChild(shape);
    }
    
    // User interactions
    $(window).resize(function() {
        init();
    });

    $("#left").on("click", function() {
        triangle.move({ x: panStep, y: 0 });
        render();
    });
    
    $("#right").on("click", function() {
        triangle.move({ x: -panStep, y: 0 });
        render();
    });
    
    $("#up").on("click", function() {
        triangle.move({ x: 0, y: panStep });
        render();
    });
    
    $("#down").on("click", function() {
        triangle.move({ x: 0, y: -panStep });
        render();
    });
    
    $("#in").on("click", function() {
        triangle.scale(midPoint, scaleStep);
        render();
    });
    
    $("#out").on("click", function() {
        triangle.scale(midPoint, 1 / scaleStep);
        render();
    });
    
    $("#reset").on("click", function() {
        init();
    });
    
    $("#explorer").on("mousewheel DOMMouseScroll", function(e) {
        var origin = { x: e.layerX, y: e.layerY };
        var factor = (e.wheelDelta || -e.detail) > 0 ? scaleStep : 1 / scaleStep;
        triangle.scale(origin, factor);
        render();	
    });
    
    $("#explorer").on("mousedown", function(e) {
        // Store origin so we have a point to calculate offset
        var origin = { x: e.layerX, y: e.layerY };
        
        function move(e) {
            var offset = { x: e.layerX - origin.x, y: e.layerY - origin.y };
            triangle.move(offset);
            render();
            
            // Update origin, otherwise the move becomes exponential :)
            origin = { x: e.layerX, y: e.layerY };
        }
        
        $("#explorer").on("mousemove", move);
        
        // Remove mousemove event handler when mouse is released
        $("#explorer").on("mouseup", function() {
	        $("#explorer").off("mousemove", move);        
        });
    });        

    // Let's go!
    init();
})