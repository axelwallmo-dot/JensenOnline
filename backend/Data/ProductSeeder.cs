using JensenOnline.API.Models;
using Microsoft.EntityFrameworkCore;

namespace JensenOnline.API.Data
{
    public static class ProductSeeder
    {
        public static async Task SeedProductsAsync(
            IServiceProvider serviceProvider)
        {
            var context = serviceProvider
                .GetRequiredService<ApplicationDbContext>();

            if (await context.Products.AnyAsync())
            {
                return;
            }

            var products = new[]
            {
                new Product
                {
                    Name = "Gaming Laptop",
                    Description = "Powerful laptop for gaming and work.",
                    Price = 12999,
                    Stock = 10
                },

                new Product
                {
                    Name = "Mechanical Keyboard",
                    Description = "Mechanical keyboard with responsive switches.",
                    Price = 899,
                    Stock = 25
                },

                new Product
                {
                    Name = "Wireless Mouse",
                    Description = "Wireless mouse for everyday use.",
                    Price = 499,
                    Stock = 40
                },

                new Product
                {
                    Name = "27-inch Monitor",
                    Description = "27-inch monitor for work and gaming.",
                    Price = 2499,
                    Stock = 15
                }
            };

            context.Products.AddRange(products);

            await context.SaveChangesAsync();
        }
    }
}