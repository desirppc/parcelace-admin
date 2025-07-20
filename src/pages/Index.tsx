
import AuthNavigator from '@/components/AuthNavigator';
import { useSearchParams } from 'react-router-dom';

const Index = () => {
  const [searchParams] = useSearchParams();
  const screen = searchParams.get('screen') as 'login' | 'signup' | undefined;
  
  return <AuthNavigator initialScreen={screen || 'login'} />;
};

export default Index;
