// This is a JavaScript module that is loaded on demand. It can export any number of
// functions, and may import other JavaScript modules if required.

import './gridstack/gridstack-all.js';

var gsCssId = "gs-blazor-styles";

export function init(options, interopReference)
{
    initCss();

    if (options.acceptWidgetsEvent)
    {
        options.acceptWidgets =
            async (i, _) => await interopReference.invokeMethodAsync("AcceptWidgetsDelegateFired", i);
    }

    var grid = window.GridStack.init(options);

    //events
    grid.on("added",
        async (event, items) =>
        {
            await interopReference.invokeMethodAsync("AddedFired", items.map(i => { return generateGridWidgetObject(i) }));
        });

    grid.on("change",
        async (event, items) =>
        {
            await interopReference.invokeMethodAsync("ChangeFired", items.map(i => { return generateGridWidgetObject(i) }));
        });

    grid.on("disable",
        async (event) => {
            await interopReference.invokeMethodAsync("DisableFired");
        });

    grid.on("dragstart",
        async (event, el) =>
        {
            await interopReference.invokeMethodAsync("DragStartFired", generateGridWidgetObjectFromElement(el));
        });

    grid.on("drag",
        async (event, el) => {
            await interopReference.invokeMethodAsync("DragFired", generateGridWidgetObjectFromElement(el));
        });

    grid.on("dragstop",
        async (event, el) => {
            await interopReference.invokeMethodAsync("DragStopFired", generateGridWidgetObjectFromElement(el));
        });

    grid.on("dropped",
        async (event, previousWidget, newWidget) => {
            await interopReference.invokeMethodAsync("DroppedFired", previousWidget, newWidget);
        });

    grid.on("enable",
        async (event) => {
            await interopReference.invokeMethodAsync("EnableFired");
        });

    grid.on("removed",
        async (event, items) => {
            await interopReference.invokeMethodAsync("RemovedFired", items.map(i => { return generateGridWidgetObject(i) }));
        });

    grid.on("resizestart",
        async (event, el) => {
            await interopReference.invokeMethodAsync("ResizeStartFired", generateGridWidgetObjectFromElement(el));
        });

    grid.on("resize",
        async (event, el) => {
            await interopReference.invokeMethodAsync("ResizeFired", generateGridWidgetObjectFromElement(el));
        });

    grid.on("resizestop",
        async (event, el) => {
            await interopReference.invokeMethodAsync("ResizeStopFired", generateGridWidgetObjectFromElement(el));
        });

    //methods
    grid.addWidgetById = (id) =>
    {
        return grid.addWidget(document.getElementById(id));
    }

    grid.getGridItemsForBlazor = () =>
    {
        return grid.getGridItems().map(i => { return generateGridWidgetObject(i) });
    }

    grid.makeWidgetById = (id) =>
    {
        grid.makeWidget(document.getElementById(id));
    }

    grid.movableById = (id, val) =>
    {
        grid.movable(document.getElementById(id), val);
    }

    grid.removeWidgetById = (id, removeDOM, triggerEvent) =>
    {
        grid.removeWidget(document.getElementById(id), removeDOM, triggerEvent);
    }

    grid.resizableById = (id, val) =>
    {
        grid.resizable(document.getElementById(id), val);
    }

    grid.updateById = (id, opts) =>
    {
        grid.update(document.getElementById(id), opts);
    }

    return grid;
}

function initCss()
{
    //init css
    if (!document.getElementById(gsCssId)) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.id = gsCssId;
        link.href = '_content/BlazorGridStack/gridstack/gridstack.min.css';
        link.rel = "stylesheet";
        head.appendChild(link);
    }
}

function generateGridWidgetObject(widget)
{
    return {
            x: widget.x,
            y: widget.y,
            h: widget.h,
            w: widget.w,
            content: widget.content,
            className: widget.el? widget.el.className : null,
            id: widget.id
        }
}

function generateGridWidgetObjectFromElement(element)
{
    return {
            x: parseInt(element.getAttribute("gs-x")),
            y: parseInt(element.getAttribute("gs-y")),
            h: parseInt(element.getAttribute("gs-h")),
            w: parseInt(element.getAttribute("gs-w")),
            content: element.querySelector(".grid-stack-item-content").innerHTML,
            class: element.className,
            id: element.id
        }
}