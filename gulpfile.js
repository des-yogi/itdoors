/* global exports process console __dirname Buffer */
/* eslint-disable no-console */
'use strict';

// Проверка количества съедаемой памяти
// setInterval(function(){ // eslint-disable-line
//   let memory = process.memoryUsage()
//   let date = new Date();
//   console.log(`[${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}]`, 'Memory usage (heapUsed):', (memory.heapUsed / 1024 / 1024).toFixed(2) + 'Mb');
// }, 1000 * 10);
// function addZero(i) { return (i < 10) ? i = "0" + i : i;}

// Пакеты, использующиеся при обработке
const { series, parallel, src, dest, watch } = require('gulp');
const fs = require('fs');
const plumber = require('gulp-plumber');
const del = require('del');
const through2 = require('through2');
const rename = require('gulp-rename');
const getClassesFromHtml = require('get-classes-from-html');
const browserSync = require('browser-sync').create();
const debug = require('gulp-debug');
const sass = require('gulp-sass')(require('node-sass'));
const webpackStream = require('webpack-stream');
const buffer = require('vinyl-buffer');
const postcss = require('gulp-postcss');
const removeComments = require('postcss-discard-comments');
const autoprefixer = require("autoprefixer");
const mqpacker = require("css-mqpacker");
const atImport = require("postcss-import");
const csso = require('gulp-csso');
const inlineSVG = require('postcss-inline-svg');
const objectFitImages = require('postcss-object-fit-images');
const cpy = require('cpy');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');
const imagemin = require('gulp-imagemin');
const prettyHtml = require('gulp-pretty-html');
const replace = require('gulp-replace');
const ghpages = require('gh-pages');
const path = require('path');

const realFavicon = require ('gulp-real-favicon');

// Глобальные настройки этого запуска
//const buildLibrary = process.env.BUILD_LIBRARY == 'yes' ? true : false;
const buildLibrary = process.env.BUILD_LIBRARY || false;
const mode = process.env.MODE || 'development';
const nth = {};
nth.config = require('./config.js');
nth.blocksFromHtml = Object.create(nth.config.alwaysAddBlocks); // блоки из конфига сразу добавим в список блоков
nth.scssImportsList = []; // список импортов стилей
const dir = nth.config.dir;

// файл с настройками фавиконок
const faviconData = './faviconData.json';

// Сообщение для компилируемых файлов
let doNotEditMsg = '\n ВНИМАНИЕ! Этот файл генерируется автоматически.\n Любые изменения этого файла будут потеряны при следующей компиляции!\n Любое изменение проекта без возможности компиляции вылезет боком :)\n\n';

// Настройки бьютификатора
let prettyOption = {
  indent_size: 2,
  indent_char: ' ',
  unformatted: ['code', 'em', 'strong', 'span', 'i', 'b', 'br', 'script'],
  content_unformatted: [],
};

// Список и настройки плагинов postCSS
let postCssPlugins = [
  atImport(),
  autoprefixer({grid: true}),
  mqpacker({
    sort: true
  }),
  //atImport(),
  inlineSVG(),
  objectFitImages(),
  removeComments(),
];


function copyAssets(cb) {
  for (let item in nth.config.addAssets) {
    let dest = `${dir.build}${nth.config.addAssets[item]}`;
    cpy(item, dest);
  }
  cb();
}
exports.copyAssets = copyAssets;


function copyImg(cb) {
  let copiedImages = [];
  nth.blocksFromHtml.forEach(function(block) {
    let src = `${dir.blocks}${block}/img`;
    //if(fileExist(src)) copiedImages.push(src);
    if(fileExist(src)) copiedImages.push(`${src}/*.{png,jpg,jpeg,svg,webp}`);
  });
  nth.config.alwaysAddBlocks.forEach(function(block) {
    let src = `${dir.blocks}${block}/img`;
    //if(fileExist(src)) copiedImages.push(src);
    if(fileExist(src)) copiedImages.push(`${src}/*.{png,jpg,jpeg,svg,webp}`);
  });
  if(copiedImages.length) {
    (async () => {
      await cpy(copiedImages, `${dir.build}img`);
      cb();
    })();
  }
  else {
    cb();
  }
}
exports.copyImg = copyImg;


