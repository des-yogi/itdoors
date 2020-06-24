// https://www.osano.com/cookieconsent/download/

const ready = require('../../js/utils/documentReady.js');

ready(function(){

  window.cookieconsent.initialise({
    "palette": {
      "popup": {
        "background": "#ffffff",
        "text": "#090b12"
      },
      "button": {
        "background": "#ffffff",
        "border": "#ff0000",
        "text": "#090b12" //secondary-color
      }
    },
    "position": "bottom-right",
    "content": {
      "message": "Этот сайт использует файлы cookie в соответствии с <a href='https://www.google.com/' target='_blank'>Политикой использования файлов cookie</a>. Если Вы согласны на использование нами файлов cookie, то нажмите кнопку «Принять».",
      "dismiss": "Принять",
      "link": "Подробнее",
      "href": "https://www.google.com/"
    }
  });

});
