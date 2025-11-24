import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '../firebase/index';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Icon, Button, Modal } from '../components';
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



const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
    const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('upload');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadTaskRef = useRef<any>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('File size must be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!fileInputRef.current?.files?.[0] || !userProfile.uid) return;

        const file = fileInputRef.current.files[0];
        setUploading(true);
        setError(null);

        try {
            // Create storage reference
            const timestamp = Date.now();
            const storageRef = ref(storage, `avatars/users/${userProfile.uid}/avatar-${timestamp}.webp`);

            // Upload file
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTaskRef.current = uploadTask;

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error('Upload error:', error);
                    setError('Upload failed. Please try again.');
                    setUploading(false);
                },
                async () => {
                    // Upload completed successfully
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    await onAvatarChange(downloadURL);
                    setUploading(false);
                    setPreviewUrl(null);
                    setUploadProgress(0);
                    onClose();
                }
            );
        } catch (err) {
            console.error('Upload error:', err);
            setError('Upload failed. Please try again.');
            setUploading(false);
        }
    };

    const handleCancelUpload = () => {
        if (uploadTaskRef.current) {
            uploadTaskRef.current.cancel();
            uploadTaskRef.current = null;
        }
        setUploading(false);
        setUploadProgress(0);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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
                <h2 className="text-2xl font-bold">Customize Profile</h2>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'upload'
                            ? 'border-sky-500 text-sky-500'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Upload
                    </button>
                    <button
                        onClick={() => setActiveTab('presets')}
                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'presets'
                            ? 'border-sky-500 text-sky-500'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Presets
                    </button>
                </div>

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

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'upload' && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {/* Current Avatar Preview */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <img
                                        src={previewUrl || userProfile.avatar}
                                        alt="Avatar preview"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                                    />
                                    {uploading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                            <div className="text-white text-sm font-bold">
                                                {Math.round(uploadProgress)}%
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* File Input */}
                            <div>
                                <label
                                    htmlFor="avatar-upload"
                                    className="block w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center cursor-pointer hover:border-sky-500 dark:hover:border-sky-400 transition-colors"
                                >
                                    <Icon name="upload" className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Click to select image (max 5MB)
                                    </span>
                                    <input
                                        ref={fileInputRef}
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Upload Progress */}
                            {uploading && (
                                <div className="space-y-2">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress}%` }}
                                            className="h-full bg-sky-500"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelUpload}
                                        className="w-full"
                                    >
                                        Cancel Upload
                                    </Button>
                                </div>
                            )}

                            {/* Upload Button */}
                            {previewUrl && !uploading && (
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleUpload}
                                        className="flex-1"
                                    >
                                        Upload Avatar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelUpload}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'presets' && (
                        <motion.div
                            key="presets"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
};