function generateSvgSprite(cb) {
  let spriteSvgPath = `${dir.blocks}sprite-svg/svg/`;
  if(nth.config.alwaysAddBlocks.indexOf('sprite-svg') > -1 && fileExist(spriteSvgPath)) {
    return src(spriteSvgPath + '*.svg')
      .pipe(svgmin(function () {
        return { plugins: [{ cleanupIDs: { minify: true } }] }
      }))
      .pipe(svgstore({ inlineSvg: true }))
      .pipe(rename('sprite.svg'))
      .pipe(dest(`${dir.blocks}sprite-svg/img/`));
  }
  else {
    cb();
  }
}
exports.generateSvgSprite = generateSvgSprite;


function generatePngSprite(cb) {
  let spritePngPath = `${dir.blocks}sprite-png/png/`;
  if(nth.config.alwaysAddBlocks.indexOf('sprite-png') > -1 && fileExist(spritePngPath)) {
    del(`${dir.blocks}sprite-png/img/*.png`);
    let fileName = 'sprite-' + Math.random().toString().replace(/[^0-9]/g, '') + '.png';
    let spriteData = src(spritePngPath + '*.png')
      .pipe(spritesmith({
        imgName: fileName,
        cssName: 'sprite-png.scss',
        padding: 4,
        imgPath: '../img/' + fileName
      }));
    let imgStream = spriteData.img
      .pipe(buffer())
      .pipe(imagemin([ imagemin.optipng({optimizationLevel: 5}) ]))
      .pipe(dest(`${dir.blocks}sprite-png/img/`));
    let cssStream = spriteData.css
      .pipe(dest(`${dir.blocks}sprite-png/`));
    return merge(imgStream, cssStream);
  }
  else {
    cb();
  }
}
exports.generatePngSprite = generatePngSprite;


function writeSassImportsFile(cb) {
  const newScssImportsList = [];
  nth.config.addStyleBefore.forEach(function(src) {
    newScssImportsList.push(src);
  });
  nth.config.alwaysAddBlocks.forEach(function(blockName) {
    //newScssImportsList.push(`${dir.blocks}${blockName}/${blockName}.scss`);
    if (fileExist(`${dir.blocks}${blockName}/${blockName}.scss`)) newScssImportsList.push(`${dir.blocks}${blockName}/${blockName}.scss`);
  });
  let allBlocksWithScssFiles = getDirectories('scss');
  allBlocksWithScssFiles.forEach(function(blockWithScssFile){
    let url = `${dir.blocks}${blockWithScssFile}/${blockWithScssFile}.scss`;
    if (nth.blocksFromHtml.indexOf(blockWithScssFile) == -1) return;
    if (newScssImportsList.indexOf(url) > -1) return;
    newScssImportsList.push(url);
  });
  nth.config.addStyleAfter.forEach(function(src) {
    newScssImportsList.push(src);
  });
  let diff = getArraysDiff(newScssImportsList, nth.scssImportsList);
  if (diff.length) {
    let msg = `\n/*!*${doNotEditMsg.replace(/\n /gm,'\n * ').replace(/\n\n$/,'\n */\n\n')}`;
    let styleImports = msg;
    newScssImportsList.forEach(function(src) {
      styleImports += `@import "${src}";\n`;
    });
    styleImports += msg;
    fs.writeFileSync(`${dir.src}scss/style.scss`, styleImports);
    console.log('---------- Write new style.scss');
    nth.scssImportsList = newScssImportsList;
  }
  cb();
}
exports.writeSassImportsFile = writeSassImportsFile;


// Сборка стилей -> Developer (default) mode
function compileSass() {
  const fileList = [
    `${dir.src}scss/style.scss`,
  ];
  if(buildLibrary) fileList.push(`${dir.blocks}blocks-library/blocks-library.scss`);
  return src(fileList, { sourcemaps: true })
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(debug({title: 'Compiles:'}))
    .pipe(sass({includePaths: [__dirname+'/','node_modules']}))
    .pipe(postcss(postCssPlugins))
    .pipe(rename('style.min.css'))
    .pipe(dest(`${dir.build}/css`, { sourcemaps: '.' }))
    .pipe(browserSync.stream());
}
exports.compileSass = compileSass;


