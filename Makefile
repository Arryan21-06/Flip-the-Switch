PYTHON ?= .venv/bin/python

.PHONY: setup test demo demo-room web-dev web-build web-test
setup:
	bash scripts/setup.sh
test:
	$(PYTHON) -m pytest -q
demo:
	$(PYTHON) -m daybreak demo
demo-room:
	bash scripts/setup_demo_room.sh
web-dev:
	python3 web/server/server.py & npm run dev --prefix web
web-build:
	npm run build --prefix web
web-test:
	npm run test --prefix web
