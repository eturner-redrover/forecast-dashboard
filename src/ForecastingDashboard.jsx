import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell, LabelList } from 'recharts';
import html2canvas from 'html2canvas';

// Simple hash function for password verification
// To change the password, update this hash. Generate a new hash by running in browser console:
// btoa('yourpassword') 
const PASSWORD_HASH = 'Zm9yZWNhc3QyMDI1'; // This is 'forecast2025' encoded

// Embed mode secret key - use this in URL: ?embed=true&key=redrover2025
const EMBED_KEY = 'cmVkcm92ZXIyMDI1'; // This is 'redrover2025' encoded

// Check if we're in embed mode
const getEmbedMode = () => {
  const params = new URLSearchParams(window.location.search);
  const isEmbed = params.get('embed') === 'true';
  const key = params.get('key') || '';
  const isValidKey = btoa(key) === EMBED_KEY;
  return isEmbed && isValidKey;
};

const isEmbedMode = getEmbedMode();

const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (btoa(password) === PASSWORD_HASH) {
      sessionStorage.setItem('forecast_auth', 'true');
      onLogin();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #faf9f7 0%, #f5f3f0 100%)',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '32px',
          fontWeight: 700,
          color: '#1a1a1a',
          margin: 0,
          letterSpacing: '-1px'
        }}>
          Sales Forecasting
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#666',
          marginTop: '8px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontWeight: 500
        }}>
          Dashboard Access
        </p>
        <div style={{
          width: '40px',
          height: '3px',
          background: 'linear-gradient(90deg, #ff5555, #3574e3, #ffcc01)',
          margin: '24px auto'
        }} />
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: '16px',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: '16px',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3574e3'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          {error && (
            <p style={{ color: '#ff5555', fontSize: '14px', margin: '0 0 16px 0' }}>{error}</p>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: 600,
              color: 'white',
              background: '#1a1a1a',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#333'}
            onMouseOut={(e) => e.target.style.background = '#1a1a1a'}
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

const forecasters = ['Jeremy', 'Rachel', 'Carolyn', 'Dani', 'Eric'];
const colors = {
  Jeremy: '#ff5555',
  Rachel: '#3574e3', 
  Carolyn: '#ffcc01',
  Dani: '#9dcdc0',
  Eric: '#6DA34D',
  Actual: '#1a1a1a'
};

// Google Sheets CSV URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoUeMCDZyhjrYM9LYVHIPeylW5gYokJA0-4OnyJiqK4u2pjNqG2JzcUby7FXzTNmpnsKGV6IKV0p4Q/pub?gid=0&single=true&output=csv';

// Parse CSV text into array of objects (handles quoted fields with commas)
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  
  // Parse a single CSV line, handling quoted fields
  const parseLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };
  
  const headers = parseLine(lines[0]);
  
  return lines.slice(1).map(line => {
    const values = parseLine(line);
    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || '';
    });
    return row;
  });
};

