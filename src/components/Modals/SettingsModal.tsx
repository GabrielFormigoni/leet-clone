import React, { useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { ISettings } from "../Workspace/Playground/Playground";

type SettingsModalProps = {
  settings: ISettings;
  setSettings: React.Dispatch<React.SetStateAction<ISettings>>;
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  setSettings,
}) => {
  const closeModal = useCloseModal(settings, setSettings);

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({ ...settings, fontSize: e.target.value });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40"
    >
      <div className="bg-dark-layer-2 p-4 rounded-lg text-white w-[450px]">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl">Settings</h1>
          <AiOutlineClose
            className="cursor-pointer text-2xl"
            onClick={closeModal}
          />
        </div>
        <div className="flex justify-between items-center mt-10">
          <label htmlFor="fontSizeSelect" className="block mb-2 font-bold">
            Font Size          
          </label>
          <select
            id="fontSizeSelect"
            className="border border-gray-300 rounded px-2 py-1 mb-4 text-black outline-none"
            value={settings.fontSize}
            onChange={handleFontSizeChange}
          >
            <option value="12px">12px</option>
            <option value="13px">13px</option>
            <option value="14px">14px</option>
            <option value="15px">15px</option>
            <option value="16px">16px</option>
            <option value="17px">17px</option>
            <option value="18px">18px</option>
            <option value="19px">19px</option>
            <option value="20px">20px</option>
          </select>
        </div>
        <div className="text-sm font-medium text-gray-300">
            Choose the font size for the editor.
        </div>
      </div>
    </div>
  );
};

function useCloseModal(
  settings: ISettings,
  setSettings: React.Dispatch<React.SetStateAction<ISettings>>
) {
  const closeModal = () => {
    setSettings({ ...settings, modalIsOpen: false });
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return closeModal;
}

export default SettingsModal;
