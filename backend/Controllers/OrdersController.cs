
using JensenOnline.API.Data;
using JensenOnline.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Security.Claims;

namespace JensenOnline.API.Controllers
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    [AutoValidateAntiforgeryToken]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Modell för varukorgens produkter.
        public class OrderItemRequest
        {
            [Range(1, int.MaxValue)]
            public int ProductId { get; set; }

            [Range(1, 1000)]
            public int Quantity { get; set; }
        }

        public class CreateOrderRequest
        {
            [Required]
            [MinLength(1)]
            [MaxLength(100)]
            public List<OrderItemRequest> Items { get; set; } = new();
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder(
            [FromBody] CreateOrderRequest request)
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (userId == null)
                return Unauthorized();

            if (request.Items == null ||
                request.Items.Count == 0 ||
                request.Items.Count > 100)
            {
                return BadRequest(new
                {
                    Message = "Invalid shopping cart."
                });
            }

            // Slår ihop likadana produkter i en order.
            var requestedItems = request.Items
                .GroupBy(item => item.ProductId)
                .Select(group => new
                {
                    ProductId = group.Key,
                    Quantity = group.Sum(
                        item => (long)item.Quantity
                    )
                })
                .ToList();

            if (requestedItems.Any(item =>
                item.ProductId <= 0 ||
                item.Quantity < 1 ||
                item.Quantity > 1000))
            {
                return BadRequest(new
                {
                    Message = "Invalid product quantity."
                });
            }

            // Säkerställer att lagersaldo och order sparas tillsammans.
            await using var transaction =
                await _context.Database.BeginTransactionAsync(
                    IsolationLevel.Serializable
                );

            var order = new Order
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            decimal total = 0;

            foreach (var item in requestedItems)
            {
                var product = await _context.Products
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        p => p.Id == item.ProductId
                    );

                if (product == null)
                {
                    return BadRequest(new
                    {
                        Message = "A product does not exist."
                    });
                }

                var updatedRows = await _context.Products
                    .Where(p =>
                        p.Id == item.ProductId &&
                        p.Stock >= item.Quantity)
                    .ExecuteUpdateAsync(setters =>
                        setters.SetProperty(
                            p => p.Stock,
                            p => p.Stock - (int)item.Quantity
                        )
                    );

                if (updatedRows != 1)
                {
                    return BadRequest(new
                    {
                        Message =
                            $"Insufficient stock for {product.Name}."
                    });
                }

                var quantity = (int)item.Quantity;

                order.Items.Add(new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = quantity,
                    UnitPrice = product.Price
                });

                total += product.Price * quantity;
            }

            order.TotalPrice = total;

            _context.Orders.Add(order);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new
            {
                Message = "Order placed successfully.",
                OrderId = order.Id,
                TotalPrice = order.TotalPrice
            });
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (userId == null)
                return Unauthorized();

            var orders = await _context.Orders
                .AsNoTracking()
                .Where(order => order.UserId == userId)
                .Include(order => order.Items)
                .OrderByDescending(order => order.CreatedAt)
                .Select(order => new
                {
                    order.Id,
                    order.CreatedAt,
                    order.TotalPrice,
                    Items = order.Items.Select(item => new
                    {
                        item.ProductId,
                        item.Quantity,
                        item.UnitPrice
                    })
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (userId == null)
                return Unauthorized();

            var order = await _context.Orders
                .AsNoTracking()
                .Where(o => o.Id == id && o.UserId == userId)
                .Select(o => new
                {
                    o.Id,
                    o.CreatedAt,
                    o.TotalPrice,
                    Items = o.Items.Select(item => new
                    {
                        item.ProductId,
                        item.Quantity,
                        item.UnitPrice
                    })
                })
                .FirstOrDefaultAsync();

            if (order == null)
                return NotFound(new
                {
                    Message = "Order not found."
                });

            return Ok(order);
        }
    }
}
