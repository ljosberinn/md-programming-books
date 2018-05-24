'use strict';

var _ref = [Date.now(), 'target="_blank" rel="noopener noreferrer"'],
    now = _ref[0],
    aAttributes = _ref[1];


var jsonData = void 0;

var capitalize = function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

var likeThis = function likeThis(el) {
  var actualId = el.id;
  var id = actualId.replace(/like-/, '');

  $.post('api/like.php', { like: id }, function (response) {
    if (response.success) {
      var button = $('#' + actualId);
      var likeSpan = button.next('span');

      likeSpan.text(parseInt(likeSpan.text()) + 1);
      button.addClass('thumbs-up');
    } else if (response.message) {
      alert(response.message);
    }
  });
};

var addLikeEventListeners = function addLikeEventListeners(searchParameter) {
  var likeSelector = '';

  if (!searchParameter) {
    likeSelector = '[id*=like-]';
  } else {
    likeSelector = '[id*=search-like-]';
  }

  $.each($(likeSelector), function (i, el) {
    el.addEventListener('click', function likeHandler() {
      this.removeEventListener('click', likeHandler, true);
      likeThis(el);
    });
  });
};

var returnCollectionItem = function returnCollectionItem(file, language, iteration, search) {
  var badgeClass = 'badge',
      likeId = '';


  if (now - file.added <= 604800000) {
    badgeClass += ' new';
  }

  if (search) {
    likeId = 'search-';
  }

  likeId += 'like-' + language + '-' + iteration;

  return '\n  <li class="collection-item">\n    <a href="' + file.url + '" ' + aAttributes + '>' + file.title + '</a>\n    <i id="' + likeId + '" class="material-icons">thumb_up</i>\n    <span>' + file.likes + '</span>\n    <a href="' + file.src + '" ' + aAttributes + ' class="material-icons" title="Source">attachment</a>\n    <span class="' + badgeClass + '">' + file.type + '</span>\n  </li>';
};

var returnTemplateBodyStart = function returnTemplateBodyStart(language, dataset) {
  return '\n    <li>\n      <div class="collapsible-header">\n        <i class="material-icons">android</i>\n        ' + capitalize(language) + '\n        <span class="badge">' + dataset.length.toLocaleString('en-US') + ' items</span>\n      </div>\n      <div class="collapsible-body secondary">\n        <ul class="collection">\n    ';
};
var returnTemplateBodyEnding = function returnTemplateBodyEnding() {
  return '</ul></div></li>';
};

var toggleContentOpacity = function toggleContentOpacity(add) {
  var $content = $('#content');

  if (add) {
    $content.addClass('faded');
  } else {
    $content.removeClass('faded');
  }
};

var compareSearchResultWithEmpty = function compareSearchResultWithEmpty(template) {
  var string = template;
  if (string.length === 80) {
    string = '\n      <li class="active">\n        <div class="collapsible-header active">\n          <i class="material-icons">sentiment_dissatisfied</i>\n          Sorry, nothing was found...\n          <span class="badge">0 items</span>\n        </div>\n        <div class="collapsible-body secondary">\n          <ul class="collection">\n            <li class="collection-item">\n              call to action - contribute\n            </li>\n          </ul>\n        </div>\n      </li>';
    toggleContentOpacity(false);
  }

  return string;
};

var returnTemplateContent = function returnTemplateContent(container, search) {
  var string = '';

  $.each(container, function (language, dataset) {
    string += returnTemplateBodyStart(language, dataset);

    $.each(dataset, function (k, file) {
      string += returnCollectionItem(file, language, k, search);
    });

    string += returnTemplateBodyEnding();
  });

  string = compareSearchResultWithEmpty(string);

  return string;
};

var searchIterator = function searchIterator(value) {
  var _ref2 = [{}, $('#filter-type').val(), $('#filter-language').val()],
      result = _ref2[0],
      $selectedType = _ref2[1],
      $selectedLanguage = _ref2[2];


  console.log($selectedType, $selectedLanguage);

  $.each(jsonData, function (language, el) {
    $.each(el, function (i, subObj) {
      var stringifiedObj = JSON.stringify(subObj).toLowerCase();

      // implement filtering based on selection

      if (stringifiedObj.indexOf(value) > -1) {
        var currentL = 0;

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

var appendFilterOptions = function appendFilterOptions(data) {
  var _ref3 = [$('#filter-type'), $('#filter-language'), []],
      typeSelector = _ref3[0],
      languageSelector = _ref3[1],
      types = _ref3[2];
  var languageString = '',
      typeString = '';


  $.each(data, function (language, obj) {
    languageString += '<option value="' + language.toLowerCase() + '">' + capitalize(language) + '</option>';
    $.each(obj, function (i, subObj) {
      if (types.indexOf(subObj.type) === -1) {
        types.push(subObj.type);
      }
    });
  });

  $.each(types, function (i, type) {
    typeString += '<option value="' + type.toLowerCase() + '">' + type + '</option>';
  });

  languageSelector.append(languageString);
  typeSelector.append(typeString);
};

var reinitiateCollapsibles = function reinitiateCollapsibles() {
  $('.collapsible').off('click.collapse').collapsible();
};

var toggleDividerVisibility = function toggleDividerVisibility(add) {
  var $divider = $('#divider');

  if (add) {
    $divider.css('display', 'block');
  } else {
    $divider.css('display', 'none');
  }
};

var search = function search(value) {
  if (value.length === 0) {
    $('#results').empty();
    toggleDividerVisibility();
    toggleContentOpacity();
  } else {
    var result = searchIterator(value);
    var template = returnTemplateContent(result, true);

    $('#results').html(template).css('display', 'block');
    addLikeEventListeners(true);
    reinitiateCollapsibles();
  }
};

var removePreviousResults = function removePreviousResults() {
  $('#results').empty();
  toggleDividerVisibility('add');
};

var addFilterEventListeners = function addFilterEventListeners() {
  var objs = ['#filter-type', '#filter-language'];

  // https://stackoverflow.com/questions/33934893/materializecss-multiple-select-value-stays-in-array-after-unselecting
  $;

  $.each(objs, function (i, el) {
    $(el).change(function () {
      var _ref4 = [[], $(this)],
          newValuesArr = _ref4[0],
          select = _ref4[1];

      var ul = select.prev();
      ul.children('li').toArray().forEach(function (li, i) {
        if ($(li).hasClass('active')) {
          newValuesArr.push(select.children('option').toArray()[i].value);
        }
      });
      select.val(newValuesArr);

      search($('#search').val().toLowerCase());
    });
  });
};

$('#search')[0].addEventListener('input', function searchHandler() {
  if ($('#results').length !== 0) {
    removePreviousResults();
  }

  toggleContentOpacity(true);

  search($(this).val().toLowerCase());
});

$.getJSON('api/getJSON.php', function (data) {
  jsonData = data;
  $('#content').append(returnTemplateContent(jsonData, false));
  appendFilterOptions(jsonData);
  addFilterEventListeners();
  $('.collapsible').collapsible();
  $('select').material_select();

  addLikeEventListeners(false);
});
