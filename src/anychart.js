/**
 * @fileoverview anychart namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart');
goog.provide('anychart.gauges');
goog.provide('anychart.globalLock');
goog.require('acgraph');
goog.require('anychart.base');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.StageCredits');
goog.require('anychart.performance');
goog.require('anychart.standalones');
goog.require('anychart.standalones.axes');
goog.require('anychart.standalones.axisMarkers');
goog.require('anychart.standalones.grids');
goog.require('anychart.themes.merging');
goog.require('anychart.ui');
goog.require('anychart.utils');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.animationFrame.polyfill');
goog.require('goog.events.KeyEvent');
goog.require('goog.events.KeyHandler');
goog.require('goog.json.hybrid');

goog.forwardDeclare('anychart.core.Chart');

/**
 * Core space for all anychart components.
 * @namespace
 * @name anychart
 */


//----------------------------------------------------------------------------------------------------------------------
//
//  Graphics engine
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drawing core namespace.
 * @namespace
 * @name anychart.graphics
 */
anychart.graphics = goog.global['acgraph'];


/**
 * If the credits is allowed to be disabled for the stage regardless of the product key.
 * @type {boolean}
 */
acgraph.vector.Stage.prototype.allowCreditsDisabling = false;


/**
 * Tooltip container layer.
 * @type {acgraph.vector.Layer}
 * @private
 */
acgraph.vector.Stage.prototype.tooltipLayer_ = null;


/**
 * Stage credits.
 * @param {(Object|boolean|null)=} opt_value .
 * @return {!(acgraph.vector.Stage|anychart.core.ui.StageCredits)}
 */
acgraph.vector.Stage.prototype.credits = function(opt_value) {
  if (!this.credits_) {
    this.credits_ = new anychart.core.ui.StageCredits(this, this.allowCreditsDisabling);
    this.credits_.setup(anychart.getFullTheme('stageCredits'));
  }
  if (goog.isDef(opt_value)) {
    this.credits_.setup(opt_value);
    return this;
  }
  return this.credits_;
};


/**
 * Getter for tooltip layer. Must be to highest layer to display the tooltip in top of all.
 * @return {!acgraph.vector.Layer}
 */
acgraph.vector.Stage.prototype.getTooltipLayer = function() {
  if (!this.tooltipLayer_) {
    this.tooltipLayer_ = this.layer();
    this.tooltipLayer_.zIndex(1e10);
  }
  return this.tooltipLayer_;
};


// /**
//  * Original render function from the graphics stage.
//  * @type {Function}
//  * @private
//  */
// acgraph.vector.Stage.prototype.originalRender_ = acgraph.vector.Stage.prototype.renderInternal;
//
//
// /**
//  * Render internal override.
//  */
// acgraph.vector.Stage.prototype.renderInternal = function() {
//   this.originalRender_();
//   this.credits().render();
// };


/**
 Sets and returns an address export server script, which is used to export to an image
 or PDF.
 @see acgraph.vector.Stage#saveAsPdf
 @see acgraph.vector.Stage#saveAsPng
 @see acgraph.vector.Stage#saveAsJpg
 @see acgraph.vector.Stage#saveAsSvg
 @param {string=} opt_address Export server script URL.
 @return {string} Export server script URL.
 @deprecated Since 7.10.1. Use anychart.exports.server() instead.
 */
anychart.server = function(opt_address) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.server()', 'anychart.exports.server()', null, 'Function'], true);
  return anychart.exports.server(opt_address);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Global lock
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * If the globalLock is locked.
 * @type {number}
 */
anychart.globalLock.locked = 0;


/**
 * An array of subscribers for the globalLock free.
 * @type {!Array.<Function>}
 */
anychart.globalLock.subscribers = [];


/**
 * Locks the globalLock. You should then free the lock. The lock should be freed the same number of times that it
 * was locked.
 */
anychart.globalLock.lock = function() {
  anychart.globalLock.locked++;
};


/**
 * Registers a callback for the globalLock free.
 * @param {!Function} handler Handler function.
 * @param {Object=} opt_context Handler context.
 */
anychart.globalLock.onUnlock = function(handler, opt_context) {
  if (anychart.globalLock.locked) {
    anychart.globalLock.subscribers.push(goog.bind(handler, opt_context));
  } else {
    handler.apply(opt_context);
  }
};


/**
 * Frees the lock and fires unlock callbacks if it was the last free.
 */
