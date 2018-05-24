const [now, aAttributes] = [Date.now(), 'target="_blank" rel="noopener noreferrer"'];

let jsonData;

const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

const likeThis = el => {
  const actualId = el.id;
  const id = actualId.replace(/like-/, '');

  $.post('api/like.php', { like: id }, response => {
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

const addLikeEventListeners = searchParameter => {
  let likeSelector = '';

  if (!searchParameter) {
    likeSelector = '[id*=like-]';
  } else {
    likeSelector = '[id*=search-like-]';
  }

  $.each($(likeSelector), (i, el) => {
    el.addEventListener('click', function likeHandler() {
      this.removeEventListener('click', likeHandler, true);
      likeThis(el);
    });
  });
};

const returnCollectionItem = (file, language, iteration, search) => {
  let [badgeClass, likeId] = ['badge', ''];

  if (now - file.added <= 604800000) {
    badgeClass += ' new';
  }

  if (search) {
    likeId = 'search-';
  }

  likeId += `like-${language}-${iteration}`;

  return `
  <li class="collection-item">
    <a href="${file.url}" ${aAttributes}>${file.title}</a>
    <i id="${likeId}" class="material-icons">thumb_up</i>
    <span>${file.likes}</span>
    <a href="${file.src}" ${aAttributes} class="material-icons" title="Source">attachment</a>
    <span class="${badgeClass}">${file.type}</span>
  </li>`;
};

const returnTemplateBodyStart = (language, dataset) => `
    <li>
      <div class="collapsible-header">
        <i class="material-icons">android</i>
        ${capitalize(language)}
        <span class="badge">${dataset.length.toLocaleString('en-US')} items</span>
      </div>
      <div class="collapsible-body secondary">
        <ul class="collection">
    `;
const returnTemplateBodyEnding = () => '</ul></div></li>';

const toggleContentOpacity = add => {
  const $content = $('#content');

  if (add) {
    $content.addClass('faded');
  } else {
    $content.removeClass('faded');
  }
};

const compareSearchResultWithEmpty = template => {
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

  $.each(container, (language, dataset) => {
    string += returnTemplateBodyStart(language, dataset);

    $.each(dataset, (k, file) => {
      string += returnCollectionItem(file, language, k, search);
    });

    string += returnTemplateBodyEnding();
  });

  string = compareSearchResultWithEmpty(string);

  return string;
};

const searchIterator = value => {
  const [result, $selectedType, $selectedLanguage] = [{}, $('#filter-type').val(), $('#filter-language').val()];

  console.log($selectedType, $selectedLanguage);

  $.each(jsonData, (language, el) => {
    $.each(el, (i, subObj) => {
      const stringifiedObj = JSON.stringify(subObj).toLowerCase();

      // implement filtering based on selection

      if (stringifiedObj.indexOf(value) > -1) {
        let currentL = 0;

        if (result[language]) {
          currentL = result[language].length;
        }
        if (currentL > 0) {
          result[language].push(subObj);
        } else {
          result[language] = [subObj];
        }
      }
    });
  });

  return result;
};

const appendFilterOptions = data => {
  const [typeSelector, languageSelector, types] = [$('#filter-type'), $('#filter-language'), []];

  let [languageString, typeString] = ['', ''];

  $.each(data, (language, obj) => {
    languageString += `<option value="${language.toLowerCase()}">${capitalize(language)}</option>`;
    $.each(obj, (i, subObj) => {
      if (types.indexOf(subObj.type) === -1) {
        types.push(subObj.type);
      }
    });
  });

  $.each(types, (i, type) => {
    typeString += `<option value="${type.toLowerCase()}">${type}</option>`;
  });

  languageSelector.append(languageString);
  typeSelector.append(typeString);
};

const reinitiateCollapsibles = () => {
  $('.collapsible')
    .off('click.collapse')
    .collapsible();
};

const toggleDividerVisibility = add => {
  const $divider = $('#divider');

  if (add) {
    $divider.css('display', 'block');
  } else {
    $divider.css('display', 'none');
  }
};

const search = value => {
  if (value.length === 0) {
    $('#results').empty();
    toggleDividerVisibility();
    toggleContentOpacity();
  } else {
    const result = searchIterator(value);
    const template = returnTemplateContent(result, true);

    $('#results')
      .html(template)
      .css('display', 'block');
    addLikeEventListeners(true);
    reinitiateCollapsibles();
  }
};

const removePreviousResults = () => {
  $('#results').empty();
  toggleDividerVisibility('add');
};

const addFilterEventListeners = () => {
  const objs = ['#filter-type', '#filter-language'];

  // https://stackoverflow.com/questions/33934893/materializecss-multiple-select-value-stays-in-array-after-unselecting
  $;

  $.each(objs, (i, el) => {
    $(el).change(function () {
      const [newValuesArr, select] = [[], $(this)];
      const ul = select.prev();
      ul
        .children('li')
        .toArray()
        .forEach((li, i) => {
          if ($(li).hasClass('active')) {
            newValuesArr.push(select.children('option').toArray()[i].value);
          }
        });
      select.val(newValuesArr);

      search($('#search')
        .val()
        .toLowerCase());
    });
  });
};

$('#search')[0].addEventListener('input', function searchHandler() {
  if ($('#results').length !== 0) {
    removePreviousResults();
  }

  toggleContentOpacity(true);

  search($(this)
    .val()
    .toLowerCase());
});

$.getJSON('api/getJSON.php', data => {
  jsonData = data;
  $('#content').append(returnTemplateContent(jsonData, false));
  appendFilterOptions(jsonData);
  addFilterEventListeners();
  $('.collapsible').collapsible();
  $('select').material_select();

  addLikeEventListeners(false);
});
