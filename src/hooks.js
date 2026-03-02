import { useDispatch, useSelector } from 'react-redux'
import { store } from './store/store'

// Simple JS hooks
export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector
