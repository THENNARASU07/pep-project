import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TestInstructionsModal from './TestInstructionsModal';

const QuizTestList: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tests');
      const data = await response.json();
      if (response.ok) {
        setTests(data.filter((t: any) => t.test_type === 'quiz' && t.is_published));
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    if (selectedTest) {
      navigate(`/student/take-quiz/${selectedTest.id}`);
    }
  };

  if (loading) return <div style={{color: 'var(--student-text)'}}>Loading Quizzes...</div>;

  return (
    <div style={{ animation: "fadeIn 0.6s ease" }}>
      <h1 style={{color: 'var(--student-text)', marginBottom: '2rem', marginTop: 0}}>Quiz Arenas</h1>
      
      {tests.length === 0 ? (
        <p style={{color: 'var(--student-text-muted)'}}>No quizzes are currently available.</p>
      ) : (
        <div className="tests-grid">
          {tests.map(test => (
            <div key={test.id} className="test-card">
              <h3>{test.title}</h3>
              <p style={{color: '#a0a5b5', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '40px'}}>{test.description}</p>
              
              <div className="test-meta">
                <span>⏱ {test.duration_minutes} mins</span>
                <span>📝 {test.question_count || 10} Questions</span>
              </div>
              
              <button className="btn-accent" onClick={() => setSelectedTest(test)}>
                Take Test
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedTest && (
        <TestInstructionsModal 
          testType="Quiz" 
          testTitle={selectedTest.title} 
          onStart={handleStartTest} 
          onClose={() => setSelectedTest(null)} 
        />
      )}
    </div>
  );
};

export default QuizTestList;
