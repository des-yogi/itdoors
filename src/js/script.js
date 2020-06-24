// const ready = require('./utils/documentReady.js');

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
    } else {
      header.removeClass('out');
    }
    scrollPrev = scrolled;
  });
});
