import { useClassesStore } from '../store/classes.store';

// Selector hooks para optimizar re-renders
export const useClasses = () => useClassesStore((state) => state.classes);
export const useClassesLoading = () => useClassesStore((state) => state.isLoading);
export const useClassesError = () => useClassesStore((state) => state.error);

// Action hooks
export const useFetchClasses = () => useClassesStore((state) => state.fetchClasses);
export const useCreateClass = () => useClassesStore((state) => state.createClass);
export const useCancelClass = () => useClassesStore((state) => state.cancelClass);
export const useClearClassesError = () => useClassesStore((state) => state.clearError);
export const useResetClasses = () => useClassesStore((state) => state.reset);
