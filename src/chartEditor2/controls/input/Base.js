goog.provide('anychart.chartEditor2Module.input.Base');

goog.require('anychart.chartEditor2Module.events');

goog.require('goog.Timer');
goog.require('goog.events.KeyHandler');
goog.require('goog.ui.LabelInput');



/**
 * This creates the label input object.
 * @param {string=} opt_label The text to show as the label.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.LabelInput}
 */
anychart.chartEditor2Module.input.Base = function(opt_label, opt_domHelper) {
  anychart.chartEditor2Module.input.Base.base(this, 'constructor', opt_label, opt_domHelper);

  /**
   * @type {string}
   * @private
   */
  this.lastValue_ = '';

  /**
   * @type {boolean}
   * @private
   */
  this.suspendDispatch_ = false;

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

  this.revisionCount1 = 0;

  this.revisionCount2 = 0;
};
goog.inherits(anychart.chartEditor2Module.input.Base, goog.ui.LabelInput);


/**
 * The CSS class name to add to the input when the user has not entered a
 * value.
 */
anychart.chartEditor2Module.input.Base.prototype.labelCssClassName =
    goog.getCssName('anychart-label-input-label');


/**
 * @type {string|Array.<string>}
 * @private
 */
anychart.chartEditor2Module.input.Base.prototype.key = '';


/**
 * @type {goog.events.KeyHandler}
 * @private
 */
anychart.chartEditor2Module.input.Base.prototype.keyHandler_ = null;


/**
 * @param {anychart.chartEditor2Module.EditorModel.Key} key
 */
anychart.chartEditor2Module.input.Base.prototype.setKey = function(key) {
  this.key = key;
};


/**
 * @return {anychart.chartEditor2Module.EditorModel.Key}
 */
anychart.chartEditor2Module.input.Base.prototype.getKey = function() {
  debugger;
  return this.key;
};


/**
 * Creates the DOM nodes needed for the label input.
 * @override
 */
anychart.chartEditor2Module.input.Base.prototype.createDom = function() {
  this.setElementInternal(this.getDomHelper().createDom(
      goog.dom.TagName.INPUT, {
        'type': goog.dom.InputType.TEXT,
        'className': goog.getCssName('anychart-label-input')
      }));
};


/** @inheritDoc */
anychart.chartEditor2Module.input.Base.prototype.disposeInternal = function() {
  if (this.inputHandler_) {
    goog.events.removeAll(this.inputHandler_);
    this.inputHandler_.dispose();
    this.inputHandler_ = null;
  }
  anychart.chartEditor2Module.input.Base.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.chartEditor2Module.input.Base.prototype.enterDocument = function() {
  anychart.chartEditor2Module.input.Base.base(this, 'enterDocument');

  this.inputHandler_ = new goog.events.InputHandler(this.getElement());
  goog.events.listen(
      this.inputHandler_, goog.events.InputHandler.EventType.INPUT,
      this.onChange, false, this);
};


/** @private */
anychart.chartEditor2Module.input.Base.prototype.onChange = function() {
  var value = this.getValue();
  if (value != this.lastValue_ && this.editorModel) {
    if (this.callback)
      this.editorModel.callbackByString(this.callback, this);
    else
      this.editorModel.setValue(this.key, value, false, this.noRebuild);

    this.lastValue_ = value;
    this.revisionCount1++;
  }
};


/**
 * Connects control with EditorMode.
 *
 * @param {anychart.chartEditor2Module.EditorModel} model Editor model instance to connect with.
 * @param {anychart.chartEditor2Module.EditorModel.Key} key Key of control's field in model's structure.
 * @param {string=} opt_callback Callback function that will be called on control's value change instead of simple change value in model.
 *  This function should be model's public method.
 * @param {boolean=} opt_noRebuild Should or not rebuild chart on change value of this control.
 */
anychart.chartEditor2Module.input.Base.prototype.init = function(model, key, opt_callback, opt_noRebuild) {
  /**
   * @type {anychart.chartEditor2Module.EditorModel}
   * @protected
   */
  this.editorModel = model;

  /**
   * @type {anychart.chartEditor2Module.EditorModel.Key}
   * @protected
   */
  this.key = key;

  this.callback = opt_callback;

  this.noRebuild = !!opt_noRebuild;
};


/**
 * Sets value of this control to target's value.
 * Updates model state.
 * @param {?Object} target Object, who's property corresponds to control's key. Used to get value of this control.
 */
anychart.chartEditor2Module.input.Base.prototype.setValueByTarget = function(target) {
  if (this.revisionCount1 - this.revisionCount2 > 1) return;
  this.revisionCount2 = this.revisionCount1;

  this.target = target;

  var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(this.key);
  var value = /** @type {string} */(anychart.bindingModule.exec(this.target, stringKey));
  this.lastValue_ = value;

  this.noDispatch = true;
  this.setValue(value);
  this.editorModel.setValue(this.key, value, true);
  this.noDispatch = false;
};
