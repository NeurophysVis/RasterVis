export default function () {

  let stepSize;
  let domain;
  let maxStepInd;
  let units;
  let curValue;
  let minValue;
  let maxValue;
  let running = false;
  let delay = 200;
  let dispatch = d3.dispatch('sliderChange', 'start', 'stop');

  function _createSlider(selection) {
    selection.each(function (value) {
      let input = d3.select(this).selectAll('input');
      let output = d3.select(this).selectAll('output');
      stepSize = stepSize || d3.round(domain[1] - domain[0], 4);
      maxStepInd = domain.length - 1;
      curValue = value;
      minValue = d3.min(domain);
      maxValue = d3.max(domain);

      input.property('min', minValue);
      input.property('max', maxValue);
      input.property('step', stepSize);
      input.property('value', value);
      input.on('input', function () {
        output.text(this.value + ' ' + units);
      });

      input.on('change', function () {
        dispatch.sliderChange(+this.value);
      });

      output.text(value + ' ' + units);
    });
  };

  _createSlider.stepSize = function (value) {
    if (!arguments.length) return stepSize;
    stepSize = value;
    return _createSlider;
  };

  _createSlider.running = function (value) {
    if (!arguments.length) return running;
    running = value;
    return _createSlider;
  };

  _createSlider.delay = function (value) {
    if (!arguments.length) return delay;
    delay = value;
    return _createSlider;
  };

  _createSlider.domain = function (value) {
    if (!arguments.length) return domain;
    domain = value;
    return _createSlider;
  };

  _createSlider.units = function (value) {
    if (!arguments.length) return units;
    units = value;
    return _createSlider;
  };

  _createSlider.maxStepInd = function (value) {
    if (!arguments.length) return maxStepInd;
    maxStepInd = value;
    return _createSlider;
  };

  _createSlider.curValue = function (value) {
    if (!arguments.length) return curValue;
    curValue = value;
    return _createSlider;
  };

  _createSlider.play = function () {
    running = true;
    dispatch.start();

    let t = setInterval(step, delay);

    function step() {
      if (curValue < maxValue && running) {
        curValue += stepSize;
        dispatch.sliderChange(curValue);
      } else {
        dispatch.stop();
        running = false;
        clearInterval(t);
      }
    }
  };

  _createSlider.stop = function () {
    running = false;
    dispatch.stop();
  };

  _createSlider.reset = function () {
    running = false;
    dispatch.sliderChange(minValue);
    dispatch.stop();
  };

  d3.rebind(_createSlider, dispatch, 'on');

  return _createSlider;

}
