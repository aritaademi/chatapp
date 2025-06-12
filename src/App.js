
import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import WaitingRoom from './components/Waitingroom';
import ChatRoom from './components/ChatRoom';
import DarkModeToggle from './components/DarkModeToggle';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

function App() {
  const [conn, setConnection] = useState();
  const [messages, setMessages] = useState([]);
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [username, setUsername] = useState("");
  const [currentChatRoom, setCurrentChatRoom] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Join the chat room when the user is ready
  const joinChatRoom = async (uname, chatroom) => {
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";  // Add this line at the top of your App component or inside joinChatRoom

    try {
      // const connection = new HubConnectionBuilder()
      //   .withUrl("https://localhost:7101/chat")
      //   .configureLogging(LogLevel.Information)
      //   .build();

      // const connection = new HubConnectionBuilder()
      //   .withUrl(`${baseUrl}/chat`)
      //   .configureLogging(LogLevel.Information)
      //   .build();

      const connection = new HubConnectionBuilder()
        .withUrl("/api/chat") // Change from `${baseUrl}/chat` to this
        .configureLogging(LogLevel.Information)
        .build();

      //console.log("Connecting to SignalR Hub at:", `${process.env.REACT_APP_API_URL}/chat`);
      console.log("Connecting to SignalR Hub at:", `${baseUrl}/chat`);

      // Receive messages
      connection.on("JoinSpecificChatRoom", (username, msg) => {
        setMessages((prev) => [...prev, { username, msg }]);
      });

      connection.on("ReceiveSpecificMessage", (username, msg, timestamp) => {
        setMessages((prev) => [...prev, { username, msg, timestamp }]);
      });

      connection.on("ReceivePrivateMessage", (fromUser, msg, timestamp) => {
        setMessages((prev) => [
          ...prev,
          { username: fromUser, msg, private: true, timestamp },
        ]);
      });


      connection.on("UserListUpdated", (users) => {
        setUserList(users.filter((user) => user !== uname));
      });

      await connection.start();
      await connection.invoke("JoinSpecificChatRoom", { username: uname, chatroom });

      setConnection(connection);
      setUsername(uname);
      setCurrentChatRoom(chatroom);
    } catch (e) {
      console.log(e);
    }
  };

  // Send a message (private or public)
  const sendMessage = async (message) => {
    try {
      if (selectedUser) {
        await conn.invoke("SendPrivateMessage", selectedUser, message);
        const now = new Date();
        setMessages((prev) => [
          ...prev,
          { username: "Me → " + selectedUser, msg: message, private: true, timestamp: now.toISOString() },
        ]);

      } else {
        await conn.invoke("SendMessage", message);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <main>
      <Container>
        <Row className="px-5 my-5">
          <Col sm={12}>
            <h1 className="font-weight-light">Welcome to the F1 ChatApp</h1>
            <DarkModeToggle toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
          </Col>
        </Row>

        {!conn ? (
          <WaitingRoom joinChatRoom={joinChatRoom} />
        ) : (
          <ChatRoom
            conn={conn}
            userName={username}
            setSelectedUser={setSelectedUser}
            userList={userList}
            messages={messages}
            sendMessage={sendMessage}
            currentChatRoom={currentChatRoom}
          />
        )}
      </Container>
    </main>
  );
}

export default App;
