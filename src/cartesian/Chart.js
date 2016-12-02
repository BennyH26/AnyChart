goog.provide('anychart.cartesian.Chart');

goog.require('anychart.Chart');
goog.require('anychart.cartesian.OrdinalIterator');
goog.require('anychart.cartesian.ScatterIterator');
goog.require('anychart.cartesian.series');
goog.require('anychart.cartesian.series.BarBase');
goog.require('anychart.elements.Axis');
goog.require('anychart.elements.Grid');
goog.require('anychart.elements.LineMarker');
goog.require('anychart.elements.RangeMarker');
goog.require('anychart.elements.TextMarker');
goog.require('anychart.scales');
goog.require('anychart.utils.DistinctColorPalette');
goog.require('anychart.utils.MarkerPalette');
goog.require('anychart.utils.RangeColorPalette');



/**
 * Cartesian chart constructor.<br/>
 * Main entry point to create a cartesian chart, it has several aliases in series.<br/>
 * Each series is interactive, you can customize click and hover behavior and other params.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title()
 *    .text('Simple bar chart');
 * chart.bar([10, 20, 30]);
 * chart.yAxis()
 *    .orientation('bottom')
 *    .scale(chart.yScale())
 *    .title('none');
 * chart.container(stage).draw();
 * @extends {anychart.Chart}
 * @constructor
 */
anychart.cartesian.Chart = function() {
  goog.base(this);

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.xScale_ = null;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.yScale_ = null;

  /**
   * @type {!Array.<anychart.cartesian.series.Base>}
   * @private
   */
  this.series_ = [];

  /**
   * @type {!Array.<anychart.elements.Axis>}
   * @private
   */
  this.xAxes_ = [];

  /**
   * @type {!Array.<anychart.elements.Axis>}
   * @private
   */
  this.yAxes_ = [];

  /**
   * @type {Array.<anychart.elements.LineMarker>}
   * @private
   */
  this.lineAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.elements.RangeMarker>}
   * @private
   */
  this.rangeAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.elements.TextMarker>}
   * @private
   */
  this.textAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.elements.Grid>}
   * @private
   */
  this.grids_ = [];

  /**
   * @type {Array.<anychart.elements.Grid>}
   * @private
   */
  this.minorGrids_ = [];

  /**
   * Palette for series colors.
   * @type {anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette}
   * @private
   */
  this.palette_ = null;

  /**
   * @type {anychart.utils.MarkerPalette}
   * @private
   */
  this.markerPalette_ = null;

  /**
   * Cache of chart data bounds.
   * @type {acgraph.math.Rect}
   * @private
   */
  this.dataBounds_ = null;

  /**
   * @type {number}
   * @private
   */
  this.barGroupsPadding_ = 0.5;

  /**
   * @type {number}
   * @private
   */
  this.barsPadding_ = 0.1;

  // Add handler to listen legend item click for legend and enable/disable series.
  var legend = /** @type {anychart.elements.Legend} */ (this.legend());
  legend.listen(anychart.events.EventType.LEGEND_ITEM_CLICK, function(event) {
    // function that enables or disables series by index of clicked legend item

    var cartesianChart = /** @type {anychart.cartesian.Chart} */ (this);
    var index = event['index'];
    var series = cartesianChart.series_[index];
    if (series) {
      series.enabled(!series.enabled());
    }

  }, false, this);

};
goog.inherits(anychart.cartesian.Chart, anychart.Chart);


/**
 * @type {string}
 */
anychart.cartesian.Chart.CHART_TYPE = 'cartesian';
anychart.chartTypesMap[anychart.cartesian.Chart.CHART_TYPE] = anychart.cartesian.Chart;


/**
 * Максимальное число попыток рассчитать длины для осей чарта.
 * @type {number}
 * @private
 */
anychart.cartesian.Chart.MAX_ATTEMPTS_AXES_CALCULATION_ = 5;


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.Chart states.
 * @type {number}
 */
anychart.cartesian.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.PALETTE |
    anychart.ConsistencyState.MARKER_PALETTE |
    anychart.ConsistencyState.SCALES |
    anychart.ConsistencyState.SERIES |
    anychart.ConsistencyState.AXES |
    anychart.ConsistencyState.AXES_MARKERS |
    anychart.ConsistencyState.GRIDS;


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for default chart X scale.
 * @return {!anychart.scales.Base} Default chart scale value.
 *//**
 * Setter for default chart X scale.<br/>
 * <b>Note:</b> This scale will be passed to all scale dependent chart elements if they don't have their own scales.
 * @example
 * var dtScale = new anychart.scales.DateTime();
 * dtScale.minimum(Date.UTC(2000, 5));
 * dtScale.maximum(Date.UTC(2003, 5));
 * chart = new anychart.cartesian.Chart();
 * chart.title(null);
 * chart.bar([
 *   {x: Date.UTC(2001, 0), y: 20},
 *   {x: Date.UTC(2002, 0), y: 40},
 *   {x: Date.UTC(2003, 0), y: 30}
 * ]).width(25);
 * chart.xScale(dtScale);
 * chart.yAxis()
 *     .orientation('left')
 *     .scale(dtScale)
 *     .title(null)
 *     .labels().textFormatter(function(value) { return new Date(value).toDateString(); });
 * chart.yAxis()
 *     .orientation('bottom')
 *     .scale(chart.yScale())
 *     .title(null);
 * chart.container(stage).draw();
 * @param {anychart.scales.Base=} opt_value X Scale to set.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value X Scale to set.
 * @return {!(anychart.scales.Base|anychart.cartesian.Chart)} Default chart scale value or itself for method chaining.
 */
anychart.cartesian.Chart.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      this.xScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.xScale_) {
      this.xScale_ = new anychart.scales.Ordinal();
    }
    return this.xScale_;
  }
};


/**
 * Getter for default chart Y scale.
 * @return {!anychart.scales.Base} Default chart scale value.
 *//**
 * Setter for default chart Y scale.<br/>
 * <b>Note:</b> This scale will be passed to all scale dependent chart elements if they don't have their own scales.
 * @example
 * var valueScale = new anychart.scales.Logarithmic();
 * valueScale.ticks().mode('log');
 * chart = new anychart.cartesian.Chart();
 * chart.title(null);
 * chart.bar([0.001, 0.05, .0007]);
 * chart.yScale(valueScale);
 * chart.yAxis()
 *     .orientation('bottom')
 *     .scale(valueScale)
 *     .title(null)
 *     .drawFirstLabel(true);
 * chart.container(stage).draw();
 * @param {anychart.scales.Base=} opt_value Y Scale to set.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Y Scale to set.
 * @return {!(anychart.scales.Base|anychart.cartesian.Chart)} Default chart scale value or itself for method chaining.
 */
anychart.cartesian.Chart.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.yScale_) {
      this.yScale_ = new anychart.scales.Linear();
    }
    return this.yScale_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scale map properties.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @type {!Object.<!Array.<anychart.cartesian.series.Base>>}
 * @private
 */
anychart.cartesian.Chart.prototype.seriesOfStackedScaleMap_;


/**
 * @type {!Object.<anychart.scales.Base>}
 * @private
 */
anychart.cartesian.Chart.prototype.yScales_;


/**
 * @type {!Object.<anychart.scales.Base>}
 * @private
 */
anychart.cartesian.Chart.prototype.xScales_;


/**
 * @type {!Object.<!Array.<anychart.cartesian.series.Base>>}
 * @private
 */
anychart.cartesian.Chart.prototype.seriesOfXScaleMap_;


/**
 * @type {!Object.<!Array.<anychart.cartesian.series.Base>>}
 * @private
 */
anychart.cartesian.Chart.prototype.seriesOfYScaleMap_;


//----------------------------------------------------------------------------------------------------------------------
//
//  Grids.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for chart grid.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.grid()
 *     .direction(anychart.utils.Direction.HORIZONTAL);
 * chart.grid()
 *     .oddFill('none')
 *     .evenFill('none')
 *     .direction(anychart.utils.Direction.VERTICAL);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart grid index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.elements.Grid} Axis instance by index.
 *//**
 * Setter for chart grid.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.column([1, 4, 5, 7, 2]);
 * var myGrid = new anychart.elements.Grid()
 *    .direction(anychart.utils.Direction.HORIZONTAL);
 * chart.grid(myGrid);
 * chart.container(stage).draw();
 * @param {(anychart.elements.Grid|Object)=} opt_value Chart grid settings to set.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * Setter for chart grid by index.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.grid()
 *     .direction(anychart.utils.Direction.HORIZONTAL);
 * chart.grid()
 *     .oddFill('none')
 *     .evenFill('red')
 *     .direction(anychart.utils.Direction.VERTICAL);
 * chart.container(stage).draw();
 * chart.grid(1, null);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart grid index.
 * @param {(anychart.elements.Grid|Object|string|null)=} opt_value Chart grid settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none'</b> to disable the grid.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.elements.Grid|Object|string|null)=} opt_indexOrValue Grid settings.
 * @param {(anychart.elements.Grid|Object|string|null)=} opt_value Grid settings to set.
 * @return {!(anychart.elements.Grid|anychart.cartesian.Chart)} Grid instance by index or itself for method chaining.
 */
