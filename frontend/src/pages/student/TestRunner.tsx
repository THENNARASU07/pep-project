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
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  
  // Anti-Cheat Initialization
  const { enterFullscreen } = useAntiCheat({
    maxTabSwitches: 2,
    maxFullscreenEscapes: 2,
    onWarning: (reason, warningsLeft) => {
      setWarningMessage(`WARNING: ${reason} (Remaining warnings: ${warningsLeft})`);
      if (!reason.includes('full-screen')) {
         setTimeout(() => setWarningMessage(''), 5000); // Hide tab switch warnings after 5s
      }
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
      const stored = localStorage.getItem('local_tests');
      const localTests = stored ? JSON.parse(stored) : [];
      const localMatch = localTests.find((t: any) => String(t.id) === String(id));
      
      if (localMatch) {
         setTest(localMatch);
         setLoading(false);
         return;
      }

      const response = await fetch(`http://localhost:5000/api/tests/${id}`).catch(() => null);
      if (response && response.ok) {
        const data = await response.json();
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
        total_marks: test?.duration_minutes || 10,
        status: 'completed'
      };

      await fetch('http://localhost:5000/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null); // ignore db failure for now
      
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

  const warningOverlay = warningMessage && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#1e293b', padding: '40px', borderRadius: '12px', textAlign: 'center', maxWidth: '500px', border: '1px solid #334155' }}>
        <h2 style={{ color: '#ef4444', margin: '0 0 16px', fontSize: '28px', fontWeight: 'bold' }}>WARNING</h2>
        <p style={{ color: 'white', fontSize: '16px', lineHeight: '1.5', margin: '0 0 24px' }}>{warningMessage}</p>
        {warningMessage.includes('full-screen') && (
          <button 
            className="btn-accent" 
            style={{ backgroundColor: '#ef4444', border: 'none', width: '100%', padding: '12px' }}
            onClick={() => {
              enterFullscreen();
              setWarningMessage('');
            }}
          >
            Return to Full Screen
          </button>
        )}
      </div>
    </div>
  );

  // ====== CODE TEST LAYOUT (LEETCODE CLONE) ======
  if (test?.test_type === 'code') {
      const p = test.problems && test.problems.length > 0 ? test.problems[currentProblemIndex] : null;
      
      return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, display: 'flex', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
             {warningOverlay}
             {/* Left Panel - 40% */}
             <div style={{ width: '40%', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ padding: '16px 24px', borderBottom: '1px solid #334155', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f8fafc' }}>{test.title}</h2>
                     <div style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600, background: '#334155', padding: '4px 12px', borderRadius: '12px' }}>⏱ {test.duration_minutes}:00</div>
                 </div>
                 <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                     {p ? (
                        <>
                           <h3 style={{ marginTop: 0, color: '#f8fafc', fontSize: '22px', fontWeight: 700 }}>{currentProblemIndex + 1}. {p.title}</h3>
                           <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                               <span style={{ fontSize: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px' }}>Coding</span>
                               <span style={{ fontSize: '12px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '2px 8px', borderRadius: '4px' }}>Marks: {p.marks}</span>
                           </div>
                           <p style={{ color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '15px', marginBottom: '32px' }}>{p.description}</p>
                           
                           {p.input_format && (
                             <div style={{ marginBottom: '24px' }}>
                                 <h4 style={{ color: '#f8fafc', margin: '0 0 12px', fontSize: '15px' }}>Input Format</h4>
                                 <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{p.input_format}</div>
                             </div>
                           )}
                           
                           {p.output_format && (
                             <div style={{ marginBottom: '24px' }}>
                                 <h4 style={{ color: '#f8fafc', margin: '0 0 12px', fontSize: '15px' }}>Output Format</h4>
                                 <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{p.output_format}</div>
                             </div>
                           )}
      
                           {p.sample_input && (
                             <div style={{ marginBottom: '24px' }}>
                                 <h4 style={{ color: '#f8fafc', margin: '0 0 12px', fontSize: '15px' }}>Sample Input</h4>
                                 <pre style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', margin: 0, border: '1px solid #334155' }}><code style={{ color: '#e2e8f0', fontSize: '14px', fontFamily: 'monospace' }}>{p.sample_input}</code></pre>
                             </div>
                           )}
      
                           {p.sample_output && (
                             <div style={{ marginBottom: '32px' }}>
                                 <h4 style={{ color: '#f8fafc', margin: '0 0 12px', fontSize: '15px' }}>Sample Output</h4>
                                 <pre style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', margin: 0, border: '1px solid #334155' }}><code style={{ color: '#e2e8f0', fontSize: '14px', fontFamily: 'monospace' }}>{p.sample_output}</code></pre>
                             </div>
                           )}
                        </>
                     ) : (
                        <p style={{ color: '#94a3b8' }}>No active problem found.</p>
                     )}
                 </div>
                 <div style={{ padding: '16px 24px', borderTop: '1px solid #334155', background: '#1e293b', display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex', gap: '8px' }}>
                         <button 
                            style={{ padding: '8px 16px', background: currentProblemIndex === 0 ? '#0f172a' : '#334155', color: currentProblemIndex === 0 ? '#475569' : 'white', border: 'none', borderRadius: '6px', cursor: currentProblemIndex === 0 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, transition: '0.2s' }}
                            disabled={currentProblemIndex === 0}
                            onClick={() => setCurrentProblemIndex(i => i - 1)}
                         >Previous</button>
                         <button 
                            style={{ padding: '8px 16px', background: currentProblemIndex === (test.problems?.length - 1) ? '#0f172a' : '#334155', color: currentProblemIndex === (test.problems?.length - 1) ? '#475569' : 'white', border: 'none', borderRadius: '6px', cursor: currentProblemIndex === (test.problems?.length - 1) ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, transition: '0.2s' }}
                            disabled={currentProblemIndex === (test.problems?.length - 1)}
                            onClick={() => setCurrentProblemIndex(i => i + 1)}
                         >Next Problem</button>
                     </div>
                     <span style={{ alignSelf: 'center', fontSize: '13px', color: '#64748b' }}>
                        {currentProblemIndex + 1} / {test.problems?.length || 0}
                     </span>
                 </div>
             </div>

             {/* Right Panel - 60% */}
             <div style={{ width: '60%', display: 'flex', flexDirection: 'column' }}>
                 {/* Top: Code Editor (70%) */}
                 <div style={{ height: '70%', display: 'flex', flexDirection: 'column', borderBottom: '1px solid #334155' }}>
                      <div style={{ padding: '12px 16px', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', gap: '16px' }}>
                             <div style={{ color: '#38bdf8', fontSize: '13px', fontFamily: 'monospace', fontWeight: 600, background: '#0f172a', padding: '6px 12px', borderRadius: '4px', border: '1px solid #334155' }}>main.py</div>
                             <select style={{ background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '4px', padding: '6px 12px', fontSize: '13px', outline: 'none' }}>
                                 <option>Python 3</option>
                                 <option>Java</option>
                                 <option>C++</option>
                                 <option>JavaScript</option>
                             </select>
                         </div>
                         <button onClick={() => alert('Code execution environment not yet initialized')} style={{ padding: '8px 20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: '0.2s' }}>
                             ► Run Code
                         </button>
                      </div>
                      <textarea 
                           style={{ flex: 1, padding: '24px', background: '#0f172a', color: '#e2e8f0', border: 'none', outline: 'none', fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace', fontSize: '15px', resize: 'none', lineHeight: '1.6' }}
                           placeholder="# Write your Python 3 code here..."
                           spellCheck={false}
                           defaultValue={`def solution():\n    # TODO: Implement your solution here\n    pass\n\nif __name__ == '__main__':\n    solution()`}
                      />
                 </div>
                 
                 {/* Bottom: Console (30%) */}
                 <div style={{ height: '30%', display: 'flex', flexDirection: 'column', background: '#1e293b' }}>
                      <div style={{ padding: '12px 24px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                             <span style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 600 }}>Test Case Output</span>
                             <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }}></span>
                         </div>
                         <button onClick={handleManualSubmit} style={{ padding: '8px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: '0.2s', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)' }}>
                             Submit Assessment
                         </button>
                      </div>
                      <div style={{ padding: '16px 24px', overflowY: 'auto', fontFamily: '"Fira Code", Consolas, monospace', color: '#94a3b8', fontSize: '14px', flex: 1 }}>
                          <div style={{ marginBottom: '16px', color: '#64748b' }}>$ environment connected. awaiting execution...</div>
                          <div style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1' }}>
                              <span style={{ color: '#38bdf8' }}>Info:</span> You must run the code to see test case results.
                          </div>
                      </div>
                 </div>
             </div>
        </div>
      );
  }

  // ====== QUIZ TEST LAYOUT (DEFAULT) ======
  return (
    <div style={{ background: 'var(--student-bg)', minHeight: '100vh', color: 'var(--student-text)', margin: '-32px', display: 'flex', flexDirection: 'column' }}>
      {warningOverlay}

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
        {test?.questions?.length > 0 ? (
          test.questions.map((q: any) => (
            <div key={q.id || q.question_number} style={{ marginBottom: '24px', background: 'var(--student-card-bg)', border: '1px solid var(--student-border)', padding: '32px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ marginTop: 0, fontSize: '18px' }}>
                Question {q.question_number}: {q.question_text}
              </h3>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['a', 'b', 'c', 'd'].map(opt => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'var(--student-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--student-border)' }}>
                    <input type="radio" name={`question-${q.id || q.question_number}`} value={opt} />
                    <span>{q[`option_${opt}`]}</span>
                  </label>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{ marginTop: '24px', background: 'var(--student-card-bg)', border: '1px solid var(--student-border)', padding: '32px', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ color: 'var(--student-text-muted)', fontSize: '15px' }}>No questions available for this test.</p>
          </div>
        )}
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
