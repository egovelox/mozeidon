package bookmark

import (
	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/browser/core/models"
	"github.com/egovelox/mozeidon/core"
)

var DeleteBookmarkCmd = &cobra.Command{
	Use:   "delete [id]",
	Short: "Delete a bookmark",
	Long: "Delete a bookmark by id" +
		"\n\n" +
		"Required argument: a string bookmark id",
	Args: cobra.ExactArgs(1),
	Run: func(_ *cobra.Command, args []string) {
		app, err := core.NewApp()
		if err != nil {
			core.PrintError(err.Error())
			return
		}
		query := models.BookmarkWriteQuery{
			Bookmark: &models.BookmarkDeleteOrUpdateQuery{
				Id: args[0],
			},
		}
		app.BookmarkWrite(&query)
	},
}

func init() {
}