anychart.globalLock.unlock = function() {
  anychart.globalLock.locked--;
  if (!anychart.globalLock.locked) {
    var arr = anychart.globalLock.subscribers.slice(0);
    anychart.globalLock.subscribers.length = 0;
    for (var i = 0; i < arr.length; i++) {
      arr[i]();
    }
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  JSON
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @type {Object}
 */
anychart.chartTypesMap = {};


/**
 * @type {Object}
 */
anychart.gaugeTypesMap = {};


/**
 * @type {Object}
 */
anychart.mapTypesMap = {};


/**
 * @type {Object}
 */
anychart.ganttTypesMap = {};


/**
 * @param {string} type
 * @return {anychart.core.Chart}
 */
anychart.createChartByType = function(type) {
  var cls = anychart.chartTypesMap[type];
  if (cls) {
    return /** @type {anychart.core.Chart} */(cls());
  } else {
    throw 'Unknown chart type: ' + type + '\nProbably it is in some other module, see module list for details.';
  }
};


/**
 * @param {string} type
 * @return {anychart.core.Chart}
 */
anychart.createGaugeByType = function(type) {
  var cls = anychart.gaugeTypesMap[type];
  if (cls) {
    return /** @type {anychart.core.Chart} */(cls());
  } else {
    throw 'Unknown gauge type: ' + type + '\nProbably it is in some other module, see module list for details.';
  }
};


/**
 * @param {string} type
 * @return {anychart.core.Chart}
 */
anychart.createMapByType = function(type) {
  var cls = anychart.mapTypesMap[type];
  if (cls) {
    return /** @type {anychart.core.Chart} */(cls());
  } else {
    throw 'Unknown map type: ' + type + '\nProbably it is in some other module, see module list for details.';
  }
};


/**
 * @param {string} type
 * @return {anychart.core.Chart}
 */
anychart.createGanttByType = function(type) {
  var cls = anychart.ganttTypesMap[type];
  if (cls) {
    return /** @type {anychart.core.Chart} */(cls());
  } else {
    throw 'Unknown gantt type: ' + type + '\nProbably it is in some other module, see module list for details.';
  }
};


/**
 * Creates an element by JSON config.
 * @example
 *  var json = {
 *    "chart": {
 *      "type": "pie",
 *      "data": [
 *        ["Product A", 1222],
 *        ["Product B", 2431],
 *        ["Product C", 3624]
 *      ]
 *    }
 *  };
 * var chart = anychart.fromJson(json);
 * chart.container('container').draw();
 * @param {(Object|string)} jsonConfig Config.
 * @return {*} Element created by config.
 */
anychart.fromJson = function(jsonConfig) {
  /**
   * Parsed json config.
   * @type {Object}
   */
  var json;
  if (goog.isString(jsonConfig)) {
    json = goog.json.hybrid.parse(jsonConfig);
  } else if (goog.isObject(jsonConfig) && !goog.isFunction(jsonConfig)) {
    json = jsonConfig;
  }

  var instance = null;

  if (json) {
    var chart = json['chart'];
    var gauge = json['gauge'];
    var gantt = json['gantt'];
    var map = json['map'];
    if (chart)
      instance = anychart.createChartByType(chart['type']);
    else if (gauge)
      instance = anychart.createGaugeByType(gauge['type']);
    else if (gantt) {
      if (gantt['type'] == 'project') //legacy
        gantt['type'] = anychart.enums.ChartTypes.GANTT_PROJECT;
      else if (gantt['type'] == 'resource')
        gantt['type'] = anychart.enums.ChartTypes.GANTT_RESOURCE;
      instance = anychart.createGanttByType(gantt['type']);
    } else if (map)
      instance = anychart.createMapByType(map['type']);
  }

  if (instance)
    instance.setupByVal(chart || gauge || gantt || map);
  else
    anychart.core.reporting.error(anychart.enums.ErrorCode.EMPTY_CONFIG);

  return instance;
};


/**
 * Creates an element by XML config.
 * @example
 * var xmlString = '<xml>' +
 *   '<chart type="pie" >' +
 *     '<data>' +
 *       '<point name="Product A" value="1222"/>' +
 *       '<point name="Product B" value="2431"/>' +
 *       '<point name="Product C" value="3624"/>' +
 *       '<point name="Product D" value="5243"/>' +
 *       '<point name="Product E" value="8813"/>' +
 *     '</data>' +
 *   '</chart>' +
 * '</xml>';
 * var chart = anychart.fromXml(xmlString);
 * chart.container('container').draw();
 * @param {string|Node} xmlConfig Config.
 * @return {*} Element created by config.
 */
anychart.fromXml = function(xmlConfig) {
  return anychart.fromJson(anychart.utils.xml2json(xmlConfig));
};
//----------------------------------------------------------------------------------------------------------------------
//
//  Default font settings
//
//----------------------------------------------------------------------------------------------------------------------
goog.global['anychart'] = goog.global['anychart'] || {};


/**
 * Default value for the font size.
 * @type {string|number}
 *
 */
//goog.global['anychart']['fontSize'] = '12px';
goog.global['anychart']['fontSize'] = '13px';


/**
 * Default value for the font color.
 * @type {string}
 *
 */
//goog.global['anychart']['fontColor'] = '#000';
goog.global['anychart']['fontColor'] = '#7c868e'; //colorAxisFont


/**
 * Default value for the font style.
 * @type {string}
 *
 */
//goog.global['anychart']['fontFamily'] = 'Arial';
goog.global['anychart']['fontFamily'] = "'Verdana', Helvetica, Arial, sans-serif";


/**
 * Default value for the text direction. Text direction may be left-to-right or right-to-left.
 * @type {string}
 *
 */
goog.global['anychart']['textDirection'] = acgraph.vector.Text.Direction.LTR;
//endregion


//----------------------------------------------------------------------------------------------------------------------
//
//  Document load event.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @type {Array.<Array>}
 * @private
 */
anychart.documentLoadCallbacks_;


/**
 * Add callback for the document load event.<br/>
 * It is fired when the entire page loads, including its content (images, css, scripts, etc.).
 * @param {Function} func Function which will be called on document load event.
 * @param {*=} opt_scope Function call context.
 */
anychart.onDocumentLoad = function(func, opt_scope) {
  if (!anychart.documentLoadCallbacks_) {
    anychart.documentLoadCallbacks_ = [];
  }
  anychart.documentLoadCallbacks_.push([func, opt_scope]);

  goog.events.listen(goog.global, goog.events.EventType.LOAD, function() {
    for (var i = 0, count = anychart.documentLoadCallbacks_.length; i < count; i++) {
      var item = anychart.documentLoadCallbacks_[i];
      item[0].apply(item[1]);
    }
    anychart.documentLoadCallbacks_.length = 0;
  });
};


/**
 * Attaching DOM load events.
 * @private
 */
anychart.attachDomEvents_ = function() {
  var window = goog.global;
  var document = window['document'];

  // goog.events.EventType.DOMCONTENTLOADED - for browsers that support DOMContentLoaded event. IE9+
  // goog.events.EventType.READYSTATECHANGE - for IE9-
  acgraph.events.listen(document, [goog.events.EventType.DOMCONTENTLOADED, goog.events.EventType.READYSTATECHANGE], anychart.completed_, false);

  // A fallback to window.onload that will always work
  acgraph.events.listen(/** @type {EventTarget}*/ (window), goog.events.EventType.LOAD, anychart.completed_, false);
};


/**
 * Detaching DOM load events.
 * @private
 */
anychart.detachDomEvents_ = function() {
  var window = goog.global;
  var document = window['document'];

  acgraph.events.unlisten(document, [goog.events.EventType.DOMCONTENTLOADED, goog.events.EventType.READYSTATECHANGE], anychart.completed_, false);
  acgraph.events.unlisten(/** @type {EventTarget}*/ (window), goog.events.EventType.LOAD, anychart.completed_, false);
};


/**
 * Function called when one of [ DOMContentLoad , onreadystatechanged ] events fired on document or onload on window.
 * @param {goog.events.Event} event Event object.
 * @private
 */
anychart.completed_ = function(event) {
  var document = goog.global['document'];
  // readyState === "complete" is good enough for us to call the dom ready in oldIE
  if (document.addEventListener || window['event']['type'] === 'load' || document['readyState'] === 'complete') {
    anychart.detachDomEvents_();
    anychart.ready_(event);
  }
};


/**
 * Identifies that document is loaded.
 * @type {boolean}
 * @private
 */
anychart.isReady_ = false;


/**
 * Function called when document content loaded.
 * @private
 * @param {goog.events.Event} event Event object.
 * @return {*} Nothing if document already loaded or timeoutID.
 */
anychart.ready_ = function(event) {
  if (anychart.isReady_) {
    return;
  }

  var document = goog.global['document'];

  // Make sure the document body at least exists in case IE gets a little overzealous (ticket #5443).
  if (!document['body']) {
    return setTimeout(function() {
      anychart.ready_(event);
    }, 1);
  }

  anychart.isReady_ = true;

  for (var i = 0, count = anychart.documentReadyCallbacks_.length; i < count; i++) {
    var item = anychart.documentReadyCallbacks_[i];
    item[0].apply(item[1], [event]);
  }
};


/**
 * Add callback for document ready event.<br/>
 * It is called when the DOM is ready, this can happen prior to images and other external content is loaded.
 * @example <t>lineChart</t>
 * chart.spline([1.1, 1.4, 1.2, 1.9]);
 * @param {Function} func Function which will called on document load event.
 * @param {*=} opt_scope Function call context.
 */
anychart.onDocumentReady = function(func, opt_scope) {
  if (anychart.isReady_) {
    func.call(opt_scope);
  }

  if (!anychart.documentReadyCallbacks_) {
    anychart.documentReadyCallbacks_ = [];
  }
  anychart.documentReadyCallbacks_.push([func, opt_scope]);

  var document = goog.global['document'];

  if (document['readyState'] === 'complete') {
    setTimeout(anychart.ready_, 1);
  } else {
    anychart.attachDomEvents_();
  }
};


/**
 * License key.
 * @type {?string}
 * @private
 */
anychart.licenseKey_ = null;


/**
 * Setter for AnyChart license key.<br/>
 * To purchase a license proceed to <a href="http://www.anychart.com/buy/">Buy AnyChart</a> page.
 * @example
 * anychart.licenseKey('YOUR-LICENSE-KEY');
 * var chart = anychart.pie([1, 2, 3]);
 * chart.container(stage).draw();
 * @param {string=} opt_value Your licence key.
 * @return {?string} Current licence key.
 */
anychart.licenseKey = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.licenseKey_ = opt_value;
  }
  return anychart.licenseKey_;
};


