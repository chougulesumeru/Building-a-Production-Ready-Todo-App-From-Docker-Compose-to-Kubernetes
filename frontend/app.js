import React, { useState, useEffect } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/todos')
      .then(res => res.json())
      .then(setTodos);
  }, []);

  const addTodo = () => {
    fetch('http://localhost:3001/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input })
    }).then(() => {
      setInput('');
      // Refresh todos
      fetch('http://localhost:3001/api/todos').then(res => res.json()).then(setTodos);
    });
  };

  return (
    <div>
      <h1>Todo App</h1>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      <ul>{todos.map(todo => <li key={todo.id}>{todo.text}</li>)}</ul>
    </div>
  );
}

export default App;