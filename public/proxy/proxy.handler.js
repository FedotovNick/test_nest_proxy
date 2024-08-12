function checkOldLinks(sourceUrl) {
  return document.querySelectorAll(
    `a[href^="${sourceUrl}"], [content^="${sourceUrl}"]`,
  );
}

function changeLinks(links, sourceUrl, targetUrl) {
  links.forEach((link) => {
    const currentHref = link.getAttribute('href');
    const currentContent = link.getAttribute('content');

    if (currentHref && currentHref.startsWith(sourceUrl)) {
      const newHref = currentHref.replace(sourceUrl, targetUrl);
      link.setAttribute('href', newHref);
    }

    if (currentContent && currentContent.startsWith(sourceUrl)) {
      const newContent = currentContent.replace(sourceUrl, targetUrl);
      link.setAttribute('content', newContent);
    }
  });
}

function updateLinks(sourceUrl, targetUrl) {
  const links = checkOldLinks(sourceUrl);
  if (!links) {
    return;
  }
  changeLinks(links, sourceUrl, targetUrl);
}

function addToSixLetterWords() {
  const wordRegex = /\b(\w{6})(?!™)\b/g;

  function processText(text) {
    return text.replace(wordRegex, '$1™');
  }

  function traverseAndModify(node) {
    if (node instanceof HTMLUListElement && node.id === 'docsearch-list') {
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const updatedText = processText(node.textContent);
      if (updatedText !== node.textContent) {
        node.textContent = updatedText;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach(traverseAndModify);
    }
  }

  traverseAndModify(document.body);
}

function replaceDomain(obj, sourceUrl, targetUrl) {
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceDomain(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = replaceDomain(obj[key], sourceUrl, targetUrl);
      }
    }
    return obj;
  }

  if (typeof obj === 'string' && obj.includes(sourceUrl)) {
    return obj.replace(sourceUrl, targetUrl);
  }

  return obj;
}

function registerCustomXMLHttpRequest(sourceUrl, targetUrl) {
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function () {
    this.addEventListener('readystatechange', function () {
      if (this.readyState === 4 && this.status === 200) {
        const contentType = this.getResponseHeader('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const originalResponse = this.responseText;

          try {
            let jsonResponse = JSON.parse(originalResponse);

            jsonResponse = modifyJsonResponse(
              jsonResponse,
              sourceUrl,
              targetUrl,
            );

            const modifiedResponseText = JSON.stringify(jsonResponse);

            Object.defineProperty(this, 'responseText', {
              get: function () {
                return modifiedResponseText;
              },
              configurable: true,
            });
          } catch (e) {
            console.error('Error parsing or modifying JSON response:', e);
          }
        }
      }
    });

    return originalXhrOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    return originalXhrSend.apply(this, arguments);
  };

  function modifyJsonResponse(json, sourceUrl, targetUrl) {
    if (typeof json === 'object' && json !== null) {
      return replaceDomain(json, sourceUrl, targetUrl);
    }
    return json;
  }
}

function initDynamicHandlerFunctionality() {
  const scripts = document.querySelectorAll('#proxy_handler_script');

  if (scripts.length !== 1) {
    return;
  }

  const script = scripts[0];
  const sourceUrl = script.getAttribute('data-proxy-source-url');
  const targetUrl = script.getAttribute('data-proxy-target-url');

  registerCustomXMLHttpRequest();

  window.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
      updateLinks(sourceUrl, targetUrl);
      addToSixLetterWords();
    });

    const config = { childList: true, attributes: true, subtree: true };
    observer.observe(document.body, config);
  });
}

initDynamicHandlerFunctionality();
