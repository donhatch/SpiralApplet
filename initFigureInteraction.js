initFigure5Interaction = function(callThisWhenSVGSourceChanges) {

    if (typeof jQuery === "undefined")
    {
        window.alert("Oh no! initFigure5Interaction() called but jQuery hasn't been loaded or something! bailing!");
        return;
    }
    if (!jQuery.isReady)
    {
        // XXX TODO: this may be too strict, maybe call live()?
        window.alert("Hey! initFigure5Interaction() called when document not ready! You need to call this through jQuery.ready()");
        return;
    }

    //
    // complex arithmetic, with a complex number represented as z=[x,y]
    //
    var times = function(z0,z1) {
        if (typeof z0 === "number") return [z0*z1[0], z0*z1[1]]
        if (typeof z1 === "number") return [z0[0]*z1, z0[1]*z1]
        return [z0[0]*z1[0] - z0[1]*z1[1], z0[0]*z1[1] + z0[1]*z1[0]];
    };
    var plus = function(z0,z1) { return [z0[0]+z1[0], z0[1]+z1[1]]; };
    var minus = function(z0,z1) { return [z0[0]-z1[0], z0[1]-z1[1]]; };
    var inverse = function(z) { return scaled(conj(z),1/length2(z)); };
    var dividedby = function(z0,z1) { return times(z0,inverse(z1)); };
    var conj = function(z) { return [z[0], -z[1]]; };
    var cross = function(a,b) { return a[0]*b[1] - a[1]*b[0]; };
    var dot = function(a,b) { return a[0]*b[0] + a[1]*b[1]; };
    var length2 = function(z) { return dot(z, z); };
    var length = function(z) { return Math.sqrt(length2(z)); };
    var dist2 = function(z0,z1) { return length2(minus(z1,z0)); };
    var dist = function(z0,z1) { return Math.sqrt(dist2(z0,z1)); };
    var normalized = function(z) { var l = length(z); return [z[0]/l, z[1]/l]; };
    var perpDot = function(z) { return [-z[1], z[0]]; };
    var scaled = function(z,s) { return [z[0]*s, z[1]*s]; };

    // Very useful function for creating log spirals...
    // a:b :: A:?
    // answer is b/a*A.
    var analogy = function(a,b,A) { return times(dividedby(b,a),A); };

    var makeThePaths = function(d0,d1,d2, nNeighbors)
    {
        // work mostly in a space in which d0 is at the origin
        d1 = minus(d1, d0);
        d2 = minus(d2, d0);

        var p0 = [cross(d1,d2),dot(d1,d2)]
        var p1 = [0,1]
        var p2 = analogy(p0,p1,p1)
        var qLength = length(minus(p1,p0)); // make quill same length as primal edge, seems to look fairly decent
        var q0 = plus(p1,times(normalized(perpDot(minus(d1,d2))),qLength));


        var dudleyMainPath = "M 0 0 L "+d1[0]+" "+d1[1]+" L "+d2[0]+" "+d2[1]+" L 0 0";

        // scratch
        var z;
        var Z;
        var temp;

        var dudleyNeighborsPath = "";
        {
            z = d1;
            Z = d2;
            for (var iNeighbor = 0; iNeighbor < nNeighbors; ++iNeighbor)
            {
                temp = analogy(z,Z,Z);
                z = Z;
                Z = temp;
                dudleyNeighborsPath += " M "+z[0]+" "+z[1]+" L "+Z[0]+" "+Z[1]+" L 0 0"
            }
            z = d1;
            Z = d2;
            for (var iNeighbor = 0; iNeighbor < nNeighbors; ++iNeighbor)
            {
                temp = analogy(Z,z,z);
                Z = z;
                z = temp;
                dudleyNeighborsPath += " M "+Z[0]+" "+Z[1]+" L "+z[0]+" "+z[1]+" L 0 0"
            }
        }


        var priscillaMainPath = "M "+p0[0]+" "+p0[1]+" L "+p1[0]+" "+p1[1]+" L "+p2[0]+" "+p2[1]+" M "+p1[0]+" "+p1[1]+" L "+q0[0]+" "+q0[1];
        var priscillaNeighborsPath = "";
        if (1)
        {
            z = p1;
            Z = p2;
            for (var iNeighbor = 0; iNeighbor < nNeighbors; ++iNeighbor)
            {
                temp = analogy(z,Z,Z);
                z = Z;
                Z = temp;
                q = analogy(p1,q0,z);
                priscillaNeighborsPath += " M "+Z[0]+" "+Z[1]+" L "+z[0]+" "+z[1]+" L "+q[0]+" "+q[1]
            }
            z = p0;
            Z = p1;
            for (var iNeighbor = 0; iNeighbor < nNeighbors; ++iNeighbor)
            {
                temp = analogy(Z,z,z);
                Z = z;
                z = temp;
                q = analogy(p1,q0,Z);
                priscillaNeighborsPath += " M "+q[0]+" "+q[1]+" L "+Z[0]+" "+Z[1]+" L "+z[0]+" "+z[1]
            }
        }
        if (priscillaNeighborsPath === "")
        {
            priscillaNeighborsPath = "M 0 0";
        }
        if (dudleyNeighborsPath === "")
        {
            dudleyNeighborsPath = "M 0 0";
        }

        // note, we do the line from origin to _x_d_ even though it's redundant with the one from ^x_d^, for in case it gets dragged so that's not true
        var otherStuffPath = "M 0 0 L "+d2[0]+" 0 L "+d2[0]+" "+d2[1]+" M 0 0 L "+d1[0]+" 0 L "+d1[0]+" "+d1[1]+"";

        return [dudleyMainPath,
                dudleyNeighborsPath,
                priscillaMainPath,
                priscillaNeighborsPath,
                otherStuffPath,
                d1,d2];
    } // makeThePaths

    var recomputeSVG = function(M,d0,d1,d2,nNeighbors) {
        console.log("    recomputing svg");

        var paths = makeThePaths(d0,d1,d2, nNeighbors);


        global_dudleyMainPath.attr('d', paths[0]);
        global_dudleyNeighborsPath.attr('d', paths[1]);
        global_priscillaMainPath.attr('d', paths[2]);
        global_priscillaNeighborsPath.attr('d', paths[3]);
        global_otherStuffPath.attr('d', paths[4]);
        var d0 = paths[5];
        var d1 = paths[6];
        global_d1transform.attr('transform', 'translate('+d0[0]+','+d0[1]+')');
        global_d2transform.attr('transform', 'translate('+d1[0]+','+d1[1]+')');
        global_xd1transform.attr('transform', 'translate('+d0[0]+',0)');
        global_xd2transform.attr('transform', 'translate('+d1[0]+',0)');
        global_undoScales.attr('transform', 'scale('+1./M[0][0]+','+1./M[1][1]+')');
        //console.log("    done recomputing svg");
    };

    // http://net.tutsplus.com/tutorials/javascript-ajax/quick-tip-quick-and-easy-javascript-testing-with-assert/
    var assert = function(condition, description) {
        if (!condition)
        {
            // throw to get a stack trace
            try {
                throw Error();
            }
            catch(e)
            {
                var stackLines = e.stack.split('\n');
                var theStackLine = jQuery.trim(stackLines[3]);
                theStackLine = theStackLine.replace(/at HTMLDocument\..anonymous. \((.*)\)$/, '$1');
                theStackLine = theStackLine.replace(/.*\//, ''); // get rid of all but trailing component of file name
                theStackLine = theStackLine.replace(/:\d+$/, ''); // don't need the char position
                var text = theStackLine;
                if (description !== undefined)
                {
                    text += ": "+description;
                }

                // if there's a list called "assertOutputList", then append to it...
                var assertOutputList = document.getElementById('assertOutputList');
                if (assertOutputList !== null)
                {
                    var li = document.createElement('li');  
                    li.className = 'assertFail';  
                    text = "ASSERT FAIL: " + text; // TODO: color:red;font-weight:bold  
                    li.appendChild(document.createTextNode(text));
                    assertOutputList.appendChild(li);  
                }
                else
                {
                    window.alert("Oh no! Assertion failed! "+text);
                }
            }
        }
    }; // assert

    // jQuery(s), throwing an error if the result
    // has length other than 1.
    var findExpectingOneThing = function(node,query) {
        var answer = node.find(query);
        assert(answer.length === 1, "got "+answer.length+" results from node.find('"+query+"'), expected 1");
        return answer;
    };

    // global constants (just a cache)
    var theSVG = jQuery('#figure5');
    assert(theSVG.length === 1, "oh no! "+theSVG.length+" results matching #figure5?");
    global_theGraphic = findExpectingOneThing(theSVG, '.theGraphic');
    global_dudleyMainPath = findExpectingOneThing(theSVG, '.dudleyMainPath');
    global_dudleyNeighborsPath = findExpectingOneThing(theSVG, '.dudleyNeighborsPath');
    global_priscillaMainPath = findExpectingOneThing(theSVG, '.priscillaMainPath');
    global_priscillaNeighborsPath = findExpectingOneThing(theSVG, '.priscillaNeighborsPath');
    global_otherStuffPath = findExpectingOneThing(theSVG, '.otherStuffPath');
    global_d1transform = findExpectingOneThing(theSVG, '.d1transform');
    global_d2transform = findExpectingOneThing(theSVG, '.d2transform');
    global_xd1transform = findExpectingOneThing(theSVG, '.xd1transform');
    global_xd2transform = findExpectingOneThing(theSVG, '.xd2transform');
    global_undoScales = theSVG.find('.undoScaleForSvgText'); // lots of these!
    //console.log('scales = ',global_undoScales);

    if (false)
    {
        // This was the bootstrapping way...
        global_p = [0,1];
        global_d0 = [0,0];
        global_d1 = [6,2];
        global_d2 = [8,6];
        global_nNeighbors = 1;
    }
    else
    {
        // these days we get it from the existing svg transform elements
        global_p = [0,1];
        global_d0 = [0,0]; // still not used
        var scratch = global_d1transform.attr('transform')
        // 'translate(0,0)'
        global_d1 = [Number(scratch.replace(/^.*\(/, '').replace(/,.*$/, '')),
                     Number(scratch.replace(/^.*\,/, '').replace(/\).*$/, ''))]
        scratch = global_d2transform.attr('transform')
        global_d2 = [Number(scratch.replace(/^.*\(/, '').replace(/,.*$/, '')),
                     Number(scratch.replace(/^.*\,/, '').replace(/\).*$/, ''))]
        console.log('d1 = '+global_d1);
        console.log('d2 = '+global_d2);

        // really hacky way to deduce nNeighbors--
        // figure it out from the size of the neighborsPaths.
        var pTemp = jQuery.trim(global_priscillaNeighborsPath.attr('d')).split(/ +/).length;
        var dTemp = jQuery.trim(global_dudleyNeighborsPath.attr('d')).split(/ +/).length;
        //console.log('length of d neighbors path = '+pTemp);
        //console.log('length of p neighbors path = '+dTemp);
        assert(pTemp === dTemp, "priscillaNeighborsPath and dudleyNeighborsPath have different numbers of tokens! "+pTemp+" vs "+dTemp+"");
        assert(pTemp % 18 === 0, "neighbors path length "+pTemp+" is not a multiple of 18!");
        global_nNeighbors = pTemp / 18;
    }

    {
        // rescale d1 and d2 so that length of d2 is 1
        var rescale = 1./dist(global_d0, global_d2);
        global_d2 = plus(global_d0,times(minus(global_d2,global_d0), rescale));
        global_d1 = plus(global_d0,times(minus(global_d1,global_d0), rescale));
        rescale = undefined;
    }

    // this was the old bootstrapping way...
    // these days, these get clobbered by values extracted from the svg.
    var xTrans = 250;
    var yTrans = 320;
    var xScale = 200;
    var yScale = -200;
    if (true)
    {
        // extract the top-level graphic's translation and scale.
        // the attr looks like:
        //     transform="translate(250,320) scale(200,-200)"
        var scratch = global_theGraphic.attr('transform');
        var match = scratch.match(/^translate\((.*),(.*)\) scale\((.*),(.*)\)$/);
        xTrans = Number(match[1]);
        yTrans = Number(match[2]);
        xScale = Number(match[3]);
        yScale = Number(match[4]);
        
        scratch = undefined;
        match = undefined;
    }


    var localToScreenMatrix = [
        [xScale,    undefined, undefined],
        [undefined, yScale,    undefined],
        [xTrans,    yTrans,    undefined],
    ];

    // do it the first time
    recomputeSVG(localToScreenMatrix, global_d0, global_d1, global_d2, global_nNeighbors);

    var localToScreen = function(localXY) {
        var x = localXY[0];
        var y = localXY[1];
        var M = localToScreenMatrix;
        return [x*M[0][0]+M[2][0],
                y*M[1][1]+M[2][1]];
    };
    var screenToLocal = function(screenXY) {
        var x = screenXY[0];
        var y = screenXY[1];
        var M = localToScreenMatrix;
        return [(x-M[2][0])/M[0][0],
                (y-M[2][1])/M[1][1]];
    };

    var pickClosestThingIndex = function(screenXY,threshold) {
        var debug = false; // manually set this to true to debug
        var threshold2 = threshold*threshold;
        var things = [
            localToScreen(global_d0),
            localToScreen(global_d1),
            localToScreen(global_d2),
            localToScreen(global_p),
            localToScreen(analogy(global_d2,global_d1,global_d1)), // first CW neighbor
            localToScreen(analogy(global_d1,global_d2,global_d2)), // first CCW neighbor
        ];
        if (debug)
        {
            console.log("    in pickClosestThing");
            console.log("            things = "+things);
            console.log("            screenXY = "+screenXY);
        }
        var bestDist2;
        var bestIndex = -1;
        var thisDist2;
        for (var i = 0; i < things.length; ++i)
        {
            thisDist2 = dist2(screenXY, things[i]);
            if (debug)
            {
                console.log("        things["+i+"] = "+things[i]);
                console.log("            thisDist = "+Math.sqrt(thisDist2));
            }
            if (thisDist2 <= threshold2
             && (bestIndex==-1 || thisDist2 < bestDist2))
            {
                bestDist2 = thisDist2;
                bestIndex = i;
                if (debug)
                {
                    console.log("                updated closest index to "+i);
                }
            }
            else
            {
                if (debug)
                {
                    console.log("                (didn't update closest)");
                }
            }
        }
        if (debug)
        {
            console.log("    in pickClosestThing, returning "+bestIndex);
        }
        return bestIndex;
    };


    callThisWhenSVGSourceChanges();

    var threshold = 10;
    var dragging = false;
    var indexOfThingBeingDragged = false;
    var nTimesMouseMoveCalled = 0;
    var prevX=undefined, prevY=undefined;;
    theSVG.mousedown(function(e) {
        //console.log("mouse down: ",e);


        if (true)
        {
            // trying to figure out x,y wrt the figure
            console.log("in mouse down:",e);
        }






        dragging = true;

        indexOfThingBeingDragged = pickClosestThingIndex([e.offsetX,e.offsetY],threshold);
        console.log("dragging thing with index = "+indexOfThingBeingDragged);

        // XXX HACKY obscure way to change nNeighbors!
        if (indexOfThingBeingDragged === 4)
        {
            if (global_nNeighbors > 1)
            {
                global_nNeighbors--;
            }
        }
        else if (indexOfThingBeingDragged === 5)
        {
            global_nNeighbors++;
        }

        recomputeSVG(localToScreenMatrix, global_d0, global_d1, global_d2, global_nNeighbors);

        prevX = e.offsetX;
        prevY = e.offsetY;
    });
    theSVG.mouseup(function(e) {
        //console.log("mouse up: ",e);
        dragging = false;
        prevX = e.offsetX;
        prevY = e.offsetY;
        callThisWhenSVGSourceChanges();
    });
    theSVG.mousemove(function(e) {
        // wtf? on chrome, this keeps firing every 1 second
        // when in window, even if mouse not moving??
        // what a waste!

        if (e.offsetX === prevX && e.offsetY === prevY)
        {
            //console.log("WTF? didn't really move?");
            return;
        }
        //console.log(""+nTimesMouseMoveCalled+" mouse move: buttons="+e.buttons+" button="+e.button);
        nTimesMouseMoveCalled++;

        //console.log("    dragging = "+dragging);
        if (dragging)
        {
            var localXY = screenToLocal([e.offsetX,e.offsetY]);
            if (indexOfThingBeingDragged === 0) // d0
            {
                // XXX doesn't work yet
                global_d1 = localXY + minus(global_d1,global_d0);
                global_d2 = localXY + minus(global_d2,global_d0);
                global_p  = localXY + minus(global_p,global_d0);
                global_d0 = localXY;
            }
            else if (indexOfThingBeingDragged === 1) // d1
            {
                global_d1 = localXY;
                console.log("d1 changed to "+global_d1);
            }
            else if (indexOfThingBeingDragged === 2) // d2
            {
                global_d2 = normalized(localXY);
                console.log("d2 changed to "+global_d2);
            }
            else if (indexOfThingBeingDragged === 3) // p
            {
            }
            else if (indexOfThingBeingDragged === 4) // CW neighbor
            {
                // nothing-- already did it on mouse down
            }
            else if (indexOfThingBeingDragged === 5) // CCW neighbor
            {
                // nothing-- already did it on mouse down
            }

            recomputeSVG(localToScreenMatrix, global_d0, global_d1, global_d2, global_nNeighbors);
        }
        prevX = e.offsetX;
        prevY = e.offsetY;
    });
}; // initFigure5Interaction
