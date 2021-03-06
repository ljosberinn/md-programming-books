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

var returnTemplateBodyStart = function returnTemplateBodyStart(language, dataset, iteration) {
  return '\n    <li class="flip-in-hor-bottom" style="animation-delay: ' + iteration * 0.1 + 's;">\n      <div class="collapsible-header">\n        <i class="material-icons">android</i>\n        ' + capitalize(language) + '\n        <span class="badge">' + dataset.length.toLocaleString('en-US') + ' items</span>\n      </div>\n      <div class="collapsible-body secondary">\n        <ul class="collection">\n    ';
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

var returnEmptyTemplate = function returnEmptyTemplate() {
  return '\n      <li class="flip-in-hor-bottom active">\n        <div class="collapsible-header active">\n          <i class="material-icons">sentiment_dissatisfied</i>\n          Sorry, nothing was found...\n          <span class="badge">0 items</span>\n        </div>\n        <div class="collapsible-body secondary">\n          <ul class="collection">\n            <li class="collection-item">\n              call to action - contribute\n            </li>\n          </ul>\n        </div>\n      </li>';
};

var compareSearchResultWithEmpty = function compareSearchResultWithEmpty(template) {
  var strLen = template.length;
  var string = template;

  if (strLen === 80 || strLen === 0) {
    string = returnEmptyTemplate();
    toggleContentOpacity(false);
  }

  return string;
};

var returnTemplateContent = function returnTemplateContent(container, search) {
  var string = '',
      iteration = 0;


  $.each(container, function (language, dataset) {
    string += returnTemplateBodyStart(language, dataset, iteration);

    $.each(dataset, function (k, file) {
      string += returnCollectionItem(file, language, k, search);
    });

    string += returnTemplateBodyEnding();

    iteration += 1;
  });

  string = compareSearchResultWithEmpty(string);

  return string;
};

var searchIterator = function searchIterator(value) {
  var $selectedLanguage = $('#filter-language').val();
  var _ref2 = [{}, $('#filter-type').val()],
      result = _ref2[0],
      $selectedType = _ref2[1];


  if ($selectedType === 'select or reset') {
    $selectedType = null;
  }

  function performSearch(searchLanguage) {
    var obj = {};

    $.each(jsonData, function (language, el) {
      if (searchLanguage && searchLanguage !== language.toLowerCase()) {
        return true;
      }

      $.each(el, function (i, subObj) {
        var stringifiedObj = JSON.stringify(subObj).toLowerCase();

        if ($selectedType !== null && $selectedType !== subObj.type.toLowerCase()) {
          return true;
        }

        if (stringifiedObj.indexOf(value) > -1) {
          var currentL = 0;

          if (obj[language]) {
            currentL = obj[language].length;
          }
          if (currentL > 0) {
            obj[language].push(subObj);
          } else {
            obj[language] = [subObj];
          }
        }
      });
    });

    return obj;
  }

  if ($selectedLanguage.length !== 0) {
    $.each($selectedLanguage, function (i, searchLanguage) {
      Object.assign(result, performSearch(searchLanguage));
    });
  } else {
    result = performSearch();
  }

  if ($selectedLanguage.length === 0 && $selectedType === null && value === '') {
    result = {};
  }

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

var removePreviousResults = function removePreviousResults() {
  $('#results').empty();
  toggleDividerVisibility('add');
};

var initiateRipple = function initiateRipple() {
  $.ripple('.collection-item', {
    debug: false,
    on: 'mousedown',

    opacity: 0.2,
    color: 'auto',
    multi: false,

    duration: 0.5,

    rate: function rate(pxPerSecond) {
      return pxPerSecond;
    },


    easing: 'linear'
  });
};

var search = function search(value) {
  if ($('#results').length !== 0) {
    removePreviousResults();
  }

  toggleContentOpacity(true);

  if (value.length === 0 && $('#filter-language').val() === null && $('#filter-type').val() === null) {
    $('#results').empty();
    toggleDividerVisibility();
    toggleContentOpacity();
  } else {
    var result = searchIterator(value);
    var template = returnTemplateContent(result, true);

    $('#results').html(template).css('display', 'block');
    addLikeEventListeners(true);
    reinitiateCollapsibles();
    initiateRipple();
  }
};

var addFilterEventListeners = function addFilterEventListeners() {
  var objs = ['#filter-type', '#filter-language'];

  // https://stackoverflow.com/questions/33934893/materializecss-multiple-select-value-stays-in-array-after-unselecting
  $.each(objs, function (i, el) {
    $(el).change(function () {
      var _ref4 = [[], $(this)],
          newValuesArr = _ref4[0],
          select = _ref4[1];

      var ul = select.prev();
      ul.children('li').toArray().forEach(function (li, k) {
        if ($(li).hasClass('active')) {
          newValuesArr.push(select.children('option').toArray()[k].value);
        }
      });
      select.val(newValuesArr);

      search($('#search').val().toLowerCase());
    });
  });
};

$('#search')[0].addEventListener('input', function searchHandler() {
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
  initiateRipple();
});
'use strict';

(function ($, document, Math) {
  $.ripple = function (selector, options) {
    var self = this;

    var _log = self.log = function () {
      if (self.defaults.debug && console && console.log) {
        var _console;

        (_console = console).log.apply(_console, arguments);
      }
    };

    self.selector = selector;
    self.defaults = {
      debug: false,
      on: 'mousedown',

      opacity: 0.4,
      color: 'auto',
      multi: false,

      duration: 0.7,
      rate: function rate(pxPerSecond) {
        return pxPerSecond;
      },


      easing: 'linear'
    };

    self.defaults = $.extend({}, self.defaults, options);

    var Trigger = function Trigger(e) {
      var $this = $(this);
      var $ripple = void 0;
      var settings = void 0;

      $this.addClass('has-ripple');

      // This instances settings
      settings = $.extend({}, self.defaults, $this.data());

      // Create the ripple element
      if (settings.multi || !settings.multi && $this.find('.ripple').length === 0) {
        $ripple = $('<span></span>').addClass('ripple');
        $ripple.appendTo($this);

        _log('Create: Ripple');

        // Set ripple size
        if (!$ripple.height() && !$ripple.width()) {
          var size = Math.max($this.outerWidth(), $this.outerHeight());
          $ripple.css({
            height: size,
            width: size
          });
          _log('Set: Ripple size');
        }

        // Give the user the ability to change the rate of the animation
        // based on element width
        if (settings.rate && typeof settings.rate == 'function') {
          // rate = pixels per second
          var rate = Math.round($ripple.width() / settings.duration);

          // new amount of pixels per second
          var filteredRate = settings.rate(rate);

          // Determine the new duration for the animation
          var newDuration = $ripple.width() / filteredRate;

          // Set the new duration if it has not changed
          if (settings.duration.toFixed(2) !== newDuration.toFixed(2)) {
            _log('Update: Ripple Duration', {
              from: settings.duration,
              to: newDuration
            });
            settings.duration = newDuration;
          }
        }

        // Set the color and opacity
        var color = settings.color == 'auto' ? $this.css('color') : settings.color;
        var css = {
          animationDuration: settings.duration.toString() + 's',
          animationTimingFunction: settings.easing,
          background: color,
          opacity: settings.opacity
        };

        _log('Set: Ripple CSS', css);
        $ripple.css(css);
      }

      // Ensure we always have the ripple element
      if (!settings.multi) {
        _log('Set: Ripple Element');
        $ripple = $this.find('.ripple');
      }

      // Kill animation
      _log('Destroy: Ripple Animation');
      $ripple.removeClass('ripple-animate');

      // Retrieve coordinates
      var x = e.pageX - $this.offset().left - $ripple.width() / 2;
      var y = e.pageY - $this.offset().top - $ripple.height() / 2;

      /**
             * We want to delete the ripple elements if we allow multiple so we dont sacrifice any page
             * performance. We don't do this on single ripples because once it has rendered, we only
             * need to trigger paints thereafter.
             */
      if (settings.multi) {
        _log('Set: Ripple animationend event');
        $ripple.one('animationend webkitAnimationEnd oanimationend MSAnimationEnd', function () {
          _log('Note: Ripple animation ended');
          _log('Destroy: Ripple');
          $(this).remove();
        });
      }

      // Set position and animate
      _log('Set: Ripple location');
      _log('Set: Ripple animation');
      $ripple.css({
        top: y + 'px',
        left: x + 'px'
      }).addClass('ripple-animate');
    };

    $(document).on(self.defaults.on, self.selector, Trigger);
  };
})(jQuery, document, Math);
