import math
from ai_engine.interfaces import AbstractAiEngine

# BR-03: AI recommended price must stay within ±30% of current price
MAX_CHANGE_PCT = 0.30


def _apply_br03(current_price: int, suggested_price: int) -> int:
    lower = math.floor(current_price * (1 - MAX_CHANGE_PCT))
    upper = math.ceil(current_price * (1 + MAX_CHANGE_PCT))
    return max(lower, min(upper, suggested_price))


class MockAiEngine(AbstractAiEngine):
    def generate_recommendation(self, flight: dict, fare: dict) -> dict:
        load_factor = flight.get("load_factor", 70)
        current_price = fare.get("current_price", 100_000)
        if load_factor >= 85:
            suggested = round(current_price * 1.15 / 1000) * 1000
            rationale = f"높은 탑승률({load_factor}%). 가격 인상 여력 있음."
            confidence = 88
            predicted_lf = min(95, load_factor + 3)
        elif load_factor <= 50:
            suggested = round(current_price * 0.88 / 1000) * 1000
            rationale = f"낮은 탑승률({load_factor}%). 가격 인하로 수요 촉진 필요."
            confidence = 75
            predicted_lf = min(70, load_factor + 15)
        else:
            suggested = current_price
            rationale = "현재 탑승률 안정적. 현행 운임 유지 권고."
            confidence = 80
            predicted_lf = load_factor
        clamped = _apply_br03(current_price, suggested)
        return {
            "recommended_price": clamped,
            "rationale": rationale,
            "confidence": confidence,
            "predicted_load_factor": predicted_lf,
        }

    def analyze_strategy(self, issue_text: str, context: dict) -> dict:
        keywords_high = ["태풍", "결항", "취소", "사고"]
        keywords_surge = ["행사", "콘서트", "축제", "연휴", "명절"]
        text_lower = issue_text.lower()
        if any(k in issue_text for k in keywords_surge):
            desc = f'"{issue_text}" — 수요 급증 예상. 상위 클래스 인벤토리 회수 및 운임 인상 권고.'
            price_factor = 1.20
        elif any(k in issue_text for k in keywords_high):
            desc = f'"{issue_text}" — 수요 감소 우려. 가격 경쟁력 확보 및 하위 클래스 공급 확대 권고.'
            price_factor = 0.90
        else:
            desc = f'"{issue_text}" — 분석 결과 즉각적인 운임 조정이 필요합니다.'
            price_factor = 1.05
        return {"description": desc, "price_factor": price_factor}
