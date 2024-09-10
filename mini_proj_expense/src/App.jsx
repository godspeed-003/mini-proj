import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

function App() {
  const [transactions, setTransactions] = useState(() => {
    const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
    return localStorageTransactions !== null ? localStorageTransactions : [];
  });
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');


  const addTransaction = (e) => {
    e.preventDefault();
    if (text.trim() === '' || amount.trim() === '') {
      alert('Please add text and amount');
    } else {
      const newTransaction = {
        id: generateID(),
        text: text,
        amount: +amount,
        date: new Date(),
      };

      setTransactions([...transactions, newTransaction]);
      setText('');
      setAmount('');
    }
  };

  const generateID = () => Math.floor(Math.random() * 1000000000);

  const removeTransaction = (id) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id));
  };

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const updateValues = () => {
    const amounts = transactions.map((transaction) => transaction.amount);
    const total = (amounts.reduce((acc, item) => (acc += item), 0) ).toFixed(2);
    const income = (
      amounts.filter((item) => item > 0).reduce((acc, item) => (acc += item), 0) 
    ).toFixed(2);
    const expense = (
      amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0)  * -1
    ).toFixed(2);
    return { total, income, expense };
  };

  const { total, income, expense } = updateValues();

  const renderChart = () => {
    const ctx = document.getElementById('expenditureChart').getContext('2d');
    const currentMonth = new Date().getMonth();
    const monthlyData = transactions.filter((transaction) => {
      const transactionMonth = new Date(transaction.date).getMonth();
      return transactionMonth === currentMonth;
    });

    const labels = monthlyData.map((transaction) => transaction.text);
    const data = monthlyData.map((transaction) => transaction.amount);

    if (window.myChart) {
      window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Monthly Expenditure',
            data: data,
            backgroundColor: data.map((amount) =>
              amount < 0 ? 'rgba(192, 57, 43, 0.2)' : 'rgba(46, 204, 113, 0.2)'
            ),
            borderColor: data.map((amount) =>
              amount < 0 ? 'rgba(192, 57, 43, 1)' : 'rgba(46, 204, 113, 1)'
            ),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Monthly Expenditure Breakdown (in INR)',
          },
        },
      },
    });
  };

  useEffect(() => {
    renderChart();
  }, [transactions]);

  return (
    <div>
      <h2>Your Balance</h2>
      <h3>₹{total}</h3>

      <div className="inc-exp-container">
        <div>
          <h4>Income</h4>
          <p id="money-plus" className="money plus">
            ₹{income}
          </p>
        </div>
        <div>
          <h4>Expense</h4>
          <p id="money-minus" className="money minus">
            ₹{expense}
          </p>
        </div>
      </div>

      <h3>History</h3>
      <ul id="list" className="list">
        {transactions.map((transaction) => (
          <li key={transaction.id} className={transaction.amount < 0 ? 'minus' : 'plus'}>
            {transaction.text}{' '}
            <span>
              {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount).toFixed(2)}
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
            placeholder="Enter amount in INR..."
          />
        </div>
        <button className="btn">Add transaction</button>
      </form>

      <canvas id="expenditureChart"></canvas>
    </div>
  );
}

export default App;
