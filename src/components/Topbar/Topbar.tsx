import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useSetRecoilState } from "recoil";
import { auth, firestore } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

import { authModalState } from "@/atoms/authModalAtom";
import Logout from "../Buttons/Logout";
import { BsList } from "react-icons/bs";
import Timer from "../Timer/Timer";
import { useRouter } from "next/router";
import { DBProblem } from "@/utils/types/problem";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

type TopbarProps = {
  problemPage?: boolean;
};

const Topbar: React.FC<TopbarProps> = ({ problemPage }) => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const { pid } = useRouter().query;
  const setAuth = useSetRecoilState(authModalState);

  const handleClick = async (isForward: boolean) => {
    const direction = isForward ? 1 : -1;
    const problemRef = doc(firestore, 'problems', pid as string);
    const problemSnap = await getDoc(problemRef);
  
    if (problemSnap.exists()) {
      const { order } = problemSnap.data() as DBProblem;
      const maxOrder = 5;
      let newOrder = order + direction;
  
      if (newOrder > maxOrder) {
        newOrder = 1;
      } else if (newOrder < 1) {
        newOrder = maxOrder;
      }
  
      const q = query(
        collection(firestore, "problems"),
        where("order", "==", newOrder)
      );
      const querySnap = await getDocs(q);
      const nextProblem = querySnap.docs[0].data() as DBProblem;
      router.push(`/problems/${nextProblem.id}`);
    }
  };
  

  return (
    <nav className="relative shrink-0 flex h-[50px] items-center w-full bg-dark-layer-1 text-dark-gray-7 px-5 py-8">
      <div className={`flex w-full items-center justify-between ${ problemPage ? "" : "max-w-[1200px] mx-auto" }`}>
        <Link href="/" className="h-6 flex-1">
          <Image
            src="/logo-full.png"
            alt="logo"
            height={100}
            width={100}
          />
        </Link>

        {problemPage && (
          <div className="md:flex flex-1 gap-4 items-center justify-center hidden">
            <div 
              className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer"
              onClick={() => handleClick(false)}
            >
              <FaChevronLeft />
            </div>
            <Link href='/' className="flex items-center justify-center gap-2 font-medium max-w-[170px] text-dark-gray-8 cursor-pointer">
              <div>
                <BsList />
              </div>
                <p>Problems List</p>
            </Link>
            <div 
              className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer"
              onClick={() => handleClick(true)}
            >
              <FaChevronRight />
            </div>
          </div>
        )}

        <div className="flex flex-1 space-x-4 items-center justify-end">
          <div>
            <Link
              href="/"
              target="_blank"
              rel="moreferrer"
              className="bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange hover:bg-dark-fill-2"
            >
              Premium
            </Link>
          </div>
          {!user && (
            <Link href="/auth" onClick={() => {
              setAuth((prev) => ({isOpen: true, type: 'login'}))
            }}>
              <button className="bg-dark-fill-3 hover:bg-dark-fill-2 px-2 py-1 cursor-pointer rounded">
                Sign In
              </button>
            </Link>
          )}
          {user && problemPage && <Timer />}
          {user && (
            <div className="cursor-pointer group relative">
              <Image
                src="/avatar.png"
                alt="Avatar"
                width={30}
                height={30}
                className="rounded-full"
              />
              <div className="absolute top-10 left-2/4 -translate-x-2/4  mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg z-40 group-hover:scale-100 scale-0 transition-all duration-300 ease-in-out">
                <p className="text-sm">{user.email}</p>
              </div>
            </div>
          )}
          {user && <Logout /> }
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
