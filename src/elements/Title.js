goog.provide('anychart.elements.Title');

goog.require('anychart.elements.Text');
goog.require('anychart.utils.Padding');



/**
 * Title class.
 * @constructor
 * @extends {anychart.elements.Text}
 */
anychart.elements.Title = function() {
  goog.base(this);
  this.settingsObj['text'] = 'Title text';

  /**
   * Text element.
   * @type {acgraph.vector.Text}
   * @private
   */
  this.text_ = null;

  /**
   * Background element if any.
   * @type {anychart.elements.Background}
   * @private
   */
  this.background_ = null;

  /**
   * Layer element if background is visible.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

  /**
   * Width settings for the title.
   * @type {number|string|null}
   * @private
   */
  this.width_ = null;

  /**
   * Height settings for the title.
   * @type {number|string|null}
   * @private
   */
  this.height_ = null;

  /**
   * Actual width of the title.
   * @type {number}
   * @private
   */
  this.backgroundWidth_ = NaN;

  /**
   * Actual height of the title.
   * @type {number}
   * @private
   */
  this.backgroundHeight_ = NaN;

  /**
   * Text width of the title.
   * @type {number}
   * @private
   */
  this.textWidth_ = NaN;

  /**
   * Text height of the title.
   * @type {number}
   * @private
   */
  this.textHeight_ = NaN;

  /**
   * If the text width is constricted.
   * @type {boolean}
   * @private
   */
  this.widthConstricted_ = false;

  /**
   * If the text height is constricted.
   * @type {boolean}
   * @private
   */
  this.heightConstricted_ = false;

  /**
   * Title left position.
   * @type {number}
   * @private
   */
  this.actualLeft_ = NaN;

  /**
   * Title top position.
   * @type {number}
   * @private
   */
  this.actualTop_ = NaN;

  /**
   * Parent bounds stored.
   * @type {anychart.math.Rect}
   * @private
   */
  this.parentBounds_ = null;

  /**
   * Pixel bounds due to orientation, align, margins, padding, etc.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBounds_ = null;

  /**
   * Title margin.
   * @type {anychart.utils.Margin}
   * @private
   */
  this.margin_ = null;

  /**
   * Title text padding.
   * @type {anychart.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * Title orientation.
   * @type {anychart.utils.Orientation}
   * @private
   */
  this.orientation_ = anychart.utils.Orientation.TOP;

  /**
   * Title align.
   * @type {anychart.utils.Align}
   * @private
   */
  this.align_ = anychart.utils.Align.CENTER;

  /**
   * Title rotation. Default depends on orientation.
   * @type {number}
   * @private
   */
  this.rotation_ = NaN;
};
goog.inherits(anychart.elements.Title, anychart.elements.Text);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Title.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE;


/**
 * Getter and setter for parent element bounds.
 * @param {anychart.math.Rect=} opt_value Parent bounds to set.
 * @return {!anychart.elements.Title|anychart.math.Rect} Title or parent bounds.
 */
anychart.elements.Title.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
    }
    return this;
  }
  return this.parentBounds_;
};


/**
 * Text contents.
 * @param {string=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Title|string} Asked value or itself for chaining.
 */
anychart.elements.Title.prototype.text = function(opt_value) {
  return /** @type {!anychart.elements.Title|string} */(this.textSettings('text', opt_value));
};


/**
 * Gets or sets the title background.
 * @param {anychart.elements.Background=} opt_background Background object to set.
 * @return {!anychart.elements.Title|!anychart.elements.Background} Returns the background or itself for chaining.
 */
anychart.elements.Title.prototype.background = function(opt_background) {
  if (!this.background_) {
    this.background_ = new anychart.elements.Background();
    this.background_.cloneFrom(null);
    this.registerDisposable(this.background_);
    this.invalidate(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE);
    this.background_.listen(anychart.utils.Invalidatable.INVALIDATED, this.backgroundInvalidated_, false, this);
  }
  if (goog.isDef(opt_background)) {
    this.background_.cloneFrom(opt_background);
    return this;
  }
  return this.background_;
};


/**
 * Title width settings.
 * @param {(number|string|null)=} opt_value Width value to set.
 * @return {!anychart.elements.Title|number|string|null} Title width or title itself for chaining.
 */
anychart.elements.Title.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(
          anychart.utils.ConsistencyState.PIXEL_BOUNDS |
          anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
          anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  }
  return this.width_;
};


/**
 * Title height settings.
 * @param {(number|string|null)=} opt_value Height value to set.
 * @return {!anychart.elements.Title|number|string|null} Title height or title itself for chaining.
 */
anychart.elements.Title.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(
          anychart.utils.ConsistencyState.PIXEL_BOUNDS |
          anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
          anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  }
  return this.height_;
};


