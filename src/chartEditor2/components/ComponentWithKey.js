goog.provide('anychart.chartEditor2Module.ComponentWithKey');

goog.require('anychart.chartEditor2Module.Component');


/**
 * Component, that can be connected to model and chart settings.
 *
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.Component}
 */
anychart.chartEditor2Module.ComponentWithKey = function(model, opt_domHelper) {
  anychart.chartEditor2Module.ComponentWithKey.base(this, 'constructor', opt_domHelper);

  this.setModel(model);

  /**
   * Editor Model key.
   *
   * @type {anychart.chartEditor2Module.EditorModel.Key}
   * @protected
   */
  this.key = [];
};
goog.inherits(anychart.chartEditor2Module.ComponentWithKey, anychart.chartEditor2Module.Component);


/** @inheritDoc */
anychart.chartEditor2Module.ComponentWithKey.prototype.enterDocument = function() {
  this.update();

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  this.getHandler().listen(model, anychart.chartEditor2Module.events.EventType.EDITOR_MODEL_UPDATE, this.update);

  anychart.chartEditor2Module.ComponentWithKey.base(this, 'enterDocument');
};


/**
 * Getter for model key.
 *
 * @param {(string|Array)=} opt_completion
 * @return {anychart.chartEditor2Module.EditorModel.Key}
 */
anychart.chartEditor2Module.ComponentWithKey.prototype.getKey = function(opt_completion) {
  return goog.isDef(opt_completion) ? goog.array.concat(this.key, opt_completion) : this.key;
};


/**
 * Updates component on model change.
 */
anychart.chartEditor2Module.ComponentWithKey.prototype.update = function() {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  this.getHandler().listenOnce(model, anychart.chartEditor2Module.events.EventType.CHART_DRAW, this.onChartDraw);
};


/**
 * Callback on chart draw.
 * @param {Object} evt
 */
anychart.chartEditor2Module.ComponentWithKey.prototype.onChartDraw = function(evt) {
  // evt.chart
  // evt.rebuild
};