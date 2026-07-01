import MapCanvas from '@/components/MapCanvas';
import Avatar from '@/components/Avatar';
import ProjectCallout from '@/components/ProjectCallout';
import ProjectPanel from '@/components/ProjectPanel';
import EditOverlay from '@/components/EditOverlay';
import DirectionArrows from '@/components/DirectionArrows';
import RegionSwitcher from '@/components/RegionSwitcher';
import WhatToFind from '@/components/WhatToFind';
import OnboardingTooltip from '@/components/OnboardingTooltip';
import TouchDPad from '@/components/TouchDPad';
import MobileBottomSheet from '@/components/MobileBottomSheet';

export default function Home() {
  return (
    <>
      <MapCanvas />

      {/* warm vignette overlay — above map, below UI */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(63,50,38,0.22) 100%)',
        }}
      />

      <Avatar />
      <OnboardingTooltip />
      <ProjectCallout />
      <ProjectPanel />
      <DirectionArrows />
      <RegionSwitcher />
      <WhatToFind />
      <TouchDPad />
      <MobileBottomSheet />
      <EditOverlay />
    </>
  );
}
