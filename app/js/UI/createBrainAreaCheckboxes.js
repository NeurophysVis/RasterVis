export default function() {
  let dispatch = d3.dispatch('change');

  function _createCheckbox(selection) {
    selection.each(function (data) {
      if (data.length === undefined || data.length === 0) {
        return;
      }

      let checkboxes = d3.select(this).selectAll('.checkbox').data(data);
      checkboxes.enter()
        .append('div')
        .attr('class', 'checkbox')
        .append('label').html(function (brainArea) {
          return '<input id="' + brainArea + '" type="checkbox" class="category" checked="checked">' + brainArea;
        });

      checkboxes.select('input').on('change', function (d) {
        dispatch.change();
      });
    });
  }

  d3.rebind(_createCheckbox, dispatch, 'on');

  return _createCheckbox;
}
