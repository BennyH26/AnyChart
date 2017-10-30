goog.provide('anychart.chartEditor2Module.controls.select.ChartTypeMenuRenderer');
goog.provide('anychart.chartEditor2Module.select.ChartType');

goog.require('anychart.chartEditor2Module.controls.Menu');
goog.require('anychart.chartEditor2Module.controls.MenuRenderer');
goog.require('anychart.chartEditor2Module.controls.select.MenuItemWithIcon');
goog.require('anychart.chartEditor2Module.controls.select.SelectWithIcon');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuRenderer');



/**
 * Select for chart type.
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
 * @param {string=} opt_menuAdditionalClass
 * @constructor
 * @extends {anychart.chartEditor2Module.controls.select.SelectWithIcon}
 */
anychart.chartEditor2Module.select.ChartType = function(opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass) {
  anychart.chartEditor2Module.select.ChartType.base(this, 'constructor', opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer);

  /**
   * @type {Array}
   * @private
   */
  this.extendedOptions_ = [];

  /**
   * @type {goog.ui.MenuRenderer}
   * @private
   */
  this.cMenuRenderer_ = opt_menuRenderer || anychart.chartEditor2Module.controls.select.ChartTypeMenuRenderer.getInstance();

  /**
   * @type {(goog.ui.Menu|undefined)}
   * @private
   */
  this.cMenu_ = opt_menu;

  /**
   * @type {string}
   */
  this.menuAdditionalClass = opt_menuAdditionalClass || '';
};
goog.inherits(anychart.chartEditor2Module.select.ChartType, anychart.chartEditor2Module.controls.select.SelectWithIcon);


/** @inheritDoc */
anychart.chartEditor2Module.select.ChartType.prototype.createDom = function() {
  anychart.chartEditor2Module.select.ChartType.base(this, 'createDom');

  for (var i = 0; i < this.extendedOptions_.length; i++) {
    var item = new anychart.chartEditor2Module.controls.select.MenuItemWithIcon({
      caption: this.extendedOptions_[i]['name'],
      value: this.extendedOptions_[i]['value'],
      stackMode: this.extendedOptions_[i]['stackMode'],
      icon: 'http://www.anychart.com/_design/img/upload/charts/types/' + this.extendedOptions_[i]['icon']
    });
    this.addItem(item);
  }

  this.addClassName('anychart-select-chart-type');
};


/**
 * Init select by array of options as Objects as they stored in anychart.chartEditor2Module.EditorModel.ChartTypes.
 * @param {Array.<Object>} options
 */
anychart.chartEditor2Module.select.ChartType.prototype.initOptions = function(options) {
  this.extendedOptions_ = options;
};


/** @inheritDoc */
anychart.chartEditor2Module.select.ChartType.prototype.getMenu = function() {
  if (!this.cMenu_) {
    this.cMenu_ = new anychart.chartEditor2Module.controls.Menu(
        this.menuAdditionalClass,
        this.getDomHelper(),
        this.cMenuRenderer_
    );
    this.setMenu(this.cMenu_);
  }
  return this.cMenu_ || null;
};


// region ---- ChartTypeMenuRenderer
/**
 * @constructor
 * @extends {anychart.chartEditor2Module.controls.MenuRenderer}
 */
anychart.chartEditor2Module.controls.select.ChartTypeMenuRenderer = function() {
  anychart.chartEditor2Module.controls.select.ChartTypeMenuRenderer.base(this, 'constructor');
};
goog.inherits(anychart.chartEditor2Module.controls.select.ChartTypeMenuRenderer, anychart.chartEditor2Module.controls.MenuRenderer);
goog.addSingletonGetter(anychart.chartEditor2Module.controls.select.ChartTypeMenuRenderer);


/** @inheritDoc */
anychart.chartEditor2Module.controls.select.ChartTypeMenuRenderer.prototype.getCssClass = function() {
  return 'anychart-select-chart-type-menu';
};
// endregion
