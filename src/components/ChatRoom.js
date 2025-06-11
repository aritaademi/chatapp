
// import React, { useState, useEffect, useRef } from "react";
// import { Form, Button, InputGroup, Container, Row, Col, ListGroup } from "react-bootstrap";

// const ChatRoom = ({
//   conn,
//   username,
//   messages,
//   sendMessage,
//   userList,
//   setSelectedUser,
//   currentChatRoom,
// }) => {
//   const [message, setMessage] = useState("");
//   const [searchText, setSearchText] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [activeRecipient, setActiveRecipient] = useState(null);
//   const [typingUsers, setTypingUsers] = useState([]);

//   const typingTimeoutRef = useRef(null);

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (message.trim() !== "") {
//       await sendMessage(message);
//       setMessage("");
//       conn.invoke("StopTypingNotification", currentChatRoom, username);
//     }
//   };

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await fetch("https://localhost:7101/api/upload/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       if (data.url) {
//         await sendMessage(data.url);
//       }
//     } catch (error) {
//       console.error("Upload error", error);
//     }
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (searchText.trim()) {
//       await conn.invoke("SearchMessages", searchText);
//     }
//   };

//   const handleSelectUser = (user) => {
//     setActiveRecipient(user);
//     setSelectedUser(user);
//   };

//   const handleSelectPublic = () => {
//     setActiveRecipient(null);
//     setSelectedUser(null);
//   };

//   const handleTyping = () => {
//     conn.invoke("SendTypingNotification", currentChatRoom, username);

//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     typingTimeoutRef.current = setTimeout(() => {
//       conn.invoke("StopTypingNotification", currentChatRoom, username);
//     }, 1000);
//   };

//   useEffect(() => {
//     conn.on("SearchResults", (results) => {
//       setSearchResults(results);
//     });

//     conn.on("ReceiveTypingNotification", (username) => {
//       setTypingUsers((prev) =>
//         !prev.includes(username) ? [...prev, username] : prev
//       );
//     });

//     conn.on("RemoveTypingNotification", (username) => {
//       setTypingUsers((prev) => prev.filter((u) => u !== username));
//     });

//     return () => {
//       conn.off("SearchResults");
//       conn.off("ReceiveTypingNotification");
//       conn.off("RemoveTypingNotification");
//     };
//   }, [conn]);

//   // Filter messages to show based on activeRecipient
//   const filteredMessages = messages.filter((msg) => {
//     if (activeRecipient === null) {
//       return !msg.private; // show only public
//     } else {
//       // show only private messages between current user and selected user
//       const isMeToUser = msg.username === `Me → ${activeRecipient}`;
//       const isUserToMe = msg.username === activeRecipient && msg.private;
//       return isMeToUser || isUserToMe;
//     }
//   });

//   return (
//     <Container className="mt-4">
//       <Row>
//         <Col sm={3}>
//           <h5>Users</h5>
//           <ListGroup>
//             <ListGroup.Item
//               active={activeRecipient === null}
//               action
//               onClick={handleSelectPublic}
//             >
//               🌐 Public Chat
//             </ListGroup.Item>
//             {userList.map((user, i) => (
//               <ListGroup.Item
//                 key={i}
//                 action
//                 active={activeRecipient === user}
//                 onClick={() => handleSelectUser(user)}
//               >
//                 {user}
//               </ListGroup.Item>
//             ))}
//           </ListGroup>
//         </Col>

//         <Col sm={9}>
//           <div
//             className="chat-box"
//             style={{
//               height: "300px",
//               overflowY: "auto",
//               marginBottom: "10px",
//               border: "1px solid #ddd",
//               padding: "10px",
//             }}
//           >
//             {filteredMessages.map((msg, index) => {
//               const time = msg.timestamp ? new Date(msg.timestamp) : null;
//               const formattedTime = time
//                 ? time.toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })
//                 : "";

//               return (
//                 <div
//                   key={index}
//                   className={`chat-message ${msg.private ? "private" : ""}`}
//                 >
//                   <strong>{msg.username}</strong>{" "}
//                   <small style={{ color: "#999", fontSize: "0.8em" }}>
//                     {formattedTime}
//                   </small>
//                   :{" "}
//                   {msg.msg &&
//                   msg.msg.startsWith("http") &&
//                   msg.msg.match(/\.(jpg|png|jpeg|gif|webp)$/i) ? (
//                     <img
//                       src={msg.msg}
//                       alt="Uploaded"
//                       style={{
//                         maxWidth: "200px",
//                         display: "block",
//                         marginTop: "5px",
//                       }}
//                     />
//                   ) : msg.msg && msg.msg.startsWith("http") ? (
//                     <a
//                       href={msg.msg}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       {msg.msg}
//                     </a>
//                   ) : (
//                     <span>{msg.msg}</span>
//                   )}
//                   {msg.private && <span> (Private)</span>}
//                 </div>
//               );
//             })}

//             {typingUsers.length > 0 && (
//               <div
//                 style={{ fontStyle: "italic", color: "#aaa", marginTop: "10px" }}
//               >
//                 💬 {typingUsers.join(", ")}{" "}
//                 {typingUsers.length === 1 ? "is" : "are"} typing...
//               </div>
//             )}
//           </div>

//           <Form onSubmit={handleSendMessage}>
//             <InputGroup className="mb-3">
//               <Form.Control
//                 value={message}
//                 onChange={(e) => {
//                   setMessage(e.target.value);
//                   handleTyping();
//                 }}
//                 placeholder={
//                   activeRecipient
//                     ? `Private message to ${activeRecipient}`
//                     : "Type a public message"
//                 }
//               />
//               <Form.Control
//                 type="file"
//                 onChange={handleFileUpload}
//                 style={{ display: "none" }}
//                 id="fileInput"
//               />
//               <InputGroup.Text
//                 as="label"
//                 htmlFor="fileInput"
//                 style={{ cursor: "pointer" }}
//               >
//                 📎
//               </InputGroup.Text>
//               <Button variant="primary" type="submit">
//                 Send
//               </Button>
//             </InputGroup>
//           </Form>

//           <Form onSubmit={handleSearch}>
//             <InputGroup className="mb-3">
//               <Form.Control
//                 value={searchText}
//                 onChange={(e) => setSearchText(e.target.value)}
//                 placeholder="Search messages"
//               />
//               <Button variant="info" type="submit">
//                 Search
//               </Button>
//             </InputGroup>
//           </Form>

//           {searchResults.length > 0 && (
//             <div style={{ borderTop: "1px solid #ccc", paddingTop: "10px" }}>
//               <h5>🔍 Search Results:</h5>
//               {searchResults.map((msg, i) => (
//                 <div key={i}>
//                   <strong>{msg.username || msg.Username}</strong>:{" "}
//                   {msg.message || msg.msg}{" "}
//                   {(msg.isPrivate || msg.private) && (
//                     <span style={{ color: "red" }}>(Private)</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default ChatRoom;


import React, { useState, useEffect, useRef } from "react";
import { Form, Button, InputGroup, Container, Row, Col, ListGroup} from "react-bootstrap";
import EmojiPicker from "emoji-picker-react";

const ChatRoom = ({ conn, username, messages, sendMessage, userList, setSelectedUser, currentChatRoom,
}) => {
  const [message, setMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  // New states for emoji and GIF pickers
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearchTerm, setGifSearchTerm] = useState("");
  const [gifResults, setGifResults] = useState([]);

  const typingTimeoutRef = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      await sendMessage(message);
      setMessage("");
      setShowEmojiPicker(false);
      setShowGifPicker(false);
      setGifSearchTerm("");
      setGifResults([]);
      conn.invoke("StopTypingNotification", currentChatRoom, username);
    }
  };

  const handleFileUpload = async (e) => {
    

    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // const res = await fetch("https://localhost:7101/api/upload/upload", {
      //   method: "POST",
      //   body: formData,
      // });

      //const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8080"; 

      // const res = await fetch("http://localhost:8080/api/upload/upload", {
      //   method: "POST",
      //   body: formData,
      //   credentials: "include"
      // });

      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
      const res = await fetch(`${baseUrl}/api/upload/upload`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const data = await res.json();
      if (data.url) {
        await sendMessage(data.url);
      }
    } catch (error) {
      console.error("Upload error", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      await conn.invoke("SearchMessages", searchText);
    }
  };

  const handleSelectUser = (user) => {
    setActiveRecipient(user);
    setSelectedUser(user);
  };

  const handleSelectPublic = () => {
    setActiveRecipient(null);
    setSelectedUser(null);
  };

  const handleTyping = () => {
    conn.invoke("SendTypingNotification", currentChatRoom, username);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      conn.invoke("StopTypingNotification", currentChatRoom, username);
    }, 1000);
  };

  // Emoji picker emoji click handler
  const onEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };


  // Fetch GIFs from Giphy API when search term changes
  useEffect(() => {
    if (gifSearchTerm.trim() === "") {
      setGifResults([]);
      return;
    }

    const fetchGifs = async () => {
      try {
        const res = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=vj3SE91c8dY0WLXM0cLK5eD85s4pkhyJ&q=${encodeURIComponent(
            gifSearchTerm
          )}&limit=10&rating=g`
        );
        const data = await res.json();
        setGifResults(data.data);
      } catch (err) {
        console.error("Failed to fetch GIFs", err);
      }
    };

    fetchGifs();
  }, [gifSearchTerm]);

  useEffect(() => {
    conn.on("SearchResults", (results) => {
      console.log("Search results received:", results);
      setSearchResults(results);
    });

    conn.on("ReceiveTypingNotification", (username) => {
      setTypingUsers((prev) =>
        !prev.includes(username) ? [...prev, username] : prev
      );
    });

    conn.on("RemoveTypingNotification", (username) => {
      setTypingUsers((prev) => prev.filter((u) => u !== username));
    });

    return () => {
      conn.off("SearchResults");
      conn.off("ReceiveTypingNotification");
      conn.off("RemoveTypingNotification");
    };
  }, [conn]);

  // Filter messages to show based on activeRecipient
  const filteredMessages = messages.filter((msg) => {
    if (activeRecipient === null) {
      return !msg.private; // show only public
    } else {
      // show only private messages between current user and selected user
      const isMeToUser = msg.username === `Me → ${activeRecipient}`;
      const isUserToMe = msg.username === activeRecipient && msg.private;
      return isMeToUser || isUserToMe;
    }
  });

  return (
    <Container className="mt-4">
      <Row>
        <Col sm={3}>
          <h5>Users</h5>
          <ListGroup>
            <ListGroup.Item
              active={activeRecipient === null}
              action
              onClick={handleSelectPublic}
            >
              🌐 Public Chat
            </ListGroup.Item>
            {userList.map((user, i) => (
              <ListGroup.Item
                key={i}
                action
                active={activeRecipient === user}
                onClick={() => handleSelectUser(user)}
              >
                {user}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col sm={9}>
          <div
            className="chat-box"
            style={{
              height: "300px",
              overflowY: "auto",
              marginBottom: "10px",
              border: "1px solid #ddd",
              padding: "10px",
            }}
          >
            {filteredMessages.map((msg, index) => {
              const time = msg.timestamp ? new Date(msg.timestamp) : null;
              const formattedTime = time
                ? time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <div
                  key={index}
                  className={`chat-message ${msg.private ? "private" : ""}`}
                >
                  <strong>{msg.username}</strong>{" "}
                  <small style={{ color: "#999", fontSize: "0.8em" }}>
                    {formattedTime}
                  </small>
                  :{" "}
                  {msg.msg &&
                  msg.msg.startsWith("http") &&
                  msg.msg.match(/\.(jpg|png|jpeg|gif|webp)$/i) ? (
                    <img
                      src={msg.msg}
                      alt="Uploaded"
                      style={{
                        maxWidth: "200px",
                        display: "block",
                        marginTop: "5px",
                      }}
                    />
                  ) : msg.msg && msg.msg.startsWith("http") ? (
                    <a
                      href={msg.msg}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {msg.msg}
                    </a>
                  ) : (
                    <span>{msg.msg}</span>
                  )}
                  {msg.private && <span> (Private)</span>}
                </div>
              );
            })}

            {typingUsers.length > 0 && (
              <div
                style={{ fontStyle: "italic", color: "#aaa", marginTop: "10px" }}
              >
                💬 {typingUsers.join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing...
              </div>
            )}
          </div>

          <Form onSubmit={handleSendMessage}>
            <div style={{ position: "relative" }}>
              <InputGroup className="mb-3">
                <Form.Control
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder={
                    activeRecipient
                      ? `Private message to ${activeRecipient}`
                      : "Type a public message"
                  }
                />

                {/* Emoji Picker Toggle */}
                <InputGroup.Text
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowGifPicker(false);
                  }}
                >
                  😀
                </InputGroup.Text>

                {/* GIF Picker Toggle */}
                <InputGroup.Text
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowGifPicker(!showGifPicker);
                    setShowEmojiPicker(false);
                  }}
                >
                  GIF
                </InputGroup.Text>

                {/* File Upload */}
                <Form.Control
                  type="file"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  id="fileInput"
                />
                <InputGroup.Text
                  as="label"
                  htmlFor="fileInput"
                  style={{ cursor: "pointer" }}
                >
                  📎
                </InputGroup.Text>

                <Button variant="primary" type="submit">
                  Send
                </Button>
              </InputGroup>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "50px",
                    zIndex: 1000,
                  }}
                >
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}

              {/* GIF Picker */}
              {showGifPicker && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "50px",
                    width: "300px",
                    background: "white",
                    border: "1px solid #ccc",
                    padding: "10px",
                    zIndex: 1000,
                    overflowY: "auto",
                    maxHeight: "200px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search GIFs"
                    value={gifSearchTerm}
                    onChange={(e) => setGifSearchTerm(e.target.value)}
                    style={{ width: "100%", marginBottom: "10px" }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "5px",
                    }}
                  >
                    {gifResults.map((gif) => (
                      <img
                        key={gif.id}
                        src={gif.images.fixed_height_small.url}
                        alt={gif.title}
                        style={{
                          cursor: "pointer",
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                        }}
                        onClick={async () => {
                          await sendMessage(gif.images.fixed_height.url);
                          setShowGifPicker(false);
                          setGifSearchTerm("");
                          setGifResults([]);
                        }}
                      />
                    ))}
                    {gifResults.length === 0 && (
                      <p style={{ width: "100%", textAlign: "center" }}>
                        No GIFs found
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Form>

          {/* Search Messages */}
          <Form onSubmit={handleSearch} className="mt-3">
            <InputGroup>
              <Form.Control
                placeholder="Search messages"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button variant="secondary" type="submit">
                Search
              </Button>
            </InputGroup>
          </Form>

          {searchResults.length > 0 && (
            <ListGroup className="mt-2">
              {searchResults.map((result, i) => (
                <ListGroup.Item key={i}>
                  <strong>{result.username}</strong>: {result.message}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ChatRoom;
