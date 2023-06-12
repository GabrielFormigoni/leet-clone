import React, { useEffect, useState } from 'react';
import { AiOutlineFullscreen, AiOutlineFullscreenExit, AiOutlineSetting } from 'react-icons/ai';
import { ISettings } from '../Playground';
import SettingsModal from '@/components/Modals/SettingsModal';

type PreferenceNavProps = {
    settings: ISettings;
    setSettings: React.Dispatch<React.SetStateAction<ISettings>>;
};

const PreferenceNav:React.FC<PreferenceNavProps> = ({ settings, setSettings }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);

	const handleFullScreen = () => {
		if (isFullScreen) {
			document.exitFullscreen();
		} else {
			document.documentElement.requestFullscreen();
		}
		setIsFullScreen(!isFullScreen);
	};

    const toggleSettings = () => {
        setSettings({ ...settings, modalIsOpen: !settings.modalIsOpen });
    }

	useEffect(() => {
		function exitHandler(e: any) {
			if (!document.fullscreenElement) {
				setIsFullScreen(false);
				return;
			}
			setIsFullScreen(true);
		}

		if (document.addEventListener) {
			document.addEventListener("fullscreenchange", exitHandler);
			document.addEventListener("webkitfullscreenchange", exitHandler);
			document.addEventListener("mozfullscreenchange", exitHandler);
			document.addEventListener("MSFullscreenChange", exitHandler);
		}
	}, [isFullScreen]);
  

    return (
        <div className='flex justify-between items-center bg-dark-layer-2 h-11 w-full px-2'>

            {/* Language Preference */}
            <div className='flex items-center justify-center bg-dark-fill-3 px-3 py-1.5 text-sm text-white hover:bg-dark-fill-2 cursor-pointer rounded-md'>
                JavaScript
            </div>

            {/* Settings */}
            <div className='flex items-center'>
                <button className='preferenceBtn group' onClick={toggleSettings}>
					<div className='h-4 w-4 text-dark-gray-6 font-bold text-lg'>
						<AiOutlineSetting />
					</div>
					<div className='preferenceBtn-tooltip'>Settings</div>
				</button>

				<button className='preferenceBtn group'>
					<div className='h-4 w-4 text-dark-gray-6 font-bold text-lg' onClick={handleFullScreen}>
						{!isFullScreen ? <AiOutlineFullscreen /> : <AiOutlineFullscreenExit />}
					</div>
					<div className='preferenceBtn-tooltip'>Full Screen</div>
				</button>
            </div>

            {settings.modalIsOpen && <SettingsModal settings={settings} setSettings={setSettings} />}
        </div>
    )
}

export default PreferenceNav;