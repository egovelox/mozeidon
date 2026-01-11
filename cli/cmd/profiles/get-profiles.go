package profiles

import (
	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/core"
)

var template string

var GetProfilesCmd = &cobra.Command{
	Use:   "get",
	Short: "Get all active browser profiles",
	Long: "Get all active browser profiles" +
		"\n\n" +
		"You may get items:" +
		"\n" +
		"- using a go-template with -t" +
		"\n\n",
	Run: func(_ *cobra.Command, _ []string) {
		if len(template) > 0 {
			core.ProfilesTemplate(template)
		} else {
			core.ProfilesJson()
		}
	},
}

func init() {
	GetProfilesCmd.Flags().
		StringVarP(&template, "go-template", "t", "", "go-template to customize output")
}
