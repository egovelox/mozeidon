package models

type Windows struct {
	Items []Window `json:"data"`
}

type Window struct {
	Id            int64 `json:"id"`
	IsLastFocused bool  `json:"isLastFocused"`
}
