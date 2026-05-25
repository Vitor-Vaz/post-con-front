import { describe, it, expect } from 'vitest'
import { extractBrandFromName } from './brand'

describe('extractBrandFromName', () => {
  it('should identify Petrobras / BR stations', () => {
    expect(extractBrandFromName('Posto Petrobras Consolação')).toBe('Petrobras')
    expect(extractBrandFromName('Auto Posto BR Aclimação')).toBe('Petrobras')
    expect(extractBrandFromName('posto petrobras')).toBe('Petrobras')
  })

  it('should identify Ipiranga stations', () => {
    expect(extractBrandFromName('Posto Ipiranga Bela Vista')).toBe('Ipiranga')
    expect(extractBrandFromName('auto posto ipiranga')).toBe('Ipiranga')
  })

  it('should identify Shell stations', () => {
    expect(extractBrandFromName('Posto Shell Liberdade')).toBe('Shell')
    expect(extractBrandFromName('shell station')).toBe('Shell')
  })

  it('should identify Ale stations', () => {
    expect(extractBrandFromName('Posto Ale Anhanguera')).toBe('Ale')
    expect(extractBrandFromName('rede ale')).toBe('Ale')
  })

  it('should fallback to Outra for unknown brands', () => {
    expect(extractBrandFromName('Posto Confiavel')).toBe('Outra')
    expect(extractBrandFromName('Auto Posto Sem Bandeira')).toBe('Outra')
  })
})
