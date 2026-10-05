export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface SavedCropItem {
  id: string;
  userId: string;
  thumbnailDataUrl: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
}

interface StoredUserRecord extends User {
  passwordHash: string; // In temporary database, stored hashed/encoded
}

const STORAGE_USERS_KEY = 'magicstudio_temp_users_v1';
const STORAGE_SESSION_KEY = 'magicstudio_temp_session_v1';
const STORAGE_CROPS_KEY = 'magicstudio_temp_crops_v1';

// Seed demo users if empty
function initializeSeedData(): void {
  if (typeof window === 'undefined') return;

  const existing = localStorage.getItem(STORAGE_USERS_KEY);
  if (!existing) {
    const demoUser: StoredUserRecord = {
      id: 'usr_alex_101',
      name: 'Alex Morgan',
      email: 'alex.morgan@magicstudio.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
      createdAt: new Date().toISOString(),
      passwordHash: btoa('magic123'),
    };
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify([demoUser]));
  }
}

// Simple base64 encoding for temporary database credentials
function hashPassword(pwd: string): string {
  try {
    return btoa(pwd);
  } catch {
    return pwd;
  }
}

function getStoredUsers(): StoredUserRecord[] {
  initializeSeedData();
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse temporary database users:', e);
    return [];
  }
}

function saveStoredUsers(users: StoredUserRecord[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to write to temporary database:', e);
  }
}

export const TempAuthDatabase = {
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  signUp(name: string, email: string, password: string): { success: boolean; user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters).' };
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const users = getStoredUsers();
    const alreadyExists = users.some((u) => u.email.toLowerCase() === cleanEmail);

    if (alreadyExists) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    // Generate random avatar color / placeholder
    const initials = cleanName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newUser: StoredUserRecord = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=18181b&color=ffffff&bold=true`,
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(password),
    };

    users.push(newUser);
    saveStoredUsers(users);

    const publicUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt,
    };

    // Auto set session
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(publicUser));

    return { success: true, user: publicUser };
  },

  login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!matched) {
      return { success: false, error: 'No account found with this email. Please check or sign up.' };
    }

    if (matched.passwordHash !== hashPassword(password)) {
      return { success: false, error: 'Incorrect password. Please verify your credentials and try again.' };
    }

    const publicUser: User = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      avatarUrl: matched.avatarUrl,
      createdAt: matched.createdAt,
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(publicUser));
    return { success: true, user: publicUser };
  },

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_SESSION_KEY);
  },

  saveCrop(crop: Omit<SavedCropItem, 'id' | 'createdAt'>): SavedCropItem {
    const item: SavedCropItem = {
      ...crop,
      id: `crop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem(STORAGE_CROPS_KEY);
      const list: SavedCropItem[] = raw ? JSON.parse(raw) : [];
      list.unshift(item);
      // Keep up to 20 recent crops in temporary database
      localStorage.setItem(STORAGE_CROPS_KEY, JSON.stringify(list.slice(0, 20)));
    } catch (e) {
      console.error('Failed to save crop to temporary database:', e);
    }

    return item;
  },

  getUserCrops(userId: string): SavedCropItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_CROPS_KEY);
      if (!raw) return [];
      const list: SavedCropItem[] = JSON.parse(raw);
      return list.filter((c) => c.userId === userId);
    } catch {
      return [];
    }
  },

  deleteCrop(cropId: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_CROPS_KEY);
      if (!raw) return;
      const list: SavedCropItem[] = JSON.parse(raw);
      const filtered = list.filter((c) => c.id !== cropId);
      localStorage.setItem(STORAGE_CROPS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete crop from temporary database:', e);
    }
  },
};
