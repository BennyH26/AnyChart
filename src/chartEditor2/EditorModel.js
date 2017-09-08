goog.provide('anychart.chartEditor2Module.EditorModel');

goog.require('goog.events.EventTarget');
goog.require('goog.format.JsonPrettyPrinter');
goog.require('goog.format.JsonPrettyPrinter.SafeHtmlDelimiters');


/**
 * Model!
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
anychart.chartEditor2Module.EditorModel = function() {
  anychart.chartEditor2Module.EditorModel.base(this, 'constructor');

  /**
   * Data container
   * @type {Object}
   * @private
   */
  this.data_ = {};

  /**
   * Data sets descriptions container
   * @type {Array}
   * @private
   */
  this.preparedData_ = [];

  this.generateInitialMappingsOnChangeView_ = true;

  /**
   * Model structure
   * @type {{
   *  dataSettings:
   *  {
   *      active: ?string,
   *      activeGeo: ?string,
   *      field: ?string,
   *      mappings: Array
   *  },
   *  anychart: Object,
   *  chart:
   *  {
   *      type: ?string,
   *      seriesType: ?string,
   *      settings: Object
   *  }
   * }}
   * @private
   */
  this.model_ = {
    'dataSettings': {
      'active': null,
      'activeGeo': null,
      'field': null,
      'mappings': [
        // [ // plot
        //   {ctl: 'line', mapping: {value: 1}},
        //   {ctl: 'column', mapping: {value: 2}}
        // ]
      ]
    },
    'anychart': {},
    'chart': {
      'type': null,
      'seriesType': null,
      'settings': {
        //'getSeriesAt(0).name()': 'my series'
      }
    }
  };

  /**
   * Data set analysis result
   * @type {Object}
   * @private
   */
  this.fieldsState_ = {};

  this.suspendQueue_ = 0;

  /**
   * Callback with string names.
   * @type {Object}
   * @private
   */
  this.callbacks_ = {
    'setActiveAndField': this.setActiveAndField,
    'setChartType': this.setChartType,
    'setSeriesType': this.setSeriesType,
    'setTheme': this.setTheme
  };
};
goog.inherits(anychart.chartEditor2Module.EditorModel, goog.events.EventTarget);


/**
 * @typedef {Array.<(Array|string)>}
 */
anychart.chartEditor2Module.EditorModel.Key;


/**
 * @enum {string}
 */
anychart.chartEditor2Module.EditorModel.dataType = {
  UPLOADED: 'u',
  PREDEFINED: 'p',
  GEO: 'g'
};


// region Structures
/**
 * @type {Object}
 */
anychart.chartEditor2Module.EditorModel.chartTypes = {
  'line': {
    'value': 'line',
    'name': 'Line',
    'icon': 'line-chart-1.svg', // 'http://www.anychart.com/_design/img/upload/charts/types/'
    'series': ['line', 'spline', 'column', 'area', 'ohlc'], // first value is default
    'dataSetCtor': 'set'
  },
  'area': {
    'value': 'area',
    'name': 'Area',
    'icon': 'area-chart.svg',
    'series': ['area', 'line', 'spline', 'column', 'ohlc'],
    'dataSetCtor': 'set'
  },
  'area-stacked-value': {
    'value': 'area',
    'stackMode': 'value',
    'name': 'Area stacked (value)',
    'icon': 'stacked-area-chart.svg',
    'series': ['area', 'line', 'spline', 'column', 'ohlc'],
    'dataSetCtor': 'set'
  },
  'area-stacked-percent': {
    'value': 'area',
    'stackMode': 'percent',
    'name': 'Area stacked (percent)',
    'icon': 'percent-stacked-area-chart.svg',
    'series': ['area', 'line', 'spline', 'column', 'ohlc'],
    'dataSetCtor': 'set'
  },
  'bar': {
    'value': 'bar',
    'name': 'Bar',
    'icon': 'bar-chart.svg',
    'series': ['bar', 'line', 'spline', 'area', 'ohlc'],
    'dataSetCtor': 'set'
  },
  'bar-stacked-value': {
    'value': 'bar',
    'stackMode': 'value',
    'name': 'Bar stacked (value)',
    'icon': 'stacked-bar-chart.svg',
    'series': ['bar', 'line', 'spline', 'area', 'ohlc'],
    'dataSetCtor': 'set'
  },
  'bar-stacked-percent': {
    'value': 'bar',
    'stackMode': 'percent',
    'name': 'Bar stacked (percent)',
    'icon': 'percent-stacked-bar-chart.svg',
    'series': ['bar', 'line', 'spline', 'area', 'ohlc'],
    'dataSetCtor': 'set'
  },
  'column': {
    'value': 'column',
    'name': 'Column',
    'icon': 'column-chart.svg',
    'series': ['column', 'line', 'spline', 'area', 'ohlc'],
    'dataSetCtor': 'set'
  },
  'column-stacked-value': {
    'value': 'column',
    'stackMode': 'value',
    'name': 'Column stacked (value)',
    'icon': 'stacked-column-chart.svg',
    'series': ['column', 'line', 'spline', 'area', 'ohlc'],
    'dataSetCtor': 'set'
  },
  'column-stacked-percent': {
    'value': 'column',
    'stackMode': 'percent',
    'name': 'Column stacked (percent)',
    'icon': 'percent-stacked-step-line-area-chart.svg',
    'series': ['column', 'line', 'spline', 'area', 'ohlc'],
    'dataSetCtor': 'set'
  },
  'scatter': {
    'value': 'scatter',
    'name': 'Scatter',
    'icon': 'scatter-chart.svg',
    'series': ['marker', 'bubble', 'line'],
    'dataSetCtor': 'set'
  },
  'pie': {
    'value': 'pie',
    'name': 'Pie',
    'icon': 'pie-chart.svg',
    'series': ['pie'],
    'dataSetCtor': 'set'
  },
  'map': {
    'value': 'map',
    'name': 'Map',
    'icon': 'choropleth-map.svg',
    'series': ['marker-by-id', 'marker-by-coordinates', 'bubble-by-id', 'bubble-by-coordinates', 'choropleth'],
    'dataSetCtor': 'set'
  },
  'stock': {
    'value': 'stock',
    'name': 'Stock',
    'icon': 'stock-chart.svg',
    'series': ['ohlc', 'candlestick', 'line', 'spline', 'column', 'area'],
    'dataSetCtor': 'table'
  }
};


