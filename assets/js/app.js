String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

$(() => {
  $('.button-collapse').sideNav();

  const [main, now] = [$('main'), Date.now()];

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
        let badgeClass = 'badge';

        if (now - file.added <= 604800000) {
          badgeClass += ' new';
        }

        template += `
              <li class="collection-item">
                <a href="${file.url}" target="_blank" rel="noopener noreferrer">${file.title}</> <span class="${badgeClass}">${file.type}</span> – <a href="${file.src}" target="_blank" rel="noopener noreferrer">Source</a>
              </li>`;
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
  });
});
