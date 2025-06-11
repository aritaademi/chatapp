using FormulaOne.ChatService.DataService;
using FormulaOne.ChatService.Models;
using Microsoft.AspNetCore.SignalR;

namespace FormulaOne.ChatService.Hubs
{
    public class ChatHub : Hub
    {
        private readonly SharedDb _shared;

        public ChatHub(SharedDb shared) => _shared = shared;

        public async Task JoinChat(UserConnection conn)
        {
            _shared.connections[Context.ConnectionId] = conn;
            _shared.users[conn.UserName] = Context.ConnectionId;
            await Clients.All.SendAsync("UserListUpdated", _shared.users.Keys.ToList());
            await Clients.All.SendAsync("ReceiveMessage", "admin", $"{conn.UserName} has joined");
        }

        public async Task JoinSpecificChatRoom(UserConnection conn)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, conn.ChatRoom);
            _shared.connections[Context.ConnectionId] = conn;
            _shared.users[conn.UserName] = Context.ConnectionId;
            _shared.messages.Clear();

            await Clients.All.SendAsync("UserListUpdated", _shared.users.Keys.ToList());
            await Clients.Group(conn.ChatRoom)
                .SendAsync("ReceiveSpecificMessage", "admin", $"{conn.UserName} has joined {conn.ChatRoom}");
        }

        public async Task SendMessage(string msg)
        {
            if (_shared.connections.TryGetValue(Context.ConnectionId, out UserConnection conn))
            {
                var timestamp = DateTime.UtcNow;
                _shared.messages.Add(new ChatMessage { Username = conn.UserName, Message = msg, Timestamp = timestamp, IsPrivate = false });
                await Clients.Group(conn.ChatRoom).SendAsync("ReceiveSpecificMessage", conn.UserName, msg, timestamp);
            }
        }

        public async Task SendPrivateMessage(string receiverUsername, string message)
        {
            if (_shared.users.TryGetValue(receiverUsername, out var receiverConnectionId))
            {
                if (_shared.connections.TryGetValue(Context.ConnectionId, out var senderConn))
                {
                    var timestamp = DateTime.UtcNow;
                    _shared.messages.Add(new ChatMessage { Username = senderConn.UserName, Message = message, Timestamp = timestamp, IsPrivate = true });
                    await Clients.Client(receiverConnectionId).SendAsync("ReceivePrivateMessage", senderConn.UserName, message, timestamp);
                }
            }
        }

        public async Task SearchMessages(string keyword)
        {
            var connectionId = Context.ConnectionId;
            Console.WriteLine($"Searching messages with keyword: {keyword}");
            Console.WriteLine($"All messages: {_shared.messages}");

            var filteredMessages = _shared.messages
                .Where(m => m.Message.ToLower().Contains(keyword.ToLower()))
                .ToList();

            Console.WriteLine($"Found {filteredMessages.Count} messages.");
            await Clients.Caller.SendAsync("SearchResults", filteredMessages);
        }

        public async Task SendTypingNotification(string chatroom, string username)
        {
            await Clients.Group(chatroom).SendAsync("ReceiveTypingNotification", username);
        }

        public async Task StopTypingNotification(string chatroom, string username)
        {
            await Clients.Group(chatroom).SendAsync("RemoveTypingNotification", username);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (_shared.connections.TryRemove(Context.ConnectionId, out var user))
            {
                _shared.users.TryRemove(user.UserName, out _);
                await Clients.All.SendAsync("UserListUpdated", _shared.users.Keys.ToList());
                await Clients.All.SendAsync("ReceiveMessage", "admin", $"{user.UserName} has left");
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
} 