/**
 * @type {Object}}
 */
anychart.chartEditor2Module.EditorModel.series = {
  'line': {
    'fields': [{'field': 'value', 'name': 'Y Value'}]
  },
  'spline': {
    'fields': [{'field': 'value', 'name': 'Y Value'}]
  },
  'column': {
    'fields': [{'field': 'value', 'name': 'Y Value'}]
  },
  'bar': {
    'fields': [{'field': 'value', 'name': 'Y Value'}]
  },
  'area': {
    'fields': [{'field': 'value', 'name': 'Y Value'}]
  },
  'ohlc': {
    'fields': [
      {'field': 'open'},
      {'field': 'high'},
      {'field': 'low'},
      {'field': 'close'}]
  },
  'candlestick': {
    'fields': [
      {'field': 'open'},
      {'field': 'high'},
      {'field': 'low'},
      {'field': 'close'}]
  },
  'pie': {
    'fields': [{'field': 'value', 'name': 'Value'}]
  },
  'marker': {
    'fields': [{'field': 'value', 'name': 'Value'}]
  },
  'bubble': {
    'fields': [
      {'field': 'value', 'name': 'Value'},
      {'field': 'size', 'name': 'Size'}]
  },
  // map series
  'marker-by-id': {
    'name': 'Marker (by geo Id)',
    'fields': [
      {'field': 'id', 'name': 'Id'}
    ]
  },
  'marker-by-coordinates': {
    'name': 'Marker (by coordinates)',
    'fields': [
      {'field': 'lat', 'name': 'Latitude'},
      {'field': 'long', 'name': 'Longitude'}
    ]
  },
  'bubble-by-id': {
    'name': 'Bubble (by geo Id)',
    'fields': [
      {'field': 'id', 'name': 'Id'},
      {'field': 'size', 'name': 'Size'}
    ]
  },
  'bubble-by-coordinates': {
    'name': 'Bubble (by coordinates)',
    'fields': [
      {'field': 'lat', 'name': 'Latitude'},
      {'field': 'long', 'name': 'Longitude'},
      {'field': 'size', 'name': 'Size'}
    ]
  },
  'choropleth': {
    'fields': [
      {'field': 'id', 'name': 'Id'},
      {'field': 'value', 'name': 'Value'}
    ]
  }
  // 'connector': {'fields': [{'field': 'value', 'name': 'Y Value'}]}
};
// endregion


// region Model initialization
/**
 * Processes analysis of active data set and sets field.
 *
 * @param {string=} opt_active Active data set id
 * @param {string=} opt_field Field id
 */
