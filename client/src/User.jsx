import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'
import { Link } from 'react-router-dom';
import { Button, Modal} from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faFileExport, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const User = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(50);
  const [inputPage, setInputPage] = useState('');
  const [invalidPage, setInvalidPage] = useState(false);
  const [filters, setFilters] = useState({});
  const [showFilterModal, setShowFilterModal] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/data', {
          params: { page, limit },
        });
        setData(response.data.data);
        setFilteredData(response.data.data);
        setPages(response.data.pages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [page, limit]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pages) {
      setPage(newPage);
    }
  };

  const handleInputChange = (e) => {
    setInputPage(e.target.value);
    setInvalidPage(false);
  };

  const handleInputSubmit = () => {
    const newPage = parseInt(inputPage);
    if (newPage > 0 && newPage <= pages) {
      setPage(newPage);
    }
    else {
      setInvalidPage(true); // Set invalid page flag if page number is invalid
    }
  };

  const handleFilterChange = (column, value) => {
    setFilters({
      ...filters,
      [column]: value,
    });
  };

  const applyFilters = () => {
    let filtered = data.filter(item => {
      return Object.keys(filters).every(key => {
        return item[key].toString().toLowerCase().includes(filters[key].toLowerCase());
      });
    });
    setFilteredData(filtered);
  };

  const handleFilterSubmit = () => {
    applyFilters();
    setShowFilterModal(false);
  };

  const handleRemoveFilters = () => {
    setFilters({});
    setFilteredData(data);
    setShowFilterModal(false);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  const exportToExcel = async () => {
    setLoading(true);
    try {
      let exportData = [];
      if (Object.keys(filters).length === 0) {
        // If no filters are applied, fetch all data directly from the server
        const response = await axios.get('http://localhost:5000/api/data');
        exportData = response.data.data;
      } else {
        // Export filtered data from the whole dataset
        const response = await axios.get('http://localhost:5000/api/data');
        const allData = response.data.data;
        exportData = allData.filter(item => {
          return Object.keys(filters).every(key => {
            return item[key].toString().toLowerCase().includes(filters[key].toLowerCase());
          });
        });
      }
  
      const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const fileExtension = '.xlsx';
      const fileName = 'data_export';
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const dataExport = new Blob([excelBuffer], { type: fileType });
      saveAs(dataExport, fileName + fileExtension);
      setLoading(false);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError(err);
      setLoading(false);
    }
};


  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container">
      <div className="header-container">
      <Link to="/dashboard"><Button className="teal-button">Dashboard</Button></Link>
        <h1>SAMPLE DATA</h1>
        <div className="header-buttons">
          <Button className="teal-button" onClick={() => setShowFilterModal(true)}>
            <FontAwesomeIcon icon={faFilter} />
          </Button>
          <Button className="teal-button" onClick={exportToExcel}>
            <FontAwesomeIcon icon={faFileExport} />
          </Button>
      </div>
      </div>
      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {data.length > 0 && Object.keys(data[0]).map((key) => (
                  key !== '_id' && key !== '__v' && <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
            {filteredData.map((item) => (
                <tr key={item['service port']}>
                  {Object.entries(item).map(([key, value]) => (
                    key !== '_id' && key !== '__v' && <td key={key}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pagination">
        <button className="teal-button" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
        <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <span> Page {page} of {pages} </span>
        <button className="teal-button" onClick={() => handlePageChange(page + 1)} disabled={page === pages}>
        <FontAwesomeIcon icon={faArrowRight} />
        </button>
        <input 
          type="number" 
          value={inputPage} 
          onChange={handleInputChange} 
          placeholder={`Page 1 - ${pages}`} 
        />
        <button className="teal-button" onClick={handleInputSubmit}>Go</button>
        {invalidPage && <span style={{ color: 'red', marginLeft: '10px' }}>Invalid page</span>}
      </div>
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Filter Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {data.length > 0 && Object.keys(data[0]).map((key) => (
            key !== '_id' && key !== '__v' && (
              <div key={key} className="filter-input">
                <label>{key}</label>
                <input
                  type="text"
                  placeholder={`Filter ${key}`}
                  value={filters[key] || ''}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                />
              </div>
            )
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button className="teal-button" onClick={handleRemoveFilters}>Remove Filters</Button>
          <Button className="teal-button" onClick={handleFilterSubmit}>Apply Filters</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default User;
