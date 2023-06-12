import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useRecoilValue } from "recoil";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";

import { authModalState } from "@/atoms/authModalAtom";
import AuthModal from "@/components/Modals/AuthModal";
import Navbar from "@/components/Navbar/Navbar";
import Image from "next/image";

type AuthPageProps = {};

const AuthPage: React.FC<AuthPageProps> = () => {
  const router = useRouter();
  const authModal = useRecoilValue(authModalState);
  const [user, loading, error] = useAuthState(auth);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (user) router.push("/");
    if (!user && !loading) setPageLoading(false);
  }, [user, router, loading]);

  if (pageLoading) return null;

  return (
    <div className="bg-gradient-to-b from-gray-600 to-black h-screen relative">
      <div className="max-w-7xl mx-auto">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-5rem)] select-none pointer-events-none">
          <Image src="/hero.png" alt="hero img" width={700} height={700} />
        </div>
        {authModal.isOpen && <AuthModal />}
      </div>
    </div>
  );
};
export default AuthPage;
