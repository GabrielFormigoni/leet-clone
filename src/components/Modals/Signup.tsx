import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSetRecoilState } from "recoil";
import { auth, firestore } from "@/firebase/firebase";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";

import { authModalState } from "@/atoms/authModalAtom";
import { doc, setDoc } from "firebase/firestore";

type SignupProps = {};

const Signup: React.FC<SignupProps> = () => {
  const router = useRouter();
  const setAuth = useSetRecoilState(authModalState);
  const [inputs, setInputs] = useState({
    email: "",
    displayName: "",
    password: "",
  });

  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  const handleClick = () => {
    setAuth((prev) => ({ ...prev, type: "login" }));
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputs.email || !inputs.displayName || !inputs.password)
      return toast.error("Please fill in all fields", {
        autoClose: 3000,
        position: "top-center",
        theme: "dark",
      });

    try {
      toast.loading("Creating account...", { position: "top-center", toastId: "loading" })
      const newUser = await createUserWithEmailAndPassword(
        inputs.email,
        inputs.password
      );

      if (!newUser) return;
      
      const userData = {
        uid: newUser.user.uid,
        displayName: inputs.displayName,
        email: newUser.user.email,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        likedProblems: [],
        dislikedProblems: [],
        solvedProblems: [],
        starredProblems: [],
      }

      await setDoc(doc(firestore, "users", newUser.user.uid), userData)

      router.push("/");
    } catch (error: any) {
      toast.error(error.message, {
        autoClose: 3000,
        position: "top-center",
        theme: "dark",
      });
    } finally {
      toast.dismiss("loading")
    }
  };

  useEffect(() => {
    if (error)
      toast.error(error.message, {
        autoClose: 3000,
        position: "top-center",
        theme: "dark",
      });
  }, [error]);

  return (
    <form className="space-y-6 px-6 pb-4" onSubmit={handleRegister}>
      <h3 className="text-white text-3xl font-medium">Sign up</h3>
      <div className="flex flex-col gap-2 w-full">
        <label htmlFor="email" className="text-sm font-medium text-gray-300">
          Email
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
        <label htmlFor="username" className="text-sm font-medium text-gray-300">
          Username
        </label>
        <input
          onChange={handleChangeInput}
          type="displayName"
          name="displayName"
          id="displayName"
          placeholder="Bob"
          className="border-2 sm:text-sm px-2 py-2 outline-none bg-gray-600 border-gray-500 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <label htmlFor="password" className="text-sm font-medium text-gray-300">
          Password
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
      <button
        type="submit"
        className="px-5 py-2.5 text-white bg-brand-orange hover:bg-brand-orange-s rounded-lg text-center font-medium w-full text-sm focus:ring-blue-500"
      >
        {loading ? "Registering..." : "Register"}
      </button>
      <div className="w-full text-gray-500 font-medium text-sm mb-1">
        Already have an account?
        <a
          href="#"
          onClick={handleClick}
          className="text-blue-700 hover:underline"
        >
          {" "}
          Login
        </a>
      </div>
    </form>
  );
};
export default Signup;
