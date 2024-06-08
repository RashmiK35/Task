import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/data');
        console.log('API Response:', response.data); // Log the API response
        if (Array.isArray(response.data.data)) {
          setData(response.data.data);
        } else {
          console.error('Data is not an array:', response.data.data);
          setError(new Error('Data is not in expected format.'));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processData = () => {
    const countsBySeverity = {
      Critical: 0,
      High: 0,
      Informational: 0,
      Low: 0,
      Medium: 0,
    };

    const countsByIssueName = {};

    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.Severity in countsBySeverity) {
          countsBySeverity[item.Severity]++;
        }
        if (item['Issue Name']) {
          countsByIssueName[item['Issue Name']] = (countsByIssueName[item['Issue Name']] || 0) + 1;
        }
      });
    }

    return { countsBySeverity, countsByIssueName };
  };

  const { countsBySeverity, countsByIssueName } = processData();

  const barChartDataSeverity = {
    labels: Object.keys(countsBySeverity),
    datasets: [
      {
        label: 'Count by Severity',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(255, 99, 132, 0.4)',
        hoverBorderColor: 'rgba(255, 99, 132, 1)',
        data: Object.values(countsBySeverity),
      },
    ],
  };

  const pieChartDataSeverity = {
    labels: Object.keys(countsBySeverity),
    datasets: [
      {
        label: 'Severity Distribution',
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          'rgba(255, 99, 132, 0.4)',
          'rgba(54, 162, 235, 0.4)',
          'rgba(255, 206, 86, 0.4)',
          'rgba(75, 192, 192, 0.4)',
          'rgba(153, 102, 255, 0.4)',
          'rgba(255, 159, 64, 0.4)',
        ],
        hoverBorderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        data: Object.values(countsBySeverity),
      },
    ],
  };

  const barChartDataIssueName = {
    labels: Object.keys(countsByIssueName),
    datasets: [
      {
        label: 'Count by Issue Name',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(75, 192, 192, 0.4)',
        hoverBorderColor: 'rgba(75, 192, 192, 1)',
        data: Object.values(countsByIssueName),
      },
    ],
  };

  const pieChartDataIssueName = {
    labels: Object.keys(countsByIssueName),
    datasets: [
      {
        label: 'Issue Name Distribution',
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          'rgba(75, 192, 192, 0.4)',
          'rgba(54, 162, 235, 0.4)',
          'rgba(255, 206, 86, 0.4)',
          'rgba(75, 192, 192, 0.4)',
          'rgba(153, 102, 255, 0.4)',
          'rgba(255, 159, 64, 0.4)',
          'rgba(255, 99, 132, 0.4)',
        ],
        hoverBorderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        data: Object.values(countsByIssueName),
      },
    ],
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <style>
        {`
          .dashboard {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            padding: 20px;
          }

          .chart-container {
            width: 40%;
            margin-bottom: 20px;
          }

          .chart-container h2 {
            text-align: center;
            font-size: 1rem;
          }

          .header-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            position: relative;
          }

          .header-container h1 {
            margin: 0;
            font-size: 1.5rem;
            flex-grow: 1;
            text-align: center;
          }

          .header-container .btn {
            padding: 0.5rem 1rem;
            font-size: 1rem;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            position: absolute;
            left: 20px;
          }
        `}
      </style>
      <div className="header-container">
        <Link to="/user" className="btn">Home</Link>
        <h1>Dashboard</h1>
      </div>
      <div className="dashboard">
        <div className="chart-container">
          <h2>Bar Chart: Severity Distribution</h2>
          <Bar data={barChartDataSeverity} />
        </div>
        <div className="chart-container">
          <h2>Pie Chart: Severity Distribution</h2>
          <Pie data={pieChartDataSeverity} />
        </div>
        <div className="chart-container">
          <h2>Bar Chart: Issue Name Distribution</h2>
          <Bar data={barChartDataIssueName} />
        </div>
        <div className="chart-container">
          <h2>Pie Chart: Issue Name Distribution</h2>
          <Pie data={pieChartDataIssueName} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
