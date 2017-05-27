'use strict';

/* color conversions curtesy of https://gist.github.com/mjackson/5311256 */

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255 ];
}


/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, v ];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ r * 255, g * 255, b * 255 ];
}

//create perfectly regular shapes by taking advantage of the triganometry!
function createRegularShape(radius, numSides, initX, initY) {
    let result = [];
    let arcSize = (2/numSides)*Math.PI;

    let theta = 0;
    for (let n = 0; n < numSides; ++n) {
        result.push([initX+(radius*Math.cos(theta)), initY+(radius*Math.sin(theta))]);
        theta += arcSize;
    }
    return result;
}

/* gaussian random curtesy of http://stackoverflow.com/a/36481059 */
function randn_bm() {
    var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
    var v = 1 - Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

$(function(){
    let initialAnchorRatio = 0.99; //how far along the side of the previous shape to draw
    var curFractalId = 0;
    let initWidth = 1000;
    let initHeight = 1000;
    let currentColor = [Math.random(), 1.0, 1.0];
    let initialShape = createRegularShape(Math.min(initWidth, initHeight)/2, 7, initWidth/2, initHeight/2);

    let target = $('canvas');
    let context = target[0].getContext('2d');
    var colourSwitch = false;

    let lineCount = 0;
    // let hueShift = 1.01/initialShape.length;
    // let hueShift = 1.00006/initialShape.length * ( colourSwitch ? 1.1 : 1);
    // let hueShift = 1/initialShape.length;
    // let hueShift = 0;
    let hueShift = 1/(2.15*initialShape.length*100);

    let startLineAt = (x, y) => {
        context.beginPath();
        context.moveTo(x,y);
    }

    let drawLineInNextColor = (x, y) => {

        // currentColor[0] = (currentColor[0] + hueShift) % 1.0;
        if (lineCount % (initialShape.length+1) == 0) {
            currentColor[0] = (currentColor[0] + hueShift) % 1.0;
        }

        // if (lineCount % (initialShape.length*100) == 0) {
        //     hueShift = -hueShift;
        // }
        let currentAsRgb = hsvToRgb(currentColor[0], currentColor[1], currentColor[2]).map((x) => Math.round(x));

        context.strokeStyle = 'rgb('+currentAsRgb.join(', ')+')';

        context.lineTo(x, y);
        // if (lineCount % (initialShape.length/3) == 0) {
            context.stroke();
        // }
        //set a new path so each is in a different color
        startLineAt(x, y);

        lineCount += 1;
    };

    let waveAnchor = (function() {
        let currentAnchor = initialAnchorRatio;
        let goingUp = false;
        let stepSize = 0.00005;
        let stepLimit = 100;
        let curStep = 0;
        return () => {
            if(curStep < stepLimit) {
                colourSwitch = false;
                // if(curStep > 10) {
                    if (goingUp) {
                        currentAnchor += stepSize;
                    } else {
                        currentAnchor -= stepSize;
                    }
                // }
                curStep += 1;
            } else {
                goingUp = !goingUp;

                if (!goingUp) {
                    colourSwitch = true;
                }
                curStep = 0;
            }
            if (currentAnchor < 0) {
                currentAnchor += 1;
            } else if (currentAnchor > 1) {
                currentAnchor -= 1;
            }
            return currentAnchor;
        };
    })();

    let flippingAnchor = (function() {
        let currentAnchor = initialAnchorRatio;
        let goingUp = false;
        let stepLimit = 500;
        let curStep = 0;
        return () => {
            if(curStep < stepLimit) {
                curStep += 1;
            } else {
                curStep = 0;
                currentAnchor = 1-currentAnchor;
            }
            return currentAnchor;
        };
    })();

    //returns whether or not to continue
    let drawSubShape = (prevShape) => {
        //.999/.001 is roughly the limit for avoiding rounding issues
        // let currentAnchorRatio = waveAnchor();
        let currentAnchorRatio = initialAnchorRatio;
        let newShape = [];
        let xDiff;
        let yDiff;
        let curIdx = 0; //start pos
        // startLineAt(prevShape[curIdx][0], prevShape[curIdx][1]);
        for(let i = 0; i < prevShape.length; ++i) {
            let nextIdx = curIdx < prevShape.length-1 ? curIdx+1 : 0;
            xDiff = prevShape[nextIdx][0] - prevShape[curIdx][0];
            yDiff = prevShape[nextIdx][1] - prevShape[curIdx][1];
            let newXDiff = xDiff*currentAnchorRatio;
            let newYDiff = yDiff*currentAnchorRatio;

            let nextX = prevShape[curIdx][0]+newXDiff;
            let nextY = prevShape[curIdx][1]+newYDiff;

            newShape.push([nextX, nextY]);

            //draw the next point
            drawLineInNextColor(nextX, nextY);

            //step to the next point, cycling back if neccessary
            curIdx = (curIdx + 1) % prevShape.length;
        }

        drawLineInNextColor(newShape[0][0], newShape[0][1]);

        if ((Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1)) {
            return newShape;
        } else {
            return null;
        }
    };
    // //rectangle
    // let initialShape = [
    //     [100, 300],
    //     [100, 700],
    //     [900, 700],
    //     [900, 300]
    // ];


    let drawFractal = () => {
        curFractalId = curFractalId + 1 % 1000; //so that it doesn't bug out/overflow; more than 1000 highly rapid async resizes would likely crash anyway?
        window.requestAnimationFrame(() => {
            startLineAt(initialShape[0][0], initialShape[0][1]);
            for(let i = 1; i < initialShape.length; ++i) {
                drawLineInNextColor(initialShape[i][0], initialShape[i][1]);
            }

            drawLineInNextColor(initialShape[0][0], initialShape[0][1]);

            let drawShapesPerFrame = (id, prevShape) => {
                window.requestAnimationFrame(
                    () => {
                        let eachShape = prevShape;
                        for (let i = 0; eachShape && i < eachShape.length; ++i) {
                            eachShape = drawSubShape(eachShape);
                        }
                        if (eachShape && id == curFractalId) {
                            drawShapesPerFrame(id, eachShape);
                        } else {
                            // context.beginPath();
                            // drawShapesPerFrame(id, initialShape);
                            drawFractal();
                        }
                    }
                );
            };

            drawShapesPerFrame(curFractalId, initialShape);
        });
    };

    let width = initWidth;
    let height = initHeight;

    $(window).resize(
        () => {
            /* curtesy/thanks to http://www.andy-howard.com/how-to-resize-kinetic-canvas-and-maintain-the-aspect-ratio/ for the idea of the scaling etc)*/
            let maxWidth = window.innerWidth-10; // Max width for the image
            let maxHeight = window.innerHeight-10; // Max height for the image

            let newHeight, newWidth;
            let scaleX, scaleY;
            if (maxHeight != height || maxWidth != width) {
                let ratio = 0; // Used for aspect ratio

                if (maxWidth < maxHeight) {
                    let ratio = maxWidth / initWidth;
                    newWidth = maxWidth;
                    newHeight = initHeight * ratio;
                } else {
                    let ratio = maxHeight / initHeight;
                    newHeight = maxHeight;
                    newWidth = initWidth * ratio;
                }

                scaleX = newWidth / initWidth;
                scaleY = newHeight / initHeight;
            } else {
                newWidth = initWidth;
                newHeight = initHeight;
                scaleX = 1;
                scaleY = 1;
            }

            context.canvas.width = newWidth;
            context.canvas.height = newHeight;
            context.scale(scaleX, scaleY); /* This is always new canvas height / old canvas height */

            context.clearRect(0,0,initWidth,initHeight)
            context.beginPath();
            context.moveTo(initialShape[0][0], initialShape[0][1]);

            drawFractal();
            //update the cached size info to match the new stuff
            // width = newWidth;
            // height = newHeight;
        }
    );

    $(window).resize(); //call this to initialise the canvas size
});
