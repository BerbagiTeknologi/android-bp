// src/test/zustandTest.js
import { create } from 'zustand'

const useTestStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))

export default useTestStore