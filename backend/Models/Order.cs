
using System.ComponentModel.DataAnnotations;

namespace JensenOnline.API.Models
{
    public class Order
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public decimal TotalPrice { get; set; }

        public List<OrderItem> Items { get; set; } = new();
    }
}
