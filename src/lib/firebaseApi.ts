import { calculateGhostCoreSensitivity } from '../ghostcore/calculator';
import { 
  getGlobalTheme, 
  getDevices, 
  getWeapons, 
  getMarketplaceProducts, 
  getCommunityPosts, 
  getUserProfile, 
  updateUserProfile,
  addDevice,
  addCommunityPost,
  editCommunityPost,
  deleteCommunityPost,
  addPostComment,
  likePost,
  addMarketplaceProduct,
  editMarketplaceProduct,
  deleteMarketplaceProduct,
  getHUDLayouts,
  saveHUDLayout,
  deleteHUDLayout,
  getGiveaways,
  joinGiveaway,
  addGiveaway,
  updateGiveaway,
  claimDailyStreak,
  claimMission,
  incrementMissionProgress,
  getNotifications,
  markNotificationRead,
  getLeaderboard,
  activateVendorToken,
  generateVendorToken,
  getVendorTokens,
  applyVendor,
  getVendorApplications,
  approveVendorApplication,
  submitIssue,
  getIssues,
  getPresets,
  savePreset,
  analyzeIssueInFirestore,
  getAds,
  saveAdsList,
  getAdminPayouts,
  getAdminLogs,
  logAdminActivity,
  findUserByEmailOrUsername,
  findUidByEmail,
  updateWeaponsLastSync,
  deletePreset,
  deleteGiveaway,
  deleteIssue,
  getFeedbackList,
  submitFeedbackComment,
  updatePayoutStatus,
  adminUpdateUserStatus,
  adminOverrideUser,
  adminDeleteUser,
  adminGetAllUsers,
  getSettingsDoc,
  updateSettingsDoc,
  deleteDevice,
  addWeapon,
  deleteWeapon
} from './dbService';

class MockResponse {
  ok: boolean;
  status: number;
  private data: any;

  constructor(ok: boolean, status: number, data: any) {
    this.ok = ok;
    this.status = status;
    this.data = data;
  }

  async json() {
    return this.data;
  }
}

