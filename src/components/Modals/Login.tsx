import React, { useEffect, useState } from "react";
import { useSetRecoilState } from 'recoil'
import { toast } from "react-toastify"

import { authModalState } from "@/atoms/authModalAtom";
import { auth } from "@/firebase/firebase";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";

type LoginProps = {};

const Login: React.FC<LoginProps> = () => {
  const router = useRouter()
  const setAuth = useSetRecoilState(authModalState)
  const [inputs, setInputs] = useState({email:"", password:""})

  const [
    signInWithEmailAndPassword,
    user,
    loading,
    error,
  ] = useSignInWithEmailAndPassword(auth);

  const handleClick = (type: "login" | "register" | "forgotPassword" ) => {
    setAuth((prev) => ({...prev, type}))
  }

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(!inputs.email || !inputs.password) return toast.error("Please fill in all fields",  { autoClose: 3000, position: 'top-center', theme: 'dark' })

    try {
      const newUser = await signInWithEmailAndPassword(inputs.email, inputs.password);

      if(!newUser) return;

      router.push("/")
    } catch (error: any) {
      toast.error(error.message, { autoClose: 3000, position: 'top-center', theme: 'dark' })
    }
  }

  useEffect(() => {
    if(error) toast.error(error.message, { autoClose: 3000, position: 'top-center', theme: 'dark' })
  }, [error])
  
  return (
    <form className="space-y-6 px-6 pb-4" onSubmit={handleLogin}>
      <h3 className="text-white text-3xl font-medium">Sign In</h3>
      <div className="flex flex-col gap-2 w-full">
        <label htmlFor="email" className="text-sm font-medium text-gray-300">
          Your email
        </label>
        <input
          onChange={handleChangeInput}
          type="email"
          name="email"
          id="email"
          placeholder="bob@comp.com"
          className="border-2 sm:text-sm px-2 py-2 outline-none bg-gray-600 border-gray-500 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <label htmlFor="password" className="text-sm font-medium text-gray-300">
          Your password
        </label>
        <input
          onChange={handleChangeInput}
          type="password"
          name="password"
          id="password"
          placeholder="**********"
          className="border-2 sm:text-sm pt-2.5 pb-1.5 px-2 outline-none bg-gray-600 border-gray-500 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button type="submit" className="px-5 py-2.5 text-white bg-brand-orange hover:bg-brand-orange-s rounded-lg text-center font-medium w-full text-sm focus:ring-blue-500">Login</button>
      <button className="flex w-full justify-end">
        <a href='#' onClick={() => handleClick("forgotPassword")} className="text-sm block text-brand-orange hover:underline text-right w-full">Forgot password?</a>
      </button>
      <div className="w-full text-gray-500 font-medium text-sm mb-1">
        Not registered yet?
        <a href='#' onClick={() => handleClick('register')} className="text-blue-700 hover:underline"> Create account</a>
      </div>
    </form>
  );
};

export default Login;
