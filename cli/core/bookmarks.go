package core

import (
	"os/exec"
	"strings"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) Bookmarks(query string) {

	fzfFlags := []string{
		// Case-insensitive
		"-i",
		"--cycle",
		"--border-label=BOOKMARKS",
		"--exact",
		"--no-sort",
		"--bind=enter:accept-non-empty",
	}
	res, _ := a.ChooseBookmark(a.BookmarksGet(), fzfFlags)
	_, httpsUrl, foundHttps := strings.Cut(res, "https://")
	_, httpUrl, foundHttp := strings.Cut(res, "http://")

	var url string
	if foundHttps {
		url = "https://" + httpsUrl
	} else if foundHttp {
		url = "http://" + httpUrl
	} else {
		return
	}

	a.browser.Send(
		models.Command{
			Command: "new-tab",
			Args:    url,
		},
	)

	cmd := exec.Command("open", "-a", "firefox")
	cmd.Run()
}
