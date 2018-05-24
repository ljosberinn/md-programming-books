<div class="row">
  <div class="input-field col s8 offset-s2">
    <i class="material-icons prefix">search</i>
    <input type="text" class="validate" id="search">
    <label for="icon_prefix">Search... e.g. <i>cookbook</i></label>
  </div>
</div>

<div class="row">
  <div class="col m4 s8 offset-s2">
    <div class="select-wrapper">
      <select multiple class="select-dropdown dropdown-trigger" id="filter-language"></select>
      <label for="filter-language">filter language</label>
    </div>
  </div>
  <div class="col m4 s8 offset-s2 offset-m0">
    <div class="select-wrapper">
      <select class="select-dropdown dropdown-trigger" id="filter-type">
        <option selected>select or reset</option>
      </select>
      <label for="filter-type">filter resource type</label>
    </div>
  </div>
</div>

<ul id="results" class="collapsible popout row"></ul>

<div id="divider" class="divider"></div>

<ul id="content" class="collapsible popout row"></ul>
