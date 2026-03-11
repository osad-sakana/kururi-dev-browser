export interface DevicePreset {
  id: string
  name: string
  width: number
  height: number
  userAgent: string
}

export interface Viewport {
  id: string
  device: DevicePreset
  isLoading: boolean
  url: string
}
