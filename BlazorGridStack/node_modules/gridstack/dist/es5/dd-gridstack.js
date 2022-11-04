"use strict";
/**
 * dd-gridstack.ts 7.1.0
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DDGridStack = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
var types_1 = require("./types");
var gridstack_1 = require("./gridstack");
var utils_1 = require("./utils");
var dd_manager_1 = require("./dd-manager");
var dd_element_1 = require("./dd-element");
// let count = 0; // TEST
/**
 * HTML Native Mouse and Touch Events Drag and Drop functionality.
 */
var DDGridStack = /** @class */ (function () {
    function DDGridStack() {
    }
    /** get the global (but static to this code) DD implementation */
    DDGridStack.get = function () {
        return dd;
    };
    DDGridStack.prototype.resizable = function (el, opts, key, value) {
        this._getDDElements(el).forEach(function (dEl) {
            var _a;
            if (opts === 'disable' || opts === 'enable') {
                dEl.ddResizable && dEl.ddResizable[opts](); // can't create DD as it requires options for setupResizable()
            }
            else if (opts === 'destroy') {
                dEl.ddResizable && dEl.cleanResizable();
            }
            else if (opts === 'option') {
                dEl.setupResizable((_a = {}, _a[key] = value, _a));
            }
            else {
                var grid = dEl.el.gridstackNode.grid;
                var handles = dEl.el.getAttribute('gs-resize-handles') ? dEl.el.getAttribute('gs-resize-handles') : grid.opts.resizable.handles;
                var autoHide = !grid.opts.alwaysShowResizeHandle;
                dEl.setupResizable(__assign(__assign(__assign({}, grid.opts.resizable), { handles: handles, autoHide: autoHide }), {
                    start: opts.start,
                    stop: opts.stop,
                    resize: opts.resize
                }));
            }
        });
        return this;
    };
    DDGridStack.prototype.draggable = function (el, opts, key, value) {
        this._getDDElements(el).forEach(function (dEl) {
            var _a;
            if (opts === 'disable' || opts === 'enable') {
                dEl.ddDraggable && dEl.ddDraggable[opts](); // can't create DD as it requires options for setupDraggable()
            }
            else if (opts === 'destroy') {
                dEl.ddDraggable && dEl.cleanDraggable();
            }
            else if (opts === 'option') {
                dEl.setupDraggable((_a = {}, _a[key] = value, _a));
            }
            else {
                var grid = dEl.el.gridstackNode.grid;
                dEl.setupDraggable(__assign(__assign({}, grid.opts.draggable), {
                    // containment: (grid.parentGridItem && !grid.opts.dragOut) ? grid.el.parentElement : (grid.opts.draggable.containment || null),
                    start: opts.start,
                    stop: opts.stop,
                    drag: opts.drag
                }));
            }
        });
        return this;
    };
    DDGridStack.prototype.dragIn = function (el, opts) {
        this._getDDElements(el).forEach(function (dEl) { return dEl.setupDraggable(opts); });
        return this;
    };
    DDGridStack.prototype.droppable = function (el, opts, key, value) {
        if (typeof opts.accept === 'function' && !opts._accept) {
            opts._accept = opts.accept;
            opts.accept = function (el) { return opts._accept(el); };
        }
        this._getDDElements(el).forEach(function (dEl) {
            var _a;
            if (opts === 'disable' || opts === 'enable') {
                dEl.ddDroppable && dEl.ddDroppable[opts]();
            }
            else if (opts === 'destroy') {
                if (dEl.ddDroppable) { // error to call destroy if not there
                    dEl.cleanDroppable();
                }
            }
            else if (opts === 'option') {
                dEl.setupDroppable((_a = {}, _a[key] = value, _a));
            }
            else {
                dEl.setupDroppable(opts);
            }
        });
        return this;
    };
    /** true if element is droppable */
    DDGridStack.prototype.isDroppable = function (el) {
        return !!(el && el.ddElement && el.ddElement.ddDroppable && !el.ddElement.ddDroppable.disabled);
    };
    /** true if element is draggable */
    DDGridStack.prototype.isDraggable = function (el) {
        return !!(el && el.ddElement && el.ddElement.ddDraggable && !el.ddElement.ddDraggable.disabled);
    };
    /** true if element is draggable */
    DDGridStack.prototype.isResizable = function (el) {
        return !!(el && el.ddElement && el.ddElement.ddResizable && !el.ddElement.ddResizable.disabled);
    };
    DDGridStack.prototype.on = function (el, name, callback) {
        this._getDDElements(el).forEach(function (dEl) {
            return dEl.on(name, function (event) {
                callback(event, dd_manager_1.DDManager.dragElement ? dd_manager_1.DDManager.dragElement.el : event.target, dd_manager_1.DDManager.dragElement ? dd_manager_1.DDManager.dragElement.helper : null);
            });
        });
        return this;
    };
    DDGridStack.prototype.off = function (el, name) {
        this._getDDElements(el).forEach(function (dEl) { return dEl.off(name); });
        return this;
    };
    /** @internal returns a list of DD elements, creating them on the fly by default */
    DDGridStack.prototype._getDDElements = function (els, create) {
        if (create === void 0) { create = true; }
        var hosts = utils_1.Utils.getElements(els);
        if (!hosts.length)
            return [];
        var list = hosts.map(function (e) { return e.ddElement || (create ? dd_element_1.DDElement.init(e) : null); });
        if (!create) {
            list.filter(function (d) { return d; });
        } // remove nulls
        return list;
    };
    return DDGridStack;
}());
exports.DDGridStack = DDGridStack;
/** global instance */
var dd = new DDGridStack;
/********************************************************************************
 * GridStack code that is doing drag&drop extracted here so main class is smaller
 * for static grid that don't do any of this work anyway. Saves about 31k (41k -> 72k)
 * https://www.typescriptlang.org/docs/handbook/declaration-merging.html
 * https://www.typescriptlang.org/docs/handbook/mixins.html
 ********************************************************************************/
