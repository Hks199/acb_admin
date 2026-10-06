import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import logo from '../../assets/logo.jpeg';

const Login = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSigningIn(true);
    setError('');
    try {
      await onLogin(userId, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to sign in.');
    } finally { setSigningIn(false); }
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <img src={logo} alt="Art & Craft from Bharat" />
          <div>Art & Craft <span>FROM BHARAT</span></div>
        </div>
        <p className="page-eyebrow">Store administration</p>
        <h1 id="login-title">Welcome back</h1>
        <p className="login-description">Sign in to manage your store, products, and orders.</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Admin email or mobile number" name="username" value={userId} required autoFocus autoComplete="username" fullWidth
            onChange={(event) => { setUserId(event.target.value); setError(''); }} />
          <TextField label="Password" name="password" value={password} type={showPassword ? 'text' : 'password'} required autoComplete="current-password" fullWidth
            onChange={(event) => { setPassword(event.target.value); setError(''); }}
            slotProps={{ input: { endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}
                  onClick={() => setShowPassword((value) => !value)} edge="end" type="button">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </IconButton>
              </InputAdornment>
            ) } }} />
          <Button variant="contained" type="submit" disabled={signingIn} size="large" fullWidth endIcon={<FiArrowRight />}>{signingIn ? 'Signing in...' : 'Sign in'}</Button>
        </form>

        <p className="login-description">Use your verified store account with the Admin role.</p>
      </section>
    </main>
  );
};

export default Login;
