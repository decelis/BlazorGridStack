using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Newtonsoft.Json;

namespace BlazorGridStack.Models
{
    public class BlazorGridStackBodyOptions
    {
        /// <summary>
        /// accept widgets dragged from other grids or from outside (default: false). Can be:
        /// - true (uses '.grid-stack-item' class filter) or false
        /// - string for explicit class name
        /// - function (i: number, element: Element): boolean
        /// </summary>
        public BlazorGridStackBodyAcceptWidgets? AcceptWidgets { get; set; }

        /// <summary>
        /// possible values (default: mobile) - does not apply to non-resizable widgets
        /// - false the resizing handles are only shown while hovering over a widget
        /// - true the resizing handles are always shown
        /// - 'mobile' if running on a mobile device, default to true (since there is no hovering per say), else false. this uses this condition on browser agent check: alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent )
        /// </summary>
        public object? AlwaysShowResizeHandle { get; set; }

        /// <summary>
        /// turns animation on to smooth transitions (default: true)
        /// </summary>
        public bool? Animate { get; set; }

        /// <summary>
        /// f false gridstack will not initialize existing items (default: true)
        /// </summary>
        public bool? Auto { get; set; }

        /// <summary>
        /// one cell height (default?: 'auto'). Can be:
        /// - an integer (px)
        /// - a string (ex: '100px', '10em', '10rem'). Note: % doesn't right - see CellHeight
        /// - 0, in which case the library will not generate styles for rows. Everything must be defined in your own CSS files.
        /// - auto - height will be calculated for square cells (width / column) and updated live as you resize the window - also see cellHeightThrottle
        /// - initial - similar to 'auto' (start at square cells) but stay that size during window resizing.
        /// </summary>
        public string? CellHeight { get; set; }

        /// <summary>
        /// number - throttle time delay (in ms) used when cellHeight='auto' to improve performance vs usability (default?: 100).
        /// - A value of 0 will make it instant at a cost of re-creating the CSS file at ever window resize event!
        /// </summary>
        public int? CellHeightThrottle { get; set; }

        /// <summary>
        /// Integer > 0 (default 12) which can change on the fly with column(N) API, or 'auto' for nested grids to size themselves to the parent grid container (to make sub-items are the same size).
        /// </summary>
        public int? Column { get; set; }

        /// <summary>
        /// string - additional class on top of '.grid-stack' (which is required for our CSS) to differentiate this instance
        /// </summary>
        public string? Class { get; set; }

        /// <summary>
        /// disallows dragging of widgets (default: false).
        /// </summary>
        public bool? DisableDrag { get; set; }

        /// <summary>
        /// disables the onColumnMode when the grid width is less than minW (default: 'false')
        /// </summary>
        public bool? DisableOneColumnMode { get; set; }

        /// <summary>
        /// disallows resizing of widgets (default: false).
        /// </summary>
        public bool? DisableResize { get; set; }

        /// <summary>
        /// specify the class of items that can be dragged into grids
        /// - example: dragIn: '.newWidget'.
        /// - Note: if you have multiple grids, it's best to call GridStack.setupDragIn() with same params as it only need to be done once.
        /// </summary>
        public string? DragIn { get; set; }

        /// <summary>
        /// options for items that can be dragged into grids
        /// - example dragInOptions: { appendTo: 'body', helper: 'clone', handle: '.grid-stack-item-content' }
        /// - Note: if you have multiple grids, it's best to call GridStack.setupDragIn() with same params as it only need to be done once.
        /// - Note2: instead of 'clone' you can also pass your own function (get passed the event).
        /// </summary>
        public BlazorGridStackDragInOptions? DragInOptions { get; set; }

        /// <summary>
        /// allows to override draggable options. (default: {handle: '.grid-stack-item-content', appendTo: 'body'})
        /// </summary>
        public BlazorGridStackDraggableOptions? Draggable { get; set; }

        /// <summary>
        /// to let user drag nested grid items out of a parent or not (default false)
        /// </summary>
        public bool? DragOut { get; set; }

        /// <summary>
        /// the type of engine to create (so you can subclass) default to GridStackEngine
        /// </summary>
        public string? EngineClass { get; set; }

        /// <summary>
        /// enable floating widgets (default: false)
        /// </summary>
        public bool? Float { get; set; }

        /// <summary>
        /// draggable handle selector (default: '.grid-stack-item-content')
        /// </summary>
        public string? Handle { get; set; }

        /// <summary>
        /// draggable handle class (e.g. 'grid-stack-item-content'). If set handle is ignored (default: null)
        /// </summary>
        public string? HandleClass { get; set; }

