'use strict';

/* color conversions curtesy of https://gist.github.com/mjackson/5311256 */

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

$(function(){
    let anchorRatio = 0.999; //how far along the side of the previous shape to draw
    let target = $('canvas');

        let context = target[0].getContext('2d');
    let initWidth = 1000;
    let initHeight = 1000;

    let currentColor = [Math.random(), 1.0, 1.0];

    let drawLineInNextColor = (x, y) => {
        currentColor[0] = (currentColor[0] + 1/10000) % 1.0;
        let currentAsRgb = hsvToRgb(currentColor[0], currentColor[1], currentColor[2]).map((x) => Math.round(x));
        context.fillStyle = 'rgb('+currentAsRgb.join(', ')+')';
        context.strokeStyle = 'rgb('+currentAsRgb.join(', ')+')';
        context.lineTo(x, y);
        context.stroke();

        //set a new path so each is in a different color
        context.beginPath();
        context.moveTo(x,y);
    };



    let generateFractalFrame = (id, prevShape) => {
        let newShape = [];
        let xDiff;
        let yDiff;
        for(let curIdx = 0; curIdx < prevShape.length; ++curIdx) {
            let nextIdx = curIdx < prevShape.length-1 ? curIdx+1 : 0;
            xDiff = prevShape[nextIdx][0] - prevShape[curIdx][0];
            yDiff = prevShape[nextIdx][1] - prevShape[curIdx][1];
            let newXDiff = xDiff*anchorRatio;
            let newYDiff = yDiff*anchorRatio;

            let nextX = prevShape[curIdx][0]+newXDiff;
            let nextY = prevShape[curIdx][1]+newYDiff;

            newShape.push([nextX, nextY]);

            //draw the next point
            drawLineInNextColor(nextX, nextY);
        }

        drawLineInNextColor(newShape[0][0], newShape[0][1]);

        if ((Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1) && id == curFractalId) {
            window.requestAnimationFrame(() => generateFractalFrame(id, newShape));
        }
    };

    let initialShape = [
        [0,0],
        [0,1000],
        [1000,1000],
        [1000, 0]
    ];
    var curFractalId = 0;

    let drawFractal = () => {
        curFractalId = curFractalId + 1 % 1000; //so that it doesn't bug out/overflow; more than 1000 highly rapid async resizes would likely crash anyway?
        window.requestAnimationFrame(() => {

            context.clearRect(0,0,initWidth,initHeight)

            context.moveTo(initialShape[0][0], initialShape[0][1]);

            for(let i = 1; i < initialShape.length; ++i) {
                drawLineInNextColor(initialShape[i][0], initialShape[i][1]);
            }

            drawLineInNextColor(initialShape[0][0], initialShape[0][1]);

            window.requestAnimationFrame(() => {generateFractalFrame(curFractalId, initialShape)});
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
            drawFractal();
            //update the cached size info to match the new stuff
            // width = newWidth;
            // height = newHeight;
        }
    );

    $(window).resize(); //call this to initialise the canvas size
});