export const firebaseApi = {
  request: async (path: string, options?: any): Promise<MockResponse> => {
    // Clean path by stripping leading/trailing slashes and query params
    const cleanPath = path.replace(/^\/+|\/+$/g, '').split('?')[0];
    const segments = cleanPath.split('/');
    const method = (options?.method || 'GET').toUpperCase();
    const body = options?.body ? JSON.parse(options.body) : null;

    try {
      // === GLOBAL THEME ===
      if (cleanPath === 'global-theme') {
        const theme = await getGlobalTheme();
        return new MockResponse(true, 200, theme);
      }

      // === GENERAL SETTINGS ===
      if (segments[0] === 'settings' && segments[1]) {
        const key = segments[1];
        if (method === 'GET') {
          const docData = await getSettingsDoc(key);
          return new MockResponse(true, 200, docData);
        }
        if (method === 'POST' || method === 'PUT') {
          const ok = await updateSettingsDoc(key, body);
          return new MockResponse(ok, ok ? 200 : 400, { success: ok });
        }
      }

      // === DEVICES ===
      if (cleanPath === 'devices') {
        if (method === 'GET') {
          const list = await getDevices();
          return new MockResponse(true, 200, list);
        }
        if (method === 'POST') {
          const added = await addDevice(body);
          return new MockResponse(true, 200, added);
        }
      }
      if (segments[0] === 'devices' && segments[1]) {
        const id = segments[1];
        if (method === 'DELETE') {
          const success = await deleteDevice(id);
          return new MockResponse(success, success ? 200 : 400, { success });
        }
      }

      // === WEAPONS ===
      if (cleanPath === 'weapons') {
        if (method === 'GET') {
          const list = await getWeapons();
          return new MockResponse(true, 200, list);
        }
        if (method === 'POST') {
          const added = await addWeapon(body);
          return new MockResponse(true, 200, added);
        }
      }
      if (segments[0] === 'weapons' && segments[1]) {
        const id = segments[1];
        if (method === 'DELETE') {
          const success = await deleteWeapon(id);
          return new MockResponse(success, success ? 200 : 400, { success });
        }
      }
      if (cleanPath === 'weapons/sync') {
        await updateWeaponsLastSync();
        return new MockResponse(true, 200, { success: true });
      }

      // === MARKETPLACE ===
      if (cleanPath === 'marketplace') {
        if (method === 'GET') {
          const list = await getMarketplaceProducts();
          return new MockResponse(true, 200, list);
        }
        if (method === 'POST') {
          const added = await addMarketplaceProduct(body);
          return new MockResponse(true, 200, { success: true, product: added });
        }
      }
      if (segments[0] === 'marketplace' && segments[1]) {
        const id = segments[1];
        if (method === 'PUT') {
          const updated = await editMarketplaceProduct(id, body);
          return new MockResponse(true, 200, { success: true, product: updated });
        }
        if (method === 'DELETE') {
          await deleteMarketplaceProduct(id);
          return new MockResponse(true, 200, { success: true });
        }
      }

      // === COMMUNITY POSTS ===
      if (cleanPath === 'posts') {
        if (method === 'GET') {
          const list = await getCommunityPosts();
          return new MockResponse(true, 200, list);
        }
        if (method === 'POST') {
          const added = await addCommunityPost(body);
          return new MockResponse(true, 200, { success: true, post: added });
        }
      }
      if (segments[0] === 'posts' && segments[1]) {
        const id = segments[1];
        if (segments[2] === 'comments') {
          const updatedPost = await addPostComment(id, body);
          return new MockResponse(true, 200, updatedPost);
        }
        if (segments[2] === 'like') {
          const updatedPost = await likePost(id);
          return new MockResponse(true, 200, updatedPost);
        }
        if (method === 'PUT') {
          const updated = await editCommunityPost(id, body);
          return new MockResponse(true, 200, { success: true, post: updated });
        }
        if (method === 'DELETE') {
          await deleteCommunityPost(id);
          return new MockResponse(true, 200, { success: true });
        }
      }

      // === USER AUTH PROFILE SYNC ===
      if (segments[0] === 'user' && segments[1]) {
        const identifier = decodeURIComponent(segments[1]);
        
        if (segments[2] === 'missions') {
          const user = await findUserByEmailOrUsername(identifier);
          if (user) {
            return new MockResponse(true, 200, user.missionProgress || {});
          }
          return new MockResponse(true, 200, {});
        }

        // Standard user lookup (by email or username)
        const user = await findUserByEmailOrUsername(identifier);
        if (user) {
          return new MockResponse(true, 200, user);
        }
        return new MockResponse(false, 404, { error: 'Gamer profile not found' });
      }

      if (cleanPath === 'auth/update') {
        const email = body.email;
        const uid = await findUidByEmail(email);
        if (uid) {
          const updated = await updateUserProfile(uid, body);
          return new MockResponse(true, 200, { success: true, user: updated });
        }
        return new MockResponse(false, 404, { error: 'Profile not found' });
      }

      if (cleanPath === 'user/bookmark') {
        const { email, type, id } = body;
        const uid = await findUidByEmail(email);
        if (uid) {
          const user = await getUserProfile(uid);
          if (user) {
            const field = type === 'preset' ? 'bookmarkedPresets' : 'bookmarkedProducts';
            const currentList = user[field] || [];
            const isBookmarked = currentList.includes(id);
            
            const updatedList = isBookmarked 
              ? currentList.filter((x: string) => x !== id)
              : [...currentList, id];

            const updated = await updateUserProfile(uid, { [field]: updatedList });
            return new MockResponse(true, 200, { success: true, user: updated });
          }
        }
        return new MockResponse(false, 404, { error: 'User not found' });
      }

      // === HUD LAYOUTS ===
      if (cleanPath === 'hud/save') {
        const layouts = await saveHUDLayout(body.email, body);
        return new MockResponse(true, 200, { success: true, layouts });
      }
      if (cleanPath === 'hud/delete') {
        const layouts = await deleteHUDLayout(body.email, body.id);
        return new MockResponse(true, 200, { success: true, layouts });
      }
      if (segments[0] === 'hud' && segments[1] === 'list') {
        const email = decodeURIComponent(segments[2]);
        const layouts = await getHUDLayouts(email);
        return new MockResponse(true, 200, layouts);
      }

      // === DAILY STREAK & MISSIONS ===
      if (cleanPath === 'user/claim-daily') {
        const uid = await findUidByEmail(body.email);
        if (uid) {
          const updated = await claimDailyStreak(uid);
          return new MockResponse(true, 200, { success: true, user: updated });
        }
        return new MockResponse(false, 404, { error: 'Gamer not found' });
      }

      if (cleanPath === 'user/missions/claim') {
        const uid = await findUidByEmail(body.email);
        if (uid) {
          const updated = await claimMission(uid, body.missionId);
          return new MockResponse(true, 200, { success: true, user: updated });
        }
        return new MockResponse(false, 404, { error: 'Gamer not found' });
      }

      if (cleanPath === 'user/missions/progress') {
        const uid = await findUidByEmail(body.email);
        if (uid) {
          const updated = await incrementMissionProgress(uid, body.missionId);
          return new MockResponse(true, 200, { success: true, user: updated });
        }
        return new MockResponse(false, 404, { error: 'Gamer not found' });
      }

      // === VENDOR & PARTNERSHIPS ===
      if (cleanPath === 'user/activate-vendor-token') {
        const uid = await findUidByEmail(body.email);
        if (uid) {
          const result = await activateVendorToken(uid, body.token);
          return new MockResponse(result.success, result.success ? 200 : 400, result);
        }
        return new MockResponse(false, 404, { error: 'Gamer not found' });
      }

      if (cleanPath === 'vendor/apply') {
        const uid = await findUidByEmail(body.email);
        if (uid) {
          const app = await applyVendor(uid, body);
          return new MockResponse(true, 200, { success: true, application: app });
        }
        return new MockResponse(false, 404, { error: 'Gamer not found' });
      }

      // === PRESETS AND CALIBRATION RECOMMEND ENGINE ===
      if (cleanPath === 'presets') {
        if (method === 'GET') {
          const list = await getPresets();
          return new MockResponse(true, 200, list);
        }
        if (method === 'POST') {
          const added = await savePreset(body);
          return new MockResponse(true, 200, { success: true, preset: added });
        }
      }
      if (segments[0] === 'presets' && segments[1]) {
        const id = segments[1];
        if (method === 'DELETE') {
          await deletePreset(id);
          return new MockResponse(true, 200, { success: true });
        }
      }

      if (cleanPath === 'recommend') {
        let user = null;
        let uid = null;
        if (body?.email) {
          uid = await findUidByEmail(body.email);
          if (uid) {
            user = await getUserProfile(uid);
          }
        }

        const sensitivity = calculateGhostCoreSensitivity({
          ...body,
          email: body?.email || user?.email || '',
          userRole: user?.role || '',
          isPremium: user?.isPremium || false
        });

        if (uid && user) {
          const recs = user.savedRecommendations || [];
          recs.unshift({ id: sensitivity.id, input: body, sensitivity, timestamp: new Date().toISOString() });
          await updateUserProfile(uid, { savedRecommendations: recs });
        }

        return new MockResponse(true, 200, { success: true, sensitivity, ...sensitivity });
      }

      if (segments[0] === 'recommend' && segments[1] === 'history') {
        const email = decodeURIComponent(segments[2]);
        const user = await findUserByEmailOrUsername(email);
        if (user) {
          return new MockResponse(true, 200, user.savedRecommendations || []);
        }
        return new MockResponse(true, 200, []);
      }

      // === PUBLIC PROFILES ===
      if (segments[0] === 'public-profile') {
        const identifier = decodeURIComponent(segments[1]);
        const user = await findUserByEmailOrUsername(identifier);

        if (!user) {
          return new MockResponse(false, 404, { error: 'Tactical profile not found.' });
        }

        if (!user.isProfilePublic) {
          return new MockResponse(false, 403, { error: 'This configuration profile is set to private by the owner.' });
        }

        return new MockResponse(true, 200, user);
      }

      if (cleanPath === 'public-profile/clone') {
        const uid = await findUidByEmail(body.email);
        if (uid) {
          const user = await getUserProfile(uid);
          if (user) {
            const recs = user.savedRecommendations || [];
            recs.unshift({
              id: 'rec-' + Date.now(),
              input: { brand: body.data.deviceBrand || 'Generic', model: body.data.deviceModel || 'Device' } as any,
              sensitivity: body.data.sensitivity || body.data,
              timestamp: new Date().toISOString()
            });
            const updated = await updateUserProfile(uid, { savedRecommendations: recs });
            return new MockResponse(true, 200, { success: true, user: updated });
          }
        }
        return new MockResponse(false, 404, { error: 'Gamer not found' });
      }

      // === NOTIFICATIONS ===
      if (cleanPath === 'notifications') {
        const email = options?.email || body?.email || '';
        const list = await getNotifications(email);
        return new MockResponse(true, 200, list);
      }
      if (cleanPath === 'notifications/read') {
        await markNotificationRead(body.id);
        return new MockResponse(true, 200, { success: true });
      }

      // === GIVEAWAYS ===
      if (cleanPath === 'giveaways') {
        if (method === 'GET') {
          const list = await getGiveaways();
          return new MockResponse(true, 200, list);
        }
        if (method === 'POST') {
          const added = await addGiveaway(body);
          return new MockResponse(true, 200, added);
        }
      }
      if (segments[0] === 'giveaways' && segments[1]) {
        const id = segments[1];
        if (segments[2] === 'join') {
          const updated = await joinGiveaway(id, body.email);
          return new MockResponse(true, 200, { success: true, giveaway: updated });
        }
        if (method === 'PUT') {
          const updated = await updateGiveaway(id, body);
          return new MockResponse(true, 200, updated);
        }
        if (method === 'DELETE') {
          await deleteGiveaway(id);
          return new MockResponse(true, 200, { success: true });
        }
      }

      // === LEADERBOARD ===
      if (cleanPath === 'leaderboard') {
        const board = await getLeaderboard();
        return new MockResponse(true, 200, board);
      }

      // === SUPPORT ISSUES ===
      if (cleanPath === 'issues') {
        if (method === 'GET') {
          const list = await getIssues();
          return new MockResponse(true, 200, list);
        }
        if (method === 'POST') {
          const payload = await submitIssue(body.email, body.content);
          return new MockResponse(true, 200, { success: true, issue: payload });
        }
      }
      if (cleanPath === 'issues/analyze') {
        const updated = await analyzeIssueInFirestore(body.id);
        return new MockResponse(true, 200, { success: true, issue: updated });
      }
      if (segments[0] === 'issues' && segments[1] && method === 'DELETE') {
        await deleteIssue(segments[1]);
        return new MockResponse(true, 200, { success: true });
      }

      // === ADS ===
      if (cleanPath === 'ads') {
        const list = await getAds();
        return new MockResponse(true, 200, list);
      }
      if (cleanPath === 'ads/record-view') {
        const ads = await getAds();
        const updated = ads.map((ad: any) => 
          ad.id === body.adId 
            ? { ...ad, views: (ad.views || 0) + 1 } 
            : ad
        );
        await saveAdsList(updated);
        return new MockResponse(true, 200, { success: true });
      }

      // === GAME FEEDBACK (EsportsPipeline) ===
      if (cleanPath === 'game-feedback') {
        if (method === 'GET') {
          const feedback = await getFeedbackList();
          return new MockResponse(true, 200, feedback);
        }
        if (method === 'POST') {
          const payload = await submitFeedbackComment(body);
          return new MockResponse(true, 200, { success: true, feedback: payload });
        }
      }

      // === ADMINISTRATOR WORKSPACE ===
      if (cleanPath === 'admin/payouts') {
        const payouts = await getAdminPayouts();
        return new MockResponse(true, 200, payouts);
      }
      if (segments[0] === 'admin' && segments[1] === 'payouts' && segments[3] === 'status') {
        const payoutId = segments[2];
        const success = await updatePayoutStatus(payoutId, body.status, body.payoutRef, body.payoutDetails, body.adminEmail);
        if (success) {
          return new MockResponse(true, 200, { success: true });
        }
        return new MockResponse(false, 404, { error: 'Payout not found' });
      }

      if (cleanPath === 'admin/vendor-applications') {
        const apps = await getVendorApplications();
        return new MockResponse(true, 200, apps);
      }
      if (segments[0] === 'admin' && segments[1] === 'vendor-applications' && segments[3] === 'status') {
        const appId = segments[2];
        if (body.status === 'Approved') {
          await approveVendorApplication(appId);
        } else {
          await updateVendorApplicationStatusDirect(appId, body.status);
        }
        return new MockResponse(true, 200, { success: true });
      }

      if (cleanPath === 'admin/vendor-tokens') {
        const tokens = await getVendorTokens();
        return new MockResponse(true, 200, tokens);
      }
      if (cleanPath === 'admin/generate-vendor-token') {
        const res = await generateVendorToken(body.adminEmail || 'ghostfirehub@gmail.com');
        return new MockResponse(true, 200, res);
      }

      if (cleanPath === 'admin/ads/generate-ai') {
        const mockAd = {
          id: 'ad-' + Date.now(),
          company: body.brandName || "Premium Gamer Sponsor",
          text: `Calibrate your drag metrics with ${body.brandName || 'Sponsor'}. Unleash ultra precision now!`,
          link: "https://ghostfirehub-1289a.web.app",
          budget: 100,
          views: 0
        };
        const ads = await getAds();
        await saveAdsList([...ads, mockAd]);
        return new MockResponse(true, 200, { success: true, ad: mockAd });
      }
      if (segments[0] === 'admin' && segments[1] === 'ads' && segments[2] && method === 'DELETE') {
        const adId = segments[2];
        const ads = await getAds();
        await saveAdsList(ads.filter((a: any) => a.id !== adId));
        return new MockResponse(true, 200, { success: true });
      }

      if (segments[0] === 'admin' && segments[1] === 'users') {
        const users = await adminGetAllUsers();
        return new MockResponse(true, 200, users);
      }
      if (segments[0] === 'admin' && segments[1] === 'users' && segments[3] === 'status') {
        const targetEmail = decodeURIComponent(segments[2]);
        const success = await adminUpdateUserStatus(targetEmail, body.isBanned);
        return new MockResponse(success, success ? 200 : 404, { success });
      }
      if (segments[0] === 'admin' && segments[1] === 'users' && segments[3] === 'override') {
        const targetEmail = decodeURIComponent(segments[2]);
        const success = await adminOverrideUser(targetEmail, body);
        return new MockResponse(success, success ? 200 : 404, { success });
      }
      if (segments[0] === 'admin' && segments[1] === 'users' && segments[2] && method === 'DELETE') {
        const targetEmail = decodeURIComponent(segments[2]);
        const success = await adminDeleteUser(targetEmail);
        return new MockResponse(success, success ? 200 : 404, { success });
      }

      if (cleanPath === 'admin/logs') {
        const logs = await getAdminLogs();
        return new MockResponse(true, 200, logs);
      }

      // === FALLBACK DEFAULT ===
      console.warn(`Unmapped emulated route: ${method} ${cleanPath}`);
      return new MockResponse(true, 200, {});

    } catch (err: any) {
      console.error(`Firebase Emulated API error on ${method} ${path}:`, err);
      return new MockResponse(false, 500, { error: err.message || 'Internal Emulated Server Error' });
    }
  }
};

// Helper for rejected applications without direct firebase call here
async function updateVendorApplicationStatusDirect(appId: string, status: string) {
  try {
    await adminOverrideUser(appId, { vendorStatus: 'rejected' });
  } catch (e) {
    console.warn("Direct vendor rejection fail:", e);
  }
}
