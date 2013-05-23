// vertexColoredPath.js




/*
A vertex-colored path is specified
by giving a "vertex-colors" attr, containing a space-separated
list of colors (each suitable for putting in a "stroke" attr).
Similarly vertex opacities can be specified
with a "vertex-opacities" attr.
The number of items in these attrs
must be the same as the number of
vertices in the path, or an error is thrown.
This is implemented by breaking up the path into line segments,
each with its own gradient element.
The gradients and segments are added immediately after the original path element,
and the original path element gets hidden.
Limitations:
    - Only M,L are supported currently
      (not m,l, nor any other construct such as close-path or curves).
    - You must specify all L's explicitly
        (e.g. "M 0 0 L 0 1 1 1" is not allowed; it must be spelled out
        as "M 0 0 L 0 1 L 1 1"
        or "M 0,0 L 0,1 L 1,1" or whatever.
    - You can't omit spaces around the L's and M's, e.g. this will be rejected: "M0 0L0 1L1 1"
    - the following element ids get generated, and must not be used elsewhere:
        vertexColors000000, vertexColors000001, etc.

For example:
    <path id="thePath"
        d="M 0 0 L 1 0 L 1 1"
        stroke="red black #0000ff"
        stroke-opacity="100% .5 1"
    ></path>
gets transformed into:
    <linearGradient id="vertexColors000000" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="red"   stop-opacity="100%"/>
        <stop offset="100%" stop-color="black" stop-opacity=".5"/>
    </linearGradient>
    <linearGradient id="vertexColors000001" gradientUnits="userSpaceOnUse" x1="1" y1="0" x2="1" y2="1">
        <stop offset="0%"   stop-color="black"   stop-opacity=".5"/>
        <stop offset="100%" stop-color="#0000ff" stop-opacity="1"/>
    </linearGradient>
    <path id="thePath_part1" d="M 0 0 L 1 0" stroke="url(#vertexColors000000)"></path>
    <path id="thePath_part2" d="M 1 0 L 1 1" stroke="url(#vertexColors000001)"></path>
*/

global_numberOfGradientIdsEver = 0;


setupVertexColoredPaths = function(pathElements)
{
    console.log("    in setupVertexColoredPaths");
    pathElements.each(function(index,pathElement) {

        pathElement = jQuery(pathElement);
        var dAttr = pathElement.attr('d');
        var colorsAttr = pathElement.attr('vertex-colors');
        var alphasAttr = pathElement.attr('vertex-opacities');

        if (typeof dAttr === 'undefined') dAttr = null;
        if (typeof colorsAttr === 'undefined') colorsAttr = null;
        if (typeof alphasAttr === 'undefined') alphasAttr = null;

        if (dAttr === null)
        {
            window.alert("ERROR: path has no 'd' attr!");
            return null;
        }
        if (colorsAttr !== null)
            var colors = jQuery.trim(colorsAttr).split(/(?:,|\s)+/);
        if (alphasAttr !== null)
            var alphas = jQuery.trim(alphasAttr).split(/(?:,|\s)+/);

        if (colorsAttr === null && alphasAttr === null)
        {
            // nothing to do!
            window.alert("ERROR: vertexColorizePath has no vertex colors nor vertex opacities!");
            return pathElement;
        }

        var dTokens = jQuery.trim(dAttr).split(/(?:,|\s)+/);
        if (dTokens.length === 0)
        {
            window.alert("ERROR: empty d attr: \""+dAttr+"\"");
            return null;
        }
        if (dTokens.length % 3 !== 0)
        {
            window.alert("ERROR: d attr has length "+dTokens.length+" that's not a multiple of 3: \""+dAttr+"\"");
            return null;
        }
        var nVerts = dTokens.length / 3;
        if (colorsAttr !== null
         && colors.length !== nVerts)
        {
            window.alert("ERROR: d attr implies "+nVerts+" verts but colors attr implies "+colors.length+" verts");
            return null;
        }
        if (alphasAttr !== null
         && alphas.length !== nVerts)
        {
            window.alert("ERROR: d attr implies "+nVerts+" verts but alphas attr implies "+alphas.length+" verts");
            return null;
        }

        if (dTokens[0] !== 'M')
        {
            window.alert("ERROR: first command is not 'M' in d attr: \""+dAttr+"\"");
            return null;
        }

        var NS="http://www.w3.org/2000/svg";

        var subPaths = [];
        var gradients = [];
        for (var iVert = 1; iVert < nVerts; ++iVert) // yes, skip 0
        {
            var command = dTokens[3*iVert];

            if (command === 'M')
            {
                // nothing
            }
            else if (command === 'L')
            {
                var zeropad = function(number,width) {
                    var answer = ""+number;
                    while (answer.length < width) answer = "0" + answer;
                    return answer;
                };
                var gradientId = "vertexColors"+zeropad(global_numberOfGradientIdsEver++, 6);
                var gradient;
                {
                    gradient = document.createElementNS(NS, "linearGradient");
                    gradient.setAttribute("gradientUnits", "userSpaceOnUse");
                    var stop0 = document.createElementNS(NS, "stop");
                    var stop1 = document.createElementNS(NS, "stop");
                    stop0.setAttribute("offset", "0%");
                    stop1.setAttribute("offset", "100%");
                    gradient.appendChild(stop0);
                    gradient.appendChild(stop1);
                }
                gradient.setAttribute("id", gradientId);
                gradients.push(gradient);

                var subPath;
                {
                    subPath = pathElement.clone();

                    subPath.attr("class", "vertexColoredPathSegment");

                    subPath.removeAttr('vertex-colors');
                    subPath.removeAttr('vertex-opacities');
                    subPath.attr('stroke', "url(#"+gradientId+")");
                    // apparently stroke-opacity is ignored if stroke is set to a gradient,
                    // but unset it anyway...
                    subPath.removeAttr('stroke-opacity');

                    subPath.attr('d', "M 0 0 1 1");
                }
                subPaths.push(subPath);
            }
            else
            {
                window.alert("ERROR: unexpected command '"+command+"' in d attr: \""+dAttr+"\"");
                return null;
            }
        }

        var container = document.createElementNS(NS, "g");
        container.setAttribute("class", "vertexColoredPathSegments");
        var defs = document.createElementNS(NS, "defs");
        for (var i in gradients)
            defs.appendChild(gradients[i]);
        container.appendChild(defs);
        for (var i in subPaths)
            container.appendChild(subPaths[i][0]);
        pathElement.after(container); // insert container after pathElement


        pathElement.hide();

        //console.log("    gradients = ",gradients);
        //console.log("    subPaths = ",subPaths);
    }); // each pathElement

    updateVertexColoredPaths(pathElements,
                             true,
                             true,
                             true);

    console.log("    out setupVertexColoredPaths");
    return undefined;
} // setupVertexColoredPaths

