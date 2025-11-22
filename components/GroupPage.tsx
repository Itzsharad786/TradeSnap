import React, { useState, useEffect, useRef } from 'react';
import { Icon, Button, Avatar, Modal, Loader, Tabs } from '../components';
import * as FirestoreService from '../services/firestoreService';
import * as StorageService from '../services/storageService';
import type { Group, GroupChatMessage, UserProfile } from '../types';

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

    const isOwner = userProfile?.uid === group.ownerUid;
    const isMember = group.members?.some(m => m.uid === userProfile?.uid);

    // Load Messages
    useEffect(() => {
        const unsubscribe = FirestoreService.getGroupMessages(group.id, (msgs) => {
            setMessages(msgs);
        });
        return () => unsubscribe();
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

        setUploading(true);
        try {
            const url = await StorageService.uploadGroupImage(file, `groups/${group.id}/${Date.now()}_${file.name}`);
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

    const handleJoin = async () => {
        if (!userProfile) return;
        // For private groups, this might fail if rules prevent update without being owner.
        // But we added a rule for public groups.
        // For private groups, we need a password check or invite code flow.
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

    return (
        <div className="h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <Icon name="arrowLeft" className="h-5 w-5" />
                    </button>
                    <Avatar avatar={group.avatarUrl || 'community'} className="h-10 w-10 rounded-lg" />
                    <div>
                        <h2 className="font-bold text-xl flex items-center gap-2">
                            {group.name}
                            {group.isPrivate && <Icon name="lock" className="h-4 w-4 text-amber-500" />}
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
                                                <img src={msg.mediaUrl} className="rounded-lg max-w-full cursor-pointer hover:opacity-90" onClick={() => window.open(msg.mediaUrl, '_blank')} />
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
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="p-4 overflow-y-auto h-full">
                        <h3 className="font-bold mb-4">Members ({group.members?.length || 0})</h3>
                        <div className="space-y-2">
                            {group.members?.map((m, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                            {m.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{m.email.split('@')[0]}</div>
                                            <div className="text-xs text-gray-500">Joined {new Date(m.joinedAt).toLocaleDateString()}</div>
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

                {activeTab === 'info' && (
                    <div className="p-6 overflow-y-auto h-full">
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Description</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{group.description}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Invite Link</h3>
                            <div className="flex gap-2">
                                <code className="flex-grow bg-black/10 dark:bg-black/30 p-3 rounded-lg font-mono text-sm select-all">
                                    https://tradesnap-live.netlify.app/community/join?code={group.inviteCode}
                                </code>
                                <Button onClick={() => { navigator.clipboard.writeText(`https://tradesnap-live.netlify.app/community/join?code=${group.inviteCode}`); alert('Copied!') }}>
                                    Copy
                                </Button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500">Created</div>
                                    <div className="font-bold">{group.createdAt?.toDate ? group.createdAt.toDate().toLocaleDateString() : 'Recently'}</div>
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500">Privacy</div>
                                    <div className="font-bold">{group.isPrivate ? 'Private' : 'Public'}</div>
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
                        <Button variant="danger" className="w-full" onClick={handleDeleteGroup}>Delete Group</Button>
                        <p className="text-xs text-gray-500 text-center">Only the owner can delete this group.</p>
                    </div>
                </Modal>
            )}
        </div>
    );
};
