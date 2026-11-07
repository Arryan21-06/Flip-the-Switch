import copy
import json
from pathlib import Path
import pytest
from daybreak.config import DEFAULTS

@pytest.fixture
def rules():
    return copy.deepcopy(DEFAULTS)

@pytest.fixture
def snapshot():
    return json.loads(Path("fixtures/snapshot_tuesday.json").read_text())

@pytest.fixture(autouse=True)
def no_network(monkeypatch):
    import subprocess
    def forbidden(*args, **kwargs):
        raise AssertionError("Tests must mock GitHub; subprocess forbidden")
    monkeypatch.setattr(subprocess, "run", forbidden)
