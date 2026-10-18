

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router'; // Import Link
import { useDispatch , useSelector } from 'react-redux';
import { registerUser } from '../authSlice.js';
import { useEffect } from 'react';

const signupSchema = z.object({
  firstName: z.string().min(3, 'First name must be at least 3 characters long'),
  emailID: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
});

function Signup() {
  const dispatch = useDispatch();
  const Navigate = useNavigate();
  const {isAuthenticated, error} = useSelector((state) => state.auth)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });
  useEffect(()=>{
if(isAuthenticated){
  Navigate('/')
}
  }, [isAuthenticated, Navigate])

  const onSubmit = async (data) => {
    await dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-base-100 to-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md shadow-2xl bg-base-100">
        <div className="card-body">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-base-content/70 mt-2">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {error && <div role="alert" className="alert alert-error mb-4">{error}</div>}
            {/* First Name Field */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-semibold">First Name</span>
              </label>
              <input
                {...register('firstName')}
                type="text"
                placeholder="Ansh"
                className={`input input-bordered w-full ${
                  errors.firstName ? 'input-error' : ''
                }`}
              />
              {errors.firstName && (
                <label className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errors.firstName.message}
                  </span>
                </label>
              )}
            </div>

            {/* Email Field */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <input
                {...register('emailID')}
                type="email"
                placeholder="Ansh@example.com"
                className={`input input-bordered w-full ${
                  errors.emailID ? 'input-error' : ''
                }`}
              />
              {errors.emailID && (
                <label className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errors.emailID.message}
                  </span>
                </label>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control mb-8">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className={`input input-bordered w-full ${
                  errors.password ? 'input-error' : ''
                }`}
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errors.password.message}
                  </span>
                </label>
              )}
              <label className="label">
                <span className="label-text-alt text-xs">
                  Password must contain: • 8+ chars • lowercase • uppercase • number
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="form-control mt-2">
              <button
                type="submit"
                className={`btn btn-primary w-full ${
                  isSubmitting ? 'loading' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>

            <div className="divider my-6">OR</div>

            {/* Additional Links */}
            <div className="text-center space-y-3">
              <p className="text-sm text-base-content/70">
                Already have an account?{' '}
                <Link to="/login" className="link link-primary font-semibold">
                  Login
                </Link>
              </p>
              <p className="text-xs text-base-content/50">
                By signing up, you agree to our{' '}
                <a href="#" className="link link-hover">
                  Terms
                </a>{' '}
                and{' '}
                <a href="#" className="link link-hover">
                  Privacy Policy
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;


// napkin.ai
// julius ai
// ai employees 
// sintra