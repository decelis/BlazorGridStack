# BlazorGridStack

gridstack.js port for Blazor
Compatible with Blazor **server mode** and **WASM**


## Nugget package

https://www.nuget.org/packages/BlazorGridStack/1.0.0


## Installation

Install the nugget package through nugget manager or

```
dotnet add package MudBlazor
```

Import the following

```razor
@using BlazorGridStack
@using BlazorGridStack.Models
```

then simply add the markup shown in the **Usage/Examples** section. Javascript and css files are loaded automatically.

## Usage/Examples

Widgets as markup:

```razor
<BlazorGridStackBody GridStackOptions="@(new() { Class = "my-class" })">
    <BlazorGridStackWidget WidgetOptions="@(new() {X = 3, Y = 2})"></BlazorGridStackWidget>
</BlazorGridStackBody>
```

Widgets on runtime
```razor
<button onclick="@AddElementClicked">Add Element</button>
<BlazorGridStackBody @ref="Grid" GridStackOptions="@(new() { Class = "my-class" })"></BlazorGridStackBody>

@code {
    BlazorGridStackBody? Grid;

    public void AddElementClicked()
    {
        Grid.AddWidget(new BlazorGridStackWidgetOptions
        {
            W = 1,
            H = 1
        });
    }
}
```
## API Reference

BlazorGridStack uses the same event and method names as gridstack.js (in UpperCammelCase), described in their API:
https://github.com/gridstack/gridstack.js/tree/master/doc

### exceptions and limitations

- Events and Methods that return a widget DOM element, will return objects of the type **BlazorGridWidget**.
- Methods wich require a widget DOM element, will accept an ID instead.