using System.Reflection;
using System.Text;
using BlazorGridStack.Models;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Newtonsoft.Json;

namespace BlazorGridStack
{
    internal class GridStackInterop : IAsyncDisposable
    {
        public event EventHandler<BlazorGridStackWidgetListEventArgs>? OnAdded;
        public event EventHandler<BlazorGridStackWidgetListEventArgs>? OnChange;
        public event EventHandler? OnDisable;
        public event EventHandler<BlazorGridStackWidgetEventArgs>? OnDragStart;
        public event EventHandler<BlazorGridStackWidgetEventArgs>? OnDrag;
        public event EventHandler<BlazorGridStackWidgetEventArgs>? OnDragStop;
        public event EventHandler<BlazorGridStackDroppedEventArgs>? OnDropped;
        public event EventHandler? OnEnable;
        public event EventHandler<BlazorGridStackWidgetListEventArgs>? OnRemoved;
        public event EventHandler<BlazorGridStackWidgetEventArgs>? OnResizeStart;
        public event EventHandler<BlazorGridStackWidgetEventArgs>? OnResize;
        public event EventHandler<BlazorGridStackWidgetEventArgs>? OnResizeStop;

        private readonly Lazy<Task<IJSObjectReference>> moduleTask;
        private Func<int, IJSObjectReference, bool>? AcceptWidgetsDelegate;
        private IJSObjectReference? GridInstance;

        public GridStackInterop(IJSRuntime jsRuntime)
        {
            moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>(
                "import", "./_content/BlazorGridStack/gridStackInterop.js").AsTask());
        }

        public async Task Init(BlazorGridStackBodyOptions options)
        {
            var module = await moduleTask.Value;
            var interopRef = DotNetObjectReference.Create(this);

            GridInstance = await module.InvokeAsync<IJSObjectReference>("init", SerializeModelToDictionary(options), interopRef);
        }

        public async Task<BlazorGridStackWidget> AddWidget(BlazorGridStackWidgetOptions widgetOptions)
        {
            return await GridInstance.InvokeAsync<BlazorGridStackWidget>("addWidget", widgetOptions);
        }

        public async Task<BlazorGridStackWidget> AddWidget(string id)
        {
            return await GridInstance.InvokeAsync<BlazorGridStackWidget>("addWidgetById", id);
        }

        public async Task BatchUpdate(bool? flag = null)
        {
            await GridInstance.InvokeVoidAsync("batchUpdate", flag);
        }

        public async Task Compact()
        {
            await GridInstance.InvokeVoidAsync("compact");
        }

        public async Task CellHeight(int val, bool? update = null)
        {
            await GridInstance.InvokeVoidAsync("cellHeight", val, update);
        }

        public async Task<int> CellWidth()
        {
            return await GridInstance.InvokeAsync<int>("cellWidth");
        }

        public async Task Column(int column, string? layout = null)
        {
            await GridInstance.InvokeVoidAsync("column", column, layout);
        }

        public async Task Destroy(bool? removeDom = null)
        {
            await GridInstance.InvokeVoidAsync("destroy", removeDom);
        }

        public async Task Disable()
        {
            await GridInstance.InvokeVoidAsync("disable");
        }

        public async Task Enable()
        {
            await GridInstance.InvokeVoidAsync("enable");
        }

        public async Task EnableMove(bool doEnable)
        {
            await GridInstance.InvokeVoidAsync("enableMove", doEnable);
        }

        public async Task EnableResize(bool doEnable)
        {
            await GridInstance.InvokeVoidAsync("enableResize", doEnable);
        }

        public async Task SetFloat(bool? val = null)
        {
            await GridInstance.InvokeVoidAsync("float", val);
        }

        public async Task<bool> GetFloat()
        {
            return await GridInstance.InvokeAsync<bool>("float");
        }

        public async Task<int> GetCellHeight()
        {
            return await GridInstance.InvokeAsync<int>("getCellHeight");
        }

        public async Task<BlazorGridCoordinates> GetCellFromPixel(int top, int left, bool? useOffset = null)
        {
            return await GridInstance.InvokeAsync<BlazorGridCoordinates>("getCellFromPixel", new { top, left }, useOffset);
        }

        public async Task<int> GetColumn()
        {
            return await GridInstance.InvokeAsync<int>("getColumn");
        }

        public async Task<IEnumerable<BlazorGridStackWidgetData>> GetGridItems()
        {
            return await GridInstance.InvokeAsync<IEnumerable<BlazorGridStackWidgetData>>("getGridItemsForBlazor");
        }

        public async Task<int> GetMargin()
        {
            return await GridInstance.InvokeAsync<int>("getMargin");
        }

        public async Task<bool> IsAreaEmpty(int x, int y, int width, int height)
        {
            return await GridInstance.InvokeAsync<bool>("isAreaEmpty", x, y, width, height);
        }

        public async Task Load(IEnumerable<BlazorGridStackWidgetOptions> layout, bool? addAndRemove = null)
        {
            await GridInstance.InvokeVoidAsync("load", layout, addAndRemove);
        }

        public async Task MakeWidget(string id)
        {
            await GridInstance.InvokeVoidAsync("makeWidgetById", id);
        }

        public async Task Margin(int value)
        {
            await GridInstance.InvokeVoidAsync("margin", value);
        }

        public async Task Margin(string value)
        {
            await GridInstance.InvokeVoidAsync("margin", value);
        }