// Сборка стилей -> Production mode
function compileSassProd() {
  const fileList = [
    `${dir.src}scss/style.scss`,
  ];
  if(buildLibrary) fileList.push(`${dir.blocks}blocks-library/blocks-library.scss`);
  return src(fileList, { sourcemaps: false })
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(debug({title: 'Compiles:'}))
    .pipe(sass({includePaths: [__dirname+'/','node_modules']}))
    .pipe(postcss(postCssPlugins))
    .pipe(csso({
      restructure: false,
    }))
    .pipe(rename('style.min.css'))
    .pipe(dest(`${dir.build}/css`, { sourcemaps: false }))
    .pipe(browserSync.stream());
}
exports.compileSass = compileSassProd;


// Сборка HTML
function compileHtml() {
  const fileinclude = require('gulp-file-include');
  const fileList = [
    `${dir.src}*.html`
  ];
  console.log('---------- сборка HTML');
  return src(fileList)
    .pipe(plumber({
      errorHandler: function(err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(debug({title: 'Compiles: '}))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      indent: true,
    }))
    .pipe(prettyHtml(prettyOption))
    .pipe(replace(/^(\s*)(<button.+?>)(.*)(<\/button>)/gm, '$1$2\n$1  $3\n$1$4'))
    .pipe(replace(/^( *)(<.+?>)(<script>)([\s\S]*)(<\/script>)/gm, '$1$2\n$1$3\n$4\n$1$5\n'))
    .pipe(replace(/^( *)(<.+?>)(<script\s+src.+>)(?:[\s\S]*)(<\/script>)/gm, '$1$2\n$1$3$4'))
    .pipe(through2.obj(getClassesToBlocksList))
    .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(faviconData)).favicon.html_code))
    .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
    .pipe(dest(`${dir.build}`));
}
exports.compileHtml = compileHtml;


// Генератор фавиконок
function favicons(done) {
  let faviconPath = `${dir.src}img/favicon-lg.png`;
  realFavicon.generateFavicon({
    masterPicture: faviconPath,
    dest: (dir.build) + '/img',
    iconsPath: '/img',
    design: {
      ios: {
        pictureAspect: 'backgroundAndMargin',
        backgroundColor: '#ffffff',
        margin: '14%',
        assets: {
          ios6AndPriorIcons: false,
          ios7AndLaterIcons: false,
          precomposedIcons: false,
          declareOnlyDefaultIcon: true
        }
      },
      desktopBrowser: {},
      windows: {
        pictureAspect: 'noChange',
        backgroundColor: '#ffffff',
        onConflict: 'override',
        assets: {
          windows80Ie10Tile: false,
          windows10Ie11EdgeTiles: {
            small: false,
            medium: true,
            big: false,
            rectangle: false
          }
        }
      },
      androidChrome: {
        pictureAspect: 'noChange',
        themeColor: '#ffffff',
        manifest: {
          display: 'standalone',
          orientation: 'notSet',
          onConflict: 'override',
          declared: true
        },
        assets: {
          legacyIcon: false,
          lowResolutionIcons: false
        }
      },
      safariPinnedTab: {
        pictureAspect: 'silhouette',
        themeColor: '#ffffff'
      }
    },
    settings: {
      scalingAlgorithm: 'Mitchell',
      errorOnImageTooSmall: false
    },
    markupFile: faviconData
  }, function() {
    done();
  });
}
exports.favicons = favicons;


function writeJsRequiresFile(cb) {
  const jsRequiresList = [];
  nth.config.addJsBefore.forEach(function(src) {
    jsRequiresList.push(src);
  });
  const allBlocksWithJsFiles = getDirectories('js');
  allBlocksWithJsFiles.forEach(function(blockName){
    if (nth.config.alwaysAddBlocks.indexOf(blockName) == -1) return;
    jsRequiresList.push(`../blocks/${blockName}/${blockName}.js`)
  });
  allBlocksWithJsFiles.forEach(function(blockName){
    let src = `../blocks/${blockName}/${blockName}.js`
    if (nth.blocksFromHtml.indexOf(blockName) == -1) return;
    if (jsRequiresList.indexOf(src) > -1) return;
    jsRequiresList.push(src);
  });
  nth.config.addJsAfter.forEach(function(src) {
    jsRequiresList.push(src);
  });
  let msg = `\n/*!*${doNotEditMsg.replace(/\n /gm,'\n * ').replace(/\n\n$/,'\n */\n\n')}`;
  let jsRequires = msg + '/* global require */\n\n';
  jsRequiresList.forEach(function(src) {
    jsRequires += `require('${src}');\n`;
  });
  jsRequires += msg;
  fs.writeFileSync(`${dir.src}js/entry.js`, jsRequires);
  console.log('---------- Write new entry.js');
  cb();
}
exports.writeJsRequiresFile = writeJsRequiresFile;