/** @internal called to add drag over to support widgets being added externally */
gridstack_1.GridStack.prototype._setupAcceptWidget = function () {
    var _this = this;
    // check if we need to disable things
    if (this.opts.staticGrid || (!this.opts.acceptWidgets && !this.opts.removable)) {
        dd.droppable(this.el, 'destroy');
        return this;
    }
    // vars shared across all methods
    var cellHeight, cellWidth;
    var onDrag = function (event, el, helper) {
        var node = el.gridstackNode;
        if (!node)
            return;
        helper = helper || el;
        var parent = _this.el.getBoundingClientRect();
        var _a = helper.getBoundingClientRect(), top = _a.top, left = _a.left;
        left -= parent.left;
        top -= parent.top;
        var ui = { position: { top: top, left: left } };
        if (node._temporaryRemoved) {
            node.x = Math.max(0, Math.round(left / cellWidth));
            node.y = Math.max(0, Math.round(top / cellHeight));
            delete node.autoPosition;
            _this.engine.nodeBoundFix(node);
            // don't accept *initial* location if doesn't fit #1419 (locked drop region, or can't grow), but maybe try if it will go somewhere
            if (!_this.engine.willItFit(node)) {
                node.autoPosition = true; // ignore x,y and try for any slot...
                if (!_this.engine.willItFit(node)) {
                    dd.off(el, 'drag'); // stop calling us
                    return; // full grid or can't grow
                }
                if (node._willFitPos) {
                    // use the auto position instead #1687
                    utils_1.Utils.copyPos(node, node._willFitPos);
                    delete node._willFitPos;
                }
            }
            // re-use the existing node dragging method
            _this._onStartMoving(helper, event, ui, node, cellWidth, cellHeight);
        }
        else {
            // re-use the existing node dragging that does so much of the collision detection
            _this._dragOrResize(helper, event, ui, node, cellWidth, cellHeight);
        }
    };
    dd.droppable(this.el, {
        accept: function (el) {
            var node = el.gridstackNode;
            // set accept drop to true on ourself (which we ignore) so we don't get "can't drop" icon in HTML5 mode while moving
            if ((node === null || node === void 0 ? void 0 : node.grid) === _this)
                return true;
            if (!_this.opts.acceptWidgets)
                return false;
            // check for accept method or class matching
            var canAccept = true;
            if (typeof _this.opts.acceptWidgets === 'function') {
                canAccept = _this.opts.acceptWidgets(el);
            }
            else {
                var selector = (_this.opts.acceptWidgets === true ? '.grid-stack-item' : _this.opts.acceptWidgets);
                canAccept = el.matches(selector);
            }
            // finally check to make sure we actually have space left #1571
            if (canAccept && node && _this.opts.maxRow) {
                var n = { w: node.w, h: node.h, minW: node.minW, minH: node.minH }; // only width/height matters and autoPosition
                canAccept = _this.engine.willItFit(n);
            }
            return canAccept;
        }
    })
        /**
         * entering our grid area
         */
        .on(this.el, 'dropover', function (event, el, helper) {
        // console.log(`over ${this.el.gridstack.opts.id} ${count++}`); // TEST
        var node = el.gridstackNode;
        // ignore drop enter on ourself (unless we temporarily removed) which happens on a simple drag of our item
        if ((node === null || node === void 0 ? void 0 : node.grid) === _this && !node._temporaryRemoved) {
            // delete node._added; // reset this to track placeholder again in case we were over other grid #1484 (dropout doesn't always clear)
            return false; // prevent parent from receiving msg (which may be a grid as well)
        }
        // fix #1578 when dragging fast, we may not get a leave on the previous grid so force one now
        if ((node === null || node === void 0 ? void 0 : node.grid) && node.grid !== _this && !node._temporaryRemoved) {
            // console.log('dropover without leave'); // TEST
            var otherGrid = node.grid;
            otherGrid._leave(el, helper);
        }
        // cache cell dimensions (which don't change), position can animate if we removed an item in otherGrid that affects us...
        cellWidth = _this.cellWidth();
        cellHeight = _this.getCellHeight(true);
        // load any element attributes if we don't have a node
        if (!node) { // @ts-ignore private read only on ourself
            node = _this._readAttr(el);
        }
        if (!node.grid) {
            node._isExternal = true;
            el.gridstackNode = node;
        }
        // calculate the grid size based on element outer size
        helper = helper || el;
        var w = node.w || Math.round(helper.offsetWidth / cellWidth) || 1;
        var h = node.h || Math.round(helper.offsetHeight / cellHeight) || 1;
        // if the item came from another grid, make a copy and save the original info in case we go back there
        if (node.grid && node.grid !== _this) {
            // copy the node original values (min/max/id/etc...) but override width/height/other flags which are this grid specific
            // console.log('dropover cloning node'); // TEST
            if (!el._gridstackNodeOrig)
                el._gridstackNodeOrig = node; // shouldn't have multiple nested!
            el.gridstackNode = node = __assign(__assign({}, node), { w: w, h: h, grid: _this });
            _this.engine.cleanupNode(node)
                .nodeBoundFix(node);
            // restore some internal fields we need after clearing them all
            node._initDD =
                node._isExternal = // DOM needs to be re-parented on a drop
                    node._temporaryRemoved = true; // so it can be inserted onDrag below
        }
        else {
            node.w = w;
            node.h = h;
            node._temporaryRemoved = true; // so we can insert it
        }
        // clear any marked for complete removal (Note: don't check _isAboutToRemove as that is cleared above - just do it)
        _itemRemoving(node.el, false);
        dd.on(el, 'drag', onDrag);
        // make sure this is called at least once when going fast #1578
        onDrag(event, el, helper);
        return false; // prevent parent from receiving msg (which may be a grid as well)
    })
        /**
         * Leaving our grid area...
         */
        .on(this.el, 'dropout', function (event, el, helper) {
        // console.log(`out ${this.el.gridstack.opts.id} ${count++}`); // TEST
        var node = el.gridstackNode;
        if (!node)
            return false;
        // fix #1578 when dragging fast, we might get leave after other grid gets enter (which calls us to clean)
        // so skip this one if we're not the active grid really..
        if (!node.grid || node.grid === _this) {
            _this._leave(el, helper);
            // if we were created as temporary nested grid, go back to before state
            if (_this._isTemp) {
                _this.removeAsSubGrid(node);
            }
        }
        return false; // prevent parent from receiving msg (which may be grid as well)
    })
        /**
         * end - releasing the mouse
         */
        .on(this.el, 'drop', function (event, el, helper) {
        var _a, _b;
        var node = el.gridstackNode;
        // ignore drop on ourself from ourself that didn't come from the outside - dragend will handle the simple move instead
        if ((node === null || node === void 0 ? void 0 : node.grid) === _this && !node._isExternal)
            return false;
        var wasAdded = !!_this.placeholder.parentElement; // skip items not actually added to us because of constrains, but do cleanup #1419
        _this.placeholder.remove();
        // notify previous grid of removal
        // console.log('drop delete _gridstackNodeOrig') // TEST
        var origNode = el._gridstackNodeOrig;
        delete el._gridstackNodeOrig;
        if (wasAdded && (origNode === null || origNode === void 0 ? void 0 : origNode.grid) && origNode.grid !== _this) {
            var oGrid = origNode.grid;
            oGrid.engine.removedNodes.push(origNode);
            oGrid._triggerRemoveEvent();
            // if it's an empty sub-grid, to get auto-created, nuke it
            if (oGrid.parentGridItem && !oGrid.engine.nodes.length && oGrid.opts.subGridDynamic) {
                oGrid.removeAsSubGrid();
            }
        }
        if (!node)
            return false;
        // use existing placeholder node as it's already in our list with drop location
        if (wasAdded) {
            _this.engine.cleanupNode(node); // removes all internal _xyz values
            node.grid = _this;
        }
        dd.off(el, 'drag');
        // if we made a copy ('helper' which is temp) of the original node then insert a copy, else we move the original node (#1102)
        // as the helper will be nuked by jquery-ui otherwise
        if (helper !== el) {
            helper.remove();
            el.gridstackNode = origNode; // original item (left behind) is re-stored to pre dragging as the node now has drop info
            if (wasAdded) {
                el = el.cloneNode(true);
            }
        }
        else {
            el.remove(); // reduce flicker as we change depth here, and size further down
            _this._removeDD(el);
        }
        if (!wasAdded)
            return false;
        el.gridstackNode = node;
        node.el = el;
        var subGrid = (_b = (_a = node.subGrid) === null || _a === void 0 ? void 0 : _a.el) === null || _b === void 0 ? void 0 : _b.gridstack; // set when actual sub-grid present
        // @ts-ignore
        utils_1.Utils.copyPos(node, _this._readAttr(_this.placeholder)); // placeholder values as moving VERY fast can throw things off #1578
        utils_1.Utils.removePositioningStyles(el); // @ts-ignore
        _this._writeAttr(el, node);
        _this.el.appendChild(el); // @ts-ignore // TODO: now would be ideal time to _removeHelperStyle() overriding floating styles (native only)
        if (subGrid) {
            subGrid.parentGridItem = node;
            if (!subGrid.opts.styleInHead)
                subGrid._updateStyles(true); // re-create sub-grid styles now that we've moved
        }
        _this._updateContainerHeight();
        _this.engine.addedNodes.push(node); // @ts-ignore
        _this._triggerAddEvent(); // @ts-ignore
        _this._triggerChangeEvent();
        _this.engine.endUpdate();
        if (_this._gsEventHandler['dropped']) {
            _this._gsEventHandler['dropped'](__assign(__assign({}, event), { type: 'dropped' }), origNode && origNode.grid ? origNode : undefined, node);
        }
        // wait till we return out of the drag callback to set the new drag&resize handler or they may get messed up
        window.setTimeout(function () {
            // IFF we are still there (some application will use as placeholder and insert their real widget instead and better call makeWidget())
            if (node.el && node.el.parentElement) {
                _this._prepareDragDropByNode(node);
            }
            else {
                _this.engine.removeNode(node);
            }
            delete node.grid._isTemp;
        });
        return false; // prevent parent from receiving msg (which may be grid as well)
    });
    return this;
};
/** @internal mark item for removal */
function _itemRemoving(el, remove) {
    var node = el ? el.gridstackNode : undefined;
    if (!node || !node.grid)
        return;
    remove ? node._isAboutToRemove = true : delete node._isAboutToRemove;
    remove ? el.classList.add('grid-stack-item-removing') : el.classList.remove('grid-stack-item-removing');
}
/** @internal called to setup a trash drop zone if the user specifies it */
gridstack_1.GridStack.prototype._setupRemoveDrop = function () {
    if (!this.opts.staticGrid && typeof this.opts.removable === 'string') {
        var trashEl = document.querySelector(this.opts.removable);
        if (!trashEl)
            return this;
        // only register ONE drop-over/dropout callback for the 'trash', and it will
        // update the passed in item and parent grid because the 'trash' is a shared resource anyway,
        // and Native DD only has 1 event CB (having a list and technically a per grid removableOptions complicates things greatly)
        if (!dd.isDroppable(trashEl)) {
            dd.droppable(trashEl, this.opts.removableOptions)
                .on(trashEl, 'dropover', function (event, el) { return _itemRemoving(el, true); })
                .on(trashEl, 'dropout', function (event, el) { return _itemRemoving(el, false); });
        }
    }
    return this;
};
/**
 * call to setup dragging in from the outside (say toolbar), by specifying the class selection and options.
 * Called during GridStack.init() as options, but can also be called directly (last param are used) in case the toolbar
 * is dynamically create and needs to change later.
 **/
