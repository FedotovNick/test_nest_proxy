const targetUrl = 'https://docs.nestjs.com';
const sourceUrl = 'http://localhost:3000';

const checkOldLinks = () => {
  return document.querySelectorAll(`a[href^="${targetUrl}"]`);
};

const changeLinks = (links) => {
  links.forEach((link) => {
    const currentHref = link.getAttribute('href');
    if (currentHref && currentHref.startsWith(targetUrl)) {
      const newHref = currentHref.replace(targetUrl, sourceUrl);
      link.setAttribute('href', newHref);
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

window.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver(() => {
    updateLinks();
  });

  const config = { childList: true, attributes: true, subtree: true };
  observer.observe(document.body, config);
});