/**
 * Title margin.
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!anychart.elements.Title|!anychart.utils.Margin} Margin or title for chaining.
 */
anychart.elements.Title.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom,
    opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.utils.Margin();
    this.registerDisposable(this.margin_);
    this.margin_.listen(anychart.utils.Invalidatable.INVALIDATED, this.boundsInvalidated_, false, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.set.apply(this.margin_, arguments);
    return this;
  }
  return this.margin_;
};


/**
 * Title padding.
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!anychart.elements.Title|!anychart.utils.Padding} Padding or title for chaining.
 */
anychart.elements.Title.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom,
    opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.utils.Padding();
    this.registerDisposable(this.padding_);
    this.padding_.listen(anychart.utils.Invalidatable.INVALIDATED, this.boundsInvalidated_, false, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.set.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 * Getter and setter for title align.
 * @param {(anychart.utils.Align|string)=} opt_value Align value to set.
 * @return {!anychart.elements.Title|anychart.utils.Align} Align or title for chaining.
 */
anychart.elements.Title.prototype.align = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeAlign(opt_value);
    if (this.align_ != opt_value) {
      this.align_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
    }
    return this;
  }
  return this.align_;
};


/**
 * Getter and setter for title orientation.
 * @param {(anychart.utils.Orientation|string)=} opt_value Orientation value to set.
 * @return {!anychart.elements.Title|anychart.utils.Orientation} Orientation or title for chaining.
 */
anychart.elements.Title.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeOrientation(opt_value);
    if (this.orientation_ != opt_value) {
      this.orientation_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
    }
    return this;
  }
  return this.orientation_;
};


/**
 * Getter and setter for title rotation. Note that default rotation depends on title orientation. Also note that the
 * angle is set relative to container 0 angle.
 * @param {(number|null)=} opt_value Rotation angle to set. Pass null or NaN to reset to orientation default.
 * @return {!anychart.elements.Title|number} Rotation or title for chaining.
 */
anychart.elements.Title.prototype.rotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value))
      opt_value = NaN;
    else
      opt_value = +opt_value;
    if (!((isNaN(opt_value) && isNaN(this.rotation_)) || opt_value == this.rotation_)) {
      this.rotation_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
    }
    return this;
  }
  if (isNaN(this.rotation_)) {
    switch (this.orientation_) {
      case anychart.utils.Orientation.LEFT:
        return -90;
      case anychart.utils.Orientation.RIGHT:
        return 90;
      //case anychart.utils.Orientation.TOP:
      //case anychart.utils.Orientation.BOTTOM:
      default:
        return 0;
    }
  }
  return this.rotation_;
};


/**
 * Draws the title
 * @return {!anychart.elements.Title} The title for chaining.
 */
anychart.elements.Title.prototype.draw = function() {
  var isInitial;
  if (isInitial = !this.text_) {
    this.text_ = acgraph.text();
    this.registerDisposable(this.text_);
  }
  if (this.isConsistent())
    return this;
  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.APPEARANCE)) {
    this.applyTextSettings(this.text_, isInitial);
    this.markConsistent(anychart.utils.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.PIXEL_BOUNDS)) {
    this.calcActualBounds_();
    // we are not marking it consistent here.
  }

  var hasBackground = this.background_ && (this.background_.fill() != 'none' || this.background_.stroke() != 'none');
  if (this.hasInvalidationState(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE)) {
    if (hasBackground) {
      if (!this.layer_) {
        this.layer_ = acgraph.layer();
        this.background_
            .suspendInvalidationDispatching()
            .container(this.layer_)
            .resumeInvalidationDispatching(false)
            .draw();
        this.text_.parent(this.layer_);
        this.registerDisposable(this.layer_);
        this.silentlyInvalidate(anychart.utils.ConsistencyState.CONTAINER);
      }
      this.background_.pixelBounds(new anychart.math.Rect(0, 0, this.backgroundWidth_, this.backgroundHeight_));
      this.background_.draw();
    } else {
      if (this.layer_) {
        if (this.background_ && this.background_.container() == this.layer_)
          this.background_
              .suspendInvalidationDispatching()
              .container(null)
              .resumeInvalidationDispatching(false)
              .draw();
        goog.dispose(this.layer_);
        this.silentlyInvalidate(anychart.utils.ConsistencyState.CONTAINER);
      }
    }
    this.markConsistent(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.PIXEL_BOUNDS)) {
    if (this.widthConstricted_)
      this.text_.width(this.textWidth_);
    if (this.heightConstricted_)
      this.text_.height(this.textHeight_);
    this.text_.x(/** @type {number} */(this.padding().left()));
    this.text_.y(/** @type {number} */(this.padding().top()));

    if (this.parentBounds_ || stage) {
      var elementToPosition = hasBackground ? this.layer_ : this.text_;
      elementToPosition.setTransformationMatrix(1, 0, 0, 1, 0, 0);
      //elementToPosition.translate(this.actualLeft_, this.actualTop_);
      elementToPosition.rotate(/** @type {number} */(this.rotation()),
          this.pixelBounds_.left + this.pixelBounds_.width / 2,
          this.pixelBounds_.top + this.pixelBounds_.height / 2);
      this.markConsistent(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
    }
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.CONTAINER)) {
    if (hasBackground)
      this.layer_.parent(container);
    else
      this.text_.parent(container);
    this.markConsistent(anychart.utils.ConsistencyState.CONTAINER);
  }

  if (manualSuspend) stage.resume();
  return this;
};


