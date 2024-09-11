import React, { useState } from 'react';
import axios from 'axios';
import stringSimilarity from 'string-similarity';
import nlp from 'compromise'; // Importing NLP library
import './ChatBot.css';  // Import the CSS file

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState({
    previousQuestion: '',
    relatedTopics: []
  });

  const predefinedQA = [
    { question: "sign up", answer: "To sign up for the to-do list app, click on the 'Register' button on the login page and fill out the required information." },
    { question: "forgot password", answer: "If you forgot your password, click on the 'Forgot Password?' link on the login page and follow the instructions to reset your password." },
    { question: "add task", answer: "To add a new task, log in to your account, go to the main page, and fill out the task details in the input fields provided." },
    { question: "delete task", answer: "To delete a task, log in to your account, go to the task list, select the task you want to delete, and click the delete button." },
    { question: "edit task", answer: "To edit a task, log in to your account, go to the task list, select the task you want to edit, and click the edit button." },
    { question: "prioritize task", answer: "You can prioritize tasks by assigning them different priority levels when adding or editing them. High-priority tasks will appear at the top of your list." },
    { question: "view completed tasks", answer: "To view completed tasks, go to the main page and filter tasks by their completion status. You'll find an option to show completed tasks." }
  ];

  const processInput = (input) => {
    const doc = nlp(input);
    return doc.text();
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const processedInput = processInput(input); // Process user input with NLP
    const newMessages = [...messages, { text: processedInput, sender: 'user' }];
    setMessages(newMessages);

    const userInput = processedInput.toLowerCase();
    const bestMatch = stringSimilarity.findBestMatch(userInput, predefinedQA.map(qa => qa.question));

    let predefinedAnswer = null;

    if (bestMatch.bestMatch.rating > 0.6) { // Adjusted threshold for better matching
      predefinedAnswer = predefinedQA[bestMatch.bestMatchIndex].answer;
    }

    // Check if the context can help refine the response
    if (!predefinedAnswer && context.previousQuestion) {
      const contextBestMatch = stringSimilarity.findBestMatch(userInput, predefinedQA.map(qa => context.previousQuestion.toLowerCase()));
      if (contextBestMatch.bestMatch.rating > 0.6) {
        predefinedAnswer = predefinedQA[contextBestMatch.bestMatchIndex].answer;
      }
    }

    if (predefinedAnswer) {
      setMessages([...newMessages, { text: predefinedAnswer, sender: 'bot' }]);
      setContext({ 
        previousQuestion: userInput, 
        relatedTopics: [...context.relatedTopics, bestMatch.bestMatchIndex]
      });
    } else {
      try {
        const response = await axios.post('http://localhost:5000/api/chat', {
          message: userInput,
          context: context.previousQuestion || '',
        });

        const botReply = response.data.reply;

        setMessages([...newMessages, { text: botReply, sender: 'bot' }]);
        setContext({ 
          previousQuestion: userInput,
          relatedTopics: [...context.relatedTopics]
        });
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages([...newMessages, { text: 'Sorry, I encountered an error. Please try again later.', sender: 'bot' }]);
      }
    }

    setInput('');
  };

  return (
    <div className="container">
      <h2 className="header">AI ChatBot</h2>
      <div className="messagesContainer">
        {messages.map((msg, index) => (
          <p key={index} className={msg.sender === 'user' ? 'userMessage' : 'botMessage'}>
            <strong>{msg.sender === 'user' ? 'You' : 'Bot'}: </strong>
            {msg.text}
          </p>
        ))}
      </div>
      <div className="inputContainer">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..." 
          className="input"
        />
        <button onClick={sendMessage} className="button">Send</button>
      </div>
    </div>
  );
};

export default ChatBot;