updateVertexColoredPaths = function(pathElements,
                                    updatePositionsFlag,
                                    updateColorsFlag,
                                    updateAlphasFlag)
{
    pathElements.each(function(index,pathElement) {

        pathElement = jQuery(pathElement);
        var dAttr = pathElement.attr('d');
        var dTokens = jQuery.trim(dAttr).split(/(?:,|\s)+/);
        if (dTokens.length % 3 !== 0) throw "ERROR: number of tokens in d attr is "+dTokens.length+" which is not a multiple of 3: "+dAttr;
        var nVerts = dTokens.length / 3;

        var colors = null;
        if (updateColorsFlag)
        {
            var colorsAttr = pathElement.attr('vertex-colors');
            if (typeof colorsAttr !== 'undefined')
            {
                colors = jQuery.trim(colorsAttr).split(/(?:,|\s)+/);
                if (colors.length !== nVerts) throw "ERROR: d attr \""+dAttr+"\" implies "+nVerts+" verts but colors attr \""+colorsAttr+"\"implies "+colors.length+" verts";
            }
            else
            {
                var strokeAttr = pathElement.attr('stroke');
                if (typeof strokeAttr != 'undefined')
                    colors = [strokeAttr];
            }
        }
        var alphas = null;
        if (updateAlphasFlag)
        {
            var alphasAttr = pathElement.attr('vertex-opacities');
            if (typeof alphasAttr !== 'undefined')
            {
                alphas = jQuery.trim(alphasAttr).split(/(?:,|\s)+/);
                if (alphas.length !== nVerts) throw "ERROR: d attr \""+dAttr+"\" implies "+nVerts+" verts but alphas attr \""+alphasAttr+"\"implies "+alphas.length+" verts";
            }
            else
            {
                var opacityAttr = pathElement.attr('stroke-opacity');
                if (typeof opacityAttr != 'undefined')
                    alphas = [opacityAttr];
            }
        }

        var currentGradientElement = jQuery(pathElement.next()[0].firstChild.firstChild);
        var currentSegElement = jQuery(pathElement.next()[0].firstChild.nextSibling);
        for (var iVert = 1; iVert < nVerts; ++iVert) // skip 0
        {
            var command = dTokens[3*iVert];
            if (command === 'L')
            {
                if (currentGradientElement[0].tagName != 'linearGradient') throw "ERROR: expected a linearGradient element, got a "+currentGradientElement[0].tagName;
                if (colors !== null || alphas !== null)
                {
                    var stops = currentGradientElement.children();
                    if (stops.length != 2)
                        throw "ERROR: expected 2 stops in linear gradient, got "+stops.length+"";
                    if (colors !== null)
                    {
                        jQuery(stops[0]).attr('stop-color', colors[(iVert-1)%colors.length]);
                        jQuery(stops[1]).attr('stop-color', colors[iVert%colors.length]);
                    }
                    if (alphas !== null)
                    {
                        jQuery(stops[0]).attr('stop-opacity', alphas[(iVert-1)%alphas.length]);
                        jQuery(stops[1]).attr('stop-opacity', alphas[iVert%alphas.length]);
                    }
                }
                if (updatePositionsFlag)
                {
                    if (currentSegElement[0].tagName != 'path') throw "ERROR: expected a path element, got a "+currentSegElement[0].tagName;
                    var x1      = dTokens[3*iVert-2];
                    var y1      = dTokens[3*iVert-1];
                    var x2      = dTokens[3*iVert+1];
                    var y2      = dTokens[3*iVert+2];

                    currentSegElement.attr("d", "M "+x1+" "+y1+" L "+x2+" "+y2);

                    currentGradientElement.attr("x1", x1);
                    currentGradientElement.attr("y1", y1);
                    currentGradientElement.attr("x2", x2);
                    currentGradientElement.attr("y2", y2);
                }
                currentGradientElement = currentGradientElement.next();
                currentSegElement = currentSegElement.next();
            }
        }
    }); // each pathElement
} // updateVertexColoredPaths
