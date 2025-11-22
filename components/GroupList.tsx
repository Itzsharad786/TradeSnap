import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon, Card, Button, Loader, Modal, CreateGroupModal } from '../components';
import * as FirestoreService from '../services/firestoreService';
import type { Group, UserProfile } from '../types';

interface GroupListProps {
    userProfile: UserProfile | null;
    onSelectGroup: (group: Group) => void;
}

export const GroupList: React.FC<GroupListProps> = ({ userProfile, onSelectGroup }) => {
    const [activeTab, setActiveTab] = useState<'explore' | 'my_groups'>('explore');
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        setLoading(true);
        let unsubscribe: () => void;

        if (activeTab === 'explore') {
            unsubscribe = FirestoreService.getPublicGroups((loaded) => {
                setGroups(loaded);
                setLoading(false);
            });
        } else {
            if (userProfile) {
                // Fetch owned groups for now, as per service limitation. 
                // Ideally we fetch groups where user is a member.
                // We can filter client side if we fetch all public? No.
                // We'll use the getUserOwnedGroups for now and maybe expand later.
                unsubscribe = FirestoreService.getUserOwnedGroups(userProfile.uid, (loaded) => {
                    setGroups(loaded);
                    setLoading(false);
                });
            } else {
                setGroups([]);
                setLoading(false);
            }
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [activeTab, userProfile]);

    const handleCreateGroup = async (data: any) => {
        if (!userProfile) return;
        try {
            const newGroupData = {
                ...data,
                ownerUid: userProfile.uid,
                ownerEmail: userProfile.email || 'guest',
                members: [{ uid: userProfile.uid, email: userProfile.email || 'guest', joinedAt: new Date().toISOString() }]
            };
            await FirestoreService.createGroup(newGroupData);
            setShowCreate(false);
            setActiveTab('my_groups');
        } catch (e) {
            console.error(e);
            alert('Failed to create group');
        }
    };

    const handleJoinByCode = async () => {
        if (!userProfile || !joinCode) return;
        setJoining(true);
        try {
            const groupId = await FirestoreService.joinGroupByInviteCode(joinCode, { uid: userProfile.uid, email: userProfile.email || 'guest' });
            if (groupId) {
                alert('Joined successfully!');
                setJoinCode('');
                // Ideally navigate to group
            } else {
                alert('Invalid code or group not found.');
            }
        } catch (e) {
            console.error(e);
            alert('Error joining group.');
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold">Community</h2>
                    <p className="text-gray-500">Join elite trading groups or create your own.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <input
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value)}
                            placeholder="Enter Invite Code"
                            className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-40 focus:ring-2 ring-sky-500 outline-none"
                        />
                        <button
                            onClick={handleJoinByCode}
                            disabled={!joinCode || joining}
                            className="absolute right-1 top-1 bottom-1 px-2 bg-sky-500 text-white rounded text-xs font-bold disabled:opacity-50"
                        >
                            {joining ? '...' : 'Join'}
                        </button>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Icon name="plus" /> Create Group
                    </Button>
                </div>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                    className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'explore' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('explore')}
                >
                    Explore
                </button>
                <button
                    className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'my_groups' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('my_groups')}
                >
                    My Groups
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center"><Loader text="Loading groups..." /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <Icon name="community" className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No groups found in this section.</p>
                        </div>
                    )}
                    {groups.map(group => (
                        <Card key={group.id} className="hover:border-sky-500 cursor-pointer group relative overflow-hidden" onClick={() => onSelectGroup(group)}>
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-sky-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        {group.avatarUrl ? (
                                            <img src={group.avatarUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Icon name="community" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{group.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            {group.isPrivate ? (
                                                <span className="flex items-center gap-1 text-amber-500"><Icon name="lock" className="h-3 w-3" /> Private</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-emerald-500"><Icon name="globe" className="h-3 w-3" /> Public</span>
                                            )}
                                            <span>•</span>
                                            <span>{group.members?.length || 0} Members</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                                {group.description}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="text-xs text-gray-400">
                                    Created by {group.ownerEmail?.split('@')[0] || 'Unknown'}
                                </div>
                                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:underline">View Group →</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreate={handleCreateGroup} />}
        </div>
    );
};
