type Env = {
  LEMON_SQUEEZY_API_KEY?: string
}

type PagesContext = {
  request: Request
  env: Env
}

type LemonSqueezyValidateResponse = {
  valid?: boolean
  error?: string | null
  status?: string
  license_key?: {
    status?: string
  }
  meta?: {
    valid?: boolean
    status?: string
    license_key?: {
      status?: string
    }
  }
}

const LEMON_SQUEEZY_VALIDATE_URL =
  'https://api.lemonsqueezy.com/v1/licenses/validate'

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function invalidLicenseResponse(): Response {
  return jsonResponse(
    { success: false, message: 'Invalid license key' },
    400,
  )
}

export async function onRequestPost({
  request,
  env,
}: PagesContext): Promise<Response> {
  const apiKey = env.LEMON_SQUEEZY_API_KEY?.trim()

  if (!apiKey) {
    return invalidLicenseResponse()
  }

  let body: { licenseKey?: unknown }

  try {
    body = (await request.json()) as { licenseKey?: unknown }
  } catch {
    return invalidLicenseResponse()
  }

  const licenseKey = typeof body.licenseKey === 'string' ? body.licenseKey.trim() : ''

  if (!licenseKey) {
    return invalidLicenseResponse()
  }

  let apiResponse: Response

  try {
    apiResponse = await fetch(LEMON_SQUEEZY_VALIDATE_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ license_key: licenseKey }).toString(),
    })
  } catch {
    return invalidLicenseResponse()
  }

  if (!apiResponse.ok) {
    return invalidLicenseResponse()
  }

  let payload: LemonSqueezyValidateResponse

  try {
    payload = (await apiResponse.json()) as LemonSqueezyValidateResponse
  } catch {
    return invalidLicenseResponse()
  }

  const status =
    payload.license_key?.status ??
    payload.status ??
    payload.meta?.license_key?.status ??
    payload.meta?.status
  const isValid = payload.valid === true || payload.meta?.valid === true

  if (!isValid || status?.toLowerCase() === 'disabled') {
    return invalidLicenseResponse()
  }

  return jsonResponse({ success: true }, 200)
}
