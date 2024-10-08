import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_KEY = 'UGYHGJBMQPH6F5KW'; // Replace with your actual API key

const StockMarketDashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [newStock, setNewStock] = useState('');
  const [error, setError] = useState('');

  const fetchStockData = async (symbol) => {
    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      const timeSeriesData = data['Time Series (5min)'];
      const formattedData = Object.entries(timeSeriesData).map(([time, values]) => ({
        time: new Date(time).toLocaleTimeString(),
        price: parseFloat(values['4. close'])
      })).reverse().slice(0, 20);

      return formattedData;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError(`Failed to fetch data for ${symbol}. ${error.message}`);
      return [];
    }
  };

  const handleAddStock = async () => {
    if (newStock && !stocks.find(stock => stock.symbol === newStock)) {
      const data = await fetchStockData(newStock);
      if (data.length > 0) {
        setStocks([...stocks, { symbol: newStock, data }]);
        setNewStock('');
        setError('');
      }
    }
  };

  const handleRemoveStock = (symbol) => {
    setStocks(stocks.filter(stock => stock.symbol !== symbol));
  };

  useEffect(() => {
    const updateStocks = async () => {
      const updatedStocks = await Promise.all(stocks.map(async (stock) => {
        const newData = await fetchStockData(stock.symbol);
        return { ...stock, data: newData };
      }));
      setStocks(updatedStocks);
    };

    const interval = setInterval(updateStocks, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [stocks]);

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Real-Time Stock Market Dashboard</h1>
      
      <div style={{ marginBottom: '1rem', display: 'flex' }}>
        <input
          type="text"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          placeholder="Enter stock symbol"
          style={{ marginRight: '0.5rem', padding: '0.5rem' }}
        />
        <button onClick={handleAddStock} style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>Add Stock</button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffcccc', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {stocks.map(stock => (
        <div key={stock.symbol} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'semibold' }}>{stock.symbol}</h2>
            <button onClick={() => handleRemoveStock(stock.symbol)} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stock.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}

      {stocks.length === 0 && (
        <div style={{ backgroundColor: '#e6f3ff', padding: '1rem', borderRadius: '4px' }}>
          <strong>No stocks</strong>
          <p>Please add a stock to start tracking.</p>
        </div>
      )}
    </div>
  );
};

export default StockMarketDashboard;