initFigureInteraction = function(theDiv, p, d0, d1, nNeighbors,
                                 showDottedLines,
                                 showArcs,
                                 showDhatStuff,
                                 callThisWhenSVGSourceChanges) {

    if (typeof jQuery === "undefined")
    {
        window.alert("Oh no! initFigureInteraction() called but jQuery hasn't been loaded or something! bailing!");
        return;
    }
    if (!jQuery.isReady)
    {
        // XXX TODO: this may be too strict, maybe call live()?
        window.alert("Hey! initFigureInteraction() called when document not ready! You need to call this through jQuery.ready()");
        return;
    }


    //
    // complex arithmetic, with a complex number represented as z=[x,y]
    //
    var times = function(z0,z1) {
        if (typeof z0 === "number") return [z0*z1[0], z0*z1[1]];
        if (typeof z1 === "number") return [z0[0]*z1, z0[1]*z1];
        return [z0[0]*z1[0] - z0[1]*z1[1], z0[0]*z1[1] + z0[1]*z1[0]];
    };
    var inverse = function(z) {
        if (typeof z === "number") return 1./z;
        return scaled(conj(z),1/length2(z));
    };
    var plus = function(z0,z1) { return [z0[0]+z1[0], z0[1]+z1[1]]; };
    var minus = function(z0,z1) { return [z0[0]-z1[0], z0[1]-z1[1]]; };
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

    // Very useful function for creating log spirals and things...
    // a:b :: A:?
    // answer is b/a*A.
    var analogy = function(a,b,A) { return times(dividedby(b,a),A); };
    var nextInLogSpiral = function(a,b) { return analogy(a,b,b); }



    var makeThePaths = function(p,d0,d1, nNeighbors)
    {
        if (true)
        {
            // solve:
            //     analogy(d1,d0,[1,0]) dot <x,y> = 0
            //     (<0,1>-<x,y>) dot d0 = 0
            //         => <x,y> dot d0 = <0,1> dot d0
            // it's a straightforward system of linear equations,
            // but it simplifies (worked this out on paper):
            var temp = analogy(d1,d0,[0,1])
            var p0 = times(temp,d0[1]/dot(temp,d0));
            // woops, but that was assuming p=<0,1>.
            // now do it for general p=<0,yp>.
            p0 = times(p0, length(p));

            var p1 = p;
            var p2 = analogy(p0,p1,p1)
        }
        if (true)
        {
            //console.log("dot(p0,analogy(d1,d0,[1,0])) = ", dot(p0,analogy(d1,d0,[1,0])));
            //console.log("dot(minus(p,p0),d0) = ", dot(minus([0,1],p0),d0));
            assert(Math.abs(dot(minus(p0,p0),d0)) < 1e-6);
            assert(Math.abs(dot(p0,analogy(d1,d0,[1,0]))) < 1e-6);
        }

        var qLength = length(minus(p1,p0)); // make quill same length as primal edge, seems to look fairly decent
        var q0 = plus(p1,times(normalized(perpDot(minus(d0,d1))),qLength));


        var dudleyMainPath = "M 0 0 L "+d0[0]+" "+d0[1]+" L "+d1[0]+" "+d1[1]+" L 0 0";

        // scratch
        var z;
        var Z;
        var temp;

        var dudleyNeighborsPath = "";
        {
            z = d0;
            Z = d1;
            for (var iNeighbor = 0; iNeighbor < nNeighbors; ++iNeighbor)
            {
                temp = analogy(z,Z,Z);
                z = Z;
                Z = temp;
                dudleyNeighborsPath += " M "+z[0]+" "+z[1]+" L "+Z[0]+" "+Z[1]+" L 0 0"
            }
            z = d0;
            Z = d1;
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
                var q = analogy(p1,q0,z);
                priscillaNeighborsPath += " M "+Z[0]+" "+Z[1]+" L "+z[0]+" "+z[1]+" L "+q[0]+" "+q[1]
            }
            z = p0;
            Z = p1;
            for (var iNeighbor = 0; iNeighbor < nNeighbors; ++iNeighbor)
            {
                temp = analogy(Z,z,z);
                Z = z;
                z = temp;
                var q = analogy(p1,q0,Z);
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

        var theta1 = Math.atan2(d0[1],d0[0]);
        var m1maxRadius = length(p)*length2(d0)*Math.sin(2*theta1)/4.;
        var theta2 = Math.atan2(d1[1],d1[0]);
        var m2maxRadius = length(p)*length2(d1)*Math.sin(2*theta2)/4.;

        // <path class="m1arc" vector-effect="non-scaling-stroke" style="stroke:#f0f0f0; stroke-width:2; fill: none; stroke-opacity:1" d="M 0 0 L 1.414 1.414  A1,1 0 0,1 0,1 L 0 0"></path>
        var m1arcStart = times(d0, m1maxRadius/length(d0));
        var m1arcPath = "M 0 0 L "+m1arcStart[0]+" "+m1arcStart[1]+" A"+m1maxRadius+","+m1maxRadius+" 0 0,1 0,"+m1maxRadius+" L 0 0";
        var m2arcStart = times(d1, m2maxRadius/length(d1));
        var m2arcPath = "M 0 0 L "+m2arcStart[0]+" "+m2arcStart[1]+" A"+m2maxRadius+","+m2maxRadius+" 0 0,1 0,"+m2maxRadius+" L 0 0";

        var deltam = times(p,cross(d0,d1)*.5)
        var m3arcPath = "M "+deltam[0]+" "+deltam[1]+" L "+(m1arcStart[0]+deltam[0])+" "+(m1arcStart[1]+deltam[1])+" A"+m1maxRadius+","+m1maxRadius+" 0 0,1 "+(0+deltam[0])+","+(m1maxRadius+deltam[1])+" L "+deltam[0]+" "+deltam[1]+"";


        var dhat = [d0[0], d1[1] - d0[1]*(d1[0]-d0[0])/(d0[0]==0?1:d0[0])]

        // note, we do the line from origin to _x_d_ even though it's redundant with the one from ^x_d^, for in case it gets dragged so that's not true
        var orthoDottedPath = ("M 0 0 L "+d1[0]+" 0 L "+d1[0]+" "+d1[1]
                                       +" M 0 0 L "+d0[0]+" 0 L "+d0[0]+" "+d0[1]);
        var dhatDottedPath = "M "+d1[0]+" "+d1[1]+" L "+dhat[0]+" "+dhat[1]
        var dhatSolidPath = "M "+d0[0]+" "+d0[1]+" L "+dhat[0]+" "+dhat[1]+" 0 0";

        return [dudleyMainPath,
                dudleyNeighborsPath,
                priscillaMainPath,
                priscillaNeighborsPath,
                orthoDottedPath,
                dhatDottedPath,
                dhatSolidPath,
                d0,d1,dhat,
                m1arcPath,
                m2arcPath,
                m3arcPath];
    } // makeThePaths

    var recomputeSVG = function(M,p,d0,d1,nNeighbors,callThisWhenSVGSourceChanges) {
        console.log("    recomputing svg");

        var paths = makeThePaths(p,d0,d1, nNeighbors);


        dudleyMainPath.attr('d', paths[0]);
        dudleyNeighborsPath.attr('d', paths[1]);
        priscillaMainPath.attr('d', paths[2]);
        priscillaNeighborsPath.attr('d', paths[3]);
        orthoDottedPath.attr('d', paths[4]);
        dhatDottedPath.attr('d', paths[5]);
        dhatSolidPath.attr('d', paths[6]);
        var d0 = paths[7];
        var d1 = paths[8];
        var dhat = paths[9];
        ptransform.attr('transform', 'translate('+p[0]+','+p[1]+')');
        d0transform.attr('transform', 'translate('+d0[0]+','+d0[1]+')');
        d1transform.attr('transform', 'translate('+d1[0]+','+d1[1]+')');
        dhattransform.attr('transform', 'translate('+dhat[0]+','+dhat[1]+')');
        xd0transform.attr('transform', 'translate('+d0[0]+',0)');
        xd1transform.attr('transform', 'translate('+d1[0]+',0)');
        var m1arcPath = paths[10];
        var m2arcPath = paths[11];
        var m3arcPath = paths[12];
        m1arc.attr('d', m1arcPath);
        m2arc.attr('d', m2arcPath);
        m3arc.attr('d', m3arcPath);
        undoScales.attr('transform', 'scale('+1./M[0][0]+','+1./M[1][1]+')');

        callThisWhenSVGSourceChanges();

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
                theStackLine = theStackLine.replace(/at .* \(([^ ]*)\)$/, '$1');
                console.log("theStackLine = "+theStackLine);
                theStackLine = theStackLine.replace(/.*\//, ''); // get rid of all but trailing component of file name
                console.log("theStackLine = "+theStackLine);
                theStackLine = theStackLine.replace(/:\d+$/, ''); // don't need the char position
                console.log("theStackLine = "+theStackLine);
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
    // has length other than nExpected.
    var findExpectingNThings = function(node,query,nExpected) {
        var answer = node.find(query);
        assert(answer.length === nExpected, "got "+answer.length+" results from node.find('"+query+"'), expected "+nExpected);
        return answer;
    };
    var findExpectingOneThing = function(node,query) {
        return findExpectingNThings(node, query, 1);
    };

    // global constants (just a cache)
    var theSVG = theDiv.children();
    if (theSVG.length != 1)
    {
        console.log("oh no! "+theSVG.length+" proper descendents of div ",theDiv,", expected 1");
        throw null;
    }
    if (theSVG[0].tagName != 'svg')
    {
        console.log("oh no! the child of div ",theDiv," has tag "+theSVG[0].tagName+", expected 'SVG'");
        throw null;
    }


    console.log("theDiv[0].tagName = "+theDiv[0].tagName);
    assert(theDiv.length === 1 && theDiv[0].tagName == "DIV", "oh no! the SVG has to have a div as a parent! dragging won't work!");
    var theDivsChildren = theDiv.children();
    assert(theDivsChildren.length === 1 && theDiv[0].tagName == "DIV", "oh no! the SVG has siblings! dragging won't work!");

    var theGraphic = findExpectingOneThing(theSVG, '.theGraphic');
    var dudleyMainPath = findExpectingOneThing(theSVG, '.dudleyMainPath');
    var dudleyNeighborsPath = findExpectingOneThing(theSVG, '.dudleyNeighborsPath');
    var priscillaMainPath = findExpectingOneThing(theSVG, '.priscillaMainPath');
    var priscillaNeighborsPath = findExpectingOneThing(theSVG, '.priscillaNeighborsPath');
    var orthoDottedPath = findExpectingOneThing(theSVG, '.orthoDottedPath');
    var dhatDottedPath = findExpectingOneThing(theSVG, '.dhatDottedPath');
    var dhatSolidPath = findExpectingOneThing(theSVG, '.dhatSolidPath');

    var ptransform = findExpectingOneThing(theSVG, '.ptransform');
    var d0transform = findExpectingOneThing(theSVG, '.d0transform');
    var d1transform = findExpectingOneThing(theSVG, '.d1transform');
    var dhattransform = findExpectingOneThing(theSVG, '.dhattransform');
    var xd0transform = findExpectingOneThing(theSVG, '.xd0transform');
    var xd1transform = findExpectingOneThing(theSVG, '.xd1transform');
    var m1arc = findExpectingOneThing(theSVG, '.m1arc');
    var m2arc = findExpectingOneThing(theSVG, '.m2arc');
    var m3arc = findExpectingOneThing(theSVG, '.m3arc');
    var undoScales = theSVG.find('.undoScaleForSvgText'); // lots of these!





    // these may or may not exist on the page... if they don't, we'll have no-ops
    var mouseins_subelementsElement = jQuery("#mouseins_subelements");
    var mouseins_svgElement = jQuery("#mouseins_svg");
    var mouseentersElement = jQuery("#mouseenters");
    var mousemovesElement = jQuery("#mousemoves");
    var mousedownsElement = jQuery("#mousedowns");
    var mousedragsElement = jQuery("#mousedrags");
    var mouseupsElement = jQuery("#mouseups");
    var mouseleavesElement = jQuery("#mouseleaves");
    var mouseouts_svgElement = jQuery("#mouseouts_svg");
    var mouseouts_subelementsElement = jQuery("#mouseouts_subelements");

    var mouseins_subelementsCount = 0;
    var mouseins_svgCount = 0;
    var mouseentersCount = 0;
    var mousemovesCount = 0;
    var mousedownsCount = 0;
    var mousedragsCount = 0;
    var mouseupsCount = 0;
    var mouseleavesCount = 0;
    var mouseouts_svgCount = 0;
    var mouseouts_subelementsCount = 0;

    //console.log('scales = ',undoScales);

    // any values not given as params
    // are extracted from the svg
    if (typeof p == 'undefined')
    {
        var scratch = ptransform.attr('transform');
        p = [Number(scratch.replace(/^.*\(/, '').replace(/,.*$/, '')),
             Number(scratch.replace(/^.*\,/, '').replace(/\).*$/, ''))]
    }
    if (typeof d0 === 'undefined')
    {
        // 'translate(0,0)'
        var scratch = d0transform.attr('transform');
        d0 = [Number(scratch.replace(/^.*\(/, '').replace(/,.*$/, '')),
              Number(scratch.replace(/^.*\,/, '').replace(/\).*$/, ''))]
    }
    if (typeof d1 === 'undefined')
    {
        var scratch = d1transform.attr('transform');
        d1 = [Number(scratch.replace(/^.*\(/, '').replace(/,.*$/, '')),
              Number(scratch.replace(/^.*\,/, '').replace(/\).*$/, ''))]
    }
    if (typeof nNeighbors === 'undefined')
    {
        // really hacky way to deduce nNeighbors--
        // figure it out from the size of the neighborsPaths.
        var pTemp = jQuery.trim(priscillaNeighborsPath.attr('d')).split(/ +/).length;
        var dTemp = jQuery.trim(dudleyNeighborsPath.attr('d')).split(/ +/).length;
        //console.log('length of d neighbors path = '+pTemp);
        //console.log('length of p neighbors path = '+dTemp);
        assert(pTemp === dTemp, "priscillaNeighborsPath and dudleyNeighborsPath have different numbers of tokens! "+pTemp+" vs "+dTemp+"");
        assert(pTemp % 18 === 0, "neighbors path length "+pTemp+" is not a multiple of 18!");
        nNeighbors = pTemp / 18;
    }


    console.log('p = '+p);
    console.log('d0 = '+d0);
    console.log('d1 = '+d1);
    console.log('nNeighbors = '+nNeighbors);

    if (false) // change to true to debug a simple case
    {
        p = [0,1];
        d0 = [Math.sqrt(.5),Math.sqrt(.5)/2];
        d1 = [Math.sqrt(.5),Math.sqrt(.5)];
        nNeighbors = 1;
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
        var scratch = theGraphic.attr('transform');
        var match = scratch.match(/^translate\((.*),(.*)\) scale\((.*),(.*)\)$/);
        xTrans = Number(match[1]);
        yTrans = Number(match[2]);
        xScale = Number(match[3]);
        yScale = Number(match[4]);
        
        scratch = undefined;
        match = undefined;
    }


    var localToWindowMatrix = [
        [xScale,    undefined, undefined],
        [undefined, yScale,    undefined],
        [xTrans,    yTrans,    undefined],
    ];

    if (false)
    {
        // do it the first time
        recomputeSVG(localToWindowMatrix, p, d0, d1, nNeighbors,callThisWhenSVGSourceChanges);
    }

    var localToWindow = function(localXY) {
        var x = localXY[0];
        var y = localXY[1];
        var M = localToWindowMatrix;
        return [x*M[0][0]+M[2][0],
                y*M[1][1]+M[2][1]];
    };
    var worldToLocal = function(screenXY) {
        var x = screenXY[0];
        var y = screenXY[1];
        var M = localToWindowMatrix;
        return [(x-M[2][0])/M[0][0],
                (y-M[2][1])/M[1][1]];
    };

    var pickClosestThingIndex = function(pickXY,threshold) {
        var debug = false; // manually set this to true to debug
        var threshold1 = threshold*threshold;
        var things = [
            localToWindow([0,0]),
            localToWindow(d0),
            localToWindow(d1),
            localToWindow(p),
            localToWindow(analogy(d1,d0,d0)), // first CW neighbor
            localToWindow(analogy(d0,d1,d1)), // first CCW neighbor
        ];
        if (debug)
        {
            console.log("    in pickClosestThing");
            console.log("            things = "+things);
            console.log("            pickXY = "+pickXY);
        }
        var bestDist2;
        var bestIndex = -1;
        var thisDist2;
        for (var i = 0; i < things.length; ++i)
        {
            thisDist2 = dist2(pickXY, things[i]);
            if (debug)
            {
                console.log("        things["+i+"] = "+things[i]);
                console.log("            thisDist = "+Math.sqrt(thisDist2));
            }
            if (thisDist2 <= threshold1
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
            console.log("            pickXY = "+pickXY);
            console.log("    in pickClosestThing, returning "+bestIndex);
        }
        return bestIndex;
    };


    // We want the location of e
    // with respect to the upper-left corner of the SVG element.
    // In Chrome, e.offsetX,e.offsetY apparently works,
    // but in Firefox those are undefined
    // so we have to do some other hack.
    var figureOutOffsetXY = function(e) {
        //
        // Okay, we have pageX,pageY,
        // which is where the click was with respect to the *page*,
        // i.e. the *body* element.
        // But we want it with respect to the SVG element.
        // How do we find the offset?
        //
        // Supposedly theSVGELement.getBoundingClientRect()
        // is supposed to work, but it doesn't! (In firefox)
        // It returns a huge rectangle like 4 million by 4 million,
        // which is nothing like what we want.
        // So what we do is, assume the SVG is inside a DIV,
        // and get the client rect of that div.
        // (in that case maybe we should be using clientX,clientY instead);

        var theDivRect = theDiv[0].getBoundingClientRect(); // XXX don't do this every time!
        var offsetX = e.clientX - theDivRect.left;
        var offsetY = e.clientY - theDivRect.top;

        return [offsetX,offsetY];
    };

    var threshold = 10;
    var dragging = false;
    var indexOfThingBeingDragged = -1;
    var prevXY = [NaN,NaN]

    theSVG.mousedown(function(e) {
        //console.log("mouse down: ",e);

        mousedownsCount++;
        mousedownsElement.text(""+mousedownsCount+" mousedowns");


        var XY = figureOutOffsetXY(e);
        //console.log("    XY = "+XY);

        dragging = true;

        // XXX OH NO! offsetX,offsetY give the right thing in chrome, but they are undefined in firefox!!! how do we figure this out??
        // on firefox, there are:
        /*
            offsetX/Y: undefined undefined (!?)
            clientX/Y: 10 6
            originalEvent.pageX/Y: 10 21
            originalEvent.screenX/Y: 27 89
        */
        // I think this guy figured it out...
        //     http://www.jacklmoore.com/notes/mouse-position/
        // nope!
        // more thorough here:
        //     http://www.quirksmode.org/js/events_properties.html#position

        indexOfThingBeingDragged = pickClosestThingIndex(XY,10);
        console.log("dragging thing with index = "+indexOfThingBeingDragged);

        // XXX HACKY obscure way to change nNeighbors!
        if (indexOfThingBeingDragged === 4)
        {
            //if (nNeighbors > 1)
            {
                nNeighbors--;
                recomputeSVG(localToWindowMatrix, p, d0, d1, nNeighbors,callThisWhenSVGSourceChanges);
            }
        }
        else if (indexOfThingBeingDragged === 5)
        {
            nNeighbors++;
            recomputeSVG(localToWindowMatrix, p, d0, d1, nNeighbors,callThisWhenSVGSourceChanges);
        }

        prevXY = XY;


        // prevent browser from doing flakey things
        // (e.g. mousemove and mouseover stop firing) if it thinks drag-n-drop is going on.
        // http://unixpapa.com/js/mouse.html#preventdefault
        if (e.preventDefault)
            e.preventDefault();
        else
            e.returnValue= false;
        return false;
    });
    theSVG.mouseup(function(e) {
        //console.log("mouse up: ",e);

        mouseupsCount++;
        mouseupsElement.text(""+mouseupsCount+" mouseups");

        var XY = figureOutOffsetXY(e);
        dragging = false;
        prevXY = XY;
    });


    theSVG.mouseenter(function(e) {
        //console.log("mouse enter: ",e);
        //console.log("    e.target = ",e.target);
        mouseentersCount++;
        mouseentersElement.text(""+mouseentersCount+" mouseenters");
    });

    // ARGH! we get spurious leave events when children get leave events! (even though the jquery doc says we shouldn't) so don't do this!
    // oh wait, now I'm trying it again, and I'm not getting those bogus leave events?? weird. okay leaving it on for now.
    // oh! I think the problem is just on firefox?
    if (true)
    {
        // have to set dragging to false when mouse leaves the svg,
        // otherwise we'll lose of whether mouse was up or down
        theSVG.mouseleave(function(e) {
            //console.log("mouse leave: ",e);
            //console.log("    e.target = ",e.target);
            mouseleavesCount++;
            mouseleavesElement.text(""+mouseleavesCount+" mouseleaves");

            dragging = false;
        });
        theSVG.mouseout(function(e) {
            //console.log("mouse out: ",e);
            //console.log("    e.target = ",e.target);

            if (e.target == theSVG[0])
            {
                mouseouts_svgCount++;
                mouseouts_svgElement.text(""+mouseouts_svgCount+" mouseouts svg");
            }
            else
            {
                mouseouts_subelementsCount++;
                mouseouts_subelementsElement.text(""+mouseouts_subelementsCount+" mouseouts sub-elements");
            }
        });
        theSVG.mouseover(function(e) {
            //console.log("mouse in: ",e);
            //console.log("    e.target = ",e.target);

            if (e.target == theSVG[0])
            {
                mouseins_svgCount++;
                mouseins_svgElement.text(""+mouseins_svgCount+" mouseins svg");
            }
            else
            {
                mouseins_subelementsCount++;
                mouseins_subelementsElement.text(""+mouseins_subelementsCount+" mouseins sub-elements");
            }
        });
    }


    theSVG.mousemove(function(e) {
        //console.log(""+mousemovesCount+" mouse move:",e);

        if (dragging)
        {
            mousedragsCount++;
            mousedragsElement.text(""+mousedragsCount+" mousedrags");
        }
        else
        {
            mousemovesCount++;
            mousemovesElement.text(""+mousemovesCount+" mousemoves");
        }


        var XY = figureOutOffsetXY(e);


        // wtf? on chrome, this keeps firing every 1 second
        // when in window, even if mouse not moving??
        // what a waste!
        if (XY[0] == prevXY[0] && XY[1] == prevXY[1])
        {
            //console.log("WTF? didn't really move?");
            return;
        }


        //console.log("    dragging = "+dragging);
        if (dragging)
        {
            //console.log("XY = ",XY);
            var localXY = worldToLocal(XY)
            //console.log("localXY = ",localXY);
            if (indexOfThingBeingDragged === 0) // origin
            {
                // XXX doesn't work yet
            }
            else if (indexOfThingBeingDragged === 1) // d0
            {
                if (e.ctrlKey)
                {
                    // constrain to same angle
                    d0 = times(d0, length(localXY)/length(d0));
                }
                else
                {
                    d0 = localXY;
                }
                console.log("d0 changed to "+d0);
                recomputeSVG(localToWindowMatrix, p, d0, d1, nNeighbors,callThisWhenSVGSourceChanges);
            }
            else if (indexOfThingBeingDragged === 2) // d1
            {
                if (e.ctrlKey)
                {
                    // constrain to same angle
                    d1 = times(d1, length(localXY)/length(d1));
                }
                else
                {
                    d1 = localXY;
                }
                //d1 = normalized(d1); // constrain to unit length
                console.log("d1 changed to "+d1);
                recomputeSVG(localToWindowMatrix, p, d0, d1, nNeighbors,callThisWhenSVGSourceChanges);
            }
            else if (indexOfThingBeingDragged === 3) // p
            {
                p = localXY;
                p[0] = 0; // constrain to y axis
                console.log("p changed to "+p);
                recomputeSVG(localToWindowMatrix, p, d0, d1, nNeighbors,callThisWhenSVGSourceChanges);
            }
            else if (indexOfThingBeingDragged === 4) // CW neighbor
            {
                // nothing-- already did it on mouse down
            }
            else if (indexOfThingBeingDragged === 5) // CCW neighbor
            {
                // nothing-- already did it on mouse down
            }
        }
        prevXY = XY;
    });

    if (!showDottedLines)
        findExpectingNThings(theSVG,'.orthoDottedPathStuff',2).attr('display', 'none');
    if (!showArcs)
        findExpectingOneThing(theSVG,'.arcsStuff').attr('display', 'none');
    if (!showDhatStuff)
        findExpectingNThings(theSVG,'.dhatStuff',2).attr('display', 'none');

    // in case some param was actually defined...
    recomputeSVG(localToWindowMatrix, p, d0, d1, nNeighbors,callThisWhenSVGSourceChanges);

}; // initFigureInteraction




var initFigures567Interaction = function(callThisWhenSVGSourceChanges)
{
    // Make sure I'm not modifying any global vars...
    var globals = function() {
        var answer = Object();
        for (var key in window)
            answer[key] = window[key];
        return answer;
    }
    // return all keys in a that are not in b
    var difference = function(a,b) {
        var answer = [];
        for (var key in a)
            if (!(key in b))
                answer.push(key);
        return answer;
    }
    var whatChanged = function(a,b) {
        var answer = [];
        for (var key in a)
            if (key in b)
                if (a[key] !== b[key])
                    answer.push(key);
        return answer;
    }
    var globals0 = globals();
    console.log("before: number of globals 0: = ",globals0.length);



    var templateDiv = jQuery('#figureTemplateDiv');
    var templateSVG = templateDiv.children();
    var figure5div = jQuery('#figure5div');
    var figure6div = jQuery('#figure6div');
    var figure7div = jQuery('#figure7div');

    var figureDivs = jQuery([figure5div[0],figure6div[0],figure7div[0]]);

    // replace the contents of each figure div
    // with a cloned copy of the template svg.
    figureDivs.empty().append(templateSVG.clone()); // XXX why doesn't this work? shouldn't it be same as the other?




    initFigureInteraction(figure5div,
                          [0,1], // p
                          [.745, .415], // d0
                          [.8, .6], // d1
                          2, // nNeighbors
                          false, // don't show dotted lines
                          false, // don't show arcs
                          false, // don't show dhat stuff
                          function() {});

    initFigureInteraction(figure6div,
                          [0,1], // p
                          [.6, .2], // d0
                          [.8, .6], // d1
                          0, // nNeighbors
                          true, // show dotted lines
                          false, // don't show arcs
                          false, // don't show dhat stuff
                          function() {});

    initFigureInteraction(figure7div,
                          [0,1.4], // p
                          [.635, .34], // d0
                          [.855, 1.175], // d1
                          0, // nNeighbors
                          false, // don't show dotted lines
                          true, // show arcs
                          true, // show dhat stuff
                          function() {});

    initFigureInteraction(templateDiv,
                          undefined,
                          undefined,
                          undefined,
                          undefined,
                          true,
                          true,
                          true,
                          callThisWhenSVGSourceChanges);

    var globals1 = globals();
    if (difference(globals0,globals1).length != 0
     || difference(globals1,globals0).length != 0
     || whatChanged(globals0,globals1).length != 0)
    {
        window.alert("hey! someone polluted the global namespace while initializing figure5div! added: ["+difference(globals1,globals0)+"] deleted: ["+difference(globals0,globals1)+"] changed: ["+whatChanged(globals0,globals1)+"]");
        globals0 = globals1;
    }


} // initFigures567Interaction