anychart.chartEditor2Module.EditorModel.prototype.chooseActiveAndField = function(opt_active, opt_field) {
  this.dropChartSettings();

  var preparedData = this.getPreparedData();
  this.model_['dataSettings']['active'] = goog.isDefAndNotNull(opt_active) ? opt_active : preparedData[0].setFullId;

  this.fieldsState_ = {
    numbersCount: 0,
    coordinates: [],
    numbers: []
  };

  var rawData = this.getRawData();
  var dataRow = rawData[0];
  var fieldValue;
  var numberValue;
  var key;

  for (key in dataRow) {
    fieldValue = dataRow[key];
    numberValue = goog.string.toNumber(fieldValue);

    if (!this.fieldsState_.date && goog.isString(fieldValue) && isNaN(numberValue) && new Date(fieldValue).getTime()) {
        // Full valid date by string ("2010-05-17")
        this.fieldsState_.date = key;
    }

    if (!this.fieldsState_.date_short && !isNaN(numberValue) && /^[0-2]\d{3}$/.test(fieldValue)) {
      // Short date ("2010")
      this.fieldsState_.date_short = key;
    }

    if (!isNaN(numberValue)) {
      if (this.fieldsState_.coordinates.length < 2 && new RegExp(/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}/).exec(fieldValue)) {
        this.fieldsState_.coordinates.push(key);
      }

    } else if (goog.isString(fieldValue)) {
      this.fieldsState_.firstString = goog.isDef(this.fieldsState_.firstString) ? this.fieldsState_.firstString : key;

      if (!this.fieldsState_.geoId && this.isGeoId_(fieldValue))
        this.fieldsState_.geoId = key;
    }
  }

  // Set up field
  if (goog.isDefAndNotNull(opt_field)) {
    this.model_['dataSettings']['field'] = opt_field;

  } else {
    this.model_['dataSettings']['field'] = goog.isDef(this.fieldsState_.date) ?
        this.fieldsState_.date :
        goog.isDef(this.fieldsState_.date_short) ?
            this.fieldsState_.date_short :
            goog.isDef(this.fieldsState_.firstString) ?
                this.fieldsState_.firstString :
                preparedData[0].fields[0].key;
  }

  if (this.fieldsState_.coordinates.length < 2)
    this.fieldsState_.coordinates = [];

  // Counting numbers
  for (key in dataRow) {
    if (this.model_['dataSettings']['field'] == key)
      continue;

    numberValue = goog.string.toNumber(dataRow[key]);
    if (!isNaN(numberValue)) {
      this.fieldsState_.numbers.push(key);
      this.fieldsState_.numbersCount++;
    }
  }
};


/**
 * Chooses chart type.
 */
anychart.chartEditor2Module.EditorModel.prototype.chooseDefaultChartType = function() {
  var chartType = 'line';
  var rawData = this.getRawData();

  if (this.model_['dataSettings']['activeGeo']) {
    chartType = 'map';
  } else {
    if (this.model_['dataSettings']['field'] == this.fieldsState_.date) {
      chartType = 'stock';

    } else if (this.model_['dataSettings']['field'] == this.fieldsState_.date_short) {
      chartType = 'column';

      if (this.fieldsState_.numbersCount > 3)
        this.setStackMode('value');

    } else if (this.model_['dataSettings']['field'] == this.fieldsState_.firstString) {
      if (rawData.length <= 5 && this.fieldsState_.numbersCount == 1)
        chartType = 'pie';
      else if (this.fieldsState_.numbersCount <= 3)
        chartType = 'bar';
      else if (this.fieldsState_.numbersCount <= 5) {
        chartType = 'bar';
        this.setStackMode('value');
      }

    } else
      chartType = 'scatter';
  }

  this.model_['chart']['type'] = chartType;
};


/**
 * Chooses default series type.
 */
anychart.chartEditor2Module.EditorModel.prototype.chooseDefaultSeriesType = function() {
  var seriesType = anychart.chartEditor2Module.EditorModel.chartTypes[this.model_['chart']['type']]['series'][0];

  switch (this.model_['chart']['type']) {
    case 'map':
      if (this.fieldsState_.coordinates.length == 2) {
        if (this.fieldsState_.numbersCount)
          seriesType = 'bubble-by-coordinates';
        else
          seriesType = 'marker-by-coordinates';

      } else if (this.fieldsState_.geoId) {
        if (this.fieldsState_.numbersCount)
          seriesType = 'bubble-by-id';
        else
          seriesType = 'marker-by-id';
      }
      break;

    case 'stock':
      if (this.fieldsState_.numbersCount < 4 || this.fieldsState_.numbersCount > 5)
        seriesType = 'line';
      break;

    case 'scatter':
      if (!(this.fieldsState_.numbersCount % 2))
        seriesType = 'bubble';
      else
        seriesType = 'marker';
      break;
  }

  this.model_['chart']['seriesType'] = seriesType;
};


/**
 * Creates default mappings for plots and series.
 */
anychart.chartEditor2Module.EditorModel.prototype.createDefaultMappings = function() {
  this.model_['dataSettings']['mappings'] = [];

  if (this.model_['chart']['type'] == 'stock') {
    this.model_['dataSettings']['mappings'] = [this.createPlotMapping()];

    if (this.model_['chart']['seriesType'] == 'ohlc' && this.fieldsState_.numbersCount == 5) {
      this.model_['chart']['seriesType'] = 'column';
      this.model_['dataSettings']['mappings'].push(this.createPlotMapping());
      this.model_['chart']['seriesType'] = 'ohlc';
    }
  }
  else
    this.model_['dataSettings']['mappings'] = [this.createPlotMapping()];
};


