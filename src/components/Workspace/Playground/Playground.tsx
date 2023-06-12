import React, { useEffect, useState } from "react";
import Split from "react-split";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";

import PreferenceNav from "./PreferenceNav/PreferenceNav";
import EditorFooter from "./EditorFooter";
import { Problem } from "@/utils/types/problem";
import { toast } from "react-toastify";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/firebase";
import { problems } from "@/utils/problems";
import { useRouter } from "next/router";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";

type PlaygroundProps = {
  problem: Problem;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSolved: React.Dispatch<React.SetStateAction<boolean>>;
};

export interface ISettings {
  fontSize: string;
  modalIsOpen: boolean;
  dropDownIsOpen: boolean;
};

const Playground: React.FC<PlaygroundProps> = ({ problem, setSuccess, setSolved }) => {
  const [caseIdx, setCaseIdx] = useState<number>(0)
  let [code, setCode] = useState<string>(problem.starterCode)
  const [settings, setSettings] = useState<ISettings>({
    fontSize: '16px',
    modalIsOpen: false,
    dropDownIsOpen: false,
  })

  const [ user ] = useAuthState(auth);
  const { pid } = useRouter().query;

  const handleSubmit = async () => {
    if(!user) {
      toast.error("You must be logged in to submit your code.", { position: "top-center", theme: "dark", autoClose: 3000 })
      return
    }

    try {
      code = code.slice(code.indexOf(problem.starterFunctionName));
			const cb = new Function(`return ${code}`)();
			const handler = problems[pid as string].handlerFunction;

			if (typeof handler === "function") {
				const success = handler(cb);
				if (success) {
					toast.success("Congrats! All tests passed!", {
						position: "top-center",
						autoClose: 3000,
						theme: "dark",
					});
					setSuccess(true);
					setTimeout(() => {
						setSuccess(false);
					}, 4000);

					const userRef = doc(firestore, "users", user.uid);
					await updateDoc(userRef, {
						solvedProblems: arrayUnion(pid),
					});
					setSolved(true);
				}
			}
		} catch (error: any) {
        if(error.message.startsWith("AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:")) {
          toast.error("Oops! At least one of the test cases failed. Please try again.", { position: "top-center", theme: "dark", autoClose: 3000 })
        } else {
          toast.error(error.message, { position: "top-center", theme: "dark", autoClose: 3000 })
        }

    }
  }

  const onChange = (value: string) => {
    setCode(value)
    localStorage.setItem(`code-${pid}`, JSON.stringify(value));
  };

  useEffect(() => {
		const code = localStorage.getItem(`code-${pid}`);
		if (user) {
			setCode(code ? JSON.parse(code) : problem.starterCode);
		} else {
			setCode(problem.starterCode);
		}
	}, [pid, user, problem.starterCode]);
  
  return (
    <div className="flex flex-col bg-dark-layer-1 relative overflow-hidden">
      <PreferenceNav settings={settings} setSettings={setSettings} />

      <Split
        className="h-[calc(100vh-108px)]"
        direction="vertical"
        sizes={[60, 40]}
        minSize={50}
      >
        <div className="w-full overflow-auto">
          <CodeMirror
            value={code}
            theme={vscodeDark}
            extensions={[javascript()]}
            style={{ fontSize: settings.fontSize }}
            onChange={onChange}
          />
        </div>
        <div className="h-full overflow-y-hidden">
          <div className="h-full mt-1 px-4 overflow-y-scroll">
            <p className="text-white text-lg font-medium">Testcases</p>
            <div className="mt-0.5 bg-white w-[75px] h-[3px] rounded-full" />

            <div className="flex gap-4 mt-2">
              {problem.examples.map((c, idx) => (
                <p key={idx} className={`bg-dark-fill-3 font-medium text-sm px-2 py-1 rounded-md cursor-pointer hover:bg-dark-fill-2 ${caseIdx === idx ? 'text-white' : 'text-gray-500'}`} onClick={() => setCaseIdx(idx)}>
                  Case {idx + 1}
                </p>
              ))}
            </div>

            {/*Test cases */}
            <div className="text-white mt-4 text-sm font-semibold">
              <p className="font-medium">Input:</p>
              <div className="bg-dark-fill-3 p-2 rounded-md mt-2">
                <p>{problem.examples[caseIdx].inputText}</p>
              </div>
              <p className="font-medium mt-2">Output:</p>
              <div className="bg-dark-fill-3 p-2 rounded-md mt-2">
                <p>{problem.examples[caseIdx].outputText}</p>
              </div>
              <div className="mt-16" />
            </div>
          </div>
        </div>
      </Split>
      <EditorFooter handleSubmit={handleSubmit}/>
    </div>
  );
};
export default Playground;
