const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

export interface CreateStationInput {
  name: string
  address?: string
  latitude?: number
  longitude?: number
}

export interface CreateReviewWithStationInput {
  place_id: string
  rating: number
  comment?: string | null
  rating_fuel_quality?: number | null
  rating_pump_honesty?: number | null
  rating_service?: number | null
  rating_price_pressure?: number | null
  fuel_type?: string | null
  flag_anp_interdiction?: boolean
  flag_oil_change_scam?: boolean
  flag_commercial_harassment?: boolean
  station: CreateStationInput
}

export interface ReviewResponse {
  id: string
  place_id: string
  user_id: string
  rating: number
  created_at: string
  updated_at: string
}

/**
 * Cadastra um posto de combustível junto com sua primeira avaliação.
 * Rota: POST /review/with-station
 */
export async function createReviewWithStation(
  input: CreateReviewWithStationInput
): Promise<ReviewResponse> {
  const response = await fetch(`${API_BASE_URL}/review/with-station`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  })

  if (!response.ok) {
    let errorMessage = 'Erro ao processar a requisição no servidor.'
    try {
      const errBody = await response.json()
      if (errBody && errBody.error) {
        errorMessage = errBody.error
      }
    } catch {
      // Ignorar falha no parse do erro
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export interface CreateReviewInput {
  place_id: string
  user_id: string
  rating: number
  comment?: string | null
  rating_fuel_quality?: number | null
  rating_pump_honesty?: number | null
  rating_service?: number | null
  rating_price_pressure?: number | null
  fuel_type?: string | null
  flag_anp_interdiction?: boolean
  flag_oil_change_scam?: boolean
  flag_commercial_harassment?: boolean
}

/**
 * Adiciona uma avaliação simples a um posto que já existe.
 * Rota: POST /review
 */
export async function createReview(
  input: CreateReviewInput
): Promise<ReviewResponse> {
  const response = await fetch(`${API_BASE_URL}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  })

  if (!response.ok) {
    let errorMessage = 'Erro ao processar a requisição no servidor.'
    try {
      const errBody = await response.json()
      if (errBody && errBody.error) {
        errorMessage = errBody.error
      }
    } catch {
      // Ignorar falha no parse do erro
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

