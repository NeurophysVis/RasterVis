export default function (isLoading, neuronName) {
  if (!isLoading) {
    d3.selectAll('#chart svg').attr('display', 'none');
    d3.select('#chart')
      .append('text')
      .attr('class', 'loading')
      .html('Loading... ' + neuronName);
  } else {
    d3.select('.loading').remove();
    d3.selectAll('#chart svg').attr('display', '');
  }
}
