import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAntiCheat } from './useAntiCheat';
import './student.css';

const TestRunner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');
  
  // Anti-Cheat Initialization
  const { enterFullscreen } = useAntiCheat({
    maxTabSwitches: 2,
    maxFullscreenEscapes: 2,
    onWarning: (reason, warningsLeft) => {
      setWarningMessage(`WARNING: ${reason} (Remaining warnings: ${warningsLeft})`);
      setTimeout(() => setWarningMessage(''), 5000); // Hide after 5 seconds
    },
    onTerminate: async (reason) => {
      alert(`TEST TERMINATED: ${reason}`);
      await forceSubmit(0);
    }
  });

  useEffect(() => {
    fetchTest();
    enterFullscreen();
  }, [id]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tests/${id}`);
      const data = await response.json();
      if (response.ok) {
        setTest(data);
      } else {
        alert("Test not found");
        navigate('/student');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const forceSubmit = async (score: number) => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user) return;

      const payload = {
        test_id: parseInt(id || '0'),
        student_id: user._id,
        score: score,
        total_marks: test?.duration_minutes || 10, // Assuming total marks roughly
        status: 'completed'
      };

      await fetch('http://localhost:5000/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      // Auto exit fullscreen
      if (document.fullscreenElement) {
         document.exitFullscreen().catch(e => console.error(e));
      }
      navigate('/student');
      alert("Test Submitted successfully.");
    } catch(err) {
      console.error("Submit error", err);
      navigate('/student');
    }
  };

  const handleManualSubmit = () => {
     forceSubmit(Math.floor(Math.random() * 10) + 1); // Mock Score submission 
  };

  if (loading) return <div style={{ color: 'var(--student-text)', padding: '32px' }}>Loading secure environment...</div>;

  return (
    <div style={{ background: 'var(--student-bg)', minHeight: '100vh', color: 'var(--student-text)', margin: '-32px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Warning Overlay */}
      {warningMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(220, 38, 38, 0.95)', color: 'white', padding: '16px', textAlign: 'center', zIndex: 9999, fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px' }}>
          {warningMessage}
        </div>
      )}

      <header className="runner-header">
        <div>
          <h2 style={{ margin: 0, fontSize: '13px', color: 'var(--student-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{test?.test_type?.toUpperCase()}</h2>
          <h1 style={{ margin: '4px 0 0', fontSize: '20px', color: 'var(--student-text)', fontWeight: 700, letterSpacing: '-0.5px' }}>{test?.title}</h1>
        </div>
        <div className="timer">
           {test?.duration_minutes}:00
        </div>
      </header>

      <main style={{ padding: '32px', flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <p style={{ color: 'var(--student-text-muted)', fontSize: '14px' }}>In a real implementation, the questions will render here based on `test.questions`.</p>
        
        <div style={{ marginTop: '24px', background: 'var(--student-card-bg)', border: '1px solid var(--student-border)', padding: '32px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
             <h3 style={{marginTop: 0, fontSize: '18px'}}>Question 1: Sample mock problem</h3>
             <p style={{color: 'var(--student-text-muted)', fontSize: '15px', lineHeight: 1.6}}>This is where the user will interact with the test.</p>
        </div>

      </main>

      <footer style={{ padding: '16px 32px', background: 'var(--student-card-bg)', borderTop: '1px solid var(--student-border)', display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: 0, boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
         <button className="btn-accent" style={{ width: 'auto', backgroundColor: '#0F172A' }} onClick={handleManualSubmit}>
            Submit Assessment
         </button>
      </footer>
    </div>
  );
};

export default TestRunner;
