package models

// a profile stored inside the web-browser extension space
type StoredProfileData struct {
	Item storedProfile `json:"data"`
}

type storedProfile struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	Alias        string `json:"alias"`
	CommandAlias string `json:"commandAlias"`
	Rank         int64  `json:"rank"`
}
