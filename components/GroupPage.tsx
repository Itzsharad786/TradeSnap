import React, { useState, useEffect, useRef } from 'react';
import { Icon, Button, Avatar, Modal, Loader, Tabs, Toast } from '../components';
import * as FirestoreService from '../services/firestoreService';
import * as StorageService from '../services/storageService';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../services/firebase';
import type { Group, GroupChatMessage, UserProfile, GroupMember } from '../types';

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
    const [members, setMembers] = useState<GroupMember[]>(group.members || []);
    const [toastMsg, setToastMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const isOwner = userProfile?.uid === group.ownerUid;
    const isMember = group.members?.some(m => m.uid === userProfile?.uid);

    const inviteLink = `https://tradesnap.pages.dev/join?code=${group.inviteCode}`;
    const shareText = `Join my trading group "${group.name}" on Tradesnap! Use code: ${group.inviteCode}`;

    // Load Messages
    useEffect(() => {
        const unsubscribe = FirestoreService.getGroupMessages(group.id, (msgs) => {
            // Sort pinned messages to top
            const sorted = [...msgs].sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return a.timestamp - b.timestamp;
            });
            setMessages(sorted);
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
            setToastMsg('Banner updated!');
        } catch (e) {
            console.error(e);
            alert('Failed to upload banner');
        }
    };

    const handleJoin = async () => {
        if (!userProfile) return;
        if (group.isPrivate && !isOwner) {
            const pwd = prompt("Enter Group Password:");
            // Note: This is a client-side check against the hash if available, or server check
            // For now, we use the service which handles it
            const res = await FirestoreService.joinGroupByInviteCodeAndPassword(group.inviteCode, pwd || '', userProfile);
            if (res.success) {
                setToastMsg("Joined!");
            } else {
                alert(res.error || "Failed to join");
            }
            return;
        }

        try {
            await FirestoreService.joinGroup(group.id, { uid: userProfile.uid, email: userProfile.email || 'guest' });
            setToastMsg("Joined!");
        } catch (e) {
            console.error(e);
            alert("Failed to join.");
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
        setToastMsg(`${label} copied — share it!`);
    };

    const handlePinMessage = async (msgId: string, isPinned: boolean) => {
        if (!isOwner) return;
        await FirestoreService.pinMessage(group.id, msgId, isPinned);
    };

    const handleDeleteMessage = async (msgId: string) => {
        if (!isOwner) return;
        if (!confirm("Delete this message?")) return;
        await FirestoreService.deleteMessage(group.id, msgId);
    };

    const shareToSocial = (platform: 'whatsapp' | 'telegram' | 'instagram') => {
        const text = encodeURIComponent(shareText + "\n" + inviteLink);
        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${text}`, '_blank');
        } else if (platform === 'telegram') {
            window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`, '_blank');
        } else if (platform === 'instagram') {
            copyToClipboard(shareText + "\n" + inviteLink, "Caption");
            alert("Instagram doesn't support direct web sharing. Caption copied to clipboard!");
        }
    };

    return (
        <div className="h-[85vh] flex flex-col relative">
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-4 pt-4 px-2">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <Icon name="arrowLeft" className="h-6 w-6" />
                </button>
            </div>

            {/* Header Info */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-800 px-2">
                <div className="flex items-center gap-3">
                    <Avatar avatar={group.avatarUrl || 'community'} className="h-12 w-12 rounded-xl border-2 border-white dark:border-gray-800 shadow-sm" />
                    <div>
                        <h2 className="font-bold text-xl flex items-center gap-2">
                            {group.name}
                            {group.isPrivate && <Icon name="lock" className="h-4 w-4 text-amber-500" />}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{members.length} members</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="flex items-center gap-1">
                                <Icon name="profile" className="h-3 w-3" />
                                Owner: {members.find(m => m.uid === group.ownerUid)?.username || 'Unknown'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isMember && (
                        <Button onClick={handleJoin} className="bg-sky-600 text-white shadow-sky-500/20">Join Group</Button>
                    )}
                    {isOwner && (
                        <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors">
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
            <div className="flex-grow overflow-hidden relative mt-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                {activeTab === 'chat' && (
                    <div className="h-full flex flex-col">
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-400 py-10">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            )}
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex gap-3 ${msg.authorId === userProfile?.uid ? 'flex-row-reverse' : ''} group/msg`}>
                                    <Avatar avatar={msg.authorAvatar} className="h-8 w-8 mt-1 rounded-full" />
                                    <div className={`max-w-[75%] ${msg.authorId === userProfile?.uid ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-gray-500">{msg.authorName}</span>
                                            {msg.isPinned && <Icon name="spark" className="h-3 w-3 text-amber-500" />}
                                            <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className={`p-3 rounded-2xl relative group-hover/msg:shadow-md transition-shadow ${msg.authorId === userProfile?.uid
                                            ? 'bg-sky-500 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none'
                                            } ${msg.isPinned ? 'ring-2 ring-amber-500/50' : ''}`}>
                                            {msg.type === 'text' && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                                            {msg.type === 'image' && (
                                                <img
                                                    src={msg.mediaUrl}
                                                    className="rounded-lg max-w-full max-h-64 cursor-pointer hover:opacity-90"
                                                    onClick={() => window.open(msg.mediaUrl, '_blank')}
                                                    alt="Shared image"
                                                />
                                            )}
                                        </div>

                                        {/* Message Actions */}
                                        {isOwner && (
                                            <div className="flex gap-2 mt-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                                <button onClick={() => handlePinMessage(msg.id, !msg.isPinned)} className="text-[10px] text-gray-400 hover:text-amber-500">
                                                    {msg.isPinned ? 'Unpin' : 'Pin'}
                                                </button>
                                                <button onClick={() => handleDeleteMessage(msg.id)} className="text-[10px] text-gray-400 hover:text-red-500">
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        {isMember ? (
                            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2 items-center">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-400 hover:text-sky-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                                    disabled={uploading}
                                >
                                    <Icon name="upload" className="h-5 w-5" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />

                                <input
                                    value={msgText}
                                    onChange={e => setMsgText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-grow bg-gray-100 dark:bg-gray-800 border-0 rounded-full px-4 py-3 focus:ring-2 ring-sky-500 outline-none transition-all"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!msgText.trim()}
                                    className="rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-none"
                                >
                                    <Icon name="send" className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 bg-gray-100 dark:bg-gray-800">
                                <p className="text-sm">You must join this group to chat.</p>
                                <Button onClick={handleJoin} className="mt-2 text-xs" variant="secondary">Join Now</Button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="p-4 overflow-y-auto h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Members</h3>
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{members.length}</span>
                        </div>
                        <div className="space-y-2">
                            {members.map((m, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-sky-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar avatar={m.avatar || 'trader-1'} className="h-10 w-10 rounded-full" />
                                            {m.isOnline && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm flex items-center gap-2">
                                                {m.username || m.email.split('@')[0]}
                                                {m.uid === group.ownerUid && <Icon name="badge" className="h-3 w-3 text-amber-500" />}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {m.isOnline ? <span className="text-emerald-500 font-bold">Online</span> : `Last seen ${m.lastSeen ? new Date(m.lastSeen.seconds * 1000).toLocaleDateString() : 'recently'}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-400 font-mono">Joined</div>
                                        <div className="text-xs font-medium">{new Date(m.joinedAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'share' && (
                    <div className="p-6 overflow-y-auto h-full flex flex-col items-center">
                        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 text-center">
                            <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Icon name="community" className="h-10 w-10" />
                            </div>

                            <h3 className="text-2xl font-bold mb-2">Invite Friends</h3>
                            <p className="text-gray-500 mb-8">Share this code to let others join your group.</p>

                            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-800">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Join Code</p>
                                <div className="text-4xl font-black font-mono tracking-widest text-sky-500 select-all">
                                    {group.inviteCode}
                                </div>
                            </div>

                            <Button
                                onClick={() => copyToClipboard(group.inviteCode, 'Code')}
                                className="w-full py-4 text-lg mb-6 shadow-sky-500/20"
                            >
                                <Icon name="copy" className="mr-2" />
                                Copy Code
                            </Button>

                            <div className="grid grid-cols-3 gap-4">
                                <button onClick={() => shareToSocial('whatsapp')} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white"><Icon name="send" className="h-5 w-5" /></div>
                                    <span className="text-xs font-medium">WhatsApp</span>
                                </button>
                                <button onClick={() => shareToSocial('telegram')} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="w-10 h-10 bg-[#0088cc] rounded-full flex items-center justify-center text-white"><Icon name="send" className="h-5 w-5" /></div>
                                    <span className="text-xs font-medium">Telegram</span>
                                </button>
                                <button onClick={() => shareToSocial('instagram')} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="w-10 h-10 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-full flex items-center justify-center text-white"><Icon name="profile" className="h-5 w-5" /></div>
                                    <span className="text-xs font-medium">Instagram</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="p-6 overflow-y-auto h-full">


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[100px]">
                                    {group.description || "No description provided."}
                                </p>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Details</h3>
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                                        <div className="p-3 flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Type</span>
                                            <span className="font-bold flex items-center gap-2">
                                                <Icon name={group.isPrivate ? 'lock' : 'globe'} className="h-4 w-4" />
                                                {group.isPrivate ? 'Private' : 'Public'}
                                            </span>
                                        </div>
                                        <div className="p-3 flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Created</span>
                                            <span className="font-bold">{group.createdAt?.toDate ? group.createdAt.toDate().toLocaleDateString() : 'Recently'}</span>
                                        </div>
                                        <div className="p-3 flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Owner</span>
                                            <span className="font-bold text-sky-500">{members.find(m => m.uid === group.ownerUid)?.username || 'Unknown'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showSettings && (
                <Modal onClose={() => setShowSettings(false)}>
                    <h2 className="text-xl font-bold mb-4">Group Settings</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/50">
                            <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h4>
                            <p className="text-sm text-red-500/80 mb-4">Deleting a group cannot be undone. All messages and media will be lost.</p>
                            <Button variant="danger" className="w-full" onClick={handleDeleteGroup}>Delete Group</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