function buildJs() {
  const entryList = {
    'bundle': `./${dir.src}js/entry.js`,
  };
  if(buildLibrary) entryList['blocks-library'] = `./${dir.blocks}blocks-library/blocks-library.js`;
  return src(`${dir.src}js/entry.js`)
    .pipe(plumber())
    .pipe(webpackStream({
      //mode: 'production',
      mode: 'none',
      entry: entryList,
      output: {
        filename: '[name].js',
      },
      resolve: {
        alias: {
          Utils: path.resolve(__dirname, 'src/js/utils/'),
        },
      },
      module: {
        rules: [
          {
            test: /\.(js)$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      },
      externals: {
        // Опция конфигурации externals позволяет исключить зависимости из выходных пакетов, чтобы подключить их отдельно, например, из libs или node_modules…
        //jquery: 'jQuery'
        //bootstrap: 'Bootstrap'
      }
    }))
    .pipe(dest(`${dir.build}js`));
}
exports.buildJs = buildJs;


function buildJsProduction() {
  const entryList = {
    'bundle': `./${dir.src}js/entry.js`,
  };
  if(buildLibrary) entryList['blocks-library'] = `./${dir.blocks}blocks-library/blocks-library.js`;
  return src(`${dir.src}js/entry.js`)
    .pipe(plumber())
    .pipe(webpackStream({
      mode: 'production',
      //mode: 'development',
      entry: entryList,
      output: {
        filename: '[name].js',
      },
      resolve: {
        alias: {
          Utils: path.resolve(__dirname, 'src/js/utils/'),
        },
      },
      module: {
        rules: [
          {
            test: /\.(js)$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      },
      externals: {
        // Опция конфигурации externals позволяет исключить зависимости из выходных пакетов, чтобы подключить их отдельно, например, из libs или node_modules…
        // jquery: 'jQuery'
      }
    }))
    .pipe(dest(`${dir.build}js`));
}
exports.buildJsProduction = buildJsProduction;


function clearBuildDir() {
  return del([
    `${dir.build}**/*`,
    `!${dir.build}readme.md`,
  ]);
}
exports.clearBuildDir = clearBuildDir;


function reload(done) {
  browserSync.reload();
  done();
}

function deploy(cb) {
  ghpages.publish(path.join(process.cwd(), dir.build), cb);
}
exports.deploy = deploy;


function serve() {

  browserSync.init({
    server: dir.build,
    port: 3000,
    startPath: 'index.html',
    open: true,
    notify: false,
  });

  // Страницы: изменение, добавление
  watch([`${dir.src}*.html`], { events: ['change', 'add'], delay: 100 }, series(
    compileHtml,
    parallel(writeSassImportsFile, writeJsRequiresFile),
    parallel(compileSass, buildJs),
    reload
  ));

  // Страницы: удаление
  watch([`${dir.src}*.html`], { delay: 100 })
  // TODO попробовать с events: ['unlink']
    .on('unlink', function(path) {
      let filePathInBuildDir = path.replace(`${dir.src}/`, dir.build).replace('.html', '.html');
      fs.unlink(filePathInBuildDir, (err) => {
        if (err) throw err;
        console.log(`---------- Delete:  ${filePathInBuildDir}`);
      });
    });

  // Разметка Блоков: изменение
  watch([`${dir.blocks}**/*.html`], { events: ['change'], delay: 100 }, series(
    compileHtml,
    reload
  ));

  // Разметка Блоков: добавление
  watch([`${dir.blocks}**/*.html`], { events: ['add'], delay: 100 }, series(
    compileHtml,
    reload
  ));

  // Разметка Блоков: удаление
  watch([`${dir.blocks}**/*.html`], { events: ['unlink'], delay: 100 });


  // Стили Блоков: изменение
  watch([`${dir.blocks}**/*.scss`], { events: ['change'], delay: 100 }, series(
    compileSass,
  ));

  // Стили Блоков: добавление
  watch([`${dir.blocks}**/*.scss`], { events: ['add'], delay: 100 }, series(
    writeSassImportsFile,
    compileSass,
  ));

  // Стилевые глобальные файлы: все события
  watch([`${dir.src}scss/**/*.scss`, `!${dir.src}scss/style.scss`], { events: ['all'], delay: 100 }, series(
    compileSass,
  ));

  // Скриптовые глобальные файлы: все события
  watch([`${dir.src}js/**/*.js`, `!${dir.src}js/entry.js`, `${dir.blocks}**/*.js`], { events: ['all'], delay: 100 }, series(
    writeJsRequiresFile,
    buildJs,
    reload
  ));

  // Картинки: все события
  watch([`${dir.blocks}**/img/*.{jpg,jpeg,png,gif,svg,webp}`], { events: ['all'], delay: 100 }, series(copyImg, reload));

  // Спрайт SVG
  watch([`${dir.blocks}sprite-svg/svg/*.svg`], { events: ['all'], delay: 100 }, series(
    generateSvgSprite,
    copyImg,
    reload,
  ));

  // Спрайт PNG
  watch([`${dir.blocks}sprite-png/png/*.png`], { events: ['all'], delay: 100 }, series(
    generatePngSprite,
    copyImg,
    compileSass,
    reload,
  ));
}


exports.build = series(
  parallel(clearBuildDir),
  parallel(compileHtml, copyAssets, generateSvgSprite, generatePngSprite, favicons),
  parallel(copyImg, writeSassImportsFile, writeJsRequiresFile),
  parallel(compileSassProd, buildJsProduction),
);


exports.default = series(
  parallel(clearBuildDir),
  parallel(compileHtml, copyAssets, generateSvgSprite, generatePngSprite, favicons),
  parallel(copyImg, writeSassImportsFile, writeJsRequiresFile),
  parallel(compileSass, buildJs),
  serve,
);



// Функции, не являющиеся задачами Gulp ----------------------------------------

/**
 * Получение списка классов из HTML и запись его в глоб. переменную nth.blocksFromHtml.
 * @param  {object}   file Обрабатываемый файл
 * @param  {string}   enc  Кодировка
 * @param  {Function} cb   Коллбэк
 */
function getClassesToBlocksList(file, enc, cb) {
  // Передана херь — выходим
  if (file.isNull()) {
    cb(null, file);
    return;
  }
  // Проверяем, не является ли обрабатываемый файл исключением
  let processThisFile = true;
  nth.config.notGetBlocks.forEach(function(item) {
    if (file.relative.trim() == item.trim()) processThisFile = false;
  });
  // Файл не исключён из обработки, погнали
  if (processThisFile) {
    const fileContent = file.contents.toString();
    let classesInFile = getClassesFromHtml(fileContent);
    // nth.blocksFromHtml = [];
    // Обойдём найденные классы
    for (let item of classesInFile) {
      // Не Блок или этот Блок уже присутствует?
      if ((item.indexOf('__') > -1) || (item.indexOf('--') > -1) || (nth.blocksFromHtml.indexOf(item) + 1)) continue;
      // Класс совпадает с классом-исключением из настроек?
      if (nth.config.ignoredBlocks.indexOf(item) + 1) continue;
      // У этого блока отсутствует папка?
      // if (!fileExist(dir.blocks + item)) continue;
      // Добавляем класс в список
      nth.blocksFromHtml.push(item);
    }
    //console.log('---------- Used HTML blocks: ' + nth.blocksFromHtml.join(', '));
    file.contents = new Buffer.from(fileContent);
  }
  this.push(file);
  cb();
}


/**
 * Проверка существования файла или папки
 * @param  {string} path      Путь до файла или папки
 * @return {boolean}
 */
function fileExist(filepath){
  let flag = true;
  try {
      fs.accessSync(filepath, fs.F_OK);
  } catch(e){
      flag = false;
  }
  return flag;
}

/**
 * Получение всех названий поддиректорий, содержащих файл указанного расширения, совпадающий по имени с поддиректорией
 * @param  {string} ext    Расширение файлов, которое проверяется
 * @return {array}         Массив из имён блоков
 */
function getDirectories(ext) {
  let source = dir.blocks;
  let res = fs.readdirSync(source)
    .filter(item => fs.lstatSync(source + item).isDirectory())
    .filter(item => fileExist(source + item + '/' + item + '.' + ext));
  return res;
}

/**
 * Получение разницы между двумя массивами.
 * @param  {array} a1 Первый массив
 * @param  {array} a2 Второй массив
 * @return {array}    Элементы, которые отличаются
 */
function getArraysDiff(a1, a2) {
  return a1.filter(i=>!a2.includes(i)).concat(a2.filter(i=>!a1.includes(i)))
}
