// src/app/components/shared/SingleManifestLoader.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { loadManifest, selectManifestInitialized, selectManifestLoading } from '../../store/slices/manifestSlice';

/**
 * Component that loads manifest exactly once at app startup
 * Should be rendered early in the app lifecycle
 */
const SingleManifestLoader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const initialized = useSelector((state: RootState) => selectManifestInitialized(state));
  const isLoading = useSelector((state: RootState) => selectManifestLoading(state));
  
  // Load manifest only once when app starts
  useEffect(() => {
    if (!initialized && !isLoading) { 
      dispatch(loadManifest());
    }
  }, [dispatch, initialized, isLoading]);

  // This component doesn't render anything
  return null;
};

export default SingleManifestLoader;
