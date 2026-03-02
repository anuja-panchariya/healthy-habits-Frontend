import { habitsSlice } from './habitsSlice'
import { useAppDispatch, useAppSelector } from '../hooks'

export const store = configureStore({
  reducer: {
    habits: habitsSlice.reducer  
  },
})

// Export types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
