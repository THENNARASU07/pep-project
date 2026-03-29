import React, { useState } from 'react';

interface Props {
  testType: 'Quiz' | 'Code';
  testTitle: string;
  onStart: () => void;
  onClose: () => void;
}

const TestInstructionsModal: React.FC<Props> = ({ testType, testTitle, onStart, onClose }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>
          {testType} Instructions: {testTitle}
        </h2>
        
        <div style={{color: 'var(--student-text-muted)', fontSize: '14px', marginTop: '16px'}}>
          <p>Candidates must not engage in any form of malpractice during the test. Any violation will lead to immediate disqualification.</p>
          
          <ul className="instructions-list">
            <li><strong>Tab switching is strictly limited.</strong> You are allowed a maximum of two tab switches. Exceeding this limit will result in elimination from the test.</li>
            <li><strong>You must remain in full-screen mode throughout the test.</strong> Exiting full-screen mode more than twice will lead to elimination.</li>
          </ul>
        </div>
        
        <label className="checkbox-container">
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
          />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            I understand the rules and regulations and am ready to attend the test.
          </span>
        </label>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
          <button className="btn-accent" style={{background: '#F1F5F9', color: '#64748B'}} onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-accent btn-start" 
            disabled={!agreed} 
            onClick={onStart}
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestInstructionsModal;
