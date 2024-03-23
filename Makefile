build-background:
	cd background && ./build.sh
build-native-app:
	cd native-app && go build
build-cli:
	cd cli && go build

all: build-cli build-native-app build-background
