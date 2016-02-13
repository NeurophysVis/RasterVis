export default function (scale) {
  return function (u) {
    return Math.exp((-0.5 * u * u) / (scale * scale)) / (scale * Math.sqrt(2 * Math.PI));
  };
}
