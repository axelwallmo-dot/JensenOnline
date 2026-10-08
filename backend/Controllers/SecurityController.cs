
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;

namespace JensenOnline.API.Controllers
{
    [ApiController]
    [Route("api/security")]
    public class SecurityController : ControllerBase
    {
        private readonly IAntiforgery _antiforgery;

        public SecurityController(IAntiforgery antiforgery)
        {
            _antiforgery = antiforgery;
        }

        [HttpGet("csrf-token")]
        public IActionResult GetCsrfToken()
        {
            // Prevent caching of the token response.
            Response.Headers.CacheControl = "no-store";

            var tokens = _antiforgery.GetAndStoreTokens(
                HttpContext
            );

            return Ok(new
            {
                Token = tokens.RequestToken
            });
        }
    }
}