anychart.cartesian.Chart.prototype.grid = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = 0;
    value = opt_indexOrValue;
  }
  var grid = this.grids_[index];
  if (!grid) {
    grid = new anychart.elements.Grid();
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.Grid) {
      grid.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      grid.deserialize(value);
    } else if (anychart.utils.isNone(value)) {
      grid.enabled(false);
    }
    return this;
  } else {
    return grid;
  }
};


/**
 * Getter for chart minor grid.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.grid()
 *     .direction(anychart.utils.Direction.HORIZONTAL);
 * chart.grid()
 *     .oddFill('none')
 *     .evenFill('none')
 *     .direction(anychart.utils.Direction.VERTICAL);
 * chart.minorGrid()
 *    .oddFill('none')
 *    .evenFill('none')
 *    .direction(anychart.utils.Direction.HORIZONTAL);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart minor grid index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.elements.Grid} Axis instance by index.
 *//**
 * Setter for chart minor grid.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.column([1, 4, 5, 7, 2]);
 * var myGrid = new anychart.elements.Grid()
 *    .direction(anychart.utils.Direction.HORIZONTAL);
 * chart.grid(myGrid);
 * myGrid.oddFill('none')
 *    .evenFill('none')
 *    .direction(anychart.utils.Direction.HORIZONTAL).minor(true);
 * chart.minorGrid(myGrid)
 * chart.container(stage).draw();
 * @param {(anychart.elements.Grid|Object)=} opt_value Chart minor grid settings to set.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * Setter for chart minor grid by index.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.grid()
 *     .direction(anychart.utils.Direction.HORIZONTAL);
 * chart.grid()
 *     .oddFill('none')
 *     .evenFill('red')
 *     .direction(anychart.utils.Direction.VERTICAL);
 * chart.minorGrid()
 *    .oddFill('none')
 *    .evenFill('none')
 *    .direction(anychart.utils.Direction.HORIZONTAL);
 * chart.container(stage).draw();
 * chart.minorGrid(0, null);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart minor grid index.
 * @param {(anychart.elements.Grid|Object|string|null)=} opt_value Chart minor grid settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none'</b> to disable the grid.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.elements.Grid|Object|string|null)=} opt_indexOrValue Minor grid settings.
 * @param {(anychart.elements.Grid|Object|string|null)=} opt_value Minor grid settings to set.
 * @return {!(anychart.elements.Grid|anychart.cartesian.Chart)} Minor grid instance by index or itself for method chaining.
 */
anychart.cartesian.Chart.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = 0;
    value = opt_indexOrValue;
  }
  var grid = this.minorGrids_[index];
  if (!grid) {
    grid = new anychart.elements.Grid();
    grid.minor(true);
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.Grid) {
      grid.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      grid.deserialize(value);
    } else if (anychart.utils.isNone(value)) {
      grid.enabled(false);
    }
    return this;
  } else {
    return grid;
  }
};


/**
 * Listener for grids invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.cartesian.Chart.prototype.onGridSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for chart X-axis.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.xAxis()
 *    .orientation('bottom')
 *    .scale(chart.xScale())
 *    .title('X-Axis');
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart axis index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.elements.Axis} Axis instance by index.
 *//**
 * Setter for chart X-axis.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.bar([1, 4, 5, 7, 2]);
 * var myAxis = new anychart.elements.Axis()
 *    .orientation('right')
 *    .title().text('my Axis');
 * chart.xAxis(myAxis);
 * chart.container(stage).draw();
 * @param {(anychart.elements.Axis|Object)=} opt_value Chart axis settings to set.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * Setter for chart X-axis by index.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.xAxis()
 *    .orientation('left')
 *    .title(null);
 * chart.xAxis()
 *    .orientation('bottom')
 *    .title('X-Axis');
 * chart.xAxis()
 *    .orientation('right')
 *    .title(null);
 * chart.xAxis(1, null);
 * chart.xAxis(2, 'None');
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart axis index.
 * @param {(anychart.elements.Axis|Object|string|null)=} opt_value Chart axis settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none'</b> to disable the grid.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.elements.Axis|Object|string|null)=} opt_indexOrValue Chart axis settings to set.
 * @param {(anychart.elements.Axis|Object|string|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.elements.Axis|anychart.cartesian.Chart)} Axis instance by index or itself for method chaining.
 */
anychart.cartesian.Chart.prototype.xAxis = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = 0;
    value = opt_indexOrValue;
  }
  var axis = this.xAxes_[index];
  if (!axis) {
    axis = new anychart.elements.Axis();
    axis.orientation(anychart.utils.Orientation.BOTTOM);
    axis.title().text('X-Axis');
    this.xAxes_[index] = axis;
    this.restoreDefaultsForAxis(axis);
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.Axis) {
      axis.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      axis.deserialize(value);
    } else if (anychart.utils.isNone(value)) {
      axis.enabled(false);
    }
    return this;
  } else {
    return axis;
  }
};


/**
 * Getter for chart Y-axis.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.yAxis()
 *    .orientation('right')
 *    .title('Y-Axis');
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart axis index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.elements.Axis} Axis instance by index.
 *//**
 * Setter for chart Y-axis.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.bar([1, 4, 5, 7, 2]);
 * var myAxis = new anychart.elements.Axis()
 *    .orientation('left')
 *    .title().text('my Axis');
 * chart.yAxis(myAxis);
 * chart.container(stage).draw();
 * @param {(anychart.elements.Axis|Object)=} opt_value Chart axis settings to set.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} class for method chaining.
 *//**
 * Setter for chart Y-axis by index.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.yAxis()
 *    .orientation('left')
 *    .scale(chart.yScale().maximum(10))
 *    .title(null);
 * chart.yAxis()
 *    .orientation('right')
 *    .scale(chart.xScale())
 *    .title('Y-Axis');
 * chart.yAxis()
 *    .orientation('right')
 *    .scale(chart.yScale().maximum(20))
 *    .title(null);
 * chart.yAxis(2, 'None');
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart axis index.
 * @param {(anychart.elements.Axis|Object|string|null)=} opt_value Chart axis settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none'</b> to disable the grid.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.elements.Axis|Object|string|null)=} opt_indexOrValue Chart axis settings to set.
 * @param {(anychart.elements.Axis|Object|string|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.elements.Axis|anychart.cartesian.Chart)} Axis instance by index or itself for method chaining.
 */
anychart.cartesian.Chart.prototype.yAxis = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = 0;
    value = opt_indexOrValue;
  }
  var axis = this.yAxes_[index];
  if (!axis) {
    axis = new anychart.elements.Axis();
    axis.staggerMode(false);
    axis.orientation(anychart.utils.Orientation.LEFT);
    axis.title().text('Y-Axis');
    this.yAxes_[index] = axis;
    this.restoreDefaultsForAxis(axis);
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.Axis) {
      axis.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      axis.deserialize(value);
    } else if (anychart.utils.isNone(value)) {
      axis.enabled(false);
    }
    return this;
  } else {
    return axis;
  }
};


/**
 * Listener for axes invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.cartesian.Chart.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, state == 0 and nothing happens.
  this.invalidate(state, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes markers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for chart line marker.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Line Marker');
 * chart.column([1, 4, 5, 7, 2]);
 * chart.lineMarker()
 *     .value(4)
 *     .stroke('2 blue')
 *     .direction('horizontal');
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart line marker index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.elements.LineMarker} Line marker instance by index.
 *//**
 * Setter for chart line marker.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Line Marker');
 * chart.column([1, 4, 5, 7, 2]);
 * var lineMarker = new anychart.elements.LineMarker()
 *     .value(5.5)
 *     .stroke('2 blue')
 *     .direction('horizontal');
 * chart.lineMarker(lineMarker);
 * chart.container(stage).draw();
 * @param {(anychart.elements.LineMarker|Object)=} opt_value Chart line marker settings to set.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * Setter for chart line marker by index.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Line Marker');
 * chart.column([1, 4, 5, 7, 2]);
 * chart.lineMarker().value(5);
 * chart.lineMarker().value(2);
 * // turn off zero marker.
 * chart.lineMarker(0, null);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart line marker index.
 * @param {(anychart.elements.LineMarker|Object|string|null)=} opt_value Chart line marker settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none' to disable marker</b>.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.elements.LineMarker|Object|string|null)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(anychart.elements.LineMarker|Object|string|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.elements.LineMarker|anychart.cartesian.Chart)} Line marker instance by index or itself for method chaining.
 */
