goog.provide('anychart.chartEditor2Module.DataSetPanelList');

goog.require('anychart.chartEditor2Module.Component');
goog.require('anychart.chartEditor2Module.DataSetPanel');
goog.require('anychart.chartEditor2Module.EditorModel');



/**
 * List of data set panels on SetupChart step.
 *
 * @param {anychart.chartEditor2Module.EditorModel} dataModel
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.Component}
 */
anychart.chartEditor2Module.DataSetPanelList = function(dataModel, opt_domHelper) {
  anychart.chartEditor2Module.DataSetPanelList.base(this, 'constructor', opt_domHelper);

  this.setModel(dataModel);

  this.panels_ = [];
};
goog.inherits(anychart.chartEditor2Module.DataSetPanelList, anychart.chartEditor2Module.Component);


/** @inheritDoc */
anychart.chartEditor2Module.DataSetPanelList.prototype.createDom = function() {
  anychart.chartEditor2Module.DataSetPanelList.base(this, 'createDom');

  var element = /** @type {Element} */(this.getElement());
  goog.dom.classlist.add(element, 'data-set-panel-list');
};


/** @inheritDoc */
anychart.chartEditor2Module.DataSetPanelList.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.update();
  this.getHandler().listen(/** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()), anychart.chartEditor2Module.events.EventType.EDITOR_MODEL_UPDATE, this.update);
};


/** @inheritDoc */
anychart.chartEditor2Module.DataSetPanelList.prototype.update = function() {
  this.removeChildren(true);
  goog.disposeAll(this.panels_);
  this.panels_.length = 0;

  var chartType = this.getModel().getValue([['chart'], 'type']);
  var active = this.getModel().getActive();
  var activeGeo = this.getModel().getActiveGeo();
  var data = this.getModel().getPreparedData();

  for(var i = 0; i < data.length; i++) {
    this.panels_.push(new anychart.chartEditor2Module.DataSetPanel(data[i]));
    this.addChild(this.panels_[i], true);
    this.panels_[i].setDisabled(this.panels_[i].getSetFullId() != active);
    this.panels_[i].setActiveGeo(chartType == 'map' && this.panels_[i].getSetFullId() == activeGeo);
  }
};