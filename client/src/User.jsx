import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'
import { Link } from 'react-router-dom';
import { Button, Modal, Spinner} from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faFileExport, faArrowLeft, faArrowRight, faFileImport } from '@fortawesome/free-solid-svg-icons';

const User = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  //const [pages, setPages] = useState(1);
  const [perPage,setPerPage] = useState(50);
  const [inputPage, setInputPage] = useState('');
  const [invalidPage, setInvalidPage] = useState(false);
  const [filters, setFilters] = useState({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  //const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/data');
        setData(response.data.data);
        setFilteredData(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(filteredData.length / perPage)) {
      setPage(newPage);
    }
  };

  const handleInputChange = (e) => {
    setInputPage(e.target.value);
    setInvalidPage(false);
  };

  const handleInputSubmit = () => {
    const newPage = parseInt(inputPage);
    if (newPage > 0 && newPage <= Math.ceil(filteredData.length / perPage)) {
      setPage(newPage);
    }
    else {
      setInvalidPage(true);
    }
  };

  const handleFilterChange = (column, value) => {
    setFilters({
      ...filters,
      [column]: value,
    });
  };

  const applyFilters = () => {
    let filtered = data.filter((item) => {
      return Object.keys(filters).every(key => {
        return item[key].toString().toLowerCase().includes(filters[key].toLowerCase());
      });
    });
    setFilteredData(filtered);
    setPage(1); 
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

const handleFileChange = async (e) => {
  const file = e.target.files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setSuccessMessage('');
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMessage(response.data);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };

  /*if (!loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }*/

    const getSerialNumber = (index) => {
      return (page - 1) * perPage + index + 1;
    };

    const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage);


  return (
    <div className="container">
      <div className="header-container">
      <Link to="/dashboard"><Button className="teal-button">Dashboard</Button></Link>
        <h1>SAMPLE DATA</h1>
        <div className="header-buttons">
        <input type="file" onChange={handleFileChange} style={{ display: 'none' }} id="fileUpload" />
          <Button className="teal-button" onClick={() => document.getElementById('fileUpload').click()} title="Import" >
          <FontAwesomeIcon icon={faFileImport} />
          </Button>
          <Button className="teal-button" onClick={() => setShowFilterModal(true)} title="Filter">
            <FontAwesomeIcon icon={faFilter} />
          </Button>
          <Button className="teal-button" onClick={exportToExcel} title="Export">
            <FontAwesomeIcon icon={faFileExport} />
          </Button>
          
          {loading && (
        <div>
          <Spinner animation="border" role="status">
            <span className="sr-only">Uploading...</span>
          </Spinner>
          <span> Loading...</span>
        </div>
      )}
      {successMessage && <div>{successMessage}</div>}
      {error && <div>Error uploading file: {error.message}</div>}
      </div>
      </div>
      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
              <th>Serial No.</th>
                {paginatedData.length > 0 && Object.keys(paginatedData[0]).map((key) => (
                  key !== '_id' && key !== '__v' && <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
            {paginatedData.map((item, index) => (
                <tr key={item._id || index}>
                  <td>{getSerialNumber(index)}</td>
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
       <div className="per-page-dropdown">
<label>Number of rows:</label>
<select value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))}>
<option value={10}>10</option>
<option value={20}>20</option>
<option value={50}>50</option>
<option value={100}>100</option>
<option value={500}>500</option>
<option value={1000}>1000</option>
</select>
</div>
<div className="pagination-controls">
        <button className="teal-button" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
        <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <span> Page {page} of {Math.ceil(filteredData.length / perPage)} </span>
        <button className="teal-button" onClick={() => handlePageChange(page + 1)} disabled={page ===Math.ceil(filteredData.length / perPage)}>
        <FontAwesomeIcon icon={faArrowRight} />
        </button>
        <input 
          type="number" 
          value={inputPage} 
          onChange={handleInputChange} 
          placeholder={`Page 1 - ${Math.ceil(filteredData.length / perPage)}`} 
        />
        <button className="teal-button" onClick={handleInputSubmit}>Go</button>
        {invalidPage && <span style={{ color: 'red', marginLeft: '10px' }}>Invalid page</span>}
      </div>
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