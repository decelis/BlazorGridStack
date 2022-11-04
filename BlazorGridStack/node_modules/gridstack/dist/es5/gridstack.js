"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridStack = void 0;
/*!
 * GridStack 7.1.0
 * https://gridstackjs.com/
 *
 * Copyright (c) 2021-2022 Alain Dumesny
 * see root license https://github.com/gridstack/gridstack.js/tree/master/LICENSE
 */
var gridstack_engine_1 = require("./gridstack-engine");
var utils_1 = require("./utils");
var types_1 = require("./types");
// export all dependent file as well to make it easier for users to just import the main file
__exportStar(require("./types"), exports);
__exportStar(require("./utils"), exports);
__exportStar(require("./gridstack-engine"), exports);
/**
 * Main gridstack class - you will need to call `GridStack.init()` first to initialize your grid.
 * Note: your grid elements MUST have the following classes for the CSS layout to work:
 * @example
 * <div class="grid-stack">
 *   <div class="grid-stack-item">
 *     <div class="grid-stack-item-content">Item 1</div>
 *   </div>
 * </div>
 */
var GridStack = /** @class */ (function () {
    /**
     * Construct a grid item from the given element and options
     * @param el
     * @param opts
     */
    function GridStack(el, opts) {
        var _this = this;
        if (opts === void 0) { opts = {}; }
        var _a, _b;
        /** @internal */
        this._gsEventHandler = {};
        /** @internal extra row added when dragging at the bottom of the grid */
        this._extraDragRow = 0;
        this.el = el; // exposed HTML element to the user
        opts = opts || {}; // handles null/undefined/0
        // if row property exists, replace minRow and maxRow instead
        if (opts.row) {
            opts.minRow = opts.maxRow = opts.row;
            delete opts.row;
        }
        var rowAttr = utils_1.Utils.toNumber(el.getAttribute('gs-row'));
        // flag only valid in sub-grids (handled by parent, not here)
        if (opts.column === 'auto') {
            delete opts.column;
        }
        // 'minWidth' legacy support in 5.1
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        var anyOpts = opts;
        if (anyOpts.minWidth !== undefined) {
            opts.oneColumnSize = opts.oneColumnSize || anyOpts.minWidth;
            delete anyOpts.minWidth;
        }
        // save original setting so we can restore on save
        if (opts.alwaysShowResizeHandle !== undefined) {
            opts._alwaysShowResizeHandle = opts.alwaysShowResizeHandle;
        }
        // elements DOM attributes override any passed options (like CSS style) - merge the two together
        var defaults = __assign(__assign({}, utils_1.Utils.cloneDeep(types_1.gridDefaults)), { column: utils_1.Utils.toNumber(el.getAttribute('gs-column')) || types_1.gridDefaults.column, minRow: rowAttr ? rowAttr : utils_1.Utils.toNumber(el.getAttribute('gs-min-row')) || types_1.gridDefaults.minRow, maxRow: rowAttr ? rowAttr : utils_1.Utils.toNumber(el.getAttribute('gs-max-row')) || types_1.gridDefaults.maxRow, staticGrid: utils_1.Utils.toBool(el.getAttribute('gs-static')) || types_1.gridDefaults.staticGrid, draggable: {
                handle: (opts.handleClass ? '.' + opts.handleClass : (opts.handle ? opts.handle : '')) || types_1.gridDefaults.draggable.handle,
            }, removableOptions: {
                accept: opts.itemClass ? '.' + opts.itemClass : types_1.gridDefaults.removableOptions.accept,
            } });
        if (el.getAttribute('gs-animate')) { // default to true, but if set to false use that instead
            defaults.animate = utils_1.Utils.toBool(el.getAttribute('gs-animate'));
        }
        this.opts = utils_1.Utils.defaults(opts, defaults);
        opts = null; // make sure we use this.opts instead
        this._initMargin(); // part of settings defaults...
        // Now check if we're loading into 1 column mode FIRST so we don't do un-necessary work (like cellHeight = width / 12 then go 1 column)
        if (this.opts.column !== 1 && !this.opts.disableOneColumnMode && this._widthOrContainer() <= this.opts.oneColumnSize) {
            this._prevColumn = this.getColumn();
            this.opts.column = 1;
        }
        if (this.opts.rtl === 'auto') {
            this.opts.rtl = (el.style.direction === 'rtl');
        }
        if (this.opts.rtl) {
            this.el.classList.add('grid-stack-rtl');
        }
        // check if we're been nested, and if so update our style and keep pointer around (used during save)
        var parentGridItem = (_a = utils_1.Utils.closestUpByClass(this.el, types_1.gridDefaults.itemClass)) === null || _a === void 0 ? void 0 : _a.gridstackNode;
        if (parentGridItem) {
            parentGridItem.subGrid = this;
            this.parentGridItem = parentGridItem;
            this.el.classList.add('grid-stack-nested');
            parentGridItem.el.classList.add('grid-stack-sub-grid');
        }
        this._isAutoCellHeight = (this.opts.cellHeight === 'auto');
        if (this._isAutoCellHeight || this.opts.cellHeight === 'initial') {
            // make the cell content square initially (will use resize/column event to keep it square)
            this.cellHeight(undefined, false);
        }
        else {
            // append unit if any are set
            if (typeof this.opts.cellHeight == 'number' && this.opts.cellHeightUnit && this.opts.cellHeightUnit !== types_1.gridDefaults.cellHeightUnit) {
                this.opts.cellHeight = this.opts.cellHeight + this.opts.cellHeightUnit;
                delete this.opts.cellHeightUnit;
            }
            this.cellHeight(this.opts.cellHeight, false);
        }
        // see if we need to adjust auto-hide
        if (this.opts.alwaysShowResizeHandle === 'mobile') {
            this.opts.alwaysShowResizeHandle = dd_touch_1.isTouch;
        }
        this._styleSheetClass = 'grid-stack-instance-' + gridstack_engine_1.GridStackEngine._idSeq++;
        this.el.classList.add(this._styleSheetClass);
        this._setStaticClass();
        var engineClass = this.opts.engineClass || GridStack.engineClass || gridstack_engine_1.GridStackEngine;
        this.engine = new engineClass({
            column: this.getColumn(),
            float: this.opts.float,
            maxRow: this.opts.maxRow,
            onChange: function (cbNodes) {
                var maxH = 0;
                _this.engine.nodes.forEach(function (n) { maxH = Math.max(maxH, n.y + n.h); });
                cbNodes.forEach(function (n) {
                    var el = n.el;
                    if (!el)
                        return;
                    if (n._removeDOM) {
                        if (el)
                            el.remove();
                        delete n._removeDOM;
                    }
                    else {
                        _this._writePosAttr(el, n);
                    }
                });
                _this._updateStyles(false, maxH); // false = don't recreate, just append if need be
            }
        });
        if (this.opts.auto) {
            this.batchUpdate(); // prevent in between re-layout #1535 TODO: this only set float=true, need to prevent collision check...
            var elements_1 = [];
            var column_1 = this.getColumn();
            if (column_1 === 1 && this._prevColumn)
                column_1 = this._prevColumn; // do 12 column when reading into 1 column mode
            this.getGridItems().forEach(function (el) {
                var x = parseInt(el.getAttribute('gs-x'));
                var y = parseInt(el.getAttribute('gs-y'));
                elements_1.push({
                    el: el,
                    // if x,y are missing (autoPosition) add them to end of list - but keep their respective DOM order
                    i: (Number.isNaN(x) ? 1000 : x) + (Number.isNaN(y) ? 1000 : y) * column_1
                });
            });
            elements_1.sort(function (a, b) { return b.i - a.i; }).forEach(function (e) { return _this._prepareElement(e.el); }); // revert sort so lowest item wins
            this.batchUpdate(false);
        }
        this.setAnimation(this.opts.animate);
        this._updateStyles();
        if (this.opts.column != 12) {
            this.el.classList.add('grid-stack-' + this.opts.column);
        }
        // legacy support to appear 'per grid` options when really global.
        if (this.opts.dragIn)
            GridStack.setupDragIn(this.opts.dragIn, this.opts.dragInOptions);
        delete this.opts.dragIn;
        delete this.opts.dragInOptions;
        // dynamic grids require pausing during drag to detect over to nest vs push
        if (this.opts.subGridDynamic && !dd_manager_1.DDManager.pauseDrag)
            dd_manager_1.DDManager.pauseDrag = true;
        if (((_b = this.opts.draggable) === null || _b === void 0 ? void 0 : _b.pause) !== undefined)
            dd_manager_1.DDManager.pauseDrag = this.opts.draggable.pause;
        this._setupRemoveDrop();
        this._setupAcceptWidget();
        this._updateWindowResizeEvent();
    }
    /**
     * initializing the HTML element, or selector string, into a grid will return the grid. Calling it again will
     * simply return the existing instance (ignore any passed options). There is also an initAll() version that support
     * multiple grids initialization at once. Or you can use addGrid() to create the entire grid from JSON.
     * @param options grid options (optional)
     * @param elOrString element or CSS selector (first one used) to convert to a grid (default to '.grid-stack' class selector)
     *
     * @example
     * let grid = GridStack.init();
     *
     * Note: the HTMLElement (of type GridHTMLElement) will store a `gridstack: GridStack` value that can be retrieve later
     * let grid = document.querySelector('.grid-stack').gridstack;
     */
    GridStack.init = function (options, elOrString) {
        if (options === void 0) { options = {}; }
        if (elOrString === void 0) { elOrString = '.grid-stack'; }
        var el = GridStack.getGridElement(elOrString);
        if (!el) {
            if (typeof elOrString === 'string') {
                console.error('GridStack.initAll() no grid was found with selector "' + elOrString + '" - element missing or wrong selector ?' +
                    '\nNote: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.');
            }
            else {
                console.error('GridStack.init() no grid element was passed.');
            }
            return null;
        }
        if (!el.gridstack) {
            el.gridstack = new GridStack(el, utils_1.Utils.cloneDeep(options));
        }
        return el.gridstack;
    };
    /**
     * Will initialize a list of elements (given a selector) and return an array of grids.
     * @param options grid options (optional)
     * @param selector elements selector to convert to grids (default to '.grid-stack' class selector)
     *
     * @example
     * let grids = GridStack.initAll();
     * grids.forEach(...)
     */
    GridStack.initAll = function (options, selector) {
        if (options === void 0) { options = {}; }
        if (selector === void 0) { selector = '.grid-stack'; }
        var grids = [];
        GridStack.getGridElements(selector).forEach(function (el) {
            if (!el.gridstack) {
                el.gridstack = new GridStack(el, utils_1.Utils.cloneDeep(options));
                delete options.dragIn;
                delete options.dragInOptions; // only need to be done once (really a static global thing, not per grid)
            }
            grids.push(el.gridstack);
        });
        if (grids.length === 0) {
            console.error('GridStack.initAll() no grid was found with selector "' + selector + '" - element missing or wrong selector ?' +
                '\nNote: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.');
        }
        return grids;
    };
    /**
     * call to create a grid with the given options, including loading any children from JSON structure. This will call GridStack.init(), then
     * grid.load() on any passed children (recursively). Great alternative to calling init() if you want entire grid to come from
     * JSON serialized data, including options.
     * @param parent HTML element parent to the grid
     * @param opt grids options used to initialize the grid, and list of children
     */
    GridStack.addGrid = function (parent, opt) {
        if (opt === void 0) { opt = {}; }
        if (!parent)
            return null;
        // create the grid element, but check if the passed 'parent' already has grid styling and should be used instead
        var el = parent;
        if (!parent.classList.contains('grid-stack')) {
            var doc = document.implementation.createHTMLDocument(''); // IE needs a param
            doc.body.innerHTML = "<div class=\"grid-stack " + (opt.class || '') + "\"></div>";
            el = doc.body.children[0];
            parent.appendChild(el);
        }
        // create grid class and load any children
        var grid = GridStack.init(opt, el);
        if (grid.opts.children) {
            var children = grid.opts.children;
            delete grid.opts.children;
            grid.load(children);
        }
        return grid;
    };
    /** call this method to register your engine instead of the default one.
     * See instead `GridStackOptions.engineClass` if you only need to
     * replace just one instance.
     */
    GridStack.registerEngine = function (engineClass) {
        GridStack.engineClass = engineClass;
    };
    Object.defineProperty(GridStack.prototype, "placeholder", {
        /** @internal create placeholder DIV as needed */
        get: function () {
            if (!this._placeholder) {
                var placeholderChild = document.createElement('div'); // child so padding match item-content
                placeholderChild.className = 'placeholder-content';
                if (this.opts.placeholderText) {
                    placeholderChild.innerHTML = this.opts.placeholderText;
                }
                this._placeholder = document.createElement('div');
                this._placeholder.classList.add(this.opts.placeholderClass, types_1.gridDefaults.itemClass, this.opts.itemClass);
                this.placeholder.appendChild(placeholderChild);
            }
            return this._placeholder;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * add a new widget and returns it.
     *
     * Widget will be always placed even if result height is more than actual grid height.
     * You need to use `willItFit()` before calling addWidget for additional check.
     * See also `makeWidget()`.
     *
     * @example
     * let grid = GridStack.init();
     * grid.addWidget({w: 3, content: 'hello'});
     * grid.addWidget('<div class="grid-stack-item"><div class="grid-stack-item-content">hello</div></div>', {w: 3});
     *
     * @param el  GridStackWidget (which can have content string as well), html element, or string definition to add
     * @param options widget position/size options (optional, and ignore if first param is already option) - see GridStackWidget
     */
    GridStack.prototype.addWidget = function (els, options) {
        function isGridStackWidget(w) {
            return w.x !== undefined || w.y !== undefined || w.w !== undefined || w.h !== undefined || w.content !== undefined ? true : false;
        }
        var el;
        if (typeof els === 'string') {
            var doc = document.implementation.createHTMLDocument(''); // IE needs a param
            doc.body.innerHTML = els;
            el = doc.body.children[0];
        }
        else if (arguments.length === 0 || arguments.length === 1 && isGridStackWidget(els)) {
            var content = els ? els.content || '' : '';
            options = els;
            var doc = document.implementation.createHTMLDocument(''); // IE needs a param
            doc.body.innerHTML = "<div class=\"grid-stack-item " + (this.opts.itemClass || '') + "\"><div class=\"grid-stack-item-content\">" + content + "</div></div>";
            el = doc.body.children[0];
        }
        else {
            el = els;
        }
        // Tempting to initialize the passed in opt with default and valid values, but this break knockout demos
        // as the actual value are filled in when _prepareElement() calls el.getAttribute('gs-xyz) before adding the node.
        // So make sure we load any DOM attributes that are not specified in passed in options (which override)
        var domAttr = this._readAttr(el);
        options = utils_1.Utils.cloneDeep(options) || {}; // make a copy before we modify in case caller re-uses it
        utils_1.Utils.defaults(options, domAttr);
        var node = this.engine.prepareNode(options);
        this._writeAttr(el, options);
        if (this._insertNotAppend) {
            this.el.prepend(el);
        }
        else {
            this.el.appendChild(el);
        }
        // similar to makeWidget() that doesn't read attr again and worse re-create a new node and loose any _id
        this._prepareElement(el, true, options);
        this._updateContainerHeight();
        // see if there is a sub-grid to create too
        if (node.subGrid) {
            this.makeSubGrid(node.el, undefined, undefined, false);
        }
        // if we're adding an item into 1 column (_prevColumn is set only when going to 1) make sure
        // we don't override the larger 12 column layout that was already saved. #1985
        if (this._prevColumn && this.opts.column === 1) {
            this._ignoreLayoutsNodeChange = true;
        }
        this._triggerAddEvent();
        this._triggerChangeEvent();
        delete this._ignoreLayoutsNodeChange;
        return el;
    };
    /**
     * Convert an existing gridItem element into a sub-grid with the given (optional) options, else inherit them
     * from the parent subGrid options.
     * @param el gridItem element to convert
     * @param ops (optional) sub-grid options, else default to node, then parent settings, else defaults
     * @param nodeToAdd (optional) node to add to the newly created sub grid (used when dragging over existing regular item)
     * @returns newly created grid
     */
    GridStack.prototype.makeSubGrid = function (el, ops, nodeToAdd, saveContent) {
        var _a;
        if (saveContent === void 0) { saveContent = true; }
        var node = el.gridstackNode;
        if (!node) {
            node = this.makeWidget(el).gridstackNode;
        }
        if ((_a = node.subGrid) === null || _a === void 0 ? void 0 : _a.el)
            return node.subGrid; // already done
        ops = utils_1.Utils.cloneDeep(ops || node.subGrid || __assign(__assign({}, this.opts.subGrid), { children: undefined }));
        ops.subGrid = utils_1.Utils.cloneDeep(ops); // carry nesting settings to next one down
        node.subGrid = ops;
        // if column special case it set, remember that flag and set default
        var autoColumn;
        if (ops.column === 'auto') {
            autoColumn = true;
            ops.column = Math.max(node.w || 1, (nodeToAdd === null || nodeToAdd === void 0 ? void 0 : nodeToAdd.w) || 1);
            ops.disableOneColumnMode = true; // driven by parent
        }
        // if we're converting an existing full item, move over the content to be the first sub item in the new grid
        var content = node.el.querySelector('.grid-stack-item-content');
        var newItem;
        var newItemOpt;
        if (saveContent) {
            this._removeDD(node.el); // remove D&D since it's set on content div
            var doc = document.implementation.createHTMLDocument(''); // IE needs a param
            doc.body.innerHTML = "<div class=\"grid-stack-item\"></div>";
            newItem = doc.body.children[0];
            newItem.appendChild(content);
            newItemOpt = __assign(__assign({}, node), { x: 0, y: 0 });
            utils_1.Utils.removeInternalForSave(newItemOpt);
            delete newItemOpt.subGrid;
            if (node.content) {
                newItemOpt.content = node.content;
                delete node.content;
            }
            doc.body.innerHTML = "<div class=\"grid-stack-item-content\"></div>";
            content = doc.body.children[0];
            node.el.appendChild(content);
            this._prepareDragDropByNode(node); // ... and restore original D&D
        }
        // if we're adding an additional item, make the container large enough to have them both
        if (nodeToAdd) {
            var w = autoColumn ? ops.column : node.w;
            var h = node.h + nodeToAdd.h;
            var style_1 = node.el.style;
            style_1.transition = 'none'; // show up instantly so we don't see scrollbar with nodeToAdd
            this.update(node.el, { w: w, h: h });
            setTimeout(function () { return style_1.transition = null; }); // recover animation
        }
        var subGrid = node.subGrid = GridStack.addGrid(content, ops);
        if (nodeToAdd === null || nodeToAdd === void 0 ? void 0 : nodeToAdd._moving)
            subGrid._isTemp = true; // prevent re-nesting as we add over
        if (autoColumn)
            subGrid._autoColumn = true;
        // add the original content back as a child of hte newly created grid
        if (saveContent) {
            subGrid.addWidget(newItem, newItemOpt);
        }
        // now add any additional node
        if (nodeToAdd) {
            if (nodeToAdd._moving) {
                // create an artificial event even for the just created grid to receive this item
                window.setTimeout(function () { return utils_1.Utils.simulateMouseEvent(nodeToAdd._event, 'mouseenter', subGrid.el); }, 0);
            }
            else {
                subGrid.addWidget(node.el, node);
            }
        }
        return subGrid;
    };
    /**
     * called when an item was converted into a nested grid to accommodate a dragged over item, but then item leaves - return back
     * to the original grid-item. Also called to remove empty sub-grids when last item is dragged out (since re-creating is simple)
     */
    GridStack.prototype.removeAsSubGrid = function (nodeThatRemoved) {
        var _this = this;
        var _a;
        var pGrid = (_a = this.parentGridItem) === null || _a === void 0 ? void 0 : _a.grid;
        if (!pGrid)
            return;
        pGrid.batchUpdate();
        pGrid.removeWidget(this.parentGridItem.el, true, true);
        this.engine.nodes.forEach(function (n) {
            // migrate any children over and offsetting by our location
            n.x += _this.parentGridItem.x;
            n.y += _this.parentGridItem.y;
            pGrid.addWidget(n.el, n);
        });
        pGrid.batchUpdate(false);
        delete this.parentGridItem;
        // create an artificial event for the original grid now that this one is gone (got a leave, but won't get enter)
        if (nodeThatRemoved) {
            window.setTimeout(function () { return utils_1.Utils.simulateMouseEvent(nodeThatRemoved._event, 'mouseenter', pGrid.el); }, 0);
        }
    };
    /**
    /**
     * saves the current layout returning a list of widgets for serialization which might include any nested grids.
     * @param saveContent if true (default) the latest html inside .grid-stack-content will be saved to GridStackWidget.content field, else it will
     * be removed.
     * @param saveGridOpt if true (default false), save the grid options itself, so you can call the new GridStack.addGrid()
     * to recreate everything from scratch. GridStackOptions.children would then contain the widget list instead.
     * @returns list of widgets or full grid option, including .children list of widgets
     */
    GridStack.prototype.save = function (saveContent, saveGridOpt) {
        if (saveContent === void 0) { saveContent = true; }
        if (saveGridOpt === void 0) { saveGridOpt = false; }
        // return copied nodes we can modify at will...
        var list = this.engine.save(saveContent);
        // check for HTML content and nested grids
        list.forEach(function (n) {
            if (saveContent && n.el && !n.subGrid) { // sub-grid are saved differently, not plain content
                var sub = n.el.querySelector('.grid-stack-item-content');
                n.content = sub ? sub.innerHTML : undefined;
                if (!n.content)
                    delete n.content;
            }
            else {
                if (!saveContent) {
                    delete n.content;
                }
                // check for nested grid
                if (n.subGrid) {
                    n.subGrid = n.subGrid.save(saveContent, true);
                }
            }
            delete n.el;
        });
        // check if save entire grid options (needed for recursive) + children...
        if (saveGridOpt) {
            var o = utils_1.Utils.cloneDeep(this.opts);
            // delete default values that will be recreated on launch
            if (o.marginBottom === o.marginTop && o.marginRight === o.marginLeft && o.marginTop === o.marginRight) {
                o.margin = o.marginTop;
                delete o.marginTop;
                delete o.marginRight;
                delete o.marginBottom;
                delete o.marginLeft;
            }
            if (o.rtl === (this.el.style.direction === 'rtl')) {
                o.rtl = 'auto';
            }
            if (this._isAutoCellHeight) {
                o.cellHeight = 'auto';
            }
            if (this._autoColumn) {
                o.column = 'auto';
                delete o.disableOneColumnMode;
            }
            var origShow = o._alwaysShowResizeHandle;
            delete o._alwaysShowResizeHandle;
            if (origShow !== undefined) {
                o.alwaysShowResizeHandle = origShow;
            }
            else {
                delete o.alwaysShowResizeHandle;
            }
            utils_1.Utils.removeInternalAndSame(o, types_1.gridDefaults);
            o.children = list;
            return o;
        }
        return list;
    };
    /**
     * load the widgets from a list. This will call update() on each (matching by id) or add/remove widgets that are not there.
     *
     * @param layout list of widgets definition to update/create
     * @param addAndRemove boolean (default true) or callback method can be passed to control if and how missing widgets can be added/removed, giving
     * the user control of insertion.
     *
     * @example
     * see http://gridstackjs.com/demo/serialization.html
     **/
    GridStack.prototype.load = function (layout, addAndRemove) {
        var _this = this;
        if (addAndRemove === void 0) { addAndRemove = true; }
        var items = GridStack.Utils.sort(__spreadArrays(layout), -1, this._prevColumn || this.getColumn()); // make copy before we mod/sort
        this._insertNotAppend = true; // since create in reverse order...
        // if we're loading a layout into for example 1 column (_prevColumn is set only when going to 1) and items don't fit, make sure to save
        // the original wanted layout so we can scale back up correctly #1471
        if (this._prevColumn && this._prevColumn !== this.opts.column && items.some(function (n) { return (n.x + n.w) > _this.opts.column; })) {
            this._ignoreLayoutsNodeChange = true; // skip layout update
            this.engine.cacheLayout(items, this._prevColumn, true);
        }
        var removed = [];
        this.batchUpdate();
        // see if any items are missing from new layout and need to be removed first
        if (addAndRemove) {
            var copyNodes = __spreadArrays(this.engine.nodes); // don't loop through array you modify
            copyNodes.forEach(function (n) {
                var item = items.find(function (w) { return n.id === w.id; });
                if (!item) {
                    if (typeof (addAndRemove) === 'function') {
                        addAndRemove(_this, n, false);
                    }
                    else {
                        removed.push(n); // batch keep track
                        _this.removeWidget(n.el, true, false);
                    }
                }
            });
        }
        // now add/update the widgets
        items.forEach(function (w) {
            var item = (w.id || w.id === 0) ? _this.engine.nodes.find(function (n) { return n.id === w.id; }) : undefined;
            if (item) {
                _this.update(item.el, w);
                if (w.subGrid && w.subGrid.children) { // update any sub grid as well
                    var sub = item.el.querySelector('.grid-stack');
                    if (sub && sub.gridstack) {
                        sub.gridstack.load(w.subGrid.children); // TODO: support updating grid options ?
                        _this._insertNotAppend = true; // got reset by above call
                    }
                }
            }
            else if (addAndRemove) {
                if (typeof (addAndRemove) === 'function') {
                    w = addAndRemove(_this, w, true).gridstackNode;
                }
                else {
                    w = _this.addWidget(w).gridstackNode;
                }
            }
        });
        this.engine.removedNodes = removed;
        this.batchUpdate(false);
        // after commit, clear that flag
        delete this._ignoreLayoutsNodeChange;
        delete this._insertNotAppend;
        return this;
    };
    /**
     * use before calling a bunch of `addWidget()` to prevent un-necessary relayouts in between (more efficient)
     * and get a single event callback. You will see no changes until `batchUpdate(false)` is called.
     */
    GridStack.prototype.batchUpdate = function (flag) {
        if (flag === void 0) { flag = true; }
        this.engine.batchUpdate(flag);
        if (!flag) {
            this._triggerRemoveEvent();
            this._triggerAddEvent();
            this._triggerChangeEvent();
        }
        return this;
    };
    /**
     * Gets current cell height.
     */
    GridStack.prototype.getCellHeight = function (forcePixel) {
        if (forcePixel === void 0) { forcePixel = false; }
        if (this.opts.cellHeight && this.opts.cellHeight !== 'auto' &&
            (!forcePixel || !this.opts.cellHeightUnit || this.opts.cellHeightUnit === 'px')) {
            return this.opts.cellHeight;
        }
        // else get first cell height
        var el = this.el.querySelector('.' + this.opts.itemClass);
        if (el) {
            var height = utils_1.Utils.toNumber(el.getAttribute('gs-h'));
            return Math.round(el.offsetHeight / height);
        }
        // else do entire grid and # of rows (but doesn't work if min-height is the actual constrain)
        var rows = parseInt(this.el.getAttribute('gs-current-row'));
        return rows ? Math.round(this.el.getBoundingClientRect().height / rows) : this.opts.cellHeight;
    };
    /**
     * Update current cell height - see `GridStackOptions.cellHeight` for format.
     * This method rebuilds an internal CSS style sheet.
     * Note: You can expect performance issues if call this method too often.
     *
     * @param val the cell height. If not passed (undefined), cells content will be made square (match width minus margin),
     * if pass 0 the CSS will be generated by the application instead.
     * @param update (Optional) if false, styles will not be updated
     *
     * @example
     * grid.cellHeight(100); // same as 100px
     * grid.cellHeight('70px');
     * grid.cellHeight(grid.cellWidth() * 1.2);
     */
    GridStack.prototype.cellHeight = function (val, update) {
        if (update === void 0) { update = true; }
        // if not called internally, check if we're changing mode
        if (update && val !== undefined) {
            if (this._isAutoCellHeight !== (val === 'auto')) {
                this._isAutoCellHeight = (val === 'auto');
                this._updateWindowResizeEvent();
            }
        }
        if (val === 'initial' || val === 'auto') {
            val = undefined;
        }
        // make item content be square
        if (val === undefined) {
            var marginDiff = -this.opts.marginRight - this.opts.marginLeft
                + this.opts.marginTop + this.opts.marginBottom;
            val = this.cellWidth() + marginDiff;
        }
        var data = utils_1.Utils.parseHeight(val);
        if (this.opts.cellHeightUnit === data.unit && this.opts.cellHeight === data.h) {
            return this;
        }
        this.opts.cellHeightUnit = data.unit;
        this.opts.cellHeight = data.h;
        if (update) {
            this._updateStyles(true); // true = force re-create for current # of rows
        }
        return this;
    };
    /** Gets current cell width. */
    GridStack.prototype.cellWidth = function () {
        return this._widthOrContainer() / this.getColumn();
    };
    /** return our expected width (or parent) for 1 column check */
    GridStack.prototype._widthOrContainer = function () {
        // use `offsetWidth` or `clientWidth` (no scrollbar) ?
        // https://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively
        return (this.el.clientWidth || this.el.parentElement.clientWidth || window.innerWidth);
    };
    /** re-layout grid items to reclaim any empty space */
    GridStack.prototype.compact = function () {
        this.engine.compact();
        this._triggerChangeEvent();
        return this;
    };
    /**
     * set the number of columns in the grid. Will update existing widgets to conform to new number of columns,
     * as well as cache the original layout so you can revert back to previous positions without loss.
     * Requires `gridstack-extra.css` or `gridstack-extra.min.css` for [2-11],
     * else you will need to generate correct CSS (see https://github.com/gridstack/gridstack.js#change-grid-columns)
     * @param column - Integer > 0 (default 12).
     * @param layout specify the type of re-layout that will happen (position, size, etc...).
     * Note: items will never be outside of the current column boundaries. default (moveScale). Ignored for 1 column
     */
    GridStack.prototype.column = function (column, layout) {
        if (layout === void 0) { layout = 'moveScale'; }
        if (column < 1 || this.opts.column === column)
            return this;
        var oldColumn = this.getColumn();
        // if we go into 1 column mode (which happens if we're sized less than minW unless disableOneColumnMode is on)
        // then remember the original columns so we can restore.
        if (column === 1) {
            this._prevColumn = oldColumn;
        }
        else {
            delete this._prevColumn;
        }
        this.el.classList.remove('grid-stack-' + oldColumn);
        this.el.classList.add('grid-stack-' + column);
        this.opts.column = this.engine.column = column;
        // update the items now - see if the dom order nodes should be passed instead (else default to current list)
        var domNodes;
        if (column === 1 && this.opts.oneColumnModeDomSort) {
            domNodes = [];
            this.getGridItems().forEach(function (el) {
                if (el.gridstackNode) {
                    domNodes.push(el.gridstackNode);
                }
            });
            if (!domNodes.length) {
                domNodes = undefined;
            }
        }
        this.engine.updateNodeWidths(oldColumn, column, domNodes, layout);
        if (this._isAutoCellHeight)
            this.cellHeight();
        // and trigger our event last...
        this._ignoreLayoutsNodeChange = true; // skip layout update
        this._triggerChangeEvent();
        delete this._ignoreLayoutsNodeChange;
        return this;
    };
    /**
     * get the number of columns in the grid (default 12)
     */
    GridStack.prototype.getColumn = function () {
        return this.opts.column;
    };
    /** returns an array of grid HTML elements (no placeholder) - used to iterate through our children in DOM order */
    GridStack.prototype.getGridItems = function () {
        var _this = this;
        return Array.from(this.el.children)
            .filter(function (el) { return el.matches('.' + _this.opts.itemClass) && !el.matches('.' + _this.opts.placeholderClass); });
    };
    /**
     * Destroys a grid instance. DO NOT CALL any methods or access any vars after this as it will free up members.
     * @param removeDOM if `false` grid and items HTML elements will not be removed from the DOM (Optional. Default `true`).
     */
    GridStack.prototype.destroy = function (removeDOM) {
        if (removeDOM === void 0) { removeDOM = true; }
        if (!this.el)
            return; // prevent multiple calls
        this._updateWindowResizeEvent(true);
        this.setStatic(true, false); // permanently removes DD but don't set CSS class (we're going away)
        this.setAnimation(false);
        if (!removeDOM) {
            this.removeAll(removeDOM);
            this.el.classList.remove(this._styleSheetClass);
        }
        else {
            this.el.parentNode.removeChild(this.el);
        }
        this._removeStylesheet();
        this.el.removeAttribute('gs-current-row');
        delete this.parentGridItem;
        delete this.opts;
        delete this._placeholder;
        delete this.engine;
        delete this.el.gridstack; // remove circular dependency that would prevent a freeing
        delete this.el;
        return this;
    };
    /**
     * enable/disable floating widgets (default: `false`) See [example](http://gridstackjs.com/demo/float.html)
     */
    GridStack.prototype.float = function (val) {
        if (this.opts.float !== val) {
            this.opts.float = this.engine.float = val;
            this._triggerChangeEvent();
        }
        return this;
    };
    /**
     * get the current float mode
     */
    GridStack.prototype.getFloat = function () {
        return this.engine.float;
    };
    /**
     * Get the position of the cell under a pixel on screen.
     * @param position the position of the pixel to resolve in
     * absolute coordinates, as an object with top and left properties
     * @param useDocRelative if true, value will be based on document position vs parent position (Optional. Default false).
     * Useful when grid is within `position: relative` element
     *
     * Returns an object with properties `x` and `y` i.e. the column and row in the grid.
     */
    GridStack.prototype.getCellFromPixel = function (position, useDocRelative) {
        if (useDocRelative === void 0) { useDocRelative = false; }
        var box = this.el.getBoundingClientRect();
        // console.log(`getBoundingClientRect left: ${box.left} top: ${box.top} w: ${box.w} h: ${box.h}`)
        var containerPos;
        if (useDocRelative) {
            containerPos = { top: box.top + document.documentElement.scrollTop, left: box.left };
            // console.log(`getCellFromPixel scrollTop: ${document.documentElement.scrollTop}`)
        }
        else {
            containerPos = { top: this.el.offsetTop, left: this.el.offsetLeft };
            // console.log(`getCellFromPixel offsetTop: ${containerPos.left} offsetLeft: ${containerPos.top}`)
        }
        var relativeLeft = position.left - containerPos.left;
        var relativeTop = position.top - containerPos.top;
        var columnWidth = (box.width / this.getColumn());
        var rowHeight = (box.height / parseInt(this.el.getAttribute('gs-current-row')));
        return { x: Math.floor(relativeLeft / columnWidth), y: Math.floor(relativeTop / rowHeight) };
    };
    /** returns the current number of rows, which will be at least `minRow` if set */
    GridStack.prototype.getRow = function () {
        return Math.max(this.engine.getRow(), this.opts.minRow);
    };
    /**
     * Checks if specified area is empty.
     * @param x the position x.
     * @param y the position y.
     * @param w the width of to check
     * @param h the height of to check
     */
    GridStack.prototype.isAreaEmpty = function (x, y, w, h) {
        return this.engine.isAreaEmpty(x, y, w, h);
    };
    /**
     * If you add elements to your grid by hand, you have to tell gridstack afterwards to make them widgets.
     * If you want gridstack to add the elements for you, use `addWidget()` instead.
     * Makes the given element a widget and returns it.
     * @param els widget or single selector to convert.
     *
     * @example
     * let grid = GridStack.init();
     * grid.el.appendChild('<div id="gsi-1" gs-w="3"></div>');
     * grid.makeWidget('#gsi-1');
     */
    GridStack.prototype.makeWidget = function (els) {
        var el = GridStack.getElement(els);
        this._prepareElement(el, true);
        this._updateContainerHeight();
        this._triggerAddEvent();
        this._triggerChangeEvent();
        return el;
    };
    /**
     * Event handler that extracts our CustomEvent data out automatically for receiving custom
     * notifications (see doc for supported events)
     * @param name of the event (see possible values) or list of names space separated
     * @param callback function called with event and optional second/third param
     * (see README documentation for each signature).
     *
     * @example
     * grid.on('added', function(e, items) { log('added ', items)} );
     * or
     * grid.on('added removed change', function(e, items) { log(e.type, items)} );
     *
     * Note: in some cases it is the same as calling native handler and parsing the event.
     * grid.el.addEventListener('added', function(event) { log('added ', event.detail)} );
     *
     */
    GridStack.prototype.on = function (name, callback) {
        var _this = this;
        // check for array of names being passed instead
        if (name.indexOf(' ') !== -1) {
            var names = name.split(' ');
            names.forEach(function (name) { return _this.on(name, callback); });
            return this;
        }
        if (name === 'change' || name === 'added' || name === 'removed' || name === 'enable' || name === 'disable') {
            // native CustomEvent handlers - cash the generic handlers so we can easily remove
            var noData = (name === 'enable' || name === 'disable');
            if (noData) {
                this._gsEventHandler[name] = function (event) { return callback(event); };
            }
            else {
                this._gsEventHandler[name] = function (event) { return callback(event, event.detail); };
            }
            this.el.addEventListener(name, this._gsEventHandler[name]);
        }
        else if (name === 'drag' || name === 'dragstart' || name === 'dragstop' || name === 'resizestart' || name === 'resize' || name === 'resizestop' || name === 'dropped') {
            // drag&drop stop events NEED to be call them AFTER we update node attributes so handle them ourself.
            // do same for start event to make it easier...
            this._gsEventHandler[name] = callback;
        }
        else {
            console.log('GridStack.on(' + name + ') event not supported, but you can still use $(".grid-stack").on(...) while jquery-ui is still used internally.');
        }
        return this;
    };
    /**
     * unsubscribe from the 'on' event below
     * @param name of the event (see possible values)
     */
    GridStack.prototype.off = function (name) {
        var _this = this;
        // check for array of names being passed instead
        if (name.indexOf(' ') !== -1) {
            var names = name.split(' ');
            names.forEach(function (name) { return _this.off(name); });
            return this;
        }
        if (name === 'change' || name === 'added' || name === 'removed' || name === 'enable' || name === 'disable') {
            // remove native CustomEvent handlers
            if (this._gsEventHandler[name]) {
                this.el.removeEventListener(name, this._gsEventHandler[name]);
            }
        }
        delete this._gsEventHandler[name];
        return this;
    };
    /**
     * Removes widget from the grid.
     * @param el  widget or selector to modify
     * @param removeDOM if `false` DOM element won't be removed from the tree (Default? true).
     * @param triggerEvent if `false` (quiet mode) element will not be added to removed list and no 'removed' callbacks will be called (Default? true).
     */
    GridStack.prototype.removeWidget = function (els, removeDOM, triggerEvent) {
        var _this = this;
        if (removeDOM === void 0) { removeDOM = true; }
        if (triggerEvent === void 0) { triggerEvent = true; }
        GridStack.getElements(els).forEach(function (el) {
            if (el.parentElement && el.parentElement !== _this.el)
                return; // not our child!
            var node = el.gridstackNode;
            // For Meteor support: https://github.com/gridstack/gridstack.js/pull/272
            if (!node) {
                node = _this.engine.nodes.find(function (n) { return el === n.el; });
            }
            if (!node)
                return;
            // remove our DOM data (circular link) and drag&drop permanently
            delete el.gridstackNode;
            _this._removeDD(el);
            _this.engine.removeNode(node, removeDOM, triggerEvent);
            if (removeDOM && el.parentElement) {
                el.remove(); // in batch mode engine.removeNode doesn't call back to remove DOM
            }
        });
        if (triggerEvent) {
            this._triggerRemoveEvent();
            this._triggerChangeEvent();
        }
        return this;
    };
    /**
     * Removes all widgets from the grid.
     * @param removeDOM if `false` DOM elements won't be removed from the tree (Default? `true`).
     */
    GridStack.prototype.removeAll = function (removeDOM) {
        var _this = this;
        if (removeDOM === void 0) { removeDOM = true; }
        // always remove our DOM data (circular link) before list gets emptied and drag&drop permanently
        this.engine.nodes.forEach(function (n) {
            delete n.el.gridstackNode;
            _this._removeDD(n.el);
        });
        this.engine.removeAll(removeDOM);
        this._triggerRemoveEvent();
        return this;
    };
    /**
     * Toggle the grid animation state.  Toggles the `grid-stack-animate` class.
     * @param doAnimate if true the grid will animate.
     */
    GridStack.prototype.setAnimation = function (doAnimate) {
        if (doAnimate) {
            this.el.classList.add('grid-stack-animate');
        }
        else {
            this.el.classList.remove('grid-stack-animate');
        }
        return this;
    };
    /**
     * Toggle the grid static state, which permanently removes/add Drag&Drop support, unlike disable()/enable() that just turns it off/on.
     * Also toggle the grid-stack-static class.
     * @param val if true the grid become static.
     */
    GridStack.prototype.setStatic = function (val, updateClass) {
        var _this = this;
        if (updateClass === void 0) { updateClass = true; }
        if (this.opts.staticGrid === val)
            return this;
        this.opts.staticGrid = val;
        this._setupRemoveDrop();
        this._setupAcceptWidget();
        this.engine.nodes.forEach(function (n) { return _this._prepareDragDropByNode(n); }); // either delete or init Drag&drop
        if (updateClass) {
            this._setStaticClass();
        }
        return this;
    };
    /**
     * Updates widget position/size and other info. Note: if you need to call this on all nodes, use load() instead which will update what changed.
     * @param els  widget or selector of objects to modify (note: setting the same x,y for multiple items will be indeterministic and likely unwanted)
     * @param opt new widget options (x,y,w,h, etc..). Only those set will be updated.
     */
    GridStack.prototype.update = function (els, opt) {
        var _this = this;
        // support legacy call for now ?
        if (arguments.length > 2) {
            console.warn('gridstack.ts: `update(el, x, y, w, h)` is deprecated. Use `update(el, {x, w, content, ...})`. It will be removed soon');
            // eslint-disable-next-line prefer-rest-params
            var a = arguments, i = 1;
            opt = { x: a[i++], y: a[i++], w: a[i++], h: a[i++] };
            return this.update(els, opt);
        }
        GridStack.getElements(els).forEach(function (el) {
            if (!el || !el.gridstackNode)
                return;
            var n = el.gridstackNode;
            var w = utils_1.Utils.cloneDeep(opt); // make a copy we can modify in case they re-use it or multiple items
            delete w.autoPosition;
            // move/resize widget if anything changed
            var keys = ['x', 'y', 'w', 'h'];
            var m;
            if (keys.some(function (k) { return w[k] !== undefined && w[k] !== n[k]; })) {
                m = {};
                keys.forEach(function (k) {
                    m[k] = (w[k] !== undefined) ? w[k] : n[k];
                    delete w[k];
                });
            }
            // for a move as well IFF there is any min/max fields set
            if (!m && (w.minW || w.minH || w.maxW || w.maxH)) {
                m = {}; // will use node position but validate values
            }
            // check for content changing
            if (w.content) {
                var sub = el.querySelector('.grid-stack-item-content');
                if (sub && sub.innerHTML !== w.content) {
                    sub.innerHTML = w.content;
                }
                delete w.content;
            }
            // any remaining fields are assigned, but check for dragging changes, resize constrain
            var changed = false;
            var ddChanged = false;
            for (var key in w) {
                if (key[0] !== '_' && n[key] !== w[key]) {
                    n[key] = w[key];
                    changed = true;
                    ddChanged = ddChanged || (!_this.opts.staticGrid && (key === 'noResize' || key === 'noMove' || key === 'locked'));
                }
            }
            // finally move the widget
            if (m) {
                _this.engine.cleanNodes()
                    .beginUpdate(n)
                    .moveNode(n, m);
                _this._updateContainerHeight();
                _this._triggerChangeEvent();
                _this.engine.endUpdate();
            }
            if (changed) { // move will only update x,y,w,h so update the rest too
                _this._writeAttr(el, n);
            }
            if (ddChanged) {
                _this._prepareDragDropByNode(n);
            }
        });
        return this;
    };
    /**
     * Updates the margins which will set all 4 sides at once - see `GridStackOptions.margin` for format options (CSS string format of 1,2,4 values or single number).
     * @param value margin value
     */
    GridStack.prototype.margin = function (value) {
        var isMultiValue = (typeof value === 'string' && value.split(' ').length > 1);
        // check if we can skip re-creating our CSS file... won't check if multi values (too much hassle)
        if (!isMultiValue) {
            var data = utils_1.Utils.parseHeight(value);
            if (this.opts.marginUnit === data.unit && this.opts.margin === data.h)
                return;
        }
        // re-use existing margin handling
        this.opts.margin = value;
        this.opts.marginTop = this.opts.marginBottom = this.opts.marginLeft = this.opts.marginRight = undefined;
        this._initMargin();
        this._updateStyles(true); // true = force re-create
        return this;
    };
    /** returns current margin number value (undefined if 4 sides don't match) */
    GridStack.prototype.getMargin = function () { return this.opts.margin; };
    /**
     * Returns true if the height of the grid will be less than the vertical
     * constraint. Always returns true if grid doesn't have height constraint.
     * @param node contains x,y,w,h,auto-position options
     *
     * @example
     * if (grid.willItFit(newWidget)) {
     *   grid.addWidget(newWidget);
     * } else {
     *   alert('Not enough free space to place the widget');
     * }
     */
    GridStack.prototype.willItFit = function (node) {
        // support legacy call for now
        if (arguments.length > 1) {
            console.warn('gridstack.ts: `willItFit(x,y,w,h,autoPosition)` is deprecated. Use `willItFit({x, y,...})`. It will be removed soon');
            // eslint-disable-next-line prefer-rest-params
            var a = arguments, i = 0, w = { x: a[i++], y: a[i++], w: a[i++], h: a[i++], autoPosition: a[i++] };
            return this.willItFit(w);
        }
        return this.engine.willItFit(node);
    };
    /** @internal */
    GridStack.prototype._triggerChangeEvent = function () {
        if (this.engine.batchMode)
            return this;
        var elements = this.engine.getDirtyNodes(true); // verify they really changed
        if (elements && elements.length) {
            if (!this._ignoreLayoutsNodeChange) {
                this.engine.layoutsNodesChange(elements);
            }
            this._triggerEvent('change', elements);
        }
        this.engine.saveInitial(); // we called, now reset initial values & dirty flags
        return this;
    };
    /** @internal */
    GridStack.prototype._triggerAddEvent = function () {
        if (this.engine.batchMode)
            return this;
        if (this.engine.addedNodes && this.engine.addedNodes.length > 0) {
            if (!this._ignoreLayoutsNodeChange) {
                this.engine.layoutsNodesChange(this.engine.addedNodes);
            }
            // prevent added nodes from also triggering 'change' event (which is called next)
            this.engine.addedNodes.forEach(function (n) { delete n._dirty; });
            this._triggerEvent('added', this.engine.addedNodes);
            this.engine.addedNodes = [];
        }
        return this;
    };
    /** @internal */
    GridStack.prototype._triggerRemoveEvent = function () {
        if (this.engine.batchMode)
            return this;
        if (this.engine.removedNodes && this.engine.removedNodes.length > 0) {
            this._triggerEvent('removed', this.engine.removedNodes);
            this.engine.removedNodes = [];
        }
        return this;
    };
    /** @internal */
    GridStack.prototype._triggerEvent = function (type, data) {
        var event = data ? new CustomEvent(type, { bubbles: false, detail: data }) : new Event(type);
        this.el.dispatchEvent(event);
        return this;
    };
    /** @internal called to delete the current dynamic style sheet used for our layout */
    GridStack.prototype._removeStylesheet = function () {
        if (this._styles) {
            utils_1.Utils.removeStylesheet(this._styleSheetClass);
            delete this._styles;
        }
        return this;
    };
    /** @internal updated/create the CSS styles for row based layout and initial margin setting */
    GridStack.prototype._updateStyles = function (forceUpdate, maxH) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        // call to delete existing one if we change cellHeight / margin
        if (forceUpdate) {
            this._removeStylesheet();
        }
        if (!maxH)
            maxH = this.getRow();
        this._updateContainerHeight();
        // if user is telling us they will handle the CSS themselves by setting heights to 0. Do we need this opts really ??
        if (this.opts.cellHeight === 0) {
            return this;
        }
        var cellHeight = this.opts.cellHeight;
        var cellHeightUnit = this.opts.cellHeightUnit;
        var prefix = "." + this._styleSheetClass + " > ." + this.opts.itemClass;
        // create one as needed
        if (!this._styles) {
            // insert style to parent (instead of 'head' by default) to support WebComponent
            var styleLocation = this.opts.styleInHead ? undefined : this.el.parentNode;
            this._styles = utils_1.Utils.createStylesheet(this._styleSheetClass, styleLocation);
            if (!this._styles)
                return this;
            this._styles._max = 0;
            // these are done once only
            utils_1.Utils.addCSSRule(this._styles, prefix, "min-height: " + cellHeight + cellHeightUnit);
            // content margins
            var top_1 = this.opts.marginTop + this.opts.marginUnit;
            var bottom = this.opts.marginBottom + this.opts.marginUnit;
            var right = this.opts.marginRight + this.opts.marginUnit;
            var left = this.opts.marginLeft + this.opts.marginUnit;
            var content = prefix + " > .grid-stack-item-content";
            var placeholder = "." + this._styleSheetClass + " > .grid-stack-placeholder > .placeholder-content";
            utils_1.Utils.addCSSRule(this._styles, content, "top: " + top_1 + "; right: " + right + "; bottom: " + bottom + "; left: " + left + ";");
            utils_1.Utils.addCSSRule(this._styles, placeholder, "top: " + top_1 + "; right: " + right + "; bottom: " + bottom + "; left: " + left + ";");
            // resize handles offset (to match margin)
            utils_1.Utils.addCSSRule(this._styles, prefix + " > .ui-resizable-ne", "right: " + right);
            utils_1.Utils.addCSSRule(this._styles, prefix + " > .ui-resizable-e", "right: " + right);
            utils_1.Utils.addCSSRule(this._styles, prefix + " > .ui-resizable-se", "right: " + right + "; bottom: " + bottom);
            utils_1.Utils.addCSSRule(this._styles, prefix + " > .ui-resizable-nw", "left: " + left);
            utils_1.Utils.addCSSRule(this._styles, prefix + " > .ui-resizable-w", "left: " + left);
            utils_1.Utils.addCSSRule(this._styles, prefix + " > .ui-resizable-sw", "left: " + left + "; bottom: " + bottom);
        }
        // now update the height specific fields
        maxH = maxH || this._styles._max;
        if (maxH > this._styles._max) {
            var getHeight = function (rows) { return (cellHeight * rows) + cellHeightUnit; };
            for (var i = this._styles._max + 1; i <= maxH; i++) { // start at 1
                var h = getHeight(i);
                utils_1.Utils.addCSSRule(this._styles, prefix + "[gs-y=\"" + (i - 1) + "\"]", "top: " + getHeight(i - 1)); // start at 0
                utils_1.Utils.addCSSRule(this._styles, prefix + "[gs-h=\"" + i + "\"]", "height: " + h);
                utils_1.Utils.addCSSRule(this._styles, prefix + "[gs-min-h=\"" + i + "\"]", "min-height: " + h);
                utils_1.Utils.addCSSRule(this._styles, prefix + "[gs-max-h=\"" + i + "\"]", "max-height: " + h);
            }
            this._styles._max = maxH;
        }
        return this;
    };
    /** @internal */
    GridStack.prototype._updateContainerHeight = function () {
        if (!this.engine || this.engine.batchMode)
            return this;
        var row = this.getRow() + this._extraDragRow; // checks for minRow already
        // check for css min height
        // Note: we don't handle %,rem correctly so comment out, beside we don't need need to create un-necessary
        // rows as the CSS will make us bigger than our set height if needed... not sure why we had this.
        // let cssMinHeight = parseInt(getComputedStyle(this.el)['min-height']);
        // if (cssMinHeight > 0) {
        //   let minRow = Math.round(cssMinHeight / this.getCellHeight(true));
        //   if (row < minRow) {
        //     row = minRow;
        //   }
        // }
        this.el.setAttribute('gs-current-row', String(row));
        if (row === 0) {
            this.el.style.removeProperty('min-height');
            return this;
        }
        var cellHeight = this.opts.cellHeight;
        var unit = this.opts.cellHeightUnit;
        if (!cellHeight)
            return this;
        this.el.style.minHeight = row * cellHeight + unit;
        return this;
    };
    /** @internal */
    GridStack.prototype._prepareElement = function (el, triggerAddEvent, node) {
        if (triggerAddEvent === void 0) { triggerAddEvent = false; }
        if (!node) {
            el.classList.add(this.opts.itemClass);
            node = this._readAttr(el);
        }
        el.gridstackNode = node;
        node.el = el;
        node.grid = this;
        var copy = __assign({}, node);
        node = this.engine.addNode(node, triggerAddEvent);
        // write node attr back in case there was collision or we have to fix bad values during addNode()
        if (!utils_1.Utils.same(node, copy)) {
            this._writeAttr(el, node);
        }
        this._prepareDragDropByNode(node);
        return this;
    };
    /** @internal call to write position x,y,w,h attributes back to element */
    GridStack.prototype._writePosAttr = function (el, n) {
        if (n.x !== undefined && n.x !== null) {
            el.setAttribute('gs-x', String(n.x));
        }
        if (n.y !== undefined && n.y !== null) {
            el.setAttribute('gs-y', String(n.y));
        }
        if (n.w) {
            el.setAttribute('gs-w', String(n.w));
        }
        if (n.h) {
            el.setAttribute('gs-h', String(n.h));
        }
        return this;
    };
    /** @internal call to write any default attributes back to element */
    GridStack.prototype._writeAttr = function (el, node) {
        if (!node)
            return this;
        this._writePosAttr(el, node);
        var attrs /*: GridStackWidget but strings */ = {
            autoPosition: 'gs-auto-position',
            minW: 'gs-min-w',
            minH: 'gs-min-h',
            maxW: 'gs-max-w',
            maxH: 'gs-max-h',
            noResize: 'gs-no-resize',
            noMove: 'gs-no-move',
            locked: 'gs-locked',
            id: 'gs-id',
            resizeHandles: 'gs-resize-handles'
        };
        for (var key in attrs) {
            if (node[key]) { // 0 is valid for x,y only but done above already and not in list anyway
                el.setAttribute(attrs[key], String(node[key]));
            }
            else {
                el.removeAttribute(attrs[key]);
            }
        }
        return this;
    };
    /** @internal call to read any default attributes from element */
    GridStack.prototype._readAttr = function (el) {
        var node = {};
        node.x = utils_1.Utils.toNumber(el.getAttribute('gs-x'));
        node.y = utils_1.Utils.toNumber(el.getAttribute('gs-y'));
        node.w = utils_1.Utils.toNumber(el.getAttribute('gs-w'));
        node.h = utils_1.Utils.toNumber(el.getAttribute('gs-h'));
        node.maxW = utils_1.Utils.toNumber(el.getAttribute('gs-max-w'));
        node.minW = utils_1.Utils.toNumber(el.getAttribute('gs-min-w'));
        node.maxH = utils_1.Utils.toNumber(el.getAttribute('gs-max-h'));
        node.minH = utils_1.Utils.toNumber(el.getAttribute('gs-min-h'));
        node.autoPosition = utils_1.Utils.toBool(el.getAttribute('gs-auto-position'));
        node.noResize = utils_1.Utils.toBool(el.getAttribute('gs-no-resize'));
        node.noMove = utils_1.Utils.toBool(el.getAttribute('gs-no-move'));
        node.locked = utils_1.Utils.toBool(el.getAttribute('gs-locked'));
        node.resizeHandles = el.getAttribute('gs-resize-handles');
        node.id = el.getAttribute('gs-id');
        // remove any key not found (null or false which is default)
        for (var key in node) {
            if (!node.hasOwnProperty(key))
                return;
            if (!node[key] && node[key] !== 0) { // 0 can be valid value (x,y only really)
                delete node[key];
            }
        }
        return node;
    };
    /** @internal */
    GridStack.prototype._setStaticClass = function () {
        var _a, _b;
        var classes = ['grid-stack-static'];
        if (this.opts.staticGrid) {
            (_a = this.el.classList).add.apply(_a, classes);
            this.el.setAttribute('gs-static', 'true');
        }
        else {
            (_b = this.el.classList).remove.apply(_b, classes);
            this.el.removeAttribute('gs-static');
        }
        return this;
    };
    /**
     * called when we are being resized by the window - check if the one Column Mode needs to be turned on/off
     * and remember the prev columns we used, or get our count from parent, as well as check for auto cell height (square)
     */
    GridStack.prototype.onParentResize = function () {
        var _this = this;
        if (!this.el || !this.el.clientWidth)
            return; // return if we're gone or no size yet (will get called again)
        var changedColumn = false;
        // see if we're nested and take our column count from our parent....
        if (this._autoColumn && this.parentGridItem) {
            if (this.opts.column !== this.parentGridItem.w) {
                changedColumn = true;
                this.column(this.parentGridItem.w, 'none');
            }
        }
        else {
            // else check for 1 column in/out behavior
            var oneColumn = !this.opts.disableOneColumnMode && this.el.clientWidth <= this.opts.oneColumnSize;
            if ((this.opts.column === 1) !== oneColumn) {
                changedColumn = true;
                if (this.opts.animate) {
                    this.setAnimation(false);
                } // 1 <-> 12 is too radical, turn off animation
                this.column(oneColumn ? 1 : this._prevColumn);
                if (this.opts.animate) {
                    this.setAnimation(true);
                }
            }
        }
        // make the cells content square again
        if (this._isAutoCellHeight) {
            if (!changedColumn && this.opts.cellHeightThrottle) {
                if (!this._cellHeightThrottle) {
                    this._cellHeightThrottle = utils_1.Utils.throttle(function () { return _this.cellHeight(); }, this.opts.cellHeightThrottle);
                }
                this._cellHeightThrottle();
            }
            else {
                // immediate update if we've changed column count or have no threshold
                this.cellHeight();
            }
        }
        // finally update any nested grids
        this.engine.nodes.forEach(function (n) {
            if (n.subGrid) {
                n.subGrid.onParentResize();
            }
        });
        return this;
    };
    /** add or remove the window size event handler */
    GridStack.prototype._updateWindowResizeEvent = function (forceRemove) {
        if (forceRemove === void 0) { forceRemove = false; }
        // only add event if we're not nested (parent will call us) and we're auto sizing cells or supporting oneColumn (i.e. doing work)
        var workTodo = (this._isAutoCellHeight || !this.opts.disableOneColumnMode) && !this.parentGridItem;
        if (!forceRemove && workTodo && !this._windowResizeBind) {
            this._windowResizeBind = this.onParentResize.bind(this); // so we can properly remove later
            window.addEventListener('resize', this._windowResizeBind);
        }
        else if ((forceRemove || !workTodo) && this._windowResizeBind) {
            window.removeEventListener('resize', this._windowResizeBind);
            delete this._windowResizeBind; // remove link to us so we can free
        }
        return this;
    };
    /** @internal convert a potential selector into actual element */
    GridStack.getElement = function (els) {
        if (els === void 0) { els = '.grid-stack-item'; }
        return utils_1.Utils.getElement(els);
    };
    /** @internal */
    GridStack.getElements = function (els) {
        if (els === void 0) { els = '.grid-stack-item'; }
        return utils_1.Utils.getElements(els);
    };
    /** @internal */
    GridStack.getGridElement = function (els) { return GridStack.getElement(els); };
    /** @internal */
    GridStack.getGridElements = function (els) { return utils_1.Utils.getElements(els); };
    /** @internal initialize margin top/bottom/left/right and units */
    GridStack.prototype._initMargin = function () {
        var data;
        var margin = 0;
        // support passing multiple values like CSS (ex: '5px 10px 0 20px')
        var margins = [];
        if (typeof this.opts.margin === 'string') {
            margins = this.opts.margin.split(' ');
        }
        if (margins.length === 2) { // top/bot, left/right like CSS
            this.opts.marginTop = this.opts.marginBottom = margins[0];
            this.opts.marginLeft = this.opts.marginRight = margins[1];
        }
        else if (margins.length === 4) { // Clockwise like CSS
            this.opts.marginTop = margins[0];
            this.opts.marginRight = margins[1];
            this.opts.marginBottom = margins[2];
            this.opts.marginLeft = margins[3];
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.margin);
            this.opts.marginUnit = data.unit;
            margin = this.opts.margin = data.h;
        }
        // see if top/bottom/left/right need to be set as well
        if (this.opts.marginTop === undefined) {
            this.opts.marginTop = margin;
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.marginTop);
            this.opts.marginTop = data.h;
            delete this.opts.margin;
        }
        if (this.opts.marginBottom === undefined) {
            this.opts.marginBottom = margin;
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.marginBottom);
            this.opts.marginBottom = data.h;
            delete this.opts.margin;
        }
        if (this.opts.marginRight === undefined) {
            this.opts.marginRight = margin;
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.marginRight);
            this.opts.marginRight = data.h;
            delete this.opts.margin;
        }
        if (this.opts.marginLeft === undefined) {
            this.opts.marginLeft = margin;
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.marginLeft);
            this.opts.marginLeft = data.h;
            delete this.opts.margin;
        }
        this.opts.marginUnit = data.unit; // in case side were spelled out, use those units instead...
        if (this.opts.marginTop === this.opts.marginBottom && this.opts.marginLeft === this.opts.marginRight && this.opts.marginTop === this.opts.marginRight) {
            this.opts.margin = this.opts.marginTop; // makes it easier to check for no-ops in setMargin()
        }
        return this;
    };
    /*
     * drag&drop empty stubs that will be implemented in dd-gridstack.ts for non static grid
     * so we don't incur the load unless needed.
     * NOTE: had to make those methods public in order to define them else as
     *   GridStack.prototype._setupAcceptWidget = function()
     * maybe there is a better way ????
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    /**
     * call to setup dragging in from the outside (say toolbar), by specifying the class selection and options.
     * Called during GridStack.init() as options, but can also be called directly (last param are used) in case the toolbar
     * is dynamically create and needs to be set later.
     * @param dragIn string selector (ex: '.sidebar .grid-stack-item')
     * @param dragInOptions options - see DDDragInOpt. (default: {handle: '.grid-stack-item-content', appendTo: 'body'}
     **/
    GridStack.setupDragIn = function (dragIn, dragInOptions) { };
    /**
     * Enables/Disables dragging by the user of specific grid element. If you want all items, and have it affect future items, use enableMove() instead. No-op for static grids.
     * IF you are looking to prevent an item from moving (due to being pushed around by another during collision) use locked property instead.
     * @param els widget or selector to modify.
     * @param val if true widget will be draggable.
     */
    GridStack.prototype.movable = function (els, val) { return this; };
    /**
     * Enables/Disables user resizing of specific grid element. If you want all items, and have it affect future items, use enableResize() instead. No-op for static grids.
     * @param els  widget or selector to modify
     * @param val  if true widget will be resizable.
     */
    GridStack.prototype.resizable = function (els, val) { return this; };
    /**
     * Temporarily disables widgets moving/resizing.
     * If you want a more permanent way (which freezes up resources) use `setStatic(true)` instead.
     * Note: no-op for static grid
     * This is a shortcut for:
     * @example
     *  grid.enableMove(false);
     *  grid.enableResize(false);
     */
    GridStack.prototype.disable = function () { return this; };
    /**
     * Re-enables widgets moving/resizing - see disable().
     * Note: no-op for static grid.
     * This is a shortcut for:
     * @example
     *  grid.enableMove(true);
     *  grid.enableResize(true);
     */
    GridStack.prototype.enable = function () { return this; };
    /**
     * Enables/disables widget moving. No-op for static grids.
     */
    GridStack.prototype.enableMove = function (doEnable) { return this; };
    /**
     * Enables/disables widget resizing. No-op for static grids.
     */
    GridStack.prototype.enableResize = function (doEnable) { return this; };
    /** @internal removes any drag&drop present (called during destroy) */
    GridStack.prototype._removeDD = function (el) { return this; };
    /** @internal called to add drag over support to support widgets */
    GridStack.prototype._setupAcceptWidget = function () { return this; };
    /** @internal called to setup a trash drop zone if the user specifies it */
    GridStack.prototype._setupRemoveDrop = function () { return this; };
    /** @internal prepares the element for drag&drop **/
    GridStack.prototype._prepareDragDropByNode = function (node) { return this; };
    /** @internal handles actual drag/resize start **/
    GridStack.prototype._onStartMoving = function (el, event, ui, node, cellWidth, cellHeight) { return; };
    /** @internal handles actual drag/resize **/
    GridStack.prototype._dragOrResize = function (el, event, ui, node, cellWidth, cellHeight) { return; };
    /** @internal called when a node leaves our area (mouse out or shape outside) **/
    GridStack.prototype._leave = function (el, helper) { return; };
    // legacy method removed
    GridStack.prototype.commit = function () { utils_1.obsolete(this, this.batchUpdate(false), 'commit', 'batchUpdate', '5.2'); return this; };
    /** scoping so users can call GridStack.Utils.sort() for example */
    GridStack.Utils = utils_1.Utils;
    /** scoping so users can call new GridStack.Engine(12) for example */
    GridStack.Engine = gridstack_engine_1.GridStackEngine;
    GridStack.GDRev = '7.1.0';
    return GridStack;
}());
exports.GridStack = GridStack;
var dd_touch_1 = require("./dd-touch");
var dd_manager_1 = require("./dd-manager");
__exportStar(require("./dd-gridstack"), exports);
//# sourceMappingURL=gridstack.js.map