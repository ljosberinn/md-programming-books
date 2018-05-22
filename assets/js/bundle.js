

let _ref = [Date.now(), 'target="_blank" rel="noopener noreferrer"'],
  now = _ref[0],
  aAttributes = _ref[1];

let jsonData = void 0;

const capitalize = function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

const likeThis = function likeThis(el) {
  const actualId = el.id;
  const id = actualId.replace(/like-/, '');
  $.post('api/like.php', { like: id }, (response) => {
    if (response.success) {
      const button = $(`#${actualId}`);
      const likeSpan = button.next('span');
      likeSpan.text(parseInt(likeSpan.text()) + 1);
      button.addClass('thumbs-up');
    } else if (response.message) {
      alert(response.message);
    }
  });
};

const addLikeEventListeners = function addLikeEventListeners(searchParameter) {
  let likeElements = void 0;

  if (!searchParameter) {
    likeElements = $('[id*=like-]');
  } else {
    likeElements = $('[id*=search-like-]');
  }

  $.each(likeElements, (i, el) => {
    el.addEventListener('click', function likeHandler() {
      this.removeEventListener('click', likeHandler, true);
      likeThis(el);
    });
  });
};

const returnCollectionItem = function returnCollectionItem(file, dataset, iteration, search) {
  let badgeClass = 'badge';

  if (now - file.added <= 604800000) {
    badgeClass += ' new';
  }

  let likeId = '';
  if (search) {
    likeId = 'search-';
  }
  likeId += `like-${dataset}-${iteration}`;

  return (
    `\n  <li class="collection-item">\n    <a href="${
      file.url
    }" ${
      aAttributes
    }>${
      file.title
    }</a>\n    <i id="${
      likeId
    }" class="material-icons">thumb_up</i>\n    <span>${
      file.likes
    }</span>\n    <a href="${
      file.src
    }" ${
      aAttributes
    } class="material-icons" title="Source">attachment</a>\n    <span class="${
      badgeClass
    }">${
      file.type
    }</span>\n  </li>`
  );
};

const returnTemplateBodyStart = function returnTemplateBodyStart(i, dataset) {
  return (
    `\n    <li>\n      <div class="collapsible-header">\n        <i class="material-icons">android</i>\n        ${
      capitalize(i)
    }\n        <span class="badge">${
      dataset.length.toLocaleString('en-US')
    } items</span>\n      </div>\n      <div class="collapsible-body secondary">\n        <ul class="collection">\n    `
  );
};
const returnTemplateBodyEnding = function returnTemplateBodyEnding() {
  return '</ul></div></li>';
};

const toggleContentOpacity = function toggleContentOpacity(add) {
  const content = $('#content');

  if (add) {
    content.addClass('faded');
  } else {
    content.removeClass('faded');
  }
};

const compareSearchResultWithEmpty = function compareSearchResultWithEmpty(template) {
  let string = template;
  if (string.length === 80) {
    string =
      '\n      <li class="active">\n        <div class="collapsible-header active">\n          <i class="material-icons">sentiment_dissatisfied</i>\n          Sorry, nothing was found...\n          <span class="badge">0 items</span>\n        </div>\n        <div class="collapsible-body secondary">\n          <ul class="collection">\n            <li class="collection-item">\n              call to action - contribute\n            </li>\n          </ul>\n        </div>\n      </li>';
    toggleContentOpacity(false);
  }

  return string;
};

const returnTemplateContent = function returnTemplateContent(container, search) {
  let string = '';

  $.each(container, (i, dataset) => {
    string += returnTemplateBodyStart(i, dataset);

    $.each(dataset, (k, file) => {
      string += returnCollectionItem(file, i, k, search);
    });

    string += returnTemplateBodyEnding();
  });

  string = compareSearchResultWithEmpty(string);

  return string;
};
const searchIterator = function searchIterator(value) {
  const result = {};

  $.each(jsonData, (language, el) => {
    if (language.toLowerCase() === value || language.indexOf(value) > -1) {
      result[language] = el;
    } else {
      $.each(el, (i, item) => {
        if (item.type.toLowerCase().indexOf(value) > -1 || item.title.indexOf(value) > -1) {
          let currentL = 0;
          if (result[language]) {
            currentL = result[language].length;
          }
          if (currentL > 0) {
            result[language].push(item);
          } else {
            result[language] = [item];
          }
        }
      });
    }
  });

  return result;
};

const reinitiateCollapsibles = function reinitiateCollapsibles() {
  $('.collapsible')
    .off('click.collapse')
    .collapsible();
};

const search = function search(value) {
  const result = searchIterator(value);
  const template = returnTemplateContent(result, true);

  $('#results')
    .html(template)
    .css('display', 'block');
  addLikeEventListeners(true);
  reinitiateCollapsibles();
};

const toggleDividerVisibility = function toggleDividerVisibility(add) {
  const divider = $('#divider');

  if (add) {
    divider.css('display', 'block');
  } else {
    divider.css('display', 'none');
  }
};

const removePreviousResults = function removePreviousResults() {
  $('#results').empty();
  toggleDividerVisibility('add');
};

$('#search')[0].addEventListener('input', function searchHandler() {
  if ($('#results').length !== 0) {
    removePreviousResults();
  }
  toggleContentOpacity(true);
  const searchVal = $(this)
    .val()
    .toLowerCase();
  search(searchVal);
});

$('.button-collapse').sideNav();

$.getJSON('api/getJSON.php', (data) => {
  jsonData = data;
  const template = returnTemplateContent(jsonData, false);
  $('#content').append(template);

  $('.collapsible').collapsible();
  addLikeEventListeners(false);
});
