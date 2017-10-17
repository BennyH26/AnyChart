goog.provide('anychart.chartEditor2Module.controls.select.Base');

goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem');
goog.require('anychart.chartEditor2Module.events');
goog.require('goog.ui.Option');
goog.require('goog.ui.Select');



/**
 *
 * @param {goog.ui.ControlContent=} opt_caption Default caption or existing DOM
 *     structure to display as the button's caption when nothing is selected.
 *     Defaults to no caption.
 * @param {goog.ui.Menu=} opt_menu Menu containing selection options.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Renderer used to render or
 *     decorate the control; defaults to {@link goog.ui.MenuButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer Renderer used to render or
 *     decorate the menu; defaults to {@link goog.ui.MenuRenderer}.
 * @constructor
 * @extends {goog.ui.Select}
 */
anychart.chartEditor2Module.controls.select.Base = function(opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer) {
  anychart.chartEditor2Module.controls.select.Base.base(this, 'constructor', opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer);

  /**
   * Editor Model key.
   *
   * @type {anychart.chartEditor2Module.EditorModel.Key}
   * @protected
   */
  this.key = [];

  /**
   * @type {boolean}
   * @protected
   */
  this.noDispatch = false;

  /**
   * @type {boolean}
   * @protected
   */
  this.noRebuild = false;

  /**
   * Target object (usually it's chart)
   * @type {?Object}
   * @protected
   */
  this.target = null;
};
goog.inherits(anychart.chartEditor2Module.controls.select.Base, goog.ui.Select);


/**
 * @type {Array.<string>}
 * @private
 */
anychart.chartEditor2Module.controls.select.Base.prototype.options_;


/**
 * @type {Array.<string>}
 * @private
 */
anychart.chartEditor2Module.controls.select.Base.prototype.captions_;


/**
 * @type {Array.<string>}
 * @private
 */
anychart.chartEditor2Module.controls.select.Base.prototype.icons_;


/**
 * Set model for options.
 * @param {Array.<Object|string>} options
 */
anychart.chartEditor2Module.controls.select.Base.prototype.setOptions = function(options) {
  for (var a = this.getItemCount(); a--;) {
    this.removeItemAt(a);
  }

  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    if (goog.isString(option))
      option = {value: option, caption: option};

    if (!goog.isDef(option.caption))
      option.caption = option.value;

    this.addItem(new anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem(option));
  }
};


/** @param {anychart.chartEditor2Module.EditorModel.Key} value */
anychart.chartEditor2Module.controls.select.Base.prototype.setKey = function(value) {
  this.key = value;
};


/**
 * Gets key.
 * @return {anychart.chartEditor2Module.EditorModel.Key}
 */
anychart.chartEditor2Module.controls.select.Base.prototype.getKey = function() {
  return this.key;
};


/**
 * @param {string} option
 * @param {string} caption
 * @param {string} icon
 * @return {Array|string}
 */
anychart.chartEditor2Module.controls.select.Base.prototype.createContentElements = function(option, caption, icon) {
  if (!goog.isDefAndNotNull(option)) return this.getCaption();
  caption = goog.isDef(caption) ? caption : option.toString();
  var content = [];
  if (caption) content.push(caption);
  if (icon) content.push(goog.dom.createDom(goog.dom.TagName.I, [goog.getCssName('anychart-chart-editor-icon'), icon]));
  return content;
};


/** @override */
anychart.chartEditor2Module.controls.select.Base.prototype.enterDocument = function() {
  anychart.chartEditor2Module.controls.select.Base.base(this, 'enterDocument');
  goog.style.setElementShown(this.getElement(), !this.excluded);
};


/** @inheritDoc */
anychart.chartEditor2Module.controls.select.Base.prototype.handleSelectionChange = function (evt) {
  evt.preventDefault();
  evt.stopPropagation();
  if (this.excluded) return;

  if (!this.noDispatch && this.editorModel && goog.isDefAndNotNull(this.getValue())) {
    var selectedIndex = this.getSelectedIndex();
    if (this.prevSelectedIndex_ == selectedIndex) return;
    this.prevSelectedIndex_ = selectedIndex;

    if (this.callback)
      this.editorModel.callbackByString(this.callback, this);
    else {
      var value = this.getValue();
      value = goog.isObject(value) && value.value ? value.value : value;
      this.editorModel.setValue(this.key, value, false, this.noRebuild);
    }
  }
};


