export default function () {
  let fuseOptions = {};
  let key = '';
  let dispatch = d3.dispatch('click');

  function searchBox(selection) {
    selection.each(function (data) {
      let fuseSearch = new Fuse(data, fuseOptions);

      selection.select('input').on('input', function () {
        let curInput = d3.select(this).property('value');
        if (curInput.length < 2) return;
        let guesses = fuseSearch.search(curInput);

        guesses = guesses.filter(function (g) {return g.score < 0.05;});

        if (guesses.length > 20) guesses = guesses.slice(0, 20);

        let guessList = selection.select('ul').selectAll('li').data(guesses.map(function (d) {return d.item[key];}), String);

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

        selection.classed('open', guesses.length > 0 & curInput.length > 2);
      });
    });
  }

  searchBox.fuseOptions = function (value) {
    if (!arguments.length) return fuseOptions;
    fuseOptions = value;
    return searchBox;
  };

  searchBox.fuseOptions = function (value) {
    if (!arguments.length) return fuseOptions;
    fuseOptions = value;
    return searchBox;
  };

  searchBox.key = function (value) {
    if (!arguments.length) return key;
    key = value;
    return searchBox;
  };

  d3.rebind(searchBox, dispatch, 'on');
  return searchBox;
}
