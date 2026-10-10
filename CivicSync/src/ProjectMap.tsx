
import { useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './ProjectMap.css'

type MapProject = {
  id: string
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

// Fictional demo coordinates near Bengaluru.
// These do not represent verified infrastructure work sites.
const demoCoordinates: Record<string, [number, number]> = {
  'Water Pipeline Replacement': [12.9716, 77.5946],
  'Drainage System Upgrade': [12.9742, 77.5990],
  'Road Resurfacing': [12.9668, 77.6025],
  'Streetlight Modernisation': [12.9790, 77.5895],
  'Water Connection Upgrade': [12.9650, 77.5880],
  'Lake Road Repairs': [12.9820, 77.6010],
}

const categoryColors: Record<string, string> = {
  Water: '#2879e9',
  Drainage: '#0b9c7b',
  Road: '#e9a12c',
  Telecom: '#8153d7',
}

function ProjectMap({ projects, onSelect }: ProjectMapProps) {
  const [selectedProject, setSelectedProject] =
    useState<MapProject | null>(null)

  const selectedPosition = selectedProject
    ? demoCoordinates[selectedProject.name]
    : undefined

  const mapCenter: LatLngExpression = [12.973, 77.595]

  function selectProject(project: MapProject) {
    setSelectedProject(project)
    onSelect(project)
  }

  return (
    <MapContainer
      className="real-map"
      center={mapCenter}
      zoom={13}
      scrollWheelZoom={true}
      closePopupOnClick={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {projects.map((project) => {
        const position = demoCoordinates[project.name]

        if (!position) return null

        const color = categoryColors[project.category] ?? '#0899b6'

        return (
          <CircleMarker
            key={project.id}
            center={position}
            radius={10}
            pathOptions={{
              color: '#ffffff',
              weight: 3,
              fillColor: color,
              fillOpacity: 1,
            }}
            eventHandlers={{
              click: () => selectProject(project),
            }}
          />
        )
      })}

      {selectedProject && selectedPosition && (
        <Popup
          key={selectedProject.id}
          position={selectedPosition}
          eventHandlers={{
            remove: () => setSelectedProject(null),
          }}
        >
          <div className="map-popup">
            <span className="popup-category">
              {selectedProject.category} PROJECT
            </span>

            <h3>{selectedProject.name}</h3>

            <p>
              <strong>Road:</strong> {selectedProject.road}
            </p>

            <p>
              <strong>Department:</strong> {selectedProject.department}
            </p>

            <p>
              <strong>Start:</strong> {selectedProject.start}
            </p>

            <p>
              <strong>End:</strong> {selectedProject.end}
            </p>

            <span className="popup-disclaimer">
              Fictional demonstration project
            </span>
          </div>
        </Popup>
      )}
    </MapContainer>
  )
}

export default ProjectMap
