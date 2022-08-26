namespace BlazorGridStack.Models;

public class BlazorGridStackDroppedEventArgs
{
    public BlazorGridWidget? PreviousWidget { get; set; }
    public BlazorGridWidget NewWidget { get; set; }
}