gridstack_1.GridStack.setupDragIn = function (dragIn, dragInOptions) {
    if ((dragInOptions === null || dragInOptions === void 0 ? void 0 : dragInOptions.pause) !== undefined) {
        dd_manager_1.DDManager.pauseDrag = dragInOptions.pause;
    }
    if (typeof dragIn === 'string') {
        dragInOptions = __assign(__assign({}, types_1.dragInDefaultOptions), (dragInOptions || {}));
        utils_1.Utils.getElements(dragIn).forEach(function (el) {
            if (!dd.isDraggable(el))
                dd.dragIn(el, dragInOptions);
        });
    }
};
/** @internal prepares the element for drag&drop **/
gridstack_1.GridStack.prototype._prepareDragDropByNode = function (node) {
    var _this = this;
    var el = node.el;
    var noMove = node.noMove || this.opts.disableDrag;
    var noResize = node.noResize || this.opts.disableResize;
    // check for disabled grid first
    if (this.opts.staticGrid || (noMove && noResize)) {
        if (node._initDD) {
            this._removeDD(el); // nukes everything instead of just disable, will add some styles back next
            delete node._initDD;
        }
        el.classList.add('ui-draggable-disabled', 'ui-resizable-disabled'); // add styles one might depend on #1435
        return this;
    }
    if (!node._initDD) {
        // variables used/cashed between the 3 start/move/end methods, in addition to node passed above
        var cellWidth_1;
        var cellHeight_1;
        /** called when item starts moving/resizing */
        var onStartMoving = function (event, ui) {
            // trigger any 'dragstart' / 'resizestart' manually
            if (_this._gsEventHandler[event.type]) {
                _this._gsEventHandler[event.type](event, event.target);
            }
            cellWidth_1 = _this.cellWidth();
            cellHeight_1 = _this.getCellHeight(true); // force pixels for calculations
            _this._onStartMoving(el, event, ui, node, cellWidth_1, cellHeight_1);
        };
        /** called when item is being dragged/resized */
        var dragOrResize = function (event, ui) {
            _this._dragOrResize(el, event, ui, node, cellWidth_1, cellHeight_1);
        };
        /** called when the item stops moving/resizing */
        var onEndMoving = function (event) {
            _this.placeholder.remove();
            delete node._moving;
            delete node._event;
            delete node._lastTried;
            // if the item has moved to another grid, we're done here
            var target = event.target;
            if (!target.gridstackNode || target.gridstackNode.grid !== _this)
                return;
            node.el = target;
            if (node._isAboutToRemove) {
                var gridToNotify = el.gridstackNode.grid;
                if (gridToNotify._gsEventHandler[event.type]) {
                    gridToNotify._gsEventHandler[event.type](event, target);
                }
                _this._removeDD(el);
                gridToNotify.engine.removedNodes.push(node);
                gridToNotify._triggerRemoveEvent();
                // break circular links and remove DOM
                delete el.gridstackNode;
                delete node.el;
                el.remove();
            }
            else {
                utils_1.Utils.removePositioningStyles(target);
                if (node._temporaryRemoved) {
                    // got removed - restore item back to before dragging position
                    utils_1.Utils.copyPos(node, node._orig); // @ts-ignore
                    _this._writePosAttr(target, node);
                    _this.engine.addNode(node);
                }
                else {
                    // move to new placeholder location
                    _this._writePosAttr(target, node);
                }
                if (_this._gsEventHandler[event.type]) {
                    _this._gsEventHandler[event.type](event, target);
                }
            }
            // @ts-ignore
            _this._extraDragRow = 0; // @ts-ignore
            _this._updateContainerHeight(); // @ts-ignore
            _this._triggerChangeEvent();
            _this.engine.endUpdate();
        };
        dd.draggable(el, {
            start: onStartMoving,
            stop: onEndMoving,
            drag: dragOrResize
        }).resizable(el, {
            start: onStartMoving,
            stop: onEndMoving,
            resize: dragOrResize
        });
        node._initDD = true; // we've set DD support now
    }
    // finally fine tune move vs resize by disabling any part...
    dd.draggable(el, noMove ? 'disable' : 'enable')
        .resizable(el, noResize ? 'disable' : 'enable');
    return this;
};
/** @internal called when item is starting a drag/resize */
gridstack_1.GridStack.prototype._onStartMoving = function (el, event, ui, node, cellWidth, cellHeight) {
    this.engine.cleanNodes()
        .beginUpdate(node);
    // @ts-ignore
    this._writePosAttr(this.placeholder, node);
    this.el.appendChild(this.placeholder);
    // console.log('_onStartMoving placeholder') // TEST
    node.el = this.placeholder;
    node._lastUiPosition = ui.position;
    node._prevYPix = ui.position.top;
    node._moving = (event.type === 'dragstart'); // 'dropover' are not initially moving so they can go exactly where they enter (will push stuff out of the way)
    delete node._lastTried;
    if (event.type === 'dropover' && node._temporaryRemoved) {
        // console.log('engine.addNode x=' + node.x); // TEST
        this.engine.addNode(node); // will add, fix collisions, update attr and clear _temporaryRemoved
        node._moving = true; // AFTER, mark as moving object (wanted fix location before)
    }
    // set the min/max resize info
    this.engine.cacheRects(cellWidth, cellHeight, this.opts.marginTop, this.opts.marginRight, this.opts.marginBottom, this.opts.marginLeft);
    if (event.type === 'resizestart') {
        dd.resizable(el, 'option', 'minWidth', cellWidth * (node.minW || 1))
            .resizable(el, 'option', 'minHeight', cellHeight * (node.minH || 1));
        if (node.maxW) {
            dd.resizable(el, 'option', 'maxWidth', cellWidth * node.maxW);
        }
        if (node.maxH) {
            dd.resizable(el, 'option', 'maxHeight', cellHeight * node.maxH);
        }
    }
};
/** @internal called when item leaving our area by either cursor dropout event
 * or shape is outside our boundaries. remove it from us, and mark temporary if this was
 * our item to start with else restore prev node values from prev grid it came from.
 **/
