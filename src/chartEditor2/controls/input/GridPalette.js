goog.provide('anychart.chartEditor2Module.input.GridPalette');


goog.require('anychart.chartEditor2Module.input.Base');


/**
 * This creates the label input object.
 * @param {string=} opt_label The text to show as the label.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {anychart.chartEditor2Module.input.Base}
 */
anychart.chartEditor2Module.input.GridPalette = function(opt_label, opt_domHelper) {
  anychart.chartEditor2Module.input.GridPalette.base(this, 'constructor', opt_label, opt_domHelper);
};
goog.inherits(anychart.chartEditor2Module.input.GridPalette, anychart.chartEditor2Module.input.Base);



/** @inheritDoc */
anychart.chartEditor2Module.input.GridPalette.prototype.onChange = function() {
  var value = this.getValue();

  if (!this.noDispatch && value != this.lastValue && this.editorModel) {
    this.lastValue = value;
    value = value.split(',');

    var caretPosition = goog.dom.selection.getStart(this.getElement());
    if (this.callback)
      this.editorModel.callbackByString(this.callback, this);
    else
      this.editorModel.setValue(this.key, value, false, this.noRebuild, this.noRebuildMapping);
    goog.dom.selection.setCursorPosition(this.getElement(), caretPosition);
  }
  this.revisionCount1++;
};


/**
 * Sets value of this control to target's value.
 * Updates model state.
 * @param {?Object} target Object, who's property corresponds to control's key. Used to get value of this control.
 * @param {boolean=} opt_force
 */
anychart.chartEditor2Module.input.GridPalette.prototype.setValueByTarget = function(target, opt_force) {
  if (!opt_force && this.revisionCount1 - this.revisionCount2 > 1) return;
  this.revisionCount2 = this.revisionCount1;
  this.target = target;
  var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(this.key);
  var value = /** @type {string} */(anychart.bindingModule.exec(this.target, stringKey));

  if (goog.isObject(value) && goog.isFunction(value.items)) {
    var tmp = value.items();
    tmp = goog.array.filter(tmp, function(i){return goog.isString(i);});
    value = tmp.join();
  } else if (!goog.isDef(value))
    value = '';

  this.lastValue = value;

  this.noDispatch = true;
  this.setValue(value);
  this.noDispatch = false;
};