/**
 * Creates plot mapping. Need active data set and default series type to be chosen.
 * @return {Array}
 */
anychart.chartEditor2Module.EditorModel.prototype.createPlotMapping = function() {
  var result = [];

  var numValues = 1;
  if (this.model_['chart']['seriesType'] == 'bubble')
    numValues = 2;
  else if (this.model_['chart']['seriesType'] == 'ohlc')
    numValues = 4;

  var plotIndex = this.model_['dataSettings']['mappings'].length;
  var numSeries;
  var fieldIndex;
  if (this.model_['chart']['type']== 'pie' || this.model_['chart']['type']== 'map' ||
      (this.model_['chart']['type']== 'stock' && this.model_['chart']['seriesType'] == 'column' && plotIndex == 1))
    numSeries = 1;
  else
    numSeries = Math.floor(this.fieldsState_.numbersCount / numValues);

  if (this.model_['chart']['type']== 'stock' && this.model_['chart']['seriesType'] == 'column' && plotIndex == 1)
    fieldIndex = 4; // try to set volume plot

  for (var i = 0; i < numSeries; i += numValues) {
    var seriesConfig = this.createSeriesConfig(i, /** @type {string} */(this.model_['chart']['seriesType']), void 0, fieldIndex);
    result.push(seriesConfig);
  }

  return result;
};


/**
 * Creates series config.
 * @param {number} index
 * @param {string} type Series type.
 * @param {string=} opt_id Series id.
 * @param {number=} opt_startFieldIndex Index of number to start from.
 * @return {Object}
 */
anychart.chartEditor2Module.EditorModel.prototype.createSeriesConfig = function(index, type, opt_id, opt_startFieldIndex) {
  var config = {'ctor': type, 'mapping': {}};
  if (goog.isDef(opt_id))
    config['id'] = opt_id;

  var numbers = goog.array.clone(this.fieldsState_.numbers);
  if (this.model_['chart']['type']== 'map') {
    var self = this;
    numbers = goog.array.filter(numbers, function(item){
      return goog.array.indexOf(self.fieldsState_.coordinates, item) == -1;
    });
    this.fieldsState_.numbersCount -= 2;
  }

  //
  var fields = anychart.chartEditor2Module.EditorModel.series[type]['fields'];

  for (var i = 0; i < fields.length; i++) {
    if (fields[i]['field'] == 'id' && this.fieldsState_.geoId) {
      config['mapping'][fields[i]['field']] = this.fieldsState_.geoId;

    } else if (this.fieldsState_.coordinates && (fields[i]['field'] == 'lat' || fields[i]['field'] == 'long')) {
      config['mapping'][fields[i]['field']] = (fields[i]['field'] == 'lat') ?
          this.fieldsState_.coordinates[0] :
          this.fieldsState_.coordinates[1];

    } else {
      var j = index + i + (goog.isNumber(opt_startFieldIndex) ? opt_startFieldIndex : 0);
      var numberIndex = numbers.length > j ? j : j % numbers.length;
      config['mapping'][fields[i]['field']] = numbers[numberIndex];
    }
  }
  return config;
};


/**
 * Checks if current mapping are not compatible with new chart and series types.
 *
 * @param {string} prevChartType
 * @param {string} prevSeriesType
 * @return {boolean} true if mappings are not compatible.
 */
anychart.chartEditor2Module.EditorModel.prototype.needResetMappings = function(prevChartType, prevSeriesType) {
  if (goog.array.indexOf(anychart.chartEditor2Module.EditorModel.chartTypes[this.model_['chart']['type']]['series'], prevSeriesType) == -1)
    return true;

  return (prevChartType == 'stock' || this.model_['chart']['type'] == 'stock') ||
      (prevChartType == 'map' || this.model_['chart']['type'] == 'map') ||
      this.model_['chart']['type'] == 'pie';
};


/**
 * Checks if fields of two series types are compatible.
 *
 * @param {string} seriesType1
 * @param {string} seriesType2
 * @return {boolean} true if compatible
 */
anychart.chartEditor2Module.EditorModel.prototype.checkSeriesFieldsCompatible = function(seriesType1, seriesType2) {
  var fields1 = anychart.chartEditor2Module.EditorModel.series[seriesType1]['fields'];
  var fields2 = anychart.chartEditor2Module.EditorModel.series[seriesType2]['fields'];
  var compatible = true;
  if (fields1.length == fields2.length) {
    for (var i = fields1.length; i--;) {
      if (fields1[i]['field'] != fields2[i]['field']) {
        compatible = false;
        break;
      }
    }
  } else
    compatible = false;

  return compatible;
};
// endregion


