Zepto(function($) {

    // These guys change the amount we move by
    var panStep = 30;
    var scaleStep = 1.1;

    var context = {};
    var midPoint = {};
    var triangles = [];

    // Extend the triangle array instance with a function to act on all items
    triangles.each = function() {
        // Turn the passed arguments list into a proper array
        var args = [].slice.call(arguments);

        // Grab the function to call, arguments will be everything else
        var fn = args.shift();

        $.each(this, function(i, triangle){
            triangle[fn].apply(this, args);
        });
    };

    // Parse an rgb(x, x, x) colour into hex #xxxxxx
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

        // Full screen
        var stageWidth = window.innerWidth;
        var stageHeight = window.innerHeight;

        // Get the css colour for the main triangle
        var explorer = $("#explorer");
        var colour = rgb2hex(explorer.css('color'));

        // Setup the canvas
        var canvas = explorer[0];
        canvas.width = stageWidth;
        canvas.height = stageHeight;
        context = canvas.getContext("2d");
        midPoint = { x: stageWidth >> 1, y: stageHeight >> 1 };

        var x, y, width, height;

        // Determine biggest equilateral triangle to fit on screen
        if (ratio * stageWidth < stageHeight) {
            // Triangle takes up entire width    
            width = stageWidth;
            height = ratio * stageWidth;
            x = 0;
            y = stageHeight - height;
        } else {
            // Triangle takes up entire height
            width = stageHeight / ratio;
            height = stageHeight;
            x = (stageWidth - width) >> 1;
            y = 0;           
        }

        // Empty the triangle array
        triangles.length = 0;

        // Add our main triangle
        triangles.push(new sierpinski(x, y, width, height, { colour: colour }));

        // Add another smaller one, just for fun
        triangles.push(new sierpinski(x, y, width >> 2, height >> 2));

        render();
    }

    function render() {
        context.clearRect (0, 0, context.canvas.width, context.canvas.height);
        triangles.each("render", context);
    }

    // User interactions
    $(window).resize(function() {
        init();
    });

    $(window).on("mousewheel DOMMouseScroll", function(e) {
        var origin = { x: e.clientX, y: e.clientY };
        var factor = (e.wheelDelta || -e.detail) > 0 ? scaleStep : 1 / scaleStep;

        triangles.each("scale", origin, factor);
        render();
    });

    $(window).on("mousedown", function(e) {
        // Store origin so we have a point to calculate offset
        var origin = { x: e.clientX, y: e.clientY };

        function move(e) {
            var offset = { x: e.clientX - origin.x, y: e.clientY - origin.y };
            triangles.each("move", offset);
            render();

            // Update origin, otherwise the move becomes exponential :)
            origin = { x: e.clientX, y: e.clientY };
        }

        $(window).on("mousemove", move);

        // Remove mousemove event handler when mouse is released
        $(window).on("mouseup", function() {
            $(window).off("mousemove", move);
        });
    });

    $("#left").on("click", function() {
        triangles.each("move", { x: panStep, y: 0 });
        render();
    });

    $("#right").on("click", function() {
        triangles.each("move", { x: -panStep, y: 0 });
        render();
    });

    $("#up").on("click", function() {
        triangles.each("move", { x: 0, y: panStep });
        render();
    });

    $("#down").on("click", function() {
        triangles.each("move", { x: 0, y: -panStep });
        render();
    });

    $("#in").on("click", function() {
        triangles.each("scale", midPoint, scaleStep);
        render();
    });

    $("#out").on("click", function() {
        triangles.each("scale", midPoint, 1 / scaleStep);
        render();
    });

    $("#reset").on("click", function() {
        init();
    });

    // Let's go!
    init();
});