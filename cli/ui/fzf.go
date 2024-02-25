package ui

import (
	"io"
	"os"
	"os/exec"
	"strings"
)

type Ui struct{}

func (ui *Ui) FzfTmux(
	data io.Reader,
	fzfFlags []string,
) (string, error) {
	var result strings.Builder
	flags := append(
		[]string{"-p", "70%", "--"},
		fzfFlags...,
	)
	cmd := exec.Command(
		"fzf-tmux",
		flags...,
	)
	cmd.Stdout = &result
	cmd.Stderr = os.Stderr
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return "", err
	}
	_, err = io.Copy(stdin, data)
	//_, err = data.WriteTo(stdin)
	if err != nil {
		return "", err
	}
	err = stdin.Close()
	if err != nil {
		return "", err
	}

	err = cmd.Start()
	if err != nil {
		return "", err
	}

	err = cmd.Wait()
	if err != nil {
		return "", err
	}
	r := strings.TrimSpace(result.String())
	//fmt.Printf("%v", r)
	return r, nil
}
