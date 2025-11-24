import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon, Modal } from '../components';
import type { UserProfile } from '../types';

// Import preset avatars
import preset01 from './profile-presets/preset-01.png';
import preset02 from './profile-presets/preset-02.png';
import preset03 from './profile-presets/preset-03.png';
import preset04 from './profile-presets/preset-04.png';
import preset05 from './profile-presets/preset-05.png';
import preset06 from './profile-presets/preset-06.png';
import preset07 from './profile-presets/preset-07.png';
import preset08 from './profile-presets/preset-08.png';
import preset09 from './profile-presets/preset-09.png';
import preset10 from './profile-presets/preset-10.png';
import preset11 from './profile-presets/preset-11.png';
import preset12 from './profile-presets/preset-12.png';
import preset13 from './profile-presets/preset-13.png';
import preset14 from './profile-presets/preset-14.png';
import preset15 from './profile-presets/preset-15.png';
import preset16 from './profile-presets/preset-16.png';
import preset17 from './profile-presets/preset-17.png';
import preset18 from './profile-presets/preset-18.png';
import preset19 from './profile-presets/preset-19.png';
import preset20 from './profile-presets/preset-20.png';

const PRESET_AVATARS = [
    preset01, preset02, preset03, preset04, preset05,
    preset06, preset07, preset08, preset09, preset10,
    preset11, preset12, preset13, preset14, preset15,
    preset16, preset17, preset18, preset19, preset20
];

interface ProfileAvatarPickerProps {
    userProfile: UserProfile;
    onAvatarChange: (avatarUrl: string) => Promise<void>;
    onClose: () => void;
}

export const ProfileAvatarPicker: React.FC<ProfileAvatarPickerProps> = ({
    userProfile,
    onAvatarChange,
    onClose
}) => {
    const [error, setError] = useState<string | null>(null);

    const handlePresetSelect = async (presetUrl: string) => {
        try {
            await onAvatarChange(presetUrl);
            onClose();
        } catch (err) {
            console.error('Error selecting preset:', err);
            setError('Failed to update avatar. Please try again.');
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Choose Avatar</h2>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Preset Avatars Grid */}
                <div className="grid grid-cols-5 gap-3 max-h-[400px] overflow-y-auto p-2">
                    {PRESET_AVATARS.map((preset, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handlePresetSelect(preset)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all ${userProfile.avatar === preset
                                ? 'border-sky-500 ring-2 ring-sky-500 ring-offset-2 ring-offset-white dark:ring-offset-[#111625]'
                                : 'border-gray-200 dark:border-gray-700 hover:border-sky-400'
                                }`}
                        >
                            <img
                                src={preset}
                                alt={`Preset ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {userProfile.avatar === preset && (
                                <div className="absolute inset-0 bg-sky-500/20 flex items-center justify-center">
                                    <Icon name="check" className="h-6 w-6 text-white drop-shadow-lg" />
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>
        </Modal>
    );
};
