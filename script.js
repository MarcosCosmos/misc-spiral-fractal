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
 * @param   Number  h       The calcHue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function calcHue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = calcHue2rgb(p, q, h + 1/3);
    g = calcHue2rgb(p, q, h);
    b = calcHue2rgb(p, q, h - 1/3);
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
 * @param   Number  h       The calcHue
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
function createRegularShape(radius, numSides, initX, initY, initTheta) {
    let result = [];
    let arcSize = (2/numSides)*Math.PI;

    let theta = initTheta;
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
/* frameLimiter curtesy of https://stackoverflow.com/a/19772220 */
function createFrameLimiter(fps) {
    var fpsInterval = 1000/fps;
    var then = false;
    var throttler = (callback) => {
        let now = Date.now();
        let elapsed = now - then;
        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);
            callback();
        } else {
            requestAnimationFrame(()=>{throttler(callback)});
        }
    };
    return throttler;
}

$(function(){
    let throttler = createFrameLimiter(60);
    let iterationsPerPattern = 0;
    let initialAnchorRatio = 0.001; //how far along the side of the previous shape to draw
    let runContinously = true;
    var curFractalId = 0;
    let initWidth = 1920;
    let initHeight = 1080;
    let numSides = 3;

    let target = $('canvas');
    let context = target[0].getContext('2d');

    let waveAnchor = (function() {
        let currentAnchor = initialAnchorRatio;
        let goingUp = false;
        let stepSize = 0.15;
        let stepLimit = 2;
        let curStep = 0;
        let colourSwitch = false;
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

    // let baseColor = [Math.random(), 1.0, 1.0];
    let baseColor = [Math.random(), 1.0, 1.0];
    let lineCount = 0;

    //NOTE: IMPORTANT: /(numSides-1 is the magic number that helps creates individual swirls because the start point for each spiral shifts to the next side each time)

    //NOTE: IMPORTANT: or /(iterationsPerPattern+numSides-1 is the magic number that helps creates individual swirls because the start point for each spiral shifts to the next side each time)



    let negateSideShift = (lineNumber) => ((lineNumber+(Math.floor(lineNumber/numSides)%numSides)));
    let calcHue;
    let iterationLimitAwareCalcHue = (lineNumber, doNegation, shiftScaler) => {
        doNegation = typeof(lineNumber) === 'undefined' ? false : doNegation;
        lineNumber = typeof(lineNumber) === 'undefined' ? lineCount : lineNumber;
        shiftScaler = typeof(shiftScaler) === 'undefined' ? 1 : shiftScaler;
        let adjustedLineNumber = doNegation ? negateSideShift(lineNumber) : lineNumber;
        // let result = (adjustedLineNumber/(numSides*iterationsPerPattern));
        let result = (((adjustedLineNumber%numSides)/numSides)) + (adjustedLineNumber/(numSides*iterationsPerPattern));
        result = (baseColor[0] + shiftScaler*result) % 1.0;
        return result;
    };

    let basicHue = (lineNumber, doNegation, shiftScaler) => {
        doNegation = typeof(lineNumber) === 'undefined' ? true : doNegation;
        lineNumber = typeof(lineNumber) === 'undefined' ? lineCount : lineNumber;
        shiftScaler = typeof(shiftScaler) === 'undefined' ? 1 : shiftScaler;
        let adjustedLineNumber = doNegation ? negateSideShift(lineNumber) : lineNumber;
        let result = (adjustedLineNumber/numSides);
        result = (baseColor[0] + shiftScaler*result) % 1.0;
        return result;
    };

    calcHue = iterationLimitAwareCalcHue;

    let drawLinePlain = (a, b) => {
        context.lineTo(b[0], b[1]);
        lineCount += 1;
    };
    let temp = 0;
    let drawLineInNextColor = (a, b) => {
        let currentAsRgb = hsvToRgb(calcHue(), baseColor[1], baseColor[2]).map((x) => Math.round(x));
        context.beginPath();
        context.moveTo(a[0], a[1]);
        context.strokeStyle = 'rgb('+currentAsRgb.join(', ')+')';
        drawLinePlain(a, b);
        context.stroke();
    };

    let drawLine;

    let drawShapePlain = (shape) => {
        //draw the lines
        for(let curIdx = 1; curIdx < shape.length; ++curIdx) {
            drawLine(shape[curIdx-1], shape[curIdx]);
        }
        drawLine(shape[shape.length-1], shape[0]);
    };

    let generateSubShape = (prevShape) => {
        let currentAnchorRatio = initialAnchorRatio;
        let newShape = [];
        let xDiff;
        let yDiff;
        //calculate the lines to draw
        for(let curIdx = 0; curIdx < prevShape.length; ++curIdx) {
            let nextIdx = curIdx < prevShape.length-1 ? curIdx+1 : 0;
            xDiff = prevShape[nextIdx][0] - prevShape[curIdx][0];
            yDiff = prevShape[nextIdx][1] - prevShape[curIdx][1];
            let newXDiff = xDiff*currentAnchorRatio;
            let newYDiff = yDiff*currentAnchorRatio;

            let nextPoint = [
                prevShape[curIdx][0]+newXDiff,
                prevShape[curIdx][1]+newYDiff
            ];
            newShape.push(nextPoint);
        }
        return [newShape, (Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1)];
    }

    //redundant iff using drawShapeInNextColor
    // drawNextLinePlain = (a, b) => {
    //     context.moveTo(a[0], a[1]);
    //     context.beginPath();
    //     drawLinePlain(a,b);
    // };

    let drawShapeInNextColor = (prevShape) => {
        context.beginPath();
        context.moveTo(stuff[0][0][0], stuff[0][0][1]);
        drawShape(stuff[0]);
        context.fill();
        let currentAsRgb = hsvToRgb(calcHue(), baseColor[1], baseColor[2]).map((x) => Math.round(x));
        context.strokeStyle = 'rgb('+currentAsRgb.join(', ')+')';
        context.fillStyle = 'rgb('+currentAsRgb.join(', ')+')';
        return stuff;
    };

    drawLine = drawLineInNextColor;

    let drawShape = drawShapePlain;

    let calcIterationsPerPattern = () => {
        let initTheta = 0;
        let initialShape = createRegularShape(Math.min(initWidth, initHeight)/2, numSides, initWidth/2, initHeight/2, initTheta);
        //calculate subShapes until the pattern is finished
        let eachShape = initialShape;
        let shouldContinue = true;
        let iterationCount = 1;
        while (shouldContinue) {
            let stuff = generateSubShape(eachShape);
            eachShape = stuff[0];
            shouldContinue = stuff[1];
            iterationCount += 1;
        };
        return iterationCount;
    };

    let drawFractal;

    let drawSpinningFractal = () => {
        curFractalId = curFractalId + 1 % 1000; //so that it doesn't bug out/overflow; more than 1000 highly rapid async resizes would likely crash anyway?
        let initTheta = 0;
        let oldBaseColor = baseColor[0];
        let work = () => {
            let initialShape = createRegularShape(Math.min(initWidth, initHeight)/2, numSides, initWidth/2, initHeight/2, initTheta);
            context.clearRect(0,0,initWidth,initHeight);
            drawShape(initialShape);
            //calculate subShapes until the pattern is finished
            let eachShape = initialShape;
            let shouldContinue = true;
            while(shouldContinue) {
                let stuff = generateSubShape(eachShape);
                eachShape = stuff[0];
                shouldContinue = stuff[1];
                drawShape(eachShape);
            };

            initTheta = (initTheta + (1/360)*(2*Math.PI)) % (2*Math.PI);
            iterationsPerPattern = calcIterationsPerPattern();
            baseColor[0] = oldBaseColor;
            baseColor[0] = (oldBaseColor - 1/360) % 1.0;
            oldBaseColor = baseColor[0];
            if(runContinously) {
                setTimeout( function() {
                    requestAnimationFrame(
                        () => {
                            throttler(work);
                        }
                    );
                }, 0);
            }
        };
        work();
    };
    // let frameCount = 0;

    let drawStaticFractal = () => {
        curFractalId = curFractalId + 1 % 1000; //so that it doesn't bug out/overflow; more than 1000 highly rapid async resizes would likely crash anyway?
        let initTheta = 0;
        let work = () => {
            let initialShape = createRegularShape(Math.min(initWidth, initHeight)/2, numSides, initWidth/2, initHeight/2, initTheta);
            context.clearRect(0,0,initWidth,initHeight);
            drawShape(initialShape);
            //draw subShapes until the pattern is finished
            let eachShape = initialShape;
            let shouldContinue = true;
            while (shouldContinue) {
                let stuff = generateSubShape(eachShape);
                eachShape = stuff[0];
                shouldContinue = stuff[1];
                drawShape(eachShape);
            };


            if(runContinously) {
                baseColor[0] = (calcHue(-1/60)) % 1.0;
                requestAnimationFrame(
                    () => {
                        throttler(work);
                    }
                );
            }
            // frameCount += 1;
            //
            // console.log(frameCount);
        };
        work();
    };

    drawFractal = drawSpinningFractal;

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

            context.clearRect(0,0,initWidth,initHeight);

            //if we need to calculate the number of iterations per full shape/pattern, do it first
            if (calcHue == iterationLimitAwareCalcHue) {
                iterationsPerPattern = calcIterationsPerPattern();
            }

            drawFractal();
            //update the cached size info to match the new stuff
            // width = newWidth;
            // height = newHeight;
        }
    );

    $(window).resize(); //call this to initialise the canvas size
});
