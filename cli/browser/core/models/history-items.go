package models

type HistoryItems struct {
	Items []HistoryItem `json:"data"`
}

type HistoryItem struct {
	Url   string `json:"url"`
	Title string `json:"title"`
	Id    string `json:"id"`
}
