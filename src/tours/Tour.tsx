import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X, Play, Check } from 'lucide-react';
import { Modal } from '../components/ui';
import { steps } from './main';
const Context = createContext({
  start: () => {}
});
export const useTour = () => useContext(Context);
export function TourProvider({
  children
}: {
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [welcome, setWelcome] = useState(!localStorage.getItem('northwind.tourCompleted'));
  const [index, setIndex] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const stop = useCallback(() => {
    setIndex(-1);
    setWelcome(false);
    localStorage.setItem('northwind.tourCompleted', 'true');
  }, []);
  const start = () => {
    setWelcome(false);
    setIndex(0);
  };
  useEffect(() => {
    if (index < 0) return;
    navigate(steps[index].route);
    const update = () => {
      const el = document.querySelector(steps[index].target);
      if (el) {
        setRect(el.getBoundingClientRect());
      }
    };
    const timer = setTimeout(update, 350);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop();
      if (e.key === 'ArrowRight') setIndex(i => Math.min(steps.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', key);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', key);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [index, navigate, stop]);
  return <Context.Provider value={{
    start
  }}>{children}{welcome && <Modal title="Take a 2-minute tour" onClose={stop}><p>Discover how to capture leads, manage opportunities and keep your team moving.</p><footer><button onClick={stop}><X />Skip for now</button><button className="primary" onClick={start}><Play />Start tour</button></footer></Modal>}{index >= 0 && <div className="tour-layer">{rect && <div className="spotlight" style={{
        left: rect.left - 4,
        top: rect.top - 4,
        width: rect.width + 8,
        height: rect.height + 8
      }} />}<section className="coach" role="dialog" aria-modal="true" aria-label="Product tour"><small>{index + 1} of {steps.length}</small><h2>{steps[index].title}</h2><p>{steps[index].text}</p><progress value={index + 1} max={steps.length} aria-label="Tour progress" /><footer><button onClick={stop}><X />Skip</button><button disabled={index === 0} onClick={() => setIndex(index - 1)}><ArrowLeft />Back</button><button className="primary" onClick={() => index === steps.length - 1 ? stop() : setIndex(index + 1)}>{index === steps.length - 1 ? <Check /> : <ArrowRight />}{index === steps.length - 1 ? 'Finish' : 'Next'}</button></footer></section></div>}</Context.Provider>;
}
