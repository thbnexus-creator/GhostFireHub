import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { signInWithGoogle, auth } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  getUserProfile, 
  createUserProfile, 
  updateUserProfile,
  isUsernameTaken,
  findUserByReferralCode,
  findUserByUsername
} from '../lib/dbService';

interface AuthProps {
  onAuthSuccess: (user: UserProfile) => void;
  onNavigateToRegister: () => void;
  onNavigateToLogin: () => void;
  onNavigateToForgot: () => void;
  mode: 'login' | 'register' | 'forgot';
}

export default function AuthScreens({ onAuthSuccess, onNavigateToRegister, onNavigateToLogin, onNavigateToForgot, mode }: AuthProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [country, setCountry] = useState('Nigeria');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('ref') || params.get('code') || params.get('invite');
      if (code) {
        setReferralCode(code);
      }
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoadingGoogle(true);

    try {
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('Could not retrieve email from Google Account.');
      }

      // Check if user profile already exists in Firestore
      let profile = await getUserProfile(firebaseUser.uid);

      if (profile) {
        if (profile.isBanned) {
          setError('This user account has been suspended by the administrator.');
          setLoadingGoogle(false);
          return;
        }
        setSuccess('Successfully authenticated! Initializing dashboard...');
        setTimeout(() => {
          onAuthSuccess(profile!);
        }, 1200);
      } else {
        // Auto-register new Google user with a clean, unique username
        const baseUsername = firebaseUser.displayName 
          ? firebaseUser.displayName.replace(/[^a-zA-Z0-9]/g, '') 
          : firebaseUser.email.split('@')[0];
        
        let finalUsername = baseUsername || 'Tactician';
        let count = 1;

        // Query Firestore to avoid username collisions
        let usernameTaken = true;
        while (usernameTaken) {
          const taken = await isUsernameTaken(finalUsername);
          if (!taken) {
            usernameTaken = false;
          } else {
            finalUsername = `${baseUsername}${count}`;
            count++;
          }
        }

        // Create user profile in Firestore
        const newProfile = await createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email,
          username: finalUsername,
          country
        });

        setSuccess('Google account successfully registered! Launching profile...');
        setTimeout(() => {
          onAuthSuccess(newProfile);
        }, 1200);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      let friendlyMessage = 'Google Sign-In failed or was cancelled.';
      
      const errorCode = err.code || '';
      const errorMessage = err.message || '';
      
      if (errorCode === 'auth/popup-closed-by-user' || errorMessage.includes('popup-closed-by-user')) {
        friendlyMessage = 'Sign-In cancelled. The login popup was closed before completion. Please try again and complete the sign-in prompt.';
      } else if (errorCode === 'auth/popup-blocked' || errorMessage.includes('popup-blocked')) {
        friendlyMessage = 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (errorCode === 'auth/cancelled-popup-request' || errorMessage.includes('cancelled-popup-request')) {
        friendlyMessage = 'Multiple sign-in attempts detected. Please complete the open sign-in window or wait and try again.';
      } else if (errorCode) {
        const cleanCode = errorCode.replace('auth/', '').replace(/-/g, ' ');
        friendlyMessage = `Authentication error: ${cleanCode}. Please try again.`;
      } else if (errorMessage) {
        friendlyMessage = errorMessage;
      }
      
      setError(friendlyMessage);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'login' && !email) {
      setError('Please provide your Username or Email address.');
      setLoading(false);
      return;
    }

    if (mode === 'register') {
      if (!username) {
        setError('Please provide a unique username.');
        setLoading(false);
        return;
      }
      if (!password) {
        setError('Please provide a secure password.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      if (!hasUppercase || !hasLowercase || !hasNumber) {
        setError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
        setLoading(false);
        return;
      }
    }

    // Referral code is now optional; if blank, we let the backend handle default GHOST666
    const finalReferralCode = referralCode.trim() || 'GHOST666';

    try {
      if (mode === 'forgot') {
        if (!email) {
          setError('Please provide your email address.');
          setLoading(false);
          return;
        }
        await sendPasswordResetEmail(auth, email.trim());
        setSuccess('A password reset link has been dispatched to ' + email + '. Please verify your inbox.');
        setLoading(false);
        return;
      }

      if (mode === 'register') {
        const cleanUsername = username.trim();
        
        // 1. Check username uniqueness in Firestore
        const isTaken = await isUsernameTaken(cleanUsername);
        if (isTaken) {
          setError('Username already taken. Please choose a different name!');
          setLoading(false);
          return;
        }

        let finalEmail = (email || '').toLowerCase().trim();
        if (!finalEmail) {
          const parsedUser = cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
          finalEmail = `${parsedUser || 'ghostuser' + Math.floor(Math.random() * 10000)}@ghostfirehub.com`;
        }

        // 2. Create the user in Firebase Auth
        const credential = await createUserWithEmailAndPassword(auth, finalEmail, password);
        
        // Sync display name in Firebase Auth
        try {
          await updateProfile(credential.user, { displayName: cleanUsername });
        } catch (updateProfileErr) {
          console.warn("Failed to update Firebase display name:", updateProfileErr);
        }
        
        // 3. Check and award referral bonuses if applicable
        let referringUserEmail: string | null = null;
        if (finalReferralCode && finalReferralCode !== 'GHOST666') {
          // Check if referral code matches an existing user's referral code
          const refResult = await findUserByReferralCode(finalReferralCode);
          if (refResult) {
            referringUserEmail = refResult.data.email;
            
            // Award referrer +50 points and increment count
            await updateUserProfile(refResult.id, {
              referralCount: (refResult.data.referralCount || 0) + 1,
              ghostPoints: (refResult.data.ghostPoints || 0) + 50
            });
          }
        }

        // 4. Save profile to Firestore
        const userProfile = await createUserProfile(credential.user.uid, {
          email: finalEmail,
          username: cleanUsername,
          country
        });

        setSuccess('Registration successful! Launching profile...');
        setTimeout(() => {
          onAuthSuccess(userProfile);
        }, 1200);

      } else {
        // Mode is Login
        let loginEmail = email.trim();
        
        // Handle login by username fallback
        if (!loginEmail.includes('@')) {
          const userData = await findUserByUsername(loginEmail);
          if (userData) {
            loginEmail = userData.email;
          } else {
            setError('No user account matches that username.');
            setLoading(false);
            return;
          }
        }

        // Authenticate with Firebase Auth
        const credential = await signInWithEmailAndPassword(auth, loginEmail, password);
        
        // Fetch User Profile from Firestore
        let profile = await getUserProfile(credential.user.uid);
        if (!profile) {
          // Fallback if record was never created
          profile = await createUserProfile(credential.user.uid, {
            email: loginEmail,
            username: loginEmail.split('@')[0],
            country
          });
        }

        if (profile.isBanned) {
          setError('This account has been suspended by the administrator.');
          setLoading(false);
          return;
        }

        onAuthSuccess(profile);
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      let friendlyMessage = 'Authentication failed. Please verify credentials.';
      const errorCode = err.code || '';
      const errorMessage = err.message || '';
      
      if (errorCode === 'auth/network-request-failed' || errorMessage.includes('network-request-failed')) {
        friendlyMessage = 'Network connection failed. Please verify your internet connection and make sure your Firebase project is reachable.';
      } else if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
        friendlyMessage = 'Incorrect email or password. Please verify and try again.';
      } else if (errorCode === 'auth/email-already-in-use') {
        friendlyMessage = 'This email address is already associated with another account.';
      } else if (errorCode === 'auth/weak-password') {
        friendlyMessage = 'Password must be at least 6 characters.';
      } else if (errorCode === 'auth/invalid-email') {
        friendlyMessage = 'Invalid email address format.';
      } else if (errorMessage) {
        friendlyMessage = errorMessage;
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg shadow-orange-500/10 mb-4">
          <Sparkles className="w-6 h-6 text-slate-950" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
          {mode === 'login' && 'Access Hub'}
          {mode === 'register' && 'Forge Account'}
          {mode === 'forgot' && 'Restore Access'}
        </h2>
        <p className="text-xs text-slate-400 mt-1.5">
          {mode === 'login' && 'Unlock personalized GhostCore™ recommendations'}
          {mode === 'register' && 'Join the esports platform of tomorrow'}
          {mode === 'forgot' && 'Recover your saved recommendations and layouts'}
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-400 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-xs text-emerald-400 animate-fadeIn">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Username for Register */}
        {mode === 'register' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., GhostSlayer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>
        )}

        {/* Country for Register */}
        {mode === 'register' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Country</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-xs text-slate-500">🌍</span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
              >
                <option value="Nigeria">Nigeria (₦ Naira currency)</option>
                <option value="United States">United States ($ USD currency)</option>
                <option value="United Kingdom">United Kingdom ($ USD currency)</option>
                <option value="Brazil">Brazil ($ USD currency)</option>
                <option value="India">India ($ USD currency)</option>
                <option value="Other">Other country ($ USD currency)</option>
              </select>
            </div>
          </div>
        )}

        {/* Email / Username or Email */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {mode === 'login' ? 'Username or Email' : 'Email Address'}
            </label>
            {mode === 'register' && (
              <span className="text-[8.5px] text-slate-500 font-bold">OPTIONAL</span>
            )}
          </div>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type={mode === 'login' ? 'text' : 'email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === 'login' ? 'e.g., GhostSlayer or player@ghostfirehub.com' : 'e.g., player@ghostfirehub.com (or leave blank)'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-700"
            />
          </div>
        </div>

        {/* Password (if not Forgot Mode) */}
        {mode !== 'forgot' && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={onNavigateToForgot}
                  className="text-[10px] text-amber-500 hover:text-amber-400 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>
        )}

        {/* Referral Code (only for register) */}
        {mode === 'register' && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Referral Code</label>
              <span className="text-[8.5px] text-slate-500 font-bold">OPTIONAL</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-xs text-slate-500">🎫</span>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="e.g., GHOST666 or FIRE999"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-700 uppercase"
              />
            </div>
            <p className="text-[9.5px] text-slate-500 leading-normal font-sans">
              Enter an optional referral code to support a friend. If left blank, it will automatically default to <span className="text-orange-400 font-mono font-bold">GHOST666</span>.
            </p>
          </div>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading || loadingGoogle}
          className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-orange-600/10 flex justify-center items-center gap-2 transition-all mt-6 cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              {mode === 'login' && 'Unlock Dashboard'}
              {mode === 'register' && 'Assemble Profile'}
              {mode === 'forgot' && 'Send Reset Mail'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {mode !== 'forgot' && (
          <div className="space-y-2.5">
            {/* OR Divider */}
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-slate-800/80"></div>
              <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Or login with</span>
              <div className="flex-grow border-t border-slate-800/80"></div>
            </div>

            {/* Social Logins */}
            <div className="w-full">
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || loadingGoogle}
                className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs rounded-xl flex justify-center items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingGoogle ? (
                  <span className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Footer Switcher */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400 flex flex-col gap-2">
        {mode === 'login' ? (
          <div>
            Don't have an account?{' '}
            <button onClick={onNavigateToRegister} className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
              Sign Up Free
            </button>
          </div>
        ) : (
          <div>
            Already registered?{' '}
            <button onClick={onNavigateToLogin} className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
              Log In
            </button>
          </div>
        )}

        <div className="text-[10px] text-slate-600 mt-2">
          By continuing, you agree to our Terms of Use and Privacy Policy. Secured by GhostShield.
        </div>
      </div>
    </div>
  );
}
