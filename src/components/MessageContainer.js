  
const MessageContainer = ({ messages }) => {
  if (!messages || messages.length === 0) {
    return <div>No messages yet.</div>;
  }

  return (
    <div className="chat-box">
      {messages.map((msg, index) => (
        <table key={index} style={{ width: '100%', marginBottom: '10px' }}>
          <tbody>
            <tr>
              <td className={`chat-message ${msg.private ? 'private' : ''}`}>
                {msg.private ? "🔒 " : ""}{msg.msg} - {msg.username}
              </td>
            </tr>
          </tbody>
        </table>
      ))}
    </div>
  );
};

export default MessageContainer;