gridstack_1.GridStack.prototype._leave = function (el, helper) {
    var node = el.gridstackNode;
    if (!node)
        return;
    dd.off(el, 'drag'); // no need to track while being outside
    // this gets called when cursor leaves and shape is outside, so only do this once
    if (node._temporaryRemoved)
        return;
    node._temporaryRemoved = true;
    this.engine.removeNode(node); // remove placeholder as well, otherwise it's a sign node is not in our list, which is a bigger issue
    node.el = node._isExternal && helper ? helper : el; // point back to real item being dragged
    if (this.opts.removable === true) { // boolean vs a class string
        // item leaving us and we are supposed to remove on leave (no need to drag onto trash) mark it so
        _itemRemoving(el, true);
    }
    // finally if item originally came from another grid, but left us, restore things back to prev info
    if (el._gridstackNodeOrig) {
        // console.log('leave delete _gridstackNodeOrig') // TEST
        el.gridstackNode = el._gridstackNodeOrig;
        delete el._gridstackNodeOrig;
    }
    else if (node._isExternal) {
        // item came from outside (like a toolbar) so nuke any node info
        delete node.el;
        delete el.gridstackNode;
        // and restore all nodes back to original
        this.engine.restoreInitial();
    }
};
/** @internal called when item is being dragged/resized */
gridstack_1.GridStack.prototype._dragOrResize = function (el, event, ui, node, cellWidth, cellHeight) {
    var p = __assign({}, node._orig); // could be undefined (_isExternal) which is ok (drag only set x,y and w,h will default to node value)
    var resizing;
    var mLeft = this.opts.marginLeft, mRight = this.opts.marginRight, mTop = this.opts.marginTop, mBottom = this.opts.marginBottom;
    // if margins (which are used to pass mid point by) are large relative to cell height/width, reduce them down #1855
    var mHeight = Math.round(cellHeight * 0.1), mWidth = Math.round(cellWidth * 0.1);
    mLeft = Math.min(mLeft, mWidth);
    mRight = Math.min(mRight, mWidth);
    mTop = Math.min(mTop, mHeight);
    mBottom = Math.min(mBottom, mHeight);
    if (event.type === 'drag') {
        if (node._temporaryRemoved)
            return; // handled by dropover
        var distance = ui.position.top - node._prevYPix;
        node._prevYPix = ui.position.top;
        utils_1.Utils.updateScrollPosition(el, ui.position, distance);
        // get new position taking into account the margin in the direction we are moving! (need to pass mid point by margin)
        var left = ui.position.left + (ui.position.left > node._lastUiPosition.left ? -mRight : mLeft);
        var top_1 = ui.position.top + (ui.position.top > node._lastUiPosition.top ? -mBottom : mTop);
        p.x = Math.round(left / cellWidth);
        p.y = Math.round(top_1 / cellHeight);
        // @ts-ignore// if we're at the bottom hitting something else, grow the grid so cursor doesn't leave when trying to place below others
        var prev = this._extraDragRow;
        if (this.engine.collide(node, p)) {
            var row = this.getRow();
            var extra = Math.max(0, (p.y + node.h) - row);
            if (this.opts.maxRow && row + extra > this.opts.maxRow) {
                extra = Math.max(0, this.opts.maxRow - row);
            } // @ts-ignore
            this._extraDragRow = extra; // @ts-ignore
        }
        else
            this._extraDragRow = 0; // @ts-ignore
        if (this._extraDragRow !== prev)
            this._updateContainerHeight();
        if (node.x === p.x && node.y === p.y)
            return; // skip same
        // DON'T skip one we tried as we might have failed because of coverage <50% before
        // if (node._lastTried && node._lastTried.x === x && node._lastTried.y === y) return;
    }
    else if (event.type === 'resize') {
        if (p.x < 0)
            return;
        // Scrolling page if needed
        utils_1.Utils.updateScrollResize(event, el, cellHeight);
        // get new size
        p.w = Math.round((ui.size.width - mLeft) / cellWidth);
        p.h = Math.round((ui.size.height - mTop) / cellHeight);
        if (node.w === p.w && node.h === p.h)
            return;
        if (node._lastTried && node._lastTried.w === p.w && node._lastTried.h === p.h)
            return; // skip one we tried (but failed)
        // if we size on left/top side this might move us, so get possible new position as well
        var left = ui.position.left + mLeft;
        var top_2 = ui.position.top + mTop;
        p.x = Math.round(left / cellWidth);
        p.y = Math.round(top_2 / cellHeight);
        resizing = true;
    }
    node._event = event;
    node._lastTried = p; // set as last tried (will nuke if we go there)
    var rect = {
        x: ui.position.left + mLeft,
        y: ui.position.top + mTop,
        w: (ui.size ? ui.size.width : node.w * cellWidth) - mLeft - mRight,
        h: (ui.size ? ui.size.height : node.h * cellHeight) - mTop - mBottom
    };
    if (this.engine.moveNodeCheck(node, __assign(__assign({}, p), { cellWidth: cellWidth, cellHeight: cellHeight, rect: rect, resizing: resizing }))) {
        node._lastUiPosition = ui.position;
        this.engine.cacheRects(cellWidth, cellHeight, mTop, mRight, mBottom, mLeft);
        delete node._skipDown;
        if (resizing && node.subGrid) {
            node.subGrid.onParentResize();
        } // @ts-ignore
        this._extraDragRow = 0; // @ts-ignore
        this._updateContainerHeight();
        var target = event.target; // @ts-ignore
        this._writePosAttr(target, node);
        if (this._gsEventHandler[event.type]) {
            this._gsEventHandler[event.type](event, target);
        }
    }
};
/**
 * Enables/Disables moving.
 * @param els widget or selector to modify.
 * @param val if true widget will be draggable.
 */
