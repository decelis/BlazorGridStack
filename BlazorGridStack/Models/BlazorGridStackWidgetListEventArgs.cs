using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BlazorGridStack.Models
{
    public class BlazorGridStackWidgetListEventArgs: EventArgs
    {
        public IEnumerable<BlazorGridWidget> Items { get; set; }
    }
}
