package core

import (
	"log"
	"os"
	"os/exec"
	"strings"

	"github.com/egovelox/mozicli/browser/core/models"
)

func (a *App) Bookmarks(query string) {
	// TODO: handle error
	bookmarks, _ := a.BookmarksGet()

	fzfFlags := []string{
		// Case-insensitive
		"-i",
		"--cycle",
		"--border-label=BOOKMARKS",
		"--exact",
		"--no-sort",
		"--bind=enter:accept-non-empty",
	}
	res, _ := ChooseBookmark(&bookmarks, a.ui, fzfFlags)
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

	_, err := a.browser.Send(
		models.Command{
			Command: "open-tab",
			Args:    url,
		},
	)

	if err != nil {
		log.Println(err)
		os.Exit(1)
	}

	cmd := exec.Command("open", "-a", "firefox")
	cmd.Run()
}
