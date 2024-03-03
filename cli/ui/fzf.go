package ui

import (
	"io"
	"os"
	"os/exec"
	"strings"

	"github.com/spf13/viper"

	"github.com/egovelox/mozicli/browser/core/models"
)

type Printer[T models.Bookmarks | models.Tabs] interface {
	Print(stdin io.WriteCloser, channel <-chan T)
}

func Fzf[T models.Bookmarks | models.Tabs](
	config *viper.Viper,
	fzfFlags []string,
	bookmarks <-chan T,
	printer Printer[T],
) (string, error) {

	fzfConfig := config.GetStringMapString("fzf")
	fzfTmuxConfig := config.GetStringMapString("fzf-tmux")

	var fzfCommand string
	var fzfOpts []string
	if _, ok := fzfTmuxConfig["command"]; ok {
		fzfCommand = fzfTmuxConfig["command"]
		if _, ok := fzfTmuxConfig["opts"]; ok {
			fzfOpts = strings.Split(fzfTmuxConfig["opts"], " ")
		}
	} else {
		fzfCommand = fzfConfig["command"]
		if _, ok := fzfConfig["opts"]; ok {
			fzfOpts = strings.Split(fzfConfig["opts"], " ")
		}
	}
	var result strings.Builder

	flags := append(
		fzfOpts,
		fzfFlags...,
	)
	cmd := exec.Command(
		fzfCommand,
		flags...,
	)
	cmd.Stdout = &result
	cmd.Stderr = os.Stderr
	stdinPipe, err := cmd.StdinPipe()
	if err != nil {
		return "", err
	}

	go func() {
		printer.Print(stdinPipe, bookmarks)
		stdinPipe.Close()
	}()

	err = cmd.Start()
	if err != nil {
		return "", err
	}
	err = cmd.Wait()
	if err != nil {
		return "", err
	}

	r := strings.TrimSpace(result.String())
	return r, nil
}