/**
 * Method to get hash from string.
 * @return {boolean} Is key valid.
 */
anychart.isValidKey = function() {
  if (!goog.isDefAndNotNull(anychart.licenseKey_) || !goog.isString(anychart.licenseKey_)) return false;
  var lio = anychart.licenseKey_.lastIndexOf('-');
  var value = anychart.licenseKey_.substr(0, lio);
  var hashToCheck = anychart.licenseKey_.substr(lio + 1);
  return (hashToCheck == anychart.utils.crc32(value + anychart.utils.getSalt()));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Themes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Array of themes that will be applied for anychart globally.
 * @type {Array<string|Object>}
 * @private
 */
anychart.themes_ = [];


/**
 * Clones of themes, where i-th clone corresponds to (i-1)-th theme and 0 clone is a default theme clone.
 * @type {Array.<!Object>}
 * @private
 */
anychart.themeClones_ = [];


/**
 * Merged clones of themes.
 * @type {Array.<!Object>}
 * @private
 */
anychart.mergedThemeClones_ = [];


/**
 * Sets the theme/themes for anychart globally or gets current theme/themes.
 * @param {?(string|Object|Array<string|Object>)=} opt_value Object/name of a theme or array of objects/names of the themes.
 * @return {string|Object|Array<string|Object>}
 */
anychart.theme = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.themes_ = opt_value ? (goog.isArray(opt_value) ? opt_value : [opt_value]) : [];
    anychart.themeClones_.length = 0;
    anychart.mergedThemeClones_.length = 0;
    anychart.themes.merging.clearCache();
  }
  return anychart.themes_;
};


/**
 * Append theme for anychart globally.
 * @param {string|Object} value
 */
anychart.appendTheme = function(value) {
  anychart.themes_.push(value);
};


/**
 * Returns final compiled and merged theme. Pass root name to compile the theme
 * partially.
 * @param {string} root
 * @return {*}
 */
