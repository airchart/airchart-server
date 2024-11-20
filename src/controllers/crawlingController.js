const crawlingService = require("../services/crawlingService");
const schedulerService = require("../services/schedulerService");

exports.startCrawling = async (req, res) => {
  try {
    const { departure, arrival, date } = req.body;

    // 즉시 크롤링 실행
    await crawlingService.crawlFlightPrices(departure, arrival, date);

    // 주기적 크롤링 스케줄 등록
    schedulerService.scheduleCrawling(departure, arrival, date);

    res.json({ message: "크롤링이 시작되었습니다." });
  } catch (error) {
    console.error("크롤링 시작 실패:", error);
    res.status(500).json({ error: "크롤링 시작 중 오류가 발생했습니다." });
  }
};

exports.stopCrawling = (req, res) => {
  try {
    const { departure, arrival, date } = req.body;
    schedulerService.stopCrawling(departure, arrival, date);
    res.json({ message: "크롤링이 중지되었습니다." });
  } catch (error) {
    res.status(500).json({ error: "크롤링 중지 중 오류가 발생했습니다." });
  }
};
