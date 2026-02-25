import { useEffect, useId, useRef, useState } from 'react';
import Button from '@/components/atoms/Button/index.jsx';
import CitySelector from '@/components/organisms/CitySelector/index.jsx';
import './citySelectorMenu.scss';

export default function CitySelectorMenu({
  value,
  defaultValue = 'Mumbai',
  onChange,
  cities,
  label = 'City',
  dialogLabel = 'Choose a city',
  storageKey = 'sc_city',
  persist = true,
  className = '',
}) {
  const isControlled = value !== undefined;
  const panelId = useId();
  const popoverRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [internalCity, setInternalCity] = useState(() => {
    if (!persist) return defaultValue;
    try {
      return localStorage.getItem(storageKey) || defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const selectedCity = isControlled ? value : internalCity;

  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(storageKey, selectedCity);
    } catch {
      // ignore storage failures
    }
  }, [persist, storageKey, selectedCity]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      const node = popoverRef.current;
      if (node && !node.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (city) => {
    if (!isControlled) {
      setInternalCity(city);
    }
    if (onChange) {
      onChange(city);
    }
    setIsOpen(false);
  };

  return (
    <div className={['city-selector-menu', className].filter(Boolean).join(' ')} ref={popoverRef}>
      <Button
        variant="secondary"
        size="sm"
        aria-controls={panelId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {label}: {selectedCity}
      </Button>

      {isOpen ? (
        <div id={panelId} className="city-selector-menu__panel" role="dialog" aria-label={dialogLabel}>
          <CitySelector
            cities={cities}
            selectedCity={selectedCity}
            onSelect={handleSelect}
            showTitle={false}
            showStatus={false}
            className="city-selector--compact"
            ariaLabel={dialogLabel}
          />
        </div>
      ) : null}
    </div>
  );
}

