import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import './App.css'; // Assuming you have App.css for styles

Chart.register(...registerables);

function App() {
  const [transactions, setTransactions] = useState(() => {
    const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
    return localStorageTransactions !== null ? localStorageTransactions : [];
  });

  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const addTransaction = (e) => {
    e.preventDefault();
    if (text.trim() === '' || amount.trim() === '') {
      alert('Please add text and amount');
    } else {
      const newTransaction = {
        id: generateID(),
        text,
        amount: +amount,
        date: new Date(date),
      };
      setTransactions([...transactions, newTransaction]);
      setText('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]); // ISO format to YYYYMMDD
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
    const total = (amounts.reduce((acc, item) => (acc += item), 0)).toFixed(2);
    const income = (amounts.filter((item) => item > 0).reduce((acc, item) => (acc += item), 0)).toFixed(2);
    const expense = (amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);
    return { total, income, expense };
  };

  const { total, income, expense } = updateValues();

// Function to group and sort transactions by month
const groupTransactionsByMonth = (transactions) => {
  const grouped = {};

  transactions.forEach(transaction => {
    const monthYear = new Date(transaction.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    
    grouped[monthYear].push(transaction);
  });

  // Sort the grouped transactions by month-year
  const sortedGrouped = Object.keys(grouped)
    .sort((a, b) => new Date(a) - new Date(b))
    .reduce((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {});

  return sortedGrouped;
};

const groupedTransactions = groupTransactionsByMonth(transactions);

  const renderChart = () => {
    const ctx = document.getElementById('expenditureChart').getContext('2d');
    const currentMonth = new Date().getMonth();

    const monthlyData = transactions.filter((transaction) => {
      const transactionMonth = new Date(transaction.date).getMonth();
      return transactionMonth === currentMonth && transaction.amount < 0;
    });

    const labels = monthlyData.map((transaction) => transaction.text);
    const data = monthlyData.map((transaction) => transaction.amount);

    if (window.myChart) {
      window.myChart.destroy();
    }

    const generateRandomColor = () => {
      const randomColor = () => Math.floor(Math.random() * 256);
      return `rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, 0.7)`;
    };

    const colorSet = Array.from({ length: 30 }, generateRandomColor);

    window.myChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Monthly Expenditure',
            data: data,
            backgroundColor: colorSet.slice(0, data.length),
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 1.2,
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

  const renderWeeklyExpenditureChart = () => {
    const ctx = document.getElementById('weeklyExpenditureChart').getContext('2d');
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

    const weeklyData = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startOfWeek && transaction.amount < 0;
    });

    const labels = weeklyData.map((transaction) => transaction.text);
    const data = weeklyData.map((transaction) => Math.abs(transaction.amount));

    if (window.myWeeklyChart) {
      window.myWeeklyChart.destroy();
    }

    window.myWeeklyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: "This Week's Expenditure",
            data: data,
            backgroundColor: 'rgba(50, 92, 168, 0.9)',
            borderColor: 'rgba(0, 0, 0, 1)',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 30,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1000,
            },
          },
          x: {
            ticks: {
              autoSkip: false,
              padding: 10,
            },
          },
        },
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Weekly Expenditure (in INR)',
            padding: {
              top: 10,
              bottom: 30,
            },
          },
        },
      },
    });
  };

  useEffect(() => {
    renderChart();
    renderWeeklyExpenditureChart();
    return () => {
      if (window.myWeeklyChart) {
        window.myWeeklyChart.destroy();
      }
    };
  }, [transactions]);

  return (
    <div className="main-container">
      <div className='head-container'>
        <h2>Expense Tracker</h2>
        <h2>......</h2>
        <h2>Your Balance</h2>
        <h2 style={{color:'black'}}>₹{total}</h2>
      </div>
      <div className="app-container">
      <div className="history-container">
          <h2>History</h2>
            {Object.entries(groupedTransactions).map(([monthYear, transactions]) => (
            <div key={monthYear}>
            <h3>{monthYear}</h3>
            <ul className="list">
            {transactions.map(transaction => (
            <li key={transaction.id} className={transaction.amount >= 0 ? 'plus' : 'minus'}>
            {transaction.type} {transaction.amount >= 0 ? `+₹${transaction.amount.toFixed(2)}` : `-₹${Math.abs(transaction.amount).toFixed(2)}`}
          </li>
          ))}
        </ul>
      </div>
    ))}
  </div>  

        <div className="inc-exp-container">
          <h2>Your Balance</h2>
          <h3>₹{total}</h3>
          <div>
            <h4>Income</h4>
            <p id="money-plus" className="money plus">₹{income}</p>
          </div>
          <div>
            <h4>Expense</h4>
            <p id="money-minus" className="money minus">₹{expense}</p>
          </div>
        
          <h3>Add new transaction</h3>
          <form id="form" onSubmit={addTransaction}>
            <div className="form-control">
              <label htmlFor="text">Text</label>
              <input id="text" type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text..." />
            </div>
            <div className="form-control">
              <label htmlFor="amount">Amount <br />(negative - expense, positive - income)</label>
              <input id="value" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount in INR..." />
            </div>
            <div className="form-control">
              <label htmlFor="date">Date</label>
              <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Select date..." />
            </div>
            <button className="btn">Add transaction</button>
          </form>
        </div>

        {/* Right side: Charts */}
        <div className="chart-container">
          <canvas id="expenditureChart"></canvas>
          <div style={{ position: 'relative', height: '400px', width: '100%' }}>
            <canvas id="weeklyExpenditureChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;