        public async Task Movable(string id, bool val)
        {
            await GridInstance.InvokeVoidAsync("movabletById", id, val);
        }

        public async Task RemoveWidget(string id, bool? removeDOM = null, bool? triggerEvent = true)
        {
            await GridInstance.InvokeVoidAsync("removeWidgetById", id, removeDOM, triggerEvent);
        }

        public async Task RemoveAll(bool? removeDOM = null)
        {
            await GridInstance.InvokeVoidAsync("removeAll", removeDOM);
        }

        public async Task Resizable(string id, bool val)
        {
            await GridInstance.InvokeVoidAsync("resizableById", id, val);
        }

        public async Task Save(bool? saveContent)
        {
            await GridInstance.InvokeVoidAsync("save", saveContent);
        }

        public async Task SetAnimation(bool doAnimate)
        {
            await GridInstance.InvokeVoidAsync("setAnimation", doAnimate);
        }

        public async Task SetStatic(bool staticValue)
        {
            await GridInstance.InvokeVoidAsync("setStatic", staticValue);
        }

        public async Task Update(string id, BlazorGridStackWidgetOptions opts)
        {
            await GridInstance.InvokeVoidAsync("updateById", id, opts);
        }

        public async Task<bool> WillItFit(int x, int y, int width, int height, bool autoPosition)
        {
            return await GridInstance.InvokeAsync<bool>("willItFit", x, y, width, height, autoPosition);
        }

        public async ValueTask DisposeAsync()
        {
            if (moduleTask.IsValueCreated)
            {
                var module = await moduleTask.Value;
                await module.DisposeAsync();
            }
        }

        private Dictionary<string, object> SerializeModelToDictionary(object? model)
        {
            var result = new Dictionary<string, object>();

            if (model != null)
            {
                foreach (var property in model.GetType().GetProperties())
                {
                    var value = property.GetValue(model);
                    var name = property.Name.Substring(0, 1).ToLower() + property.Name.Substring(1);

                    if (value is int or bool or string or float)
                    {
                        result.Add(name, value);
                    }

                    else if (value is BlazorGridStackBodyAcceptWidgets acceptWidgets)
                    {
                        if (acceptWidgets.BoolValue != null)
                            result.Add(name, acceptWidgets.BoolValue);

                        else if (acceptWidgets.StringValue != null)
                            result.Add(name, acceptWidgets.StringValue);

                        else if (acceptWidgets.FuncValue != null)
                        {
                            result.Add("acceptWidgetsEvent", true);
                            AcceptWidgetsDelegate = acceptWidgets.FuncValue;
                        }
                    }

                    else if (value != null)
                    {
                        result.Add(name, SerializeModelToDictionary(value));
                    }
                }
            }
            return result;
        }

        //EVENTS
        [JSInvokable]
        public bool AcceptWidgetsDelegateFired(int number, IJSObjectReference element)
        {
            return AcceptWidgetsDelegate?.Invoke(number, element) ?? false;
        }

        [JSInvokable]
        public void AddedFired(BlazorGridStackWidgetData[] widgets)
        {
            OnAdded?.Invoke(this, new BlazorGridStackWidgetListEventArgs { Items = widgets });
        }

        [JSInvokable]
        public void ChangeFired(BlazorGridStackWidgetData[] widgets)
        {
            OnChange?.Invoke(this, new BlazorGridStackWidgetListEventArgs { Items = widgets });
        }

        [JSInvokable]
        public void DisableFired()
        {
            OnDisable?.Invoke(this, EventArgs.Empty);
        }

        [JSInvokable]
        public void DragStartFired(BlazorGridStackWidgetData widget)
        {
            OnDragStart?.Invoke(this, new BlazorGridStackWidgetEventArgs { Item = widget });
        }

        [JSInvokable]
        public void DragFired(BlazorGridStackWidgetData widget)
        {
            OnDrag?.Invoke(this, new BlazorGridStackWidgetEventArgs { Item = widget });
        }

        [JSInvokable]
        public void DragStopFired(BlazorGridStackWidgetData widget)
        {
            OnDragStop?.Invoke(this, new BlazorGridStackWidgetEventArgs { Item = widget });
        }

        [JSInvokable]
        public void DroppedFired(BlazorGridStackWidgetData? previousWidget, BlazorGridStackWidgetData newWidget)
        {
            OnDropped?.Invoke(this, new BlazorGridStackDroppedEventArgs { NewWidget = newWidget, PreviousWidget = previousWidget });
        }

        [JSInvokable]
        public void EnableFired()
        {
            OnEnable?.Invoke(this, EventArgs.Empty);
        }

        [JSInvokable]
        public void RemovedFired(BlazorGridStackWidgetData[] widgets)
        {
            OnRemoved?.Invoke(this, new BlazorGridStackWidgetListEventArgs { Items = widgets });
        }

        [JSInvokable]
        public void ResizeStartFired(BlazorGridStackWidgetData widget)
        {
            OnResizeStart?.Invoke(this, new BlazorGridStackWidgetEventArgs { Item = widget });
        }

        [JSInvokable]
        public void ResizeFired(BlazorGridStackWidgetData widget)
        {
            OnResize?.Invoke(this, new BlazorGridStackWidgetEventArgs { Item = widget });
        }

        [JSInvokable]
        public void ResizeStopFired(BlazorGridStackWidgetData widget)
        {
            OnResizeStop?.Invoke(this, new BlazorGridStackWidgetEventArgs { Item = widget });
        }
    }
}