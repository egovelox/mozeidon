package infra

import (
	"encoding/json"

	"github.com/james-barrow/golang-ipc"

	"github.com/egovelox/mozicli/browser/core/models"
)

type IpcClient struct {
	*ipc.Client
}

func (ipc *IpcClient) Send(
	cmd models.Command,
) (models.CommandResult, error) {

	// TODO: handle error
	jsonCmd, _ := json.Marshal(cmd)
	ipc.Write(1, []byte(jsonCmd))

	for {
		// TODO: handle error
		message, _ := ipc.Read()
		if message.MsgType > 0 {
			return models.CommandResult{Data: message.Data}, nil
		}
	}
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
