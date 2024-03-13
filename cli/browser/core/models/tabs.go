package models

type Tabs struct {
	Items []Tab `json:"data"`
}

type Tab struct {
	Id       int64  `json:"id"`
	WindowId int64  `json:"windowId"`
	Pinned   bool   `json:"pinned"`
	Domain   string `json:"domain"`
	Url      string `json:"url"`
	Title    string `json:"title"`
	Active   bool   `json:"active"`
}
