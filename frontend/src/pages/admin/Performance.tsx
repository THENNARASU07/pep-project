import React, { useState, useEffect } from 'react';

const Performance = () => {
    const [results, setResults] = useState([]);
    const [tests, setTests] = useState([]);
    const [filterTest, setFilterTest] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
        fetchTests();
    }, []);

    useEffect(() => {
        fetchResults();
    }, [filterTest]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const url = filterTest
                ? `http://localhost:5000/api/results?test_id=${filterTest}`
                : 'http://localhost:5000/api/results';
            const res = await fetch(url);
            const data = await res.json();
            setResults(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch results:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTests = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/tests');
            const data = await res.json();
            setTests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch tests:', err);
        }
    };

    const handleDownloadCSV = async () => {
        try {
            const url = filterTest
                ? `http://localhost:5000/api/results/csv?test_id=${filterTest}`
                : 'http://localhost:5000/api/results/csv';
            const res = await fetch(url);

            if (!res.ok) {
                const err = await res.json();
                alert(err.message || 'No results to download.');
                return;
            }

            const blob = await res.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'test_results.csv';
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) {
            alert('Failed to download CSV.');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="admin-greeting">Performance</h1>
                    <p className="admin-greeting-sub">Track student test results and export data.</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={handleDownloadCSV}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download CSV
                </button>
            </div>

            {/* Filter */}
            <div className="admin-toolbar">
                <select
                    className="admin-filter-select"
                    value={filterTest}
                    onChange={(e) => setFilterTest(e.target.value)}
                >
                    <option value="">All Tests</option>
                    {tests.map((t) => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                </select>
            </div>

            {/* Results Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Reg No</th>
                            <th>Test Name</th>
                            <th>Type</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>Loading...</td></tr>
                        ) : results.length === 0 ? (
                            <tr>
                                <td colSpan="9">
                                    <div className="admin-empty-state">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                                        <p>No results found. Results will appear here once students complete their tests.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : results.map((r, i) => (
                            <tr key={r.id}>
                                <td>{i + 1}</td>
                                <td style={{ fontWeight: 600 }}>{r.student_name}</td>
                                <td>{r.student_email}</td>
                                <td>{r.reg_no || '-'}</td>
                                <td>{r.test_title}</td>
                                <td>
                                    <span className={`admin-badge ${r.test_type === 'quiz' ? 'admin-badge-quiz' : 'admin-badge-code'}`}>
                                        {r.test_type}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 700 }}>{r.score}/{r.total_marks}</td>
                                <td>
                                    <span className={`admin-badge ${r.status === 'completed' ? 'admin-badge-published' : 'admin-badge-draft'}`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td>{formatDate(r.submitted_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Performance;
