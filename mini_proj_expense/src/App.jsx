import React, { useState, useEffect } from 'react';

function App() {
  // State hooks to manage transactions
  const [transactions, setTransactions] = useState(() => {
    // Getting stored items from localStorage initially
    const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
    return localStorageTransactions !== null ? localStorageTransactions : [];
  });

  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');

  // Add a new transaction
  const addTransaction = (e) => {
    e.preventDefault();

    if (text.trim() === '' || amount.trim() === '') {
      alert('Please add a text and amount');
    } else {
      const newTransaction = {
        id: generateID(),
        text: text,
        amount: +amount,
      };

      setTransactions([...transactions, newTransaction]);

      setText('');
      setAmount('');
    }
  };

  // Generate random ID
  const generateID = () => Math.floor(Math.random() * 100000000);

  // Remove transaction by ID
  const removeTransaction = (id) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id));
  };

  // Update localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Calculate total, income, and expense
  const calculateAmounts = () => {
    const amounts = transactions.map((transaction) => transaction.amount);

    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts.filter((item) => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
    const expense = (amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);

    return { total, income, expense };
  };

  const { total, income, expense } = calculateAmounts();

  return (
    <div>
      <h2>Your Balance</h2>
      <h3>${total}</h3>

      <div className="inc-exp-container">
        <div>
          <h4>Income</h4>
          <p id="money-plus" className="money plus">
            +${income}
          </p>
        </div>
        <div>
          <h4>Expense</h4>
          <p id="money-minus" className="money minus">
            -${expense}
          </p>
        </div>
      </div>

      <h3>History</h3>
      <ul id="list" className="list">
        {transactions.map((transaction) => (
          <li key={transaction.id} className={transaction.amount < 0 ? 'minus' : 'plus'}>
            {transaction.text}{' '}
            <span>
              {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount)}
            </span>
            <button className="delete-btn" onClick={() => removeTransaction(transaction.id)}>
              x
            </button>
          </li>
        ))}
      </ul>

      <h3>Add new transaction</h3>
      <form id="form" onSubmit={addTransaction}>
        <div className="form-control">
          <label htmlFor="text">Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text..."
          />
        </div>
        <div className="form-control">
          <label htmlFor="amount">
            Amount <br />
            (negative - expense, positive - income)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
          />
        </div>
        <button className="btn">Add transaction</button>
      </form>
    </div>
  );
}

export default App;
