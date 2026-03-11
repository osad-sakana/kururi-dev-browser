import { useState, useCallback, useEffect } from 'react'
import { DevicePreset, Viewport } from '../types/device'
import { DEVICE_PRESETS, DEFAULT_SELECTED_IDS } from '../presets'

const STORAGE_KEY_SELECTED = 'kururi:selectedDeviceIds'
const STORAGE_KEY_CUSTOM = 'kururi:customDevices'

function loadSelectedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SELECTED)
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_SELECTED_IDS
}

function loadCustomDevices(): DevicePreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

let viewportIdCounter = 0
const generateId = () => `vp-${++viewportIdCounter}`

export function useViewports() {
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>(loadSelectedIds)
  const [customDevices, setCustomDevices] = useState<DevicePreset[]>(loadCustomDevices)
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SELECTED, JSON.stringify(selectedDeviceIds))
  }, [selectedDeviceIds])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customDevices))
  }, [customDevices])

  const allDevices = [...DEVICE_PRESETS, ...customDevices]

  const activeViewports: Viewport[] = selectedDeviceIds
    .map((id) => {
      const device = allDevices.find((d) => d.id === id)
      if (!device) return null
      return {
        id: generateId(),
        device,
        isLoading: false,
        url: currentUrl,
      }
    })
    .filter((v): v is Viewport => v !== null)

  const toggleDevice = useCallback((deviceId: string) => {
    setSelectedDeviceIds((prev) => {
      if (prev.includes(deviceId)) {
        if (prev.length <= 1) return prev
        return prev.filter((id) => id !== deviceId)
      }
      if (prev.length >= 6) return prev
      return [...prev, deviceId]
    })
  }, [])

  const addCustomDevice = useCallback((name: string, width: number, height: number) => {
    const id = `custom-${Date.now()}`
    const newDevice: DevicePreset = {
      id,
      name,
      width,
      height,
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    setCustomDevices((prev) => [...prev, newDevice])
    setSelectedDeviceIds((prev) => {
      if (prev.length >= 6) return prev
      return [...prev, id]
    })
  }, [])

  const setViewportLoading = useCallback((deviceId: string, isLoading: boolean) => {
    setLoadingIds((prev) => {
      const next = new Set(prev)
      if (isLoading) {
        next.add(deviceId)
      } else {
        next.delete(deviceId)
      }
      return next
    })
  }, [])

  return {
    allDevices,
    selectedDeviceIds,
    activeViewports,
    loadingIds,
    currentUrl,
    setCurrentUrl,
    toggleDevice,
    addCustomDevice,
    setViewportLoading,
  }
}
