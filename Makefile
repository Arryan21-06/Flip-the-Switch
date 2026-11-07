PYTHON ?= .venv/bin/python

.PHONY: setup test demo demo-room
setup:
	bash scripts/setup.sh
test:
	$(PYTHON) -m pytest -q
demo:
	$(PYTHON) -m daybreak demo
demo-room:
	bash scripts/setup_demo_room.sh