        /// <summary>
        ///  widget class (default: 'grid-stack-item')
        /// </summary>
        public string? ItemClass { get; set; }

        /// <summary>
        /// gap size around grid item and content (default: 10). Can be:
        /// - an integer (px)
        /// - a string (ex: '2em', '20px', '2rem')
        /// </summary>
        public object? Margin { get; set; }

        /// <summary>
        /// numberOrString - can set individual settings (defaults to margin)
        /// </summary>
        public object? MarginTop { get; set; }

        /// <summary>
        /// numberOrString - can set individual settings (defaults to margin)
        /// </summary>
        public object? MarginRight { get; set; }

        /// <summary>
        /// numberOrString - can set individual settings (defaults to margin)
        /// </summary>
        public object? MarginBottom { get; set; }

        /// <summary>
        /// numberOrString - can set individual settings (defaults to margin)
        /// </summary>
        public object? MarginLeft { get; set; }

        /// <summary>
        /// maximum rows amount. Default is 0 which means no max.
        /// </summary>
        public int? MaxRow { get; set; }

        /// <summary>
        /// minimum rows amount which is handy to prevent grid from collapsing when empty. Default is 0. You can also do this with min-height CSS attribute on the grid div in pixels, which will round to the closest row.
        /// </summary>
        public int? MinRow { get; set; }

        /// <summary>
        /// minimal width. If grid width is less than or equal to, grid will be shown in one-column mode (default: 768)
        /// </summary>
        public int? OneColumnSize { get; set; }

        /// <summary>
        /// set to true if you want oneColumnMode to use the DOM order and ignore x,y from normal multi column layouts during sorting. This enables you to have custom 1 column layout that differ from the rest. (default?: false)
        /// </summary>
        public bool? OneColumnModeDomSort { get; set; }

        /// <summary>
        /// class for placeholder (default: 'grid-stack-placeholder')
        /// </summary>
        public string? PlaceholderClass { get; set; }

        /// <summary>
        /// placeholder default content (default: '')
        /// </summary>
        public string? PlaceholderText { get; set; }

        /// <summary>
        /// allows to override resizable options. (default: {handles: 'se'}). handles can be any combo of n,ne,e,se,s,sw,w,nw or all.
        /// </summary>
        public BlazorGridStackResizableOptions? Resizable { get; set; }

        /// <summary>
        /// if true widgets could be removed by dragging outside of the grid. It could also be a selector string, in this case widgets will be removed by dropping them there (default: false)
        /// </summary>
        public object? Removable { get; set; }

        /// <summary>
        /// time in milliseconds before widget is being removed while dragging outside of the grid. (default: 2000)
        /// </summary>
        public int? RemoveTimeout { get; set; }

        /// <summary>
        /// fix grid number of rows. This is a shortcut of writing minRow:N, maxRow:N. (default 0 no constrain)
        /// </summary>
        public int? Row { get; set; }

        /// <summary>
        /// if true turns grid to RTL. Possible values are true, false, 'auto' (default: 'auto')
        /// </summary>
        public object? Rtl { get; set; }

        /// <summary>
        ///  removes drag|drop|resize (default false). If true widgets are not movable/resizable by the user, but code can still move and oneColumnMode will still work. You can use the smaller gridstack-static.js lib. A CSS class grid-stack-static is also added to the container.
        /// </summary>
        public bool? StaticGrid { get; set; }

        /// <summary>
        /// if true will add style element to <head> otherwise will add it to element's parent node (default false).
        /// </summary>
        public bool? StyleInHead { get; set; }
    }

    public class BlazorGridStackBodyAcceptWidgets
    {
        private bool? _boolValue;
        public bool? BoolValue
        {
            get => _boolValue;
            set
            {
                _boolValue = value;
                _stringValue = null;
                _funcValue = null;
            }
        }

        private string? _stringValue;

        public string? StringValue
        {
            get => _stringValue;
            set
            {
                _boolValue = null;
                _stringValue = value;
                _funcValue = null;
            }
        }

        private Func<int, IJSObjectReference, bool>? _funcValue;

        public Func<int, IJSObjectReference, bool>? FuncValue
        {
            get => _funcValue;
            set
            {
                _boolValue = null;
                _stringValue = null;
                _funcValue = value;
            }
        }
    }

    public class BlazorGridStackResizableOptions
    {
        public string? Handles { get; set; }
    }

    public class BlazorGridStackDraggableOptions
    {
        public string? AppendTo { get; set; }
        public string? Handle { get; set; }
    }

    public class BlazorGridStackDragInOptions
    {
        public string? AppendTo { get; set; }
        public string? Helper { get; set; }
        public string? Handle { get; set; }
    }


}
