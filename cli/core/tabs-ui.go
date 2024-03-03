package core

import (
	"fmt"
	"strings"

	"github.com/egovelox/mozicli/browser/core/models"
	"github.com/egovelox/mozicli/ui"
)

func ChooseTab(
	tabs *models.Tabs,
	ui *ui.Ui,
	fzfFlags []string,
) (string, error) {
	uiTabs := []string{}
	// for 256-color terminals only
	darkGreenColor := "\u001b[38;5;109m"
	// ok 16-color
	noneColor := "\033[0m"
	for _, item := range tabs.Items {
		str := fmt.Sprintf(
			"%4d  %s %s %s %s %s \n",
			item.Id,
			getTabIcon(item.Pinned),
			darkGreenColor,
			ShortString(item.Domain, 30),
			noneColor,
			item.Title,
		)
		uiTabs = append(uiTabs, str)
	}
	reader := strings.NewReader(strings.Join(uiTabs, ""))

	// TODO: handle error
	res, err := ui.FzfTmux(reader, fzfFlags)

	if err != nil {
		return "", err
	}

	return res, nil
}

func getTabIcon(pinned bool) string {
	if pinned {
		return "📎"
	}
	return "🦊"
}

func ShortString(s string, count int) string {
	maxCount := len(s)
	if count > maxCount {
		count = maxCount
	}
	return s[0:count]
}
