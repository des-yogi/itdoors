const ready = require('./utils/documentReady.js');

// ready(function(){
//   console.log('DOM героически построен!');
// });

const $ = require('jquery');

$( document ).ready(function() {
  var header = $('.page-header__inner'),
      scrollPrev = 0;

  $(window).scroll(function() {
    var scrolled = $(window).scrollTop();

    if ( scrolled > 100 && scrolled > scrollPrev ) {
      header.addClass('out');
    }
    else if ( scrolled > scrollPrev && scrolled != 0 ) {
      header.addClass('in-active');
    }
    else if ( scrolled < 100 ) {
      header.removeClass('in-active');
    }
    else {
      header.removeClass('out');
    }
    scrollPrev = scrolled;
  });
});

$( document ).ready(function() {
  const tilt = $('.js-tilt').tilt({
    perspective:    500, // чем больше цирфа, тем меньше искажение
    scale:          1.2,
    speed:          1500
  });
});

const SmoothScroll = require('smoothscroll-for-websites');
ready(function(){
  SmoothScroll({
    // Scrolling Core
    animationTime    : 1200,
    stepSize         : 100,
    // Acceleration
    accelerationDelta : 1,  // 50
    accelerationMax   : 0,   // 3
    // Other
    touchpadSupport   : false, // ignore touchpad by default
    fixedBackground   : false
  });
});

const Blazy = require('blazy');
ready(function(){
  var blazy = new Blazy({
    selector: '.b-lazy'
  });
});

/*import LazyLoad from "vanilla-lazyload";
ready(function(){
  var lazyLoad = new LazyLoad({
    elements_selector: '.lazy',
    //class_loaded: 'inst-loaded',
    callback_loaded: function () {
      console.log('img loaded');
    }
  });
});*/

