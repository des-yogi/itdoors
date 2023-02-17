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
    selector: '.b-lazy',
    offset:   200
  });
  var vlazy = new Blazy({
    selector: '.lazy-video',
    offset:   300
  });
});

$(document).ready(function(){
  // Обработка положения фикс. эл-та в моб. варианте
  var targetElement = document.querySelector('#contact-us');

  var visible = function (target) {
    if (!target) { return; }
    // Все позиции элемента
    var targetPosition = {
        top: window.pageYOffset + target.getBoundingClientRect().top,
        left: window.pageXOffset + target.getBoundingClientRect().left,
        right: window.pageXOffset + target.getBoundingClientRect().right,
        bottom: window.pageYOffset + target.getBoundingClientRect().bottom
      },
      // Получаем позиции окна
      windowPosition = {
        top: window.pageYOffset,
        left: window.pageXOffset,
        right: window.pageXOffset + document.documentElement.clientWidth,
        bottom: window.pageYOffset + document.documentElement.clientHeight
      };

    if (targetPosition.bottom > windowPosition.top && // Если позиция нижней части элемента больше позиции верхней чайти окна, то элемент виден сверху
      targetPosition.top < windowPosition.bottom && // Если позиция верхней части элемента меньше позиции нижней чайти окна, то элемент виден снизу
      targetPosition.right > windowPosition.left && // Если позиция правой стороны элемента больше позиции левой части окна, то элемент виден слева
      targetPosition.left < windowPosition.right) { // Если позиция левой стороны элемента меньше позиции правой чайти окна, то элемент виден справа
      // Если элемент полностью видно, то запускаем следующий код
      console.clear();
      console.log('Вы видите элемент :)');
      $("#sticker").slideUp(300);
    } else {
      // Если элемент не видно, то запускаем этот код
      console.clear();
      $("#sticker").slideDown(300);
    };
  };

  var scrollHandler = function(e) {
    visible(targetElement);
  };
  //

  checkWidth();
  window.addEventListener("resize", resizeThrottler, false);
  var resizeTimeout;

  function checkWidth() {
    if (window.matchMedia('(min-width: 1366px)').matches){
    // do functionality on screens bigger than 1366px
      window.removeEventListener('scroll', scrollHandler);
      $("#sticker").sticky({
        topSpacing: 100
      });
    } else {
      $("#sticker").unstick();
      window.addEventListener('scroll', scrollHandler);
    }
  }

  function resizeThrottler() {
    // ignore resize events as long as an actualResizeHandler execution is in the queue
    if ( !resizeTimeout ) {
      resizeTimeout = setTimeout(function() {
        resizeTimeout = null;
        checkWidth();
       // The actualResizeHandler will execute at a rate of 15fps
       }, 100);
    }
  }

});

/*$(document).ready(function(){

  var targetElement = document.querySelector('#contact-us');

  var visible = function (target) {
    // Все позиции элемента
    var targetPosition = {
        top: window.pageYOffset + target.getBoundingClientRect().top,
        left: window.pageXOffset + target.getBoundingClientRect().left,
        right: window.pageXOffset + target.getBoundingClientRect().right,
        bottom: window.pageYOffset + target.getBoundingClientRect().bottom
      },
      // Получаем позиции окна
      windowPosition = {
        top: window.pageYOffset,
        left: window.pageXOffset,
        right: window.pageXOffset + document.documentElement.clientWidth,
        bottom: window.pageYOffset + document.documentElement.clientHeight
      };

    if (targetPosition.bottom > windowPosition.top && // Если позиция нижней части элемента больше позиции верхней чайти окна, то элемент виден сверху
      targetPosition.top < windowPosition.bottom && // Если позиция верхней части элемента меньше позиции нижней чайти окна, то элемент виден снизу
      targetPosition.right > windowPosition.left && // Если позиция правой стороны элемента больше позиции левой части окна, то элемент виден слева
      targetPosition.left < windowPosition.right) { // Если позиция левой стороны элемента меньше позиции правой чайти окна, то элемент виден справа
      // Если элемент полностью видно, то запускаем следующий код
      console.clear();
      console.log('Вы видите элемент :)');
      $("#sticker").slideUp(300);
    } else {
      // Если элемент не видно, то запускаем этот код
      console.clear();
      $("#sticker").slideDown(300);
    };
  };

  window.addEventListener('scroll', function() {
    visible(targetElement);
  });

  visible(targetElement);
});*/

import simpleParallax from 'simple-parallax-js';
ready(function(){
  var images = document.querySelectorAll('.parallax-img');
  new simpleParallax(images, {
    //delay: .8,
    //transition: 'cubic-bezier(0,0,0,1)'
  });
});

