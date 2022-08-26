using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace BlazorGridStack.Models
{
    public class BlazorGridStackWidgetOptions
    {
        public bool? AutoPosition { get; set; }
        public int? X { get; set; }
        public int? Y { get; set; }
        public int? W { get; set; }
        public int? H { get; set; }
        public int? MaxW { get; set; }
        public int? MinW { get; set; }
        public int? MaxH { get; set; }
        public int? MinH { get; set; }
        public bool? Locked { get; set; }
        public bool? NoResize { get; set; }
        public bool? NoMove { get; set; }
        public string? ResizeHandles { get; set; }
        public object Id { get; set; }
        public string? Content { get; set; }
        public BlazorGridStackBodyOptions? SubGrid { get; set; }
    }
}
