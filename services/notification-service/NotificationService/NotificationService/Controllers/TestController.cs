using Azure.Messaging.ServiceBus;
using Microsoft.AspNetCore.Mvc;

namespace NotificationService.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly IConfiguration _config;

        public TestController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost("send-test")]
        public async Task<IActionResult> SendTest()
        {
            var client = new ServiceBusClient(
                _config["ServiceBus:ConnectionString"]);
            var sender = client.CreateSender(
                _config["ServiceBus:QueueName"]);

            var message = new ServiceBusMessage(
                """
                {
                    "applicantEmail": "mvsingh.director@gmail.com",
                    "applicationNumber": "LADVS-TEST-001"
                }
                """)
            {
                Subject = "ApplicationCreated"
            };

            await sender.SendMessageAsync(message);
            await sender.DisposeAsync();
            await client.DisposeAsync();

            return Ok(new { success = true, message = "Test message sent to queue" });
        }
    }
}