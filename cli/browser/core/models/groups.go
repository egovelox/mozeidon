package models

type Groups struct {
	Items []Group `json:"data"`
}

type Group struct {
	Id        int64  `json:"id"`
	Collapsed bool   `json:"collapsed"`
	Color     string `json:"color"`
	WindowId  int64  `json:"windowId"`
	Title     string `json:"title"`
}