anychart.getFullTheme = function(root) {
  anychart.performance.start('Theme compilation');
  var i;
  if (!anychart.themeClones_.length) {
    anychart.themeClones_.push(goog.global['anychart']['themes'][anychart.DEFAULT_THEME] || {});
    anychart.mergedThemeClones_.push(anychart.themeClones_[0]);
  }
  for (i = anychart.themeClones_.length - 1; i < anychart.themes_.length; i++) {
    var themeToMerge = anychart.themes_[i];
    var clone = anychart.utils.recursiveClone(goog.isString(themeToMerge) ? goog.global['anychart']['themes'][themeToMerge] : themeToMerge);
    anychart.themeClones_.push(goog.isObject(clone) ? clone : {});
    anychart.mergedThemeClones_.push({});
  }

  var startMergeAt = Infinity;
  for (i = 0; i < anychart.themeClones_.length; i++) {
    if (anychart.themes.merging.compileTheme(anychart.themeClones_[i], root, i))
      startMergeAt = Math.min(startMergeAt, i);
  }

  for (i = Math.max(1, startMergeAt); i < anychart.mergedThemeClones_.length; i++) {
    var rootParts = root.split('.');
    anychart.themes.merging.setThemePart(
        anychart.mergedThemeClones_[i],
        [rootParts[0]],
        anychart.themes.merging.merge(
            anychart.utils.recursiveClone(anychart.themes.merging.getThemePart(anychart.themeClones_[i], rootParts[0])),
            anychart.themes.merging.getThemePart(anychart.mergedThemeClones_[i - 1], rootParts[0])));

    anychart.themes.merging.markMergedDescriptor(root, i);
  }
  anychart.performance.end('Theme compilation');

  return anychart.themes.merging.getThemePart(anychart.mergedThemeClones_[anychart.mergedThemeClones_.length - 1], root);
};


// we execute it here to move load from first chart drawing to library initialization phase.
// setTimeout(anychart.getFullTheme, 0);


//region --- Patches for missing features
//------------------------------------------------------------------------------
//
//  Patches for missing features
//
//------------------------------------------------------------------------------
/**
 * Creates error reporter for NO_FEATURE_IN_MODULE.
 * @param {string} featureName
 * @return {!Function}
 */
anychart.createNFIMError = function(featureName) {
  return function() {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [featureName]);
  };
};


/**
 * @param {string} modulePath
 * @param {string} error
 * @return {!Function}
 */
anychart.getFeatureOrError = function(modulePath, error) {
  var path = modulePath.split('.');
  var target = window;
  for (var i = 0; i < path.length; i++) {
    target = target[path[i]];
    if (!target) return anychart.createNFIMError(error);
  }
  return /** @type {!Function} */(target);
};


/** @ignoreDoc */
anychart.area = anychart.getFeatureOrError('anychart.area', 'Area chart');


/** @ignoreDoc */
anychart.area3d = anychart.getFeatureOrError('anychart.area3d', '3D Area chart');


/** @ignoreDoc */
anychart.bar = anychart.getFeatureOrError('anychart.bar', 'Bar chart');


/** @ignoreDoc */
anychart.vertical = anychart.getFeatureOrError('anychart.vertical', 'Bar chart');


/** @ignoreDoc */
anychart.bar3d = anychart.getFeatureOrError('anychart.bar3d', '3D Bar chart');


/** @ignoreDoc */
anychart.bubble = anychart.getFeatureOrError('anychart.bubble', 'Bubble chart');


/** @ignoreDoc */
anychart.bullet = anychart.getFeatureOrError('anychart.bullet', 'Bullet chart');


/** @ignoreDoc */
anychart.cartesian = anychart.getFeatureOrError('anychart.cartesian', 'Cartesian chart');


/** @ignoreDoc */
anychart.cartesian3d = anychart.getFeatureOrError('anychart.cartesian3d', '3D Cartesian chart');


/** @ignoreDoc */
anychart.scatter = anychart.getFeatureOrError('anychart.scatter', 'Scatter chart');


/** @ignoreDoc */
anychart.column = anychart.getFeatureOrError('anychart.column', 'Column chart');


/** @ignoreDoc */
anychart.column3d = anychart.getFeatureOrError('anychart.column3d', '3D Column chart');


/** @ignoreDoc */
anychart.box = anychart.getFeatureOrError('anychart.box', 'Box chart');


/** @ignoreDoc */
anychart.financial = anychart.getFeatureOrError('anychart.financial', 'Financial chart');


/** @ignoreDoc */
anychart.funnel = anychart.getFeatureOrError('anychart.funnel', 'Funnel chart');


/** @ignoreDoc */
anychart.line = anychart.getFeatureOrError('anychart.line', 'Line chart');


/** @ignoreDoc */
anychart.verticalLine = anychart.getFeatureOrError('anychart.verticalLine', 'Vertical Line chart');


/** @ignoreDoc */
anychart.verticalArea = anychart.getFeatureOrError('anychart.verticalArea', 'Vertical Area chart');


/** @ignoreDoc */
anychart.marker = anychart.getFeatureOrError('anychart.marker', 'Marker chart');


/** @ignoreDoc */
anychart.pie = anychart.getFeatureOrError('anychart.pie', 'Pie chart');


/** @ignoreDoc */
anychart.pie3d = anychart.getFeatureOrError('anychart.pie3d', '3D Pie chart');


/** @ignoreDoc */
anychart.pyramid = anychart.getFeatureOrError('anychart.pyramid', 'Pyramid chart');


/** @ignoreDoc */
anychart.radar = anychart.getFeatureOrError('anychart.radar', 'Radar chart');


/** @ignoreDoc */
anychart.polar = anychart.getFeatureOrError('anychart.polar', 'Polar chart');


/** @ignoreDoc */
anychart.sparkline = anychart.getFeatureOrError('anychart.sparkline', 'Sparkline chart');


