const cron = require("node-cron");
const crawlingService = require("./crawlingService");

class SchedulerService {
  constructor() {
    this.crawlingTasks = new Map();
  }

  // 매일 특정 시간에 크롤링 실행 (예: 매일 06:00, 12:00, 18:00)
  scheduleCrawling(departure, arrival, date) {
    const taskKey = `${departure}-${arrival}-${date}`;

    if (this.crawlingTasks.has(taskKey)) {
      return;
    }

    const task = cron.schedule("0 6,12,18 * * *", async () => {
      try {
        console.log(`크롤링 시작: ${departure} -> ${arrival}, ${date}`);
        await crawlingService.crawlFlightPrices(departure, arrival, date);
        console.log("크롤링 완료");
      } catch (error) {
        console.error("스케줄된 크롤링 실패:", error);
      }
    });

    this.crawlingTasks.set(taskKey, task);
  }

  stopCrawling(departure, arrival, date) {
    const taskKey = `${departure}-${arrival}-${date}`;
    const task = this.crawlingTasks.get(taskKey);

    if (task) {
      task.stop();
      this.crawlingTasks.delete(taskKey);
    }
  }
}

module.exports = new SchedulerService();
