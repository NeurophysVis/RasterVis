export default function () {
  let dispatch = d3.dispatch('change');

  function _createCheckbox(selection) {
    selection.each(function (data) {
      if (data.length === undefined || data.length === 0) {
        return;
      }

      let checkboxes = d3.select(this).selectAll('.checkbox').data(data);
      var checkboxEnter = checkboxes.enter()
        .append('div')
        .attr('class', 'checkbox');
      checkboxEnter
        .append('input')
        .attr('id', function (brainArea) { return brainArea; })
        .attr('checked', 'checked')
        .attr('type', 'checkbox')
        .attr('class', 'form-check-input');
      checkboxEnter
        .append('label').html(function (brainArea) {
          return brainArea;
        })
        .attr('class', 'form-check-label');

      checkboxes.select('input').on('change', function (d) {
        dispatch.change();
      });
    });
  }

  d3.rebind(_createCheckbox, dispatch, 'on');

  return _createCheckbox;
}
