goog.provide('anychart.ui.Editor2');
goog.provide('anychart.ui.Editor2.Dialog');

goog.require('anychart.ui.Component');
goog.require('anychart.ui.Preloader');
// goog.require('anychart.ui.chartEditor.Controller');
goog.require('anychart.ui.chartEditor2.events');
goog.require('anychart.ui.chartEditor2.steps.PrepareData');
goog.require('anychart.ui.chartEditor2.steps.SetupChart');
goog.require('goog.fx.AnimationSerialQueue');
goog.require('goog.fx.Transition.EventType');
goog.require('goog.fx.dom');
goog.require('goog.net.ImageLoader');
goog.require('goog.ui.Dialog');



/**
 * Chart Editor Component Class.
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @extends {anychart.ui.Component}
 */
anychart.ui.Editor2 = function(opt_domHelper) {
  anychart.ui.Editor2.base(this, 'constructor', opt_domHelper);

  /**
   * @type {?goog.ui.Dialog}
   * @private
   */
  this.dialog_ = null;

  /**
   * Current step.
   * @type {anychart.ui.chartEditor.steps.Base}
   * @private
   */
  this.currentStep_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.progressEl_ = null;


  this.steps_ = [];
  //this.editorModel_ = null;

  //this.controller_ = new anychart.ui.chartEditor.Controller(this);

  //this.updateModelInSteps_();

  this.imagesLoaded_ = true;
  this.preloader_ = new anychart.ui.Preloader();
  // var imageLoader = new goog.net.ImageLoader();
  // this.registerDisposable(imageLoader);
  // goog.events.listen(imageLoader, goog.net.EventType.COMPLETE, function() {
  //   this.imagesLoaded_ = true;
  //   this.preloader_.visible(false);
  // }, false, this);
  // goog.array.forEach(this.sharedModel_.presetsList, function(category) {
  //   goog.array.forEach(category.list, function(chart) {
  //     imageLoader.addImage(chart.type, 'https://cdn.anychart.com/images/chartopedia/' + chart.image);
  //   });
  // });
  //imageLoader.start();

  goog.events.listen(this, anychart.enums.EventType.COMPLETE, this.onComplete_, false, this);
};
goog.inherits(anychart.ui.Editor2, anychart.ui.Component);


/** @inheritDoc */
anychart.ui.Editor2.prototype.render = function(opt_parentElement) {
  anychart.ui.Editor2.base(this, 'render', opt_parentElement);
  this.showPreloader_();
};


/** @inheritDoc */
anychart.ui.Editor2.prototype.decorate = function(element) {
  anychart.ui.Editor2.base(this, 'decorate', element);
  this.showPreloader_();
};


/**
 * Renders the Chart Editor as modal dialog.
 * @param {string=} opt_class CSS class name for the dialog element, also used
 *     as a class name prefix for related elements; defaults to modal-dialog.
 *     This should be a single, valid CSS class name.
 * @param {boolean=} opt_useIframeMask Work around windowed controls z-index
 *     issue by using an iframe instead of a div for bg element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 */
anychart.ui.Editor2.prototype.renderAsDialog = function(opt_class, opt_useIframeMask, opt_domHelper) {
  this.dialog_ = new anychart.ui.Editor2.Dialog(opt_class, opt_useIframeMask, opt_domHelper);
  this.dialog_.addChild(this, true);
};


/**
 * Sets the visibility of the dialog box and moves focus to the
 * default button. Lazily renders the component if needed.
 * @param {boolean=} opt_value Whether the dialog should be visible.
 * @return {boolean|!anychart.ui.Editor2}
 */
anychart.ui.Editor2.prototype.visible = function(opt_value) {
  if (!this.dialog_) return true;

  if (goog.isDef(opt_value)) {
    this.dialog_.setVisible(opt_value);
    this.showPreloader_();
    return this;
  }

  return this.dialog_.isVisible();
};


/**
 * Check if images are not fully loaded and shows preloader if need.
 * @private
 */
anychart.ui.Editor2.prototype.showPreloader_ = function() {
  if (!this.imagesLoaded_) {
    var element = this.getContentElement();
    this.preloader_.render(element);
    this.preloader_.visible(true);
  }
};


/**
 * Close dialog (if exists) on complete button press.
 * @private
 */
anychart.ui.Editor2.prototype.onComplete_ = function() {
  if (this.dialog_)
    this.dialog_.setVisible(false);
};


