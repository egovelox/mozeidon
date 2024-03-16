package main

import (
	"os"
	"os/signal"

	"github.com/egovelox/mozeidon/cmd"
)

func main() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		for sig := range c {
			_ = sig
		}
	}()
	cmd.Execute()
}
