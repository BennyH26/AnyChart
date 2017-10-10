goog.provide('anychart.chartEditor2Module.input.Palette');


goog.require('anychart.chartEditor2Module.input.Base');


/**
 * This creates the label input object.
 * @param {string=} opt_label The text to show as the label.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {anychart.chartEditor2Module.input.Base}
 */
anychart.chartEditor2Module.input.Palette = function(opt_label, opt_domHelper) {
  anychart.chartEditor2Module.input.Palette.base(this, 'constructor', opt_label, opt_domHelper);
};
goog.inherits(anychart.chartEditor2Module.input.Palette, anychart.chartEditor2Module.input.Base);


/** @inheritDoc */
anychart.chartEditor2Module.input.Palette.prototype.enterDocument = function() {
  anychart.chartEditor2Module.input.Palette.base(this, 'enterDocument');
  goog.events.unlisten(this.inputHandler_, goog.events.InputHandler.EventType.INPUT, this.onChange, false, this);
  goog.events.listen(this.getElement(), goog.events.EventType.BLUR, this.onChange, false, this);
};


/** @inheritDoc */
anychart.chartEditor2Module.input.Palette.prototype.onChange = function() {
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
anychart.chartEditor2Module.input.Palette.prototype.setValueByTarget = function(target, opt_force) {
  if (!opt_force && this.revisionCount1 - this.revisionCount2 > 1) return;
  this.revisionCount2 = this.revisionCount1;
  this.target = target;
  var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(this.key);
  var value = /** @type {*} */(anychart.bindingModule.exec(this.target, stringKey));
  value = this.valueToString(value);

  this.noDispatch = true;
  this.setValue(value);
  this.noDispatch = false;

  this.lastValue = value;
};


/**
 * @param {?*} colors
 */
anychart.chartEditor2Module.input.Palette.prototype.setValueByColors = function(colors) {
  this.noDispatch = true;
  var value = this.valueToString(colors);
  this.setValue(value);
  this.noDispatch = false;
};


/**
 * @param {*=} opt_value
 * @return {string}
 */
anychart.chartEditor2Module.input.Palette.prototype.valueToString = function(opt_value) {
  if (!goog.isDef(opt_value))
    return '';

  if (goog.isString(opt_value))
    return /** @type {string} */(opt_value);

  var tmp;
  if (goog.isObject(opt_value) && goog.isFunction(opt_value.items)) {
    tmp = opt_value.items();
    tmp = goog.array.filter(tmp, function(i) {
      return goog.isString(i);
    });
    opt_value = tmp.join();

  } else if (goog.isArray(opt_value)) {
    tmp = goog.array.map(opt_value, function(item) {
      var color;
      if (goog.isString(item))
        color = item;
      else if (item.color) {
        if (goog.isString(item.color))
          color = item.color;
        else if (goog.isArray(item.color))
          color = anychart.chartEditor2Module.input.Palette.rgbToHex(item.color[0], item.color[1], item.color[2]);
      }
      return color;
    });
    opt_value = tmp.join();
  }

  return /** @type {string} */(opt_value);
};


/**
 * @param {number} c
 * @return {string}
 */
anychart.chartEditor2Module.input.Palette.componentToHex = function(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
};


/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @return {string}
 */
anychart.chartEditor2Module.input.Palette.rgbToHex = function(r, g, b) {
  return "#" + anychart.chartEditor2Module.input.Palette.componentToHex(r) +
      anychart.chartEditor2Module.input.Palette.componentToHex(g) +
      anychart.chartEditor2Module.input.Palette.componentToHex(b);
};