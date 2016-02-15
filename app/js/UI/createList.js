export default function () {
  let dispatch = d3.dispatch('click');

  function list(selection) {
    selection.each(function (data) {
      let options = d3.select(this).select('select').selectAll('options').data(data, String);
      options.enter()
        .append('option')
        .text(function (d) {return d;});

      options.exit().remove();
      options.on('click', function (d) { return dispatch.click(d); });

    });
  }

  d3.rebind(list, dispatch, 'on');

  return list;
}
