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



// common code used to init each of the figures
var initFigureInteraction = function(theDiv,
                                     p, p0, p1, // either p defined, or p0 and p1 defined
                                     d, d0, d1, // either d defined, or d0 and d1 defined
                                     nNeighbors,
                                     showOrthoDottedLines,
                                     showArcs,
                                     showDhatStuff,
                                     callThisWhenSVGSourceChanges) {

    if (typeof jQuery === "undefined")
    {
        var msg = "Oh no! initFigureInteraction() called but jQuery hasn't been loaded or something! bailing!";
        window.alert(msg);
        throw msg;
    }
    if (!jQuery.isReady)
    {
        // XXX TODO: this may be too strict, maybe call live()?
        var msg = "Hey! initFigureInteraction() called when document not ready! You need to call this through jQuery.ready()";
        window.alert(msg);
        throw msg;
    }

    var isDefined = function(x) { return typeof x !== 'undefined'; }

    var recomputeSVG = function(M,p,p0,p1,d,d0,d1,nNeighbors,callThisWhenSVGSourceChanges) {
        console.log("    recomputing svg");

        if (!isDefined(p) &&  isDefined(p0) &&  isDefined(p1)
          && isDefined(d) && !isDefined(d0) && !isDefined(d1))
        {
            // Figure 4
            var d0 = d;
            var d1 = d;
            var d2 = times(d,[1.1,.1]); // XXX fudge for now-- get it right later
            var d0prev = analogy(d2,d1,d0);

            var p2 = nextInLogSpiral(p0,p1);
            var p0prev = nextInLogSpiral(p1,p0);

            var q0 = plus(p0,[.1,-.1]); // XXX fudge for now-- get it right later
        }
        else if ( isDefined(p) && !isDefined(p0) && !isDefined(p1)
              && !isDefined(d) &&  isDefined(d0) &&  isDefined(d1))
        {
            // Figures 5,6,7
            if (true)
            {
                // solve:
                //     analogy(d1,d0,[1,0]) dot <x,y> = 0
                //     (<0,1>-<x,y>) dot d0 = 0
                //         => <x,y> dot d0 = <0,1> dot d0
                // it's a straightforward system of linear equations,
                // but it simplifies (worked this out on paper):
                var temp = analogy(d1,d0,[0,1]);
                var p0 = times(temp,d0[1]/dot(temp,d0)); // so don't test for isDefined(p0) any more
                // woops, but that was assuming p=<0,1>.
                // now do it for general p=<0,yp>.
                p0 = times(p0, length(p));

                var p1 = nextInLogSpiral(p0,p);
                var p2 = nextInLogSpiral(p,p1);
                var p0prev = nextInLogSpiral(p,p0);
                var d2 = nextInLogSpiral(d0,d1);
                var d0prev = nextInLogSpiral(d1,d0);
            }
            if (true)
            {
                assert(Math.abs(dot(minus(p,p0),d0)) < 1e-6);
                assert(Math.abs(dot(p0,analogy(d1,d0,[1,0]))) < 1e-6);
            }
            var qLength = length(minus(p,p0)); // make quill same length as primal edge, seems to look fairly decent
            var q = plus(p,times(normalized(perpDot(minus(d0,d1))),qLength));
            var q0 = analogy(p,q,p0);
        }
        else
        {
            throw "ERROR: unexpected combination of p,p0,p1,d,d0,d1";
        }



        var dudleyMainPath = "M 0 0 L "+d0[0]+" "+d0[1]+" L "+d1[0]+" "+d1[1]+" L 0 0";

        // scratch
        var z;
        var Z;
        var temp;

        var dudleyNeighborsPath = "";
        var dudleyNeighborsPathOpacities = "";
        {
            z = d1;
            Z = d2;
            for (var iNeighbor = 0; iNeighbor < nNeighbors; ++iNeighbor)
            {
                dudleyNeighborsPath += " M "+z[0]+" "+z[1]+" L "+Z[0]+" "+Z[1]+" L 0 0";
                dudleyNeighborsPathOpacities += " "+(1.-iNeighbor/nNeighbors)+" "+(1.-(iNeighbor+1.)/nNeighbors)+" "+(1.-iNeighbor/nNeighbors);
                //dudleyNeighborsPathOpacities += " "+(1.-iNeighbor/nNeighbors)+" "+(1.-(iNeighbor+1.)/nNeighbors)+" "+(1.-(iNeighbor+1.)/nNeighbors);
                temp = nextInLogSpiral(z,Z);
                z = Z;
                Z = temp;
            }
            z = d0prev;
            Z = d0;
            for (var iNeighbor = 0; iNeighbor < nNeighbors; ++iNeighbor)
            {
                dudleyNeighborsPath += " M "+Z[0]+" "+Z[1]+" L "+z[0]+" "+z[1]+" L 0 0";
                dudleyNeighborsPathOpacities += " "+(1.-iNeighbor/nNeighbors)+" "+(1.-(iNeighbor+1.)/nNeighbors)+" "+(1.-iNeighbor/nNeighbors);
                //dudleyNeighborsPathOpacities += " "+(1.-iNeighbor/nNeighbors)+" "+(1.-(iNeighbor+1.)/nNeighbors)+" "+(1.-(iNeighbor+1.)/nNeighbors);
                temp = nextInLogSpiral(Z,z);
                Z = z;
                z = temp;
            }
        }


        var priscillaMainPath;
        if (isDefined(p))
        {
            // figures 5,6,7
            priscillaMainPath = "M "+p0[0]+" "+p0[1]+" L "+p[0]+" "+p[1]+" L "+p1[0]+" "+p1[1]+" M "+p[0]+" "+p[1]+" L "+q[0]+" "+q[1];
        }
        else
        {
            // figure 4
            priscillaMainPath = "M "+p0[0]+" "+p0[1]+" L "+p1[0]+" "+p1[1];
        }

        var priscillaNeighborsPath = "";
        var priscillaNeighborsPathOpacities = "";
        if (1)
        {
            z = p1;
            Z = p2;
            for (var iNeighbor = 0; iNeighbor < nNeighbors; ++iNeighbor)
            {
                var Q = analogy(p0,q0,z);
                priscillaNeighborsPath += " M "+Z[0]+" "+Z[1]+" L "+z[0]+" "+z[1]+" L "+Q[0]+" "+Q[1];
                priscillaNeighborsPathOpacities += " "+.5*(1.-(iNeighbor+1.)/nNeighbors)+" "+.5*(1.-iNeighbor/nNeighbors)+" 0";
                temp = nextInLogSpiral(z,Z);
                z = Z;
                Z = temp;
            }
            z = p0prev;
            Z = p0;
            for (var iNeighbor = 0; iNeighbor < nNeighbors; ++iNeighbor)
            {
                var Q = analogy(p0,q0,Z);
                priscillaNeighborsPath += " M "+Q[0]+" "+Q[1]+" L "+Z[0]+" "+Z[1]+" L "+z[0]+" "+z[1];
                priscillaNeighborsPathOpacities += " 0 "+.5*(1.-iNeighbor/nNeighbors)+" "+.5*(1.-(iNeighbor+1.)/nNeighbors);
                temp = nextInLogSpiral(Z,z);
                Z = z;
                z = temp;
            }
        }
        if (isDefined(p) && nNeighbors >= 1)
        {
            // add longer tail to the primary quill
            var qExtension = plus(q,times(.5,minus(q,p)));
            priscillaNeighborsPath += " M "+q[0]+" "+q[1]+" L "+qExtension[0]+" "+qExtension[1];
            priscillaNeighborsPathOpacities += " 1 0";
        }


        if (priscillaNeighborsPath === "")
        {
            priscillaNeighborsPath = "M 0 0";
        }
        if (dudleyNeighborsPath === "")
        {
            dudleyNeighborsPath = "M 0 0";
        }

        if (showArcs)
        {
            var theta1 = Math.atan2(d0[1],d0[0]);
            var m1maxRadius = length(p)*length2(d0)*Math.sin(2*theta1)/4.;
            var theta2 = Math.atan2(d1[1],d1[0]);
            var m2maxRadius = length(p)*length2(d1)*Math.sin(2*theta2)/4.;

            // <path class="m1arc" vector-effect="non-scaling-stroke" style="stroke:#f0f0f0; stroke-width:2; fill: none; stroke-opacity:1" d="M 0 0 L 1.414 1.414  A1,1 0 0,1 0,1 L 0 0"></path>
            var m1arcStart = times(d0, m1maxRadius/length(d0));
            var m1arcPath = "M 0 0 L "+m1arcStart[0]+" "+m1arcStart[1]+" A"+m1maxRadius+","+m1maxRadius+" 0 0,1 0,"+m1maxRadius+" L 0 0";
            var m2arcStart = times(d1, m2maxRadius/length(d1));
            var m2arcPath = "M 0 0 L "+m2arcStart[0]+" "+m2arcStart[1]+" A"+m2maxRadius+","+m2maxRadius+" 0 0,1 0,"+m2maxRadius+" L 0 0";

            var deltam = times(p,cross(d0,d1)*.5);
            var m3arcPath = "M "+deltam[0]+" "+deltam[1]+" L "+(m1arcStart[0]+deltam[0])+" "+(m1arcStart[1]+deltam[1])+" A"+m1maxRadius+","+m1maxRadius+" 0 0,1 "+(0+deltam[0])+","+(m1maxRadius+deltam[1])+" L "+deltam[0]+" "+deltam[1]+"";
        }


        var dhat = [d0[0], d0[0]/d1[0]*d1[1]];

        // note, we do the line from origin to _x_d_ even though it's redundant with the one from ^x_d^, for in case it gets dragged so that's not true
        var orthoDottedPath = ("M 0 0 L "+d1[0]+" 0 L "+d1[0]+" "+d1[1]
                                       +" M 0 0 L "+d0[0]+" 0 L "+d0[0]+" "+d0[1]);
        var dhatDottedPath = "M "+d0[0]+" "+d0[1]+" L "+dhat[0]+" "+dhat[1]


        //
        // Now we've computed everything, put it into the appropriate attrs
        //
        dudleyMainPathElement.attr('d', dudleyMainPath);
        dudleyNeighborsPathElement.attr('d', dudleyNeighborsPath);
        dudleyNeighborsPathElement.attr('vertex-opacities', dudleyNeighborsPathOpacities);
        priscillaMainPathElement.attr('d', priscillaMainPath);
        priscillaNeighborsPathElement.attr('d', priscillaNeighborsPath);
        priscillaNeighborsPathElement.attr('vertex-opacities', priscillaNeighborsPathOpacities);
        if (isDefined(orthoDottedPathElement))
            orthoDottedPathElement.attr('d', orthoDottedPath);
        if (isDefined(dhatDottedPathElement))
            dhatDottedPathElement.attr('d', dhatDottedPath);
        if (isDefined(p))
        {
            ptransformElement.attr('transform', 'translate('+p[0]+','+p[1]+')');
            d0transformElement.attr('transform', 'translate('+d0[0]+','+d0[1]+')');
            d1transformElement.attr('transform', 'translate('+d1[0]+','+d1[1]+')');
        }
        if (isDefined(dhattransformElement))
            dhattransformElement.attr('transform', 'translate('+dhat[0]+','+dhat[1]+')');
        if (isDefined(xd0transformElement))
        {
            xd0transformElement.attr('transform', 'translate('+d0[0]+',0)');
            xd1transformElement.attr('transform', 'translate('+d1[0]+',0)');
        }
        if (isDefined(m1arc))
        {
            m1arc.attr('d', m1arcPath);
            m2arc.attr('d', m2arcPath);
            m3arc.attr('d', m3arcPath);
        }
        undoScales.attr('transform', 'scale('+1./M[0][0]+','+1./M[1][1]+')');

        // the false,false isn't really right if number of verts changed... but the code does the right thing by blowing away and regenerating the whole thing in that case anyway
        updateVertexColoredPaths(dudleyNeighborsPathElement,true,false,false);
        updateVertexColoredPaths(priscillaNeighborsPathElement,true,false,false);

        callThisWhenSVGSourceChanges();

        //console.log("    done recomputing svg");
    }; // recomputeSVG

    // http://net.tutsplus.com/tutorials/javascript-ajax/quick-tip-quick-and-easy-javascript-testing-with-assert/
    var assertInCaller = function(nCallersToSkip, condition, description) {
        if (!condition)
        {
            // throw to get a stack trace
            try {
                throw Error();
            }
            catch(e)
            {
                var stackLines = e.stack.split('\n');
                var theStackLine = jQuery.trim(stackLines[3+nCallersToSkip]);
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
                    text = "ASSERT FAIL: " + text; // TODO: color:red;font-weight:bold
                    li.appendChild(document.createTextNode(text));
                    assertOutputList.appendChild(li);
                }
                else
                {
                    window.alert("Oh no! Assertion failed! "+text);
                }
                throw text;
            }
        }
    }; // assertInCaller
    var assert = function(condition, description) {
        return assertInCaller(1, condition, description);
    }; // assert

    // jQuery(s), throwing an error if the result
    // has length other than nExpected.
    var findExpectingNThings = function(node,query,minExpected,maxExpected) {
        // just trivially wrap _findExpectingNThings;
        // the point is to make the number of stack frames to be skipped
        // be the same in all calls to it
        return _findExpectingNThings(node, query, minExpected,maxExpected);
    };
    var findExpectingOneThing = function(node,query) {
        return _findExpectingNThings(node, query, 1,1);
    };
    var _findExpectingNThings = function(node,query,minExpected,maxExpected) {
        assert(typeof minExpected !== 'undefined'
            && typeof maxExpected !== 'undefined', "missing arg to findExpectingNThings");
        var answer = node.find(query);
        assertInCaller(2,(answer.length >= minExpected && answer.length <= maxExpected),
        "got "+answer.length+" results from node.find('"+query+"'), expected "+(minExpected==maxExpected ? minExpected : "between "+minExpected+" and "+maxExpected+""));
        return answer;
    };

    // global constants (just a cache)
    var theSVG = theDiv.children();
    if (theSVG.length !== 1)
    {
        console.log("oh no! "+theSVG.length+" proper descendents of div ",theDiv,", expected 1");
        throw null;
    }
    if (theSVG[0].tagName !== 'svg')
    {
        console.log("oh no! the child of div ",theDiv," has tag "+theSVG[0].tagName+", expected 'SVG'");
        throw null;
    }

    console.log("theDiv[0].tagName = "+theDiv[0].tagName);
    assert(theDiv.length === 1 && theDiv[0].tagName === "DIV", "oh no! the SVG has to have a div as a parent! dragging won't work!");
    var theDivsChildren = theDiv.children();
    assert(theDivsChildren.length === 1 && theDiv[0].tagName === "DIV", "oh no! the SVG has siblings! dragging won't work!");

    var theGraphicElement = findExpectingOneThing(theSVG, '.theGraphic');
    var dudleyMainPathElement = findExpectingOneThing(theSVG, '.dudleyMainPath');
    var dudleyNeighborsPathElement = findExpectingOneThing(theSVG, '.dudleyNeighborsPath');
    var priscillaMainPathElement = findExpectingOneThing(theSVG, '.priscillaMainPath');
    var priscillaNeighborsPathElement = findExpectingOneThing(theSVG, '.priscillaNeighborsPath');

    if (showOrthoDottedLines)
        var orthoDottedPathElement = findExpectingOneThing(theSVG, '.orthoDottedPath');
    if (showDhatStuff)
    {
        var dhatDottedPathElement = findExpectingOneThing(theSVG, '.dhatDottedPath');
        var dhattransformElement = findExpectingOneThing(theSVG, '.dhattransform');
    }

    var ptransformElement = findExpectingNThings(theSVG, '.ptransform', 0,1);
    var p0transformElement = findExpectingNThings(theSVG, '.p0transform', 0,1);
    var p1transformElement = findExpectingNThings(theSVG, '.p1transform', 0,1);

    var dtransformElement = findExpectingNThings(theSVG, '.dtransform', 0,1);
    var d0transformElement = findExpectingNThings(theSVG, '.d0transform', 0,1);
    var d1transformElement = findExpectingNThings(theSVG, '.d1transform', 0,1);

    if (showOrthoDottedLines)
    {
        var xd0transformElement = findExpectingOneThing(theSVG, '.xd0transform');
        var xd1transformElement = findExpectingOneThing(theSVG, '.xd1transform');
    }
    if (showArcs)
    {
        var m1arc = findExpectingOneThing(theSVG, '.m1arc');
        var m2arc = findExpectingOneThing(theSVG, '.m2arc');
        var m3arc = findExpectingOneThing(theSVG, '.m3arc');
    }
    var undoScales = theSVG.find('.undoScaleForSvgText'); // lots of these!


    // Either there's ptransform or p0transform,p1transform, but not both
    // Either there's dtransform or d0transform,d1transform, but not both
    assert((ptransformElement.length==1 && p0transformElement.length==0 && p1transformElement.length==0)
        || (ptransformElement.length==0 && p0transformElement.length==1 && p1transformElement.length==1));
    assert((dtransformElement.length==1 && d0transformElement.length==0 && d1transformElement.length==0)
        || (dtransformElement.length==0 && d0transformElement.length==1 && d1transformElement.length==1));

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

    var someParamWasDefined = (typeof p !== 'undefined'
                            || typeof p0 !== 'undefined'
                            || typeof p1 !== 'undefined'
                            || typeof d !== 'undefined'
                            || typeof d0 !== 'undefined'
                            || typeof d1 !== 'undefined'
                            || typeof nNeighbors !== 'undefined');

    if (!someParamWasDefined)
    {
        // it's the template. extract the values from the svg.
        // if any of the elements used here didn't exist, we'll get an inscrutable error.

        {
            var scratch = ptransformElement.attr('transform');
            p = [Number(scratch.replace(/^.*\(/, '').replace(/,.*$/, '')),
                 Number(scratch.replace(/^.*\,/, '').replace(/\).*$/, ''))]
        }

        {
            // 'translate(0,0)'
            var scratch = d0transformElement.attr('transform');
            d0 = [Number(scratch.replace(/^.*\(/, '').replace(/,.*$/, '')),
                  Number(scratch.replace(/^.*\,/, '').replace(/\).*$/, ''))]
        }

        {
            var scratch = d1transformElement.attr('transform');
            d1 = [Number(scratch.replace(/^.*\(/, '').replace(/,.*$/, '')),
                  Number(scratch.replace(/^.*\,/, '').replace(/\).*$/, ''))]
        }

        {
            // really hacky way to deduce nNeighbors--
            // figure it out from the size of the neighborsPaths.
            // (dudley's, since priscilla's got stuff added)

            var dTemp = jQuery.trim(dudleyNeighborsPathElement.attr('d')).split(/ +/).length;
            //console.log('length of d neighbors path = '+pTemp);
            assert(dTemp % 18 === 0, "neighbors path length "+dTemp+" is not a multiple of 18!");
            nNeighbors = dTemp / 18;
        }
    }


    console.log('p = '+p);
    console.log('d0 = '+d0);
    console.log('d1 = '+d1);
    console.log('nNeighbors = '+nNeighbors);

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
        var scratch = theGraphicElement.attr('transform');
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
        recomputeSVG(localToWindowMatrix, p,p0,p1, d,d0,d1, nNeighbors,callThisWhenSVGSourceChanges);
    }

    var localToWindow = function(localXY) {
        if (typeof localXY === 'undefined')
            return undefined;
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

    var pickClosestThingIndex = function(pickXY, things, tooFar) {
        var debug = false; // manually set this to true to debug
        var tooFar2 = tooFar*tooFar;
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
            var thing = things[i];
            if (typeof thing == 'undefined')
                continue;
            thisDist2 = dist2(pickXY, things[i]);
            if (debug)
            {
                console.log("        things["+i+"] = "+thing);
                console.log("            thisDist = "+Math.sqrt(thisDist2));
            }
            if (thisDist2 <= tooFar2
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
    // in the space of the SVG element.
    // with respect to the upper-left corner of the SVG element.
    // In Chrome, e.offsetX,e.offsetY apparently works,
    // but in Firefox those are undefined so we have to do something more robust.
    var figureOutXYInSvgSpace = function(svgElement,e) {
        var clientP = svgElement.createSVGPoint();
        clientP.x = e.clientX;
        clientP.y = e.clientY;
        var svgP = clientP.matrixTransform(svgElement.getScreenCTM().inverse());
        return [svgP.x,svgP.y];
    };

    var tooFar = 10; // pixels
    var dragging = false;
    var indexOfThingBeingDragged = -1;
    var prevXY = [NaN,NaN]

    theSVG.mousedown(function(e) {
        //console.log("mouse down: ",e);

        mousedownsCount++;
        mousedownsElement.text(""+mousedownsCount+" mousedowns");


        var XY = figureOutXYInSvgSpace(theSVG[0], e);
        //console.log("    XY = "+XY);

        dragging = true;

        if (isDefined(p))
        {
            var spotToPressToIncreaseNeighbors = localToWindow(nextInLogSpiral(d1,d0));
            var spotToPressToDecreaseNeighbors = localToWindow(nextInLogSpiral(d0,d1));
        }
        else
        {
            // XXX GET SOMETHING BETTER THAN THIS
            var spotToPressToIncreaseNeighbors = [30,0];
            var spotToPressToDecreaseNeighbors = [0,0];
        }

        var things = [
            localToWindow([0,0]), // 0
            localToWindow(p), // 1
            localToWindow(p0), // 2
            localToWindow(p1), // 3
            localToWindow(d), // 4
            localToWindow(d0), // 5
            localToWindow(d1), // 6
            spotToPressToIncreaseNeighbors, // 7
            spotToPressToDecreaseNeighbors, // 8
        ];

        indexOfThingBeingDragged = pickClosestThingIndex(XY,things,10);
        console.log("dragging thing with index = "+indexOfThingBeingDragged);

        // XXX HACKY obscure way to change nNeighbors!
        if (indexOfThingBeingDragged === 7)
        {
            //if (nNeighbors > 1)
            {
                nNeighbors--;
                recomputeSVG(localToWindowMatrix, p,p0,p1, d,d0,d1, nNeighbors,callThisWhenSVGSourceChanges);
            }
        }
        else if (indexOfThingBeingDragged === 8)
        {
            nNeighbors++;
            recomputeSVG(localToWindowMatrix, p,p0,p1, d,d0,d1, nNeighbors,callThisWhenSVGSourceChanges);
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

        var XY = figureOutXYInSvgSpace(theSVG[0], e);
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

            if (e.target === theSVG[0])
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

            if (e.target === theSVG[0])
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


        var XY = figureOutXYInSvgSpace(theSVG[0], e);


        // wtf? on chrome, this keeps firing every 1 second
        // when in window, even if mouse not moving??
        // what a waste!
        if (XY[0] === prevXY[0] && XY[1] === prevXY[1])
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
                // Change overall translation of the main graphic of the svg
                xTrans = XY[0];
                yTrans = XY[1];
                theGraphicElement.attr("transform", "translate("+xTrans+","+yTrans+") scale("+xScale+","+yScale+")");
                localToWindowMatrix = [
                    [xScale,    undefined, undefined],
                    [undefined, yScale,    undefined],
                    [xTrans,    yTrans,    undefined],
                ];
                recomputeSVG(localToWindowMatrix, p,p0,p1, d,d0,d1, nNeighbors,callThisWhenSVGSourceChanges);
            }
            else if (indexOfThingBeingDragged === 1) // p
            {
                p = localXY;
                p[0] = 0; // constrain to y axis
                console.log("p changed to "+p);
                recomputeSVG(localToWindowMatrix, p,p0,p1, d,d0,d1, nNeighbors,callThisWhenSVGSourceChanges);
            }
            else if (indexOfThingBeingDragged === 2) // p0
            {
                if (e.ctrlKey)
                {
                    // constrain to same angle
                    var scale = length(localXY)/length(p0);
                    p0 = times(p0, scale);
                    p1 = times(p1, scale);
                }
                else
                {
                    p0 = localXY;
                }
                p1[0] = p0[0] // constrain segment to be vertical XXX should we do this by moving to/from origin?
                console.log("p0 changed to "+p0);
                recomputeSVG(localToWindowMatrix, p,p0,p1, d,d0,d1, nNeighbors,callThisWhenSVGSourceChanges);
            }
            else if (indexOfThingBeingDragged === 3) // p1
            {
                if (e.ctrlKey)
                {
                    // constrain to same angle
                    var scale = length(localXY)/length(p1);
                    p1 = times(p1, scale);
                    p0 = times(p0, scale);
                }
                else
                {
                    p1 = localXY;
                }
                p0[0] = p1[0] // constrain segment to be vertical XXX should we do this by moving to/from origin?
                console.log("p1 changed to "+p1);
                recomputeSVG(localToWindowMatrix, p,p0,p1, d,d0,d1, nNeighbors,callThisWhenSVGSourceChanges);
            }
            else if (indexOfThingBeingDragged === 4) // d
            {
                d = localXY;
                d[1] = 0; // constrain to x axis
                console.log("d changed to "+d);
                recomputeSVG(localToWindowMatrix, p,p0,p1, d,d0,d1, nNeighbors,callThisWhenSVGSourceChanges);
            }
            else if (indexOfThingBeingDragged === 5) // d0
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
                recomputeSVG(localToWindowMatrix, p,p0,p1, d,d0,d1, nNeighbors,callThisWhenSVGSourceChanges);
            }
            else if (indexOfThingBeingDragged === 6) // d1
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
                recomputeSVG(localToWindowMatrix, p,p0,p1, d,d0,d1, nNeighbors,callThisWhenSVGSourceChanges);
            }
            else if (indexOfThingBeingDragged === 7) // CW neighbor
            {
                // nothing-- already did it on mouse down
            }
            else if (indexOfThingBeingDragged === 8) // CCW neighbor
            {
                // nothing-- already did it on mouse down
            }
        }
        prevXY = XY;
    });

    if (isDefined(p))
    {
        if (!showOrthoDottedLines)
            findExpectingNThings(theSVG,'.orthoDottedPathStuff',2,2).attr('display', 'none'); // the paths and the labels
        if (!showArcs)
            findExpectingOneThing(theSVG,'.arcsStuff').attr('display', 'none');
        if (!showDhatStuff)
            findExpectingNThings(theSVG,'.dhatStuff',2,2).attr('display', 'none');
    }

    if (someParamWasDefined)
    {
        recomputeSVG(localToWindowMatrix, p,p0,p1, d,d0,d1, nNeighbors,callThisWhenSVGSourceChanges);
    }

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
                    answer.push(key+":"+a[key]+"->"+b[key]);
        return answer;
    }
    var globals0 = globals();
    console.log("before: number of globals 0: = ",globals0.length);




    var templateDiv = jQuery('#figureTemplateDiv');
    var templateSVG = templateDiv.children();
    var figure4div = jQuery('#figure4div');
    var figure5div = jQuery('#figure5div');
    var figure6div = jQuery('#figure6div');
    var figure7div = jQuery('#figure7div');

    var figureDivs = jQuery([figure5div[0],figure6div[0],figure7div[0]]);

    // replace the contents of each figure div
    // with a cloned copy of the template svg.
    // XXX should this be in the caller?  not sure, I think this function does too much
    figureDivs.empty().append(templateSVG.clone());




    initFigureInteraction(
        figure5div,
        [0,1], undefined, undefined, // p
        undefined, [.745, .415], [.8, .6], // d0,d1
        2, // nNeighbors
        false, // don't show ortho dotted lines
        false, // don't show arcs
        false, // don't show dhat stuff
        function() {});

    initFigureInteraction(
        figure6div,
        [0,1], undefined, undefined, // p
        undefined, [.6, .2], [.8, .6], // d0,d1
        0, // nNeighbors
        true, // show ortho dotted lines
        false, // don't show arcs
        false, // don't show dhat stuff
        function() {});

    initFigureInteraction(
        figure7div,
        [0,1.195], undefined, undefined, // p
        undefined, [.8, .615], [.965, 1.205], // d0,d1
        0, // nNeighbors
        false, // don't show ortho dotted lines
        true, // show arcs
        true, // show dhat stuff
        function() {});

    initFigureInteraction(
        templateDiv,
        undefined, undefined, undefined, // p,p0,p1
        undefined, undefined, undefined, // d,d0,d1
        undefined, // nNeighbors
        true,
        true,
        true,
        callThisWhenSVGSourceChanges);


    // XXX put this up above, when it finally works
    initFigureInteraction(
        figure4div,
        undefined, [.8,.6], [.8,1], // p0,p1
        [1,0], undefined, undefined, // d
        2, // nNeighbors
        false, // don't show ortho dotted lines
        false, // don't show arcs
        false, // don't show dhat stuff
        function() {});



    if (false)
    {
        // XXX currently can't do this,
        // since scrollMaxX and scrollMaxY change, in firefox.
        // and even if we make an exception for that,
        // I guess it's still not safe.
        var globals1 = globals();
        if (difference(globals0,globals1).length !== 0
         || difference(globals1,globals0).length !== 0
         || whatChanged(globals0,globals1).length !== 0)
        {
            window.alert("hey! someone polluted the global namespace while initializing figure5div! added: ["+difference(globals1,globals0)+"] deleted: ["+difference(globals0,globals1)+"] changed: ["+whatChanged(globals0,globals1)+"]");
            globals0 = globals1;
        }
    }


}; // initFigures567Interaction
