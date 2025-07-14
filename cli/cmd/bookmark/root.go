package bookmark

import (
	"github.com/spf13/cobra"
)

var BookmarkCmd = &cobra.Command{
	Use: "bookmark",
}

func init() {
	BookmarkCmd.AddCommand(NewBookmarkCmd)
	BookmarkCmd.AddCommand(DeleteBookmarkCmd)
	BookmarkCmd.AddCommand(UpdateBookmarkCmd)
}
