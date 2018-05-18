String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

const likeThis = (el) => {
  const actualId = el.id;
  const id = actualId.replace(/like-/, '');
  $.post('api/like.php', { like: id }, (response) => {
    if (response.success) {
      const button = $(`#${actualId}`);
      const likeSpan = button.next('span');
      const likeValue = parseInt(likeSpan.text());
      likeSpan.text(likeValue + 1);
      button.addClass('thumbs-up');
    }
  });
};

const addLikeEventListeners = () => {
  const likeElements = $('[id*=like-]');

  $.each(likeElements, (i, el) => {
    el.addEventListener('click', function likeHandler() {
      this.removeEventListener('click', likeHandler);
      likeThis(el);
    });
  });
};

const returnCollectionItem = (now, file, dataset, iteration, aAttributes) => {
  let badgeClass = 'badge';

  if (now - file.added <= 604800000) {
    badgeClass += ' new';
  }

  return `
  <li class="collection-item">
    <a href="${file.url}" ${aAttributes}">${file.title}</a>
    <i id="like-${dataset}-${iteration}" class="material-icons">thumb_up</i>
    <span>${file.likes}</span>
    <a href="${file.src}" ${aAttributes} class="material-icons" title="Source">attachment</a>
    <span class="${badgeClass}">${file.type}</span>
  </li>`;
};

$('.button-collapse').sideNav();

const [main, now, aAttributes] = [
  $('main'),
  Date.now(),
  'target="_blank" rel="noopener noreferrer"',
];

$.getJSON('api/getJSON.php', (data) => {
  let template = `
  <ul class="collapsible popout row">
  `;

  $.each(data, (i, dataset) => {
    template += `
    <li>
      <div class="collapsible-header hoverable card-panel">
        <i class="material-icons">filter_drama</i>
        ${i.capitalize()}
        <span class="badge">${dataset.length.toLocaleString('en-US')} items</span>
      </div>
      <div class="collapsible-body secondary">
        <ul class="collection">
    `;

    $.each(dataset, (k, file) => {
      template += returnCollectionItem(now, file, i, k, aAttributes);
    });

    template += `
        </ul>
      </div>
    </li>`;
  });

  template += `
  </ul>`;

  main.append(template);

  $('.collapsible').collapsible();
  addLikeEventListeners();
});
