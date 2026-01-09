import React, { useState, useEffect } from 'react';
import { PageWrapper } from './PageWrapper';
import { GroupPage } from '../components/GroupPage';
import { Icon, Button, Card, Avatar, Loader, Toast, CreateGroupModal, JoinByInviteModal } from '../components';
import * as FirestoreService from '../services/firestoreService';
import type { UserProfile, Group } from '../types';

// --- COMMUNITY COMPONENTS ---
const GroupList: React.FC<{ userProfile: UserProfile | null, onSelectGroup: (g: Group) => void }> = ({ userProfile, onSelectGroup }) => {
    const [activeTab, setActiveTab] = useState<'explore' | 'my_groups'>('explore');
    const [publicGroups, setPublicGroups] = useState<Group[]>([]);
    const [ownedGroups, setOwnedGroups] = useState<Group[]>([]);
    const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [search, setSearch] = useState('');
    const [toastMsg, setToastMsg] = useState('');

    // Always fetch owned groups to get counts for Create Modal
    useEffect(() => {
        if (userProfile) {
            const unsubOwned = FirestoreService.getGroupsForOwner(userProfile.uid, (loaded) => {
                setOwnedGroups(loaded);
            });
            return () => unsubOwned();
        }
    }, [userProfile]);

    useEffect(() => {
        if (activeTab === 'explore') {
            if (publicGroups.length === 0) setLoading(true);
            const unsubscribe = FirestoreService.getPublicGroups((loaded) => {
                setPublicGroups(loaded);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'my_groups' && userProfile) {
            if (joinedGroups.length === 0) setLoading(true);
            // Owned groups already fetched by the other effect, but we need joined groups
            const unsubJoined = FirestoreService.getGroupsForUser(userProfile.uid, (loaded) => {
                const filtered = loaded.filter(g => g.ownerUid !== userProfile.uid);
                setJoinedGroups(filtered);
                setLoading(false);
            });
            return () => unsubJoined();
        }
    }, [activeTab, userProfile]);

    const handleCreateGroup = async (data: any) => {
        if (!userProfile) return;
        try {
            await FirestoreService.createGroup({
                ...data,
                ownerUid: userProfile.uid,
                ownerEmail: userProfile.email || 'guest',
                avatarUrl: 'community'
            });
            setShowCreate(false);
            setActiveTab('my_groups');
            setToastMsg('Group created successfully! 🎉');
        } catch (e: any) {
            alert(e.message || 'Failed to create group');
        }
    };

    const handleJoinByCode = async (code: string, password?: string) => {
        if (!userProfile) return;
        try {
            const result = await FirestoreService.joinGroupByInviteCodeAndPassword(code, password || '', { uid: userProfile.uid, email: userProfile.email || 'guest' });

            if (result.success) {
                setToastMsg('Joined group successfully! 🚀');
                setShowJoinModal(false);
                setActiveTab('my_groups');
            } else {
                alert(result.error || 'Failed to join.');
            }
        } catch (e) { alert('Error joining.'); }
    };

    const renderGroupCard = (g: Group, isOwned: boolean = false) => (
        <Card key={g.id} className="hover:border-sky-500 cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg" onClick={() => onSelectGroup(g)}>
            <div className="relative p-4">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar avatar={g.avatarUrl || 'community'} className="h-14 w-14 rounded-xl border-4 border-white dark:border-[#111625] shadow-md bg-white dark:bg-gray-800" />
                    <div className="flex-grow">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg leading-none line-clamp-1">{g.name}</h3>
                            {g.isPrivate && <Icon name="lock" className="h-3 w-3 text-amber-500" />}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                            {isOwned ? <span className="text-sky-500 font-bold">Owner</span> : <span>{g.members?.length || 0} Members</span>}
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 px-4 pb-4">{g.description}</p>
        </Card>
    );

    const filteredPublic = publicGroups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.description?.toLowerCase().includes(search.toLowerCase()));

    // Calculate counts for limits
    const publicCount = ownedGroups.filter(g => g.type === 'public' || (!g.type && !g.isPrivate)).length;
    const privateCount = ownedGroups.filter(g => g.type === 'private' || (!g.type && g.isPrivate)).length;

    return (
        <div className="space-y-6">
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div><h2 className="text-3xl font-bold">Community</h2><p className="text-gray-500">Join elite trading groups.</p></div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button onClick={() => setShowJoinModal(true)} variant="secondary"><Icon name="plus" /> Join via Code</Button>
                    <Button onClick={() => setShowCreate(true)}><Icon name="plus" /> Create</Button>
                </div>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button className={`px-6 py-3 font-bold text-sm border-b-2 ${activeTab === 'explore' ? 'border-sky-500 text-sky-500' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('explore')}>Explore</button>
                <button className={`px-6 py-3 font-bold text-sm border-b-2 ${activeTab === 'my_groups' ? 'border-sky-500 text-sky-500' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('my_groups')}>My Groups</button>
            </div>

            {loading ? <Loader text="Loading..." /> : (
                <>
                    {activeTab === 'explore' && (
                        <>
                            <div className="relative mb-6">
                                <Icon name="search" className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search communities..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-[#111625] border border-gray-200 dark:border-gray-800 focus:border-sky-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {filteredPublic.map(g => renderGroupCard(g, userProfile?.uid === g.ownerUid))}
                            </div>
                        </>
                    )}
                    {activeTab === 'my_groups' && (
                        <div className="space-y-8">
                            {ownedGroups.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Icon name="star" className="h-5 w-5 text-amber-500" />
                                        Groups You Own
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {ownedGroups.map(g => renderGroupCard(g, true))}
                                    </div>
                                </div>
                            )}
                            {joinedGroups.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold mb-4">Groups You Joined</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {joinedGroups.map(g => renderGroupCard(g, false))}
                                    </div>
                                </div>
                            )}
                            {ownedGroups.length === 0 && joinedGroups.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <Icon name="community" className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                    <p>You haven't joined any groups yet.</p>
                                    <p className="text-sm mt-2">Create your own or explore public groups!</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
            {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreate={handleCreateGroup} publicCount={publicCount} privateCount={privateCount} />}
            {showJoinModal && <JoinByInviteModal onClose={() => setShowJoinModal(false)} onJoin={handleJoinByCode} />}
        </div>
    );
};

export const CommunityPage: React.FC<{ initialGroupId?: string, userProfile?: UserProfile }> = ({ initialGroupId, userProfile }) => {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    if (selectedGroup) return <PageWrapper><GroupPage group={selectedGroup} userProfile={userProfile || null} onBack={() => setSelectedGroup(null)} /></PageWrapper>;
    return <PageWrapper><GroupList userProfile={userProfile || null} onSelectGroup={setSelectedGroup} /></PageWrapper>;
};

export default CommunityPage;