/** @ignoreDoc */
anychart.heatMap = anychart.getFeatureOrError('anychart.heatMap', 'HeatMap chart');


/** @ignoreDoc */
anychart.circularGauge = anychart.getFeatureOrError('anychart.circularGauge', 'Circular gauge');


/** @ignoreDoc */
anychart.gauges.circular = anychart.getFeatureOrError('anychart.gauges.circular', 'Circular gauge');


/** @ignoreDoc */
anychart.gauges.linear = anychart.getFeatureOrError('anychart.gauges.linear', 'Linear gauge');


/** @ignoreDoc */
anychart.gauges.tank = anychart.getFeatureOrError('anychart.gauges.tank', 'Tank gauge');


/** @ignoreDoc */
anychart.gauges.thermometer = anychart.getFeatureOrError('anychart.gauges.thermometer', 'Thermometer gauge');


/** @ignoreDoc */
anychart.gauges.led = anychart.getFeatureOrError('anychart.gauges.led', 'LED gauge');


/** @ignoreDoc */
anychart.map = anychart.getFeatureOrError('anychart.map', 'Map');


/** @ignoreDoc */
anychart.choropleth = anychart.getFeatureOrError('anychart.choropleth', 'Choropleth map');


/** @ignoreDoc */
anychart.bubbleMap = anychart.getFeatureOrError('anychart.bubbleMap', 'Bubble map');


/** @ignoreDoc */
anychart.connector = anychart.getFeatureOrError('anychart.connector', 'Connector map');


/** @ignoreDoc */
anychart.markerMap = anychart.getFeatureOrError('anychart.markerMap', 'Marker map');


/** @ignoreDoc */
anychart.seatMap = anychart.getFeatureOrError('anychart.seatMap', 'Seat map');


/** @ignoreDoc */
anychart.ganttProject = anychart.getFeatureOrError('anychart.ganttProject', 'Gantt Project chart');


/** @ignoreDoc */
anychart.ganttResource = anychart.getFeatureOrError('anychart.ganttResource', 'Gantt Resource chart');


/** @ignoreDoc */
anychart.stock = anychart.getFeatureOrError('anychart.stock', 'Stock chart');


/** @ignoreDoc */
anychart.toolbar = anychart.getFeatureOrError('anychart.toolbar', 'Toolbar');


/** @ignoreDoc */
anychart.ganttToolbar = anychart.getFeatureOrError('anychart.ganttToolbar', 'Gantt toolbar');


/** @ignoreDoc */
anychart.treeMap = anychart.getFeatureOrError('anychart.treeMap', 'TreeMap chart');


/** @inheritDoc */
anychart.pareto = anychart.getFeatureOrError('anychart.pareto', 'Pareto chart');


/** @inheritDoc */
anychart.resource = anychart.getFeatureOrError('anychart.resource', 'Resource chart');


//region ------ Standalones
/** @ignoreDoc */
anychart.standalones.background = anychart.getFeatureOrError('anychart.standalones.background', 'anychart.standalones.Background');


/** @ignoreDoc */
anychart.ui.background = anychart.getFeatureOrError('anychart.ui.background', 'anychart.ui.Background');


/** @ignoreDoc */
anychart.standalones.colorRange = anychart.getFeatureOrError('anychart.standalones.colorRange', 'anychart.standalones.ColorRange');


/** @ignoreDoc */
anychart.ui.colorRange = anychart.getFeatureOrError('anychart.ui.colorRange', 'anychart.ui.ColorRange');


/** @ignoreDoc */
anychart.standalones.dataGrid = anychart.getFeatureOrError('anychart.standalones.dataGrid', 'anychart.standalones.DataGrid');


/** @ignoreDoc */
anychart.ui.dataGrid = anychart.getFeatureOrError('anychart.ui.dataGrid', 'anychart.ui.DataGrid');


/** @ignoreDoc */
anychart.standalones.label = anychart.getFeatureOrError('anychart.standalones.label', 'anychart.standalones.Label');


/** @ignoreDoc */
anychart.ui.label = anychart.getFeatureOrError('anychart.ui.label', 'anychart.ui.Label');


/** @ignoreDoc */
anychart.standalones.labelsFactory = anychart.getFeatureOrError('anychart.standalones.labelsFactory', 'anychart.standalones.LabelsFactory');


/** @ignoreDoc */
anychart.ui.labelsFactory = anychart.getFeatureOrError('anychart.ui.labelsFactory', 'anychart.ui.LabelsFactory');


/** @ignoreDoc */
anychart.standalones.legend = anychart.getFeatureOrError('anychart.standalones.legend', 'anychart.standalones.Legend');


/** @ignoreDoc */
anychart.ui.legend = anychart.getFeatureOrError('anychart.ui.legend', 'anychart.ui.Legend');


/** @ignoreDoc */
anychart.standalones.markersFactory = anychart.getFeatureOrError('anychart.standalones.markersFactory', 'anychart.standalones.MarkersFactory');


/** @ignoreDoc */
anychart.ui.markersFactory = anychart.getFeatureOrError('anychart.ui.markersFactory', 'anychart.ui.MarkersFactory');


/** @ignoreDoc */
anychart.standalones.projectTimeline = anychart.getFeatureOrError('anychart.standalones.projectTimeline', 'anychart.standalones.ProjectTimeline');


/** @ignoreDoc */
anychart.ui.projectTimeline = anychart.getFeatureOrError('anychart.ui.projectTimeline', 'anychart.ui.ProjectTimeline');


/** @ignoreDoc */
anychart.standalones.resourceTimeline = anychart.getFeatureOrError('anychart.standalones.resourceTimeline', 'anychart.standalones.ResourceTimeline');


/** @ignoreDoc */
anychart.ui.resourceTimeline = anychart.getFeatureOrError('anychart.ui.resourceTimeline', 'anychart.ui.ResourceTimeline');


