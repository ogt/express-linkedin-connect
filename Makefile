TAP=node_modules/.bin/mocha
LINT=node_modules/.bin/jshint

test:   lint
	$(TAP) test/*.js \
		--require should \
		--reporter spec

lint:
	$(LINT) *.js

.PHONY: test lint
