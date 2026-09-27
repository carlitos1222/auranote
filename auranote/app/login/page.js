'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const router = useRouter();
  const { login, loginWithGoogle, user, loading, error, clearError } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email.trim()) { setLocalError('Ingresa tu correo electrónico'); return; }
    if (!password) { setLocalError('Ingresa tu contraseña'); return; }
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  if (loading) {
    return (
      <div className={styles.authPage}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.decorSide}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.decorContent}>
          <Link href="/" className={styles.decorLogo}>
            <span className={styles.logoIcon}>✦</span>
            <span className="gradient-text">AuraNote</span>
          </Link>
          <h2 className={styles.decorTitle}>Bienvenido de vuelta</h2>
          <p className={styles.decorText}>Accede a tus apuntes inteligentes y continúa estudiando con el poder de la IA</p>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          <h1 className={styles.formTitle}>Iniciar Sesión</h1>
          <p className={styles.formSubtitle}>Ingresa tus credenciales para continuar</p>

          {displayError && (
            <div className={styles.errorAlert}>
              ⚠️ {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Correo electrónico</label>
              <input
                type="email"
                className={styles.input}
                placeholder="tu@universidad.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Contraseña</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
                <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? (
                <><span className={styles.btnSpinner}></span> Iniciando sesión...</>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            <div className={styles.divider}><span>O continúa con</span></div>

            <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin} disabled={isSubmitting}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continuar con Google
            </button>
          </form>

          <p className={styles.switchAuth}>
            ¿No tienes cuenta? <Link href="/registro" className={styles.switchLink}>Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
