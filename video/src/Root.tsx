import { Composition } from 'remotion';
import { DURATION, FPS } from './data';
import { Route } from './Route';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="RouteWide" component={Route} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
      <Composition id="RouteTall" component={Route} durationInFrames={DURATION} fps={FPS} width={1080} height={1350} />
    </>
  );
};
