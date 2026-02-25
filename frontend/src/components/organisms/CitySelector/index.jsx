import './citySelector.scss';

const defaultCities = ['Mumbai', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Chennai'];

export default function CitySelector({
  cities = defaultCities,
  selectedCity,
  onSelect,
  title = 'City selector',
  showTitle = true,
  showStatus = true,
  ariaLabel = 'Featured cities',
  className = '',
}) {
  const handleSelect = (city) => {
    if (onSelect) {
      onSelect(city);
    }
  };

  return (
    <fieldset className={['city-selector', className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      {showTitle ? <legend className="city-selector__title">{title}</legend> : null}
      <div className="city-selector__buttons">
        {cities.map((city) => {
          const isActive = city === selectedCity;
          return (
            <button
              key={city}
              type="button"
              className={`city-selector__button${isActive ? ' city-selector__button--active' : ''}`}
              onClick={() => handleSelect(city)}
            >
              {city}
            </button>
          );
        })}
      </div>
      {showStatus ? (
        <p className="city-selector__status">
          {selectedCity
            ? `Currently exploring ${selectedCity}`
            : 'Select a city to preview it here.'}
        </p>
      ) : null}
    </fieldset>
  );
}