// region Public and controls callback functions
/**
 *
 * @param {Object} chart
 * @param {boolean} rebuild
 */
anychart.chartEditor2Module.EditorModel.prototype.onChartDraw = function(chart, rebuild) {
  this.dispatchEvent({
    type: anychart.chartEditor2Module.events.EventType.CHART_DRAW,
    chart: chart,
    rebuild: rebuild
  });
};

/**
 * Calls callback function by unminified method name.
 * @param {string} methodName
 * @param {...*} var_args
 */
anychart.chartEditor2Module.EditorModel.prototype.callbackByString = function(methodName, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  this.callbacks_[methodName].apply(this, args);
};


/**
 * Drops all or some chart settings.
 * @param {string=} opt_pattern
 */
anychart.chartEditor2Module.EditorModel.prototype.dropChartSettings = function(opt_pattern) {
  if (goog.isDef(opt_pattern)) {
    for (var key in this.model_['chart']['settings']) {
      if (key.indexOf(opt_pattern) >= 0) {
        delete this.model_['chart']['settings'][key];
      }
    }
  } else
    this.model_['chart']['settings'] = {};
};


/**
 * Initializes default values for types selects.
 */
anychart.chartEditor2Module.EditorModel.prototype.onChangeView = function() {
  if (this.generateInitialMappingsOnChangeView_) {
    this.generateInitialMappingsOnChangeView_ = false;
    this.getPreparedData();

    if (this.preparedData_.length > 0) {
      this.dropChartSettings();

      this.chooseActiveAndField();
      this.chooseDefaultChartType();
      this.chooseDefaultSeriesType();
      this.createDefaultMappings();

      // Set default chart title by dataset title
      this.setValue([['chart'], ['settings'], 'title()'], this.data_[this.getActive()]['title']);
    } else {
      console.warn("NO DATA");
    }
  }
};


/**
 * Adds new plot default mapping.
 */
anychart.chartEditor2Module.EditorModel.prototype.addPlot = function() {
  var mapping = this.createPlotMapping();
  this.model_['dataSettings']['mappings'].push(mapping);
  this.dispatchUpdate();
};


/**
 * Drops plot mapping by index.
 * @param {number} index
 */
anychart.chartEditor2Module.EditorModel.prototype.dropPlot = function(index) {
  if (index > 0 && this.model_['dataSettings']['mappings'].length > index) {
    this.dropChartSettings('plot(');
    goog.array.splice(this.model_['dataSettings']['mappings'], index, 1);
    this.dispatchUpdate();
  }
};


/**
 * Adds new series default mapping.
 * @param {number} plotIndex
 */
anychart.chartEditor2Module.EditorModel.prototype.addSeries = function(plotIndex) {
  var mapping = this.createSeriesConfig(this.model_['dataSettings']['mappings'][plotIndex].length, /** @type {string} */(this.model_['chart']['seriesType']));
  this.model_['dataSettings']['mappings'][plotIndex].push(mapping);
  this.dispatchUpdate();
};


/**
 * Drops series mapping by plot and series index.
 * @param {number} plotIndex
 * @param {number} seriesIndex
 */
anychart.chartEditor2Module.EditorModel.prototype.dropSeries = function(plotIndex, seriesIndex) {
  if (this.model_['dataSettings']['mappings'].length > plotIndex && this.model_['dataSettings']['mappings'][plotIndex].length > seriesIndex) {
    var removedSeries = goog.array.splice(this.model_['dataSettings']['mappings'][plotIndex], seriesIndex, 1);
    this.dropChartSettings('getSeries(' + removedSeries[0]['id'] + ')');
    this.dispatchUpdate();
  }
};


/**
 * Callback function for change of active and field select.
 * @param {anychart.chartEditor2Module.controls.Select} input
 */
anychart.chartEditor2Module.EditorModel.prototype.setActiveAndField = function(input) {
  var field = /** @type {string} */(input.getValue());
  var active = /** @type {string} */(input.getValue2());

  this.suspendDispatch();

  if (active != this.model_['dataSettings']['active']) {
    this.dropChartSettings('getSeries');

    this.chooseActiveAndField(active, field);
    this.chooseDefaultChartType();
    this.chooseDefaultSeriesType();
    this.createDefaultMappings();

    this.dispatchUpdate();

  } else if (field != this.model_['dataSettings']['field']) {
    this.model_['dataSettings']['field'] = field;
    this.dispatchUpdate();
  }

  this.resumeDispatch();
};


/**
 * Callback function for change event of chart type select.
 * @param {anychart.chartEditor2Module.controls.Select} input
 */
