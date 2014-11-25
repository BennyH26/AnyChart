goog.provide('anychart.modules.scatter');

goog.require('anychart.charts.Scatter');
goog.require('anychart.core.scatter.series.Bubble');
goog.require('anychart.core.scatter.series.Line');
goog.require('anychart.core.scatter.series.Marker');
goog.require('anychart.modules.base');


/**
 * Returns a scatter chart instance with initial settings (axes, grids, title).<br/>
 * By default creates marker series if arguments is set.
 * @example
 * anychart.scatter([20, 7, 10, 14])
 *    .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.charts.Scatter} Chart with defaults for scatter series.
 */
anychart.scatter = function(var_args) {
  var chart = new anychart.charts.Scatter();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.marker(arguments[i]);
  }

  chart.title().text('Chart Title');

  chart.xAxis();
  chart.yAxis();

  chart.grid(0)
      .layout(anychart.enums.Layout.HORIZONTAL);

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.1')
      .layout(anychart.enums.Layout.HORIZONTAL);

  chart.grid(1)
      .evenFill('none')
      .oddFill('none')
      .layout(anychart.enums.Layout.VERTICAL);

  return chart;
};

//exports
goog.exportSymbol('anychart.scatter', anychart.scatter);
goog.exportSymbol('anychart.scatterChart', anychart.scatter);