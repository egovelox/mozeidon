package bookmark

import (
	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/browser/core/models"
	"github.com/egovelox/mozeidon/cmd/flags"
	"github.com/egovelox/mozeidon/core"
)

var createTitle string
var createUrl string
var createFolderPath string
var NewBookmarkCmd = &cobra.Command{
	Use:   "new",
	Short: "Create a new bookmark",
	Long:  "Create a new bookmark",
	Args:  cobra.NoArgs,
	Run: func(_ *cobra.Command, args []string) {
		app, err := core.NewAppWithProfile(flags.ProfileID)
		if err != nil {
			core.PrintError(err.Error())
			return
		}
		query := models.BookmarkWriteQuery{
			NewBookmark: &models.BookmarkCreateQuery{
				Title:      createTitle,
				Url:        createUrl,
				FolderPath: createFolderPath,
			},
		}
		app.BookmarkWrite(&query)
	},
}

func init() {
	NewBookmarkCmd.Flags().
		StringVarP(&createTitle, "title", "t", "", "required: the new bookmark's title")
	NewBookmarkCmd.MarkFlagRequired("title")
	NewBookmarkCmd.Flags().
		StringVarP(&createUrl, "url", "u", "", "required: the new bookmark's url")
	NewBookmarkCmd.MarkFlagRequired("url")
	NewBookmarkCmd.Flags().
		StringVarP(
			&createFolderPath,
			"folder-path",
			"f",
			"",
			"optional: the new bookmark's folder-path"+
				"\n"+
				"  - if present, this string must start and end with a `/` character."+
				"\n"+
				"    The bookmark will be created in the given path"+
				"\n"+
				"    starting from the root `/` being the boookmark toolbar."+
				"\n"+
				"  - if omitted, the bookmark will be created in the browser default location"+
				"\n"+
				"    ( e.g `Other Bookmarks` in firefox ).",
		)
}
