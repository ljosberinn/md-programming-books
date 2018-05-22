const [now, aAttributes] = [Date.now(), 'target="_blank" rel="noopener noreferrer"'];

let jsonData;

const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

const likeThis = (el) => {
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

const addLikeEventListeners = (searchParameter) => {
  let likeElements;

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

const returnCollectionItem = (file, dataset, iteration, search) => {
  let badgeClass = 'badge';

  if (now - file.added <= 604800000) {
    badgeClass += ' new';
  }

  let likeId = '';
  if (search) {
    likeId = 'search-';
  }
  likeId += `like-${dataset}-${iteration}`;

  return `
  <li class="collection-item">
    <a href="${file.url}" ${aAttributes}>${file.title}</a>
    <i id="${likeId}" class="material-icons">thumb_up</i>
    <span>${file.likes}</span>
    <a href="${file.src}" ${aAttributes} class="material-icons" title="Source">attachment</a>
    <span class="${badgeClass}">${file.type}</span>
  </li>`;
};

const returnTemplateBodyStart = (i, dataset) => `
    <li>
      <div class="collapsible-header">
        <i class="material-icons">android</i>
        ${capitalize(i)}
        <span class="badge">${dataset.length.toLocaleString('en-US')} items</span>
      </div>
      <div class="collapsible-body secondary">
        <ul class="collection">
    `;
const returnTemplateBodyEnding = () => '</ul></div></li>';

const toggleContentOpacity = (add) => {
  const content = $('#content');

  if (add) {
    content.addClass('faded');
  } else {
    content.removeClass('faded');
  }
};

const compareSearchResultWithEmpty = (template) => {
  let string = template;
  if (string.length === 80) {
    string = `
      <li class="active">
        <div class="collapsible-header active">
          <i class="material-icons">sentiment_dissatisfied</i>
          Sorry, nothing was found...
          <span class="badge">0 items</span>
        </div>
        <div class="collapsible-body secondary">
          <ul class="collection">
            <li class="collection-item">
              call to action - contribute
            </li>
          </ul>
        </div>
      </li>`;
    toggleContentOpacity(false);
  }

  return string;
};

const returnTemplateContent = (container, search) => {
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
const searchIterator = (value) => {
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

const reinitiateCollapsibles = () => {
  $('.collapsible')
    .off('click.collapse')
    .collapsible();
};

const search = (value) => {
  const result = searchIterator(value);
  const template = returnTemplateContent(result, true);

  $('#results')
    .html(template)
    .css('display', 'block');
  addLikeEventListeners(true);
  reinitiateCollapsibles();
};

const toggleDividerVisibility = (add) => {
  const divider = $('#divider');

  if (add) {
    divider.css('display', 'block');
  } else {
    divider.css('display', 'none');
  }
};

const removePreviousResults = () => {
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