anychart.cartesian.Chart.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = 0;
    value = opt_indexOrValue;
  }
  var lineMarker = this.lineAxesMarkers_[index];
  if (!lineMarker) {
    lineMarker = new anychart.elements.LineMarker();
    this.lineAxesMarkers_[index] = lineMarker;
    this.registerDisposable(lineMarker);
    lineMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.LineMarker) {
      lineMarker.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      lineMarker.deserialize(value);
    } else if (anychart.utils.isNone(value)) {
      lineMarker.enabled(false);
    }
    return this;
  } else {
    return lineMarker;
  }
};


/**
 * Getter for chart range marker.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Range Marker');
 * chart.column([1, 4, 5, 7, 2]);
 * chart.rangeMarker().from(2.2).to(5.5);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart range marker index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.elements.RangeMarker} Range marker instance by index.
 *//**
 * Setter for chart range marker.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Range Marker');
 * chart.column([1, 4, 5, 7, 2]);
 * var rangeMarker = new anychart.elements.RangeMarker()
 *     .from(2.5)
 *     .to(5.5)
 *     .fill('blue .1');
 * chart.rangeMarker(rangeMarker);
 * chart.container(stage).draw();
 * @param {(anychart.elements.RangeMarker|Object)=} opt_value Chart range marker settings to set.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * Setter for chart range marker by index.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('RangeMarker');
 * chart.column([1, 4, 5, 7, 2]);
 * chart.rangeMarker().from(5).to(10);
 * chart.rangeMarker().from(1).to(2);
 * // turn off zero marker.
 * chart.rangeMarker(0, null);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart range marker index.
 * @param {(anychart.elements.RangeMarker|Object|string|null)=} opt_value Chart range marker settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none' to disable to disable marker.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.elements.RangeMarker|Object|string|null)=} opt_indexOrValue Chart range marker settings to set.
 * @param {(anychart.elements.RangeMarker|Object|string|null)=} opt_value Chart range marker settings to set.
 * @return {!(anychart.elements.RangeMarker|anychart.cartesian.Chart)} Range marker instance by index or itself for chaining call.
 */
anychart.cartesian.Chart.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = 0;
    value = opt_indexOrValue;
  }
  var rangeMarker = this.rangeAxesMarkers_[index];
  if (!rangeMarker) {
    rangeMarker = new anychart.elements.RangeMarker();
    this.rangeAxesMarkers_[index] = rangeMarker;
    this.registerDisposable(rangeMarker);
    rangeMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.RangeMarker) {
      rangeMarker.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      rangeMarker.deserialize(value);
    } else if (anychart.utils.isNone(value)) {
      rangeMarker.enabled(false);
    }
    return this;
  } else {
    return rangeMarker;
  }
};


/**
 * Getter for chart text marker.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('TextMarker and LineMarker');
 * chart.column([1, 4, 5, 7, 2]);
 * chart.lineMarker().value(3.3);
 * chart.textMarker()
 *     .text('Marker')
 *     .value(3.3)
 *     .align(anychart.elements.TextMarker.Align.FAR)
 *     .anchor(anychart.utils.NinePositions.RIGHT_BOTTOM);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart text marker index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.elements.TextMarker} Text marker instance by index.
 *//**
 * Setter for chart text marker.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Text Marker');
 * chart.column([1, 4, 5, 7, 2]);
 * var txtMarker = new anychart.elements.TextMarker()
 *     .text('Marker')
 *     .value(3.3)
 *     .align(anychart.elements.TextMarker.Align.NEAR)
 *     .anchor(anychart.utils.NinePositions.LEFT_BOTTOM);
 * chart.textMarker(txtMarker);
 * chart.lineMarker().value(3.3);
 * chart.container(stage).draw();
 * @param {(anychart.elements.TextMarker|Object)=} opt_value Chart text marker settings to set.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * Setter for chart text marker by index.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Text Marker');
 * chart.column([1, 4, 5, 7, 2]);
 * chart.textMarker().value(6).text('Marker 0');
 * chart.textMarker().value(2).text('Marker 1');
 * // turn off zero marker
 * chart.textMarker(0, null);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart text marker index.
 * @param {(anychart.elements.TextMarker|Object|string|null)=} opt_value Chart text marker settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none' to disable marker.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.elements.TextMarker|Object|string|null)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(anychart.elements.TextMarker|Object|string|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.elements.TextMarker|anychart.cartesian.Chart)} Line marker instance by index or itself for chaining call.
 */
