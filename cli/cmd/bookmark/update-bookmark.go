package bookmark

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/browser/core/models"
	"github.com/egovelox/mozeidon/core"
)

var updateTitle string
var updateUrl string
var updateFolderPath string
var UpdateBookmarkCmd = &cobra.Command{
	Use:   "update [id]",
	Short: "Update a bookmark",
	Long: "Update a bookmark by id" +
		"\n\n" +
		"Required argument: a string bookmark id",
	Args: cobra.ExactArgs(1),
	Run: func(_ *cobra.Command, args []string) {
		app, err := core.NewApp()
		if err != nil {
			fmt.Println(err)
			return
		}
		query := models.BookmarkWriteQuery{
			Bookmark: &models.BookmarkDeleteOrUpdateQuery{
				Id:         args[0],
				Title:      updateTitle,
				Url:        updateUrl,
				FolderPath: updateFolderPath,
			},
		}
		app.BookmarkWrite(&query)
	},
}

func init() {
	UpdateBookmarkCmd.Flags().
		StringVarP(&updateTitle, "title", "t", "", "optional: title to update, must a be not-empty string")
	UpdateBookmarkCmd.Flags().
		StringVarP(&updateUrl, "url", "u", "", "optional: url to update, must be a not-empty string")
	UpdateBookmarkCmd.Flags().
		StringVarP(&updateFolderPath, "folder-path", "f", "", "optional: folder-path to update, must be a not-empty string")
	UpdateBookmarkCmd.MarkFlagsOneRequired("title", "url", "folder-path")
}
