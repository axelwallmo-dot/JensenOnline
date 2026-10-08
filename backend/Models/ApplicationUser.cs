using Microsoft.AspNetCore.Identity;

namespace JensenOnline.API.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
    }
}
