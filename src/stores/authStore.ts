import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Claims } from "../types/user";
import type { Profile } from "../types/profile";
import supabase from "../utils/supabase";

type AuthStore = {
  isLoading: boolean; // 데이터 패칭 로딩 여부
  claims: Claims; // JWTPayload(사용자 정보)
  profile: Profile | null; // Profiles 테이블의 데이터
  setProfile: (profile: Profile | null) => void;
  setClaims: (c: Claims) => void;
  hydrateFromAuth: () => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      immer((set) => ({
        isLoading: true, // 데이터 패칭 로딩 여부
        claims: null, // JWTPayload
        profile: null, // profiles 테이블 데이터
        setProfile: (profile: Profile | null) =>
          set((state) => {
            state.profile = profile;
          }),
        setClaims: (c: Claims) =>
          set((state) => {
            state.claims = c;
          }),
        hydrateFromAuth: async () => {
          set({ isLoading: true });
          // 1. 클레임 가져오기
          const { data, error } = await supabase.auth.getClaims();

          // 세션없음 or 초기화 전 일 수 있음
          if (error) {
            set({ claims: null, profile: null, isLoading: false });
            return;
          }

          const claims = data?.claims as Claims;
          set({ claims: claims });

          // 2.프로필 조회하기
          if (claims?.sub) {
            const { data: profiles, error: profilesError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", claims.sub || "")
              .single();

            // 에러가 발생하면
            if (profilesError) {
              set({ claims: null, profile: null, isLoading: false });
            }

            // 에러가 발생하지 않으면 프로필에 세팅
            set({ profile: profiles ?? null });
          }
        },
        clearAuth: () =>
          set((state) => {
            state.claims = null;
            state.profile = null;
          }),
      })),
      { name: "auth-store" }
    )
  )
);
