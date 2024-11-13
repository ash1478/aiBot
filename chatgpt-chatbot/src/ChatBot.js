// src/ChatBot.js
import React, { useState } from 'react';
import axios from 'axios';
import './ChatBot.css';

const SendIcon = ()=><svg style={{
  marginLeft:4
}} xmlns="http://www.w3.org/2000/svg" width="19" height="16" viewBox="0 0 19 16" fill="none">
<path d="M0 16V0L19 8L0 16ZM2 13L13.85 8L2 3V6.5L8 8L2 9.5V13Z" fill="white"/>
</svg>

const BotReply = (text)=>{
return (<div className='chatbot-reply'>
  <div className='chatbot-dp'>
  <img src="/Group.svg"></img>
</div>
<div className='message bot'>{text}</div>
</div>);
}

const UserReply = (text)=>{
  return (<div className='message user'>{text}</div>)
}

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await axios.post(
        'http://localhost:3001/query',
        {
          userQuery: input,
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
        }
      );
      console.log({response});

      setMessages([...newMessages, { sender: 'bot', text: response.data.response }]);
    } catch (error) {
      console.error('Error fetching response:', error);
    }
  };

  return (
   <>
    <div className="header">Health  Saathi</div>
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} style={{width: "100%", display: "contents"}} >
            {msg.sender === "bot" ? BotReply(msg.text) : UserReply(msg.text)}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}><SendIcon/></button>
      </div>
    </div></>
  );
};

export default ChatBot;
