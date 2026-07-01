import MapCanvas from '@/components/MapCanvas';
import Avatar from '@/components/Avatar';
import ProjectCallout from '@/components/ProjectCallout';
import ProjectPanel from '@/components/ProjectPanel';
import EditOverlay from '@/components/EditOverlay';
import SettingsPanel from '@/components/SettingsPanel';
import DirectionArrows from '@/components/DirectionArrows';
import RegionSwitcher from '@/components/RegionSwitcher';
import WhatToFind from '@/components/WhatToFind';

export default function Home() {
  return (
    <>
      <MapCanvas />
      <Avatar />
      <ProjectCallout />
      <ProjectPanel />
      <DirectionArrows />
      <RegionSwitcher />
      <WhatToFind />
      <EditOverlay />
      <SettingsPanel />
    </>
  );
}
