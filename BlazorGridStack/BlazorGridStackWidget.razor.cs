using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BlazorGridStack.Models;
using Microsoft.AspNetCore.Components;

namespace BlazorGridStack
{
    partial class BlazorGridStackWidget : ComponentBase
    {
        [Parameter] public RenderFragment? ChildContent { get; set; }
        [Parameter] public BlazorGridStackWidgetOptions? WidgetOptions { get; set; }
    }
}
