package models

type Tabs struct {
	Items []Tab `json:"data"`
}

type TabsWithGroups struct {
	Items  []Tab   `json:"data"`
	Groups []Group `json:"groups,omitempty"`
}

type Tab struct {
	Id           int64  `json:"id"`
	WindowId     int64  `json:"windowId"`
	GroupId      int64  `json:"groupId"`
	Pinned       bool   `json:"pinned"`
	Domain       string `json:"domain"`
	Url          string `json:"url"`
	Title        string `json:"title"`
	Active       bool   `json:"active"`
	LastAccessed int64  `json:"lastAccessed"`
	Index        int64  `json:"index"`
}
