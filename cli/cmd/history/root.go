package history

import (
	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/cmd/flags"
	"github.com/egovelox/mozeidon/core"
)

var template string
var maximum int64
var chunk int64

var HistoryCmd = &cobra.Command{
	Use:   "history",
	Short: "Get history",
	Long: "Get history" +
		"\n\n" +
		"You may get items" +
		"\n" +
		" - with a given maximum M using -m M" +
		"\n" +
		" - and/or divided by chunks of a given number N of items using -c N" +
		"\n" +
		" - using a go-template T with -t T",
	Run: func(_ *cobra.Command, _ []string) {
		app, err := core.NewAppWithProfile(flags.ProfileID)
		if err != nil {
			core.PrintError(err.Error())
			return
		}
		if len(template) > 0 {
			app.HistoryTemplate(template, maximum, chunk)
		} else {
			app.HistoryJson(maximum, chunk)
		}
	},
}

func init() {
	HistoryCmd.Flags().
		StringVarP(&template, "go-template", "t", "", "go-template to customize output")
	HistoryCmd.Flags().
		Int64VarP(&maximum, "max", "m", 0, "the maximum number of items to return")
	HistoryCmd.Flags().
		Int64VarP(&chunk, "chunk", "c", 0, "the number of items a chunk can contain")

	HistoryCmd.AddCommand(DeleteHistoryCmd)
}