gridstack_1.GridStack.prototype.movable = function (els, val) {
    var _this = this;
    if (this.opts.staticGrid)
        return this; // can't move a static grid!
    gridstack_1.GridStack.getElements(els).forEach(function (el) {
        var node = el.gridstackNode;
        if (!node)
            return;
        if (val)
            delete node.noMove;
        else
            node.noMove = true;
        _this._prepareDragDropByNode(node); // init DD if need be, and adjust
    });
    return this;
};
/**
 * Enables/Disables resizing.
 * @param els  widget or selector to modify
 * @param val  if true widget will be resizable.
 */
gridstack_1.GridStack.prototype.resizable = function (els, val) {
    var _this = this;
    if (this.opts.staticGrid)
        return this; // can't resize a static grid!
    gridstack_1.GridStack.getElements(els).forEach(function (el) {
        var node = el.gridstackNode;
        if (!node)
            return;
        if (val)
            delete node.noResize;
        else
            node.noResize = true;
        _this._prepareDragDropByNode(node); // init DD if need be, and adjust
    });
    return this;
};
/**
  * Temporarily disables widgets moving/resizing.
  * If you want a more permanent way (which freezes up resources) use `setStatic(true)` instead.
  * Note: no-op for static grid
  * This is a shortcut for:
  * @example
  *  grid.enableMove(false);
  *  grid.enableResize(false);
  */