// Transform CSV data into the format expected by the dashboard
const transformData = (csvData) => {
  return csvData.map(row => {
    const parseNum = (val) => {
      if (!val || val === '' || val === 'null') return null;
      // Remove commas, quotes, dollar signs, and spaces
      const cleaned = val.replace(/[,$"\s]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    };
    
    // Parse date - convert "10/10/2025" to "10/10" for display
    const parseDate = (val) => {
      if (!val) return '';
      const parts = val.split('/');
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`; // Just month/day
      }
      return val;
    };
    
    return {
      date: parseDate(row.date || row.Date),
      Jeremy: {
        month: parseNum(row.Jeremy_month),
        quarter: parseNum(row.Jeremy_quarter),
        year: parseNum(row.Jeremy_year)
      },
      Rachel: {
        month: parseNum(row.Rachel_month),
        quarter: parseNum(row.Rachel_quarter),
        year: parseNum(row.Rachel_year)
      },
      Carolyn: {
        month: parseNum(row.Carolyn_month),
        quarter: parseNum(row.Carolyn_quarter),
        year: parseNum(row.Carolyn_year)
      },
      Dani: {
        month: parseNum(row.Dani_month),
        quarter: parseNum(row.Dani_quarter),
        year: parseNum(row.Dani_year)
      },
      Eric: {
        month: parseNum(row.Eric_month),
        quarter: parseNum(row.Eric_quarter),
        year: parseNum(row.Eric_year)
      },
      actual: {
        month: parseNum(row.actual_month),
        quarter: parseNum(row.actual_quarter),
        year: parseNum(row.actual_year)
      }
    };
  });
};

// Fallback data in case sheet is unavailable
const fallbackData = [
  { date: '10/10', Jeremy: { month: 400000, quarter: 1250000, year: 13000000 }, Rachel: { month: 350000, quarter: 1100000, year: 12000000 }, Carolyn: { month: null, quarter: null, year: null }, Dani: { month: 330000, quarter: 1280000, year: 13100000 }, Eric: { month: 340000, quarter: 1200000, year: 11300000 }, actual: { month: null, quarter: null, year: null } },
  { date: '10/17', Jeremy: { month: 400000, quarter: 1250000, year: 13000000 }, Rachel: { month: 375000, quarter: 1000000, year: 12000000 }, Carolyn: { month: 465000, quarter: 750000, year: 12000000 }, Dani: { month: 345000, quarter: 1280000, year: 13100000 }, Eric: { month: 340000, quarter: 1000000, year: 11500000 }, actual: { month: null, quarter: null, year: null } },
  { date: '10/24', Jeremy: { month: 425000, quarter: 1250000, year: 13000000 }, Rachel: { month: null, quarter: null, year: null }, Carolyn: { month: 418000, quarter: 1100000, year: 13000000 }, Dani: { month: 395000, quarter: 1260000, year: 13100000 }, Eric: { month: 350000, quarter: 1000000, year: 11500000 }, actual: { month: null, quarter: null, year: null } },
  { date: '10/31', Jeremy: { month: 480000, quarter: 1265000, year: 13000000 }, Rachel: { month: 475000, quarter: 1100000, year: 12000000 }, Carolyn: { month: 472500, quarter: 1100000, year: 13000000 }, Dani: { month: 472000, quarter: 1260000, year: 13100000 }, Eric: { month: 500000, quarter: 1300000, year: 11600000 }, actual: { month: 473265, quarter: null, year: null } },
  { date: '11/7', Jeremy: { month: 407000, quarter: 1300000, year: 13000000 }, Rachel: { month: 401000, quarter: 1100000, year: 12000000 }, Carolyn: { month: 386000, quarter: 1275000, year: 13000000 }, Dani: { month: 392000, quarter: 1290000, year: 13100000 }, Eric: { month: 611000, quarter: 1344000, year: 11700000 }, actual: { month: null, quarter: null, year: null } },
  { date: '11/14', Jeremy: { month: 425000, quarter: 1300000, year: 13000000 }, Rachel: { month: 450000, quarter: 1200000, year: 12000000 }, Carolyn: { month: 412000, quarter: 1300000, year: 13000000 }, Dani: { month: 420000, quarter: 1300000, year: 12400000 }, Eric: { month: 617000, quarter: 1500000, year: 12000000 }, actual: { month: null, quarter: null, year: null } },
  { date: '11/21', Jeremy: { month: 540000, quarter: 1425000, year: 13000000 }, Rachel: { month: 530000, quarter: 1300000, year: 12000000 }, Carolyn: { month: 556000, quarter: 1375000, year: 13000000 }, Dani: { month: 570000, quarter: 1410000, year: 12400000 }, Eric: { month: 600000, quarter: 1400000, year: 12000000 }, actual: { month: 606898, quarter: null, year: null } },
];

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(3)}M`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const formatFullCurrency = (value) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

// Chart wrapper with download button on hover
const ChartWrapper = ({ children, filename }) => {
  const [isHovered, setIsHovered] = useState(false);
  const chartRef = useRef(null);

  const handleDownload = async () => {
    if (!chartRef.current) return;
    
    try {
      // Get the actual dimensions of the element
      const element = chartRef.current;
      const rect = element.getBoundingClientRect();
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: rect.width,
        height: rect.height,
        scrollX: 0,
        scrollY: 0,
        windowWidth: rect.width,
        windowHeight: rect.height,
        x: 0,
        y: 0,
        foreignObjectRendering: false,
        removeContainer: true,
      });
      
      // Create rounded corners on the canvas
      const roundedCanvas = document.createElement('canvas');
      const ctx = roundedCanvas.getContext('2d');
      const radius = 48; // Match the 24px border radius * 2 for scale
      
      roundedCanvas.width = canvas.width;
      roundedCanvas.height = canvas.height;
      
      // Draw rounded rectangle path
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(canvas.width - radius, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
      ctx.lineTo(canvas.width, canvas.height - radius);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
      ctx.lineTo(radius, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.clip();
      
      // Draw the original canvas onto the rounded one
      ctx.drawImage(canvas, 0, 0);
      
      // Download
      const link = document.createElement('a');
      link.download = `${filename || 'chart'}.png`;
      link.href = roundedCanvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to download chart:', err);
    }
  };

  return (
    <div 
      style={{ position: 'relative', marginBottom: '32px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={chartRef}>
        {children}
      </div>
      {isHovered && (
        <button
          onClick={handleDownload}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            color: '#1a1a1a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FFCC01';
            e.currentTarget.style.borderColor = '#FFCC01';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
            e.currentTarget.style.borderColor = '#e0e0e0';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </button>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.98)',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <p style={{ fontWeight: 600, marginBottom: '12px', color: '#1a1a1a', fontSize: '14px', letterSpacing: '0.5px' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ 
            color: entry.color, 
            margin: '6px 0', 
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '24px'
          }}>
            <span style={{ fontWeight: 500 }}>{entry.name}</span>
            <span style={{ fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{formatFullCurrency(entry.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AccuracyTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(255,255,255,0.98)',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <p style={{ fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>{data.name}</p>
        <p style={{ fontSize: '13px', color: '#666' }}>Avg Deviation: <span style={{ fontWeight: 600, color: data.accuracy > 0 ? '#ff5555' : '#3574e3' }}>{data.accuracy > 0 ? '+' : ''}{data.accuracy.toFixed(1)}%</span></p>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>from actual results</p>
      </div>
    );
  }
  return null;
};

// Custom label renderer for accuracy bars - puts negative values inside bar to avoid overlap
const renderAccuracyLabel = (props) => {
  const { x, y, width, height, value } = props;
  const isNegative = value < 0;
  const label = `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  
  if (isNegative) {
    // For negative values, place inside the bar on the left
    const padding = 8;
    return (
      <text
        x={x + padding}
        y={y + height / 2 + 5}
        fill="#1a1a1a"
        textAnchor="start"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight={600}
        fontFamily="'DM Mono', monospace"
        style={{ pointerEvents: 'none' }}
      >
        {label}
      </text>
    );
  }
  
  // For positive values, place outside on the right
  const padding = 8;
  return (
    <text
      x={x + width + padding}
      y={y + height / 2 + 5}
      fill="#1a1a1a"
      textAnchor="start"
      dominantBaseline="middle"
      fontSize={12}
      fontWeight={600}
      fontFamily="'DM Mono', monospace"
      style={{ pointerEvents: 'none' }}
    >
      {label}
    </text>
  );
};

export default function ForecastingDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Auto-authenticate if in valid embed mode
    if (isEmbedMode) return true;
    return sessionStorage.getItem('forecast_auth') === 'true';
  });
  const [view, setView] = useState('month');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [rawData, setRawData] = useState(fallbackData);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Google Sheets
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(SHEET_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        const transformedData = transformData(parsedData);
        if (transformedData.length > 0) {
          setRawData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching sheet data:', error);
        // Keep using fallback data
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Reset selected period when view changes - must be before conditional return
  useEffect(() => {
    setSelectedPeriod('all');
  }, [view]);

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  // Show loading screen while fetching data
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #faf9f7 0%, #f5f3f0 100%)',
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e0e0e0',
            borderTopColor: '#3574e3',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#666', fontSize: '14px' }}>Loading forecast data...</p>
        </div>
      </div>
    );
  }

  // Get available periods with actuals for each view type
  const getAvailablePeriods = () => {
    const periods = {
      month: [],
      quarter: [],
      year: []
    };
    
    // Helper to get fiscal quarter from month (Oct=Q1, Jan=Q2, Apr=Q3, Jul=Q4)
    const getFiscalQuarter = (month) => {
      const m = parseInt(month);
      if (m >= 10 && m <= 12) return 'Q1';
      if (m >= 1 && m <= 3) return 'Q2';
      if (m >= 4 && m <= 6) return 'Q3';
      return 'Q4';
    };
    
    // Helper to get month abbreviation
    const getMonthAbbr = (monthNum) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[parseInt(monthNum) - 1] || monthNum;
    };
    
    rawData.forEach(row => {
      if (row.actual.month !== null) {
        const monthNum = row.date.split('/')[0];
        const monthName = getMonthAbbr(monthNum);
        // Only add if not already in the list (use month name as key)
        if (!periods.month.find(m => m.date === monthName)) {
          periods.month.push({ date: monthName, monthNum: monthNum, value: row.actual.month });
        }
      }
      if (row.actual.quarter !== null) {
        // Get the quarter name from the date
        const month = row.date.split('/')[0];
        const quarterName = getFiscalQuarter(month);
        // Only add if not already in the list
        if (!periods.quarter.find(q => q.date === quarterName)) {
          periods.quarter.push({ date: quarterName, value: row.actual.quarter });
        }
      }
      if (row.actual.year !== null) {
        periods.year.push({ date: row.date, value: row.actual.year });
      }
    });
    
    return periods;
  };

  // Helper to check if a date falls within a fiscal quarter
  const isDateInQuarter = (date, quarter) => {
    const month = parseInt(date.split('/')[0]);
    if (quarter === 'Q1') return month >= 10 && month <= 12;
    if (quarter === 'Q2') return month >= 1 && month <= 3;
    if (quarter === 'Q3') return month >= 4 && month <= 6;
    if (quarter === 'Q4') return month >= 7 && month <= 9;
    return false;
  };

  const availablePeriods = getAvailablePeriods();

  const getChartData = () => {
    return rawData
      .filter(row => {
        // For quarter view with a specific quarter selected, filter to that quarter's months
        if (view === 'quarter' && selectedPeriod !== 'all') {
          return isDateInQuarter(row.date, selectedPeriod);
        }
        return true;
      })
      .map(row => {
        const point = { date: row.date };
        forecasters.forEach(name => {
          if (row[name] && row[name][view] !== null) {
            point[name] = row[name][view];
          }
        });
        if (row.actual && row.actual[view] !== null) {
          point['Actual'] = row.actual[view];
        }
        return point;
      });
  };

  const getAccuracyData = () => {
    // Group forecasts by period (month) - dates starting with same month go together
    const getMonthFromDate = (date) => date.split('/')[0];
    
    // Find all unique months that have actuals
    const monthsWithActuals = {};
    rawData.forEach(row => {
      if (row.actual.month !== null) {
        const month = getMonthFromDate(row.date);
        monthsWithActuals[month] = row.actual.month;
      }
    });
    
    return forecasters.map(name => {
      let totalDeviation = 0;
      let count = 0;
      
      if (view === 'overall') {
        // Calculate across all periods that have actuals
        // Monthly forecasts - compare each week to its month's actual
        rawData.forEach(row => {
          const forecastMonth = getMonthFromDate(row.date);
          const actualForMonth = monthsWithActuals[forecastMonth];
          if (actualForMonth !== undefined) {
            const guess = row[name]?.month;
            if (guess !== null && guess !== undefined) {
              totalDeviation += ((guess - actualForMonth) / actualForMonth) * 100;
              count++;
            }
          }
        });
        
        // Quarter forecasts
        const quarterActual = rawData.find(r => r.actual.quarter !== null)?.actual.quarter;
        if (quarterActual) {
          rawData.forEach(row => {
            const guess = row[name]?.quarter;
            if (guess !== null && guess !== undefined) {
              totalDeviation += ((guess - quarterActual) / quarterActual) * 100;
              count++;
            }
          });
        }
        
        // Year forecasts
        const yearActual = rawData.find(r => r.actual.year !== null)?.actual.year;
        if (yearActual) {
          rawData.forEach(row => {
            const guess = row[name]?.year;
            if (guess !== null && guess !== undefined) {
              totalDeviation += ((guess - yearActual) / yearActual) * 100;
              count++;
            }
          });
        }
      } else if (view === 'month') {
        // For monthly view, compare each forecast to its corresponding month's actual
        // Filter by period if selected (selectedPeriod is now a month abbreviation like "Oct")
        const monthAbbrToNum = { 'Jan': '1', 'Feb': '2', 'Mar': '3', 'Apr': '4', 'May': '5', 'Jun': '6',
                                  'Jul': '7', 'Aug': '8', 'Sep': '9', 'Oct': '10', 'Nov': '11', 'Dec': '12' };
        const targetMonth = selectedPeriod !== 'all' ? monthAbbrToNum[selectedPeriod] : null;
        
        rawData.forEach(row => {
          const forecastMonth = getMonthFromDate(row.date);
          const actualForMonth = monthsWithActuals[forecastMonth];
          
          // Skip if filtering to a specific period and this isn't in that month
          if (targetMonth && forecastMonth !== targetMonth) return;
          
          if (actualForMonth !== undefined) {
            const guess = row[name]?.month;
            if (guess !== null && guess !== undefined) {
              totalDeviation += ((guess - actualForMonth) / actualForMonth) * 100;
              count++;
            }
          }
        });
      } else if (view === 'quarter') {
        const quarterActual = rawData.find(r => r.actual.quarter !== null)?.actual.quarter;
        if (quarterActual) {
          rawData.forEach(row => {
            // Filter by selected quarter if not 'all'
            if (selectedPeriod !== 'all' && !isDateInQuarter(row.date, selectedPeriod)) return;
            
            const guess = row[name]?.quarter;
            if (guess !== null && guess !== undefined) {
              totalDeviation += ((guess - quarterActual) / quarterActual) * 100;
              count++;
            }
          });
        }
      } else if (view === 'year') {
        const yearActual = rawData.find(r => r.actual.year !== null)?.actual.year;
        if (yearActual) {
          rawData.forEach(row => {
            const guess = row[name]?.year;
            if (guess !== null && guess !== undefined) {
              totalDeviation += ((guess - yearActual) / yearActual) * 100;
              count++;
            }
          });
        }
      }
      
      return {
        name,
        accuracy: count > 0 ? totalDeviation / count : 0,
        color: colors[name]
      };
    }).sort((a, b) => Math.abs(a.accuracy) - Math.abs(b.accuracy));
  };

  const chartData = getChartData();
  const accuracyData = getAccuracyData();

  // Calculate Y-axis domain to "zoom in" on the data range
  const getYAxisDomain = () => {
    const values = [];
    chartData.forEach(point => {
      forecasters.forEach(name => {
        if (point[name] !== undefined && point[name] !== null) {
          values.push(point[name]);
        }
      });
      if (point['Actual'] !== undefined && point['Actual'] !== null) {
        values.push(point['Actual']);
      }
    });
    
    if (values.length === 0) return [0, 'auto'];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range * 0.1; // 10% padding
    
    // Round to nice numbers based on magnitude
    const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
    const niceMin = Math.floor((min - padding) / magnitude) * magnitude;
    const niceMax = Math.ceil((max + padding) / magnitude) * magnitude;
    
    // Only zoom in if the range is less than 50% of max (otherwise show from 0)
    if (niceMin > max * 0.5) {
      return [Math.max(0, niceMin), niceMax];
    }
    return [0, 'auto'];
  };

  const yAxisDomain = getYAxisDomain();

  // Cumulative error calculation (golf style - lower is better)
  // For each week with a forecast, calculate how far off from the actual result
  // Sum up all errors across all weeks. Example: if actual is 100 and you guessed 80, 90, 95, 102
  // across four weeks, your total error is |80-100| + |90-100| + |95-100| + |102-100| = 20+10+5+2 = 37
  const getCumulativeErrorData = () => {
    // Group forecasts by period (month) - dates starting with same month go together
    const getMonthFromDate = (date) => date.split('/')[0];
    
    // Find all unique months that have actuals
    const monthsWithActuals = {};
    rawData.forEach(row => {
      if (row.actual.month !== null) {
        const month = getMonthFromDate(row.date);
        monthsWithActuals[month] = row.actual.month;
      }
    });
    
    return forecasters.map(name => {
      let cumError = 0;
      
      if (view === 'overall' || view === 'month') {
        // For monthly view, compare each forecast to its corresponding month's actual
        rawData.forEach(row => {
          const forecastMonth = getMonthFromDate(row.date);
          const actualForMonth = monthsWithActuals[forecastMonth];
          
          if (actualForMonth !== undefined) {
            const guess = row[name]?.month;
            if (guess !== null && guess !== undefined) {
              cumError += Math.abs(guess - actualForMonth);
            }
          }
        });
        
        // For overall, also include quarter and year if they have actuals
        if (view === 'overall') {
          // Add quarter calculations if actuals exist
          const quarterActual = rawData.find(r => r.actual.quarter !== null)?.actual.quarter;
          if (quarterActual) {
            rawData.forEach(row => {
              const guess = row[name]?.quarter;
              if (guess !== null && guess !== undefined) {
                cumError += Math.abs(guess - quarterActual);
              }
            });
          }
          
          // Add year calculations if actuals exist
          const yearActual = rawData.find(r => r.actual.year !== null)?.actual.year;
          if (yearActual) {
            rawData.forEach(row => {
              const guess = row[name]?.year;
              if (guess !== null && guess !== undefined) {
                cumError += Math.abs(guess - yearActual);
              }
            });
          }
        }
      } else if (view === 'quarter') {
        const quarterActual = rawData.find(r => r.actual.quarter !== null)?.actual.quarter;
        if (quarterActual) {
          rawData.forEach(row => {
            // Filter by selected quarter if not 'all'
            if (selectedPeriod !== 'all' && !isDateInQuarter(row.date, selectedPeriod)) return;
            
            const guess = row[name]?.quarter;
            if (guess !== null && guess !== undefined) {
              cumError += Math.abs(guess - quarterActual);
            }
          });
        }
      } else if (view === 'year') {
        const yearActual = rawData.find(r => r.actual.year !== null)?.actual.year;
        if (yearActual) {
          rawData.forEach(row => {
            const guess = row[name]?.year;
            if (guess !== null && guess !== undefined) {
              cumError += Math.abs(guess - yearActual);
            }
          });
        }
      }
      
      // Apply period filter if selected (for monthly view with month abbreviation like "Oct")
      if (selectedPeriod !== 'all' && view === 'month') {
        cumError = 0;
        const monthAbbrToNum = { 'Jan': '1', 'Feb': '2', 'Mar': '3', 'Apr': '4', 'May': '5', 'Jun': '6',
                                  'Jul': '7', 'Aug': '8', 'Sep': '9', 'Oct': '10', 'Nov': '11', 'Dec': '12' };
        const periodMonth = monthAbbrToNum[selectedPeriod];
        const actualForPeriod = monthsWithActuals[periodMonth];
        
        if (actualForPeriod) {
          rawData.forEach(row => {
            if (getMonthFromDate(row.date) === periodMonth) {
              const guess = row[name]?.month;
              if (guess !== null && guess !== undefined) {
                cumError += Math.abs(guess - actualForPeriod);
              }
            }
          });
        }
      }
      
      return {
        name,
        error: cumError,
        color: colors[name]
      };
    }).sort((a, b) => a.error - b.error); // Lower error is better (golf style)
  };
  const cumulativeErrorData = getCumulativeErrorData();

  const viewLabels = {
    month: 'Monthly',
    quarter: 'Quarterly', 
    year: 'Fiscal Year',
    overall: 'Overall'
  };

  return (
    <div style={{
      minHeight: isEmbedMode ? 'auto' : '100vh',
      background: 'linear-gradient(180deg, #faf9f7 0%, #f5f3f0 100%)',
      fontFamily: "'DM Sans', sans-serif",
      padding: isEmbedMode ? '24px' : '48px'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header - hidden in embed mode */}
        {!isEmbedMode && (
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '56px',
            fontWeight: 700,
            color: '#1a1a1a',
            margin: 0,
            letterSpacing: '-2px',
            lineHeight: 1.1
          }}>
            Sales Forecasting
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#666',
            marginTop: '12px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontWeight: 500
          }}>
            Weekly Prediction Tracker
          </p>
          <div style={{
            width: '60px',
            height: '3px',
            background: 'linear-gradient(90deg, #ff5555, #3574e3, #ffcc01, #9dcdc0, #7dcfb6)',
            margin: '24px auto 0'
          }} />
        </div>
        )}

        {/* Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '48px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            background: 'white',
            borderRadius: '12px',
            padding: '6px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            {['month', 'quarter', 'year'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: view === v ? '#1a1a1a' : 'transparent',
                  color: view === v ? 'white' : '#666',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.5px'
                }}
              >
                {viewLabels[v]}
              </button>
            ))}
          </div>

          {/* Period Selector - show when there are periods with actuals */}
          {availablePeriods[view].length > 0 && (
            <div style={{
              display: 'flex',
              background: 'white',
              borderRadius: '12px',
              padding: '6px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <button
                onClick={() => setSelectedPeriod('all')}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: selectedPeriod === 'all' ? '#6DA34D' : 'transparent',
                  color: selectedPeriod === 'all' ? 'white' : '#666',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                All Periods
              </button>
              {availablePeriods[view].map(period => (
                <button
                  key={period.date}
                  onClick={() => setSelectedPeriod(period.date)}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: selectedPeriod === period.date ? '#6DA34D' : 'transparent',
                    color: selectedPeriod === period.date ? 'white' : '#666',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {period.date}
                </button>
              ))}
            </div>
          )}
        </div>


        {/* Forecast Trends Chart */}
        <ChartWrapper filename={`${viewLabels[view]}-forecast-trends-${new Date().toISOString().split('T')[0]}`}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '28px',
              fontWeight: 600,
              color: '#1a1a1a',
              margin: 0
            }}>
              {viewLabels[view]} Forecast Evolution
            </h2>
            <p style={{ color: '#888', marginTop: '8px', fontSize: '14px' }}>
              How predictions evolved week over week
            </p>
          </div>

          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                {Object.entries(colors).map(([name, color]) => (
                  <linearGradient key={name} id={`gradient-${name}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={color} stopOpacity={1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#888', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fill: '#888', fontSize: 12, fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                width={80}
                domain={yAxisDomain}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '24px',
                  fontFamily: "'DM Sans', sans-serif"
                }}
                iconType="circle"
              />
              {forecasters.map(name => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={colors[name]}
                  strokeWidth={2.5}
                  dot={{ fill: colors[name], strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  connectNulls={false}
                />
              ))}
              <Line
                type="monotone"
                dataKey="Actual"
                stroke={colors.Actual}
                strokeWidth={4}
                strokeDasharray="8 4"
                dot={{ fill: colors.Actual, strokeWidth: 2, stroke: 'white', r: 6 }}
                activeDot={{ r: 8, strokeWidth: 2, stroke: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        </ChartWrapper>

        {/* Accuracy and Cumulative Error - Side by Side */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Accuracy Chart */}
          <ChartWrapper filename={`accuracy-${viewLabels[view]}-${new Date().toISOString().split('T')[0]}`}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            height: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  margin: 0
                }}>
                  Forecaster Accuracy
                </h3>
                <span
                  style={{
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#3574e3',
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                    lineHeight: '18px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(53,116,227,0.12)'
                  }}
                  title={'Deviation is calculated as the average percent difference between each forecaster\'s guess and the actual result. Formula: ((guess - actual) / actual) × 100. Positive means over-forecast, negative means under-forecast.'}
                >i</span>
              </div>
              <p style={{ color: '#888', marginTop: '6px', fontSize: '13px' }}>
                Average deviation from actual results
              </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accuracyData} layout="vertical" margin={{ top: 10, right: 50, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis 
                  type="number"
                  tick={{ fill: '#888', fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={false}
                  tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <YAxis 
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#1a1a1a', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip content={<AccuracyTooltip />} />
                <ReferenceLine x={0} stroke="#1a1a1a" strokeWidth={2} />
                <Bar dataKey="accuracy" radius={[0, 6, 6, 0]} barSize={28} label={renderAccuracyLabel}>
                  {accuracyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.accuracy > 0 ? '#ff5555' : '#3574e3'}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          </ChartWrapper>

          {/* Cumulative Error Chart */}
          <ChartWrapper filename={`cumulative-error-${viewLabels[view]}-${new Date().toISOString().split('T')[0]}`}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            height: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  margin: 0
                }}>
                  Cumulative Error
                </h3>
                <span
                  style={{
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#ffcc01',
                    color: '#1a1a1a',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                    lineHeight: '18px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(255,204,1,0.12)'
                  }}
                  title={'Cumulative error is the sum of the absolute differences between each forecaster\'s guess and the actual result. Lower is better (like golf). Formula: SUM(ABS(guess - actual)).'}
                >i</span>
              </div>
              <p style={{ color: '#888', marginTop: '6px', fontSize: '13px' }}>
                Total absolute error from actuals (lower is better)
              </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cumulativeErrorData} layout="vertical" margin={{ top: 10, right: 50, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis 
                  type="number"
                  tick={{ fill: '#888', fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={false}
                  tickFormatter={formatCurrency}
                />
                <YAxis 
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#1a1a1a', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip formatter={formatFullCurrency} />
                <Bar dataKey="error" radius={[0, 6, 6, 0]} barSize={28}>
                  {cumulativeErrorData.map((entry, index) => (
                    <Cell key={`cell-cumerr-${index}`} fill={entry.color} opacity={0.85} />
                  ))}
                  <LabelList 
                    dataKey="error" 
                    position="right" 
                    formatter={(v) => formatCurrency(v)}
                    style={{ 
                      fill: '#1a1a1a', 
                      fontSize: 12, 
                      fontWeight: 600,
                      fontFamily: "'DM Mono', monospace"
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          </ChartWrapper>
        </div>
        {/* Legend Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px 40px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          marginBottom: '32px'
        }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '20px',
            fontWeight: 600,
            color: '#1a1a1a',
            margin: '0 0 24px 0'
          }}>
            Forecasters
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {forecasters.map(name => (
              <div key={name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                background: `${colors[name]}08`,
                borderRadius: '12px',
                border: `1px solid ${colors[name]}20`
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: colors[name]
                }} />
                <span style={{ 
                  fontWeight: 600, 
                  color: '#1a1a1a',
                  fontSize: '15px'
                }}>{name}</span>
              </div>
            ))}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 20px',
              background: '#1a1a1a08',
              borderRadius: '12px',
              border: '2px dashed #1a1a1a40'
            }}>
              <div style={{
                width: '24px',
                height: '3px',
                background: colors.Actual,
                borderRadius: '2px'
              }} />
              <span style={{ 
                fontWeight: 600, 
                color: '#1a1a1a',
                fontSize: '15px'
              }}>Actual Result</span>
            </div>
          </div>
        </div>

        {/* Latest Forecasts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {forecasters.map(name => {
            const latest = rawData.filter(r => r[name]?.month !== null).slice(-1)[0];
            if (!latest) return null;
            return (
              <div key={name} style={{
                background: 'white',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                borderTop: `4px solid ${colors[name]}`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: `${colors[name]}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: colors[name],
                    fontSize: '16px'
                  }}>
                    {name[0]}
                  </div>
                  <div>
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: '16px', 
                      fontWeight: 600,
                      color: '#1a1a1a'
                    }}>{name}</h4>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '12px', 
                      color: '#888',
                      marginTop: '2px'
                    }}>Latest: {latest.date}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    ['Month', latest[name].month],
                    ['Quarter', latest[name].quarter],
                    ['FY', latest[name].year]
                  ].map(([label, value]) => (
                    <div key={label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <span style={{ 
                        fontSize: '13px', 
                        color: '#888',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 500
                      }}>{label}</span>
                      <span style={{ 
                        fontSize: '15px', 
                        fontWeight: 600,
                        color: '#1a1a1a',
                        fontFamily: "'DM Mono', monospace"
                      }}>{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '48px',
          padding: '24px',
          color: '#888',
          fontSize: '13px'
        }}>
          <p style={{ margin: 0 }}>
            Built with ❤️ by Eric Turner
          </p>
        </div>
      </div>
    </div>
  );
}