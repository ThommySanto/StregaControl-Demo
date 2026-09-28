import mapDefinition from './map.json'

export function seedData() {
  return {
    base_maps: [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: mapDefinition.name,
        svg_data: mapDefinition.svg_data
      }
    ],
    editions: [
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Notte delle Streghe',
        year: 2026,
        base_map_id: '00000000-0000-0000-0000-000000000001'
      }
    ],
    zones: [
      {
        id: '00000000-0000-0000-0000-000000000003',
        edition_id: '00000000-0000-0000-0000-000000000002',
        name: 'Borgo',
        center_x: 0.175,
        center_y: 0.611,
        zoom_level: 4
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        edition_id: '00000000-0000-0000-0000-000000000002',
        name: 'Piazza',
        center_x: 0.500,
        center_y: 0.533,
        zoom_level: 4
      },
      {
        id: '00000000-0000-0000-0000-000000000005',
        edition_id: '00000000-0000-0000-0000-000000000002',
        name: 'Roccolo',
        center_x: 0.8125,
        center_y: 0.311,
        zoom_level: 4
      }
    ],
    elements: [],
    poi: []
  };
}
