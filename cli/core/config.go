package core

import (
	"github.com/spf13/viper"
)

type Config struct {
}

func InitConfig() (*viper.Viper, error) {
	v := viper.New()
	v.SetConfigName(".mozeidon")
	v.AddConfigPath("$HOME/.config")
	v.AddConfigPath("$HOME")

	v.SetDefault(
		"tabs",
		map[string]string{"fzf_close_key": "ctrl-p", "fzf_open_key": "ctrl-o"},
	)

	v.SetDefault(
		"fzf-tmux",
		// remember to add "--" as the last item of opts
		map[string]string{"command": "fzf-tmux", "opts": "-p 70% --"},
	)

	v.SetDefault(
		"fzf",
		map[string]string{"command": "fzf", "opts": ""},
	)

	err := v.ReadInConfig()
	if err != nil {
		return nil, err
	}
	return v, nil
}
