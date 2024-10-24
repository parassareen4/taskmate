// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000'); // Point to your backend

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskDuration, setTaskDuration] = useState(0);

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tasks');
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  // Listen for real-time updates from the backend
  useEffect(() => {
    socket.on('newTask', (task) => {
      setTasks((prevTasks) => [...prevTasks, task]);
    });

    return () => {
      socket.off('newTask');
    };
  }, []);

  const handleAddTask = async () => {
    try {
      const newTask = { name: taskName, duration: taskDuration };
      const response = await axios.post('http://localhost:5000/tasks', newTask);
      setTaskName('');
      setTaskDuration(0);
      socket.emit('newTask', response.data); // Notify other clients in real-time
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div className="App">
      <h1>Smart TaskMate</h1>
      <div>
        <input
          type="text"
          placeholder="Task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={taskDuration}
          onChange={(e) => setTaskDuration(e.target.value)}
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>
      <h2>Tasks</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            {task.name} - {task.duration} mins
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
