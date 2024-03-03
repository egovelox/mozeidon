package infra

import (
	"encoding/json"

	"github.com/james-barrow/golang-ipc"

	"github.com/egovelox/mozicli/browser/core/models"
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
		Timeout:    10,
		RetryTimer: 8,
	}

	ipc, _ := ipc.StartClient(host, &config)

	for {
		message, _ := ipc.Read()
		if message.MsgType == -1 && message.Status == "Connected" {
			break
		}
	}
	return &IpcClient{ipc}
}