anychart.chartEditor2Module.EditorModel.prototype.setChartType = function(input) {
  var prevChartType = /** @type {string} */(this.model_['chart']['type']);
  var prevDefaultSeriesType = /** @type {string} */(this.model_['chart']['seriesType']);
  this.model_['chart']['type']= /** @type {string} */(input.getValue());

  if (prevChartType == 'map') {
    delete this.data_[this.model_['dataSettings']['activeGeo']];
    this.model_['dataSettings']['activeGeo'] = null;
    this.preparedData_.length = 0;
  }

  if (this.needResetMappings(prevChartType, prevDefaultSeriesType)) {
    this.chooseActiveAndField(/** @type {string} */(this.model_['dataSettings']['active']));
    this.chooseDefaultSeriesType();
    this.createDefaultMappings();

  } else {
    // Update default series
    this.chooseDefaultSeriesType();

    for (var i = 0; i < this.model_['dataSettings']['mappings'].length; i++) {
      for (var j = 0; j < this.model_['dataSettings']['mappings'][i].length; j++) {
        var seriesConfig = this.model_['dataSettings']['mappings'][i][j];
        if (prevDefaultSeriesType == seriesConfig['ctor']) {
          if (this.checkSeriesFieldsCompatible(prevDefaultSeriesType, /** @type {string} */(this.model_['chart']['seriesType']))) {
            this.model_['dataSettings']['mappings'][i][j]['ctor'] = this.model_['chart']['seriesType'];
          }
        }
      }
    }
  }

  this.setStackMode(/** @type {string} */(input.getValue2()));

  this.dispatchUpdate();
};



/**
 * Updates stack mode setting in model.
 * @param {string=} opt_stackMode
 */
anychart.chartEditor2Module.EditorModel.prototype.setStackMode = function(opt_stackMode) {
  this.dropChartSettings("stackMode(");
  if (opt_stackMode) {
    if (this.model_['chart']['type'] != 'stock') {
      this.setValue([['chart'], ['settings'], 'yScale().stackMode()'], opt_stackMode, true);
    }
  }
};


/**
 * Callback function for change of series type select.
 * @param {anychart.chartEditor2Module.controls.Select} input
 */
anychart.chartEditor2Module.EditorModel.prototype.setSeriesType = function(input) {
  var key = input.getKey();
  var type = /** @type {string} */(input.getValue());
  var plotIndex = key[1][1]; // see SeriesPanel.getKey()
  var seriesIndex = key[2][0];

  if (this.model_['dataSettings']['mappings'][plotIndex][seriesIndex]['ctor'] != type) {
    var oldConfig = this.model_['dataSettings']['mappings'][plotIndex][seriesIndex];
    this.model_['dataSettings']['mappings'][plotIndex][seriesIndex] = this.createSeriesConfig(seriesIndex, type, oldConfig['id']);
    this.dispatchUpdate();
  }
};


/**
 * Callback function for change of theme select.
 * @param {anychart.chartEditor2Module.controls.Select} input
 */
anychart.chartEditor2Module.EditorModel.prototype.setTheme = function(input) {
  delete this.model_['chart']['settings']['palette()'];
  this.model_['anychart']['theme()'] = input.getValue();
  this.dispatchUpdate();
};
// endregion


// region Editor Model API function
/**
 * Setter for model's field state
 * @param {anychart.chartEditor2Module.EditorModel.Key} key
 * @param {*} value
 * @param {boolean=} opt_noDispatch
 * @param {boolean=} opt_noRebuild
 */
anychart.chartEditor2Module.EditorModel.prototype.setValue = function(key, value, opt_noDispatch, opt_noRebuild) {
  var target = this.model_;
  for (var i = 0; i < key.length; i++) {
    var level = key[i];
    if (goog.isArray(level)) {
      if (!goog.isDef(target[level[0]])) {
        if (level.length > 1)
          target[level[0]] = [];
        else
          target[level[0]] = {};
      }

      if (goog.isArray(target[level[0]]) && target[level[0]].length == level[1])
        target[level[0]].push({});

      target = goog.isArray(target[level[0]]) ? target[level[0]][level[1]] : target[level[0]];
    } else if (goog.isString(level) && target[String(level)] != value) {
      target[String(level)] = value;

      if (!opt_noDispatch)
        this.dispatchUpdate(opt_noRebuild);
    }
  }
};


/**
 * Getter for input's value
 * @param {anychart.chartEditor2Module.EditorModel.Key} key
 * @return {*} Input's value
 */
anychart.chartEditor2Module.EditorModel.prototype.getValue = function(key) {
  var target = this.model_;
  var level;

  for (var i = 0; i < key.length; i++) {
    level = key[i];
    if (i == key.length - 1) {
      // result
      if (goog.isArray(level))
        return target[level[0]][level[1]];
      else if (goog.isString(level))
        return target[level];

    } else {
      // drill down
      if (goog.isArray(level))
        target = goog.isArray(target[level[0]]) ? target[level[0]][level[1]] : target[level[0]];
      else if (goog.isString(level))
        target = target[level];

      if (!target)
        return void 0;
    }
  }
};


