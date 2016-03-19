.BIN_PATH := "./node_modules/.bin"

lint:
	@$(.BIN_PATH)/eslint .

run:
	@GITHUB_TOKEN=$(GITHUB_TOKEN) GITHUB_USER=$(GITHUB_USER) MESSAGE="HI THERE <smiley-face>" DEBUG=* node index.js

deps:
	npm install
