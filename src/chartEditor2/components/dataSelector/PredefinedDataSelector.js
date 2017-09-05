goog.provide('anychart.chartEditor2Module.PredefinedDataSelector');

goog.require('anychart.chartEditor2Module.DataSelectorBase');



/**
 * Predefined data sets selector widget.
 *
 * @param {anychart.chartEditor2Module.EditorModel} dataModel
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.DataSelectorBase}
 */
anychart.chartEditor2Module.PredefinedDataSelector = function(dataModel, opt_domHelper) {
  anychart.chartEditor2Module.PredefinedDataSelector.base(this, 'constructor', dataModel, opt_domHelper);

  this.jsonUrl = 'https://cdn.anychart.com/anydata/common/';

  this.title = 'Use one of our data sets';

  this.className = 'predefined-data-selector';

  this.dataType = anychart.chartEditor2Module.EditorModel.dataType.PREDEFINED;
};
goog.inherits(anychart.chartEditor2Module.PredefinedDataSelector, anychart.chartEditor2Module.DataSelectorBase);


/** @inheritDoc */
anychart.chartEditor2Module.PredefinedDataSelector.prototype.createItem = function(itemJson, state) {
  var imgUrl = itemJson['logo'].replace('./', 'https://cdn.anychart.com/anydata/common/');
  var dom = this.getDomHelper();

  var downloadButton = dom.createDom(goog.dom.TagName.A, {'class': 'anychart-button anychart-button-success download'}, 'Download');
  downloadButton.setAttribute('data-set-id', itemJson['id']);

  var removeButton = dom.createDom(goog.dom.TagName.A, {'class': 'anychart-button anychart-button-danger remove'}, 'Remove');
  removeButton.setAttribute('data-set-id', itemJson['id']);

  return dom.createDom(
      goog.dom.TagName.DIV, 'data-set data-set-' + itemJson['id'],
      dom.createDom(goog.dom.TagName.DIV, 'content',
          dom.createDom(goog.dom.TagName.IMG, {'src': imgUrl}),
          dom.createDom(goog.dom.TagName.DIV, 'title', itemJson['name']),
          // dom.createTextNode(itemJson['description']),
          dom.createDom(goog.dom.TagName.DIV, 'buttons',
              downloadButton,
              removeButton,
              dom.createDom(goog.dom.TagName.A,
                  {
                    'href': itemJson['sample'],
                    'class': 'anychart-button anychart-button-primary sample',
                    'target': 'blank_'
                  },
                  'View sample'))));
};


/** @inheritDoc */
anychart.chartEditor2Module.PredefinedDataSelector.prototype.getDataSetUrl = function(fileName) {
  return fileName.replace('./', this.jsonUrl);
};


/** @inheritDoc */
anychart.chartEditor2Module.PredefinedDataSelector.prototype.onLoadData = function(json, setId, opt_name) {
  if (json['data']) {
    this.dispatchEvent({
      type: anychart.chartEditor2Module.events.EventType.DATA_ADD,
      data: json['data'],
      dataType: this.dataType,
      setId: setId,
      setFullId: this.dataType + setId,
      title: opt_name
    });
  }
};
