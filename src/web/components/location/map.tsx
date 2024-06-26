'use client';
import React, { useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import { Capsule, Depot, Station, Tube } from '@/types';
import { CapsuleMarker } from './capsuleMarker';
import { default as StationContainer } from '../station';
import { default as TubeContainer } from '../tube';
import AddStationConnectionForm from '@/components/addStationConnectionForm';
import { NewDepotOrStationMarker } from './newDepotOrStationMarker';

const getDepotPostion = (depot: Depot | undefined) : [number, number] | null => depot ? [Number(depot.latitude), Number(depot.longitude)] : null;

const Map = () => {
	const [capsules, setCapsules] = useState<Capsule[]>([]);
	const [depots, setDepots] = useState<Depot[]>([]);
	const [stations, setStations] = useState<Station[]>([]);
	const [tubes, setTubes] = useState<Tube[]>([]);
	const [refreshElement, setRefreshElement] = useState<null | string>(null);
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [center, setCenter] = useState<[number, number]>([52.218, 21.011]);
	const [zoom, setZoom] = useState<number>(8);

	React.useEffect(() => {
		const fetchAll = async () => {
			setCapsules((await (await fetch('/api/capsules/getAllCapsules', { cache: 'no-store' })).json()).data);
			setDepots((await (await fetch('/api/depots/getDepots', { cache: 'no-store' })).json()).data);
			setStations((await (await fetch('/api/stations/getStations', { cache: 'no-store' })).json()).data);
			setTubes((await (await fetch('/api/tubes/getTubes', { cache: 'no-store' })).json()).data);
		};
		fetchAll();
	}, []);

	React.useEffect(() => {
		const fetchData = async () => {
			if (!refreshElement || isFetching) return;

			setIsFetching(true);

			try {
				if (refreshElement === 'Depot') {
					const response = await fetch('/api/depots/getDepots', { cache: 'no-store' });
					const data = await response.json();
					setDepots(data.data);
				} else if (refreshElement === 'Station') {
					const response = await fetch('/api/stations/getStations', { cache: 'no-store' });
					const data = await response.json();
					setStations(data.data);
				} else if (refreshElement === 'Tube') {
					const response = await fetch('/api/tubes/getTubes', { cache: 'no-store' });
					const data = await response.json();
					setTubes(data.data);
				}
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setIsFetching(false);
				setRefreshElement(null);
			}
		};

		fetchData();
	}, [refreshElement, isFetching]);

	const MapEventHandler = () => {
		useMapEvents({
			moveend: (event) => {
				const map = event.target;
				setCenter([map.getCenter().lat, map.getCenter().lng]);
				setZoom(map.getZoom());
			}
		});
		return null;
	};

	return (
		<div className='h-full'>
			<MapContainer
				key={`${depots.length}-${stations.length}-${tubes.length}`}
				className='h-full'
				center={center}
				zoom={zoom}
				scrollWheelZoom={true}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>
				<MapEventHandler />
				{capsules.map((capsule) => (
					<CapsuleMarker
						key={capsule.capsule_id}
						capsule={capsule}
						initialPosition={getDepotPostion(depots.find((x) => x.depot_id === capsule.servicing_depot_id))}
					/>
				))}
				{depots.map((depot) => {
					return (
						<Marker key={depot.depot_id} position={[Number(depot.latitude), Number(depot.longitude)]}>
							<Popup>Depot: {depot.name}</Popup>
						</Marker>
					);
				})}
				{stations.map((station) => {
					return (
						<Marker key={station.station_id} position={[Number(station.latitude), Number(station.longitude)]}>
							<Popup>
								<StationContainer station={station} />
								<AddStationConnectionForm
									params={{
										station_id: station.station_id,
										station_name: station.name,
										refreshHandle: setRefreshElement,
									}}
								/>
							</Popup>
						</Marker>
					);
				})}
				{tubes.map((tube) => {
					const { pos } = getLinkedStations(stations, tube);

					return (
						<Polyline key={tube.tube_id} positions={pos} color='#64748b'>
							<Popup>
								<TubeContainer tube={tube} />
							</Popup>
						</Polyline>
					);
				})}
				<NewDepotOrStationMarker onRefresh={(value: any) => setRefreshElement(value)} />
			</MapContainer>
		</div>
	);
};

export default Map;

function getLinkedStations(stations: Station[], tube: Tube) {
	const station1 = stations.find((station) => station.station_id === tube.starting_station_id);
	const station2 = stations.find((station) => station.station_id === tube.ending_station_id);
	const pos = [
		{
			lat: Number(station1?.latitude),
			lng: Number(station1?.longitude),
		},
		{
			lat: Number(station2?.latitude),
			lng: Number(station2?.longitude),
		},
	];
	const name1 = station1?.name;
	const name2 = station2?.name;
	return { pos, name1, name2 };
}

export const dynamic = 'force-dynamic';
