function SpriteScroll(options) {
  
    var i = 0, rowlength = options.rowlength, currentRow = 0, currentColumn = 0, debug = options.debug,
        scrollBounds = options.scrollBounds, scrollSpeed = options.scrollSpeed, scrollTop,
        element = document.getElementById(options.elementId);
    
    element.style.width = options.width + "px";
    element.style.height = options.height + "px";
    element.style.backgroundRepeat = "no-repeat";
    element.style.backgroundImage = "url(" + options.sprite + ")";
    element.style.backgroundPosition = "0 0";
   
    // Moves forward in the animation. Use this when you need to move frames based on something other than scrollTop
    this.stepForward = function() {
      if ( i >= options.frames) {
        return;
      }
      
      if (debug) {
          console.log("SpriteScroll ::::: stepForward column: " + currentColumn);
          console.log("SpriteScroll ::::: stepForward row: " + currentRow);
      }
      element.style.backgroundPosition = "-" + (currentColumn * options.width) + "px " + "-" + (currentRow * options.height) + "px";
       if (currentColumn != 0 && (currentColumn + 1) % options.rowlength == 0) {
        currentRow++;
        currentColumn = 0;
      }else {
        currentColumn++;
      }
     
      i++;
      
    };
    
    // Moves backward in the animation. Use this when you need to move frames based on something other than scrollTop
    this.stepBackward = function() {
      if ( i >= options.frames || i < 0) {
        return;
      }
      if (currentColumn == 0) {
        currentRow--;
        currentColumn = (options.rowlength - 1);
      }else {
        currentColumn--;
      }
      if (debug) {
          console.log("SpriteScroll ::::: stepBackward column: " + currentColumn);
          console.log("SpriteScroll ::::: stepBackward row: " + currentRow);
      }
      element.style.backgroundPosition = "-" + (currentColumn * options.width) + "px " + "-" + (currentRow * options.height) + "px";
      
      
      i--;
    };
    
    
    /** Check to see if we've scrolled past the maximum visible area for the animation.
     *  Clear the interval if we have.
     */
    var animationBounds = function(scrollTop) {
      return scrollTop > scrollBounds;
    };
    
    var determineFrame = function(scrollTop) {
      var trow = 0, tcol = 0;
      if (!animationBounds()) {
        // Grabbing the active sprite.
        var active_sprite = Math.floor(scrollTop / scrollSpeed);
        if (active_sprite > options.frames) 
          active_sprite = options.frames;
  
        if (debug) {
            console.log("SpriteScroll ::::: determineFrame active sprite: " + active_sprite);
        }
        // Determining where we should be in the sprite sheet.
        for (var i = 0; i < active_sprite; i++) {
          if (i != 0 && (i + 1) % options.rowlength == 0) {
            trow++;
            tcol = 0;
          }else {
            tcol++;
          }
        }
        if (debug) {
            console.log("SpriteScroll ::::: determineFrame tcol: " +  tcol);
            console.log("SpriteScroll ::::: determineFrame trow: " + trow);
        }
        setFrame(tcol, trow);
      }
    };
    
    // Set the sprite based on a column and row passed in from determineFrame
    var setFrame = function(column, row) {
      element.style.backgroundPosition = "-" + (column * options.width) + "px " + "-" + (row * options.height) + "px";
    }
    
    // Make sure that we're within the animation bounds, start the interval if we are.
    this.init = function() {
      jQuery(window).scroll(function() {
        scrollTop = jQuery(window).scrollTop();
        if (!animationBounds(scrollTop)) {
          // Animate forward for now
          determineFrame(scrollTop);
          $('.bsba-logo').removeClass('active');
          $('#bsba-logo-scroll').removeClass('inactive');
        } else {
          $('.bsba-logo').addClass('active');
          $('#bsba-logo-scroll').addClass('inactive');
  
        }
      });
    };
    
  }