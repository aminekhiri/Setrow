import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../api/client';

// These will be replaced with actual Supabase credentials
const SUPABASE_URL = 'https://peljjcifiqtxzuibddmk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_n2RX-lEXtzyZTDGgd3bvIg_P7zjyLn5';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

export const useAuthStore = create((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                set({
                    user: session.user,
                    session,
                    isAuthenticated: true,
                    isLoading: false,
                });
                setAuthToken(session.access_token);
            } else {
                set({ isLoading: false });
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange((event, session) => {
                if (session) {
                    set({
                        user: session.user,
                        session,
                        isAuthenticated: true,
                    });
                    setAuthToken(session.access_token);
                } else {
                    set({
                        user: null,
                        session: null,
                        isAuthenticated: false,
                    });
                    setAuthToken(null);
                }
            });
        } catch (error) {
            console.error('Auth init error:', error);
            set({ isLoading: false });
        }
    },

    signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    },

    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, isAuthenticated: false });
        setAuthToken(null);
    },

    resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
    },
}));
