"""APScheduler driver: runs all fetchers on cron."""

from apscheduler.schedulers.asyncio import AsyncIOScheduler


def build_scheduler() -> AsyncIOScheduler:
    raise NotImplementedError("Scheduler not wired up yet.")
