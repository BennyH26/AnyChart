goog.provide('anychart.scatter.series.BaseWithMarkers');
goog.require('acgraph');
goog.require('anychart.elements.MarkersFactory');
goog.require('anychart.enums');
goog.require('anychart.scatter.series.Base');



/**
 * A base for all series except marker series.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.scatter.series.Base}
 */
anychart.scatter.series.BaseWithMarkers = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  this.markers().listen(acgraph.events.EventType.MOUSEOVER, this.handleMarkerMouseOver, false, this);
  this.markers().listen(acgraph.events.EventType.MOUSEOUT, this.handleMarkerMouseOut, false, this);
  this.markers().listen(acgraph.events.EventType.CLICK, this.handleMarkerBrowserEvents, false, this);
  this.markers().listen(acgraph.events.EventType.DBLCLICK, this.handleMarkerBrowserEvents, false, this);
  this.markers().position(anychart.enums.Position.CENTER);
};
goog.inherits(anychart.scatter.series.BaseWithMarkers, anychart.scatter.series.Base);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.scatter.series.BaseWithMarkers.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.scatter.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.MARKERS;


/**
 * @type {anychart.elements.MarkersFactory}
 * @private
 */
anychart.scatter.series.BaseWithMarkers.prototype.markers_ = null;


/**
 * @type {anychart.elements.MarkersFactory}
 * @private
 */
anychart.scatter.series.BaseWithMarkers.prototype.hoverMarkers_ = null;


