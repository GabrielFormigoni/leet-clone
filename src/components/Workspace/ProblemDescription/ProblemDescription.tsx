import React, { useEffect, useState } from "react";

import { AiFillCheckCircle, AiFillDislike, AiFillLike, AiFillStar } from "react-icons/ai";

import { auth, firestore } from "@/firebase/firebase";
import { arrayRemove, arrayUnion, doc, getDoc, runTransaction, setDoc, updateDoc } from "firebase/firestore";

import { DBProblem, Problem } from "@/utils/types/problem";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

type ProblemDescriptionProps = {
  problem: Problem;
  _solved: boolean;
  setSolved: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ problem, _solved, setSolved }) => {
  const [user] = useAuthState(auth);
  const [updating, setUpdating] = useState(false);
  const { currentProblem, loading, problemDifficulty, setCurrentProblem } = useGetCurrentProblem(problem.id);
  const { liked, disliked, solved, starred, setData } = useGetUsersDataOnProblem(problem.id);

  const handleLike = async () => {
    if(!user) {
      toast.error("You need to be logged in to like a problem", {theme: "dark", position: "top-left"});
      return;
    }
    if(updating) return;
    setUpdating(true);
    // If the user has already liked, disliked the problem, or neither
    await runTransaction(firestore, async (transaction) => {
      const userRef = doc(firestore, "users", user.uid);
      const problemRef = doc(firestore, "problems", problem.id);

      const userDoc = await transaction.get(userRef);
      const problemDoc = await transaction.get(problemRef);

      if(userDoc.exists() && problemDoc.exists()) {
        if(liked){
          // If the user has already liked the problem, remove problem id and decrement likes
          transaction.update(userRef, {
            likedProblems: userDoc.data()?.likedProblems.filter((id: string) => id !== problem.id),
          });
          transaction.update(problemRef, {
            likes: problemDoc.data()?.likes - 1,
          });
          setCurrentProblem((prev) => prev ? {...prev, likes: prev.likes - 1} : null);
          setData((prev) => ({...prev, liked: false}));
        } else if(disliked) {
          transaction.update(userRef, {
            likedProblems: [...userDoc.data()?.likedProblems, problem.id],
            dislikedProblems: userDoc.data()?.dislikedProblems.filter((id: string) => id !== problem.id),
          });
          transaction.update(problemRef, {
            likes: problemDoc.data()?.likes + 1,
            dislikes: problemDoc.data()?.dislikes - 1,
          });
          setCurrentProblem((prev) => prev ? {...prev, dislikes: prev.dislikes - 1, likes: prev.likes + 1} : null);
          setData((prev) => ({...prev, liked: true, disliked: false}));
        } else {
          transaction.update(userRef, {
            likedProblems: [...userDoc.data()?.likedProblems, problem.id],
          });
          transaction.update(problemRef, {
            likes: problemDoc.data()?.likes + 1,
          });
          setCurrentProblem((prev) => prev ? {...prev, likes: prev.likes + 1} : null);
          setData((prev) => ({...prev, liked: true}));
        }
      }
    });
    setUpdating(false);
  }

  const handleDislike = async () => {
    if(!user) {
      toast.error("You need to be logged in to dislike a problem", {theme: "dark", position: "top-left"});
      return;
    }

    if(updating) return;
    setUpdating(true);
    // If the user has already disliked, liked the problem, or neither
    await runTransaction(firestore, async (transaction) => {
      const userRef = doc(firestore, "users", user.uid);
      const problemRef = doc(firestore, "problems", problem.id);

      const userDoc = await transaction.get(userRef);
      const problemDoc = await transaction.get(problemRef);

      if(userDoc.exists() && problemDoc.exists()) {

        // If the user has already disliked the problem, remove problem id and decrement dislikes
        if(disliked){
          transaction.update(userRef, {
            dislikedProblems: userDoc.data()?.dislikedProblems.filter((id: string) => id !== problem.id),
          });
          transaction.update(problemRef, {
            dislikes: problemDoc.data()?.dislikes - 1,
          });
          setCurrentProblem((prev) => prev ? {...prev, dislikes: prev.dislikes - 1} : null);
          setData((prev) => ({...prev, disliked: false}));
        } else if(liked) {
          transaction.update(userRef, {
            dislikedProblems: [...userDoc.data()?.dislikedProblems, problem.id],
            likedProblems: userDoc.data()?.likedProblems.filter((id: string) => id !== problem.id),
          });
          transaction.update(problemRef, {
            dislikes: problemDoc.data()?.dislikes + 1,
            likes: problemDoc.data()?.likes - 1,
          });
          setCurrentProblem((prev) => prev ? {...prev, dislikes: prev.dislikes + 1, likes: prev.likes - 1} : null);
          setData((prev) => ({...prev, disliked: true, liked: false}));
        } else {
          transaction.update(userRef, {
            dislikedProblems: [...userDoc.data()?.dislikedProblems, problem.id],
          });
          transaction.update(problemRef, {
            dislikes: problemDoc.data()?.dislikes + 1,
          });
          setCurrentProblem((prev) => prev ? {...prev, dislikes: prev.dislikes + 1} : null);
          setData((prev) => ({...prev, disliked: true}));
        }
      }
      setUpdating(false);
    });
  }

  const handleStarproblem = async () => { 
    
    if(!user) {
      toast.error("You need to be logged in to star a problem", {theme: "dark", position: "top-left"});
      return;
    }

    if(updating) return;
    setUpdating(true);

    
    // if problem is starred, star problem
    if(starred) {
      const usersRef = doc(firestore, "users", user.uid);
      await updateDoc(usersRef, {
        starredProblems: arrayRemove(problem.id)
      });
      setData((prev) => ({...prev, starred: false}));
    } else {
      const usersRef = doc(firestore, "users", user.uid);
      await updateDoc(usersRef, {
        starredProblems: arrayUnion(problem.id)
      });
      setData((prev) => ({...prev, starred: true}));
    }

    setUpdating(false);
  }

  const handleSolveproblem = async () => { 
    
    if(!user) {
      toast.error("You need to be logged in to set a problem to solved.", {theme: "dark", position: "top-left"});
      return;
    }

    if(updating) return;
    setUpdating(true);

    
    // if problem is starred, star problem
    if(solved || _solved) {
      const usersRef = doc(firestore, "users", user.uid);
      await updateDoc(usersRef, {
        solvedProblems: arrayRemove(problem.id)
      });
      setData((prev) => ({...prev, solved: false}));
      setSolved(false);
    } else {
      const usersRef = doc(firestore, "users", user.uid);
      await updateDoc(usersRef, {
        solvedProblems: arrayUnion(problem.id)
      });
      setData((prev) => ({...prev, solved: true}));
    }

    setUpdating(false);
  }

  return (
    <div className="bg-dark-layer-1">
      <div className="flex h-11 w-full items-center pt-2 bg-dark-layer-2 text-white overflow-x-hidden">
        <div className="bg-dark-layer-1 rounded-t-[5px] px-5 py-[10px] text-xs cursor-pointer">
          Description
        </div>
      </div>
      <div className="flex flex-col px-0 py-4 h-[calc(100vh-108px)] overflow-y-auto">
        <div className="px-5">
          {/* Problem Title */}
          <h1 className="text-white text-lg font-medium">{problem.title}</h1>

          {/* Problem options */}
          {!loading && currentProblem && (
            <div className="flex items-center gap-4 mt-2">
              <div className={`${problemDifficulty} inline-block rounded-xl bg-opacity-[.15] px-2.5 py-1 text-xs font-medium capitalize`}>
                {currentProblem?.difficulty}
              </div>
              <div 
                className="rounded p-[3px] text-lg transition-colors duration-200 text-dark-gray-6 hover:bg-dark-fill-3 cursor-pointer"
                onClick={handleSolveproblem}
              >
                {(solved || _solved) && !updating ? <AiFillCheckCircle className="text-dark-green-s"/> : !solved && !updating ? <AiFillCheckCircle /> : <ClipLoader size={20} color={"#10b981"} />}
              </div>
              <div 
                className="flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px] text-lg transition-colors duration-200 text-dark-gray-6"
                onClick={handleLike}
              >
                {liked && !updating ? <AiFillLike className="text-dark-blue-s"/> : !liked && !updating ? <AiFillLike /> : <ClipLoader size={20} color={"#3b82f6"} />}
                {!updating && <span className="text-xs">{currentProblem?.likes}</span>}
              </div>
              <div 
                className="flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px] text-lg transition-colors duration-200 text-dark-gray-6"
                onClick={handleDislike}  
              >
                {disliked && !updating ? <AiFillDislike className="text-[#f87171]"/> : !disliked && !updating ? <AiFillDislike /> : <ClipLoader size={20} color={"#f87171"} />}
                {!updating && <span className="text-xs">{currentProblem?.dislikes}</span>}
              </div>
              <div 
                className="flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px] text-lg transition-colors duration-200 text-dark-gray-6"
                onClick={handleStarproblem}
              >
                {starred && !updating ? <AiFillStar className="text-dark-yellow"/> : !starred && !updating ? <AiFillStar /> : <ClipLoader size={20} color={"#fbbf24"} />}
              </div>
            </div>
          )}

          {/* Problem options while loading*/}
          {loading && (
            <div className="animate-pulse w-full">
              <div className="flex items-center gap-4 mt-2">
                <div className="w-12 h-6 rounded-full bg-dark-fill-3" />
                <div className="w-6 h-6 rounded-full bg-dark-fill-3" />
                <div className="w-12 h-6 rounded-full bg-dark-fill-3" />
                <div className="w-12 h-6 rounded-full bg-dark-fill-3" />
                <div className="w-6 h-6 rounded-full bg-dark-fill-3" />
              </div>
            </div>
          )}

          {/* Problem Description */}
          <div className="text-white font-normal mt-5 text-sm">
            <div
              dangerouslySetInnerHTML={{ __html: problem.problemStatement }}
            />
          </div>

          {/* Examples */}
          <div className="mt-4">
            {problem.examples.map((example, index) => (
              <div key={example.id}>
                <p className="font-medium text-white ">
                  Example {index + 1}:
                </p>
                {example.img && (
                  <img className="mt-2" src={example.img} alt="image" />
                )}
                <div className="example-card">
                  <pre>
                    <strong className="text-white">Input: </strong>
                    {example.inputText}
                    <br />
                    <strong>Output: </strong>
                    {example.outputText}
                    <br />
                    {example.explanation && (
                      <div>
                        <strong>Explanation: </strong>
                        {example.explanation}
                      </div>
                    )}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {/* Constraints */}
          <div className="my-5">
            <div className="text-white text-sm font-medium">Constraints:</div>
            <ul className="text-white ml-5 list-disc">
              <div dangerouslySetInnerHTML={{ __html: problem.constraints }} />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

function useGetCurrentProblem(problemId: string) {
  const [currentProblem, setCurrentProblem] = useState<DBProblem | null>();
  const [loading, setLoading] = useState<boolean>(false);
  const [problemDifficulty, setProblemDifficulty] = useState<string>("");

  useEffect(() => {
    const getProblem = async () => {
      setLoading(true);
      const docRef = doc(firestore, "problems", problemId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCurrentProblem({ ...docSnap.data(), id: docSnap.id } as DBProblem);
        setProblemDifficulty(
          docSnap.data()?.difficulty === "Easy" ? "bg-olive text-olive" : docSnap.data()?.difficulty === "Medium" ? "bg-dark-yellow text-dark-yellow" : "bg-dark-pink text-dark-pink"
        );
      }
      setLoading(false);
    }

    getProblem();
  }, [problemId]);
  return { currentProblem, loading, problemDifficulty, setCurrentProblem };
}

function useGetUsersDataOnProblem(problemId: string) {
	const [data, setData] = useState({ liked: false, disliked: false, starred: false, solved: false });
	const [user] = useAuthState(auth);

	useEffect(() => {
		const getUsersDataOnProblem = async () => {
			const userRef = doc(firestore, "users", user!.uid);
			const userSnap = await getDoc(userRef);
			if (userSnap.exists()) {
				const data = userSnap.data();
				const { solvedProblems, likedProblems, dislikedProblems, starredProblems } = data;
				setData({
					liked: likedProblems.includes(problemId),
					disliked: dislikedProblems.includes(problemId),
					starred: starredProblems.includes(problemId),
					solved: solvedProblems.includes(problemId),
				});
			}
		};

		if (user) getUsersDataOnProblem();

		return () => setData({ liked: false, disliked: false, starred: false, solved: false });
	}, [problemId, user, setData]);

	return { ...data, setData };
}
export default ProblemDescription;
