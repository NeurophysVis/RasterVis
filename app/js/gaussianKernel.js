export default function (bandwidth) {
  return function (spikeTime) {
    return Math.exp((spikeTime * spikeTime) / (-2 * bandwidth * bandwidth))
      / (bandwidth * Math.sqrt(2 * Math.PI));
  };
}
