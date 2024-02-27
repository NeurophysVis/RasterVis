export default function () {
  let key;
  let displayName;
  let options;
  let dispatch = d3.dispatch('click');

  function _createDropdown(selection) {
    selection.each(function (data) {
      let menu = d3.select(this).selectAll('ul').selectAll('li').data(options,
        function (d) { return d[key]; });

      displayName = (typeof displayName === 'undefined') ? key : displayName;

      menu.enter()
        .append('li')
        .attr('id', function (d) {
          return d[key];
        })
        .attr('role', 'presentation')
        .append('a')
        .attr('role', 'menuitem')
        .attr('tabindex', -1)
        .text(function (d) {
          return d[displayName];
        });

      menu.on('click', dispatch.click);

      menu.exit().remove();

      let curText = options.filter(function (d) { return d[key] === data; })
        .map(function (d) { return d[displayName]; })[0];

      d3.select(this).selectAll('button')
        .text(curText)
        .append('span')
        .attr('class', 'caret');
    });

  }

  _createDropdown.key = function (value) {
    if (!arguments.length) return key;
    key = value;
    return _createDropdown;
  };

  _createDropdown.options = function (value) {
    if (!arguments.length) return options;
    options = value;
    return _createDropdown;
  };

  _createDropdown.displayName = function (value) {
    if (!arguments.length) return displayName;
    displayName = value;
    return _createDropdown;
  };

  d3.rebind(_createDropdown, dispatch, 'on');

  return _createDropdown;

}
