/* global module */

let config = {
  'notGetBlocks': [
    'blocks-demo.html',
  ],
  'ignoredBlocks': [
    'no-js',
  ],
  'alwaysAddBlocks': [
    // 'sprite-png',
    'page',
    'sprite-svg',
    'object-fit-polyfill',
  ],
  'addStyleBefore': [
    'src/scss/variables.scss',
    'src/scss/mixins.scss',
    //'choices.js/public/assets/styles/base.css',
    //'swiper/css/swiper.css',
    // 'somePackage/dist/somePackage.css', // для 'node_modules/somePackage/dist/somePackage.css',
  ],
  'addStyleAfter': [
    // 'src/scss/print.scss',
  ],
  'addJsBefore': [
    './head-script.js',
    'picturefill/dist/picturefill.js',
    'blazy/blazy.js',
    //'vanilla-lazyload/dist/lazyload.esm.js',
    'svg4everybody/dist/svg4everybody.js',
    'simple-parallax-js/dist/simpleParallax.js',
    'object-fit-images/dist/ofi.js',
    'tilt.js/dest/tilt.jquery.js',
    'jquery-sticky/jquery.sticky.js',
    'smoothscroll-for-websites/SmoothScroll.js', // в принципе работает, но требует тестирования и настройки и проверки в Сафари !
    'popper.js/dist/umd/popper.min.js',
    'bootstrap/js/dist/util.js',
    'bootstrap/js/dist/dropdown.js',
    //'smooth-scrollbar/dist/smooth-scrollbar.js', //работает, но ломает стики хидер и b-lazy
    //'swiper/js/swiper.js',
    //'./cookieconsent.js',
    //'./util.js', // если надо добавить в бандл
    // 'somePackage/dist/somePackage.js', // для 'node_modules/somePackage/dist/somePackage.js',
    // isMobile
  ],
  'addJsAfter': [
    './script.js',
  ],
  'addAssets': {
    'node_modules/jquery/dist/jquery.js': 'libs/',
    'src/fonts/*.{woff,woff2}': 'fonts/',
    'src/img/*.{png,svg,gif,ico,jpg,jpeg,webp}': 'img/',
    'src/video/*.{mp4,webm}': 'video/',
    //'src/libs/**/*.{js,jse}': 'libs/', // если надо добавить (скопировать) сторонние библиотеки отдельно
    // 'src/favicon/*.{png,ico,svg,xml,webmanifest}': 'img/favicon',
    // 'node_modules/somePackage/images/*.{png,svg,jpg,jpeg}': 'img/',
  },
  'dir': {
    'src': 'src/',
    'build': 'build/',
    'blocks': 'src/blocks/'
  }
};

module.exports = config;
