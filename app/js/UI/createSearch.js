export default function () {
  let fuseOptions = {};
  let key = '';
  let dispatch = d3.dispatch('click');
  let guessIndex = 0;
  let guesses;
  const MAX_GUESSES = 10;

  function searchBox(selection) {
    selection.each(function (data) {
      let fuseSearch = new Fuse(data, fuseOptions);

      selection.select('input').on('input', function () {
        let curInput = d3.select(this).property('value');
        if (curInput.length < 2) {
          selection.classed('open', false);
          guessIndex = 0;
          return;
        }
        guesses = fuseSearch.search(curInput);

        guesses = guesses.filter(function (g) {return g.score < 0.05;});

        if (guesses.length > MAX_GUESSES) guesses = guesses.slice(0, MAX_GUESSES);

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

        d3.select(this).on('keydown', function () {
          let li = selection.select('ul').selectAll('li');
          switch (d3.event.keyCode) {
            case 38: // up
              guessIndex = (guessIndex > 0) ? guessIndex - 1 : 0;
              li.classed('active', false);
              li.filter(function (d, ind) {
                return ind === guessIndex;
              }).classed('active', true);
              break;
            case 40: // down
              li.classed('active', false);
              li.filter(function (d, ind) {
                return ind === guessIndex;
              }).classed('active', true);
              guessIndex = (guessIndex < guesses.length - 1) ? guessIndex + 1 : guesses.length - 1;
              break;
            case 13: // enter
              selection.classed('open', false);
              selection.select('input').property('value', '');
              dispatch.click(selection.select('ul').selectAll('.active').data()[0]);
              break;
          }

        });
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
