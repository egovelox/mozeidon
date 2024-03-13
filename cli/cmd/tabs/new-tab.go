package tabs

import (
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozicli/core"
)

var NewTabCmd = &cobra.Command{
	Use:   "new",
	Short: "open a new tab",
	Long:  ``,
	Run: func(_ *cobra.Command, args []string) {
		app, err := core.NewApp()
		if err != nil {
			fmt.Println(err)
			return
		}
		app.NewTab(strings.Join(args, " "))
	},
}

func init() {
}
