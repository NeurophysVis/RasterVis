export default function (isLoading) {
  if (!isLoading) {
    d3.selectAll('#chart svg').attr('display', 'none');
    d3.select('#chart').append('text').attr('class', 'loading').text('Loading...');
  } else {
    d3.select('.loading').remove();
    d3.selectAll('#chart svg').attr('display', '');
  }
}
