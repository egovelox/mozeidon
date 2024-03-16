package infra

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/james-barrow/golang-ipc"

	"github.com/egovelox/mozeidon/browser/core/models"
)

type IpcClient struct {
	*ipc.Client
}

type EndMessage struct {
	End string `json:"data"`
}

func (ipc *IpcClient) Send(
	cmd models.Command,
) <-chan models.CommandResult {

	// TODO: handle error
	jsonCmd, _ := json.Marshal(cmd)
	ipc.Write(1, []byte(jsonCmd))

	channel := make(chan models.CommandResult)
	go func() {
		defer close(channel)
		for {
			// TODO: handle error
			message, _ := ipc.Read()
			if message.MsgType > 0 {
				if string(message.Data) == `{"data":"end"}` {
					break
				}
				channel <- models.CommandResult{Data: message.Data}
			}
		}
	}()
	return channel
}

func NewIpcClient(host string) *IpcClient {
	config := ipc.ClientConfig{
		Encryption: true,
		Timeout:    2,
		RetryTimer: 0,
	}

	ipc, err := ipc.StartClient(host, &config)
	if err != nil {
		println(
			fmt.Sprintf(
				`{"error": "Cannot connect via ipc with host: %s"}`,
				host,
			),
		)
		os.Exit(1)
	}

	for {
		message, err := ipc.Read()
		if err != nil {
			println(
				fmt.Sprintf(
					`{"error": "Cannot read via ipc with host: %s"}`,
					host,
				),
			)
			os.Exit(1)
		}
		if message.MsgType == -1 && message.Status == "Connected" {
			break
		}
	}
	return &IpcClient{ipc}
}