/**
 * @param {anychart.chartEditor2Module.EditorModel.Key} key
 */
anychart.chartEditor2Module.EditorModel.prototype.removeByKey = function(key) {
  var target = this.model_;
  var level;
  for (var i = 0; i < key.length; i++) {
    level = key[i];
    if (i == key.length - 1) {
      // remove
      if (goog.isArray(level)) {
        goog.array.splice(target[level[0]], level[1], 1);
      }
      else if (goog.isString(level)) {
        delete target[level];
      }

    } else {
      // drill down
      if (goog.isArray(level))
        target = goog.isArray(target[level[0]]) ? target[level[0]][level[1]] : target[level[0]];
      else if (goog.isString(level))
        target = target[level];

      if (!target)
        break;
    }
  }
  this.dispatchUpdate();
};


/**
 * @param {boolean=} opt_noRebuild
 */
anychart.chartEditor2Module.EditorModel.prototype.dispatchUpdate = function(opt_noRebuild) {
  if (this.suspendQueue_ > 0) {
    this.needDispatch_ = true;
    return;
  }

  // console.log(this.model_);

  this.dispatchEvent({
    type: anychart.chartEditor2Module.events.EventType.EDITOR_MODEL_UPDATE,
    rebuild: !opt_noRebuild
  });

  this.needDispatch_ = false;
};


/**
 * Suspends update model event dispatching on one step.
 */
anychart.chartEditor2Module.EditorModel.prototype.suspendDispatch = function() {
  this.suspendQueue_++;
};


/**
 * suspend queue minus one.
 */
anychart.chartEditor2Module.EditorModel.prototype.resumeDispatch = function() {
  this.suspendQueue_--;
  if (this.suspendQueue_ == 0 && this.needDispatch_)
    this.dispatchUpdate();
};


/**
 * Converts string to valid model key.
 * @param {anychart.chartEditor2Module.EditorModel.Key} key
 * @return {string} key as a string
 */
anychart.chartEditor2Module.EditorModel.getStringKey = function(key) {
  // var stringKey = '';

  // for (var i = 0; i < key.length; i++) {
  //   var level = key[i];
  //   if (i == 0 && goog.isArray(level) && (level[0] == 'anychart' || level[0] == 'chart')) continue;
  //
  //   if (goog.isArray(level))
  //     stringKey += level[0] + '(' + level[1] + ')';
  //   else if (goog.isString(level))
  //     stringKey += level;
  //
  //   if (i < key.length - 1)
  //     stringKey += '.';
  // }

  var result;
  if (goog.isArray(key)) {
    key = /** @type {Array} */(key);
    result = /** @type {string} */(key[key.length - 1]);
  }
  else
    result = String(key);

  return  result;
};


/**
 * @return {Object}
 */
anychart.chartEditor2Module.EditorModel.prototype.getModel = function() {
  return this.model_;
};
// endregion


// region Data Model
/**
 * @param {string} dataType
 * @param {string} setId
 * @return {string}
 */
anychart.chartEditor2Module.EditorModel.prototype.getFullId = function(dataType, setId) {
  return dataType + setId;
};


/**
 * Add data set to data container.
 * @param {Object} evt
 */
anychart.chartEditor2Module.EditorModel.prototype.addData = function(evt) {
  var id = this.getFullId(evt.dataType, evt.setId);
  if (!this.data_[id]) {
    this.data_[id] = {
      setFullId: id,
      type: evt.dataType,
      setId: evt.setId,
      title: evt.title,
      data: evt.data
    };
  }
  this.preparedData_.length = 0;

  this.generateInitialMappingsOnChangeView_ = true;
  // debug
  // this.onChangeView();

  if (evt.dataType == anychart.chartEditor2Module.EditorModel.dataType.GEO) {
    delete this.data_[this.model_['dataSettings']['activeGeo']];
    this.model_['dataSettings']['activeGeo'] = id;
    this.model_['dataSettings']['geoIdField'] = null;

    // Find geoIdField
    var rawData = this.getRawData(true);
    var dataRow = rawData['features'][0]['properties'];
    for (var i in dataRow) {
      if ((!this.model_['dataSettings']['geoIdField'] || i == 'id') && this.isGeoId_(dataRow[i])) {
        this.model_['dataSettings']['geoIdField'] = i;
      }
    }
  }

  this.dispatchUpdate();
};


/**
 * Removes data set from data container.
 * @param {string} setFullId
 */