anychart.cartesian.Chart.prototype.textMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = 0;
    value = opt_indexOrValue;
  }
  var textMarker = this.textAxesMarkers_[index];
  if (!textMarker) {
    textMarker = new anychart.elements.TextMarker();
    this.textAxesMarkers_[index] = textMarker;
    this.registerDisposable(textMarker);
    textMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.TextMarker) {
      textMarker.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      textMarker.deserialize(value);
    } else if (anychart.utils.isNone(value)) {
      textMarker.enabled(false);
    }
    return this;
  } else {
    return textMarker;
  }
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.cartesian.Chart.prototype.onMarkersSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
///**
// * Do nothing.
// * @param {*=} opt_value Do nothing.
// */
//anychart.cartesian.Chart.prototype.tooltip = function(opt_value) {
//  //todo:implement in 21 sprint
//};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series constructors
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Adds Area series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Area series');
 * chart.area([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.Area} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.area = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Bar series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Bar series');
 * chart.bar([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.Bar} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.bar = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.BAR,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Bubble series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Bubble series');
 * chart.bubble([
 *   [0, 4, 10],
 *   [1, 5, 6],
 *   [2, 6, 17],
 *   [3, 7, 20]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.bubble = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.BUBBLE,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Candlestick series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Candlestick series');
 * chart.candlestick([
 *   [0, 14, 24, 14, 20],
 *   [1, 15, 15, 5, 10],
 *   [2, 16, 16, 6, 1],
 *   [3, 7, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.Candlestick} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.candlestick = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.CANDLESTICK,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Column series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Column series');
 * chart.column([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.Column} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.column = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.COLUMN,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Line series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Line series');
 * chart.line([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.Line} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.line = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.LINE,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Marker series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Marker series');
 * chart.marker([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.Marker} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.marker = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.MARKER,
      data,
      opt_csvSettings
  );
};


/**
 * Adds OHLC series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('OHLC series');
 * chart.ohlc([
 *   [0, 14, 24, 14, 20],
 *   [1, 15, 15, 5, 10],
 *   [2, 16, 16, 6, 1],
 *   [3, 7, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.OHLC} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.ohlc = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.OHLC,
      data,
      opt_csvSettings
  );
};


/**
 * Adds RangeArea series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('RangeArea series');
 * chart.rangeArea([
 *   [0,  24, 14, 20],
 *   [1,  15, 5, 10],
 *   [2,  16, 6, 1],
 *   [3, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.RangeArea} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.rangeArea = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.RANGE_AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Adds RangeBar series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('RangeBar series');
 * chart.rangeBar([
 *   [0,  24, 14, 20],
 *   [1,  15, 5, 10],
 *   [2,  16, 6, 1],
 *   [3, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.RangeBar} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.rangeBar = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.RANGE_BAR,
      data,
      opt_csvSettings
  );
};


/**
 * Adds RangeColumn series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('RangeColumn series');
 * chart.rangeColumn([
 *   [0,  24, 14, 20],
 *   [1,  15, 5, 10],
 *   [2,  16, 6, 1],
 *   [3, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.RangeColumn} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.rangeColumn = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.RANGE_COLUMN,
      data,
      opt_csvSettings
  );
};


/**
 * Adds RangeSplineArea series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('RangeSplineArea series');
 * chart.rangeSplineArea([
 *   [0,  24, 14, 20],
 *   [1,  15, 5, 10],
 *   [2,  16, 6, 1],
 *   [3, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.RangeSplineArea} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.rangeSplineArea = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.RANGE_SPLINE_AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Adds RangeColumn series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('RangeColumn series');
 * chart.rangeStepArea([
 *   [0,  24, 14, 20],
 *   [1,  15, 5, 10],
 *   [2,  16, 6, 1],
 *   [3, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.RangeColumn} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.rangeStepArea = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.RANGE_STEP_AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Spline series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Spline series');
 * chart.spline([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.Spline} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.spline = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.SPLINE,
      data,
      opt_csvSettings
  );
};


/**
 * Adds SplineArea series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('SplineArea series');
 * chart.splineArea([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.SplineArea} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.splineArea = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.SPLINE_AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Adds StepLine series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('StepLine series');
 * chart.stepLine([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.StepLine} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.stepLine = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.STEP_LINE,
      data,
      opt_csvSettings
  );
};


/**
 * Adds StepArea series.
 * @example
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('StepArea series');
 * chart.stepArea([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.StepArea} instance for method chaining.
 */
anychart.cartesian.Chart.prototype.stepArea = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.cartesian.series.Type.STEP_AREA,
      data,
      opt_csvSettings
  );
};


/**
 * @param {string} type Series type.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @private
 * @return {anychart.cartesian.series.Base}
 */
anychart.cartesian.Chart.prototype.createSeriesByType_ = function(type, data, opt_csvSettings) {
  var ctl = anychart.cartesian.series.seriesTypesMap[type];
  var instance;

  if (ctl) {
    instance = new ctl(data, opt_csvSettings);
    this.series_.push(instance);
    instance.index(this.series_.length - 1);
    instance.clip(true);
    instance.setAutoColor(this.palette().colorAt(this.series_.length - 1));
    instance.setAutoMarkerType(/** @type {anychart.elements.Marker.Type} */(this.markerPalette().markerAt(this.series_.length - 1)));
    instance.restoreDefaults();
    instance.listenSignals(this.seriesInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    throw 'Unknown series type: ' + type + '\nIt can be contains in other modules, see module list for details.';
  }

  return instance;
};


/**
 * Getter for series.
 * @param {number} index
 * @return {anychart.cartesian.series.Base}
 */
anychart.cartesian.Chart.prototype.getSeries = function(index) {
  return this.series_[index] || null;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.cartesian.Chart.prototype.seriesInvalidated_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.SERIES;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.SERIES;
    this.invalidateSeries_();
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.SCALES;
  }
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series specific settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for space between bar groups on the ordinal scale by ratio of bars width.
 * @return {number} Current bar groups padding.
 *//**
 * Setter for space between bar groups on the ordinal scale by ratio of bars width.<br/>
 * See example at {@link anychart.cartesian.Chart#barsPadding}.
 * @param {number=} opt_value [0.1] Value to set.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {number|anychart.cartesian.Chart} .
 */
anychart.cartesian.Chart.prototype.barGroupsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.barGroupsPadding_ != +opt_value) {
      this.barGroupsPadding_ = +opt_value;
      this.invalidateWidthBasedSeries_();
      this.invalidate(anychart.ConsistencyState.SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.barGroupsPadding_;
};


/**
 * Getter for space between bars on the ordinal scale by ratio of bars width.
 * @return {number} Current bars padding.
 *//**
 * Setter for space between bars on the ordinal scale by ratio of bars width.
 * @illustration <t>singleChart</t>
 * chart = new anychart.cartesian.Chart();
 * chart.title().text('Chart title');
 * chart.bar([1, 4, 5]);
 * chart.bar([1, 4, 5]);
 * chart.barsPadding(.6);
 * chart.barGroupsPadding(.6);
 * chart.container(stage).draw();
 * var rect = layer.rect(15, 35, 300, 89).fill('none').stroke('grey', 2, '3 5');
 * layer.text(335, 102, 'bars group');
 * layer.path()
 *     .moveTo(320, 108).lineTo(330, 108).stroke(rect.stroke());
 * layer.text(330, 155, 'barsPadding');
 * layer.circle(200, 164, 6);
 * layer.path()
 *     .moveTo(208, 164).lineTo(325, 164).stroke(rect.stroke());
 * layer.text(300, 200, 'barGroupsPadding');
 * layer.circle(70, 206, 6);
 * layer.path()
 *     .moveTo(76, 206).lineTo(295, 206).stroke(rect.stroke());
 * @param {number=} opt_value [0.1] Value to set.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {number|anychart.cartesian.Chart} .
 */
anychart.cartesian.Chart.prototype.barsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.barsPadding_ != +opt_value) {
      this.barsPadding_ = +opt_value;
      this.invalidateWidthBasedSeries_();
      this.invalidate(anychart.ConsistencyState.SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.barsPadding_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Calculation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calculate cartesian chart properties.
 */
anychart.cartesian.Chart.prototype.calculate = function() {
  /** @type {number} */
  var i;
  /** @type {number} */
  var j;
  /** @type {anychart.scales.Base} */
  var scale;
  /** @type {!Array.<anychart.cartesian.series.Base>} */
  var series;
  /** @type {anychart.cartesian.series.Base} */
  var aSeries;
  /** @type {Array.<*>} */
  var categories;
  /** @type {anychart.data.Iterator} */
  var iterator;
  /** @type {anychart.scales.Base} */
  var xScale;
  /** @type {number} */
  var id;
  /** @type {number} */
  var xId;
  /** @type {Array.<anychart.scales.Base>} */
  var yScalesToCalc;
  /** @type {Object.<!Array.<anychart.cartesian.series.Base>>} */
  var xScales;
  /** @type {anychart.cartesian.ScatterIterator} */
  var syncIterator;
  /** @type {Array.<*>} */
  var values;
  /** @type {*} */
  var value;

  if (this.hasInvalidationState(anychart.ConsistencyState.SCALES)) {
    anychart.Base.suspendSignalsDispatching(this.series_);

    this.makeScaleMaps_();

    yScalesToCalc = [];

    // parsing y scales map and getting lists of scales that need to be calculated and resetting them.
    for (id in this.yScales_) {
      scale = this.yScales_[id];
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc(); // starting autocalc for stacked scales too.
        if (scale.stackMode() != anychart.scales.StackMode.VALUE)
          yScalesToCalc.push(scale);
      }
    }
    // parsing x scales map and calculating them if needed as they cannot be stacked.
    for (id in this.xScales_) {
      scale = this.xScales_[id];
      series = this.seriesOfXScaleMap_[goog.getUid(scale)];
      // we can crash or warn user here if the scale is stacked, if we want.
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc();
        for (i = 0; i < series.length; i++) {
          aSeries = series[i];
          iterator = aSeries.getResetIterator();
          while (iterator.advance()) {
            value = iterator.get('x');
            if (goog.isDef(value))
              scale.extendDataRange(value);
          }
        }
      }
      // categorise series data if needed.
      categories = scale.getCategorisation();
      for (i = 0; i < series.length; i++)
        series[i].categoriseData(categories);
    }

    // calculate non-stacked y scales.
    for (i = 0; i < yScalesToCalc.length; i++) {
      scale = yScalesToCalc[i];
      series = this.seriesOfYScaleMap_[goog.getUid(scale)];
      if (scale.stackMode() == anychart.scales.StackMode.PERCENT) {
        var hasPositive = false;
        var hasNegative = false;
        for (j = 0; j < series.length; j++) {
          aSeries = series[j];
          if (aSeries.supportsStack()) {
            iterator = aSeries.getResetIterator();
            while (iterator.advance()) {
              values = aSeries.getReferenceScaleValues();
              if (values) {
                for (var k = values.length; k--;) {
                  if ((/** @type {number} */(values[k])) > 0)
                    hasPositive = true;
                  else if ((/** @type {number} */(values[k])) < 0)
                    hasNegative = true;
                }
              }
            }
          }
        }
        scale.extendDataRange(0);
        if (hasPositive || (!hasPositive && !hasNegative))
          scale.extendDataRange(100);
        if (hasNegative)
          scale.extendDataRange(-100);
      } else {
        for (j = 0; j < series.length; j++) {
          aSeries = series[j];
          iterator = aSeries.getResetIterator();
          while (iterator.advance()) {
            values = aSeries.getReferenceScaleValues();
            if (values)
              scale.extendDataRange.apply(scale, values);
          }
        }
      }
    }

    // calculate stacked y scales.
    for (id in this.seriesOfStackedScaleMap_) {
      series = this.seriesOfStackedScaleMap_[id];
      scale = this.yScales_[id];
      xScales = {};
      for (i = 0; i < series.length; i++) {
        xId = goog.getUid(series[i].xScale());
        if (xId in xScales)
          xScales[xId].push(series[i]);
        else
          xScales[xId] = [series[i]];
      }
      for (xId in xScales) {
        xScale = this.xScales_[xId];
        var cats = xScale.getCategorisation();
        var pointCallback = goog.bind(
            function(series) {
              var values = series.getReferenceScaleValues();
              var i;
              if (values) {
                if (series.supportsStack()) {
                  for (i = values.length; i--;)
                    this.extendDataRange(this.applyStacking(values[i]));
                } else {
                  for (i = values.length; i--;)
                    this.extendDataRange(values[i]);
                }
              }
            }, scale);
        var beforePointCallback = goog.bind(
            function() {
              this.resetStack();
            }, scale);
        if (!!cats) {
          syncIterator = new anychart.cartesian.OrdinalIterator(xScales[xId], cats,
              pointCallback, null, beforePointCallback);
        } else {
          syncIterator = new anychart.cartesian.ScatterIterator(xScales[xId],
              pointCallback, null, beforePointCallback);
        }
        while (syncIterator.advance()) {
        }
      }
    }

    // calculate auto names for scales with predefined names field
    for (id in this.ordinalScalesWithNamesField_) {
      scale = /** @type {anychart.scales.Ordinal} */ (this.ordinalScalesWithNamesField_[id]);
      series = this.seriesOfOrdinalScalesWithNamesField_[goog.getUid(scale)];
      var fieldName = scale.getNamesField();
      var autoNames = [];
      for (i = 0; i < series.length; i++) {
        aSeries = series[i];
        iterator = aSeries.getResetIterator();
        while (iterator.advance()) {
          var valueIndex = scale.getIndexByValue(iterator.get('x'));
          var name = iterator.get(fieldName);
          if (!goog.isDef(autoNames[valueIndex]))
            autoNames[valueIndex] = name || iterator.get('x') || iterator.get('value');
        }
      }
      scale.setAutoNames(autoNames);
    }

    anychart.Base.resumeSignalsDispatchingTrue(this.series_);

    this.markConsistent(anychart.ConsistencyState.SCALES);
    this.scalesFinalization_ = true;
  }
};


/**
 * Prepares scale maps.
 * @private
 */
anychart.cartesian.Chart.prototype.makeScaleMaps_ = function() {
  var i;
  var id;
  var count;
  var xScales = {};
  var yScales = {};
  var ordinalScalesWithNamesField = {};
  var seriesOfOrdinalScalesWithNamesField = {};
  var seriesOfStackedScaleMap = {};
  var seriesOfXScaleMap = {};
  var seriesOfYScaleMap = {};
  var scale;
  var item;
  var series;

  var max = -Infinity;
  var min = Infinity;
  var sum = 0;
  var pointsCount = 0;

  //search for scales in series
  for (i = 0, count = this.series_.length; i < count; i++) {
    //----------------------------------calc statistics for series
    series = this.series_[i];
    series.calculateStatistics();
    max = Math.max(max, /** @type {number} */(series.statistics('seriesMax')));
    min = Math.min(min, /** @type {number} */ (series.statistics('seriesMin')));
    sum += /** @type {number} */(series.statistics('seriesSum'));
    pointsCount += /** @type {number} */(series.statistics('seriesPointsCount'));
    //----------------------------------end calc statistics for series


    //series X scale
    if (!series.xScale()) {
      series.xScale(/** @type {anychart.scales.Base} */(this.xScale()));
      this.invalidateSeries_();
      this.invalidate(anychart.ConsistencyState.SERIES);
    }
    scale = series.xScale();

    id = goog.getUid(scale);
    xScales[id] = scale;
    if (id in seriesOfXScaleMap)
      seriesOfXScaleMap[id].push(series);
    else
      seriesOfXScaleMap[id] = [series];

    // series ordinal scales with predefined field name for scale names.
    if (scale instanceof anychart.scales.Ordinal && scale.getNamesField()) {
      ordinalScalesWithNamesField[id] = scale;
      if (id in seriesOfOrdinalScalesWithNamesField)
        seriesOfOrdinalScalesWithNamesField[id].push(series);
      else
        seriesOfOrdinalScalesWithNamesField[id] = [series];
    }

    //series Y scale
    if (!series.yScale()) {
      series.yScale(/** @type {anychart.scales.Base} */(this.yScale()));
      this.invalidateSeries_();
      this.invalidate(anychart.ConsistencyState.SERIES);
    }
    scale = series.yScale();

    id = goog.getUid(scale);
    if (scale.stackMode() == anychart.scales.StackMode.VALUE) {
      if (id in seriesOfStackedScaleMap)
        seriesOfStackedScaleMap[id].push(series);
      else
        seriesOfStackedScaleMap[id] = [series];
    }
    yScales[id] = scale;
    if (id in seriesOfYScaleMap)
      seriesOfYScaleMap[id].push(series);
    else
      seriesOfYScaleMap[id] = [series];

    // series ordinal scales with predefined field name for scale names.
    if (scale instanceof anychart.scales.Ordinal && scale.getNamesField()) {
      ordinalScalesWithNamesField[id] = scale;
      if (id in seriesOfOrdinalScalesWithNamesField)
        seriesOfOrdinalScalesWithNamesField[id].push(series);
      else
        seriesOfOrdinalScalesWithNamesField[id] = [series];
    }
  }

  //----------------------------------calc statistics for series
  //todo (Roman Lubushikin): to avoid this loop on series we can store this info in the chart instance and provide it to all series
  var average = sum / pointsCount;
  for (i = 0, count = this.series_.length; i < count; i++) {
    series = this.series_[i];
    series.statistics('max', max);
    series.statistics('min', min);
    series.statistics('sum', sum);
    series.statistics('average', average);
    series.statistics('pointsCount', pointsCount);
  }
  //----------------------------------end calc statistics for series

  for (i = 0, count = this.xAxes_.length; i < count; i++) {
    item = this.xAxes_[i];
    if (item && !item.scale())
      item.scale(/** @type {anychart.scales.Base} */(this.xScale()));
  }

  for (i = 0, count = this.yAxes_.length; i < count; i++) {
    item = this.yAxes_[i];
    if (item && !item.scale())
      item.scale(/** @type {anychart.scales.Base} */(this.yScale()));
  }

  var directionBasedElements = goog.array.concat(
      this.lineAxesMarkers_,
      this.rangeAxesMarkers_,
      this.textAxesMarkers_,
      this.grids_,
      this.minorGrids_);

  for (i = 0, count = directionBasedElements.length; i < count; i++) {
    item = directionBasedElements[i];

    if (item && !item.scale()) {
      if (item.isHorizontal()) {
        item.scale(/** @type {anychart.scales.Base} */(this.yScale()));
      } else {
        item.scale(/** @type {anychart.scales.Base} */(this.xScale()));
      }
    }
  }

  this.seriesOfStackedScaleMap_ = seriesOfStackedScaleMap;
  this.yScales_ = yScales;
  this.xScales_ = xScales;
  this.seriesOfXScaleMap_ = seriesOfXScaleMap;
  this.seriesOfYScaleMap_ = seriesOfYScaleMap;
  this.ordinalScalesWithNamesField_ = ordinalScalesWithNamesField;
  this.seriesOfOrdinalScalesWithNamesField_ = seriesOfOrdinalScalesWithNamesField;
};


/**
 * Spread Column and Bar series to categories width
 * @private
 */
anychart.cartesian.Chart.prototype.distributeSeries_ = function() {
  /** @type {number} */
  var i;
  /** @type {anychart.scales.Base} */
  var scale;
  /** @type {!Array.<anychart.cartesian.series.Base>} */
  var series;
  /** @type {anychart.cartesian.series.Base} */
  var aSeries;
  /** @type {number} */
  var id;
  /** @type {number} */
  var xId;
  var wSeries;
  var seenScales;
  var currPosition;
  var barWidthRatio;
  var numColumnClusters;
  var numBarClusters;
  var seenScalesWithColumns;
  var seenScalesWithBars;
  // spreading column and bar series to the total width of X categories
  for (xId in this.seriesOfXScaleMap_) {
    // no ned to do this if the scale is not ordinal
    if (!this.xScales_[xId].getCategorisation())
      continue;
    series = this.seriesOfXScaleMap_[xId];
    // Our task is to calculate the number of column and bar clusters.
    // One column cluster is a column series, if axis is not stacked,
    // or all series of stacked axis, if there is at least one column.
    // One bar cluster is a bar series, if axis is not stacked,
    // or all series of stacked axis, if there is at least one bar.
    numColumnClusters = 0;
    numBarClusters = 0;
    seenScalesWithColumns = {};
    seenScalesWithBars = {};
    for (i = 0; i < series.length; i++) {
      aSeries = series[i];
      scale = /** @type {anychart.scales.Base} */(aSeries.yScale());
      id = goog.getUid(scale);
      if (aSeries instanceof anychart.cartesian.series.BarBase) {
        if (scale.stackMode() == anychart.scales.StackMode.NONE) {
          numBarClusters++;
        } else {
          if (!(id in seenScalesWithBars)) {
            numBarClusters++;
            seenScalesWithBars[id] = true;
          }
        }
      } else if (aSeries instanceof anychart.cartesian.series.WidthBased) {
        if (scale.stackMode() == anychart.scales.StackMode.NONE) {
          numColumnClusters++;
        } else {
          if (!(id in seenScalesWithColumns)) {
            numColumnClusters++;
            seenScalesWithColumns[id] = true;
          }
        }
      }
    }
    if (numColumnClusters > 0) {
      numColumnClusters = numColumnClusters + (numColumnClusters - 1) * this.barsPadding_ + this.barGroupsPadding_;
      barWidthRatio = 1 / numColumnClusters;
      currPosition = barWidthRatio * this.barGroupsPadding_ / 2;
      seenScales = {};
      for (i = 0; i < series.length; i++) {
        wSeries = /** @type {anychart.cartesian.series.WidthBased} */(series[i]);
        if (wSeries instanceof anychart.cartesian.series.WidthBased && !(wSeries instanceof anychart.cartesian.series.BarBase)) {
          scale = /** @type {anychart.scales.Base} */(wSeries.yScale());
          if (scale.stackMode() == anychart.scales.StackMode.NONE) {
            wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
            wSeries.setAutoBarWidth(barWidthRatio);
            currPosition += barWidthRatio * (1 + this.barsPadding_);
          } else {
            id = goog.getUid(scale);
            if (id in seenScales) {
              wSeries.setAutoXPointPosition(seenScales[id] + barWidthRatio / 2);
              wSeries.setAutoBarWidth(barWidthRatio);
            } else {
              wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
              wSeries.setAutoBarWidth(barWidthRatio);
              seenScales[id] = currPosition;
              currPosition += barWidthRatio * (1 + this.barsPadding_);
            }
          }
        }
      }
    }
    if (numBarClusters > 0) {
      numBarClusters = numBarClusters + (numBarClusters - 1) * this.barsPadding_ + this.barGroupsPadding_;
      barWidthRatio = 1 / numBarClusters;
      currPosition = barWidthRatio * this.barGroupsPadding_ / 2;
      seenScales = {};
      for (i = 0; i < series.length; i++) {
        wSeries = /** @type {anychart.cartesian.series.Bar} */(series[i]);
        if (wSeries instanceof anychart.cartesian.series.BarBase) {
          scale = /** @type {anychart.scales.Base} */(wSeries.yScale());
          if (scale.stackMode() == anychart.scales.StackMode.NONE) {
            wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
            wSeries.setAutoBarWidth(barWidthRatio);
            currPosition += barWidthRatio * (1 + this.barsPadding_);
          } else {
            id = goog.getUid(scale);
            if (id in seenScales) {
              wSeries.setAutoXPointPosition(seenScales[id] + barWidthRatio / 2);
              wSeries.setAutoBarWidth(barWidthRatio);
            } else {
              wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
              wSeries.setAutoBarWidth(barWidthRatio);
              seenScales[id] = currPosition;
              currPosition += barWidthRatio * (1 + this.barsPadding_);
            }
          }
        }
      }
    }
  }
};


/**
 * Calculates bubble sizes for series.
 * @private
 */
anychart.cartesian.Chart.prototype.calcBubbleSizes_ = function() {
  var i;
  var minMax = [Number.MAX_VALUE, -Number.MAX_VALUE];
  for (i = this.series_.length; i--;) {
    if (this.series_[i] instanceof anychart.cartesian.series.Bubble)
      /** @type {anychart.cartesian.series.Bubble} */(this.series_[i]).calculateSizeScale(minMax);
  }
  for (i = this.series_.length; i--;) {
    if (this.series_[i] instanceof anychart.cartesian.series.Bubble)
      /** @type {anychart.cartesian.series.Bubble} */(this.series_[i]).setAutoSizeScale(minMax[0], minMax[1]);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for series colors palette.
 * @return {!(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette)} Current palette.
 *//**
 * Setter for series colors palette.
 * @param {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|Array)=} opt_value Value to set.
 * @return {!anychart.cartesian.Chart} {@link anychart.cartesian.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|Array)=} opt_value .
 * @return {!(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|anychart.cartesian.Chart)} .
 */
anychart.cartesian.Chart.prototype.palette = function(opt_value) {
  if (opt_value instanceof anychart.utils.RangeColorPalette) {
    this.setupPalette_(anychart.utils.RangeColorPalette, opt_value);
    return this;
  } else if (opt_value instanceof anychart.utils.DistinctColorPalette) {
    this.setupPalette_(anychart.utils.DistinctColorPalette, opt_value);
    return this;
  }

  if (!this.palette_)
    this.setupPalette_(anychart.utils.DistinctColorPalette);

  if (goog.isDef(opt_value)) {
    if (goog.isArray(opt_value))
      this.palette_.colors(opt_value);
    else if (goog.isNull(opt_value))
      this.palette_.cloneFrom(opt_value);
    else
      return this;
    return this;
  }
  return /** @type {!(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette)} */(this.palette_);
};


/**
 * Chart markers palette settings.
 * @param {(Array.<anychart.elements.Marker.Type>|Object|anychart.utils.MarkerPalette)=} opt_value Chart marker palette settings to set.
 * @return {anychart.utils.MarkerPalette|anychart.cartesian.Chart} Return current chart markers palette or itself for chaining call.
 */
anychart.cartesian.Chart.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.utils.MarkerPalette();
    this.markerPalette_.listenSignals(this.markerPaletteInvalidated_, this);
    this.registerDisposable(this.markerPalette_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.utils.MarkerPalette) {
      this.markerPalette_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.markerPalette_.deserialize(opt_value);
    } else if (goog.isArray(opt_value)) {
      this.markerPalette_.markers(opt_value);
    }
    return this;
  } else {
    return this.markerPalette_;
  }
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.cartesian.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (this.palette_ instanceof cls) {
    if (opt_cloneFrom)
      this.palette_.cloneFrom(opt_cloneFrom);
  } else {
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.cloneFrom(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.palette_);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.cartesian.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.cartesian.Chart.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MARKER_PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw cartesian chart content items.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 */
anychart.cartesian.Chart.prototype.drawContent = function(bounds) {
  var i, count;

  this.calculate();
  if (this.scalesFinalization_) {
    var scale;
    var scalesChanged = false;
    for (i in this.xScales_) {
      scale = this.xScales_[i];
      if (scale.needsAutoCalc())
        scalesChanged |= scale.finishAutoCalc();
    }
    for (i in this.yScales_) {
      scale = this.yScales_[i];
      if (scale.needsAutoCalc())
        scalesChanged |= scale.finishAutoCalc();
    }
    this.scalesFinalization_ = false;
    if (scalesChanged) {
      this.invalidateSeries_();
    }
  }

  if (this.isConsistent())
    return;

  anychart.Base.suspendSignalsDispatching(this.series_, this.xAxes_, this.yAxes_);

  if (this.hasInvalidationState(anychart.ConsistencyState.PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoColor(this.palette().colorAt(i));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SERIES);
    this.markConsistent(anychart.ConsistencyState.PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MARKER_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoMarkerType(/** @type {anychart.elements.Marker.Type} */(this.markerPalette().markerAt(i)));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SERIES);
    this.markConsistent(anychart.ConsistencyState.MARKER_PALETTE);
  }

  var axes = goog.array.concat(this.xAxes_, this.yAxes_);

  //calculate axes space first, the result is data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    //total bounds of content area
    var contentAreaBounds = bounds.clone();
    var attempt = 0;
    do {
      //axes local vars
      var remainingBounds;
      var axis;
      var orientation;
      var topOffset = 0;
      var bottomOffset = 0;
      var leftOffset = 0;
      var rightOffset = 0;
      var complete = true;
      var boundsWithoutAxes = bounds.clone();

      for (i = axes.length; i--;) {
        axis = axes[i];
        if (axis && axis.enabled()) {
          axis.suspendSignalsDispatching();
          axis.parentBounds(contentAreaBounds);
          orientation = axis.orientation();

          if (orientation == anychart.utils.Orientation.TOP) {
            axis.offsetY(topOffset);
            remainingBounds = axis.getRemainingBounds();
            topOffset += contentAreaBounds.height - remainingBounds.height;
          } else if (orientation == anychart.utils.Orientation.BOTTOM) {
            axis.offsetY(bottomOffset);
            remainingBounds = axis.getRemainingBounds();
            bottomOffset = contentAreaBounds.height - remainingBounds.height;
          } else if (orientation == anychart.utils.Orientation.LEFT) {
            axis.offsetX(leftOffset);
            remainingBounds = axis.getRemainingBounds();
            leftOffset += contentAreaBounds.width - remainingBounds.width;
          } else if (orientation == anychart.utils.Orientation.RIGHT) {
            axis.offsetX(rightOffset);
            remainingBounds = axis.getRemainingBounds();
            rightOffset = contentAreaBounds.width - remainingBounds.width;
          }
          axis.resumeSignalsDispatching(false);
        }
      }

      boundsWithoutAxes.left += leftOffset;
      boundsWithoutAxes.top += topOffset;
      boundsWithoutAxes.width -= rightOffset + leftOffset;
      boundsWithoutAxes.height -= bottomOffset + topOffset;

      for (i = axes.length; i--;) {
        axis = axes[i];
        if (axis && axis.enabled()) {
          axis.suspendSignalsDispatching();
          var remainingBoundsBeforeSetLength = axis.getRemainingBounds();
          if (axis.isHorizontal()) {
            axis.length(parseFloat(boundsWithoutAxes.width));
            remainingBounds = axis.getRemainingBounds();
            if (remainingBounds.height != remainingBoundsBeforeSetLength.height) {
              complete = false;
            }
          } else {
            axis.length(parseFloat(boundsWithoutAxes.height));
            remainingBounds = axis.getRemainingBounds();
            if (remainingBounds.width != remainingBoundsBeforeSetLength.width) {
              complete = false;
            }
          }
          axis.resumeSignalsDispatching(false);
        }
      }
      attempt++;
    } while (!complete && attempt < anychart.cartesian.Chart.MAX_ATTEMPTS_AXES_CALCULATION_);

    //bounds of data area
    this.dataBounds_ = boundsWithoutAxes.clone();

    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.AXES);
    this.invalidate(anychart.ConsistencyState.GRIDS);
    this.invalidate(anychart.ConsistencyState.SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS)) {
    var grids = goog.array.concat(this.grids_, this.minorGrids_);

    for (i = 0, count = grids.length; i < count; i++) {
      var grid = grids[i];
      if (grid) {
        grid.suspendSignalsDispatching();
        grid.parentBounds(this.dataBounds_);
        grid.container(this.rootElement);
        grid.draw();
        grid.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.GRIDS);
  }
  //draw axes outside of data bounds
  //only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.AXES)) {
    for (i = 0, count = axes.length; i < count; i++) {
      axis = axes[i];
      if (axis) {
        axis.suspendSignalsDispatching();
        axis.container(this.rootElement);
        if (axis.isHorizontal()) {
          axis.offsetX(leftOffset);
          axis.length(parseFloat(this.dataBounds_.width));
        } else {
          axis.offsetY(topOffset);
          axis.length(parseFloat(this.dataBounds_.height));
        }
        axis.draw();
        axis.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_MARKERS)) {
    var markers = goog.array.concat(
        this.lineAxesMarkers_,
        this.rangeAxesMarkers_,
        this.textAxesMarkers_);

    for (i = 0, count = markers.length; i < count; i++) {
      var axesMarker = markers[i];
      if (axesMarker) {
        axesMarker.suspendSignalsDispatching();
        axesMarker.parentBounds(this.dataBounds_);
        axesMarker.container(this.rootElement);
        axesMarker.draw();
        axesMarker.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.AXES_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES)) {
    for (i = 0, count = this.series_.length; i < count; i++) {
      var series = this.series_[i];
      series.container(this.rootElement);
      series.pixelBounds(this.dataBounds_);
    }

    this.distributeSeries_();
    this.calcBubbleSizes_();
    this.drawSeries_();
    this.markConsistent(anychart.ConsistencyState.SERIES);
  }

  anychart.Base.resumeSignalsDispatchingFalse(this.series_, this.xAxes_, this.yAxes_);
};


/**
 * Renders the chart.
 * @private
 */
anychart.cartesian.Chart.prototype.drawSeries_ = function() {
  var i;
  var iterator;
  for (var id in this.xScales_) {
    var scale = this.xScales_[id];
    var yScales = {};
    var yScalePositiveSumms = {};
    var yScaleNegativeSumms = {};
    var series = this.seriesOfXScaleMap_[goog.getUid(scale)];
    for (i = 0; i < series.length; i++) {
      var yUid = goog.getUid(series[i].yScale());
      yScales[yUid] = series[i].yScale();
      yScalePositiveSumms[yUid] = 0;
      yScaleNegativeSumms[yUid] = 0;
    }
    var categories = scale.getCategorisation();
    var pointClb = function(series) {
      series.drawPoint();
    };
    var missingClb = function(series) {
      series.drawMissing();
    };
    var beforeClb = function(activeSeries) {
      var i;
      for (i = activeSeries.length; i--;) {
        var values = activeSeries[i].getReferenceScaleValues();
        if (activeSeries[i].supportsStack() && values) {
          for (var j = values.length; j--;) {
            var value = /** @type {number} */(values[j]);
            if (value >= 0)
              yScalePositiveSumms[goog.getUid(activeSeries[i].yScale())] += value;
            else if (value < 0)
              yScaleNegativeSumms[goog.getUid(activeSeries[i].yScale())] += value;
          }
        }
      }
      for (i in yScales) {
        yScales[i].resetStack();
        yScales[i].setStackRange(yScaleNegativeSumms[i], yScalePositiveSumms[i]);
      }
    };
    var afterClb = function() {
      for (var i in yScales) {
        yScalePositiveSumms[i] = 0;
        yScaleNegativeSumms[i] = 0;
      }
    };
    if (!!categories) {
      iterator = new anychart.cartesian.OrdinalIterator(series, categories, pointClb, missingClb, beforeClb, afterClb);
    } else {
      iterator = new anychart.cartesian.ScatterIterator(series, pointClb, missingClb, beforeClb, afterClb);
    }
    for (i = 0; i < series.length; i++) {
      series[i].startDrawing();
    }
    while (iterator.advance()) {
    }
    for (i = 0; i < series.length; i++)
      series[i].finalizeDrawing();
  }
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.cartesian.Chart.prototype.invalidateWidthBasedSeries_ = function() {
  for (var i = this.series_.length; i--;) {
    if (this.series_[i] instanceof anychart.cartesian.series.WidthBased)
      this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.HATCH_FILL);
  }
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.cartesian.Chart.prototype.invalidateSeries_ = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.HATCH_FILL);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.cartesian.Chart.prototype.createLegendItemsProvider = function() {
  /**
   * @type {!Array.<anychart.elements.Legend.LegendItemProvider>}
   */
  var data = [];
  for (var i = 0, count = this.series_.length; i < count; i++) {
    /** @type {anychart.cartesian.series.Base} */
    var series = this.series_[i];
    data.push(series.getLegendItemData());
  }

  return data;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Defaults.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.cartesian.Chart.prototype.restoreDefaults = function() {
  goog.base(this, 'restoreDefaults');

  var i, count;

  if (this.xAxes_) {
    for (i = 0, count = this.xAxes_.length; i < count; i++) {
      this.restoreDefaultsForAxis(this.xAxes_[i]);
    }
  }

  if (this.yAxes_) {
    for (i = 0, count = this.yAxes_.length; i < count; i++) {
      this.restoreDefaultsForAxis(this.yAxes_[i]);
    }
  }
};


/**
 * Restore default axis settings.
 * @protected
 * @param {anychart.elements.Axis} axis Axis to restore settings.
 */
anychart.cartesian.Chart.prototype.restoreDefaultsForAxis = function(axis) {
  axis.suspendSignalsDispatching();
  axis.resumeSignalsDispatching(true);
};


/**
 * @inheritDoc
 */
anychart.cartesian.Chart.prototype.deserialize = function(config) {
  var chart = config['chart'];

  if (!chart) return this;
  goog.base(this, 'deserialize', chart);

  this.suspendSignalsDispatching();
  var i, json, scale;
  var grids = chart['grids'];
  var minorGrids = chart['minorGrids'];
  var xAxes = chart['xAxes'];
  var yAxes = chart['yAxes'];
  var lineAxesMarkers = chart['lineAxesMarkers'];
  var rangeAxesMarkers = chart['rangeAxesMarkers'];
  var textAxesMarkers = chart['textAxesMarkers'];
  var series = chart['series'];
  var barGroupsPadding = chart['barGroupsPadding'];
  var barsPadding = chart['barsPadding'];
  var scales = chart['scales'];

  var scalesInstances = [];
  for (i = 0; i < scales.length; i++) {
    var scaleJson = scales[i];
    var scaleInstance = anychart.scales.createByType(scaleJson['type']);
    scaleInstance.deserialize(scaleJson);
    scalesInstances.push(scaleInstance);
  }

  this.xScale(scalesInstances[chart['xScale']]);
  chart['yScale'] ?
      this.yScale(scalesInstances[chart['yScale']]) :
      this.yScale(scalesInstances[chart['xScale']]);

  if (grids) {
    for (i = 0; i < grids.length; i++) {
      json = grids[i];
      this.grid(json);
      if (json['scale']) this.grid(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (minorGrids) {
    for (i = 0; i < minorGrids.length; i++) {
      json = minorGrids[i];
      this.minorGrid(json);
      if (json['scale']) this.minorGrid(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (xAxes) {
    for (i = 0; i < xAxes.length; i++) {
      json = xAxes[i];
      this.xAxis(json);
      if (json['scale']) this.xAxis(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (yAxes) {
    for (i = 0; i < yAxes.length; i++) {
      json = yAxes[i];
      this.yAxis(json);
      if (json['scale']) this.yAxis(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (lineAxesMarkers) {
    for (i = 0; i < lineAxesMarkers.length; i++) {
      json = lineAxesMarkers[i];
      this.lineMarker(json);
      if (json['scale']) this.lineMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (rangeAxesMarkers) {
    for (i = 0; i < rangeAxesMarkers.length; i++) {
      json = rangeAxesMarkers[i];
      this.rangeMarker(json);
      if (json['scale']) this.rangeMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (textAxesMarkers) {
    for (i = 0; i < textAxesMarkers.length; i++) {
      json = textAxesMarkers[i];
      this.textMarker(json);
      if (json['scale']) this.textMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (series) {
    for (i = 0; i < series.length; i++) {
      var s = series[i];
      var seriesType = s['seriesType'].toLowerCase();
      var data = s['data'];
      var seriesInst = this.createSeriesByType_(seriesType, data);
      seriesInst.deserialize(s);

      if (s['xScale']) seriesInst.xScale(scalesInstances[s['xScale']]);
      if (s['yScale']) seriesInst.yScale(scalesInstances[s['yScale']]);
    }
  }

  this.resumeSignalsDispatching(true);
  return this;
};


/**
 * @inheritDoc
 */
anychart.cartesian.Chart.prototype.serialize = function() {
  var json = {};
  var chart = goog.base(this, 'serialize');
  var i;
  var scalesIds = {};
  var scales = [];
  var scale;
  var config;
  var objId;

  scalesIds[goog.getUid(this.xScale())] = this.xScale().serialize();
  scales.push(scalesIds[goog.getUid(this.xScale())]);
  chart['xScale'] = scales.length - 1;
  if (this.xScale() != this.yScale()) {
    scalesIds[goog.getUid(this.yScale())] = this.yScale().serialize();
    scales.push(scalesIds[goog.getUid(this.yScale())]);
    chart['yScale'] = scales.length - 1;
  }

  chart['type'] = anychart.cartesian.Chart.CHART_TYPE;

  var grids = [];
  for (i = 0; i < this.grids_.length; i++) {
    var grid = this.grids_[i];
    config = grid.serialize();
    scale = grid.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    grids.push(config);
  }
  chart['grids'] = grids;

  var minorGrids = [];
  for (i = 0; i < this.minorGrids_.length; i++) {
    var minorGrid = this.minorGrids_[i];
    config = minorGrid.serialize();
    scale = minorGrid.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    minorGrids.push(config);
  }
  chart['minorGrids'] = minorGrids;

  var xAxes = [];
  for (i = 0; i < this.xAxes_.length; i++) {
    var xAxis = this.xAxes_[i];
    config = xAxis.serialize();
    scale = xAxis.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    xAxes.push(config);
  }
  chart['xAxes'] = xAxes;

  var yAxes = [];
  for (i = 0; i < this.yAxes_.length; i++) {
    var yAxis = this.yAxes_[i];
    config = yAxis.serialize();
    scale = yAxis.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    yAxes.push(config);
  }
  chart['yAxes'] = yAxes;

  var lineAxesMarkers = [];
  for (i = 0; i < this.lineAxesMarkers_.length; i++) {
    var lineAxesMarker = this.lineAxesMarkers_[i];
    config = lineAxesMarker.serialize();
    scale = lineAxesMarker.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    lineAxesMarkers.push(config);
  }
  chart['lineAxesMarkers'] = lineAxesMarkers;

  var rangeAxesMarkers = [];
  for (i = 0; i < this.rangeAxesMarkers_.length; i++) {
    var rangeAxesMarker = this.rangeAxesMarkers_[i];
    config = rangeAxesMarker.serialize();
    scale = rangeAxesMarker.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    rangeAxesMarkers.push(config);
  }
  chart['rangeAxesMarkers'] = rangeAxesMarkers;

  var textAxesMarkers = [];
  for (i = 0; i < this.textAxesMarkers_.length; i++) {
    var textAxesMarker = this.textAxesMarkers_[i];
    config = textAxesMarker.serialize();
    scale = textAxesMarker.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    textAxesMarkers.push(config);
  }
  chart['textAxesMarkers'] = textAxesMarkers;

  var series = [];
  for (i = 0; i < this.series_.length; i++) {
    var series_ = this.series_[i];
    config = series_.serialize();

    scale = series_.xScale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['xScale'] = scales.length - 1;
    } else {
      config['xScale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }

    scale = series_.yScale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['yScale'] = scales.length - 1;
    } else {
      config['yScale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    series.push(config);
  }

  chart['series'] = series;
  chart['scales'] = scales;
  chart['barGroupsPadding'] = this.barGroupsPadding();
  chart['barsPadding'] = this.barsPadding();

  json['chart'] = chart;

  return json;
};


/**
 * Default empty chart.
 * @return {!anychart.cartesian.Chart} Empty chart.
 */
anychart.cartesian.chart = function() {
  var chart = new anychart.cartesian.Chart();

  chart.title().enabled(false);
  chart.background().enabled(false);
  chart.legend().enabled(false);
  chart.margin(0);
  chart.padding(0);

  return chart;
};

//exports
goog.exportSymbol('anychart.cartesian.chart', anychart.cartesian.chart);//in docs/
anychart.cartesian.Chart.prototype['xScale'] = anychart.cartesian.Chart.prototype.xScale;//in docs/
anychart.cartesian.Chart.prototype['yScale'] = anychart.cartesian.Chart.prototype.yScale;//in docs/
anychart.cartesian.Chart.prototype['barsPadding'] = anychart.cartesian.Chart.prototype.barsPadding;//in docs/
anychart.cartesian.Chart.prototype['barGroupsPadding'] = anychart.cartesian.Chart.prototype.barGroupsPadding;//in docs/
anychart.cartesian.Chart.prototype['grid'] = anychart.cartesian.Chart.prototype.grid;//in docs/
anychart.cartesian.Chart.prototype['minorGrid'] = anychart.cartesian.Chart.prototype.minorGrid;//in docs/
anychart.cartesian.Chart.prototype['xAxis'] = anychart.cartesian.Chart.prototype.xAxis;//in docs/
anychart.cartesian.Chart.prototype['yAxis'] = anychart.cartesian.Chart.prototype.yAxis;//in docs/
anychart.cartesian.Chart.prototype['getSeries'] = anychart.cartesian.Chart.prototype.getSeries;
anychart.cartesian.Chart.prototype['area'] = anychart.cartesian.Chart.prototype.area;//in docs/
anychart.cartesian.Chart.prototype['bar'] = anychart.cartesian.Chart.prototype.bar;//in docs/
anychart.cartesian.Chart.prototype['bubble'] = anychart.cartesian.Chart.prototype.bubble;//in docs/
anychart.cartesian.Chart.prototype['candlestick'] = anychart.cartesian.Chart.prototype.candlestick;//in docs/
anychart.cartesian.Chart.prototype['column'] = anychart.cartesian.Chart.prototype.column;//in docs/
anychart.cartesian.Chart.prototype['line'] = anychart.cartesian.Chart.prototype.line;//in docs/
anychart.cartesian.Chart.prototype['marker'] = anychart.cartesian.Chart.prototype.marker;//in docs/
anychart.cartesian.Chart.prototype['ohlc'] = anychart.cartesian.Chart.prototype.ohlc;//in docs/
anychart.cartesian.Chart.prototype['rangeArea'] = anychart.cartesian.Chart.prototype.rangeArea;//in docs/
anychart.cartesian.Chart.prototype['rangeBar'] = anychart.cartesian.Chart.prototype.rangeBar;//in docs/
anychart.cartesian.Chart.prototype['rangeColumn'] = anychart.cartesian.Chart.prototype.rangeColumn;//in docs/
anychart.cartesian.Chart.prototype['rangeSplineArea'] = anychart.cartesian.Chart.prototype.rangeSplineArea;//in docs/
anychart.cartesian.Chart.prototype['rangeStepArea'] = anychart.cartesian.Chart.prototype.rangeStepArea;//in docs/
anychart.cartesian.Chart.prototype['spline'] = anychart.cartesian.Chart.prototype.spline;//in docs/
anychart.cartesian.Chart.prototype['splineArea'] = anychart.cartesian.Chart.prototype.splineArea;//in docs/
anychart.cartesian.Chart.prototype['stepLine'] = anychart.cartesian.Chart.prototype.stepLine;//in docs/
anychart.cartesian.Chart.prototype['stepArea'] = anychart.cartesian.Chart.prototype.stepArea;//in docs/
anychart.cartesian.Chart.prototype['lineMarker'] = anychart.cartesian.Chart.prototype.lineMarker;//in docs/
anychart.cartesian.Chart.prototype['rangeMarker'] = anychart.cartesian.Chart.prototype.rangeMarker;//in docs/
anychart.cartesian.Chart.prototype['textMarker'] = anychart.cartesian.Chart.prototype.textMarker;//in docs/
anychart.cartesian.Chart.prototype['palette'] = anychart.cartesian.Chart.prototype.palette;