gridstack_1.GridStack.prototype.disable = function () {
    if (this.opts.staticGrid)
        return;
    this.enableMove(false);
    this.enableResize(false); // @ts-ignore
    this._triggerEvent('disable');
    return this;
};
/**
  * Re-enables widgets moving/resizing - see disable().
  * Note: no-op for static grid.
  * This is a shortcut for:
  * @example
  *  grid.enableMove(true);
  *  grid.enableResize(true);
  */
gridstack_1.GridStack.prototype.enable = function () {
    if (this.opts.staticGrid)
        return;
    this.enableMove(true);
    this.enableResize(true); // @ts-ignore
    this._triggerEvent('enable');
    return this;
};
/** Enables/disables widget moving. No-op for static grids. */
gridstack_1.GridStack.prototype.enableMove = function (doEnable) {
    var _this = this;
    if (this.opts.staticGrid)
        return this; // can't move a static grid!
    this.opts.disableDrag = !doEnable; // FIRST before we update children as grid overrides #1658
    this.engine.nodes.forEach(function (n) { return _this.movable(n.el, doEnable); });
    return this;
};
/** Enables/disables widget resizing. No-op for static grids. */
gridstack_1.GridStack.prototype.enableResize = function (doEnable) {
    var _this = this;
    if (this.opts.staticGrid)
        return this; // can't size a static grid!
    this.opts.disableResize = !doEnable; // FIRST before we update children as grid overrides #1658
    this.engine.nodes.forEach(function (n) { return _this.resizable(n.el, doEnable); });
    return this;
};
/** removes any drag&drop present (called during destroy) */
gridstack_1.GridStack.prototype._removeDD = function (el) {
    dd.draggable(el, 'destroy').resizable(el, 'destroy');
    if (el.gridstackNode) {
        delete el.gridstackNode._initDD; // reset our DD init flag
    }
    delete el.ddElement;
    return this;
};
//# sourceMappingURL=dd-gridstack.js.map