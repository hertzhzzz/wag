export interface CityEntry {
  city: string
  province: string
  factories: number
  focus: string
  coords: [number, number]
  industries: string[]
}

export type IndustryFilter =
  | 'All'
  | 'Electronics'
  | 'Furniture'
  | 'Robotics'
  | 'EV Battery'
  | 'CBD Property'
  | 'Construction'
  | 'Food & Beverage'
