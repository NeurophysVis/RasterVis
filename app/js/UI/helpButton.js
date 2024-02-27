// Set up help overlay
let overlay = d3.select('#overlay');
let helpButton = d3.select('button#help-button');
overlay.selectAll('.close')
  .on('click', function () {
    overlay.style('display', 'none');
  });

helpButton
  .on('click', function () {
    overlay
      .style('display', 'block');
  });

export default helpButton;