/** @ignoreDoc */
anychart.standalones.resourceList = anychart.getFeatureOrError('anychart.standalones.resourceList', 'anychart.standalones.ResourceList');


/** @ignoreDoc */
anychart.standalones.scroller = anychart.getFeatureOrError('anychart.standalones.scroller', 'anychart.standalones.scroller');


/** @ignoreDoc */
anychart.ui.scroller = anychart.getFeatureOrError('anychart.ui.scroller', 'anychart.ui.Scroller');


/** @ignoreDoc */
anychart.standalones.table = anychart.getFeatureOrError('anychart.standalones.table', 'anychart.standalones.Table');


/** @ignoreDoc */
anychart.ui.table = anychart.getFeatureOrError('anychart.ui.table', 'anychart.ui.Table');


/** @ignoreDoc */
anychart.standalones.title = anychart.getFeatureOrError('anychart.standalones.title', 'anychart.standalones.Title');


/** @ignoreDoc */
anychart.ui.title = anychart.getFeatureOrError('anychart.ui.title', 'anychart.ui.Title');


/** @ignoreDoc */
anychart.standalones.axes.linear = anychart.getFeatureOrError('anychart.standalones.axes.linear', 'anychart.standalones.axes.Linear');


/** @ignoreDoc */
anychart.standalones.axes.polar = anychart.getFeatureOrError('anychart.standalones.axes.polar', 'anychart.standalones.axes.Polar');


/** @ignoreDoc */
anychart.standalones.axes.radar = anychart.getFeatureOrError('anychart.standalones.axes.radar', 'anychart.standalones.axes.Radar');


/** @ignoreDoc */
anychart.standalones.axes.radial = anychart.getFeatureOrError('anychart.standalones.axes.radial', 'anychart.standalones.axes.Radial');


/** @ignoreDoc */
anychart.axes.linear = anychart.getFeatureOrError('anychart.axes.linear', 'anychart.axes.Linear');


/** @ignoreDoc */
anychart.axes.polar = anychart.getFeatureOrError('anychart.axes.polar', 'anychart.axes.Polar');


/** @ignoreDoc */
anychart.axes.radar = anychart.getFeatureOrError('anychart.axes.radar', 'anychart.axes.Radar');


/** @ignoreDoc */
anychart.axes.radial = anychart.getFeatureOrError('anychart.axes.radial', 'anychart.axes.Radial');


/** @ignoreDoc */
anychart.axisMarkers.line = anychart.getFeatureOrError('anychart.axisMarkers.line', 'anychart.axisMarkers.Line');


/** @ignoreDoc */
anychart.axisMarkers.range = anychart.getFeatureOrError('anychart.axisMarkers.range', 'anychart.axisMarkers.Range');


/** @ignoreDoc */
anychart.axisMarkers.text = anychart.getFeatureOrError('anychart.axisMarkers.text', 'anychart.axisMarkers.Text');


/** @ignoreDoc */
anychart.standalones.axisMarkers.line = anychart.getFeatureOrError('anychart.standalones.axisMarkers.line', 'anychart.standalones.axisMarkers.Line');


/** @ignoreDoc */
anychart.standalones.axisMarkers.range = anychart.getFeatureOrError('anychart.standalones.axisMarkers.range', 'anychart.standalones.axisMarkers.Range');


/** @ignoreDoc */
anychart.standalones.axisMarkers.text = anychart.getFeatureOrError('anychart.standalones.axisMarkers.text', 'anychart.standalones.axisMarkers.Text');


/** @ignoreDoc */
anychart.grids.linear = anychart.getFeatureOrError('anychart.grids.linear', 'anychart.grids.Linear');


/** @ignoreDoc */
anychart.grids.linear3d = anychart.getFeatureOrError('anychart.grids.linear3d', 'anychart.grids.Linear3d');


/** @ignoreDoc */
anychart.grids.polar = anychart.getFeatureOrError('anychart.grids.polar', 'anychart.grids.Polar');


/** @ignoreDoc */
anychart.grids.radar = anychart.getFeatureOrError('anychart.grids.radar', 'anychart.grids.Radar');


/** @ignoreDoc */
anychart.standalones.grids.linear = anychart.getFeatureOrError('anychart.standalones.grids.linear', 'anychart.standalones.grids.Linear');


/** @ignoreDoc */
anychart.standalones.grids.linear3d = anychart.getFeatureOrError('anychart.standalones.grids.linear3d', 'anychart.standalones.grids.Linear3d');


/** @ignoreDoc */
anychart.standalones.grids.polar = anychart.getFeatureOrError('anychart.standalones.grids.polar', 'anychart.standalones.grids.Polar');


/** @ignoreDoc */
anychart.standalones.grids.radar = anychart.getFeatureOrError('anychart.standalones.grids.radar', 'anychart.standalones.grids.Radar');


/** @ignoreDoc */
anychart.mekko = anychart.mekko || anychart.createNFIMError('Mekko chart');


/** @ignoreDoc */
anychart.mosaic = anychart.mosaic || anychart.createNFIMError('Mosaic chart');


/** @ignoreDoc */
anychart.barmekko = anychart.barmekko || anychart.createNFIMError('Barmekko chart');


//endregion
//region ------ UI
/** @ignoreDoc */
anychart.ui.contextMenu = anychart.ui.contextMenu || /** @type {function():null} */ (function(opt_fromTheme) {
  if (!opt_fromTheme) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Context Menu']);
  }
  return null;
});


/** @ignoreDoc */
anychart.ui.ganttToolbar = anychart.getFeatureOrError('anychart.ui.ganttToolbar', 'Gantt toolbar');


/** @ignoreDoc */
anychart.ui.preloader = anychart.getFeatureOrError('anychart.ui.preloader', 'Preloader');


