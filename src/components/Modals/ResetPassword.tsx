import React, { useState, useEffect } from "react";
import { auth } from "@/firebase/firebase";
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";

type ResetPasswordProps = {};

const ResetPassword: React.FC<ResetPasswordProps> = () => {
  const [email, setEmail] = useState('');
  const [sendPasswordResetEmail, sending, error] = useSendPasswordResetEmail(auth);

  const resetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const success = await sendPasswordResetEmail( email );

    if(success) {
      toast.success('Password reset email sent!', { autoClose: 3000, position: 'top-center' })
    }
  }
  
  useEffect(() => {
    if(error) {
      toast.error(error.message)
    }
  }, [])

  return (
    <form className="space-y-6 px-6 pb-4" onSubmit={resetPassword}>
      <h3 className="text-white text-3xl font-medium">Reset your password</h3>
      <p className="text-white text-sm">Forgot your password? Enter your email and we will send you an email allowing you to reset it.</p>
      <div className="flex flex-col gap-2 w-full">
        <label htmlFor="email" className="text-sm font-medium text-gray-300">
          Email
        </label>
        <input
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          name="email"
          id="email"
          placeholder="bob@comp.com"
          className="border-2 sm:text-sm px-2 py-2 outline-none bg-gray-600 border-gray-500 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button
        type="submit"
        className="px-5 py-2.5 text-white bg-brand-orange hover:bg-brand-orange-s rounded-lg text-center font-medium w-full text-sm focus:ring-blue-500"
      >
        Reset Password
      </button>
    </form>
  );
};
export default ResetPassword;
