'use strict';

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

var likeThis = function likeThis(el) {
  var actualId = el.id;
  var id = actualId.replace(/like-/, '');
  $.post('api/like.php', { like: id }, function(response) {
    if (response.success) {
      var button = $('#' + actualId);
      var likeSpan = button.next('span');
      var likeValue = parseInt(likeSpan.text());
      likeSpan.text(likeValue + 1);
      button.addClass('thumbs-up');
    }
  });
};

var addLikeEventListeners = function addLikeEventListeners() {
  var likeElements = $('[id*=like-]');

  $.each(likeElements, function(i, el) {
    el.addEventListener('click', function likeHandler() {
      this.removeEventListener('click', likeHandler);
      likeThis(el);
    });
  });
};

var returnCollectionItem = function returnCollectionItem(
  now,
  file,
  dataset,
  iteration,
  aAttributes,
) {
  var badgeClass = 'badge';

  if (now - file.added <= 604800000) {
    badgeClass += ' new';
  }

  return (
    '\n  <li class="collection-item">\n    <a href="' +
    file.url +
    '" ' +
    aAttributes +
    '">' +
    file.title +
    '</a>\n    <i id="like-' +
    dataset +
    '-' +
    iteration +
    '" class="material-icons">thumb_up</i>\n    <span>' +
    file.likes +
    '</span>\n    <a href="' +
    file.src +
    '" ' +
    aAttributes +
    ' class="material-icons" title="Source">attachment</a>\n    <span class="' +
    badgeClass +
    '">' +
    file.type +
    '</span>\n  </li>'
  );
};

$('.button-collapse').sideNav();

var _ref = [$('main'), Date.now(), 'target="_blank" rel="noopener noreferrer"'],
  main = _ref[0],
  now = _ref[1],
  aAttributes = _ref[2];

$.getJSON('api/getJSON.php', function(data) {
  var template = '\n  <ul class="collapsible popout row">\n  ';

  $.each(data, function(i, dataset) {
    template +=
      '\n    <li>\n      <div class="collapsible-header hoverable card-panel">\n        <i class="material-icons">filter_drama</i>\n        ' +
      i.capitalize() +
      '\n        <span class="badge">' +
      dataset.length.toLocaleString('en-US') +
      ' items</span>\n      </div>\n      <div class="collapsible-body secondary">\n        <ul class="collection">\n    ';

    $.each(dataset, function(k, file) {
      template += returnCollectionItem(now, file, i, k, aAttributes);
    });

    template += '\n        </ul>\n      </div>\n    </li>';
  });

  template += '\n  </ul>';

  main.append(template);

  $('.collapsible').collapsible();
  addLikeEventListeners();
});