/** @override */
anychart.ui.Editor2.prototype.createDom = function() {
  console.log("createDom");
  anychart.ui.Editor2.base(this, 'createDom');

  var element = this.getElement();
  var dom = this.getDomHelper();
  goog.dom.classlist.add(element, goog.getCssName('anychart-chart-editor'));

  this.steps_.push(new anychart.ui.chartEditor2.steps.PrepareData(0));
  this.steps_.push(new anychart.ui.chartEditor2.steps.SetupChart(0));
  for (var i = 0; i < this.steps_.length; i++) {
    this.addChild(this.steps_[i]);
  }

  var className = "anychart-chart-editor-step";
  var nextBtnClass = goog.getCssName(className, 'next-button');
  var previousBtnClass = goog.getCssName(className, 'previous-button');
  var progressItemListClass = goog.getCssName(className, 'progress-item-list');

  this.progressEl_ = dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(className, 'progress'),
      this.progressListEl_ = dom.createDom(
          goog.dom.TagName.DIV,
          progressItemListClass));
  goog.a11y.aria.setRole(this.progressListEl_, goog.a11y.aria.Role.LIST);

  this.nextBtn_ = new anychart.ui.button.Primary();
  this.nextBtn_.addClassName(nextBtnClass);
  // if (this.sharedModel_.currentStep.isLastStep) {
  //   this.nextBtn_.setCaption('Complete');
  // } else {
  this.nextBtn_.setCaption('Next');
  // }
  this.nextBtn_.render(this.progressEl_);

  this.prevBtn_ = new anychart.ui.button.Secondary();
  this.prevBtn_.addClassName(previousBtnClass);
  this.prevBtn_.setCaption('Previous');
  // if (!this.sharedModel_.currentStep.index) {
  //   this.prevBtn_.setState(goog.ui.Component.State.DISABLED, true);
  // }
  this.prevBtn_.render(this.progressEl_);

  // this.contentWrapperEl_ = dom.createDom(
  //     goog.dom.TagName.DIV,
  //     goog.getCssName(className, 'content-wrapper'),
  //     this.contentEl_ = dom.createDom(
  //         goog.dom.TagName.DIV, goog.getCssName(className, 'content')),
  //     this.progressEl_);

  element.appendChild(this.progressEl_);
};


/** @override */
anychart.ui.Editor2.prototype.enterDocument = function() {
  console.log("enterDocument");
  anychart.ui.Editor2.base(this, 'enterDocument');

  this.setCurrentStepIndex_(0, false);
  this.updateProgressList_();

  this.listen(anychart.ui.chartEditor2.events.EventType.CHANGE_STEP, this.onChangeStep_);
};



/**
 * Render progress list.
 * @private
 */
anychart.ui.Editor2.prototype.updateProgressList_ = function() {
  var dom = this.getDomHelper();

  var className = "anychart-chart-editor-step";
  var arrowClass = goog.getCssName(className, 'progress-item-arrow');
  var contentClass = goog.getCssName(className, 'progress-item-content');
  var itemClass = goog.getCssName(className, 'progress-item');

  if(this.progressListEl_)
    dom.removeChildren(this.progressListEl_);

  var step;
  for (var i = 0; i < this.steps_.length; i++) {
    step = this.steps_[i];

    var progressArrowEl = dom.createDom(goog.dom.TagName.DIV, arrowClass);
    progressArrowEl.innerHTML = '&rarr;';

    var progressContentEl = dom.createDom(goog.dom.TagName.DIV, contentClass, step.getName());
    goog.dom.setFocusableTabIndex(progressContentEl, true);
    goog.a11y.aria.setRole(progressContentEl, goog.a11y.aria.Role.LINK);
    goog.a11y.aria.setLabel(progressContentEl, step.name);
    //progressContentEl.setAttribute(anychart.ui.chartEditor2.steps.Base.STEP_DATA_ATTRIBUTE_, String(step.index));

    var itemEl = dom.createDom(
        goog.dom.TagName.DIV,
        itemClass,
        progressContentEl,
        !step.isLastStep ? progressArrowEl : null);
    goog.a11y.aria.setRole(itemEl, goog.a11y.aria.Role.LISTITEM);
    // Set state class.
    if (step == this.currentStep_) {
      goog.dom.classlist.add(itemEl, goog.getCssName('anychart-active'));

    } else if (step.getIndex() < this.currentStep_.getIndex()) {
      goog.dom.classlist.add(itemEl, goog.getCssName(itemClass, 'passed'));

    }/* else if (step.getIndex() > this.sharedModel_.currentStep.index + 1 && !step.isVisited) {
      goog.dom.classlist.add(itemEl, goog.getCssName('anychart-disabled'));
    }*/

    // if (!this.enableNextStep_ && step.index == this.sharedModel_.currentStep.index + 1) {
    //   goog.dom.classlist.enable(itemEl, goog.getCssName('anychart-disabled'), !this.enableNextStep_);
    // }

    this.progressListEl_.appendChild(itemEl);
  }
};


