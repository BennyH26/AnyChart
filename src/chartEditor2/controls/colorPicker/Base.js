goog.provide('anychart.chartEditor2Module.colorPicker.Base');

goog.require('anychart.chartEditor2Module.colorPicker.Renderer');
goog.require('anychart.chartEditor2Module.events');

goog.require('goog.dom.classlist');
goog.require('goog.dom.selection');
goog.require('goog.events.KeyHandler');
goog.require('goog.ui.ColorMenuButton');
goog.require('goog.ui.LabelInput');



/**
 * A color menu button control.  Extends {@link goog.ui.MenuButton} by adding
 * an API for getting and setting the currently selected color from a menu of
 * color palettes.
 *
 * @param {goog.ui.ControlContent=} opt_content Text caption or existing DOM
 *     structure to display as the button's caption.
 * @param {goog.ui.Menu=} opt_menu Menu to render under the button when clicked;
 *     should contain at least one {@link goog.ui.ColorPalette} if present.
 * @param {goog.ui.MenuButtonRenderer=} opt_renderer Button renderer;
 *     defaults to {@link goog.ui.ColorMenuButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.ColorMenuButton}
 * @suppress {checkTypes} anychart.chartEditor2Module.colorPicker.Renderer
 */
anychart.chartEditor2Module.colorPicker.Base = function(opt_content, opt_menu, opt_renderer, opt_domHelper) {
  anychart.chartEditor2Module.colorPicker.Base.base(this, 'constructor',
      opt_content || '',
      opt_menu,
      opt_renderer || anychart.chartEditor2Module.colorPicker.Renderer.getInstance(),
      opt_domHelper);

  this.addClassName('anychart-chart-editor-color');
  this.setFocusablePopupMenu(true);
};
goog.inherits(anychart.chartEditor2Module.colorPicker.Base, goog.ui.ColorMenuButton);


/**
 * Opens or closes the menu.  Overrides {@link goog.ui.MenuButton#setOpen} by
 * generating a default color menu on the fly if needed.
 * @param {boolean} open Whether to open or close the menu.
 * @param {goog.events.Event=} opt_e Mousedown event that caused the menu to
 *     be opened.
 * @override
 * @suppress {visibility} this.keyHandler_
 */
anychart.chartEditor2Module.colorPicker.Base.prototype.setOpen = function(open, opt_e) {
  if (open && this.getItemCount() == 0) {
    var menu = goog.ui.ColorMenuButton.newColorMenu(null, this.getDomHelper());
    this.setMenu(menu);
    // For ESC key support for blur handler (close menu).
    menu.setAllowAutoFocus(false);
    menu.render();

    goog.dom.classlist.add(menu.getElement(), goog.getCssName('anychart-colormenu'));
    // Hack for set check icon (below to don't create inherited class from goog.ui.ColorPalette)
    var colorswatches = menu.getElementsByClass(goog.getCssName('anychart-palette-colorswatch'));
    for (var i = 0; i < colorswatches.length; i++) {
      goog.dom.classlist.addAll(colorswatches[i], ['ac', 'ac-check']);
    }

    var input = new goog.ui.LabelInput('Colorvalue');
    input.render(menu.getElement());
    goog.dom.classlist.add(input.getElement(), goog.getCssName('anychart-label-input'));
    this.colorInput_ = input;
    this.keyHandler_ = new goog.events.KeyHandler(input.getElement());
    this.getHandler().listen(this.keyHandler_,
        goog.events.KeyHandler.EventType.KEY, this.handleColorInputKeyEvent_);
    this.getHandler().listen(input.getElement(), goog.events.EventType.BLUR, this.onColorInputBlur_);

    this.setSelectedColor(/** @type {?string} */ (this.getValue()));
  }

  anychart.chartEditor2Module.colorPicker.Base.base(this, 'setOpen', open, opt_e);
};


/**
 * Handles keyboard events from the color input.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @private
 */
anychart.chartEditor2Module.colorPicker.Base.prototype.handleColorInputKeyEvent_ = function(e) {
  if (e.keyCode == goog.events.KeyCodes.ENTER) {
    var newRawValue = this.colorInput_.getValue();
    if (goog.color.isValidColor(newRawValue)) {
      var oldValue = this.getValue();
      var newValue = goog.color.parse(newRawValue).hex;
      if (oldValue != newValue) {
        var caretPosition = goog.dom.selection.getStart(this.colorInput_.getElement());
        this.setSelectedColor(newValue);
        this.onChange_(e);
        goog.dom.selection.setCursorPosition(this.colorInput_.getElement(), caretPosition);
      }
    }
  } else if (e.keyCode == goog.events.KeyCodes.ESC) {
    // Dismiss the menu.
    this.setOpen(false);
    this.getElement().focus();
  }
};


/**
 * Event handler for when the input box looses focus -- reset value.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
anychart.chartEditor2Module.colorPicker.Base.prototype.onColorInputBlur_ = function(e) {
  this.colorInput_.setValue(this.getSelectedColor());
};


/** @override */
anychart.chartEditor2Module.colorPicker.Base.prototype.setSelectedColor = function(color) {
  this.setValue(color);
  if (this.colorInput_) this.colorInput_.setValue(color);
};


/**
 * @type {string|Array.<string>}
 * @private
 */
anychart.chartEditor2Module.colorPicker.Base.prototype.key = '';


/** @param {string|Array.<string>} value */
anychart.chartEditor2Module.colorPicker.Base.prototype.setKey = function(value) {
  this.key = value;
};


/** @override */
anychart.chartEditor2Module.colorPicker.Base.prototype.enterDocument = function() {
  anychart.chartEditor2Module.colorPicker.Base.base(this, 'enterDocument');
  this.getHandler().listen(this, goog.ui.Component.EventType.ACTION, this.onChange_, false);
};


/** @override */
anychart.chartEditor2Module.colorPicker.Base.prototype.exitDocument = function() {
  this.getHandler().unlisten(this, goog.ui.Component.EventType.ACTION, this.onChange_, false);
  anychart.chartEditor2Module.colorPicker.Base.base(this, 'exitDocument');
};


/**
 * @param {goog.events.Event} evt
 * @private
 */
anychart.chartEditor2Module.colorPicker.Base.prototype.onChange_ = function(evt) {
  evt.stopPropagation();

  if (this.editorModel) {
    var value = this.getSelectedColor();

    if (this.callback)
      this.editorModel.callbackByString(this.callback, this);
    else
      this.editorModel.setValue(this.key, value, false, this.noRebuild);
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
anychart.chartEditor2Module.colorPicker.Base.prototype.init = function(model, key, opt_callback, opt_noRebuild) {
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
anychart.chartEditor2Module.colorPicker.Base.prototype.setValueByTarget = function(target) {
  this.target = target;

  var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(this.key);
  var value = /** @type {string} */(anychart.bindingModule.exec(this.target, stringKey));

  this.noDispatch = true;
  this.setSelectedColor(value);
  this.editorModel.setValue(this.key, value, true);
  this.noDispatch = false;
};
