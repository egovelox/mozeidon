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

type BookmarkWriteQuery struct {
	Bookmark    *BookmarkDeleteOrUpdateQuery `json:"bookmark,omitempty"`
	NewBookmark *BookmarkCreateQuery         `json:"newBookmark,omitempty"`
}

type BookmarkDeleteOrUpdateQuery struct {
	Id         string `json:"id"`
	ParentId   string `json:"parentId"`
	FolderPath string `json:"folderPath,omitempty"`
	Title      string `json:"title,omitempty"`
	Url        string `json:"url,omitempty"`
}

type BookmarkCreateQuery struct {
	/*
	   * the folderPath will be sent as '' when user :
	     - omits the -f --folder-path flag
	     - passes an empty-string in the flag, e.g --folder-path ''
	*/
	FolderPath string `json:"folderPath,omitempty"`
	Title      string `json:"title"`
	Url        string `json:"url"`
}
