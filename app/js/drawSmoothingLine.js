import kernelDensityEstimator from './kernelDensityEstimator';
import gaussianKernel from './gaussianKernel';

export default function (selection, data, timeScale, yScale, lineSmoothness, curEvent, interactionFactor, colorScale) {
  // Nest by interaction factor
  let spikes = d3.nest()
    .key(function (d) {return d[interactionFactor];})
    .entries(data.filter(function (d) {
      return d.start_time != null && d.isIncluded === 'Included';
    })); // Don't include trials with no start time or excluded

  // Compute kernel density estimate
  let timeRange = d3.range(d3.min(timeScale.domain()), d3.max(timeScale.domain()));
  let kde = kernelDensityEstimator(gaussianKernel(lineSmoothness), timeRange);

  spikes.forEach(function (factor) {

    let kdeByTrial = factor.values.map(function (trial) {
      if (trial.spikes[0] !== undefined) {
        return kde(
          trial.spikes.map(function (spike) { return spike - trial[curEvent];})
        );
      } else if (trial.start_time !== null) {
        return kde(0);
      }
    });

    let y = kdeByTrial.map(function (trial) {
      if (trial !== undefined) {
        return trial.map(function (e) { return e[1]; });
      };
    });

    factor.values = timeRange.map(function (time, ind) {
      return [
        time,
        1000 * d3.mean(y.map(function (row) {
          if (row != undefined) return row[ind];
        })),
      ];

    });

  });

  // max value of density estimate
  let maxKDE = d3.max(spikes.map(function (d) {
    return d3.max(d.values, function (e) {
      return e[1];
    });
  }));

  let kdeScale = d3.scale.linear()
      .domain([0, maxKDE])
      .range([yScale.range()[0] + yScale.rangeBand(), 0]);

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
      let factorName = (d.key === 'undefined') ? 'Spike' : d.key;
      return colorScale(factorName);
    });

  kdeLine.exit()
    .remove();

  return maxKDE;

}
