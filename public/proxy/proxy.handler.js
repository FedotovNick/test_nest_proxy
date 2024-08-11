const targetUrl = 'https://docs.nestjs.com';
const sourceUrl = 'http://localhost:3000';

const checkOldLinks = () => {
  return document.querySelectorAll(
    `[href^="${targetUrl}"], [content^="${targetUrl}"]`,
  );
};

const changeLinks = (links) => {
  links.forEach((link) => {
    const currentHref = link.getAttribute('href');
    const currentContent = link.getAttribute('content');

    if (currentHref && currentHref.startsWith(targetUrl)) {
      const newHref = currentHref.replace(targetUrl, sourceUrl);
      link.setAttribute('href', newHref);
    }

    if (currentContent && currentContent.startsWith(targetUrl)) {
      const newContent = currentContent.replace(targetUrl, sourceUrl);
      link.setAttribute('content', newContent);
    }
  });
};

const updateLinks = () => {
  const links = checkOldLinks();
  if (!links) {
    return;
  }
  changeLinks(links);
};

/**
 * Добавляет 'XXX' к словам из 6 букв в текстовом контенте документа.
 */
function addXXXToSixLetterWords() {
  // Регулярное выражение для поиска слов из 6 букв
  const wordRegex = /\b(\w{6})(?!™)\b/g;
  // const wordRegex = /\b(\w{6})(?!™)\b(?!<\/mark>)/g;

  /**
   * Функция для обработки текста и добавления 'XXX' к словам из 6 букв
   * @param {string} text - Исходный текст
   * @returns {string} - Обработанный текст
   */
  function processText(text) {
    return text.replace(wordRegex, '$1™');
  }

  /**
   * Рекурсивная функция для обхода всех текстовых узлов в документе
   * @param {Node} node - Узел для обхода
   */
  function traverseAndModify(node) {
    if (node instanceof HTMLUListElement && node.id === 'docsearch-list') {
      console.log(
        '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! SKIP MOTHER FUCKER !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
      );
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      // Обрабатываем текстовые узлы
      const updatedText = processText(node.textContent);
      if (updatedText !== node.textContent) {
        node.textContent = updatedText;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Рекурсивно обрабатываем все дочерние узлы
      node.childNodes.forEach(traverseAndModify);
    }
  }

  // Запускаем обработку от корня документа
  traverseAndModify(document.body);
}

//------------------------------------------------------------------------------------

/**
 * Рекурсивно обходит объект или массив и заменяет все строковые значения,
 * содержащие 'https://test-domain.com' на 'http://localhost:3000'.
 * @param {Object|Array} obj - Объект или массив для обработки
 * @returns {Object|Array} - Обработанный объект или массив
 */
function replaceDomain(obj) {
  // Проверяем, является ли obj массивом
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceDomain(item));
  }

  // Проверяем, является ли obj объектом
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = replaceDomain(obj[key]);
      }
    }
    return obj;
  }

  // Проверяем, является ли obj строкой и содержит ли целевой домен
  if (typeof obj === 'string' && obj.includes(targetUrl)) {
    return obj.replace(targetUrl, sourceUrl);
  }

  // Возвращаем значение, если это не объект, массив или строка с целевым доменом
  return obj;
}

// (function () {
//   // Сохраняем оригинальные методы
//   const originalXhrOpen = XMLHttpRequest.prototype.open;
//   const originalXhrSend = XMLHttpRequest.prototype.send;

//   // Переписываем метод open для перехвата вызовов
//   XMLHttpRequest.prototype.open = function (
//     method,
//     url,
//     async,
//     user,
//     password,
//   ) {
//     // Добавляем перехватчик для обработки ответа
//     this.addEventListener('readystatechange', function () {
//       if (this.readyState === 4 && this.status === 200) {
//         // Проверяем, что ответ JSON
//         const contentType = this.getResponseHeader('Content-Type');
//         if (contentType && contentType.includes('application/json')) {
//           const originalResponse = this.responseText;

//           try {
//             // Парсим оригинальный JSON
//             let jsonResponse = JSON.parse(originalResponse);

//             // Модифицируем JSON
//             jsonResponse = modifyJsonResponse(jsonResponse);

//             console.log({jsonResponse});
//             // Преобразуем обратно в строку
//             this.responseText = JSON.stringify(jsonResponse);
//             // throw new Error();
//             console.log({responseText: this.responseText, text2: JSON.stringify(jsonResponse)});
//           } catch (e) {
//             console.error('Error parsing or modifying JSON response:', e);
//           }
//         }
//       }
//     });

//     // Вызов оригинального метода open
//     return originalXhrOpen.apply(this, arguments);
//   };

//   // Переписываем метод send для работы с нашими перехватчиками
//   XMLHttpRequest.prototype.send = function (body) {
//     return originalXhrSend.apply(this, arguments);
//   };

//   /**
//    * Функция для модификации JSON ответа
//    * @param {Object} json - Оригинальный JSON объект
//    * @returns {Object} - Модифицированный JSON объект
//    */
//   function modifyJsonResponse(json) {
//     console.log('here 1');
//     // Пример модификации: добавление нового поля
//     if (typeof json === 'object' && json !== null) {
//       console.log('here 2');
//       const result = replaceDomain(json);
//       console.log('here3', result);
//       return result;
//     }
//     return json;
//   }
// })();

(function () {
  // Сохраняем оригинальные методы
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;

  // Переписываем метод open для перехвата вызовов
  XMLHttpRequest.prototype.open = function (
    method,
    url,
    async,
    user,
    password,
  ) {
    // Добавляем перехватчик для обработки ответа
    this.addEventListener('readystatechange', function () {
      if (this.readyState === 4 && this.status === 200) {
        // Проверяем, что ответ JSON
        const contentType = this.getResponseHeader('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const originalResponse = this.responseText;

          try {
            // Парсим оригинальный JSON
            let jsonResponse = JSON.parse(originalResponse);

            // Модифицируем JSON
            jsonResponse = modifyJsonResponse(jsonResponse);

            console.log({ jsonResponse });

            // Преобразуем обратно в строку
            const modifiedResponseText = JSON.stringify(jsonResponse);

            // Используем Object.defineProperty для перехвата геттера responseText
            Object.defineProperty(this, 'responseText', {
              get: function () {
                return modifiedResponseText;
              },
              configurable: true,
            });

            console.log({ responseText: this.responseText });
          } catch (e) {
            console.error('Error parsing or modifying JSON response:', e);
          }
        }
      }
    });

    // Вызов оригинального метода open
    return originalXhrOpen.apply(this, arguments);
  };

  // Переписываем метод send для работы с нашими перехватчиками
  XMLHttpRequest.prototype.send = function (body) {
    return originalXhrSend.apply(this, arguments);
  };

  /**
   * Функция для модификации JSON ответа
   * @param {Object} json - Оригинальный JSON объект
   * @returns {Object} - Модифицированный JSON объект
   */
  function modifyJsonResponse(json) {
    console.log('here 1');
    // Пример модификации: добавление нового поля
    if (typeof json === 'object' && json !== null) {
      console.log('here 2');
      const result = replaceDomain(json);
      console.log('here3', result);
      return result;
    }
    return json;
  }
})();

//------------------------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver((mut) => {
    // console.log(mut);
    updateLinks();
    addXXXToSixLetterWords();
  });

  const config = { childList: true, attributes: true, subtree: true };
  observer.observe(document.body, config);
});