/**
 *
 * @param {Object} e
 * @private
 */
anychart.ui.Editor2.prototype.onChangeStep_ = function(e) {
  this.setCurrentStepIndex_(e.stepIndex, true);
  this.currentStep_.update();
};


/**
 * Remove step from DOM.
 * @param {anychart.ui.chartEditor.steps.Base} step
 * @private
 */
anychart.ui.Editor2.prototype.removeStep_ = function(step) {
  // Remove the child component's DOM from the document.  We have to call
  // exitDocument first (see documentation).
  step.exitDocument();
  goog.dom.removeNode(step.getElement());
};


/**
 * @return {?anychart.ui.chartEditor.steps.Base} The currently step (null if none).
 * @private
 */
anychart.ui.Editor2.prototype.getCurrentStep_ = function() {
  return this.currentStep_;
};


/**
 * Render the given step.
 * @param {anychart.ui.chartEditor.steps.Base} step
 * @param {boolean} doAnimation
 * @private
 */
anychart.ui.Editor2.prototype.setCurrentStep_ = function(step, doAnimation) {
  if (!this.isInDocument()) return;
  if (!step || step.isInDocument()) {
    return;
  }

  if (this.currentStep_) {
    if (doAnimation) {
      var currentAnimation = new goog.fx.AnimationSerialQueue();
      currentAnimation.add(new goog.fx.dom.FadeOut(this.currentStep_.getElement(), 300));
      currentAnimation.play();
      goog.events.listenOnce(
          currentAnimation, goog.fx.Transition.EventType.END, goog.bind(this.removeStep_, this, this.currentStep_));
    } else {
      this.removeStep_(this.currentStep_);
    }
    this.currentStep_ = null;
    this.sharedModel_.currentStep = null;
    this.sharedModel_.currentStepIndex = NaN;
  }

  if (step) {
    this.currentStep_ = step;
    // this.sharedModel_.currentStep = this.getCurrentStepDescriptor_();
    step.render(this.getContentElement());
    step.setParentEventTarget(this);
    // this.sharedModel_.currentStep.isVisited = true;

    var stepAnimation = new goog.fx.AnimationSerialQueue();
    stepAnimation.add(new goog.fx.dom.FadeIn(step.getElement(), 300));
    stepAnimation.play();
  }
};


/**
 * @return {number} Index of the currently step (-1 if none).
 * @private
 */
anychart.ui.Editor2.prototype.getCurrentStepIndex_ = function() {
  return this.indexOfChild(this.getCurrentStep_());
};


/**
 * Render the step at the given index.
 * @param {number} index Index of the step to render (-1 to render none).
 * @param {boolean} doAnimation
 * @private
 */
anychart.ui.Editor2.prototype.setCurrentStepIndex_ = function(index, doAnimation) {
  this.setCurrentStep_(/** @type {anychart.ui.chartEditor.steps.Base} */ (this.getChildAt(index)), doAnimation);
};


/**
 * Check passed step is last step.
 * @param {anychart.ui.chartEditor.steps.Base} step
 * @return {boolean}
 * @private
 */
anychart.ui.Editor2.prototype.isLastStep_ = function(step) {
  return Boolean(step && step == this.getChildAt(this.getChildCount() - 1));
};


/**
 * @return {anychart.ui.chartEditor.steps.Base.Descriptor}
 * @private
 */
anychart.ui.Editor2.prototype.getCurrentStepDescriptor_ = function() {
  return this.sharedModel_.steps[this.indexOfChild(this.currentStep_)];
};


/**
 * Set data.
 * @param {...Array} var_args Raw data set.
 */
anychart.ui.Editor2.prototype.data = function(var_args) {
  if (!goog.isDef(window['anychart']['data'])) return;
  if (!arguments.length) return;
  this.resetSharedModel_();

  for (var i = 0; i < arguments.length; i++) {
    var dataSet = arguments[i];
    if (goog.isArrayLike(dataSet))
      dataSet = window['anychart']['data']['set'](dataSet);

    if (dataSet['mapAs']) {
      this.sharedModel_.dataSets.push({
        index: i,
        name: 'Data Set ' + (i + 1),
        instance: dataSet,
        rawMappings: [],
        mappings: []
      });
    }
  }

  this.setCurrentStepIndex_(0, goog.isObject(this.currentStep_));
  this.update();
};


