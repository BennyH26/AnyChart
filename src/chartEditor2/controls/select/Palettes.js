goog.provide('anychart.chartEditor2Module.select.Palettes');

goog.require('anychart.chartEditor2.controls.select.DataField');



/**
 * Select input for palettes property.
 *
 * @param {anychart.chartEditor2.controls.select.DataFieldModel=} opt_model
 * @param {goog.ui.Menu=} opt_menu
 * @param {goog.ui.ButtonRenderer=} opt_renderer
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer
 * @param {string=} opt_menuAdditionalClass
 *
 * @constructor
 * @extends {anychart.chartEditor2.controls.select.DataField}
 */
anychart.chartEditor2Module.select.Palettes = function(opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass) {
  anychart.chartEditor2Module.select.Palettes.base(this, 'constructor',opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass);
};
goog.inherits(anychart.chartEditor2Module.select.Palettes, anychart.chartEditor2.controls.select.DataField);


/** @inheritDoc */
anychart.chartEditor2Module.select.Palettes.prototype.handleSelectionChange = function(evt) {
  if (this.excluded) return;

  if (!this.noDispatch && this.editorModel)
    this.editorModel.dropChartSettings(/getSeries\('\w+'\)\.color\(\)/);

  anychart.chartEditor2Module.select.Palettes.base(this, 'handleSelectionChange', evt);
};


/** @inheritDoc */
anychart.chartEditor2Module.select.Palettes.prototype.setValueByTarget = function(target) {
  if (this.excluded) return;

  var select = this.getSelect();
  this.target = target;
  var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(select.getKey());
  var value = anychart.bindingModule.exec(this.target, stringKey);

  if (value) {
    var realPalettes = goog.dom.getWindow()['anychart']['palettes'];
    var stringValue = '';
    for (var paletteName in realPalettes) {
      if (realPalettes.hasOwnProperty(paletteName) &&
          goog.isArray(realPalettes[paletteName]) &&
          goog.array.equals(value['items'](), realPalettes[paletteName])) {
        stringValue = paletteName;
        break;
      }
    }

    select.suspendDispatch(true);
    select.setValue(stringValue);
    select.suspendDispatch(false);
  }
};
