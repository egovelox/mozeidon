package core

import (
	"fmt"
	"strings"

	"github.com/egovelox/mozicli/browser/core/models"
	"github.com/egovelox/mozicli/ui"
)

func ChooseBookmark(
	bookmarks *models.Bookmarks,
	ui *ui.Ui,
	fzfFlags []string,
) (string, error) {
	uiBookmarks := []string{}
	darkGreenColor := "\u001b[38;5;109m"
	// ok 16-color
	noneColor := "\033[0m"
	for _, item := range bookmarks.Items {
		str := fmt.Sprintf(
			"%s %s %s %s %s \n",
			darkGreenColor,
			item.Parent,
			noneColor,
			item.Title,
			item.Url,
		)
		uiBookmarks = append(uiBookmarks, str)
	}
	reader := strings.NewReader(strings.Join(uiBookmarks, ""))

	res, err := ui.FzfTmux(reader, fzfFlags)
	if err != nil {
		return "", err
	}

	return res, nil
}
