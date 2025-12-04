import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts';

const forecasters = ['Jeremy', 'Rachel', 'Carolyn', 'Dani', 'Eric'];
const colors = {
  Jeremy: '#ff5555',
  Rachel: '#3574e3', 
  Carolyn: '#ffcc01',
  Dani: '#9dcdc0',
  Eric: '#6DA34D',
  Actual: '#1a1a1a'
};

const rawData = [
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
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

const formatFullCurrency = (value) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
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

export default function ForecastingDashboard() {
  const [view, setView] = useState('month');
  const [chartType, setChartType] = useState('trends');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Get available periods with actuals for each view type
  const getAvailablePeriods = () => {
    const periods = {
      month: [],
      quarter: [],
      year: []
    };
    
    rawData.forEach(row => {
      if (row.actual.month !== null) {
        periods.month.push({ date: row.date, value: row.actual.month });
      }
      if (row.actual.quarter !== null) {
        periods.quarter.push({ date: row.date, value: row.actual.quarter });
      }
      if (row.actual.year !== null) {
        periods.year.push({ date: row.date, value: row.actual.year });
      }
    });
    
    return periods;
  };

  const availablePeriods = getAvailablePeriods();

  // Reset selected period when view changes
  React.useEffect(() => {
    setSelectedPeriod('all');
  }, [view]);

  const getChartData = () => {
    return rawData.map(row => {
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
    return forecasters.map(name => {
      let totalDeviation = 0;
      let count = 0;
      
      if (view === 'overall') {
        // Calculate across all periods that have actuals
        ['month', 'quarter', 'year'].forEach(period => {
          const periodActuals = rawData.filter(r => r.actual[period] !== null);
          periodActuals.forEach(row => {
            const guess = row[name]?.[period];
            const actual = row.actual[period];
            if (guess !== null && guess !== undefined && actual) {
              totalDeviation += ((guess - actual) / actual) * 100;
              count++;
            }
          });
        });
      } else {
        // Filter by selected period or all periods with actuals
        const viewActuals = selectedPeriod === 'all' 
          ? rawData.filter(r => r.actual[view] !== null)
          : rawData.filter(r => r.actual[view] !== null && r.date === selectedPeriod);
          
        viewActuals.forEach(row => {
          const guess = row[name]?.[view];
          const actual = row.actual[view];
          if (guess !== null && guess !== undefined && actual) {
            totalDeviation += ((guess - actual) / actual) * 100;
            count++;
          }
        });
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
      
      // Apply period filter if selected
      if (selectedPeriod !== 'all' && view === 'month') {
        cumError = 0;
        const actualForPeriod = rawData.find(r => r.date === selectedPeriod)?.actual.month;
        const periodMonth = getMonthFromDate(selectedPeriod);
        
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
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #faf9f7 0%, #f5f3f0 100%)',
      fontFamily: "'DM Sans', sans-serif",
      padding: '48px'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
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
            {['month', 'quarter', 'year', 'overall'].filter(v => chartType !== 'trends' || v !== 'overall').map(v => (
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
          
          <div style={{
            display: 'flex',
            background: 'white',
            borderRadius: '12px',
            padding: '6px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            {[['trends', 'Forecast Trends'], ['accuracy', 'Accuracy'], ['cumulative', 'Cumulative Error']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setChartType(key)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: chartType === key ? '#3574e3' : 'transparent',
                  color: chartType === key ? 'white' : '#666',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Period Selector - only show for accuracy/cumulative views and non-overall */}
          {(chartType === 'accuracy' || chartType === 'cumulative') && view !== 'overall' && availablePeriods[view].length > 0 && (
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

        {/* Main Chart */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          marginBottom: '32px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '32px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  margin: 0
                }}>
                  {chartType === 'trends' ? `${viewLabels[view]} Forecast Evolution` : chartType === 'accuracy' ? 'Forecaster Accuracy' : 'Cumulative Error'}
                </h2>
                {chartType === 'accuracy' && (
                  <span style={{ position: 'relative', display: 'inline-block' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#3574e3',
                        color: 'white',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                        lineHeight: '20px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(53,116,227,0.12)'
                      }}
                      title={
                        'Deviation is calculated as the average percent difference between each forecaster’s guess and the actual result, across all months with actuals. Formula: ((guess - actual) / actual) × 100. Positive means over-forecast, negative means under-forecast.'
                      }
                    >i</span>
                  </span>
                )}
                {chartType === 'cumulative' && (
                  <span style={{ position: 'relative', display: 'inline-block' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#ffcc01',
                        color: '#1a1a1a',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                        lineHeight: '20px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(255,204,1,0.12)'
                      }}
                      title={
                        'Cumulative error is the sum of the absolute differences between each forecaster’s guess and the actual result, for all months with actuals. Formula: SUMPRODUCT((guess<>0)*ABS(guess-actual)).'
                      }
                    >i</span>
                  </span>
                )}
              </div>
              <p style={{ color: '#888', marginTop: '8px', fontSize: '14px' }}>
                {chartType === 'trends' 
                  ? 'How predictions evolved week over week'
                  : chartType === 'accuracy' 
                    ? 'Average deviation from actual month-end results'
                    : 'Total absolute error from actuals'}
              </p>
            </div>
          </div>

          <div>
            {chartType === 'trends' && (
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
              )}
              {chartType === 'accuracy' && (
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={accuracyData} layout="vertical" margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number"
                      tick={{ fill: '#888', fontSize: 12, fontFamily: "'DM Mono', monospace" }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickLine={false}
                      tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`}
                      domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <YAxis 
                      dataKey="name"
                      type="category"
                      tick={{ fill: '#1a1a1a', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip content={<AccuracyTooltip />} />
                    <ReferenceLine x={0} stroke="#1a1a1a" strokeWidth={2} />
                    <Bar dataKey="accuracy" radius={[0, 8, 8, 0]} barSize={36}>
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
              )}
              {chartType === 'cumulative' && (
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={cumulativeErrorData} layout="vertical" margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number"
                      tick={{ fill: '#888', fontSize: 12, fontFamily: "'DM Mono', monospace" }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickLine={false}
                      tickFormatter={formatCurrency}
                    />
                    <YAxis 
                      dataKey="name"
                      type="category"
                      tick={{ fill: '#1a1a1a', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip formatter={formatFullCurrency} />
                    <Bar dataKey="error" radius={[0, 8, 8, 0]} barSize={36}>
                      {cumulativeErrorData.map((entry, index) => (
                        <Cell key={`cell-cumerr-${index}`} fill={entry.color} opacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
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
            Right-click any chart to copy image or export data. &nbsp;|&nbsp; Built with ❤️ by Eric Turner
          </p>
        </div>
      </div>
    </div>
  );
}