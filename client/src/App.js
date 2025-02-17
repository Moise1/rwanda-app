import logo from './logo.svg';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import { Table, Select } from "antd";
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


const API_BASE = 'http://localhost:3500'; // Adjust based on your backend

function App() {
  const [level, setLevel] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({ provinces: [], districts: [], sectors: [], cells: [] });

  const levels = ['province', 'district', 'sector', 'cell', 'village'];
  const levelOptions = levels.map(l => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }));

  const fetchData = async (type, params = {}) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/${type}s`, { params });
      if (type === level) {
        setData(res.data.data.map((item, index) => ({ key: index, name: item })));
      } else {
        setOptions(prev => ({ ...prev, [type + 's']: res.data.data }));
      }
    } catch (err) {
      console.error(`Error fetching ${type}s:`, err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (level) fetchData(level, filters);
  }, [level, filters]);

  useEffect(() => {
    fetchData('province');
  }, []);

  const handleLevelChange = value => {
    setLevel(value);
    setFilters({});
    setData([]);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'province') {
      fetchData('district', { province: value });
      setData([]);
    }
    if (key === 'district') {
      fetchData('sector', { province: filters.province, district: value });
      setData([]);
    }
    if (key === 'sector') {
      fetchData('cell', { province: filters.province, district: filters.district, sector: value });
      setData([]);
    }
    if (key === 'cell') {
      fetchData('village', { province: filters.province, district: filters.district, sector: filters.sector, cell: value });
      setData([]);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
  ];

  return (
    <Container>
      <h2 className='my-5 text-center'>Rwanda Administrative Divisions</h2>
      <Row>
        <Col className='mb-4'>
          <Select
            style={{ width: 150 }}
            options={levelOptions}
            onChange={handleLevelChange}
            value={level}
            placeholder="Select division"
          />
        </Col>
        {(level === 'district' || level === 'sector' || level === 'cell' || level === 'village') && (
          <Col className='mb-4'>
            <Select
              style={{ width: 150 }}
              placeholder="Select province"
              options={options.provinces.map(p => ({ value: p, label: p }))}
              onChange={value => handleFilterChange('province', value)}
            />
          </Col>
        )}
        {(level === 'sector' || level === 'cell' || level === 'village') && (
          <Col className='mb-4'>
            <Select
              style={{ width: 150 }}
              placeholder="Select district"
              options={options.districts.map(d => ({ value: d, label: d }))}
              onChange={value => handleFilterChange('district', value)}
            />
          </Col>
        )}
        {(level === 'cell' || level === 'village') && (
          <Col className='mb-4'>
            <Select
              style={{ width: 150 }}
              placeholder="Select sector"
              options={options.sectors.map(s => ({ value: s, label: s }))}
              onChange={value => handleFilterChange('sector', value)}
            />
          </Col>
        )}
        {level === 'village' && (
          <Col className='mb-4'>
            <Select
              style={{ width: 150 }}
              placeholder="Select cell"
              options={options.cells.map(c => ({ value: c, label: c }))}
              onChange={value => handleFilterChange('cell', value)}
            />
          </Col>
        )}
      </Row>
      <Table dataSource={data} columns={columns} loading={loading} rowKey="key" />
    </Container>
  );
}

export default App;