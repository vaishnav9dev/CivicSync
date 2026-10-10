
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './ProjectMap.css'

type MapProject = {
  id: number
  name: string
  department: string
  road: string
  start: string
  end: string
  category: string
}

type ProjectMapProps = {
  projects: MapProject[]
  onSelect: (project: MapProject) => void
}

// Fictional demo positions around Bengaluru.
// These coordinates do not represent verified public works.
const demoCoordinates: Record<number, [number, number]> = {
  1: [12.9716, 77.5946],
  2: [12.9742, 77.5990],
  3: [12.9668, 77.6025],
  4: [12.9790, 77.5895],
  5: [12.9650, 77.5880],
  6: [12.9820, 77.6010],
}

const categoryColors: Record<string, string> = {
  Water: '#2879e9',
  Drainage: '#0b9c7b',
  Road: '#e9a12c',
  Telecom: '#8153d7',
}

function ProjectMap({ projects, onSelect }: ProjectMapProps) {
  return (
    <MapContainer
      className="real-map"
      center={[12.973, 77.595]}
      zoom={13}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {projects.map((project) => {
        const position = demoCoordinates[project.id]
        if (!position) return null

        const color = categoryColors[project.category] ?? '#0899b6'

        return (
          <CircleMarker
            key={project.id}
            center={position}
            radius={9}
            pathOptions={{
              color: '#ffffff',
              weight: 3,
              fillColor: color,
              fillOpacity: 1,
            }}
            eventHandlers={{
              click: () => onSelect(project),
            }}
          >
            <Popup>
              <div className="map-popup">
                <strong>{project.name}</strong>
                <p>Road: {project.road}</p>
                <p>Department: {project.department}</p>
                <p>Dates: {project.start} to {project.end}</p>
                <small>Fictional demonstration project</small>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}

export default ProjectMap
