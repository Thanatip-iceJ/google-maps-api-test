import { useCallback, useState } from "react";
import usePlacesAutoComplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import "./App.css";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import { GOOGLE_MAPS_API, LIBRARIES } from "../../env";

function App() {
  const containerStyle = { width: "400px", height: "400px" };
  const center = {
    lat: 13.758451524114372,
    lng: 100.53509964819563,
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API,
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState(null);
  const onLoad = useCallback((map) => {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback((map) => {
    setMap(null);
  }, []);

  const [selected, setSelected] = useState();
  return isLoaded ? (
    <>
      <div style={{ display: "flex" }}>
        <PlacesAutoComplete setSelected={setSelected} />
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selected}
          zoom={17}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {selected && <MarkerF position={selected} />}
        </GoogleMap>
      </div>
    </>
  ) : (
    <></>
  );
}

export default App;

function PlacesAutoComplete({ setSelected }) {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutoComplete();

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    const result = await getGeocode({ address });
    const { lat, lng } = await getLatLng(result[0]);
    setSelected({ lat, lng });
  };
  return (
    <Combobox onSelect={handleSelect}>
      <ComboboxInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        placeholder="Search an address"
      />
      <ComboboxPopover>
        <ComboboxList>
          {status === "OK" &&
            data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
}
