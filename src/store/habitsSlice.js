import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  habits: [],
  loading: false,
  error: null,
}

export const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    setHabits: (state, action) => {
      state.habits = action.payload
    },
    addHabit: (state, action) => {
      state.habits.unshift(action.payload)
    },
    removeHabit: (state, action) => {
      state.habits = state.habits.filter(h => h.id !== action.payload)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setHabits, addHabit, removeHabit, setLoading, setError } = habitsSlice.actions

export default habitsSlice.reducer
