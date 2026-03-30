import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Room, Team } from "@/types";

interface GameStore {
  currentRoom: Room | null;
  currentTeam: Team | null;
  upvotedQuestionIds: string[];
  _hasHydrated: boolean;

  setRoom: (room: Room | null) => void;
  setTeam: (team: Team | null) => void;
  addUpvote: (questionId: string) => void;
  hasUpvoted: (questionId: string) => boolean;
  reset: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentRoom: null,
      currentTeam: null,
      upvotedQuestionIds: [],
      _hasHydrated: false,

      setRoom: (room) => set({ currentRoom: room }),
      setTeam: (team) => set({ currentTeam: team }),

      addUpvote: (questionId) =>
        set((state) => ({
          upvotedQuestionIds: [...state.upvotedQuestionIds, questionId],
        })),

      hasUpvoted: (questionId) =>
        get().upvotedQuestionIds.includes(questionId),

      reset: () =>
        set({ currentRoom: null, currentTeam: null, upvotedQuestionIds: [] }),

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "soup-game-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentTeam: state.currentTeam,
        currentRoom: state.currentRoom,
        upvotedQuestionIds: state.upvotedQuestionIds,
      }),
      // localStorage 恢復完成後標記 hydrated，讓組件知道可以安全讀取 store
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
