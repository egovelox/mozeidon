export type RegistrationInfo = {
  browserName: string
  browserEngine: string
  browserVersion: string
  profileId: string
  profileName: string
  profileAlias: string
  profileRank: number
  profileCommandAlias: string
  userAgent: string
  registeredAt: string
}

export type StoredProfile = {
  id: string
  name: string
  alias: string
  rank: number
  commandAlias: string
}
