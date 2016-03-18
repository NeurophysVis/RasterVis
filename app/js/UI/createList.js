export default function () {
  let key = '';
  let curSelected = '';
  let dispatch = d3.dispatch('click');

  function list(selection) {
    selection.each(function (data) {
      if (data.length === undefined || data.length === 0) {
        if (data[key] !== undefined) {
          data = [data];
        } else return;
      }

      let options = d3.select(this).select('select').selectAll('option')
        .data(data, function (d) {
          return d[key];
        });

      options.enter()
        .append('option')
        .text(function (d) {return d[key];});

      options.exit().remove();
      options.property('selected', false);
      options.filter(function (d) {return d[key] === curSelected;}).property('selected', true);
      options.on('click', function (d) { return dispatch.click(d[key]); });

    });
  }

  list.key = function (value) {
    if (!arguments.length) return key;
    key = value;
    return list;
  };

  list.curSelected = function (value) {
    if (!arguments.length) return curSelected;
    curSelected = value;
    return list;
  };

  d3.rebind(list, dispatch, 'on');

  return list;
}
