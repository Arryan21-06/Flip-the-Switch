"""Atomic ledger persistence and a process lock for shared room state."""
from contextlib import contextmanager
import fcntl
from pathlib import Path
from .models import Blocked, read_json, write_json


def load(state: Path) -> dict:
    result = read_json(state / "ledger.json", {})
    for key, default in (("executed", {}), ("nudges", {}), ("decisions", []),
                         ("actions", {}), ("budget_skips", [])):
        result.setdefault(key, default)
    return result


def save(state: Path, ledger: dict) -> None:
    write_json(state / "ledger.json", ledger)


@contextmanager
def locked(state: Path):
    state.mkdir(parents=True, exist_ok=True)
    with (state / ".lock").open("a") as stream:
        try:
            fcntl.flock(stream, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise Blocked("Another Daybreak command holds the state lock; retry shortly") from None
        try:
            yield
        finally:
            fcntl.flock(stream, fcntl.LOCK_UN)