/** @inheritDoc */
anychart.scatter.series.BaseWithMarkers.prototype.hasMarkers = function() {
  return true;
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.scatter.series.BaseWithMarkers.prototype.handleMarkerMouseOver = function(event) {
  if (this.dispatchEvent(new anychart.scatter.series.Base.BrowserEvent(this, event))) {
    if (event && goog.isDef(event['markerIndex'])) {
      this.hoverPoint(event['markerIndex'], event);
      var markerElement = this.markers().getMarker(event['markerIndex']).getDomElement();
      acgraph.events.listen(markerElement, acgraph.events.EventType.MOUSEMOVE, this.handleMarkerMouseMove, false, this);
    } else
      this.unhover();
  }
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.scatter.series.BaseWithMarkers.prototype.handleMarkerMouseOut = function(event) {
  if (this.dispatchEvent(new anychart.scatter.series.Base.BrowserEvent(this, event))) {
    var markerElement = this.markers().getMarker(event['markerIndex']).getDomElement();
    acgraph.events.unlisten(markerElement, acgraph.events.EventType.MOUSEMOVE, this.handleMarkerMouseMove, false, this);
    this.unhover();
  }
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.scatter.series.BaseWithMarkers.prototype.handleMarkerMouseMove = function(event) {
  if (event && goog.isDef(event.target['__tagIndex']))
    this.hoverPoint(event.target['__tagIndex'], event);
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.scatter.series.BaseWithMarkers.prototype.handleMarkerBrowserEvents = function(event) {
  this.dispatchEvent(new anychart.scatter.series.Base.BrowserEvent(this, event));
};


/**
 * Getter for series data markers.
 * @example <t>listingOnly</t>
 * series.markers().size(10);
 * @return {!anychart.elements.MarkersFactory} Markers instance.
 *//**
 * Setter for series data markers.<br/>
 * <b>Note:</b> pass <b>'none'</b> or <b>null</b> to turn off markers.
 * @example <t>listingOnly</t>
 * var myMarkers = anychart.elements.markersFactory()
 *       .size(10)
 *       .type('star5');
 * series.markers(myMarkers);
 * @example <t>lineChart</t>
 * chart.spline([1, 1.4, 1.2, 2]).markers(null);
 * @param {(anychart.elements.MarkersFactory|Object|string|null)=} opt_value Series data markers settings.
 * @return {!anychart.scatter.series.BaseWithMarkers} {@link anychart.scatter.series.BaseWithMarkers} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.elements.MarkersFactory|Object|string|null)=} opt_value Series data markers settings.
 * @return {!(anychart.elements.MarkersFactory|anychart.scatter.series.BaseWithMarkers)} Markers instance or itself for chaining call.
 */
anychart.scatter.series.BaseWithMarkers.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.elements.MarkersFactory();
    this.registerDisposable(this.markers_);
    this.markers_.listenSignals(this.onMarkersSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.MarkersFactory) {
      this.markers_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.markers_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.markers_.enabled(false);
    }
    return this;
  }
  return this.markers_;
};


/**
 * Getter for series data markers on hover.
 * @example <t>listingOnly</t>
 * series.hoverMarkers().size(20);
 * @return {!anychart.elements.MarkersFactory} Markers instance.
 *//**
 * Setter for series data markers on hover.<br/>
 * <b>Note:</b> pass <b>'none'</b> or <b>null</b> to turn of markers.
 * @example <t>listingOnly</t>
 * series.hoverMarkers(null);
 * @example <t>lineChart</t>
 * var myMarkers = anychart.elements.markersFactory()
 *       .size(10)
 *       .type('star5');
 * chart.spline([1, 1.4, 1.2, 2]).hoverMarkers(myMarkers);
 * @param {(anychart.elements.MarkersFactory|Object|string|null)=} opt_value Series data markers settings.
 * @return {!anychart.scatter.series.BaseWithMarkers} {@link anychart.scatter.series.BaseWithMarkers} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.elements.MarkersFactory|Object|string|null)=} opt_value Series data markers settings.
 * @return {!(anychart.elements.MarkersFactory|anychart.scatter.series.BaseWithMarkers)} Markers instance or itself for chaining call.
 */
anychart.scatter.series.BaseWithMarkers.prototype.hoverMarkers = function(opt_value) {
  if (!this.hoverMarkers_) {
    this.hoverMarkers_ = new anychart.elements.MarkersFactory();
    this.registerDisposable(this.hoverMarkers_);
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.MarkersFactory) {
      this.hoverMarkers_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.hoverMarkers_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.hoverMarkers_.enabled(false);
    }
    return this;
  }
  return this.hoverMarkers_;
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.scatter.series.BaseWithMarkers.prototype.onMarkersSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/** @inheritDoc */
anychart.scatter.series.BaseWithMarkers.prototype.setAutoMarkerType = function(opt_value) {
  this.markers().setAutoType(opt_value);
};


/** @inheritDoc */
anychart.scatter.series.BaseWithMarkers.prototype.remove = function() {
  this.markers().container(null);

  goog.base(this, 'remove');
};


/** @inheritDoc */
anychart.scatter.series.BaseWithMarkers.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  var markers = this.markers();
  var hoverMarkers = this.hoverMarkers();

  markers.suspendSignalsDispatching();
  hoverMarkers.suspendSignalsDispatching();

  var fillColor = this.getMarkerFill();
  markers.setAutoFill(fillColor);

  var strokeColor = /** @type {acgraph.vector.Stroke} */(this.getMarkerStroke());
  markers.setAutoStroke(strokeColor);

  markers.clear();
  markers.container(/** @type {acgraph.vector.ILayer} */(this.container()));
  markers.parentBounds(/** @type {anychart.math.Rect} */(this.pixelBounds()));
};


/** @inheritDoc */
anychart.scatter.series.BaseWithMarkers.prototype.drawPoint = function() {
  goog.base(this, 'drawPoint');
  if (this.enabled() && this.pointDrawn) {
    this.drawMarker(false);
  }
};


/** @inheritDoc */
anychart.scatter.series.BaseWithMarkers.prototype.finalizeDrawing = function() {
  this.markers().draw();

  if (this.clip()) {
    var bounds = /** @type {!anychart.math.Rect} */(goog.isBoolean(this.clip()) ? this.pixelBounds() : this.clip());
    var markerDOM = this.markers().getDomElement();
    if (markerDOM) markerDOM.clip(/** @type {acgraph.math.Rect} */(bounds));
  }

  this.markers().resumeSignalsDispatching(false);
  this.hoverMarkers().resumeSignalsDispatching(false);

  this.markers().markConsistent(anychart.ConsistencyState.ALL);
  this.hoverMarkers().markConsistent(anychart.ConsistencyState.ALL);

  goog.base(this, 'finalizeDrawing');
};


/**
 * Draws marker for the point.
 * @param {boolean} hovered If it is a hovered marker drawing.
 * @protected
 */
anychart.scatter.series.BaseWithMarkers.prototype.drawMarker = function(hovered) {
  var pointMarker = this.getIterator().get('marker');
  var hoverPointMarker = this.getIterator().get('hoverMarker');
  var index = this.getIterator().getIndex();
  var markersFactory = /** @type {anychart.elements.MarkersFactory} */(hovered ? this.hoverMarkers() : this.markers());

  var marker = this.markers().getMarker(index);

  var markerEnabledState = pointMarker && goog.isDef(pointMarker['enabled']) ? pointMarker['enabled'] : null;
  var markerHoverEnabledState = hoverPointMarker && goog.isDef(hoverPointMarker['enabled']) ? hoverPointMarker['enabled'] : null;

  var isDraw = hovered ?
      goog.isNull(markerHoverEnabledState) ?
          goog.isNull(this.hoverMarkers().enabled()) ?
              goog.isNull(markerEnabledState) ?
                  this.markers().enabled() :
                  markerEnabledState :
              this.hoverMarkers().enabled() :
          markerHoverEnabledState :
      goog.isNull(markerEnabledState) ?
          this.markers().enabled() :
          markerEnabledState;

  if (isDraw) {
    var markerPosition = pointMarker && pointMarker['position'] ? pointMarker['position'] : null;
    var markerHoverPosition = hoverPointMarker && hoverPointMarker['position'] ? hoverPointMarker['position'] : null;
    var position = (hovered && (markerHoverPosition || this.hoverMarkers().position())) || markerPosition || this.markers().position();

    var positionProvider = this.createPositionProvider(/** @type {anychart.enums.Position|string} */(position));
    if (marker) {
      marker.positionProvider(positionProvider);
    } else {
      marker = this.markers().add(positionProvider, index);
    }

    marker.resetSettings();
    marker.currentMarkersFactory(markersFactory);
    marker.setSettings(/** @type {Object} */(pointMarker), /** @type {Object} */(hoverPointMarker));
    marker.draw();
  } else if (marker) {
    marker.clear();
  }
};


/**
 * @inheritDoc
 */
anychart.scatter.series.BaseWithMarkers.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['markers'] = this.markers().serialize();
  json['hoverMarkers'] = this.hoverMarkers().serialize();
  return json;
};


