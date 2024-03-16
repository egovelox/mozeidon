package models

type Bookmarks struct {
	Items []Bookmark `json:"data"`
}

type Bookmark struct {
	Parent string `json:"parent"`
	Url    string `json:"url"`
	Title  string `json:"title"`
	Id     string `json:"id"`
}