/**
 * Update current step.
 */
anychart.ui.Editor2.prototype.update = function() {
  if (this.currentStep_) {
    this.currentStep_.update();
  }
};


/** @override */
anychart.ui.Editor2.prototype.disposeInternal = function() {
  this.currentStep_ = null;
  //this.controller_ = null;
  //this.sharedModel_.dataSets.length = 0;
  //this.sharedModel_ = null;
  anychart.ui.Editor2.base(this, 'disposeInternal');
};


// region Editor.Dialog
/**
 * @constructor
 * @param {string=} opt_class CSS class name for the dialog element, also used
 *     as a class name prefix for related elements; defaults to modal-dialog.
 *     This should be a single, valid CSS class name.
 * @param {boolean=} opt_useIframeMask Work around windowed controls z-index
 *     issue by using an iframe instead of a div for bg element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link
 *     goog.ui.Component} for semantics.
 * @extends {goog.ui.Dialog}
 */
anychart.ui.Editor2.Dialog = function(opt_class, opt_useIframeMask, opt_domHelper) {
  anychart.ui.Editor2.Dialog.base(this, 'constructor', opt_class || goog.getCssName('anychart-chart-editor-dialog'), opt_useIframeMask, opt_domHelper);

  /**
   * Element for the logo of the title bar.
   * @type {Element}
   * @private
   */
  this.titleLogoEl_ = null;

  this.setTitle('Chart Editor');
  this.setButtonSet(null);
};
goog.inherits(anychart.ui.Editor2.Dialog, goog.ui.Dialog);


/** @override */
anychart.ui.Editor2.Dialog.prototype.createDom = function() {
  anychart.ui.Editor2.Dialog.base(this, 'createDom');
  this.initTitleElements_();
};


/** @override */
anychart.ui.Editor2.Dialog.prototype.decorateInternal = function(element) {
  anychart.ui.Editor2.Dialog.base(this, 'decorateInternal', element);
  this.initTitleElements_();
};


/** @private */
anychart.ui.Editor2.Dialog.prototype.initTitleElements_ = function() {
  var dom = this.getDomHelper();

  var titleElement = this.getTitleElement();
  this.titleLogoEl_ = dom.createDom(
      goog.dom.TagName.A,
      {'class': goog.getCssName(this.getCssClass(), 'title-logo'), 'href': 'https://anychart.com', 'target': '_blank'});
  goog.dom.insertSiblingBefore(this.titleLogoEl_, goog.dom.getFirstElementChild(titleElement));

  this.setTitle('Chart Editor');

  var close = this.getTitleCloseElement();
  goog.dom.appendChild(close, goog.dom.createDom(goog.dom.TagName.I, ['ac', 'ac-remove']));
};


/** @override */
anychart.ui.Editor2.Dialog.prototype.enterDocument = function() {
  anychart.ui.Editor2.Dialog.base(this, 'enterDocument');
  var bgEl = this.getBackgroundElement();
  if (bgEl)
    this.getHandler().listen(bgEl, goog.events.EventType.CLICK, this.onBackgroundClick_);
};


/** @override */
anychart.ui.Editor2.Dialog.prototype.disposeInternal = function() {
  this.titleLogoEl_ = null;
  anychart.ui.Editor2.Dialog.base(this, 'disposeInternal');
};


/** @private */
anychart.ui.Editor2.Dialog.prototype.onBackgroundClick_ = function() {
  this.setVisible(false);
};
// endregion


/**
 * Constructor function for Chart Editor.
 * @return {anychart.ui.Editor2}
 */
anychart.ui.editor2 = function() {
  return new anychart.ui.Editor2();
};

//exports
(function() {
  // var proto = anychart.ui.Editor.prototype;
  // goog.exportSymbol('anychart.ui.editor', anychart.ui.editor);
  // proto['data'] = proto.data;
  // proto['render'] = proto.render;
  // proto['decorate'] = proto.decorate;
  // proto['renderAsDialog'] = proto.renderAsDialog;
  // proto['visible'] = proto.visible;
  // proto['listen'] = proto.listen;
  // proto['listenOnce'] = proto.listenOnce;
  // proto['unlisten'] = proto.unlisten;
  // proto['unlistenByKey'] = proto.unlistenByKey;
  // proto['removeAllListeners'] = proto.removeAllListeners;
  // proto['dispose'] = proto.dispose;
  // proto['getResultJson'] = proto.getResultJson;
  // proto['getResultXml'] = proto.getResultXml;
  // proto['getResultCode'] = proto.getResultCode;
})();