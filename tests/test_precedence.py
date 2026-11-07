"""Tests for configuration precedence and state directory resolution."""
import json
import os
from pathlib import Path
from daybreak import config
from daybreak.cli import options


def test_precedence_ladder(tmp_path, monkeypatch):
    # Setup custom home with config.json
    custom_home = tmp_path / "home"
    custom_home.mkdir()
    config_file = custom_home / "config.json"
    cfg_data = {
        "state_dir": str(tmp_path / "from_config_state"),
        "source": "fixture",
        "repo": "config/repo",
        "fixture": str(tmp_path / "from_config_fix.json"),
    }
    config_file.write_text(json.dumps(cfg_data))
    monkeypatch.setenv("DAYBREAK_HOME", str(custom_home))

    # Clear env vars
    monkeypatch.delenv("DAYBREAK_STATE_DIR", raising=False)
    monkeypatch.delenv("DAYBREAK_SOURCE", raising=False)
    monkeypatch.delenv("DAYBREAK_REPO", raising=False)
    monkeypatch.delenv("DAYBREAK_FIXTURE", raising=False)

    # 1. Config file values are used when CLI and env are absent
    opts = options(["rules", "show"])
    assert opts.state_dir == Path(cfg_data["state_dir"])
    assert opts.source == "fixture"
    assert opts.repo == "config/repo"
    assert opts.fixture == Path(cfg_data["fixture"])

    # 2. Environment variables override config.json
    monkeypatch.setenv("DAYBREAK_STATE_DIR", str(tmp_path / "from_env_state"))
    monkeypatch.setenv("DAYBREAK_SOURCE", "github")
    monkeypatch.setenv("DAYBREAK_REPO", "env/repo")
    monkeypatch.setenv("DAYBREAK_FIXTURE", str(tmp_path / "from_env_fix.json"))

    opts = options(["rules", "show"])
    assert opts.state_dir == Path(tmp_path / "from_env_state")
    assert opts.source == "github"
    assert opts.repo == "env/repo"
    assert opts.fixture == Path(tmp_path / "from_env_fix.json")

    # 3. CLI flags override environment variables
    opts = options(["--state-dir", str(tmp_path / "from_cli_state"),
                    "--source", "fixture",
                    "--repo", "cli/repo",
                    "--fixture", str(tmp_path / "from_cli_fix.json"),
                    "rules", "show"])
    assert opts.state_dir == Path(tmp_path / "from_cli_state")
    assert opts.source == "fixture"
    assert opts.repo == "cli/repo"
    assert opts.fixture == Path(tmp_path / "from_cli_fix.json")


def test_default_resolution_when_nothing_set(tmp_path, monkeypatch):
    empty_home = tmp_path / "empty_home"
    empty_home.mkdir()
    monkeypatch.setenv("DAYBREAK_HOME", str(empty_home))
    monkeypatch.delenv("DAYBREAK_STATE_DIR", raising=False)
    monkeypatch.delenv("DAYBREAK_SOURCE", raising=False)
    monkeypatch.delenv("DAYBREAK_REPO", raising=False)
    monkeypatch.delenv("DAYBREAK_FIXTURE", raising=False)

    opts = options(["rules", "show"])
    assert opts.state_dir == Path("state")
    assert opts.source is None
    assert opts.repo is None
    assert opts.fixture == config.ROOT / "fixtures/snapshot_tuesday.json"
