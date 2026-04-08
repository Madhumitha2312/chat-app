import { useState, useEffect } from "react";
import { io } from "socket.io-client";

// 🔥 YOUR BACKEND URL
const socket = io("https://chat-app-et4m.onrender.com", {
  transports: ["polling"],
  withCredentials: true,
});

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  useEffect(() => {
  socket.on("load_messages", (data) => {
    setMessageList(data);
  });
}, []);

  const sendMessage = () => {
    if (message !== "") {
      const messageData = {
        room,
        author: username,
        message,
        time: new Date().toLocaleTimeString(),
      };

      socket.emit("send_message", messageData);
      setMessage("");
    }
  };

  // 🔥 Join screen
  if (!showChat) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Join Chat 💬</h2>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />

      <input
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="Room ID"
      />

        <button
          onClick={() => {
            if (username !== "" && room !== "") {
              socket.emit("join_room", room);
              socket.emit("get_messages", room);
              setShowChat(true);
            }
          }}
        >
          Join
        </button>
      </div>
    );
  }

  // 🔥 Chat UI
 return (
  <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
    <div style={{
      width: "400px",
      height: "600px",
      border: "1px solid #ccc",
      borderRadius: "10px",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>

      {/* Header */}
      <div style={{
        background: "#075E54",
        color: "white",
        padding: "10px",
        fontWeight: "bold"
      }}>
        Chat App 💬
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: "10px",
        overflowY: "auto",
        background: "#ECE5DD"
      }}>
        {messageList.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.author === username ? "flex-end" : "flex-start",
              marginBottom: "10px"
            }}
          >
            <div style={{
              background: msg.author === username ? "#DCF8C6" : "white",
              padding: "8px 12px",
              borderRadius: "10px",
              maxWidth: "70%"
            }}>
              <div style={{ fontWeight: "bold", fontSize: "12px" }}>
                {msg.author}
              </div>
              <div>{msg.message}</div>
              <div style={{ fontSize: "10px", textAlign: "right" }}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{
        display: "flex",
        padding: "10px",
        borderTop: "1px solid #ccc"
      }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message"
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            background: "#25D366",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "5px"
          }}
        >
          Send
        </button>
      </div>

    </div>
  </div>
);
}

export default App;