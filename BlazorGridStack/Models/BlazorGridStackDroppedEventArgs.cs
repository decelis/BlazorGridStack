namespace BlazorGridStack.Models;

public class BlazorGridStackDroppedEventArgs
{
    public BlazorGridStackWidgetData? PreviousWidget { get; set; }
    public BlazorGridStackWidgetData NewWidget { get; set; }
}