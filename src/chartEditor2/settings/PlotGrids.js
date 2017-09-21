goog.provide('anychart.chartEditor2Module.settings.PlotGrids');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.settings.Grid');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {number=} opt_plotIndex
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.settings.PlotGrids = function(model, opt_plotIndex, opt_domHelper) {
  anychart.chartEditor2Module.settings.PlotGrids.base(this, 'constructor', model, opt_domHelper);
  this.plotIndex_ = opt_plotIndex;
  this.name = goog.isDef(this.plotIndex_) ? 'Grids (plot ' + this.plotIndex_ + ')': 'Grids';
  this.key = [['chart'], ['settings']];
  if (goog.isDef(this.plotIndex_))
    this.key.push('plot(' + this.plotIndex_ + ')');
};
goog.inherits(anychart.chartEditor2Module.settings.PlotGrids, anychart.chartEditor2Module.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditor2Module.settings.PlotGrids.CSS_CLASS = goog.getCssName('settings-plot-grids');


/** @override */
anychart.chartEditor2Module.settings.PlotGrids.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.PlotGrids.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.PlotGrids.CSS_CLASS);

  var content = this.getContentElement();
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  var xGrid = new anychart.chartEditor2Module.settings.Grid(model, 'X Grid', 0);
  xGrid.allowEnabled(true);
  xGrid.setKey(this.genKey('grid(0)'));
  this.addChild(xGrid, true);
  this.xGrid_ = xGrid;

  var yGrid = new anychart.chartEditor2Module.settings.Grid(model, 'Y Grid', 1);
  yGrid.allowEnabled(true);
  yGrid.setKey(this.genKey('grid(1)'));
  this.addChild(yGrid, true);
  this.yGrid_ = yGrid;
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.PlotGrids.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    this.key = [['chart'], ['settings']];
    if (goog.isDef(this.plotIndex_))
      this.key.push('plot(' + this.plotIndex_ + ')');

    var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

    // Update keys of children
    if (this.xGrid_) this.xGrid_.setKey(this.genKey('grid(0)'));
    if (this.yGrid_) this.yGrid_.setKey(this.genKey('grid(1)'));
  }

  // Update key of enabled checkbox
  anychart.chartEditor2Module.settings.PlotGrids.base(this, 'updateKeys');
};


/** @override */
anychart.chartEditor2Module.settings.PlotGrids.prototype.disposeInternal = function() {
  this.xGrid_.dispose();
  this.xGrid_ = null;

  this.yGrid_.dispose();
  this.yGrid_ = null;

  anychart.chartEditor2Module.settings.PlotGrids.base(this, 'disposeInternal');
};