/**
 * Returns title bounds with all margin and padding.
 * @return {!anychart.math.Rect} Pixel bounds of the title with all padding and margin.
 */
anychart.elements.Title.prototype.getPixelBounds = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.utils.ConsistencyState.PIXEL_BOUNDS))
    this.calcActualBounds_();
  return this.pixelBounds_.clone();
};


/** @inheritDoc */
anychart.elements.Title.prototype.applyTextSettings = function(textElement, isInitial) {
  if (isInitial || 'text' in this.changedSettings || 'useHtml' in this.changedSettings) {
    if (!!this.settingsObj['useHtml'])
      textElement.htmlText(this.settingsObj['text']);
    else
      textElement.text(this.settingsObj['text']);
  }
  goog.base(this, 'applyTextSettings', textElement, isInitial);
  this.changedSettings = {};
};


/**
 * Calculates actual size of the title due to different sizing cases.
 * @private
 */
anychart.elements.Title.prototype.calcActualBounds_ = function() {
  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;

  var textBounds;
  if (this.width_ == null || this.height_ == null) {
    var isInitial;
    if (isInitial = !this.text_) {
      this.text_ = acgraph.text();
      this.registerDisposable(this.text_);
    }
    if (isInitial || this.hasInvalidationState(anychart.utils.ConsistencyState.APPEARANCE)) {
      this.applyTextSettings(this.text_, isInitial);
      this.markConsistent(anychart.utils.ConsistencyState.APPEARANCE);
    }
    if (this.width_ == null && this.text_.width() != null)
      this.text_.width(null);
    if (this.height_ == null && this.text_.height() != null)
      this.text_.height(null);
    textBounds = this.text_.getBounds();
  }

  var padding = this.padding();
  var margin = this.margin();
  /** @type {anychart.math.Rect} */
  var parentBounds;
  if (this.parentBounds_) {
    parentBounds = this.parentBounds_;
  } else if (stage) {
    parentBounds = stage.getBounds();
  } else {
    parentBounds = null;
  }

  var parentWidth, parentHeight;
  if (parentBounds) {
    if (this.orientation_ == anychart.utils.Orientation.TOP ||
        this.orientation_ == anychart.utils.Orientation.BOTTOM) {
      parentWidth = parentBounds.width;
      parentHeight = parentBounds.height;
    } else {
      parentWidth = parentBounds.height;
      parentHeight = parentBounds.width;
    }
  } else {
    parentWidth = parentHeight = undefined;
  }
  if (this.width_ != null) {
    this.backgroundWidth_ = anychart.utils.normalize(this.width_, parentWidth);
    this.textWidth_ = padding.tightenWidth(this.backgroundWidth_);
    this.widthConstricted_ = true;
  } else {
    this.textWidth_ = textBounds.width;
    this.backgroundWidth_ = padding.widenWidth(this.textWidth_);
    // TODO(): это пока не работает - не могу сообразить математику
    if (false && parentBounds && parentBounds.width < this.backgroundWidth_) {
      this.backgroundWidth_ = parentBounds.width;
      this.textWidth_ = padding.tightenWidth(this.backgroundWidth_);
      this.widthConstricted_ = true;
    } else {
      this.widthConstricted_ = false;
    }
  }

  if (this.height_ != null) {
    this.backgroundHeight_ = anychart.utils.normalize(this.height_, parentHeight);
    this.textHeight_ = padding.tightenHeight(this.backgroundHeight_);
    this.heightConstricted_ = true;
  } else {
    this.textHeight_ = textBounds.height;
    this.backgroundHeight_ = padding.widenHeight(this.textHeight_);
    // TODO(): это пока не работает - не могу сообразить математику
    if (false && parentBounds && parentBounds.height < this.backgroundHeight_) {
      this.backgroundHeight_ = parentBounds.height;
      this.textHeight_ = padding.tightenHeight(this.backgroundHeight_);
      this.heightConstricted_ = true;
    } else {
      this.heightConstricted_ = false;
    }
  }

  var widthWithMargin = margin.widenWidth(this.backgroundWidth_);
  var heightWithMargin = margin.widenHeight(this.backgroundHeight_);
  var rotation = goog.graphics.AffineTransform.getRotateInstance(
      goog.math.toRadians(/** @type {number} */(this.rotation())),
      widthWithMargin / 2,
      heightWithMargin / 2);
  var rotatedBounds = acgraph.math.getBoundsOfRectWithTransform(
      new anychart.math.Rect(
          anychart.utils.normalize(/** @type {number} */(margin.left()), this.backgroundWidth_),
          anychart.utils.normalize(/** @type {number} */(margin.top()), this.backgroundHeight_),
          this.backgroundWidth_, this.backgroundHeight_),
      rotation);
  var rotatedBoundsWithMargin = acgraph.math.getBoundsOfRectWithTransform(
      new anychart.math.Rect(0, 0, widthWithMargin, heightWithMargin),
      rotation);

  if (parentBounds) {
    switch (this.orientation_) {
      case anychart.utils.Orientation.TOP:
      case anychart.utils.Orientation.BOTTOM:
        switch (this.align_) {
          case anychart.utils.Align.LEFT:
            this.actualLeft_ = rotatedBounds.getLeft() - rotatedBoundsWithMargin.getLeft();
            break;
          case anychart.utils.Align.RIGHT:
            this.actualLeft_ = parentBounds.getRight() -
                (rotatedBoundsWithMargin.getRight() - rotatedBounds.getRight()) -
                rotatedBounds.getWidth();
            break;
          default:
            this.actualLeft_ = (parentBounds.getLeft() + parentBounds.getRight() - rotatedBoundsWithMargin.getWidth()) / 2 +
                (rotatedBounds.getLeft() - rotatedBoundsWithMargin.getLeft());
            break;
        }
        break;
      case anychart.utils.Orientation.LEFT:
      case anychart.utils.Orientation.RIGHT:
        switch (this.align_) {
          case anychart.utils.Align.TOP:
            this.actualTop_ = rotatedBounds.getTop() - rotatedBoundsWithMargin.getTop();
            break;
          case anychart.utils.Align.BOTTOM:
            this.actualTop_ = parentBounds.getBottom() -
                (rotatedBoundsWithMargin.getBottom() - rotatedBounds.getBottom()) -
                rotatedBounds.getHeight();
            break;
          default:
            this.actualTop_ = (parentBounds.getTop() + parentBounds.getBottom() - rotatedBoundsWithMargin.getHeight()) / 2 +
                (rotatedBounds.getTop() - rotatedBoundsWithMargin.getTop());
            break;
        }
        break;
    }
    switch (this.orientation_) {
      case anychart.utils.Orientation.TOP:
        this.actualTop_ = rotatedBounds.getTop() - rotatedBoundsWithMargin.getTop();
        break;
      case anychart.utils.Orientation.RIGHT:
        this.actualLeft_ = parentBounds.getRight() -
            (rotatedBoundsWithMargin.getRight() - rotatedBounds.getRight()) -
            rotatedBounds.getWidth();
        break;
      case anychart.utils.Orientation.BOTTOM:
        this.actualTop_ = parentBounds.getBottom() -
            (rotatedBoundsWithMargin.getBottom() - rotatedBounds.getBottom()) -
            rotatedBounds.getHeight();
        break;
      case anychart.utils.Orientation.LEFT:
        this.actualLeft_ = rotatedBounds.getLeft() - rotatedBoundsWithMargin.getLeft();
        break;
    }
    this.pixelBounds_ = new anychart.math.Rect(
        this.actualLeft_ - rotatedBoundsWithMargin.getLeft() + rotatedBounds.getLeft(),
        this.actualTop_ - rotatedBoundsWithMargin.getTop() + rotatedBounds.getTop(),
        rotatedBoundsWithMargin.getWidth(),
        rotatedBoundsWithMargin.getHeight());
  } else {
    this.actualLeft_ = rotatedBounds.getLeft() - rotatedBoundsWithMargin.getLeft();
    this.actualTop_ = rotatedBounds.getTop() - rotatedBoundsWithMargin.getTop();
    this.pixelBounds_ = new anychart.math.Rect(0, 0,
        rotatedBoundsWithMargin.getWidth(),
        rotatedBoundsWithMargin.getHeight());
  }
};


/**
 * Internal background invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.elements.Title.prototype.backgroundInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.APPEARANCE)) {
    this.invalidate(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE);
  }
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.utils.InvalidatedStatesEvent} event Invalidation event.
 * @private
 */
anychart.elements.Title.prototype.boundsInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.BOUNDS)) {
    this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
  }
};
