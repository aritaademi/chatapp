using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;

[Route("api/[controller]")]
[ApiController]
public class UploadController : ControllerBase
{
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile([FromForm]IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                Console.WriteLine("Received null file.");
                return BadRequest("No file uploaded.");
            }

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var filePath = Path.Combine(uploadsFolder, file.FileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{file.FileName}";
            return Ok(new { url = fileUrl });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }
} 