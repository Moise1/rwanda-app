import logo from './logo.svg';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import { Table, Select } from "antd";
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


const API_BASE = process.env.REACT_APP_API_BASE;

function App(){
  const [level, setLevel] = useState(null);
  const [data, setData] = useState([]);
  const [size, setSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    province: null,
    district: null,
    sector: null,
    cell: null
  });
  const [options, setOptions] = useState({
    provinces: [],
    districts: [],
    sectors: [],
    cells: []
  });

  const levels = ['province', 'district', 'sector', 'cell', 'village'];
  const levelOptions = levels.map(l => ({
    value: l,
    label: l.charAt(0).toUpperCase() + l.slice(1)
  }));

  const fetchData = async (type, params = {}) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/${type}s`, {
        params: Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v != null)
        )
      });

      if (type === level) {
        setData(res.data.data.map((item, index) => ({
          key: index,
          name: item
        })));
        setSize(res.data.size);
      } else {
        setOptions(prev => ({
          ...prev,
          [`${type}s`]: res.data.data
        }));
      }
    } catch (err) {
      console.error(`Error fetching ${type}s:`, err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData('province');
  }, []);

  useEffect(() => {
    if (level) {
      const filterParams = {
        province: filters.province,
        district: filters.district,
        sector: filters.sector,
        cell: filters.cell
      };
      fetchData(level, filterParams);
    }
  }, [level, filters]);

  const handleLevelChange = (value) => {
    setLevel(value);
    setFilters({
      province: null,
      district: null,
      sector: null,
      cell: null
    });
    setData([]);
    setSize(0)

    setOptions(prev => ({
      ...prev,
      districts: [],
      sectors: [],
      cells: []
    }));
  };

  const handleFilterChange = (key, value) => {
    const resetDependents = {
      province: {
        district: null,
        sector: null,
        cell: null
      },
      district: {
        sector: null,
        cell: null
      },
      sector: {
        cell: null
      },
      cell: {}
    };

    const newFilters = {
      ...filters,
      [key]: value,
      ...resetDependents[key]
    };
    setFilters(newFilters);

    // Fetch options for the next level with all relevant parent filters
    if (key === 'province') {
      fetchData('district', { province: value });
    } else if (key === 'district') {
      fetchData('sector', {
        province: newFilters.province,
        district: value
      });
    } else if (key === 'sector') {
      fetchData('cell', {
        province: newFilters.province,
        district: newFilters.district,
        sector: value
      });
    } else if (key === 'cell') {
      fetchData('village', {
        province: newFilters.province,
        district: newFilters.district,
        sector: newFilters.sector,
        cell: value
      });
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' }
  ];
  return (
    <Container>
      <h2 className='my-5 text-center'>Rwanda Administrative Divisions</h2>
      <Row className='mb-5'>
        <Col className='mb-4'>
          <Select
            style={{ width: 150 }}
            options={levelOptions}
            onChange={handleLevelChange}
            value={level}
            placeholder="Select division"
          />
        </Col>
        {level && level !== 'province' && (
          <Col className='mb-4'>
            <Select
              style={{ width: 150 }}
              placeholder="Select province"
              value={filters.province}
              options={options.provinces.map(p => ({
                value: p,
                label: p
              }))}
              onChange={value => handleFilterChange('province', value)}
            />
          </Col>
        )}
        {level && ['sector', 'cell', 'village'].includes(level) && (
          <Col className='mb-4'>
            <Select
              style={{ width: 150 }}
              placeholder="Select district"
              value={filters.district}
              options={options.districts.map(d => ({
                value: d,
                label: d
              }))}
              onChange={value => handleFilterChange('district', value)}
              disabled={!filters.province}
            />
          </Col>
        )}
        {level && ['cell', 'village'].includes(level) && (
          <Col className='mb-4'>
            <Select
              style={{ width: 150 }}
              placeholder="Select sector"
              value={filters.sector}
              options={options.sectors.map(s => ({
                value: s,
                label: s
              }))}
              onChange={value => handleFilterChange('sector', value)}
              disabled={!filters.district}
            />
          </Col>
        )}
        {level === 'village' && (
          <Col className='mb-4'>
            <Select
              style={{ width: 150 }}
              placeholder="Select cell"
              value={filters.cell}
              options={options.cells.map(c => ({
                value: c,
                label: c
              }))}
              onChange={value => handleFilterChange('cell', value)}
              disabled={!filters.sector}
            />
          </Col>
        )}
      </Row>
      {level && size > 0 && (
        <p className="mb-3">{size} {level}{size > 1 ? 's' : ''}</p>
      )}
      <Table
        dataSource={data}
        columns={columns}
        loading={loading}
        rowKey="key"
      />
    </Container>
  )
};

export default App;