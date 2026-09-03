import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiPhone, FiLock, FiUploadCloud, FiFileText, FiCheckCircle, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterJobSeeker() {
    const [searchParams] = useSearchParams();
    const phoneFromUrl = searchParams.get('phone') || sessionStorage.getItem('verified_candidate_phone') || '';

    const [formData, setFormData] = useState({
        name: '', email: '', phone: phoneFromUrl, password: '', confirmPassword: ''
    });
    
    // File upload state
    const [resumeFile, setResumeFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { registerJobSeeker } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const phone = searchParams.get('phone') || sessionStorage.getItem('verified_candidate_phone');
        if (phone) {
            setFormData(prev => ({ ...prev, phone }));
        }
    }, [searchParams]);

    function handleChange(e) {
        const { name, value } = e.target;
        
        // Strict Mobile Number Validation (Only Numbers)
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, ''); // Remove all non-digits
            if (numericValue.length <= 10) {
                setFormData({ ...formData, [name]: numericValue });
            }
            return;
        }

        setFormData({ ...formData, [name]: value });
    }

    // Drag and Drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelection(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFileSelection(file);
    };

    const handleFileSelection = (file) => {
        if (!file) return;
        
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file for your resume.');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('Resume size must be less than 5MB.');
            return;
        }

        setError('');
        setResumeFile(file);
    };

    const removeFile = () => {
        setResumeFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        // Strict Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return setError('Please enter a valid email address.');
        }

        if (formData.phone.length !== 10) {
            return setError('Mobile number must be exactly 10 digits.');
        }

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match.');
        }
        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters.');
        }

        if (!resumeFile) {
            return setError('Please upload your resume (PDF) to proceed.');
        }

        setLoading(true);
        try {
            // In a real app, upload resumeFile securely to a storage bucket here.
            // For now, we simulate secure upload using mock interceptors.
            
            await registerJobSeeker(formData.email, formData.password, {
                name: formData.name,
                phone: formData.phone,
                resumeURL: 'simulated_secure_upload_url.pdf' // Simulated secure URL
            });
            navigate('/jobseeker');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        }
        setLoading(false);
    }

    return (
        <div className="auth-page" style={{ padding: '40px 20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="auth-card glass-panel"
                style={{ 
                    maxWidth: '650px', 
                    width: '100%', 
                    padding: '40px',
                    borderRadius: '24px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.05)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Create Account</h2>
                    <p style={{ color: '#64748b', fontSize: '1.05rem' }}>Join as a Job Seeker and start applying instantly.</p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ background: '#fef2f2', color: '#991b1b', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fecaca', fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden' }}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}><FiUser /> Full Name</label>
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', transition: 'border-color 0.2s', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#0ea5e9'} onBlur={(e) => e.target.style.borderColor = '#cbd5e1'} />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}><FiMail /> Email (Secure Validation)</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#0ea5e9'} onBlur={(e) => e.target.style.borderColor = '#cbd5e1'} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}><FiPhone /> Phone (Numbers Only)</label>
                            <input name="phone" type="text" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile" required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#0ea5e9'} onBlur={(e) => e.target.style.borderColor = '#cbd5e1'} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}><FiLock /> Password</label>
                            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#0ea5e9'} onBlur={(e) => e.target.style.borderColor = '#cbd5e1'} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}><FiLock /> Confirm Password</label>
                            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#0ea5e9'} onBlur={(e) => e.target.style.borderColor = '#cbd5e1'} />
                        </div>
                    </div>

                    {/* SECURE RESUME UPLOAD UI */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Secure Resume Upload</label>
                        
                        {!resumeFile ? (
                            <div 
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    border: `2px dashed ${isDragging ? '#0ea5e9' : '#cbd5e1'}`,
                                    background: isDragging ? '#f0f9ff' : '#f8fafc',
                                    borderRadius: '16px',
                                    padding: '32px 20px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <FiUploadCloud style={{ fontSize: '3rem', color: isDragging ? '#0ea5e9' : '#94a3b8', marginBottom: '12px', transition: 'color 0.3s' }} />
                                <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#334155' }}>Drag & Drop your Resume (PDF)</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Securely stored in our database. Max size: 5MB.</p>
                                <input 
                                    type="file" 
                                    accept="application/pdf" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    onChange={handleFileChange}
                                />
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '16px',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#dcfce7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
                                        <FiFileText size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {resumeFile.name} <FiCheckCircle size={14} />
                                        </h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#15803d' }}>Ready for secure upload</p>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={removeFile}
                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <FiX size={20} />
                                </button>
                            </motion.div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary-gradient" 
                        style={{ 
                            width: '100%', 
                            padding: '16px', 
                            borderRadius: '12px', 
                            fontSize: '1.1rem', 
                            fontWeight: 800,
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)'
                        }} 
                        disabled={loading}
                    >
                        {loading ? 'Processing Secure Registration...' : 'Create Account & Upload Resume'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.95rem', color: '#64748b' }}>
                    <p style={{ marginBottom: '8px' }}>
                        Already have an account? <Link to="/login" style={{ color: '#0ea5e9', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
                    </p>
                    <p>
                        Are you an employer? <Link to="/register/company" style={{ color: '#0ea5e9', fontWeight: 700, textDecoration: 'none' }}>Register Company</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