/** @ignoreDoc */
anychart.ui.rangePicker = anychart.getFeatureOrError('anychart.ui.rangePicker', 'Range picker');


/** @ignoreDoc */
anychart.ui.rangeSelector = anychart.getFeatureOrError('anychart.ui.rangeSelector', 'Range selector');
//endregion
//endregion
//region ------- Charts tracking


/**
 * Container for tracking charts.
 * @type {Object<string, anychart.core.Chart>}
 * @private
 */
anychart.trackedCharts_ = {};


/**
 * Returns tracking chart by it's id.
 * @return {?anychart.core.Chart}
 */
anychart.getChartById = function(id) {
  return anychart.trackedCharts_[id];
};


/**
 *
 * @param {anychart.core.Chart} chart
 * @param {string} newId
 * @param {string=} opt_oldId
 * @return {boolean}
 */
anychart.trackChart = function(chart, newId, opt_oldId) {
  if (anychart.trackedCharts_[newId] && anychart.trackedCharts_[newId] != chart) {
    anychart.core.reporting.warning(anychart.enums.WarningCode.OBJECT_KEY_COLLISION, null, [newId], true);
    return false;
  }

  if(goog.isDef(opt_oldId))
    anychart.untrackChart(chart, /** @type {string} */(opt_oldId));

  anychart.trackedCharts_[newId] = chart;
  return true;
};


/**
 *
 * @param {anychart.core.Chart} chart
 * @param {string} oldId
 * @return {boolean}
 */
anychart.untrackChart = function(chart, oldId) {
  if (anychart.trackedCharts_[oldId] && anychart.trackedCharts_[oldId] == chart) {
    delete anychart.trackedCharts_[oldId];
    return true;
  }

  return false;
};


//endregion


if (COMPILED) {
  goog.dom.animationFrame.polyfill.install();
} else {
  anychart.onDocumentReady(function() {
    goog.dom.animationFrame.polyfill.install();
  });
}


