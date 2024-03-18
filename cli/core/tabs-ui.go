package core

import (
	"fmt"
	"io"
	"strings"

	"github.com/egovelox/mozeidon/browser/core/models"
	"github.com/egovelox/mozeidon/ui"
)

func (a *App) ChooseTab(
	tabs <-chan models.Tabs,
	fzfFlags []string,
) (string, error) {

	res, err := ui.Fzf(a.viper, fzfFlags, tabs, TabsPrinter{})

	if err != nil {
		return "", err
	}

	return res, nil
}

type TabsPrinter struct{}

func (_ TabsPrinter) Print(stdin io.WriteCloser, tabs <-chan models.Tabs) {
	for receivedTabs := range tabs {
		uiTabs := []string{}
		// for 256-color terminals only
		darkGreenColor := "\u001b[38;5;109m"
		// ok 16-color
		noneColor := "\033[0m"
		for _, item := range receivedTabs.Items {
			str := fmt.Sprintf(
				"%s %s %s %s %s %s \n",
				// this field will be hidden by fzf --with-nth
				fmt.Sprintf("%d:%d", item.WindowId, item.Id),
				getTabIcon(item.Pinned),
				darkGreenColor,
				shortString(item.Domain, 30, "..."),
				noneColor,
				item.Title,
			)
			uiTabs = append(uiTabs, str)
		}
		reader := strings.NewReader(strings.Join(uiTabs, ""))

		io.Copy(stdin, reader)
	}
}

func getTabIcon(pinned bool) string {
	if pinned {
		return "📌"
	}
	return "🦊"
}

func shortString(s string, count int, suffix string) string {
	if count < len(s) {
		return s[0:count] + suffix
	}
	return s
}
