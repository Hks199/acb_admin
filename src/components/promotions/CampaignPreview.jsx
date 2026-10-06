import { useEffect, useRef, useState } from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import CampaignCard from './CampaignCard';
const sizes = { desktop: 840, tablet: 640, mobile: 360 };
export default function CampaignPreview({ campaign }) {
  const [viewport, setViewport] = useState('desktop');
  const [scale, setScale] = useState(.5);
  const [height, setHeight] = useState(260);
  const stage = useRef(null);
  const canvas = useRef(null);
  useEffect(() => {
    const measure = () => {
      const ratio = Math.min(1, (stage.current?.clientWidth || sizes[viewport]) / sizes[viewport]);
      setScale(ratio); setHeight((canvas.current?.offsetHeight || 460) * ratio);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (stage.current) observer.observe(stage.current);
    if (canvas.current) observer.observe(canvas.current);
    return () => observer.disconnect();
  }, [viewport]);
  return <aside className="promo-preview-panel">
    <div className="promo-preview-heading"><span>LIVE PREVIEW</span><p>Changes appear as you type.</p></div>
    <ToggleButtonGroup exclusive value={viewport} size="small" onChange={(_, value) => { if (value) setViewport(value); }} aria-label="Preview device">
      {Object.keys(sizes).map((size) => <ToggleButton key={size} value={size}>{size}</ToggleButton>)}
    </ToggleButtonGroup>
    <div className="promo-preview-stage" ref={stage} style={{ height }}>
      <div className="promo-preview-canvas" ref={canvas} data-viewport={viewport} style={{ width: sizes[viewport], transform: `scale(${scale})` }}>
        <CampaignCard campaign={campaign} preview compact={viewport === 'mobile'} />
      </div>
    </div>
    <p className="promo-preview-caption">{sizes[viewport]}px viewport ? {Math.round(scale * 100)}% preview scale</p>
  </aside>;
}
