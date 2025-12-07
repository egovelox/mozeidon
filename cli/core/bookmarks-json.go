package core

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) BookmarksJson(max int64, chunkSize int64, md5Hash string) {
	// We need an encoder instead of normal json.Marschal
	// because by default golang escapes & < > etc.
	// That's not an option if we want users to be able to work with --hash
	// (see bookmarks command for --hash)
	// see https://stackoverflow.com/a/28596225
	buf := new(bytes.Buffer)
	enc := json.NewEncoder(buf)
	enc.SetEscapeHTML(false)
	returnCode := 0

	for response := range a.browser.Send(
		models.Command{
			Command: "get-bookmarks",
			Args:    fmt.Sprintf("%d:%d:%s", max, chunkSize, md5Hash),
		},
	) {
		// Check for error response
		if checkForError(response.Data) {
			returnCode = 1
			continue
		}

		if string(response.Data) == `{"data":"bookmarks_synchronized"}` {
			fmt.Println(string(response.Data))
		} else {
			bookmarks := models.Bookmarks{}
			json.Unmarshal(response.Data, &bookmarks)

			_ = enc.Encode(bookmarks)
			// remove the trailing new line ( not present with json.Marshal )
			fmt.Println(strings.TrimRight(buf.String(), "\n"))
			buf.Reset()
		}
	}

	if returnCode != 0 {
		os.Exit(1)
	}
}
