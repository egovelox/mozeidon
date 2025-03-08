build-firefox-addon:
	cd firefox-addon && ./build.sh
build-chrome-addon:
	cd chrome-addon && ./build.sh
build-cli:
	cd cli && go build

all: build-cli build-firefox-addon build-chrome-addon
