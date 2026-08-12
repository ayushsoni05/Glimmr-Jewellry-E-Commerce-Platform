import GlimmrLoader from './GlimmrLoader';

const LoadingOverlay = ({ show, text = 'CURATING ATELIER SELECTIONS...' }) => {
  if (!show) return null;
  return <GlimmrLoader subtitle={text} fullScreen={true} />;
};

export default LoadingOverlay;
