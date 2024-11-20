const puppeteer = require("puppeteer");
const Flight = require("../models/flight");

class CrawlingService {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  async crawlFlightPrices(departure, arrival, date) {
    try {
      if (!this.browser) {
        await this.initialize();
      }

      const page = await this.browser.newPage();

      // User-Agent 설정
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      const apiUrl = `https://flight.naver.com/flights/international/${departure}-${arrival}-${date.replaceAll(
        "-",
        ""
      )}?adult=1&fareType=Y`;

      // 페이지로 이동
      await page.goto(apiUrl);

      page.on("console", async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
          console.log(await msgArgs[i].jsonValue());
        }
      });

      // 페이지 로딩 대기
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // 항공권 정보 추출
      const flights = await page.evaluate(() => {
        const flightElements = document.querySelectorAll(
          "div[class*='indivisual_results__'] > div" // 변경된 셀렉터
        );

        console.log("크롤링된 elements 수", flightElements.length);

        return Array.from(flightElements).map((el) => {
          const priceElement = el.querySelector(
            "i[class*='item_num__']" // 가격 셀렉터
          );
          const airlineElement = el.querySelector(
            "b[class*='airline_name__']" // 항공사 셀렉터
          );
          const timeElement = el.querySelector(
            "b[class*='route_time__']" // 시간 셀렉터
          );

          return {
            price: priceElement
              ? parseInt(priceElement.textContent.replace(/[^0-9]/g, ""))
              : null,
            airline: airlineElement ? airlineElement.textContent.trim() : "",
            time: timeElement ? timeElement.textContent.trim() : "",
          };
        });
      });

      console.log("크롤링된 항공권:", flights); // 디버깅용 로그

      // 데이터베이스에 저장
      await this.processFlightData(flights, departure, arrival, date);

      await page.close();
      return flights;
    } catch (error) {
      console.error("크롤링 중 에러 발생:", error);
      throw error;
    }
  }

  async processFlightData(flights, departure, arrival, date) {
    try {
      const flightData = flights
        .filter((flight) => flight.price !== null)
        .map((flight) => ({
          departure,
          arrival,
          departureDate: new Date(date),
          price: flight.price,
          airline: flight.airline,
          departureTime: flight.time,
          crawledAt: new Date(),
        }));

      await Flight.insertMany(flightData);
      console.log(`${flightData.length}개의 항공권 정보가 저장되었습니다.`);
    } catch (error) {
      console.error("데이터 처리 중 에러:", error);
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new CrawlingService();
