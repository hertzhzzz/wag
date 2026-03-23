import { CityEntry } from '../types'

export const directoryCities: CityEntry[] = [
  {
    city: 'Foshan',
    province: 'Guangdong',
    factories: 80,
    focus: 'Furniture manufacturing hub',
    // Moved to Lecong furniture industrial zone area (south of city center)
    coords: [22.9718, 113.0819],
    industries: ['Furniture', 'Construction'],
  },
  {
    city: 'Dongguan',
    province: 'Guangdong',
    factories: 50,
    focus: 'Electronics manufacturing center',
    // Moved slightly east from center to Chang'an industrial area (away from water)
    coords: [23.0756, 113.8032],
    industries: ['Electronics', 'Robotics'],
  },
  {
    city: 'Hangzhou',
    province: 'Zhejiang',
    factories: 35,
    focus: 'E-commerce and tech hub',
    coords: [30.2741, 120.1551],
    industries: ['Electronics', 'Robotics'],
  },
  {
    city: 'Guangzhou',
    province: 'Guangdong',
    factories: 60,
    focus: 'Trading and export hub',
    // Moved to Huangpu industrial area (east of city center, away from water)
    coords: [23.1862, 113.3985],
    industries: ['Electronics', 'Furniture'],
  },
  {
    city: 'Shenzhen',
    province: 'Guangdong',
    factories: 75,
    focus: 'Global tech innovation center',
    // Moved inland from water area to Longhua industrial zone (north of Shenzhen)
    coords: [22.6532, 114.0285],
    industries: ['Electronics', 'Robotics'],
  },
  {
    city: 'Suzhou',
    province: 'Jiangsu',
    factories: 40,
    focus: 'High-tech industrial park',
    coords: [31.2989, 120.5853],
    industries: ['Electronics', 'Robotics'],
  },
  {
    city: 'Shanghai',
    province: 'Shanghai',
    factories: 55,
    focus: 'International trade gateway',
    coords: [31.2304, 121.4737],
    industries: ['Electronics', 'Furniture'],
  },
  {
    city: 'Chengdu',
    province: 'Sichuan',
    factories: 25,
    focus: 'Western China logistics hub',
    coords: [30.5728, 104.0668],
    industries: ['Food & Beverage', 'Construction'],
  },
  {
    city: 'Beijing',
    province: 'Beijing',
    factories: 30,
    focus: 'Capital business district',
    coords: [39.9042, 116.4074],
    industries: ['Electronics', 'CBD Property'],
  },
  {
    city: 'Wuhan',
    province: 'Hubei',
    factories: 20,
    focus: 'Central China transport hub',
    coords: [30.5928, 114.3055],
    industries: ['Construction', 'Food & Beverage'],
  },
]
