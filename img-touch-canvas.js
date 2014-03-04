/*
=================================
img-touch-canvas - v0.1
http://github.com/rombdn/img-touch-canvas

(c) 2013 Romain BEAUDON
This code may be freely distributed under the MIT License
=================================
*/


(function() {
    var root = this; //global object

    var ImgTouchCanvas = function(options) {
        if( !options || !options.canvas || !options.path) {
          console.log(options.canvas);
            throw 'ImgZoom constructor: missing arguments canvas or path';
        }

        this.scope = options.scope;
        //this.photoService = options.photoService;
        //this.location = options.location;
        this.canvas         = options.canvas;
        this.canvas.width   = options.width;
        console.log(this.canvas.width + " " + this.canvas.clientHeight);
//        this.canvas.height  = this.canvas.clientHeight;
        this.canvas.height = options.height;
        this.context        = this.canvas.getContext('2d');
        this.selectionWidth = options.selectionWidth;
        this.selectionHeight = options.selectionHeight;

        this.desktop = options.desktop || false; //non touch events
        
        this.position = {
            x: 0,
            y: 0
        };
        this.scale = {
            x: 0.5,
            y: 0.5
        };
        this.imgTexture = new Image();
        this.imgTexture.src = options.path;
        var self = this;
        this.imgTexture.onload = function()
        {
              var width = this.naturalWidth;
              //alert(width);
            self.checkRequestAnimationFrame();
            requestAnimationFrame(self.animate.bind(self));

            self.setEventListeners();
        };
        //this.imgTexture.width = options.selectionWidth;
        this.lastZoomScale = null;
        this.lastX = null;
        this.lastY = null;
        this.selection = null;

        this.mdown = false; //desktop drag

        this.init = false;
    //    var selection = this.selection;
    };

    // define Selection constructor
    function Selection(x, y, w, h){
        this.x = x; // initial positions
        this.y = y;
        this.w = w; // and size
        this.h = h;

        this.px = x; // extra variables to dragging calculations
        this.py = y;

        this.csize = 6; // resize cubes size
        this.csizeh = 10; // resize cubes size (on hover)

        this.bHow = [false, false, false, false]; // hover statuses
        this.iCSize = [this.csize, this.csize, this.csize, this.csize]; // resize cubes sizes
        this.bDrag = [false, false, false, false]; // drag statuses
        this.bDragAll = false; // drag whole selection
        this.maskCanvas = document.createElement('canvas');
    }

    // define Selection draw method
    Selection.prototype.draw = function(ctx, image, scale, canvas){

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        //ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        //ctx.fillRect(this.x, this.y, this.w, this.h);

        // draw part of original image
        if (this.w > 0 && this.h > 0) {

            //ctx.drawImage(image, this.x, this.y, this.w, this.h, this.x, this.y, this.w * scale.x, this.h * scale.y);
        }
        /*ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.getWidth(), this.y);
        ctx.fillRect(0, this.y, this.x, this.h);
        ctx.fillRect(this.x, this.y, canvas.getWidth(), this.h);
        ctx.fillRect(0, this.h, canvas.getWidth(), canvas.getHeight());*/
        // Create a canvas that we will use as a mask
        maskCanvas = this.maskCanvas;
        // Ensure same dimensions
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        var maskCtx = maskCanvas.getContext('2d');

        // This color is the one of the filled shape
        //maskCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
        // Fill the mask
        //maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        // Set xor operation
        //maskCtx.globalCompositeOperation = 'xor';
        // Draw the shape you want to take out
        maskCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
        console.log(this.y - (maskCanvas.height - this.h)/2);
        console.log('maskCanvas Width + ' + this.y - (maskCanvas.height - this.h)/2);
        maskCtx.fillRect(0, 0, (maskCanvas.width - this.w)/2, maskCanvas.height);
        maskCtx.fillRect(this.x, this.y + this.h, this.w, (maskCanvas.height - this.h)/2);
         maskCtx.fillRect(this.x, 0, this.w, (maskCanvas.height-this.h)/2);
        maskCtx.fillRect(this.x + this.w, this.y - (maskCanvas.height - this.h)/2, (maskCanvas.height-this.h)/2, maskCanvas.height);
 //       maskCtx.fillRect(0, this.h, maskCanvas.width, maskCanvas.height);
        //maskCtx.fillRect(this.x, this.y, this.w, this.h);
        maskCtx.fill();
        // draw resize cubes
        /*ctx.fillStyle = '#fff';
        ctx.fillRect(this.x - this.iCSize[0], this.y - this.iCSize[0], this.iCSize[0] * 2, this.iCSize[0] * 2);
        ctx.fillRect(this.x + this.w - this.iCSize[1], this.y - this.iCSize[1], this.iCSize[1] * 2, this.iCSize[1] * 2);
        ctx.fillRect(this.x + this.w - this.iCSize[2], this.y + this.h - this.iCSize[2], this.iCSize[2] * 2, this.iCSize[2] * 2);
        ctx.fillRect(this.x - this.iCSize[3], this.y + this.h - this.iCSize[3], this.iCSize[3] * 2, this.iCSize[3] * 2);
        */
    };

    ImgTouchCanvas.prototype = {
        animate: function() {
            //set scale such as image cover all the canvas
            if(!this.init) {
              console.log(this.imgTexture.naturalWidth);
                if(this.imgTexture.width) {
                    var scaleRatio = null;
                    console.log(this.imgTexture.width);
                    if(this.canvas.clientWidth > this.canvas.clientHeight) {
                        scaleRatio = this.canvas.clientWidth / this.imgTexture.width;
                    }
                    else {
                        scaleRatio = this.canvas.clientHeight / this.imgTexture.height;
                    }

                    this.scale.x = scaleRatio;
                    this.scale.y = scaleRatio;
                }
                console.log((this.canvas.clientWidth - this.selectionWidth)/2 + " x");
                console.log((this.canvas.clientHeight - this.selectionHeight)/2 + " y");
                  this.selection = new Selection((this.canvas.clientWidth - this.selectionWidth)/2, (this.canvas.clientHeight - this.selectionHeight)/2, this.selectionWidth, this.selectionHeight);
                var selection = this.selection;
                //this.photoService.selection = this.selection;

                //this.photoService.scale = this.scale;
                var imgTexture = this.imgTexture;
                var scale = this.scale;
                var scope = this.scope;
                var canvas = this.canvas;
                
                /*$("#btn-crop").on('click', function(e){
                  console.log('click');
                  var temp_ctx, temp_canvas;
                  var theSelection = selection;
                  temp_canvas = document.createElement('canvas');
                  temp_ctx = temp_canvas.getContext('2d');
                  temp_canvas.width = theSelection.w;
                  temp_canvas.height = theSelection.h;
                  //var imageData = temp_ctx.getImageData(theSelection.x, theSelection.y, theSelection.w, theSelection.h);
                  var img = new Image();
                  img.src = canvas.toDataURL();
                  //img.src = canvas.toDataURL();
                  img.onload = function() {
                    temp_ctx.drawImage(img, theSelection.x, theSelection.y, theSelection.w, theSelection.h, 0, 0, theSelection.w * scale.x, theSelection.h * scale.y);
                  console.log(canvas);
                    var vData = temp_canvas.toDataURL();
                    //console.log(imageData);
                    scope.$apply(function(){scope.resultSrc = vData;});
                    //photoService.setImage(vData);
                  };
                  
                 // $('#crop_result').attr('src', vData);
                });*/
                this.selection.draw(this.context, this.imgTexture, this.scale, this.canvas);
                this.init=true;
            }

            //this.context.fillStyle = 'rgba(255, 255, 255, 1)';
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.canvas.style.display = 'none';// Detach from DOM
            this.canvas.offsetHeight; // Force the detach
            this.canvas.style.display = 'inherit'; // Reattach to DOM
            this.canvas.style.opacity = 0.99;
            /*var canvas1 = this.canvas;
            setTimeout(function() {
              canvas1.style.opacity = 1;
            }, 1);*/
  //console.log("clearing");
            this.context.drawImage(
                this.imgTexture, 
                this.position.x, this.position.y, 
                this.scale.x * this.imgTexture.width, 
                this.scale.y * this.imgTexture.height);

           /*this.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.context.fillRect(this.position.x, this.position.y, 
                this.scale.x * this.imgTexture.width, 
                this.scale.y * this.imgTexture.height);*/
//                   console.log((this.canvas.clientWidth - 200)/2);
 //                  console.log((this.canvas.clientHeight - 200)/2);
                   
                 // this.selection.draw(this.context, this.imgTexture, this.scale, this.canvas);
        this.context.drawImage(this.selection.maskCanvas, 0, 0);
            requestAnimationFrame(this.animate.bind(this));
        },


        gesturePinchZoom: function(event) {
            var zoom = false;

            if( event.targetTouches.length >= 2 ) {
                var p1 = event.targetTouches[0];
                var p2 = event.targetTouches[1];
                var zoomScale = Math.sqrt(Math.pow(p2.pageX - p1.pageX, 2) + Math.pow(p2.pageY - p1.pageY, 2)); //euclidian distance

                if( this.lastZoomScale ) {
                    zoom = zoomScale - this.lastZoomScale;
                }

                this.lastZoomScale = zoomScale;
            }    

            return zoom;
        },

        doZoom: function(zoom) {
            if(!zoom) return;
            //new scale
            var currentScale = this.scale.x;
            console.log(currentScale + ' current scale');
            var newScale = this.scale.x + zoom/100;
            console.log(newScale + ' new scale');

            //some helpers
            var deltaScale = newScale - currentScale;
            var currentWidth    = (this.imgTexture.width * this.scale.x);
            var currentHeight   = (this.imgTexture.height * this.scale.y);
            var deltaWidth  = this.imgTexture.width*deltaScale;
            var deltaHeight = this.imgTexture.height*deltaScale;
            //console.log(deltaScale + " deltaScale");
            //console.log(currentWidth+ " currentWidth");
            //console.log(deltaWidth + " deltaWidth");

            //by default scale doesnt change position and only add/remove pixel to right and bottom
            //so we must move the image to the left to keep the image centered
            //ex: coefX and coefY = 0.5 when image is centered <=> move image to the left 0.5x pixels added to the right
            var canvasmiddleX = this.canvas.clientWidth / 2;
            var canvasmiddleY = this.canvas.clientHeight / 2;
            var xonmap = (-this.position.x) + canvasmiddleX;
            var yonmap = (-this.position.y) + canvasmiddleY;
            var coefX = -xonmap / (currentWidth);
            var coefY = -yonmap / (currentHeight);
            var newPosX = this.position.x + deltaWidth*coefX;
            var newPosY = this.position.y + deltaHeight*coefY;
            
            //console.log(this.scale.x + " this.scale.x");
            //console.log(deltaHeight + " delta height");
            //edges cases
            var newWidth = currentWidth + deltaWidth;
            var newHeight = currentHeight + deltaHeight;
            
            if( newWidth < this.selection.w ) return;
            /*if( newPosX > 0 ) { newPosX = 0; }
            if( newPosX + newWidth < this.canvas.clientWidth ) { newPosX = this.canvas.clientWidth - newWidth;}
            */
            if( newHeight < this.selection.h ) return;
            /*if( newPosY > 0 ) { newPosY = 0; }
            if( newPosY + newHeight < this.canvas.clientHeight ) { newPosY = this.canvas.clientHeight - newHeight; }
            */


            //finally affectations
            this.scale.x    = newScale;
            this.scale.y    = newScale;
            this.position.x = newPosX;
            this.position.y = newPosY;
        },

        doMove: function(relativeX, relativeY) {
            if(this.lastX && this.lastY) {
              var deltaX = relativeX - this.lastX;
              var deltaY = relativeY - this.lastY;
              var currentWidth = (this.imgTexture.width * this.scale.x);
              var currentHeight = (this.imgTexture.height * this.scale.y);

              this.position.x += deltaX;
              this.position.y += deltaY;


              //edge cases
              /*if( this.position.x > 0 ) {
                this.position.x = 0;
              }
              else if( this.position.x + currentWidth < this.canvas.clientWidth ) {
                this.position.x = this.canvas.clientWidth - currentWidth;
              }*/
              /*if( this.position.y > 0 ) {
                this.position.y = 0;
              }
              else if( this.position.y + currentHeight < this.canvas.clientHeight ) {
                this.position.y = this.canvas.clientHeight - currentHeight;
              }*/
            }

            this.lastX = relativeX;
            this.lastY = relativeY;
        },

        setEventListeners: function() {
            // touch
            this.canvas.addEventListener('touchstart', function(e) {
                this.lastX          = null;
                this.lastY          = null;
                this.lastZoomScale  = null;
            }.bind(this));

            this.canvas.addEventListener('touchmove', function(e) {
                e.preventDefault();
                
                if(e.targetTouches.length == 2) { //pinch
                    this.doZoom(this.gesturePinchZoom(e));
                }
                else if(e.targetTouches.length == 1) {
                    var relativeX = e.targetTouches[0].pageX - this.canvas.getBoundingClientRect().left;
                    var relativeY = e.targetTouches[0].pageY - this.canvas.getBoundingClientRect().top;                
                    this.doMove(relativeX, relativeY);
                }
            }.bind(this));

            if(this.desktop) {
                // keyboard+mouse
                window.addEventListener('keyup', function(e) {
                    if(e.keyCode == 187 || e.keyCode == 61) { //+
                        this.doZoom(5);
                    }
                    else if(e.keyCode == 54) {//-
                        this.doZoom(-5);
                    }
                }.bind(this));

                window.addEventListener('mousedown', function(e) {
                    this.mdown = true;
                    this.lastX = null;
                    this.lastY = null;
                }.bind(this));

                window.addEventListener('mouseup', function(e) {
                    this.mdown = false;
                }.bind(this));

                window.addEventListener('mousemove', function(e) {
                    var relativeX = e.pageX - this.canvas.getBoundingClientRect().left;
                    var relativeY = e.pageY - this.canvas.getBoundingClientRect().top;

                    if(e.target == this.canvas && this.mdown) {
                        this.doMove(relativeX, relativeY);
                    }

                    if(relativeX <= 0 || relativeX >= this.canvas.clientWidth || relativeY <= 0 || relativeY >= this.canvas.clientHeight) {
                        this.mdown = false;
                    }
                }.bind(this));
            }
        },

        checkRequestAnimationFrame: function() {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
                window.cancelAnimationFrame = 
                  window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                      timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }

            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
            }
        }
    };
    root.ImgTouchCanvas = ImgTouchCanvas;
}).call(this);
