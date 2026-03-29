import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentHome: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) return <div style={{padding: '32px'}}>Loading profile...</div>;

  return (
    <div style={{ animation: "fadeIn 0.6s ease-out", maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{fontSize: '24px', fontWeight: 700, color: '#1E293B', marginBottom: '24px'}}>Student Dashboard</h1>

      <div style={{ marginBottom: '16px' }}>
         <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>Students Details</h2>
         
         <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px 16px' }}>
                
                {/* Field 1 */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Name</div>
                  <div style={{ fontSize: '14px', color: '#64748B', textTransform: 'uppercase' }}>{user.name || 'None'}</div>
                </div>

                {/* Field 2 */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Roll Number</div>
                  <div style={{ fontSize: '14px', color: '#64748B', textTransform: 'uppercase' }}>{user.roll_no || 'None'}</div>
                </div>

                {/* Field 3 */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Department</div>
                  <div style={{ fontSize: '14px', color: '#64748B', textTransform: 'uppercase' }}>{user.department || 'None'}</div>
                </div>

                {/* Field 4 */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Registration Number</div>
                  <div style={{ fontSize: '14px', color: '#64748B', textTransform: 'uppercase' }}>{user.reg_no || 'None'}</div>
                </div>

                {/* Field 5 */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Class / Section</div>
                  <div style={{ fontSize: '14px', color: '#64748B' }}>{user.class_section || 'None'}</div>
                </div>

                {/* Field 6 */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>EmailID</div>
                  <div style={{ fontSize: '14px', color: '#64748B' }}>{user.email || 'None'}</div>
                </div>

            </div>
         </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>Assessments Overview</h2>
        
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
               <thead style={{ background: '#F8FAFC' }}>
                  <tr>
                     <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>Title</th>
                     <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>Total Tests Taken</th>
                     <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>Average Score</th>
                     <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>Status</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td style={{ padding: '24px', fontSize: '14px', color: '#64748B' }} colSpan={4} align="center">
                        No data for table
                     </td>
                  </tr>
               </tbody>
            </table>
            
            <div style={{ padding: '12px 24px', borderTop: '1px solid #E2E8F0', background: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '13px', color: '#94A3B8' }}>Rows per page: 20 ▼</span>
               <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#94A3B8' }}>
                  <span>0 - 0 of 0</span>
                  <span style={{ cursor: 'pointer' }}>Previous</span>
                  <span style={{ cursor: 'pointer' }}>Next</span>
               </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default StudentHome;