/**
 * @inheritDoc
 */
anychart.scatter.series.BaseWithMarkers.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();
  goog.base(this, 'deserialize', config);
  this.markers(config['markers']);
  this.hoverMarkers(config['hoverMarkers']);
  this.resumeSignalsDispatching(true);
  return this;
};


/**
 * Return marker color for series.
 * @return {!acgraph.vector.Fill} Marker color for series.
 */
anychart.scatter.series.BaseWithMarkers.prototype.getMarkerFill = function() {
  return this.getFinalFill(false, false);
};


/**
 * Return marker color for series.
 * @return {(string|acgraph.vector.Fill|acgraph.vector.Stroke)} Marker color for series.
 */
anychart.scatter.series.BaseWithMarkers.prototype.getMarkerStroke = function() {
  return anychart.color.darken(/** @type {acgraph.vector.Fill} */ (this.markers().fill()));
};


/**
 * @inheritDoc
 */
anychart.scatter.series.BaseWithMarkers.prototype.getLegendItemData = function() {
  var data = goog.base(this, 'getLegendItemData');
  if (this.markers().enabled())
    data['iconMarker'] = this.markers().type();
  return data;
};


/** @inheritDoc */
anychart.scatter.series.BaseWithMarkers.prototype.restoreDefaults = function() {
  var result = goog.base(this, 'restoreDefaults');

  var markers = /** @type {anychart.elements.MarkersFactory} */(this.markers());
  markers.suspendSignalsDispatching();
  markers.enabled(true);
  markers.size(4);
  markers.resumeSignalsDispatching(false);

  var hoverMarkers = (/** @type {anychart.elements.MarkersFactory} */(this.hoverMarkers()));
  hoverMarkers.suspendSignalsDispatching();
  hoverMarkers.size(6);
  hoverMarkers.resumeSignalsDispatching(false);

  return result;
};


//exports
anychart.scatter.series.BaseWithMarkers.prototype['startDrawing'] = anychart.scatter.series.BaseWithMarkers.prototype.startDrawing;//inherited
anychart.scatter.series.BaseWithMarkers.prototype['drawPoint'] = anychart.scatter.series.BaseWithMarkers.prototype.drawPoint;//inherited
anychart.scatter.series.BaseWithMarkers.prototype['finalizeDrawing'] = anychart.scatter.series.BaseWithMarkers.prototype.finalizeDrawing;//inherited
anychart.scatter.series.BaseWithMarkers.prototype['markers'] = anychart.scatter.series.BaseWithMarkers.prototype.markers;//doc|ex
anychart.scatter.series.BaseWithMarkers.prototype['hoverMarkers'] = anychart.scatter.series.BaseWithMarkers.prototype.hoverMarkers;//doc|ex
