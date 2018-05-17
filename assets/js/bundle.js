'use strict';

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

$(function () {
  $('.button-collapse').sideNav();

  var _ref = [$('main'), Date.now()],
      main = _ref[0],
      now = _ref[1];


  $.getJSON('api/getJSON.php', function (data) {
    var template = '\n    <ul class="collapsible popout row">\n    ';

    $.each(data, function (i, dataset) {
      template += '\n        <li>\n          <div class="collapsible-header hoverable card-panel">\n            <i class="material-icons">filter_drama</i>\n            ' + i.capitalize() + '\n            <span class="badge">' + dataset.length.toLocaleString('en-US') + ' items</span>\n          </div>\n          <div class="collapsible-body secondary">\n            <ul class="collection">\n              ';

      $.each(dataset, function (k, file) {
        var badgeClass = 'badge';

        if (now - file.added <= 604800000) {
          badgeClass += ' new';
        }

        template += '\n              <li class="collection-item">\n                <a href="' + file.url + '" target="_blank" rel="noopener noreferrer">' + file.title + '</> <span class="' + badgeClass + '">' + file.type + '</span> \u2013 <a href="' + file.src + '" target="_blank" rel="noopener noreferrer">Source</a>\n              </li>';
      });

      template += '\n            </ul>\n          </div>\n        </li>';
    });

    template += '\n      </ul>';

    main.append(template);

    $('.collapsible').collapsible();
  });
});
