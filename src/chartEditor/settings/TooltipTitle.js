goog.provide('anychart.chartEditorModule.settings.TooltipTitle');

goog.require('anychart.chartEditorModule.button.Bold');
goog.require('anychart.chartEditorModule.button.Italic');
goog.require('anychart.chartEditorModule.button.Underline');
goog.require('anychart.chartEditorModule.checkbox.Base');
goog.require('anychart.chartEditorModule.colorPicker.Base');
goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('anychart.chartEditorModule.controls.select.Align');
goog.require('anychart.chartEditorModule.controls.select.DataFieldSelect');
goog.require('anychart.chartEditorModule.controls.select.FontFamily');
goog.require('anychart.chartEditorModule.input.Base');
goog.require('anychart.chartEditorModule.settings.Title');
goog.require('goog.ui.ButtonSide');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {?string=} opt_name
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.settings.Title}
 */
anychart.chartEditorModule.settings.TooltipTitle = function(model, opt_name, opt_domHelper) {
  anychart.chartEditorModule.settings.TooltipTitle.base(this, 'constructor', model, opt_name, opt_domHelper);

  this.allowEnabled(true);
  this.allowEditPosition(false);
  this.allowEditAlign(false);

  /**
   * @type {anychart.chartEditorModule.EditorModel.Key}
   * @private
   */
  this.titleFormatKey_ = [];
};
goog.inherits(anychart.chartEditorModule.settings.TooltipTitle, anychart.chartEditorModule.settings.Title);


/**
 * @param {anychart.chartEditorModule.EditorModel.Key} value
 */
anychart.chartEditorModule.settings.TooltipTitle.prototype.setTitleFormatKey = function(value) {
  this.titleFormatKey_ = value;
};


/** @inheritDoc */
anychart.chartEditorModule.settings.TooltipTitle.prototype.updateKeys = function() {
  anychart.chartEditorModule.settings.TooltipTitle.base(this, 'updateKeys');
  if (this.isExcluded()) return;

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  if (this.textInput_) this.textInput_.init(model, this.titleFormatKey_);
};
