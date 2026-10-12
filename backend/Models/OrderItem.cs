
using System.ComponentModel.DataAnnotations;

namespace JensenOnline.API.Models
{
    public class OrderItem
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public int ProductId { get; set; }

        [Range(1, 1000)]
        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public Order Order { get; set; } = null!;
    }
}
