/**
 * Endless Scroll plugin for jQuery
 *
 * v1.5.1
 *
 * Copyright (c) 2008-2012 Fred Wu
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

/**
 * Usage:
 *
 * // using default options
 * $(window).endlessScroll();
 *
 * // using some custom options
 * $(window).endlessScroll({
 *   fireOnce: false,
 *   callback: function(done){
 *      setTimeout(function(){
 *          alert('scroll fire');
 *          done();
 *      }, 10);
 *   }
 * });
 *
 * Configuration options:
 *
 * bottomPixels      integer          the number of pixels from the bottom of the page that triggers the event
 * fireOnce          boolean          only fire once until the execution of the current event is completed
 * callback          function         callback function, accepts two arguments: callback that must be called
 *                                    in order to recieve another scroll event, and a fire sequence (the number of times
 *                                    the event triggered during the current page session)
 * resetCounter      function         resets the fire sequence counter if the function returns true, this function
 *                                    could also perform hook actions since it is applied at the start of the event
 * ceaseFire         function         stops the event (no more endless scrolling) if the function returns true,
 *                                    accepts one argument: fire sequence
 * intervalFrequency integer          set the frequency of the scroll event checking, the larger the frequency number,
 *                                    the less memory it consumes - but also the less sensitive the event trigger becomes
 *
 * Usage tips:
 *
 * The plugin is more useful when used with the callback function, which can then make AJAX calls to retrieve content.
 * The fire sequence argument (for the callback function) is useful for 'pagination'-like features.
 */

(function($){

    $.fn.endlessScroll = function(options) {

        var defaults = {
            bottomPixels:      50,
            fireOnce:          false,
            fireDelay:         150,
            resetCounter:      function() { return false; },
            callback:          function() { return true; },
            ceaseFire:         function() { return false; },
            intervalFrequency: 250
        };

        var options      = $.extend({}, defaults, options);
        var enabled      = true;
        var fireSequence = 0;
        var didScroll    = false;
        var scrollTarget = this;
        var scrollId     = "";
        var inner_wrap   = $(".endless_scroll_inner_wrap", this);
        var is_scrollable;

        $(this).scroll(function() {
            didScroll    = true;
            scrollTarget = this;
            scrollId     = $(scrollTarget).attr("id")
        });

        // use setInterval to improve scrolling performance: http://ejohn.org/blog/learning-from-twitter/
        setInterval(function() {
            if(!didScroll || !enabled){ return; }
            didScroll = false;

            if (options.ceaseFire.apply(scrollTarget, [fireSequence])) { enabled = false; return; }

            if (scrollTarget == document || scrollTarget == window) {
                is_scrollable = $(document).height() - $(window).height() <= $(window).scrollTop() + options.bottomPixels;
            } else {
                // calculates the actual height of the scrolling container
                if (inner_wrap.length == 0) {
                    inner_wrap = $(scrollTarget).wrapInner("<div class=\"endless_scroll_inner_wrap\" />").find(".endless_scroll_inner_wrap");
                }
                is_scrollable = inner_wrap.length > 0 && (inner_wrap.height() - $(scrollTarget).height() <= $(scrollTarget).scrollTop() + options.bottomPixels);
            }

            if(!is_scrollable){ return; }

            enabled = false;
            var nextFunction = function(){ enabled = true; };
            if(options.fireOnce){ nextFunction = function(){}; } 

            if (options.resetCounter.apply(scrollTarget)) { fireSequence = 0; }

            options.callback.apply(scrollTarget, [nextFunction, fireSequence++]);
        
        }, options.intervalFrequency);
    };

})(jQuery);