/**
 * Connects control with EditorMode.
 *
 * @param {anychart.chartEditor2Module.EditorModel} model Editor model instance to connect with.
 * @param {anychart.chartEditor2Module.EditorModel.Key} key Key of control's field in model's structure.
 * @param {string=} opt_callback Callback function that will be called on control's value change instead of simple change value in model.
 *  This function should be model's public method.
 * @param {boolean=} opt_noRebuild Should or not rebuild target (chart) on change value of this control.
 * @public
 */
anychart.chartEditor2Module.controls.select.Base.prototype.init = function(model, key, opt_callback, opt_noRebuild) {
  /**
   * @type {anychart.chartEditor2Module.EditorModel}
   * @protected
   */
  this.editorModel = model;

  this.key = key;

  this.callback = opt_callback;

  this.noRebuild = !!opt_noRebuild;

  this.updateExclusion();
};


/**
 * @param {*} value
 * @param {Object=} opt_additionalValues
 */
anychart.chartEditor2Module.controls.select.Base.prototype.setValue = function(value, opt_additionalValues) {
  var selectionModel = this.getSelectionModel();
  if (goog.isDefAndNotNull(value) && selectionModel) {
    for (var i = 0, item; item = selectionModel.getItemAt(i); i++) {
      if (item && typeof item.getValue == 'function') {
        var itemModel = item.getValue();
        if (itemModel == value || itemModel.value == value) {
          var additionalMatch = true;
          if (goog.isObject(opt_additionalValues)) {
            for (var j in opt_additionalValues) {
              if (opt_additionalValues[j] != itemModel[j]) {
                additionalMatch = false;
                break;
              }
            }
          }
          if (additionalMatch) {
            this.setSelectedItem(/** @type {!goog.ui.MenuItem} */ (item));
            this.prevSelectedIndex_ = this.getSelectedIndex();
            this.updateCaption();
            return;
          }
        }
      }
    }
  }

  this.setSelectedItem(null);
  this.prevSelectedIndex_ = -1;
  this.updateCaption();
};


/**
 * Sets value of this control to model's value.
 *
 * @param {Object=} opt_additionalValues Object of additional values.
 */
anychart.chartEditor2Module.controls.select.Base.prototype.setValueByModel = function(opt_additionalValues) {
  var modelValue;
  this.noDispatch = true;

  if (this.editorModel && this.key)
    modelValue = this.editorModel.getValue(this.key);

  if (goog.isDef(modelValue))
    this.setValue(modelValue, opt_additionalValues);

  if (!this.getSelectedItem()) {
    console.warn("No model value by key:", this.key);
  }

  this.noDispatch = false;
};


/**
 * Sets value of this control to target's value.
 * Updates model state.
 * @param {?Object} target Object, who's property corresponds to control's key. Used to get value of this control.
 */
anychart.chartEditor2Module.controls.select.Base.prototype.setValueByTarget = function(target) {
  if (this.excluded) return;

  if (!this.key || !this.key.length) {
    console.warn("Control with no key!");
    return;
  }
  this.target = target;

  var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(this.key);
  var value = /** @type {string} */(anychart.bindingModule.exec(this.target, stringKey));

  this.noDispatch = true;
  this.setValue(value);
  this.noDispatch = false;
};


/**
 * @param {boolean} value
 */
anychart.chartEditor2Module.controls.select.Base.prototype.suspendDispatch = function(value) {
  this.noDispatch = value;
};


/**
 * Hide or show control by assigning 'hidden' class
 * @param {boolean} value True if excluded.
 * @return {boolean}
 */
anychart.chartEditor2Module.controls.select.Base.prototype.exclude = function(value) {
  this.excluded = value;
  if (this.isInDocument())
    goog.style.setElementShown(this.getElement(), !this.excluded);

  if (this.excluded && this.editorModel)
    this.editorModel.removeByKey(this.key, true);

  return this.excluded;
};


/**
 * @return {boolean}
 */
anychart.chartEditor2Module.controls.select.Base.prototype.isExcluded = function() {
  return this.excluded;
};


/** @return {boolean|undefined} */
anychart.chartEditor2Module.controls.select.Base.prototype.updateExclusion = function() {
  if (!this.key || !this.key.length) return;

  var stringKey = this.editorModel.getStringKey(this.key);
  return this.exclude(this.editorModel.checkSettingForExclusion(stringKey));
};