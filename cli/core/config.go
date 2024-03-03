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
		map[string]string{"close_key": "ctrl-p", "open_key": "ctrl-o"},
	)

	err := v.ReadInConfig()
	if err != nil {
		return nil, err
	}
	return v, nil
}
