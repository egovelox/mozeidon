package models

type Tabs struct {
	Items []Tab `json:"data"`
}

type Tab struct {
	Id     int64  `json:"id"`
	Pinned bool   `json:"pinned"`
	Domain string `json:"domain"`
	Title  string `json:"title"`
}
