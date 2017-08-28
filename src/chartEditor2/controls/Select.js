goog.provide('anychart.chartEditor2Module.controls.Select');

goog.require('goog.ui.Select');


/**
 * Overrides control to work with EditorModel.
 * @constructor
 * @extends {goog.ui.Select}
 */
anychart.chartEditor2Module.controls.Select = function(opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer) {
  anychart.chartEditor2Module.controls.Select.base(this, 'constructor', opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer);
  this.suspendDispatch_ = false;
  this.noRebuild_ = false;
};
goog.inherits(anychart.chartEditor2Module.controls.Select, goog.ui.Select);


anychart.chartEditor2Module.controls.Select.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.listen(goog.ui.Component.EventType.CHANGE, this.onChange);
};


anychart.chartEditor2Module.controls.Select.prototype.onChange = function() {
  if (!this.suspendDispatch_ && this.editorModel_ && goog.isDefAndNotNull(this.getValue())) {
    if (this.callback_)
      this.editorModel_[this.callback_].call(this.editorModel_, this);
    else
      this.editorModel_.setValue(this.key_, this.getValue(), false, this.noRebuild_);
  }
};


/**
 *
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {anychart.chartEditor2Module.EditorModel.Key} key
 * @param {String=} opt_callback
 * @param {?Object=} opt_target
 * @param {Boolean=} opt_noRebuild
 */
anychart.chartEditor2Module.controls.Select.prototype.setEditorModel = function(model, key, opt_callback, opt_target, opt_noRebuild) {
  this.editorModel_ = model;
  this.key_ = key;
  this.callback_ = opt_callback;
  this.noRebuild_ = !!opt_noRebuild;

  if (opt_target) {
    var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(key);
    var value = anychart.bindingModule.exec(opt_target, stringKey);
    this.suspendDispatch_ = true;
    this.setValue(value);
    this.editorModel_.setValue(this.key_, value, true);
    this.suspendDispatch_ = false;
  }
};


anychart.chartEditor2Module.controls.Select.prototype.getKey = function() {
  return this.key_;
};


anychart.chartEditor2Module.controls.Select.prototype.setValueByModel = function(opt_value2) {
  var value;
  this.suspendDispatch_ = true;

  if (this.editorModel_ && this.key_)
    value = this.editorModel_.getValue(this.key_);

  if (goog.isDef(value))
    this.setValue(value, opt_value2);

  if (!this.getSelectedItem()) {
    console.warn("no model value by key:", this.key_);
  }

  this.suspendDispatch_ = false;
};


anychart.chartEditor2Module.controls.Select.prototype.setValue = function(value, opt_value2) {
  //if (goog.isDef(opt_value2) && ) {}
  if (goog.isDefAndNotNull(value) && this.selectionModel_) {
    for (var i = 0, item; item = this.selectionModel_.getItemAt(i); i++) {
      if (item &&
          typeof item.getValue == 'function' && item.getValue() == value &&
          (!goog.isDef(opt_value2) || typeof item.getValue2 == 'function' && item.getValue2() == opt_value2)
      ) {
        this.setSelectedItem(/** @type {!goog.ui.MenuItem} */ (item));
        return;
      }
    }
  }

  this.setSelectedItem(null);
};


anychart.chartEditor2Module.controls.Select.prototype.setOptions = function(options, opt_default) {
  var self = this;
  if (this.getItemCount() > 0) return;

  goog.array.forEach(options,
      function(option) {
        var item;
        var caption;
        var value;
        if (option) {
          if (goog.isArray(option)) {
            caption = option[0];
            value = option[1];
          } else
            caption = option;

          item = new goog.ui.MenuItem(caption, value);
          // item.setId(label);
        } else {
          item = new goog.ui.MenuSeparator();
        }
        self.addItem(item);
      });

  if (opt_default) {
    this.setValue(opt_default);
  }
};


anychart.chartEditor2Module.controls.Select.prototype.hide = function() {
  goog.dom.classlist.add(this.getElement(), 'hidden');
};


anychart.chartEditor2Module.controls.Select.prototype.show = function() {
  goog.dom.classlist.remove(this.getElement(), 'hidden');
};
