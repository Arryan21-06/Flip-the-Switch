"""UTC parsing, working-day windows and quiet hours."""
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

UTC = timezone.utc


def parse(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        result = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return result.astimezone(UTC) if result.tzinfo else None
    except (ValueError, TypeError, AttributeError):
        return None


def iso(value: datetime) -> str:
    return value.astimezone(UTC).isoformat(timespec="seconds").replace("+00:00", "Z")


def zone(name: str):
    try:
        return ZoneInfo(name)
    except ZoneInfoNotFoundError:
        if name == "Asia/Kolkata":
            return timezone(timedelta(hours=5, minutes=30))
        raise ValueError(f"Unknown timezone: {name}") from None


def now(value: str | None = None) -> datetime:
    if value is None:
        return datetime.now(UTC)
    result = parse(value)
    if result is None:
        raise ValueError("Time must be an ISO-8601 timestamp with timezone")
    return result


def local_date(at: datetime, rules: dict) -> str:
    return at.astimezone(zone(rules["timezone"])).date().isoformat()


def hours(at: datetime, value: str | None) -> float | None:
    start = parse(value)
    return (at - start).total_seconds() / 3600 if start else None


def since(at: datetime, value: str, timezone_name: str) -> datetime:
    if value in ("24h", "72h"):
        return at - timedelta(hours=int(value[:-1]))
    if value != "auto":
        raise ValueError("--since must be auto, 24h or 72h")
    previous = at.astimezone(zone(timezone_name)) - timedelta(days=1)
    while previous.weekday() >= 5:
        previous -= timedelta(days=1)
    return previous.replace(hour=9, minute=30, second=0, microsecond=0).astimezone(UTC)


def quiet(at: datetime, rules: dict) -> bool:
    local = at.astimezone(zone(rules["timezone"]))
    clock = local.strftime("%H:%M")
    policy = rules["quiet_hours"]
    if local.weekday() == 4 and clock >= policy["friday_cutoff"]:
        return True
    start, end = policy["start"], policy["end"]
    return (clock >= start or clock < end) if start > end else start <= clock < end
