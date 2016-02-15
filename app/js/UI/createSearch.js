export default function () {
  let fuseOptions = {};
  let dispatch = d3.dispatch('click');

  function searchBox(selection) {
    selection.each(function (data) {
      let fuseSearch = new Fuse(data, fuseOptions);

      selection.select('input').on('input', function () {
        let curInput = d3.select(this).property('value');
        let guesses = fuseSearch.search(curInput).map(function (d) {return data[d];});

        if (guesses.length > 5) guesses = guesses.slice(0, 5);

        let guessList = selection.select('ul').selectAll('li').data(guesses, String);
        guessList.enter()
          .append('li')
            .append('a')
            .attr('role', 'menuitem')
            .attr('tabindex', -1)
            .text(function (d) {return d;});

        guessList.selectAll('a').on('click', function (d) {
          selection.select('input').property('value', '');
          dispatch.click(d);
        });

        guessList.exit().remove();

        selection.classed('open', guesses.length > 0);
      });
    });
  }

  searchBox.fuseOptions = function (value) {
    if (!arguments.length) return fuseOptions;
    fuseOptions = value;
    return fuseOptions;
  };

  d3.rebind(searchBox, dispatch, 'on');
  return searchBox;
}
