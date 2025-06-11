namespace FormulaOne.ChatService.Models
{
    public class ChatMessage
    {
        public string Username { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
        public bool IsPrivate { get; set; }
        public string ChatRoom { get; set; }
    }
} 