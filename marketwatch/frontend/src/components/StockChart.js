import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const StockChart = ({ symbol }) => {
    const chartContainerRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        if (!symbol) return;

        let chart;
        let candlestickSeries;
        const controller = new AbortController();

        const loadChartData = async () => {
            setLoading(true);
            setError('');
            
            try {
                const response = await axiosPrivate.get(`/api/accounts/chart-data/${symbol}/`, {
                    signal: controller.signal
                });

                const chartData = response.data;

                if (chartData.length === 0) {
                    setError('No historical data found for this symbol.');
                    setLoading(false);
                    return;
                }

                chart = createChart(chartContainerRef.current, {
                    // Make the background dark and text light
                    layout: { background: { color: '#1e222d' }, textColor: '#d1d4dc' },
                    // Dim the grid lines so they fade into the background
                    grid: { vertLines: { color: '#2b2b43' }, horzLines: { color: '#2b2b43' } },
                    width: chartContainerRef.current.clientWidth,
                    height: 400,
                });

                candlestickSeries = chart.addSeries(CandlestickSeries, {
                    upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
                    wickUpColor: '#26a69a', wickDownColor: '#ef5350',
                });

                candlestickSeries.setData(chartData);
                chart.timeScale().fitContent();

            } catch (err) {
                if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
                    console.error('Detailed Chart Error:', err);
                    setError('Failed to fetch chart data. (Check browser console)');
                }
            } finally {
                setLoading(false);
            }
        };

        loadChartData();

        return () => {
            controller.abort();
            if (chart) chart.remove();
        };
    }, [symbol, axiosPrivate]);

    return (
        <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
            <h3>{symbol ? `${symbol} - 30 Day History` : 'Select a stock to view chart'}</h3>
            {loading && <p>Loading chart data...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div ref={chartContainerRef} style={{ width: '100%', position: 'relative' }} />
        </div>
    );
};

export default StockChart;