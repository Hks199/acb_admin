import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { DEMO_USER_ID, DEMO_PASSWORD } from '../../lib/demoAuth';
import logo from '../../assets/logo.jpeg';

const Login = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!onLogin(userId, password)) {
      setError('Incorrect user ID or password. Please try again.');
      return;
    }
    navigate('/', { replace: true });
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
          <TextField label="User ID" name="username" value={userId} required autoFocus autoComplete="username" fullWidth
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
          <Button variant="contained" type="submit" size="large" fullWidth endIcon={<FiArrowRight />}>Sign in</Button>
        </form>

        <div className="login-demo">
          <strong>Demo credentials</strong>
          <p>User ID <code>{DEMO_USER_ID}</code></p>
          <p>Password <code>{DEMO_PASSWORD}</code></p>
        </div>
      </section>
    </main>
  );
};

export default Login;
