//styles
import './scss/global.scss';
//constants
import { slides } from './js/constants/AppConstants';
//components
import Carousel from './js/components/shared/carousel/Carousel';
import TestComponent from './js/containers/TestComponent';
import RemoteComponent from './js/components/shared/remoteComponent/RemoteComponent';

const App = () => (
  <>
    <RemoteComponent remote="second_inner_app/App" />
    <Carousel slides={slides} isPageBackground />
    <TestComponent />
  </>
);

export default App;
