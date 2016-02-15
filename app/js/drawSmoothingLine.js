import flatten from '../../node_modules/lodash-es/flatten';
import kernelDensityEstimator from './kernelDensityEstimator';
import gaussianKernel from './gaussianKernel';

export default function (selection, data, timeScale, yScale, lineSmoothness, curEvent, interactionFactor) {
  // Nest by interaction factor
  let spikes = d3.nest().key(function (d) {return d[interactionFactor];}).entries(data);
  let kde = kernelDensityEstimator(gaussianKernel(lineSmoothness), timeScale.ticks(400));

  spikes.forEach(function (e) {

    // Reshape the data into the kernel density estimate of spikes
    e.values = kde(

      // flatten the spikes into one array
      flatten(
        e.values.map(function (d) { // adjust spike times to be relative to cue
          if (d.spikes[0] != undefined) {
            return d.spikes.map(function (spike) {
              return spike - d[curEvent];
            });
          } else {
            return undefined;
          }
        })
      )

    );
  });

  // max value of density estimate
  let maxKDE = d3.max(spikes.map(function (d) {
    return d3.max(d.values, function (e) {
      return e[1];
    });
  }));

  let kdeScale = d3.scale.linear()
      .domain([0, maxKDE])
      .range([d3.max(yScale.range()), 0]);

  let kdeG = selection.selectAll('g.kde').data(spikes, function (d) {return d.key;});

  kdeG.enter()
    .append('g')
      .attr('class', 'kde');
  kdeG.exit()
    .remove();

  let line = d3.svg.line()
    .x(function (d) {return timeScale(d[0]);})
    .y(function (d) {return kdeScale(d[1]);});

  let kdeLine = kdeG.selectAll('path.kdeLine').data(function (d) {return [d];});

  kdeLine.enter()
    .append('path')
      .attr('class', 'kdeLine');
  kdeLine
    .transition()
      .duration(1000)
    .attr('d', function (d) {return line(d.values);})
    .attr('stroke', function (d) {
      return 'black';});

  kdeLine.exit()
    .remove();

}