anychart.chartEditor2Module.EditorModel.prototype.removeData = function(setFullId) {
  delete this.data_[setFullId];

  if (this.model_['dataSettings']['activeGeo'] && this.preparedData_.length == 2) {
    // Geo data should not be alone
    delete this.data_[this.model_['dataSettings']['activeGeo']];
    this.model_['dataSettings']['activeGeo'] = null;
  }

  this.preparedData_.length = 0;

  this.generateInitialMappingsOnChangeView_ = true;

  this.dispatchUpdate();
};


/**
 * @return {!Array.<string>}
 */
anychart.chartEditor2Module.EditorModel.prototype.getDataKeys = function() {
  return goog.object.getKeys(this.data_);
};


/**
 * @param {string=} opt_setFullId
 * @return {Array}
 */
anychart.chartEditor2Module.EditorModel.prototype.getPreparedData = function(opt_setFullId) {
  var data = !this.preparedData_.length ? this.prepareData_() : this.preparedData_;
  if (opt_setFullId) {
    data = goog.array.filter(data, function(item) {
      return item.setFullId == opt_setFullId;
    });
  }

  return data;
};


/**
 * @param {boolean=} opt_activeGeo
 * @return {?(Array.<*>|Object)}
 */
anychart.chartEditor2Module.EditorModel.prototype.getRawData = function(opt_activeGeo) {
  var dataSet = this.data_[opt_activeGeo ? this.getActiveGeo() : this.getActive()];
  return dataSet ? dataSet.data : null;
};


/**
 * Getter for active data set id.
 * @return {?string}
 */
anychart.chartEditor2Module.EditorModel.prototype.getActive = function() {
  return this.model_['dataSettings']['active'];
};


/**
 * Getter for active geo data set id.
 * @return {?string}
 */
anychart.chartEditor2Module.EditorModel.prototype.getActiveGeo = function() {
  return this.model_['dataSettings']['activeGeo'];
};


/**
 * Getter for count of data sets.
 * @return {number}
 */
anychart.chartEditor2Module.EditorModel.prototype.getDataSetsCount = function() {
  return this.getPreparedData().length;
};


/**
 * Getter for geo id field.
 * @return {?string}
 */
anychart.chartEditor2Module.EditorModel.prototype.getGeoIdField = function() {
  return this.model_['dataSettings']['geoIdField'];
};


/**
 * @return {Array}
 * @private
 */
anychart.chartEditor2Module.EditorModel.prototype.prepareData_ = function() {
  var joinedSets = [];
  var singleSets = [];
  var geoSets = [];
  var dataSet;

  for (var i in this.data_) {
    if (this.data_.hasOwnProperty(i)) {
      dataSet = this.prepareDataSet_(this.data_[i]);

      var joined = false;
      if (dataSet.join) {
        /*
         * todo: process join
         */
        joined = true;
      }

      if (joined) {
        dataSet.title = 'Joined set ' + (joinedSets.length + 1);
        joinedSets.push(dataSet);
      } else if (dataSet.type == anychart.chartEditor2Module.EditorModel.dataType.GEO) {
        geoSets.push(dataSet);
      } else {
        dataSet.title = dataSet.title ? dataSet.title : 'Data set ' + (singleSets.length + 1);
        singleSets.push(dataSet);
      }
    }
  }

  this.preparedData_ = goog.array.concat(joinedSets, singleSets, geoSets);

  return this.preparedData_;
};


/**
 * @param {Object} dataSet
 * @return {Object}
 * @private
 */
anychart.chartEditor2Module.EditorModel.prototype.prepareDataSet_ = function(dataSet) {
  var result = {
    type: dataSet.type,
    setId: dataSet.setId,
    setFullId: dataSet.setFullId,
    title: dataSet.title
  };

  var row = dataSet.type == anychart.chartEditor2Module.EditorModel.dataType.GEO ?
      dataSet.data['features'][0]['properties'] :
      dataSet.data[0];

  var settings = new goog.format.JsonPrettyPrinter.SafeHtmlDelimiters();
  settings.lineBreak = '';
  settings.objectStart = '\n{';
  settings.arrayStart = '\n[';
  settings.space = '';
  settings.propertySeparator = ', ';
  settings.nameValueSeparator = ': ';

  var f = new goog.format.JsonPrettyPrinter(settings);
  result.sample = f.format(row);

  var fields = [];
  var i;
  var field;

  for (i in row) {
    field = {
      name: goog.isArray(row) ? 'Field ' + i : i,
      type: typeof(row[i]),
      key: i
    };
    fields.push(field);
  }
  result.fields = fields;

  return result;
};
// endregion


/**
 * Is string looks like geo id string.
 *
 * @param {string} value
 * @return {boolean}
 * @private
 */
anychart.chartEditor2Module.EditorModel.prototype.isGeoId_ = function(value) {
  var pattern = /^[A-z]{2,3}([\W_]([A-z]{2}|\d+))?$/;
  return Boolean(new RegExp(pattern).exec(value));
};
