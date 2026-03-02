export const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    setHabits: (state, action) => { state.habits = action.payload },
    addHabit: (state, action) => { state.habits.unshift(action.payload) },
    removeHabit: (state, action) => { state.habits = state.habits.filter(h => h.id !== action.payload) },
    setLoading: (state, action) => { state.loading = action.payload },
    setError: (state, action) => { state.error = action.payload },
    
    fetchHabits: (state) => { 
      state.loading = true 
      state.error = null 
    },
    logHabit: (state, action) => {
      const habit = state.habits.find(h => h.id === action.payload)
      if (habit) habit.last_logged = new Date().toISOString()
    }
  },
})

export const { setHabits, addHabit, removeHabit, setLoading, setError, fetchHabits, logHabit } = habitsSlice.actions
