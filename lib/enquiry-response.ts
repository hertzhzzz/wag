interface JsonResponse {
  json(): Promise<unknown>
}

/**
 * Read enquiryId from a successful /api/enquiry JSON body.
 * Safe on malformed bodies — returns undefined instead of throwing.
 */
export async function readSuccessfulEnquiryId(response: JsonResponse): Promise<string | undefined> {
  try {
    const data = await response.json()
    if (
      typeof data !== 'object'
      || data === null
      || !('enquiryId' in data)
      || typeof (data as { enquiryId: unknown }).enquiryId !== 'string'
    ) {
      return undefined
    }

    return (data as { enquiryId: string }).enquiryId.trim() || undefined
  } catch {
    return undefined
  }
}
