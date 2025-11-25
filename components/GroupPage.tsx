import React, { useState, useEffect, useRef } from 'react';
import { Icon, Button, Avatar, Modal, Loader, Tabs } from '../components';
import * as FirestoreService from '../services/firestoreService';
import * as StorageService from '../services/storageService';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../services/firebase';
import type { Group, GroupChatMessage, UserProfile, GroupMember } from '../types';
import QRCode from 'qrcode';

interface GroupPageProps {
    group: Group;
    userProfile: UserProfile | null;
    onBack: () => void;
}

export const GroupPage: React.FC<GroupPageProps> = ({ group, userProfile, onBack }) => {
    const [activeTab, setActiveTab] = useState('chat');
    const [messages, setMessages] = useState<GroupChatMessage[]>([]);
    const [msgText, setMsgText] = useState('');
    const [uploading, setUploading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [bannerUrl, setBannerUrl] = useState(group.bannerUrl || '');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [members, setMembers] = useState<GroupMember[]>(group.members || []);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const isOwner = userProfile?.uid === group.ownerUid;
    const isMember = group.members?.some(m => m.uid === userProfile?.uid);

    const inviteLink = `https://tradesnap.pages.dev/join?code=${group.inviteCode}`;

    // Generate QR Code
    useEffect(() => {
        QRCode.toDataURL(inviteLink, { width: 300, margin: 2 })
            .then(setQrCodeUrl)
            .catch(console.error);
    }, [inviteLink]);

    // Load Messages
    useEffect(() => {
        const unsubscribe = FirestoreService.getGroupMessages(group.id, (msgs) => {
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [group.id]);

    // Load members with details
    useEffect(() => {
        FirestoreService.getGroupMembersWithDetails(group.id)
            .then(setMembers)
            .catch(console.error);
    }, [group.id]);

    const handleSendMessage = async () => {
        if (!msgText.trim() || !userProfile) return;
        try {
            await FirestoreService.sendMessageToGroup(group.id, {
                text: msgText,
                authorName: userProfile.name,
                authorAvatar: userProfile.avatar,
                authorId: userProfile.uid,
                type: 'text',
                reactions: {}
            });
            setMsgText('');
        } catch (e) {
            console.error(e);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userProfile) return;

        if (!file.type.startsWith('image/')) {
            alert('Only images are allowed');
            return;
        }

        setUploading(true);
        try {
            const messageId = Date.now().toString();
            const url = await StorageService.uploadGroupImage(file, `groups/${group.id}/media/${messageId}.jpg`);
            await FirestoreService.sendMessageToGroup(group.id, {
                text: 'Shared an image',
                authorName: userProfile.name,
                authorAvatar: userProfile.avatar,
                authorId: userProfile.uid,
                type: 'image',
                mediaUrl: url,
                reactions: {}
            });
        } catch (e) {
            console.error(e);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !isOwner) return;

        if (!file.type.startsWith('image/')) {
            alert('Only images are allowed');
            return;
        }

        try {
            const storageRef = ref(storage, `groups/${group.id}/banner.png`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            await FirestoreService.updateGroupBanner(group.id, url);
            setBannerUrl(url);
            alert('Banner updated!');
        } catch (e) {
            console.error(e);
            alert('Failed to upload banner');
        }
    };

    const handleJoin = async () => {
        if (!userProfile) return;
        if (group.isPrivate && !isOwner) {
            const pwd = prompt("Enter Group Password:");
            if (pwd !== group.password) {
                alert("Incorrect password");
                return;
            }
        }

        try {
            await FirestoreService.joinGroup(group.id, { uid: userProfile.uid, email: userProfile.email || 'guest' });
            alert("Joined!");
        } catch (e) {
            console.error(e);
            alert("Failed to join. If this is a private group, ask the owner for an invite.");
        }
    };

    const handleDeleteGroup = async () => {
        if (!confirm("Are you sure you want to delete this group? This cannot be undone.")) return;
        try {
            await FirestoreService.deleteGroup(group.id);
            onBack();
        } catch (e) {
            console.error(e);
            alert("Failed to delete group");
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        alert(`${label} copied!`);
    };

    return (
        <div className="h-[85vh] flex flex-col">
            {/* Banner */}
            {bannerUrl && (
                <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                    <img src={bannerUrl} alt="Group Banner" className="w-full h-full object-cover" />
                    {isOwner && (
                        <button
                            onClick={() => bannerInputRef.current?.click()}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all"
                        >
                            <Icon name="upload" className="h-4 w-4" />
                        </button>
                    )}
                    <input
                        ref={bannerInputRef}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleBannerUpload}
                    />
                </div>
            )}

            {!bannerUrl && isOwner && (
                <div
                    onClick={() => bannerInputRef.current?.click()}
                    className="w-full h-32 mb-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:border-sky-500 transition-colors"
                >
                    <div className="text-center text-gray-500">
                        <Icon name="image" className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Click to upload group banner</p>
                    </div>
                    <input
                        ref={bannerInputRef}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleBannerUpload}
                    />
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <Icon name="arrowLeft" className="h-5 w-5" />
                    </button>
                    <Avatar avatar={group.avatarUrl || 'community'} className="h-10 w-10 rounded-lg" />
                    <div>
                        <h2 className="font-bold text-xl flex items-center gap-2">
                            {group.name}
                            {group.isPrivate && <Icon name="lock" className="h-4 w-4 text-amber-500" />}
                            {isOwner && (
                                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase rounded">
                                    Owner
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-gray-500">{group.members?.length || 0} members</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isMember && (
                        <Button onClick={handleJoin} className="bg-sky-600 text-white">Join Group</Button>
                    )}
                    {isOwner && (
                        <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                            <Icon name="settings" />
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                active={activeTab}
                onChange={setActiveTab}
                tabs={[
                    { id: 'chat', label: 'Chat' },
                    { id: 'members', label: 'Members' },
                    { id: 'share', label: 'Share' },
                    { id: 'info', label: 'Info' }
                ]}
            />

            {/* Content */}
            <div className="flex-grow overflow-hidden relative mt-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                {activeTab === 'chat' && (
                    <div className="h-full flex flex-col">
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex gap-3 ${msg.authorId === userProfile?.uid ? 'flex-row-reverse' : ''}`}>
                                    <Avatar avatar={msg.authorAvatar} className="h-8 w-8 mt-1" />
                                    <div className={`max-w-[70%] ${msg.authorId === userProfile?.uid ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-gray-500">{msg.authorName}</span>
                                            <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div className={`p-3 rounded-2xl ${msg.authorId === userProfile?.uid ? 'bg-sky-500 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none'}`}>
                                            {msg.type === 'text' && <p className="text-sm">{msg.text}</p>}
                                            {msg.type === 'image' && (
                                                <img
                                                    src={msg.mediaUrl}
                                                    className="rounded-lg max-w-full max-h-64 cursor-pointer hover:opacity-90"
                                                    onClick={() => window.open(msg.mediaUrl, '_blank')}
                                                    alt="Shared image"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {isMember ? (
                            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2 items-center">
                                <label className="p-2 text-gray-400 hover:text-sky-500 cursor-pointer transition-colors">
                                    <Icon name="image" />
                                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                                <input
                                    value={msgText}
                                    onChange={e => setMsgText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-grow bg-gray-100 dark:bg-gray-800 border-0 rounded-full px-4 py-2 focus:ring-2 ring-sky-500 outline-none"
                                />
                                <Button onClick={handleSendMessage} disabled={!msgText.trim()} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                                    <Icon name="send" className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 bg-gray-100 dark:bg-gray-800">
                                You must join this group to chat.
                            </div>
                        )}

                        {/* Floating Share Media Button */}
                        {isMember && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-20 right-6 p-4 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg transition-all hover:scale-110"
                                disabled={uploading}
                            >
                                <Icon name="image" className="h-6 w-6" />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </button>
                        )}
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="p-4 overflow-y-auto h-full">
                        <h3 className="font-bold mb-4">Members ({members.length})</h3>
                        <div className="space-y-2">
                            {members.map((m, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar avatar={m.avatar || 'trader-1'} className="h-10 w-10 rounded-full" />
                                            {m.isOnline && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{m.username || m.email.split('@')[0]}</div>
                                            <div className="text-xs text-gray-500">
                                                {m.isOnline ? 'Online' : `Last seen ${m.lastSeen ? new Date(m.lastSeen.seconds * 1000).toLocaleDateString() : 'recently'}`}
                                            </div>
                                            <div className="text-xs text-gray-400">Joined {new Date(m.joinedAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    {m.uid === group.ownerUid && (
                                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase rounded">Owner</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'share' && (
                    <div className="p-6 overflow-y-auto h-full flex flex-col items-center justify-center">
                        <h3 className="text-2xl font-bold mb-6">Share Group</h3>

                        {/* QR Code */}
                        {qrCodeUrl && (
                            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                            </div>
                        )}

                        {/* Join Code */}
                        <div className="mb-6 text-center">
                            <p className="text-sm text-gray-500 mb-2">Join Code</p>
                            <p className="text-3xl font-bold font-mono tracking-wider text-sky-500">{group.inviteCode}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 w-full max-w-md">
                            <Button
                                onClick={() => copyToClipboard(group.inviteCode, 'Code')}
                                className="w-full bg-sky-500 hover:bg-sky-600 text-white"
                            >
                                <Icon name="copy" className="mr-2" />
                                Copy Code
                            </Button>
                            <Button
                                onClick={() => copyToClipboard(inviteLink, 'Link')}
                                variant="secondary"
                                className="w-full"
                            >
                                <Icon name="link" className="mr-2" />
                                Copy Full Link
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="p-6 overflow-y-auto h-full">
                        {/* Banner Preview */}
                        {bannerUrl && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Group Banner</h3>
                                <img src={bannerUrl} alt="Banner" className="w-full h-32 object-cover rounded-xl" />
                            </div>
                        )}

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Description</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{group.description}</p>
                        </div>

                        {/* Group Type */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Group Type</h3>
                            <div className="flex items-center gap-2">
                                <Icon name={group.isPrivate ? 'lock' : 'globe'} className="h-5 w-5 text-gray-500" />
                                <span className="font-bold">{group.isPrivate ? 'Private' : 'Public'}</span>
                            </div>
                        </div>

                        {/* Owner Info */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Owner</h3>
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <Avatar avatar={members.find(m => m.uid === group.ownerUid)?.avatar || 'trader-1'} className="h-10 w-10 rounded-full" />
                                <div>
                                    <div className="font-bold">{members.find(m => m.uid === group.ownerUid)?.username || group.ownerEmail.split('@')[0]}</div>
                                    <div className="text-xs text-gray-500">{group.ownerEmail}</div>
                                </div>
                            </div>
                        </div>

                        {/* Created At */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Created</h3>
                            <p className="font-bold">{group.createdAt?.toDate ? group.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}</p>
                        </div>

                        {/* Invite Code (Owner Only) */}
                        {isOwner && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Invite Code</h3>
                                <div className="flex gap-2">
                                    <code className="flex-grow bg-black/10 dark:bg-black/30 p-3 rounded-lg font-mono text-sm select-all">
                                        {group.inviteCode}
                                    </code>
                                    <Button onClick={() => copyToClipboard(group.inviteCode, 'Code')}>
                                        Copy
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Password (Private Groups, Owner Only) */}
                        {isOwner && group.isPrivate && group.password && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Password</h3>
                                <code className="block bg-black/10 dark:bg-black/30 p-3 rounded-lg font-mono text-sm">
                                    ••••••••
                                </code>
                                <p className="text-xs text-gray-500 mt-2">Password is hashed and cannot be displayed</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showSettings && (
                <Modal onClose={() => setShowSettings(false)}>
                    <h2 className="text-xl font-bold mb-4">Group Settings</h2>
                    <div className="space-y-4">
                        <Button variant="danger" className="w-full" onClick={handleDeleteGroup}>Delete Group</Button>
                        <p className="text-xs text-gray-500 text-center">Only the owner can delete this group.</p>
                    </div>
                </Modal>
            )}
        </div>
    );
};
