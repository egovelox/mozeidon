package core

import (
	"fmt"
	"io"
	"strings"

	"github.com/egovelox/mozeidon/browser/core/models"
	"github.com/egovelox/mozeidon/ui"
)

func (a *App) ChooseBookmark(
	bookmarks <-chan models.Bookmarks,
	fzfFlags []string,
) (string, error) {

	res, err := ui.Fzf(
		a.viper,
		fzfFlags,
		bookmarks,
		BookmarksPrinter{},
	)
	if err != nil {
		return "", err
	}

	return res, nil
}

type BookmarksPrinter struct{}

func (_ BookmarksPrinter) Print(
	stdin io.WriteCloser,
	bookmarks <-chan models.Bookmarks,
) {
	for receivedBookmarks := range bookmarks {
		uiBookmarks := []string{}
		// for 256-color terminals only
		darkGreenColor := "\u001b[38;5;109m"
		// 193 152
		darkYellowColor := "\u001b[38;5;101m"
		// ok 16-color
		noneColor := "\033[0m"
		for _, item := range receivedBookmarks.Items {
			str := fmt.Sprintf(
				"%s %s %s %s %s %s \n",
				darkGreenColor,
				item.Parent,
				darkYellowColor,
				item.Title,
				noneColor,
				item.Url,
			)
			uiBookmarks = append(uiBookmarks, str)
		}
		reader := strings.NewReader(strings.Join(uiBookmarks, ""))
		io.Copy(stdin, reader)
	}
}
