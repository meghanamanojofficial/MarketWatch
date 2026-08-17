import { useState, useEffect, useContext } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { AuthContext } from '../context/AuthContext';
import StockChart from './StockChart';

const MarketDashboard = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [newSymbol, setNewSymbol] = useState('');
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const { logoutUser } = useContext(AuthContext);
    const axiosPrivate = useAxiosPrivate();

    const fetchWatchlist = async (signal) => {
        try {
            const config = signal ? { signal } : {};
            const response = await axiosPrivate.get('/api/accounts/dashboard/', config);
            setWatchlist(response.data.watchlist || []);
        } catch (error) {
            if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                console.error('Error fetching watchlist:', error);
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchWatchlist(controller.signal);
        return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [axiosPrivate]);

    const handleAddStock = async (e) => {
        e.preventDefault();
        if (!newSymbol) return;
        try {
            await axiosPrivate.post('/api/accounts/watchlist-action/', { symbol: newSymbol });
            setNewSymbol('');
            fetchWatchlist();
        } catch (error) {
            console.error('Error adding stock:', error);
        }
    };

    const handleRemoveStock = async (e, symbol) => {
        e.stopPropagation(); // Prevents the chart popup from opening when clicking remove
        try {
            await axiosPrivate.delete('/api/accounts/watchlist-action/', { data: { symbol } });
            if (selectedSymbol === symbol) setSelectedSymbol(null);
            fetchWatchlist();
        } catch (error) {
            console.error('Error removing stock:', error);
        }
    };

    return (
        <div style={{ backgroundColor: '#131722', minHeight: '100vh', color: '#d1d4dc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                
                {/* Header Area */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', color: '#fff' }}>Marketwatch</h2>
                    <button onClick={logoutUser} style={{ background: 'none', border: '1px solid #434651', color: '#d1d4dc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleAddStock} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input 
                        value={newSymbol} 
                        onChange={(e) => setNewSymbol(e.target.value.toUpperCase())} 
                        placeholder="Search eg: TCS, AAPL"
                        style={{ flexGrow: 1, padding: '12px', backgroundColor: '#1e222d', border: '1px solid #2a2e39', color: '#fff', borderRadius: '4px', outline: 'none' }}
                    />
                    <button type="submit" style={{ padding: '0 20px', backgroundColor: '#2962ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Add
                    </button>
                </form>

                {/* Watchlist Rows */}
                <div style={{ backgroundColor: '#1e222d', borderRadius: '8px', overflow: 'hidden', border: '1px solid #2a2e39' }}>
                    {watchlist.map((item, index) => {
                        const isPositive = item.change >= 0;
                        const textColor = isPositive ? '#4caf50' : '#ef5350';
                        const sign = isPositive ? '+' : '';

                        return (
                            <div 
                                key={index} 
                                onClick={() => setSelectedSymbol(item.symbol)}
                                style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #2a2e39', cursor: 'pointer', transition: 'background 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2a2e39'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {/* Left Side: Symbol & Exchange */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '15px', color: '#d1d4dc', letterSpacing: '0.5px' }}>{item.symbol}</span>
                                        {/* Hidden remove button that appears on hover could go here, but a small X is cleaner */}
                                        <button onClick={(e) => handleRemoveStock(e, item.symbol)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#787b86', fontWeight: '500' }}>{item.exchange}</span>
                                </div>

                                {/* Right Side: Prices */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    <span style={{ fontSize: '15px', color: textColor, fontWeight: '500' }}>
                                        {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span style={{ fontSize: '12px', color: textColor }}>
                                        {sign}{item.change.toFixed(2)} ({sign}{item.pChange.toFixed(2)}%)
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {watchlist.length === 0 && (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#787b86' }}>Nothing here yet. Search for a stock above.</div>
                    )}
                </div>
            </div>

            {/* Chart Modal Popup */}
            {selectedSymbol && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: '#1e222d', width: '100%', maxWidth: '900px', borderRadius: '8px', border: '1px solid #2a2e39', overflow: 'hidden', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <button 
                            onClick={() => setSelectedSymbol(null)} 
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#787b86', fontSize: '24px', cursor: 'pointer', zIndex: 10 }}
                        >
                            ✕
                        </button>
                        <div style={{ padding: '20px' }}>
                            <StockChart symbol={selectedSymbol} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketDashboard;