PYTHON ?= .venv/bin/python

.PHONY: setup test demo
setup:
	bash scripts/setup.sh
test:
	$(PYTHON) -m pytest -q
demo:
	$(PYTHON) -m daybreak demo
