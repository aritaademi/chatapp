using FormulaOne.ChatService.Models;
using System.Collections.Concurrent;

namespace FormulaOne.ChatService.DataService
{
    public class SharedDb
    {
        public ConcurrentDictionary<string, UserConnection> connections = new();
        public ConcurrentDictionary<string, string> users = new();
        public ConcurrentBag<ChatMessage> messages = new(); // Use ConcurrentBag for thread-safe message storage
    }
} 