export default function (kernel, x) {
  return function (sample) {
    return x.map(function (x) {
      return [x, d3.mean(sample, function (v) { return kernel(x - v); })];
    });
  };
}