//exports
goog.exportSymbol('anychart.graphics', anychart.graphics);//import
goog.exportSymbol('anychart.server', anychart.server);
goog.exportSymbol('anychart.fromJson', anychart.fromJson);//doc|ex
goog.exportSymbol('anychart.fromXml', anychart.fromXml);//doc|ex
goog.exportSymbol('anychart.onDocumentLoad', anychart.onDocumentLoad);//doc|need-ex
goog.exportSymbol('anychart.onDocumentReady', anychart.onDocumentReady);//doc|ex
goog.exportSymbol('anychart.licenseKey', anychart.licenseKey);//doc|ex
goog.exportSymbol('anychart.area', anychart.area);//linkedFromModule
goog.exportSymbol('anychart.verticalArea', anychart.verticalArea);//linkedFromModule
goog.exportSymbol('anychart.area3d', anychart.area3d);
goog.exportSymbol('anychart.bar', anychart.bar);//linkedFromModule
goog.exportSymbol('anychart.vertical', anychart.vertical);
goog.exportSymbol('anychart.bar3d', anychart.bar3d);
goog.exportSymbol('anychart.box', anychart.box);
goog.exportSymbol('anychart.bubble', anychart.bubble);//linkedFromModule
goog.exportSymbol('anychart.bullet', anychart.bullet);//linkedFromModule
goog.exportSymbol('anychart.cartesian', anychart.cartesian);//linkedFromModule
goog.exportSymbol('anychart.cartesian3d', anychart.cartesian3d);
goog.exportSymbol('anychart.column', anychart.column);//linkedFromModule
goog.exportSymbol('anychart.column3d', anychart.column3d);
goog.exportSymbol('anychart.financial', anychart.financial);//linkedFromModule
goog.exportSymbol('anychart.funnel', anychart.funnel);//linkedFromModule
goog.exportSymbol('anychart.line', anychart.line);//linkedFromModule
goog.exportSymbol('anychart.verticalLine', anychart.verticalLine);//linkedFromModule
goog.exportSymbol('anychart.marker', anychart.marker);//linkedFromModule
goog.exportSymbol('anychart.pie', anychart.pie);//linkedFromModule
goog.exportSymbol('anychart.pie3d', anychart.pie3d);//linkedFromModule
goog.exportSymbol('anychart.pyramid', anychart.pyramid);//linkedFromModule
goog.exportSymbol('anychart.radar', anychart.radar);
goog.exportSymbol('anychart.polar', anychart.polar);
goog.exportSymbol('anychart.sparkline', anychart.sparkline);
goog.exportSymbol('anychart.heatMap', anychart.heatMap);
goog.exportSymbol('anychart.scatter', anychart.scatter);
goog.exportSymbol('anychart.map', anychart.map);
goog.exportSymbol('anychart.choropleth', anychart.choropleth);
goog.exportSymbol('anychart.bubbleMap', anychart.bubbleMap);
goog.exportSymbol('anychart.markerMap', anychart.markerMap);
goog.exportSymbol('anychart.seatMap', anychart.seatMap);
goog.exportSymbol('anychart.connector', anychart.connector);
goog.exportSymbol('anychart.circularGauge', anychart.circularGauge);
goog.exportSymbol('anychart.gauges.circular', anychart.gauges.circular);
goog.exportSymbol('anychart.gauges.linear', anychart.gauges.linear);
goog.exportSymbol('anychart.gauges.thermometer', anychart.gauges.thermometer);
goog.exportSymbol('anychart.gauges.tank', anychart.gauges.tank);
goog.exportSymbol('anychart.gauges.led', anychart.gauges.led);
goog.exportSymbol('anychart.ganttProject', anychart.ganttProject);
goog.exportSymbol('anychart.ganttResource', anychart.ganttResource);
goog.exportSymbol('anychart.stock', anychart.stock);
goog.exportSymbol('anychart.theme', anychart.theme);
goog.exportSymbol('anychart.appendTheme', anychart.appendTheme);
goog.exportSymbol('anychart.toolbar', anychart.toolbar);
goog.exportSymbol('anychart.ganttToolbar', anychart.ganttToolbar);
goog.exportSymbol('anychart.treeMap', anychart.treeMap);
goog.exportSymbol('anychart.pareto', anychart.pareto);
goog.exportSymbol('anychart.resource', anychart.resource);
goog.exportSymbol('anychart.mekko', anychart.mekko);
goog.exportSymbol('anychart.mosaic', anychart.mosaic);
goog.exportSymbol('anychart.barmekko', anychart.barmekko);
goog.exportSymbol('anychart.standalones.background', anychart.standalones.background);
goog.exportSymbol('anychart.ui.background', anychart.ui.background);
goog.exportSymbol('anychart.standalones.colorRange', anychart.standalones.colorRange);
goog.exportSymbol('anychart.ui.colorRange', anychart.ui.colorRange);
goog.exportSymbol('anychart.standalones.dataGrid', anychart.standalones.dataGrid);
goog.exportSymbol('anychart.ui.dataGrid', anychart.ui.dataGrid);
goog.exportSymbol('anychart.standalones.label', anychart.standalones.label);
goog.exportSymbol('anychart.ui.label', anychart.ui.label);
goog.exportSymbol('anychart.standalones.labelsFactory', anychart.standalones.labelsFactory);
goog.exportSymbol('anychart.ui.labelsFactory', anychart.ui.labelsFactory);
goog.exportSymbol('anychart.standalones.legend', anychart.standalones.legend);
goog.exportSymbol('anychart.ui.legend', anychart.ui.legend);
goog.exportSymbol('anychart.standalones.markersFactory', anychart.standalones.markersFactory);
goog.exportSymbol('anychart.ui.markersFactory', anychart.ui.markersFactory);
goog.exportSymbol('anychart.standalones.projectTimeline', anychart.standalones.projectTimeline);
goog.exportSymbol('anychart.ui.projectTimeline', anychart.ui.projectTimeline);
goog.exportSymbol('anychart.standalones.resourceTimeline', anychart.standalones.resourceTimeline);
goog.exportSymbol('anychart.ui.resourceTimeline', anychart.ui.resourceTimeline);
goog.exportSymbol('anychart.standalones.resourceList', anychart.standalones.resourceList);
goog.exportSymbol('anychart.standalones.scroller', anychart.standalones.scroller);
goog.exportSymbol('anychart.ui.scroller', anychart.ui.scroller);
goog.exportSymbol('anychart.standalones.table', anychart.standalones.table);
goog.exportSymbol('anychart.ui.table', anychart.ui.table);
goog.exportSymbol('anychart.standalones.title', anychart.standalones.title);
goog.exportSymbol('anychart.ui.title', anychart.ui.title);
goog.exportSymbol('anychart.standalones.axes.linear', anychart.standalones.axes.linear);
goog.exportSymbol('anychart.standalones.axes.polar', anychart.standalones.axes.polar);
goog.exportSymbol('anychart.standalones.axes.radar', anychart.standalones.axes.radar);
goog.exportSymbol('anychart.standalones.axes.radial', anychart.standalones.axes.radial);
goog.exportSymbol('anychart.axes.linear', anychart.axes.linear);
goog.exportSymbol('anychart.axes.polar', anychart.axes.polar);
goog.exportSymbol('anychart.axes.radar', anychart.axes.radar);
goog.exportSymbol('anychart.axes.radial', anychart.axes.radial);
goog.exportSymbol('anychart.axisMarkers.line', anychart.axisMarkers.line);
goog.exportSymbol('anychart.axisMarkers.range', anychart.axisMarkers.range);
goog.exportSymbol('anychart.axisMarkers.text', anychart.axisMarkers.text);
goog.exportSymbol('anychart.standalones.axisMarkers.line', anychart.standalones.axisMarkers.line);
goog.exportSymbol('anychart.standalones.axisMarkers.range', anychart.standalones.axisMarkers.range);
goog.exportSymbol('anychart.standalones.axisMarkers.text', anychart.standalones.axisMarkers.text);
goog.exportSymbol('anychart.grids.linear', anychart.grids.linear);
goog.exportSymbol('anychart.grids.linear3d', anychart.grids.linear3d);
goog.exportSymbol('anychart.grids.polar', anychart.grids.polar);
goog.exportSymbol('anychart.grids.radar', anychart.grids.radar);
goog.exportSymbol('anychart.standalones.grids.linear', anychart.standalones.grids.linear);
goog.exportSymbol('anychart.standalones.grids.linear3d', anychart.standalones.grids.linear3d);
goog.exportSymbol('anychart.standalones.grids.polar', anychart.standalones.grids.polar);
goog.exportSymbol('anychart.standalones.grids.radar', anychart.standalones.grids.radar);
goog.exportSymbol('anychart.ui.contextMenu', anychart.ui.contextMenu);
goog.exportSymbol('anychart.ui.ganttToolbar', anychart.ui.ganttToolbar);
goog.exportSymbol('anychart.ui.preloader', anychart.ui.preloader);
goog.exportSymbol('anychart.ui.rangePicker', anychart.ui.rangePicker);
goog.exportSymbol('anychart.ui.rangeSelector', anychart.ui.rangeSelector);
goog.exportSymbol('anychart.trackChart', anychart.trackChart);
goog.exportSymbol('anychart.untrackChart', anychart.untrackChart);
goog.exportSymbol('anychart.getChartById', anychart.getChartById);
(function() {
  var proto = acgraph.vector.Stage.prototype;
  proto['credits'] = proto.credits;
})();
